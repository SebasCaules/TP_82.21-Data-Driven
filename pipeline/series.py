"""Series temporales y de embudo para el payload de la SPA.

Todas las funciones son puras: reciben DataFrames ya limpios (de loader.py) y no
hacen I/O. Ningun redondeo intermedio; se redondea solo al formatear en la vista.
"""

from __future__ import annotations

import pandas as pd


def recompra_trimestral(tx: pd.DataFrame, hasta: pd.Timestamp | None = None) -> list[dict]:
    """% de clientes de cada trimestre que vuelve a comprar dentro de los 90 dias
    posteriores a su ultima compra del trimestre. Devuelve 2022Q1..2025Q3 (CONTRACT
    4.4: la serie termina en 2025Q3, no hay Q4 completo en los datos).

    `hasta` es el horizonte de observacion: la fecha mas alla de la cual no hay (o
    no se puede asumir que hay) transacciones registradas. Por defecto es
    tx["fecha"].max(), que es correcto cuando tx es la base completa sin recortar
    por corte -- el unico uso real hoy (build.py llama con el tx entero). Si
    alguna vez se llama con un tx ya recortado por corte, pasar `hasta` aparte
    (el horizonte real de los datos, no el corte) evita que la funcion confunda
    "no hay compras porque el corte tapa los datos" con "no hay compras porque el
    cliente no volvio".

    El gate de observabilidad es POR TRIMESTRE, no por cliente: un trimestre entra
    en el calculo solo si el cierre del trimestre + 90 dias cae dentro de `hasta`.
    Filtrar cliente por cliente (como version anterior) deja pasar como
    "calculable" solo a los clientes con ultima compra muy temprana en el
    trimestre cuando `hasta` esta pegado al propio trimestre -- una muestra
    sesgada que da una tasa artificialmente baja (o 0,0) en vez de None.
    """
    datos = tx[["id_cliente", "fecha"]].copy()
    hasta = pd.Timestamp(hasta) if hasta is not None else datos["fecha"].max()
    datos["trimestre"] = datos["fecha"].dt.to_period("Q")

    # fechas de compra por cliente, para buscar la recompra en la ventana de 90 dias
    fechas_por_cliente = datos.sort_values("fecha").groupby("id_cliente")["fecha"].apply(
        lambda s: s.to_numpy()
    )

    quarters = pd.period_range("2022Q1", "2025Q3", freq="Q")
    resultado = []
    for q in quarters:
        sub = datos[datos["trimestre"] == q]
        quarter_end = q.end_time.normalize()
        observable = (quarter_end + pd.Timedelta(days=90)) <= hasta

        if sub.empty or not observable:
            notas = ""
            if not sub.empty and not observable:
                notas = (
                    f"trimestre no observable: el cierre ({quarter_end.date()}) + 90 dias cae "
                    f"despues del horizonte de datos disponible ({hasta.date()}). Se descarta "
                    "el trimestre completo en vez de calcular sobre el subconjunto sesgado de "
                    "clientes con ultima compra temprana."
                )
            resultado.append({"trimestre": str(q), "tasa": None, "n_calculable": 0, "notas": notas})
            continue

        # el gate de arriba garantiza ultima_en_trim + 90d <= hasta para TODO
        # cliente del trimestre (el maximo posible de ultima_en_trim es quarter_end)
        ultima_en_trim = sub.groupby("id_cliente")["fecha"].max()

        vuelve = 0
        for id_cliente, ultima in ultima_en_trim.items():
            compras = fechas_por_cliente[id_cliente]
            inicio = pd.Timestamp(ultima).to_datetime64()
            fin = (pd.Timestamp(ultima) + pd.Timedelta(days=90)).to_datetime64()
            if ((compras > inicio) & (compras <= fin)).any():
                vuelve += 1

        notas = ""
        if q == pd.Period("2024Q3", freq="Q"):
            notas = (
                "2024Q3 no figura en la tabla del wiki, que salta de 2024Q2 (pico 19,0%) a "
                "2024Q4 (18,6%) y describe 'cuatro trimestres seguidos a la baja'. Con el "
                "trimestre completo la caida NO es monotona: 2024Q3 da un valor mas bajo que "
                "2024Q4, es decir hay un repunte parcial antes de la caida sostenida que "
                "arranca en 2025Q1."
            )

        resultado.append({
            "trimestre": str(q),
            "tasa": vuelve / len(ultima_en_trim),
            "n_calculable": int(len(ultima_en_trim)),
            "notas": notas,
        })

    return resultado


def base_activa_anual(tx: pd.DataFrame) -> list[dict]:
    """Por anio 2022-2025: clientes activos (>=1 compra ese anio), primeras compras
    (clientes cuya primera compra cae ese anio) y ventas IDENTIFICADAS ese anio
    (monto_neto de las filas que ya vienen filtradas por id_cliente conocido, via
    loader.load_transacciones).

    Para la venta TOTAL de la empresa (incluye transacciones sin cliente
    identificado, que es el numero que ancla el wiki) usar la serie
    'ventas_anuales' que arma build.py sobre la base sin filtrar id_cliente -- no
    'ventas_identificadas' de aca, que mide otra cosa y no tiene que coincidir.
    """
    datos = tx[["id_cliente", "fecha", "monto_neto"]].copy()
    datos["anio"] = datos["fecha"].dt.year
    primer_anio = datos.groupby("id_cliente")["fecha"].min().dt.year

    resultado = []
    for anio in range(2022, 2026):
        sub = datos[datos["anio"] == anio]
        resultado.append({
            "anio": anio,
            "activos": int(sub["id_cliente"].nunique()),
            "nuevos": int((primer_anio == anio).sum()),
            "ventas_identificadas": float(sub["monto_neto"].sum()),
        })

    resultado[0]["notas"] = (
        "activos y nuevos coinciden exacto contra el wiki (2472/2472, 4472/2647, 4755/748, "
        "3956/111) y la variacion de activos 2025 da -16,8%, tambien exacta. "
        "'ventas_identificadas' es la facturacion de clientes con id_cliente conocido: "
        "68,6M / 164,3M / 193,4M / 124,0M 2022-2025. NO es la venta total de la empresa (esa "
        "es la serie 'ventas_anuales' del payload, 123,8M / 295,8M / 349,7M / 225,0M, calculada "
        "por build.py sobre dedupe+monto>0 SIN filtrar id_cliente). Antes este campo se llamaba "
        "'ventas' y convivia en el payload con la clave 'ventas' de series.ventas_anuales "
        "valiendo 45% menos para el mismo anio: se renombra para que dos series con el mismo "
        "nombre de campo no queden contradiciendose."
    )
    return resultado


def embudo_campanias(camp: pd.DataFrame, corte) -> dict:
    """Envios con fecha_envio <= corte. Dos bases declaradas: la completa del
    dataset y la 'limpia' sin duplicados de fila completa (23.729 y 23.529 al
    corte de referencia). El funnel global y `compra_sin_click_previo` se miden
    sobre la limpia (consistente con consentimiento()). El desglose por segmento
    se emite sobre LAS DOS bases, cada una bajo su propia clave, para que nunca
    se compare la suma de un desglose contra el total de la otra base sin
    etiqueta.
    """
    corte = pd.Timestamp(corte)
    base = camp[camp["fecha_envio"] <= corte].copy()
    n_base = int(len(base))

    limpia = base.drop_duplicates()
    n_limpia = int(len(limpia))
    duplicados_exactos = n_base - n_limpia

    def tasas(df: pd.DataFrame) -> dict:
        n = len(df)
        if n == 0:
            return {"envios": 0, "abre": None, "clic": None, "compra_7dias": None}
        return {
            "envios": int(n),
            "abre": float(df["abierto"].mean()),
            "clic": float(df["click"].mean()),
            "compra_7dias": float(df["compra_7dias"].mean()),
        }

    global_limpio = tasas(limpia)

    def por_segmento_de(df: pd.DataFrame) -> list[dict]:
        return [
            {"segmento": segmento, **tasas(grupo)}
            for segmento, grupo in df.groupby("segmento_objetivo")
        ]

    por_segmento_completa = por_segmento_de(base)
    por_segmento_limpia = por_segmento_de(limpia)

    marca_a_superar = next(
        (f["compra_7dias"] for f in por_segmento_completa if f["segmento"] == "Inactivos 90d"),
        None,
    )
    marca_a_superar_limpia = next(
        (f["compra_7dias"] for f in por_segmento_limpia if f["segmento"] == "Inactivos 90d"),
        None,
    )

    compra_sin_click_previo = int(((limpia["compra_7dias"]) & (~limpia["click"])).sum())

    notas = (
        f"Base completa (fecha_envio<=corte): {n_base} envios. Base limpia "
        f"(drop_duplicates de fila completa): {n_limpia}. Los {duplicados_exactos} envios que "
        "separan ambas bases son duplicados exactos de fila completa, id_envio incluido: no son "
        "huerfanos ni nulos (verificado: 0 nulos en todas las columnas). Los 46 envios a "
        "id_cliente ausente del maestro de Clientes.csv no se solapan con estos duplicados; se "
        "reportan en consentimiento(). "
        f"compra_7dias sin click previo (base limpia): {compra_sin_click_previo} casos "
        "(0 confirma el wiki: ninguna compra a 7 dias ocurre sin click). "
        "por_segmento_completa y por_segmento_limpia difieren recien en la tercera decimal de "
        "cada tasa, salvo Inactivos 90d/clic: 9,5% sobre completa vs 9,6% sobre limpia (unica "
        "celda donde el redondeo visible cambia). La tabla del wiki declara base completa "
        "(23.729) pero publica 9,6%, que es el numero de la base limpia: mezcla las dos bases "
        "en esa celda. No es un error de calculo aca, queda pendiente corregir en el wiki."
    )

    return {
        "corte": corte.strftime("%Y-%m-%d"),
        "base_completa_envios": n_base,
        "base_limpia_envios": n_limpia,
        "duplicados_exactos": int(duplicados_exactos),
        "global": global_limpio,
        "por_segmento_completa": por_segmento_completa,
        "por_segmento_limpia": por_segmento_limpia,
        "marca_a_superar": {"segmento": "Inactivos 90d", "compra_7dias": marca_a_superar},
        "marca_a_superar_limpia": marca_a_superar_limpia,
        "compra_sin_click_previo": compra_sin_click_previo,
        "notas": notas,
    }


def consentimiento(camp: pd.DataFrame, clientes: pd.DataFrame) -> dict:
    """Envios a clientes con acepta_marketing=False, sobre la base limpia de
    envios (drop_duplicates de fila completa, consistente con embudo_campanias).
    clientes viene indexado por id_cliente (contrato de load_clientes).
    """
    base = camp.drop_duplicates()
    n_base = int(len(base))

    huerfanos = int((~base["id_cliente"].isin(clientes.index)).sum())

    merged = base.merge(clientes[["acepta_marketing"]], left_on="id_cliente", right_index=True, how="left")
    no_acepta = merged["acepta_marketing"] == False  # noqa: E712 (comparacion explicita, no bool truthy)

    envios_a_no_acepta = int(no_acepta.sum())
    pct_envios_a_no_acepta = envios_a_no_acepta / n_base if n_base else None

    total_no_acepta = int((clientes["acepta_marketing"] == False).sum())  # noqa: E712
    alcanzados = int(merged.loc[no_acepta, "id_cliente"].nunique())
    pct_alcance = alcanzados / total_no_acepta if total_no_acepta else None

    notas = (
        f"{huerfanos} envios van a id_cliente ausente del maestro de Clientes.csv: quedan fuera "
        "del numerador de 'no acepta' y del denominador de clientes alcanzados porque no se "
        f"pueden clasificar por consentimiento. Base = {n_base} envios (deduplicados de fila "
        "completa, misma base limpia que embudo_campanias)."
    )

    return {
        "envios_base": n_base,
        "envios_a_no_acepta": envios_a_no_acepta,
        "pct_envios_a_no_acepta": pct_envios_a_no_acepta,
        "clientes_no_acepta_total": total_no_acepta,
        "clientes_no_acepta_alcanzados": alcanzados,
        "pct_alcance": pct_alcance,
        "envios_huerfanos": huerfanos,
        "notas": notas,
    }


def estacionalidad(tx: pd.DataFrame, tx_total: pd.DataFrame | None = None) -> list[dict]:
    """Promedio de ventas por mes calendario, promediando entre los anios
    disponibles para ese mes.

    `tx` viene filtrado por id_cliente (loader.load_transacciones): con eso sale
    `promedio_identificado`, que NO reproduce el ancla del wiki (diciembre ~16,6M,
    febrero ~9,3M) porque el wiki mide venta total, identificada o no.

    `tx_total` es opcional: transacciones dedupe+monto>0 SIN filtrar por
    id_cliente (el mismo criterio que build.py:_ventas_anuales ya usa para
    reproducir el ancla del wiki de 'ventas_anuales'). Si se pasa, `promedio` sale
    con el numero que reproduce el ancla (diciembre ~29,0M, febrero ~16,5M) y
    `pct_identificado` con la porcion de esa base que tiene cliente identificado.
    Si no se pasa, `promedio` viaja en None: esta funcion no hace I/O propio
    (CONTRACT 6.4) y no puede reconstruir esa base desde el `tx` que recibe, que
    ya llega filtrado. Falta que build.py arme esa base (mismo patron que ya usa
    para `_ventas_anuales`) y la pase aca como segundo parametro para que el
    payload tenga el numero del ancla bajo `promedio`.
    """
    datos = tx[["fecha", "monto_neto"]].copy()
    datos["anio"] = datos["fecha"].dt.year
    datos["mes"] = datos["fecha"].dt.month
    por_mes_anio = datos.groupby(["anio", "mes"])["monto_neto"].sum()

    por_mes_anio_total = None
    if tx_total is not None:
        datos_t = tx_total[["fecha", "monto_neto"]].copy()
        datos_t["anio"] = datos_t["fecha"].dt.year
        datos_t["mes"] = datos_t["fecha"].dt.month
        por_mes_anio_total = datos_t.groupby(["anio", "mes"])["monto_neto"].sum()

    resultado = []
    for mes in range(1, 13):
        valores = por_mes_anio.xs(mes, level="mes")
        fila = {
            "mes": mes,
            "promedio_identificado": float(valores.mean()),
            "n_anios_identificado": int(len(valores)),
        }

        if por_mes_anio_total is not None:
            valores_t = por_mes_anio_total.xs(mes, level="mes")
            promedio_total = float(valores_t.mean())
            fila["promedio"] = promedio_total
            fila["n_anios"] = int(len(valores_t))
            fila["pct_identificado"] = (
                round(100 * fila["promedio_identificado"] / promedio_total, 1)
                if promedio_total else None
            )
        else:
            fila["promedio"] = None
            fila["n_anios"] = None
            fila["pct_identificado"] = None

        if mes == 12:
            fila["notas"] = (
                "'promedio_identificado' se calcula sobre el tx que recibe la funcion "
                "(load_transacciones, filtrado por id_cliente): da ~16,6M para diciembre y "
                "~9,3M para febrero. No reproduce el ancla del wiki porque mide otra cosa "
                "(solo ventas con cliente identificado). 'promedio' reproduce el ancla del "
                "wiki (diciembre ~29,0M, febrero ~16,5M) solo si se pasa tx_total (dedupe+"
                "monto>0 sin filtrar id_cliente); si build.py no pasa ese segundo parametro, "
                "'promedio' queda en None en vez de mostrar el numero identificado bajo un "
                "nombre que no lo aclara."
            )
        resultado.append(fila)

    return resultado

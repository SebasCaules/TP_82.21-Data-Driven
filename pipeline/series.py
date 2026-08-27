"""Series temporales y de embudo para el payload de la SPA.

Todas las funciones son puras: reciben DataFrames ya limpios (de loader.py) y no
hacen I/O. Ningun redondeo intermedio; se redondea solo al formatear en la vista.
"""

from __future__ import annotations

import math
from statistics import NormalDist

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


def _wilson(exitos: int, n: int, z: float = 1.959963984540054) -> list[float] | None:
    """Intervalo de Wilson al 95 % para una proporcion. Se usa el de Wilson y no el
    normal (Wald) porque con p cercano a 0,01 y n de pocos miles el de Wald se sale
    del [0,1] y subestima el ancho. No es una cifra nueva: es la precision de la tasa
    que ya se reporta, y es lo que permite afirmar 'ningun segmento discrimina' en vez
    de suponerlo mirando barras casi iguales."""
    if n <= 0:
        return None
    p = exitos / n
    d = 1 + z * z / n
    centro = (p + z * z / (2 * n)) / d
    radio = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return [max(0.0, centro - radio), min(1.0, centro + radio)]


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
        compras = int(df["compra_7dias"].sum())
        return {
            "envios": int(n),
            "abre": float(df["abierto"].mean()),
            "clic": float(df["click"].mean()),
            "compra_7dias": float(df["compra_7dias"].mean()),
            "compras": compras,
            "compra_7dias_ic": _wilson(compras, int(n)),
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


def facturacion_anual_cohorte(tx: pd.DataFrame, facts: pd.DataFrame, corte) -> list[dict]:
    """Por anio calendario, la facturacion identificada del anio partida en dos: la que
    aportaron los clientes que estan EN RIESGO AL CORTE y el resto de la base.

    Es una cohorte FIJA mirada hacia atras, no la tasa de riesgo de cada anio: los
    clientes se clasifican una sola vez, al corte, y despues se les mira toda la historia.
    Las dos lecturas responden preguntas distintas y no tienen por que coincidir; la de
    cada anio ya vive en `exposicion_por_corte`.

    Solo entran anios con datos hasta el corte. `parcial` marca el anio del propio corte
    cuando el corte cae antes del 31/12: sin esa marca, una barra corta se lee como caida
    cuando en realidad es un anio incompleto.

    `total` es facturacion IDENTIFICADA (el tx que llega ya viene filtrado por id_cliente
    en loader.load_transacciones), la misma base que `base_activa_anual.ventas_identificadas`
    y NO la venta total de la empresa de `ventas_anuales`.
    """
    corte = pd.Timestamp(corte)
    d = tx[tx["fecha"] <= corte][["id_cliente", "fecha", "monto_neto"]].copy()
    d["anio"] = d["fecha"].dt.year
    en_riesgo = set(facts.index[facts["en_riesgo"]])
    d["riesgo"] = d["id_cliente"].isin(en_riesgo)

    salida = []
    for anio in range(int(d["anio"].min()), corte.year + 1):
        sub = d[d["anio"] == anio]
        total = float(sub["monto_neto"].sum())
        riesgo = float(sub.loc[sub["riesgo"], "monto_neto"].sum())
        salida.append({
            "anio": int(anio),
            "total": int(round(total)),
            "en_riesgo": int(round(riesgo)),
            "pct_en_riesgo": (riesgo / total) if total else None,
            "parcial": bool(corte < pd.Timestamp(year=anio, month=12, day=31)),
        })
    return salida


def consentimiento_anual(camp: pd.DataFrame, clientes: pd.DataFrame) -> list[dict]:
    """El mismo corte de `consentimiento()` abierto por anio de `fecha_envio`: envios del
    anio sobre la base limpia y cuantos de esos salieron a un cliente con
    acepta_marketing=False.

    El agregado de cuatro anios no distingue un incumplimiento que se esta corrigiendo de
    uno estable. Abierto por anio, cada barra va sobre SU propia base de envios, que cambia
    fuerte entre anios (de 3.915 a 8.028): comparar los conteos crudos no diria nada.

    Los envios a id_cliente ausente del maestro cuentan en el denominador del anio y no en
    el numerador, igual que en `consentimiento()`: no se pueden clasificar.
    """
    base = camp.drop_duplicates()
    merged = base.merge(
        clientes[["acepta_marketing"]], left_on="id_cliente", right_index=True, how="left"
    )
    merged = merged.assign(anio=merged["fecha_envio"].dt.year)

    salida = []
    for anio, sub in merged.groupby("anio"):
        n = int(len(sub))
        sin = int((sub["acepta_marketing"] == False).sum())  # noqa: E712
        salida.append({
            "anio": int(anio),
            "envios": n,
            "sin_consentimiento": sin,
            "pct_sin_consentimiento": (sin / n) if n else None,
        })
    return salida


def criterios_orden(facts: pd.DataFrame, camp: pd.DataFrame, capacidad: int = 800) -> dict:
    """Que cuesta, en pesos y en compras, elegir otro criterio para armar la lista.

    Cada criterio define un subconjunto de la base EN RIESGO al corte; de ese subconjunto
    se toman los `capacidad` de mayor anualizado (es lo que Marketing ejecutaria) y se
    reportan dos cosas independientes:

    - `exposicion`: los pesos que el criterio alcanza. Es aritmetica de la base, sin ruido.
    - `compra_7dias` con su IC de Wilson: la tasa observada en las campanias que YA salieron
      a esos mismos clientes. Es una tasa observada sobre una muestra chica, con ruido.

    La comparacion util es que las dos columnas tienen precision distinta. Los IC de compra
    se solapan entre criterios (ninguno se distingue del otro); las diferencias de exposicion
    son de decenas de millones y no dependen de ninguna muestra.

    `Azar` no se sortea: se reporta el VALOR ESPERADO (capacidad x anualizado medio de la
    base en riesgo) y la tasa de la base en riesgo entera, que es lo que una eleccion al
    azar da en esperanza. Una corrida con semilla habria pedido justificar la semilla.

    Un criterio que no llega a `capacidad` clientes se reporta con los que tiene:
    `clientes_disponibles` menor que `capacidad` ya es, en si mismo, un costo del criterio.
    """
    en_riesgo = facts[facts["en_riesgo"]]
    limpia = camp.drop_duplicates()

    def rendimiento(ids: set) -> dict:
        sub = limpia[limpia["id_cliente"].isin(ids)]
        n = int(len(sub))
        compras = int(sub["compra_7dias"].sum())
        return {
            "envios": n,
            "compras": compras,
            "compra_7dias": (compras / n) if n else None,
            "compra_7dias_ic": _wilson(compras, n),
        }

    def criterio(nombre: str, definicion: str, sub: pd.DataFrame) -> dict:
        sel = sub.sort_values("anualizado", ascending=False).head(capacidad)
        return {
            "criterio": nombre,
            "definicion": definicion,
            "clientes_disponibles": int(len(sub)),
            "clientes": int(len(sel)),
            "exposicion": int(round(sel["anualizado"].sum())),
            **rendimiento(set(sel.index)),
        }

    filas = [
        criterio(
            "Exposición · actual",
            f"los {capacidad} clientes en riesgo de mayor anualizado (el criterio que la lista usa hoy)",
            en_riesgo,
        ),
        criterio(
            "Q5 con recency > 180 d",
            "clientes en riesgo del quintil 5 de facturacion con mas de 180 dias sin comprar",
            en_riesgo[(en_riesgo["quintil"] == 5) & (en_riesgo["recency"] > 180)],
        ),
        criterio(
            "Segmento Hibernando",
            "clientes en riesgo con segmento RFM Hibernando (R<=2 y F<=2)",
            en_riesgo[en_riesgo["rfm"] == "Hibernando"],
        ),
        {
            "criterio": "Azar",
            "definicion": (
                f"{capacidad} clientes en riesgo al azar; la exposicion es el valor esperado "
                "(capacidad x anualizado medio de la base en riesgo), no una corrida con semilla"
            ),
            "clientes_disponibles": int(len(en_riesgo)),
            "clientes": int(min(capacidad, len(en_riesgo))),
            "exposicion": int(round(capacidad * en_riesgo["anualizado"].mean())),
            **rendimiento(set(en_riesgo.index)),
        },
    ]

    actual = filas[0]
    for f in filas:
        f["costo_exposicion"] = f["exposicion"] - actual["exposicion"]
        f["solapa_con_actual"] = bool(
            f["compra_7dias_ic"] is not None
            and actual["compra_7dias_ic"] is not None
            and f["compra_7dias_ic"][0] <= actual["compra_7dias_ic"][1]
            and f["compra_7dias_ic"][1] >= actual["compra_7dias_ic"][0]
        )

    return {
        "capacidad": int(capacidad),
        "criterios": filas,
        "notas": (
            "Los envios de cada fila son las campanias que ya salieron a ESOS clientes, no un "
            "experimento: los criterios no se asignaron al azar y las bases se pisan entre si "
            "(un cliente puede estar en mas de un criterio). La tasa sirve para mostrar que "
            "ninguna diferencia sobrevive a su intervalo, no para estimar el efecto de cambiar "
            "de criterio."
        ),
    }


def potencia_experimento(p0: float, n_por_rama: int, cortes: int,
                         alpha: float = 0.05, potencia: float = 0.80) -> dict:
    """Diferencia minima detectable (MDE) entre dos ramas de igual tamano, en puntos
    porcentuales, para una tasa base `p0`.

    Es la contracara de reportar una tasa con su intervalo: si el experimento no puede
    distinguir el efecto que se busca, el resultado va a ser "no concluyente" se corra o
    no. Declararlo ANTES es lo que evita gastar tres cortes para no aprender nada.

    Formula estandar de dos proporciones, dos colas, con la varianza combinada bajo H0 y
    la separada bajo H1. Se resuelve por biseccion sobre delta porque n(delta) no se
    invierte en forma cerrada.
    """
    n = int(n_por_rama) * int(cortes)
    z_alpha = NormalDist().inv_cdf(1 - alpha / 2)
    z_beta = NormalDist().inv_cdf(potencia)

    def n_requerido(delta: float) -> float:
        p1 = p0 + delta
        pbar = (p0 + p1) / 2
        num = (z_alpha * math.sqrt(2 * pbar * (1 - pbar))
               + z_beta * math.sqrt(p0 * (1 - p0) + p1 * (1 - p1))) ** 2
        return num / (delta * delta)

    lo, hi = 1e-9, 1.0 - p0
    for _ in range(200):
        mid = (lo + hi) / 2
        if n_requerido(mid) > n:
            lo = mid
        else:
            hi = mid

    return {
        "p0": float(p0),
        "n_por_rama_por_corte": int(n_por_rama),
        "cortes": int(cortes),
        "n_por_rama": n,
        "alpha": float(alpha),
        "potencia": float(potencia),
        "mde": float(hi),
        "mde_pp": float(100 * hi),
        "veces_la_base": float(hi / p0) if p0 else None,
    }

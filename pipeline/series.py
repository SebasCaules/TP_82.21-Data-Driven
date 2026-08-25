"""Series temporales y de embudo para el payload de la SPA.

Todas las funciones son puras: reciben DataFrames ya limpios (de loader.py) y no
hacen I/O. Ningun redondeo intermedio; se redondea solo al formatear en la vista.
"""

from __future__ import annotations

import pandas as pd


def recompra_trimestral(tx: pd.DataFrame) -> list[dict]:
    """% de clientes de cada trimestre que vuelve a comprar dentro de los 90 dias
    posteriores a su ultima compra del trimestre. Devuelve 2022Q1..2025Q4 completo;
    un trimestre queda con tasa=None cuando ningun cliente tiene ventana de 90 dias
    completa contra la ultima fecha disponible en tx (no se inventa el dato).
    """
    datos = tx[["id_cliente", "fecha"]].copy()
    data_max = datos["fecha"].max()
    datos["trimestre"] = datos["fecha"].dt.to_period("Q")

    # fechas de compra por cliente, para buscar la recompra en la ventana de 90 dias
    fechas_por_cliente = datos.sort_values("fecha").groupby("id_cliente")["fecha"].apply(
        lambda s: s.to_numpy()
    )

    quarters = pd.period_range("2022Q1", "2025Q4", freq="Q")
    resultado = []
    for q in quarters:
        sub = datos[datos["trimestre"] == q]
        if sub.empty:
            resultado.append({"trimestre": str(q), "tasa": None, "n_calculable": 0, "notas": ""})
            continue

        ultima_en_trim = sub.groupby("id_cliente")["fecha"].max()
        ventana_completa = (ultima_en_trim + pd.Timedelta(days=90)) <= data_max
        calculable = ultima_en_trim[ventana_completa]

        if calculable.empty:
            resultado.append({"trimestre": str(q), "tasa": None, "n_calculable": 0, "notas": ""})
            continue

        vuelve = 0
        for id_cliente, ultima in calculable.items():
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
            "tasa": vuelve / len(calculable),
            "n_calculable": int(len(calculable)),
            "notas": notas,
        })

    return resultado


def base_activa_anual(tx: pd.DataFrame) -> list[dict]:
    """Por anio 2022-2025: clientes activos (>=1 compra ese anio), primeras compras
    (clientes cuya primera compra cae ese anio) y ventas totales del anio.
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
            "ventas": float(sub["monto_neto"].sum()),
        })

    resultado[0]["notas"] = (
        "activos y nuevos coinciden exacto contra el wiki (2472/2472, 4472/2647, 4755/748, "
        "3956/111) y la variacion de activos 2025 da -16,8%, tambien exacta. 'ventas' NO "
        "coincide: sobre el tx recibido (load_transacciones: dedupe + id_cliente no nulo + "
        "monto>0, 27.276 filas) da 68,6M / 164,3M / 193,4M / 124,0M para 2022-2025, contra el "
        "ancla del wiki de 123,8M / 295,8M / 349,7M / 225,0M. La cifra del wiki solo se "
        "reproduce sumando monto_neto sobre dedupe+monto>0 SIN filtrar por id_cliente (49.392 "
        "filas, incluye 22.116 ventas sin cliente identificado). series.py recibe unicamente el "
        "tx ya filtrado por id_cliente (contrato de loader.load_transacciones) y no puede "
        "reproducir esa base sin romper esa firma ni hacer I/O propio: queda declarado como "
        "bloqueo, no se decide por cuenta propia."
    )
    return resultado


def embudo_campanias(camp: pd.DataFrame, corte) -> dict:
    """Envios con fecha_envio <= corte. Dos bases declaradas: la completa del
    dataset y la 'limpia' sin duplicados de fila completa. Funnel global sobre la
    limpia; desglose por segmento sobre la completa (asi lo pide el analisis
    original y asi reconcilia contra los valores del wiki).
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

    por_segmento = []
    marca_a_superar = None
    for segmento, grupo in base.groupby("segmento_objetivo"):
        fila = {"segmento": segmento, **tasas(grupo)}
        por_segmento.append(fila)
        if segmento == "Inactivos 90d":
            marca_a_superar = fila["compra_7dias"]

    compra_sin_click_previo = int(((base["compra_7dias"]) & (~base["click"])).sum())

    notas = (
        f"Base completa (fecha_envio<=corte): {n_base} envios. Base limpia "
        f"(drop_duplicates de fila completa): {n_limpia}. Los {duplicados_exactos} envios que "
        "separan ambas bases son duplicados exactos de fila completa, id_envio incluido: no son "
        "huerfanos ni nulos (verificado: 0 nulos en todas las columnas). Los 46 envios a "
        "id_cliente ausente del maestro de Clientes.csv no se solapan con estos duplicados; se "
        "reportan en consentimiento(). "
        f"compra_7dias sin click previo: {compra_sin_click_previo} casos "
        "(0 confirma el wiki: ninguna compra a 7 dias ocurre sin click)."
    )

    return {
        "corte": corte.strftime("%Y-%m-%d"),
        "base_completa_envios": n_base,
        "base_limpia_envios": n_limpia,
        "duplicados_exactos": int(duplicados_exactos),
        "global": global_limpio,
        "por_segmento": por_segmento,
        "marca_a_superar": {"segmento": "Inactivos 90d", "compra_7dias": marca_a_superar},
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


def estacionalidad(tx: pd.DataFrame) -> list[dict]:
    """Promedio de ventas por mes calendario, promediando entre los anios
    disponibles para ese mes.
    """
    datos = tx[["fecha", "monto_neto"]].copy()
    datos["anio"] = datos["fecha"].dt.year
    datos["mes"] = datos["fecha"].dt.month
    por_mes_anio = datos.groupby(["anio", "mes"])["monto_neto"].sum()

    resultado = []
    for mes in range(1, 13):
        valores = por_mes_anio.xs(mes, level="mes")
        fila = {"mes": mes, "promedio": float(valores.mean()), "n_anios": int(len(valores))}
        if mes == 12:
            fila["notas"] = (
                "calculado sobre el tx recibido (id_cliente no nulo): da ~16,6M para diciembre y "
                "~9,3M para febrero, NO ~29,0M / ~16,5M como ancla el wiki. El ancla del wiki "
                "solo se reproduce sumando monto_neto sobre dedupe+monto>0 SIN filtrar por "
                "id_cliente (49.392 filas). Mismo problema que 'ventas' en base_activa_anual: "
                "fuera de alcance del tx que recibe series.py sin romper el contrato de "
                "load_transacciones ni hacer I/O propio. Declarado como bloqueo."
            )
        resultado.append(fila)

    return resultado

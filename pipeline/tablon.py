"""
Tablon — dataset de entrenamiento de churn, cliente x corte mensual (CONTRACT_E2.md
seccion 4). Arma la base con calidad.base_corregida (DC-01..DC-04, DC-07, DC-08,
DC-12, DC-13) y calcula las features con features.client_facts (E1); no toca ningun
archivo del E1. No hace I/O de escritura: `construir()` devuelve (DataFrame, resumen);
quien llama decide donde lo guarda (build_e2.py y el runner de la Parte B escriben en
entregas/entregable-2/_build/B/dataset/).
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

import calidad
import features

CORTE_REF = calidad.CORTE_REF
_D90 = pd.Timedelta(days=90)
_D180 = pd.Timedelta(days=180)

CORTES = list(pd.date_range("2023-01-31", "2025-09-30", freq="ME"))

_PARTICIONES = [
    ("train", pd.Timestamp("2023-01-31"), pd.Timestamp("2024-06-30")),
    ("dev", pd.Timestamp("2024-07-31"), pd.Timestamp("2024-09-30")),
    ("gap", pd.Timestamp("2024-10-31"), pd.Timestamp("2024-12-31")),
    ("test", pd.Timestamp("2025-01-31"), pd.Timestamp("2025-05-31")),
    ("test_flag", pd.Timestamp("2025-06-30"), pd.Timestamp("2025-09-30")),
]

FEATURES = [
    "recency_dias", "gap_mediano", "recency_sobre_umbral", "frequency",
    "compras_90d", "compras_90d_prev", "monetary", "ticket_medio", "ticket_90d",
    "n_tiendas_distintas", "n_categorias_distintas", "categoria_dominante", "pct_online",
    "region_dominante", "formato_tienda", "meses_desde_alta", "canal_alta",
    "edad", "edad_flag", "genero", "provincia", "es_socio", "nivel",
    "puntos_canjeados", "meses_sin_movimiento", "envios_90d", "envios_acum",
    "aperturas_90d", "clics_90d", "compro_7d_alguna", "ultimo_canal_campania",
    "reclamos_90d", "reclamos_acum", "consultas_90d", "nps_ultimo",
    "nps_sin_interaccion_flag", "tiene_panel", "n_devoluciones",
    "motivo_ultima_devolucion", "pidio_baja", "mes_corte", "temporada",
    "dias_a_proximo_evento",
]
COLUMNAS = ["id_cliente_canonico", "corte"] + FEATURES + ["acepta_marketing", "particion", "y_churn_90"]


def particion_de(t: pd.Timestamp) -> str:
    """Particion temporal de un corte T, seccion 4 del contrato."""
    for nombre, desde, hasta in _PARTICIONES:
        if desde <= t <= hasta:
            return nombre
    raise ValueError(f"corte {t} fuera de las particiones del contrato")


def _bases(data_dir_e1: Path, data_dir_e2: Path) -> dict:
    """Arma las bases del tablon a partir de calidad.base_corregida (DC-01..DC-04,
    DC-07, DC-08, DC-12, DC-13 ya aplicadas: fuente unica y verificada de la
    correccion, la misma que usa build_e2.py). Solo se agrega lo que
    base_corregida no calcula porque las vistas V01-V12 no lo necesitan: filtrar
    transacciones a compras (monto_neto > 0, DC-02 "solo filas positivas"),
    region_tx (que features.client_facts exige), fechas a datetime en los
    archivos que base_corregida no convierte, el flag de NPS sin interaccion
    (DC-11) y la prioridad de alias en Fidelizacion."""
    bc = calidad.base_corregida(data_dir_e1, data_dir_e2, corte=CORTE_REF)

    tx = bc["transacciones_comportamiento"]
    # base_corregida no filtra id_cliente nulo (lo necesitan otras vistas para
    # contar filas crudas); para el tablon, una fila sin id_cliente no es de
    # nadie, asi que se saca junto con las de monto negativo (DC-02, compras).
    tx = tx[(tx["monto_neto"] > 0) & tx["id_cliente"].notna()].copy()
    tiendas = bc["tiendas"].set_index("id_tienda")
    tx["region_tx"] = tx["id_tienda"].map(tiendas["region"]).fillna("__online__")

    clientes = bc["clientes"].set_index("id_cliente")
    clientes["fecha_alta"] = pd.to_datetime(clientes["fecha_alta"])

    fidelizacion = bc["fidelizacion"].copy()
    fidelizacion["fecha_inscripcion"] = pd.to_datetime(fidelizacion["fecha_inscripcion"])
    fidelizacion["fecha_ultimo_movimiento"] = pd.to_datetime(fidelizacion["fecha_ultimo_movimiento"])
    # varias aliases de la misma persona pueden traer cada una su propia fila de
    # Fidelizacion: se conserva la de fecha_inscripcion mas antigua (socio desde
    # el primer alta real, no desde el alias mas reciente).
    fidelizacion = (fidelizacion.sort_values("fecha_inscripcion")
                    .drop_duplicates("id_cliente", keep="first")
                    .set_index("id_cliente"))

    campanias = bc["campanias"]                                                 # DC-05 + DC-04, fecha_envio ya datetime

    soporte = bc["soporte"].copy()
    soporte["mes"] = pd.to_datetime(soporte["mes"])
    soporte = calidad.nps_con_sin_interaccion(soporte)                          # DC-11

    devoluciones = bc["devoluciones"].copy()
    devoluciones["fecha_devolucion"] = pd.to_datetime(devoluciones["fecha_devolucion"])

    bajas = bc["bajas_comportamiento"].copy()                                   # DC-12, hasta CORTE_REF
    bajas["fecha_solicitud"] = pd.to_datetime(bajas["fecha_solicitud"])

    calendario = bc["calendario"].copy()
    calendario["fecha"] = pd.to_datetime(calendario["fecha"])

    return dict(tx=tx, clientes=clientes, fidelizacion=fidelizacion, campanias=campanias,
                soporte=soporte, devoluciones=devoluciones, bajas=bajas,
                tiendas=tiendas, calendario=calendario)


def _tienda_dominante(tx_hasta_t: pd.DataFrame) -> pd.Series:
    """Tienda fisica donde cada cliente concentra mas monto_neto, hasta T."""
    fisico = tx_hasta_t[tx_hasta_t["canal_norm"] == "fisico"]
    if fisico.empty:
        return pd.Series(dtype=object)
    por_tienda = fisico.groupby(["id_cliente", "id_tienda"])["monto_neto"].sum()
    return por_tienda.groupby("id_cliente").idxmax().map(lambda t: t[1])


def _fila_por_corte(t: pd.Timestamp, base: dict) -> pd.DataFrame:
    """Las features de todos los clientes elegibles y no en riesgo en el corte T,
    mas el target y_churn_90 evaluado en T+90 (client_facts, misma regla del E1)."""
    tx, clientes, fidelizacion = base["tx"], base["clientes"], base["fidelizacion"]
    campanias, soporte = base["campanias"], base["soporte"]
    devoluciones, bajas = base["devoluciones"], base["bajas"]
    tiendas, calendario = base["tiendas"], base["calendario"]

    facts_t = features.client_facts(tx, t)
    elegibles = facts_t[facts_t["elegible"] & ~facts_t["en_riesgo"]]
    if elegibles.empty:
        return pd.DataFrame(columns=COLUMNAS)
    ids = elegibles.index

    t90 = t + _D90
    facts_t90 = features.client_facts(tx, t90)
    y = facts_t90["en_riesgo"].reindex(ids, fill_value=False).astype(int)

    tx_hasta_t = tx[tx["fecha"] <= t]
    tx_90 = tx[(tx["fecha"] > t - _D90) & (tx["fecha"] <= t)]
    tx_90prev = tx[(tx["fecha"] > t - _D180) & (tx["fecha"] <= t - _D90)]

    compras_90d = tx_90.groupby("id_cliente").size().reindex(ids).fillna(0).astype(int)
    compras_90d_prev = tx_90prev.groupby("id_cliente").size().reindex(ids).fillna(0).astype(int)
    ticket_90d = tx_90.groupby("id_cliente")["monto_neto"].mean().reindex(ids)
    n_tiendas = (tx_hasta_t[tx_hasta_t["canal_norm"] == "fisico"]
                 .groupby("id_cliente")["id_tienda"].nunique().reindex(ids).fillna(0).astype(int))
    n_categorias = tx_hasta_t.groupby("id_cliente")["categoria"].nunique().reindex(ids).fillna(0).astype(int)
    pct_online = (tx_hasta_t["canal_norm"] == "online").groupby(tx_hasta_t["id_cliente"]).mean().reindex(ids)
    tienda_dom = _tienda_dominante(tx_hasta_t).reindex(ids)
    formato_tienda = tienda_dom.map(tiendas["formato"])

    fecha_alta = clientes["fecha_alta"].reindex(ids)
    primera = elegibles["primera"]
    min_alta = fecha_alta.combine(primera, min)
    meses_desde_alta = ((t.year - min_alta.dt.year) * 12 + (t.month - min_alta.dt.month)).clip(lower=0)

    fid = fidelizacion.reindex(ids)
    tiene_fila = fid["nivel"].notna()
    # es_socio: fecha_inscripcion <= T: si la fila no trae fecha (no pasa en los
    # datos actuales, pero el contrato lo pide igual) se toma como socio siempre.
    es_socio = tiene_fila & (fid["fecha_inscripcion"].isna() | (fid["fecha_inscripcion"] <= t))
    nivel = fid["nivel"].where(es_socio, "no socio")
    # meses_sin_movimiento / puntos_canjeados salen de Fidelizacion.csv, que trae
    # un unico snapshot (no esta historizado por mes): si fecha_ultimo_movimiento
    # es posterior a T no hay forma de saber el valor real en T, asi que ambas
    # quedan NaN (evita leakage: sin este freno, la mayoria de los cortes de 2023
    # tomarian un "ultimo movimiento" que todavia no habia pasado).
    movimiento_conocido = es_socio & fid["fecha_ultimo_movimiento"].notna() & (fid["fecha_ultimo_movimiento"] <= t)
    meses_mov = ((t.year - fid["fecha_ultimo_movimiento"].dt.year) * 12
                 + (t.month - fid["fecha_ultimo_movimiento"].dt.month))
    meses_mov = meses_mov.where(movimiento_conocido)
    puntos_canjeados = fid["puntos_canjeados"].where(movimiento_conocido)

    camp_hasta_t = campanias[campanias["fecha_envio"] <= t]
    camp_90 = campanias[(campanias["fecha_envio"] > t - _D90) & (campanias["fecha_envio"] <= t)]
    envios_acum = camp_hasta_t.groupby("id_cliente").size().reindex(ids).fillna(0).astype(int)
    envios_90d = camp_90.groupby("id_cliente").size().reindex(ids).fillna(0).astype(int)
    aperturas_90d = camp_90.groupby("id_cliente")["abierto"].sum().reindex(ids).fillna(0).astype(int)
    clics_90d = camp_90.groupby("id_cliente")["click"].sum().reindex(ids).fillna(0).astype(int)
    compro_7d_alguna = (camp_hasta_t.groupby("id_cliente")["compra_7dias"].any()
                         .reindex(ids, fill_value=False).astype(bool))
    ultimo_canal = (camp_hasta_t.sort_values("fecha_envio").groupby("id_cliente")["canal_campania"]
                     .last().reindex(ids))

    sop_hasta_t = soporte[soporte["mes"] <= t]
    sop_90 = soporte[(soporte["mes"] > t - _D90) & (soporte["mes"] <= t)]
    reclamos_acum = sop_hasta_t.groupby("id_cliente")["reclamos"].sum().reindex(ids).fillna(0).astype(int)
    reclamos_90d = sop_90.groupby("id_cliente")["reclamos"].sum().reindex(ids).fillna(0).astype(int)
    consultas_90d = sop_90.groupby("id_cliente")["consultas"].sum().reindex(ids).fillna(0).astype(int)
    sop_con_nps = sop_hasta_t[sop_hasta_t["nps_promedio"].notna()].sort_values("mes")
    nps_ultimo = sop_con_nps.groupby("id_cliente")["nps_promedio"].last().reindex(ids)
    nps_flag = (sop_con_nps.groupby("id_cliente")["nps_sin_interaccion"].last()
                .reindex(ids, fill_value=False).astype(bool))
    # tiene_panel: pertenece al panel de soporte con datos <= T (regla general de
    # leakage, CONTRACT_E2.md seccion 4: "todas con datos <= T"). sop_hasta_t ya
    # esta calculado arriba.
    tiene_panel = pd.Series(ids, index=ids).isin(sop_hasta_t["id_cliente"].unique())

    dv_hasta_t = devoluciones[devoluciones["fecha_devolucion"] <= t]
    n_devoluciones = dv_hasta_t.groupby("id_cliente").size().reindex(ids).fillna(0).astype(int)
    motivo_ultima = (dv_hasta_t.sort_values("fecha_devolucion").groupby("id_cliente")["motivo"]
                      .last().reindex(ids))

    ba_hasta_t = bajas[bajas["fecha_solicitud"] <= t]
    pidio_baja = pd.Series(ids, index=ids).isin(ba_hasta_t["id_cliente"].unique())

    cal_t = calendario.loc[calendario["fecha"] == t]
    temporada_t = cal_t["temporada"].iloc[0] if len(cal_t) else None
    prox = calendario.loc[(calendario["fecha"] > t) & calendario["evento_especial"].notna(), "fecha"]
    dias_evento = int((prox.min() - t).days) if len(prox) else None

    cl = clientes.reindex(ids)

    df = pd.DataFrame({
        "id_cliente_canonico": ids,
        "corte": t.strftime("%Y-%m-%d"),
        "recency_dias": elegibles["recency"].astype(int).values,
        "gap_mediano": elegibles["gap_mediano"].values,
        "recency_sobre_umbral": (elegibles["recency"] / np.maximum(90, 1.5 * elegibles["gap_mediano"])).values,
        "frequency": elegibles["n_compras"].astype(int).values,
        "compras_90d": compras_90d.values, "compras_90d_prev": compras_90d_prev.values,
        "monetary": elegibles["facturacion"].values,
        "ticket_medio": (elegibles["facturacion"] / elegibles["n_compras"]).values,
        "ticket_90d": ticket_90d.values,
        "n_tiendas_distintas": n_tiendas.values, "n_categorias_distintas": n_categorias.values,
        "categoria_dominante": elegibles["categoria"].values, "pct_online": pct_online.values,
        "region_dominante": elegibles["region"].values, "formato_tienda": formato_tienda.values,
        "meses_desde_alta": meses_desde_alta.astype(int).values,
        "canal_alta": cl["canal_alta_norm"].values,
        "edad": cl["edad"].values, "edad_flag": cl["edad_flag"].astype(bool).values,
        "genero": cl["genero"].values, "provincia": cl["provincia"].values,
        "es_socio": es_socio.astype(bool).values, "nivel": nivel.values,
        "puntos_canjeados": puntos_canjeados.values,
        "meses_sin_movimiento": meses_mov.values,
        "envios_90d": envios_90d.values, "envios_acum": envios_acum.values,
        "aperturas_90d": aperturas_90d.values, "clics_90d": clics_90d.values,
        "compro_7d_alguna": compro_7d_alguna.values, "ultimo_canal_campania": ultimo_canal.values,
        "reclamos_90d": reclamos_90d.values, "reclamos_acum": reclamos_acum.values,
        "consultas_90d": consultas_90d.values,
        "nps_ultimo": nps_ultimo.values, "nps_sin_interaccion_flag": nps_flag.values,
        "tiene_panel": tiene_panel.values,
        "n_devoluciones": n_devoluciones.values, "motivo_ultima_devolucion": motivo_ultima.values,
        "pidio_baja": pidio_baja.values,
        "mes_corte": t.month, "temporada": temporada_t, "dias_a_proximo_evento": dias_evento,
        "acepta_marketing": cl["acepta_marketing"].values,
        "particion": particion_de(t),
        "y_churn_90": y.values,
    })
    return df


def construir(data_dir_e1: Path, data_dir_e2: Path) -> tuple[pd.DataFrame, dict]:
    """Arma el tablon completo (33 cortes) y su resumen (seccion 4 del contrato)."""
    base = _bases(data_dir_e1, data_dir_e2)
    partes = [_fila_por_corte(t, base) for t in CORTES]
    df = pd.concat(partes, ignore_index=True)

    cortes_resumen = []
    for t in CORTES:
        sub = df[df["corte"] == t.strftime("%Y-%m-%d")]
        cortes_resumen.append({
            "corte": t.strftime("%Y-%m-%d"), "filas": int(len(sub)),
            "positivos": int(sub["y_churn_90"].sum()),
            "tasa_pct": round(float(sub["y_churn_90"].mean()) * 100, 2) if len(sub) else None,
            "particion": particion_de(t),
        })

    por_particion = []
    for nombre, _, _ in _PARTICIONES:
        sub = df[df["particion"] == nombre]
        por_particion.append({
            "particion": nombre, "filas": int(len(sub)),
            "positivos": int(sub["y_churn_90"].sum()),
            "tasa_pct": round(float(sub["y_churn_90"].mean()) * 100, 2) if len(sub) else None,
        })

    resumen = {
        "nombre": "churn_cliente_corte_v0.1",
        "filas": int(len(df)), "columnas": int(len(df.columns)),
        "n_features": len(FEATURES),
        "clientes_distintos": int(df["id_cliente_canonico"].nunique()),
        "cortes": cortes_resumen,
        "por_particion": por_particion,
        "tasa_global_pct": round(float(df["y_churn_90"].mean()) * 100, 2) if len(df) else None,
        "positivos": int(df["y_churn_90"].sum()),
        "notas": [
            "y_churn_90 se evalua con features.client_facts en T+90 (misma regla de en_riesgo "
            "que el E1), no con el historial completo de (T, T+90]: si el cliente cruza su "
            "umbral y vuelve a comprar dentro de la ventana, la fila queda en 0 (no cruzo al "
            "cierre de la ventana, aunque haya cruzado un dia intermedio). Documentado en "
            "CONTRACT_E2.md seccion 4.",
            "Los cortes 2024-10-31 a 2024-12-31 quedan marcados 'gap': su ventana de target cae "
            "en 2025-01 a 2025-03 (con cobertura confirmada), pero se excluyen de train/dev/test "
            "para no mezclar corte de features de 2024 con separacion arbitraria.",
            "test_flag (2025-06-30 a 2025-09-30) tiene ventana de target en meses con cobertura "
            "no confirmada (DC-09, sep-dic 2025): se aisla de test, no se descarta.",
            "Fidelizacion: cuando dos alias de la misma persona (DC-04) tienen cada uno su fila "
            "en Fidelizacion.csv, se conserva la de fecha_inscripcion mas antigua.",
            "meses_sin_movimiento y puntos_canjeados son NaN para quien no es socio al corte T, "
            "no tiene fecha_ultimo_movimiento, o esa fecha es posterior a T: Fidelizacion.csv trae "
            "un snapshot unico sin historizar por mes, asi que si el ultimo movimiento registrado "
            "es futuro respecto de T no hay forma de saber el valor real en T (leakage); DC-07 ya "
            "puso a NaN los puntos invalidos (canjeados > acumulados) antes de este filtro.",
            "nivel/es_socio: socio si fecha_inscripcion <= T; si la fila de Fidelizacion no trae "
            "fecha_inscripcion (no ocurre en los datos actuales, los 4.043 registros la traen "
            "completa) se toma como socio en todos los cortes, en vez de 'no socio' por defecto.",
            "edad, genero, provincia y canal_alta son atributos de Clientes.csv sin fecha propia: "
            "se usan igual en los 33 cortes porque el dataset no trae una version historizada.",
        ],
        "features": FEATURES,
    }
    return df, resumen

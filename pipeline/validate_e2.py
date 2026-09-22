"""
Validate E2 — arnes de solo lectura. Relee e2.json, recalcula cada ancla y cada
antes/despues de las 15 decisiones por un camino independiente de build_e2.py
(nunca lo importa), y verifica que cada vista tenga exactamente las claves del
contrato. Sale 1 si algo difiere.

DC-01, DC-04, DC-05, DC-12 y DC-13 se recalculan con pandas directo sobre los
CSV, sin pasar por calidad.py (para no compartir un bug con build_e2 via la
misma funcion). El resto reusa calidad.py (funciones puras, no el orquestador).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
import calidad  # noqa: E402
import features  # noqa: E402
import loader  # noqa: E402

APP_DIR = Path(__file__).resolve().parents[1]
DATA_E1 = APP_DIR / "data" / "raw"
DATA_E2 = APP_DIR / "data" / "raw_e2"
OUT_JSON = APP_DIR / "data" / "payload" / "e2.json"
TABLON_RESUMEN = APP_DIR.parent / "entregas" / "entregable-2" / "_build" / "B" / "dataset" / "resumen_tablon.json"

CORTE_REF = pd.Timestamp("2025-12-31")
CORTE_SENS = pd.Timestamp("2025-08-31")
CORTE_2026 = pd.Timestamp("2026-08-31")

_FALLAS: list[str] = []


def _check(nombre: str, real, esperado, tol: float = 0) -> None:
    if isinstance(esperado, list):
        ok = list(real) == list(esperado)
    elif tol == 0:
        ok = real == esperado
    else:
        ok = real is not None and esperado is not None and abs(real - esperado) <= tol
    marca = "OK" if ok else "FALLA"
    print(f"{marca:6s}{nombre:38s}real={real!r:>16}  esperado={esperado!r}")
    if not ok:
        _FALLAS.append(nombre)


# ============================================================ recomputo DC's
def _facts_client(tx: pd.DataFrame, corte: pd.Timestamp) -> pd.DataFrame:
    """client_facts recalculado a mano (sin pasar por features.client_facts),
    para que la comparacion no comparta bug con build_e2/features."""
    import numpy as np
    d = tx[tx["fecha"] <= corte]
    agg = d.groupby("id_cliente").agg(
        fact=("monto_neto", "sum"), n=("monto_neto", "size"),
        primera=("fecha", "min"), ultima=("fecha", "max"))
    agg["recency"] = (corte - agg["ultima"]).dt.days
    orden = d.sort_values(["id_cliente", "fecha"])
    gap = orden.groupby("id_cliente")["fecha"].diff().dt.days
    agg["gap"] = gap.groupby(orden["id_cliente"]).median()
    agg["eleg"] = agg["n"] >= 3
    agg["riesgo"] = agg["eleg"] & (agg["recency"] > np.maximum(90, 1.5 * agg["gap"]))
    anios = (corte - agg["primera"]).dt.days / 365.25
    agg["anual"] = np.where(anios == 0, agg["fact"], agg["fact"] / anios)
    return agg


def dc01_independiente() -> dict:
    """DC-01: pandas directo, sin calidad.py."""
    crudo = pd.read_csv(DATA_E1 / "Transacciones_clientes.csv")
    dedupe = crudo.drop_duplicates()
    dedupe2 = dedupe.copy()
    dedupe2["fecha"] = pd.to_datetime(dedupe2["fecha"])
    pos = dedupe2[dedupe2["monto_neto"] > 0]
    return {
        "crudo": len(crudo), "dedupe": len(dedupe),
        "ventas_M": round(float(pos["monto_neto"].sum()) / 1e6, 1),
        "tx_dedupe": dedupe2, "pos": pos,
    }


def dc04_independiente(tx_e1: pd.DataFrame) -> dict:
    """DC-04: pandas directo (join y reasignacion de id_cliente sin mapear_identidad)."""
    idr = pd.read_csv(DATA_E2 / "Identidad_resuelta.csv")
    mapa = dict(zip(idr["id_cliente"], idr["id_cliente_canonico"]))
    tx2 = tx_e1.copy()
    tx2["id_cliente"] = [mapa[i] if i in mapa else i for i in tx2["id_cliente"]]
    F_antes = _facts_client(tx_e1, CORTE_REF)
    F_despues = _facts_client(tx2, CORTE_REF)
    activos = set(F_antes.index)
    dup_con_actividad = sum(1 for i in activos if i in mapa and mapa[i] != i)
    return {
        "clientes_antes": len(F_antes), "clientes_despues": len(F_despues),
        "elegibles_antes": int(F_antes["eleg"].sum()), "en_riesgo_antes": int(F_antes["riesgo"].sum()),
        "elegibles_despues": int(F_despues["eleg"].sum()), "en_riesgo_despues": int(F_despues["riesgo"].sum()),
        "exposicion_antes_M": round(float(F_antes.loc[F_antes["riesgo"], "anual"].sum()) / 1e6, 1),
        "exposicion_despues_M": round(float(F_despues.loc[F_despues["riesgo"], "anual"].sum()) / 1e6, 1),
        "duplicados_con_actividad": dup_con_actividad, "tx_despues": tx2, "mapa": mapa,
    }


def dc05_independiente() -> dict:
    """DC-05: pandas directo, dedupe de Campanias_marketing.csv."""
    crudo = pd.read_csv(DATA_E1 / "Campanias_marketing.csv")
    limpio = crudo.drop_duplicates()
    return {"crudo": len(crudo), "limpio": len(limpio), "df_crudo": crudo, "df_limpio": limpio}


def dc12_independiente() -> dict:
    """DC-12: pandas directo sobre Historial_Bajas_No_Contacto.csv."""
    bajas = pd.read_csv(DATA_E2 / "Historial_Bajas_No_Contacto.csv")
    fecha = pd.to_datetime(bajas["fecha_solicitud"])
    return {
        "total": len(bajas), "hasta_corte": int((fecha <= CORTE_REF).sum()),
        "en_2026": int((fecha.dt.year == 2026).sum()), "df": bajas,
    }


def dc13_independiente(campanias_crudo: pd.DataFrame) -> dict:
    """DC-13: pandas directo, sin calidad.dedupe_contenido_campanias."""
    co = pd.read_csv(DATA_E2 / "Contenido_Campanias.csv")
    norm = {
        "2x1": "2x1", "cupon fijo ars": "Cupón fijo", "descuento %": "Descuento",
        "envio gratis": "Envío gratis", "puntos extra": "Puntos extra",
    }
    co["tipo"] = co["tipo_oferta"].str.strip().str.lower().map(lambda s: norm.get(s, s))
    fecha_real = campanias_crudo.drop_duplicates("id_campania").set_index("id_campania")["fecha_envio"]
    fecha_real = pd.to_datetime(fecha_real)

    dup_ids = co.loc[co["id_campania"].duplicated(keep=False), "id_campania"].unique()
    filas = []
    for cid in dup_ids:
        sub = co[co["id_campania"] == cid]
        coincide = pd.to_datetime(sub["fecha_envio"]) == fecha_real.get(cid)
        if coincide.sum() == 1:
            elegida = sub[coincide].iloc[0]
        else:
            orden = sub.sort_values("fecha_creacion", ascending=False)
            elegida = orden.iloc[0]
        filas.append(elegida)
    resuelto = pd.concat([co[~co["id_campania"].isin(dup_ids)], pd.DataFrame(filas)], ignore_index=True)
    return {"n_resuelto": len(resuelto), "n_campanias": resuelto["id_campania"].nunique(), "df": resuelto, "dup_ids": list(dup_ids)}


def main() -> int:
    if not OUT_JSON.exists():
        print(f"FALTA {OUT_JSON}: correr build_e2.py primero.")
        return 1
    payload = json.loads(OUT_JSON.read_text(encoding="utf-8"))

    # --------------------------------------------------- recomputo indep.
    dc01 = dc01_independiente()
    tx_e1 = loader.load_transacciones(DATA_E1)  # E1, para lo que no es DC-01..05..12..13
    dc04 = dc04_independiente(tx_e1)
    dc05 = dc05_independiente()
    dc12 = dc12_independiente()
    dc13 = dc13_independiente(pd.read_csv(DATA_E1 / "Campanias_marketing.csv"))

    F_2026 = _facts_client(tx_e1, CORTE_2026)
    devoluciones = pd.read_csv(DATA_E2 / "Devoluciones.csv")
    dv_join = calidad.serie_devoluciones(dc01["tx_dedupe"], devoluciones)
    unidades = calidad.unidades_antes_despues(dc01["tx_dedupe"])

    clientes = loader.load_clientes(DATA_E1)
    fidelizacion = loader.load_fidelizacion(DATA_E1)
    ca_limpia = dc05["df_limpio"].copy()
    ca_limpia["fecha_envio"] = pd.to_datetime(ca_limpia["fecha_envio"])
    merged = ca_limpia.merge(clientes[["acepta_marketing"]], left_on="id_cliente", right_index=True, how="left")
    sin_cons = merged[merged["acepta_marketing"] == False]  # noqa: E712

    dims = {"region": features.REGIONES, "categoria": features.CATEGORIAS, "rfm": features.RFM_SEGMENTOS}
    F_e1 = _facts_client(tx_e1, CORTE_REF)
    F_e1_feat = features.client_facts(tx_e1, CORTE_REF)  # necesita columnas que solo arma features (region/categoria/rfm)
    lista_e1 = features.top_lista(F_e1_feat, clientes, dims, n=800)
    contactables_800 = int(lista_e1["mk"].sum())

    conv_antes = calidad.conversion_por_oferta(
        ca_limpia, calidad.normalizar_tipo_oferta(pd.read_csv(DATA_E2 / "Contenido_Campanias.csv"))
        .pipe(lambda d: d[~d["id_campania"].isin(dc13["dup_ids"])].drop_duplicates("id_campania")))

    precios = calidad.mediana_precio_unitario(pd.read_csv(DATA_E1 / "Transacciones_clientes.csv"))
    v22 = next(f["valor"] for f in precios["mediana_unitaria"] if f["anio"] == 2022)
    v25 = next(f["valor"] for f in precios["mediana_unitaria"] if f["anio"] == 2025)

    soporte = pd.read_csv(DATA_E2 / "Interacciones_soporte_mensual.csv")
    sop_flag = calidad.nps_con_sin_interaccion(soporte)
    nps_2022 = next(f["con_todo"] for f in calidad.nps_anual(sop_flag, CORTE_REF) if f["anio"] == 2022)
    nps_2025 = next(f["con_todo"] for f in calidad.nps_anual(sop_flag, CORTE_REF) if f["anio"] == 2025)

    cl_edades = calidad.marcar_edades(pd.read_csv(DATA_E1 / "Clientes.csv"))

    gold_envios = int((ca_limpia["segmento_objetivo"] == "Gold").sum())
    jj = ca_limpia.merge(fidelizacion[["id_cliente", "nivel"]], on="id_cliente", how="left")
    evaluables = jj[jj["segmento_objetivo"].isin(["Bronze", "Silver", "Gold"]) & jj["nivel"].notna()]
    coincidencia_pct = round(float((evaluables["segmento_objetivo"] == evaluables["nivel"]).mean()) * 100, 1)
    socios_gold = int((fidelizacion["nivel"] == "Gold").sum())

    meses = calidad.meses_cobertura(dc01["pos"], 0.60)
    meses_flag = [m["mes"] for m in meses if "2023-01" <= m["mes"] <= "2025-12" and m["flag"]]

    # --------------------------------------------------- chequeo de anclas
    print(f"\n{'':6s}{'ANCLA':38s}")
    _check("filas crudas", dc01["crudo"], 50250)
    _check("filas unicas", dc01["dedupe"], 50000)
    _check("ventas M", dc01["ventas_M"], 994.4, 0.05)
    _check("unidades antes", unidades["antes"], 107352)
    _check("unidades despues", unidades["despues"], 106028)
    _check("devoluciones crudas", dv_join["crudas"], 613)
    _check("devoluciones unicas", dv_join["unicas"], 608)
    _check("clientes antes", dc04["clientes_antes"], 5978)
    _check("elegibles antes", dc04["elegibles_antes"], 4940)
    _check("en riesgo antes", dc04["en_riesgo_antes"], 2452)
    _check("riesgo pct antes", round(dc04["en_riesgo_antes"] / dc04["elegibles_antes"] * 100, 1), 49.6, 0.05)
    _check("exposicion M antes", dc04["exposicion_antes_M"], 94.9, 0.05)
    _check("riesgo pct 2026-08-31", round(int(F_2026["riesgo"].sum()) / int(F_2026["eleg"].sum()) * 100, 1), 85.2, 0.05)
    _check("en riesgo 2026-08-31", int(F_2026["riesgo"].sum()), 4207)
    _check("duplicados con actividad", dc04["duplicados_con_actividad"], 348)
    _check("clientes despues", dc04["clientes_despues"], 5634)
    _check("riesgo pct despues", round(dc04["en_riesgo_despues"] / dc04["elegibles_despues"] * 100, 1), 50.4, 0.05)
    _check("exposicion M despues", dc04["exposicion_despues_M"], 96.4, 0.05)
    _check("envios crudos", dc05["crudo"], 23729)
    _check("envios unicos", dc05["limpio"], 23529)
    _check("clic pct despues", round(float(ca_limpia["click"].mean()) * 100, 1), 8.8, 0.05)
    _check("sin consentimiento", len(sin_cons), 7078)
    _check("sin consentimiento pct", round(len(sin_cons) / len(ca_limpia) * 100, 1), 30.1, 0.05)
    _check("contactables 800", contactables_800, 568)
    _check("bajas total", dc12["total"], 1211)
    _check("bajas hasta corte", dc12["hasta_corte"], 812)
    _check("bajas 2026", dc12["en_2026"], 399)
    _check("envios gold", gold_envios, 5066)
    _check("socios gold", socios_gold, 3)
    _check("coincidencia gold pct", coincidencia_pct, 30.1, 0.05)
    _check("precio mediana 2022", v22, 8900)
    _check("precio mediana 2025", v25, 8221)
    _check("precio variacion pct", round((v25 / v22 - 1) * 100, 1), -7.6, 0.05)
    _check("filas soporte", len(soporte), 14976)
    _check("nps sin interaccion", int(sop_flag["nps_sin_interaccion"].sum()), 4312)
    _check("nps sin interaccion pct", round(int(sop_flag["nps_sin_interaccion"].sum()) / len(soporte) * 100, 1), 28.8, 0.05)
    _check("nps 2022", nps_2022, 41.8, 0.05)
    _check("nps 2025", nps_2025, 16.2, 0.05)
    _check("ofertas base antes", sum(v["n"] for v in conv_antes.values()), 22614)
    _check("cupon fijo tasa antes", conv_antes["Cupón fijo"]["tasa_pct"], 1.49, 0.05)
    _check("edades fuera de rango", int(cl_edades["edad_flag"].sum()), 106)
    _check("edades nulas", int(pd.read_csv(DATA_E1 / "Clientes.csv")["edad"].isna().sum()), 524)
    _check("meses flag", meses_flag, ["2025-09", "2025-10", "2025-11", "2025-12"])
    _check("DC-13 campanias resueltas", dc13["n_campanias"], 40)

    # --------------------------------------- anclas vs lo que escribio build_e2
    print(f"\n{'':6s}comparando anclas de e2.json contra los mismos esperados de esta corrida")
    for a in payload["anclas"]:
        marca = "OK" if a["ok"] else "FALLA"
        print(f"{marca:6s}{a['nombre']:38s}e2.json dice ok={a['ok']}")
        if not a["ok"]:
            _FALLAS.append(f"e2.json trae la ancla '{a['nombre']}' en falla")

    # --------------------------------------- decisiones: antes/despues indep.
    print(f"\n{'':6s}decisiones[].antes/despues.valor contra un recalculo independiente")
    valores_independientes = {
        "DC-01": (dc01["crudo"], dc01["dedupe"]),
        "DC-04": (dc04["clientes_antes"], dc04["clientes_despues"]),
        "DC-05": (dc05["crudo"], dc05["limpio"]),
        "DC-12": (dc12["total"], dc12["hasta_corte"]),
        "DC-13": (sum(v["n"] for v in conv_antes.values()), dc05["limpio"]),
    }
    por_id = {d["id"]: d for d in payload["decisiones"]}
    for dc_id, (v_antes, v_despues) in valores_independientes.items():
        d = por_id.get(dc_id)
        if d is None:
            _FALLAS.append(f"{dc_id} no esta en decisiones[] de e2.json")
            continue
        _check(f"{dc_id}.antes.valor", d["antes"]["valor"], v_antes)
        _check(f"{dc_id}.despues.valor", d["despues"]["valor"], v_despues)

    # ------------------------------------------------------ schema de vistas
    print(f"\n{'':6s}claves de cada vista contra CONTRACT_E2.md seccion 3")
    claves_esperadas = {
        "V01": {"n_archivos", "n_decisiones", "por_estado", "por_archivo"},
        "V02": {"archivos", "corte_ref", "riesgo"},
        "V03": {"serie", "meses_flag", "sensibilidad"},
        "V04": {"antes", "despues", "personas_por_n_ids", "duplicados_con_actividad", "canonicos_sin_compra_propia"},
        "V05": {"unidades", "devoluciones", "serie", "desfase_dias", "motivos"},
        "V06": {"envios", "embudo", "sin_consentimiento", "bajas", "lista_800"},
        "V07": {"casos", "ofertas", "envios_duplicados_por_join", "gold"},
        "V08": {"mediana_unitaria", "ipc", "variacion_pct", "por_categoria"},
        "V09": {"filas", "sin_interaccion", "nps_anual", "reclamos_por_cliente_mes", "riesgo_vs_soporte"},
        "V10": {"e1", "despues", "sens", "cambios"},
        "V12": {"pedidos"},
    }
    vistas = payload.get("vistas", {})
    for vnn, claves in claves_esperadas.items():
        real = set(vistas.get(vnn, {}).keys())
        ok = real == claves
        marca = "OK" if ok else "FALLA"
        print(f"{marca:6s}{vnn:6s}real={sorted(real)}")
        if not ok:
            _FALLAS.append(f"{vnn}: claves {sorted(real)} != esperadas {sorted(claves)}")
    _CLAVES_V11 = {"nombre", "filas", "columnas", "n_features", "clientes_distintos",
                   "cortes", "por_particion", "tasa_global_pct", "notas"}
    if "V11" not in vistas:
        _FALLAS.append("V11 no esta en vistas")
        print(f"FALLA V11: falta")
    else:
        v11 = vistas["V11"]
        claves_v11 = set(v11.keys())
        faltan = _CLAVES_V11 - claves_v11
        extra = claves_v11 - _CLAVES_V11
        if faltan:
            _FALLAS.append(f"V11: faltan claves {sorted(faltan)} de las 9 de CONTRACT_E2.md seccion 4")
            print(f"FALLA V11: faltan claves {sorted(faltan)}")
        elif extra:
            # aditivas, no bloquean (ver finding baja 'claves extra' del lint): se
            # avisan para que el orquestador decida si entran al contrato o se sacan.
            print(f"OK    V11: presentes las 9 claves del contrato; extra (aditiva, no bloquea): {sorted(extra)}")
        if not TABLON_RESUMEN.exists():
            _FALLAS.append(f"V11: falta {TABLON_RESUMEN} para comparar (correr build_e2.py primero)")
            print(f"FALLA V11: falta {TABLON_RESUMEN}")
        else:
            resumen = json.loads(TABLON_RESUMEN.read_text(encoding="utf-8"))
            if v11 != resumen:
                _FALLAS.append("V11 no es copia exacta de resumen_tablon.json")
                print("FALLA V11: no coincide con resumen_tablon.json")
            else:
                print(f"OK    V11: presente, 9 claves, copia exacta de resumen_tablon.json "
                      f"({v11['filas']} filas, {v11['clientes_distintos']} clientes, "
                      f"{v11['tasa_global_pct']}% tasa global)")

    claves_top = {"meta", "decisiones", "vistas", "anclas", "stage_counts"}
    real_top = set(payload.keys())
    if real_top != claves_top:
        _FALLAS.append(f"e2.json top-level: {sorted(real_top)} != {sorted(claves_top)}")
        print(f"FALLA top-level: {sorted(real_top)} != {sorted(claves_top)}")
    else:
        print("OK    top-level: meta/decisiones/vistas/anclas/stage_counts")

    if len(payload["decisiones"]) != 15:
        _FALLAS.append(f"decisiones[] trae {len(payload['decisiones'])}, esperaba 15")

    print(f"\n{'RESULTADO':10s}{'TODO OK' if not _FALLAS else f'{len(_FALLAS)} FALLAS'}")
    if _FALLAS:
        for f in _FALLAS:
            print(f"  - {f}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

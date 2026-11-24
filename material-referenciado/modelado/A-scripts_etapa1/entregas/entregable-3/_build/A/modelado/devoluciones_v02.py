"""
Compras devueltas en el dataset del E3 (devolución del E3, fila 2.1 a 2.3, obs. 2).

Lectura A («no contarla», la del E2 y el E3): la fila de monto negativo es solo la devolución; el
pipeline filtra monto > 0 (DC-02, tablon._bases) y la compra devuelta desaparece del historial.
Lectura B («contarla como compra»): la fila negativa es la compra devuelta con el signo invertido;
cuenta como compra en su fecha (la de la compra original, consulta 6). Es la de lectura_devoluciones.py.

Arma, para cada lectura, las filas del dataset v0.2 que usa la regla (cliente elegible y sin riesgo en
cada corte T, días para cruzar, target evaluado cada día de (T, T+90], acepta_marketing, pidio_baja y
partición), con la misma lógica de tablon._fila_por_corte y dataset_v02.target. Antes de medir nada,
la lectura A tiene que reproducir el dataset v0.2 publicado fila por fila (cliente, corte, target,
días para cruzar, acepta_marketing, pidio_baja); si no, sale con código 1.

Mide en cada lectura: filas (población elegible por corte) y positivos por conjunto, y la lista de 500
de la regla en validación (sin filtro y solo contactables) con su valor por año (× 4, G33, G34).
Test y test_flag solo se cuentan (filas y positivos, como la ficha 2.1); no se mide nada en ellos.

Uso (desde la raíz del repositorio):
        python3 -B -I entregas/entregable-3/_build/A/modelado/devoluciones_v02.py
Necesita, en la misma raíz: el pipeline del E2 (`app/pipeline/`) con los CSV de la cátedra en
`app/data/raw/` y `app/data/raw_e2/` (como dataset_v02.py), y `entregas/entregable-3/_build/B/modelado/`
(etapa2.py, de B-scripts_etapa2.zip), de donde toma la matriz de la lista de 500.
Salida: modelado/salida/devoluciones_v02.json (Parte A del E3 v3.0, 2.1: criterio de las compras devueltas;
filas E3A-07 y E3A-08 del registro).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402

AQUI = Path(__file__).resolve().parent
VAULT = AQUI.parents[4]   # raíz del repositorio: modelado -> A -> _build -> entregable-3 -> entregas
APP = VAULT / "app"
BUILD = VAULT / "entregas" / "entregable-3" / "_build"
sys.path.insert(0, str(BUILD / "A" / "modelado"))
sys.path.insert(0, str(BUILD / "B" / "modelado"))
sys.path.insert(0, str(APP / "pipeline"))
import calidad, features, tablon  # noqa: E402,E401
import comun  # noqa: E402
import etapa2  # noqa: E402
import dataset_v02  # noqa: E402
from comun import CAPACIDAD, TARGET  # noqa: E402

SALIDA = AQUI / "salida" / "devoluciones_v02.json"
ECO = json.loads((BUILD / "B" / "economia" / "salida" / "economia.json").read_text(encoding="utf-8"))
V = ECO["celda_4_4"]["unitario_ars"]
TC = ECO["tipo_de_cambio"]["base_30_12_2025"]
ANUALIZAR = ECO["parametros"]["anualizar"]


def filas_regla(tx: pd.DataFrame, clientes: pd.DataFrame, bajas: pd.DataFrame) -> pd.DataFrame:
    """Las columnas del v0.2 que usa la regla, en los 33 cortes del tablón."""
    fechas = tx.groupby("id_cliente")["fecha"].apply(lambda s: np.sort(s.unique()))
    out = []
    for t in tablon.CORTES:
        f = features.client_facts(tx, t)
        el = f[f["elegible"] & ~f["en_riesgo"]]
        ids = el.index
        umbral = np.maximum(90.0, 1.5 * el["gap_mediano"])
        proxima = np.full(len(ids), np.nan)
        for i, c in enumerate(ids):
            fc = fechas.get(c)
            j = np.searchsorted(fc, np.datetime64(t), side="right")
            if j < len(fc):
                proxima[i] = (fc[j] - np.datetime64(t)) / np.timedelta64(1, "D")
        ba = bajas[bajas["fecha_solicitud"] <= t]
        d = pd.DataFrame({
            "id_cliente_canonico": ids, "corte": t,
            "recency_dias": el["recency"].astype(int).values, "gap_mediano": el["gap_mediano"].values,
            "dias_para_cruzar": (umbral - el["recency"].astype(int)).values,
            "proxima": proxima,
            "pidio_baja": pd.Series(ids, index=ids).isin(ba["id_cliente"].unique()).values,
            "acepta_marketing": clientes["acepta_marketing"].reindex(ids).values,
            "particion": tablon.particion_de(t),
        })
        d[TARGET] = dataset_v02.target(d["dias_para_cruzar"], d["proxima"]).values
        out.append(d)
    return pd.concat(out, ignore_index=True)


def neto_usd(vp, fp):
    return (vp * V["vp"] + fp * V["fp"]) / TC


def medir(df: pd.DataFrame) -> dict:
    df = df.copy()
    df["regla_umbral"] = -df["dias_para_cruzar"]
    res = {"conjuntos": {}}
    tr = comun.entrenamiento_para_validacion(df)
    conj = {"todos_los_cortes": df, "train": df[df["particion"] == "train"], "train_con_embargo": tr,
            "validacion": df[df["particion"] == "dev"], "gap": df[df["particion"] == "gap"],
            "test": df[df["particion"] == "test"], "test_flag": df[df["particion"] == "test_flag"]}
    for k, s in conj.items():
        res["conjuntos"][k] = {"filas": int(len(s)), "clientes": int(s["id_cliente_canonico"].nunique()),
                               "positivos": int(s[TARGET].sum()), "tasa_pct": 100 * float(s[TARGET].mean())}
    dev = conj["validacion"]
    ok = dev["acepta_marketing"].astype(bool) & ~dev["pidio_baja"].astype(bool)
    for nombre, s in (("lista_500_sin_filtro", dev), ("lista_500_contactables", dev[ok])):
        c = etapa2.confusion_lista(s, "regla_umbral", CAPACIDAD)
        t = c["total"]
        res[nombre] = {"largo": t["largo"], "vp": t["vp"], "fp": t["fp"], "precision_pct": 100 * t["vp"] / t["largo"],
                       "recall_pct": 100 * t["vp"] / (t["vp"] + t["fn"]),
                       "precision_por_corte_pct": [100 * pc["vp"] / pc["largo"] for pc in c["por_corte"]],
                       "valor_validacion_usd": neto_usd(t["vp"], t["fp"]),
                       "valor_anual_usd": ANUALIZAR * neto_usd(t["vp"], t["fp"])}
    res["contactables_validacion"] = int(ok.sum())
    return res


def main():
    base = tablon._bases(APP / "data" / "raw", APP / "data" / "raw_e2")
    bc = calidad.base_corregida(APP / "data" / "raw", APP / "data" / "raw_e2", corte=calidad.CORTE_REF)
    txall = bc["transacciones_comportamiento"]
    tx_a = base["tx"]
    negs = txall[(txall["monto_neto"] < 0) & txall["id_cliente"].notna()].copy()
    negs["monto_neto"] = negs["monto_neto"].abs()
    negs["region_tx"] = negs["id_tienda"].map(base["tiendas"]["region"]).fillna("__online__")
    tx_b = pd.concat([tx_a, negs[tx_a.columns]], ignore_index=True)
    assert len(negs) == 330, len(negs)

    A = filas_regla(tx_a, base["clientes"], base["bajas"])
    B = filas_regla(tx_b, base["clientes"], base["bajas"])

    # Control: A reproduce el dataset v0.2 publicado.
    v02 = comun.cargar(comun.DATASET_V02)
    m = v02.merge(A, on=["id_cliente_canonico", "corte"], how="outer", suffixes=("_pub", "_a"), indicator=True)
    fallas = []
    if (m["_merge"] != "both").any():
        fallas.append(f"filas distintas: {m['_merge'].value_counts().to_dict()}")
    else:
        for col in (TARGET, "dias_para_cruzar", "pidio_baja", "acepta_marketing", "particion", "recency_dias"):
            a, b = m[f"{col}_pub"], m[f"{col}_a"]
            dif = (~np.isclose(a.astype(float), b.astype(float))).sum() if col not in ("particion",) else (a != b).sum()
            if dif:
                fallas.append(f"{col}: {dif} filas distintas")
    if fallas:
        for f in fallas:
            print("NO REPRODUCE v0.2:", f, file=sys.stderr)
        sys.exit(1)

    ra, rb = medir(A), medir(B)

    # Qué filas cambian.
    mm = A.merge(B, on=["id_cliente_canonico", "corte"], how="outer", suffixes=("_a", "_b"), indicator=True)
    ids_neg = set(negs["id_cliente"].unique())
    cambios = {}
    for k, s in (("todos_los_cortes", mm), ("validacion", mm[mm["corte"].between("2024-07-31", "2024-09-30")]),
                 ("train", mm[mm["corte"] <= "2024-06-30"])):
        both = s[s["_merge"] == "both"]
        cambios[k] = {"solo_en_A": int((s["_merge"] == "left_only").sum()),
                      "solo_en_B": int((s["_merge"] == "right_only").sum()),
                      "en_las_dos": int(len(both)),
                      "target_cambia": int((both[f"{TARGET}_a"] != both[f"{TARGET}_b"]).sum()),
                      "target_0_a_1": int(((both[f"{TARGET}_a"] == 0) & (both[f"{TARGET}_b"] == 1)).sum()),
                      "target_1_a_0": int(((both[f"{TARGET}_a"] == 1) & (both[f"{TARGET}_b"] == 0)).sum()),
                      "filas_de_clientes_con_devolucion": int(s["id_cliente_canonico"].isin(ids_neg).sum())}

    def dif(a, b):
        return b - a

    resumen = {
        "elegibles_filas_validacion": [ra["conjuntos"]["validacion"]["filas"], rb["conjuntos"]["validacion"]["filas"]],
        "elegibles_filas_train_con_embargo": [ra["conjuntos"]["train_con_embargo"]["filas"], rb["conjuntos"]["train_con_embargo"]["filas"]],
        "elegibles_filas_todos": [ra["conjuntos"]["todos_los_cortes"]["filas"], rb["conjuntos"]["todos_los_cortes"]["filas"]],
        "tasa_pct_train_con_embargo": [ra["conjuntos"]["train_con_embargo"]["tasa_pct"], rb["conjuntos"]["train_con_embargo"]["tasa_pct"]],
        "tasa_pct_validacion": [ra["conjuntos"]["validacion"]["tasa_pct"], rb["conjuntos"]["validacion"]["tasa_pct"]],
        "tasa_pct_todos": [ra["conjuntos"]["todos_los_cortes"]["tasa_pct"], rb["conjuntos"]["todos_los_cortes"]["tasa_pct"]],
        "precision_500_sin_filtro_pct": [ra["lista_500_sin_filtro"]["precision_pct"], rb["lista_500_sin_filtro"]["precision_pct"]],
        "precision_500_contactables_pct": [ra["lista_500_contactables"]["precision_pct"], rb["lista_500_contactables"]["precision_pct"]],
        "valor_anual_500_sin_filtro_usd": [ra["lista_500_sin_filtro"]["valor_anual_usd"], rb["lista_500_sin_filtro"]["valor_anual_usd"]],
        "valor_anual_500_contactables_usd": [ra["lista_500_contactables"]["valor_anual_usd"], rb["lista_500_contactables"]["valor_anual_usd"]],
    }
    resumen = {k: {"A": v[0], "B": v[1], "B_menos_A": dif(*v)} for k, v in resumen.items()}
    pc = ra["lista_500_sin_filtro"]["precision_por_corte_pct"]
    resumen["variacion_precision_entre_cortes_validacion_pts"] = max(pc) - min(pc)

    # E3A-07 (registro de cifras del E4): lo que cita la Parte A v3.0, 2.1. Si un dato cambia, el texto no sale.
    esperar = {"elegibles_filas_todos": (59585, 60432, 0), "tasa_pct_todos": (26.94, 26.88, 2),
               "precision_500_sin_filtro_pct": (81.58, 82.34, 2)}
    for k, (a, b, d) in esperar.items():
        assert (round(resumen[k]["A"], d), round(resumen[k]["B"], d)) == (a, b), (k, resumen[k])
    assert round(resumen["variacion_precision_entre_cortes_validacion_pts"], 2) == 2.67
    assert resumen["precision_500_sin_filtro_pct"]["B_menos_A"] < resumen["variacion_precision_entre_cortes_validacion_pts"]
    res = {"control_v02": "la lectura A reproduce el dataset v0.2 fila por fila (59.585 filas; target, días para "
                          "cruzar, acepta_marketing, pidio_baja, partición, recency)",
           "filas_negativas_con_cliente": int(len(negs)), "clientes_con_devolucion": len(ids_neg),
           "A": ra, "B": rb, "cambios": cambios, "resumen": resumen}
    SALIDA.parent.mkdir(exist_ok=True)
    SALIDA.write_text(json.dumps(res, ensure_ascii=False, indent=1, default=float), encoding="utf-8")
    print(json.dumps({"resumen": resumen, "cambios": cambios}, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()

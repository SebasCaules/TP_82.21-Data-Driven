"""
Etapa 1 del modelado (Entregable 3, Parte A, sección 2): ficha del experimento, partición temporal,
control de fugas, métrica principal y líneas base.

El control de fugas corre sobre el dataset entregado en el Entregable 2
(B-churn_cliente_corte_v0.1.csv): es donde se buscan los problemas. Sus decisiones, más el target
evaluado cada día, dan el v0.2 (dataset_v02.py), y sobre el v0.2 se miden la ficha, la partición y
las líneas base.

Las particiones test y test_flag solo se cuentan para la ficha y se descartan antes de cualquier
métrica: el test se mide una sola vez, en la etapa 4.

Uso:    python3 entregas/entregable-3/_build/A/modelado/dataset_v02.py   (una vez)
        python3 entregas/entregable-3/_build/A/modelado/etapa1.py
Salida: salida/etapa1.json (todas las cifras) y salida/fugas_por_variable.csv (la tabla de fugas).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import average_precision_score, roc_auc_score

sys.path.insert(0, str(Path(__file__).resolve().parent))
import comun  # noqa: E402
from comun import CAPACIDAD, DECIL, DECISIONES, HORIZONTE_DIAS, TARGET  # noqa: E402

SALIDA = Path(__file__).resolve().parent / "salida"
NO_FEATURES = {"id_cliente_canonico", "corte", "particion", "acepta_marketing", TARGET,
               "umbral", "dias_para_cruzar", "alcanzable"}
# Una variable "explica el target sospechosamente bien" (lámina 17) si su AUC univariado en
# entrenamiento sale de [0,20; 0,80]. La mejor señal no circular del E1 separaba 1,22x (C21).
AUC_SOSPECHOSO = 0.80

def ficha(df: pd.DataFrame) -> dict:
    """Filas, cortes, clientes y positivos por partición (las cifras de E08) y la marca de
    alcanzable, sobre el tablón completo."""
    por = []
    for nombre in ["train", "dev", "gap", "test", "test_flag"]:
        s = df[df["particion"] == nombre]
        por.append({"particion": nombre, "filas": len(s), "cortes": s["corte"].nunique(),
                    "desde": s["corte"].min().date().isoformat(), "hasta": s["corte"].max().date().isoformat(),
                    "clientes": s["id_cliente_canonico"].nunique(),
                    "clientes_con_positivo": s.loc[s[TARGET] == 1, "id_cliente_canonico"].nunique(),
                    "positivos": int(s[TARGET].sum()),
                    "tasa": float(s[TARGET].mean())})
    no_alc = df[~df["alcanzable"]]
    return {
        "filas": len(df), "columnas_tablon": df.shape[1] - 3, "clientes": df["id_cliente_canonico"].nunique(),
        "cortes": df["corte"].nunique(), "positivos": int(df[TARGET].sum()), "tasa": float(df[TARGET].mean()),
        "por_particion": por,
        "estructura": {
            "filas_no_alcanzables": len(no_alc), "pct_no_alcanzables": len(no_alc) / len(df),
            "positivos_no_alcanzables": int(no_alc[TARGET].sum()),
            "filas_alcanzables": int(df["alcanzable"].sum()),
            "tasa_alcanzables": float(df.loc[df["alcanzable"], TARGET].mean()),
        },
    }


def particion(df: pd.DataFrame) -> dict:
    """Dónde corta cada conjunto, hasta cuándo mira su target y qué saca el embargo."""
    ventana = pd.Timedelta(days=HORIZONTE_DIAS)
    tramos = {}
    for nombre in ["train", "dev", "gap"]:
        s = df[df["particion"] == nombre]
        tramos[nombre] = {"primer_corte": s["corte"].min().date().isoformat(),
                          "ultimo_corte": s["corte"].max().date().isoformat(),
                          "target_mira_hasta": (s["corte"].max() + ventana).date().isoformat()}
    tr = df[df["particion"] == "train"]
    tr_emb = comun.entrenamiento_para_validacion(df)
    purgados = sorted(set(tr["corte"]) - set(tr_emb["corte"]))
    dev = df[df["particion"] == "dev"]
    comunes = set(tr_emb["id_cliente_canonico"]) & set(dev["id_cliente_canonico"])
    return {
        "tramos": tramos,
        "primer_corte_test": "2025-01-31",
        "embargo": {
            "cortes_purgados": [c.date().isoformat() for c in purgados],
            "filas_purgadas": len(tr) - len(tr_emb),
            "entrenamiento_filas": len(tr_emb), "entrenamiento_cortes": tr_emb["corte"].nunique(),
            "entrenamiento_clientes": tr_emb["id_cliente_canonico"].nunique(),
            "entrenamiento_clientes_con_positivo": tr_emb.loc[tr_emb[TARGET] == 1, "id_cliente_canonico"].nunique(),
            "entrenamiento_positivos": int(tr_emb[TARGET].sum()),
            "entrenamiento_tasa": float(tr_emb[TARGET].mean()),
            "target_mira_hasta": (tr_emb["corte"].max() + ventana).date().isoformat(),
        },
        "validacion": {"filas": len(dev), "positivos": int(dev[TARGET].sum()), "tasa": float(dev[TARGET].mean()),
                       "clientes": dev["id_cliente_canonico"].nunique(),
                       "clientes_con_positivo": dev.loc[dev[TARGET] == 1, "id_cliente_canonico"].nunique()},
        "clientes_en_entrenamiento_y_validacion": len(comunes),
        "pct_clientes_validacion_vistos": len(comunes) / dev["id_cliente_canonico"].nunique(),
    }


def tramos_de_cruce(s: pd.DataFrame) -> list[dict]:
    """Tasa de positivos por días que faltan para cruzar el umbral."""
    cortes = pd.cut(s["dias_para_cruzar"], [0, 30, 60, 90, np.inf], right=False,
                    labels=["menos de 30", "30 a 59", "60 a 89", "90 o más"])
    g = s.groupby(cortes, observed=True)[TARGET].agg(["size", "sum", "mean"])
    return [{"tramo": str(i), "filas": int(r["size"]), "positivos": int(r["sum"]), "tasa": float(r["mean"])}
            for i, r in g.iterrows()]


def auc_univariado(x: pd.Series, y: pd.Series) -> tuple[float | None, int]:
    """AUC de una variable sola contra el target. Numéricas y booleanas tal cual, sin vacíos;
    categóricas codificadas con la tasa de cada categoría (el vacío es una categoría)."""
    if x.dtype == object:
        clave = x.fillna("(vacío)")
        x = clave.map(y.groupby(clave).mean())
    else:
        x = x.astype(float)
    ok = x.notna()
    if ok.sum() == 0 or x[ok].nunique() < 2:
        return None, int(ok.sum())
    return float(roc_auc_score(y[ok], x[ok])), int(ok.sum())


def fugas(tr: pd.DataFrame) -> pd.DataFrame:
    """La tabla de la lámina 17 para las 43 variables, con el AUC univariado medido en
    entrenamiento y la diferencia de tasa entre filas con y sin dato. `disponible` es la columna
    del template (Sí / No / Dudoso); `disponible_en_T` dice por qué."""
    feats = [c for c in tr.columns if c not in NO_FEATURES]
    assert len(feats) == 43 and set(feats) == set(DECISIONES), sorted(set(feats) ^ set(DECISIONES))
    filas = []
    for f in feats:
        auc, n = auc_univariado(tr[f], tr[TARGET])
        vacio = tr[f].isna()
        disp, futuro, decision, motivo = DECISIONES[f]
        filas.append({
            "variable": f, "tipo": str(tr[f].dtype), "pct_vacio": float(vacio.mean()),
            "tasa_con_dato": float(tr.loc[~vacio, TARGET].mean()) if (~vacio).any() else None,
            "tasa_sin_dato": float(tr.loc[vacio, TARGET].mean()) if vacio.any() else None,
            "auc": auc, "separacion": None if auc is None else max(auc, 1 - auc),
            "sospechosa": auc is not None and max(auc, 1 - auc) >= AUC_SOSPECHOSO,
            "disponible": "Sí" if disp.startswith("sí") else ("No" if disp.startswith("no") else "Dudoso"),
            "disponible_en_T": disp, "usa_periodo_a_predecir": futuro, "decision": decision, "motivo": motivo,
        })
    return pd.DataFrame(filas).sort_values("separacion", ascending=False, na_position="last")


def medir(s: pd.DataFrame, puntaje: str) -> dict:
    """Las métricas de una línea base: curvas sobre todas las filas, y la lista de cada corte con
    la capacidad de contacto y con el decil superior."""
    y = s[TARGET]
    constante = s[puntaje].nunique() < 2
    return {
        "auc_roc": 0.5 if constante else float(roc_auc_score(y, s[puntaje])),
        "auc_pr": float(y.mean()) if constante else float(average_precision_score(y, s[puntaje])),
        "lista_capacidad": comun.lista_por_corte(s, puntaje, k=CAPACIDAD),
        "decil_superior": comun.lista_por_corte(s, puntaje, fraccion=DECIL),
    }


def lineas_base(s: pd.DataFrame) -> dict:
    """Clase mayoritaria (nadie cruza), práctica actual (más días sin comprar primero: el segmento
    Inactivos 90d de Casa Óga, línea base de C22) y regla del umbral (menos días para cruzar
    primero, con el umbral propio del E1)."""
    s = s.assign(constante=0.0, practica_actual=s["recency_dias"], regla_umbral=-s["dias_para_cruzar"])
    y = s[TARGET]
    out = {
        "filas": len(s), "positivos": int(y.sum()), "tasa": float(y.mean()),
        "clase_mayoritaria": {**medir(s, "constante"), "accuracy": float(1 - y.mean()),
                              "recall": 0.0, "precision": None, "f1": 0.0},
        "practica_actual": medir(s, "practica_actual"),
        "regla_umbral": medir(s, "regla_umbral"),
    }
    # La regla del umbral como clasificador: predice 1 a todo alcanzable.
    pred = s["alcanzable"]
    tp = int((pred & (y == 1)).sum()); fp = int((pred & (y == 0)).sum())
    fn = int((~pred & (y == 1)).sum()); tn = int((~pred & (y == 0)).sum())
    out["regla_umbral"]["como_clasificador"] = {
        "tp": tp, "fp": fp, "fn": fn, "tn": tn, "precision": tp / (tp + fp), "recall": tp / (tp + fn),
        "f1": 2 * tp / (2 * tp + fp + fn), "accuracy": (tp + tn) / len(s)}
    # Matriz de confusión de la lista de capacidad, sumada sobre los cortes.
    lc = out["regla_umbral"]["lista_capacidad"]
    tp = lc["aciertos"]; fp = lc["largo"] - tp; fn = lc["positivos"] - tp
    out["regla_umbral"]["lista_capacidad"]["confusion"] = {
        "tp": tp, "fp": fp, "fn": fn, "tn": len(s) - lc["largo"] - fn}
    # Lo que queda por ganar: entre los alcanzables, cuánto separa la regla a los que cruzan de
    # los que vuelven a comprar a tiempo.
    a = s[s["alcanzable"]]
    out["regla_umbral"]["dentro_de_alcanzables"] = {
        "filas": len(a), "positivos": int(a[TARGET].sum()), "tasa": float(a[TARGET].mean()),
        "auc_roc": float(roc_auc_score(a[TARGET], a["regla_umbral"]))}
    for nombre in ["practica_actual", "regla_umbral", "clase_mayoritaria"]:
        for lista in ["lista_capacidad", "decil_superior"]:
            out[nombre][lista]["lift_vs_practica_actual"] = (
                out[nombre][lista]["precision"] / out["practica_actual"][lista]["precision"])
    out["por_corte"] = []
    for c, g in s.groupby("corte"):
        rc = comun.lista_por_corte(g, "regla_umbral", k=CAPACIDAD)
        pa = comun.lista_por_corte(g, "practica_actual", k=CAPACIDAD)
        out["por_corte"].append({
            "corte": c.date().isoformat(), "filas": len(g), "positivos": int(g[TARGET].sum()),
            "alcanzables": int(g["alcanzable"].sum()),
            "precision_capacidad_regla_umbral": rc["precision"],
            "precision_capacidad_practica_actual": pa["precision"]})
    return out


def main() -> None:
    v01 = comun.cargar(comun.DATASET_V01)
    assert v01.shape == (59585, 51), v01.shape      # 48 columnas del E2 más las tres derivadas
    tabla = fugas(v01[v01["particion"] == "train"])
    del v01
    if not comun.DATASET_V02.exists():
        sys.exit("falta el v0.2: correr antes dataset_v02.py")
    todo = comun.cargar(comun.DATASET_V02)
    assert todo.shape == (59585, 48), todo.shape    # 45 columnas del v0.2 más las tres derivadas
    resultado = {"dataset": comun.DATASET_V02.name, "dataset_control_de_fugas": comun.DATASET_V01.name,
                 "capacidad": CAPACIDAD, "decil": DECIL, "ficha": ficha(todo)}
    assert resultado["ficha"]["estructura"]["positivos_no_alcanzables"] == 0

    df = comun.sin_reservadas(todo)      # desde acá, nada de test ni test_flag
    del todo
    resultado["particion"] = particion(df)
    tr = df[df["particion"] == "train"]
    dev = df[df["particion"] == "dev"]
    resultado["tramos_de_cruce"] = {"train": tramos_de_cruce(tr), "dev": tramos_de_cruce(dev)}
    resultado["fugas"] = {
        "sospechosas": tabla.loc[tabla["sospechosa"], "variable"].tolist(),
        "decisiones": tabla["decision"].value_counts().to_dict(),
        "excluir": tabla.loc[tabla["decision"] == "excluir", "variable"].tolist(),
        "recalcular": tabla.loc[tabla["decision"] == "recalcular", "variable"].tolist(),
    }
    resultado["lineas_base_validacion"] = lineas_base(dev)
    resultado["lineas_base_entrenamiento"] = {
        k: v for k, v in lineas_base(tr).items() if k not in ("por_corte",)}

    SALIDA.mkdir(exist_ok=True)
    tabla.to_csv(SALIDA / "fugas_por_variable.csv", index=False)
    (SALIDA / "etapa1.json").write_text(json.dumps(resultado, ensure_ascii=False, indent=2, default=float),
                                        encoding="utf-8")
    imprimir(resultado, tabla)


def imprimir(r: dict, tabla: pd.DataFrame) -> None:
    f = r["ficha"]
    print(f"Ficha: {f['filas']} filas, {f['clientes']} clientes, {f['cortes']} cortes, "
          f"{f['positivos']} positivos ({f['tasa']:.2%})")
    for p in f["por_particion"]:
        print(f"  {p['particion']:9s} {p['desde']} a {p['hasta']}  {p['filas']:6d} filas  "
              f"{p['positivos']:5d} positivos  {p['tasa']:.2%}  {p['clientes_con_positivo']:5d} clientes con positivo")
    e = f["estructura"]
    print(f"Estructura: {e['filas_no_alcanzables']} filas ({e['pct_no_alcanzables']:.1%}) a 90 días o más de "
          f"cruzar, con {e['positivos_no_alcanzables']} positivos; alcanzables {e['filas_alcanzables']}, "
          f"tasa {e['tasa_alcanzables']:.1%}")
    p = r["particion"]
    print(f"Partición: embargo saca {p['embargo']['cortes_purgados']} ({p['embargo']['filas_purgadas']} filas); "
          f"entrenamiento {p['embargo']['entrenamiento_filas']} filas, {p['embargo']['entrenamiento_positivos']} "
          f"positivos de {p['embargo']['entrenamiento_clientes_con_positivo']} clientes; validación "
          f"{p['validacion']['filas']} filas, {p['validacion']['positivos']} positivos de "
          f"{p['validacion']['clientes_con_positivo']} clientes")
    print("Tramos de cruce (validación):")
    for t in r["tramos_de_cruce"]["dev"]:
        print(f"  {t['tramo']:12s} {t['filas']:5d} filas  tasa {t['tasa']:.1%}")
    print("Fugas, variables que separan sospechosamente bien (entrenamiento):")
    for _, row in tabla[tabla["sospechosa"]].iterrows():
        print(f"  {row['variable']:22s} AUC {row['auc']:.3f}  -> {row['decision']}")
    print(f"Decisiones: {r['fugas']['decisiones']}")
    lb = r["lineas_base_validacion"]
    print(f"Líneas base en validación ({lb['filas']} filas, tasa {lb['tasa']:.1%}):")
    print(f"  {'':18s} {'AUC-ROC':>7s} {'AUC-PR':>7s} {'prec@500':>9s} {'rec@500':>8s} {'prec@10%':>9s} {'lift@10%':>9s}")
    for n in ["clase_mayoritaria", "practica_actual", "regla_umbral"]:
        m = lb[n]
        print(f"  {n:18s} {m['auc_roc']:7.3f} {m['auc_pr']:7.3f} {m['lista_capacidad']['precision']:9.1%} "
              f"{m['lista_capacidad']['recall']:8.1%} {m['decil_superior']['precision']:9.1%} "
              f"{m['decil_superior']['lift_vs_practica_actual']:8.2f}x")
    c = lb["regla_umbral"]["como_clasificador"]
    print(f"  regla como clasificador: precisión {c['precision']:.1%}, recall {c['recall']:.1%}, "
          f"F1 {c['f1']:.3f}; clase mayoritaria accuracy {lb['clase_mayoritaria']['accuracy']:.1%}")
    d = lb["regla_umbral"]["dentro_de_alcanzables"]
    print(f"  dentro de alcanzables: {d['filas']} filas, tasa {d['tasa']:.1%}, AUC de la regla {d['auc_roc']:.3f}")
    for pc in lb["por_corte"]:
        print(f"  {pc['corte']}: {pc['filas']} filas, {pc['alcanzables']} alcanzables, "
              f"regla {pc['precision_capacidad_regla_umbral']:.1%} vs práctica {pc['precision_capacidad_practica_actual']:.1%}")


if __name__ == "__main__":
    main()

"""
Etapa 2 del modelado (Entregable 3, Parte B, sección 4): tres modelos con configuración inicial,
comparados con la regla del umbral sobre el mismo dataset, la misma partición y la misma métrica
que la etapa 1.

- Dataset: churn_cliente_corte_v0.2 (`_build/A/modelado/dataset/`), cargado con comun.cargar.
- Partición: entrenamiento con embargo (comun.entrenamiento_para_validacion), validación = dev.
  Las particiones test y test_flag se descartan al cargar (comun.sin_reservadas) y no se usan.
- Variables: las 40 que la etapa 1 mantiene o recalcula (comun.features_por_decision).
- Métrica principal: precisión de la lista de 500 por corte (comun.lista_por_corte).

Sale con código 1 si la regla del umbral no reproduce las cifras de etapa1.json (F09).

Uso:    python3 -I entregas/entregable-3/_build/B/modelado/etapa2.py
Salida: salida/etapa2.json (todas las cifras de las filas G10 a G27 del registro; G27 es la lista
        por pérdida esperada que promete la A v1.1, 2.4).
"""
from __future__ import annotations

import json
import sys
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
import sklearn
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier, export_text

MOD_A = Path(__file__).resolve().parents[2] / "A" / "modelado"
sys.path.insert(0, str(MOD_A))
import comun  # noqa: E402
from comun import CAPACIDAD, TARGET  # noqa: E402

ETAPA1 = MOD_A / "salida" / "etapa1.json"
SALIDA = Path(__file__).resolve().parent / "salida"
SEMILLA = 42
UMBRAL_PROB = 0.5          # el umbral por defecto que sugiere el template (4.3)
N_BOOT = 1000              # réplicas del bootstrap por cliente
FEATURES = comun.features_por_decision("mantener") + comun.features_por_decision("recalcular")
EXTRA = "dias_para_cruzar"  # variable de la regla; solo en la variante de diagnóstico


# ---------------------------------------------------------------- datos y modelos

def preparar(df: pd.DataFrame, feats: list[str]) -> tuple[pd.DataFrame, list[str], list[str]]:
    """Numéricas y booleanas a float (los vacíos quedan NaN); categóricas con el vacío como una
    categoría más, igual que el AUC univariado de la etapa 1."""
    X = df[feats].copy()
    cat = [f for f in feats if X[f].dtype == object]
    num = [f for f in feats if f not in cat]
    for c in num:
        X[c] = X[c].astype(float)
    for c in cat:
        X[c] = X[c].fillna("(vacío)")
    return X, cat, num


def modelos(cat: list[str], num: list[str]) -> dict:
    """Los tres candidatos con su configuración inicial. Sin ajuste fino: eso es la etapa 3."""
    imputar = SimpleImputer(strategy="median", add_indicator=True)
    onehot = OneHotEncoder(handle_unknown="ignore")
    logistica = Pipeline([
        ("pre", ColumnTransformer([
            ("num", Pipeline([("imputar", imputar), ("escalar", StandardScaler())]), num),
            ("cat", onehot, cat)])),
        ("modelo", LogisticRegression(C=1.0, max_iter=5000))])
    arbol = Pipeline([
        ("pre", ColumnTransformer([("num", SimpleImputer(strategy="median", add_indicator=True), num),
                                   ("cat", OneHotEncoder(handle_unknown="ignore"), cat)])),
        ("modelo", DecisionTreeClassifier(max_depth=5, min_samples_leaf=50, random_state=SEMILLA))])
    hgb = Pipeline([
        ("pre", ColumnTransformer([
            ("cat", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=np.nan), cat),
            ("num", "passthrough", num)])),
        ("modelo", HistGradientBoostingClassifier(
            learning_rate=0.1, max_iter=100, max_leaf_nodes=31, min_samples_leaf=20,
            early_stopping=False, categorical_features=[True] * len(cat) + [False] * len(num),
            random_state=SEMILLA))])
    return {
        "logistica": {
            "nombre": "Regresión logística", "tipo": "interpretable", "pipeline": logistica,
            "configuracion": "L2 con C = 1; numéricas con vacío imputado por la mediana más una marca "
                             "de vacío, estandarizadas; categóricas en one-hot; lbfgs, hasta 5.000 "
                             "iteraciones",
            "por_que": "cada coeficiente dice cuánto sube o baja el riesgo con una variable, y se le "
                       "puede explicar a Marketing por qué un cliente está en la lista"},
        "arbol": {
            "nombre": "Árbol de decisión", "tipo": "interpretable", "pipeline": arbol,
            "configuracion": f"profundidad máxima 5, al menos 50 filas por hoja, Gini, semilla {SEMILLA}; "
                             "mismas variables que la logística, sin estandarizar",
            "por_que": "la regla del umbral es un corte sobre los días sin comprar; un árbol aprende "
                       "cortes del mismo tipo y se lee como reglas"},
        "hgb": {
            "nombre": "Gradient boosting (HistGradientBoosting)", "tipo": "complejo", "pipeline": hgb,
            "configuracion": "valores por defecto de scikit-learn: 100 árboles de hasta 31 hojas, tasa "
                             "de aprendizaje 0,1, 20 filas por hoja; categóricas nativas; sin parada "
                             f"temprana (separaría al azar el 10 % de las filas, no por fecha); semilla {SEMILLA}",
            "por_que": "combina variables y efectos no lineales sin especificarlos a mano; es lo que "
                       "puede separar, cerca del umbral, a quien vuelve a comprar solo"},
    }


# ---------------------------------------------------------------- métricas

def en_lista(puntaje, k: int) -> np.ndarray:
    """Probabilidad de que cada fila entre a la lista de los k de mayor puntaje: 1 arriba del
    borde, 0 abajo y, en el empate del borde, la parte que falta para llegar a k. Es el mismo
    reparto en proporción de comun.aciertos_esperados."""
    puntaje = np.asarray(puntaje, dtype=float)
    k = min(int(k), len(puntaje))
    borde = np.sort(puntaje)[::-1][k - 1]
    p = (puntaje > borde).astype(float)
    empate = puntaje == borde
    p[empate] = (k - p.sum()) / empate.sum()
    return p


def confusion_lista(s: pd.DataFrame, puntaje: str, k: int = CAPACIDAD) -> dict:
    """Matriz de confusión de la lista de k por corte: VP, FP, FN y VN por corte y sumados. Con
    empates en el borde los conteos llevan fracciones."""
    por_corte = []
    for c, g in s.groupby("corte"):
        p = en_lista(g[puntaje], k)
        y = g[TARGET].to_numpy()
        vp = float((p * y).sum())
        assert abs(vp - comun.aciertos_esperados(g[puntaje], y, k)) < 1e-9
        por_corte.append({"corte": c.date().isoformat(), "filas": len(g), "largo": int(round(p.sum())),
                          "vp": vp, "fp": float((p * (1 - y)).sum()),
                          "fn": float(((1 - p) * y).sum()), "vn": float(((1 - p) * (1 - y)).sum())})
    total = {m: sum(pc[m] for pc in por_corte) for m in ("filas", "largo", "vp", "fp", "fn", "vn")}
    return {"total": total, "por_corte": por_corte}


def confusion_umbral(s: pd.DataFrame, pred: pd.Series) -> dict:
    """Matriz de confusión de una predicción 0/1, por corte y sumada."""
    por_corte = []
    for c, g in s.assign(_pred=pred.to_numpy()).groupby("corte"):
        y, p = g[TARGET] == 1, g["_pred"].astype(bool)
        por_corte.append({"corte": c.date().isoformat(), "filas": len(g), "avisados": int(p.sum()),
                          "vp": int((p & y).sum()), "fp": int((p & ~y).sum()),
                          "fn": int((~p & y).sum()), "vn": int((~p & ~y).sum())})
    total = {m: sum(pc[m] for pc in por_corte) for m in ("filas", "avisados", "vp", "fp", "fn", "vn")}
    return {"total": total, "por_corte": por_corte}


def tasas(m: dict) -> dict:
    """Precisión, recall, F1 y accuracy de una matriz."""
    vp, fp, fn, vn = m["vp"], m["fp"], m["fn"], m["vn"]
    return {"precision": vp / (vp + fp) if vp + fp else None, "recall": vp / (vp + fn),
            "f1": 2 * vp / (2 * vp + fp + fn), "accuracy": (vp + vn) / (vp + fp + fn + vn)}


def maximo_lista(s: pd.DataFrame, k: int = CAPACIDAD) -> dict:
    """La mejor precisión posible de la lista de k por corte: en un corte con menos de k positivos,
    la lista no puede acertar más que los positivos que hay."""
    largo = aciertos = 0
    for _, g in s.groupby("corte"):
        kk = min(k, len(g))
        largo += kk
        aciertos += min(kk, int(g[TARGET].sum()))
    return {"largo": largo, "aciertos_maximos": aciertos, "precision_maxima": aciertos / largo,
            "cortes_con_menos_de_k_filas": int((s.groupby("corte").size() < k).sum()),
            "cortes_con_menos_de_k_positivos": int((s.groupby("corte")[TARGET].sum() < k).sum())}


def medir(s: pd.DataFrame, puntaje: str, prob: bool) -> dict:
    """Las métricas de un puntaje en un conjunto: la lista de 500 por corte (métrica principal),
    las curvas y, si el puntaje es una probabilidad, el umbral 0,5."""
    y = s[TARGET]
    lista = comun.lista_por_corte(s, puntaje, k=CAPACIDAD)
    conf = confusion_lista(s, puntaje)
    assert abs(conf["total"]["vp"] - lista["aciertos"]) < 1e-6
    cerca = s[s["alcanzable"]]
    out = {
        "lista_500": {**lista, "f1": 2 * lista["aciertos"] / (lista["largo"] + lista["positivos"]),
                      "confusion": conf,
                      "precision_por_corte": [{"corte": pc["corte"], "precision": pc["vp"] / pc["largo"]}
                                              for pc in conf["por_corte"]]},
        "decil_superior": comun.lista_por_corte(s, puntaje, fraccion=comun.DECIL),
        "auc_roc": float(roc_auc_score(y, s[puntaje])),
        "auc_pr": float(average_precision_score(y, s[puntaje])),
        "auc_roc_cerca_del_umbral": float(roc_auc_score(cerca[TARGET], cerca[puntaje])),
    }
    if prob:
        c = confusion_umbral(s, s[puntaje] >= UMBRAL_PROB)
        out["umbral_05"] = {**c, **tasas(c["total"])}
    return out


def bootstrap_diferencia(dev: pd.DataFrame, a: str, b: str) -> dict:
    """Diferencia de precisión de la lista de 500 por corte entre dos puntajes (a − b), con
    intervalo del 95 % por bootstrap de clientes: se sortean clientes de validación con reposición
    y se rehacen las listas de cada corte."""
    rng = np.random.default_rng(SEMILLA)
    filas = dev.groupby("id_cliente_canonico").indices
    ids = np.array(list(filas))
    difs = []
    for _ in range(N_BOOT):
        idx = np.concatenate([filas[i] for i in rng.choice(ids, size=len(ids), replace=True)])
        r = dev.iloc[idx]
        difs.append(comun.lista_por_corte(r, a, k=CAPACIDAD)["precision"]
                    - comun.lista_por_corte(r, b, k=CAPACIDAD)["precision"])
    difs = np.array(difs)
    return {"replicas": N_BOOT, "semilla": SEMILLA, "unidad": "cliente",
            "ic95": [float(np.percentile(difs, 2.5)), float(np.percentile(difs, 97.5))],
            "replicas_con_a_mejor": float((difs > 0).mean())}


def solapamiento(dev: pd.DataFrame, a: str, b: str) -> list[dict]:
    """Clientes que están en las dos listas de 500 de cada corte (esperado, con los empates
    repartidos)."""
    out = []
    for c, g in dev.groupby("corte"):
        pa, pb = en_lista(g[a], CAPACIDAD), en_lista(g[b], CAPACIDAD)
        y = g[TARGET].to_numpy()
        solo_a, solo_b = pa * (1 - pb), pb * (1 - pa)
        out.append({"corte": c.date().isoformat(), "en_las_dos": float((pa * pb).sum()),
                    "solo_en_a": float(solo_a.sum()), "aciertos_solo_en_a": float((solo_a * y).sum()),
                    "solo_en_b": float(solo_b.sum()), "aciertos_solo_en_b": float((solo_b * y).sum())})
    return out


def facturacion_anualizada(s: pd.DataFrame) -> np.ndarray:
    """F̂_i(T) del anexo de fórmulas del E1 (la exposición de C04) con columnas del dataset, todas con
    fecha ≤ T: `monetary` (facturación acumulada hasta T) sobre los años desde `meses_desde_alta`
    (la menor entre alta y primera compra); con 0 meses, la facturación sin anualizar, como el E1."""
    meses = s["meses_desde_alta"].to_numpy(dtype=float)
    monetary = s["monetary"].to_numpy(dtype=float)
    return np.where(meses > 0, monetary * 12 / np.maximum(meses, 1), monetary)


def valor_en_lista(s: pd.DataFrame, puntaje: str, valor: str, k: int = CAPACIDAD) -> dict:
    """Suma de `valor` en la lista de k por corte: de toda la lista y de sus aciertos (VP), con los
    empates del borde repartidos en proporción, como confusion_lista."""
    total = vp = 0.0
    for _, g in s.groupby("corte"):
        p = en_lista(g[puntaje], k)
        v = g[valor].to_numpy(dtype=float)
        total += float((p * v).sum())
        vp += float((p * v * g[TARGET].to_numpy()).sum())
    return {"lista": total, "vp": vp}


def perdida_esperada(dev: pd.DataFrame, modelo: str) -> dict:
    """La lista de 500 por corte ordenada por pérdida esperada (A 2.4: «riesgo por valor del
    cliente», la que promete el E1): probabilidad del modelo por la facturación anualizada al corte.
    Se mide con la métrica principal y con la facturación anualizada que junta en sus aciertos."""
    dev["facturacion_anualizada"] = facturacion_anualizada(dev)
    dev["perdida_esperada"] = dev[modelo] * dev["facturacion_anualizada"]
    m = medir(dev, "perdida_esperada", prob=False)
    pos = dev[dev[TARGET] == 1]
    return {
        "puntaje": f"probabilidad de {modelo} × facturación anualizada al corte",
        "valor": "facturación anualizada F̂_i(T) = monetary × 12 / meses_desde_alta (E1, C04)",
        "lista_500": {k: v for k, v in m["lista_500"].items() if k != "precision_por_corte"},
        "precision_por_corte": m["lista_500"]["precision_por_corte"],
        "decil_superior": m["decil_superior"],
        "facturacion_anualizada_validacion": {
            "media_filas": float(dev["facturacion_anualizada"].mean()),
            "media_positivos": float(pos["facturacion_anualizada"].mean()),
            "suma_positivos": float(pos["facturacion_anualizada"].sum())},
        "facturacion_anualizada_en_lista_500": {
            "perdida_esperada": valor_en_lista(dev, "perdida_esperada", "facturacion_anualizada"),
            modelo: valor_en_lista(dev, modelo, "facturacion_anualizada"),
            "regla_umbral": valor_en_lista(dev, "regla_umbral", "facturacion_anualizada")},
    }


def coeficientes(pipe: Pipeline, X: pd.DataFrame, n: int = 10) -> list[dict]:
    """Los n términos de la logística con mayor coeficiente en valor absoluto. Numéricas: cambio
    del log-odds por un desvío estándar; categorías: contra el promedio de las categorías. `filas`
    es cuántas filas de entrenamiento tienen ese valor (o dato, si es numérica)."""
    nombres = pipe.named_steps["pre"].get_feature_names_out()
    coef = pipe.named_steps["modelo"].coef_[0]
    orden = np.argsort(-np.abs(coef))[:n]
    out = []
    for i in orden:
        bloque, termino = nombres[i].split("__", 1)
        if bloque == "cat":
            variable = next(f for f in FEATURES if termino.startswith(f + "_"))
            filas = int((X[variable] == termino[len(variable) + 1:]).sum())
        elif termino.startswith("missingindicator_"):
            variable = termino.removeprefix("missingindicator_")
            filas = int(X[variable].isna().sum())
        else:
            variable = termino
            filas = int(X[variable].notna().sum())
        out.append({"termino": termino, "variable": variable, "coeficiente": float(coef[i]),
                    "odds_ratio": float(np.exp(coef[i])), "filas": filas,
                    "sentido": "sube el riesgo" if coef[i] > 0 else "baja el riesgo"})
    return out


# ---------------------------------------------------------------- etapa 2

def main() -> None:
    assert len(FEATURES) == 40, len(FEATURES)
    todo = comun.cargar(comun.DATASET_V02)
    assert todo.shape == (59585, 48), todo.shape
    df = comun.sin_reservadas(todo)          # desde acá, nada de test ni test_flag
    del todo
    tr = comun.entrenamiento_para_validacion(df).copy()
    dev = df[df["particion"] == "dev"].copy()
    assert set(tr["particion"]) == {"train"} and set(dev["particion"]) == {"dev"}
    assert (len(tr), len(dev)) == (14753, 7173), (len(tr), len(dev))
    e1 = json.loads(ETAPA1.read_text(encoding="utf-8"))

    # La regla del umbral, con la misma función de la etapa 1: tiene que dar F09.
    for s in (tr, dev):
        s["regla_umbral"] = -s["dias_para_cruzar"]
    res = {"dataset": comun.DATASET_V02.name, "scikit_learn": sklearn.__version__, "semilla": SEMILLA,
           "capacidad": CAPACIDAD, "umbral_probabilidad": UMBRAL_PROB, "variables": FEATURES,
           "particion": {
               "entrenamiento": {"filas": len(tr), "cortes": tr["corte"].nunique(),
                                 "positivos": int(tr[TARGET].sum()), "tasa": float(tr[TARGET].mean()),
                                 "desde": tr["corte"].min().date().isoformat(),
                                 "hasta": tr["corte"].max().date().isoformat()},
               "validacion": {"filas": len(dev), "cortes": dev["corte"].nunique(),
                              "positivos": int(dev[TARGET].sum()), "tasa": float(dev[TARGET].mean()),
                              "desde": dev["corte"].min().date().isoformat(),
                              "hasta": dev["corte"].max().date().isoformat()},
               "maximo_lista_500": {"entrenamiento": maximo_lista(tr), "validacion": maximo_lista(dev)}},
           "modelos": {}}

    regla = {"nombre": "Regla del umbral (línea base de la etapa 1)", "tipo": "regla de negocio",
             "configuracion": "menos días para cruzar el umbral θ_i(T) primero; sin ajuste",
             "entrenamiento": medir(tr, "regla_umbral", prob=False),
             "validacion": medir(dev, "regla_umbral", prob=False)}
    alc = dev["alcanzable"]
    c = confusion_umbral(dev, alc)
    regla["validacion"]["como_clasificador"] = {**c, **tasas(c["total"])}
    res["modelos"]["regla_umbral"] = regla
    verificar_regla(regla["validacion"], e1["lineas_base_validacion"]["regla_umbral"])

    # Los tres modelos.
    Xtr, cat, num = preparar(tr, FEATURES)
    Xdev, _, _ = preparar(dev, FEATURES)
    ajustados = {}
    for clave, m in modelos(cat, num).items():
        with warnings.catch_warnings():
            warnings.simplefilter("error", category=UserWarning)
            m["pipeline"].fit(Xtr, tr[TARGET])
        tr[clave] = m["pipeline"].predict_proba(Xtr)[:, 1]
        dev[clave] = m["pipeline"].predict_proba(Xdev)[:, 1]
        ajustados[clave] = m["pipeline"]
        res["modelos"][clave] = {k: v for k, v in m.items() if k != "pipeline"}
        res["modelos"][clave]["entrenamiento"] = medir(tr, clave, prob=True)
        res["modelos"][clave]["validacion"] = medir(dev, clave, prob=True)

    lr = ajustados["logistica"].named_steps["modelo"]
    assert lr.n_iter_[0] < lr.max_iter, "la logística no convergió"
    res["modelos"]["logistica"]["complejidad"] = {"coeficientes": int(lr.coef_.shape[1]) + 1,
                                                  "iteraciones": int(lr.n_iter_[0])}
    ar = ajustados["arbol"].named_steps["modelo"]
    res["modelos"]["arbol"]["complejidad"] = {"hojas": int(ar.get_n_leaves()), "profundidad": int(ar.get_depth())}
    res["modelos"]["arbol"]["primeros_cortes"] = export_text(
        ar, feature_names=list(ajustados["arbol"].named_steps["pre"].get_feature_names_out()), max_depth=2)
    hg = ajustados["hgb"].named_steps["modelo"]
    res["modelos"]["hgb"]["complejidad"] = {"arboles": int(hg.n_iter_),
                                            "hojas": int(sum(p[0].get_n_leaf_nodes() for p in hg._predictors))}

    # El mejor candidato: mayor precisión de la lista de 500 en validación; desempata el AUC-PR.
    candidatos = ["logistica", "arbol", "hgb"]
    mejor = max(candidatos, key=lambda k: (res["modelos"][k]["validacion"]["lista_500"]["precision"],
                                           res["modelos"][k]["validacion"]["auc_pr"]))
    mv, rv = res["modelos"][mejor]["validacion"], regla["validacion"]
    res["mejor"] = {
        "modelo": mejor, "criterio": "mayor precisión de la lista de 500 por corte en validación; desempata el AUC-PR",
        "matrices": {
            "mejor_umbral_05": {"total": mv["umbral_05"]["total"], "por_corte": mv["umbral_05"]["por_corte"]},
            "mejor_lista_500": mv["lista_500"]["confusion"],
            "regla_lista_500": rv["lista_500"]["confusion"],
            "regla_como_clasificador": {"total": rv["como_clasificador"]["total"],
                                        "por_corte": rv["como_clasificador"]["por_corte"]}},
        "contra_regla": {
            "diferencia_precision_pp": 100 * (mv["lista_500"]["precision"] - rv["lista_500"]["precision"]),
            "diferencia_aciertos": mv["lista_500"]["aciertos"] - rv["lista_500"]["aciertos"],
            "diferencia_aciertos_por_corte": mv["lista_500"]["aciertos"] / 3 - rv["lista_500"]["aciertos"] / 3,
            "diferencia_auc_pr": mv["auc_pr"] - rv["auc_pr"],
            "diferencia_auc_roc_cerca_del_umbral": mv["auc_roc_cerca_del_umbral"] - rv["auc_roc_cerca_del_umbral"],
            "bootstrap": bootstrap_diferencia(dev, mejor, "regla_umbral"),
            "solapamiento_listas": solapamiento(dev, mejor, "regla_umbral")},
    }
    res["coeficientes_logistica"] = coeficientes(ajustados["logistica"], Xtr)
    res["perdida_esperada"] = perdida_esperada(dev, mejor)

    # Diagnóstico: los mismos modelos con la variable de la regla (días para cruzar) como 41.ª.
    # No reemplaza a los candidatos: dice si les faltaba esa variable.
    Xtr2, cat2, num2 = preparar(tr, FEATURES + [EXTRA])
    Xdev2, _, _ = preparar(dev, FEATURES + [EXTRA])
    res["variante_con_dias_para_cruzar"] = {}
    for clave, m in modelos(cat2, num2).items():
        m["pipeline"].fit(Xtr2, tr[TARGET])
        dev["_v"] = m["pipeline"].predict_proba(Xdev2)[:, 1]
        res["variante_con_dias_para_cruzar"][clave] = {
            "precision_lista_500": comun.lista_por_corte(dev, "_v", k=CAPACIDAD)["precision"],
            "auc_pr": float(average_precision_score(dev[TARGET], dev["_v"]))}

    SALIDA.mkdir(exist_ok=True)
    (SALIDA / "etapa2.json").write_text(json.dumps(res, ensure_ascii=False, indent=2, default=float),
                                        encoding="utf-8")
    imprimir(res)


def verificar_regla(v: dict, e1: dict) -> None:
    """La regla recalculada en esta etapa tiene que dar lo mismo que en etapa1.json (F09)."""
    pares = [("precisión lista de 500", v["lista_500"]["precision"], e1["lista_capacidad"]["precision"]),
             ("recall lista de 500", v["lista_500"]["recall"], e1["lista_capacidad"]["recall"]),
             ("AUC-ROC", v["auc_roc"], e1["auc_roc"]), ("AUC-PR", v["auc_pr"], e1["auc_pr"]),
             ("AUC-ROC cerca del umbral", v["auc_roc_cerca_del_umbral"], e1["dentro_de_alcanzables"]["auc_roc"]),
             ("decil superior", v["decil_superior"]["precision"], e1["decil_superior"]["precision"])]
    for m, a in [("vp", "tp"), ("fp", "fp"), ("fn", "fn"), ("vn", "tn")]:
        pares.append((f"lista de 500, {m}", v["lista_500"]["confusion"]["total"][m],
                      e1["lista_capacidad"]["confusion"][a]))
    malos = [(n, a, b) for n, a, b in pares if abs(a - b) > 1e-9]
    if malos:
        for n, a, b in malos:
            print(f"NO REPRODUCE {n}: etapa 2 {a} contra etapa 1 {b}", file=sys.stderr)
        sys.exit(1)


def imprimir(r: dict) -> None:
    p = r["particion"]
    print(f"Entrenamiento {p['entrenamiento']['filas']} filas, {p['entrenamiento']['cortes']} cortes; "
          f"validación {p['validacion']['filas']} filas, {p['validacion']['cortes']} cortes; "
          f"máximo de la lista en entrenamiento {p['maximo_lista_500']['entrenamiento']['precision_maxima']:.1%}")
    print(f"{'':14s} {'lista train':>11s} {'lista val':>9s} {'recall':>7s} {'F1':>6s} {'AUC-ROC':>7s} "
          f"{'AUC-PR':>7s} {'AUC cerca':>9s} | {'P@0,5':>6s} {'R@0,5':>6s} {'F1@0,5':>6s} {'AUC train':>9s}")
    for k, m in r["modelos"].items():
        t, v = m["entrenamiento"], m["validacion"]
        u = v.get("umbral_05")
        extra = (f"{u['precision']:6.1%} {u['recall']:6.1%} {u['f1']:6.3f}" if u else f"{'':20s}")
        print(f"{k:14s} {t['lista_500']['precision']:11.1%} {v['lista_500']['precision']:9.1%} "
              f"{v['lista_500']['recall']:7.1%} {v['lista_500']['f1']:6.3f} {v['auc_roc']:7.3f} {v['auc_pr']:7.3f} "
              f"{v['auc_roc_cerca_del_umbral']:9.3f} | {extra} {t['auc_roc']:9.3f}")
        print(f"{'':14s} por corte: " + ", ".join(f"{x['corte'][:7]} {x['precision']:.1%}"
                                                   for x in v["lista_500"]["precision_por_corte"]))
    b = r["mejor"]
    cr = b["contra_regla"]
    print(f"Mejor: {b['modelo']}; contra la regla {cr['diferencia_precision_pp']:+.2f} pp "
          f"({cr['diferencia_aciertos']:+.1f} aciertos en 3 cortes); IC 95 % bootstrap "
          f"[{cr['bootstrap']['ic95'][0] * 100:+.2f}; {cr['bootstrap']['ic95'][1] * 100:+.2f}] pp, "
          f"{cr['bootstrap']['replicas_con_a_mejor']:.0%} de las réplicas a favor del modelo")
    for nombre, m in b["matrices"].items():
        t = m["total"]
        print(f"  {nombre:24s} VP {t['vp']:8.2f}  FP {t['fp']:8.2f}  FN {t['fn']:8.2f}  VN {t['vn']:8.2f}")
    for s in cr["solapamiento_listas"]:
        print(f"  {s['corte']}: {s['en_las_dos']:.1f} en las dos listas; solo modelo {s['solo_en_a']:.1f} "
              f"({s['aciertos_solo_en_a']:.1f} aciertos), solo regla {s['solo_en_b']:.1f} ({s['aciertos_solo_en_b']:.1f})")
    print("Coeficientes de la logística:")
    for c in r["coeficientes_logistica"]:
        print(f"  {c['termino']:46s} {c['coeficiente']:+.3f}  OR {c['odds_ratio']:.2f}  {c['filas']:6d} filas")
    print("Decil superior en validación: " + ", ".join(
        f"{k} {m['validacion']['decil_superior']['precision']:.1%}" for k, m in r["modelos"].items()))
    pe = r["perdida_esperada"]
    t = pe["lista_500"]["confusion"]["total"]
    fa = pe["facturacion_anualizada_en_lista_500"]
    print(f"Pérdida esperada ({pe['puntaje']}): lista de 500 {pe['lista_500']['precision']:.1%}, "
          f"VP {t['vp']:.2f} FP {t['fp']:.2f}; facturación anualizada en los VP: "
          + ", ".join(f"{k} ARS {v['vp'] / 1e6:,.1f} M" for k, v in fa.items()))
    print("Variante con días para cruzar: " + ", ".join(
        f"{k} {v['precision_lista_500']:.1%} (AUC-PR {v['auc_pr']:.3f})" for k, v in r["variante_con_dias_para_cruzar"].items()))


if __name__ == "__main__":
    main()

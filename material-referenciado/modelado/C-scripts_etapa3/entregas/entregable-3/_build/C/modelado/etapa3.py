"""
Etapa 3 del modelado (Entregable 3, Parte C, sección 7): ajuste de hiperparámetros, umbral de
decisión, explicabilidad y errores por segmento. Mismo dataset, misma partición y misma métrica
que las etapas 1 y 2.

- Dataset: churn_cliente_corte_v0.2 (`_build/A/modelado/dataset/`), cargado con comun.cargar.
- Partición: entrenamiento con embargo (comun.entrenamiento_para_validacion), validación = dev.
  Test y test_flag se descartan al cargar (comun.sin_reservadas) y no se usan: el template de la
  Parte C dice «el conjunto de test continúa reservado».
- Ajuste (7.1): búsqueda en grilla con validación temporal dentro del entrenamiento. Cuatro
  pliegues de dos cortes cada uno (septiembre de 2023 a abril de 2024); cada pliegue entrena con
  los cortes cuyo target cierra antes del primer corte del pliegue (el mismo embargo de F05). La
  métrica de la búsqueda es la precisión de la lista que ocupa en cada corte la misma porción que
  la lista de 500 en validación (los cortes de entrenamiento son más chicos). Se elige con la
  regla de un error estándar: la configuración más simple cuya media queda a menos de un error
  estándar de la mejor.
- Umbral (7.2): listas de 500, 600, 700 y 800 por corte (C08), el umbral 0,5 y la regla del umbral
  al mismo largo, valorizadas con los valores por celda de la 4.4 (`economia.json`, G33).
- Explicabilidad (7.3): coeficientes estandarizados e importancia por permutación con la métrica
  principal; disponibilidad de cada variable al predecir y en producción; un caso real.
- Errores por segmento (7.4): precisión de la lista de 500 por formato de tienda, canal de alta,
  antigüedad, alto valor (20 % de mayor facturación del corte) y genero.

Sale con código 1 si la configuración de la etapa 2 no reproduce etapa2.json (G13, G15) o si los
valores por celda de economia.json no son los de G33.

Uso:    python3 -I entregas/entregable-3/_build/C/modelado/etapa3.py
Salida: salida/etapa3.json (filas H01 a H39 del registro), salida/segmentos_etapa3.csv,
        salida/importancia_variables_etapa3.png
"""
from __future__ import annotations

import csv
import itertools
import json
import math
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
from sklearn.metrics import average_precision_score, brier_score_loss, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder, StandardScaler

sys.dont_write_bytecode = True            # no deja __pycache__ en las carpetas de las etapas 1 y 2
AQUI = Path(__file__).resolve().parent
BUILD = AQUI.parents[1]                                   # entregas/entregable-3/_build
MOD_A = BUILD / "A" / "modelado"
MOD_B = BUILD / "B" / "modelado"
sys.path.insert(0, str(MOD_A))
sys.path.insert(0, str(MOD_B))
sys.path.insert(0, str(AQUI))
import comun  # noqa: E402
import etapa2  # noqa: E402  (solo funciones; su main no corre al importar)
import grafico  # noqa: E402
from comun import CAPACIDAD, TARGET  # noqa: E402

ETAPA2 = MOD_B / "salida" / "etapa2.json"
ECONOMIA = BUILD / "B" / "economia" / "salida" / "economia.json"
SALIDA = AQUI / "salida"
SEMILLA = 42
LARGOS = (500, 600, 700, 800)            # C08: de 500 a 800 contactos por mes
# Con el filtro de consentimiento y bajas quedan unos 1.630 contactables por corte: se miran también
# listas más cortas que la capacidad, porque la lista larga se llena de falsas alarmas.
LARGOS_FILTRADA = (300, 400, 500, 600, 700, 800)
UMBRAL_PROB = 0.5
N_BOOT = 1000
N_PERMUTA = 10
FEATURES = etapa2.FEATURES               # las 40 de la etapa 1
SIN_GENERO = [f for f in FEATURES if f != "genero"]
DE_LA_REGLA = ("recency_dias", "gap_mediano", "recency_sobre_umbral")

# Grillas (7.1). min_frecuencia agrupa en una sola categoría los valores con menos filas que ese
# número en el entrenamiento: con 100, las cinco categorías de motivo_ultima_devolucion (38 a 84
# filas, G24) quedan en una (pendiente 47).
GRILLA_LOG = {"C": [0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1.0, 3.0], "min_frecuencia": [None, 100]}
GRILLA_HGB = {"hojas": [4, 8, 16, 31], "min_hoja": [20, 100, 300], "tasa": [0.05, 0.1],
              "arboles": [50, 100, 200], "min_frecuencia": [None, 100]}
INICIAL_LOG = {"C": 1.0, "min_frecuencia": None}
INICIAL_HGB = {"hojas": 31, "min_hoja": 20, "tasa": 0.1, "arboles": 100, "min_frecuencia": None}

# Archivo del que sale cada variable (7.3, pendiente 69). Todas pasan por Identidad_resuelta.csv
# para el id canónico (DC-04).
ORIGEN = {
    **{v: "Transacciones_clientes.csv" for v in (
        "recency_dias", "gap_mediano", "recency_sobre_umbral", "frequency", "compras_90d",
        "compras_90d_prev", "monetary", "ticket_medio", "ticket_90d", "n_categorias_distintas",
        "categoria_dominante", "pct_online")},
    **{v: "Transacciones_clientes.csv y Tiendas.csv" for v in (
        "n_tiendas_distintas", "region_dominante", "formato_tienda")},
    "meses_desde_alta": "Clientes.csv y Transacciones_clientes.csv",
    **{v: "Clientes.csv" for v in ("canal_alta", "genero", "provincia", "edad", "edad_flag")},
    "es_socio": "Fidelizacion.csv",
    **{v: "Campanias_marketing.csv" for v in (
        "envios_90d", "envios_acum", "ultimo_canal_campania", "aperturas_90d", "clics_90d",
        "compro_7d_alguna")},
    **{v: "Interacciones_soporte_mensual.csv" for v in (
        "reclamos_90d", "reclamos_acum", "consultas_90d", "nps_ultimo", "nps_sin_interaccion_flag",
        "tiene_panel")},
    **{v: "Devoluciones.csv" for v in ("n_devoluciones", "motivo_ultima_devolucion")},
    "pidio_baja": "Historial_Bajas_No_Contacto.csv",
    **{v: "Calendario.csv" for v in ("mes_corte", "temporada", "dias_a_proximo_evento")},
}
CALENDARIO = ("mes_corte", "temporada", "dias_a_proximo_evento")
# Variables que describen a la persona y no su relación con Casa Óga: pueden decidir a quién se
# contacta por lo que la persona es (uso indebido, [[privacidad-y-etica-de-datos]]).
PERSONALES = ("genero", "edad", "edad_flag", "provincia")
# Datos del caso real (7.3): solo el código de cliente y variables de compra y contacto.
CAMPOS_CASO = ("recency_dias", "gap_mediano", "umbral", "dias_para_cruzar", "frequency",
               "compras_90d", "compras_90d_prev", "monetary", "ticket_medio", "meses_desde_alta",
               "n_devoluciones", "envios_90d", "aperturas_90d", "reclamos_90d", "formato_tienda",
               "canal_alta", "es_socio", "acepta_marketing", "pidio_baja")


# ---------------------------------------------------------------- modelos

def logistica(cat: list[str], num: list[str], C: float, min_frecuencia) -> Pipeline:
    """La logística de la etapa 2 con C y agrupación de categorías como hiperparámetros. Con
    C = 1 y sin agrupar es exactamente la de etapa2.modelos."""
    onehot = (OneHotEncoder(handle_unknown="ignore") if min_frecuencia is None else
              OneHotEncoder(handle_unknown="infrequent_if_exist", min_frequency=min_frecuencia))
    return Pipeline([
        ("pre", ColumnTransformer([
            ("num", Pipeline([("imputar", SimpleImputer(strategy="median", add_indicator=True)),
                              ("escalar", StandardScaler())]), num),
            ("cat", onehot, cat)])),
        ("modelo", LogisticRegression(C=C, max_iter=5000))])


def boosting(cat: list[str], num: list[str], hojas: int, min_hoja: int, tasa: float, arboles: int,
             min_frecuencia) -> Pipeline:
    """El HistGradientBoosting de la etapa 2, sin parada temprana, con la capacidad como
    hiperparámetro."""
    ordinal = (OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=np.nan)
               if min_frecuencia is None else
               OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=np.nan,
                              min_frequency=min_frecuencia))
    return Pipeline([
        ("pre", ColumnTransformer([("cat", ordinal, cat), ("num", "passthrough", num)])),
        ("modelo", HistGradientBoostingClassifier(
            learning_rate=tasa, max_iter=arboles, max_leaf_nodes=hojas, min_samples_leaf=min_hoja,
            early_stopping=False, categorical_features=[True] * len(cat) + [False] * len(num),
            random_state=SEMILLA))])


CONSTRUCTOR = {"logistica": logistica, "hgb": boosting}


def configs(grilla: dict) -> list[dict]:
    claves = list(grilla)
    return [dict(zip(claves, v)) for v in itertools.product(*(grilla[k] for k in claves))]


def complejidad(modelo: str, c: dict) -> tuple:
    """Orden de simpleza para la regla de un error estándar: primero lo más regularizado."""
    agrupa = 0 if c["min_frecuencia"] else 1
    if modelo == "logistica":
        return (c["C"], agrupa)
    return (c["hojas"] * c["arboles"] * c["tasa"], -c["min_hoja"], agrupa)


def ajustar(modelo: str, cfg: dict, X: pd.DataFrame, y: pd.Series, cat: list[str], num: list[str]) -> Pipeline:
    pipe = CONSTRUCTOR[modelo](cat, num, **cfg)
    with warnings.catch_warnings():
        warnings.simplefilter("error", category=UserWarning)
        pipe.fit(X, y)
    if modelo == "logistica":
        lr = pipe.named_steps["modelo"]
        assert lr.n_iter_[0] < lr.max_iter, f"la logística no convergió con {cfg}"
    return pipe


# ---------------------------------------------------------------- 7.1: búsqueda con validación temporal

def pliegues(tr: pd.DataFrame) -> list[dict]:
    """Cuatro pliegues de dos cortes (septiembre de 2023 a abril de 2024). Cada uno entrena con los
    cortes de entrenamiento cuyo target (T, T+90] cierra antes de su primer corte: el embargo de
    comun.entrenamiento_para_validacion aplicado dentro del entrenamiento."""
    cortes = sorted(tr["corte"].unique())
    assert len(cortes) == 16
    out = []
    for i in range(8, 16, 2):
        bloque = cortes[i:i + 2]
        ent = tr[tr["corte"] + pd.Timedelta(days=comun.HORIZONTE_DIAS) < bloque[0]]
        val = tr[tr["corte"].isin(bloque)]
        out.append({"ent": ent, "val": val,
                    "resumen": {"validacion": [pd.Timestamp(c).date().isoformat() for c in bloque],
                                "entrena_hasta": ent["corte"].max().date().isoformat(),
                                "filas_entrenamiento": len(ent), "cortes_entrenamiento": ent["corte"].nunique(),
                                "filas_validacion": len(val), "positivos_validacion": int(val[TARGET].sum())}})
    return out


def buscar(modelo: str, grilla: dict, folds: list[dict], feats: list[str], fraccion: float) -> dict:
    """Grilla completa: cada configuración en los cuatro pliegues, con la precisión de la lista de
    la misma porción del corte que la lista de 500 en validación."""
    datos = []
    for f in folds:
        Xe, cat, num = etapa2.preparar(f["ent"], feats)
        Xv, _, _ = etapa2.preparar(f["val"], feats)
        datos.append((Xe, f["ent"][TARGET], Xv, f["val"].copy(), cat, num))
    filas = []
    for cfg in configs(grilla):
        por_pliegue = []
        for Xe, ye, Xv, val, cat, num in datos:
            pipe = ajustar(modelo, cfg, Xe, ye, cat, num)
            val["_p"] = pipe.predict_proba(Xv)[:, 1]
            por_pliegue.append(comun.lista_por_corte(val, "_p", fraccion=fraccion)["precision"])
        filas.append({"config": cfg, "por_pliegue": por_pliegue, "media": float(np.mean(por_pliegue)),
                      "ee": float(np.std(por_pliegue, ddof=1) / math.sqrt(len(por_pliegue)))})
    mejor = max(filas, key=lambda r: r["media"])
    umbral = mejor["media"] - mejor["ee"]
    elegida = min((r for r in filas if r["media"] >= umbral), key=lambda r: complejidad(modelo, r["config"]))
    return {"modelo": modelo, "variables": len(feats), "grilla": grilla, "configuraciones": len(filas),
            "ajustes": len(filas) * len(folds), "mejor": mejor, "umbral_un_ee": umbral, "elegida": elegida,
            "todas": sorted(filas, key=lambda r: -r["media"])}


def regla_en_pliegues(folds: list[dict], fraccion: float) -> dict:
    """La regla del umbral en los mismos pliegues y con la misma métrica: la referencia de la
    búsqueda."""
    pp = []
    for f in folds:
        v = f["val"].copy()
        v["regla_umbral"] = -v["dias_para_cruzar"]
        pp.append(comun.lista_por_corte(v, "regla_umbral", fraccion=fraccion)["precision"])
    return {"por_pliegue": pp, "media": float(np.mean(pp))}


# ---------------------------------------------------------------- medición en validación

def entrenar_y_medir(modelo: str, cfg: dict, tr: pd.DataFrame, dev: pd.DataFrame, feats: list[str],
                     clave: str, fraccion: float) -> tuple[Pipeline, dict]:
    """Ajusta sobre todo el entrenamiento con embargo y mide en entrenamiento y en validación con
    las mismas funciones de la etapa 2. Agrega la lista proporcional en los dos conjuntos, que no
    tiene el techo de la lista de 500 en entrenamiento (G12)."""
    Xtr, cat, num = etapa2.preparar(tr, feats)
    Xdev, _, _ = etapa2.preparar(dev, feats)
    pipe = ajustar(modelo, cfg, Xtr, tr[TARGET], cat, num)
    tr[clave] = pipe.predict_proba(Xtr)[:, 1]
    dev[clave] = pipe.predict_proba(Xdev)[:, 1]
    res = {"config": cfg, "variables": len(feats),
           "entrenamiento": etapa2.medir(tr, clave, prob=True),
           "validacion": etapa2.medir(dev, clave, prob=True)}
    for conj, s in (("entrenamiento", tr), ("validacion", dev)):
        res[conj]["lista_proporcional"] = comun.lista_por_corte(s, clave, fraccion=fraccion)
    res["brecha"] = brecha(res)
    if modelo == "hgb":
        hg = pipe.named_steps["modelo"]
        res["complejidad"] = {"arboles": int(hg.n_iter_),
                              "hojas": int(sum(p[0].get_n_leaf_nodes() for p in hg._predictors))}
    else:
        res["complejidad"] = {"coeficientes": int(pipe.named_steps["modelo"].coef_.shape[1]) + 1}
    return pipe, res


def brecha(r: dict) -> dict:
    """Entrenamiento menos validación: en la lista proporcional, en AUC-ROC y en AUC-PR."""
    e, v = r["entrenamiento"], r["validacion"]
    return {"lista_proporcional_pp": 100 * (e["lista_proporcional"]["precision"] - v["lista_proporcional"]["precision"]),
            "auc_roc": e["auc_roc"] - v["auc_roc"], "auc_pr": e["auc_pr"] - v["auc_pr"]}


def resumen_medida(r: dict) -> dict:
    """Lo que el JSON guarda de cada modelo medido (sin las matrices por corte de la etapa 2)."""
    out = {"config": r["config"], "variables": r["variables"], "complejidad": r.get("complejidad"),
           "brecha": r["brecha"]}
    for conj in ("entrenamiento", "validacion"):
        m = r[conj]
        out[conj] = {"lista_500": {k: m["lista_500"][k] for k in ("largo", "aciertos", "positivos", "precision", "recall", "f1")},
                     "lista_500_por_corte": m["lista_500"]["precision_por_corte"],
                     "lista_proporcional": m["lista_proporcional"],
                     "decil_superior": m["decil_superior"]["precision"],
                     "auc_roc": m["auc_roc"], "auc_pr": m["auc_pr"],
                     "auc_roc_cerca_del_umbral": m["auc_roc_cerca_del_umbral"]}
        if "umbral_05" in m:
            out[conj]["umbral_05"] = {k: m["umbral_05"][k] for k in ("precision", "recall", "f1")} | {
                "avisados": m["umbral_05"]["total"]["avisados"]}
    return out


def bootstrap(dev: pd.DataFrame, a: str, b: str) -> dict:
    """Diferencia de precisión de la lista de 500 (a − b), con intervalo del 95 % por bootstrap de
    clientes: la misma función de la etapa 2 (G17)."""
    return etapa2.bootstrap_diferencia(dev, a, b)


# ---------------------------------------------------------------- 7.2: umbral de decisión

def valor(m: dict, v: dict) -> float:
    """Valor neto en ARS de una matriz con los valores unitarios de la 4.4 (FN y VN valen 0)."""
    return sum(m[k] * v[k] for k in ("vp", "fp", "fn", "vn"))


def fila_umbral(nombre: str, tipo: str, m: dict, por_corte: list[int], V: dict, tc: float, anualizar: float,
                contactables: dict | None = None) -> dict:
    neto = valor(m, V)
    casos = m.get("largo", m.get("avisados"))
    return {"umbral": nombre, "tipo": tipo, "casos_marcados": casos, "por_corte": por_corte,
            "vp": m["vp"], "fp": m["fp"], "fn": m["fn"], "vn": m["vn"],
            "precision": m["vp"] / (m["vp"] + m["fp"]), "recall": m["vp"] / (m["vp"] + m["fn"]),
            "valor_neto_ars": neto, "valor_neto_usd": neto / tc, "valor_neto_anual_usd": neto * anualizar / tc,
            "operable": bool(max(por_corte) <= max(LARGOS)),
            "contactables": contactables}


def contactables_en_lista(dev: pd.DataFrame, puntaje: str, k: int) -> dict:
    """De la lista de k por corte, cuántos aceptan marketing y no pidieron la baja al corte
    (pendiente 40), y cuántos aciertos quedan entre ellos."""
    quedan = vp = 0.0
    for _, g in dev.groupby("corte"):
        p = etapa2.en_lista(g[puntaje], k)
        ok = (g["acepta_marketing"].astype(bool) & ~g["pidio_baja"].astype(bool)).to_numpy()
        quedan += float((p * ok).sum())
        vp += float((p * ok * g[TARGET].to_numpy()).sum())
    return {"quedan": quedan, "vp": vp, "precision": vp / quedan if quedan else None}


def tabla_umbrales(dev: pd.DataFrame, puntaje: str, V: dict, tc: float, anualizar: float, prob: bool) -> list[dict]:
    """Las listas de 500 a 800 por corte y, si hay probabilidad, el umbral 0,5."""
    filas = []
    for k in LARGOS:
        c = etapa2.confusion_lista(dev, puntaje, k)
        filas.append(fila_umbral(f"lista de {k} por corte", "lista", c["total"],
                                 [pc["largo"] for pc in c["por_corte"]], V, tc, anualizar,
                                 contactables_en_lista(dev, puntaje, k)))
        if prob:
            filas[-1]["probabilidad_del_ultimo_puesto"] = borde(dev, puntaje, k)
    if prob:
        c = etapa2.confusion_umbral(dev, dev[puntaje] >= UMBRAL_PROB)
        filas.append(fila_umbral("probabilidad ≥ 0,5", "umbral", c["total"],
                                 [pc["avisados"] for pc in c["por_corte"]], V, tc, anualizar))
    return filas


def borde(s: pd.DataFrame, puntaje: str, k: int) -> list[float]:
    """La probabilidad del puesto k de cada corte: la lista de k equivale a actuar desde ahí."""
    return [float(np.sort(g[puntaje].to_numpy())[::-1][min(k, len(g)) - 1]) for _, g in s.groupby("corte")]


def tabla_filtrada(dev: pd.DataFrame, puntaje: str, V: dict, tc: float, anualizar: float) -> list[dict]:
    """La lista armada solo con los contactables (acepta_marketing y sin pedido de baja): es la que
    Marketing puede mandar (L3). Precisión y recall sobre los contactables."""
    ok = dev["acepta_marketing"].astype(bool) & ~dev["pidio_baja"].astype(bool)
    sub = dev[ok]
    filas = []
    for k in LARGOS_FILTRADA:
        c = etapa2.confusion_lista(sub, puntaje, k)
        filas.append(fila_umbral(f"lista de {k} por corte, solo contactables", "lista filtrada", c["total"],
                                 [pc["largo"] for pc in c["por_corte"]], V, tc, anualizar))
        if puntaje not in ("regla_umbral", "practica_actual"):
            filas[-1]["probabilidad_del_ultimo_puesto"] = borde(sub, puntaje, k)
    return filas


def calibracion(dev: pd.DataFrame, tr: pd.DataFrame, clave: str) -> dict:
    """Calibración de la logística en validación (pendiente 68): Brier, probabilidad media contra
    tasa observada, por decil de probabilidad y dentro de la lista de 500."""
    y, p = dev[TARGET].to_numpy(), dev[clave].to_numpy()
    deciles = pd.qcut(dev[clave].rank(method="first"), 10, labels=False)
    tabla = []
    for d, g in dev.groupby(deciles):
        tabla.append({"decil": int(d) + 1, "filas": len(g), "probabilidad_media": float(g[clave].mean()),
                      "tasa_observada": float(g[TARGET].mean())})
    ece = sum(t["filas"] * abs(t["probabilidad_media"] - t["tasa_observada"]) for t in tabla) / len(dev)
    en_lista_p = en_lista_y = 0.0
    for _, g in dev.groupby("corte"):
        w = etapa2.en_lista(g[clave], CAPACIDAD)
        en_lista_p += float((w * g[clave]).sum())
        en_lista_y += float((w * g[TARGET]).sum())
    base = float(y.mean())
    return {"brier": float(brier_score_loss(y, p)), "brier_tasa_base": float(brier_score_loss(y, np.full_like(p, base))),
            "probabilidad_media": float(p.mean()), "tasa_observada": base,
            "probabilidad_media_entrenamiento": float(tr[clave].mean()), "tasa_entrenamiento": float(tr[TARGET].mean()),
            "positivos_esperados": float(p.sum()), "positivos_observados": int(y.sum()),
            "ece_deciles": float(ece), "por_decil": tabla,
            "lista_500": {"probabilidad_media": en_lista_p / (CAPACIDAD * dev["corte"].nunique()),
                          "precision_observada": en_lista_y / (CAPACIDAD * dev["corte"].nunique())}}


# ---------------------------------------------------------------- 7.3: explicabilidad

def coeficientes(pipe: Pipeline, X: pd.DataFrame, feats: list[str], n: int = 15) -> list[dict]:
    """Los n términos de mayor |coeficiente|, con las filas de entrenamiento de cada valor; la
    misma lectura que la etapa 2 (G24)."""
    nombres = pipe.named_steps["pre"].get_feature_names_out()
    coef = pipe.named_steps["modelo"].coef_[0]
    out = []
    for i in np.argsort(-np.abs(coef))[:n]:
        bloque, termino = nombres[i].split("__", 1)
        if bloque == "cat":
            variable = next(f for f in feats if termino.startswith(f + "_"))
            valor_cat = termino[len(variable) + 1:]
            if valor_cat == "infrequent_sklearn":
                enc = pipe.named_steps["pre"].named_transformers_["cat"]
                idx = pipe.named_steps["pre"].transformers_[1][2].index(variable)
                grupo = set(enc.infrequent_categories_[idx])
                filas = int(X[variable].isin(grupo).sum())
                valor_cat = "agrupadas: " + ", ".join(sorted(grupo))
            else:
                filas = int((X[variable] == valor_cat).sum())
        elif termino.startswith("missingindicator_"):
            variable, valor_cat = termino.removeprefix("missingindicator_"), "vacío"
            filas = int(X[variable].isna().sum())
        else:
            variable, valor_cat = termino, None
            filas = int(X[variable].notna().sum())
        out.append({"termino": termino, "variable": variable, "valor": valor_cat, "coeficiente": float(coef[i]),
                    "odds_ratio": float(np.exp(coef[i])), "filas": filas,
                    "sentido": "sube el riesgo" if coef[i] > 0 else "baja el riesgo"})
    return out


def permutacion(pipe: Pipeline, dev: pd.DataFrame, feats: list[str]) -> list[dict]:
    """Importancia por permutación en validación con la métrica principal: cuántos puntos de
    precisión de la lista de 500 se pierden al desordenar cada variable (10 repeticiones, semilla
    42). También la caída de AUC-PR, que es menos gruesa."""
    rng = np.random.default_rng(SEMILLA)
    X, _, _ = etapa2.preparar(dev, feats)
    d = dev[["corte", TARGET]].copy()
    d["_p"] = pipe.predict_proba(X)[:, 1]
    base = comun.lista_por_corte(d, "_p", k=CAPACIDAD)["precision"]
    base_pr = average_precision_score(d[TARGET], d["_p"])
    out = []
    for f in feats:
        caidas, caidas_pr = [], []
        for _ in range(N_PERMUTA):
            Xp = X.copy()
            Xp[f] = Xp[f].to_numpy()[rng.permutation(len(Xp))]
            d["_q"] = pipe.predict_proba(Xp)[:, 1]
            caidas.append(100 * (base - comun.lista_por_corte(d, "_q", k=CAPACIDAD)["precision"]))
            caidas_pr.append(base_pr - average_precision_score(d[TARGET], d["_q"]))
        out.append({"variable": f, "caida_lista_500_pp": float(np.mean(caidas)),
                    "desvio_pp": float(np.std(caidas, ddof=1)), "caida_auc_pr": float(np.mean(caidas_pr))})
    return sorted(out, key=lambda r: -r["caida_lista_500_pp"])


def direccion(pipe: Pipeline, variable: str) -> dict:
    """Signo del coeficiente de una variable: para las numéricas, el del término estandarizado;
    para las categóricas, el valor con mayor |coeficiente|."""
    nombres = list(pipe.named_steps["pre"].get_feature_names_out())
    coef = pipe.named_steps["modelo"].coef_[0]
    if f"num__{variable}" in nombres:
        c = float(coef[nombres.index(f"num__{variable}")])
        return {"coeficiente": c, "valor": None, "sentido": "sube el riesgo" if c > 0 else "baja el riesgo"}
    idx = [i for i, n in enumerate(nombres) if n.startswith(f"cat__{variable}_")]
    if not idx:
        return {"coeficiente": None, "valor": None, "sentido": "no entra al modelo"}
    i = max(idx, key=lambda j: abs(coef[j]))
    c = float(coef[i])
    return {"coeficiente": c, "valor": nombres[i][len(f"cat__{variable}_"):],
            "sentido": "sube el riesgo" if c > 0 else "baja el riesgo"}


def disponibilidad(feats: list[str]) -> list[dict]:
    """Por variable: si existe al predecir (control de fugas de la etapa 1, F06) y si llega en
    producción, desde qué archivo (pendiente 69). La consolidación de Casa Óga es manual y mensual
    (envío 67) y el día del mes en que llegaría cada exportación depende del envío 47."""
    out = []
    for f in feats:
        existe, fuga, decision, motivo = comun.DECISIONES[f]
        if f in CALENDARIO:
            prod = "sí: se conoce de antemano"
        else:
            prod = (f"sí, si {ORIGEN[f]} llega con la exportación mensual antes de armar la lista; "
                    "el día del mes no está fijado (envío 47, envío 67)")
        out.append({"variable": f, "archivo": ORIGEN[f], "existe_al_predecir": existe,
                    "decision_etapa_1": decision, "motivo": motivo, "disponible_en_produccion": prod,
                    "personal": f in PERSONALES})
    return out


def contribuciones(pipe: Pipeline, X1: pd.DataFrame, n: int = 6) -> list[dict]:
    """Términos que más suben o bajan el log-odds de una fila: coeficiente × valor transformado
    (en las numéricas, desvíos estándar respecto de la media de entrenamiento)."""
    pre, lr = pipe.named_steps["pre"], pipe.named_steps["modelo"]
    z = pre.transform(X1)
    z = z.toarray()[0] if hasattr(z, "toarray") else np.asarray(z)[0]
    aporte = z * lr.coef_[0]
    nombres = pre.get_feature_names_out()
    orden = np.argsort(-np.abs(aporte))[:n]
    return [{"termino": nombres[i].split("__", 1)[1], "valor_transformado": float(z[i]),
             "aporte_log_odds": float(aporte[i])} for i in orden] + [
        {"termino": "intercepto", "valor_transformado": 1.0, "aporte_log_odds": float(lr.intercept_[0])}]


def caso_real(pipe: Pipeline, dev: pd.DataFrame, clave: str, feats: list[str]) -> dict:
    """Un verdadero positivo cerca del corte de la lista de 500 (el acierto con el puesto más alto
    dentro de la lista, de 450 a 500), con sus valores y lo que más empuja su probabilidad. Solo el
    código de cliente: nada de nombre, edad, genero ni provincia."""
    cand = []
    for c, g in dev.groupby("corte"):
        g = g.sort_values(clave, ascending=False).reset_index(drop=True)
        g["puesto"] = np.arange(1, len(g) + 1)
        regla = (-g["dias_para_cruzar"]).rank(ascending=False, method="min")
        g["puesto_regla"] = regla.astype(int)
        cand.append(g[(g["puesto"].between(450, CAPACIDAD)) & (g[TARGET] == 1)])
    cand = pd.concat(cand)
    fila = cand.sort_values(["puesto", "corte"], ascending=[False, True]).iloc[0]
    X, _, _ = etapa2.preparar(dev, feats)
    sel = (dev["id_cliente_canonico"] == fila["id_cliente_canonico"]) & (dev["corte"] == fila["corte"])
    assert sel.sum() == 1
    X1 = X[sel.to_numpy()]
    assert abs(pipe.predict_proba(X1)[0, 1] - fila[clave]) < 1e-12
    caso = {"id_cliente_canonico": fila["id_cliente_canonico"], "corte": fila["corte"].date().isoformat(),
            "puesto_en_la_lista": int(fila["puesto"]), "puesto_en_la_regla": int(fila["puesto_regla"]),
            "probabilidad": float(fila[clave]), "y_churn_90": int(fila[TARGET]),
            "valores": {k: (None if pd.isna(fila[k]) else (fila[k].item() if hasattr(fila[k], "item") else fila[k]))
                        for k in CAMPOS_CASO}}
    caso["contribuciones"] = contribuciones(pipe, X1)
    return caso


# ---------------------------------------------------------------- 7.4: errores por segmento

def wilson(x: float, n: float) -> list[float]:
    if n == 0:
        return [None, None]
    p, z = x / n, 1.96
    centro = (p + z * z / (2 * n)) / (1 + z * z / n)
    medio = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return [centro - medio, centro + medio]


def segmentos(dev: pd.DataFrame, clave: str) -> tuple[list[dict], dict]:
    """Precisión de la lista de 500 dentro de cada segmento (aciertos del segmento en la lista sobre
    los lugares que ocupa), con la de la regla al lado; dónde caen las falsas alarmas."""
    d = dev.copy()
    d["_en"] = 0.0
    d["_en_regla"] = 0.0
    for c, g in d.groupby("corte"):
        d.loc[g.index, "_en"] = etapa2.en_lista(g[clave], CAPACIDAD)
        d.loc[g.index, "_en_regla"] = etapa2.en_lista(g["regla_umbral"], CAPACIDAD)
    # Alto valor (D7): el 20 % de mayor facturación acumulada hasta el corte (`monetary`), dentro de
    # cada corte: el quintil superior del E1 (C07) llevado al corte.
    d["alto_valor"] = np.where(d.groupby("corte")["monetary"].rank(pct=True, method="first") > 0.8,
                               "20 % de mayor facturación", "resto")
    d["antiguedad"] = pd.cut(d["meses_desde_alta"], [-1, 11, 23, 1000],
                             labels=["menos de 12 meses", "12 a 23 meses", "24 meses o más"]).astype(str)
    d["formato_tienda_s"] = d["formato_tienda"].fillna("(sin tienda)")
    d["genero_s"] = d["genero"].fillna("(vacío)")
    y = d[TARGET].to_numpy()
    glob_vp = float((d["_en"] * y).sum())
    glob_l = float(d["_en"].sum())
    glob_fp = glob_l - glob_vp
    glob_regla = float((d["_en_regla"] * y).sum()) / float(d["_en_regla"].sum())
    glob = {"filas": len(d), "positivos": int(y.sum()), "en_lista": glob_l, "vp": glob_vp, "fp": glob_fp,
            "precision": glob_vp / glob_l, "precision_regla": glob_regla}
    filas = []
    for nombre, col in (("formato de tienda principal", "formato_tienda_s"), ("canal de alta", "canal_alta"),
                        ("antigüedad", "antiguedad"), ("alto valor", "alto_valor"), ("genero", "genero_s")):
        for v, g in d.groupby(col):
            yy = g[TARGET].to_numpy()
            en, vp = float(g["_en"].sum()), float((g["_en"] * yy).sum())
            en_r, vp_r = float(g["_en_regla"].sum()), float((g["_en_regla"] * yy).sum())
            prec = vp / en if en else None
            filas.append({
                "segmento": nombre, "valor": str(v), "filas": len(g), "positivos": int(yy.sum()),
                "tasa_base": float(yy.mean()), "en_lista": en, "vp": vp, "fp": en - vp,
                "precision": prec, "ic95": wilson(vp, en),
                "diferencia_pp": None if prec is None else 100 * (prec - glob["precision"]),
                "recall": vp / yy.sum() if yy.sum() else None,
                "parte_de_la_lista": en / glob_l, "parte_de_las_falsas_alarmas": (en - vp) / glob_fp,
                "precision_regla": vp_r / en_r if en_r else None,
                "diferencia_regla_pp": None if not en_r else 100 * (vp_r / en_r - glob_regla)})
    return filas, glob


# ---------------------------------------------------------------- etapa 3

def main() -> None:
    todo = comun.cargar(comun.DATASET_V02)
    assert todo.shape == (59585, 48), todo.shape
    df = comun.sin_reservadas(todo)          # desde acá, nada de test ni test_flag
    del todo
    tr = comun.entrenamiento_para_validacion(df).copy()
    dev = df[df["particion"] == "dev"].copy()
    assert set(tr["particion"]) == {"train"} and set(dev["particion"]) == {"dev"}
    assert (len(tr), len(dev)) == (14753, 7173)
    for s in (tr, dev):
        s["regla_umbral"] = -s["dias_para_cruzar"]
        s["practica_actual"] = s["recency_dias"]     # F07: más días sin comprar primero
    e2 = json.loads(ETAPA2.read_text(encoding="utf-8"))
    eco = json.loads(ECONOMIA.read_text(encoding="utf-8"))
    fallas = []

    # La porción del corte que ocupa la lista de 500 en validación (se usa en la búsqueda).
    fraccion = CAPACIDAD * dev["corte"].nunique() / len(dev)

    # Valores por celda de la 4.4 (G33) y anualización (× 4, G34).
    V = eco["celda_4_4"]["unitario_ars"]
    tc = eco["tipo_de_cambio"]["base_30_12_2025"]
    anualizar = eco["parametros"]["anualizar"]
    for k, esperado in (("vp", 99.96), ("fp", -47.21), ("fn", 0.0), ("vn", 0.0)):
        if round(V[k], 2) != esperado:
            fallas.append(f"economia.json: valor unitario {k} {V[k]} y G33 dice {esperado}")
    if (round(tc, 2), anualizar) != (1459.42, 4.0):
        fallas.append(f"economia.json: tipo de cambio {tc} o anualización {anualizar} distintos de G30 y G34")

    res = {"dataset": comun.DATASET_V02.name, "scikit_learn": sklearn.__version__, "semilla": SEMILLA,
           "capacidad": CAPACIDAD, "largos": list(LARGOS), "fraccion_busqueda": fraccion,
           "valores_celda_ars": V, "tipo_de_cambio": tc, "anualizar": anualizar}

    # ------------------------------------------------ 7.1
    folds = pliegues(tr)
    res["pliegues"] = [f["resumen"] for f in folds]
    res["regla_en_pliegues"] = regla_en_pliegues(folds, fraccion)
    busq = {
        "logistica_sin_genero": buscar("logistica", GRILLA_LOG, folds, SIN_GENERO, fraccion),
        "logistica_con_genero": buscar("logistica", GRILLA_LOG, folds, FEATURES, fraccion),
        "hgb_sin_genero": buscar("hgb", GRILLA_HGB, folds, SIN_GENERO, fraccion),
    }
    # La configuración inicial en los pliegues, para el antes y después dentro de la búsqueda.
    for nombre, (modelo, ini, feats) in {"logistica_inicial": ("logistica", INICIAL_LOG, FEATURES),
                                         "hgb_inicial": ("hgb", INICIAL_HGB, FEATURES)}.items():
        busq[nombre] = buscar(modelo, {k: [v] for k, v in ini.items()}, folds, feats, fraccion)
    res["busqueda"] = {k: {kk: (vv if kk != "todas" or k.startswith("logistica") else vv[:10])
                           for kk, vv in v.items()} for k, v in busq.items()}

    medidos, pipes = {}, {}
    plan = {
        "logistica_inicial": ("logistica", INICIAL_LOG, FEATURES),
        "hgb_inicial": ("hgb", INICIAL_HGB, FEATURES),
        "logistica_ajustada": ("logistica", busq["logistica_sin_genero"]["elegida"]["config"], SIN_GENERO),
        "logistica_ajustada_con_genero": ("logistica", busq["logistica_con_genero"]["elegida"]["config"], FEATURES),
        "hgb_ajustado": ("hgb", busq["hgb_sin_genero"]["elegida"]["config"], SIN_GENERO),
        "hgb_ajustado_con_genero": ("hgb", busq["hgb_sin_genero"]["elegida"]["config"], FEATURES),
        # Sin ninguna variable que describa a la persona (genero, edad, edad_flag, provincia).
        "logistica_ajustada_sin_personales": ("logistica", busq["logistica_sin_genero"]["elegida"]["config"],
                                              [f for f in FEATURES if f not in PERSONALES]),
    }
    for clave, (modelo, cfg, feats) in plan.items():
        pipes[clave], medidos[clave] = entrenar_y_medir(modelo, cfg, tr, dev, feats, clave, fraccion)
    regla = {"entrenamiento": etapa2.medir(tr, "regla_umbral", prob=False),
             "validacion": etapa2.medir(dev, "regla_umbral", prob=False), "config": "sin ajuste", "variables": 2}
    for conj, s in (("entrenamiento", tr), ("validacion", dev)):
        regla[conj]["lista_proporcional"] = comun.lista_por_corte(s, "regla_umbral", fraccion=fraccion)
    regla["brecha"] = brecha(regla)
    medidos["regla_umbral"] = regla

    # La configuración inicial tiene que reproducir la etapa 2 (G13, G15).
    for clave, m2 in (("logistica_inicial", "logistica"), ("hgb_inicial", "hgb")):
        a = medidos[clave]["validacion"]["lista_500"]["precision"]
        b = e2["modelos"][m2]["validacion"]["lista_500"]["precision"]
        if abs(a - b) > 1e-12:
            fallas.append(f"{clave}: lista de 500 {a} y etapa2.json dice {b}")
    if fallas:
        for f in fallas:
            print("NO REPRODUCE:", f, file=sys.stderr)
        sys.exit(1)

    res["medidos"] = {k: resumen_medida(v) for k, v in medidos.items()}

    # Comparaciones con intervalo por bootstrap de clientes.
    res["contra"] = {
        "logistica_ajustada_menos_regla": bootstrap(dev, "logistica_ajustada", "regla_umbral"),
        "logistica_ajustada_menos_inicial": bootstrap(dev, "logistica_ajustada", "logistica_inicial"),
        "hgb_ajustado_menos_logistica_ajustada": bootstrap(dev, "hgb_ajustado", "logistica_ajustada"),
        "con_genero_menos_sin_genero": bootstrap(dev, "logistica_ajustada_con_genero", "logistica_ajustada"),
        "sin_personales_menos_sin_genero": bootstrap(dev, "logistica_ajustada_sin_personales", "logistica_ajustada"),
    }
    # D11: lo que cuesta sacar genero, contra el ruido entre cortes.
    pc_sin = [x["precision"] for x in medidos["logistica_ajustada"]["validacion"]["lista_500"]["precision_por_corte"]]
    pc_con = [x["precision"] for x in medidos["logistica_ajustada_con_genero"]["validacion"]["lista_500"]["precision_por_corte"]]
    dif = 100 * (medidos["logistica_ajustada_con_genero"]["validacion"]["lista_500"]["precision"]
                 - medidos["logistica_ajustada"]["validacion"]["lista_500"]["precision"])
    res["genero"] = {
        "diferencia_con_menos_sin_pp": dif,
        "diferencia_aciertos": medidos["logistica_ajustada_con_genero"]["validacion"]["lista_500"]["aciertos"]
        - medidos["logistica_ajustada"]["validacion"]["lista_500"]["aciertos"],
        "rango_entre_cortes_sin_genero_pp": 100 * (max(pc_sin) - min(pc_sin)),
        "rango_entre_cortes_con_genero_pp": 100 * (max(pc_con) - min(pc_con)),
        "diferencia_por_corte_pp": [100 * (a - b) for a, b in zip(pc_con, pc_sin)],
        "ic95_pp": [100 * x for x in res["contra"]["con_genero_menos_sin_genero"]["ic95"]],
        "cuesta_mas_que_el_ruido": bool(dif > 100 * (max(pc_sin) - min(pc_sin))),
    }

    # El modelo que sigue: la logística ajustada sin genero, salvo que el boosting ajustado la
    # supere con un intervalo que excluya el cero (la logística se puede explicar).
    ic = res["contra"]["hgb_ajustado_menos_logistica_ajustada"]["ic95"]
    elegido = "hgb_ajustado" if ic[0] > 0 else "logistica_ajustada"
    res["elegido"] = {"modelo": elegido, "criterio": "la logística ajustada sin genero, salvo que el gradient "
                      "boosting ajustado la supere con un intervalo del 95 % que excluya el cero"}

    # ------------------------------------------------ 7.2
    filas_u = {"modelo": tabla_umbrales(dev, elegido, V, tc, anualizar, prob=True),
               "regla_umbral": tabla_umbrales(dev, "regla_umbral", V, tc, anualizar, prob=False),
               "practica_actual": tabla_umbrales(dev, "practica_actual", V, tc, anualizar, prob=False)}
    c = etapa2.confusion_umbral(dev, dev["alcanzable"])
    filas_u["regla_umbral"].append(fila_umbral("regla como clasificador (cerca del umbral)", "umbral", c["total"],
                                               [pc["avisados"] for pc in c["por_corte"]], V, tc, anualizar))
    filtradas = {"modelo": tabla_filtrada(dev, elegido, V, tc, anualizar),
                 "regla_umbral": tabla_filtrada(dev, "regla_umbral", V, tc, anualizar),
                 "practica_actual": tabla_filtrada(dev, "practica_actual", V, tc, anualizar)}
    operables = [f for f in filas_u["modelo"] if f["operable"]]
    elegida = max(operables, key=lambda f: f["valor_neto_ars"])
    elegida_f = max((f for f in filtradas["modelo"] if f["operable"]), key=lambda f: f["valor_neto_ars"])
    base500 = filas_u["modelo"][0]
    res["umbral"] = {
        "filas": filas_u, "filtradas": filtradas,
        "elegido": elegida_f["umbral"], "elegido_filtrada": elegida_f["umbral"],
        "criterio": "mayor valor neto (4.4) de la lista que Marketing puede mandar (solo quienes aceptan "
                    "marketing y no pidieron la baja, L3), sin pasar los 800 contactos por corte (C08)",
        "elegido_sin_filtro": elegida["umbral"],
        # Un lugar más de lista suma valor si su probabilidad de acierto supera −v_FP / (v_VP − v_FP).
        "precision_de_equilibrio": -V["fp"] / (V["vp"] - V["fp"]),
        "sin_filtro_elegido_contra_500_anual_usd": elegida["valor_neto_anual_usd"] - base500["valor_neto_anual_usd"],
        "contactables_en_validacion": int((dev["acepta_marketing"].astype(bool) & ~dev["pidio_baja"].astype(bool)).sum()),
        "contactables_por_corte": [int(x) for x in (dev["acepta_marketing"].astype(bool) & ~dev["pidio_baja"].astype(bool)).groupby(dev["corte"]).sum()],
        "sin_consentimiento": int((~dev["acepta_marketing"].astype(bool)).sum()),
        "con_baja": int(dev["pidio_baja"].astype(bool).sum()),
    }
    # Marginal por cada 100 lugares más de lista: precisión de los lugares agregados.
    marg = []
    for a, b in zip(filas_u["modelo"][:3], filas_u["modelo"][1:4]):
        marg.append({"de": a["umbral"], "a": b["umbral"], "lugares": b["casos_marcados"] - a["casos_marcados"],
                     "aciertos": b["vp"] - a["vp"], "precision_de_los_agregados": (b["vp"] - a["vp"]) / (b["casos_marcados"] - a["casos_marcados"]),
                     "valor_anual_usd": b["valor_neto_anual_usd"] - a["valor_neto_anual_usd"]})
    res["umbral"]["marginal"] = marg
    # Sobre la lista que se puede mandar, modelo contra regla, con el mismo bootstrap por cliente.
    ok = dev["acepta_marketing"].astype(bool) & ~dev["pidio_baja"].astype(bool)
    res["contra"]["filtrada_logistica_ajustada_menos_regla"] = bootstrap(dev[ok], elegido, "regla_umbral")
    fm = filtradas["modelo"]
    res["umbral"]["marginal_filtrada"] = [
        {"de": a["umbral"], "a": b["umbral"], "lugares": b["casos_marcados"] - a["casos_marcados"],
         "aciertos": b["vp"] - a["vp"], "precision_de_los_agregados": (b["vp"] - a["vp"]) / (b["casos_marcados"] - a["casos_marcados"]),
         "valor_anual_usd": b["valor_neto_anual_usd"] - a["valor_neto_anual_usd"]} for a, b in zip(fm[:-1], fm[1:])]
    res["calibracion"] = {k: calibracion(dev, tr, k) for k in ("logistica_ajustada", "logistica_inicial")}

    # ------------------------------------------------ 7.3
    feats_el = SIN_GENERO if "con_genero" not in elegido else FEATURES
    pipe = pipes["logistica_ajustada"]
    Xtr, _, _ = etapa2.preparar(tr, SIN_GENERO)
    res["coeficientes"] = coeficientes(pipe, Xtr, SIN_GENERO)
    perm = permutacion(pipes[elegido], dev, feats_el)
    disp = {d["variable"]: d for d in disponibilidad(FEATURES)}
    res["importancia"] = [{**p, **{"direccion": direccion(pipe, p["variable"])}, **disp[p["variable"]]} for p in perm]
    res["disponibilidad"] = list(disp.values())
    res["agrupadas_min_frecuencia"] = agrupadas(pipe, SIN_GENERO)
    res["caso_real"] = caso_real(pipe, dev, "logistica_ajustada", SIN_GENERO)

    # ------------------------------------------------ 7.4
    seg, glob = segmentos(dev, elegido)
    res["segmentos"] = {"global": glob, "filas": seg,
                        "alto_valor": "el 20 % de mayor `monetary` (facturación acumulada hasta T) de cada corte"}

    SALIDA.mkdir(exist_ok=True)
    (SALIDA / "etapa3.json").write_text(json.dumps(res, ensure_ascii=False, indent=2, default=_json),
                                        encoding="utf-8")
    escribir_segmentos(seg, glob, SALIDA / "segmentos_etapa3.csv")
    top = [p for p in perm[:12]]
    grafico.importancia(
        [{"etiqueta": p["variable"] + (" (dato personal)" if p["variable"] in PERSONALES else ""), "valor": p["caida_lista_500_pp"], "error": p["desvio_pp"],
          "de_la_regla": p["variable"] in DE_LA_REGLA} for p in top],
        SALIDA / "importancia_variables_etapa3",
        "Lo que pesa en la logística ajustada: las variables de la regla del umbral",
        "Validación, julio a septiembre de 2024 (7.173 filas). Barra: caída media de la precisión de la lista "
        f"de 500 por corte al desordenar la variable ({N_PERMUTA} repeticiones, semilla {SEMILLA}); línea: desvío. "
        "En azul, las variables que definen el umbral de la regla. Fuente: etapa3.py, dataset churn_cliente_corte_v0.2.")
    imprimir(res)


def agrupadas(pipe: Pipeline, feats: list[str]) -> dict:
    """Qué categorías quedaron agrupadas por min_frecuencia en la logística elegida."""
    pre = pipe.named_steps["pre"]
    enc = pre.named_transformers_["cat"]
    cols = pre.transformers_[1][2]
    if not hasattr(enc, "infrequent_categories_"):
        return {}
    return {c: sorted(map(str, enc.infrequent_categories_[i])) for i, c in enumerate(cols)
            if enc.infrequent_categories_[i] is not None}


def escribir_segmentos(seg: list[dict], glob: dict, ruta: Path) -> None:
    campos = ["segmento", "valor", "filas", "positivos", "tasa_base", "en_lista", "vp", "fp", "precision",
              "ic95_inf", "ic95_sup", "diferencia_pp", "recall", "parte_de_la_lista",
              "parte_de_las_falsas_alarmas", "precision_regla", "diferencia_regla_pp"]
    with ruta.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(campos)
        w.writerow(["global", "todas", glob["filas"], glob["positivos"], round(glob["positivos"] / glob["filas"], 4),
                    round(glob["en_lista"], 2), round(glob["vp"], 2), round(glob["fp"], 2), round(glob["precision"], 4),
                    "", "", 0, round(glob["vp"] / glob["positivos"], 4), 1, 1, round(glob["precision_regla"], 4), 0])
        for f in seg:
            r = []
            for c in campos:
                if c == "ic95_inf":
                    v = f["ic95"][0]
                elif c == "ic95_sup":
                    v = f["ic95"][1]
                else:
                    v = f[c]
                r.append(round(v, 4) if isinstance(v, float) else v)
            w.writerow(r)


def _json(o):
    if isinstance(o, (np.integer,)):
        return int(o)
    if isinstance(o, (np.floating,)):
        return float(o)
    if isinstance(o, (np.bool_,)):
        return bool(o)
    if isinstance(o, pd.Timestamp):
        return o.date().isoformat()
    return str(o)


def imprimir(r: dict) -> None:
    pct = lambda x: f"{100 * x:.2f} %"  # noqa: E731
    print(f"Fracción de la búsqueda: {r['fraccion_busqueda']:.4f}; regla en pliegues {pct(r['regla_en_pliegues']['media'])}")
    for k, b in r["busqueda"].items():
        print(f"{k:24s} {b['configuraciones']:4d} configs; mejor {b['mejor']['config']} {pct(b['mejor']['media'])} "
              f"(ee {100 * b['mejor']['ee']:.2f}); elegida {b['elegida']['config']} {pct(b['elegida']['media'])}")
    print(f"{'':30s} {'lista tr':>9s} {'lista val':>9s} {'prop tr':>8s} {'prop val':>8s} {'AUC tr':>7s} {'AUC val':>7s} {'AUCPR v':>7s} {'brecha pp':>9s}")
    for k, m in r["medidos"].items():
        e, v = m["entrenamiento"], m["validacion"]
        print(f"{k:30s} {pct(e['lista_500']['precision']):>9s} {pct(v['lista_500']['precision']):>9s} "
              f"{pct(e['lista_proporcional']['precision']):>8s} {pct(v['lista_proporcional']['precision']):>8s} "
              f"{e['auc_roc']:7.3f} {v['auc_roc']:7.3f} {v['auc_pr']:7.3f} {m['brecha']['lista_proporcional_pp']:9.2f}  "
              f"{[round(100 * x['precision'], 1) for x in v['lista_500_por_corte']]}")
    for k, b in r["contra"].items():
        print(f"{k:40s} IC95 [{100 * b['ic95'][0]:+.2f}; {100 * b['ic95'][1]:+.2f}] pp; a favor {b['replicas_con_a_mejor']:.1%}")
    print("genero:", {k: (round(v, 3) if isinstance(v, float) else v) for k, v in r["genero"].items()})
    print("elegido:", r["elegido"]["modelo"]); print("bordes:", [(f["umbral"], [round(x, 3) for x in f.get("probabilidad_del_ultimo_puesto", [])]) for f in r["umbral"]["filas"]["modelo"] + r["umbral"]["filtradas"]["modelo"]])
    for nombre in ("modelo", "regla_umbral", "practica_actual"):
        for f in r["umbral"]["filas"][nombre]:
            ct = f["contactables"]
            print(f"  {nombre:15s} {f['umbral']:45s} {f['casos_marcados']:7.0f} {pct(f['precision']):>8s} {pct(f['recall']):>8s} "
                  f"USD {f['valor_neto_usd']:7.2f} anual {f['valor_neto_anual_usd']:8.2f} op {f['operable']} "
                  + (f"quedan {ct['quedan']:.0f}" if ct else ""))
        for f in r["umbral"]["filtradas"][nombre]:
            print(f"  {nombre:15s} {f['umbral']:45s} {f['casos_marcados']:7.0f} {pct(f['precision']):>8s} {pct(f['recall']):>8s} "
                  f"USD {f['valor_neto_usd']:7.2f} anual {f['valor_neto_anual_usd']:8.2f}")
    print("umbral elegido:", r["umbral"]["elegido"], "| filtrada:", r["umbral"]["elegido_filtrada"],
          "| equilibrio", pct(r["umbral"]["precision_de_equilibrio"]))
    for m in r["umbral"]["marginal"] + r["umbral"]["marginal_filtrada"]:
        print("  marginal", {k: (round(v, 3) if isinstance(v, float) else v) for k, v in m.items()})
    for k, cal in r["calibracion"].items():
        print(f"calibración {k}: Brier {cal['brier']:.4f} (base {cal['brier_tasa_base']:.4f}); media {pct(cal['probabilidad_media'])} "
              f"vs {pct(cal['tasa_observada'])}; ECE {cal['ece_deciles']:.4f}; lista {pct(cal['lista_500']['probabilidad_media'])} vs {pct(cal['lista_500']['precision_observada'])}")
    print("coeficientes:")
    for c in r["coeficientes"]:
        print(f"  {c['termino']:50s} {c['coeficiente']:+.3f} {c['filas']:6d}")
    print("permutación:")
    for p in r["importancia"][:15]:
        print(f"  {p['variable']:28s} {p['caida_lista_500_pp']:6.2f} ± {p['desvio_pp']:.2f}  AUC-PR {p['caida_auc_pr']:.4f}  {p['direccion']['sentido']}")
    print("agrupadas:", r["agrupadas_min_frecuencia"])
    print("caso:", json.dumps(r["caso_real"], ensure_ascii=False, default=str))
    g = r["segmentos"]["global"]
    print(f"segmentos (global {pct(g['precision'])}, regla {pct(g['precision_regla'])}):")
    for f in r["segmentos"]["filas"]:
        print(f"  {f['segmento']:28s} {f['valor']:26s} {f['filas']:5d} lista {f['en_lista']:7.1f} prec "
              f"{pct(f['precision']) if f['precision'] is not None else '—':>8s} dif {f['diferencia_pp'] if f['diferencia_pp'] is None else round(f['diferencia_pp'], 1)} "
              f"regla {pct(f['precision_regla']) if f['precision_regla'] is not None else '—'} FA {pct(f['parte_de_las_falsas_alarmas'])}")


if __name__ == "__main__":
    main()

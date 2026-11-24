"""
Etapa 4 del modelado (Entregable 3, Parte D): evaluación en test del modelo ya elegido, con lo que
fija `preregistro.json`.

El conjunto de test se mira una sola vez, con el modelo ya elegido (clase 12, lámina 5). La A 2.2
lo reservó hasta esta etapa. Por eso el script tiene tres modos:

- Sin bandera: corre SOLO sobre validación. Entrena la logística ajustada sin genero con el
  entrenamiento con embargo, mide en los tres cortes de validación con las funciones de las etapas
  2 y 3, y compara cada cifra con `etapa3.json` (por ejemplo, en la lista de 500 contactables por
  corte, la regla 75,8 % y la logística 73,9 %). Prueba que el pipeline es el mismo de la Parte C.
  Escribe también la columna «Modelo final (validación)» de la tabla 8.1 del template de la D.
  No lee ninguna fila de test ni de test_flag: el lector filtra el CSV por partición antes de
  armar el DataFrame, y una aserción corta la corrida si pide test sin la bandera.
- `--ensayo`: el control de validación y después el camino de test completo (medición, tabla 8.1,
  matriz, comparación con la B 3.4, ficha y decisión) sobre conjuntos que no son de test: (a)
  validación pasada por el camino de test, donde la columna de test tiene que dar igual a la de
  validación, y (b) los cinco últimos cortes de entrenamiento, para probar la anualización con
  cinco cortes. Escribe `salida/etapa4_ensayo.json`. No lee test.
- `--abrir-test`: el control de validación y el ensayo. Después exige
  `_build/workforce/contratos/clase13.listo`, se niega si `test-abierto.log` ya tiene una línea,
  agrega una línea con fecha y huellas a `test-abierto.log` y recién ahí lee los cortes de test.
  Entrena con todo el entrenamiento (vuelve el embargo de mayo y junio de 2024) y mide en los
  cinco cortes de test (enero a mayo de 2025). Aplica el criterio de la C 6.2, fila 13.
  `--reintento` solo sirve si la apertura anterior quedó registrada y no llegó a escribir
  `salida/etapa4.json`; deja otra línea en el registro.

Sale con código 1 si una huella de `preregistro.json` no coincide, si el esquema del dataset
cambió, si alguna cifra de validación no reproduce `etapa3.json` o si el ensayo falla. Sale con
código 2 si la apertura del test no está permitida.

Uso:    python3 -I entregas/entregable-3/_build/D/modelado/etapa4.py
        python3 -I entregas/entregable-3/_build/D/modelado/etapa4.py --ensayo
        python3 -I entregas/entregable-3/_build/D/modelado/etapa4.py --abrir-test
Salida: salida/etapa4_validacion.json (en los tres modos); salida/etapa4_ensayo.json (--ensayo y
        --abrir-test); salida/etapa4.json y test-abierto.log (solo con --abrir-test).
"""
from __future__ import annotations

import sys

sys.dont_write_bytecode = True            # no deja __pycache__ en las carpetas de las etapas 1 a 3

import argparse  # noqa: E402
import csv  # noqa: E402
import datetime as dt  # noqa: E402
import gzip  # noqa: E402
import hashlib  # noqa: E402
import io  # noqa: E402
import json  # noqa: E402
import math  # noqa: E402
from pathlib import Path  # noqa: E402

import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402
import sklearn  # noqa: E402
from sklearn.metrics import roc_auc_score  # noqa: E402

AQUI = Path(__file__).resolve().parent
BUILD = AQUI.parents[1]                                   # entregas/entregable-3/_build
for sub in (("A", "modelado"), ("B", "modelado"), ("C", "modelado")):
    sys.path.insert(0, str(BUILD.joinpath(*sub)))
import comun  # noqa: E402
import etapa2  # noqa: E402  (solo funciones; su main no corre al importar)
import etapa3  # noqa: E402  (solo funciones; su main no corre al importar)
from comun import TARGET  # noqa: E402

PREREGISTRO = AQUI / "preregistro.json"
CONTRATO = BUILD / "workforce" / "contratos" / "clase13.listo"
LOG = AQUI / "test-abierto.log"
SALIDA = AQUI / "salida"
SALIDA_VAL = SALIDA / "etapa4_validacion.json"
SALIDA_ENSAYO = SALIDA / "etapa4_ensayo.json"
SALIDA_TEST = SALIDA / "etapa4.json"
MODELO = "logistica_ajustada"
REGLA = "regla_umbral"
PRACTICA = "practica_actual"
TOL = 1e-9
N_COEF = 15                                               # los mismos 15 de la C 7.3 (H20)
LISTA_500_C = "lista de 500 por corte, solo contactables"
LISTA_500 = "lista de 500 por corte"
# Filas de la tabla 8.1 del template de la D: (fila, campo de la lista de 500 contactables).
FILAS_8_1 = (("metrica_principal", "precision"), ("precision", "precision"), ("recall", "recall"),
             ("f1", "f1"), ("auc_roc", "auc_roc_contactables"), ("valor_neto_anual_usd", "valor_neto_anual_usd"))

# Único interruptor que habilita leer test. Solo lo prende abrir_test(), después de registrar la
# apertura en test-abierto.log.
_TEST = {"abierto": False}


# ---------------------------------------------------------------- huellas

def sha256_archivo(ruta: Path) -> str:
    return hashlib.sha256(ruta.read_bytes()).hexdigest()


def canonico(obj) -> str:
    """JSON canónico: claves ordenadas, sin espacios, UTF-8. Es el texto que se hashea."""
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def sha256_texto(texto: str) -> str:
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()


def especificacion(cfg: dict, variables: list[str]) -> dict:
    """Lo que define al candidato: constructor, hiperparámetros y variables en orden."""
    return {"constructor": "etapa3.logistica", "config": cfg, "variables": variables}


def verificar_huellas(pre: dict, e3: dict) -> list[str]:
    """Archivos de entrada, versión de scikit-learn, configuración del candidato y variables."""
    fallas = []
    for nombre, h in pre["huellas"].items():
        ruta = BUILD / h["ruta"]
        real = sha256_archivo(ruta) if ruta.exists() else "no existe"
        if real != h["sha256"]:
            fallas.append(f"huella de {nombre} ({h['ruta']}): preregistro {h['sha256']}, archivo {real}")
    if sklearn.__version__ != pre["entorno"]["scikit_learn"]:
        fallas.append(f"scikit-learn {sklearn.__version__}; el preregistro fija {pre['entorno']['scikit_learn']}")
    cand = pre["candidato"]
    cfg = e3["medidos"][MODELO]["config"]
    if cfg != e3["busqueda"]["logistica_sin_genero"]["elegida"]["config"]:
        fallas.append("etapa3.json: la configuración medida no es la elegida en la búsqueda")
    if cfg != cand["config"]:
        fallas.append(f"configuración: etapa3.json {cfg}, preregistro {cand['config']}")
    if canonico(cfg) != cand["hash_config"]["texto"] or sha256_texto(canonico(cfg)) != cand["hash_config"]["sha256"]:
        fallas.append(f"hash de la configuración: {sha256_texto(canonico(cfg))} contra {cand['hash_config']['sha256']}")
    if etapa3.SIN_GENERO != cand["variables"]:
        fallas.append("las variables de etapa3.SIN_GENERO no son las del preregistro")
    esp = sha256_texto(canonico(especificacion(cfg, etapa3.SIN_GENERO)))
    if esp != cand["hash_especificacion"]["sha256"]:
        fallas.append(f"hash de la especificación: {esp} contra {cand['hash_especificacion']['sha256']}")
    if e3["medidos"][MODELO]["variables"] != len(cand["variables"]):
        fallas.append("etapa3.json: la logística ajustada no tiene las variables del preregistro")
    return fallas


# ---------------------------------------------------------------- lectura con candado

def leer(pre: dict, particiones: set[str]) -> pd.DataFrame:
    """Las filas de las particiones pedidas, con las columnas derivadas de comun.cargar. El CSV se
    filtra por partición como texto, antes de armar el DataFrame: las demás filas no llegan a
    pandas. Pedir test sin --abrir-test corta la corrida."""
    assert "test_flag" not in particiones, "test_flag queda fuera de la etapa 4 (DC-09)"
    assert "test" not in particiones or _TEST["abierto"], \
        "se pidieron filas de test sin --abrir-test: el test se mira una sola vez"
    buf = io.StringIO()
    with gzip.open(BUILD / pre["huellas"]["dataset"]["ruta"], "rt", encoding="utf-8", newline="") as fh:
        lector = csv.reader(fh)
        cabecera = next(lector)
        i = cabecera.index("particion")
        escritor = csv.writer(buf)
        escritor.writerow(cabecera)
        for fila in lector:
            if fila[i] in particiones:
                escritor.writerow(fila)
    buf.seek(0)
    df = comun.cargar(buf)
    assert set(df["particion"]) <= particiones
    if not _TEST["abierto"]:
        assert not df["particion"].isin(comun.RESERVADAS).any(), "filas reservadas sin --abrir-test"
    esquema = [[c, str(t)] for c, t in df.dtypes.items()]
    assert esquema == pre["esquema"], "el esquema del dataset no es el del preregistro"
    return df


# ---------------------------------------------------------------- medición

def puntuar(tr: pd.DataFrame, ev: pd.DataFrame, pre: dict):
    """Ajusta la logística del preregistro con `tr` y agrega a los dos conjuntos el puntaje del
    modelo, el de la regla del umbral y el de la práctica actual (los mismos de etapa3.main).
    Devuelve el pipeline ajustado y la matriz de entrenamiento, para la ficha."""
    cfg, feats = pre["candidato"]["config"], pre["candidato"]["variables"]
    Xtr, cat, num = etapa2.preparar(tr, feats)
    Xev, _, _ = etapa2.preparar(ev, feats)
    pipe = etapa3.ajustar("logistica", cfg, Xtr, tr[TARGET], cat, num)
    for s, X in ((tr, Xtr), (ev, Xev)):
        s[MODELO] = pipe.predict_proba(X)[:, 1]
        s[REGLA] = -s["dias_para_cruzar"]
        s[PRACTICA] = s["recency_dias"]
    return pipe, Xtr


def contactables(s: pd.DataFrame) -> pd.Series:
    """Aceptan marketing y no pidieron la baja al corte (L3, C 7.2)."""
    return s["acepta_marketing"].astype(bool) & ~s["pidio_baja"].astype(bool)


def lista_contactables(sub: pd.DataFrame, puntaje: str, k: int, n_cortes: int, V: dict, tc: float,
                       anualizar: float) -> dict:
    """La lista de k por corte armada solo con contactables, con la fila de la 7.2 (etapa3.fila_umbral)
    más la precisión por corte, el F1, los aciertos por mes y el AUC-ROC del puntaje sobre todas las
    filas contactables (template D 8.1)."""
    c = etapa2.confusion_lista(sub, puntaje, k)
    f = etapa3.fila_umbral(f"lista de {k} por corte, solo contactables", "lista filtrada", c["total"],
                           [pc["largo"] for pc in c["por_corte"]], V, tc, anualizar)
    t = c["total"]
    f["f1"] = 2 * t["vp"] / (2 * t["vp"] + t["fp"] + t["fn"])
    f["aciertos_por_mes"] = t["vp"] / n_cortes
    f["precision_por_corte"] = [{"corte": pc["corte"], "largo": pc["largo"], "vp": pc["vp"],
                                 "precision": pc["vp"] / pc["largo"]} for pc in c["por_corte"]]
    f["auc_roc_contactables"] = float(roc_auc_score(sub[TARGET], sub[puntaje]))
    return f


def sin_filtro(m: dict, V: dict, tc: float, anualizar: float) -> dict:
    """Lo que se guarda de etapa2.medir: lista de 500 sin filtro (con su valor neto, la lista que usó
    la B 3.4), decil, curvas y umbral 0,5."""
    out = {"lista_500": {k: m["lista_500"][k] for k in ("largo", "aciertos", "positivos", "precision", "recall", "f1")},
           "lista_500_por_corte": m["lista_500"]["precision_por_corte"],
           "decil_superior": m["decil_superior"]["precision"],
           "auc_roc": m["auc_roc"], "auc_pr": m["auc_pr"]}
    neto = etapa3.valor(m["lista_500"]["confusion"]["total"], V)
    out["lista_500"]["valor_neto_usd"] = neto / tc
    out["lista_500"]["valor_neto_anual_usd"] = neto * anualizar / tc
    if "umbral_05" in m:
        out["umbral_05"] = {k: m["umbral_05"][k] for k in ("precision", "recall", "f1")} | {
            "avisados": m["umbral_05"]["total"]["avisados"]}
    return out


def medir(tr: pd.DataFrame, ev: pd.DataFrame, pre: dict, eco: dict) -> dict:
    """Todo lo que fija el preregistro, sobre el conjunto de evaluación `ev`."""
    k = pre["lista"]["largo_por_corte"]
    V = eco["celda_4_4"]["unitario_ars"]
    tc = eco["tipo_de_cambio"]["base_30_12_2025"]
    n_cortes = ev["corte"].nunique()
    anualizar = 12 / n_cortes                               # × 4 con 3 cortes (G34); × 2,4 con 5
    pipe, Xtr = puntuar(tr, ev, pre)
    ok = contactables(ev)
    sub = ev[ok]
    filt = {p: lista_contactables(sub, p, k, n_cortes, V, tc, anualizar) for p in (MODELO, REGLA, PRACTICA)}
    filt[MODELO]["probabilidad_del_ultimo_puesto"] = etapa3.borde(sub, MODELO, k)
    dif = etapa2.bootstrap_diferencia(sub, MODELO, REGLA)
    dif_sf = etapa2.bootstrap_diferencia(ev, MODELO, REGLA)
    seg, glob = etapa3.segmentos(ev, MODELO)
    base = float(ev[TARGET].mean())
    sf = {MODELO: sin_filtro(etapa2.medir(ev, MODELO, prob=True), V, tc, anualizar),
          REGLA: sin_filtro(etapa2.medir(ev, REGLA, prob=False), V, tc, anualizar)}
    for p in sf:
        sf[p]["lift_decil_superior"] = sf[p]["decil_superior"] / base
    crit = pre["criterio_de_decision"]["operativo"]
    para_pagar = eco[crit["aciertos_para_pagar"]["clave"]][crit["aciertos_para_pagar"]["campo"]]
    extra_mes = (filt[MODELO]["vp"] - filt[REGLA]["vp"]) / n_cortes
    lr = pipe.named_steps["modelo"]
    feats = pre["candidato"]["variables"]
    return {
        "cortes": sorted(c.date().isoformat() for c in ev["corte"].unique()),
        "filas": len(ev), "positivos": int(ev[TARGET].sum()), "tasa_base": base,
        "entrenamiento": {"filas": len(tr), "cortes": int(tr["corte"].nunique()),
                          "desde": tr["corte"].min().date().isoformat(), "hasta": tr["corte"].max().date().isoformat(),
                          "clientes": int(tr["id_cliente_canonico"].nunique()), "positivos": int(tr[TARGET].sum())},
        "anualizar": anualizar,
        "contactables": {"filas": int(ok.sum()), "positivos": int(ev.loc[ok, TARGET].sum()),
                         "por_corte": [int(x) for x in ok.groupby(ev["corte"]).sum()]},
        "modelo": {"variables": len(feats), "terminos_con_intercepto": int(lr.coef_.shape[1]) + 1,
                   "iteraciones": int(lr.n_iter_[0]), "intercepto": float(lr.intercept_[0]),
                   "coeficientes": etapa3.coeficientes(pipe, Xtr, feats, n=N_COEF),
                   "agrupadas_min_frecuencia": etapa3.agrupadas(pipe, feats)},
        "principal": {"metrica": pre["metrica_principal"]["nombre"],
                      "logistica_ajustada": filt[MODELO], "regla_umbral": filt[REGLA],
                      "diferencia_logistica_menos_regla": dif},
        "secundarias": {
            "practica_actual_contactables": filt[PRACTICA],
            "sin_filtro": sf,
            "diferencia_sin_filtro_logistica_menos_regla": dif_sf,
            "calibracion": etapa3.calibracion(ev, tr, MODELO),
            "segmentos": {"global": glob, "filas": seg},
            "meta_criterio_1": {"regla_aciertos_por_mes": filt[REGLA]["aciertos_por_mes"],
                                "meta": pre["referencias"]["meta_criterio_1_aciertos_por_mes"]},
            "alerta_fila_10": {"regla_precision_por_corte": [x["precision"] for x in filt[REGLA]["precision_por_corte"]],
                               "umbral": pre["referencias"]["alerta_fila_10_precision"]},
        },
        "criterio": {
            "ic95_limite_inferior": dif["ic95"][0],
            "condicion_1_intervalo_excluye_el_cero": bool(dif["ic95"][0] > 0),
            "aciertos_extra_por_mes": extra_mes,
            "aciertos_extra_por_mes_para_pagar": para_pagar,
            "condicion_2_paga_lo_que_agrega": bool(extra_mes >= para_pagar),
            "valor_extra_anual_usd": extra_mes * 12 * (V["vp"] - V["fp"]) / tc,
            "costo_incremental_usd": eco["costo_total_anio_1"]["incremental"],
        },
    }


def decidir(c: dict) -> str:
    if c["condicion_1_intervalo_excluye_el_cero"] and c["condicion_2_paga_lo_que_agrega"]:
        return "la logística ajustada reemplaza a la regla"
    return "la lista sigue con la regla del umbral"


# ---------------------------------------------------------------- template D: 8.1, 8.2 y 8.3

def columna_8_1(m: dict, p: str) -> dict:
    """Una columna de la tabla 8.1: las seis filas del template para el puntaje `p`."""
    f = m["principal"][p]
    return {fila: f[campo] for fila, campo in FILAS_8_1}


def matriz(m: dict, p: str = MODELO) -> dict:
    f = m["principal"][p]
    return {"vp": f["vp"], "fn": f["fn"], "fp": f["fp"], "vn": f["vn"],
            "filas": f["vp"] + f["fn"] + f["fp"] + f["vn"], "en_la_lista": f["vp"] + f["fp"],
            "positivos": f["vp"] + f["fn"]}


def tabla_8_1(val: dict, ev: dict) -> list[dict]:
    """Baseline (test) | Modelo final (validación) | Modelo final (test) | Diferencia (test − validación).
    La regla en validación y la diferencia modelo − regla en test van al lado, como referencia."""
    b, bv = columna_8_1(ev, REGLA), columna_8_1(val, REGLA)
    mv, mt = columna_8_1(val, MODELO), columna_8_1(ev, MODELO)
    return [{"fila": fila, "baseline_test": b[fila], "modelo_validacion": mv[fila], "modelo_test": mt[fila],
             "diferencia_test_menos_validacion": mt[fila] - mv[fila],
             "baseline_validacion": bv[fila], "modelo_menos_baseline_test": mt[fila] - b[fila]}
            for fila, _ in FILAS_8_1]


def roi(beneficio: float, costo: float) -> float:
    """El ROI de la B 3.4: (beneficio anual − costo del año 1) / costo × 100."""
    return (beneficio - costo) / costo * 100


def contra_roi_b_3_4(m: dict, pre: dict) -> list[dict]:
    """El valor neto anual de `m` contra el escenario base de la B 3.4, fila por fila del preregistro.
    En la lista de 500 contactables (la que sale) y en la de 500 sin filtro (la que usó la B 3.4)."""
    pr, sf = m["principal"], m["secundarias"]["sin_filtro"]
    valores = {"modelo_sobre_la_regla": (pr[MODELO]["valor_neto_anual_usd"] - pr[REGLA]["valor_neto_anual_usd"],
                                         sf[MODELO]["lista_500"]["valor_neto_anual_usd"]
                                         - sf[REGLA]["lista_500"]["valor_neto_anual_usd"]),
               "proyecto_completo": (pr[MODELO]["valor_neto_anual_usd"], sf[MODELO]["lista_500"]["valor_neto_anual_usd"]),
               "regla_sin_modelo": (pr[REGLA]["valor_neto_anual_usd"], sf[REGLA]["lista_500"]["valor_neto_anual_usd"])}
    out = []
    for f in pre["template_d"]["comparacion_8_2"]["filas"]:
        con, sin = valores[f["fila"]]
        costo = f["costo_usd"]
        out.append({"fila": f["fila"], "id": f["id"], "que": f["que"], "costo_usd": costo,
                    "b_3_4": {"beneficio_usd": f["beneficio_usd"], "roi_pct": f["roi_pct"],
                              "recupera_en_el_anio": bool(f["beneficio_usd"] >= costo)},
                    "contactables": {"beneficio_usd": con, "roi_pct": roi(con, costo),
                                     "recupera_en_el_anio": bool(con >= costo),
                                     "contra_b_3_4_usd": con - f["beneficio_usd"]},
                    "sin_filtro": {"beneficio_usd": sin, "roi_pct": roi(sin, costo),
                                   "recupera_en_el_anio": bool(sin >= costo),
                                   "contra_b_3_4_usd": sin - f["beneficio_usd"]},
                    "cambia_el_veredicto": bool((con >= costo) != (f["beneficio_usd"] >= costo)
                                                or (sin >= costo) != (f["beneficio_usd"] >= costo))})
    return out


def ficha_8_3(m: dict, pre: dict, e3: dict) -> dict:
    """Los datos de la ficha que salen del modelo y de la medición; uso previsto, usos no previstos,
    limitaciones, reentrenamiento y responsable los escribe la Parte D."""
    cand, ent = pre["candidato"], pre["particion"]["entrenamiento_final"]
    return {"nombre": cand["nombre"], "configuracion": cand["config"],
            "hash_config": cand["hash_config"]["sha256"], "preregistro_version": pre["version"],
            "scikit_learn": pre["entorno"]["scikit_learn"],
            "algoritmo": cand["descripcion"], "constructor": cand["constructor"],
            "dataset": pre["huellas"]["dataset"], "entrenamiento": m["entrenamiento"],
            "entrenamiento_regla": ent["regla"],
            "modelo": m["modelo"], "sin": cand["sin"],
            "importancia_c_7_3": [{"variable": x["variable"], "caida_lista_500_pp": x["caida_lista_500_pp"],
                                   "desvio_pp": x["desvio_pp"]} for x in e3["importancia"][:5]],
            "umbral": pre["lista"]["origen"],
            "probabilidad_del_ultimo_puesto": m["principal"][MODELO]["probabilidad_del_ultimo_puesto"],
            "desempeno": "tabla_8_1 y matriz_8_1 de este archivo"}


def armar(tr: pd.DataFrame, ev: pd.DataFrame, val: dict, pre: dict, eco: dict, e3: dict, modo: str) -> dict:
    """El camino de test, de la medición a la decisión. `val` es la medición de validación de la misma
    corrida. Lo usan --abrir-test (con test) y --ensayo (con conjuntos que no son de test)."""
    m = medir(tr, ev, pre, eco)
    return {"modo": modo,
            "preregistro_sha256": sha256_archivo(PREREGISTRO),
            "medicion": m,
            "tabla_8_1": tabla_8_1(val, m),
            "matriz_8_1": matriz(m),
            "contra_roi_b_3_4": {"evaluado": contra_roi_b_3_4(m, pre), "validacion": contra_roi_b_3_4(val, pre)},
            "ficha_8_3": ficha_8_3(m, pre, e3),
            "decision": {"criterio": pre["criterio_de_decision"]["texto_c_6_2_fila_13"],
                         "condicion_1": pre["criterio_de_decision"]["operativo"]["condicion_1"],
                         "condicion_2": pre["criterio_de_decision"]["operativo"]["condicion_2"],
                         "resultado": decidir(m["criterio"])}}


# ---------------------------------------------------------------- control contra etapa3.json

def fila_de(filas: list[dict], nombre: str) -> dict:
    return next(f for f in filas if f["umbral"] == nombre)


def iguales(esperado, obtenido) -> bool:
    if isinstance(esperado, (list, tuple)) and isinstance(obtenido, (list, tuple)):
        return len(esperado) == len(obtenido) and all(iguales(a, b) for a, b in zip(esperado, obtenido))
    if isinstance(esperado, (int, float)) and not isinstance(esperado, bool) \
            and isinstance(obtenido, (int, float)) and not isinstance(obtenido, bool):
        return abs(float(esperado) - float(obtenido)) <= TOL
    return esperado == obtenido


def controles(m: dict, e3: dict) -> list[dict]:
    """Cada cifra de validación contra la misma cifra de etapa3.json. Las 90 primeras son las de la
    versión 1.0 del preregistro; las siguientes, las que agregó F3.1 (valor sin filtro, último puesto,
    coeficientes y agrupadas)."""
    v_mod, v_reg = e3["medidos"][MODELO]["validacion"], e3["medidos"][REGLA]["validacion"]
    f3 = {p: fila_de(e3["umbral"]["filtradas"]["modelo" if p == MODELO else p], LISTA_500_C) for p in (MODELO, REGLA, PRACTICA)}
    sf = m["secundarias"]["sin_filtro"]
    pares = []
    for p, f in ((MODELO, m["principal"][MODELO]), (REGLA, m["principal"][REGLA]),
                 (PRACTICA, m["secundarias"]["practica_actual_contactables"])):
        clave = "modelo" if p == MODELO else p
        for campo in ("precision", "recall", "vp", "fp", "valor_neto_anual_usd"):
            pares.append((f"umbral.filtradas.{clave}[{LISTA_500_C}].{campo}", f3[p][campo], f[campo]))
    for clave, d in (("filtrada_logistica_ajustada_menos_regla", m["principal"]["diferencia_logistica_menos_regla"]),
                     ("logistica_ajustada_menos_regla", m["secundarias"]["diferencia_sin_filtro_logistica_menos_regla"])):
        for i, lado in enumerate(("inferior", "superior")):
            pares.append((f"contra.{clave}.ic95.{lado}", e3["contra"][clave]["ic95"][i], d["ic95"][i]))
        pares.append((f"contra.{clave}.replicas_con_a_mejor", e3["contra"][clave]["replicas_con_a_mejor"],
                       d["replicas_con_a_mejor"]))
    for p, v in ((MODELO, v_mod), (REGLA, v_reg)):
        for campo in ("precision", "recall", "aciertos", "f1"):
            pares.append((f"medidos.{p}.validacion.lista_500.{campo}", v["lista_500"][campo], sf[p]["lista_500"][campo]))
        for campo in ("decil_superior", "auc_roc", "auc_pr"):
            pares.append((f"medidos.{p}.validacion.{campo}", v[campo], sf[p][campo]))
    for campo in ("precision", "recall", "f1", "avisados"):
        pares.append((f"medidos.{MODELO}.validacion.umbral_05.{campo}", v_mod["umbral_05"][campo], sf[MODELO]["umbral_05"][campo]))
    cal3, cal = e3["calibracion"][MODELO], m["secundarias"]["calibracion"]
    for campo in ("brier", "probabilidad_media", "ece_deciles"):
        pares.append((f"calibracion.{MODELO}.{campo}", cal3[campo], cal[campo]))
    pares.append((f"calibracion.{MODELO}.lista_500.probabilidad_media", cal3["lista_500"]["probabilidad_media"],
                  cal["lista_500"]["probabilidad_media"]))
    seg3 = {(s["segmento"], s["valor"]): s for s in e3["segmentos"]["filas"]}
    for s in m["secundarias"]["segmentos"]["filas"]:
        for campo in ("en_lista", "precision", "precision_regla"):
            pares.append((f"segmentos[{s['segmento']} = {s['valor']}].{campo}",
                          seg3[(s["segmento"], s["valor"])][campo], s[campo]))
    pares.append(("umbral.contactables_por_corte", e3["umbral"]["contactables_por_corte"], m["contactables"]["por_corte"]))
    pares.append(("anualizar", e3["anualizar"], m["anualizar"]))
    # F3.1 (template D): lo nuevo que tiene par en etapa3.json.
    for p, clave in ((MODELO, "modelo"), (REGLA, REGLA)):
        pares.append((f"umbral.filas.{clave}[{LISTA_500}].valor_neto_anual_usd",
                      fila_de(e3["umbral"]["filas"][clave], LISTA_500)["valor_neto_anual_usd"],
                      sf[p]["lista_500"]["valor_neto_anual_usd"]))
    pares.append((f"umbral.filtradas.modelo[{LISTA_500_C}].probabilidad_del_ultimo_puesto",
                  f3[MODELO]["probabilidad_del_ultimo_puesto"], m["principal"][MODELO]["probabilidad_del_ultimo_puesto"]))
    pares.append((f"medidos.{MODELO}.complejidad.coeficientes", e3["medidos"][MODELO]["complejidad"]["coeficientes"],
                  m["modelo"]["terminos_con_intercepto"]))
    for i, (c3, c) in enumerate(zip(e3["coeficientes"], m["modelo"]["coeficientes"])):
        pares.append((f"coeficientes[{i}].termino", c3["termino"], c["termino"]))
        pares.append((f"coeficientes[{i}].coeficiente ({c3['termino']})", c3["coeficiente"], c["coeficiente"]))
    pares.append(("agrupadas_min_frecuencia", e3["agrupadas_min_frecuencia"], m["modelo"]["agrupadas_min_frecuencia"]))
    out = []
    for clave, esperado, obtenido in pares:
        out.append({"clave_etapa3": clave, "etapa3": esperado, "etapa4": obtenido, "reproduce": bool(iguales(esperado, obtenido))})
    return out


# ---------------------------------------------------------------- modos

def validar(pre: dict, e3: dict, eco: dict) -> tuple[dict, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Modo por defecto: entrenamiento con embargo y validación, nada más."""
    df = leer(pre, {"train", "dev"})
    tr = comun.entrenamiento_para_validacion(df).copy()
    dev = df[df["particion"] == "dev"].copy()
    train = df[df["particion"] == "train"].copy()
    del df
    p = pre["particion"]
    assert (len(tr), len(dev)) == (p["entrenamiento_para_validacion"]["filas"], p["validacion"]["filas"])
    assert sorted(c.date().isoformat() for c in dev["corte"].unique()) == p["validacion"]["cortes"]
    m = medir(tr, dev, pre, eco)
    ctrl = controles(m, e3)
    res = {"modo": "validación (sin --abrir-test): no se leyó ninguna fila de test ni de test_flag",
           "preregistro_sha256": sha256_archivo(PREREGISTRO),
           "huellas_verificadas": sorted(pre["huellas"]),
           "medicion": m,
           "columna_8_1_validacion": {MODELO: columna_8_1(m, MODELO), REGLA: columna_8_1(m, REGLA)},
           "matriz_8_1_validacion": matriz(m),
           "contra_roi_b_3_4_validacion": contra_roi_b_3_4(m, pre),
           "ensayo_del_criterio": {"aviso": "el criterio de la C 6.2, fila 13, aplicado a validación para probar el "
                                            "código; la decisión vale solo en test",
                                   "resultado": decidir(m["criterio"])},
           "control": {"cifras": len(ctrl), "reproducen": sum(c["reproduce"] for c in ctrl),
                       "tolerancia": TOL, "detalle": ctrl}}
    return res, tr, dev, train


def _finitos(obj) -> bool:
    if isinstance(obj, dict):
        return all(_finitos(v) for v in obj.values())
    if isinstance(obj, (list, tuple)):
        return all(_finitos(v) for v in obj)
    if isinstance(obj, float):
        return math.isfinite(obj)
    return True


def ensayar(val: dict, tr_val: pd.DataFrame, dev: pd.DataFrame, train: pd.DataFrame, pre: dict, eco: dict,
            e3: dict) -> dict:
    """El camino de test sin test. (a) Validación como si fuera test: cada diferencia de la tabla 8.1
    tiene que dar 0 y la decisión, la del ensayo de validación. (b) Los cinco últimos cortes de
    entrenamiento, con el embargo de 90 días antes del primero: prueba la anualización con cinco cortes."""
    m_val = val["medicion"]
    a = armar(tr_val.copy(), dev.copy(), m_val, pre, eco, e3, "ensayo (a): validación por el camino de test")
    assert all(f["diferencia_test_menos_validacion"] == 0 for f in a["tabla_8_1"]), "ensayo (a): la tabla no da 0"
    assert a["medicion"]["principal"] == m_val["principal"], "ensayo (a): la medición no repite la de validación"
    assert a["decision"]["resultado"] == val["ensayo_del_criterio"]["resultado"]
    cortes = sorted(train["corte"].unique())
    ev_c = cortes[-5:]
    ev = train[train["corte"].isin(ev_c)].copy()
    tr = train[train["corte"] + pd.Timedelta(days=comun.HORIZONTE_DIAS) < ev_c[0]].copy()
    b = armar(tr, ev, m_val, pre, eco, e3, "ensayo (b): cinco cortes de entrenamiento por el camino de test")
    mb = b["medicion"]
    assert len(mb["cortes"]) == 5 and mb["anualizar"] == 12 / 5
    mz = b["matriz_8_1"]
    largo = sum(min(pre["lista"]["largo_por_corte"], n) for n in mb["contactables"]["por_corte"])
    assert abs(mz["filas"] - mb["contactables"]["filas"]) < 1e-6 and abs(mz["en_la_lista"] - largo) < 1e-6
    assert abs(mz["positivos"] - mb["contactables"]["positivos"]) < 1e-6
    f = mb["principal"][MODELO]
    assert abs(f["valor_neto_anual_usd"] - f["valor_neto_usd"] * 12 / 5) < 1e-9
    assert len(b["tabla_8_1"]) == 6 and len(b["contra_roi_b_3_4"]["evaluado"]) == 3
    assert _finitos(b) and _finitos(a)
    json.dumps(b, default=_json)
    return {"aviso": "ensayo del camino de test con datos que no son de test; sus cifras no se citan",
            "a_validacion_como_test": {"diferencias_cero": True, "decision": a["decision"]["resultado"],
                                       "tabla_8_1": a["tabla_8_1"]},
            "b_cinco_cortes_de_entrenamiento": {"cortes": mb["cortes"], "entrenamiento": mb["entrenamiento"],
                                                "anualizar": mb["anualizar"], "tabla_8_1": b["tabla_8_1"],
                                                "matriz_8_1": b["matriz_8_1"],
                                                "contra_roi_b_3_4": b["contra_roi_b_3_4"]["evaluado"],
                                                "criterio": mb["criterio"], "decision": b["decision"]["resultado"]}}


def abrir_test(reintento: bool) -> None:
    """Contrato, registro y recién después el interruptor."""
    if not CONTRATO.exists():
        print(f"NO SE ABRE: falta {CONTRATO} (la marca de la clase 13)", file=sys.stderr)
        sys.exit(2)
    lineas = [x for x in LOG.read_text(encoding="utf-8").splitlines() if x.strip()] if LOG.exists() else []
    if lineas and not reintento:
        print(f"NO SE ABRE: el test ya se abrió ({len(lineas)} línea(s) en test-abierto.log). Se mira una sola vez.",
              file=sys.stderr)
        sys.exit(2)
    if reintento and (not lineas or SALIDA_TEST.exists()):
        print("NO SE ABRE: --reintento solo vale si hubo una apertura registrada que no escribió salida/etapa4.json",
              file=sys.stderr)
        sys.exit(2)
    ahora = dt.datetime.now().astimezone().isoformat(timespec="seconds")
    linea = "\t".join([ahora, "reintento tras una apertura sin salida" if reintento else "apertura del test",
                       f"preregistro.json sha256 {sha256_archivo(PREREGISTRO)}",
                       f"etapa4.py sha256 {sha256_archivo(Path(__file__).resolve())}",
                       f"clase13.listo sha256 {sha256_archivo(CONTRATO)}"])
    with LOG.open("a", encoding="utf-8") as fh:
        fh.write(linea + "\n")
    _TEST["abierto"] = True


def evaluar_test(val: dict, pre: dict, eco: dict, e3: dict) -> dict:
    """Con el test abierto: entrenamiento completo (vuelve el embargo) y los cortes de test."""
    assert _TEST["abierto"]
    df = leer(pre, {"train", "test"})
    tr = df[df["particion"] == "train"].copy()
    te = df[df["particion"] == "test"].copy()
    del df
    p = pre["particion"]
    assert len(tr) == p["entrenamiento_final"]["filas"] and tr["corte"].nunique() == p["entrenamiento_final"]["cortes"]
    assert len(te) == p["test"]["filas"] and int(te[TARGET].sum()) == p["test"]["positivos_publicados_a_2_2"]
    assert sorted(c.date().isoformat() for c in te["corte"].unique()) == p["test"]["cortes"]
    return armar(tr, te, val["medicion"], pre, eco, e3, "test, abierto una sola vez (ver test-abierto.log)")


def escribir(ruta: Path, obj: dict) -> None:
    SALIDA.mkdir(exist_ok=True)
    ruta.write_text(json.dumps(obj, ensure_ascii=False, indent=2, default=_json) + "\n", encoding="utf-8")


def _json(o):
    if isinstance(o, np.integer):
        return int(o)
    if isinstance(o, np.floating):
        return float(o)
    if isinstance(o, np.bool_):
        return bool(o)
    if isinstance(o, pd.Timestamp):
        return o.date().isoformat()
    return str(o)


def imprimir(r: dict, titulo: str) -> None:
    pct = lambda x: f"{100 * x:.2f} %"  # noqa: E731
    m = r["medicion"]
    pr = m["principal"]
    print(f"{titulo}: {len(m['cortes'])} cortes ({m['cortes'][0]} a {m['cortes'][-1]}), {m['filas']} filas, "
          f"{m['contactables']['filas']} contactables")
    for p in (MODELO, REGLA):
        f = pr[p]
        print(f"  {p:20s} lista de 500 contactables: precisión {pct(f['precision'])}, recall {pct(f['recall'])}, "
              f"{f['vp']:.2f} aciertos, USD {f['valor_neto_anual_usd']:.2f} por año, AUC-ROC {f['auc_roc_contactables']:.4f}")
    d = pr["diferencia_logistica_menos_regla"]
    print(f"  logística − regla: IC95 [{100 * d['ic95'][0]:+.2f}; {100 * d['ic95'][1]:+.2f}] puntos, "
          f"{d['replicas_con_a_mejor']:.1%} de las réplicas a favor del modelo")


def imprimir_8_1(r: dict) -> None:
    print("  tabla 8.1 (baseline test | modelo validación | modelo test | test − validación):")
    for f in r["tabla_8_1"]:
        print(f"    {f['fila']:22s} {f['baseline_test']:10.4f} {f['modelo_validacion']:10.4f} "
              f"{f['modelo_test']:10.4f} {f['diferencia_test_menos_validacion']:+10.4f}")
    mz = r["matriz_8_1"]
    print(f"  matriz del modelo final: VP {mz['vp']:.2f}, FN {mz['fn']:.2f}, FP {mz['fp']:.2f}, VN {mz['vn']:.2f}")


def main() -> None:
    ap = argparse.ArgumentParser(description="Etapa 4: evaluación en test con preregistro.")
    ap.add_argument("--abrir-test", action="store_true", help="abre el test (una sola vez; exige clase13.listo)")
    ap.add_argument("--reintento", action="store_true", help="con --abrir-test, solo si la apertura anterior no dejó salida")
    ap.add_argument("--ensayo", action="store_true", help="prueba el camino de test con conjuntos que no son de test")
    args = ap.parse_args()
    if args.reintento and not args.abrir_test:
        ap.error("--reintento va con --abrir-test")

    pre = json.loads(PREREGISTRO.read_text(encoding="utf-8"))
    e3 = json.loads((BUILD / pre["huellas"]["etapa3_json"]["ruta"]).read_text(encoding="utf-8"))
    eco = json.loads((BUILD / pre["huellas"]["economia_json"]["ruta"]).read_text(encoding="utf-8"))
    fallas = verificar_huellas(pre, e3)
    if fallas:
        for f in fallas:
            print("NO COINCIDE:", f, file=sys.stderr)
        sys.exit(1)

    val, tr_val, dev, train = validar(pre, e3, eco)
    escribir(SALIDA_VAL, val)
    imprimir(val, "Validación")
    malos = [c for c in val["control"]["detalle"] if not c["reproduce"]]
    print(f"  control contra etapa3.json: {val['control']['reproducen']} de {val['control']['cifras']} cifras reproducen")
    if malos:
        for c in malos:
            print("NO REPRODUCE:", c["clave_etapa3"], c["etapa3"], c["etapa4"], file=sys.stderr)
        sys.exit(1)
    if not (args.abrir_test or args.ensayo):
        print("  test sin abrir: no se leyó ninguna fila de test ni de test_flag")
        return

    try:
        ens = ensayar(val, tr_val, dev, train, pre, eco, e3)
    except AssertionError as err:
        print("EL ENSAYO FALLA, el test no se abre:", err, file=sys.stderr)
        sys.exit(1)
    escribir(SALIDA_ENSAYO, ens)
    b = ens["b_cinco_cortes_de_entrenamiento"]
    print(f"  ensayo sin test: (a) diferencias 0 en la tabla 8.1; (b) {len(b['cortes'])} cortes "
          f"({b['cortes'][0]} a {b['cortes'][-1]}), anualizar {b['anualizar']}, decisión: {b['decision']}")
    if not args.abrir_test:
        print("  test sin abrir: no se leyó ninguna fila de test ni de test_flag")
        return

    del tr_val, dev, train
    abrir_test(args.reintento)
    res = evaluar_test(val, pre, eco, e3)
    res["apertura"] = [x for x in LOG.read_text(encoding="utf-8").splitlines() if x.strip()]
    res["validacion"] = {"preregistro_sha256": val["preregistro_sha256"],
                         "control": {k: val["control"][k] for k in ("cifras", "reproducen", "tolerancia")}}
    escribir(SALIDA_TEST, res)
    imprimir(res, "Test")
    imprimir_8_1(res)
    print("  decisión:", res["decision"]["resultado"])


if __name__ == "__main__":
    main()

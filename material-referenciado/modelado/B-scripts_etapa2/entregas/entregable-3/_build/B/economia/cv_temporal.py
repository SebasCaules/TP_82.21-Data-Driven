"""
Validación cruzada temporal para el rango anual de G34 (devolución del E3, fila 2.1 a 2.3; pendiente 176 de
wiki/entregables/entregable-4.md). Filas E3A-01 a E3A-06 del registro de cifras del E4.

Origen: .workforce/presentacion-final/fase-2/mod/cv_temporal.py (memo de modelado de la fase 2), traído a la
Parte B el 17/11/2026 sin cambiar el cálculo. Cambios: rutas relativas al repositorio (corre desde el zip
B-scripts_etapa2.zip) y una función, calcular(eco), que economia.py llama con sus propios valores; así el rango
sale en economia.json sin leer un economia.json anterior.

Lee, sin modificarlos:
  - _build/A/modelado/comun.py y dataset/churn_cliente_corte_v0.2.csv.gz; _build/A/modelado/salida/etapa1.json
  - _build/B/modelado/etapa2.py (solo funciones) y salida/etapa2.json
  - _build/C/modelado/salida/etapa3.json
  - de economia.py (o, corrido solo, de salida/economia.json): valores por celda (G33), tipo de cambio (G30),
    costos del año 1 (G39, G40) y el valor anual de G34

Antes de calcular nada nuevo, reproduce (17 controles): la matriz de la regla y de la logística en la lista de
500 de validación (G19, G20 de etapa2.json), el valor anual de G34, la regla y la logística inicial en los
cuatro pliegues de la C 7.1 (etapa3.json, H01, H02) y la lista de 500 contactables de la regla (H16). Si algo
no coincide, sale con código 1.

Test, test_flag y gap no se usan (comun.sin_reservadas saca test y test_flag; gap se descarta acá:
es la separación entre validación y test y su target mira enero a marzo de 2025).

Uso:    python3 -B -I entregas/entregable-3/_build/B/economia/cv_temporal.py   (lo corre también economia.py)
Salida: salida/cv_temporal.json
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402
from sklearn.base import clone  # noqa: E402

AQUI = Path(__file__).resolve().parent
BUILD = AQUI.parent.parent                        # entregas/entregable-3/_build
sys.path.insert(0, str(BUILD / "A" / "modelado"))
sys.path.insert(0, str(BUILD / "B" / "modelado"))
import comun  # noqa: E402
import etapa2  # noqa: E402
from comun import CAPACIDAD, TARGET  # noqa: E402

SALIDA = AQUI / "salida" / "cv_temporal.json"
E2 = json.loads((BUILD / "B" / "modelado" / "salida" / "etapa2.json").read_text(encoding="utf-8"))
E3 = json.loads((BUILD / "C" / "modelado" / "salida" / "etapa3.json").read_text(encoding="utf-8"))
# Los fija calcular(eco): valores por celda (G33), tipo de cambio (G30) y costos del año 1 (G39, G40)
ECO: dict = {}
V: dict = {}
TC = COSTO_INC = COSTO_MVP = float("nan")
D90 = pd.Timedelta(days=comun.HORIZONTE_DIAS)
FALLAS: list[str] = []


def chk(nombre, a, b, tol=1e-6):
    ok = abs(a - b) <= tol
    if not ok:
        FALLAS.append(f"{nombre}: calculado {a} y publicado {b}")
    return {"control": nombre, "calculado": a, "publicado": b, "ok": ok}


def neto(vp, fp):
    return vp * V["vp"] + fp * V["fp"]


def usd(ars):
    return ars / TC


def contactable(df):
    return df["acepta_marketing"].astype(bool) & ~df["pidio_baja"].astype(bool)


def lista_k(g, puntaje, k):
    """Lista de los k de mayor puntaje del corte (k topado en las filas del corte)."""
    p = etapa2.en_lista(g[puntaje], k)
    y = g[TARGET].to_numpy()
    vp = float((p * y).sum())
    largo = float(p.sum())
    return {"largo": largo, "vp": vp, "fp": largo - vp, "precision": vp / largo}


def a500_usd(precision):
    """Valor mensual de una lista de 500 con esa precisión (valores por celda de la 4.4)."""
    return usd(neto(CAPACIDAD * precision, CAPACIDAD * (1 - precision)))


def por_corte(s, puntaje, frac_todos, frac_cont):
    out = []
    for c, g in s.groupby("corte"):
        gc = g[contactable(g)]
        l500 = lista_k(g, puntaje, CAPACIDAD)
        lp = lista_k(g, puntaje, int(round(frac_todos * len(g))))
        c500 = lista_k(gc, puntaje, CAPACIDAD)
        cp = lista_k(gc, puntaje, int(round(frac_cont * len(gc))))
        out.append({
            "corte": c.date().isoformat(), "filas": len(g), "positivos": int(g[TARGET].sum()),
            "tasa_positivos": float(g[TARGET].mean()), "contactables": len(gc),
            "lista_500": {**l500, "neto_usd": usd(neto(l500["vp"], l500["fp"]))},
            "proporcional": {**lp, "neto_500_usd": a500_usd(lp["precision"])},
            "contactables_500": {**c500, "neto_usd": usd(neto(c500["vp"], c500["fp"]))},
            "contactables_proporcional": {**cp, "neto_500_usd": a500_usd(cp["precision"])},
        })
    return out


def ventanas(valores, largo):
    return [sum(valores[i:i + largo]) for i in range(len(valores) - largo + 1)]


def rango(meses, filas, clave_val):
    """Suma de 12 meses consecutivos y trimestres × 4 sobre una serie mensual de valores USD."""
    vals = [f[clave_val] for f in filas]
    tri = [4 * x for x in ventanas(vals, 3)]
    anu = ventanas(vals, 12)
    etiquetas_tri = [f"{meses[i]}..{meses[i + 2]}" for i in range(len(meses) - 2)]
    etiquetas_anu = [f"{meses[i]}..{meses[i + 11]}" for i in range(len(meses) - 11)]
    tri_d = dict(zip(etiquetas_tri, tri))
    calendario = {k: tri_d[k] for k in ("2023-07..2023-09", "2023-10..2023-12", "2024-01..2024-03",
                                        "2024-04..2024-06", "2024-07..2024-09") if k in tri_d}
    return {
        "meses": len(vals), "desde": meses[0], "hasta": meses[-1],
        "trimestres_calendario_x4": calendario,
        "trimestre_x4": {"n": len(tri), "min": min(tri), "max": max(tri), "media": float(np.mean(tri)),
                         "min_en": etiquetas_tri[int(np.argmin(tri))], "max_en": etiquetas_tri[int(np.argmax(tri))],
                         "todos": dict(zip(etiquetas_tri, tri))},
        "doce_meses": ({"n": len(anu), "min": min(anu), "max": max(anu), "media": float(np.mean(anu)),
                        "todos": dict(zip(etiquetas_anu, anu))} if anu else None),
        "media_mensual_x12": 12 * float(np.mean(vals)),
    }


def calcular(eco: dict) -> dict:
    """Rango anual de la regla y del incremental del modelo, con los valores de `eco` (las claves de economia.json
    que usa: celda_4_4, tipo_de_cambio, costo_total_anio_1, escenarios.esperado). Escribe salida/cv_temporal.json
    y lo devuelve. Sale con código 1 si un control contra lo publicado no coincide."""
    global ECO, V, TC, COSTO_INC, COSTO_MVP
    ECO = eco
    V = eco["celda_4_4"]["unitario_ars"]
    TC = eco["tipo_de_cambio"]["base_30_12_2025"]
    COSTO_INC = eco["costo_total_anio_1"]["incremental"]   # USD 10.400 (G40)
    COSTO_MVP = eco["costo_total_anio_1"]["mvp"]           # USD 20.260 (G39: piloto mínimo más producción completa)
    FALLAS.clear()
    todo = comun.cargar(comun.DATASET_V02)
    df = comun.sin_reservadas(todo)
    df = df[df["particion"].isin(["train", "dev"])].copy()          # gap fuera
    df["regla_umbral"] = -df["dias_para_cruzar"]
    tr = comun.entrenamiento_para_validacion(df).copy()
    dev = df[df["particion"] == "dev"].copy()
    assert (len(tr), len(dev)) == (14753, 7173)
    controles = []

    # ---------------------------------------------------- controles contra lo publicado
    m_r = E2["mejor"]["matrices"]["regla_lista_500"]["total"]
    m_m = E2["mejor"]["matrices"]["mejor_lista_500"]["total"]
    c = etapa2.confusion_lista(dev, "regla_umbral")["total"]
    controles.append(chk("G20 vp regla validación", c["vp"], m_r["vp"]))
    e1 = json.loads((BUILD / "A" / "modelado" / "salida" / "etapa1.json").read_text(encoding="utf-8"))
    controles.append(chk("F09 precisión lista 500 regla (etapa1.json)", c["vp"] / c["largo"],
                         e1["lineas_base_validacion"]["regla_umbral"]["lista_capacidad"]["precision"]))
    Xtr, cat, num = etapa2.preparar(tr, etapa2.FEATURES)
    base_pipe = etapa2.modelos(cat, num)["logistica"]["pipeline"]
    pipe_g34 = clone(base_pipe).fit(Xtr, tr[TARGET])
    dev["modelo"] = pipe_g34.predict_proba(etapa2.preparar(dev, etapa2.FEATURES)[0])[:, 1]
    cm = etapa2.confusion_lista(dev, "modelo")["total"]
    controles.append(chk("G19 vp logística validación", cm["vp"], m_m["vp"]))
    controles.append(chk("G34 regla anual USD", usd(neto(c["vp"], c["fp"])) * 4, ECO["celda_4_4"]["regla_anual_usd"]))
    controles.append(chk("G34 modelo anual USD", usd(neto(cm["vp"], cm["fp"])) * 4, ECO["celda_4_4"]["modelo_anual_usd"]))
    controles.append(chk("G34 incremental anual USD", usd(neto(cm["vp"], cm["fp"]) - neto(c["vp"], c["fp"])) * 4,
                         ECO["celda_4_4"]["incremental_anual_usd"]))
    devc = dev[contactable(dev)]
    cc = etapa2.confusion_lista(devc, "regla_umbral")["total"]
    controles.append(chk("H16 aciertos lista 500 contactables regla", cc["vp"], 1137, tol=0.5))
    controles.append(chk("H14 contactables validación", float(len(devc)), 5038.0))

    # Pliegues de la C 7.1 (sobre tr con embargo, 16 cortes) y fracción de la búsqueda.
    frac = CAPACIDAD * dev["corte"].nunique() / len(dev)
    frac_c = CAPACIDAD * dev["corte"].nunique() / len(devc)
    controles.append(chk("H01 fracción de la búsqueda", frac, E3["fraccion_busqueda"]))
    cortes_tr = sorted(tr["corte"].unique())
    pliegues71 = []
    for i in range(8, 16, 2):
        bloque = cortes_tr[i:i + 2]
        ent = tr[tr["corte"] + D90 < bloque[0]]
        val = tr[tr["corte"].isin(bloque)].copy()
        pliegues71.append((bloque, ent, val))
    for j, (bloque, ent, val) in enumerate(pliegues71):
        controles.append(chk(f"H01 regla pliegue {j + 1}", comun.lista_por_corte(val, "regla_umbral", fraccion=frac)["precision"],
                             E3["regla_en_pliegues"]["por_pliegue"][j]))
        Xe, ce, ne = etapa2.preparar(ent, etapa2.FEATURES)
        p = clone(etapa2.modelos(ce, ne)["logistica"]["pipeline"]).fit(Xe, ent[TARGET])
        val["_p"] = p.predict_proba(etapa2.preparar(val, etapa2.FEATURES)[0])[:, 1]
        controles.append(chk(f"H02 logística inicial pliegue {j + 1}", comun.lista_por_corte(val, "_p", fraccion=frac)["precision"],
                             E3["busqueda"]["logistica_inicial"]["mejor"]["por_pliegue"][j]))
    if FALLAS:
        for f in FALLAS:
            print("NO REPRODUCE:", f, file=sys.stderr)
        sys.exit(1)
    assert len(controles) == 17, len(controles)

    # ---------------------------------------------------- (a) regla en cada corte de train y validación
    regla_cortes = por_corte(df, "regla_umbral", frac, frac_c)

    # ---------------------------------------------------- (c) modelo con pliegues temporales
    # Pliegues de dos cortes, los cuatro de la C 7.1 más mayo y junio de 2024 (entrena hasta
    # febrero de 2024), y validación con el ajuste de G34 (entrena hasta abril de 2024, embargo F05).
    cortes_train = sorted(df.loc[df["particion"] == "train", "corte"].unique())
    bloques = [cortes_train[i:i + 2] for i in range(8, 18, 2)]
    plan = []
    for bloque in bloques:
        ent = df[(df["particion"] == "train") & (df["corte"] + D90 < bloque[0])]
        plan.append((bloque, ent))
    filas_mod = []
    pliegues_res = []
    for bloque, ent in plan:
        Xe, ce, ne = etapa2.preparar(ent, etapa2.FEATURES)
        p = clone(etapa2.modelos(ce, ne)["logistica"]["pipeline"]).fit(Xe, ent[TARGET])
        val = df[df["corte"].isin(bloque)].copy()
        val["modelo"] = p.predict_proba(etapa2.preparar(val, etapa2.FEATURES)[0])[:, 1]
        filas_mod.append(val)
        pliegues_res.append({"evalua": [pd.Timestamp(b).date().isoformat() for b in bloque],
                             "entrena_hasta": ent["corte"].max().date().isoformat(),
                             "cortes_entrenamiento": int(ent["corte"].nunique()), "filas_entrenamiento": len(ent)})
    filas_mod.append(dev)
    pliegues_res.append({"evalua": [d.date().isoformat() for d in sorted(dev["corte"].unique())],
                         "entrena_hasta": tr["corte"].max().date().isoformat(),
                         "cortes_entrenamiento": int(tr["corte"].nunique()), "filas_entrenamiento": len(tr),
                         "nota": "el ajuste de G34 (etapa 2, embargo F05)"})
    sm = pd.concat(filas_mod)
    mod_cortes = por_corte(sm, "modelo", frac, frac_c)
    reg_sm = {f["corte"]: f for f in regla_cortes}
    inc_cortes = []
    for f in mod_cortes:
        r = reg_sm[f["corte"]]
        inc_cortes.append({
            "corte": f["corte"],
            "prec_modelo_500": f["lista_500"]["precision"], "prec_regla_500": r["lista_500"]["precision"],
            "inc_500_usd": f["lista_500"]["neto_usd"] - r["lista_500"]["neto_usd"],
            "dif_aciertos_500": f["lista_500"]["vp"] - r["lista_500"]["vp"],
            "prec_modelo_prop": f["proporcional"]["precision"], "prec_regla_prop": r["proporcional"]["precision"],
            "inc_prop_500_usd": f["proporcional"]["neto_500_usd"] - r["proporcional"]["neto_500_usd"],
            "inc_cont_500_usd": f["contactables_500"]["neto_usd"] - r["contactables_500"]["neto_usd"],
            "inc_cont_prop_500_usd": f["contactables_proporcional"]["neto_500_usd"] - r["contactables_proporcional"]["neto_500_usd"],
        })

    # ---------------------------------------------------- (b) rangos
    def serie(filas, sub, campo):
        return [{"v": f[sub][campo]} for f in filas]

    meses_all = [f["corte"][:7] for f in regla_cortes]
    i_sep = meses_all.index("2023-09")
    r13 = regla_cortes[i_sep:]
    meses13 = meses_all[i_sep:]
    rangos_regla = {}
    for nombre, sub, campo in (("lista_500_sin_filtro", "lista_500", "neto_usd"),
                               ("proporcional_a_500_sin_filtro", "proporcional", "neto_500_usd"),
                               ("lista_500_contactables", "contactables_500", "neto_usd"),
                               ("proporcional_a_500_contactables", "contactables_proporcional", "neto_500_usd")):
        rangos_regla[nombre] = {
            "sep2023_sep2024": rango(meses13, serie(r13, sub, campo), "v"),
            "ene2023_sep2024": rango(meses_all, serie(regla_cortes, sub, campo), "v"),
        }
    meses_m = [f["corte"][:7] for f in inc_cortes]
    rangos_inc = {k: rango(meses_m, [{"v": f[k]} for f in inc_cortes], "v")
                  for k in ("inc_500_usd", "inc_prop_500_usd", "inc_cont_500_usd", "inc_cont_prop_500_usd")}

    def roi(b, c):
        return (b - c) / c * 100

    roi_res = {}
    for nombre in ("lista_500_sin_filtro", "proporcional_a_500_sin_filtro"):
        rr = rangos_regla[nombre]["sep2023_sep2024"]
        vals = [rr["trimestre_x4"]["min"], rr["trimestre_x4"]["max"]] + list(rr["doce_meses"]["todos"].values())
        roi_res[f"mvp_{nombre}"] = {"beneficio_min": min(vals), "beneficio_max": max(vals),
                                    "roi_min_pct": roi(min(vals), COSTO_MVP), "roi_max_pct": roi(max(vals), COSTO_MVP),
                                    "costo_usd": COSTO_MVP, "publicado_roi_pct": ECO["escenarios"]["esperado"]["mvp_con_descuento"]["roi_pct"]}
    for nombre in ("inc_500_usd", "inc_prop_500_usd"):
        rr = rangos_inc[nombre]
        vals = [rr["trimestre_x4"]["min"], rr["trimestre_x4"]["max"]] + list(rr["doce_meses"]["todos"].values())
        roi_res[f"modelo_sobre_regla_{nombre}"] = {"beneficio_min": min(vals), "beneficio_max": max(vals),
                                                   "roi_min_pct": roi(min(vals), COSTO_INC), "roi_max_pct": roi(max(vals), COSTO_INC),
                                                   "costo_usd": COSTO_INC, "publicado_roi_pct": ECO["escenarios"]["esperado"]["proyecto"]["roi_pct"]}

    res = {
        "dataset": comun.DATASET_V02.name,
        "valores_celda_ars": V, "tipo_de_cambio": TC, "capacidad": CAPACIDAD,
        "fraccion_proporcional_sin_filtro": frac, "fraccion_proporcional_contactables": frac_c,
        "controles": controles,
        "regla_por_corte": regla_cortes,
        "pliegues_modelo": pliegues_res,
        "modelo_menos_regla_por_corte": inc_cortes,
        "rangos_regla_usd_anual": rangos_regla,
        "rangos_incremental_usd_anual": rangos_inc,
        "roi": roi_res,
        "publicado": {"G34_regla_anual_usd": ECO["celda_4_4"]["regla_anual_usd"],
                      "G34_incremental_anual_usd": ECO["celda_4_4"]["incremental_anual_usd"],
                      "G34_modelo_anual_usd": ECO["celda_4_4"]["modelo_anual_usd"],
                      "H16_regla_contactables_anual_usd": 264.54},
    }
    SALIDA.parent.mkdir(exist_ok=True)
    SALIDA.write_text(json.dumps(res, ensure_ascii=False, indent=1, default=float), encoding="utf-8")
    return res


def imprimir(res: dict) -> None:
    controles, regla_cortes, inc_cortes = res["controles"], res["regla_por_corte"], res["modelo_menos_regla_por_corte"]
    rangos_regla, rangos_inc, roi_res = res["rangos_regla_usd_anual"], res["rangos_incremental_usd_anual"], res["roi"]
    print("controles:", sum(c["ok"] for c in controles), "de", len(controles), "ok")
    print(f"{'corte':10} {'filas':>5} {'pos':>4} {'tasa':>5} {'cont':>5} | {'p500':>5} {'USD500':>6} | {'pprop':>5} {'USDp':>6} | {'pc500':>5} {'USDc':>6} | {'pcp':>5} {'USDcp':>6}")
    for f in regla_cortes:
        print(f"{f['corte']:10} {f['filas']:5d} {f['positivos']:4d} {100*f['tasa_positivos']:5.1f} {f['contactables']:5d} | "
              f"{100*f['lista_500']['precision']:5.1f} {f['lista_500']['neto_usd']:6.2f} | "
              f"{100*f['proporcional']['precision']:5.1f} {f['proporcional']['neto_500_usd']:6.2f} | "
              f"{100*f['contactables_500']['precision']:5.1f} {f['contactables_500']['neto_usd']:6.2f} | "
              f"{100*f['contactables_proporcional']['precision']:5.1f} {f['contactables_proporcional']['neto_500_usd']:6.2f}")
    for k, v in rangos_regla.items():
        for kk, r in v.items():
            d = r["doce_meses"]
            print(f"REGLA {k} {kk}: trim×4 min {r['trimestre_x4']['min']:.2f} ({r['trimestre_x4']['min_en']}) "
                  f"max {r['trimestre_x4']['max']:.2f} ({r['trimestre_x4']['max_en']}) media {r['trimestre_x4']['media']:.2f}; "
                  f"12 meses {d['min']:.2f}..{d['max']:.2f} (n {d['n']})")
    for f in inc_cortes:
        print(f"{f['corte']} modelo {100*f['prec_modelo_500']:5.1f} regla {100*f['prec_regla_500']:5.1f} dif {f['dif_aciertos_500']:+6.1f} "
              f"inc500 {f['inc_500_usd']:+6.2f} incprop {f['inc_prop_500_usd']:+6.2f} inccont {f['inc_cont_500_usd']:+6.2f} inccp {f['inc_cont_prop_500_usd']:+6.2f}")
    for k, r in rangos_inc.items():
        d = r["doce_meses"]
        print(f"INC {k}: trim×4 min {r['trimestre_x4']['min']:.2f} ({r['trimestre_x4']['min_en']}) max {r['trimestre_x4']['max']:.2f} "
              f"({r['trimestre_x4']['max_en']}) media {r['trimestre_x4']['media']:.2f}; 12 meses {d['min']:.2f}..{d['max']:.2f}")
    print(json.dumps(roi_res, indent=1))


if __name__ == "__main__":
    imprimir(calcular(json.loads((AQUI / "salida" / "economia.json").read_text(encoding="utf-8"))))

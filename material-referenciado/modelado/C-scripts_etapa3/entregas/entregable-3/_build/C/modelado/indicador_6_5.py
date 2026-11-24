"""
Indicador de la limitación principal de la Parte C (6.5): la lista no separa una caída del mercado de
una pérdida propia (devolución del E3, fila 6, OBS-37; pendiente 183 del E4).

Indicador: cruce del umbral a 90 días de la lista del mes (la regla del umbral, solo contactables) menos
el cruce de toda la base elegible del mismo corte, en puntos. Si la base entera empieza a cruzar más, la
diferencia se achica; si sube solo el cruce de la lista, no.

La lista se lleva en cada corte a la parte de los contactables que ocupa la de 500 en validación (1.500
lugares sobre 5.038 contactables, 29,8 %). Con 500 fijos el indicador sube solo porque crece la base
(48,6 en julio de 2024 y 56,0 en diciembre, con la lista pasando del 31,5 % al 26,0 % de los
contactables); con la parte fija no depende del tamaño de la base.

Valor de referencia: los cortes que no son de test con 1.000 clientes elegibles o más (octubre de 2023 a
diciembre de 2024; antes la base es chica, como en el anexo de la B 3.3). La regla no se entrena, así que
usar cortes de entrenamiento no filtra nada. Con el dataset v0.2 y la partición de las etapas 1 a 3.

La lista de 500 fija de validación se recalcula igual, como control del método: tiene que dar la
precisión de H16 (75,8 %, 1.137 aciertos).

Uso:    python3 -I entregas/entregable-3/_build/C/modelado/indicador_6_5.py
Salida: salida/indicador_6_5.json (fila H50 del registro). Sale con código 1 si algún valor no
coincide con lo publicado (esperar).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
AQUI = Path(__file__).resolve().parent
BUILD = AQUI.parents[1]
sys.path.insert(0, str(BUILD / "A" / "modelado"))
sys.path.insert(0, str(BUILD / "B" / "modelado"))
import comun  # noqa: E402
import etapa2  # noqa: E402
from comun import CAPACIDAD, TARGET  # noqa: E402

ETAPA3 = AQUI / "salida" / "etapa3.json"
SALIDA = AQUI / "salida" / "indicador_6_5.json"
MIN_BASE = 1000          # clientes elegibles por corte para entrar a la referencia
FALLAS: list[str] = []


def esperar(nombre, obtenido, esperado, tol=0.0):
    if (isinstance(esperado, float) and abs(obtenido - esperado) > tol) or \
       (not isinstance(esperado, float) and obtenido != esperado):
        FALLAS.append(f"{nombre}: obtenido {obtenido!r}, registrado {esperado!r}")


def aciertos(sub, k):
    p = etapa2.en_lista(sub["regla_umbral"], k)
    return float((p * sub[TARGET].to_numpy()).sum())


def main() -> None:
    df = comun.sin_reservadas(comun.cargar(comun.DATASET_V02))
    df["regla_umbral"] = -df["dias_para_cruzar"]
    ok = df["acepta_marketing"].astype(bool) & ~df["pidio_baja"].astype(bool)
    dev = df[df["particion"] == "dev"]
    esperar("filas de validación", len(dev), 7173)
    contactables_val = int(ok.loc[dev.index].sum())
    fraccion = len(dev.groupby("corte")) * CAPACIDAD / contactables_val

    por_corte = []
    ac500 = 0.0
    for corte, g in df.groupby("corte"):
        sub = g[ok.loc[g.index]]
        k = int(round(fraccion * len(sub)))
        a = aciertos(sub, k)
        cruce_base = float(g[TARGET].mean())
        if g["particion"].iloc[0] == "dev":
            ac500 += aciertos(sub, CAPACIDAD)
        por_corte.append({"corte": str(corte)[:10], "particion": g["particion"].iloc[0],
                          "filas_base": int(len(g)), "contactables": int(len(sub)), "lista": k,
                          "aciertos_lista": a, "cruce_lista": a / k, "cruce_base": cruce_base,
                          "diferencia_pp": (a / k - cruce_base) * 100})

    ref = [c for c in por_corte if c["filas_base"] >= MIN_BASE]
    val = [c for c in por_corte if c["particion"] == "dev"]
    dif_ref = [c["diferencia_pp"] for c in ref]
    cruce_lista_val = sum(c["aciertos_lista"] for c in val) / sum(c["lista"] for c in val)
    cruce_base_val = float(dev[TARGET].mean())
    res = {
        "que": "cruce a 90 días de la lista de la regla (solo contactables, llevada a la parte de los contactables "
               "que ocupa la de 500 en validación) menos cruce de toda la base elegible del mismo corte",
        "fraccion_de_los_contactables": fraccion,
        "contactables_validacion": contactables_val,
        "referencia": {"desde": ref[0]["corte"], "hasta": ref[-1]["corte"], "cortes": len(ref),
                       "min_filas_base": MIN_BASE,
                       "diferencia_min_pp": min(dif_ref), "diferencia_max_pp": max(dif_ref)},
        "validacion": {"cruce_lista": cruce_lista_val, "cruce_base": cruce_base_val,
                       "diferencia_pp": (cruce_lista_val - cruce_base_val) * 100},
        "control_lista_500_validacion": {"aciertos": ac500, "cruce_lista": ac500 / (CAPACIDAD * len(val))},
        "por_corte": por_corte,
    }

    # Control del método: la lista de 500 fija de validación es la de H16 (etapa3.json) y la base la de G10.
    e3 = json.loads(ETAPA3.read_text(encoding="utf-8"))
    r500 = {r["umbral"]: r for r in e3["umbral"]["filtradas"]["regla_umbral"]}["lista de 500 por corte, solo contactables"]
    esperar("lista de 500 = precisión de H16", ac500 / (CAPACIDAD * len(val)), float(r500["precision"]), 1e-12)
    esperar("aciertos de la lista de 500 (H16)", ac500, 1137.0, 1e-9)
    esperar("cruce de la base en validación (G10)", round(cruce_base_val * 100, 1), 23.9, 1e-9)
    esperar("cortes de validación", [c["corte"] for c in val], ["2024-07-31", "2024-08-31", "2024-09-30"])
    esperar("contactables de validación", contactables_val, 5038)
    # Valores que cita la C 6.5 (H50)
    esperar("parte de los contactables", round(fraccion * 100, 1), 29.8, 1e-9)
    esperar("primer corte de la referencia", ref[0]["corte"], "2023-10-31")
    esperar("último corte de la referencia", ref[-1]["corte"], "2024-12-31")
    esperar("cortes de la referencia", len(ref), 15)
    esperar("diferencia mínima de la referencia", round(min(dif_ref), 1), 51.4, 1e-9)
    esperar("diferencia máxima de la referencia", round(max(dif_ref), 1), 55.3, 1e-9)
    esperar("diferencia de validación", round(res["validacion"]["diferencia_pp"], 1), 53.2, 1e-9)

    SALIDA.write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    for c in por_corte:
        print(f"{c['corte']} {c['particion']:5s}: lista {c['lista']:4d} de {c['contactables']:5d} contactables, "
              f"cruce {c['cruce_lista']:.4f}; base {c['cruce_base']:.4f} ({c['filas_base']} filas); "
              f"diferencia {c['diferencia_pp']:.2f} puntos")
    print(f"referencia ({ref[0]['corte']} a {ref[-1]['corte']}, {len(ref)} cortes): {min(dif_ref):.2f} a "
          f"{max(dif_ref):.2f} puntos; validación {res['validacion']['diferencia_pp']:.2f}")
    if FALLAS:
        print("FALLAS:\n  " + "\n  ".join(FALLAS))
        sys.exit(1)
    print("indicador_6_5: OK ->", SALIDA.relative_to(BUILD.parents[2]))


if __name__ == "__main__":
    main()

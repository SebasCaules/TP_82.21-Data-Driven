"""
Relectura del test con la lista de 800 contactables por corte (Entregable 3, Parte D, 8.1). Lectura
fuera del preregistro: no elige nada. La decisión es la de la apertura del 27/10/2026 (J10).

Por qué existe: la devolución de la cátedra del 29/10 (fila B 2.1) pide comparar el modelo contra la
regla también en una lista de 800 por mes, el techo de la capacidad de Marketing (envío 29).
`salida/etapa4.json` guarda solo agregados de la lista de 500 y `etapa4.py --abrir-test` se niega a
correr dos veces. Este script no toca `etapa4.py` (su sha256 está en la primera línea de
`test-abierto.log`): importa sus funciones y vuelve a puntuar el test con la configuración congelada.

En este orden:
1. Las huellas de `preregistro.json` (dataset, etapas 1 a 3, etapa3.json, economia.json, scikit-learn,
   configuración y variables) y el sha256 de `etapa4.py` contra la primera línea del registro.
2. Validación con el control de `etapa4.py` (125 cifras contra etapa3.json). Si una no reproduce, corta.
3. Agrega una línea a `test-abierto.log` (fecha, motivo, que no elige nada y las huellas). Recién ahí
   lee train y test.
4. Reproduce la lista de 500 contactables de `etapa4.json` (J03, J04, J08): VP, FP, FN, VN, precisión,
   recall, F1, AUC y la precisión de cada corte, para el modelo y para la regla, con tolerancia 1e-9.
   Si algo no da igual, corta con código 1 y no escribe la salida.
5. Mide la lista de 800 en test (y en validación, para la columna «Modelo final (validación)» de la
   8.1): aciertos, precisión, recall, y los aciertos y las llamadas de más respecto de la de 500.
   Escribe `salida/relectura_800.json`.

Uso:    python3 -I entregas/entregable-3/_build/D/modelado/relectura_800.py
Salida: salida/relectura_800.json y una línea más en test-abierto.log. Una segunda corrida se niega
        (código 2) si la salida ya existe.
"""
from __future__ import annotations

import sys

sys.dont_write_bytecode = True

import datetime as dt  # noqa: E402
import json  # noqa: E402
from pathlib import Path  # noqa: E402

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
import etapa4 as E  # noqa: E402  (solo funciones; su main no corre al importar)
from etapa4 import MODELO, REGLA, TARGET  # noqa: E402

SALIDA = E.SALIDA / "relectura_800.json"
K_NUEVO = 800
MOTIVO = ("relectura del test, lista de 800 contactables por corte (devolución de la cátedra del 29/10, "
          "fila B 2.1); fuera del preregistro, no elige nada: la decisión es la de la apertura del 27/10")
CAMPOS = ("vp", "fp", "fn", "vn", "precision", "recall", "f1", "auc_roc_contactables")


def iguales_500(nuevo: dict, viejo: dict) -> list[str]:
    fallas = [f"{c}: {viejo[c]} contra {nuevo[c]}" for c in CAMPOS if abs(viejo[c] - nuevo[c]) > E.TOL]
    pv, pn = viejo["precision_por_corte"], nuevo["precision_por_corte"]
    if [x["corte"] for x in pv] != [x["corte"] for x in pn] or any(
            abs(a["vp"] - b["vp"]) > E.TOL for a, b in zip(pv, pn)):
        fallas.append(f"precisión por corte: {pv} contra {pn}")
    return fallas


def lista(sub, p: str, k: int, n_cortes: int, V: dict, tc: float, anualizar: float) -> dict:
    f = E.lista_contactables(sub, p, k, n_cortes, V, tc, anualizar)
    return {c: f[c] for c in CAMPOS + ("aciertos_por_mes",)} | {
        "lugares": f["vp"] + f["fp"], "precision_por_corte": f["precision_por_corte"]}


def medir_800(sub, n_cortes: int, eco: dict, anualizar: float) -> dict:
    """Lista de 500 y de 800 para el modelo y la regla, y lo que agrega pasar de 500 a 800."""
    V, tc = eco["celda_4_4"]["unitario_ars"], eco["tipo_de_cambio"]["base_30_12_2025"]
    out = {}
    for p in (MODELO, REGLA):
        l5, l8 = (lista(sub, p, k, n_cortes, V, tc, anualizar) for k in (500, K_NUEVO))
        out[p] = {"lista_500": l5, "lista_800": l8,
                  "de_500_a_800": {"lugares_de_mas": l8["lugares"] - l5["lugares"],
                                   "aciertos_de_mas": l8["vp"] - l5["vp"],
                                   "llamadas_de_mas": l8["fp"] - l5["fp"]}}
    out["modelo_menos_regla_800"] = {
        "aciertos": out[MODELO]["lista_800"]["vp"] - out[REGLA]["lista_800"]["vp"],
        "precision_pp": 100 * (out[MODELO]["lista_800"]["precision"] - out[REGLA]["lista_800"]["precision"])}
    pos = sub.groupby("corte")[TARGET].sum()
    largos = sub.groupby("corte").size().clip(upper=K_NUEVO)
    out["techo_800"] = {"positivos_contactables": int(pos.sum()), "positivos_por_corte": [int(x) for x in pos],
                        "positivos_por_corte_promedio": float(pos.mean()),
                        "lugares": int(largos.sum()),
                        "precision_maxima": float(sum(min(a, b) for a, b in zip(pos, largos)) / largos.sum())}
    return out


def main() -> None:
    pre = json.loads(E.PREREGISTRO.read_text(encoding="utf-8"))
    e3 = json.loads((E.BUILD / pre["huellas"]["etapa3_json"]["ruta"]).read_text(encoding="utf-8"))
    eco = json.loads((E.BUILD / pre["huellas"]["economia_json"]["ruta"]).read_text(encoding="utf-8"))
    e4 = json.loads(E.SALIDA_TEST.read_text(encoding="utf-8"))
    if SALIDA.exists():
        print(f"NO SE RELEE: {SALIDA.name} ya existe. La relectura se hace una vez.", file=sys.stderr)
        sys.exit(2)

    # 1. huellas
    fallas = E.verificar_huellas(pre, e3)
    lineas = [x for x in E.LOG.read_text(encoding="utf-8").splitlines() if x.strip()]
    sha_e4 = E.sha256_archivo(AQUI / "etapa4.py")
    if f"etapa4.py sha256 {sha_e4}" not in lineas[0]:
        fallas.append(f"etapa4.py cambió desde la apertura del 27/10 (sha256 {sha_e4})")
    if f"preregistro.json sha256 {E.sha256_archivo(E.PREREGISTRO)}" not in lineas[0]:
        fallas.append("preregistro.json cambió desde la apertura del 27/10")
    if fallas:
        for f in fallas:
            print("NO COINCIDE:", f, file=sys.stderr)
        sys.exit(1)

    # 2. validación, con el control de etapa4.py
    val, _tr_val, dev, _train = E.validar(pre, e3, eco)
    if val["control"]["reproducen"] != val["control"]["cifras"]:
        print("NO REPRODUCE la validación de etapa4.py", file=sys.stderr)
        sys.exit(1)
    ok_v = E.contactables(dev)
    m_val = medir_800(dev[ok_v], dev["corte"].nunique(), eco, val["medicion"]["anualizar"])
    # el mismo control que se le pide al test, primero en validación (prueba el código antes de abrir)
    fallas = [f"{q}: {x}" for q in (MODELO, REGLA)
              for x in iguales_500(m_val[q]["lista_500"], val["medicion"]["principal"][q])]
    if fallas:
        for f in fallas:
            print("NO REPRODUCE la lista de 500 de validación:", f, file=sys.stderr)
        sys.exit(1)

    # 3. registro y recién después el test
    ahora = dt.datetime.now().astimezone().isoformat(timespec="seconds")
    linea = "\t".join([ahora, MOTIVO,
                       f"preregistro.json sha256 {E.sha256_archivo(E.PREREGISTRO)}",
                       f"etapa4.py sha256 {sha_e4}",
                       f"relectura_800.py sha256 {E.sha256_archivo(Path(__file__).resolve())}"])
    with E.LOG.open("a", encoding="utf-8") as fh:
        fh.write(linea + "\n")
    E._TEST["abierto"] = True
    df = E.leer(pre, {"train", "test"})
    tr = df[df["particion"] == "train"].copy()
    te = df[df["particion"] == "test"].copy()
    del df
    p = pre["particion"]
    assert len(tr) == p["entrenamiento_final"]["filas"] and tr["corte"].nunique() == p["entrenamiento_final"]["cortes"]
    assert len(te) == p["test"]["filas"] and int(te[TARGET].sum()) == p["test"]["positivos_publicados_a_2_2"]
    E.puntuar(tr, te, pre)
    ok = E.contactables(te)
    sub = te[ok]
    n_cortes = te["corte"].nunique()
    anualizar = 12 / n_cortes

    # 4. la lista de 500 tiene que dar lo mismo que el 27/10
    m_test = medir_800(sub, n_cortes, eco, anualizar)
    fallas = []
    for q in (MODELO, REGLA):
        fallas += [f"{q}: {x}" for x in iguales_500(m_test[q]["lista_500"], e4["medicion"]["principal"][q])]
    if int(ok.sum()) != e4["medicion"]["contactables"]["filas"]:
        fallas.append("contactables de test distintos de etapa4.json")
    if fallas:
        for f in fallas:
            print("NO REPRODUCE la lista de 500 de etapa4.json:", f, file=sys.stderr)
        print("Se para: no se escribe la lista de 800.", file=sys.stderr)
        sys.exit(1)

    # 5. salida
    res = {"aviso": "lectura fuera del preregistro (devolución de la cátedra del 29/10); no elige nada: la "
                    "decisión es la de la apertura del 27/10/2026 (etapa4.json, decision)",
           "registro": linea,
           "reproduce_lista_500": {"campos": list(CAMPOS) + ["precision_por_corte"], "tolerancia": E.TOL,
                                   "resultado": "igual a etapa4.json para el modelo y la regla"},
           "test": m_test, "validacion": m_val,
           "decision_27_10": e4["decision"]["resultado"]}
    E.escribir(SALIDA, res)
    pct = lambda x: f"{100 * x:.2f} %"  # noqa: E731
    for nombre, m in (("Test", m_test), ("Validación", m_val)):
        print(f"{nombre}: techo de la lista de 800 {pct(m['techo_800']['precision_maxima'])} "
              f"({m['techo_800']['positivos_por_corte_promedio']:.1f} positivos contactables por corte)")
        for q in (MODELO, REGLA):
            l8, d = m[q]["lista_800"], m[q]["de_500_a_800"]
            print(f"  {q:20s} 800: {l8['vp']:.2f} aciertos, precisión {pct(l8['precision'])}, recall "
                  f"{pct(l8['recall'])}; contra 500: +{d['aciertos_de_mas']:.2f} aciertos, "
                  f"+{d['llamadas_de_mas']:.2f} llamadas de más")
    print("  la lista de 500 reproduce etapa4.json; decisión del 27/10:", res["decision_27_10"])


if __name__ == "__main__":
    main()

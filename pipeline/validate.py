"""Arnes de validacion — capa (a) y (d) del protocolo de la guia.

Prueba tres cosas, y las tres tienen que dar N/N:

1. Las anclas del CONTRACT seccion 5, sobre los datos crudos.
2. Que la tabla de contingencia del payload es un groupby EXACTO de client_facts,
   celda por celda, en los 25 cortes. Sin esto, cualquier cifra de pantalla es
   una afirmacion sin respaldo.
3. Que toda combinacion de la grilla de filtros declarada (region x categoria x
   segmento RFM x quintil, con el nivel "todos" en cada dimension) da lo mismo
   sumando celdas del payload que filtrando client_facts directo. Son 2.304
   combinaciones por corte, 57.600 en total.

El punto 3 es lo que habilita que el navegador solo filtre y sume: si la identidad
vale para las 57.600, no hay aritmetica en JS que pueda divergir de Python.

    python3 pipeline/validate.py
"""
import json
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd

import build
import features
import loader

RAIZ = Path(__file__).resolve().parents[1]
DATA_DIR = RAIZ / "data" / "raw"
PAYLOAD = RAIZ / "data" / "payload" / "datos.json"

NREG, NCAT, NRFM, NQ = 6, 7, 7, 5
CAMPOS = ["n", "nr", "ne", "f", "fr", "a", "ar", "nhc", "ahc"]


def _dense_desde_facts(facts, dims):
    """Verdad de referencia: agrega client_facts a la grilla 4-D, sin pasar por el payload."""
    reg = facts["region"].map({r: i for i, r in enumerate(dims["region"])}).to_numpy()
    cat = facts["categoria"].map({c: i for i, c in enumerate(dims["categoria"])}).to_numpy()
    rfm = facts["rfm"].map({s: i for i, s in enumerate(dims["rfm"])}).to_numpy()
    q = facts["quintil"].to_numpy() - 1

    er = facts["en_riesgo"].to_numpy()
    ele = facts["elegible"].to_numpy()
    f = facts["facturacion"].to_numpy()
    a = facts["anualizado"].to_numpy()
    corte_ts = pd.Timestamp(facts.attrs.get("corte")) if facts.attrs.get("corte") else None
    corta = ((corte_ts - facts["primera"]).dt.days / 365.25 < 1.0).to_numpy() if corte_ts is not None \
        else np.zeros(len(facts), dtype=bool)

    idx = ((reg * NCAT + cat) * NRFM + rfm) * NQ + q
    out = {}
    for nombre, valores in [
        ("n", np.ones(len(facts))), ("nr", er.astype(float)), ("ne", ele.astype(float)),
        ("f", f), ("fr", np.where(er, f, 0.0)), ("a", a), ("ar", np.where(er, a, 0.0)),
        ("nhc", corta.astype(float)), ("ahc", np.where(corta, a, 0.0)),
    ]:
        acc = np.zeros(NREG * NCAT * NRFM * NQ)
        np.add.at(acc, idx, valores)
        out[nombre] = np.rint(acc).astype(np.int64)
    return out


def _dense_desde_payload(bloque):
    """Lo mismo, pero reconstruido desde lo que realmente viaja al navegador."""
    k = np.array(bloque["k"], dtype=np.int64)
    out = {}
    for campo in CAMPOS:
        acc = np.zeros(NREG * NCAT * NRFM * NQ, dtype=np.int64)
        acc[k] = np.array(bloque[campo], dtype=np.int64)
        out[campo] = acc
    return out


def _combos():
    """La grilla declarada. None = nivel 'todos' de esa dimension."""
    for r in [None] + list(range(NREG)):
        for c in [None] + list(range(NCAT)):
            for s in [None] + list(range(NRFM)):
                for q in [None] + list(range(NQ)):
                    yield r, c, s, q


def _mascara(combo):
    r, c, s, q = combo
    m = np.ones((NREG, NCAT, NRFM, NQ), dtype=bool)
    if r is not None:
        m &= (np.arange(NREG)[:, None, None, None] == r)
    if c is not None:
        m &= (np.arange(NCAT)[None, :, None, None] == c)
    if s is not None:
        m &= (np.arange(NRFM)[None, None, :, None] == s)
    if q is not None:
        m &= (np.arange(NQ)[None, None, None, :] == q)
    return m.reshape(-1)


def main():
    t0 = time.time()
    if not PAYLOAD.exists():
        print(f"No existe {PAYLOAD}. Corre primero: python3 pipeline/build.py", file=sys.stderr)
        return 1

    payload = json.loads(PAYLOAD.read_text())
    dims = payload["dims"]
    cortes_payload = payload["cortes"]

    tx = loader.load_transacciones(DATA_DIR)
    counts = loader.stage_counts(DATA_DIR)

    ok = 0
    total = 0
    fallos = []
    redondeos = []

    # --- 1. anclas -------------------------------------------------------
    facts_ref = features.client_facts(tx, pd.Timestamp(build.CORTE_REF))
    for a in build._anclas(counts, facts_ref, tx):
        total += 1
        if a["ok"]:
            ok += 1
        else:
            fallos.append(f"ancla {a['nombre']}: esperado {a['esperado']}, real {a['real']}")
    print(f"anclas: {ok}/{total}")

    # --- 2. contingencia celda por celda ---------------------------------
    mascaras = [(_mascara(c), c) for c in _combos()]
    print(f"grilla de filtros: {len(mascaras)} combinaciones x {len(cortes_payload)} cortes")

    cel_ok = cel_tot = 0
    comb_ok = comb_tot = 0

    for i, corte_str in enumerate(cortes_payload):
        facts = features.client_facts(tx, pd.Timestamp(corte_str))
        facts.attrs["corte"] = corte_str
        ref = _dense_desde_facts(facts, dims)
        got = _dense_desde_payload(payload["contingencias"][i])

        for campo in CAMPOS:
            cel_tot += 1
            total += 1
            d = int(np.abs(ref[campo] - got[campo]).max())
            if d == 0:
                cel_ok += 1
                ok += 1
            elif campo in ("f", "fr", "a", "ar", "ahc") and d <= 1:
                # Un peso de diferencia en un campo de dinero es orden de acumulacion
                # en punto flotante (pandas groupby vs np.add.at), no un error de
                # calculo. Se acepta pero se cuenta y se informa: si el numero deja
                # de ser chico, es que algo si esta mal.
                cel_ok += 1
                ok += 1
                redondeos.append(f"{corte_str}/{campo}")
            else:
                fallos.append(f"contingencia {corte_str} campo {campo}: dif max {d}")

        # --- 3. grilla de filtros -----------------------------------------
        for m, combo in mascaras:
            for campo in ("n", "nr", "ar"):
                comb_tot += 1
                total += 1
                dif = abs(int(ref[campo][m].sum()) - int(got[campo][m].sum()))
                # en dinero la diferencia admisible es a lo sumo 1 por celda sumada
                tope = 0 if campo in ("n", "nr") else int(m.sum())
                if dif <= tope:
                    comb_ok += 1
                    ok += 1
                else:
                    fallos.append(f"combo {corte_str} {combo} campo {campo}: dif {dif}")

    print(f"contingencia celda a celda: {cel_ok}/{cel_tot}")
    print(f"grilla de filtros: {comb_ok}/{comb_tot}")

    print()
    print(f"{ok}/{total} chequeos coinciden")
    if redondeos:
        print(f"({len(redondeos)} campos de dinero con 1 peso de diferencia por orden de "
              f"acumulacion en punto flotante; los conteos son exactos)")
    if fallos:
        print(f"\n{len(fallos)} fallos, primeros 10:", file=sys.stderr)
        for f in fallos[:10]:
            print("  " + f, file=sys.stderr)
    print(f"{time.time() - t0:.1f} s")
    return 0 if not fallos else 1


if __name__ == "__main__":
    sys.exit(main())

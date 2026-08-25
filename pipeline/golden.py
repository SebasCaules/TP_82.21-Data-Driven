"""Genera los golden files para el test de paridad Python/JS.

La verdad de referencia sale de `client_facts`, no del payload: si saliera del
payload, el test compararia el payload contra si mismo. Asi la cadena queda cerrada:

    validate.py  ->  payload == client_facts
    paridad.mjs  ->  agregacion.js(payload) == client_facts

    python3 pipeline/golden.py
    node test/paridad.mjs
"""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

import features
import loader

RAIZ = Path(__file__).resolve().parents[1]
DATA_DIR = RAIZ / "data" / "raw"
OUT = RAIZ / "test" / "golden.json"

DIMS = {
    "region": features.REGIONES,
    "categoria": features.CATEGORIAS,
    "rfm": features.RFM_SEGMENTOS,
    "quintil": [1, 2, 3, 4, 5],
}
CAMPOS = ["n", "nr", "ne", "f", "fr", "a", "ar"]


def main():
    tx = loader.load_transacciones(DATA_DIR)
    cortes = loader.cortes()

    n_reg = len(DIMS["region"])
    combos = [
        (r, c, s, q)
        for r in [None] + list(range(n_reg))
        for c in [None] + list(range(7))
        for s in [None] + list(range(7))
        for q in [None] + list(range(5))
    ]

    idx_region = {v: i for i, v in enumerate(DIMS["region"])}
    idx_cat = {v: i for i, v in enumerate(DIMS["categoria"])}
    idx_rfm = {v: i for i, v in enumerate(DIMS["rfm"])}

    salida = {"combos": [list(c) for c in combos], "campos": CAMPOS, "cortes": [], "por_corte": []}

    for corte in cortes:
        f = features.client_facts(tx, corte)
        reg = f["region"].map(idx_region).to_numpy()
        cat = f["categoria"].map(idx_cat).to_numpy()
        rfm = f["rfm"].map(idx_rfm).to_numpy()
        q = f["quintil"].to_numpy() - 1
        er = f["en_riesgo"].to_numpy()
        ele = f["elegible"].to_numpy()
        fact = f["facturacion"].to_numpy()
        anu = f["anualizado"].to_numpy()

        # Se agrega primero a la grilla densa y se redondea igual que contingency():
        # una sola vez, al final. Redondear por cliente daria otro total.
        dense = {}
        idx = ((reg * 7 + cat) * 7 + rfm) * 5 + q
        for nombre, val in [
            ("n", np.ones(len(f))), ("nr", er.astype(float)), ("ne", ele.astype(float)),
            ("f", fact), ("fr", np.where(er, fact, 0.0)),
            ("a", anu), ("ar", np.where(er, anu, 0.0)),
        ]:
            acc = np.zeros(n_reg * 7 * 7 * 5)
            np.add.at(acc, idx, val)
            dense[nombre] = np.rint(acc).astype(np.int64).reshape(n_reg, 7, 7, 5)

        filas = []
        for r, c, s, qq in combos:
            sl = (
                slice(None) if r is None else r,
                slice(None) if c is None else c,
                slice(None) if s is None else s,
                slice(None) if qq is None else qq,
            )
            filas.append([int(dense[campo][sl].sum()) for campo in CAMPOS])

        salida["cortes"].append(corte.strftime("%Y-%m-%d"))
        salida["por_corte"].append(filas)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(salida, separators=(",", ":")))
    print(f"golden: {len(combos)} combinaciones x {len(cortes)} cortes "
          f"= {len(combos) * len(cortes)} filas · {OUT.stat().st_size / 1024 / 1024:.1f} MB")
    return 0


if __name__ == "__main__":
    sys.exit(main())

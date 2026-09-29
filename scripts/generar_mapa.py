"""Genera e2/src/mapa.js: el mapa de calidad antes y después (13 archivos × 7 dimensiones).

Antes: la tabla 3.1 de la Parte A (entregas/entregable-2/A-Casa_Oga_Entregable_2_Parte_A.docx,
matriz 13 × 7 con el símbolo y el hallazgo de cada celda). Después: MAPA_DESPUES de
entregas/entregable-2/_build/B/contenido_b.py (Parte B 1.1). El tablero y la Parte B leen el
mismo mapa: se cambia MAPA_DESPUES y se corre este script.

    python3 scripts/generar_mapa.py
"""
from __future__ import annotations

import datetime as dt
import importlib.util
import json
import sys
from pathlib import Path

import docx

APP = Path(__file__).resolve().parents[1]
VAULT = APP.parent
PARTE_A = VAULT / "entregas" / "entregable-2" / "A-Casa_Oga_Entregable_2_Parte_A.docx"
CONTENIDO_B = VAULT / "entregas" / "entregable-2" / "_build" / "B" / "contenido_b.py"
SALIDA = APP / "e2" / "src" / "mapa.js"


def _contenido_b():
    spec = importlib.util.spec_from_file_location("contenido_b", CONTENIDO_B)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _matriz_antes() -> dict[str, list[tuple[str, str]]]:
    doc = docx.Document(str(PARTE_A))
    tabla = next(t for t in doc.tables if t.rows[0].cells[0].text.strip() == "Fuente de datos")
    salida = {}
    for fila in tabla.rows[1:]:
        celdas = fila.cells
        archivo = celdas[0].text.split("\n")[0].strip()
        salida[archivo] = []
        for c in celdas[1:]:
            txt = c.text.strip()
            simbolo, hallazgo = txt[0], txt[1:].strip()
            salida[archivo].append((simbolo, hallazgo))
    return salida


def main() -> int:
    cb = _contenido_b()
    antes = _matriz_antes()
    if list(antes) != list(cb.MAPA_DESPUES):
        print("los archivos de la Parte A y de MAPA_DESPUES no coinciden", file=sys.stderr)
        return 1
    mapa = []
    for archivo, celdas in antes.items():
        despues = cb.MAPA_DESPUES[archivo]
        fila = []
        for dim, (simbolo, hallazgo) in zip(cb.DIMS, celdas):
            estado, ref = despues.get(dim, (None, None))
            if (simbolo == "✓") != (estado is None):
                print(f"{archivo} · {dim}: símbolo {simbolo} y estado {estado} no coinciden", file=sys.stderr)
                return 1
            fila.append({"antes": simbolo, "hallazgo": hallazgo, "despues": estado, "ref": ref})
        mapa.append({"archivo": archivo.removesuffix(".csv"), "celdas": fila})
    hoy = dt.date.today().strftime("%d/%m")
    js = (
        "// Mapa de calidad antes y después de las decisiones (13 archivos × 7 dimensiones).\n"
        "// Antes: tabla 3.1 de la Parte A (entregas/entregable-2/A-…Parte_A.docx). Después: MAPA_DESPUES de\n"
        f"// entregas/entregable-2/_build/B/contenido_b.py (Parte B 1.1). Generado el {hoy} por\n"
        "// scripts/generar_mapa.py; no se edita a mano.\n"
        f"export const DIMS = {json.dumps(cb.DIMS, ensure_ascii=False)}\n"
        f"export const MAPA = {json.dumps(mapa, ensure_ascii=False, indent=1)}\n"
    )
    SALIDA.write_text(js, encoding="utf-8")
    print(f"escrito: {SALIDA}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

"""Lo que /final/ no puede tocar del resto del sitio (17/11; 19/11, contrato de las fases 8 a 11 de la auditoría de dataviz).

    python3 -I scripts/paridad_final.py

Hasta el 18/11 este script medía la letra y las cajas de /final/ contra /e2/ (y, desde la decisión P-01, contra la escala
del intermedio). Ese contrato se abandonó: el tablero tiene su propia escala u (final/src/escala.js) y la comprueba
scripts/verificar_final.py (letra de 20 u para arriba, relleno del lienzo, texto pisado o cortado). Queda lo que sigue
siendo cierto, sin navegador y sin armar nada:

1. src/**, e2/** y e3/** no difieren de main («git diff --stat main -- src e2 e3» vacío; git de solo lectura): /e2/ y
   /e3/ quedan como se presentaron.
2. Toda regla CSS de /final/ (final/src/*.css y final/src/vistas/*.css) que nombra una clase del armazón compartido
   (.app, .cuerpo, .lat*, .e2-*, .tarjeta, .kpi-*, .par-*, .dec-*, .lienzo*, …; la lista es ARMAZON de
   scripts/paridad_e3.py) va bajo .e3-vp, y ninguna nombra :root, html ni body: las hojas del E1, el E2 y el E3 se cargan
   en la misma página y /final/ no las pisa fuera de su caja.
3. Ninguna regla de /final/ usa !important fuera de @media print.

Termina con «RESULTADO: OK» o con la lista de diferencias, «RESULTADO: FALLA» y código 1.
"""
from __future__ import annotations

import importlib.util
import re
import subprocess
import sys
from pathlib import Path

APP = Path(__file__).resolve().parents[1]
SRC = APP / "final" / "src"

# Las expresiones del armazón, de scripts/paridad_e3.py (cargado por su ruta: con «python3 -I» la carpeta del script no
# está en sys.path). Solo se leen ARMAZON, BAJO_VP y RAIZ; no se corre nada de ese script.
_spec = importlib.util.spec_from_file_location("paridad_e3", APP / "scripts" / "paridad_e3.py")
P = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(P)


def sin_comentarios(css: str) -> str:
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def sin_print(css: str) -> str:
    """El CSS sin los bloques @media print (con sus reglas anidadas)."""
    salida, i = [], 0
    for m in re.finditer(r"@media\s+print\b[^{]*\{", css):
        if m.start() < i:
            continue
        salida.append(css[i:m.start()])
        prof, j = 1, m.end()
        while j < len(css) and prof:
            prof += {"{": 1, "}": -1}.get(css[j], 0)
            j += 1
        i = j
    salida.append(css[i:])
    return "".join(salida)


def selectores(css: str):
    """Los selectores de cada regla (los de adentro de @media y @supports incluidos; las @reglas mismas no)."""
    for m in re.finditer(r"([^{};]+)\{", css):
        sel = m.group(1).strip()
        if not sel or sel.startswith("@") or re.fullmatch(r"(from|to|\d+(\.\d+)?%)(\s*,\s*(from|to|\d+(\.\d+)?%))*", sel):
            continue
        yield sel


def partir(sel: str):
    """Los selectores de una lista, separados por las comas de afuera (las de :is(a, b) y :not(a, b) no cortan)."""
    partes, prof, actual = [], 0, ""
    for ch in sel:
        prof += {"(": 1, ")": -1}.get(ch, 0)
        if ch == "," and prof == 0:
            partes.append(actual.strip())
            actual = ""
        else:
            actual += ch
    partes.append(actual.strip())
    return [x for x in partes if x]


def hojas():
    return sorted(SRC.glob("*.css")) + sorted((SRC / "vistas").glob("*.css"))


def main():
    problemas: list[str] = []
    # 1. src, e2 y e3 iguales a main
    r = subprocess.run(["git", "-C", str(APP), "diff", "--stat", "main", "--", "src", "e2", "e3"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        problemas.append(f"git diff --stat main falló: {r.stderr.strip()[:200]}")
    elif r.stdout.strip():
        problemas.append("src/**, e2/** o e3/** difieren de main:\n    " + r.stdout.strip().replace("\n", "\n    "))
    print("1. src/, e2/ y e3/ contra main: " + ("iguales" if r.returncode == 0 and not r.stdout.strip() else "con diferencias"))
    # 2 y 3. las hojas de /final/
    n_reglas = 0
    for hoja in hojas():
        css = sin_comentarios(hoja.read_text(encoding="utf-8"))
        rel = hoja.relative_to(APP)
        for sel in selectores(css):
            for s in partir(sel):
                n_reglas += 1
                if not P.ARMAZON.search(s):
                    continue
                if P.BAJO_VP.match(s) and not P.RAIZ.search(s):
                    continue
                problemas.append(f"{rel}: «{s}» nombra una clase del armazón fuera de .e3-vp")
        if "!important" in sin_print(css):
            for k, linea in enumerate(sin_print(css).splitlines(), 1):
                if "!important" in linea:
                    problemas.append(f"{rel}: !important fuera de @media print: «{linea.strip()[:100]}»")
    print(f"2 y 3. {len(hojas())} hojas de /final/, {n_reglas} selectores: "
          + ("bien" if not [x for x in problemas if x.startswith("final/")] else "con problemas"))
    if problemas:
        print(f"{len(problemas)} diferencias:")
        for x in problemas:
            print("  " + x)
        print("RESULTADO: FALLA")
        sys.exit(1)
    print("RESULTADO: OK")


if __name__ == "__main__":
    main()

"""Paridad de /final/ con /e2/ (17/11): la de scripts/paridad_e3.py, aplicada a dist-final/.

    npm run build:e2 && npm run build:final && python3 -I scripts/paridad_final.py [--vista v05] [--hoja RUTA]

/final/ es /e3/ con otro contenido: el mismo zoom uniforme de factor k sobre el tablero del E2 y las mismas reglas. Este
script carga paridad_e3.py (sin tocarlo: su comportamiento por defecto no cambia) y le cambia lo que es propio de /e3/:

- el tablero medido es dist-final/index.html y la vista de referencia es --vista (por defecto la v05 de muestra, que repite
  la estructura de la vista 5 del E3: banda de tres cifras, decisión, qué mide, conclusión y BarrasH);
- el encabezado del gráfico se mide en las clases comunes de /final/ (.fin-mide y .fin-graf .e3-conclusion, de
  final/src/estilos_final.css) en vez de las de la vista 5 del E3;
- la cifra central de /final/ va en --acc, como en /e2/: salen los desvíos declarados por la terracota de la vista 5 del
  E3 (VIS-14), que pasan a compararse contra /e2/;
- el riel se recorre por su data-id (en /final/ el número de cada vista sale de su posición, no del id);
- el control estático mira final/src: main.jsx importa las hojas del E1, el E2 y el E3 y src/fit.js; alguna vista
  importa e2/src/Banda.jsx y src/graficos.jsx; estilos_final.css y las hojas de las vistas no nombran clases del armazón
  (la general, solo bajo .e3-vp) ni usan !important fuera de @media print; y src/**, e2/** y e3/** no cambian contra
  main (/final/ los usa, no los toca).

Lo demás (letra × k contra /e2/ en la misma ventana a 4 resoluciones, cajas del armazón contra /e2/ en la ventana
lógica, reglas 11 y 12 del E2 y desbordes en cada vista) es paridad_e3.py tal cual: en su salida, «/e3/» es /final/.
Sin --hoja no escribe nada (la hoja de contacto de paridad_e3.py va al vault).

Termina con «RESULTADO: OK» o con la lista de diferencias, «RESULTADO: FALLA» y código 1.
"""
from __future__ import annotations

import argparse
import importlib.util
import re
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import Error as PWError
from playwright.sync_api import sync_playwright

APP = Path(__file__).resolve().parents[1]
FINAL = APP / "dist-final" / "index.html"
SRC = APP / "final" / "src"

# paridad_e3.py, cargado por su ruta: con «python3 -I» la carpeta del script no está en sys.path.
_spec = importlib.util.spec_from_file_location("paridad_e3", APP / "scripts" / "paridad_e3.py")
P = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(P)

SELECTORES = {".e3-v05-mide": ".fin-mide", ".e3-v05-graf .e3-conclusion": ".fin-graf .e3-conclusion"}


def textos_final():
    """TEXTOS de paridad_e3.py con los selectores de /final/ y sin el color declarado por la terracota del E3."""
    out = []
    for nombre, v2, s2, s3, op in P.TEXTOS:
        op = dict(op)
        if "est3" in op:
            op["est3"] = {k: v for k, v in op["est3"].items() if v != P.TERRA}
        out.append((nombre, v2, s2, SELECTORES.get(s3, s3), op))
    return out


def distinto_final():
    out = {}
    for pieza, props in P.DISTINTO.items():
        quedan = {k: v for k, v in props.items() if v != P.TERRA}
        if quedan:
            out[pieza] = quedan
    return out


def estatico(problemas):
    main = (SRC / "main.jsx").read_text()
    for imp in ("../../src/estilos.css", "../../e2/src/estilos_e2.css", "../../e3/src/estilos_e3.css", "../../src/fit.js"):
        if f"'{imp}'" not in main and f'"{imp}"' not in main:
            problemas.append(f"estático: final/src/main.jsx no importa {imp}")
    fuentes = "\n".join(p.read_text() for p in SRC.rglob("*.jsx"))
    for imp in ("e2/src/Banda.jsx", "src/graficos.jsx"):
        if not re.search(r"from '(\.\./)+" + re.escape(imp) + "'", fuentes):
            problemas.append(f"estático: ninguna vista de final importa {imp}")
    hojas = sorted(SRC.glob("*.css")) + sorted((SRC / "vistas").glob("*.css"))
    for hoja_css in hojas:
        general = hoja_css.parent == SRC
        sin_com = re.sub(r"/\*.*?\*/", "", hoja_css.read_text(), flags=re.S)
        for m in re.finditer(r"([^{}]+)\{", sin_com):
            sel = m.group(1).strip()
            if not sel or sel.startswith("@"):
                continue
            for s in sel.split(","):
                s = s.strip()
                if not P.ARMAZON.search(s):
                    continue
                if general and P.BAJO_VP.match(s) and not P.RAIZ.search(s):
                    continue
                problemas.append(f"estático: {hoja_css.relative_to(APP)} nombra una clase del armazón"
                                 f"{' fuera de .e3-vp' if general else ''}: «{s}»")
        fuera_print = re.sub(r"@media\s+print\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}", "", sin_com)
        if "!important" in fuera_print:
            problemas.append(f"estático: {hoja_css.relative_to(APP)} usa !important fuera de @media print")
    r = subprocess.run(["git", "diff", "--quiet", "main", "--", "src", "e2", "e3"], cwd=APP)
    if r.returncode != 0:
        problemas.append("estático: src/**, e2/** o e3/** cambiaron contra main")
    print("1. estático (final/src): " + ("bien" if not [p for p in problemas if p.startswith("estático")] else "con problemas"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vista", default="v05", help="vista de /final/ que se compara con la vista 4 de /e2/")
    ap.add_argument("--hoja", help="arma la hoja de contacto /e2/ y /final/ lado a lado en esta ruta")
    a = ap.parse_args()
    for f in (P.E2, FINAL):
        if not f.exists():
            print(f"Falta {f.relative_to(APP)}: corre «npm run build:e2» y «npm run build:final».")
            print("RESULTADO: FALLA")
            sys.exit(1)
    P.E3 = FINAL
    P.VISTA_E3 = a.vista
    P.TEXTOS = textos_final()
    P.DISTINTO = distinto_final()
    P.IDS_E3 = "() => [...document.querySelectorAll('.lat-item')].map((b) => b.dataset.id.toLowerCase())"
    print(f"Paridad de /final/ (vista {a.vista}) con /e2/ (vista {P.VISTA_E2}): en la salida de paridad_e3.py, «/e3/» es /final/.")
    problemas: list[str] = []
    estatico(problemas)
    with sync_playwright() as pw:
        nav = P.abrir_navegador(pw)
        try:
            P.letra(nav, problemas)
            P.armazon(nav, problemas)
            P.reglas(nav, problemas)
            if a.hoja:
                P.hoja(nav, Path(a.hoja))
        except PWError as e:
            problemas.append(f"excepción de Playwright: {str(e).splitlines()[0][:160]}")
        nav.close()
    if problemas:
        print(f"{len(problemas)} diferencias:")
        for x in problemas:
            print("  " + x)
        print("RESULTADO: FALLA")
        sys.exit(1)
    print("RESULTADO: OK")


if __name__ == "__main__":
    main()

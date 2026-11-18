"""Paridad y escala de /final/ (17/11; 18/11, auditoría de dataviz, decisión P-01).

    npm run build:e2 && npm run build:final && python3 -I scripts/paridad_final.py [--vista v08]

Hasta el 18/11 este script exigía que /final/ fuera /e2/ con el zoom de /e3/ en letra y cajas (paridad_e3.py contra la
vista 4 del E2). La decisión P-01 aprueba que /final/ se aparte de ese contrato en el encabezado, la banda, las tarjetas y
la tarjeta del gráfico: esas piezas pasan a desvío declarado y se comparan con la escala de la especificación
(.workforce/auditoria-dataviz/fase-2/spec.md, b.2 y b.4): cada medida vale N × u × k px reales, con u = --fin-u de .e3-vp
(final/src/escala.js) y tolerancia de 1 px. Lo que no cambia (R17) se sigue midiendo contra /e2/ con paridad_e3.py, sin
tocarlo:

1. Estático (igual que antes): final/src/main.jsx importa las hojas del E1, el E2 y el E3 y src/fit.js; alguna vista
   importa e2/src/Banda.jsx y src/graficos.jsx (Lienzo); estilos_final.css y las hojas de las vistas no nombran clases
   del armazón fuera de .e3-vp ni usan !important fuera de @media print; src/**, e2/** y e3/** no cambian contra main.
2. Letra del riel contra /e2/ en la misma ventana (paridad_e3.py, solo las piezas del riel: R17).
3. Cajas del riel y de la barra de avance contra /e2/ en la ventana lógica (paridad_e3.py, solo esas piezas).
4. Escala de la especificación en --vista (por defecto v08: BarrasFin y una tarjeta) y el título en todas las vistas, a
   1152×640, 1280×720, 1366×768, 1536×864 y 1920×1080: título (el token de estilos_final.css, 56, 52 o 48 u), «n / 15»
   20 u, cifra central 48 u, segunda cifra 36 u (si hay), rótulo de la tarjeta 20 u, fragmento 24 u, frase de la
   decisión 30 u, conclusión 30 u (si hay); alto del encabezado 128 u y de la banda 160 u; relleno de la tarjeta del
   gráfico 32 u; rótulo de barra 26 u y valor 28 u (34 u el foco).
5. Reglas 11 y 12 del E2 y desbordes en cada vista (paridad_e3.py: pregunta en un renglón, un gráfico, decisión de 60
   caracteres o menos, __fit, texto que no entra en su caja, riel sobre su pie).

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

# Lo que sigue igual que /e2/ (R17): el riel y la barra de avance. El resto es desvío declarado (P-01) y se mide en
# escala() contra la especificación.
TEXTOS_RIEL = [t for t in P.TEXTOS if t[0].startswith("riel")]
PIEZAS_RIEL = [p for p in P.PIEZAS if p[0].startswith("riel") or p[0] == "encabezado · avance"]
CAJAS_RIEL = {"riel": "xywh", "riel · marca": "xw", "riel · ítem": "xw", "encabezado · avance": "wh"}
RES_ESCALA = [(1152, 640), (1280, 720), (1366, 768), (1536, 864), (1920, 1080)]
TOL_PX = 1.0


def token_titulo() -> int:
    css = (SRC / "estilos_final.css").read_text(encoding="utf-8")
    m = re.search(r"--fin-t-titulo:\s*calc\(var\(--fin-u\)\s*\*\s*(\d+)\)", css)
    if not m or int(m.group(1)) not in (56, 52, 48):
        raise SystemExit("estilos_final.css: --fin-t-titulo tiene que ser calc(var(--fin-u) * 56), 52 o 48 (spec b.2)")
    return int(m.group(1))


# (nombre, selector, propiedad, u esperadas; None = opcional). Tamaños de letra y cajas, en px reales (× zoom).
MEDIDAS = [
    ("título", ".e2-enc .e2-preg", "fontSize", "titulo", False),
    ("n / 15", ".e2-enc .e2-enc-corte", "fontSize", 20, False),
    ("cifra central", ".fin-banda .e2-central .e2-cifra", "fontSize", 48, True),
    ("segunda cifra", ".fin-banda .e2-cifra.sec", "fontSize", 36, True),
    ("rótulo de la tarjeta", ".fin-banda .e2-banda-cifras .kpi-lbl > span", "fontSize", 20, True),
    ("fragmento", ".fin-banda .e2-banda-cifras .e2-linea", "fontSize", 24, True),
    ("frase de la decisión", ".fin-banda .tarjeta-dec .dec-llano", "fontSize", 30, False),
    ("conclusión", ".fin-graf .e3-conclusion", "fontSize", 30, True),
    ("alto del encabezado", ".e2-enc", "alto", 128, False),
    ("alto de la banda", ".fin-banda .e2-banda", "alto", 160, False),
    ("relleno de la tarjeta del gráfico", ".tarjeta.fin-graf", "paddingTop", 32, False),
    ("rótulo de barra", ".fin-lienzo svg text[text-anchor=end]", "fontSize", 26, True),
]

MEDIR = r"""(medidas) => {
  const vp = document.querySelector('.e3-vp')
  const u = parseFloat(getComputedStyle(vp).getPropertyValue('--fin-u'))
  const z = vp.currentCSSZoom ?? 1
  const out = {}
  for (const [nombre, sel, prop] of medidas) {
    const el = document.querySelector(sel)
    if (!el || !el.getClientRects().length) { out[nombre] = null; continue }
    const cs = getComputedStyle(el)
    out[nombre] = prop === 'alto' ? el.getBoundingClientRect().height : parseFloat(cs[prop]) * z
  }
  return { u, z, out }
}"""


def escala(nav, vista: str, problemas: list[str]) -> None:
    tit = token_titulo()
    filas = []
    for w, h in RES_ESCALA:
        res = f"{w}x{h}"
        ctx, pg, err = P.abrir(nav, FINAL, vista, w, h)
        try:
            r = pg.evaluate(MEDIR, [[m[0], m[1], m[2]] for m in MEDIDAS])
            u, z = r["u"], r["z"]
            for nombre, _sel, _prop, n, opcional in MEDIDAS:
                n = tit if n == "titulo" else n
                v = r["out"][nombre]
                if v is None:
                    if not opcional:
                        problemas.append(f"[{res}] {vista}: falta {nombre}")
                    continue
                esperado = n * u * z
                if abs(v - esperado) > TOL_PX:
                    problemas.append(f"[{res}] {vista}: {nombre} mide {v:.2f} px, la especificación dice {n} u = {esperado:.2f} px")
            filas.append(f"   {res}: u {u:.4f} px lógicos × zoom {z:.4f} = {u * z:.4f} px reales")
            # el título, al mismo tamaño en las 15 vistas
            ids = pg.evaluate(P.IDS_E3)
            for vid in ids:
                pg.evaluate(f"() => {{ location.hash = '#{vid}' }}")
                pg.wait_for_timeout(120)
                pg.wait_for_function("() => !document.querySelector(':root:active-view-transition') && "
                                     "document.getAnimations().every((a) => a.playState !== 'running')", timeout=5000)
                fs = pg.evaluate("() => parseFloat(getComputedStyle(document.querySelector('.e2-enc .e2-preg')).fontSize)"
                                 " * (document.querySelector('.e3-vp').currentCSSZoom ?? 1)")
                if abs(fs - tit * u * z) > TOL_PX:
                    problemas.append(f"[{res}] {vid}: el título mide {fs:.2f} px, {tit} u = {tit * u * z:.2f} px")
        finally:
            ctx.close()
        for x in err:
            problemas.append(f"[{res}] consola /final/ #{vista}: {x}")
    print(f"4. escala de la especificación (vista {vista}, título {tit} u en todas):")
    print("\n".join(filas))


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
    ap.add_argument("--vista", default="v08", help="vista de /final/ donde se mide la escala de la banda y de BarrasFin")
    a = ap.parse_args()
    for f in (P.E2, FINAL):
        if not f.exists():
            print(f"Falta {f.relative_to(APP)}: corre «npm run build:e2» y «npm run build:final».")
            print("RESULTADO: FALLA")
            sys.exit(1)
    P.E3 = FINAL
    P.VISTA_E3 = a.vista
    P.TEXTOS = TEXTOS_RIEL
    P.PIEZAS = PIEZAS_RIEL
    P.CAJAS = CAJAS_RIEL
    P.DISTINTO = {}
    P.IDS_E3 = "() => [...document.querySelectorAll('.lat-item')].map((b) => b.dataset.id.toLowerCase())"
    print(f"Paridad y escala de /final/ (vista {a.vista}); en la salida de paridad_e3.py, «/e3/» es /final/ y solo se "
          "comparan con /e2/ el riel y la barra de avance (P-01).")
    problemas: list[str] = []
    estatico(problemas)
    with sync_playwright() as pw:
        nav = P.abrir_navegador(pw)
        try:
            P.letra(nav, problemas)
            P.armazon(nav, problemas)
            escala(nav, a.vista, problemas)
            P.reglas(nav, problemas)
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

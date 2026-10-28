"""Paridad de /e3/ con /e2/ (27/10, W1 y W2.0; PLAN.md del E3, «Frente web», decisiones N0-5 y N0-13).

    npm run build:e2 && npm run build:e3 && python3 scripts/paridad_e3.py [--hoja RUTA]

/e3/ es el tablero del E2 con la letra más grande: un zoom uniforme de factor k sobre toda la página
(e3/src/zoom.js), k = máx(1; mín(1,2; ancho / 1152; alto / 640)), con la letra medida contra la ventana
real (vite.e3.config.js). Lo que se declara y se mide:

    cada texto de /e3/ en una ventana W × H mide k veces lo que mide en /e2/ en la misma ventana W × H;
    las cajas de /e3/ en W × H son las de /e2/ en W/k × H/k, ampliadas k veces.

1. Estático. e3/src/main.jsx importa src/estilos.css, e2/src/estilos_e2.css y src/fit.js; las vistas
   importan los componentes compartidos (e2/src/Banda.jsx, src/graficos.jsx); e3/src/estilos_e3.css no
   nombra ninguna clase del armazón (.lat*, .cuerpo, .e2-enc*, .e2-preg, .tarjeta, .kpi-*, .ban-*,
   .e2-banda, .tarjeta-dec, :root y otras del E2) salvo en un selector que arranca en .e3-vp (la caja del
   zoom, que solo existe en /e3/: N0-4 del 28/10), ni usa !important fuera de @media print; las hojas de
   cada vista (e3/src/vistas/*.css, N0-7) no nombran ninguna, ni bajo .e3-vp; y src/** y e2/** no
   cambian contra main.
2. Letra, /e2/ y /e3/ en la misma ventana, a 1152×640, 1366×768, 1536×864 y 1920×1080 (/e2/ en la vista 4
   o la 7b, /e3/ en la 5): de cada texto (riel, pregunta, encabezado, banda con sus cifras grandes,
   tarjeta de decisión, rótulo y textos del gráfico), el cociente e3 / e2 del tamaño de letra efectivo
   (tamaño × zoom), del interlineado y del espaciado tiene que dar el k declarado; el del ancho en
   pantalla de una misma muestra escrita con la letra de cada pieza, también. Familia, peso, mayúsculas
   y color, iguales. Imprime la tabla de cocientes por texto y resolución.
   (28/10, N0-1 y N0-5) Lo que el E3 cambia a propósito para el proyector se declara pieza por pieza en
   TEXTOS y DISTINTO, con el valor que tiene que dar, y se mide igual: la cifra central en 700; la
   secundaria en tinta 600 al 72 % de la central (en el E2, gris al 70 %); el rótulo de la decisión un
   6 % más grande, en 700 y con .03em; el fondo y el borde de la tarjeta de decisión; y el encabezado del
   gráfico, que en el E3 es propio: qué mide (.e3-v05-mide, mono a la letra del rótulo de la banda del
   E2, en --e3-ctx) y la conclusión (.e3-conclusion, tinta 700, más grande que el rótulo del E2). Cualquier otro
   desvío sigue siendo una diferencia.
3. Armazón, /e2/ en la ventana lógica (W/k × H/k) contra /e3/ en W × H: del riel, el encabezado, la
   banda, la tarjeta de decisión, la tarjeta central, la tarjeta del gráfico y el cuerpo, colores, fondo,
   bordes, radio y padding iguales (los valores calculados son lógicos: el zoom no los cambia); cajas
   medidas en pantalla y divididas por k, iguales con 0,5 px de tolerancia en lo que no depende de la
   letra (posición y ancho; el alto del riel, la banda, la tarjeta de decisión y el avance).
4. Reglas 11 y 12 del E2 y desbordes, en cada vista de /e3/ y cada resolución: la pregunta en un renglón
   y de 74 caracteres o menos; sin título (.titulo) ni pie (.pie-vista); a lo sumo un gráfico por vista
   (las vistas con contenido, exactamente uno); la tarjeta de decisión con una frase corta de 60
   caracteres o menos; window.__fit() sin problemas; ninguna tarjeta de la banda, ni el encabezado, ni el
   riel con contenido que no entra (scroll interno), y el último ítem del riel arriba de su pie. Las
   vistas esqueleto solo se montan (sin gráfico).
5. Hoja de contacto: /e2/ (vista 4) y /e3/ (vista 5) lado a lado, las dos a 1536 × 864, en
   entregas/entregable-3/_build/workforce/fase-w1/e2-e3-1536.png del vault.

Termina con «PARIDAD OK» o con la lista de diferencias y código 1.
"""
from __future__ import annotations

import argparse
import glob
import re
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import Error as PWError
from playwright.sync_api import sync_playwright

APP = Path(__file__).resolve().parents[1]
E2 = APP / "dist-e2" / "index.html"
E3 = APP / "dist-e3" / "index.html"
VAULT = Path("/Users/sebastiancaules/Desktop/ITBA/26-2C/FPDD")
HOJA = VAULT / "entregas" / "entregable-3" / "_build" / "workforce" / "fase-w1" / "e2-e3-1536.png"
RES = [(1152, 640), (1366, 768), (1536, 864), (1920, 1080)]
K_MAX, ANCHO_MIN, ALTO_MIN = 1.2, 1152, 640
VISTA_E2, VISTA_E3 = "v04", "v05"
TOL = 0.5

# Clases del armazón que la hoja del E3 no puede nombrar (PLAN.md: .lat*, .cuerpo, .e2-enc*, .e2-preg,
# .tarjeta, .kpi-*, .ban-*, .e2-banda, .tarjeta-dec, :root) y otras del E2 que darían el mismo efecto.
# (28/10, N0-4) En estilos_e3.css sí, en un selector que arranca en .e3-vp: la caja del zoom solo existe en
# /e3/, así /e2/ no cambia. :root, html y body, nunca. Las hojas de las vistas (V0n.css), nunca.
ARMAZON = re.compile(
    r"(:root\b|(?<![\w-])html\b|(?<![\w-])body\b|\.lat(?:-[\w-]+)?\b|\.cuerpo\b|\.principal\b|\.app\b|\.pant\b"
    r"|\.e2-[\w-]+|\.tarjeta(?:-dec)?\b|\.kpi-[\w-]+|\.ban-[\w-]+|\.par-[\w-]+|\.dec-[\w-]+|\.lienzo[\w-]*"
    r"|\.titulo\b|\.chico\b)")
BAJO_VP = re.compile(r"^\.e3-vp(?=[\s>])")
RAIZ = re.compile(r":root\b|(?<![\w-])html\b|(?<![\w-])body\b")

# Colores del E3 que se declaran distintos (src/estilos.css y estilos_e3.css), en el formato de getComputedStyle.
INK = "rgb(22, 35, 58)"           # --ink, #16233a
E3_CTX = "rgb(90, 100, 120)"      # --e3-ctx, #5a6478
DEC_FONDO = "rgb(214, 235, 227)"  # --dec-fondo del E3, #d6ebe3
DEC_BORDE = "rgb(159, 207, 192)"  # --dec-borde del E3, #9fcfc0

# ---- 2. Letra: /e2/ y /e3/ en la misma ventana. (nombre, vista de /e2/, selector en /e2/, selector en /e3/,
# opciones). La vista de /e3/ es siempre la 5, salvo «vista3». «solo_tam»: solo el tamaño y la muestra (el
# interlineado y el color de la regla son otros); «opcional»: si /e3/ no lo tiene (el esqueleto, cuando ya
# no quede ninguno), no se mide.
# (28/10, N0-1 y N0-5) Diferencias declaradas: «factor», la letra de /e3/ mide k × factor la de /e2/ (y el
# interlineado y la muestra, lo mismo); «espaciado_libre», el espaciado es otro (lo declara estilos_e3.css) y la
# muestra no se mide; «interlineado_libre», el interlineado es otro; «tam_min», la letra mide por lo menos
# k × tam_min la de /e2/ y nada más de la escala se compara; «est3», propiedades que en /e3/ tienen que dar ese
# valor en lugar del de /e2/.
TEXTOS = [
    ("riel · nombre", "v04", ".lat-oga", ".lat-oga", {}),
    ("riel · subtítulo", "v04", ".lat-sub", ".lat-sub", {}),
    ("riel · grupo", "v04", ".lat-grupo span", ".lat-grupo span", {}),
    ("riel · ítem", "v04", ".lat-item:not(.on) .lat-txt", ".lat-item:not(.on) .lat-txt", {}),
    ("riel · ítem activo", "v04", ".lat-item.on .lat-txt", ".lat-item.on .lat-txt", {}),
    ("riel · número", "v04", ".lat-item:not(.on) .lat-n", ".lat-item:not(.on) .lat-n", {}),
    ("riel · pie", "v04", ".lat-pie span", ".lat-pie span", {}),
    ("pregunta", "v04", ".e2-preg", ".e2-preg", {}),
    ("encabezado · dónde", "v04", ".e2-enc-corte", ".e2-enc-corte", {}),
    ("banda · rótulo", "v04", ".e2-central .kpi-lbl > span", ".e2-central .kpi-lbl > span", {}),
    # en la vista 4 del E2 la tarjeta central es un par antes → después: se mide la cifra de después
    # N0-5: la central domina por tamaño y peso, en 700
    ("banda · cifra grande", "v04", ".e2-central .par-despues .e2-cifra", ".e2-central .e2-cifra",
     {"est3": {"fontWeight": "700"}}),
    # N0-1: la secundaria, en tinta 600 y al 72 % de la central; en el E2, gris al 70 %
    ("banda · cifra secundaria", "v07b", ".e2-banda .e2-cifra.sec", ".e2-banda .e2-cifra.sec",
     {"factor": 72 / 70, "est3": {"color": INK, "fontWeight": "600"}}),
    ("banda · frase", "v04", ".e2-central .e2-linea", ".e2-central .e2-linea", {}),
    # N0-1: «Decisión» y «área · estado», un 6 % más grandes, en 700 y con menos espaciado
    ("decisión · rótulo", "v04", ".tarjeta-dec .kpi-lbl > span", ".tarjeta-dec .kpi-lbl > span",
     {"factor": 1.06, "espaciado_libre": True, "est3": {"fontWeight": "700"}}),
    ("decisión · id y estado", "v04", ".tarjeta-dec .kpi-lbl > b", ".tarjeta-dec .kpi-lbl > b",
     {"factor": 1.06, "espaciado_libre": True, "est3": {"fontWeight": "700"}}),
    ("decisión · frase", "v04", ".tarjeta-dec .dec-llano", ".tarjeta-dec .dec-llano", {}),
    # N0-1: el encabezado del gráfico es propio del E3. Qué mide, mono a la letra del rótulo de la banda del E2 (el
    # rótulo del gráfico de la vista 4 del E2 es una frase en sans), en --e3-ctx; la conclusión, que en el E2 era
    # la cifra azul del rótulo, en tinta 700 y más grande.
    ("gráfico · qué mide", "v04", ".e2-central .kpi-lbl > span", ".e3-v05-mide",
     {"espaciado_libre": True, "interlineado_libre": True, "est3": {"color": E3_CTX}}),
    ("gráfico · conclusión", "v04", ".pant > .tarjeta > .kpi-lbl > b", ".e3-v05-graf .e3-conclusion",
     {"tam_min": 1.3, "est3": {"color": INK, "fontWeight": "700", "textTransform": "none"}}),
    # BarrasH: la barra que se destaca va en negrita; se miden las otras
    ("gráfico · etiqueta de barra", "v04", ".lienzo svg text[text-anchor=end][font-weight='400']",
     ".lienzo svg text[text-anchor=end][font-weight='400']", {}),
    ("gráfico · valor de barra", "v04", ".lienzo svg text:not([text-anchor])[font-weight='500']",
     ".lienzo svg text:not([text-anchor])[font-weight='500']", {}),
    ("gráfico · marca del eje", "v04", ".lienzo svg text[font-size='10.5']", ".lienzo svg text[font-size='10.5']", {}),
    ("gráfico · título del eje", "v04", ".lienzo svg text[font-size='11']", ".lienzo svg text[font-size='11']", {}),
    # el esqueleto: 400 y --e2-txt2, como la leyenda de la vista 11b del E2
    ("esqueleto", "v11b", ".v11b-leyenda", ".e3-esqueleto-caja", {"vista3": "esqueleto", "solo_tam": True, "opcional": True}),
]
PROPS_IGUALES = ["fontFamily", "fontWeight", "textTransform", "color"]
# Muestra: un mismo texto escrito con la letra de cada pieza, medido en pantalla. Su ancho es la letra tal
# como se dibuja (el alto de un renglón no sirve: Chrome redondea al píxel el ascenso y el descenso).
MUESTRA = "Casa Óga 2026 · −99,95 % · USD 30.660"

LETRA = r"""(sels) => sels.map((sel) => {
  const el = document.querySelector(sel)
  if (!el) return null
  const cs = getComputedStyle(el)
  const z = el.currentCSSZoom ?? 1
  const px = (v) => (/px$/.test(v) ? parseFloat(v) * z : null)
  // la muestra, con la letra de la pieza: un <span> fuera del flujo, o un <text> hermano en un SVG
  let m
  if (el instanceof SVGElement) {
    m = el.cloneNode(false); m.textContent = %s; el.parentNode.appendChild(m)
  } else {
    m = document.createElement('span'); m.textContent = %s
    m.style.cssText = 'position:absolute;left:0;top:0;white-space:nowrap;visibility:hidden'
    el.appendChild(m)
  }
  const ancho = m.getBoundingClientRect().width
  m.remove()
  const est = {}
  for (const p of %s) est[p] = cs[p]
  return { tam: parseFloat(cs.fontSize) * z, interlineado: px(cs.lineHeight), espaciado: px(cs.letterSpacing), ancho, est }
})""" % (repr(MUESTRA), repr(MUESTRA), str(PROPS_IGUALES).replace("'", '"'))

# ---- 3. Armazón: /e2/ en la ventana lógica contra /e3/ en la real. Sin las propiedades de letra.
PROPS = ["fontFamily", "fontWeight", "textTransform", "color",
         "backgroundColor", "borderTopWidth", "borderTopStyle", "borderTopColor", "borderRightWidth",
         "borderRightStyle", "borderRightColor", "borderBottomWidth", "borderBottomColor", "borderLeftWidth",
         "borderLeftColor", "borderRadius", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]
# (nombre, selector) o (nombre, selector en /e2/, selector en /e3/). Se compara el primero que aparece.
PIEZAS = [
    ("riel", ".lat"),
    ("riel · marca", ".lat-marca"),
    ("riel · nombre", ".lat-oga"),
    ("riel · subtítulo", ".lat-sub"),
    ("riel · grupo", ".lat-grupo span"),
    ("riel · ítem", ".lat-item:not(.on)"),
    ("riel · ítem activo", ".lat-item.on"),
    ("riel · número", ".lat-item:not(.on) .lat-n"),
    ("riel · pie", ".lat-pie"),
    ("encabezado", ".e2-enc"),
    ("pregunta", ".e2-preg"),
    ("encabezado · dónde", ".e2-enc-corte"),
    # la miniatura del mapa de calidad del E2 y, en su lugar, el avance de la historia del E3
    ("encabezado · avance", ".e2-enc-der .mapa-boton", ".e2-enc-der .e3-avance"),
    ("cuerpo", ".cuerpo"),
    ("vista", ".cuerpo > .pant"),
    ("banda", ".e2-banda"),
    ("banda · cifras", ".e2-banda-cifras"),
    ("tarjeta central", ".e2-banda-cifras > .tarjeta.e2-central"),
    ("tarjeta central · rótulo", ".e2-central .kpi-lbl"),
    ("tarjeta central · cifra", ".e2-central .par-despues .e2-cifra", ".e2-central .e2-cifra"),
    ("tarjeta central · frase", ".e2-central .e2-linea"),
    ("decisión", ".e2-banda > .tarjeta-dec"),
    ("decisión · rótulo", ".tarjeta-dec .kpi-lbl"),
    ("decisión · frase", ".tarjeta-dec .dec-llano"),
    ("tarjeta del gráfico", ".pant > .tarjeta"),
    # (28/10, N0-1) «tarjeta del gráfico · rótulo» (.pant > .tarjeta > .kpi-lbl) salió: ninguna vista del E3 lo
    # usa; el encabezado del gráfico es propio (qué mide y la conclusión) y su letra se mide en TEXTOS.
]
# (28/10, N0-1 y N0-5) Propiedades del armazón que en /e3/ tienen que dar otro valor, declarado.
DISTINTO = {
    "tarjeta central · cifra": {"fontWeight": "700"},
    "decisión": {"backgroundColor": DEC_FONDO, "borderRightColor": DEC_BORDE, "borderBottomColor": DEC_BORDE,
                 "borderLeftColor": DEC_BORDE},
    "decisión · rótulo": {"fontWeight": "700"},
}
# Cajas que miden lo mismo en px lógicos, y en qué ejes: lo que no depende de la letra. La posición y el
# ancho no dependen; el alto del encabezado sí (la pregunta crece ×k), y con él la posición vertical de lo
# que va debajo; el de la marca y los ítems del riel, también.
CAJAS = {"riel": "xywh", "riel · marca": "xw", "riel · ítem": "xw", "encabezado": "xw",
         "encabezado · avance": "xwh", "cuerpo": "xw", "vista": "xw", "banda": "xwh", "decisión": "xwh"}
SIN_TEXTO = {"encabezado · avance"}
PROPS_TEXTO = {"fontFamily", "fontWeight", "textTransform", "color"}

LEER = r"""(piezas) => {
  const out = {}
  for (const [nombre, sel] of piezas) {
    const el = sel && document.querySelector(sel)
    if (!el) { out[nombre] = null; continue }
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    const est = {}
    for (const p of %s) est[p] = cs[p]
    out[nombre] = { est, caja: [r.left, r.top, r.width, r.height], zoom: el.currentCSSZoom ?? 1 }
  }
  return out
}""" % (str(PROPS).replace("'", '"'))

REGLAS = r"""() => {
  const p = []
  const preg = document.querySelector('.e2-enc .e2-preg')
  if (!preg) p.push('sin pregunta en el encabezado')
  else {
    const t = preg.textContent.trim()
    if (t.length > 74) p.push(`la pregunta tiene ${t.length} caracteres: «${t}»`)
    const lh = parseFloat(getComputedStyle(preg).lineHeight)
    const rg = document.createRange(); rg.selectNodeContents(preg)
    const tops = new Set([...rg.getClientRects()].map((r) => Math.round(r.top)))
    if (tops.size > 1 || preg.getBoundingClientRect().height > lh * (preg.currentCSSZoom ?? 1) * 1.5)
      p.push(`la pregunta ocupa más de un renglón: «${t}»`)
    if (preg.scrollWidth > preg.clientWidth + 1) p.push(`la pregunta se corta: «${t}»`)
  }
  if (document.querySelector('.cuerpo .titulo')) p.push('la vista tiene título propio (.titulo)')
  if (document.querySelector('.cuerpo .pie-vista')) p.push('la vista tiene pie (.pie-vista)')
  const graficos = [...document.querySelectorAll('.cuerpo .lienzo svg')].filter((s) => !s.parentElement.closest('svg'))
  const esqueleto = !!document.querySelector('.cuerpo .e3-esqueleto')
  if (graficos.length > 1) p.push(`${graficos.length} gráficos en la vista`)
  if (!esqueleto && graficos.length !== 1) p.push(`${graficos.length} gráficos en una vista con contenido`)
  for (const d of document.querySelectorAll('.tarjeta-dec .dec-llano')) {
    const t = d.textContent.trim()
    if (t.length > 60) p.push(`la decisión tiene ${t.length} caracteres: «${t}»`)
  }
  const fit = window.__fit ? window.__fit() : { ok: false, problemas: [{ tipo: 'sin __fit' }] }
  for (const x of fit.problemas) p.push(`__fit: ${x.tipo} ${x.detalle ?? ''}`)
  // (W2.0) Lo que __fit no ve: texto que no entra en su caja (las tarjetas de la banda y la de decisión
  // cortan con overflow:hidden; una cifra grande más ancha que su tarjeta invade el relleno; un ítem del
  // riel en dos renglones empuja la lista sobre el pie).
  const nombre = (el) => '.' + String(el.className).split(' ').filter(Boolean).slice(0, 2).join('.')
  for (const el of document.querySelectorAll('.lat, .lat-marca, .lat-item, .e2-enc, .e2-banda, .e2-banda .tarjeta, ' +
                                             '.e2-banda .par-val, .cuerpo > .pant, .pant > .tarjeta, .e3-esqueleto-caja')) {
    // de la cifra, solo el ancho: con interlineado 1,08 el descendente siempre pasa unos píxeles (también en /e2/)
    const dh = el.matches('.par-val') ? 0 : el.scrollHeight - el.clientHeight, dw = el.scrollWidth - el.clientWidth
    if (dh > 1 || dw > 1) p.push(`no entra en ${nombre(el)}: ${dw > 1 ? dw + ' px de ancho' : ''}${dw > 1 && dh > 1 ? ' y ' : ''}${dh > 1 ? dh + ' px de alto' : ''}`)
  }
  const items = [...document.querySelectorAll('.lat-item')]
  const pie = document.querySelector('.lat-pie')
  if (items.length && pie) {
    const falta = items[items.length - 1].getBoundingClientRect().bottom - pie.getBoundingClientRect().top
    if (falta > 1) p.push(`el riel se encima con su pie (${falta.toFixed(1)} px)`)
  }
  return { problemas: p, esqueleto, id: location.hash }
}"""

IDS_E3 = r"""() => [...document.querySelectorAll('.lat-item')].map((b) => b.querySelector('.lat-n').textContent.trim())"""


def k_de(w, h):
    return max(1.0, min(K_MAX, w / ANCHO_MIN, h / ALTO_MIN))


def abrir_navegador(pw):
    intentos = [dict(), dict(channel="chrome")]
    cache = Path.home() / "Library" / "Caches" / "ms-playwright"
    for patron in ("chromium-*/chrome-mac*/*.app/Contents/MacOS/*", "chromium-*/chrome-linux*/chrome"):
        for exe in sorted(glob.glob(str(cache / patron)), reverse=True):
            intentos.append(dict(executable_path=exe))
    ultimo = None
    for kw in intentos:
        try:
            return pw.chromium.launch(**kw)
        except PWError as e:
            ultimo = e
    raise SystemExit(f"No pude abrir un navegador para Playwright: {ultimo}")


def abrir(nav, html, vista, w, h):
    ctx = nav.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, reduced_motion="reduce")
    pg = ctx.new_page()
    errores = []
    pg.on("pageerror", lambda e: errores.append(str(e)[:160]))
    pg.on("console", lambda m: m.type == "error" and errores.append(m.text[:160]))
    pg.goto(f"{html.resolve().as_uri()}#{vista}")
    pg.wait_for_selector(".cuerpo .pant", timeout=10000)
    pg.wait_for_timeout(250)
    return ctx, pg, errores


# ---------------------------------------------------------------- 1. estático

def estatico(problemas):
    main = (APP / "e3" / "src" / "main.jsx").read_text()
    for imp in ("../../src/estilos.css", "../../e2/src/estilos_e2.css", "../../src/fit.js"):
        if f"'{imp}'" not in main and f'"{imp}"' not in main:
            problemas.append(f"estático: e3/src/main.jsx no importa {imp}")
    fuentes = "\n".join(p.read_text() for p in (APP / "e3" / "src").rglob("*.jsx"))
    for imp in ("e2/src/Banda.jsx", "src/graficos.jsx"):
        if not re.search(r"from '(\.\./)+" + re.escape(imp) + "'", fuentes):
            problemas.append(f"estático: ninguna vista de e3 importa {imp}")
    hojas = [APP / "e3" / "src" / "estilos_e3.css"] + sorted((APP / "e3" / "src" / "vistas").glob("*.css"))
    for hoja_css in hojas:
        nombre = hoja_css.name
        general = nombre == "estilos_e3.css"
        sin_com = re.sub(r"/\*.*?\*/", "", hoja_css.read_text(), flags=re.S)
        # selectores: lo que va antes de cada «{» que no es un @-bloque
        for m in re.finditer(r"([^{}]+)\{", sin_com):
            sel = m.group(1).strip()
            if not sel or sel.startswith("@"):
                continue
            for s in sel.split(","):
                s = s.strip()
                if not ARMAZON.search(s):
                    continue
                # N0-4: en la hoja general, bajo .e3-vp; nunca :root, html ni body; en las de las vistas, nunca
                if general and BAJO_VP.match(s) and not RAIZ.search(s):
                    continue
                problemas.append(f"estático: {nombre} nombra una clase del armazón"
                                 f"{' fuera de .e3-vp' if general else ''}: «{s}»")
        fuera_print = re.sub(r"@media\s+print\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}", "", sin_com)
        if "!important" in fuera_print:
            problemas.append(f"estático: {nombre} usa !important fuera de @media print")
    r = subprocess.run(["git", "diff", "--quiet", "main", "--", "src", "e2"], cwd=APP)
    if r.returncode != 0:
        problemas.append("estático: src/** o e2/** cambiaron contra main")
    print("1. estático: " + ("bien" if not [p for p in problemas if p.startswith("estático")] else "con problemas"))


# ---------------------------------------------------------------- 2. letra (misma ventana)

def fmt(v, d=4):
    return "—" if v is None else f"{v:.{d}f}".replace(".", ",")


def letra(nav, problemas):
    tabla = {}      # nombre → {res: (cociente de tamaño, cociente de alto)}
    for w, h in RES:
        k = k_de(w, h)
        res = f"{w}x{h}"
        medidas = {}
        for lado, html, vistas in (("e2", E2, {t[1] for t in TEXTOS}),
                                   ("e3", E3, {t[4].get("vista3", VISTA_E3) for t in TEXTOS})):
            for v in sorted(vistas):
                if v == "esqueleto":
                    v_real = primer_esqueleto(nav, w, h)
                    if v_real is None:
                        continue
                else:
                    v_real = v
                ctx, pg, err = abrir(nav, html, v_real, w, h)
                try:
                    sel = [t[2] if lado == "e2" else t[3] for t in TEXTOS]
                    medidas[(lado, v)] = pg.evaluate(LETRA, sel)
                finally:
                    ctx.close()
                for x in err:
                    problemas.append(f"[{res}] consola /{lado}/ #{v_real}: {x}")
        for i, (nombre, v2, _, _, op) in enumerate(TEXTOS):
            v3 = op.get("vista3", VISTA_E3)
            x = (medidas.get(("e2", v2)) or [None] * len(TEXTOS))[i]
            y = (medidas.get(("e3", v3)) or [None] * len(TEXTOS))[i]
            if y is None and op.get("opcional"):
                continue
            if x is None or y is None:
                problemas.append(f"[{res}] letra de {nombre}: falta en {'/e2/' if x is None else '/e3/'}")
                continue
            ct = y["tam"] / x["tam"]
            ca = y["ancho"] / x["ancho"] if x["ancho"] else None
            tabla.setdefault(nombre, {})[res] = (ct, ca)
            est3 = op.get("est3", {})
            for prop, v in est3.items():
                if y["est"][prop] != v:
                    problemas.append(f"[{res}] {nombre} · {prop}: /e3/ {y['est'][prop]}, se declaró {v}")
            if "tam_min" in op:
                if ct < k * op["tam_min"] - 0.01:
                    problemas.append(f"[{res}] {nombre}: la letra mide {fmt(ct)} veces la de /e2/, se declaró al "
                                     f"menos k × {fmt(op['tam_min'], 2)} = {fmt(k * op['tam_min'])}")
                continue
            kf = k * op.get("factor", 1)
            dice = f"k = {fmt(k)}" if "factor" not in op else f"k × {fmt(op['factor'])} = {fmt(kf)}"
            if abs(ct - kf) > 0.01:
                problemas.append(f"[{res}] {nombre}: la letra mide {fmt(ct)} veces la de /e2/, se declaró {dice}")
            if not op.get("espaciado_libre") and (ca is None or abs(ca - kf) > 0.01):
                problemas.append(f"[{res}] {nombre}: la muestra mide {fmt(ca)} veces la de /e2/ de ancho, {dice}")
            if op.get("solo_tam"):
                continue
            for prop in ("interlineado", "espaciado"):
                if op.get(f"{prop}_libre"):
                    continue
                a, b = x[prop], y[prop]
                if a is None and b is None:
                    continue
                if a is None or b is None or (abs(a) < 1e-6 and abs(b) > 1e-6):
                    problemas.append(f"[{res}] {nombre} · {prop}: /e2/ {a} · /e3/ {b}")
                elif abs(a) > 1e-6 and abs(b / a - kf) > 0.01:
                    problemas.append(f"[{res}] {nombre} · {prop}: {fmt(b / a)} veces el de /e2/, {dice}")
            for prop in PROPS_IGUALES:
                if prop not in est3 and x["est"][prop] != y["est"][prop]:
                    problemas.append(f"[{res}] {nombre} · {prop}: /e2/ {x['est'][prop]} · /e3/ {y['est'][prop]}")
    cab = ["texto"] + [f"{w}×{h}" for w, h in RES]
    filas = [["k declarado"] + [fmt(k_de(w, h)) for w, h in RES]]
    for nombre, *_ in TEXTOS:
        if nombre not in tabla:
            continue
        fila = [nombre]
        for w, h in RES:
            ct, ca = tabla[nombre].get(f"{w}x{h}", (None, None))
            fila.append(fmt(ct) + (f" ({fmt(ca)})" if ca is not None else ""))
        filas.append(fila)
    anchos = [max(len(f[i]) for f in [cab] + filas) for i in range(len(cab))]
    print("2. letra, /e3/ contra /e2/ en la misma ventana: tamaño × zoom (entre paréntesis, ancho de la muestra en pantalla)")
    for f in [cab] + filas:
        print("   " + "  ".join(c.ljust(anchos[i]) for i, c in enumerate(f)))


def primer_esqueleto(nav, w, h):
    """La primera vista de /e3/ que todavía es esqueleto, o None."""
    ctx, pg, _ = abrir(nav, E3, VISTA_E3, w, h)
    try:
        for et in pg.evaluate(IDS_E3):
            vid = ("v" + et) if et[0].isdigit() else et.lower()
            pg.evaluate(f"() => {{ location.hash = '#{vid}' }}")
            pg.wait_for_timeout(80)
            if pg.evaluate("() => !!document.querySelector('.cuerpo .e3-esqueleto')"):
                return vid
    finally:
        ctx.close()
    return None


# ---------------------------------------------------------------- 3. armazón (ventana lógica)

def armazon(nav, problemas):
    filas = []
    for w, h in RES:
        k = k_de(w, h)
        wl, hl = round(w / k), round(h / k)
        c2, p2, e2err = abrir(nav, E2, VISTA_E2, wl, hl)
        c3, p3, e3err = abrir(nav, E3, VISTA_E3, w, h)
        try:
            a = p2.evaluate(LEER, [[x[0], x[1]] for x in PIEZAS])
            b = p3.evaluate(LEER, [[x[0], x[-1]] for x in PIEZAS])
            zoom = p3.evaluate("() => document.querySelector('.e3-vp')?.currentCSSZoom ?? 1")
        finally:
            c2.close(); c3.close()
        res = f"{w}x{h}"
        for x in e2err + e3err:
            problemas.append(f"[{res}] consola: {x}")
        if abs(zoom - k) > 1e-3:
            problemas.append(f"[{res}] zoom de /e3/ {zoom:.4f}, se declaró k = {k:.4f}")
        n_cajas = 0
        for nombre, *_ in PIEZAS:
            x, y = a.get(nombre), b.get(nombre)
            if x is None or y is None:
                problemas.append(f"[{res}] {nombre}: falta en {'/e2/' if x is None else '/e3/'}")
                continue
            for prop in PROPS:
                if nombre in SIN_TEXTO and prop in PROPS_TEXTO:
                    continue
                if prop in DISTINTO.get(nombre, {}):
                    if y["est"][prop] != DISTINTO[nombre][prop]:
                        problemas.append(f"[{res}] {nombre} · {prop}: /e3/ {y['est'][prop]}, se declaró "
                                         f"{DISTINTO[nombre][prop]}")
                    continue
                if prop.endswith("Width") and prop.startswith("border"):
                    # Los bordes se ajustan al píxel de la pantalla: 5 px × 1,186 se dibujan con 5 px reales,
                    # que son 4,22 px lógicos. Se acepta hasta un píxel de pantalla de diferencia.
                    try:
                        if abs(float(x["est"][prop].rstrip("px")) - float(y["est"][prop].rstrip("px"))) <= 1 / k + 0.01:
                            continue
                    except ValueError:
                        pass
                if x["est"][prop] != y["est"][prop]:
                    if prop.startswith("padding") or prop.endswith("Width"):
                        try:
                            if abs(float(x["est"][prop].rstrip("px")) - float(y["est"][prop].rstrip("px"))) <= TOL:
                                continue
                        except ValueError:
                            pass
                    problemas.append(f"[{res}] {nombre} · {prop}: /e2/ {x['est'][prop]} · /e3/ {y['est'][prop]}")
            if nombre in CAJAS:
                ce = [v / k for v in y["caja"]]
                for eje in CAJAS[nombre]:
                    i = "xywh".index(eje)
                    n_cajas += 1
                    if abs(ce[i] - x["caja"][i]) > TOL:
                        problemas.append(f"[{res}] caja de {nombre} · {eje}: /e2/ {x['caja'][i]:.2f} · /e3/ ÷ k {ce[i]:.2f}")
        filas.append(f"   {res}: ventana lógica {w / k:.1f} × {h / k:.1f} · zoom {zoom:.4f} · "
                     f"{len(PIEZAS)} piezas, {n_cajas} medidas de caja")
    print("3. armazón (/e2/ a W/k × H/k contra /e3/ a W × H, sin la letra):")
    print("\n".join(filas))


# ---------------------------------------------------------------- 4. reglas 11 y 12 y desbordes

def reglas(nav, problemas):
    vistos = 0
    esqueletos = 0
    for w, h in RES:
        ctx, pg, err = abrir(nav, E3, VISTA_E3, w, h)
        try:
            ids = pg.evaluate(IDS_E3)
            for et in ids:
                vid = ("v" + et) if et[0].isdigit() else et.lower()
                pg.evaluate(f"() => {{ location.hash = '#{vid}' }}")
                pg.wait_for_timeout(120)
                # la transición del E2 entre vistas (View Transitions) termina antes de la siguiente
                pg.wait_for_function("() => !document.querySelector(':root:active-view-transition') && "
                                     "document.getAnimations().every((a) => a.playState !== 'running')", timeout=5000)
                r = pg.evaluate(REGLAS)
                vistos += 1
                esqueletos += r["esqueleto"]
                if r["id"].lower() != f"#{vid}":
                    problemas.append(f"[{w}x{h}] #{vid} no se abre (quedó {r['id']})")
                for x in r["problemas"]:
                    problemas.append(f"[{w}x{h}] {vid}: {x}")
            for x in err:
                problemas.append(f"[{w}x{h}] consola: {x}")
        finally:
            ctx.close()
    print(f"4. reglas 11 y 12 y desbordes: {vistos} vistas revisadas ({vistos - esqueletos} con contenido, {esqueletos} esqueletos) en {len(RES)} resoluciones")


# ---------------------------------------------------------------- 5. hoja de contacto

def hoja(nav, destino: Path):
    from PIL import Image, ImageDraw, ImageFont
    w, h = 1536, 864
    tmp = []
    for html, vista, nombre in ((E2, VISTA_E2, "e2"), (E3, VISTA_E3, "e3")):
        ctx, pg, _ = abrir(nav, html, vista, w, h)
        f = destino.parent / f".{nombre}-{w}.png"
        pg.screenshot(path=str(f))
        ctx.close()
        tmp.append(f)
    a, b = (Image.open(f).convert("RGB") for f in tmp)
    sep, cab = 24, 44
    lienzo = Image.new("RGB", (a.width + b.width + sep, max(a.height, b.height) + cab), (255, 255, 255))
    lienzo.paste(a, (0, cab))
    lienzo.paste(b, (a.width + sep, cab))
    d = ImageDraw.Draw(lienzo)
    try:
        fuente = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 22)
    except OSError:
        fuente = ImageFont.load_default()
    k = k_de(w, h)
    d.text((12, 10), f"/e2/ · vista 4 · {w} × {h}", fill=(22, 35, 58), font=fuente)
    d.text((a.width + sep + 12, 10), f"/e3/ · vista 5 · {w} × {h} · k = {k:.2f}".replace(".", ","), fill=(22, 35, 58), font=fuente)
    destino.parent.mkdir(parents=True, exist_ok=True)
    lienzo.save(destino)
    for f in tmp:
        f.unlink()
    print(f"5. hoja de contacto: {destino}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--hoja", default=str(HOJA))
    ap.add_argument("--sin-hoja", action="store_true")
    a = ap.parse_args()
    for f in (E2, E3):
        if not f.exists():
            sys.exit(f"Falta {f.relative_to(APP)}: corre «npm run build:e2» y «npm run build:e3».")
    problemas: list[str] = []
    estatico(problemas)
    with sync_playwright() as pw:
        nav = abrir_navegador(pw)
        try:
            letra(nav, problemas)
            armazon(nav, problemas)
            reglas(nav, problemas)
            if not a.sin_hoja:
                hoja(nav, Path(a.hoja))
        except PWError as e:
            problemas.append(f"excepción de Playwright: {str(e).splitlines()[0][:160]}")
        nav.close()
    if problemas:
        print(f"{len(problemas)} diferencias:")
        for x in problemas:
            print("  " + x)
        sys.exit(1)
    print("PARIDAD OK")


if __name__ == "__main__":
    main()

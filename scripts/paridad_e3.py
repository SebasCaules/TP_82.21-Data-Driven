"""Paridad de /e3/ con /e2/ (27/10, W1; PLAN.md del E3, «Frente web», y decisión N0-5).

    npm run build:e2 && npm run build:e3 && python3 scripts/paridad_e3.py [--hoja RUTA]

/e3/ es el tablero del E2 con la letra más grande: un zoom uniforme de factor k sobre toda la página
(e3/src/zoom.js), k = máx(1; mín(1,2; ancho / 1152; alto / 640)). Lo que se declara y se mide:

    /e3/ en una ventana W × H se ve igual que /e2/ en una ventana W/k × H/k, ampliado k veces.

1. Estático. e3/src/main.jsx importa src/estilos.css, e2/src/estilos_e2.css y src/fit.js; las vistas
   importan los componentes compartidos (e2/src/Banda.jsx, src/graficos.jsx); e3/src/estilos_e3.css no
   nombra ninguna clase del armazón (.lat*, .cuerpo, .e2-enc*, .e2-preg, .tarjeta, .kpi-*, .ban-*,
   .e2-banda, .tarjeta-dec, :root y otras del E2) ni usa !important fuera de @media print; y src/** y
   e2/** no cambian contra main.
2. Estilos calculados, dist-e2 contra dist-e3, a 1152×640, 1366×768, 1536×864 y 1920×1080: /e2/ abre en
   la ventana lógica (W/k × H/k) en la vista 4, /e3/ en W × H en la vista 5. Del riel, el encabezado, la
   pregunta, la banda, la tarjeta de decisión, la tarjeta central, la tarjeta del gráfico y el cuerpo:
   familia, peso, tamaño, interlineado, espaciado, mayúsculas, colores, bordes y padding iguales (los
   valores calculados son lógicos: el zoom no los cambia). Cajas del riel, el encabezado, la banda, la
   tarjeta de decisión y el cuerpo iguales, medidas en pantalla y divididas por k, con 0,5 px de
   tolerancia. k medido: el cociente del alto en pantalla de cada texto de un renglón (e3 / e2) y el del
   tamaño de letra efectivo (tamaño × zoom); tiene que dar el k declarado en todos.
3. Reglas 11 y 12 del E2, en cada vista de /e3/ y cada resolución: la pregunta en un renglón y de 74
   caracteres o menos; sin título (.titulo) ni pie (.pie-vista); a lo sumo un gráfico por vista (las
   vistas con contenido, exactamente uno); la tarjeta de decisión con una frase corta de 60 caracteres o
   menos; window.__fit() sin problemas. Las vistas esqueleto solo se montan (sin gráfico).
4. Hoja de contacto: /e2/ (vista 4) y /e3/ (vista 5) lado a lado, las dos a 1536 × 864, en
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
ARMAZON = re.compile(
    r"(:root\b|(?<![\w-])html\b|(?<![\w-])body\b|\.lat(?:-[\w-]+)?\b|\.cuerpo\b|\.principal\b|\.app\b|\.pant\b"
    r"|\.e2-[\w-]+|\.tarjeta(?:-dec)?\b|\.kpi-[\w-]+|\.ban-[\w-]+|\.par-[\w-]+|\.dec-[\w-]+|\.lienzo[\w-]*"
    r"|\.titulo\b|\.chico\b)")

PROPS = ["fontFamily", "fontWeight", "fontSize", "lineHeight", "letterSpacing", "textTransform", "color",
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
    # en la vista 4 del E2 la tarjeta central es un par antes → después: se compara la cifra de después
    ("tarjeta central · cifra", ".e2-central .par-despues .e2-cifra", ".e2-central .e2-cifra"),
    ("tarjeta central · frase", ".e2-central .e2-linea"),
    ("decisión", ".e2-banda > .tarjeta-dec"),
    ("decisión · rótulo", ".tarjeta-dec .kpi-lbl"),
    ("decisión · frase", ".tarjeta-dec .dec-llano"),
    ("tarjeta del gráfico", ".pant > .tarjeta"),
    ("tarjeta del gráfico · rótulo", ".pant > .tarjeta > .kpi-lbl"),
]
# Cajas que tienen que medir lo mismo (en px lógicos): no dependen del texto de la vista.
CAJAS = {"riel", "riel · marca", "riel · ítem", "encabezado", "encabezado · avance", "cuerpo", "vista", "banda",
         "decisión"}
# Para la caja del encabezado y de la marca, solo el alto y la posición: el ancho es el mismo por construcción.
# Textos de un renglón en las dos páginas: el cociente de sus altos en pantalla es k.
# Piezas sin texto (la miniatura y el avance): solo marco, fondo, relleno y caja.
SIN_TEXTO = {"encabezado · avance"}
PROPS_TEXTO = {"fontFamily", "fontWeight", "fontSize", "lineHeight", "letterSpacing", "textTransform", "color"}
# (El número del riel es un span en línea con interlineado normal: su alto se redondea y no sirve.)
UN_RENGLON = ["riel · nombre", "riel · ítem", "pregunta", "encabezado · dónde",
              "decisión · rótulo", "tarjeta central · cifra", "tarjeta del gráfico · rótulo"]

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
    css = (APP / "e3" / "src" / "estilos_e3.css").read_text()
    sin_com = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    # selectores: lo que va antes de cada «{» que no es un @-bloque
    for m in re.finditer(r"([^{}]+)\{", sin_com):
        sel = m.group(1).strip()
        if not sel or sel.startswith("@"):
            continue
        for s in sel.split(","):
            if ARMAZON.search(s):
                problemas.append(f"estático: estilos_e3.css nombra una clase del armazón: «{s.strip()}»")
    fuera_print = re.sub(r"@media\s+print\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}", "", sin_com)
    if "!important" in fuera_print:
        problemas.append("estático: estilos_e3.css usa !important fuera de @media print")
    r = subprocess.run(["git", "diff", "--quiet", "main", "--", "src", "e2"], cwd=APP)
    if r.returncode != 0:
        problemas.append("estático: src/** o e2/** cambiaron contra main")
    print("1. estático: " + ("bien" if not [p for p in problemas if p.startswith("estático")] else "con problemas"))


# ---------------------------------------------------------------- 2. estilos calculados

def calculados(nav, problemas):
    filas = []
    for w, h in RES:
        k = k_de(w, h)
        wl, hl = round(w / k), round(h / k)
        c2, p2, e2err = abrir(nav, E2, VISTA_E2, wl, hl)
        c3, p3, e3err = abrir(nav, E3, VISTA_E3, w, h)
        c2b, p2b, _ = abrir(nav, E2, VISTA_E2, w, h)          # /e2/ en la misma ventana: cuánto más grande
        try:
            s2 = [[x[0], x[1]] for x in PIEZAS]
            s3 = [[x[0], x[-1]] for x in PIEZAS]
            a = p2.evaluate(LEER, s2)
            b = p3.evaluate(LEER, s3)
            mismo = p2b.evaluate(LEER, s2)
            zoom = p3.evaluate("() => document.querySelector('.e3-vp')?.currentCSSZoom ?? 1")
        finally:
            c2.close(); c3.close(); c2b.close()
        res = f"{w}x{h}"
        for x in e2err + e3err:
            problemas.append(f"[{res}] consola: {x}")
        if abs(zoom - k) > 1e-3:
            problemas.append(f"[{res}] zoom de /e3/ {zoom:.4f}, se declaró k = {k:.4f}")
        ks = []
        for nombre, *_ in PIEZAS:
            x, y = a.get(nombre), b.get(nombre)
            if x is None or y is None:
                problemas.append(f"[{res}] {nombre}: falta en {'/e2/' if x is None else '/e3/'}")
                continue
            for prop in PROPS:
                if nombre in SIN_TEXTO and prop in PROPS_TEXTO:
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
                    if prop in ("fontSize", "lineHeight", "letterSpacing") or prop.startswith("padding") or prop.endswith("Width"):
                        try:
                            if abs(float(x["est"][prop].rstrip("px")) - float(y["est"][prop].rstrip("px"))) <= TOL:
                                continue
                        except ValueError:
                            pass
                    problemas.append(f"[{res}] {nombre} · {prop}: /e2/ {x['est'][prop]} · /e3/ {y['est'][prop]}")
            if nombre in CAJAS:
                ce = [v / k for v in y["caja"]]
                cmp = range(4) if nombre not in ("encabezado", "riel · marca") else (1, 3)
                for i in cmp:
                    if abs(ce[i] - x["caja"][i]) > TOL:
                        eje = "xywh"[i]
                        problemas.append(f"[{res}] caja de {nombre} · {eje}: /e2/ {x['caja'][i]:.2f} · /e3/ ÷ k {ce[i]:.2f}")
            if nombre in UN_RENGLON and x["caja"][3] > 0:
                ks.append(("alto", nombre, y["caja"][3] / x["caja"][3]))
            if nombre in SIN_TEXTO:
                continue
            fs2 = float(x["est"]["fontSize"].rstrip("px")) * x["zoom"]
            fs3 = float(y["est"]["fontSize"].rstrip("px")) * y["zoom"] * (zoom if y["zoom"] == 1 else 1)
            ks.append(("letra", nombre, fs3 / fs2))
        fuera = [(t, n, v) for t, n, v in ks if abs(v - k) > 0.01]
        for t, n, v in fuera:
            problemas.append(f"[{res}] k medido por {t} de {n}: {v:.4f}, se declaró {k:.4f}")
        kl = [v for t, _, v in ks if t == "letra"]
        ka = [v for t, _, v in ks if t == "alto"]
        # cuánto más grande que /e2/ en la misma ventana (informativo)
        mas = []
        for n in ("pregunta", "riel · ítem", "tarjeta central · cifra", "decisión · frase"):
            if mismo.get(n) and b.get(n):
                mas.append(f"{n} {float(b[n]['est']['fontSize'].rstrip('px')) * zoom / float(mismo[n]['est']['fontSize'].rstrip('px')):.2f}")
        filas.append(f"   {res}: k declarado {k:.4f} · ventana lógica {w / k:.1f} × {h / k:.1f} · "
                     f"k por letra {min(kl):.4f} a {max(kl):.4f} ({len(kl)} textos) · "
                     f"k por alto {min(ka):.4f} a {max(ka):.4f} ({len(ka)} renglones)\n"
                     f"      contra /e2/ en la misma ventana: {', '.join(mas)}")
    print("2. estilos calculados (/e2/ a W/k × H/k contra /e3/ a W × H):")
    print("\n".join(filas))


# ---------------------------------------------------------------- 3. reglas 11 y 12

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
    print(f"3. reglas 11 y 12: {vistos} vistas revisadas ({vistos - esqueletos} con contenido, {esqueletos} esqueletos) en {len(RES)} resoluciones")


# ---------------------------------------------------------------- 4. hoja de contacto

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
    print(f"4. hoja de contacto: {destino}")


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
            calculados(nav, problemas)
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

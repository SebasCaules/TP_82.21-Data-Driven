"""Captura una vista de /final/ y lista lo que se ve mal (18/11, fase 8 de la auditoría de dataviz, spec 1.6).

    python3 -I scripts/captura_vista.py V05 [--var dec.b,kpi.b] [--res 1920x1080 ...] [--out DIR] [--completo]
    python3 -I scripts/captura_vista.py --todas [--var ...] [--res ...] [--out DIR]

Sin --completo arma un HTML con esa sola vista (scripts/vite.final-vista.config.js con FINAL_VISTA; las demás quedan
como esqueleto, así un archivo roto de otro agente no rompe el armado) en una carpeta temporal propia de la corrida (se
pueden correr varias a la vez). Con --completo usa dist-final/index.html, armado antes con npm run build:final; --todas
recorre las quince y lo implica.

Abre file://…/index.html?var=…#vNN con Playwright (device_scale_factor 1, movimiento reducido) en cada --res (por
defecto 1920x1080 y 1280x720) y falla si:
  - hay errores de consola o de página, la vista no monta o queda como esqueleto;
  - window.__fit() (src/fit.js) informa desbordes;
  - dos textos (<text> de los SVG y textos HTML visibles, riel incluido) se pisan más de 2 px; se compara la caja de
    las letras (0,76 del cuerpo, centrada en el renglón), no la del renglón entero, para que dos renglones seguidos de un
    mismo párrafo no cuenten;
  - un texto se sale del lienzo (.fin-lienzo), de su SVG, de una caja que lo recorta (overflow hidden) o de la ventana;
  - un texto mide menos de 20 u (--fin-u de .e3-vp; el riel no cuenta);
  - en una ventana 16:9, el dibujo ocupa menos del 70 % o más del 95 % del alto del lienzo (spec 0.7). En las demás
    ventanas solo se informa.
Guarda vNN[-<var con guiones>]-WxH.png en --out (por defecto la carpeta de capturas de la fase 8), imprime los
hallazgos y termina con «RESULTADO: OK» o «RESULTADO: FALLA» (código 1).
"""
from __future__ import annotations

import argparse
import glob
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import Error as PWError
from playwright.sync_api import sync_playwright

APP = Path(__file__).resolve().parents[1]
CONFIG = APP / "scripts" / "vite.final-vista.config.js"
COMPLETO = APP / "dist-final" / "index.html"
OUT = Path("/Users/sebastiancaules/Desktop/ITBA/26-2C/FPDD/.workforce/auditoria-dataviz/fase-8/capturas")
RES_DEF = ["1920x1080", "1280x720"]
LLENA = (0.70, 0.95)
VISTAS = [f"V{i:02d}" for i in range(1, 16)]


def abrir_navegador(pw):
    """Chromium de Playwright; si no está instalado para esta versión, el Chrome del sistema o el último Chromium que
    haya en la caché de Playwright (copia de scripts/verificar_final.py)."""
    intentos = [dict(), dict(channel="chrome")]
    cache = Path.home() / "Library" / "Caches" / "ms-playwright"
    if not cache.exists():
        cache = Path.home() / ".cache" / "ms-playwright"
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


def armar(vista: str, carpeta: Path) -> Path:
    """El HTML de una sola vista en `carpeta`; corta con RESULTADO: FALLA si vite no arma."""
    vite = APP / "node_modules" / ".bin" / "vite"
    cmd = [str(vite)] if vite.exists() else ["npx", "vite"]
    cmd += ["build", "--config", str(CONFIG), "--outDir", str(carpeta)]
    r = subprocess.run(cmd, cwd=APP, env={**os.environ, "FINAL_VISTA": vista}, capture_output=True, text=True)
    html = carpeta / "index.html"
    if r.returncode != 0 or not html.exists():
        print(f"vite no armó {vista}:\n{(r.stderr or r.stdout).strip()[-2000:]}")
        print("RESULTADO: FALLA")
        sys.exit(1)
    return html


# ---------------------------------------------------------------- en la página

LISTO = r"""() => {
  const pant = document.querySelector('#root .pant')
  if (!pant) return false
  // Lienzo (src/graficos.jsx) dibuja después de medir su caja
  for (const c of document.querySelectorAll('.lienzo-pintura')) if (!c.children.length) return false
  return true
}"""

CHEQUEO = r"""(llena) => {
  const out = { pisan: [], fuera: [], chicos: [], info: [], fit: [], vista: null }
  const vp = document.querySelector('.e3-vp')
  const u = vp ? parseFloat(getComputedStyle(vp).getPropertyValue('--fin-u')) || 1 : 1
  const vw = innerWidth, vh = innerHeight
  if (document.querySelector('#root .e3-esqueleto')) out.vista = 'esqueleto'
  try { out.fit = window.__fit ? window.__fit().problemas.map((x) => `${x.tipo} ${x.detalle ?? ''}`.trim()) : ['sin window.__fit'] }
  catch (e) { out.fit = [`__fit falló: ${e}`] }

  const fuera = (el) => el.closest('.solo-lector, .chico, .e3-notas, .e3-negro, title, desc, style, script, defs, noscript')
  const ve = (el) => !el.checkVisibility || el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
  const zoom = (el) => el.currentCSSZoom ?? 1
  const corto = (t) => t.replace(/\s+/g, ' ').trim().slice(0, 40)
  const nombre = (el) => {
    if (!el) return '?'
    const c = typeof el.className === 'string' ? el.className.split(' ').filter(Boolean).slice(0, 2).join('.') : ''
    return el.tagName.toLowerCase() + (c ? '.' + c : '')
  }
  // la caja de las letras: 0,76 del cuerpo centrado en el renglón, todo el ancho
  const letras = (r, fz) => {
    const m = (r.top + r.bottom) / 2, a = Math.min(r.height, 0.76 * fz) / 2
    return { left: r.left, right: r.right, top: m - a, bottom: m + a }
  }
  const raiz = vp || document.body
  const textos = []
  for (const t of raiz.querySelectorAll('svg text')) {
    if (fuera(t) || !t.textContent.trim() || !ve(t)) continue
    const r = t.getBoundingClientRect()
    if (r.width < 0.5 || r.height < 0.5) continue
    const fs = parseFloat(getComputedStyle(t).fontSize)
    textos.push({ el: t, svg: true, txt: corto(t.textContent), fs, cajas: [letras(r, fs * zoom(t))] })
  }
  const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT)
  while (w.nextNode()) {
    const n = w.currentNode
    if (!n.textContent.trim()) continue
    const el = n.parentElement
    if (!el || el.closest('svg') || fuera(el) || !ve(el)) continue
    const rg = document.createRange(); rg.selectNodeContents(n)
    const rs = [...rg.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5)
    if (!rs.length) continue
    const fs = parseFloat(getComputedStyle(el).fontSize)
    textos.push({ el, svg: false, txt: corto(n.textContent), fs, cajas: rs.map((r) => letras(r, fs * zoom(el))) })
  }

  // (a) textos que se pisan
  const corta = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
                          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2
  for (let i = 0; i < textos.length; i++) {
    for (let j = i + 1; j < textos.length; j++) {
      const A = textos[i], B = textos[j]
      if (A.cajas.some((a) => B.cajas.some((b) => corta(a, b)))) out.pisan.push(`«${A.txt}» pisa «${B.txt}»`)
    }
  }

  // (b) textos fuera del lienzo, de su svg, de una caja que recorta o de la ventana
  const dentro = (c, r, tol = 2) => c.left >= r.left - tol && c.right <= r.right + tol && c.top >= r.top - tol && c.bottom <= r.bottom + tol
  for (const T of textos) {
    const lz = T.el.closest('.fin-lienzo')
    if (lz && !T.cajas.every((c) => dentro(c, lz.getBoundingClientRect()))) out.fuera.push(`«${T.txt}» se sale del lienzo`)
    if (T.svg) {
      let s = T.el.closest('svg'); while (s.parentElement?.closest('svg')) s = s.parentElement.closest('svg')
      if (!lz && !T.cajas.every((c) => dentro(c, s.getBoundingClientRect()))) out.fuera.push(`«${T.txt}» se sale de su svg`)
    } else {
      for (let a = T.el; a && a !== raiz; a = a.parentElement) {
        const cs = getComputedStyle(a)
        if (!/hidden|clip|auto|scroll/.test(cs.overflowX + cs.overflowY)) continue
        if (!T.cajas.every((c) => dentro(c, a.getBoundingClientRect()))) { out.fuera.push(`«${T.txt}» cortado por ${nombre(a)}`); break }
      }
    }
    if (!T.cajas.every((c) => dentro(c, { left: 0, top: 0, right: vw, bottom: vh }, 1))) out.fuera.push(`«${T.txt}» se sale de la ventana`)
  }

  // (c) letra por debajo de 20 u (el riel no cuenta)
  for (const T of textos) {
    if (T.el.closest('.lat')) continue
    if (T.fs < 20 * u - 0.05) out.chicos.push(`«${T.txt}» a ${(T.fs / u).toFixed(1)} u`)
  }

  // (d) qué parte del alto del lienzo ocupa el dibujo
  const lienzos = [...document.querySelectorAll('.fin-lienzo')].filter((l) => l.getBoundingClientRect().height > 0)
  out.lienzos = lienzos.map((lz) => {
    const lb = lz.getBoundingClientRect(), z = zoom(lz) * u
    let top = Infinity, bot = -Infinity
    for (const el of lz.querySelectorAll('svg *')) {
      const tag = el.tagName.toLowerCase()
      if (['g', 'svg', 'title', 'defs', 'tspan', 'desc', 'clippath', 'mask', 'marker', 'lineargradient',
           'radialgradient', 'stop', 'pattern', 'symbol'].includes(tag) || el.closest('defs')) continue
      const cs = getComputedStyle(el)
      if (!ve(el) || (cs.fill === 'none' && cs.stroke === 'none' && tag !== 'text')) continue
      const r = el.getBoundingClientRect()
      if (r.width < 0.5 && r.height < 0.5) continue
      top = Math.min(top, r.top); bot = Math.max(bot, r.bottom)
    }
    const parte = bot > top ? (Math.min(bot, lb.bottom) - Math.max(top, lb.top)) / lb.height : 0
    return { w: lb.width / z, h: lb.height / z, parte }
  })
  return out
}"""


def capturar(nav, html: Path, vista: str, var: str, w: int, h: int, out: Path) -> list[str]:
    malos: list[str] = []
    ctx = nav.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, reduced_motion="reduce")
    pg = ctx.new_page()
    pg.on("console", lambda m: m.type == "error" and malos.append(f"consola: {m.text[:200]}"))
    pg.on("pageerror", lambda e: malos.append(f"error de página: {str(e)[:200]}"))
    url = html.resolve().as_uri() + (f"?var={var}" if var else "") + f"#{vista.lower()}"
    try:
        pg.goto(url, wait_until="load")
        pg.wait_for_function(LISTO, timeout=15000)
        pg.evaluate("() => document.fonts.ready")
        pg.evaluate("() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))")
    except PWError as e:
        malos.append(f"la vista no montó: {str(e).splitlines()[0][:200]}")
    sufijo = f"-{re.sub(r'[^A-Za-z0-9]+', '-', var).strip('-')}" if var else ""
    png = out / f"{vista.lower()}{sufijo}-{w}x{h}.png"
    pg.screenshot(path=str(png))
    info = []
    try:
        c = pg.evaluate(CHEQUEO, list(LLENA))
    except PWError as e:
        c = None
        malos.append(f"el chequeo falló: {str(e).splitlines()[0][:200]}")
    if c:
        if c["vista"] == "esqueleto":
            malos.append("la vista quedó como esqueleto (sin default o no está en el armado)")
        malos += [f"__fit: {x}" for x in c["fit"]]
        malos += [f"se pisan: {x}" for x in c["pisan"]]
        malos += [f"fuera: {x}" for x in c["fuera"]]
        malos += [f"letra chica: {x}" for x in c["chicos"]]
        dieciseis = abs(w / h - 16 / 9) < 0.02
        for lz in c["lienzos"]:
            txt = f"lienzo {lz['w']:.0f} × {lz['h']:.0f} u, el dibujo ocupa el {lz['parte']:.0%} del alto"
            if dieciseis and not (LLENA[0] <= lz["parte"] <= LLENA[1]):
                malos.append(f"{txt} (se pide del {LLENA[0]:.0%} al {LLENA[1]:.0%})")
            else:
                info.append(txt)
    ctx.close()
    print(f"\n{vista} {w}x{h}{' · var=' + var if var else ''} → {png}")
    for x in info:
        print(f"  · {x}")
    for x in malos:
        print(f"  ✗ {x}")
    return [f"{vista} {w}x{h}: {x}" for x in malos]


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("vista", nargs="?", help="V01 a V15")
    ap.add_argument("--var", default="", help="cadena para ?var= (por ejemplo dec.b,kpi.b)")
    ap.add_argument("--res", action="append", help="WxH, repetible (por defecto 1920x1080 y 1280x720)")
    ap.add_argument("--out", default=str(OUT), help="carpeta de las capturas")
    ap.add_argument("--completo", action="store_true", help="usa dist-final/index.html (npm run build:final) sin armar")
    ap.add_argument("--todas", action="store_true", help="las quince vistas; implica --completo")
    a = ap.parse_args()

    if a.todas:
        vistas, a.completo = VISTAS, True
    else:
        if not a.vista or a.vista.upper() not in VISTAS:
            ap.error("falta la vista (V01 a V15) o --todas")
        vistas = [a.vista.upper()]
    res = []
    for r in a.res or RES_DEF:
        m = re.fullmatch(r"(\d+)[x×](\d+)", r.strip())
        if not m:
            ap.error(f"--res «{r}» no es WxH")
        res.append((int(m[1]), int(m[2])))
    var = a.var.strip().replace(" ", "")
    out = Path(a.out).expanduser().resolve()
    out.mkdir(parents=True, exist_ok=True)

    tmp = None
    if a.completo:
        if not COMPLETO.exists():
            print(f"No está {COMPLETO}: corra antes npm run build:final")
            print("RESULTADO: FALLA")
            sys.exit(1)
        html = COMPLETO
    else:
        tmp = Path(tempfile.mkdtemp(prefix=f"final-{vistas[0].lower()}-"))
        html = armar(vistas[0], tmp)

    problemas: list[str] = []
    try:
        with sync_playwright() as pw:
            nav = abrir_navegador(pw)
            for v in vistas:
                for w, h in res:
                    problemas += capturar(nav, html, v, var, w, h, out)
            nav.close()
    finally:
        if tmp:
            shutil.rmtree(tmp, ignore_errors=True)

    print()
    if problemas:
        print(f"{len(problemas)} problemas:")
        for x in problemas:
            print(f"  - {x}")
        print("RESULTADO: FALLA")
        sys.exit(1)
    print("RESULTADO: OK")


if __name__ == "__main__":
    main()

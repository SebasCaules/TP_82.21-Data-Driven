"""Verifica /e3/ (dist-e3/index.html), abierto por file://, sin servidor.

    npm run build:e3 && python3 scripts/verificar_e3.py [--capturas DIR] [--sin-capturas] [--sin-esqueletos]

(27/10, W1) Rehecho para el armazón del E2 (riel, encabezado con la pregunta, banda de cifras, zoom
uniforme de e3/src/zoom.js). La paridad con /e2/ la mide scripts/paridad_e3.py; esto cubre lo demás:

1. Cada vista del riel (V01 a V09 y A1 a A7) a 1152×640, 1280×720, 1366×768, 1536×864 y 1920×1080:
   - monta, la página no scrollea y window.__fit() (src/fit.js) no encuentra desbordes;
   - el zoom es el declarado: k = máx(1; mín(1,2; ancho / 1152; alto / 640));
   - las vistas con contenido no muestran controles sin abrir «Explorar» (W1: solo la 5). Las vistas
     esqueleto solo se montan: su contenido se verifica cuando W2 y W3 las construyan. Con
     --sin-esqueletos, una vista que todavía muestre .e3-esqueleto es un problema (obligatorio antes de
     exportar: el esqueleto dice «se arma en la etapa siguiente» y la tecla I lo imprime);
   - cada rótulo de la banda de cifras entra en una línea, como en el E2 (un rótulo partido baja la
     cifra de su tarjeta y la desalinea de las otras).
2. Cero errores de consola y cero pedidos de red (solo el propio archivo).
3. Recorrido de quien presenta (a 1536×864): → y ← de punta a punta, Av Pág y Re Pág, Inicio y Fin, una
   tecla mantenida no recorre, la URL sigue a la vista (recargar y Atrás), N abre las notas con el guion
   de C3 sin tapar el tablero, «.» y B ponen la pantalla en negro y cualquier tecla vuelve sin cambiar de
   vista, F5 no recarga, el riel lleva a cada vista, dos ventanas se siguen y la ventana de notas
   (?notas) sigue a la del tablero. A 1366×768 y 1536×864, el guion de cada vista entra en el panel de
   notas sin desplazar.
4. Capturas de cada vista con contenido a 1280×720 y 1920×1080 en e3/capturas-verif/ (fuera del
   control de versiones).

Termina con «E3 OK» o con la lista de problemas y código 1.
"""
from __future__ import annotations

import argparse
import glob
import sys
from pathlib import Path

from playwright.sync_api import Error as PWError
from playwright.sync_api import sync_playwright

APP = Path(__file__).resolve().parents[1]
HTML = APP / "dist-e3" / "index.html"
RES = [(1152, 640), (1280, 720), (1366, 768), (1536, 864), (1920, 1080)]
CAPTURAR = {(1280, 720), (1920, 1080)}
NOTAS_RES = {(1366, 768), (1536, 864)}   # laptops donde se ensaya con el panel de notas
HISTORIA = [f"v{i:02d}" for i in range(1, 10)]
RESPALDO = [f"a{i}" for i in range(1, 8)]
VISTAS = HISTORIA + RESPALDO


def k_de(w, h):
    return max(1.0, min(1.2, w / 1152, h / 640))


CHEQUEO = r"""() => {
  const p = []
  if (!document.querySelector('.cuerpo .pant')) return { problemas: ['sin vista montada'], esqueleto: false }
  const se = document.scrollingElement
  if (se.scrollHeight > se.clientHeight + 1 || se.scrollWidth > se.clientWidth + 1) p.push('la página scrollea')
  const fit = window.__fit()
  for (const x of fit.problemas) p.push(`__fit: ${x.tipo} ${x.detalle ?? ''}`)
  const esqueleto = !!document.querySelector('.cuerpo .e3-esqueleto')
  for (const s of document.querySelectorAll('.cuerpo .e2-banda .kpi-lbl > span')) {
    const lh = parseFloat(getComputedStyle(s).lineHeight) || parseFloat(getComputedStyle(s).fontSize) * 1.2
    if (s.getClientRects().length > 1 || s.getBoundingClientRect().height > lh * 1.5)
      p.push(`rótulo de la banda en dos renglones: «${s.textContent}»`)
  }
  if (!esqueleto && document.querySelector('.cuerpo [role=slider], .cuerpo .e3-opciones'))
    p.push('controles a la vista sin abrir «Explorar»')
  return { problemas: p, esqueleto, zoom: document.querySelector('.e3-vp')?.currentCSSZoom ?? 1 }
}"""

ESTADO = r"""() => ({
  hash: location.hash,
  negro: !!document.querySelector('.e3-negro'),
  notas: !!document.querySelector('.e3-notas'),
  activa: document.querySelector('.lat-item.on .lat-n')?.textContent.trim() ?? '',
})"""


def abrir_navegador(pw):
    """Chromium de Playwright; si no está instalado para esta versión, el Chrome del sistema o el
    último Chromium que haya en la caché de Playwright."""
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


class Pagina:
    def __init__(self, nav, w, h, problemas):
        self.url = HTML.resolve().as_uri()
        self.ctx = nav.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, reduced_motion="reduce")
        self.pg = self.vigilar(self.ctx.new_page())
        self.res = f"{w}x{h}"
        self.problemas = problemas

    def vigilar(self, pg):
        pg.on("console", lambda m: m.type == "error" and self.mal(f"consola: {m.text[:160]}"))
        pg.on("pageerror", lambda e: self.mal(f"error de página: {str(e)[:160]}"))
        pg.on("request", self._pedido)
        return pg

    def _pedido(self, req):
        u = req.url
        if u.startswith("data:") or u.split("#")[0].split("?")[0] == self.url:
            return
        self.mal(f"pedido de red: {u[:120]}")

    def mal(self, texto):
        self.problemas.append(f"[{self.res}] {texto}")

    def quieto(self, ms=60, pg=None):
        pg = pg or self.pg
        pg.wait_for_timeout(ms)
        pg.wait_for_function("() => !document.querySelector(':root:active-view-transition') && "
                             "document.getAnimations().every((a) => a.playState !== 'running')", timeout=5000)

    def ir(self, id_):
        self.pg.goto(f"{self.url}#{id_}")
        self.pg.wait_for_selector(".cuerpo .pant", timeout=10000)
        self.quieto(150)

    def estado(self):
        return self.pg.evaluate(ESTADO)

    def tecla(self, k, n=1):
        for _ in range(n):
            self.pg.keyboard.press(k)
            self.quieto(40)

    def cerrar(self):
        self.ctx.close()


def vistas(p: Pagina, w, h, out, capturar, sin_esqueletos=False):
    k = k_de(w, h)
    for id_ in VISTAS:
        p.ir(id_)
        if p.estado()["hash"] != f"#{id_}":
            p.mal(f"#{id_} no se abre")
        r = p.pg.evaluate(CHEQUEO)
        for x in r["problemas"]:
            p.mal(f"{id_}: {x}")
        if sin_esqueletos and r["esqueleto"]:
            p.mal(f"{id_}: sigue siendo esqueleto («se arma en la etapa siguiente»)")
        if abs(r.get("zoom", 1) - k) > 1e-3:
            p.mal(f"{id_}: zoom {r.get('zoom')}, se esperaba {k:.4f}")
        if capturar and not r["esqueleto"]:
            p.pg.screenshot(path=str(out / f"{id_}-{w}x{h}.png"))


def notas_entran(p: Pagina, w, h):
    """Con N abierto, el guion de cada vista y la línea «Sigue» entran en el panel sin desplazar."""
    p.ir("v01")
    p.tecla("n")
    for id_ in VISTAS:
        p.ir(id_)
        r = p.pg.evaluate("() => { const n = document.querySelector('.e3-notas');"
                          " return n ? { sh: n.scrollHeight, ch: n.clientHeight } : null }")
        if r is None:
            p.mal(f"notas {w}x{h}: el panel no queda abierto en #{id_}")
        elif r["sh"] > r["ch"] + 1:
            p.mal(f"notas {w}x{h}: el guion de #{id_} no entra en el panel ({r['sh']} > {r['ch']} px)")
    p.tecla("n")


def recorrido(p: Pagina):
    def esperar(cond, texto):
        if not cond:
            p.mal(f"recorrido: {texto} (estado {p.estado()})")

    p.ir("v01")
    adelante = []
    for _ in range(len(VISTAS)):
        p.tecla("ArrowRight")
        adelante.append(p.estado()["hash"])
    esperar(adelante == [f"#{v}" for v in VISTAS[1:]] + [f"#{VISTAS[-1]}"], f"→ de punta a punta dio {adelante}")
    atras = []
    for _ in range(len(VISTAS) - 1):
        p.tecla("ArrowLeft")
        atras.append(p.estado()["hash"])
    esperar(atras == [f"#{v}" for v in reversed(VISTAS[:-1])], f"← de punta a punta dio {atras}")
    p.ir("v04")
    p.tecla("PageDown")
    esperar(p.estado()["hash"] == "#v05", "Av Pág no pasa a la vista siguiente")
    p.tecla("PageUp")
    esperar(p.estado()["hash"] == "#v04", "Re Pág no vuelve a la anterior")
    p.tecla("End")
    esperar(p.estado()["hash"] == f"#{VISTAS[-1]}", "Fin no lleva a la última")
    p.tecla("Home")
    esperar(p.estado()["hash"] == "#v01", "Inicio no lleva a la primera")
    # una tecla mantenida (el control remoto repite) no recorre el tablero
    p.ir("v01")
    for _ in range(10):
        p.pg.keyboard.down("PageDown")
        p.pg.wait_for_timeout(20)
    p.pg.keyboard.up("PageDown")
    p.quieto()
    esperar(p.estado()["hash"] == "#v02", f"Av Pág mantenida desde la 1 llega a {p.estado()['hash']}")
    # el riel lleva a cada vista y la marca la activa
    p.ir("v01")
    p.pg.locator(".lat-item", has_text="Se paga").click()
    p.quieto()
    esperar(p.estado()["hash"] == "#v05" and p.estado()["activa"] == "05", "el riel no lleva a la 5")
    p.pg.locator(".lat-item", has_text="Matriz de riesgos").click()
    p.quieto()
    esperar(p.estado()["hash"] == "#a4", "el riel no lleva al A4")
    # con el foco en el riel después de un clic, las flechas siguen pasando de vista
    p.tecla("ArrowUp")
    esperar(p.estado()["hash"] == "#a3", "con el foco en el riel, ↑ no vuelve a la anterior")
    # URL: recargar no pierde el lugar; Atrás recorre
    p.pg.reload()
    p.quieto(200)
    esperar(p.estado()["hash"] == "#a3", "recargar pierde la vista")
    p.pg.go_back()
    p.quieto(200)
    esperar(p.estado()["hash"] == "#a4", "Atrás del navegador no vuelve a la vista anterior")
    # notas: N las abre con el guion de C3 y no tapan el tablero
    p.ir("v05")
    p.tecla("n")
    esperar(p.estado()["notas"], "N no abre las notas")
    if p.estado()["notas"]:
        vp = p.pg.locator(".e3-vp").bounding_box()
        notas = p.pg.locator(".e3-notas").bounding_box()
        esperar(vp["y"] + vp["height"] <= notas["y"] + 1, "las notas tapan el tablero")
        txt = p.pg.locator(".e3-notas").inner_text()
        esperar("Francisco C." in txt and "dólares" in txt, "las notas de la 5 no traen el guion de las diapositivas 8 y 9")
        fit = p.pg.evaluate("() => window.__fit().problemas.filter((x) => !/scroll-contenedor/.test(x.tipo) || !/e3-notas/.test(x.detalle))")
        esperar(not fit, f"con las notas abiertas el tablero desborda: {fit}")
        # el riel no se encima con su pie: la ventana lógica sigue en 640 de alto o más
        riel = p.pg.evaluate("() => { const l = [...document.querySelectorAll('.lat-item')].pop().getBoundingClientRect();"
                             " const pie = document.querySelector('.lat-pie').getBoundingClientRect(); return l.bottom <= pie.top + 1 }")
        esperar(riel, "con las notas abiertas el riel se encima con su pie")
        p.tecla("n")
        esperar(not p.estado()["notas"], "N no cierra las notas")
    # pantalla en negro: «.» y B; cualquier tecla vuelve sin cambiar de vista
    for k in (".", "b"):
        p.tecla(k)
        esperar(p.estado()["negro"], f"«{k}» no pone la pantalla en negro")
        p.tecla("PageDown")
        e = p.estado()
        esperar(not e["negro"] and e["hash"] == "#v05", f"después de «{k}», una tecla no vuelve o cambia de vista")
    # F5 (el botón del control remoto) no recarga
    p.pg.evaluate("() => { window.__sin_recarga = 1 }")
    p.tecla("F5")
    esperar(p.pg.evaluate("() => window.__sin_recarga === 1") and p.estado()["hash"] == "#v05", "F5 recarga la página")
    # dos ventanas se siguen; la de notas (?notas) sigue al tablero
    p.ir("v05")
    otra = p.vigilar(p.ctx.new_page())
    otra.goto(f"{p.url}#v01")
    otra.wait_for_selector(".cuerpo .pant")
    otra.wait_for_timeout(300)
    esperar(otra.evaluate("() => location.hash") == "#v05", f"la ventana nueva no toma la vista de la abierta ({otra.evaluate('() => location.hash')})")
    p.tecla("PageDown")
    otra.wait_for_timeout(400)
    esperar(otra.evaluate("() => location.hash") == "#v06", "la otra ventana no sigue a la 6")
    otra.keyboard.press("PageUp")
    otra.wait_for_timeout(400)
    esperar(p.estado()["hash"] == "#v05", "la primera ventana no sigue a la otra")
    otra.close()
    notas = p.vigilar(p.ctx.new_page())
    notas.goto(f"{p.url}?notas#v01")
    notas.wait_for_selector(".e3-notas-ventana")
    notas.wait_for_timeout(300)
    esperar("¿Se paga?" in notas.inner_text(".e3-notas-ventana"), "la ventana de notas no toma la vista abierta")
    p.tecla("PageDown")
    notas.wait_for_timeout(400)
    esperar("¿Es legal y seguro?" in notas.inner_text(".e3-notas-ventana"), "la ventana de notas no sigue al tablero")
    notas.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--capturas", default=str(APP / "e3" / "capturas-verif"))
    ap.add_argument("--sin-capturas", action="store_true")
    ap.add_argument("--sin-esqueletos", action="store_true",
                    help="falla si alguna vista sigue como esqueleto (obligatorio desde W3 y antes de exportar)")
    a = ap.parse_args()
    if not HTML.exists():
        sys.exit(f"Falta {HTML.relative_to(APP)}: corre «npm run build:e3».")
    out = Path(a.capturas)
    if not a.sin_capturas:
        out.mkdir(parents=True, exist_ok=True)
    problemas: list[str] = []
    with sync_playwright() as pw:
        nav = abrir_navegador(pw)
        for w, h in RES:
            p = Pagina(nav, w, h, problemas)
            try:
                vistas(p, w, h, out, (w, h) in CAPTURAR and not a.sin_capturas, a.sin_esqueletos)
                if (w, h) in NOTAS_RES:
                    notas_entran(p, w, h)
                if (w, h) == (1536, 864):
                    recorrido(p)
            except PWError as e:
                p.mal(f"excepción de Playwright: {str(e).splitlines()[0][:160]}")
            finally:
                p.cerrar()
        nav.close()
    if problemas:
        print(f"{len(problemas)} problemas:")
        for x in problemas:
            print("  " + x)
        sys.exit(1)
    if not a.sin_capturas:
        print(f"capturas en {out}")
    print("E3 OK")


if __name__ == "__main__":
    main()

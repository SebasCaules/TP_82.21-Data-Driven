"""Verifica la presentación interactiva del E3 (dist-e3/index.html), abierta por file://, sin servidor.

    npm run build:e3 && python3 scripts/verificar_e3.py [--capturas DIR] [--sin-capturas]

1. Cada diapositiva (1 a 12) y cada anexo (A1 a A6), en su estado completo, a 1024×768, 1280×720,
   1366×768, 1440×900 y 1920×1080:
   - el escenario entra entero en la ventana y la página no scrollea;
   - nada se sale del escenario;
   - ningún texto ni elemento se sale de su caja (tarjeta, panel, celda, botón, gráfico);
   - ningún par de textos de bloques distintos se superpone;
   - ningún elemento con overflow oculto recorta su contenido.
2. Cero errores de consola y cero pedidos de red (solo el propio archivo).
3. Recorrido por teclado: → hasta el final con los pasos, ← hasta el inicio, Av Pág y Re Pág, Espacio y
   Retroceso, número y Enter, Inicio y Fin, O (vista general), A (anexos y vuelta a la diapositiva de
   origen), N (notas sin tapar el escenario), ? (ayuda), Atrás del navegador, recarga, y clic en las
   franjas laterales y sobre un control.
4. Cada control a sus extremos (diapositivas 4, 6, 7, 9 y 11), con el mismo control de desborde, y la
   vuelta al valor inicial al salir de la diapositiva.
5. Capturas de cada página a 1280×720 y 1920×1080 en e3/capturas-verif/ (fuera del control de versiones).

Termina con «E3 OK» o con la lista de problemas y código 1.
"""
from __future__ import annotations

import argparse
import glob
import os
import sys
from pathlib import Path

from playwright.sync_api import Error as PWError
from playwright.sync_api import sync_playwright

APP = Path(__file__).resolve().parents[1]
HTML = APP / "dist-e3" / "index.html"
RES = [(1024, 768), (1280, 720), (1366, 768), (1440, 900), (1920, 1080)]
CAPTURAR = {(1280, 720), (1920, 1080)}
DIAPOS = [str(i) for i in range(1, 13)]
ANEXOS = [f"a{i}" for i in range(1, 7)]
PAGINAS = DIAPOS + ANEXOS
PASOS = {"3": 3, "6": 3}

CHEQUEO = r"""() => {
  const p = []
  const esc = document.querySelector('.e3-escenario')
  const pag = esc && esc.querySelector('.e3-pagina')
  if (!pag) return ['sin página montada']
  const tol = 1.5
  const E = esc.getBoundingClientRect()
  if (E.left < -tol || E.top < -tol || E.right > innerWidth + tol || E.bottom > innerHeight + tol)
    p.push('escenario fuera de la ventana: ' + [E.left, E.top, E.right, E.bottom].map(Math.round).join(','))
  const se = document.scrollingElement
  if (se.scrollHeight > se.clientHeight + 1 || se.scrollWidth > se.clientWidth + 1) p.push('la página scrollea')
  const visible = (el) => !el.checkVisibility || el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
  const nombre = (el) => {
    const c = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.')
    return el.tagName.toLowerCase() + (c ? '.' + c : '') + ' «' + (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 36) + '»'
  }
  const fuera = (r, c) => r.left < c.left - tol || r.right > c.right + tol || r.top < c.top - tol || r.bottom > c.bottom + tol
  // 1. nada fuera del escenario
  for (const el of pag.querySelectorAll('*')) {
    if (el.closest('defs, pattern, marker, title')) continue
    if (!visible(el)) continue
    const r = el.getBoundingClientRect()
    if (r.width <= 0 && r.height <= 0) continue
    if (fuera(r, E)) p.push('fuera del escenario: ' + nombre(el))
  }
  // 2. fragmentos de texto, con su bloque y su caja
  const CAJAS = '.e3-tarjeta, .e3-panel, .e3-decision, .e3-figura, .e3-sim, .e3-celda, .e3-dim, .e3-accion, ' +
    '.e3-alerta, .e3-promedio, .e3-hecho, .e3-llamada, .e3-boton, .e3-volver, .e3-opciones button, td, th, ' +
    '.e3-pie, .e3-matriz-celda, .e3-chip, .e3-desliz, .e3-escala, .e3-fila'
  const frags = []
  const w = document.createTreeWalker(pag, NodeFilter.SHOW_TEXT)
  let n
  while ((n = w.nextNode())) {
    if (!n.textContent.trim()) continue
    const el = n.parentElement
    if (!el || el.closest('defs, title') || !visible(el)) continue
    const texto = n.textContent.trim().slice(0, 40)
    const t = el.closest('text')
    if (t) {
      frags.push({ r: t.getBoundingClientRect(), bloque: t, caja: t.closest('svg'), texto })
      continue
    }
    let bloque = el
    while (bloque !== pag && ['inline', 'contents'].includes(getComputedStyle(bloque).display)) bloque = bloque.parentElement
    const rg = document.createRange()
    rg.selectNodeContents(n)
    for (const r of rg.getClientRects()) if (r.width > 0.5 && r.height > 0.5) frags.push({ r, bloque, caja: el.closest(CAJAS), texto })
  }
  for (const f of frags) if (f.caja && fuera(f.r, f.caja.getBoundingClientRect())) p.push('texto desbordado de ' + nombre(f.caja).slice(0, 50) + ': «' + f.texto + '»')
  // 2b. ningún elemento se sale de la caja que lo contiene (tarjeta, panel, celda, gráfico)
  const CONTENEDORES = '.e3-matriz-celda, .e3-tarjeta, .e3-panel, .e3-sim, .e3-celda, .e3-llamada, .e3-alerta, ' +
    '.e3-hecho, .e3-dim, .e3-accion, .e3-decision, .e3-figura, .e3-promedio'
  for (const el of pag.querySelectorAll('*')) {
    if (el.closest('defs, pattern, marker, title') || !visible(el)) continue
    const c = el.parentElement && el.parentElement.closest(CONTENEDORES)
    if (!c) continue
    const r = el.getBoundingClientRect()
    if (r.width <= 0 && r.height <= 0) continue
    if (fuera(r, c.getBoundingClientRect())) p.push('se sale de ' + nombre(c).slice(0, 40) + ': ' + nombre(el))
  }
  // 3. superposición entre textos de bloques distintos
  for (let i = 0; i < frags.length; i++) for (let j = i + 1; j < frags.length; j++) {
    const a = frags[i], b = frags[j]
    if (a.bloque === b.bloque) continue
    const ix = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left)
    const iy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top)
    if (ix > 2 && iy > Math.max(2, 0.25 * Math.min(a.r.height, b.r.height))) p.push('textos superpuestos: «' + a.texto + '» y «' + b.texto + '»')
  }
  // 4. contenido recortado por un overflow oculto
  for (const el of pag.querySelectorAll('*')) {
    if (el instanceof SVGElement || !visible(el)) continue
    const cs = getComputedStyle(el)
    if (!/hidden|clip|auto|scroll/.test(cs.overflow)) continue
    if (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) p.push('recorta su contenido: ' + nombre(el))
  }
  return [...new Set(p)]
}"""

ESTADO = r"""() => ({
  hash: location.hash,
  paso: document.querySelectorAll('.e3-escenario .e3-pasos i.on').length,
  pasos: document.querySelectorAll('.e3-escenario .e3-pasos i').length,
  general: !!document.querySelector('.e3-general'),
  anexos: !!document.querySelector('.e3-anexos'),
  ayuda: !!document.querySelector('.e3-ayuda'),
  notas: !!document.querySelector('.e3-notas'),
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
        self.pg = self.ctx.new_page()
        self.res = f"{w}x{h}"
        self.problemas = problemas
        self.pg.on("console", lambda m: m.type == "error" and self.mal(f"consola: {m.text[:160]}"))
        self.pg.on("pageerror", lambda e: self.mal(f"error de página: {str(e)[:160]}"))
        self.pg.on("request", self._pedido)

    def _pedido(self, req):
        u = req.url
        if u.startswith("data:") or u.split("#")[0] == self.url:
            return
        self.mal(f"pedido de red: {u[:120]}")

    def mal(self, texto):
        self.problemas.append(f"[{self.res}] {texto}")

    def ir(self, id_):
        self.pg.goto(f"{self.url}#{id_}")
        self.pg.wait_for_selector(".e3-escenario .e3-pagina", timeout=10000)
        self.quieto()

    def quieto(self, ms=60):
        self.pg.wait_for_timeout(ms)
        self.pg.wait_for_function("() => document.getAnimations().every((a) => a.playState !== 'running')", timeout=5000)

    def chequear(self, donde):
        for x in self.pg.evaluate(CHEQUEO):
            self.mal(f"{donde}: {x}")

    def estado(self):
        return self.pg.evaluate(ESTADO)

    def tecla(self, k, n=1):
        for _ in range(n):
            self.pg.keyboard.press(k)
            self.quieto(30)

    def cerrar(self):
        self.ctx.close()


def recorrido(p: Pagina):
    """Navegación por teclado y por clic a una resolución."""
    def esperar(cond, texto):
        if not cond:
            p.mal(f"navegación: {texto} (estado {p.estado()})")

    p.ir("1")
    secuencia = []
    for _ in range(sum(PASOS.values()) - len(PASOS) + len(DIAPOS) - 1 + 1):
        p.tecla("ArrowRight")
        e = p.estado()
        secuencia.append((e["hash"], e["paso"]))
    esperada = []
    for d in DIAPOS[1:]:
        if d in PASOS:
            esperada += [(f"#{d}", k) for k in range(1, PASOS[d] + 1)]
        else:
            esperada.append((f"#{d}", 0))
    esperada.append(("#12", 0))           # → en la 12 no sigue de largo
    esperar(secuencia == esperada, f"→ hasta el final dio {secuencia}, se esperaba {esperada}")
    atras = []
    for _ in range(len(esperada) - 1):
        p.tecla("ArrowLeft")
        e = p.estado()
        atras.append((e["hash"], e["paso"]))
    esperada_atras = []
    for d in reversed(DIAPOS[:-1]):
        if d in PASOS:
            esperada_atras += [(f"#{d}", k) for k in range(PASOS[d], 0, -1)]
        else:
            esperada_atras.append((f"#{d}", 0))
    esperar(atras == esperada_atras, f"← hasta el inicio dio {atras}, se esperaba {esperada_atras}")
    p.tecla("PageDown")
    esperar(p.estado()["hash"] == "#2", "Av Pág desde la 1 no lleva a la 2")
    p.tecla("PageUp")
    esperar(p.estado()["hash"] == "#1", "Re Pág desde la 2 no vuelve a la 1")
    p.tecla("Space")
    esperar(p.estado()["hash"] == "#2", "Espacio no avanza")
    p.tecla("Backspace")
    esperar(p.estado()["hash"] == "#1", "Retroceso no retrocede")
    p.tecla("7")
    esperar(p.pg.locator(".e3-buffer").count() == 1, "el número tipeado no se muestra")
    p.tecla("Enter")
    esperar(p.estado()["hash"] == "#7", "7 y Enter no lleva a la 7")
    p.tecla("1")
    p.tecla("1")
    p.tecla("Enter")
    esperar(p.estado()["hash"] == "#11", "11 y Enter no lleva a la 11")
    p.tecla("End")
    esperar(p.estado()["hash"] == "#12", "Fin no lleva a la 12")
    p.tecla("Home")
    esperar(p.estado()["hash"] == "#1", "Inicio no lleva a la 1")
    # pasos: llegar hacia adelante muestra el paso 1; llegar hacia atrás, la diapositiva completa
    p.ir("2")
    p.tecla("ArrowRight")
    esperar(p.estado()["paso"] == 1, "al llegar a la 3 con → no arranca en el paso 1")
    p.ir("4")
    p.tecla("ArrowLeft")
    esperar(p.estado()["paso"] == 3, "al volver a la 3 con ← no se ve completa")
    # vista general
    p.ir("5")
    p.tecla("o")
    e = p.estado()
    esperar(e["general"], "O no abre la vista general")
    if e["general"]:
        n = p.pg.locator(".e3-mini").count()
        esperar(n == len(PAGINAS), f"la vista general tiene {n} miniaturas y no {len(PAGINAS)}")
        p.tecla("ArrowRight")
        p.tecla("Enter")
        e = p.estado()
        esperar(not e["general"] and e["hash"] == "#6", "flecha y Enter en la vista general no llevan a la 6")
        if e["hash"] == "#6":
            esperar(e["paso"] == 3, "desde la vista general la 6 no se ve completa")
    p.tecla("Escape")
    esperar(p.estado()["general"], "Esc no abre la vista general")
    p.tecla("Escape")
    esperar(not p.estado()["general"], "Esc no cierra la vista general")
    p.pg.keyboard.press("o")
    p.quieto()
    if p.estado()["general"]:
        p.pg.locator(".e3-mini").nth(12 + 1).click()   # A2
        p.quieto()
        esperar(p.estado()["hash"] == "#a2", "clic en la miniatura del A2 no lleva al A2")
        p.tecla("ArrowLeft")
        esperar(p.estado()["hash"] == "#6", "← en el A2 no vuelve a la diapositiva de origen (6)")
    # anexos
    p.ir("8")
    p.tecla("a")
    esperar(p.estado()["anexos"], "A no abre la lista de anexos")
    p.tecla("3")
    e = p.estado()
    esperar(e["hash"] == "#a3" and not e["anexos"], "3 en la lista de anexos no abre el A3")
    p.tecla("ArrowRight")
    esperar(p.estado()["hash"] == "#a4", "→ en el A3 no pasa al A4")
    p.pg.reload()
    p.quieto(200)
    esperar(p.estado()["hash"] == "#a4", "recargar el A4 pierde el lugar")
    btn = p.pg.locator(".e3-volver")
    esperar(btn.count() == 1 and "8" in btn.inner_text(), "el A4 no ofrece volver a la 8 después de recargar")
    if btn.count():
        btn.click()
        p.quieto()
        esperar(p.estado()["hash"] == "#8", "«Volver» en el A4 no lleva a la 8")
    p.pg.go_back()
    p.quieto(150)
    esperar(p.estado()["hash"] == "#a4", "Atrás del navegador no recorre las páginas")
    p.ir("8")
    p.tecla("a")
    p.tecla("Escape")
    esperar(not p.estado()["anexos"], "Esc no cierra la lista de anexos")
    # notas
    p.ir("3")
    p.tecla("n")
    esperar(p.estado()["notas"], "N no abre las notas")
    if p.estado()["notas"]:
        esc = p.pg.locator(".e3-escenario").bounding_box()
        notas = p.pg.locator(".e3-notas").bounding_box()
        titulo = p.pg.locator(".e3-escenario .e3-titulo").bounding_box()
        esperar(esc["y"] + esc["height"] <= notas["y"] + 1, "las notas tapan el escenario")
        esperar(titulo["y"] >= 0 and titulo["y"] + titulo["height"] <= notas["y"], "las notas tapan el título")
        esperar(p.pg.locator(".e3-notas .e3-notas-paso").count() == 3, "las notas de la 3 no marcan sus tres pasos")
        p.chequear("3 con notas")
        p.tecla("n")
        esperar(not p.estado()["notas"], "N no cierra las notas")
    # ayuda
    p.tecla("?")
    esperar(p.estado()["ayuda"], "? no abre la ayuda")
    p.tecla("Escape")
    esperar(not p.estado()["ayuda"], "Esc no cierra la ayuda")
    # clic en las franjas y sobre un control
    p.ir("5")
    caja = p.pg.locator(".e3-escenario").bounding_box()
    p.pg.mouse.click(caja["x"] + caja["width"] * 0.9, caja["y"] + caja["height"] * 0.12)
    p.quieto()
    esperar(p.estado()["hash"] == "#6", "clic en la franja derecha no avanza")
    p.pg.mouse.click(caja["x"] + caja["width"] * 0.1, caja["y"] + caja["height"] * 0.12)
    p.quieto()
    esperar(p.estado()["hash"] == "#5", "clic en la franja izquierda no retrocede")
    p.ir("2")
    p.pg.locator(".e3-veredicto").nth(3).click()
    p.quieto()
    esperar(p.estado()["hash"] == "#9", "la tarjeta del riesgo más crítico no lleva a la 9")
    p.ir("2")
    p.pg.locator(".e3-veredicto").nth(1).click()
    p.quieto()
    esperar(p.estado()["hash"] == "#10", "la tarjeta Legal no lleva a la 10")
    # un control con foco atiende las flechas; Esc le saca el foco
    p.ir("6")
    p.pg.locator(".e3-opciones [role=radio]").first.focus()
    p.tecla("ArrowRight")
    e = p.estado()
    esperar(e["hash"] == "#6" and p.pg.locator(".e3-opciones [role=radio][aria-checked=true]").inner_text() == "Entrenamiento",
            "con foco en el selector, → no lo mueve (o pasa de diapositiva)")
    p.tecla("Escape")
    p.tecla("ArrowRight")
    esperar(p.estado()["hash"] == "#7", "después de Esc, → no pasa de diapositiva")


def controles(p: Pagina):
    """Cada control a sus extremos, con el chequeo de desborde."""
    # 4: cada condición resaltada
    p.ir("4")
    for k in range(p.pg.locator(".e3-cond").count()):
        p.pg.locator(".e3-cond").nth(k).hover()
        p.quieto(20)
        if p.pg.locator(".e3-fila.on").count() != 1:
            p.mal("4: pasar el puntero por una condición no resalta su fila")
        p.chequear(f"4 condición {k + 1}")
    # 6: entrenamiento
    p.ir("6")
    p.pg.get_by_role("radio", name="Entrenamiento").click()
    p.quieto()
    p.chequear("6 entrenamiento")
    # 7: todos los filtros y largos
    p.ir("7")
    for filtro in ("Sin filtro", "Solo contactables"):
        p.pg.get_by_role("radio", name=filtro).click()
        largos = p.pg.locator(".e3-opciones[aria-label='Largo de la lista por mes'] [role=radio]")
        for k in range(largos.count()):
            if largos.nth(k).is_disabled():
                continue
            largos.nth(k).click()
            p.quieto(20)
            p.chequear(f"7 {filtro} {largos.nth(k).inner_text()}")
    # 9: la tasa de éxito en sus extremos, en cada marca, con y sin descuento
    p.ir("9")
    inicial = p.pg.locator(".e3-sim-valor").inner_text()
    for desc in ("Sin descuento", None):
        if desc:
            p.pg.get_by_role("radio", name=desc).click()
        desl = p.pg.locator("[role=slider]")
        desl.focus()
        p.tecla("Home")
        p.chequear(f"9 s = 0 {desc or 'con descuento'}")
        for _ in range(8):
            p.tecla("ArrowUp")
            p.chequear(f"9 s = {p.pg.locator('.e3-sim-valor').inner_text()} {desc or ''}")
        p.tecla("End")
        p.chequear(f"9 s = 100 % {desc or ''}")
        if desc:
            p.pg.get_by_role("radio", name="Con 15 % de descuento").click()
    desl = p.pg.locator("[role=slider]")
    caja = desl.bounding_box()
    p.pg.mouse.click(caja["x"] + caja["width"] * 0.5, caja["y"] + caja["height"] / 2)
    p.quieto()
    p.chequear("9 clic en el deslizante")
    p.tecla("PageDown")
    if p.estado()["hash"] != "#10":
        p.mal("9: con foco en el deslizante, Av Pág no pasa de diapositiva")
    p.tecla("PageUp")
    if p.pg.locator(".e3-sim-valor").inner_text() != inicial:
        p.mal(f"9: al volver, la tasa no vuelve a {inicial}")
    # 11: la matriz y cada riesgo
    p.ir("11")
    p.pg.locator(".e3-boton").click()
    p.quieto()
    chips = p.pg.locator(".e3-chip:not(.muestra)")
    if chips.count() != 13:
        p.mal(f"11: la matriz tiene {chips.count()} riesgos y no 13")
    for k in range(chips.count()):
        chips.nth(k).hover()
        p.quieto(10)
        p.chequear(f"11 matriz riesgo {chips.nth(k).inner_text()}")
    p.tecla("ArrowRight")
    p.tecla("ArrowLeft")
    if p.pg.locator(".e3-chip").count():
        p.mal("11: al volver, la matriz no vuelve a los tres críticos")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--capturas", default=str(APP / "e3" / "capturas-verif"))
    ap.add_argument("--sin-capturas", action="store_true")
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
            for id_ in PAGINAS:
                p.ir(id_)
                p.chequear(id_)
                if (w, h) in CAPTURAR and not a.sin_capturas:
                    p.pg.screenshot(path=str(out / f"{id_}-{w}x{h}.png"))
            controles(p)
            if (w, h) == (1280, 720):
                recorrido(p)
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

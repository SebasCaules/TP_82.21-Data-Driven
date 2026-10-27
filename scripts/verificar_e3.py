"""Verifica la presentación interactiva del E3 (dist-e3/index.html), abierta por file://, sin servidor.

    npm run build:e3 && python3 scripts/verificar_e3.py [--capturas DIR] [--sin-capturas]

1. Cada diapositiva (1 a 12) y cada anexo (A1 a A6), en su estado completo, a 1024×768, 1280×720,
   1366×768, 1440×900 y 1920×1080:
   - el escenario entra entero en la ventana y la página no scrollea;
   - nada se sale del escenario;
   - ningún texto ni elemento se sale de su caja (tarjeta, panel, celda, botón, gráfico);
   - ningún par de textos de bloques distintos se superpone;
   - ningún elemento con overflow oculto recorta su contenido;
   - ningún texto fuera del pie por debajo de 17 px lógicos (24/10).
2. Cero errores de consola y cero pedidos de red (solo el propio archivo).
3. Recorrido por teclado: → hasta el final con los pasos, ← hasta el inicio (sin pasos: llegando hacia
   atrás la diapositiva ya está completa), Av Pág y Re Pág, Espacio y Retroceso, número y Enter, Inicio
   y Fin, O (vista general), A (anexos y vuelta a la diapositiva de origen), N (notas sin tapar el
   escenario), ? (ayuda), Atrás del navegador, recarga, y clic en las franjas laterales y sobre un
   control. Desde el 24/10, además: Esc no abre la vista general, F5 no recarga, «.» y B ponen la
   pantalla en negro, una tecla mantenida no recorre la presentación, un control tocado con el mouse
   no se queda con →, el clic al 85 % de cada diapositiva avanza, un hash mal formado (#%, #0) lleva a
   la portada, un anexo abierto directo no dice «Volver», y dos ventanas se siguen.
4. Cada control a sus extremos (diapositivas 4, 6, 7, 9 y 11), con el mismo control de desborde, y la
   vuelta al valor inicial al salir de la diapositiva.
5. Capturas de cada página a 1280×720 y 1920×1080 en e3/capturas-verif/ (fuera del control de versiones).

Termina con «E3 OK» o con la lista de problemas y código 1. Una excepción de Playwright a mitad de una
resolución se anota como problema y no se pierde lo ya encontrado.
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
ANEXOS = [f"a{i}" for i in range(1, 8)]
PAGINAS = DIAPOS + ANEXOS
PASOS = {}            # (27/10) sin pasos: cada vista se presenta completa

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
    '.e3-riel-item, .e3-riel-chip, .e3-explorar, ' +
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
      frags.push({ r: t.getBoundingClientRect(), bloque: t, caja: t.closest('svg'), texto, el: t })
      continue
    }
    let bloque = el
    while (bloque !== pag && ['inline', 'contents'].includes(getComputedStyle(bloque).display)) bloque = bloque.parentElement
    const rg = document.createRange()
    rg.selectNodeContents(n)
    for (const r of rg.getClientRects()) if (r.width > 0.5 && r.height > 0.5) frags.push({ r, bloque, caja: el.closest(CAJAS), texto, el })
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
  // 3b. (24/10) ningún texto fuera del pie por debajo de 17 px lógicos: el escenario se achica en el
  // proyector (1024 × 768 es 0,64) y lo que va a 13 o 15 px no se lee desde la mitad del aula
  for (const f of frags) {
    const el = f.el
    if (!el || el.closest('.e3-pie')) continue
    const fs = parseFloat(getComputedStyle(el).fontSize)
    if (fs < 16.95) p.push('letra de ' + fs + ' px: «' + f.texto + '»')
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
  paso: Number(document.querySelector('.e3-escenario .e3-dia')?.dataset.paso || 0),
  pasos: Number(document.querySelector('.e3-escenario .e3-dia')?.dataset.pasos || 0),
  aviso: document.querySelector('.e3-escenario .e3-pasos')?.textContent || '',
  negro: !!document.querySelector('.e3-negro'),
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
    # (24/10) hacia atrás no hay pasos: cada diapositiva llega completa y ← pasa a la anterior
    atras = []
    for _ in range(len(DIAPOS) - 1):
        p.tecla("ArrowLeft")
        e = p.estado()
        atras.append((e["hash"], e["paso"]))
    esperada_atras = [(f"#{d}", PASOS.get(d, 0)) for d in reversed(DIAPOS[:-1])]
    esperar(atras == esperada_atras, f"← hasta el inicio dio {atras}, se esperaba {esperada_atras}")
    # (27/10) sin pasos: → en la 2 lleva a la 3 completa y ← vuelve a la 2
    p.ir("2")
    p.tecla("ArrowRight")
    esperar(p.estado()["hash"] == "#3" and p.estado()["aviso"] == "", "→ en la 2 no lleva a la 3 sin aviso de pasos")
    p.tecla("ArrowLeft")
    esperar(p.estado()["hash"] == "#2", "← en la 3 no vuelve a la 2")
    p.ir("1")
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
    # (27/10) el riel de capítulos lleva a cada vista y a cada anexo, y un clic en el riel no pasa de vista
    p.ir("2")
    p.pg.locator(".e3-escenario .e3-riel-item", has_text="Costo y retorno").click()
    p.quieto()
    esperar(p.estado()["hash"] == "#9", "el riel no lleva a la 9")
    p.pg.locator(".e3-escenario .e3-riel-chip", has_text="A3").click()
    p.quieto()
    esperar(p.estado()["hash"] == "#a3", "el riel no lleva al anexo A3")
    p.ir("5")
    r = p.pg.locator(".e3-escenario .e3-riel").bounding_box()
    p.pg.mouse.click(r["x"] + r["width"] / 2, r["y"] + r["height"] * 0.96)
    p.quieto()
    esperar(p.estado()["hash"] == "#5", "un clic en el fondo del riel pasa de vista")
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
    p.tecla("Escape")
    esperar(not p.estado()["general"] and p.estado()["hash"] == "#6", "Esc abre la vista general o cambia la diapositiva")
    p.tecla("o")
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
        titulo = p.pg.locator(".e3-escenario .e3-pregunta").bounding_box()
        esperar(esc["y"] + esc["height"] <= notas["y"] + 1, "las notas tapan el escenario")
        esperar(titulo["y"] >= 0 and titulo["y"] + titulo["height"] <= notas["y"], "las notas tapan el título")
        p.chequear("3 con notas")
        p.tecla("n")
        esperar(not p.estado()["notas"], "N no cierra las notas")
    # ayuda
    p.tecla("?")
    esperar(p.estado()["ayuda"], "? no abre la ayuda")
    p.tecla("Escape")
    esperar(not p.estado()["ayuda"], "Esc no cierra la ayuda")
    # control remoto: F5 no recarga (pide pantalla completa), «.» y B ponen la pantalla en negro
    p.ir("5")
    p.pg.evaluate("() => { window.__sin_recarga = 1 }")
    p.tecla("F5")
    esperar(p.pg.evaluate("() => window.__sin_recarga === 1") and p.estado()["hash"] == "#5", "F5 recarga la página")
    for k in (".", "b"):
        p.tecla(k)
        esperar(p.estado()["negro"], f"«{k}» no pone la pantalla en negro")
        p.tecla("ArrowRight")
        e = p.estado()
        esperar(not e["negro"] and e["hash"] == "#5", f"después de «{k}», una tecla no vuelve o cambia la diapositiva")
    # una tecla mantenida no recorre la presentación
    p.ir("1")
    for _ in range(12):
        p.pg.keyboard.down("ArrowRight")
        p.pg.wait_for_timeout(20)
    p.pg.keyboard.up("ArrowRight")
    p.quieto()
    esperar(p.estado()["hash"] == "#2", f"→ mantenida desde la 1 llega a {p.estado()['hash']} y no a la 2")
    # un control tocado con el mouse no se queda con →
    for id_, que, nombre in (("6", "radio", "Entrenamiento"), ("7", "radio", "800"), ("9", "radio", "Sin descuento")):
        p.ir(id_)
        p.pg.locator(".e3-escenario .e3-explorar").click()      # (27/10) los controles están detrás de Explorar
        p.quieto()
        p.pg.get_by_role(que, name=nombre, exact=True).click()
        p.quieto()
        p.tecla("ArrowRight")
        esperar(p.estado()["hash"] == f"#{int(id_) + 1}", f"en la {id_}, después de un clic en «{nombre}», → no pasa de diapositiva")
    p.ir("9")
    p.pg.locator(".e3-escenario .e3-explorar").click()
    p.quieto()
    caja9 = p.pg.locator("[role=slider]").bounding_box()
    p.pg.mouse.click(caja9["x"] + caja9["width"] * 0.6, caja9["y"] + caja9["height"] / 2)
    p.quieto()
    p.tecla("ArrowRight")
    esperar(p.estado()["hash"] == "#10", "en la 9, después de un clic en el deslizante, → no pasa de diapositiva")
    # el clic en la franja derecha avanza en todas las diapositivas (también en la 2 y la 4)
    for d in DIAPOS[:-1]:
        p.ir(d)
        c = p.pg.locator(".e3-escenario").bounding_box()
        p.pg.mouse.click(c["x"] + c["width"] * 0.85, c["y"] + c["height"] * 0.5)
        p.quieto()
        esperar(p.estado()["hash"] == f"#{int(d) + 1}", f"clic al 85 % de la {d} lleva a {p.estado()['hash']}")
    p.ir("4")
    c = p.pg.locator(".e3-escenario").bounding_box()
    p.pg.mouse.click(c["x"] + c["width"] * 0.2, c["y"] + c["height"] * 0.45)
    p.quieto()
    esperar(p.estado()["hash"] == "#3", "clic al 20 % de la 4, sobre el gráfico, no retrocede")
    # hash mal formado o inválido: la portada, sin error y con la URL corregida
    for h in ("%", "0", "a8"):
        p.ir("1")
        p.pg.evaluate(f"() => {{ location.hash = '{h}' }}")
        p.quieto(80)
        esperar(p.estado()["hash"] == "#1" and p.pg.locator(".e3-escenario .e3-pagina").count() == 1,
                f"cambiar el hash a #{h} deja {p.estado()['hash']}")
    p.pg.goto("about:blank")
    p.pg.goto(f"{p.url}#%")
    p.pg.wait_for_timeout(300)
    esperar(p.pg.locator(".e3-escenario .e3-pagina").count() == 1, "abrir con #% no monta la presentación")
    # un anexo abierto directo no dice «Volver»
    p.pg.goto("about:blank")
    p.pg.goto(f"{p.url}#a4")
    p.pg.wait_for_selector(".e3-escenario .e3-pagina")
    esperar("Ir a la diapositiva 12" in p.pg.locator(".e3-volver").inner_text(), "el A4 abierto directo dice «Volver»")
    # dos ventanas se siguen: la que se abre toma la posición de la otra; después, cada cambio se sigue
    p.ir("5")
    otra = p.ctx.new_page()
    otra.goto(f"{p.url}#1")
    otra.wait_for_selector(".e3-escenario .e3-pagina")
    otra.wait_for_timeout(300)
    esperar(otra.evaluate("() => location.hash") == "#5", f"la ventana nueva no toma la posición de la abierta ({otra.evaluate('() => location.hash')})")
    p.tecla("ArrowRight")
    p.tecla("ArrowRight")
    otra.wait_for_timeout(300)
    esperar(otra.evaluate("() => location.hash") == "#7", "la otra ventana no sigue a la 7")
    otra.keyboard.press("ArrowLeft")
    otra.wait_for_timeout(300)
    esperar(p.estado()["hash"] == "#6", "la primera ventana no sigue a la otra")
    otra.close()
    # clic en las franjas y sobre un control
    p.ir("5")
    caja = p.pg.locator(".e3-escenario").bounding_box()
    p.pg.mouse.click(caja["x"] + caja["width"] * 0.9, caja["y"] + caja["height"] * 0.12)
    p.quieto()
    esperar(p.estado()["hash"] == "#6", "clic en la franja derecha no avanza")
    p.pg.mouse.click(caja["x"] + caja["width"] * 0.2, caja["y"] + caja["height"] * 0.12)
    p.quieto()
    esperar(p.estado()["hash"] == "#5", "clic en la franja izquierda no retrocede")
    # un control con foco atiende las flechas; Esc le saca el foco
    p.ir("6")
    esperar(p.pg.locator(".e3-escenario .e3-opciones").count() == 0, "la 6 muestra el selector sin abrir Explorar")
    p.pg.locator(".e3-escenario .e3-explorar").click()
    p.quieto()
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
    # 6: entrenamiento (27/10: detrás de Explorar)
    p.ir("6")
    p.pg.locator(".e3-escenario .e3-explorar").click()
    p.pg.get_by_role("radio", name="Entrenamiento").click()
    p.quieto()
    p.chequear("6 entrenamiento")
    # 7: todos los filtros y largos (27/10: detrás de Explorar)
    p.ir("7")
    if p.pg.locator(".e3-escenario .e3-opciones").count():
        p.mal("7: los controles se ven sin abrir Explorar")
    p.pg.locator(".e3-escenario .e3-explorar").click()
    for filtro in ("Sin filtro", "Solo contactables"):
        p.pg.get_by_role("radio", name=filtro).click()
        largos = p.pg.locator(".e3-opciones[aria-label='Largo de la lista por mes'] [role=radio]")
        for k in range(largos.count()):
            if largos.nth(k).is_disabled():
                continue
            largos.nth(k).click()
            p.quieto(20)
            p.chequear(f"7 {filtro} {largos.nth(k).inner_text()}")
    # 9: la tasa de éxito en sus extremos, en cada marca, con y sin descuento (27/10: detrás de Explorar)
    p.ir("9")
    if p.pg.locator(".e3-escenario [role=slider]").count():
        p.mal("9: el deslizante se ve sin abrir Explorar")
    p.pg.locator(".e3-escenario .e3-explorar").click()
    p.quieto()
    inicial = p.pg.locator(".e3-lectura.tasa b").inner_text()
    for desc in ("Sin descuento", None):
        if desc:
            p.pg.get_by_role("radio", name=desc).click()
        desl = p.pg.locator("[role=slider]")
        desl.focus()
        p.tecla("Home")
        esperar_s = p.pg.locator(".e3-lectura.tasa b").inner_text().replace("\u00a0", " ")
        if esperar_s != "0,63 %":
            p.mal(f"9: Inicio deja s en {esperar_s} y no en el borde inferior del IC, 0,63 %")
        p.chequear(f"9 s = 0,63 % {desc or 'con descuento'}")
        for _ in range(8):
            p.tecla("ArrowUp")
            p.chequear(f"9 s = {p.pg.locator('.e3-lectura.tasa b').inner_text()} {desc or ''}")
        p.tecla("End")
        p.chequear(f"9 s = 100 % {desc or ''}")
        if desc:
            p.pg.get_by_role("radio", name="15 % de descuento").click()
    desl = p.pg.locator("[role=slider]")
    caja = desl.bounding_box()
    p.pg.mouse.click(caja["x"] + caja["width"] * 0.5, caja["y"] + caja["height"] / 2)
    p.quieto()
    p.chequear("9 clic en el deslizante")
    p.tecla("PageDown")
    if p.estado()["hash"] != "#10":
        p.mal("9: con foco en el deslizante, Av Pág no pasa de diapositiva")
    p.tecla("PageUp")
    if p.pg.locator(".e3-escenario [role=slider]").count():
        p.mal("9: al volver, Explorar no está cerrado")
    # 11: la matriz y cada riesgo
    p.ir("11")
    p.pg.locator(".e3-escenario .e3-explorar").click()
    p.quieto()
    chips = p.pg.locator(".e3-chip:not(.muestra)")
    if chips.count() != 13:
        p.mal(f"11: la matriz tiene {chips.count()} riesgos y no 13")
    detalle = p.pg.locator(".e3-matriz-detalle .e3-rotulo").inner_text()
    chips.nth(0).hover()
    p.quieto(10)
    if p.pg.locator(".e3-matriz-detalle .e3-rotulo").inner_text() != detalle:
        p.mal("11: pasar el puntero por un riesgo cambia el detalle")
    for k in range(chips.count()):
        chips.nth(k).click()
        p.quieto(10)
        if not p.pg.locator(".e3-matriz-detalle .e3-rotulo").inner_text().lower().startswith(f"riesgo {chips.nth(k).inner_text()} "):
            p.mal(f"11: tocar el riesgo {chips.nth(k).inner_text()} no muestra su detalle")
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
            try:
                for id_ in PAGINAS:
                    p.ir(id_)
                    p.chequear(id_)
                    if (w, h) in CAPTURAR and not a.sin_capturas:
                        p.pg.screenshot(path=str(out / f"{id_}-{w}x{h}.png"))
                controles(p)
                if (w, h) == (1280, 720):
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

"""Verifica UNA vista del tablero E2 contra el dev server (http://localhost:5178/).

    python3 verificar_vista.py N [carpeta_de_capturas]

Para cada resolución del rango (1152×640, 1280×720, 1366×768, 1440×900, 1920×1080):
window.__fit() (desborde, cifra partida, texto fuera del svg, gráfico aplastado), título de una
línea y ≤ 74 caracteres, .pant y cada .tarjeta sin scroll horizontal, pie dentro de la ventana,
errores de consola. Guarda capturas a 1152, 1440 y 1920 en la carpeta (default: ./cap_VNN).
Imprime un JSON con los problemas y termina con 'VISTA OK' o 'VISTA CON PROBLEMAS'.
"""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

N = int(sys.argv[1])
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else f"cap_V{N:02d}"); OUT.mkdir(parents=True, exist_ok=True)
URL = "http://localhost:5178/"
RES = [(1152, 640), (1280, 720), (1366, 768), (1440, 900), (1920, 1080)]
CAPTURAR = {(1152, 640), (1440, 900), (1920, 1080)}
JS = """() => {
  const q = (s) => [...document.querySelectorAll(s)]
  const p = []
  const t = document.querySelector('h1.titulo')
  const txt = t ? t.textContent.trim() : ''
  if (!t) p.push('sin h1.titulo')
  if (txt.length > 74) p.push('titulo de ' + txt.length + ' caracteres: ' + txt)
  if (t && t.scrollHeight > t.clientHeight + 2) p.push('titulo en dos renglones')
  const pant = document.querySelector('.cuerpo .pant')
  if (!pant) p.push('sin .pant')
  else if (pant.scrollWidth > pant.clientWidth + 1) p.push('.pant desborda a lo ancho ' + pant.scrollWidth + '>' + pant.clientWidth)
  for (const c of q('.cuerpo .tarjeta')) if (c.scrollWidth > c.clientWidth + 1) p.push('tarjeta desborda a lo ancho: ' + (c.querySelector('.kpi-lbl')?.textContent || '').trim().slice(0, 40))
  const pie = document.querySelector('.cuerpo .pie-vista')
  if (!pie) p.push('sin .pie-vista')
  else if (pie.getBoundingClientRect().bottom > window.innerHeight + 0.5) p.push('pie fuera de la ventana: ' + Math.round(pie.getBoundingClientRect().bottom) + '>' + window.innerHeight)
  const fit = window.__fit ? window.__fit() : { ok: false, problemas: [{ tipo: 'sin __fit' }] }
  if (!fit.ok) p.push(...fit.problemas.map((x) => x.tipo + ': ' + (x.detalle || '')))
  const chicos = []
  for (const el of q('.cuerpo .pant *')) {
    if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue
    const fs = parseFloat(getComputedStyle(el).fontSize)
    if (fs < 10 && el.getBoundingClientRect().width > 0) chicos.push(el.textContent.trim().slice(0, 25) + ' ' + fs + 'px')
  }
  if (chicos.length) p.push('texto < 10px: ' + chicos.slice(0, 6).join(' | ') + (chicos.length > 6 ? ' …+' + (chicos.length - 6) : ''))
  return { titulo: txt, len: txt.length, problemas: p }
}"""
salida = {}
with sync_playwright() as pw:
    nav = pw.chromium.launch()
    for w, h in RES:
        pg = nav.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
        errs = []
        pg.on("console", lambda m: errs.append(m.text[:200]) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        pg.goto(URL); pg.wait_for_selector(".lat-item", timeout=15000); pg.wait_for_timeout(500)
        pg.locator(".lat-item").nth(N - 1).click(); pg.wait_for_timeout(600)
        r = pg.evaluate(JS)
        if errs: r["problemas"].append("consola: " + " || ".join(errs[:3]))
        salida[f"{w}x{h}"] = r
        if (w, h) in CAPTURAR: pg.screenshot(path=str(OUT / f"V{N:02d}-{w}x{h}.png"))
        pg.close()
    nav.close()
malas = {k: v["problemas"] for k, v in salida.items() if v["problemas"]}
print(json.dumps({"vista": N, "titulo": salida["1440x900"]["titulo"], "len": salida["1440x900"]["len"], "problemas": malas}, ensure_ascii=False, indent=1))
print("capturas en", OUT.resolve())
print("VISTA OK" if not malas else "VISTA CON PROBLEMAS")

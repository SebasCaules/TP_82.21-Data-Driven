"""Regla 11 de e2/DISENO.md: la tarjeta de decisión es el mismo rectángulo en todas las vistas
que la tienen, en las cinco resoluciones del rango, y ninguna vista desborda.

    python3 scripts/verificar_ranura_e2.py [url]     # default http://localhost:5178/ (npm run dev:e2)

Para cada resolución recorre las 12 vistas por el riel y mide `.e2-banda > .tarjeta-dec`; además
corre window.__fit(), mira el título en un renglón, el pie dentro de la ventana, que la tarjeta no
desborde y que no haya texto de menos de 10 px. Termina con 'TODO OK' o 'HAY PROBLEMAS'.
"""
import sys
import json
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5178/"
RES=[(1152,640),(1280,720),(1366,768),(1440,900),(1920,1080)]
JS = """() => {
  const d = document.querySelector('.e2-banda > .tarjeta-dec')
  const r = d ? d.getBoundingClientRect() : null
  const f = window.__fit ? window.__fit() : {ok:false, problemas:[{tipo:'sin __fit'}]}
  const t = document.querySelector('h1.e2-preg')
  const pant = document.querySelector('.cuerpo .pant')
  const desb = d ? d.scrollHeight > d.clientHeight + 1 : false
  const chicos = [...document.querySelectorAll('.cuerpo .pant *')].filter(el => [...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim()) && parseFloat(getComputedStyle(el).fontSize) < 10 && el.getBoundingClientRect().width>0).length
  return { dec: r ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : null, desborda: desb,
           fit: f.ok ? 'ok' : f.problemas.map(p => p.tipo + ':' + (p.detalle||'')).slice(0,3).join(' | '),
           titulo2: !t || t.getBoundingClientRect().height > parseFloat(getComputedStyle(t).lineHeight) * 1.5, pieFuera: pant ? pant.getBoundingClientRect().bottom > innerHeight + 0.5 : 'sin pant', chicos }
}"""
out = {}
with sync_playwright() as pw:
    nav = pw.chromium.launch()
    for w, h in RES:
        pg = nav.new_page(viewport={"width": w, "height": h})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:120]))
        pg.goto(URL); pg.wait_for_selector(".lat-item"); pg.wait_for_timeout(400)
        fila = {}
        for n in range(1, 13):
            pg.locator(".lat-item").nth(n - 1).click(); pg.wait_for_timeout(350)
            fila[n] = pg.evaluate(JS)
        out[f"{w}x{h}"] = {"vistas": fila, "errores": errs}
        pg.close()
    nav.close()
todo_ok = True
for res, d in out.items():
    decs = {n: v['dec'] for n, v in d['vistas'].items() if v['dec']}
    unicos = {tuple(v) for v in decs.values()}
    probl = {n: v for n, v in d['vistas'].items() if v['fit'] != 'ok' or v['titulo2'] or v['pieFuera'] or v['desborda'] or v['chicos']}
    print(res, '| tarjeta de decisión en', sorted(decs), '| rectángulos distintos:', unicos, '| problemas:', probl or 'ninguno', '| errores:', d['errores'] or 'ninguno')
    todo_ok &= len(unicos) == 1 and not probl and not d['errores']
print('TODO OK' if todo_ok else 'HAY PROBLEMAS')
sys.exit(0 if todo_ok else 1)

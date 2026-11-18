"""Verifica /final/ (dist-final/index.html), abierto por file://, sin servidor.

    npm run build:final && python3 -I scripts/verificar_final.py [--capturas DIR] [--sin-capturas]
                                                                  [--sin-esqueletos] [--sin-muestra]

(17/11) Es scripts/verificar_e3.py para la presentación final, con las expectativas de contenido leídas de CF
(final/src/contenido_final.js) y de DF (final/src/datos_final.js, de pipeline/build_final.py) en vez de escritas acá: el script no cambia cuando cambian las
vistas. Los dos módulos se leen con node, tal como los importa el tablero. La paridad de letra y cajas con /e2/ la mide
scripts/paridad_final.py. Esto cubre lo demás:

1. Cada vista de CF.BLOQUES, en su orden, a 1152×640, 1280×720, 1366×768, 1536×864 y 1920×1080: monta, la página no
   scrollea, window.__fit() (src/fit.js) no encuentra desbordes, el zoom es k = máx(1; mín(1,2; ancho / 1152;
   alto / 640)), cada rótulo de la banda y de los bloques del riel entra en un renglón y ninguna vista tiene
   controles. Una vista sin archivo es esqueleto: solo se monta (con --sin-esqueletos, es un problema).
2. Cero errores de consola y cero pedidos de red (solo el propio archivo).
3. Contra CF, en cada resolución: la pregunta del encabezado, «n / total · fuente», el título de la pestaña, el riel (el
   rótulo de cada vista, su número por posición, el rótulo de cada bloque y el subtítulo). En cada vista con contenido:
   la tarjeta de decisión dice «área · estado» y la frase corta de CF; los rótulos y fragmentos de la banda y qué mide
   son textos de CF; la conclusión empieza con la de CF.
4. Contra DF, en cada vista con contenido: cada cifra de la banda y de la conclusión es un valor de DF escrito con las
   reglas de e3/src/formato.js (el navegador no inventa números). Reglas de la banda del E3: una cifra por tarjeta, una
   sola al tamaño máximo y en la tarjeta central, que va primera; rótulos de 22 caracteres o menos; fragmentos de 2 a 6
   palabras sin otro número; un gráfico con su conclusión arriba; ningún texto del gráfico pisa a otro; terracota solo si
   CF la declara (textos.terracota); ni «pendiente», «abierto», «a definir», «sin respuesta» ni «espera respuesta» en
   pantalla ni en los title, ni códigos internos («envío 29», «G40»).
5. Notas (N), a 1366×768 y 1536×864: el panel no tapa el tablero, el guion de cada vista entra sin desplazar y trae el
   comienzo de cada párrafo de CF, quién presenta, el bloque con su tiempo acumulado y su total, el tiempo de la vista y
   el acumulado de la presentación contra el objetivo, y la vista que sigue.
6. Recorrido de quien presenta, a 1536×864: → y ← de punta a punta, Av Pág y Re Pág, Inicio y Fin, una tecla mantenida
   no recorre, el riel lleva a cada vista, con el foco en el riel las flechas siguen, la URL sigue a la vista (recargar y
   Atrás), N abre y cierra las notas, «.» y B ponen la pantalla en negro y cualquier tecla vuelve sin cambiar de vista, F5
   no recarga, dos ventanas se siguen y la de notas (?notas) sigue al tablero.
7. Impresión, a 1536×864: con beforeprint el tablero arma una hoja por vista, en orden y con su pregunta, y el PDF de
   Chrome tiene una página por vista.
8. Sin navegador: la suma de los segundos de CF no pasa CF.TIEMPOS.objetivo_s, cada pregunta tiene 74 caracteres o menos
   y los ids no se repiten. Mientras CF sea de muestra (CF.MUESTRA o «MUESTRA» en pantalla) se avisa; con --sin-muestra
   es un problema (obligatorio antes de presentar).

Capturas de cada vista con contenido a 1280×720 y 1920×1080 en final/capturas-verif/ (fuera del control de versiones).
Termina con «RESULTADO: OK» o con la lista de problemas, «RESULTADO: FALLA» y código 1.
"""
from __future__ import annotations

import argparse
import glob
import json
import re
import subprocess
import sys
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

from playwright.sync_api import Error as PWError
from playwright.sync_api import sync_playwright

APP = Path(__file__).resolve().parents[1]
HTML = APP / "dist-final" / "index.html"
CF_JS = APP / "final" / "src" / "contenido_final.js"
DF_JS = APP / "final" / "src" / "datos_final.js"
RES = [(1152, 640), (1280, 720), (1366, 768), (1536, 864), (1920, 1080)]
CAPTURAR = {(1280, 720), (1920, 1080)}
NOTAS_RES = {(1366, 768), (1536, 864)}
NBSP = " "
MENOS = "−"


def k_de(w, h):
    return max(1.0, min(1.2, w / 1152, h / 640))


# ---------------------------------------------------------------- lectura de CF y DF

def leer_modulo(ruta: Path, var: str):
    """El objeto exportado `var` de un módulo ES, importado con node tal como lo importa el tablero."""
    codigo = "const m = await import(process.argv[1]); process.stdout.write(JSON.stringify(m[process.argv[2]]))"
    r = subprocess.run(["node", "--input-type=module", "-e", codigo, ruta.resolve().as_uri(), var],
                       capture_output=True, text=True)
    if r.returncode != 0 or not r.stdout:
        raise SystemExit(f"No pude leer {var} de {ruta.relative_to(APP)} con node: {r.stderr.strip()[:300]}")
    return json.loads(r.stdout)


def plano(t):
    return re.sub(r"\[\[|\]\]", "", (t or "").replace("**", ""))


def norm(t):
    return re.sub(r"\s+", " ", (t or "").replace(NBSP, " ")).strip()


def mmss(s):
    s = int(s)
    return f"{s // 60}:{s % 60:02d}"


def fijo(x, d=0, signo=False):
    """formato.js: toFixed de JS (mitad lejos del cero sobre el valor binario exacto), punto de miles, coma decimal y
    menos U+2212."""
    q = Decimal(abs(x)).quantize(Decimal(1).scaleb(-d), rounding=ROUND_HALF_UP)
    ent, _, fr = f"{q:.{d}f}".partition(".")
    cuerpo = f"{int(ent):,}".replace(",", ".") + ("," + fr if fr else "")
    if not q:
        return cuerpo
    if x < 0:
        return MENOS + cuerpo
    return "+" + cuerpo if signo else cuerpo


def historia(CF):
    """Las vistas en el orden de CF.BLOQUES, con su bloque, su integrante y sus tiempos (como final/src/vistas/index.jsx)."""
    vistas = []
    for b in CF["BLOQUES"]:
        for v in b["vistas"]:
            vistas.append({**v, "bloque": b["id"], "integrante": v.get("integrante") or b.get("integrante") or ""})
    bloques = []
    for b in CF["BLOQUES"]:
        vs = [v for v in vistas if v["bloque"] == b["id"]]
        if vs:
            bloques.append({**b, "nombre": b.get("riel") or b["titulo"], "segundos": sum(v["segundos"] for v in vs)})
    total = sum(v["segundos"] for v in vistas)
    acum, por_bloque = 0, {}
    for i, v in enumerate(vistas):
        acum += v["segundos"]
        por_bloque[v["bloque"]] = por_bloque.get(v["bloque"], 0) + v["segundos"]
        b = next(x for x in bloques if x["id"] == v["bloque"])
        v.update(n=i + 1, hid=v["id"].lower(), total_hasta=acum, bloque_hasta=por_bloque[v["bloque"]],
                 bloque_total=b["segundos"], bloque_titulo=b["titulo"])
    return vistas, bloques, total


def cadenas(x):
    """Todas las cadenas de un objeto, normalizadas y sin marcado."""
    if isinstance(x, str):
        return {norm(plano(x))}
    if isinstance(x, dict):
        return set().union(*(cadenas(v) for v in x.values())) if x else set()
    if isinstance(x, list):
        return set().union(*(cadenas(v) for v in x)) if x else set()
    return set()


def numeros_df(DF):
    """Cada número de DF (anclas y tablas) escrito como lo escribe formato.js: con 0 a 3 decimales, como viene o ×100 (pct), con y sin
    signo. Una cifra de la pantalla tiene que ser una de estas."""
    salida = set()

    def recorrer(x):
        if isinstance(x, bool):
            return
        if isinstance(x, (int, float)):
            for d in range(4):
                for v in (x, x * 100):
                    salida.add(fijo(v, d))
                    salida.add(fijo(v, d, True))
        elif isinstance(x, dict):
            for v in x.values():
                recorrer(v)
        elif isinstance(x, list):
            for v in x:
                recorrer(v)
    recorrer(DF["anclas"])
    recorrer(DF["tablas"])
    return salida


NUMERO = re.compile(r"[−+]?\d[\d.]*(?:,\d+)?")


# ---------------------------------------------------------------- en el navegador

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
  // (17/11) el rótulo de cada bloque del riel, en un renglón: partido, empuja la lista sobre el pie
  for (const s of document.querySelectorAll('.lat-grupo span')) {
    const lh = parseFloat(getComputedStyle(s).lineHeight) || parseFloat(getComputedStyle(s).fontSize) * 1.2
    if (s.getClientRects().length > 1 || s.getBoundingClientRect().height > lh * 1.5)
      p.push(`rótulo del riel en dos renglones: «${s.textContent}»`)
  }
  if (!esqueleto && document.querySelector('.cuerpo [role=slider], .cuerpo [role=radiogroup], .cuerpo input'))
    p.push('controles en la vista')
  if (document.querySelector('.cuerpo svg[data-desborda]')) p.push('una tabla en svg no entra (data-desborda)')
  return { problemas: p, esqueleto, zoom: document.querySelector('.e3-vp')?.currentCSSZoom ?? 1 }
}"""

ESTADO = r"""() => ({
  hash: location.hash,
  negro: !!document.querySelector('.e3-negro'),
  notas: !!document.querySelector('.e3-notas'),
  activa: document.querySelector('.lat-item.on')?.dataset.id ?? '',
})"""

RIEL = r"""() => ({
  ids: [...document.querySelectorAll('.lat-item')].map((b) => b.dataset.id),
  numeros: [...document.querySelectorAll('.lat-item .lat-n')].map((x) => x.textContent.trim()),
  titulos: [...document.querySelectorAll('.lat-item .lat-txt')].map((x) => x.textContent.trim()),
  grupos: [...document.querySelectorAll('.lat-grupo span')].map((x) => x.textContent.trim()),
  sub: document.querySelector('.lat-sub')?.textContent.trim() ?? '',
})"""

LEER_VISTA = r"""() => {
  const q = (s) => document.querySelector(s)
  const banda = [...document.querySelectorAll('.e2-banda-cifras .par-val')].map((e) => e.textContent)
  const grandes = [...document.querySelectorAll('.e2-banda-cifras .e2-cifra:not(.sec)')]
  const tarjetas = [...document.querySelectorAll('.e2-banda-cifras > .tarjeta')]
  const color = (v) => {
    const el = document.createElement('i'); el.style.color = `var(${v})`; q('.e3-vp').appendChild(el)
    const c = getComputedStyle(el).color; el.remove(); return c
  }
  const TERRA = [color('--terra'), color('--terra-osc')]
  const svgs = [...document.querySelectorAll('.cuerpo .lienzo svg')].filter((s) => !s.parentElement.closest('svg'))
  const textosSvg = svgs.flatMap((s) => [...s.querySelectorAll('text')].map((t) => t.textContent))
  const terracota = [...q('.cuerpo').querySelectorAll('*')].filter((el) => {
    const cs = getComputedStyle(el); return TERRA.includes(cs.fill) || TERRA.includes(cs.stroke) || TERRA.includes(cs.color)
  }).length
  const pisan = []
  for (const s of svgs) {
    const ts = [...s.querySelectorAll('text')].filter((t) => t.textContent.trim())
      .map((t) => ({ t: t.textContent.trim(), r: t.getBoundingClientRect() }))
    for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
      const a = ts[i].r, b = ts[j].r
      const x = Math.min(a.right, b.right) - Math.max(a.left, b.left) - 2
      const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) - 2
      if (x > 0 && y > 0) pisan.push(`«${ts[i].t}» y «${ts[j].t}»`)
    }
  }
  const vp = q('.e3-vp')
  const titulos = [...vp.querySelectorAll('[title]')].map((e) => e.getAttribute('title'))
    .concat([...vp.querySelectorAll('svg title')].map((e) => e.textContent))
  const concl = q('.cuerpo .pant > .tarjeta .e3-conclusion')
  return {
    preg: q('.e2-preg')?.textContent ?? '', corte: q('.e2-enc-corte')?.textContent ?? '', titulo: document.title,
    dec: q('.tarjeta-dec .kpi-lbl > b')?.textContent ?? null, decLlano: q('.tarjeta-dec .dec-llano')?.textContent ?? null,
    banda, grandes: grandes.length, grandeCentral: grandes.length === 1 && !!grandes[0].closest('.e2-central'),
    centralPrimera: tarjetas.length > 0 && tarjetas[0].classList.contains('e2-central') && tarjetas[0].contains(grandes[0] ?? null),
    porTarjeta: tarjetas.map((t) => t.querySelectorAll('.par-val').length),
    rotulos: tarjetas.map((t) => t.querySelector('.kpi-lbl > span')?.textContent.trim() ?? ''),
    lineas: tarjetas.map((t) => t.querySelector('.e2-linea')?.textContent ?? ''),
    mide: q('.cuerpo .fin-mide')?.textContent ?? null,
    conclusion: concl?.textContent ?? null,
    conclusionCifras: concl ? [...concl.querySelectorAll('b')].map((b) => b.textContent) : [],
    graficos: svgs.length, pisan, terracota,
    pantalla: vp.innerText + '\n' + textosSvg.join('\n'), cuerpo: q('.cuerpo').innerText + '\n' + textosSvg.join('\n'),
    titulos,
    fit: window.__fit().problemas.map((x) => `${x.tipo} ${x.detalle ?? ''}`),
  }
}"""

PROHIBIDAS = re.compile(r"\b(pendientes?|abiert[oa]s?|a definir|sin respuesta|espera respuesta)\b", re.I)
CODIGOS = re.compile(r"\benv[ií]o \d+|\bconsulta \d+|\b[A-H]\d{2}\b")


def abrir_navegador(pw):
    """Chromium de Playwright; si no está instalado para esta versión, el Chrome del sistema o el último Chromium que
    haya en la caché de Playwright."""
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

    def ir(self, hid):
        self.pg.goto(f"{self.url}#{hid}")
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


# ---------------------------------------------------------------- 1, 3 y 4. cada vista

def vistas(p: Pagina, w, h, V, bloques, CF, cadenas_cf, nums, out, capturar, sin_esqueletos):
    k = k_de(w, h)
    total = len(V)
    hay_muestra = False
    for v in V:
        p.ir(v["hid"])
        if p.estado()["hash"] != f"#{v['hid']}":
            p.mal(f"#{v['hid']} no se abre")
        r = p.pg.evaluate(CHEQUEO)
        for x in r["problemas"]:
            p.mal(f"{v['hid']}: {x}")
        if abs(r.get("zoom", 1) - k) > 1e-3:
            p.mal(f"{v['hid']}: zoom {r.get('zoom')}, se esperaba {k:.4f}")
        if sin_esqueletos and r["esqueleto"]:
            p.mal(f"{v['hid']}: sigue siendo esqueleto («se arma en la etapa siguiente»)")
        if capturar and not r["esqueleto"]:
            p.pg.screenshot(path=str(out / f"{v['hid']}-{w}x{h}.png"))
        c = p.pg.evaluate(LEER_VISTA)
        hay_muestra |= "MUESTRA" in c["pantalla"]
        # encabezado y pestaña, contra CF
        if norm(c["preg"]) != norm(v["pregunta"]):
            p.mal(f"{v['hid']}: la pregunta dice «{c['preg']}», CF dice «{v['pregunta']}»")
        corte = f"{v['n']} / {total}" + (f" · {v['fuente']}" if v.get("fuente") else "")
        if norm(c["corte"]) != norm(corte):
            p.mal(f"{v['hid']}: el encabezado dice «{c['corte']}», se esperaba «{corte}»")
        if norm(c["titulo"]) != norm(f"{v['pregunta']} · {CF['TITULO']}"):
            p.mal(f"{v['hid']}: el título de la pestaña es «{c['titulo']}»")
        revisar_estado(p, v["hid"], c)
        if r["esqueleto"]:
            continue
        contenido(p, v, c, cadenas_cf, nums)
    return hay_muestra


def revisar_estado(p: Pagina, hid, r):
    if m := PROHIBIDAS.search(r["pantalla"]):
        p.mal(f"{hid}: en pantalla dice «{m.group(0)}»")
    for t in r["titulos"]:
        if m := PROHIBIDAS.search(t or ""):
            p.mal(f"{hid}: un title dice «{m.group(0)}»: «{(t or '')[:80]}»")
    if m := CODIGOS.search(r["cuerpo"]):
        p.mal(f"{hid}: código interno en pantalla «{m.group(0)}»")
    for x in r["pisan"]:
        p.mal(f"{hid}: en el gráfico se pisan {x}")
    for x in r["fit"]:
        p.mal(f"{hid}: __fit {x}")


def contenido(p: Pagina, v, c, cadenas_cf, nums):
    hid, t = v["hid"], v.get("textos") or {}
    d = t.get("decision")
    if d:
        if norm(c["dec"]) != norm(f"{d['area']} · {d['estado']}"):
            p.mal(f"{hid}: la decisión dice «{c['dec']}», CF dice «{d['area']} · {d['estado']}»")
        if norm(c["decLlano"]) != norm(plano(d["corta"])):
            p.mal(f"{hid}: la frase de la decisión es «{c['decLlano']}», CF dice «{d['corta']}»")
        if len(norm(c["decLlano"])) > 60:
            p.mal(f"{hid}: la frase de la decisión tiene {len(norm(c['decLlano']))} caracteres (60 o menos)")
    elif c["dec"] is not None:
        p.mal(f"{hid}: tiene tarjeta de decisión y CF no trae textos.decision")
    # la banda: una cifra por tarjeta, la central primera y sola al tamaño máximo
    if not c["banda"]:
        p.mal(f"{hid}: la banda no tiene cifras")
    if c["porTarjeta"] != [1] * len(c["porTarjeta"]):
        p.mal(f"{hid}: cifras por tarjeta de la banda {c['porTarjeta']} (una por tarjeta)")
    if not c["grandeCentral"]:
        p.mal(f"{hid}: {c['grandes']} cifras al tamaño máximo; tiene que haber una, en la tarjeta central")
    elif not c["centralPrimera"]:
        p.mal(f"{hid}: la cifra central no está en la primera tarjeta de la banda")
    for rot in c["rotulos"]:
        if len(rot) > 22:
            p.mal(f"{hid}: el rótulo «{rot}» tiene {len(rot)} caracteres (22 o menos)")
        if norm(rot) not in cadenas_cf:
            p.mal(f"{hid}: el rótulo «{rot}» no sale de CF")
    for lin in c["lineas"]:
        lin = norm(lin)
        if lin not in cadenas_cf:
            p.mal(f"{hid}: el fragmento «{lin}» no sale de CF")
        if not 2 <= len(lin.split()) <= 6:
            p.mal(f"{hid}: el fragmento «{lin}» tiene {len(lin.split())} palabras (de 2 a 6)")
        if re.search(r"\d", lin):
            p.mal(f"{hid}: el fragmento «{lin}» trae otro número")
    # cada cifra de la banda y de la conclusión es un valor de DF
    for x in c["banda"] + c["conclusionCifras"]:
        m = NUMERO.search(norm(x))
        if not m:
            p.mal(f"{hid}: la cifra «{x}» no tiene número")
        elif m.group(0) not in nums:
            p.mal(f"{hid}: la cifra «{norm(x)}» no es ningún valor de DF escrito con formato.js")
    # el gráfico
    if c["graficos"] != 1:
        p.mal(f"{hid}: {c['graficos']} gráficos (uno por vista)")
    if not norm(c["conclusion"]):
        p.mal(f"{hid}: el gráfico no tiene su conclusión arriba (.e3-conclusion)")
    elif t.get("conclusion") and not norm(c["conclusion"]).startswith(norm(plano(t["conclusion"]))):
        p.mal(f"{hid}: la conclusión «{c['conclusion']}» no empieza con la de CF")
    if c["mide"] is not None and norm(c["mide"]) not in cadenas_cf:
        p.mal(f"{hid}: qué mide («{c['mide']}») no sale de CF")
    if c["terracota"] and not t.get("terracota"):
        p.mal(f"{hid}: {c['terracota']} elementos en terracota y CF no la declara (textos.terracota)")


def riel(p: Pagina, V, bloques, CF):
    r = p.pg.evaluate(RIEL)
    if r["ids"] != [v["id"] for v in V]:
        p.mal(f"riel: trae {r['ids']}, CF dice {[v['id'] for v in V]}")
    if r["numeros"] != [f"{i:02d}" for i in range(1, len(V) + 1)]:
        p.mal(f"riel: numeración {r['numeros']}")
    if [norm(x) for x in r["titulos"]] != [norm(v["titulo"]) for v in V]:
        p.mal(f"riel: rótulos {r['titulos']}")
    if [norm(x) for x in r["grupos"]] != [norm(b["nombre"]) for b in bloques]:
        p.mal(f"riel: grupos {r['grupos']}, CF dice {[b['nombre'] for b in bloques]}")
    if norm(r["sub"]) != norm(CF["SUBTITULO"]):
        p.mal(f"riel: subtítulo «{r['sub']}»")


# ---------------------------------------------------------------- 5. notas

def notas(p: Pagina, w, h, V, CF):
    objetivo = (CF.get("TIEMPOS") or {}).get("objetivo_s")
    total = sum(v["segundos"] for v in V)
    p.ir(V[0]["hid"])
    p.tecla("n")
    for i, v in enumerate(V):
        p.ir(v["hid"])
        r = p.pg.evaluate("() => { const n = document.querySelector('.e3-notas');"
                          " return n ? { sh: n.scrollHeight, ch: n.clientHeight, txt: n.innerText } : null }")
        if r is None:
            p.mal(f"notas {w}x{h}: el panel no queda abierto en #{v['hid']}")
            continue
        if r["sh"] > r["ch"] + 1:
            p.mal(f"notas {w}x{h}: el guion de #{v['hid']} no entra en el panel ({r['sh']} > {r['ch']} px)")
        txt = norm(r["txt"])
        esperado = [f"{v['n']} / {len(V)}", norm(v["pregunta"]), mmss(v["segundos"]),
                    f"total {mmss(v['total_hasta'])} de {mmss(objetivo or total)}",
                    f"Presenta {v['integrante']}",
                    f"{v['bloque_titulo']}: {mmss(v['bloque_hasta'])} de {mmss(v['bloque_total'])}"]
        esperado += [norm(plano(x))[:40] for x in v.get("notas") or []]
        if i + 1 < len(V):
            esperado.append(f"Sigue: {norm(V[i + 1]['pregunta'])}")
        for x in esperado:
            if norm(x) not in txt:
                p.mal(f"notas {w}x{h}: #{v['hid']} no dice «{x}»")
    p.tecla("n")


# ---------------------------------------------------------------- 6. recorrido

def recorrido(p: Pagina, V):
    ids = [v["hid"] for v in V]

    def esperar(cond, texto):
        if not cond:
            p.mal(f"recorrido: {texto} (estado {p.estado()})")

    p.ir(ids[0])
    adelante = []
    for _ in range(len(ids)):
        p.tecla("ArrowRight")
        adelante.append(p.estado()["hash"])
    esperar(adelante == [f"#{x}" for x in ids[1:]] + [f"#{ids[-1]}"], f"→ de punta a punta dio {adelante}")
    atras = []
    for _ in range(len(ids) - 1):
        p.tecla("ArrowLeft")
        atras.append(p.estado()["hash"])
    esperar(atras == [f"#{x}" for x in reversed(ids[:-1])], f"← de punta a punta dio {atras}")
    p.ir(ids[1])
    p.tecla("PageDown")
    esperar(p.estado()["hash"] == f"#{ids[2]}", "Av Pág no pasa a la vista siguiente")
    p.tecla("PageUp")
    esperar(p.estado()["hash"] == f"#{ids[1]}", "Re Pág no vuelve a la anterior")
    p.tecla("End")
    esperar(p.estado()["hash"] == f"#{ids[-1]}", "Fin no lleva a la última")
    p.tecla("Home")
    esperar(p.estado()["hash"] == f"#{ids[0]}", "Inicio no lleva a la primera")
    # una tecla mantenida (el control remoto repite) no recorre el tablero
    p.ir(ids[0])
    for _ in range(10):
        p.pg.keyboard.down("PageDown")
        p.pg.wait_for_timeout(20)
    p.pg.keyboard.up("PageDown")
    p.quieto()
    esperar(p.estado()["hash"] == f"#{ids[1]}", f"Av Pág mantenida desde la 1 llega a {p.estado()['hash']}")
    # el riel lleva a cada vista y la marca la activa
    for v in (V[len(V) // 2], V[-1]):
        p.pg.locator(f".lat-item[data-id='{v['id']}']").click()
        p.quieto()
        esperar(p.estado()["hash"] == f"#{v['hid']}" and p.estado()["activa"] == v["id"], f"el riel no lleva a {v['id']}")
    # con el foco en el riel después de un clic, las flechas siguen pasando de vista
    p.tecla("ArrowUp")
    esperar(p.estado()["hash"] == f"#{ids[-2]}", "con el foco en el riel, ↑ no vuelve a la anterior")
    p.pg.reload()
    p.quieto(200)
    esperar(p.estado()["hash"] == f"#{ids[-2]}", "recargar pierde la vista")
    p.pg.go_back()
    p.quieto(200)
    esperar(p.estado()["hash"] == f"#{ids[-1]}", "Atrás del navegador no vuelve a la vista anterior")
    # notas: N las abre sin tapar el tablero; con ellas no hay desbordes y el riel no pisa su pie
    medio = V[len(V) // 2]
    p.ir(medio["hid"])
    p.tecla("n")
    esperar(p.estado()["notas"], "N no abre las notas")
    if p.estado()["notas"]:
        vp = p.pg.locator(".e3-vp").bounding_box()
        caja = p.pg.locator(".e3-notas").bounding_box()
        esperar(vp["y"] + vp["height"] <= caja["y"] + 1, "las notas tapan el tablero")
        esperar(f"Presenta {medio['integrante']}" in norm(p.pg.locator(".e3-notas").inner_text()),
                "las notas no dicen quién presenta")
        fit = p.pg.evaluate("() => window.__fit().problemas.filter((x) => !/scroll-contenedor/.test(x.tipo) || !/e3-notas/.test(x.detalle))")
        esperar(not fit, f"con las notas abiertas el tablero desborda: {fit}")
        riel_ok = p.pg.evaluate("() => { const l = [...document.querySelectorAll('.lat-item')].pop().getBoundingClientRect();"
                                " const pie = document.querySelector('.lat-pie').getBoundingClientRect(); return l.bottom <= pie.top + 1 }")
        esperar(riel_ok, "con las notas abiertas el riel se encima con su pie")
        p.tecla("n")
        esperar(not p.estado()["notas"], "N no cierra las notas")
    # pantalla en negro: «.» y B; cualquier tecla vuelve sin cambiar de vista
    for k in (".", "b"):
        p.tecla(k)
        esperar(p.estado()["negro"], f"«{k}» no pone la pantalla en negro")
        p.tecla("PageDown")
        e = p.estado()
        esperar(not e["negro"] and e["hash"] == f"#{medio['hid']}", f"después de «{k}», una tecla no vuelve o cambia de vista")
    # F5 (el botón del control remoto) no recarga
    p.pg.evaluate("() => { window.__sin_recarga = 1 }")
    p.tecla("F5")
    esperar(p.pg.evaluate("() => window.__sin_recarga === 1") and p.estado()["hash"] == f"#{medio['hid']}", "F5 recarga la página")
    # dos ventanas se siguen; la de notas (?notas) sigue al tablero
    i = V.index(medio)
    p.ir(medio["hid"])
    otra = p.vigilar(p.ctx.new_page())
    otra.goto(f"{p.url}#{ids[0]}")
    otra.wait_for_selector(".cuerpo .pant")
    otra.wait_for_timeout(300)
    esperar(otra.evaluate("() => location.hash") == f"#{medio['hid']}", "la ventana nueva no toma la vista de la abierta")
    p.tecla("PageDown")
    otra.wait_for_timeout(400)
    esperar(otra.evaluate("() => location.hash") == f"#{ids[i + 1]}", "la otra ventana no sigue a la siguiente")
    otra.keyboard.press("PageUp")
    otra.wait_for_timeout(400)
    esperar(p.estado()["hash"] == f"#{medio['hid']}", "la primera ventana no sigue a la otra")
    otra.close()
    ventana = p.vigilar(p.ctx.new_page())
    ventana.goto(f"{p.url}?notas#{ids[0]}")
    ventana.wait_for_selector(".e3-notas-ventana")
    ventana.wait_for_timeout(300)
    esperar(norm(medio["pregunta"]) in norm(ventana.inner_text(".e3-notas-ventana")), "la ventana de notas no toma la vista abierta")
    p.tecla("PageDown")
    ventana.wait_for_timeout(400)
    esperar(norm(V[i + 1]["pregunta"]) in norm(ventana.inner_text(".e3-notas-ventana")), "la ventana de notas no sigue al tablero")
    ventana.close()


# ---------------------------------------------------------------- 7. impresión

def impresion(p: Pagina, V):
    p.ir(V[0]["hid"])
    p.pg.emulate_media(media="print")
    p.pg.evaluate("() => window.dispatchEvent(new Event('beforeprint'))")
    p.pg.wait_for_timeout(400)
    preguntas = p.pg.evaluate("() => [...document.querySelectorAll('.impresion-flujo .hoja > .e2-preg')].map((x) => x.textContent)")
    if [norm(x) for x in preguntas] != [norm(v["pregunta"]) for v in V]:
        p.mal(f"impresión: las hojas traen {preguntas}, se esperaba una por vista en orden")
    paginas = len(re.findall(rb"/Type\s*/Page(?![s\w])", p.pg.pdf(prefer_css_page_size=True)))
    if paginas != len(V):
        p.mal(f"impresión: el PDF tiene {paginas} páginas, se esperaba {len(V)} (una por vista)")
    p.pg.evaluate("() => window.dispatchEvent(new Event('afterprint'))")
    p.pg.emulate_media(media="screen")
    p.pg.wait_for_timeout(200)
    if p.pg.locator(".impresion-flujo").count():
        p.mal("impresión: después de afterprint el tablero no vuelve a la vista")
    return paginas


# ---------------------------------------------------------------- 8. sin navegador

def estatico(V, CF):
    mal = []
    ids = [v["id"] for v in V]
    if len(set(ids)) != len(ids):
        mal.append(f"CF: ids repetidos {ids}")
    for v in V:
        if len(v["pregunta"]) > 74:
            mal.append(f"CF: la pregunta de {v['id']} tiene {len(v['pregunta'])} caracteres (74 o menos)")
    total = sum(v["segundos"] for v in V)
    objetivo = (CF.get("TIEMPOS") or {}).get("objetivo_s")
    if objetivo and total > objetivo:
        mal.append(f"CF: las vistas suman {mmss(total)} y el objetivo es {mmss(objetivo)}")
    return mal


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--capturas", default=str(APP / "final" / "capturas-verif"))
    ap.add_argument("--sin-capturas", action="store_true")
    ap.add_argument("--sin-esqueletos", action="store_true", help="falla si alguna vista sigue como esqueleto")
    ap.add_argument("--sin-muestra", action="store_true", help="falla si CF sigue siendo de muestra (antes de presentar)")
    a = ap.parse_args()
    if not HTML.exists():
        print(f"Falta {HTML.relative_to(APP)}: corre «npm run build:final».")
        print("RESULTADO: FALLA")
        sys.exit(1)
    CF = leer_modulo(CF_JS, "CF")
    DF = leer_modulo(DF_JS, "DF")
    V, bloques, total = historia(CF)
    cadenas_cf = cadenas(CF)
    nums = numeros_df(DF)
    out = Path(a.capturas)
    if not a.sin_capturas:
        out.mkdir(parents=True, exist_ok=True)
    problemas: list[str] = estatico(V, CF)
    hay_muestra = bool(CF.get("MUESTRA"))
    paginas = None
    with sync_playwright() as pw:
        nav = abrir_navegador(pw)
        for w, h in RES:
            p = Pagina(nav, w, h, problemas)
            try:
                hay_muestra |= vistas(p, w, h, V, bloques, CF, cadenas_cf, nums, out,
                                      (w, h) in CAPTURAR and not a.sin_capturas, a.sin_esqueletos)
                riel(p, V, bloques, CF)
                if (w, h) in NOTAS_RES:
                    notas(p, w, h, V, CF)
                if (w, h) == (1536, 864):
                    recorrido(p, V)
                    paginas = impresion(p, V)
            except PWError as e:
                p.mal(f"excepción de Playwright: {str(e).splitlines()[0][:160]}")
            finally:
                p.cerrar()
        nav.close()
    esqueletos = [v["id"] for v in V if not v.get("textos")]
    print(f"/final/: {len(V)} vistas en {len(bloques)} bloques, {mmss(total)} de "
          f"{mmss((CF.get('TIEMPOS') or {}).get('objetivo_s') or total)}; {len(RES)} resoluciones; PDF de {paginas} páginas")
    for b in bloques:
        print(f"   {b['titulo']} · {b.get('integrante', '')} · {mmss(b['segundos'])} · "
              + ", ".join(v["id"] for v in V if v["bloque"] == b["id"]))
    if esqueletos and not a.sin_esqueletos:
        print(f"aviso: vistas sin textos en CF (esqueleto si no tienen archivo): {', '.join(esqueletos)}")
    if hay_muestra:
        if a.sin_muestra:
            problemas.append("CF es de muestra (CF.MUESTRA o «MUESTRA» en pantalla)")
        else:
            print("aviso: el contenido es de MUESTRA (con --sin-muestra es un problema)")
    if problemas:
        print(f"{len(problemas)} problemas:")
        for x in problemas:
            print("  " + x)
        print("RESULTADO: FALLA")
        sys.exit(1)
    if not a.sin_capturas:
        print(f"capturas en {out}")
    print("RESULTADO: OK")


if __name__ == "__main__":
    main()

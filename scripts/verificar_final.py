"""Verifica /final/, la presentación final, abierta por file:// y sin red (19/11, contrato de las fases 8 a 11 de la
auditoría de dataviz).

    python3 -I scripts/verificar_final.py [HTML] [--capturas DIR | --sin-capturas] [--sin-muestra]
                                          [--res 1920x1080 ...] [--vistas V05,V16] [--hilos N]

HTML es el index.html armado (por defecto dist-final/index.html, de «npm run build:final»; para probar sin tocar
dist-final: «npx vite build --config vite.final.config.js --outDir <carpeta>» y pasar <carpeta>/index.html). Las
expectativas no se escriben acá: salen de CF (final/src/contenido_final.js), DF (final/src/datos_final.js), INFORME
(final/src/informe.js) y NOTAS (final/src/notas_final.js), leídos con node tal como los importa el tablero, y de
meta.pasos de cada vista, leído con el servidor de vite (ssrLoadModule) sin navegador. Las cifras de pantalla se
reconocen como valores de DF escritos con las reglas de e3/src/formato.js. El contrato: sección 0 de fase-8/spec.md,
secciones 1 y 2 de fase-9/spec.md, sección 2 de fase-10/spec.md y fase-11/spec.md (.workforce/auditoria-dataviz/).

1. Sin navegador: 16 vistas en 7 bloques, ids únicos, la suma de los segundos no pasa CF.TIEMPOS.objetivo_s, cada
   título de 74 caracteres o menos, meta.pasos de cada vista entero de 1 a 6; cada clave de informe de CF está en
   INFORME.secciones, su página es un entero dentro del PDF del consolidado acumulado (si está a mano) e INFORME.url es la
   de la spec 2.3; cada bloque con su «Integrante n» (tabla 2.1 de la fase 11); notas_final.js con las 16 vistas, una
   lista por paso, tantas como meta.pasos y ninguna vacía; las vistas no usan useEscalaTexto ni HECHO, no escriben
   colores a mano (#hex, rgb(), hsl(): van por nombre, de svg.jsx) ni texto o números entre etiquetas del JSX.
2. Con navegador (Playwright, file://), a 1920×1080, 1280×720, 1366×768, 1536×864 y 1024×768, cada vista completa y en
   cada paso (?paso=k): monta, la página no desborda, window.__fit() limpio, sin texto pisado, cortado, fuera del lienzo
   ni de la ventana, letra de 20 u para arriba fuera del riel (los chequeos de scripts/captura_vista.py), en 16:9 el
   dibujo entre el 70 % y el 95 % del alto del lienzo; zoom k = máx(0,85; mín(1,2; ancho / 1152; alto / 640)) y
   --fin-u = mín(ancho / 1920; alto / 1080) lógicos; el título en un renglón; cada bloque del riel en un renglón; cero
   errores de consola y ningún pedido de red (los enlaces al informe no se piden).
3. Contra CF y DF, en la vista completa: el título (y el de la pestaña), la sección, «n / 16», el riel (vistas, rótulos,
   bloques, subtítulo y la activa), la tarjeta de cifra (una, la central, con una cifra; su rótulo de CF de 22
   caracteres o menos; su fragmento de CF de 2 a 6 palabras sin otro número), «Decisión · área · estado» y la frase corta
   (60 caracteres o menos), la conclusión, qué mide en el aria-label del lienzo; cada cifra visible del cuerpo es un
   valor de DF con las reglas de formato.js, una página de INFORME o una marca de eje (texto en el color de contexto, de
   23 u o menos, junto a una línea del eje: es escala, no dato); ni «pendiente», «abierto», «a definir», «sin
   respuesta», «espera respuesta», ni cadenas retiradas del canon, en pantalla ni en los title; sin códigos internos en
   el cuerpo (los HU-n-nn, solo en la V12); terracota solo si CF la declara.
4. Pasos: en el paso k, ningún texto de lo que llega en un paso posterior se ve (opacidad, visibilidad o relleno del
   texto); la tarjeta de cifra, la decisión y la conclusión se ven desde el paso 1 y dicen lo mismo que en la vista
   completa. Avanzar (→, ↓, Av Pág) y retroceder (←, ↑, Re Pág) recorren pasos y vistas como dice la fase 9 (2.1): se
   compara cada posición del recorrido de punta a punta con la que sale de la regla; Inicio, Fin, el clic en el riel, el
   enlace #vNN, recargar y Atrás abren la vista completa; una tecla mantenida no recorre.
5. Botón de información, en cada vista y resolución: abre el recuadro con la referencia de CF («Informe, sección …») y
   un enlace por clave a INFORME.url#page=N (otra pestaña, noopener), con la página de INFORME.secciones; no cambia el
   paso; Escape lo cierra. Una vez: la tecla R, otro clic, un clic fuera, el foco en el botón no se queda con las flechas
   y al cambiar de vista se cierra; no se imprime. V16: el contacto dice scaules@itba.edu.ar y el QR se decodifica a
   INFORME.url (con opencv, pyzbar o zbarimg; si no hay ninguno, avisa y no falla por eso).
6. Notas (N), en cada posición del recorrido: «n / 16 · paso k de N», el título, el tiempo de la vista, el acumulado
   contra el objetivo, «Presenta Integrante n», el bloque con su acumulado, la frase del paso en curso (el comienzo de
   cada párrafo de NOTAS[id][k − 1]) a la vista en el panel y la vista que sigue; el panel no tapa el tablero. Dos
   ventanas (la de notas, ?notas, y otra del tablero) siguen el mismo paso en las dos direcciones. Impresión: 16 hojas,
   en orden, cada una completa (todo encendido), sin encabezado ni recuadro, y el PDF de Chrome con 16 páginas. Pantalla
   en negro («.» y B, cualquier tecla vuelve sin cambiar de posición), P oculta y muestra el riel, F5 no recarga.

Las resoluciones corren en paralelo (un Chromium por hilo; --hilos 1 las corre en fila). Capturas de cada vista completa
a 1280×720 y 1920×1080 en final/capturas-verif/ (fuera del control de versiones). Termina con «RESULTADO: OK» o con la
lista de problemas (los iguales en varias resoluciones van en una línea), «RESULTADO: FALLA» y código 1.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import shutil
import subprocess
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

from playwright.sync_api import Error as PWError
from playwright.sync_api import sync_playwright

APP = Path(__file__).resolve().parents[1]
VAULT = APP.parents[1] if APP.name == ".wt-final" else APP.parent
HTML_DEF = APP / "dist-final" / "index.html"
SRC = APP / "final" / "src"
CF_JS = SRC / "contenido_final.js"
DF_JS = SRC / "datos_final.js"
NOTAS_JS = SRC / "notas_final.js"
INFORME_JS = SRC / "informe.js"
PDF_INFORME = VAULT / "entregas" / "Consolidado acumulado - Entregables 1-4 - GRUPO 2.pdf"
URL_INFORME = "https://sebascaules.github.io/TP_82.21-Data-Driven/final/consolidado-acumulado-grupo-2.pdf"
MAIL = "scaules@itba.edu.ar"
# Cadenas del canon que ya no van (lista_negra.cadenas_vX_Y): en pantalla, en los title y en las notas. La lista completa,
# con las descripciones de uso, la corre scripts/check_final_f6.py sobre el texto renderizado.
CANON = VAULT / ".workforce" / "presentacion-final" / "fase-2" / "canon.json"
if not CANON.exists():
    CANON = VAULT / "entregas" / "entregable-4" / "_build" / "A" / "registro" / "canon.json"
try:
    _ln = json.loads(CANON.read_text(encoding="utf-8"))["lista_negra"]
    NEGRA_CANON = [c for k, xs in _ln.items() if re.fullmatch(r"cadenas_v\d+_\d+", k) for c in xs]
except (OSError, KeyError, ValueError):
    NEGRA_CANON = []

# scripts/captura_vista.py, cargado por su ruta (con «python3 -I» la carpeta del script no está en sys.path): sus
# chequeos por captura (texto pisado, cortado o fuera, letra mínima, relleno del lienzo) se reusan tal cual.
_spec = importlib.util.spec_from_file_location("captura_vista", APP / "scripts" / "captura_vista.py")
CV = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(CV)

RES = [(1920, 1080), (1280, 720), (1366, 768), (1536, 864), (1024, 768)]
CAPTURAR = {(1280, 720), (1920, 1080)}
RES_INTERACCION = (1536, 864)
VISTAS = 16
BLOQUES_IDS = ["apertura", "datos", "modelo", "economia", "legal", "gestion", "cierre"]
# Tabla 2.1 de la fase 11: el integrante de cada bloque.
INTEGRANTE = {"apertura": 1, "datos": 2, "modelo": 3, "economia": 4, "legal": 5, "gestion": 1, "cierre": 1}
MAX_PASOS = 6
MAX_TITULO = 74
NBSP = " "
MENOS = "−"


def k_de(w, h):
    return max(0.85, min(1.2, w / 1152, h / 640))


# ---------------------------------------------------------------- lectura de CF, DF, INFORME, NOTAS y meta

def leer_modulo(ruta: Path, var: str):
    """El objeto exportado `var` de un módulo ES, importado con node tal como lo importa el tablero."""
    codigo = "const m = await import(process.argv[1]); process.stdout.write(JSON.stringify(m[process.argv[2]]))"
    r = subprocess.run(["node", "--input-type=module", "-e", codigo, ruta.resolve().as_uri(), var],
                       capture_output=True, text=True)
    if r.returncode != 0 or not r.stdout:
        raise SystemExit(f"No pude leer {var} de {ruta.relative_to(APP)} con node: {r.stderr.strip()[:300]}")
    return json.loads(r.stdout)


# meta de cada final/src/vistas/V*.jsx tal como la exporta (sin pasosDe): el servidor de vite en modo SSR, sin navegador.
META_JS = r"""
import { createServer } from 'vite'
import { readdirSync } from 'node:fs'
globalThis.location ??= { search: '', hash: '', pathname: '/' }
globalThis.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
const [config, raiz] = process.argv.slice(1)
const server = await createServer({ configFile: config, root: raiz, logLevel: 'silent', appType: 'custom',
  server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, include: [] } })
const out = {}
try {
  for (const f of readdirSync(raiz + '/src/vistas').filter((x) => /^V\d+.*\.jsx$/.test(x)).sort()) {
    try {
      const m = await server.ssrLoadModule('/src/vistas/' + f)
      out[f] = { meta: m.meta ?? null, default: typeof m.default === 'function' }
    } catch (e) { out[f] = { error: String(e).slice(0, 300) } }
  }
} finally { await server.close() }
process.stdout.write(JSON.stringify(out))
"""


def leer_metas():
    r = subprocess.run(["node", "--input-type=module", "-e", META_JS, str(APP / "vite.final.config.js"), str(APP / "final")],
                       capture_output=True, text=True, cwd=APP, timeout=120)
    if r.returncode != 0 or not r.stdout:
        raise SystemExit(f"No pude leer meta de las vistas con vite: {r.stderr.strip()[-400:]}")
    return json.loads(r.stdout)


def plano(t):
    return re.sub(r"\[\[|\]\]", "", (t or "").replace("**", ""))


def norm(t):
    return re.sub(r"\s+", " ", (t or "").replace(NBSP, " ").replace(" ", " ")).strip()


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


def numeros_df(DF):
    """Cada número de DF (anclas y tablas) escrito como lo escribe formato.js: con 0 a 3 decimales, como viene o ×100 (pct),
    con y sin signo. Una cifra del cuerpo tiene que ser una de estas (o una página de INFORME, o una marca de eje)."""
    salida = set()

    def recorrer(x):
        if isinstance(x, bool):
            return
        if isinstance(x, (int, float)):
            for d in range(4):
                for v in (x, x * 100, abs(x), abs(x) * 100):   # sin signo: «queda 0,25 puntos debajo»
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


def cadenas(x):
    """Todas las cadenas de un objeto, normalizadas y sin marcado."""
    if isinstance(x, str):
        return {norm(plano(x))}
    if isinstance(x, dict):
        return set().union(*(cadenas(v) for v in x.values())) if x else set()
    if isinstance(x, list):
        return set().union(*(cadenas(v) for v in x)) if x else set()
    return set()


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
                 bloque_total=b["segundos"], bloque_titulo=b["titulo"], bloque_nombre=b["nombre"])
    return vistas, bloques, total


def juntar(xs):
    return xs[0] if len(xs) == 1 else (", ".join(xs[:-1]) + " y " + xs[-1] if xs else "")


def rotulo_informe(claves):
    """«Informe, sección 23.6», «Informe, secciones 31.1 y 23.2», «Informe, sección 21.1 y Anexo 1, A1.2» (como
    rotuloInforme de vistas/index.jsx)."""
    secciones = [k for k in claves if not re.match(r"A\d+\.", k)]
    anexos: dict[str, list[str]] = {}
    for k in claves:
        m = re.match(r"A(\d+)\.", k)
        if m:
            anexos.setdefault(m.group(1), []).append(k)
    partes = []
    if secciones:
        partes.append(f"{'secciones' if len(secciones) > 1 else 'sección'} {juntar(secciones)}")
    for n, ks in anexos.items():
        partes.append(f"Anexo {n}, {juntar(ks)}")
    return f"Informe, {juntar(partes)}"


def grupos_notas(entrada):
    """Las notas de una vista como lista de pasos (cada uno, sus párrafos): la forma v2.0 de exportar_notas.py
    (NOTAS["Vnn"][k - 1], los párrafos del paso k). None si la entrada no tiene esa forma."""
    if not isinstance(entrada, list) or not all(isinstance(x, list) for x in entrada):
        return None
    return [[p for p in x if isinstance(p, str)] for x in entrada]


def paginas_pdf(pdf: Path):
    if not pdf.exists():
        return None
    try:
        r = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True, timeout=60)
        m = re.search(r"^Pages:\s+(\d+)", r.stdout, re.M)
        if m:
            return int(m.group(1))
    except (OSError, subprocess.TimeoutExpired):
        pass
    try:
        from pypdf import PdfReader
        return len(PdfReader(str(pdf)).pages)
    except Exception:   # noqa: BLE001
        return None


# ---------------------------------------------------------------- 1. sin navegador

def estatico(V, bloques, CF, INFORME, NOTAS, metas):
    mal, info = [], []
    ids = [v["id"] for v in V]
    if len(set(ids)) != len(ids):
        mal.append(f"CF: ids repetidos {ids}")
    if len(ids) != VISTAS:
        mal.append(f"CF: {len(ids)} vistas (se presentan {VISTAS})")
    if [b["id"] for b in CF["BLOQUES"]] != BLOQUES_IDS:
        mal.append(f"CF: los bloques son {[b['id'] for b in CF['BLOQUES']]}, se esperaban {BLOQUES_IDS} (7)")
    for v in V:
        if len(v["pregunta"]) > MAX_TITULO:
            mal.append(f"CF: el título de {v['id']} tiene {len(v['pregunta'])} caracteres ({MAX_TITULO} o menos)")
    total = sum(v["segundos"] for v in V)
    objetivo = (CF.get("TIEMPOS") or {}).get("objetivo_s")
    if not objetivo:
        mal.append("CF: falta TIEMPOS.objetivo_s")
    elif total > objetivo:
        mal.append(f"CF: las vistas suman {mmss(total)} y el objetivo es {mmss(objetivo)}")
    # integrantes (tabla 2.1 de la fase 11)
    for b in CF["BLOQUES"]:
        n = INTEGRANTE.get(b["id"])
        if n and b.get("integrante") != f"Integrante {n}":
            mal.append(f"CF: el bloque {b['id']} lo presenta «{b.get('integrante')}», la tabla 2.1 dice «Integrante {n}»")
        for v in b["vistas"]:
            if v.get("integrante") and v["integrante"] != b.get("integrante"):
                mal.append(f"CF: {v['id']} dice «{v['integrante']}» y su bloque «{b.get('integrante')}»")
    # informe (spec 2.3)
    if INFORME.get("url") != URL_INFORME:
        mal.append(f"informe.js: url «{INFORME.get('url')}», la spec 2.3 dice «{URL_INFORME}»")
    secs = INFORME.get("secciones") or {}
    paginas = paginas_pdf(PDF_INFORME)
    for v in V:
        claves = v.get("informe")
        if not isinstance(claves, list) or not claves:
            mal.append(f"CF: {v['id']} no trae informe (claves de INFORME.secciones)")
            continue
        for k in claves:
            p = secs.get(k)
            if not isinstance(p, int) or isinstance(p, bool):
                mal.append(f"CF: {v['id']} cita la sección «{k}», que no está en INFORME.secciones")
            elif paginas is not None and not 1 <= p <= paginas:
                mal.append(f"informe.js: la sección «{k}» ({v['id']}) va a la página {p} y el PDF tiene {paginas}")
    info.append(f"informe: {len(secs)} secciones, versión {INFORME.get('version')}, "
                + (f"PDF de {paginas} páginas" if paginas else "sin el PDF a mano (no se comprueban las páginas)"))
    # meta.pasos (sin navegador, con vite)
    pasos = {}
    por_id = {}
    for f, m in metas.items():
        if "error" in m:
            mal.append(f"final/src/vistas/{f}: no carga ({m['error']})")
            continue
        mid = (m.get("meta") or {}).get("id") or re.match(r"(V\d+)", f).group(1)
        if m.get("default"):
            por_id[mid] = (f, m.get("meta") or {})
    for v in V:
        if v["id"] not in por_id:
            mal.append(f"{v['id']}: sin archivo con default en final/src/vistas (sería esqueleto)")
            continue
        f, meta = por_id[v["id"]]
        n = meta.get("pasos", 1)
        if not isinstance(n, int) or isinstance(n, bool) or not 1 <= n <= MAX_PASOS:
            mal.append(f"{f}: meta.pasos es {json.dumps(n)} (entero de 1 a {MAX_PASOS})")
            continue
        pasos[v["id"]] = n
    # notas_final.js (forma v2.0: una lista por paso)
    if set(NOTAS) != set(ids):
        sobran, faltan = sorted(set(NOTAS) - set(ids)), sorted(set(ids) - set(NOTAS))
        mal.append(f"notas_final.js: vistas que faltan {faltan}, que sobran {sobran}")
    for v in V:
        if v["id"] not in NOTAS:
            continue
        g = grupos_notas(NOTAS[v["id"]])
        if g is None:
            mal.append(f"notas_final.js: {v['id']} no es una lista por paso (NOTAS[id][k − 1] = párrafos del paso k)")
            continue
        if v["id"] in pasos and len(g) != pasos[v["id"]]:
            mal.append(f"notas_final.js: {v['id']} trae {len(g)} pasos y la vista tiene {pasos[v['id']]}")
        for k, ps in enumerate(g, 1):
            if not [p for p in ps if p.strip()]:
                mal.append(f"notas_final.js: {v['id']}, paso {k}, sin párrafos")
        for c in negra_canon("\n".join(p for ps in g for p in ps)):
            mal.append(f"notas_final.js: {v['id']} dice «{c}», cadena del canon que ya no va")
    # las vistas: la letra va en u (useU) y el verde es solo de la tarjeta de decisión (sección 0.5 de la fase 8)
    for f in sorted((SRC / "vistas").glob("*.jsx")):
        txt = re.sub(r"/\*.*?\*/", "", f.read_text(encoding="utf-8"), flags=re.S)
        txt = re.sub(r"(?m)^\s*//.*$|\s//.*$", "", txt)
        for patron in ("useEscalaTexto", "HECHO"):
            if re.search(rf"\b{patron}\b", txt):
                mal.append(f"{f.relative_to(APP)}: usa {patron} (la letra va en u y el verde es de la decisión)")
        # colores solo por nombre (svg.jsx) y ningún texto ni número tipeado entre etiquetas (secciones 0.3 a 0.5)
        sin_errores = re.sub(r"new Error\((['\"`]).*?\1\)", "", txt)
        for m in re.finditer(r"#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(", sin_errores):
            mal.append(f"{f.relative_to(APP)}: color escrito a mano «{m.group(0)}» (van por nombre, de svg.jsx)")
        for m in re.finditer(r">([^<>{}]*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9][^<>{}]*)</", sin_errores):
            if m.group(1).strip() and not re.search(r"[=;()]|=>|&&", m.group(1)):
                mal.append(f"{f.relative_to(APP)}: texto escrito en el JSX «{m.group(1).strip()[:40]}» (va en textos_vistas o DF)")
    return mal, info, pasos


def negra_canon(texto):
    plano_ = norm(texto).lower()
    return [c for c in NEGRA_CANON if c.lower() in plano_]


# ---------------------------------------------------------------- en el navegador

ESTADO = r"""() => {
  const a = document.querySelector('#root .app')
  return {
    vista: a?.dataset.vista ?? null, paso: a ? Number(a.dataset.paso) : null, pasos: a ? Number(a.dataset.pasos) : null,
    completa: a ? a.hasAttribute('data-completa') : null, hash: location.hash,
    negro: !!document.querySelector('.e3-negro'), notas: !!document.querySelector('.e3-notas'),
    activa: document.querySelector('.lat-item.on')?.dataset.id ?? '',
    info: !!document.querySelector('.fin-info-recuadro'),
  }
}"""

# Lo que se mira en cada posición, además de CV.CHEQUEO: desborde, zoom y u, título y riel en un renglón, textos de pasos
# posteriores a la vista, y la banda, la decisión y la conclusión (deben verse desde el paso 1).
EXTRA = r"""() => {
  const q = (s) => document.querySelector(s)
  const p = []
  const se = document.scrollingElement
  if (se.scrollHeight > se.clientHeight + 1 || se.scrollWidth > se.clientWidth + 1) p.push('la página desborda (scroll)')
  const vp = q('.e3-vp')
  const ve = (el) => !el.checkVisibility || el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
  const transp = (c) => /^(transparent|rgba\(0, 0, 0, 0\))$/.test(c || '')
  const veTxt = (el) => ve(el) && !transp(getComputedStyle(el).webkitTextFillColor) && !transp(getComputedStyle(el).color)
  const renglones = (el) => {
    const rg = document.createRange(); rg.selectNodeContents(el)
    return new Set([...rg.getClientRects()].filter((r) => r.width > 0.5).map((r) => Math.round(r.top))).size
  }
  const preg = q('.e2-enc .e2-preg')
  if (preg) {
    if (renglones(preg) > 1) p.push(`el título ocupa ${renglones(preg)} renglones`)
    if (preg.scrollWidth > preg.clientWidth + 1) p.push('el título se corta')
    const der = q('.e2-enc .e2-enc-corte')
    if (der) {
      const rg = document.createRange(); rg.selectNodeContents(preg)
      const a = rg.getBoundingClientRect(), b = der.getBoundingClientRect()
      if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1)
        p.push('el título pisa «n / 16»')
    }
  }
  for (const s of document.querySelectorAll('.lat-grupo span')) {
    if (renglones(s) > 1) p.push(`rótulo del riel en dos renglones: «${s.textContent}»`)
  }
  // lo que llega en un paso posterior (Paso atenuado u oculto): ningún texto suyo se ve
  const tardios = []
  for (const paso of document.querySelectorAll('.cuerpo .fin-paso[data-revela="atenuado"], .cuerpo .fin-paso[data-revela="oculto"]')) {
    for (const t of paso.querySelectorAll('text')) {
      if (t.textContent.trim() && ve(t) && !transp(getComputedStyle(t).fill)) tardios.push(t.textContent.trim().slice(0, 40))
    }
    const w = document.createTreeWalker(paso, NodeFilter.SHOW_TEXT)
    while (w.nextNode()) {
      const n = w.currentNode, el = n.parentElement
      if (!n.textContent.trim() || !el || el.closest('svg')) continue
      const rg = document.createRange(); rg.selectNodeContents(n)
      if (![...rg.getClientRects()].some((r) => r.width > 0.5 && r.height > 0.5)) continue
      if (veTxt(el)) tardios.push(n.textContent.trim().slice(0, 40))
    }
  }
  const pieza = (sel) => {
    const el = q(sel)
    if (!el) return null
    const apagado = el.closest('.fin-paso:not([data-revela="on"])')
    const rg = el.getClientRects().length
    return { txt: el.textContent.replace(/\s+/g, ' ').trim(), ve: !!rg && veTxt(el) && !apagado }
  }
  return {
    problemas: p, tardios, zoom: vp?.currentCSSZoom ?? 1,
    u: vp ? parseFloat(getComputedStyle(vp).getPropertyValue('--fin-u')) : null,
    banda: pieza('.fin-banda .e2-banda-cifras > .tarjeta'), dec: pieza('.fin-banda .tarjeta-dec'),
    concl: pieza('.fin-graf .e3-conclusion'),
  }
}"""

LEER = r"""() => {
  const q = (s) => document.querySelector(s)
  const vp = q('.e3-vp'), cuerpo = q('.cuerpo')
  const ve = (el) => !el.checkVisibility || el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
  const color = (v) => { const el = document.createElement('i'); el.style.color = v; vp.appendChild(el)
                         const c = getComputedStyle(el).color; el.remove(); return c }
  const CTX = color('var(--e3-ctx, #5a6478)'), EJE = color('var(--e3-eje, #6a7489)')
  const TERRA = [color('var(--terra)'), color('var(--terra-osc)')].filter((c) => c && c !== 'rgba(0, 0, 0, 0)')
  const u = parseFloat(getComputedStyle(vp).getPropertyValue('--fin-u'))
  const z = vp.currentCSSZoom ?? 1
  // las líneas del eje (EJE) del cuerpo, para reconocer las marcas de escala
  const lineas = [...cuerpo.querySelectorAll('svg line')].filter((l) => ve(l) && getComputedStyle(l).stroke === EJE)
    .map((l) => l.getBoundingClientRect())
  const cerca = (a, b, d) => Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right)) <= d &&
                             Math.max(0, Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom)) <= d
  const textos = []
  for (const t of cuerpo.querySelectorAll('svg text')) {
    if (!t.textContent.trim() || !ve(t)) continue
    const cs = getComputedStyle(t), fs = parseFloat(cs.fontSize), r = t.getBoundingClientRect()
    const eje = cs.fill === CTX && fs <= 23.5 * u && lineas.some((l) => cerca(r, l, 1.6 * fs * z))
    textos.push({ t: t.textContent, eje })
  }
  const w = document.createTreeWalker(cuerpo, NodeFilter.SHOW_TEXT)
  while (w.nextNode()) {
    const n = w.currentNode, el = n.parentElement
    if (!n.textContent.trim() || !el || el.closest('svg') || !ve(el)) continue
    if (el.closest('.solo-lector')) continue
    textos.push({ t: n.textContent, eje: false })
  }
  const svgTxt = [...cuerpo.querySelectorAll('svg text')].map((t) => t.textContent)
  const tarjetas = [...document.querySelectorAll('.fin-banda .e2-banda-cifras > .tarjeta')]
  const titulos = [...vp.querySelectorAll('[title]')].map((e) => e.getAttribute('title'))
    .concat([...vp.querySelectorAll('svg title')].map((e) => e.textContent))
  const terracota = TERRA.length ? [...cuerpo.querySelectorAll('*')].filter((el) => {
    const cs = getComputedStyle(el); return TERRA.includes(cs.fill) || TERRA.includes(cs.stroke) || TERRA.includes(cs.color)
  }).length : 0
  const donde = q('.e2-enc .e2-enc-corte')
  return {
    preg: q('.e2-enc .e2-preg')?.textContent ?? null, sec: q('.e2-enc .fin-enc-sec')?.textContent ?? null,
    corte: donde ? [...donde.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('') : null,
    corteTodo: donde?.textContent ?? null, titulo: document.title,
    riel: {
      ids: [...document.querySelectorAll('.lat-item')].map((b) => b.dataset.id),
      titulos: [...document.querySelectorAll('.lat-item .lat-txt')].map((x) => x.textContent.trim()),
      grupos: [...document.querySelectorAll('.lat-grupo span')].map((x) => x.textContent.trim()),
      sub: q('.lat-sub')?.textContent.trim() ?? '',
      activa: q('.lat-item.on')?.dataset.id ?? '', actual: q('.lat-item[aria-current="page"]')?.dataset.id ?? '',
    },
    banda: !!q('.fin-banda'),
    tarjetas: tarjetas.map((t) => ({
      central: t.classList.contains('e2-central'), cifras: t.querySelectorAll('.par-val').length,
      cifra: t.querySelector('.par-val')?.textContent ?? '', rotulo: t.querySelector('.kpi-lbl > span')?.textContent.trim() ?? '',
      linea: t.querySelector('.e2-linea')?.textContent ?? '',
    })),
    dec: q('.tarjeta-dec .kpi-lbl > b')?.textContent ?? null, decLbl: q('.tarjeta-dec .kpi-lbl > span')?.textContent ?? null,
    decVe: (() => { const l = q('.tarjeta-dec .kpi-lbl'); return !!l && l.getClientRects().length > 0 && ve(l) })(),
    decLlano: q('.tarjeta-dec .dec-llano')?.textContent ?? null,
    conclusion: q('.fin-graf .e3-conclusion')?.textContent ?? null,
    mide: q('.cuerpo .fin-mide')?.textContent ?? null, lienzoAria: q('.cuerpo .fin-lienzo')?.getAttribute('aria-label') ?? null,
    textos, terracota, titulos,
    pantalla: vp.innerText + '\n' + svgTxt.join('\n'), cuerpo: cuerpo.innerText + '\n' + svgTxt.join('\n'),
  }
}"""

INFO = r"""() => {
  const r = document.querySelector('.fin-info-recuadro')
  const b = document.querySelector('.fin-info')
  if (!r) return { abierto: false, boton: b?.getAttribute('aria-expanded') ?? null, hayBoton: !!b }
  const ve = (el) => !el.checkVisibility || el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
  return {
    abierto: r.getClientRects().length > 0 && ve(r), hayBoton: !!b, boton: b?.getAttribute('aria-expanded') ?? null,
    ref: r.querySelector('.fin-info-ref')?.textContent ?? '',
    enlaces: [...r.querySelectorAll('a')].map((a) => ({ href: a.getAttribute('href'), target: a.target, rel: a.rel,
      texto: a.textContent.trim() })),
    paginas: [...r.querySelectorAll('.fin-info-pag')].map((x) => x.textContent.trim()),
  }
}"""

QR_CAJA = r"""() => {
  const p = document.querySelector('.cuerpo .fin-lienzo path[shape-rendering="crispEdges"]')
  const g = p?.parentElement
  const r = (g?.querySelector('rect') ?? p)?.getBoundingClientRect()
  return r ? { x: r.left, y: r.top, w: r.width, h: r.height } : null
}"""

PROHIBIDAS = re.compile(r"\b(pendientes?|abiert[oa]s?|a definir|sin respuesta|espera respuesta)\b", re.I)
CODIGOS = re.compile(r"\benv[ií]o \d+|\bconsulta \d+|\b[A-H]\d{2}\b|\bHU-\d+-\d+\b")
HU = re.compile(r"^HU-\d+-\d+$")
NUMERO = re.compile(r"[−+]?\d[\d.]*(?:,\d+)?")
TELEFONO = re.compile(r"\+?\d[\d ()-]{7,}\d")
CORREO = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")


def abrir_navegador(pw):
    """El Chromium de la caché de Playwright (Chrome for Testing, el más nuevo); si no está, el de esta versión de
    Playwright o el Chrome del sistema (el orden de captura_vista.py). Primero el de la caché: cierra en menos de un
    segundo, y el Chrome del sistema tarda de 6 a más de 60 s en cerrar después de un recorrido largo. La versión es la
    del Chrome del sistema más o menos uno: el texto se mide igual."""
    cache = Path.home() / "Library" / "Caches" / "ms-playwright"
    if not cache.exists():
        cache = Path.home() / ".cache" / "ms-playwright"
    exes = []
    for patron in ("chromium-*/chrome-mac*/*.app/Contents/MacOS/*", "chromium-*/chrome-linux*/chrome"):
        exes += sorted(cache.glob(patron), key=lambda x: int(re.search(r"chromium-(\d+)", str(x)).group(1)), reverse=True)
    ultimo = None
    for kw in [dict(executable_path=str(e)) for e in exes] + [dict(), dict(channel="chrome")]:
        try:
            return pw.chromium.launch(**kw)
        except PWError as e:
            ultimo = e
    raise SystemExit(f"No pude abrir un navegador para Playwright: {ultimo}")


class Pagina:
    """Un contexto de Chromium a una resolución, con la consola y la red vigiladas. Cada posición se abre con una carga
    nueva del archivo (?r=n, que el tablero ignora), así ninguna arrastra el estado de la anterior."""

    def __init__(self, nav, html: Path, w, h, mal):
        self.base = html.resolve().as_uri()
        self.w, self.h = w, h
        self.res = f"{w}x{h}"
        self.mal_ = mal
        self.ctx = nav.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, reduced_motion="reduce")
        self.pg = self.vigilar(self.ctx.new_page())
        self.n = 0
        self.donde = ""

    def vigilar(self, pg):
        pg.on("console", lambda m: m.type == "error" and self.mal(f"consola{self.donde}: {m.text[:160]}"))
        pg.on("pageerror", lambda e: self.mal(f"error de página{self.donde}: {str(e)[:160]}"))
        pg.on("request", self._pedido)
        return pg

    def _pedido(self, req):
        u = req.url
        if u.startswith("data:") or u.split("#")[0].split("?")[0] == self.base:
            return
        self.mal(f"pedido de red{self.donde}: {u[:120]}")

    def mal(self, texto):
        self.mal_.append((self.res, texto))

    def url(self, hid, paso=None, extra=""):
        self.n += 1
        q = "&".join(x for x in (f"paso={paso}" if paso else "", extra, f"r={self.n}") if x)
        return f"{self.base}?{q}" + (f"#{hid}" if hid else "")

    def abrir(self, hid, paso=None, extra=""):
        self.pg.goto(self.url(hid, paso, extra), wait_until="load")
        self.listo()

    def listo(self, pg=None):
        pg = pg or self.pg
        pg.wait_for_function(CV.LISTO, timeout=15000)
        pg.evaluate("() => document.fonts.ready")
        pg.evaluate("() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))")

    def quieto(self, ms=40, pg=None):
        pg = pg or self.pg
        pg.wait_for_timeout(ms)
        pg.wait_for_function("() => !document.querySelector(':root:active-view-transition') && "
                             "document.getAnimations().every((a) => a.playState !== 'running')", timeout=5000)

    def estado(self, pg=None):
        return (pg or self.pg).evaluate(ESTADO)

    def tecla(self, k, n=1, pg=None):
        for _ in range(n):
            (pg or self.pg).keyboard.press(k)
            self.quieto(pg=pg)

    def cerrar(self):
        self.ctx.close()


def capas(c, malos, dieciseis):
    """Los hallazgos de CV.CHEQUEO (scripts/captura_vista.py) como problemas."""
    if c["vista"] == "esqueleto":
        malos.append("la vista quedó como esqueleto")
    malos += [f"__fit: {x}" for x in c["fit"]]
    malos += [f"se pisan: {x}" for x in c["pisan"]]
    malos += [f"fuera: {x}" for x in c["fuera"]]
    malos += [f"letra chica: {x}" for x in c["chicos"]]
    for lz in c["lienzos"]:
        if dieciseis and not CV.LLENA[0] <= lz["parte"] <= CV.LLENA[1]:
            malos.append(f"el dibujo ocupa el {lz['parte']:.0%} del alto del lienzo (del {CV.LLENA[0]:.0%} al {CV.LLENA[1]:.0%})")


# ---------------------------------------------------------------- 2, 3, 4 y 5: cada vista, en cada paso, a una resolución

def por_resolucion(html: Path, w, h, V, CF, INFORME, cadenas_cf, nums, pasos_meta, capturas: Path | None):
    mal: list[tuple[str, str]] = []
    datos = {"estados": 0, "qr": None, "eje": {}}
    t0 = time.time()
    k = k_de(w, h)
    u_esp = min(w / k / 1920, h / k / 1080)
    dieciseis = abs(w / h - 16 / 9) < 0.02
    with sync_playwright() as pw:
        nav = abrir_navegador(pw)
        p = Pagina(nav, html, w, h, mal)
        try:
            for v in V:
                hid = v["hid"]
                try:
                    p.donde = f" en {v['id']}"
                    p.abrir(hid)
                    ref = una_posicion(p, v, None, pasos_meta, dieciseis, k, u_esp, None, datos)
                    # 3. contra CF y DF, en la vista completa
                    c = p.pg.evaluate(LEER)
                    for x in contenido(v, c, CF, INFORME, cadenas_cf, nums, datos):
                        p.mal(f"{v['id']}: {x}")
                    if capturas is not None and (w, h) in CAPTURAR:
                        p.pg.screenshot(path=str(capturas / f"{hid}-{w}x{h}.png"))
                    if v["id"] == "V16" and (w, h) == (1920, 1080):
                        datos["qr"] = leer_qr_pagina(p.pg)
                    # 5. el botón de información
                    boton_info(p, v, INFORME, dieciseis)
                    # 4. cada paso
                    n = ref["pasos"] or 1
                    for paso in range(1, n + 1):
                        p.donde = f" en {v['id']} paso {paso}"
                        p.abrir(hid, paso)
                        una_posicion(p, v, paso, pasos_meta, dieciseis, k, u_esp, ref, datos)
                except PWError as e:
                    p.mal(f"{v['id']}: excepción de Playwright: {str(e).splitlines()[0][:160]}")
        finally:
            p.cerrar()
            nav.close()
    datos["t"] = round(time.time() - t0, 1)
    return mal, datos


def una_posicion(p: Pagina, v, paso, pasos_meta, dieciseis, k, u_esp, ref, datos):
    """Los chequeos de una posición (la vista completa si paso es None). Devuelve lo que la vista completa muestra (pasos,
    banda, decisión, conclusión) para comparar los pasos con ella."""
    datos["estados"] += 1
    donde = f"{v['id']}" + (f" paso {paso}" if paso else "")
    st = p.estado()
    malos: list[str] = []
    if st["vista"] != v["id"]:
        malos.append(f"se abrió {st['vista']}")
    pasos = st["pasos"]
    if paso is None:
        if pasos_meta.get(v["id"]) and pasos != pasos_meta[v["id"]]:
            malos.append(f"data-pasos {pasos} y meta.pasos {pasos_meta[v['id']]}")
        if not st["completa"] or st["paso"] != pasos:
            malos.append(f"el enlace #{v['hid']} no abre la vista completa (paso {st['paso']} de {pasos}, completa {st['completa']})")
        if st["hash"] != f"#{v['hid']}":
            malos.append(f"la dirección dice {st['hash']}")
    elif st["paso"] != paso or st["completa"]:
        malos.append(f"?paso={paso} dejó el paso {st['paso']} de {pasos} (completa {st['completa']})")
    c = p.pg.evaluate(CV.CHEQUEO, list(CV.LLENA))
    capas(c, malos, dieciseis)
    ex = p.pg.evaluate(EXTRA)
    malos += ex["problemas"]
    if abs((ex["zoom"] or 1) - k) > 1e-3:
        malos.append(f"zoom {ex['zoom']}, se esperaba {k:.4f}")
    if abs((ex["u"] or 0) - u_esp) > 1e-3:
        malos.append(f"--fin-u {ex['u']}, se esperaba {u_esp:.4f} (mín(ancho / 1920; alto / 1080) lógicos)")
    if ex["tardios"]:
        muestra = ", ".join(f"«{x}»" for x in ex["tardios"][:4]) + (" …" if len(ex["tardios"]) > 4 else "")
        malos.append(f"se ven {len(ex['tardios'])} textos de lo que llega en un paso posterior: {muestra}")
    if ref is not None:
        for nombre, clave in (("la tarjeta de cifra", "banda"), ("la decisión", "dec"), ("la conclusión", "concl")):
            r, a = ref.get(clave), ex.get(clave)
            if r is None:
                continue
            if a is None or not a["ve"]:
                malos.append(f"{nombre} no se ve (tiene que estar desde el paso 1)")
            elif norm(a["txt"]) != norm(r["txt"]):
                malos.append(f"{nombre} dice «{a['txt'][:60]}» y en la vista completa «{r['txt'][:60]}»")
    for x in malos:
        p.mal(f"{donde}: {x}")
    return {"pasos": pasos, "banda": ex["banda"], "dec": ex["dec"], "concl": ex["concl"]}


def contenido(v, c, CF, INFORME, cadenas_cf, nums, datos):
    """La vista completa contra CF y DF."""
    mal = []
    t = v.get("textos") or {}
    total = sum(len(b["vistas"]) for b in CF["BLOQUES"])
    if norm(c["preg"]) != norm(v["pregunta"]):
        mal.append(f"el título dice «{c['preg']}», CF dice «{v['pregunta']}»")
    if norm(c["titulo"]) != norm(f"{v['pregunta']} · {CF['TITULO']}"):
        mal.append(f"el título de la pestaña es «{c['titulo']}»")
    if norm(c["sec"]) != norm(v["bloque_nombre"]):
        mal.append(f"la sección dice «{c['sec']}», CF dice «{v['bloque_nombre']}»")
    if norm(c["corte"]) != f"{v['n']} / {total}" or norm(c["corteTodo"]) != f"{v['n']} / {total}":
        mal.append(f"arriba a la derecha dice «{norm(c['corteTodo'])}», se esperaba «{v['n']} / {total}» (sin la cita)")
    # el riel
    r, V_ids = c["riel"], [x["id"] for b in CF["BLOQUES"] for x in b["vistas"]]
    if r["ids"] != V_ids:
        mal.append(f"riel: trae {r['ids']}, CF dice {V_ids}")
    titulos_cf = [x["titulo"] for b in CF["BLOQUES"] for x in b["vistas"]]
    if [norm(x) for x in r["titulos"]] != [norm(x) for x in titulos_cf]:
        mal.append(f"riel: rótulos {r['titulos']}")
    grupos_cf = [b.get("riel") or b["titulo"] for b in CF["BLOQUES"]]
    if [norm(x) for x in r["grupos"]] != [norm(x) for x in grupos_cf]:
        mal.append(f"riel: bloques {r['grupos']}, CF dice {grupos_cf}")
    if norm(r["sub"]) != norm(CF["SUBTITULO"]):
        mal.append(f"riel: subtítulo «{r['sub']}»")
    if r["activa"] != v["id"] or r["actual"] != v["id"]:
        mal.append(f"riel: la activa es {r['activa'] or '—'} (aria-current {r['actual'] or '—'})")
    # la banda: una tarjeta de cifra (la central) y la verde con «Decisión · área · estado»
    d = t.get("decision")
    if d:
        if not c["banda"]:
            mal.append("CF trae decisión y la vista no tiene banda")
        tj = c["tarjetas"]
        if len(tj) != 1:
            mal.append(f"{len(tj)} tarjetas de cifra en la banda (una, la central)")
        for x in tj:
            if not x["central"]:
                mal.append("la tarjeta de cifra no es la central")
            if x["cifras"] != 1:
                mal.append(f"la tarjeta de cifra trae {x['cifras']} cifras (una)")
            rot = norm(x["rotulo"])
            if len(rot) > 22:
                mal.append(f"el rótulo de la tarjeta «{rot}» tiene {len(rot)} caracteres (22 o menos)")
            if rot not in cadenas_cf:
                mal.append(f"el rótulo de la tarjeta «{rot}» no sale de CF")
            lin = norm(x["linea"])
            if lin:
                if lin not in cadenas_cf:
                    mal.append(f"el fragmento «{lin}» no sale de CF")
                if not 2 <= len(lin.split()) <= 6:
                    mal.append(f"el fragmento «{lin}» tiene {len(lin.split())} palabras (de 2 a 6)")
                if re.search(r"\d", lin):
                    mal.append(f"el fragmento «{lin}» trae otro número")
            m = NUMERO.search(norm(x["cifra"]))
            if not m:
                mal.append(f"la cifra de la banda «{norm(x['cifra'])}» no tiene número")
        if norm(c["decLbl"]) != "Decisión" or not c["decVe"]:
            mal.append(f"la tarjeta verde no muestra su fila «Decisión · área · estado» (dice «{c['decLbl']}»)")
        if norm(c["dec"]) != norm(f"{d['area']} · {d['estado']}"):
            mal.append(f"la decisión dice «{c['dec']}», CF dice «{d['area']} · {d['estado']}»")
        if norm(c["decLlano"]) != norm(plano(d["corta"])):
            mal.append(f"la frase de la decisión es «{c['decLlano']}», CF dice «{d['corta']}»")
        if len(norm(c["decLlano"])) > 60:
            mal.append(f"la frase de la decisión tiene {len(norm(c['decLlano']))} caracteres (60 o menos)")
    elif c["banda"] or c["dec"] is not None:
        mal.append("tiene banda o tarjeta de decisión y CF no trae textos.decision")
    # la conclusión
    if "conclusion" in t:
        if c["conclusion"] is None or not norm(c["conclusion"]):
            mal.append("falta la conclusión (.e3-conclusion)")
        elif not norm(c["conclusion"]).startswith(norm(plano(t["conclusion"]))):
            mal.append(f"la conclusión «{norm(c['conclusion'])}» no empieza con la de CF")
    elif c["conclusion"] is not None:
        mal.append("muestra una conclusión y CF no trae textos.conclusion")
    if c["mide"] is not None:
        mal.append("qué mide está en pantalla (.fin-mide): va al aria-label del lienzo")
    if t.get("mide") and norm(c["lienzoAria"]) != norm(plano(t["mide"])):
        mal.append(f"el aria-label del lienzo es «{c['lienzoAria']}», CF dice qué mide «{t['mide']}»")
    if c["terracota"] and not t.get("terracota"):
        mal.append(f"{c['terracota']} elementos en terracota y CF no la declara (textos.terracota)")
    # cada cifra visible del cuerpo: un valor de DF, una página de INFORME o una marca de eje
    paginas = {str(x) for x in (INFORME.get("secciones") or {}).values()}
    url = INFORME.get("url") or ""
    eje = datos["eje"].setdefault(v["id"], set())
    for x in c["textos"]:
        txt = norm(x["t"])
        if v["id"] == "V12" and HU.match(txt):
            continue
        if len(txt) >= 6 and txt in url:          # la dirección del informe (V16), partida en renglones
            continue
        for m in NUMERO.finditer(txt):
            n = m.group(0).rstrip(".")
            if n in nums or n.lstrip("+") in nums or n in paginas:
                continue
            if x["eje"]:
                eje.add(n)
                continue
            mal.append(f"la cifra «{n}» de «{txt[:50]}» no es un valor de DF escrito con formato.js, ni una página del "
                       "informe, ni una marca de eje")
    # texto prohibido, cadenas del canon y códigos internos
    if m := PROHIBIDAS.search(c["pantalla"]):
        mal.append(f"en pantalla dice «{m.group(0)}»")
    for ti in c["titulos"]:
        if m := PROHIBIDAS.search(ti or ""):
            mal.append(f"un title dice «{m.group(0)}»: «{(ti or '')[:80]}»")
    for x in negra_canon(c["pantalla"] + "\n" + "\n".join(ti or "" for ti in c["titulos"])):
        mal.append(f"cadena del canon que ya no va «{x}»")
    for m in CODIGOS.finditer(c["cuerpo"]):
        if v["id"] == "V12" and HU.match(m.group(0)):
            continue
        mal.append(f"código interno en pantalla «{m.group(0)}»")
        break
    if v["id"] == "V16":
        correos = set(CORREO.findall(c["cuerpo"]))
        if MAIL not in correos:
            mal.append(f"el contacto no dice {MAIL}")
        if correos - {MAIL}:
            mal.append(f"otros correos en el cierre: {sorted(correos - {MAIL})}")
        if m := TELEFONO.search(c["cuerpo"].replace(url, "")):
            mal.append(f"un teléfono en el cierre: «{m.group(0)}»")
    return mal


def boton_info(p: Pagina, v, INFORME, dieciseis):
    """En la vista completa: un clic en el botón abre el recuadro con la referencia y los enlaces de CF e INFORME, sin
    cambiar el paso ni pedir nada a la red; con el recuadro abierto, los chequeos de captura_vista.py; Escape lo cierra."""
    donde = f"{v['id']} info"
    antes = p.estado()
    if not p.pg.locator(".fin-info").count():
        p.mal(f"{donde}: sin botón de información")
        return
    p.pg.locator(".fin-info").click()
    p.quieto()
    r = p.pg.evaluate(INFO)
    malos = []
    if not r["abierto"]:
        malos.append("un clic en el botón no abre el recuadro")
    else:
        if r["boton"] != "true":
            malos.append(f"el botón dice aria-expanded={r['boton']}")
        claves = v["informe"]
        if norm(r["ref"]) != rotulo_informe(claves):
            malos.append(f"la referencia dice «{r['ref']}», se esperaba «{rotulo_informe(claves)}»")
        secs = INFORME.get("secciones") or {}
        esperados = [f"{INFORME['url']}#page={secs.get(k)}" for k in claves]
        if [x["href"] for x in r["enlaces"]] != esperados:
            malos.append(f"enlaces {[x['href'] for x in r['enlaces']]}, se esperaban {esperados}")
        if not all(x["target"] == "_blank" and "noopener" in (x["rel"] or "") for x in r["enlaces"]):
            malos.append("algún enlace no abre en otra pestaña con noopener")
        if not all(x["texto"] == "Abrir en el informe" for x in r["enlaces"]):
            malos.append(f"enlaces que no dicen «Abrir en el informe»: {[x['texto'] for x in r['enlaces']]}")
        if r["paginas"] != [f"p. {secs.get(k)}" for k in claves]:
            malos.append(f"páginas {r['paginas']}")
        c = p.pg.evaluate(CV.CHEQUEO, list(CV.LLENA))
        capas(c, malos, dieciseis)
    despues = p.estado()
    if (despues["paso"], despues["completa"], despues["vista"]) != (antes["paso"], antes["completa"], antes["vista"]):
        malos.append(f"abrir el recuadro cambió la posición ({antes['vista']} {antes['paso']} → {despues['vista']} {despues['paso']})")
    p.pg.keyboard.press("Escape")
    p.quieto()
    if p.estado()["info"]:
        malos.append("Escape no cierra el recuadro")
    for x in malos:
        p.mal(f"{donde}: {x}")


# ---------------------------------------------------------------- 5. el QR de la V16

def leer_qr_pagina(pg):
    """Captura el QR de la V16 (el cuadrado blanco con su margen) y lo decodifica. (texto, decodificador) o
    (None, motivo)."""
    caja = pg.evaluate(QR_CAJA)
    if not caja:
        return None, "no encuentro el QR en la V16"
    pad = 12
    vp = pg.viewport_size
    x0, y0 = max(0, caja["x"] - pad), max(0, caja["y"] - pad)
    clip = {"x": x0, "y": y0, "width": min(vp["width"] - x0, caja["w"] + 2 * pad),
            "height": min(vp["height"] - y0, caja["h"] + 2 * pad)}
    png = pg.screenshot(clip=clip)
    return decodificar_qr(png)


def decodificar_qr(png: bytes):
    probados = []
    try:
        import cv2
        import numpy as np
        img = cv2.imdecode(np.frombuffer(png, np.uint8), cv2.IMREAD_COLOR)
        det = cv2.QRCodeDetector()
        for f in (1, 2, 3):
            im = img if f == 1 else cv2.resize(img, None, fx=f, fy=f, interpolation=cv2.INTER_NEAREST)
            val, _pts, _ = det.detectAndDecode(im)
            if val:
                return val, "opencv"
        probados.append("opencv")
    except ImportError:
        pass
    try:
        import io
        from PIL import Image
        from pyzbar.pyzbar import decode
        res = decode(Image.open(io.BytesIO(png)))
        if res:
            return res[0].data.decode("utf-8"), "pyzbar"
        probados.append("pyzbar")
    except ImportError:
        pass
    if shutil.which("zbarimg"):
        with tempfile.NamedTemporaryFile(suffix=".png") as f:
            f.write(png)
            f.flush()
            r = subprocess.run(["zbarimg", "--raw", "-q", f.name], capture_output=True, text=True)
            if r.returncode == 0 and r.stdout.strip():
                return r.stdout.strip(), "zbarimg"
        probados.append("zbarimg")
    if not probados:
        return None, "sin decodificador"
    return None, f"no se pudo decodificar ({', '.join(probados)})"


# ---------------------------------------------------------------- 4 y 6: recorrido, notas, dos ventanas, impresión

def simular(V, pasos, pos, accion):
    """La posición después de avanzar o retroceder desde pos = (i, paso, completa), según la fase 9 (2.1)."""
    i, paso, _completa = pos
    n = pasos[V[i]["id"]]
    if accion == "adelante":
        if paso < n:
            return (i, paso + 1, False)
        return (i + 1, 1, False) if i < len(V) - 1 else pos
    if paso > 1:
        return (i, paso - 1, False)
    return (i - 1, pasos[V[i - 1]["id"]], True) if i > 0 else pos


def notas_ok(txt_panel, actual, visible, v, paso, pasos, V, CF, NOTAS):
    """Lo que tiene que decir el panel de notas en la vista v, paso `paso` de `pasos`."""
    mal = []
    objetivo = (CF.get("TIEMPOS") or {}).get("objetivo_s") or sum(x["segundos"] for x in V)
    txt = norm(txt_panel)
    esperado = [f"{v['n']} / {len(V)}", norm(v["pregunta"]), mmss(v["segundos"]),
                f"total {mmss(v['total_hasta'])} de {mmss(objetivo)}", f"Presenta {v['integrante']}",
                f"{v['bloque_titulo']}: {mmss(v['bloque_hasta'])} de {mmss(v['bloque_total'])}"]
    if pasos > 1:
        esperado.append(f"paso {paso} de {pasos}")
    i = V.index(v)
    if i + 1 < len(V):
        esperado.append(f"Sigue: {norm(V[i + 1]['pregunta'])}")
    for x in esperado:
        if norm(x) not in txt:
            mal.append(f"no dice «{x}»")
    g = grupos_notas(NOTAS.get(v["id"]))
    if g and 1 <= paso <= len(g):
        if actual is None:
            mal.append("no marca el paso en curso (.fin-notas-actual)")
        else:
            a = norm(plano(actual))
            for par in g[paso - 1]:
                ini = norm(plano(par))[:40]
                if ini and ini not in a:
                    mal.append(f"la frase del paso en curso no trae «{ini}…»")
            if not visible:
                mal.append("la frase del paso en curso no queda a la vista en el panel")
    for c in negra_canon(txt):
        mal.append(f"dice «{c}», cadena del canon que ya no va")
    return mal


NOTAS_LEER = r"""() => {
  const n = document.querySelector('.e3-notas')
  if (!n) return null
  const a = n.querySelector('.fin-notas-actual'), caja = n.querySelector('.e3-notas-txt') ?? n
  let visible = false
  if (a) {
    const r = a.getBoundingClientRect(), c = caja.getBoundingClientRect(), p = n.getBoundingClientRect()
    const top = Math.max(r.top, c.top, p.top), bot = Math.min(r.bottom, c.bottom, p.bottom)
    visible = bot - top >= Math.min(20, r.height)
  }
  const vp = document.querySelector('.e3-vp')?.getBoundingClientRect()
  return { txt: n.innerText, actual: a?.innerText ?? null, visible,
           tapa: vp ? vp.bottom > n.getBoundingClientRect().top + 1 : false }
}"""


def interaccion(html: Path, V, CF, NOTAS, INFORME, pasos, grupo):
    """A 1536×864, un grupo de pruebas con su propio Chromium (los dos grupos corren en paralelo): «recorrido», el
    recorrido de punta a punta con las notas abiertas, las teclas, el riel y la URL; «resto», el botón de información, dos
    ventanas, la pantalla en negro, P, F5 y la impresión."""
    mal: list[tuple[str, str]] = []
    datos = {"pdf": None, "t": 0.0}
    t0 = time.time()
    w, h = RES_INTERACCION
    with sync_playwright() as pw:
        nav = abrir_navegador(pw)
        p = Pagina(nav, html, w, h, mal)
        try:
            if grupo == "recorrido":
                recorrido(p, V, CF, NOTAS, pasos)
            else:
                info_teclas(p, V)
                dos_ventanas(p, V, pasos)
                varias(p, V)
                datos["pdf"] = impresion(p, V)
        except PWError as e:
            p.mal(f"{grupo}: excepción de Playwright: {str(e).splitlines()[0][:160]}")
        finally:
            p.cerrar()
            nav.close()
    datos["t"] = round(time.time() - t0, 1)
    return mal, datos


def recorrido(p: Pagina, V, CF, NOTAS, pasos):
    ids = [v["id"] for v in V]

    def pos_de(st):
        return (ids.index(st["vista"]) if st["vista"] in ids else -1, st["paso"], bool(st["completa"]))

    def nombre(pos):
        i, k, c = pos
        return f"{ids[i] if 0 <= i < len(ids) else '?'} {'completa' if c else f'paso {k}'}"

    # sin enlace, el tablero arranca en el paso 1 de la primera vista
    p.donde = " en el recorrido"
    p.pg.goto(f"{p.base}", wait_until="load")
    p.listo()
    st = p.estado()
    if pos_de(st) != (0, 1, False):
        p.mal(f"recorrido: sin enlace abre en {nombre(pos_de(st))}, se esperaba {ids[0]} paso 1")
    # N abre las notas: el recorrido de punta a punta, ida y vuelta, con las notas a la vista
    p.tecla("n")
    if not p.estado()["notas"]:
        p.mal("notas: N no abre el panel")
    malos_notas = 0

    def revisar_notas(pos):
        nonlocal malos_notas
        r = p.pg.evaluate(NOTAS_LEER)
        v = V[pos[0]]
        if r is None:
            p.mal(f"notas: el panel se cerró en {nombre(pos)}")
            return
        if r["tapa"]:
            p.mal(f"notas: el panel tapa el tablero en {nombre(pos)}")
        for x in notas_ok(r["txt"], r["actual"], r["visible"], v, pos[1], pasos[v["id"]], V, CF, NOTAS):
            malos_notas += 1
            p.mal(f"notas: {nombre(pos)}: {x}")

    pos = (0, 1, False)
    revisar_notas(pos)
    for accion, tecla in (("adelante", "ArrowRight"), ("atras", "ArrowLeft")):
        vistas_pos = 0
        while True:
            esperado = simular(V, pasos, pos, accion)
            p.tecla(tecla)
            real = pos_de(p.estado())
            if real != esperado:
                p.mal(f"recorrido: {tecla} desde {nombre(pos)} lleva a {nombre(real)}, se esperaba {nombre(esperado)}")
                break
            if esperado == pos:     # al final (o al principio) no se mueve
                break
            pos = esperado
            vistas_pos += 1
            revisar_notas(pos)
        if accion == "adelante" and pos != (len(V) - 1, pasos[ids[-1]], False):
            p.mal(f"recorrido: → no llega al último paso de {ids[-1]}")
        if accion == "atras" and pos != (0, 1, False):
            p.mal(f"recorrido: ← no vuelve al paso 1 de {ids[0]}")
    p.tecla("n")
    if p.estado()["notas"]:
        p.mal("notas: N no cierra el panel")
    # ↓, Av Pág, ↑ y Re Pág, desde una vista con varios pasos
    i = next((j for j, v in enumerate(V) if pasos[v["id"]] >= 3), 1)
    p.abrir(V[i]["hid"], 2)
    pos = (i, 2, False)
    for tecla, accion in (("ArrowDown", "adelante"), ("PageDown", "adelante"), ("ArrowUp", "atras"), ("PageUp", "atras"),
                          ("PageUp", "atras"), ("PageUp", "atras")):
        esperado = simular(V, pasos, pos, accion)
        p.tecla(tecla)
        real = pos_de(p.estado())
        if real != esperado:
            p.mal(f"recorrido: {tecla} desde {nombre(pos)} lleva a {nombre(real)}, se esperaba {nombre(esperado)}")
            break
        pos = esperado
    # Inicio y Fin: la vista completa
    p.tecla("End")
    if pos_de(p.estado()) != (len(V) - 1, pasos[ids[-1]], True):
        p.mal(f"recorrido: Fin lleva a {nombre(pos_de(p.estado()))}, se esperaba {ids[-1]} completa")
    p.tecla("Home")
    if pos_de(p.estado()) != (0, pasos[ids[0]], True):
        p.mal(f"recorrido: Inicio lleva a {nombre(pos_de(p.estado()))}, se esperaba {ids[0]} completa")
    # el riel abre la vista completa (también la misma, a medio avanzar); con el foco en el riel, las flechas siguen
    medio = len(V) // 2
    p.abrir(V[medio]["hid"], 1)
    for j in (medio, len(V) - 2):
        p.pg.locator(f".lat-item[data-id='{ids[j]}']").click()
        p.quieto()
        st = p.estado()
        if pos_de(st) != (j, pasos[ids[j]], True) or st["activa"] != ids[j]:
            p.mal(f"recorrido: el clic en el riel en {ids[j]} lleva a {nombre(pos_de(st))}, se esperaba {ids[j]} completa")
    pos = (len(V) - 2, pasos[ids[-2]], True)
    esperado = simular(V, pasos, pos, "atras")
    p.tecla("ArrowUp")
    if pos_de(p.estado()) != esperado:
        p.mal(f"recorrido: con el foco en el riel, ↑ lleva a {nombre(pos_de(p.estado()))}, se esperaba {nombre(esperado)}")
    # una tecla mantenida (el control remoto repite) no recorre
    for tecla in ("ArrowRight", "PageDown"):
        p.pg.goto(p.base + f"?r=mantenida{tecla}", wait_until="load")
        p.listo()
        for _ in range(10):
            p.pg.keyboard.down(tecla)
            p.pg.wait_for_timeout(20)
        p.pg.keyboard.up(tecla)
        p.quieto()
        if pos_de(p.estado()) != simular(V, pasos, (0, 1, False), "adelante"):
            p.mal(f"recorrido: {tecla} mantenida desde {ids[0]} paso 1 llega a {nombre(pos_de(p.estado()))}")
    # el enlace abre completa; recargar la conserva; → pasa a la siguiente en su paso 1; Atrás vuelve completa
    j = 4
    p.pg.goto(f"{p.base}#{V[j]['hid']}", wait_until="load")
    p.listo()
    if pos_de(p.estado()) != (j, pasos[ids[j]], True):
        p.mal(f"recorrido: el enlace #{V[j]['hid']} abre {nombre(pos_de(p.estado()))}")
    p.pg.reload(wait_until="load")
    p.listo()
    if pos_de(p.estado()) != (j, pasos[ids[j]], True):
        p.mal(f"recorrido: recargar en #{V[j]['hid']} deja {nombre(pos_de(p.estado()))}")
    p.tecla("ArrowRight")
    if pos_de(p.estado()) != (j + 1, 1, False) or p.estado()["hash"] != f"#{V[j + 1]['hid']}":
        p.mal(f"recorrido: → desde {ids[j]} completa lleva a {nombre(pos_de(p.estado()))} ({p.estado()['hash']})")
    p.pg.go_back()
    p.quieto(200)
    if pos_de(p.estado()) != (j, pasos[ids[j]], True):
        p.mal(f"recorrido: Atrás del navegador deja {nombre(pos_de(p.estado()))}, se esperaba {ids[j]} completa")


def info_teclas(p: Pagina, V):
    """El recuadro de información: R lo abre y lo cierra, otro clic lo cierra, un clic fuera lo cierra, con el foco en el
    botón las flechas siguen pasando de paso y al cambiar de vista se cierra."""
    p.donde = " en el botón de información"
    j = next((i for i, v in enumerate(V) if v["id"] == "V08"), 7)
    p.abrir(V[j]["hid"], 1)

    def abierto():
        return p.estado()["info"]

    p.tecla("r")
    if not abierto():
        p.mal("info: R no abre el recuadro")
    p.tecla("r")
    if abierto():
        p.mal("info: R no cierra el recuadro")
    p.pg.locator(".fin-info").click()
    p.quieto()
    if not abierto():
        p.mal("info: el clic no abre el recuadro")
    p.pg.locator(".fin-info").click()
    p.quieto()
    if abierto():
        p.mal("info: otro clic en el botón no cierra el recuadro")
    p.tecla("r")
    p.pg.locator(".fin-enc-sec").click()    # la sección del encabezado: fuera del botón y del recuadro, sin acción propia
    p.quieto()
    if abierto():
        p.mal("info: un clic fuera no cierra el recuadro")
    # con el foco en el botón (y el recuadro abierto) → avanza un paso de la misma vista y el recuadro sigue abierto
    p.pg.locator(".fin-info").click()
    p.quieto()
    antes = p.estado()
    p.tecla("ArrowRight")
    st = p.estado()
    if (st["vista"], st["paso"]) != (antes["vista"], antes["paso"] + 1):
        p.mal(f"info: con el foco en el botón, → deja {st['vista']} paso {st['paso']} (se esperaba el paso {antes['paso'] + 1})")
    # al cambiar de vista se cierra
    p.tecla("End")
    if p.estado()["info"]:
        p.mal("info: el recuadro sigue abierto al cambiar de vista")


def dos_ventanas(p: Pagina, V, pasos):
    """La ventana de notas (?notas) y otra ventana del tablero siguen la posición de la primera, y la primera las sigue."""
    p.donde = " en dos ventanas"
    ids = [v["id"] for v in V]
    i = next((j for j, v in enumerate(V) if pasos[v["id"]] >= 3), 1)
    p.abrir(V[i]["hid"], 2)

    def cab(pg):
        return norm(pg.evaluate("() => document.querySelector('.e3-notas-cab')?.innerText ?? ''"))

    def esperado_cab(pos):
        jv, k, _c = pos
        v = V[jv]
        partes = [f"{v['n']} / {len(V)}"]
        if pasos[v["id"]] > 1:
            partes.append(f"paso {k} de {pasos[v['id']]}")
        return partes, norm(v["pregunta"])

    notas = p.vigilar(p.ctx.new_page())
    notas.goto(f"{p.base}?notas#{V[0]['hid']}", wait_until="load")
    notas.wait_for_selector(".e3-notas-ventana", timeout=10000)
    notas.wait_for_timeout(300)
    pos = (i, 2, False)
    for paso_ in range(4):
        partes, preg = esperado_cab(pos)
        c = cab(notas)
        if not all(x in c for x in partes) or preg not in c:
            p.mal(f"dos ventanas: la de notas dice «{c[:90]}», se esperaba {' · '.join(partes)} de {ids[pos[0]]}")
            break
        if paso_ == 3:
            break
        p.tecla("ArrowRight")
        notas.wait_for_timeout(300)
        pos = simular(V, pasos, pos, "adelante")
    # desde la ventana de notas, Re Pág mueve el tablero
    notas.keyboard.press("PageUp")
    notas.wait_for_timeout(400)
    esperado = simular(V, pasos, pos, "atras")
    st = p.estado()
    if (st["vista"], st["paso"], bool(st["completa"])) != (ids[esperado[0]], esperado[1], esperado[2]):
        p.mal(f"dos ventanas: Re Pág en la de notas deja el tablero en {st['vista']} paso {st['paso']}, "
              f"se esperaba {ids[esperado[0]]} paso {esperado[1]}")
    notas.close()
    # otra ventana del tablero toma la posición de la abierta y se siguen
    otra = p.vigilar(p.ctx.new_page())
    otra.goto(f"{p.base}#{V[0]['hid']}", wait_until="load")
    p.listo(otra)
    otra.wait_for_timeout(300)
    a, b = p.estado(), p.estado(otra)
    if (a["vista"], a["paso"], a["completa"]) != (b["vista"], b["paso"], b["completa"]):
        p.mal(f"dos ventanas: la nueva queda en {b['vista']} paso {b['paso']}, la abierta está en {a['vista']} paso {a['paso']}")
    p.tecla("ArrowRight")
    otra.wait_for_timeout(400)
    a, b = p.estado(), p.estado(otra)
    if (a["vista"], a["paso"], a["completa"]) != (b["vista"], b["paso"], b["completa"]):
        p.mal(f"dos ventanas: la otra no sigue (está en {b['vista']} paso {b['paso']}, la primera en {a['vista']} paso {a['paso']})")
    otra.close()


def varias(p: Pagina, V):
    """Pantalla en negro, P y F5, en una vista a medio avanzar."""
    p.donde = " en las teclas"
    i = next((j for j, v in enumerate(V) if v["id"] == "V10"), 9)
    p.abrir(V[i]["hid"], 2)
    pos = lambda st: (st["vista"], st["paso"], st["completa"])   # noqa: E731
    base = pos(p.estado())
    riel_ve = "() => { const l = document.querySelector('.lat'); return !!l && l.getClientRects().length > 0 }"
    if not p.pg.evaluate(riel_ve):
        p.mal("teclas: el riel no se ve por defecto")
    p.tecla("p")
    if p.pg.evaluate(riel_ve) or pos(p.estado()) != base:
        p.mal("teclas: P no oculta el riel o cambia la posición")
    fit = p.pg.evaluate("() => window.__fit().problemas.map((x) => `${x.tipo} ${x.detalle ?? ''}`)")
    if fit:
        p.mal(f"teclas: con el riel oculto el tablero desborda: {fit[:3]}")
    p.tecla("p")
    if not p.pg.evaluate(riel_ve):
        p.mal("teclas: P no vuelve a mostrar el riel")
    for k in (".", "b"):
        p.tecla(k)
        if not p.estado()["negro"]:
            p.mal(f"teclas: «{k}» no pone la pantalla en negro")
        p.tecla("PageDown")
        st = p.estado()
        if st["negro"] or pos(st) != base:
            p.mal(f"teclas: después de «{k}», una tecla no vuelve o cambia la posición ({st['vista']} paso {st['paso']})")
    p.pg.evaluate("() => { window.__sin_recarga = 1 }")
    p.tecla("F5")
    if p.pg.evaluate("() => window.__sin_recarga") != 1 or pos(p.estado()) != base:
        p.mal("teclas: F5 recarga la página o cambia la posición")


def impresion(p: Pagina, V):
    """16 hojas completas, en orden, sin encabezado ni recuadro de información; el PDF de Chrome con 16 páginas."""
    p.donde = " en la impresión"
    p.abrir(V[0]["hid"], 1)
    p.tecla("r")                    # el recuadro abierto no se imprime
    p.pg.emulate_media(media="print")
    p.pg.evaluate("() => window.dispatchEvent(new Event('beforeprint'))")
    p.pg.wait_for_timeout(400)
    r = p.pg.evaluate("""() => {
      const hojas = [...document.querySelectorAll('.impresion-flujo .hoja')]
      const ve = (s) => [...document.querySelectorAll(s)].some((el) => el.getClientRects().length > 0)
      return {
        preguntas: hojas.map((h) => h.querySelector(':scope > .e2-preg')?.textContent ?? ''),
        incompletas: hojas.map((h, i) => [i, [...h.querySelectorAll('.fin-paso')].filter((x) => x.dataset.revela !== 'on').length])
          .filter(([, n]) => n),
        esqueletos: hojas.filter((h) => h.querySelector('.e3-esqueleto')).length,
        recuadro: ve('.fin-info-recuadro'), boton: ve('.fin-info'), enc: ve('.e2-enc'), riel: ve('.lat'),
      }
    }""")
    if [norm(x) for x in r["preguntas"]] != [norm(v["pregunta"]) for v in V]:
        p.mal(f"impresión: las hojas traen {len(r['preguntas'])} títulos {r['preguntas'][:3]}…, se esperaba una por vista en orden")
    for i, n in r["incompletas"]:
        p.mal(f"impresión: la hoja de {V[i]['id'] if i < len(V) else i} no está completa ({n} pasos sin encender)")
    if r["esqueletos"]:
        p.mal(f"impresión: {r['esqueletos']} hojas con esqueleto")
    for clave, que in (("recuadro", "el recuadro de información"), ("boton", "el botón de información"),
                       ("enc", "el encabezado"), ("riel", "el riel")):
        if r[clave]:
            p.mal(f"impresión: se imprime {que}")
    paginas = len(re.findall(rb"/Type\s*/Page(?![s\w])", p.pg.pdf(prefer_css_page_size=True)))
    if paginas != len(V):
        p.mal(f"impresión: el PDF tiene {paginas} páginas, se esperaba {len(V)} (una por vista)")
    p.pg.evaluate("() => window.dispatchEvent(new Event('afterprint'))")
    p.pg.emulate_media(media="screen")
    p.pg.wait_for_timeout(200)
    if p.pg.locator(".impresion-flujo").count():
        p.mal("impresión: después de afterprint el tablero no vuelve a la vista")
    return paginas


# ---------------------------------------------------------------- principal

DONDE = re.compile(r"^(V\d{2}(?: paso \d+| info)?): (.*)$", re.S)


def agrupar(problemas):
    """Los problemas iguales en varias resoluciones y posiciones, en una línea: «[1920x1080 1280x720] texto (en V01,
    V02 paso 1, …)». La posición (vista y paso) sale del comienzo del texto."""
    orden, res_de, donde_de = [], {}, {}
    for res, txt in problemas:
        m = DONDE.match(txt)
        donde, cuerpo = (m.group(1), m.group(2)) if m else ("", txt)
        if cuerpo not in res_de:
            res_de[cuerpo], donde_de[cuerpo] = [], []
            orden.append(cuerpo)
        if res and res not in res_de[cuerpo]:
            res_de[cuerpo].append(res)
        if donde and donde not in donde_de[cuerpo]:
            donde_de[cuerpo].append(donde)
    salida = []
    for c in orden:
        ds = donde_de[c]
        pre = f"[{' '.join(res_de[c])}] " if res_de[c] else ""
        if len(ds) == 1:
            salida.append(f"{pre}{ds[0]}: {c}")
        elif ds:
            lista = ", ".join(ds[:6]) + (f" y {len(ds) - 6} posiciones más" if len(ds) > 6 else "")
            salida.append(f"{pre}{c} (en {lista})")
        else:
            salida.append(pre + c)
    return salida


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("html", nargs="?", default=str(HTML_DEF), help="index.html armado (por defecto dist-final/index.html)")
    ap.add_argument("--capturas", default=str(APP / "final" / "capturas-verif"))
    ap.add_argument("--sin-capturas", action="store_true")
    ap.add_argument("--sin-muestra", action="store_true", help="falla si CF sigue siendo de muestra (antes de presentar)")
    ap.add_argument("--sin-esqueletos", action="store_true", help="(se acepta por compatibilidad: un esqueleto siempre falla)")
    ap.add_argument("--res", action="append", help="WxH, repetible (por defecto las cinco); para probar")
    ap.add_argument("--vistas", help="V05,V16: solo esas en las comprobaciones por vista; para probar")
    ap.add_argument("--hilos", type=int, default=0, help="Chromium en paralelo (por defecto, uno por resolución más dos)")
    a = ap.parse_args()
    t0 = time.time()
    html = Path(a.html).expanduser().resolve()
    if not html.exists():
        print(f"Falta {html}: corre «npm run build:final» (o arma en otra carpeta y pasa su index.html).")
        print("RESULTADO: FALLA")
        sys.exit(1)
    res = []
    for r in a.res or [f"{w}x{h}" for w, h in RES]:
        m = re.fullmatch(r"(\d+)[x×](\d+)", r.strip())
        if not m:
            ap.error(f"--res «{r}» no es WxH")
        res.append((int(m[1]), int(m[2])))

    CF = leer_modulo(CF_JS, "CF")
    DF = leer_modulo(DF_JS, "DF")
    NOTAS = leer_modulo(NOTAS_JS, "NOTAS")
    INFORME = leer_modulo(INFORME_JS, "INFORME")
    metas = leer_metas()
    V, bloques, total = historia(CF)
    cadenas_cf = cadenas(CF)
    nums = numeros_df(DF)
    problemas: list[tuple[str, str]] = []
    mal, info, pasos = estatico(V, bloques, CF, INFORME, NOTAS, metas)
    problemas += [("", x) for x in mal]
    if CF.get("MUESTRA"):
        if a.sin_muestra:
            problemas.append(("", "CF es de muestra (CF.MUESTRA)"))
        else:
            info.append("aviso: CF es de MUESTRA (con --sin-muestra es un problema)")
    capturas = None
    if not a.sin_capturas:
        capturas = Path(a.capturas).expanduser().resolve()
        capturas.mkdir(parents=True, exist_ok=True)
    V_sel = V
    if a.vistas:
        sel = {x.strip().upper() for x in a.vistas.split(",") if x.strip()}
        V_sel = [v for v in V if v["id"] in sel]
    # las vistas cuyo meta.pasos no se pudo leer toman el del tablero (data-pasos) en el recorrido: se cargan después
    pasos_todas = dict(pasos)

    tareas = []
    hilos = a.hilos or (len(res) + 2)
    with ThreadPoolExecutor(max_workers=max(1, hilos)) as ex:
        for w, h in res:
            tareas.append(("res", (w, h), ex.submit(por_resolucion, html, w, h, V_sel, CF, INFORME, cadenas_cf, nums,
                                                     pasos, capturas)))
        if len(pasos_todas) == len(V):
            for grupo in ("recorrido", "resto"):
                tareas.append((grupo, RES_INTERACCION, ex.submit(interaccion, html, V, CF, NOTAS, INFORME, pasos_todas,
                                                                 grupo)))
        else:
            problemas.append(("", "sin el recorrido, las notas ni la impresión: faltan los pasos de alguna vista"))
        estados, pdf, qr, ejes, tiempos = 0, None, None, {}, {}
        for tipo, (w, h), fut in tareas:
            try:
                m, d = fut.result()
            except Exception as e:   # noqa: BLE001
                problemas.append((f"{w}x{h}", f"la corrida se cortó: {type(e).__name__}: {str(e).splitlines()[0][:160]}"))
                continue
            problemas += m
            if tipo == "res":
                estados += d["estados"]
                qr = d["qr"] if d.get("qr") else qr
                for vid, ns in d["eje"].items():
                    ejes.setdefault(vid, set()).update(ns)
            elif d.get("pdf") is not None:
                pdf = d["pdf"]
            tiempos[f"{tipo}" + (f" {w}x{h}" if tipo == "res" else "")] = d.get("t")

    # el QR de la V16 (a 1920×1080)
    if any(v["id"] == "V16" for v in V_sel) and (1920, 1080) in res:
        if qr is None:
            problemas.append(("1920x1080", "V16: no se leyó el QR"))
        else:
            texto, como = qr
            if texto is None and como == "sin decodificador":
                info.append("aviso: sin decodificador de QR (opencv, pyzbar o zbarimg): el QR de la V16 no se comprobó")
            elif texto is None:
                problemas.append(("1920x1080", f"V16: el QR {como}"))
            elif texto != INFORME.get("url"):
                problemas.append(("1920x1080", f"V16: el QR lleva a «{texto}», se esperaba «{INFORME.get('url')}»"))
            else:
                info.append(f"QR de la V16 decodificado con {como}: {texto}")

    objetivo = (CF.get("TIEMPOS") or {}).get("objetivo_s") or total
    print(f"/final/: {len(V)} vistas en {len(bloques)} bloques, {mmss(total)} de {mmss(objetivo)}; "
          f"{sum(pasos.values())} pasos; {len(res)} resoluciones, {estados} posiciones revisadas; PDF de {pdf} páginas; "
          f"{time.time() - t0:.0f} s")
    for b in bloques:
        print(f"   {b['nombre']} · {b.get('integrante', '')} · {mmss(b['segundos'])} · "
              + ", ".join(f"{v['id']} ({pasos.get(v['id'], '?')})" for v in V if v["bloque"] == b["id"]))
    for x in info:
        print("   " + x)
    print("   segundos por hilo: " + ", ".join(f"{k} {v}" for k, v in tiempos.items()))
    if ejes:
        print("   marcas de eje (escala, no dato): " + "; ".join(f"{k} {' '.join(sorted(v, key=len))}"
                                                            for k, v in sorted(ejes.items()) if v))
    if a.vistas or a.res:
        print("aviso: corrida parcial (--vistas o --res): no vale como compuerta")
    if problemas:
        lineas = agrupar(problemas)
        print(f"{len(lineas)} problemas:")
        for x in lineas:
            print("  " + x)
        print("RESULTADO: FALLA")
        sys.exit(1)
    if capturas is not None:
        print(f"capturas en {capturas}")
    print("RESULTADO: OK")


if __name__ == "__main__":
    main()

"""La cadena de chequeos de /final/, la presentación final (17/11; 19/11, contrato de las fases 8 a 11 de la auditoría de
dataviz). Es la compuerta del tablero.

    python3 -I /Users/sebastiancaules/Desktop/ITBA/26-2C/FPDD/app/.wt-final/scripts/check_final_f6.py [--armado DIR] [--textos RUTA]

Corre, con rutas absolutas y en este orden:

1. pipeline/build_final.py dos veces: las dos dan el mismo final/src/datos_final.js, y es el versionado (git diff).
2. El armado de /final/: «npm run build:final» (dist-final/index.html); con --armado DIR, «npx vite build --config
   vite.final.config.js --outDir DIR/final», sin tocar dist-final/ (para probar mientras otro arma ahí).
3. scripts/verificar_final.py sobre ese index.html, con --sin-muestra: 16 vistas en 7 bloques, cada una completa y en
   cada paso a cinco resoluciones (texto pisado, cortado o fuera, letra de 20 u, relleno del lienzo, sin red ni errores),
   CF y DF en pantalla (título, sección, «n / 16», riel, banda, decisión, conclusión, cada cifra un valor de DF), los
   pasos (nada de un paso posterior a la vista, recorrido de la fase 9), el botón de información con sus enlaces al
   informe, el QR y el contacto de la V16, las notas por paso en las dos ventanas, la impresión y las teclas. Deja las
   capturas de cada vista completa a 1280×720 y 1920×1080 en final/capturas-verif/.
4. scripts/paridad_final.py: src/**, e2/** y e3/** iguales a main, y las hojas de /final/ que nombran el armazón, bajo
   .e3-vp y sin !important fuera de @media print.
5. El HTML de un solo archivo (scripts/vite.final-sobre.config.js) en dist-final-sobre/index.html (con --armado, en
   DIR/sobre): existe, no trae src ni href a http, y abierto con Playwright sin red (offline, file://) monta cada vista de
   CF con su título, sin pedidos fuera de file: y data: y sin errores de consola.
6. /e3/ intacto: «npm run build:e3» (con --armado, en DIR/e3) y el md5 del index.html es el del /e3/ presentado
   (1903979c…).
7. Git: la rama es final-tablero, main sigue en el commit en que se cortó la fase 6, src/**, e2/** y e3/** iguales a
   main, el árbol limpio y los commits de main..HEAD de una línea y sin trailers (ni Co-Authored-By).
8. Lista negra del canon (cadenas y cadenas_vX_Y, con las descripciones de uso) y regla del 23/10 (pendiente 238) sobre
   todo el texto de /final/: las cadenas de CF, las notas de final/src/notas_final.js (todos los pasos) y el texto
   renderizado de cada vista completa a 1280×720 (pantalla, SVG, title y notas abiertas).
9. Las notas salen del guion (canon v1.5, tableros.notas_v1_5: una entrada por vista y una lista por paso): si el vault
   está, notas_final.js es lo que escribe exportar_notas.py desde guion.py (--comprobar); sin el vault, el paso se salta
   con aviso.

Con --textos RUTA escribe además el texto renderizado de cada vista completa (encabezado y cuerpo, sin el riel; rótulos
del gráfico; title) y debajo su nota, separado por líneas «=== V01 · <bloque> ===» (lo lee
.workforce/auditoria-dataviz/check_dv.py).

Imprime cada paso y cierra con «RESULTADO: OK» o «RESULTADO: FALLA».
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path

APP = Path("/Users/sebastiancaules/Desktop/ITBA/26-2C/FPDD/app/.wt-final")
VAULT = Path("/Users/sebastiancaules/Desktop/ITBA/26-2C/FPDD")
CANON = VAULT / ".workforce" / "presentacion-final" / "fase-2" / "canon.json"
if not CANON.exists():   # la carpeta de la corrida se puede limpiar: queda la copia que deja el generador de la A del E4
    CANON = VAULT / "entregas" / "entregable-4" / "_build" / "A" / "registro" / "canon.json"
DF_JS = APP / "final" / "src" / "datos_final.js"
CF_JS = APP / "final" / "src" / "contenido_final.js"
NOTAS_JS = APP / "final" / "src" / "notas_final.js"
EXPORTAR_NOTAS = (VAULT / "entregas" / "presentacion-final" / "_build" / "F" / "dossiers" / "guion-presentacion-final"
                  / "exportar_notas.py")
MD5_E3 = "1903979ca800a3907a2ae365d30eb48e"
MAIN = "c0db4f742066d195bc094d22580ca8a2e5ac4874"   # main al empezar la fase 6: no se toca
RAMA = "final-tablero"
PY = sys.executable

fallas: list[str] = []


def correr(nombre: str, cmd: list[str], cwd: Path = APP, timeout: int = 900) -> subprocess.CompletedProcess | None:
    try:
        r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        fallas.append(f"{nombre}: tardó más de {timeout} s")
        print(f"[FALLA] {nombre}: timeout")
        return None
    ultima = (r.stdout.strip().splitlines() or [""])[-1]
    if r.returncode != 0:
        fallas.append(f"{nombre}: código {r.returncode}")
        print(f"[FALLA] {nombre} (código {r.returncode})")
        print("\n".join((r.stdout + r.stderr).strip().splitlines()[-40:]))
    else:
        print(f"[OK]    {nombre}: {ultima[:110]}")
    return r


def paso(nombre: str, ok: bool, detalle: str = "") -> None:
    print(f"{'[OK]   ' if ok else '[FALLA]'} {nombre}{': ' + detalle if detalle else ''}")
    if not ok:
        fallas.append(nombre + (f": {detalle}" if detalle else ""))


def git(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", "-C", str(APP), *args], capture_output=True, text=True)


def leer_modulo(ruta: Path, var: str):
    codigo = "const m = await import(process.argv[1]); process.stdout.write(JSON.stringify(m[process.argv[2]]))"
    r = subprocess.run(["node", "--input-type=module", "-e", codigo, ruta.as_uri(), var], capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"No pude leer {var} con node: {r.stderr.strip()[:300]}")
    return json.loads(r.stdout)


def abrir_navegador(pw):
    """El lanzador de scripts/verificar_final.py (Chrome for Testing de la caché de Playwright primero: cierra rápido)."""
    spec = importlib.util.spec_from_file_location("verificar_final", APP / "scripts" / "verificar_final.py")
    vf = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(vf)
    return vf.abrir_navegador(pw)


def cadenas(x) -> list[str]:
    if isinstance(x, str):
        return [x]
    if isinstance(x, dict):
        return [c for v in x.values() for c in cadenas(v)]
    if isinstance(x, list):
        return [c for v in x for c in cadenas(v)]
    return []


def norm(t: str) -> str:
    return re.sub(r"\s+", " ", (t or "").replace(" ", " ")).strip()


TEXTO_VISTA = r"""() => {
  const vp = document.querySelector('.e3-vp')
  const svg = [...document.querySelectorAll('.cuerpo svg text, .cuerpo svg title')].map((t) => t.textContent)
  const titulos = [...document.querySelectorAll('[title]')].map((e) => e.getAttribute('title'))
  const notas = document.querySelector('.e3-notas')?.innerText ?? ''
  const vista = [document.querySelector('.e2-enc')?.innerText ?? '', document.querySelector('.cuerpo')?.innerText ?? '']
  return { pantalla: vp.innerText, vista: vista.join('\n'), svg, titulos, notas }
}"""


def textos_por_vista(html: Path, V: list[dict]) -> list[dict]:
    """El texto renderizado de cada vista completa a 1280×720, con las notas abiertas: {id, pantalla, svg, titulos, notas}."""
    from playwright.sync_api import sync_playwright
    url = html.as_uri()
    partes = []
    with sync_playwright() as pw:
        nav = abrir_navegador(pw)
        pg = nav.new_page(viewport={"width": 1280, "height": 720}, reduced_motion="reduce")
        pg.goto(f"{url}#{V[0]['id'].lower()}")
        pg.wait_for_selector(".cuerpo .pant")
        pg.keyboard.press("n")
        for v in V:
            pg.goto(f"{url}#{v['id'].lower()}")
            pg.wait_for_function("(id) => document.querySelector('#root .app')?.dataset.vista === id && "
                                 "document.querySelector('#root .app')?.hasAttribute('data-completa')", arg=v["id"])
            pg.wait_for_function("() => !document.querySelector(':root:active-view-transition') && "
                                 "document.getAnimations().every((a) => a.playState !== 'running')", timeout=5000)
            partes.append({"id": v["id"], **pg.evaluate(TEXTO_VISTA)})
        nav.close()
    return partes


def unir(t: dict) -> str:
    return "\n".join([t["pantalla"], *t["svg"], *t["titulos"], t["notas"]])


def escribir_textos(ruta: Path, CF: dict, textos: list[dict]) -> None:
    bloque = {v["id"]: b["titulo"] for b in CF["BLOQUES"] for v in b["vistas"]}
    salida = []
    for t in textos:
        salida.append(f"=== {t['id']} · {bloque.get(t['id'], '')} ===")
        salida.append(t["vista"].strip())
        if t["svg"]:
            salida.append("-- rótulos del gráfico --")
            salida.extend(x.strip() for x in t["svg"] if x.strip())
        if t["titulos"]:
            salida.append("-- title --")
            salida.extend(x.strip() for x in t["titulos"] if x and x.strip())
        salida.append("-- nota --")
        salida.append(t["notas"].strip())
        salida.append("")
    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_text("\n".join(salida), encoding="utf-8")


def sobre_sin_red(sobre: Path, V: list[dict]) -> tuple[list[str], list[str], list[str]]:
    """Abre el HTML de un solo archivo sin red (offline, file://) y recorre las vistas: devuelve las vistas sin montar o
    con otro título, los pedidos fuera de file: y data: (src, url(), @import o fetch) y los errores de consola."""
    from playwright.sync_api import sync_playwright
    malas, pedidos, errores = [], [], []
    with sync_playwright() as pw:
        nav = abrir_navegador(pw)
        ctx = nav.new_context(viewport={"width": 1280, "height": 720}, device_scale_factor=1, offline=True,
                              reduced_motion="reduce")
        pg = ctx.new_page()
        pg.on("request", lambda r: pedidos.append(r.url[:120]) if not r.url.startswith(("data:", "file:")) else None)
        pg.on("console", lambda m: errores.append(m.text[:160]) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errores.append(str(e)[:160]))
        for i, v in enumerate(V):
            try:
                pg.goto(f"{sobre.as_uri()}?r={i}#{v['id'].lower()}")
                pg.wait_for_selector(".cuerpo .pant", timeout=10000)
                preg = pg.evaluate("() => document.querySelector('.e2-preg')?.textContent ?? ''")
                if norm(preg) != norm(v["pregunta"]):
                    malas.append(f"{v['id']} («{norm(preg)[:40]}»)")
            except Exception as e:   # noqa: BLE001
                malas.append(f"{v['id']} ({str(e).splitlines()[0][:60]})")
        nav.close()
    return malas, pedidos, errores


def lista_negra(texto: str, donde: str) -> None:
    lista = json.loads(CANON.read_text(encoding="utf-8"))["lista_negra"]
    plano = re.sub(r"\s+", " ", texto.replace(" ", " "))
    descripciones = {   # cadenas del canon que describen un uso, no un texto literal
        "12,41 o 9,92 como umbral que decide": r"\b(12,41|9,92)\b",
        "diciembre de 2026 como mes de la primera lista": r"diciembre de 2026",
        "equipo consultor como operador del piloto": r"equipo consultor",
        "semana 13 como elección del operador": r"semana 13\b",
        "pipeline en las semanas 1 a 3": r"pipeline",
    }
    claves = ["cadenas"] + sorted(k for k in lista if re.fullmatch(r"cadenas_v\d+_\d+", k))
    literales = [c for k in claves for c in lista.get(k, []) if c not in descripciones]
    hits = [c for c in literales if c.lower() in plano.lower()]
    hits += [f"{d} («{re.search(rx, plano, re.I).group(0)}»)" for d, rx in descripciones.items()
             if re.search(rx, plano, re.I)]
    paso(f"lista negra del canon en {donde}", not hits,
         "; ".join(hits) if hits else f"0 de {len(literales)} cadenas y {len(descripciones)} descripciones")
    rx_23_10 = r"\b(pendientes?|abiert[oa]s?|a definir|sin respuesta|espera respuesta)\b"
    h = sorted(set(m.group(0).lower() for m in re.finditer(rx_23_10, plano, re.I)))
    paso(f"regla del 23/10 en {donde}", not h, ", ".join(h) if h else "0 apariciones")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--armado", help="arma /final/, su sobre y /e3/ en subcarpetas de esta carpeta (no toca dist-*)")
    ap.add_argument("--textos", help="escribe el texto renderizado de cada vista y su nota en esta ruta")
    args = ap.parse_args()
    armado = Path(args.armado).expanduser().resolve() if args.armado else None
    html = (armado / "final" / "index.html") if armado else APP / "dist-final" / "index.html"
    sobre = (armado / "sobre" / "index.html") if armado else APP / "dist-final-sobre" / "index.html"
    e3 = (armado / "e3" / "index.html") if armado else APP / "dist-e3" / "index.html"

    def vite(nombre, config, destino: Path):
        correr(nombre, ["npx", "vite", "build", "--config", config, "--outDir", str(destino.parent), "--emptyOutDir"])

    # 1. payload determinista
    md5s = []
    for i in (1, 2):
        r = correr(f"build_final.py ({i}.ª corrida)", [PY, "-I", str(APP / "pipeline" / "build_final.py")])
        md5s.append(hashlib.md5(DF_JS.read_bytes()).hexdigest() if r is not None and r.returncode == 0 else None)
    paso("datos_final.js igual en las dos corridas", None not in md5s and md5s[0] == md5s[1], str(md5s[-1]))
    dif = git("diff", "--stat", "--", "final/src/datos_final.js").stdout.strip()
    paso("datos_final.js igual al versionado", not dif, dif or "sin diferencias")

    # 2 y 3. /final/ armado y verificado
    if armado:
        vite(f"armado de /final/ en {html.parent}", "vite.final.config.js", html)
    else:
        correr("npm run build:final", ["npm", "--prefix", str(APP), "run", "build:final"])
    correr("verificar_final.py --sin-muestra",
           [PY, "-I", str(APP / "scripts" / "verificar_final.py"), str(html), "--sin-muestra"], timeout=1800)

    # 4. lo que /final/ no toca
    correr("paridad_final.py", [PY, "-I", str(APP / "scripts" / "paridad_final.py")], timeout=300)

    # 5. HTML de un solo archivo
    if armado:
        vite(f"HTML de un solo archivo en {sobre.parent}", "scripts/vite.final-sobre.config.js", sobre)
    else:
        correr("HTML de un solo archivo", ["npx", "vite", "build", "--config", "scripts/vite.final-sobre.config.js"])
    CF = leer_modulo(CF_JS, "CF")
    V = [v for b in CF["BLOQUES"] for v in b["vistas"]]
    if sobre.exists():
        texto = sobre.read_text(encoding="utf-8")
        externos = re.findall(r"""(?:src|href)\s*=\s*["']https?://[^"']+""", texto)
        try:
            malas, pedidos, errores = sobre_sin_red(sobre, V)
        except Exception as e:   # noqa: BLE001
            malas, pedidos, errores = [f"no abre: {str(e).splitlines()[0][:100]}"], [], []
        ok = not externos and not malas and not pedidos and not errores
        paso(f"{sobre.parent.name}/index.html, abierto sin red", ok,
             f"{sobre.stat().st_size // 1024} KB, {len(V)} vistas con su título, 0 pedidos, 0 errores de consola" if ok
             else f"externos {externos[:3]}, vistas {malas[:4]}, pedidos {pedidos[:3]}, errores {errores[:3]}")
    else:
        paso(f"{sobre}", False, "no existe")

    # 6. /e3/ intacto
    if armado:
        vite(f"armado de /e3/ en {e3.parent}", "vite.e3.config.js", e3)
    else:
        correr("npm run build:e3", ["npm", "--prefix", str(APP), "run", "build:e3"])
    md5 = hashlib.md5(e3.read_bytes()).hexdigest() if e3.exists() else "sin archivo"
    paso(f"md5 de {e3.parent.name}/index.html", md5 == MD5_E3, md5)

    # 7. git
    rama = git("rev-parse", "--abbrev-ref", "HEAD").stdout.strip()
    paso("rama", rama == RAMA, rama)
    main_sha = git("rev-parse", "main").stdout.strip()
    paso("main sin tocar", main_sha == MAIN, main_sha[:12])
    paso("src/**, e2/** y e3/** iguales a main",
         subprocess.run(["git", "-C", str(APP), "diff", "--quiet", "main", "--", "src", "e2", "e3"]).returncode == 0)
    sucio = git("status", "--porcelain").stdout.strip()
    paso("árbol limpio", not sucio, sucio.replace("\n", "; ")[:200] if sucio else "sin cambios")
    log = git("log", "--format=%H%x1f%B%x1e", f"{MAIN}..HEAD").stdout
    malos = []
    for bloque in filter(str.strip, log.split("\x1e")):
        sha, _, cuerpo = bloque.strip().partition("\x1f")
        lineas = [x for x in cuerpo.strip().splitlines() if x.strip()]
        if len(lineas) != 1 or re.search(r"co-authored-by|signed-off-by", cuerpo, re.I):
            malos.append(sha[:8])
    n = len([b for b in log.split("\x1e") if b.strip()])
    paso("commits de una línea y sin trailers", not malos, f"{n} commits" if not malos else ", ".join(malos))

    # 8. lista negra y regla del 23/10 sobre todo el texto de /final/
    NOTAS = leer_modulo(NOTAS_JS, "NOTAS")
    sin_notas = [v["id"] for v in V
                 if not isinstance(NOTAS.get(v["id"]), list) or not NOTAS[v["id"]] or not all(cadenas(p) for p in NOTAS[v["id"]])]
    paso("notas_final.js con párrafos en cada paso de cada vista", not sin_notas,
         ", ".join(sin_notas) if sin_notas else f"{len(V)} vistas, {sum(len(NOTAS[v['id']]) for v in V)} pasos")
    lista_negra("\n".join(cadenas(CF)), "CF (textos)")
    lista_negra("\n".join(cadenas(NOTAS)), "notas_final.js")
    if html.exists():
        try:
            textos = textos_por_vista(html, V)
            lista_negra("\n".join(unir(t) for t in textos), "el texto renderizado de las vistas")
            if args.textos:
                escribir_textos(Path(args.textos), CF, textos)
                print(f"[OK]    textos de las vistas en {args.textos}")
        except Exception as e:   # noqa: BLE001
            paso("texto renderizado de las vistas", False, str(e).splitlines()[0][:160])
    else:
        paso("texto renderizado de las vistas", False, f"no existe {html}")

    # 9. notas del guion
    if EXPORTAR_NOTAS.exists():
        correr("notas_final.js igual a guion.py (exportar_notas.py --comprobar)",
               [PY, str(EXPORTAR_NOTAS), "--comprobar"])
    else:
        print(f"[AVISO] sin el vault ({EXPORTAR_NOTAS.name} no está): salto la paridad de notas_final.js con guion.py")

    print()
    if fallas:
        print(f"{len(fallas)} fallas: " + "; ".join(fallas))
        print("RESULTADO: FALLA")
        return 1
    print("RESULTADO: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())

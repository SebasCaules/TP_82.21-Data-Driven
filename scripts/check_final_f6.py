"""Check de la unidad WEB de la fase 6 de la corrida «presentación final»: el contenido real de /final/ (17/11).

    python3 /Users/sebastiancaules/Desktop/ITBA/26-2C/FPDD/app/.wt-final/scripts/check_final_f6.py

Corre, con rutas absolutas y en este orden:

1. pipeline/build_final.py dos veces: las dos dan el mismo final/src/datos_final.js, y es el versionado (git diff).
2. npm run build:final.
3. scripts/verificar_final.py --sin-muestra --sin-esqueletos (capturas a 1280×720 y 1920×1080 en final/capturas-verif/).
4. npm run build:e2 y scripts/paridad_final.py --vista v07 (la vista con la estructura de la vista 5 del E3).
5. El HTML de un solo archivo (scripts/vite.final-sobre.config.js) en dist-final-sobre/index.html: existe, no trae src
   ni href a http, y abierto con Playwright sin red (offline, file://) monta cada vista de CF con su pregunta, sin pedidos
   fuera de file: y data: (url(), @import o fetch incluidos) y sin errores de consola.
6. /e3/ intacto: npm run build:e3 y el md5 de dist-e3/index.html es el del /e3/ presentado (1903979c…).
7. Git: la rama es final-tablero, main sigue en el commit en que se cortó esta fase, src/**, e2/** y e3/** iguales a
   main, el árbol limpio y los commits de main..HEAD de una línea y sin trailers (ni Co-Authored-By).
8. Lista negra del canon y regla del 23/10 (pendiente 238) sobre todo el texto de /final/: las cadenas de CF (preguntas,
   rótulos, conclusiones, decisiones y notas) y el texto renderizado de cada vista a 1280×720 (pantalla, SVG, title y
   notas abiertas).

Imprime cada paso y cierra con «RESULTADO: OK» o «RESULTADO: FALLA».
"""
from __future__ import annotations

import hashlib
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
SOBRE = APP / "dist-final-sobre" / "index.html"
MD5_E3 = "1903979ca800a3907a2ae365d30eb48e"
MAIN = "c0db4f742066d195bc094d22580ca8a2e5ac4874"   # main al empezar la fase 6: no se toca
RAMA = "final-tablero"
VISTA_PARIDAD = "v07"
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
        print("\n".join((r.stdout + r.stderr).strip().splitlines()[-25:]))
    else:
        print(f"[OK]    {nombre}: {ultima[:110]}")
    return r


def paso(nombre: str, ok: bool, detalle: str = "") -> None:
    print(f"{'[OK]   ' if ok else '[FALLA]'} {nombre}{': ' + detalle if detalle else ''}")
    if not ok:
        fallas.append(nombre + (f": {detalle}" if detalle else ""))


def git(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", "-C", str(APP), *args], capture_output=True, text=True)


def leer_cf() -> dict:
    codigo = "const m = await import(process.argv[1]); process.stdout.write(JSON.stringify(m.CF))"
    r = subprocess.run(["node", "--input-type=module", "-e", codigo, CF_JS.as_uri()], capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"No pude leer CF con node: {r.stderr.strip()[:300]}")
    return json.loads(r.stdout)


def cadenas(x) -> list[str]:
    if isinstance(x, str):
        return [x]
    if isinstance(x, dict):
        return [c for v in x.values() for c in cadenas(v)]
    if isinstance(x, list):
        return [c for v in x for c in cadenas(v)]
    return []


TEXTO_VISTA = r"""() => {
  const vp = document.querySelector('.e3-vp')
  const svg = [...document.querySelectorAll('.cuerpo svg text, .cuerpo svg title')].map((t) => t.textContent)
  const titulos = [...document.querySelectorAll('[title]')].map((e) => e.getAttribute('title'))
  const notas = document.querySelector('.e3-notas')?.innerText ?? ''
  return [vp.innerText, ...svg, ...titulos, notas].join('\n')
}"""


def texto_renderizado(V: list[dict]) -> str:
    from playwright.sync_api import sync_playwright
    url = (APP / "dist-final" / "index.html").as_uri()
    partes = []
    with sync_playwright() as pw:
        try:
            nav = pw.chromium.launch()
        except Exception:
            nav = pw.chromium.launch(channel="chrome")
        pg = nav.new_page(viewport={"width": 1280, "height": 720})
        pg.goto(f"{url}#{V[0]['id'].lower()}")
        pg.wait_for_selector(".cuerpo .pant")
        pg.keyboard.press("n")
        for v in V:
            pg.goto(f"{url}#{v['id'].lower()}")
            pg.wait_for_selector(".cuerpo .pant")
            pg.wait_for_timeout(150)
            partes.append(pg.evaluate(TEXTO_VISTA))
        nav.close()
    return "\n".join(partes)


def sobre_sin_red(V: list[dict]) -> tuple[list[str], list[str], list[str]]:
    """Abre el HTML de un solo archivo sin red (offline, file://) y recorre las vistas: devuelve las vistas sin montar o
    con otra pregunta, los pedidos fuera de file: y data: (src, url(), @import o fetch) y los errores de consola."""
    from playwright.sync_api import sync_playwright

    def norm(t: str) -> str:
        return re.sub(r"\s+", " ", t.replace(" ", " ")).strip()

    malas, pedidos, errores = [], [], []
    with sync_playwright() as pw:
        try:
            nav = pw.chromium.launch()
        except Exception:
            nav = pw.chromium.launch(channel="chrome")
        ctx = nav.new_context(viewport={"width": 1280, "height": 720}, device_scale_factor=1, offline=True)
        pg = ctx.new_page()
        pg.on("request", lambda r: pedidos.append(r.url[:120]) if not r.url.startswith(("data:", "file:")) else None)
        pg.on("console", lambda m: errores.append(m.text[:160]) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errores.append(str(e)[:160]))
        for v in V:
            try:
                pg.goto(f"{SOBRE.as_uri()}#{v['id'].lower()}")
                pg.wait_for_selector(".cuerpo .pant", timeout=10000)
                pg.wait_for_timeout(150)
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
    literales = [c for c in lista["cadenas"] + lista.get("cadenas_v1_2", []) if c not in descripciones]
    hits = [c for c in literales if c.lower() in plano.lower()]
    hits += [f"{d} («{re.search(rx, plano, re.I).group(0)}»)" for d, rx in descripciones.items()
             if re.search(rx, plano, re.I)]
    paso(f"lista negra del canon en {donde}", not hits,
         "; ".join(hits) if hits else f"0 de {len(literales)} cadenas y {len(descripciones)} descripciones")
    rx_23_10 = r"\b(pendientes?|abiert[oa]s?|a definir|sin respuesta|espera respuesta)\b"
    h = sorted(set(m.group(0).lower() for m in re.finditer(rx_23_10, plano, re.I)))
    paso(f"regla del 23/10 en {donde}", not h, ", ".join(h) if h else "0 apariciones")


def main() -> int:
    # 1. payload determinista
    md5s = []
    for i in (1, 2):
        r = correr(f"build_final.py ({i}.ª corrida)", [PY, "-I", str(APP / "pipeline" / "build_final.py")])
        md5s.append(hashlib.md5(DF_JS.read_bytes()).hexdigest() if r is not None and r.returncode == 0 else None)
    paso("datos_final.js igual en las dos corridas", None not in md5s and md5s[0] == md5s[1], str(md5s[-1]))
    correr("datos_final.js igual al versionado", ["git", "-C", str(APP), "diff", "--exit-code", "--", "final/src/datos_final.js"])

    # 2 y 3. /final/ armado y verificado
    correr("npm run build:final", ["npm", "--prefix", str(APP), "run", "build:final"])
    correr("verificar_final.py --sin-muestra --sin-esqueletos",
           [PY, "-I", str(APP / "scripts" / "verificar_final.py"), "--sin-muestra", "--sin-esqueletos"], timeout=1800)

    # 4. paridad con /e2/
    correr("npm run build:e2", ["npm", "--prefix", str(APP), "run", "build:e2"])
    correr(f"paridad_final.py --vista {VISTA_PARIDAD}",
           [PY, "-I", str(APP / "scripts" / "paridad_final.py"), "--vista", VISTA_PARIDAD], timeout=1800)

    # 5. HTML de un solo archivo
    correr("HTML de un solo archivo", ["npx", "vite", "build", "--config", "scripts/vite.final-sobre.config.js"])
    CF = leer_cf()
    V = [v for b in CF["BLOQUES"] for v in b["vistas"]]
    if SOBRE.exists():
        html = SOBRE.read_text(encoding="utf-8")
        externos = re.findall(r"""(?:src|href)\s*=\s*["']https?://[^"']+""", html)
        try:
            malas, pedidos, errores = sobre_sin_red(V)
        except Exception as e:   # noqa: BLE001
            malas, pedidos, errores = [f"no abre: {str(e).splitlines()[0][:100]}"], [], []
        ok = not externos and not malas and not pedidos and not errores
        paso("dist-final-sobre/index.html, abierto sin red", ok,
             f"{SOBRE.stat().st_size // 1024} KB, {len(V)} vistas con su pregunta, 0 pedidos, 0 errores de consola" if ok
             else f"externos {externos[:3]}, vistas {malas[:4]}, pedidos {pedidos[:3]}, errores {errores[:3]}")
    else:
        paso("dist-final-sobre/index.html", False, "no existe")

    # 6. /e3/ intacto
    correr("npm run build:e3", ["npm", "--prefix", str(APP), "run", "build:e3"])
    h = APP / "dist-e3" / "index.html"
    md5 = hashlib.md5(h.read_bytes()).hexdigest() if h.exists() else "sin archivo"
    paso("md5 de dist-e3/index.html", md5 == MD5_E3, md5)

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
        lineas = [l for l in cuerpo.strip().splitlines() if l.strip()]
        if len(lineas) != 1 or re.search(r"co-authored-by|signed-off-by", cuerpo, re.I):
            malos.append(sha[:8])
    n = len([b for b in log.split("\x1e") if b.strip()])
    paso("commits de una línea y sin trailers", not malos, f"{n} commits" if not malos else ", ".join(malos))

    # 8. lista negra y regla del 23/10 sobre todo el texto de /final/
    lista_negra("\n".join(cadenas(CF)), "CF (textos y notas)")
    try:
        lista_negra(texto_renderizado(V), "el texto renderizado de las vistas")
    except Exception as e:   # noqa: BLE001
        paso("texto renderizado de las vistas", False, str(e).splitlines()[0][:160])

    print()
    if fallas:
        print(f"{len(fallas)} fallas: " + "; ".join(fallas))
        print("RESULTADO: FALLA")
        return 1
    print("RESULTADO: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())

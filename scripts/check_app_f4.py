"""Check de la unidad APP de la fase 4 de la corrida «presentación final» (canon v1.1).

    python3 /Users/sebastiancaules/Desktop/ITBA/26-2C/FPDD/app/.wt-final/scripts/check_app_f4.py

Corre, con rutas absolutas y en este orden:

1. pipeline/build_final.py dos veces y git diff --exit-code sobre final/src/datos_final.js: el payload es
   determinista y el versionado es el que sale de los JSON del vault.
2. npm run build:final y scripts/verificar_final.py.
3. npm run build:e2 y build:e3; el md5 de dist-e3/index.html es el del /e3/ publicado (1903979c…): /final/ no
   tocó /e3/. Después scripts/paridad_e3.py --sin-hoja.
4. git diff --quiet main -- src e2 e3: src/**, e2/** y e3/** sin cambios contra main.
5. docs/formulas.tex compila (pdflatex tres veces, en una carpeta temporal: no pisa docs/formulas.pdf), trae
   «Anexo de fórmulas · v4.0 · 24/11/2026» y tiene 14 secciones en el .tex y en el índice compilado (lo exige
   entregas/_build/consolidados/anexos.py).
6. Ninguna cadena de canon.lista_negra en docs/formulas.tex fuera de los comentarios LaTeX (las notas de cambio
   van en líneas «%»).

Imprime cada paso y cierra con «RESULTADO: OK» o «RESULTADO: FALLA».
"""
from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

APP = Path("/Users/sebastiancaules/Desktop/ITBA/26-2C/FPDD/app/.wt-final")
VAULT = Path("/Users/sebastiancaules/Desktop/ITBA/26-2C/FPDD")
CANON = VAULT / ".workforce" / "presentacion-final" / "fase-2" / "canon.json"
TEX = APP / "docs" / "formulas.tex"
MD5_E3 = "1903979ca800a3907a2ae365d30eb48e"
VERSION = "Anexo de fórmulas · v4.0 · 24/11/2026"
SECCIONES = 14
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


def main() -> int:
    # 1. payload determinista
    correr("build_final.py (1.ª corrida)", [PY, "-I", str(APP / "pipeline" / "build_final.py")])
    correr("build_final.py (2.ª corrida)", [PY, "-I", str(APP / "pipeline" / "build_final.py")])
    correr("datos_final.js igual al versionado",
           ["git", "-C", str(APP), "diff", "--exit-code", "--", "final/src/datos_final.js"])

    # 2. /final/
    correr("npm run build:final", ["npm", "--prefix", str(APP), "run", "build:final"])
    correr("verificar_final.py", [PY, "-I", str(APP / "scripts" / "verificar_final.py"), "--sin-capturas"],
           timeout=1800)

    # 3. /e3/ intacto
    correr("npm run build:e2", ["npm", "--prefix", str(APP), "run", "build:e2"])
    correr("npm run build:e3", ["npm", "--prefix", str(APP), "run", "build:e3"])
    html = APP / "dist-e3" / "index.html"
    md5 = hashlib.md5(html.read_bytes()).hexdigest() if html.exists() else "sin archivo"
    paso("md5 de dist-e3/index.html", md5 == MD5_E3, md5)
    correr("paridad_e3.py --sin-hoja", [PY, "-I", str(APP / "scripts" / "paridad_e3.py"), "--sin-hoja"], timeout=1800)

    # 4. src, e2 y e3 sin cambios contra main
    correr("src/**, e2/** y e3/** iguales a main",
           ["git", "-C", str(APP), "diff", "--quiet", "main", "--", "src", "e2", "e3"])

    # 5. anexo de fórmulas
    tex = TEX.read_text(encoding="utf-8")
    paso("versión del anexo", VERSION in tex, VERSION)
    n_tex = len(re.findall(r"^\\section\{", tex, re.M))
    paso("secciones en formulas.tex", n_tex == SECCIONES, f"{n_tex} de {SECCIONES}")
    if not shutil.which("pdflatex"):
        paso("pdflatex", False, "no está en el PATH")
    else:
        with tempfile.TemporaryDirectory() as tmp:
            ok = True
            for i in range(3):
                r = subprocess.run(["pdflatex", "-interaction=nonstopmode", "-halt-on-error",
                                    f"-output-directory={tmp}", str(TEX)], cwd=TEX.parent,
                                   capture_output=True, text=True, timeout=300)
                ok = ok and r.returncode == 0
            pdf = Path(tmp) / "formulas.pdf"
            aux = Path(tmp) / "formulas.toc"
            n_toc = len(re.findall(r"\\contentsline \{section\}", aux.read_text(encoding="latin-1"))) if aux.exists() else -1
            paso("formulas.tex compila", ok and pdf.exists(), f"{pdf.stat().st_size // 1024} KB" if pdf.exists() else "sin PDF")
            if aux.exists():
                paso("secciones en el índice compilado", n_toc == SECCIONES, f"{n_toc} de {SECCIONES}")
            else:
                aux = Path(tmp) / "formulas.aux"
                n_aux = len(re.findall(r"\\contentsline \{section\}", aux.read_text(encoding="latin-1"))) \
                    if aux.exists() else -1
                paso("secciones en el .aux compilado", n_aux == SECCIONES, f"{n_aux} de {SECCIONES}")

    # 6. lista negra del canon fuera de las notas de cambio
    cadenas = json.loads(CANON.read_text(encoding="utf-8"))["lista_negra"]["cadenas"]
    sin_comentarios = "\n".join(l for l in tex.splitlines() if not l.lstrip().startswith("%"))
    hits = [c for c in cadenas if c in sin_comentarios]
    paso("lista negra del canon en formulas.tex", not hits, ", ".join(hits) if hits else f"0 de {len(cadenas)} cadenas")

    print()
    if fallas:
        print(f"{len(fallas)} fallas: " + "; ".join(fallas))
        print("RESULTADO: FALLA")
        return 1
    print("RESULTADO: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())

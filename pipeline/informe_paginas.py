"""Las páginas del informe para el botón de información de /final/ y el QR del cierre (19/11, fase 11 de la auditoría
de dataviz, spec 2.2 y 2.3). Escribe final/src/informe.js, que no se edita a mano:

    export const INFORME = { url, version, secciones: { '23.6': 93, 'A1.11': 173, … } }
    export const INFORME_QR = { nivel, version, filas: ['1111111…', …] }

    python3 -I pipeline/informe_paginas.py ["<PDF del consolidado acumulado>"] [--url URL] [--salida RUTA]

Por defecto lee entregas/Consolidado acumulado - Entregables 1-4 - GRUPO 2.pdf del vault. Se vuelve a correr cada vez
que el consolidado se rearma (las páginas se corren; las claves no).

- La página de cada sección es la hoja donde EMPIEZA: la del marcador del PDF (hyperref), comprobada contra el texto
  (pdftotext): el título de la sección («23.6 Veredicto de factibilidad económica») tiene que estar al comienzo de un
  renglón de esa hoja. Si el marcador cae una hoja antes o después del título, vale la hoja del título. Una sección sin
  marcador se busca solo por el texto, fuera del índice. El encabezado de cada hoja («E3 · Parte B › 23.6 …») y la barra
  de secciones del pie no cuentan como título.
- Tiene que cubrir todas las claves `informe` de final/src/contenido_final.js (las lee con node); si falta una, corta.
- `version` sale de la carátula («Versión: v5.0»; si no, del título del PDF).
- El QR lleva a `url`, nivel M (pipeline/qr.py, sin dependencias), y el tablero lo dibuja en SVG con su margen.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

from pypdf import PdfReader

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
from qr import matriz  # noqa: E402

APP = AQUI.parent
VAULT = Path("/Users/sebastiancaules/Desktop/ITBA/26-2C/FPDD")
PDF = VAULT / "entregas" / "Consolidado acumulado - Entregables 1-4 - GRUPO 2.pdf"
URL = "https://sebascaules.github.io/TP_82.21-Data-Driven/final/consolidado-acumulado-grupo-2.pdf"
SALIDA = APP / "final" / "src" / "informe.js"
CONTENIDO = APP / "final" / "src" / "contenido_final.js"
NIVEL_QR = "M"
CLAVE = re.compile(r"^((?:A\d+\.)?\d+(?:\.\d+)*)\s+(\S.*)$")


def marcadores(r: PdfReader) -> list[tuple[str, int]]:
    """(título, página 1-based) de cada marcador, en orden."""
    out = []

    def recorrer(o):
        for it in o:
            if isinstance(it, list):
                recorrer(it)
            else:
                try:
                    out.append((str(it.title).strip(), r.get_destination_page_number(it) + 1))
                except Exception:  # noqa: BLE001 (un marcador sin destino no sirve)
                    pass

    recorrer(r.outline)
    return out


def texto_por_hoja(pdf: Path) -> list[str]:
    """El texto de cada hoja (pdftotext -layout; las hojas van separadas por un salto de página). [0] es la hoja 1."""
    r = subprocess.run(["pdftotext", "-layout", str(pdf), "-"], capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"pdftotext falló: {r.stderr.strip()[:300]}")
    hojas = r.stdout.split("\f")
    if hojas and not hojas[-1].strip():
        hojas = hojas[:-1]
    return hojas


def es_titulo(linea: str, clave: str, palabra: str | None) -> bool:
    """¿El renglón empieza con el título de la sección? La clave al comienzo y, detrás, la primera palabra del título (si
    se conoce) o cualquier cosa que no sea otro número (la barra del pie es «23.1 23.2 23.3 …»)."""
    s = linea.strip()
    if not s.startswith(clave):
        return False
    resto = s[len(clave):]
    if not resto[:1].isspace():
        return False
    resto = resto.strip()
    if palabra:
        return resto.startswith(palabra)
    return bool(resto) and not resto[0].isdigit()


def hojas_con_titulo(hojas: list[str], clave: str, palabra: str | None, fuera: set[int]) -> list[int]:
    return [i + 1 for i, h in enumerate(hojas) if i + 1 not in fuera
            and any(es_titulo(ln, clave, palabra) for ln in h.splitlines())]


def claves_usadas() -> list[str]:
    """Las claves `informe` de CF.BLOQUES, leídas con node; si node no está o falla, con una expresión regular."""
    js = ("import(process.argv[1]).then((m) => { const s = new Set(); for (const b of m.CF.BLOQUES) for (const v of "
          "b.vistas) for (const k of v.informe ?? []) s.add(k); console.log(JSON.stringify([...s])) })"
          ".catch((e) => { console.error(String(e)); process.exit(1) })")
    try:
        r = subprocess.run(["node", "--input-type=module", "-e", js, CONTENIDO.resolve().as_uri()],
                           capture_output=True, text=True, cwd=APP, timeout=60)
        if r.returncode == 0:
            return json.loads(r.stdout.strip().splitlines()[-1])
        print(f"aviso: node no leyó contenido_final.js ({r.stderr.strip()[:200]}); uso la expresión regular")
    except (OSError, subprocess.TimeoutExpired) as e:
        print(f"aviso: sin node ({e}); uso la expresión regular")
    txt = CONTENIDO.read_text(encoding="utf-8")
    claves: list[str] = []
    for m in re.finditer(r"informe:\s*\[([^\]]*)\]", txt):
        for k in re.findall(r"['\"]([^'\"]+)['\"]", m.group(1)):
            if k not in claves:
                claves.append(k)
    return claves


def version_de(r: PdfReader, hojas: list[str]) -> str:
    m = re.search(r"Versión:\s*(v\d+(?:\.\d+)*)", hojas[0] if hojas else "")
    if m:
        return m.group(1)
    titulo = str((r.metadata or {}).get("/Title", ""))
    m = re.search(r"\bv(\d+(?:\.\d+)*)\s*$", titulo)
    if m:
        return f"v{m.group(1)}"
    raise SystemExit("No encuentro la versión del consolidado (ni «Versión: vX.Y» en la carátula ni en el título)")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("pdf", nargs="?", default=str(PDF), help="PDF del consolidado acumulado")
    ap.add_argument("--url", default=URL, help="dirección pública del PDF (la del QR y los enlaces)")
    ap.add_argument("--salida", default=str(SALIDA))
    a = ap.parse_args()
    pdf = Path(a.pdf).expanduser().resolve()
    if not pdf.exists():
        raise SystemExit(f"No está el PDF: {pdf}")

    r = PdfReader(str(pdf))
    hojas = texto_por_hoja(pdf)
    if len(hojas) != len(r.pages):
        raise SystemExit(f"pdftotext dio {len(hojas)} hojas y el PDF tiene {len(r.pages)}")
    marcas = marcadores(r)

    # el índice (de su marcador al siguiente) no cuenta para buscar títulos: los lista todos
    indice: set[int] = set()
    for i, (t, p) in enumerate(marcas):
        if t.lower().startswith("índice") and i + 1 < len(marcas):
            indice = set(range(p, marcas[i + 1][1]))

    secciones: dict[str, int] = {}
    avisos: list[str] = []
    for t, p in marcas:
        m = CLAVE.match(t)
        if not m or m.group(1) in secciones:
            continue
        clave, titulo = m.group(1), m.group(2)
        palabra = titulo.split()[0]
        if any(es_titulo(ln, clave, palabra) for ln in hojas[p - 1].splitlines()):
            secciones[clave] = p
            continue
        cerca = [q for q in (p + 1, p - 1) if 1 <= q <= len(hojas)
                 and any(es_titulo(ln, clave, palabra) for ln in hojas[q - 1].splitlines())]
        if cerca:
            avisos.append(f"{clave}: el marcador dice p. {p} y el título está en la p. {cerca[0]}; vale la {cerca[0]}")
            secciones[clave] = cerca[0]
        else:
            avisos.append(f"{clave}: el título no aparece en el texto cerca de la p. {p}; vale el marcador")
            secciones[clave] = p

    usadas = claves_usadas()
    if not usadas:
        raise SystemExit("contenido_final.js no trae ninguna clave `informe`")
    faltan = []
    for k in usadas:
        if k in secciones:
            continue
        donde = hojas_con_titulo(hojas, k, None, indice)
        if donde:
            secciones[k] = donde[0]
            avisos.append(f"{k}: sin marcador; por el texto, p. {donde[0]}")
        else:
            faltan.append(k)
    if faltan:
        raise SystemExit(f"Estas claves de contenido_final.js no están en el informe: {', '.join(faltan)}. Corto.")

    version = version_de(r, hojas)
    qr = matriz(a.url, NIVEL_QR)
    md5 = hashlib.md5(pdf.read_bytes()).hexdigest()
    # la fecha del PDF (no la de esta corrida): con el mismo PDF, el mismo informe.js
    creado = (r.metadata or {}).get("/CreationDate", "")
    m_f = re.match(r"D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})", str(creado))
    generado = f"{m_f[3]}/{m_f[2]}/{m_f[1]} {m_f[4]}:{m_f[5]}" if m_f else "sin fecha"
    try:
        rel = pdf.relative_to(VAULT)
    except ValueError:
        rel = pdf
    orden = sorted(secciones, key=lambda k: (k.startswith("A"), [int(x) for x in k.lstrip("A").split(".")]))
    cuerpo_sec = ",\n".join(f"    {json.dumps(k)}: {secciones[k]}" for k in orden)
    cuerpo_qr = ",\n".join(f"    {json.dumps(f)}" for f in qr)
    js = f"""// Las páginas del informe y el QR del cierre de /final/. NO SE EDITA A MANO: lo escribe pipeline/informe_paginas.py
// desde el PDF del consolidado acumulado (marcadores comprobados contra el texto de cada hoja). Se vuelve a correr cada
// vez que el consolidado se rearma.
//   PDF: {rel}
//   {version}, {len(r.pages)} hojas, generado el {generado}, md5 {md5}
// secciones: la hoja (1-based) donde empieza cada sección; las claves son las de contenido_final.js (`informe`).
// INFORME_QR: la matriz del QR que lleva a INFORME.url (pipeline/qr.py, modo byte, nivel {NIVEL_QR}), sin el margen blanco.

export const INFORME = {{
  url: {json.dumps(a.url)},
  version: {json.dumps(version)},
  secciones: {{
{cuerpo_sec},
  }},
}}

export const INFORME_QR = {{
  nivel: {json.dumps(NIVEL_QR)},
  version: {(len(qr) - 17) // 4},
  filas: [
{cuerpo_qr},
  ],
}}
"""
    salida = Path(a.salida).expanduser().resolve()
    salida.write_text(js, encoding="utf-8")
    for x in avisos:
        print(f"  · {x}")
    print(f"{salida}: {len(secciones)} secciones, {version}, QR {len(qr)} × {len(qr)} (nivel {NIVEL_QR})")
    print("claves de contenido_final.js: " + ", ".join(f"{k} p. {secciones[k]}" for k in usadas))


if __name__ == "__main__":
    main()

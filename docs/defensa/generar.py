"""Regenera el PDF de la guia de defensa del tablero.

Captura las 14 vistas de dist/index.html y compone defensa.html a PDF. Correr
despues de `npm run build`, desde cualquier directorio:

    python3 app/docs/defensa/generar.py

Requiere playwright con chromium instalado. El texto de cada hoja vive en
defensa.html y se edita a mano; este script solo refresca las capturas y el PDF.
"""
from pathlib import Path

from playwright.sync_api import sync_playwright

AQUI = Path(__file__).resolve().parent
APP = AQUI.parent.parent
BUNDLE = APP / "dist" / "index.html"
IMG = AQUI / "img"
SALIDA = APP.parent / "entregas" / "entregable-1" / "25-08" / "tablero-guia-de-defensa.pdf"

# El orden es el de PANTALLAS en src/pantallas/index.jsx.
IDS = ["D0", "D1", "D2", "D3", "D4", "D5a", "D5b", "D6", "M0", "M3", "M1", "M2a", "M2b", "D7"]


def capturar(pw):
    IMG.mkdir(exist_ok=True)
    nav = pw.chromium.launch()
    pag = nav.new_page(viewport={"width": 1440, "height": 810}, device_scale_factor=2)
    pag.goto(BUNDLE.as_uri())
    pag.wait_for_timeout(2500)
    for i, sid in enumerate(IDS):
        pag.query_selector_all(".lat-item")[i].click()
        pag.wait_for_timeout(900)
        pag.screenshot(path=str(IMG / f"{i + 1:02d}-{sid}.png"))
        print(f"  {i + 1:02d} {sid}")
    nav.close()


def componer(pw):
    nav = pw.chromium.launch()
    pag = nav.new_page()
    pag.goto((AQUI / "defensa.html").as_uri())
    pag.wait_for_timeout(1500)
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    pag.pdf(path=str(SALIDA), format="A4", print_background=True, prefer_css_page_size=True)
    nav.close()


if __name__ == "__main__":
    if not BUNDLE.exists():
        raise SystemExit(f"falta el bundle: {BUNDLE}. Correr `npm run build` primero.")
    with sync_playwright() as pw:
        print("capturando las 14 vistas")
        capturar(pw)
        print("componiendo el PDF")
        componer(pw)
    print(f"listo: {SALIDA}")

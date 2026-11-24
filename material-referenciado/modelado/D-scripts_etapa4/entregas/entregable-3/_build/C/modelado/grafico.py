"""
Gráfico de importancia de variables de la etapa 3 (Parte C, 7.3 y 7.6), con la identidad visual
de `app/src/estilos.css`: los colores se leen de los tokens del CSS, así el gráfico sigue al
tablero si la paleta cambia.

Una sola serie: el énfasis (--acc) para las variables de la regla del umbral y gris (--gris) para
el resto. Sin leyenda de colores: cada barra lleva su rótulo y el valor al final.
"""
from __future__ import annotations

import re
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

CSS = Path(__file__).resolve().parents[5] / "app" / "src" / "estilos.css"


def tokens(css: Path = CSS) -> dict[str, str]:
    """Los colores `--nombre: #rrggbb` del bloque :root de estilos.css."""
    texto = css.read_text(encoding="utf-8")
    return {m.group(1): m.group(2).lower()
            for m in re.finditer(r"--([\w-]+):\s*(#[0-9a-fA-F]{6})\b", texto)}


def importancia(filas: list[dict], destino: Path, titulo: str, nota: str) -> list[Path]:
    """Barras horizontales: una fila por variable, de mayor a menor. `filas` trae `etiqueta`,
    `valor` (puntos de precisión de la lista que se pierden), `error` (desvío entre repeticiones)
    y `de_la_regla` (True si es una de las variables que definen el umbral)."""
    t = tokens()
    tinta, acc, gris, eje, papel, mut = (t["ink"], t["acc"], t["gris"], t["eje"], t["sup"], t["mut"])
    plt.rcParams.update({
        "font.family": ["Arial", "Helvetica", "DejaVu Sans"], "font.size": 8.5,
        "text.color": tinta, "axes.labelcolor": t["lbl"], "axes.edgecolor": eje,
        "xtick.color": mut, "ytick.color": tinta, "pdf.fonttype": 42, "svg.fonttype": "none"})
    filas = sorted(filas, key=lambda f: f["valor"])
    alto = 0.9 + 0.27 * len(filas)
    fig, ax = plt.subplots(figsize=(6.85, alto), dpi=200)
    fig.patch.set_facecolor(papel)
    ax.set_facecolor(papel)
    y = range(len(filas))
    colores = [acc if f["de_la_regla"] else gris for f in filas]
    ax.barh(list(y), [f["valor"] for f in filas], xerr=[f["error"] for f in filas], color=colores,
            height=0.62, error_kw={"ecolor": eje, "elinewidth": 0.7, "capsize": 0})
    ax.set_yticks(list(y), [f["etiqueta"] for f in filas])
    maximo = max(f["valor"] + f["error"] for f in filas)
    for i, f in enumerate(filas):
        ax.text(max(f["valor"] + f["error"], 0) + maximo * 0.015, i,
                f"{f['valor']:.1f}".replace(".", ","), va="center", fontsize=7.5, color=tinta)
    ax.set_xlim(min(0, min(f["valor"] - f["error"] for f in filas) * 1.1), maximo * 1.12)
    ax.axvline(0, color=eje, linewidth=0.6)
    for lado in ("top", "right", "left"):
        ax.spines[lado].set_visible(False)
    ax.spines["bottom"].set_color(eje)
    ax.tick_params(axis="y", length=0)
    ax.tick_params(axis="x", colors=mut, labelsize=7.5)
    ax.xaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:g}".replace(".", ",")))
    ax.set_xlabel("puntos de precisión de la lista de 500 que se pierden al desordenar la variable",
                  fontsize=7.5, color=mut)
    ax.set_title(titulo, loc="left", fontsize=9.5, fontweight="bold", color=tinta, pad=10)
    fig.text(0.01, 0.005, nota, fontsize=6.8, color=mut, ha="left", va="bottom", wrap=True)
    fig.tight_layout(rect=(0, 0.06, 1, 1))
    destino.parent.mkdir(parents=True, exist_ok=True)
    salidas = []
    for ext in ("png",):          # solo PNG: la figura va dentro del DOCX (7.3); un PDF suelto en _build/ no se lee
        ruta = destino.with_suffix("." + ext)
        fig.savefig(ruta, facecolor=papel)
        salidas.append(ruta)
    plt.close(fig)
    return salidas

# -*- coding: utf-8 -*-
"""Gráfico de la 3.5 de la Parte B (cambio 149, DG9 b): ROI a un año de la regla sin modelo, con 15 % de
descuento, al mover una variable por vez.

    python3 -I entregas/entregable-3/_build/B/grafico/grafico_3_5.py

Lee `../economia/salida/economia.json` → `grafico_3_5` (13 barras y la base, fila G59 del registro) y escribe
`salida/grafico_3_5.png`, que generar_b.py mete en la 3.5. Una sola idea (ninguna variable acerca la regla a
ROI 0): barras desde 0, en gris; en azul de énfasis la que más la acerca. La base va en el rótulo del eje, no
como línea. Los colores son los tokens de `app/src/estilos.css`; si el archivo no está (zip descomprimido fuera
del repositorio), usa los mismos valores copiados acá.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.ticker import FuncFormatter  # noqa: E402

AQUI = Path(__file__).resolve().parent
ECONOMIA = AQUI.parent / "economia" / "salida" / "economia.json"
SALIDA = AQUI / "salida" / "grafico_3_5.png"
CSS = AQUI.parents[4] / "app" / "src" / "estilos.css"
POR_DEFECTO = {"ink": "#16233a", "lbl": "#3d4d66", "mut": "#5f6779", "acc": "#22456f", "gris2": "#b9c0cc",
               "eje": "#79839a", "sup": "#ffffff"}


# rótulos más llanos que los de economia.json, solo para el gráfico
ROTULOS = {"Descuento usado por los FP: apertura": "Oferta válida hasta la próxima compra"}


def tokens() -> dict[str, str]:
    if not CSS.exists():
        return dict(POR_DEFECTO)
    texto = CSS.read_text(encoding="utf-8")
    t = {m.group(1): m.group(2).lower() for m in re.finditer(r"--([\w-]+):\s*(#[0-9a-fA-F]{6})\b", texto)}
    return {k: t.get(k, v) for k, v in POR_DEFECTO.items()}


def coma(v: float, k: int = 1) -> str:
    s = f"{abs(v):.{k}f}".replace(".", ",")
    return ("−" if v < 0 else "") + s


def main() -> Path:
    with open(ECONOMIA, encoding="utf-8") as f:
        g = json.load(f)["grafico_3_5"]
    barras = sorted(g["barras"], key=lambda b: b["roi_regla_pct"])     # la más cerca de 0, arriba
    base = g["roi_base_pct"]
    mejor = max(barras, key=lambda b: b["roi_regla_pct"])
    t = tokens()
    plt.rcParams.update({
        "font.family": ["Arial", "Helvetica", "DejaVu Sans"], "font.size": 8.5, "text.color": t["ink"],
        "axes.edgecolor": t["eje"], "xtick.color": t["mut"], "ytick.color": t["ink"]})
    fig, ax = plt.subplots(figsize=(6.85, 0.9 + 0.25 * len(barras)), dpi=200)
    fig.patch.set_facecolor(t["sup"])
    ax.set_facecolor(t["sup"])
    y = list(range(len(barras)))
    colores = [t["acc"] if b is mejor else t["gris2"] for b in barras]
    ax.barh(y, [b["roi_regla_pct"] for b in barras], color=colores, height=0.62)
    ax.set_yticks(y, [ROTULOS.get(b["etiqueta"], b["etiqueta"]) for b in barras])
    for i, b in enumerate(barras):
        ax.text(b["roi_regla_pct"] + 2.0, i, coma(b["roi_regla_pct"]) + " %", va="center", ha="left",
                fontsize=7.2, color="white" if b is mejor else t["ink"])
    ax.axvline(0, color=t["ink"], linewidth=0.9)
    ax.text(-0.8, len(barras) - 0.35, "ROI 0", fontsize=7, color=t["ink"], ha="right", va="bottom")
    ax.set_xlim(-106, 0)
    ax.set_ylim(-0.6, len(barras) + 0.2)
    for lado in ("top", "right", "left"):
        ax.spines[lado].set_visible(False)
    ax.tick_params(axis="y", length=0)
    ax.tick_params(axis="x", labelsize=7.5)
    ax.xaxis.set_major_formatter(FuncFormatter(lambda v, _: coma(v, 0) + " %"))
    ax.set_xlabel(f"ROI a un año de la regla sin modelo, con 15 % de descuento (base {coma(base, 2)} %)",
                  fontsize=7.5, color=t["mut"])
    ax.set_title("Ninguna variable lleva la regla a ROI 0", loc="left", fontsize=9.5, fontweight="bold",
                 color=t["ink"], pad=12)
    fig.tight_layout()
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(SALIDA, facecolor=t["sup"], metadata={"Software": None})
    plt.close(fig)
    return SALIDA


if __name__ == "__main__":
    print("->", main())

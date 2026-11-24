# -*- coding: utf-8 -*-
"""Gráfico de la Parte D, 8.1 (cambio 167, 03/11): precisión de la lista de 500 contactables en test, los
cinco cortes juntos, para la práctica actual, la regla del umbral y la logística ajustada. Al lado de la barra
de la logística, el intervalo de 95 % de su diferencia con la regla, como texto.

    python3 -I entregas/entregable-3/_build/D/grafico_8_1.py      # escribe graficos/precision_test.png

Una idea (la regla y el modelo aciertan lo mismo; la práctica actual, menos de la mitad), que abre el pie de la
figura en el DOCX; sin título dentro de la imagen, sin leyenda ni grilla: cada barra lleva su rótulo y su valor. Colores de app/src/estilos.css, leídos del CSS como en
_build/C/modelado/grafico.py: --acc para la regla, que es la que sale; --gris para las otras dos.

Cifras (registro de cifras del E3): J17 (37,6 %), J03 (86,1 % y 85,9 %), J09 (−1,45 a +0,79 puntos). Se leen
de modelado/salida/etapa4.json; los asserts cortan si el JSON dice otra cosa.
"""
import json
import os
import re
import sys

sys.dont_write_bytecode = True
import matplotlib  # noqa: E402

matplotlib.use('Agg')
import matplotlib.pyplot as plt  # noqa: E402

AQUI = os.path.dirname(os.path.abspath(__file__))
VAULT = os.path.abspath(os.path.join(AQUI, '..', '..', '..', '..'))
CSS = os.path.join(VAULT, 'app', 'src', 'estilos.css')
ETAPA4 = os.path.join(AQUI, 'modelado', 'salida', 'etapa4.json')
SALIDA = os.path.join(AQUI, 'graficos', 'precision_test.png')


def tokens():
    with open(CSS, encoding='utf-8') as f:
        texto = f.read()
    return {m.group(1): m.group(2).lower() for m in re.finditer(r'--([\w-]+):\s*(#[0-9a-fA-F]{6})\b', texto)}


def coma(x, k=1):
    return f'{x:.{k}f}'.replace('.', ',')


def datos():
    with open(ETAPA4, encoding='utf-8') as f:
        e4 = json.load(f)
    m = e4['medicion']
    practica = m['secundarias']['practica_actual_contactables']['precision']
    regla = m['principal']['regla_umbral']['precision']
    modelo = m['principal']['logistica_ajustada']['precision']
    ic = m['principal']['diferencia_logistica_menos_regla']['ic95']
    assert (coma(practica * 100), coma(regla * 100), coma(modelo * 100)) == ('37,6', '86,1', '85,9'), 'etapa4.json cambió'
    assert (coma(ic[0] * 100, 2), coma(ic[1] * 100, 2)) == ('-1,45', '0,79'), 'etapa4.json cambió'
    return practica, regla, modelo, ic


def main():
    practica, regla, modelo, ic = datos()
    t = tokens()
    tinta, acc, gris, eje, papel, mut = t['ink'], t['acc'], t['gris'], t['eje'], t['sup'], t['mut']
    plt.rcParams.update({
        'font.family': ['Arial', 'Helvetica', 'DejaVu Sans'], 'font.size': 8.5, 'text.color': tinta,
        'axes.edgecolor': eje, 'xtick.color': mut, 'ytick.color': tinta, 'svg.fonttype': 'none'})
    filas = [  # de abajo hacia arriba
        ('Logística ajustada', modelo, gris),
        ('Regla del umbral', regla, acc),
        ('Práctica actual', practica, gris),
    ]
    fig, ax = plt.subplots(figsize=(5.3, 1.05), dpi=220)
    fig.patch.set_facecolor(papel)
    ax.set_facecolor(papel)
    y = list(range(len(filas)))
    ax.barh(y, [f[1] * 100 for f in filas], color=[f[2] for f in filas], height=0.58)
    ax.set_yticks(y, [f[0] for f in filas])
    # 03/11 (V4 H4): el intervalo va como texto al lado del 85,9 %; dibujado en esta escala se leía como una «H»
    for i, (_, v, _) in enumerate(filas):
        x = v * 100 + 1.8
        ax.text(x, i, coma(v * 100) + ' %', va='center', fontsize=8, color=tinta,
                fontweight='bold' if i == 1 else 'normal')
    ax.text(modelo * 100 + 22, 0, 'diferencia con la regla: ' + coma(ic[0] * 100, 2).replace('-', '−') + ' a +'
            + coma(ic[1] * 100, 2) + ' puntos', va='center', fontsize=7, color=mut)
    ax.set_xlim(0, 215)
    ax.set_ylim(-0.55, 2.55)
    for lado in ('top', 'right', 'left', 'bottom'):
        ax.spines[lado].set_visible(False)
    ax.tick_params(axis='y', length=0)
    ax.set_xticks([])
    # el mensaje (la regla y el modelo aciertan lo mismo) va al principio del pie de la figura, en el DOCX
    fig.tight_layout(rect=(0, 0, 1, 1))
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    fig.savefig(SALIDA, facecolor=papel, bbox_inches='tight', pad_inches=0.04)
    plt.close(fig)
    print('->', os.path.relpath(SALIDA, VAULT))


if __name__ == '__main__':
    main()

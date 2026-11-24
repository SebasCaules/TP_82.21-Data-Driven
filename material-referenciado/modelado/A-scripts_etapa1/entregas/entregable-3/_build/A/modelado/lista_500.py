# -*- coding: utf-8 -*-
"""Matriz de confusión y F1 de cada línea base en la lista de 500 por corte (validación sin filtro).

    python3 -I entregas/entregable-3/_build/A/modelado/lista_500.py

Pedido 156 del plan del feedback del Grupo 4 (03/11): la A 2.5 muestra la matriz de la regla en la lista
de 500, la que citan G20 y la B 4.4, y su tabla de resultados da precisión, recall y F1 de la lista para
las tres líneas base. Solo lee salida/etapa1.json (no recalcula el modelado) y escribe salida/lista_500.json.

En la lista de largo fijo L con P positivos y A aciertos (sumando los 3 cortes de validación):
VP = A, FP = L − A, FN = P − A, VN = filas − L − FN; F1 = 2 VP / (L + P), la fórmula de G11.
Falla si la matriz de la regla no es la de etapa1.json (G20) o si su F1 no es el de etapa2.json (G11).
"""
import json
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
ENTRADA = os.path.join(AQUI, 'salida', 'etapa1.json')
SALIDA = os.path.join(AQUI, 'salida', 'lista_500.json')
ETAPA2 = os.path.join(AQUI, '..', '..', 'B', 'modelado', 'salida', 'etapa2.json')


def matriz(filas, lista):
    largo, vp, pos = lista['largo'], lista['aciertos'], lista['positivos']
    fp, fn = largo - vp, pos - vp
    return {'largo': largo, 'positivos': pos, 'vp': vp, 'fp': fp, 'fn': fn, 'vn': filas - largo - fn,
            'precision': vp / largo, 'recall': vp / pos, 'f1': 2 * vp / (largo + pos)}


def main():
    with open(ENTRADA, encoding='utf-8') as f:
        lb = json.load(f)['lineas_base_validacion']
    out = {'fuente': 'salida/etapa1.json -> lineas_base_validacion.<linea>.lista_capacidad',
           'filas_validacion': lb['filas']}
    for linea in ('clase_mayoritaria', 'practica_actual', 'regla_umbral'):
        out[linea] = matriz(lb['filas'], lb[linea]['lista_capacidad'])

    reg, ref = out['regla_umbral'], lb['regla_umbral']['lista_capacidad']['confusion']
    for a, b in (('vp', 'tp'), ('fp', 'fp'), ('fn', 'fn'), ('vn', 'tn')):
        assert abs(reg[a] - ref[b]) < 1e-6, f'G20: {a} {reg[a]} contra {ref[b]}'
    if os.path.exists(ETAPA2):
        with open(ETAPA2, encoding='utf-8') as f:
            f1_g11 = json.load(f)['modelos']['regla_umbral']['validacion']['lista_500']['f1']
        assert abs(reg['f1'] - f1_g11) < 1e-9, f'G11: F1 {reg["f1"]} contra {f1_g11}'
    assert round(out['practica_actual']['f1'], 3) == 0.338, out['practica_actual']['f1']

    with open(SALIDA, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    for linea in ('clase_mayoritaria', 'practica_actual', 'regla_umbral'):
        m = out[linea]
        print(f"{linea:18s} VP {m['vp']:.2f} FP {m['fp']:.2f} FN {m['fn']:.2f} VN {m['vn']:.2f} "
              f"precisión {m['precision']:.4f} recall {m['recall']:.4f} F1 {m['f1']:.4f}")
    print('->', os.path.relpath(SALIDA, AQUI))


if __name__ == '__main__':
    main()

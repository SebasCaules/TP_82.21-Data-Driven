# -*- coding: utf-8 -*-
"""Serie mensual de clientes en riesgo sobre elegibles, con la identidad unida del E2 (DC-04), y el umbral de la
alerta de drift de la Parte D, 10.2 (fila J53 de wiki/entregables/cifras-entregable-3.md).

    python3 entregas/entregable-3/_build/D/drift/serie_riesgo.py      # escribe drift/serie_riesgo.json

Usa las mismas funciones que el pipeline del E2 (app/pipeline: loader, calidad.mapear_identidad,
features.client_facts, calidad.resumen_riesgo), las que corre el operador según la 9.2. Un corte por fin de mes,
de diciembre de 2023 a diciembre de 2025 (los 25 cortes del tablero del E1). Para cada corte: elegibles,
en riesgo y su cociente, sin redondear. La suba mensual es la diferencia en puntos contra el corte anterior.

Umbral: la mayor suba mensual de diciembre de 2023 a agosto de 2025, el último corte antes de los meses que
DC-09 marca con cobertura no confirmada (septiembre a diciembre de 2025). Reproduce E01 (38,5 % al 31/08/2025)
y D22 (50,4 % al 31/12/2025) y lo afirma.
"""
import json
import os
import sys

sys.dont_write_bytecode = True
AQUI = os.path.dirname(os.path.abspath(__file__))
VAULT = os.path.abspath(os.path.join(AQUI, '..', '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(VAULT, 'app', 'pipeline'))

import pandas as pd  # noqa: E402

import build_e2 as B  # noqa: E402
import calidad  # noqa: E402
import features  # noqa: E402
import loader  # noqa: E402

SALIDA = os.path.join(AQUI, 'serie_riesgo.json')
DESDE, HASTA, ULTIMO_LIMPIO = '2023-12-31', '2025-12-31', '2025-08-31'


def main():
    tx_e1 = loader.load_transacciones(B.DATA_E1)
    idr = pd.read_csv(B.DATA_E2 / 'Identidad_resuelta.csv')
    mapa = idr.set_index('id_cliente')['id_cliente_canonico']
    tx_e2 = calidad.mapear_identidad(tx_e1, mapa, col='id_cliente')

    serie = []
    for corte in pd.date_range(DESDE, HASTA, freq='ME'):
        f = features.client_facts(tx_e2, corte)
        r = calidad.resumen_riesgo(f)
        pct = r['en_riesgo'] / r['elegibles'] * 100
        fila = {'corte': str(corte.date()), 'clientes': int(len(f)), 'elegibles': r['elegibles'],
                'en_riesgo': r['en_riesgo'], 'pct': pct}
        if serie:
            fila['suba_pp'] = pct - serie[-1]['pct']
        serie.append(fila)

    limpias = [s for s in serie[1:] if s['corte'] <= ULTIMO_LIMPIO]
    mayor = max(limpias, key=lambda s: s['suba_pp'])
    por_corte = {s['corte']: s for s in serie}
    # E01 y D22, los valores del registro
    assert (por_corte['2025-08-31']['en_riesgo'], por_corte['2025-08-31']['elegibles']) == (1763, 4581)
    assert (por_corte['2025-12-31']['en_riesgo'], por_corte['2025-12-31']['elegibles']) == (2372, 4710)
    assert round(por_corte['2025-08-31']['pct'], 1) == 38.5 and round(por_corte['2025-12-31']['pct'], 1) == 50.4
    saltaria = [s['corte'] for s in serie[1:] if s['suba_pp'] > mayor['suba_pp']]

    salida = {
        'que': 'clientes en riesgo sobre elegibles por corte mensual, con DC-04 (identidad unida del E2)',
        'base': 'app/pipeline: loader.load_transacciones, calidad.mapear_identidad, features.client_facts, '
                'calidad.resumen_riesgo',
        'ventana_umbral': [DESDE, ULTIMO_LIMPIO],
        'umbral_suba_pp': mayor['suba_pp'],
        'umbral_corte': mayor['corte'],
        'saltaria_en': saltaria,
        'serie': serie,
    }
    with open(SALIDA, 'w', encoding='utf-8') as fh:
        json.dump(salida, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    print(f'umbral: suba de {mayor["suba_pp"]:.3f} puntos ({mayor["corte"]}); saltaría en {saltaria}')
    for s in serie:
        print(s['corte'], s['elegibles'], s['en_riesgo'], f'{s["pct"]:.2f}', f'{s.get("suba_pp", 0):+.2f}')


if __name__ == '__main__':
    main()

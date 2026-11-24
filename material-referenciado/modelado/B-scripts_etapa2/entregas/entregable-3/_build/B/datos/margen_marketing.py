# -*- coding: utf-8 -*-
"""Margen, ventas contables e inversión de marketing para la Parte B del Entregable 3.

    python3 -I entregas/entregable-3/_build/B/datos/margen_marketing.py

Solo lee raw/ y escribe margen_marketing.json al lado de este archivo. Calcula las filas
G01 a G07 de wiki/entregables/cifras-entregable-3.md y los controles del perfilado de
wiki/fuentes/fuente-dataset-costo-margen.md y wiki/fuentes/fuente-dataset-inversion-marketing.md.

Fuentes (respuesta de Casa Óga del 13/10/2026, raw/Respuestas_Consultas_Entregable_3.md):
    raw/datasets/unidad-3/Costo_Margen_Categoria_Mensual.csv   (punto 2 del mail, envío 62)
    raw/datasets/unidad-3/Inversion_Marketing_Anual.csv        (punto 3, envío 6 y envío 1)
Cruces con raw/datasets/unidad-1/Transacciones_clientes.csv, Clientes.csv y
raw/datasets/unidad-2/Identidad_resuelta.csv.

Solo biblioteca estándar (csv, json, decimal). Todos los montos en ARS tal como vienen
(Casa Óga los declara en pesos corrientes; ver DC-10). Redondeo: mitad hacia arriba.
Sale con código 1 si alguna cifra no coincide con el valor registrado.
"""
import csv
import json
import os
import sys
from collections import Counter, defaultdict
from decimal import ROUND_HALF_UP, Decimal

AQUI = os.path.dirname(os.path.abspath(__file__))
VAULT = os.path.abspath(os.path.join(AQUI, '..', '..', '..', '..', '..'))
RAW = os.path.join(VAULT, 'raw')
U1 = os.path.join(RAW, 'datasets', 'unidad-1')
U2 = os.path.join(RAW, 'datasets', 'unidad-2')
U3 = os.path.join(RAW, 'datasets', 'unidad-3')
SALIDA = os.path.join(AQUI, 'margen_marketing.json')

ANIOS = ['2022', '2023', '2024', '2025']
M = Decimal('1000000')
FALLAS = []


def r(x, d=1):
    """Redondeo mitad hacia arriba a d decimales, devuelto como float para el JSON."""
    q = Decimal(1).scaleb(-d)
    return float(Decimal(x).quantize(q, rounding=ROUND_HALF_UP))


def pct(a, b, d=1):
    return r(Decimal(a) / Decimal(b) * 100, d)


def leer_dict(ruta):
    with open(ruta, encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f))


def esperar(nombre, obtenido, esperado):
    if obtenido != esperado:
        FALLAS.append('%s: obtenido %r, registrado %r' % (nombre, obtenido, esperado))


def transacciones_unicas():
    """Filas de Transacciones sin las 250 repetidas exactas (DC-01): 50.000 filas."""
    with open(os.path.join(U1, 'Transacciones_clientes.csv'), encoding='utf-8', newline='') as f:
        rd = csv.reader(f)
        cab = next(rd)
        crudas = [tuple(x) for x in rd]
    unicas = list(dict.fromkeys(crudas))
    col = {k: j for j, k in enumerate(cab)}
    return cab, col, len(crudas), unicas


def main():
    cm = leer_dict(os.path.join(U3, 'Costo_Margen_Categoria_Mensual.csv'))
    mk = leer_dict(os.path.join(U3, 'Inversion_Marketing_Anual.csv'))
    cab, col, n_crudas, tx = transacciones_unicas()
    clientes = {x['id_cliente']: x for x in leer_dict(os.path.join(U1, 'Clientes.csv'))}
    identidad = leer_dict(os.path.join(U2, 'Identidad_resuelta.csv'))
    with open(os.path.join(RAW, 'Respuestas_Consultas_Entregable_3.md'), encoding='utf-8') as f:
        respuesta = f.read()

    out = {'fuentes': {
        'costo_margen': 'raw/datasets/unidad-3/Costo_Margen_Categoria_Mensual.csv',
        'inversion_marketing': 'raw/datasets/unidad-3/Inversion_Marketing_Anual.csv',
        'transacciones': 'raw/datasets/unidad-1/Transacciones_clientes.csv (filas únicas, DC-01)',
        'clientes': 'raw/datasets/unidad-1/Clientes.csv',
        'identidad': 'raw/datasets/unidad-2/Identidad_resuelta.csv',
        'respuesta': 'raw/Respuestas_Consultas_Entregable_3.md',
    }}

    # ------------------------------------------------------------------ perfilado
    cols_cm = list(cm[0].keys())
    periodos = sorted({x['periodo'] for x in cm})
    cats_cm = sorted({x['categoria'] for x in cm})
    pares = Counter((x['periodo'], x['categoria']) for x in cm)
    ident_mal = 0
    pct_mal = 0
    no_positivos = 0
    for x in cm:
        v, c, g, p = (Decimal(x['ventas_netas_ars']), Decimal(x['cmv_ars']),
                      Decimal(x['margen_bruto_ars']), Decimal(x['margen_bruto_pct']))
        if abs(v - c - g) > Decimal('0.01'):
            ident_mal += 1
        if Decimal(str(pct(g, v, 1))) != p:
            pct_mal += 1
        if v <= 0 or c <= 0 or g <= 0:
            no_positivos += 1
    pcts = [float(x['margen_bruto_pct']) for x in cm]
    cats_tx = sorted({t[col['categoria']] for t in tx})
    out['perfil_costo_margen'] = {
        'filas': len(cm), 'columnas': cols_cm,
        'periodo_min': periodos[0], 'periodo_max': periodos[-1], 'meses': len(periodos),
        'categorias': cats_cm, 'filas_por_categoria': dict(Counter(x['categoria'] for x in cm)),
        'nulos': {k: sum(1 for x in cm if not x[k].strip()) for k in cols_cm},
        'pares_periodo_categoria_repetidos': sum(1 for n in pares.values() if n > 1),
        'filas_ventas_menos_cmv_distinto_de_margen': ident_mal,
        'filas_pct_distinto_de_margen_sobre_ventas': pct_mal,
        'filas_con_monto_no_positivo': no_positivos,
        'margen_pct_fila_min': min(pcts), 'margen_pct_fila_max': max(pcts),
        'categorias_transacciones': cats_tx,
        'categorias_identicas_a_transacciones': cats_cm == cats_tx,
    }
    esperar('filas Costo_Margen', len(cm), 336)
    esperar('meses Costo_Margen', len(periodos), 48)
    esperar('categorías Costo_Margen', len(cats_cm), 7)
    esperar('inconsistencias ventas - CMV = margen', ident_mal, 0)
    esperar('inconsistencias margen %', pct_mal, 0)
    esperar('categorías iguales a Transacciones', cats_cm == cats_tx, True)

    cols_mk = list(mk[0].keys())
    out['perfil_inversion_marketing'] = {
        'filas': len(mk), 'columnas': cols_mk, 'anios': [x['anio'] for x in mk],
        'nulos': {k: sum(1 for x in mk if not x[k].strip()) for k in cols_mk},
    }
    esperar('filas Inversion_Marketing', len(mk), 4)

    # ------------------------------------------------------------------ G01 margen anual
    anio = defaultdict(lambda: [Decimal(0), Decimal(0), Decimal(0)])
    mes = defaultdict(lambda: [Decimal(0), Decimal(0)])
    for x in cm:
        a = anio[x['periodo'][:4]]
        a[0] += Decimal(x['ventas_netas_ars'])
        a[1] += Decimal(x['cmv_ars'])
        a[2] += Decimal(x['margen_bruto_ars'])
        mes[x['periodo']][0] += Decimal(x['ventas_netas_ars'])
        mes[x['periodo']][1] += Decimal(x['margen_bruto_ars'])
    g01 = {
        'margen_bruto_pct': {y: pct(anio[y][2], anio[y][0], 1) for y in ANIOS},
        'margen_bruto_pct_2dec': {y: pct(anio[y][2], anio[y][0], 2) for y in ANIOS},
        'ventas_netas_M': {y: r(anio[y][0] / M, 1) for y in ANIOS},
        'cmv_M': {y: r(anio[y][1] / M, 1) for y in ANIOS},
        'margen_bruto_M': {y: r(anio[y][2] / M, 1) for y in ANIOS},
        # sobre los valores a un decimal que se citan (40,4 y 36,1), para que la resta cierre en el texto
        'caida_2022_2025_pp': r(Decimal(str(pct(anio['2022'][2], anio['2022'][0], 1)))
                                - Decimal(str(pct(anio['2025'][2], anio['2025'][0], 1))), 1),
        'margen_mensual_pct': {p: pct(mes[p][1], mes[p][0], 1) for p in sorted(mes)},
        'margen_mensual_pct_rango_por_anio': {
            y: [min(pct(g, v, 1) for p, (v, g) in mes.items() if p[:4] == y),
                max(pct(g, v, 1) for p, (v, g) in mes.items() if p[:4] == y)] for y in ANIOS},
        'definicion': 'suma de margen_bruto_ars / suma de ventas_netas_ars del año, las 7 categorías',
    }
    out['G01'] = g01
    esperar('G01 margen', g01['margen_bruto_pct'],
            {'2022': 40.4, '2023': 39.5, '2024': 37.6, '2025': 36.1})

    # ------------------------------------------------------------------ G02 margen 2025 por categoría
    cat = defaultdict(lambda: defaultdict(lambda: [Decimal(0), Decimal(0)]))
    for x in cm:
        c = cat[x['periodo'][:4]][x['categoria']]
        c[0] += Decimal(x['ventas_netas_ars'])
        c[1] += Decimal(x['margen_bruto_ars'])
    g02 = {
        'margen_2025_pct': {k: pct(cat['2025'][k][1], cat['2025'][k][0], 1) for k in cats_cm},
        'margen_2022_pct': {k: pct(cat['2022'][k][1], cat['2022'][k][0], 1) for k in cats_cm},
        'ventas_2025_M': {k: r(cat['2025'][k][0] / M, 1) for k in cats_cm},
    }
    v25 = list(g02['margen_2025_pct'].values())
    g02['rango_2025_pp'] = r(Decimal(str(max(v25))) - Decimal(str(min(v25))), 1)
    out['G02'] = g02
    esperar('G02 margen 2025', g02['margen_2025_pct'],
            {'Baño': 36.9, 'Cocina y mesa': 36.0, 'Decoracion': 36.9, 'Iluminacion': 35.5,
             'Muebles': 36.3, 'Organizacion': 36.4, 'Textil hogar': 34.5})

    # ------------------------------------------------------------------ G03 ventas contables y Transacciones
    tx_mes = defaultdict(Decimal)        # neto: todas las filas únicas, devoluciones incluidas
    tx_mes_pos = defaultdict(Decimal)    # base de C14: solo montos positivos
    tx_ops = defaultdict(int)            # operaciones con monto positivo (base de DC-09)
    tx_cat_mes = defaultdict(Decimal)
    for t in tx:
        v = Decimal(t[col['monto_neto']])
        p = t[col['fecha']][:7]
        tx_mes[p] += v
        tx_cat_mes[(p, t[col['categoria']])] += v
        if v > 0:
            tx_mes_pos[p] += v
            tx_ops[p] += 1
    tx_anio = defaultdict(Decimal)
    tx_anio_pos = defaultdict(Decimal)
    for p in tx_mes:
        tx_anio[p[:4]] += tx_mes[p]
        tx_anio_pos[p[:4]] += tx_mes_pos[p]
    dif_mes = {p: pct(mes[p][0] - tx_mes[p], tx_mes[p], 2) for p in periodos}
    dif_cat_mes = [pct(Decimal(x['ventas_netas_ars']) - tx_cat_mes[(x['periodo'], x['categoria'])],
                       tx_cat_mes[(x['periodo'], x['categoria'])], 2) for x in cm]
    total = sum(anio[y][0] for y in ANIOS)
    rel = {}
    for k in range(1, 13):
        a, b = '2025-%02d' % k, '2024-%02d' % k
        rel[a] = {'ventas_contables_pct': pct(mes[a][0], mes[b][0], 1),
                  'operaciones_transacciones_pct': pct(tx_ops[a], tx_ops[b], 1)}
    g03 = {
        'ventas_netas_contables_M': {y: r(anio[y][0] / M, 1) for y in ANIOS},
        'total_M': r(total / M, 1),
        'transacciones_neto_M': {y: r(tx_anio[y] / M, 1) for y in ANIOS},
        'transacciones_neto_total_M': r(sum(tx_anio[y] for y in ANIOS) / M, 1),
        'diferencia_M': {y: r((anio[y][0] - tx_anio[y]) / M, 2) for y in ANIOS},
        'diferencia_pct': {y: pct(anio[y][0] - tx_anio[y], tx_anio[y], 2) for y in ANIOS},
        'diferencia_mensual_pct_min': min(dif_mes.values()),
        'diferencia_mensual_pct_max': max(dif_mes.values()),
        'diferencia_categoria_mes_pct_min': min(dif_cat_mes),
        'diferencia_categoria_mes_pct_max': max(dif_cat_mes),
        'contra_solo_positivas_C14': {
            'transacciones_positivas_M': {y: r(tx_anio_pos[y] / M, 1) for y in ANIOS},
            'diferencia_pct': {y: pct(anio[y][0] - tx_anio_pos[y], tx_anio_pos[y], 2) for y in ANIOS},
        },
        'variacion_2025_2024_pct': pct(anio['2025'][0] - anio['2024'][0], anio['2024'][0], 1),
        'meses_M': {p: r(mes[p][0] / M, 1) for p in ['2024-12', '2025-01', '2025-06', '2025-08',
                                                     '2025-09', '2025-10', '2025-11', '2025-12']},
        'mes_2025_sobre_mismo_mes_2024': rel,
        'meses_2025_bajo_60pct_ventas_contables': [p for p in rel if rel[p]['ventas_contables_pct'] < 60],
        'meses_2025_bajo_60pct_operaciones': [p for p in rel
                                              if rel[p]['operaciones_transacciones_pct'] < 60],
        'definicion': ('ventas_netas_ars sumadas por año contra la suma de monto_neto de las 50.000 filas '
                       'únicas de Transacciones (DC-01), devoluciones incluidas'),
    }
    out['G03'] = g03
    esperar('G03 ventas contables', g03['ventas_netas_contables_M'],
            {'2022': 122.5, '2023': 292.1, '2024': 345.9, '2025': 221.2})
    esperar('G03 total', g03['total_M'], 981.7)
    esperar('G03 meses', {k: g03['meses_M'][k] for k in ['2025-01', '2025-06', '2025-12', '2024-12']},
            {'2025-01': 24.8, '2025-06': 23.1, '2025-12': 6.9, '2024-12': 40.6})
    esperar('G03 filas únicas de Transacciones (DC-01)', (n_crudas, len(tx)), (50250, 50000))
    esperar('D01 neto (981,9 M)', g03['transacciones_neto_total_M'], 981.9)
    esperar('C14 ventas 2024 y 2025 (349,7 y 225,0)', (g03['contra_solo_positivas_C14']
            ['transacciones_positivas_M']['2024'], g03['contra_solo_positivas_C14']
            ['transacciones_positivas_M']['2025']), (349.7, 225.0))
    esperar('DC-09 (sep a dic de 2025 bajo 60 %)', g03['meses_2025_bajo_60pct_operaciones'],
            ['2025-09', '2025-10', '2025-11', '2025-12'])

    # ------------------------------------------------------------------ G04 y G05 marketing
    g04 = {'costo_adquisicion_por_cliente_ars': {}, 'recalculado_ars': {}, 'gasto_adquisicion_M': {}}
    g05 = {'inversion_retencion_M': {}, 'retencion_pct_del_gasto_mkt': {}, 'recalculado_pct': {},
           'gasto_mkt_total_M': {}}
    for x in mk:
        y = x['anio']
        gasto = Decimal(x['gasto_adquisicion_ars'])
        nuevos = int(x['clientes_nuevos'])
        ret = Decimal(x['inversion_retencion_ars'])
        g04['costo_adquisicion_por_cliente_ars'][y] = int(x['costo_adquisicion_por_cliente_ars'])
        g04['recalculado_ars'][y] = int(r(gasto / nuevos, 0))
        g04['gasto_adquisicion_M'][y] = r(gasto / M, 1)
        g05['inversion_retencion_M'][y] = r(ret / M, 2)
        g05['retencion_pct_del_gasto_mkt'][y] = float(x['retencion_pct_del_gasto_mkt'])
        g05['recalculado_pct'][y] = pct(ret, gasto + ret, 1)
        g05['gasto_mkt_total_M'][y] = r((gasto + ret) / M, 1)
    ret24 = Decimal(next(x['inversion_retencion_ars'] for x in mk if x['anio'] == '2024'))
    ret25 = Decimal(next(x['inversion_retencion_ars'] for x in mk if x['anio'] == '2025'))
    g05['variacion_retencion_2025_2024_pct'] = pct(ret25 - ret24, ret24, 1)
    g04['cac_2025_sobre_2022_veces'] = r(Decimal(g04['costo_adquisicion_por_cliente_ars']['2025'])
                                         / Decimal(g04['costo_adquisicion_por_cliente_ars']['2022']), 1)
    g04['definicion'] = 'gasto_adquisicion_ars / clientes_nuevos (la columna del archivo, recalculada)'
    g05['definicion'] = ('inversion_retencion_ars; peso = retención / (adquisición + retención), '
                         'la columna del archivo, recalculada')
    out['G04'] = g04
    out['G05'] = g05
    esperar('G04 CAC del archivo', g04['costo_adquisicion_por_cliente_ars'],
            {'2022': 3337, '2023': 8501, '2024': 11003, '2025': 11099})
    esperar('G04 CAC recalculado', g04['recalculado_ars'], g04['costo_adquisicion_por_cliente_ars'])
    esperar('G05 peso del archivo', g05['retencion_pct_del_gasto_mkt'],
            {'2022': 23.1, '2023': 21.4, '2024': 19.4, '2025': 13.8})
    esperar('G05 peso recalculado', g05['recalculado_pct'], g05['retencion_pct_del_gasto_mkt'])
    esperar('G05 retención', {y: r(Decimal(str(v)), 2) for y, v in g05['inversion_retencion_M'].items()},
            {'2022': 1.47, '2023': 3.51, '2024': 4.15, '2025': 2.66})
    esperar('G05 variación 2025', r(Decimal(str(g05['variacion_retencion_2025_2024_pct'])), 0), -36.0)

    # ------------------------------------------------------------------ G06 tope de descuento
    lineas = ['15% como tope general en acciones de retención.',
              'Hasta 20% solo para clientes de alto valor, en una única compra.',
              'Nunca acumulable con otras promociones vigentes ni con canje de puntos.',
              'En campañas co-financiadas por proveedores, vale lo que se acuerde con cada proveedor.']
    encontradas = [ln for ln in lineas if ln in respuesta]
    out['G06'] = {'tope_general_pct': 15, 'tope_alto_valor_pct': 20,
                  'condiciones': lineas, 'confirmado_por': 'Carlos F. (mail de Casa Óga del 13/10/2026)',
                  'lineas_encontradas_en_raw': len(encontradas)}
    esperar('G06 texto en la respuesta', len(encontradas), 4)

    # ------------------------------------------------------------------ G07 clientes nuevos y altas
    altas = Counter(c['fecha_alta'][:4] for c in clientes.values())
    no_canon = {x['id_cliente'] for x in identidad if x['es_canonico'] == 'False'}
    altas_dup = Counter(clientes[c]['fecha_alta'][:4] for c in no_canon if c in clientes)
    primera = {}
    for t in tx:
        c = t[col['id_cliente']]
        if not c or Decimal(t[col['monto_neto']]) <= 0:
            continue
        f = t[col['fecha']]
        if c not in primera or f < primera[c]:
            primera[c] = f
    primeras_por_anio = Counter(f[:4] for f in primera.values())
    con_compra = {y: [c for c, x in clientes.items() if x['fecha_alta'][:4] == y and c in primera]
                  for y in ANIOS}
    g07 = {
        'clientes_nuevos_marketing': {x['anio']: int(x['clientes_nuevos']) for x in mk},
        'altas_clientes_csv': {y: altas[y] for y in ANIOS},
        'altas_2026': altas.get('2026', 0),
        'diferencia': {x['anio']: int(x['clientes_nuevos']) - altas[x['anio']] for x in mk},
        'altas_duplicadas_identidad': {y: altas_dup.get(y, 0) for y in ANIOS},
        'primeras_compras_identificadas': {y: primeras_por_anio.get(y, 0) for y in ANIOS},
        'altas_con_compra_identificada': {y: len(con_compra[y]) for y in ANIOS},
        'altas_con_primera_compra_antes_del_alta': {
            y: sum(1 for c in con_compra[y] if primera[c] < clientes[c]['fecha_alta']) for y in ANIOS},
        'definicion': ('clientes_nuevos del archivo de marketing contra fecha_alta de Clientes.csv por año; '
                       'duplicadas = registros con es_canonico False en Identidad_resuelta; primera compra = '
                       'primera fila única con id_cliente y monto positivo'),
    }
    out['G07'] = g07
    esperar('G07 clientes nuevos', g07['clientes_nuevos_marketing'],
            {'2022': 1468, '2023': 1512, '2024': 1572, '2025': 1495})
    esperar('G07 diferencia con altas (D06)', g07['diferencia'],
            {'2022': 0, '2023': 0, '2024': 0, '2025': 0})
    esperar('C15 primeras compras 2023 y 2025', (g07['primeras_compras_identificadas']['2023'],
            g07['primeras_compras_identificadas']['2025']), (2647, 111))
    esperar('E10 registros duplicados (todas las altas, 2026 incluido)', sum(altas_dup.values()), 353)

    out['fallas'] = FALLAS
    with open(SALIDA, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write('\n')

    # ------------------------------------------------------------------ impresión
    def fila(nombre, dic, unidad=''):
        print('  %s: %s' % (nombre, ' · '.join('%s %s%s' % (k, v, unidad) for k, v in dic.items())))

    print('Costo_Margen: %d filas, %d meses (%s a %s), %d categorías; identidad contable mal: %d; '
          '%% mal: %d' % (len(cm), len(periodos), periodos[0], periodos[-1], len(cats_cm), ident_mal,
                          pct_mal))
    print('G01 margen bruto anual')
    fila('margen %', g01['margen_bruto_pct'], ' %')
    print('G02 margen 2025 por categoría')
    fila('margen %', g02['margen_2025_pct'], ' %')
    print('G03 ventas netas contables (M) y diferencia con Transacciones')
    fila('contable', g03['ventas_netas_contables_M'], ' M')
    print('  total %s M; diferencia por año %s %%; por mes entre %s %% y %s %%'
          % (g03['total_M'], g03['diferencia_pct'], g03['diferencia_mensual_pct_min'],
             g03['diferencia_mensual_pct_max']))
    fila('meses', g03['meses_M'], ' M')
    print('  2025 bajo 60 %% del mismo mes de 2024 (ventas contables): %s'
          % g03['meses_2025_bajo_60pct_ventas_contables'])
    print('G04 costo de adquisición por cliente (ARS)')
    fila('CAC', g04['costo_adquisicion_por_cliente_ars'])
    print('G05 inversión en retención (M) y peso en el gasto de marketing')
    fila('retención', g05['inversion_retencion_M'], ' M')
    fila('peso', g05['retencion_pct_del_gasto_mkt'], ' %')
    print('  variación 2025 contra 2024: %s %%' % g05['variacion_retencion_2025_2024_pct'])
    print('G06 tope de descuento: %s %% general, hasta %s %% alto valor (%d de 4 líneas en raw)'
          % (out['G06']['tope_general_pct'], out['G06']['tope_alto_valor_pct'], len(encontradas)))
    print('G07 clientes nuevos contra altas de Clientes.csv')
    fila('nuevos', g07['clientes_nuevos_marketing'])
    fila('diferencia', g07['diferencia'])
    fila('altas duplicadas', g07['altas_duplicadas_identidad'])
    fila('primeras compras', g07['primeras_compras_identificadas'])
    fila('altas con compra previa al alta', g07['altas_con_primera_compra_antes_del_alta'])
    print('Salida: %s' % os.path.relpath(SALIDA, VAULT))
    if FALLAS:
        print('\nFALLAS:')
        for x in FALLAS:
            print('  ' + x)
        sys.exit(1)
    print('Todas las cifras coinciden con el registro.')


if __name__ == '__main__':
    main()

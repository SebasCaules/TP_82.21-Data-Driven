# -*- coding: utf-8 -*-
"""Evidencia de la sección 1 de la Parte A del Entregable 3 (factibilidad técnica).

    python3 entregas/entregable-3/_build/A/factibilidad/condiciones.py

Solo lee raw/datasets/ (16 CSV sin tocar: 6 de unidad-1, 8 de unidad-2 y los
dos de unidad-3, que llegaron el 13/10 con la respuesta de Casa Óga) y escribe
salida/condiciones.json. Calcula:

1. inventario: filas y período de cada archivo (tabla 1.4);
2. cruces entre las fuentes principales: qué porción de cada clave no encuentra su
   par en el maestro (condición 2, segunda pregunta guía);
3. nulos en las variables críticas de cada fuente (condición 2, primera pregunta).

Las cifras que ya están en el registro del E2 (C19, D24, E06, E10, E14) se recalculan
acá con la misma base y el script falla si alguna no coincide.
"""
import json
import os

import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__))
VAULT = os.path.abspath(os.path.join(AQUI, '..', '..', '..', '..', '..'))
U1 = os.path.join(VAULT, 'raw', 'datasets', 'unidad-1')
U2 = os.path.join(VAULT, 'raw', 'datasets', 'unidad-2')
U3 = os.path.join(VAULT, 'raw', 'datasets', 'unidad-3')
SALIDA = os.path.join(AQUI, 'salida', 'condiciones.json')


def leer(carpeta, nombre, **kw):
    return pd.read_csv(os.path.join(carpeta, nombre), **kw)


def pct(a, b):
    return round(100.0 * a / b, 2) if b else None


def periodo(serie):
    s = pd.to_datetime(serie, errors='coerce').dropna()
    return [s.min().strftime('%Y-%m-%d'), s.max().strftime('%Y-%m-%d')] if len(s) else None


def cruce(nombre, claves, maestro, descripcion):
    """Porción de `claves` (sin nulos) que no está en `maestro`."""
    c = claves.dropna()
    sin_par = int((~c.isin(set(maestro.dropna()))).sum())
    return {'cruce': nombre, 'descripcion': descripcion, 'filas': int(len(c)),
            'sin_par': sin_par, 'sin_par_pct': pct(sin_par, len(c))}


def main():
    tx = leer(U1, 'Transacciones_clientes.csv')
    cl = leer(U1, 'Clientes.csv')
    fi = leer(U1, 'Fidelizacion.csv')
    ca = leer(U1, 'Campanias_marketing.csv')
    ti = leer(U1, 'Tiendas.csv')
    cal1 = leer(U1, 'Calendario.csv')
    cal2 = leer(U2, 'Calendario.csv')
    so = leer(U2, 'Interacciones_soporte_mensual.csv')
    de = leer(U2, 'Devoluciones.csv')
    ba = leer(U2, 'Historial_Bajas_No_Contacto.csv')
    co = leer(U2, 'Contenido_Campanias.csv')
    ir = leer(U2, 'Identidad_resuelta.csv')
    ac = leer(U2, 'Catalogo_Acciones_Retencion.csv')
    cc = leer(U2, 'Casos_Cualitativos_Clientes.csv')
    cm = leer(U3, 'Costo_Margen_Categoria_Mensual.csv')
    im = leer(U3, 'Inversion_Marketing_Anual.csv')

    # ---------------------------------------------------------------- base de ventas
    tx_u = tx.drop_duplicates()                       # DC-01: dedupe de fila completa
    con_id = tx_u['id_cliente'].notna()
    assert len(tx) == 50250 and len(tx_u) == 50000, 'C20: 50.250 -> 50.000'
    assert int(con_id.sum()) == 27606, 'C20: 27.606 filas con id_cliente'
    sin_id_pct = pct(int((~con_id).sum()), len(tx_u))
    assert round(sin_id_pct, 1) == 44.8, 'C19: 44,8 % sin cliente'

    # ---------------------------------------------------------------- 1. inventario
    inventario = [
        {'archivo': 'Transacciones_clientes.csv', 'filas': len(tx), 'periodo': periodo(tx['fecha'])},
        {'archivo': 'Clientes.csv', 'filas': len(cl), 'periodo': periodo(cl['fecha_alta'])},
        {'archivo': 'Identidad_resuelta.csv', 'filas': len(ir), 'periodo': None},
        {'archivo': 'Campanias_marketing.csv', 'filas': len(ca), 'periodo': periodo(ca['fecha_envio'])},
        {'archivo': 'Interacciones_soporte_mensual.csv', 'filas': len(so), 'periodo': periodo(so['mes'])},
        {'archivo': 'Fidelizacion.csv', 'filas': len(fi), 'periodo': periodo(fi['fecha_inscripcion']),
         'periodo_ultimo_movimiento': periodo(fi['fecha_ultimo_movimiento'])},
        {'archivo': 'Devoluciones.csv', 'filas': len(de), 'periodo': periodo(de['fecha_devolucion'])},
        {'archivo': 'Historial_Bajas_No_Contacto.csv', 'filas': len(ba), 'periodo': periodo(ba['fecha_solicitud'])},
        {'archivo': 'Calendario.csv (unidad 2)', 'filas': len(cal2), 'periodo': periodo(cal2['fecha'])},
        {'archivo': 'Calendario.csv (unidad 1)', 'filas': len(cal1), 'periodo': periodo(cal1['fecha'])},
        {'archivo': 'Tiendas.csv', 'filas': len(ti), 'periodo': periodo(ti['fecha_apertura'])},
        {'archivo': 'Contenido_Campanias.csv', 'filas': len(co), 'periodo': periodo(co['fecha_envio'])},
        {'archivo': 'Catalogo_Acciones_Retencion.csv', 'filas': len(ac), 'periodo': None,
         'costo_min_ars': float(ac['costo_unitario_ars'].min()),
         'costo_max_ars': float(ac['costo_unitario_ars'].max()),
         'costo_mediana_ars': float(ac['costo_unitario_ars'].median())},
        {'archivo': 'Casos_Cualitativos_Clientes.csv', 'filas': len(cc),
         'periodo': [periodo(cc['primera_compra'])[0], periodo(cc['ultima_compra'])[1]]},
        {'archivo': 'Costo_Margen_Categoria_Mensual.csv', 'filas': len(cm), 'periodo': periodo(cm['periodo'])},
        {'archivo': 'Inversion_Marketing_Anual.csv', 'filas': len(im),
         'periodo': [f"{im['anio'].min()}-01-01", f"{im['anio'].max()}-12-31"]},
    ]
    assert len(cm) == 336 and len(im) == 4, 'G03: 336 filas mes x categoría; G05: 4 años'

    # margen bruto ponderado por año (G01), para el falso negativo del 2.4
    cm['anio'] = cm['periodo'].str[:4]
    por_anio = cm.groupby('anio')[['ventas_netas_ars', 'margen_bruto_ars']].sum()
    margen = {a: round(float(r['margen_bruto_ars'] / r['ventas_netas_ars']), 4) for a, r in por_anio.iterrows()}
    assert [round(100 * margen[a], 1) for a in ('2022', '2023', '2024', '2025')] == [40.4, 39.5, 37.6, 36.1], 'G01'

    # ---------------------------------------------------------------- 2. cruces
    ca_u = ca.drop_duplicates('id_envio')             # DC-?: 200 id_envio repetidos (D15)
    assert len(ca_u) == 23529, 'D15: 23.529 envíos únicos'
    fisico = tx_u['canal'].str.lower().isin(['tienda'])
    cl_tienda = cl[cl['canal_alta'].str.lower().isin(['tienda', 'sucursal'])]
    cruces = [
        cruce('ventas -> clientes', tx_u.loc[con_id, 'id_cliente'], cl['id_cliente'],
              'id_cliente de las ventas únicas con cliente contra Clientes.csv'),
        cruce('ventas -> tiendas', tx_u.loc[fisico, 'id_tienda'], ti['id_tienda'],
              'id_tienda de las ventas de tienda contra Tiendas.csv'),
        cruce('campañas -> clientes', ca_u['id_cliente'], cl['id_cliente'],
              'id_cliente de los envíos únicos contra Clientes.csv'),
        cruce('campañas -> contenido', ca_u['id_campania'], co['id_campania'],
              'id_campania de los envíos únicos contra Contenido_Campanias.csv'),
        cruce('fidelización -> clientes', fi['id_cliente'], cl['id_cliente'],
              'socios contra Clientes.csv'),
        cruce('soporte -> clientes', so['id_cliente'], cl['id_cliente'],
              'filas cliente-mes de soporte contra Clientes.csv'),
        cruce('devoluciones -> ventas', de['id_transaccion'], tx['id_transaccion'],
              'id_transaccion de cada devolución contra Transacciones'),
        cruce('bajas -> clientes', ba['id_cliente'], cl['id_cliente'],
              'pedidos de no contacto contra Clientes.csv'),
        cruce('alta en tienda -> tiendas', cl_tienda['tienda_alta'], ti['id_tienda'],
              'tienda_alta de los clientes dados de alta en tienda contra Tiendas.csv'),
    ]
    # campañas con dos filas en Contenido_Campanias (join N:1 roto, E06)
    dup_camp = co['id_campania'][co['id_campania'].duplicated()].unique().tolist()
    envios_join_roto = int(ca_u['id_campania'].isin(dup_camp).sum())
    assert envios_join_roto == 915, 'E06: 915 envíos con el join roto'
    # personas con más de un id (Identidad_resuelta, E10)
    alias = int((~ir['es_canonico']).sum())
    personas = int(ir['id_cliente_canonico'].nunique())
    assert len(ir) == 665 and personas == 312, 'E10: 312 personas, 665 registros'
    assert alias == 353, 'E10: 353 registros duplicados'

    # ---------------------------------------------------------------- 3. nulos críticos
    edad_nula = int(cl['edad'].isna().sum())
    nulos = {
        'ventas_sin_cliente_pct': sin_id_pct,
        'ventas_sin_cliente_filas': int((~con_id).sum()),
        'ventas_unicas': int(len(tx_u)),
        'clientes_edad_nula': edad_nula,
        'clientes_edad_nula_pct': pct(edad_nula, len(cl)),
        'clientes_genero_nulo_pct': pct(int(cl['genero'].isna().sum()), len(cl)),
        'fidelizacion_sin_ultimo_movimiento': int(fi['fecha_ultimo_movimiento'].isna().sum()),
        'devoluciones_sin_cliente': int(de['id_cliente'].isna().sum()),
    }
    assert edad_nula == 524, 'D24: 524 edades nulas'
    assert nulos['fidelizacion_sin_ultimo_movimiento'] == 475, 'D24: 475 sin fecha de movimiento'
    assert nulos['devoluciones_sin_cliente'] == 280, 'E09: 280 devoluciones sin cliente'

    salida = {
        'inventario': inventario,
        'cruces': cruces,
        'join_roto': {'campanias_duplicadas': dup_camp, 'envios_afectados': envios_join_roto,
                      'envios_unicos': int(len(ca_u)), 'pct': pct(envios_join_roto, len(ca_u))},
        'identidad': {'registros': int(len(ir)), 'personas': personas, 'alias': alias,
                      'alias_pct_clientes': pct(alias, len(cl))},
        'nulos': nulos,
        'margen_bruto_anual': margen,
    }
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    with open(SALIDA, 'w', encoding='utf-8') as f:
        json.dump(salida, f, ensure_ascii=False, indent=2)

    print('Inventario')
    for r in inventario:
        print(f"  {r['archivo']:36s} {r['filas']:>7,d}  {r['periodo']}")
    print('Cruces (sin par)')
    for r in cruces:
        print(f"  {r['cruce']:28s} {r['sin_par']:>6,d} de {r['filas']:>7,d}  {r['sin_par_pct']} %")
    print('Join roto campañas:', salida['join_roto'])
    print('Identidad:', salida['identidad'])
    print('Nulos:', nulos)
    print('->', os.path.relpath(SALIDA, VAULT))


if __name__ == '__main__':
    main()

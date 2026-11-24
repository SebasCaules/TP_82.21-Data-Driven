"""
Factibilidad económica del Entregable 3, Parte B: valor en dinero de la matriz de confusión
(4.4), estructura de costos (3.2), beneficios (3.3), ROI por escenario (3.4), sensibilidad (3.5),
umbral de viabilidad y tipo de cambio de equilibrio (3.6).

Desde la v3.0 de la Parte B (24/11/2026, devolución del E3, filas 2.1 a 3.6 y 11): piloto mínimo (G64),
producción completa (G65), operación mínima (G66), umbral de pase del piloto (G67), lo que ve el piloto (G68),
valor de la información (G69), calendario desde la aprobación (G63) y el rango anual por validación cruzada
temporal (E3A-01 a E3A-05, con cv_temporal.py de esta carpeta). Contrato: canon v1.0 de la corrida
«presentación final»; cálculo de origen en .workforce/presentacion-final/fase-2/econ/memo_calc.py.

Uso:    python3 -I entregas/entregable-3/_build/B/economia/economia.py
Salida: salida/economia.json (filas G30 a G56, G58 a G69 y E3A-01 a E3A-05 del registro de cifras),
        salida/costos_beneficios_roi.csv (la planilla de la 4.6) y salida/cv_temporal.json.

Lee, sin modificarlos:
- _build/B/modelado/salida/etapa2.json       matrices de la lista de 500 (G19, G20, G27) e intervalo (G17)
- _build/B/datos/margen_marketing.json       costo de adquisición e inversión en retención (G04, G05)
- _build/A/factibilidad/salida/condiciones.json   margen bruto anual (G01) con cuatro decimales
- _build/A/modelado/dataset/churn_cliente_corte_v0.2.csv.gz, con comun.cargar y comun.sin_reservadas
  (test y test_flag se descartan al cargar y no se usan)
- _build/C/modelado/salida/etapa3.json      pliegues de la C 7.1 y lista de contactables, para cv_temporal.py (E3A)
- _build/D/modelado/salida/etapa4.json      ROI de test (J12), solo para
  las filas «8.2 test (Parte D)» de la planilla; no entra a economia.json
- raw/: Transacciones_clientes.csv, Campanias_marketing.csv, Identidad_resuelta.csv,
  Catalogo_Acciones_Retencion.csv y Respuestas_Consultas_Entregable_3.md (tope de descuento)

Sale con código 1 si una cifra de entrada no coincide con su fila del registro.
"""
from __future__ import annotations

import csv
import json
import math
import sys
from pathlib import Path
from statistics import NormalDist

import numpy as np
import pandas as pd

AQUI = Path(__file__).resolve().parent
B = AQUI.parent
MOD_A = B.parent / "A" / "modelado"
sys.path.insert(0, str(MOD_A))
import comun  # noqa: E402

VAULT = comun.RAIZ
RAW = VAULT / "raw"
ETAPA2 = B / "modelado" / "salida" / "etapa2.json"
MARGEN_MKT = B / "datos" / "margen_marketing.json"
CONDICIONES = B.parent / "A" / "factibilidad" / "salida" / "condiciones.json"
ETAPA4 = B.parent / "D" / "modelado" / "salida" / "etapa4.json"   # solo para las filas de test de la planilla
SALIDA = AQUI / "salida"

FALLAS: list[str] = []


def esperar(nombre, obtenido, esperado, tol=0.0):
    if (isinstance(esperado, float) and abs(obtenido - esperado) > tol) or \
       (not isinstance(esperado, float) and obtenido != esperado):
        FALLAS.append(f"{nombre}: obtenido {obtenido!r}, registrado {esperado!r}")


def es(x, d=0):
    """Número con punto de miles y coma decimal, para los textos de la planilla."""
    t = f"{x:,.{d}f}"
    return t.replace(",", "§").replace(".", ",").replace("§", ".")


def wilson(k: int, n: int, z: float = 1.959964) -> tuple[float, float]:
    p = k / n
    c = p + z * z / (2 * n)
    m = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    d = 1 + z * z / n
    return (c - m) / d, (c + m) / d


# ============================================================ supuestos externos y del equipo

# G30. Tipo de cambio de referencia del BCRA (Comunicación A 3500), serie «Tipo de cambio mayorista
# de referencia», variable 5 de la API de estadísticas monetarias v4.0 (api.bcra.gob.ar), consultada
# el 13/10/2026. El 30/12/2025 es el último dato de 2025 y coincide con el corte de los datos.
TC_BASE = 1459.4167          # ARS por USD, 30/12/2025
TC_2024 = 1032.50            # ARS por USD, 30/12/2024
TC_2022 = 177.1283           # ARS por USD, 30/12/2022

# G37. Tarifas de referencia: son las del ejemplo «Rentabilidad en Tienda» de la clase 11
# (láminas 7 y 9). No son cotizaciones para Casa Óga.
TARIFA_DS_MES = 4000.0       # data scientist senior, USD por mes (lámina 9)
TARIFA_SEMANA = 1500.0       # data engineer o analista, USD por semana (lámina 7)
HORAS_SEMANA = 40
TARIFA_HORA = TARIFA_SEMANA / HORAS_SEMANA       # 37,5 USD por hora
TALLER = 900.0               # USD por taller de capacitación (lámina 7)
NUBE_MES = 100.0             # USD por mes de nube (lámina 9)
SOPORTE_MES = 200.0          # USD por mes de soporte y reentrenamiento (lámina 9)

# Supuestos del equipo (G37, G38)
MESES_DS_PROYECTO = 3        # el piso del template (3 a 4 meses): pipeline y etapas 1 y 2 ya existen
MESES_DS_MVP = 1             # la regla ya está escrita (etapa 1): falta empaquetarla con la planilla
SEMANAS_ETL = 2
SEMANAS_LIMPIEZA = 1
TALLERES = 2
HORAS_OPERADOR_MES = 8       # una jornada por mes: control de completitud, corrida, revisión y envío
CONTINGENCIA = 0.15

# Supuestos del valor por celda (G31 a G35)
ACCION_BASE = "ACC03"        # WhatsApp con oferta personalizada
DESCUENTO = 0.15             # tope general de G06
DESCUENTO_ALTO = 0.20        # tope para alto valor, una compra (G06)
CORTES_VALIDACION = 3
LISTAS_POR_ANIO = 12
ANUALIZAR = LISTAS_POR_ANIO / CORTES_VALIDACION  # 4
HORIZONTE = 1                # años; la fórmula del template

# G48. Adecuación legal que hace el equipo (acciones L3 a L5 de la Parte C, 5.4), en horas a la tarifa
# de G37. L1, L2 y L6 las hace Casa Óga con su asesor legal y quedan fuera de los USD 30.000 (USD 0).
HORAS_LEGAL = {
    "L3": (8, "filtro obligatorio de acepta_marketing y pidio_baja en la planilla mensual, con su prueba"),
    "L4": (4, "acuerdo de confidencialidad entre el equipo y Casa Óga"),
    "L5": (8, "política de retención y borrado de los extractos y las listas del proyecto"),
}

# G49. Piloto con grupo de control (C24; decisión del equipo del 20/10 sobre el envío 45). Diseño de la
# fase W9 (03/11; cambios 144, 145 y 147, decisiones DG2 y DG3): tres listas mensuales de 500 contactables
# (la lista que sale, filtro L3: G56, H16). El 20 % de mayor facturación (G50) se contacta entero y se
# reporta aparte. El control se sortea al azar, cada mes, entre los clientes de la lista que no están en ese
# 20 %; el resto de esos clientes se reparte en dos ramas iguales, con 15 % de descuento y sin descuento.
# Decide el cruce del umbral a 90 días (contactados contra control); la compra a 7 días es señal temprana.
# Control: 100 por mes. Con 80 (el diseño anterior) el efecto mínimo detectable de cada rama a 90 días
# (10,12 puntos) queda arriba de la referencia de G62 de la rama sin descuento (9,92): no alcanza. Con 100
# baja a 9,63 (ver `piloto.control_80_no_alcanza`).
PILOTO_MESES = 3
PILOTO_CONTROL_MES = 100
PILOTO_CONTROL_MES_ANTERIOR = 80
HORAS_PILOTO_EQUIPO = {"diseño del sorteo del control y de las dos ramas, y del registro de resultados": 8,
                       "medición de cada lista, compra a 7 días y cruce a 90 días por rama y control, 4 h por lista":
                       4 * PILOTO_MESES,
                       "informes del piloto, preliminar (semana 20) y final (semana 28), 6 h cada uno": 12}
HORAS_PILOTO_OPERADOR = 1 * PILOTO_MESES + 1   # separar control y ramas en cada corrida y una hora de puesta en marcha
ALFA, POTENCIA = 0.05, 0.80
# Calendario del plan de la Parte D (J50, G63). Desde la v3.0 (canon v1.0, D6): la semana 1 empieza el lunes
# siguiente a la aprobación escrita de María G.; fechas de referencia si aprueba con la entrega del 24/11/2026:
# semana 1 del lunes 30/11 al domingo 06/12/2026. La primera lista sale en la semana 6 y la tercera en la 14;
# informe preliminar en la semana 20 (no decide) y decisión en la 28. Hasta la v2.0: semana 1 = 02/11/2026.
SEMANA_1 = "2026-11-30"
SEM_PRIMERA_LISTA, SEM_TERCERA_LISTA = 6, 14
SEM_PRELIMINAR, SEM_FINAL = 20, 28
SEM_FIN_PILOTO = 18          # el tercer mes del piloto cierra en la semana 18 (J50)
SEMANAS_ANIO = 52

# G50. Cliente de alto valor (G06): el 20 % de mayor facturación, el quintil superior del E1. En el
# dataset, el 20 % de mayor `monetary` (facturación acumulada hasta el corte) de cada corte.
ALTO_VALOR = 0.20


# ============================================================ entradas

e2 = json.loads(ETAPA2.read_text(encoding="utf-8"))
mm = json.loads(MARGEN_MKT.read_text(encoding="utf-8"))
co = json.loads(CONDICIONES.read_text(encoding="utf-8"))

MOD = e2["mejor"]["matrices"]["mejor_lista_500"]["total"]
REG = e2["mejor"]["matrices"]["regla_lista_500"]["total"]
CLF = e2["mejor"]["matrices"]["regla_como_clasificador"]["total"]
CR = e2["mejor"]["contra_regla"]
PE = e2["perdida_esperada"]                              # G27: lista por pérdida esperada
PEM = PE["lista_500"]["confusion"]["total"]
FA_VP = {k: v["vp"] for k, v in PE["facturacion_anualizada_en_lista_500"].items()}
esperar("G27", (PEM["vp"], PEM["fp"], PEM["fn"], PEM["vn"]), (1178.0, 322.0, 535.0, 5138.0))
esperar("G19", (MOD["vp"], MOD["fp"], MOD["fn"], MOD["vn"]), (1237.0, 263.0, 476.0, 5197.0))
esperar("G20 vp", round(REG["vp"], 2), 1223.67)
esperar("G20 fp", round(REG["fp"], 2), 276.33)
esperar("G21", (CLF["vp"], CLF["fp"], CLF["fn"], CLF["vn"]), (1713, 540, 0, 4920))
esperar("G17 dif", round(CR["diferencia_aciertos"], 2), 13.33)
LARGO = MOD["largo"]                                    # 1.500 contactos en validación
IC_LO, IC_HI = CR["bootstrap"]["ic95"]                  # diferencia de precisión, fracción
esperar("G17 ic", (round(IC_LO * 100, 2), round(IC_HI * 100, 2)), (-0.21, 1.91))

MARGEN = {a: float(v) for a, v in co["margen_bruto_anual"].items()}   # 0,3758 en 2024 (G01)
esperar("G01 2024", MARGEN["2024"], 0.3758)
CAC_2025 = mm["G04"]["costo_adquisicion_por_cliente_ars"]["2025"]
esperar("G04 2025", CAC_2025, 11099)
RET_2025_M = mm["G05"]["inversion_retencion_M"]["2025"]
esperar("G05 2025", RET_2025_M, 2.66)
inv = pd.read_csv(RAW / "datasets" / "unidad-3" / "Inversion_Marketing_Anual.csv")
RET_2025 = float(inv.loc[inv["anio"] == 2025, "inversion_retencion_ars"].iloc[0])     # 2.655.000

# Ventas: D07 (ticket medio) y D27 (facturación media por cliente activo identificado, 2024)
tx = pd.read_csv(RAW / "datasets" / "unidad-1" / "Transacciones_clientes.csv",
                 parse_dates=["fecha"]).drop_duplicates()
ventas = tx[tx["monto_neto"] > 0]
TICKET = float(ventas["monto_neto"].mean())
esperar("D07", round(TICKET), 20133)
fac24 = ventas[ventas["id_cliente"].notna() & (ventas["fecha"].dt.year == 2024)] \
    .groupby("id_cliente")["monto_neto"].sum()
FAC_2024 = float(fac24.mean())
esperar("D27", round(FAC_2024), 40664)
FAC_2024_REG = 40664                                     # la cifra entera de D27, como en la A
M_BASE = FAC_2024_REG * MARGEN["2024"]                   # G08
esperar("G08", round(M_BASE), 15282)
# G51 (pendiente 49): D27 y G08 cuentan por registro de cliente (id_cliente). Por persona unificada
# (id_cliente_canonico, la unidad del target) son menos clientes y cada uno factura más.
idr_ = pd.read_csv(RAW / "datasets" / "unidad-2" / "Identidad_resuelta.csv")
_v24 = ventas[ventas["id_cliente"].notna() & (ventas["fecha"].dt.year == 2024)].copy()
_v24["canon"] = _v24["id_cliente"].map(dict(zip(idr_["id_cliente"], idr_["id_cliente_canonico"]))) \
    .fillna(_v24["id_cliente"])
fac24_can = _v24.groupby("canon")["monto_neto"].sum()
N_CAN_2024 = int(len(fac24_can))
FAC_2024_CAN = round(float(fac24_can.mean()))             # 42.731, entero como D27
esperar("G51 personas", N_CAN_2024, 4525)
esperar("G51 facturación", FAC_2024_CAN, 42731)
M_CANON = FAC_2024_CAN * MARGEN["2024"]                   # mismo factor que G08

# Catálogo de acciones (F13)
cat = pd.read_csv(RAW / "datasets" / "unidad-2" / "Catalogo_Acciones_Retencion.csv")
COSTO = dict(zip(cat["id_accion"], cat["costo_unitario_ars"].astype(float)))
esperar("F13", (min(COSTO.values()), max(COSTO.values())), (8.0, 900.0))
C_ACC = COSTO[ACCION_BASE]
esperar("ACC03", C_ACC, 25.0)

# Tope de descuento (G06): el texto tiene que estar en la respuesta de Casa Óga
resp = (RAW / "Respuestas_Consultas_Entregable_3.md").read_text(encoding="utf-8")
for linea in ("15% como tope general", "Hasta 20% solo para clientes de alto valor, en una única compra"):
    if linea not in resp:
        FALLAS.append(f"G06: falta «{linea}» en la respuesta del 13/10")

# Campañas: compra a 7 días y apertura en envíos a clientes cerca del umbral (G31, G32)
camp = pd.read_csv(RAW / "datasets" / "unidad-1" / "Campanias_marketing.csv",
                   parse_dates=["fecha_envio"]).drop_duplicates()          # DC-05
esperar("C16 envíos", len(camp), 23529)
esperar("C16 compras", int(camp["compra_7dias"].sum()), 284)
idr = pd.read_csv(RAW / "datasets" / "unidad-2" / "Identidad_resuelta.csv")
canon = dict(zip(idr["id_cliente"], idr["id_cliente_canonico"]))
camp["id_cliente_canonico"] = camp["id_cliente"].map(canon).fillna(camp["id_cliente"])
camp["corte"] = (camp["fecha_envio"] - pd.offsets.MonthEnd(1)).dt.normalize()   # último fin de mes anterior

df = comun.sin_reservadas(comun.cargar(comun.DATASET_V02))
cruce = camp.merge(df[["id_cliente_canonico", "corte", "dias_para_cruzar", "particion", comun.TARGET]],
                   on=["id_cliente_canonico", "corte"], how="inner")
cerca = cruce[cruce["dias_para_cruzar"] < comun.HORIZONTE_DIAS]
N_ENV = int(len(cerca))
K_COMPRA = int(cerca["compra_7dias"].sum())
K_ABRE = int(cerca["abierto"].sum())
S_BASE = K_COMPRA / N_ENV
S_LO, S_HI = wilson(K_COMPRA, N_ENV)
# r (G31): la parte de los falsos positivos que usa el descuento, en la misma ventana que s. La oferta
# vale 7 días (supuesto de G32): un falso positivo usa el descuento si compra en esa semana. Se mide
# en los envíos cerca del umbral a clientes que no cruzaron (y = 0), los que serían falsos positivos.
# Si la oferta valiera hasta la próxima compra, lo usaría todo el que la ve: la apertura (3.5).
no_cruzan = cerca[cerca[comun.TARGET] == 0]
N_ENV_FP = int(len(no_cruzan))
K_COMPRA_FP = int(no_cruzan["compra_7dias"].sum())
K_ABRE_FP = int(no_cruzan["abierto"].sum())
R_BASE = K_COMPRA_FP / N_ENV_FP
R_APERTURA = K_ABRE_FP / N_ENV_FP
# G52 (pendiente 50): s se mide sobre todos los envíos cerca del umbral, también los 408 a clientes que
# no cruzan. Sobre los que cruzan (los que serían VP) la compra a 7 días es algo mayor.
cruzan = cerca[cerca[comun.TARGET] == 1]
N_ENV_VP = int(len(cruzan))
K_COMPRA_VP = int(cruzan["compra_7dias"].sum())
S_CRUZAN = K_COMPRA_VP / N_ENV_VP
esperar("G52", (N_ENV_VP, K_COMPRA_VP), (1162, 13))
por_canal = cerca.groupby("canal_campania")["compra_7dias"].agg(["count", "sum"]).astype(int)
# DC-14 (pendiente 5): la tasa por acción, con el canal de la campaña como acción del catálogo
# (Email = ACC01, SMS = ACC02, WhatsApp = ACC03; teléfono y envío gratis no tienen envíos)
por_canal_todos = camp.groupby("canal_campania")["compra_7dias"].agg(["count", "sum"]).astype(int)

# Valor por caso optimista (G32): facturación 2024 media de los clientes activos identificados con tres
# compras o más hasta el 31/12/2024, los únicos que pueden estar en la lista (C02), por el margen de 2024.
compras = ventas[ventas["id_cliente"].notna() & (ventas["fecha"] <= "2024-12-31")].groupby("id_cliente").size()
elegibles = set(compras[compras >= 3].index)
fac24_eleg = fac24[fac24.index.isin(elegibles)]
N_ELEG_2024 = int(len(fac24_eleg))
FAC_ELEG_2024 = float(fac24_eleg.mean())
M_OPT = FAC_ELEG_2024 * MARGEN["2024"]
M_CONS = TICKET * MARGEN["2024"]                         # el margen de una compra

# G50 (pendiente 55): parte de la lista de la regla, en validación, que es de alto valor (el 20 % de
# mayor facturación acumulada de su corte), entre los VP y entre los FP. Los empates del borde de la
# lista pesan en proporción, como en comun.aciertos_esperados.
dev = df[df["particion"] == "dev"].copy()
dev["alto"] = dev.groupby("corte")["monetary"].rank(pct=True, method="average") > 1 - ALTO_VALOR
dev["w"] = 0.0
for _, g in dev.groupby("corte"):
    puntaje = -g["dias_para_cruzar"].to_numpy()
    borde = np.sort(puntaje)[::-1][comun.CAPACIDAD - 1]
    arriba, empate = puntaje > borde, puntaje == borde
    w = arriba.astype(float) + empate * (comun.CAPACIDAD - arriba.sum()) / empate.sum()
    dev.loc[g.index, "w"] = w
_y = dev[comun.TARGET]
W_VP, W_FP = float((dev["w"] * _y).sum()), float((dev["w"] * (1 - _y)).sum())
esperar("G50 control con G20", round(W_VP, 2), round(REG["vp"], 2))
HA_VP = float((dev["w"] * _y * dev["alto"]).sum()) / W_VP
HA_FP = float((dev["w"] * (1 - _y) * dev["alto"]).sum()) / W_FP
HA_LISTA = float((dev["w"] * dev["alto"]).sum()) / (W_VP + W_FP)

# Piloto (G49, G61): la lista de 500 de la regla armada solo con contactables (acepta_marketing y sin pedido
# de baja al corte, filtro L3), la misma de H16 y G56, en los tres cortes de validación. El alto valor se fija
# sobre todo el corte (G50), antes de filtrar. Los empates del borde pesan en proporción.
devc = dev[dev["acepta_marketing"].astype(bool) & ~dev["pidio_baja"].astype(bool)].copy()
devc["w"] = 0.0
for _, g in devc.groupby("corte"):
    puntaje = -g["dias_para_cruzar"].to_numpy()
    borde = np.sort(puntaje)[::-1][comun.CAPACIDAD - 1]
    arriba, empate = puntaje > borde, puntaje == borde
    devc.loc[g.index, "w"] = arriba.astype(float) + empate * (comun.CAPACIDAD - arriba.sum()) / empate.sum()
_yc, _ac = devc[comun.TARGET], devc["alto"]
CT = {"largo": float(devc["w"].sum()), "vp": float((devc["w"] * _yc).sum()),
      "alto": float((devc["w"] * _ac).sum()), "vp_alto": float((devc["w"] * _yc * _ac).sum()),
      "fuera": float((devc["w"] * ~_ac).sum()), "vp_fuera": float((devc["w"] * _yc * ~_ac).sum())}
CT["fp"] = CT["largo"] - CT["vp"]
esperar("H16 lista de contactables", (round(CT["largo"], 2), round(CT["vp"], 2)), (1500.0, 1137.0))

if FALLAS:
    print("Fallan los controles de entrada:")
    for f in FALLAS:
        print("  -", f)
    sys.exit(1)


# ============================================================ 4.4: valor por celda

def valores(s, m, r, d=DESCUENTO, c=C_ACC, t=TICKET):
    """Valor unitario en ARS de cada celda, frente a no hacer nada. VP: con probabilidad s el cliente
    vuelve, compra con el descuento y deja el margen m; siempre se paga la acción. FP: el cliente iba a
    comprar igual; se paga la acción y, si usa el descuento (r), se le regala d sobre una compra. FN y
    VN: 0, porque no se actúa (el margen que pierde un FN se pierde igual sin proyecto)."""
    return {"vp": s * (m - d * t) - c, "fp": -c - r * d * t, "fn": 0.0, "vn": 0.0}


def neto(mat, v):
    return sum(mat[k] * v[k] for k in ("vp", "fp", "fn", "vn"))


def usd(ars, tc=TC_BASE):
    return ars / tc


V_BASE = valores(S_BASE, M_BASE, R_BASE)
VAL_MOD = neto(MOD, V_BASE)
VAL_REG = neto(REG, V_BASE)
VAL_INC = VAL_MOD - VAL_REG
VAL_CLF = neto(CLF, V_BASE)
FN_PERDIDO = {"modelo": MOD["fn"] * M_BASE, "regla": REG["fn"] * M_BASE}
# techo: el incremental del modelo si todo verdadero positivo contactado volviera (s = 1)
V_TECHO = valores(1.0, M_BASE, R_BASE)
TECHO_INC_ANUAL = (neto(MOD, V_TECHO) - neto(REG, V_TECHO)) * ANUALIZAR

# G47: la lista por pérdida esperada (G27) en la cuenta de la 4.4. Con los mismos valores unitarios
# (margen medio G08 para todos) y con el margen propio de cada cliente: facturación anualizada al
# corte por el margen de 2024, sumada sobre los VP de cada lista (etapa2.json).
VAL_PE = neto(PEM, V_BASE)


def neto_margen_propio(mat, fa_vp, s=S_BASE, r=R_BASE, d=DESCUENTO, c=C_ACC, t=TICKET):
    """Valor de la lista con el margen de cada cliente que vuelve en lugar del medio."""
    return s * (MARGEN["2024"] * fa_vp - mat["vp"] * d * t) - mat["vp"] * c - mat["fp"] * (c + r * d * t)


PROPIO = {"perdida_esperada": neto_margen_propio(PEM, FA_VP["perdida_esperada"]),
          "modelo": neto_margen_propio(MOD, FA_VP[e2["mejor"]["modelo"]]),
          "regla": neto_margen_propio(REG, FA_VP["regla_umbral"])}


# ============================================================ 3.2: costos

def costos(meses_ds, nube=True):
    unicos = [
        ("Consultor / Data Scientist senior", "Desarrollo", "Modelo", meses_ds * TARIFA_DS_MES,
         f"{meses_ds} {'mes' if meses_ds == 1 else 'meses'} × USD {es(TARIFA_DS_MES)}"),
        ("Sprint de integración / ETL", "Desarrollo", "Brecha técnica", SEMANAS_ETL * TARIFA_SEMANA,
         f"{SEMANAS_ETL} semanas × USD {es(TARIFA_SEMANA)}"),
        ("Limpieza de datos maestros", "Desarrollo", "Brecha técnica", SEMANAS_LIMPIEZA * TARIFA_SEMANA,
         f"{SEMANAS_LIMPIEZA} semana × USD {es(TARIFA_SEMANA)}"),
        ("Capacitación usuarios clave", "Change Mgmt", "Adopción", TALLERES * TALLER,
         f"{TALLERES} talleres × USD {es(TALLER)}"),
        ("Adecuación legal del equipo (L3 a L5)", "Legal", "Brecha legal",
         sum(h for h, _ in HORAS_LEGAL.values()) * TARIFA_HORA,
         f"{sum(h for h, _ in HORAS_LEGAL.values())} h × USD {es(TARIFA_HORA, 2)}"),
        ("Adecuación legal de Casa Óga (L1, L2, L6)", "Legal", "Brecha legal", 0.0,
         "Casa Óga y su asesor legal, fuera de los USD 30.000"),
        ("Piloto con grupo de control (3 meses)", "Desarrollo", "Piloto",
         (sum(HORAS_PILOTO_EQUIPO.values()) + HORAS_PILOTO_OPERADOR) * TARIFA_HORA,
         f"{sum(HORAS_PILOTO_EQUIPO.values())} h + {HORAS_PILOTO_OPERADOR} h del equipo × USD {es(TARIFA_HORA, 2)}"),
    ]
    recurrentes = [
        ("Operador de la lista mensual (envío 71)", "Desarrollo", "Brecha técnica",
         HORAS_OPERADOR_MES * 12 * TARIFA_HORA, f"{HORAS_OPERADOR_MES} h/mes × 12 × USD {es(TARIFA_HORA, 2)}"),
        ("Soporte y reentrenamiento", "Desarrollo", "Modelo", SOPORTE_MES * 12, f"USD {es(SOPORTE_MES)}/mes"),
        ("Infraestructura cloud / BD", "Infra", "Modelo", NUBE_MES * 12 if nube else 0.0,
         f"USD {es(NUBE_MES)}/mes" if nube else "computadora de Casa Óga (A 1.6)"),
        ("Licencias BI (Power BI Pro x5)", "Licencia", "Modelo", 0.0, "sin licencias (A 1.6; envío 12)"),
    ]
    suma_unicos = sum(x[3] for x in unicos)
    cont = CONTINGENCIA * suma_unicos
    inicial = suma_unicos + cont
    recurrente = sum(x[3] for x in recurrentes)
    return {
        "unicos": [dict(zip(("componente", "tipo", "origen", "usd", "calculo"), x)) for x in unicos],
        "recurrentes": [dict(zip(("componente", "tipo", "origen", "usd_anual", "calculo"), x)) for x in recurrentes],
        "suma_unicos": suma_unicos, "contingencia": cont, "inversion_inicial": inicial,
        "recurrente_anual": recurrente, "total_anio_1": inicial + recurrente,
        "recurrente_sobre_inicial": recurrente / inicial,
        "presupuesto_C28": 30000.0, "margen_contra_presupuesto": 30000.0 - (inicial + recurrente),
    }


CP = costos(MESES_DS_PROYECTO, nube=True)
CM = costos(MESES_DS_MVP, nube=False)


def costo_total(cst, h=HORIZONTE, etl_extra=0.0):
    inicial = cst["inversion_inicial"] + etl_extra * (1 + CONTINGENCIA)
    return inicial + h * cst["recurrente_anual"]


# ============================================================ 3.3 y 3.4: beneficio, ROI, payback

def inc_anual(s, m, r, dif_pp=None, d=DESCUENTO, adopcion=1.0):
    """Incremental anual del modelo sobre la regla, en ARS. Mismo largo de lista: cada acierto de más
    es un falso positivo de menos, y el costo de las acciones es el mismo en las dos."""
    v = valores(s, m, r, d)
    dvp = (CR["diferencia_aciertos"] if dif_pp is None else dif_pp * LARGO)
    return adopcion * ANUALIZAR * dvp * (v["vp"] - v["fp"])


def regla_anual(s, m, r, d=DESCUENTO, c=C_ACC):
    """Valor neto anual de contactar la lista de la regla, frente a no contactar, en ARS."""
    return ANUALIZAR * neto(REG, valores(s, m, r, d, c))


def roi(b_usd, c_usd):
    return (b_usd - c_usd) / c_usd * 100


def payback(b_usd, c_usd, h=HORIZONTE):
    """Template: costo total / beneficio anual × 12; «no recupera» si en el horizonte el beneficio
    no cubre el costo."""
    if b_usd <= 0 or h * b_usd < c_usd:
        return "no recupera"
    return round(c_usd / b_usd * 12, 1)


ESC = {
    "conservador": {"s": S_LO, "m": M_CONS, "dif_pp": IC_LO,
                    "diferencial": "tasa de éxito en el límite inferior del intervalo; el margen de una compra; "
                                   "la logística en el límite inferior de su diferencia con la regla"},
    "esperado": {"s": S_BASE, "m": M_BASE, "dif_pp": CR["diferencia_aciertos"] / LARGO,
                 "diferencial": "tasa de compra a 7 días cerca del umbral; margen anual medio (G08); "
                                "+0,89 puntos sobre la regla (G17)"},
    "optimista": {"s": S_HI, "m": M_OPT, "dif_pp": IC_HI,
                  "diferencial": "tasa de éxito en el límite superior; margen anual de los clientes con tres compras o más; "
                                 "la logística en el límite superior"},
}
def costo_incremental(h=HORIZONTE, etl_extra=0.0):
    """Lo que el modelo agrega al costo de la regla: los meses de data scientist de más (con su
    contingencia) y la nube. Integración, limpieza, capacitación, operador y soporte los necesita
    también la regla, así que no entran."""
    return costo_total(CP, h, etl_extra) - costo_total(CM, h, etl_extra)


C_PROY = costo_total(CP)
C_MVP = costo_total(CM)
C_INC = costo_incremental()
escenarios = {}
for nombre, e in ESC.items():
    b = usd(inc_anual(e["s"], e["m"], R_BASE, e["dif_pp"]))
    bm = usd(regla_anual(e["s"], e["m"], R_BASE))
    bm0 = usd(regla_anual(e["s"], e["m"], 0.0, d=0.0))
    escenarios[nombre] = {
        "s": e["s"], "m_ars": e["m"], "dif_pp": e["dif_pp"] * 100, "diferencial": e["diferencial"],
        "proyecto": {"beneficio_usd": b, "costo_usd": C_INC, "roi_pct": roi(b, C_INC),
                     "payback_meses": payback(b, C_INC)},
        "proyecto_completo": {"beneficio_usd": bm + b, "costo_usd": C_PROY, "roi_pct": roi(bm + b, C_PROY),
                              "payback_meses": payback(bm + b, C_PROY)},
        "mvp_con_descuento": {"beneficio_usd": bm, "costo_usd": C_MVP, "roi_pct": roi(bm, C_MVP),
                              "payback_meses": payback(bm, C_MVP)},
        "mvp_sin_descuento": {"beneficio_usd": bm0, "costo_usd": C_MVP, "roi_pct": roi(bm0, C_MVP),
                              "payback_meses": payback(bm0, C_MVP)},
    }
B_BASE_ARS = inc_anual(S_BASE, M_BASE, R_BASE)
B_BASE = usd(B_BASE_ARS)
ROI_BASE = roi(B_BASE, C_INC)
B_COMPLETO_ARS = regla_anual(S_BASE, M_BASE, R_BASE) + B_BASE_ARS     # modelo frente a no contactar


# ============================================================ 3.5: sensibilidad (esperado, una variable por vez)

def roi_proy(s=S_BASE, m=M_BASE, r=R_BASE, dif_pp=None, d=DESCUENTO, adopcion=1.0,
             tc=TC_BASE, h=HORIZONTE, etl_extra=0.0):
    """ROI del modelo sobre la regla: beneficio incremental contra costo incremental."""
    b = inc_anual(s, m, r, dif_pp, d, adopcion) / tc
    c = costo_incremental(h, etl_extra)
    return (h * b - c) / c * 100


def roi_mvp(s=S_BASE, m=M_BASE, r=R_BASE, d=DESCUENTO, adopcion=1.0, tc=TC_BASE, h=HORIZONTE,
            etl_extra=0.0):
    b = adopcion * regla_anual(s, m, r, d) / tc
    c = costo_total(CM, h, etl_extra)
    return (h * b - c) / c * 100


def roi_alto(cual):
    """ROI con 20 % de descuento para los clientes de alto valor de la lista y 15 % para el resto (G50):
    el descuento medio de los VP y de los FP sale de la composición de la lista de la regla."""
    d_vp = DESCUENTO + (DESCUENTO_ALTO - DESCUENTO) * HA_VP
    d_fp = DESCUENTO + (DESCUENTO_ALTO - DESCUENTO) * HA_FP
    v = {"vp": S_BASE * (M_BASE - d_vp * TICKET) - C_ACC, "fp": -C_ACC - R_BASE * d_fp * TICKET,
         "fn": 0.0, "vn": 0.0}
    if cual == "proyecto":
        b = ANUALIZAR * CR["diferencia_aciertos"] * (v["vp"] - v["fp"]) / TC_BASE
        return roi(b, C_INC)
    return roi(ANUALIZAR * neto(REG, v) / TC_BASE, C_MVP)


m_2025 = FAC_2024_REG * MARGEN["2025"]
ETL = SEMANAS_ETL * TARIFA_SEMANA
sens = [
    ("% de adopción del modelo por parte de los usuarios", "100 % de la lista contactada", "50 %",
     roi_proy(adopcion=0.5), roi_mvp(adopcion=0.5)),
    ("Beneficio por caso corregido", "margen anual medio (G08)", "el margen de una compra",
     roi_proy(m=M_CONS), roi_mvp(m=M_CONS)),
    ("Desempeño del modelo (casos detectados / precisión)", "+0,89 puntos sobre la regla",
     "−0,21 puntos (límite inferior)", roi_proy(dif_pp=IC_LO), None),
    ("Costo de integración técnica", "ETL de 2 semanas", "el doble",
     roi_proy(etl_extra=ETL), roi_mvp(etl_extra=ETL)),
    ("Tasa de éxito de la acción", "compra a 7 días cerca del umbral", "límite inferior del intervalo",
     roi_proy(s=S_LO), roi_mvp(s=S_LO)),
    ("Falsos positivos que usan el descuento", "compra a 7 días de los que no cruzan (oferta de 7 días)",
     "apertura: la oferta vale hasta la próxima compra", roi_proy(r=R_APERTURA), roi_mvp(r=R_APERTURA)),
    ("Margen bruto", "2024", "2025", roi_proy(m=m_2025), roi_mvp(m=m_2025)),
    ("Descuento de la oferta", "15 %", "sin descuento (a favor)", roi_proy(r=0.0, d=0.0), roi_mvp(r=0.0, d=0.0)),
    ("Descuento de la oferta", "15 %", "20 % a los clientes de alto valor de la lista (el 20 % de mayor "
     "facturación, G50), 15 % al resto", roi_alto("proyecto"), roi_alto("mvp")),
    ("Margen que vuelve con un cliente", "por registro de cliente (G08)",
     "por persona unificada, id_cliente_canonico (G51; a favor)", roi_proy(m=M_CANON), roi_mvp(m=M_CANON)),
    ("Tasa de éxito de la acción", "compra a 7 días cerca del umbral (G31)",
     "compra a 7 días de los que cruzan el umbral (G52; a favor)", roi_proy(s=S_CRUZAN), roi_mvp(s=S_CRUZAN)),
    ("Tipo de cambio", "30/12/2025", "30/12/2024, el año de los montos (a favor)",
     roi_proy(tc=TC_2024), roi_mvp(tc=TC_2024)),
    ("Tipo de cambio", "30/12/2025", "30/12/2022 (a favor)", roi_proy(tc=TC_2022), roi_mvp(tc=TC_2022)),
    ("Horizonte de evaluación", "1 año", "3 años (a favor)", roi_proy(h=3), roi_mvp(h=3)),
]
ROI_MVP_BASE = roi_mvp()
sensibilidad = [{"variable": v, "base": b_, "probado": a_, "roi_proyecto_pct": x, "roi_mvp_pct": y,
                 "roi_base_proyecto_pct": ROI_BASE, "roi_base_mvp_pct": ROI_MVP_BASE,
                 "viable_proyecto": x > 0, "viable_mvp": None if y is None else y > 0}
                for v, b_, a_, x, y in sens]


# ============================================================ 3.6: umbral y tipo de cambio de equilibrio

def s_equilibrio_mvp(tc, r, d, h=HORIZONTE):
    """Tasa de éxito con la que el ROI del MVP da 0: h × valor anual de la lista = costo del horizonte."""
    c_ars = costo_total(CM, h) * tc
    vp, fp = REG["vp"] * ANUALIZAR, REG["fp"] * ANUALIZAR
    fijo = vp * C_ACC + fp * (C_ACC + r * d * TICKET)
    return (c_ars / h + fijo) / (vp * (M_BASE - d * TICKET))


def tc_equilibrio(b_ars_anual, c_usd):
    """ARS por USD con el que el ROI a un año da 0; no existe si el beneficio en pesos no es positivo."""
    return None if b_ars_anual <= 0 else b_ars_anual / c_usd


umbral = {
    "proyecto_techo_incremental_usd": usd(TECHO_INC_ANUAL),
    "proyecto_roi_con_exito_100_pct": roi(usd(TECHO_INC_ANUAL), C_INC),
    "mvp_s_equilibrio_con_descuento": s_equilibrio_mvp(TC_BASE, R_BASE, DESCUENTO),
    "mvp_s_equilibrio_sin_descuento": s_equilibrio_mvp(TC_BASE, 0.0, 0.0),
    "mvp_s_equilibrio_sin_descuento_tc_2022": s_equilibrio_mvp(TC_2022, 0.0, 0.0),
    "mvp_s_equilibrio_sin_descuento_3_anios": s_equilibrio_mvp(TC_BASE, 0.0, 0.0, h=3),
    "veces_la_tasa_base": s_equilibrio_mvp(TC_BASE, 0.0, 0.0) / S_BASE,
    "veces_la_tasa_base_con_descuento": s_equilibrio_mvp(TC_BASE, R_BASE, DESCUENTO) / S_BASE,
}
tc_eq = {
    "proyecto": tc_equilibrio(B_BASE_ARS, C_INC),
    "proyecto_completo": tc_equilibrio(B_COMPLETO_ARS, C_PROY),
    "mvp_con_descuento": tc_equilibrio(regla_anual(S_BASE, M_BASE, R_BASE), C_MVP),
    "mvp_sin_descuento": tc_equilibrio(regla_anual(S_BASE, M_BASE, 0.0, d=0.0), C_MVP),
}

# G46: mejora mínima del modelo sobre la regla (A v1.1, 1.6: «la Parte B fija esa diferencia»). Un punto
# de precisión de la lista son 15 aciertos en los tres cortes de validación (G17); cada acierto de más
# es un falso positivo de menos, y vale v_VP − v_FP. Llevado a un año (× 4) y a dólares.
ACIERTOS_POR_PUNTO = LARGO / 100


def valor_punto_usd(s=S_BASE):
    v = valores(s, M_BASE, R_BASE)
    return ACIERTOS_POR_PUNTO * ANUALIZAR * (v["vp"] - v["fp"]) / TC_BASE


MAX_PP = (1 - REG["vp"] / LARGO) * 100                 # de la precisión de la regla a una lista perfecta
mejora_minima = {
    "aciertos_por_punto": ACIERTOS_POR_PUNTO,
    "valor_por_punto_usd_anual": valor_punto_usd(),
    "puntos_para_pagar_costo_incremental": C_INC / valor_punto_usd(),
    "maximo_posible_pp": MAX_PP,
    "valor_del_maximo_usd_anual": MAX_PP * valor_punto_usd(),
    "mejora_observada_pp": CR["diferencia_precision_pp"],
    "con_exito_100": {"valor_por_punto_usd_anual": valor_punto_usd(1.0),
                      "puntos_para_pagar_costo_incremental": C_INC / valor_punto_usd(1.0),
                      "valor_del_maximo_usd_anual": MAX_PP * valor_punto_usd(1.0)},
}

# Retener contra reemplazar (3.1, dimensión 2; pendiente 34): costo de las acciones de un año de
# listas de la regla dividido por los clientes que vuelven.
exitos = REG["vp"] * ANUALIZAR * S_BASE
costo_acciones = {
    "con_descuento": ANUALIZAR * (LARGO * C_ACC + REG["vp"] * S_BASE * DESCUENTO * TICKET
                                  + REG["fp"] * R_BASE * DESCUENTO * TICKET),
    "sin_descuento": ANUALIZAR * LARGO * C_ACC,
}
retener = {
    "clientes_que_vuelven_por_anio": exitos,
    "costo_acciones_anual_ars": costo_acciones,
    "costo_por_cliente_retenido_ars": {k: v / exitos for k, v in costo_acciones.items()},
    "cac_2025_ars": CAC_2025,
    "acciones_sobre_retencion_2025_pct": {k: v / RET_2025 * 100 for k, v in costo_acciones.items()},
}


# ============================================================ piloto con grupo de control (G49) y meta del criterio 1 (G53)

def mde_desigual(p0, n1, n2, alpha=ALFA, potencia=POTENCIA):
    """MDE entre dos grupos de tamaño distinto (dos proporciones, dos colas), por bisección; la misma
    función que da C24b en entregas/entregable-1/_build/F/recalc_e1.py."""
    za, zb = NormalDist().inv_cdf(1 - alpha / 2), NormalDist().inv_cdf(potencia)
    lo, hi = 1e-9, 1 - p0
    for _ in range(200):
        mid = (lo + hi) / 2
        p1 = p0 + mid
        pbar = (n1 * p0 + n2 * p1) / (n1 + n2)
        se0 = math.sqrt(pbar * (1 - pbar) * (1 / n1 + 1 / n2))
        se1 = math.sqrt(p0 * (1 - p0) / n1 + p1 * (1 - p1) / n2)
        if NormalDist().cdf((mid - za * se0) / se1) < potencia:
            lo = mid
        else:
            hi = mid
    return 100 * hi


P0_C16 = float(camp["compra_7dias"].mean())             # 1,21 % sobre los 23.529 envíos (C16)
esperar("C24b control", round(mde_desigual(P0_C16, 1080, 240), 2), 2.95)
esperar("G49 anterior (1.260 contra 240)", round(mde_desigual(P0_C16, 1260, 240), 2), 2.87)
CONTROL = PILOTO_CONTROL_MES * PILOTO_MESES                          # 300
TRATADOS = comun.CAPACIDAD * PILOTO_MESES - CONTROL                  # 1.200 contactados
# Composición esperada de las tres listas de contactables (validación, CT): el 20 % de mayor facturación se
# contacta entero; fuera de él salen el control y las dos ramas. Son valores esperados por lista media.
ALTO_PIL = CT["alto"]                                                # 446,67 en tres meses
FUERA_PIL = CT["fuera"]                                              # 1.053,33
TRAT_FUERA = FUERA_PIL - CONTROL                                     # 753,33
POR_RAMA = TRAT_FUERA / 2                                            # 376,67
P_CRUCE_CTRL = CT["vp_fuera"] / CT["fuera"]                          # 77,4 %: cruce a 90 días sin contacto
P_CRUCE_ALTO = CT["vp_alto"] / CT["alto"]                            # 72,0 %
# Mismo orden de argumentos que C24b y el G49 anterior: tratados primero, control después. Para el cruce a 90
# días la base es la parte del control que no cruza; el contacto la sube (o, lo mismo, baja el cruce).
P0_NO_CRUCE = 1 - P_CRUCE_CTRL


def mdes(control, fuera=FUERA_PIL):
    tf = fuera - control
    rama = tf / 2
    return {"tratados_fuera_del_20": tf, "por_rama": rama,
            "cruce_90d": {"por_rama_contra_control_pp": mde_desigual(P0_NO_CRUCE, rama, control),
                          "entre_ramas_pp": mde_desigual(P0_NO_CRUCE, rama, rama),
                          "ramas_juntas_contra_control_pp": mde_desigual(P0_NO_CRUCE, tf, control)},
            "compra_7d": {"por_rama_contra_control_pp": mde_desigual(P0_C16, rama, control),
                          "entre_ramas_pp": mde_desigual(P0_C16, rama, rama),
                          "ramas_juntas_contra_control_pp": mde_desigual(P0_C16, tf, control)}}


MDE_PIL = mdes(CONTROL)
MDE_80 = mdes(PILOTO_CONTROL_MES_ANTERIOR * PILOTO_MESES)
# (03/11, W9-11, V5 H1) La convención de arriba ancla la tasa base en la rama. Con el control en p0 (argumentos
# invertidos) cambian dos décimas y ninguna conclusión: el A1.11 lo declara con estos valores.
MDE_INV = {"por_rama_contra_control_pp": mde_desigual(P0_NO_CRUCE, CONTROL, POR_RAMA),
           "ramas_juntas_contra_control_pp": mde_desigual(P0_NO_CRUCE, CONTROL, TRAT_FUERA),
           "por_rama_con_80_de_control_pp": mde_desigual(
               P0_NO_CRUCE, PILOTO_CONTROL_MES_ANTERIOR * PILOTO_MESES,
               (FUERA_PIL - PILOTO_CONTROL_MES_ANTERIOR * PILOTO_MESES) / 2)}
esperar("G61 con el control en p0, por rama", round(MDE_INV["por_rama_contra_control_pp"], 2), 9.68)
esperar("G61 con el control en p0, ramas juntas", round(MDE_INV["ramas_juntas_contra_control_pp"], 2), 8.53)
esperar("G61 con el control en p0, 80 de control", round(MDE_INV["por_rama_con_80_de_control_pp"], 2), 10.24)


# costo esperado de una acción con 15 % de descuento sobre un contactado, con la composición de VP y FP de su
# parte de la lista (G31, G32): la acción siempre, el descuento si vuelve (s) o si lo usa sin necesitarlo (r)
def costo_con_descuento(fvp):
    return C_ACC + (fvp * S_BASE + (1 - fvp) * R_BASE) * DESCUENTO * TICKET


COSTO_ALTO = costo_con_descuento(P_CRUCE_ALTO)       # el 20 % de mayor facturación recibe la oferta base (15 %)
COSTO_RAMA_DESC = costo_con_descuento(P_CRUCE_CTRL)
COSTO_RAMA_SIN = C_ACC
ACC_PIL = {"alto_valor_15_pct": ALTO_PIL * COSTO_ALTO, "rama_con_descuento": POR_RAMA * COSTO_RAMA_DESC,
           "rama_sin_descuento": POR_RAMA * COSTO_RAMA_SIN}
ACC_PIL_ARS = sum(ACC_PIL.values())
COSTO_TRATADO = ACC_PIL_ARS / TRATADOS                # medio por contactado


# ---------------------------------------------- referencia de G62 en la métrica de decisión (cambio 146)
def s_equilibrio(vp3, fp3, costo_usd, r, d, tc=TC_BASE):
    """Tasa de éxito con la que un año de listas paga costo_usd (la fórmula de s_equilibrio_mvp, con la
    matriz de tres cortes que se pase y el costo que se pase)."""
    vp, fp = vp3 * ANUALIZAR, fp3 * ANUALIZAR
    fijo = vp * C_ACC + fp * (C_ACC + r * d * TICKET)
    return (costo_usd * tc + fijo) / (vp * (M_BASE - d * TICKET))


assert abs(s_equilibrio(REG["vp"], REG["fp"], costo_total(CM), R_BASE, DESCUENTO)
           - s_equilibrio_mvp(TC_BASE, R_BASE, DESCUENTO)) < 1e-12
REC_MVP = CM["recurrente_anual"]                      # USD 6.000 por año (G39): operador y soporte
S_EQ_C = {   # sobre la lista de 500 contactables (la que sale): recurrente y primer año, con y sin descuento
    "recurrente_con_descuento": s_equilibrio(CT["vp"], CT["fp"], REC_MVP, R_BASE, DESCUENTO),
    "recurrente_sin_descuento": s_equilibrio(CT["vp"], CT["fp"], REC_MVP, 0.0, 0.0),
    "primer_anio_con_descuento": s_equilibrio(CT["vp"], CT["fp"], costo_total(CM), R_BASE, DESCUENTO),
    "primer_anio_sin_descuento": s_equilibrio(CT["vp"], CT["fp"], costo_total(CM), 0.0, 0.0),
}
# En el modelo de la B el contacto cambia solo a los que se iban a ir: de ellos vuelve una parte s. En el
# control cruza el 77,4 %; en una rama, el 77,4 % × (1 − s). La diferencia de cruce a 90 días, control menos
# contactados, es s × 77,4 %. La misma cuenta que daba 40,4 (H49: s × precisión de toda la lista).
DIF = {k: v * P_CRUCE_CTRL * 100 for k, v in S_EQ_C.items()}
DIF_ESPERADA = S_BASE * P_CRUCE_CTRL * 100            # con la tasa observada (G31)
DIF_40_4 = s_equilibrio_mvp(TC_BASE, R_BASE, DESCUENTO) * REG["vp"] / LARGO * 100   # 40,4 (H49)
esperar("H49 40,4", round(DIF_40_4, 1), 40.4)
_mr = MDE_PIL["cruce_90d"]["por_rama_contra_control_pp"]
_mr80 = MDE_80["cruce_90d"]["por_rama_contra_control_pp"]
assert _mr < DIF["recurrente_sin_descuento"] < DIF["recurrente_con_descuento"], "el control no alcanza"
assert _mr80 > DIF["recurrente_sin_descuento"]        # por eso el control pasó de 80 a 100 por mes


# ---------------------------------------------- calendario (G63, cambio 145)
def lunes(semana):
    return pd.Timestamp(SEMANA_1) + pd.Timedelta(weeks=semana - 1)


def semana_de(fecha):
    return (pd.Timestamp(fecha) - pd.Timestamp(SEMANA_1)).days // 7 + 1


CORTE_TERCERA = (lunes(SEM_TERCERA_LISTA) - pd.offsets.MonthEnd(1)).normalize()    # 28/02/2027
CIERRE_90_TERCERA = CORTE_TERCERA + pd.Timedelta(days=comun.HORIZONTE_DIAS)        # 29/05/2027
CORTE_PRIMERA = (lunes(SEM_PRIMERA_LISTA) - pd.offsets.MonthEnd(1)).normalize()    # 31/12/2026
CIERRE_90_PRIMERA = CORTE_PRIMERA + pd.Timedelta(days=comun.HORIZONTE_DIAS)        # 31/03/2027
# la primera lista sale dentro de las dos semanas posteriores a su corte (canon, calendario de referencia)
PRIMERA_LISTA_HASTA = CORTE_PRIMERA + pd.Timedelta(days=14)                        # 14/01/2027
assert lunes(1) == pd.Timestamp("2026-11-30") and lunes(1).dayofweek == 0
assert lunes(SEM_PRIMERA_LISTA) == pd.Timestamp("2027-01-04") and PRIMERA_LISTA_HASTA == pd.Timestamp("2027-01-14")
assert lunes(SEM_TERCERA_LISTA) == pd.Timestamp("2027-03-01") and CORTE_TERCERA == pd.Timestamp("2027-02-28")
assert CIERRE_90_PRIMERA == pd.Timestamp("2027-03-31") and semana_de(CIERRE_90_PRIMERA) == 18
assert CIERRE_90_TERCERA == pd.Timestamp("2027-05-29") and semana_de(CIERRE_90_TERCERA) == 26
assert lunes(SEM_PRELIMINAR) == pd.Timestamp("2027-04-12")
assert lunes(SEM_FINAL) == pd.Timestamp("2027-06-07") and lunes(SEM_FINAL).dayofweek == 0
assert semana_de(CIERRE_90_PRIMERA) < SEM_PRELIMINAR < semana_de(CIERRE_90_TERCERA) < SEM_FINAL
SEMANAS_ESPERA = SEM_FINAL - SEM_FIN_PILOTO            # 19 a 28: 10 semanas
# Desde la v3.0 (canon): después de la tercera lista la lista queda en pausa hasta la decisión, sin costo
# recurrente. Hasta la v2.0 se contaba el recurrente de la producción (USD 6.000 × 10 / 52 = 1.153,85); queda
# como referencia de lo que costaría si siguiera la producción completa durante la espera.
REC_ESPERA_SI_SIGUIERA = REC_MVP * SEMANAS_ESPERA / SEMANAS_ANIO
REC_ESPERA = 0.0

# Valores fijados en el registro (fase W9, 03/11): G49, G61, G62, G63
esperar("G49 composición", (round(ALTO_PIL, 2), round(FUERA_PIL, 2), round(POR_RAMA, 2)), (446.67, 1053.33, 376.67))
esperar("G49 acciones", round(ACC_PIL_ARS), 53538)
esperar("G49 señal 7 días", tuple(round(MDE_PIL["compra_7d"][k], 2) for k in
        ("ramas_juntas_contra_control_pp", "por_rama_contra_control_pp", "entre_ramas_pp")), (2.91, 3.66, 3.43))
esperar("G61 p0", round(P_CRUCE_CTRL * 100, 2), 77.41)
esperar("G61 90 días", tuple(round(MDE_PIL["cruce_90d"][k], 2) for k in
        ("por_rama_contra_control_pp", "entre_ramas_pp", "ramas_juntas_contra_control_pp")), (9.63, 9.06, 8.38))
esperar("G61 con 80", round(_mr80, 2), 10.12)
esperar("G62", tuple(round(DIF[k], 2) for k in ("recurrente_con_descuento", "recurrente_sin_descuento",
        "primer_anio_con_descuento", "primer_anio_sin_descuento")), (12.41, 9.92, 41.29, 33.1))
esperar("G62 esperada", round(DIF_ESPERADA, 2), 0.79)
esperar("G63", (SEMANAS_ESPERA, round(REC_ESPERA, 2), round(REC_ESPERA_SI_SIGUIERA, 2)), (10, 0.0, 1153.85))
esperar("G63 fechas", tuple(str(x.date()) for x in (lunes(1), lunes(SEM_PRIMERA_LISTA), PRIMERA_LISTA_HASTA,
        CIERRE_90_PRIMERA, lunes(SEM_TERCERA_LISTA), CIERRE_90_TERCERA, lunes(SEM_PRELIMINAR), lunes(SEM_FINAL))),
        ("2026-11-30", "2027-01-04", "2027-01-14", "2027-03-31", "2027-03-01", "2027-05-29", "2027-04-12",
         "2027-06-07"))

piloto = {
    "meses": PILOTO_MESES, "lista_mes": comun.CAPACIDAD, "control_mes": PILOTO_CONTROL_MES,
    "tratados": TRATADOS, "control": CONTROL,
    "horas_equipo": HORAS_PILOTO_EQUIPO, "horas_operador": HORAS_PILOTO_OPERADOR,
    "costo_horas_usd": (sum(HORAS_PILOTO_EQUIPO.values()) + HORAS_PILOTO_OPERADOR) * TARIFA_HORA,
    "costo_por_tratado_ars": COSTO_TRATADO,
    "acciones_marketing_ars": ACC_PIL_ARS, "acciones_marketing_usd": usd(ACC_PIL_ARS),
    "p0_compra_7d": P0_C16,
    # mde_pp: la señal temprana, compra a 7 días de las dos ramas juntas contra el control (era 2,87 con 1.260
    # tratados contra 240, todos los contactados)
    "mde_pp": MDE_PIL["compra_7d"]["ramas_juntas_contra_control_pp"],
    "lista": "500 contactables por mes (filtro L3; H16, G56)",
    "poblacion": {"alto_valor_contactado": ALTO_PIL, "fuera_del_20": FUERA_PIL,
                  "tratados_fuera_del_20": TRAT_FUERA, "por_rama": POR_RAMA,
                  "por_mes": {"alto_valor": ALTO_PIL / PILOTO_MESES, "control": PILOTO_CONTROL_MES,
                              "por_rama": POR_RAMA / PILOTO_MESES},
                  "alto_valor_en_la_lista": ALTO_PIL / CT["largo"]},
    "ramas": {"con_descuento": {"descuento": DESCUENTO, "contactados": POR_RAMA,
                                "costo_por_contactado_ars": COSTO_RAMA_DESC,
                                "acciones_ars": ACC_PIL["rama_con_descuento"]},
              "sin_descuento": {"descuento": 0.0, "contactados": POR_RAMA,
                                "costo_por_contactado_ars": COSTO_RAMA_SIN,
                                "acciones_ars": ACC_PIL["rama_sin_descuento"]},
              "alto_valor": {"descuento": DESCUENTO, "contactados": ALTO_PIL,
                             "costo_por_contactado_ars": COSTO_ALTO,
                             "acciones_ars": ACC_PIL["alto_valor_15_pct"]}},
    "metrica_decision": {
        "que": "cruce del umbral a 90 días, control menos contactados, fuera del 20 % de mayor facturación",
        "p0_cruce_90d_control": P_CRUCE_CTRL, "p0_cruce_90d_alto_valor": P_CRUCE_ALTO,
        "mde": MDE_PIL,
        "mde_con_el_control_en_p0": MDE_INV,
    },
    "control_80_no_alcanza": {"control_mes": PILOTO_CONTROL_MES_ANTERIOR, "mde": MDE_80,
                              "umbral_recurrente_sin_descuento_pp": DIF["recurrente_sin_descuento"]},
    "umbral_produccion": {
        "s_equilibrio": S_EQ_C,
        "diferencia_cruce_90d_pp": DIF,
        "costo_recurrente_usd_anual": REC_MVP, "costo_primer_anio_usd": costo_total(CM),
        "diferencia_esperada_tasa_observada_pp": DIF_ESPERADA,
        "h49_40_4_escala_anterior_pp": DIF_40_4,
    },
    "calendario": {
        "semana_1": SEMANA_1, "semana_1_hasta": str((lunes(1) + pd.Timedelta(days=6)).date()),
        "regla": "la semana 1 empieza el lunes siguiente a la aprobación escrita de María G.; fechas de referencia "
                 "si aprueba con la entrega del 24/11/2026",
        "primera_lista": {"semana": SEM_PRIMERA_LISTA, "lunes": str(lunes(SEM_PRIMERA_LISTA).date()),
                          "corte": str(CORTE_PRIMERA.date()), "hasta": str(PRIMERA_LISTA_HASTA.date())},
        "tercera_lista": {"semana": SEM_TERCERA_LISTA, "lunes": str(lunes(SEM_TERCERA_LISTA).date()),
                          "corte": str(CORTE_TERCERA.date()), "cierre_90d": str(CIERRE_90_TERCERA.date()),
                          "semana_cierre_90d": semana_de(CIERRE_90_TERCERA)},
        "primera_lista_cierre_90d": {"fecha": str(CIERRE_90_PRIMERA.date()), "semana": semana_de(CIERRE_90_PRIMERA)},
        "preliminar": {"semana": SEM_PRELIMINAR, "lunes": str(lunes(SEM_PRELIMINAR).date())},
        "final": {"semana": SEM_FINAL, "lunes": str(lunes(SEM_FINAL).date())},
        "semanas_19_a_28": SEMANAS_ESPERA,
        "recurrente_semanas_19_a_28_usd": REC_ESPERA,
        "recurrente_semanas_19_a_28_si_siguiera_la_completa_usd": REC_ESPERA_SI_SIGUIERA,
    },
}

# ============================================================ 3.3 a 3.5: valores de equilibrio (G58 a G60, cambios 149, 153, 154)

B_REGLA_ARS = regla_anual(S_BASE, M_BASE, R_BASE)          # USD 299,49 por año en dólares (G41)
B_REGLA = usd(B_REGLA_ARS)


def m_equilibrio_mvp(tc=TC_BASE, s=S_BASE, r=R_BASE, d=DESCUENTO):
    """Margen que vuelve con un cliente (ARS por año) con el que la regla da ROI 0 a un año."""
    vp, fp = REG["vp"] * ANUALIZAR, REG["fp"] * ANUALIZAR
    return (costo_total(CM) * tc + vp * C_ACC + fp * (C_ACC + r * d * TICKET)) / (vp * s) + d * TICKET


def m_equilibrio_proyecto(tc=TC_BASE, s=S_BASE, r=R_BASE, d=DESCUENTO):
    """Margen con el que el modelo sobre la regla da ROI 0: diferencia × 4 × (v_VP − v_FP) = costo incremental."""
    dvp = CR["diferencia_aciertos"] * ANUALIZAR
    return (C_INC * tc / dvp - r * d * TICKET) / s + d * TICKET


M_EQ = m_equilibrio_mvp()
M_EQ_PROY = m_equilibrio_proyecto()
_v_eq = valores(S_BASE, M_EQ, R_BASE)
assert abs(ANUALIZAR * neto(REG, _v_eq) / TC_BASE - costo_total(CM)) < 1e-6
assert abs(roi_proy(m=M_EQ_PROY)) < 1e-9
# G60: horas por mes de Marketing reasignadas, a la tarifa del analista (G37), que dejan la regla en ROI 0 a un año
H_EQ_MES = (costo_total(CM) - B_REGLA) / TARIFA_HORA / 12
assert abs(roi(B_REGLA + H_EQ_MES * 12 * TARIFA_HORA, C_MVP)) < 1e-9
# G58: cuántas veces el costo de mantener la regla (su recurrente, G39) supera lo que deja por año (G41)
VECES_REC = REC_MVP / B_REGLA
esperar("G58 recurrente de la regla", REC_MVP, 6000.0)
esperar("G58 operador + soporte", (CM["recurrentes"][0]["usd_anual"], CM["recurrentes"][1]["usd_anual"],
                                   CM["recurrentes"][2]["usd_anual"]), (3600.0, 2400.0, 0.0))

# Equilibrio de la regla en cada fila de la 3.5, donde existe dentro del rango de la variable. None: ningún
# valor posible de la variable deja el ROI en 0 (se dice cuánto haría falta cuando hay una cuenta).
ADOP_EQ = costo_total(CM) / B_REGLA                         # 67,6: 6.765 % de adopción
MARGEN_EQ = M_EQ / FAC_2024_REG                             # margen bruto sobre la facturación que haría falta
S_EQ_DESC = umbral["mvp_s_equilibrio_con_descuento"]
S_EQ_SIN = umbral["mvp_s_equilibrio_sin_descuento"]
TC_EQ_REGLA = tc_eq["mvp_con_descuento"]
ROI_REGLA_R0 = roi_mvp(r=0.0)
ROI_REGLA_H_INF = (B_REGLA - REC_MVP) / REC_MVP * 100       # límite del ROI con horizonte infinito: −95,0 %
EQ_FILAS = [
    (None, "no existe: haría falta " + es(ADOP_EQ * 100, 0) + " % de la lista", ADOP_EQ, "veces la lista"),
    (M_EQ, "ARS " + es(M_EQ, 0) + " de margen por cliente que vuelve (" + es(M_EQ / M_BASE, 1) + " veces G08)",
     M_EQ, "ARS por año"),
    (None, "no aplica a la regla", None, None),
    (None, "no existe: aun sin costo de integración el ROI es " + es(roi_mvp(etl_extra=-ETL), 2).replace("-", "−") + " %", None, None),
    (S_EQ_DESC, "tasa de éxito " + es(S_EQ_DESC * 100, 1) + " %", S_EQ_DESC, "fracción"),
    (None, "no existe: con r = 0 el ROI es " + es(ROI_REGLA_R0, 2).replace("-", "−") + " %", ROI_REGLA_R0, "%"),
    (None, "no existe: haría falta un margen bruto de " + es(MARGEN_EQ * 100, 0) + " % de la facturación",
     MARGEN_EQ, "fracción"),
    (S_EQ_SIN, "sin descuento, tasa de éxito " + es(S_EQ_SIN * 100, 1) + " %", S_EQ_SIN, "fracción"),
    (None, "no existe para el descuento; con 15 % el equilibrio es la tasa de éxito de " + es(S_EQ_DESC * 100, 1)
     + " %", None, None),
    (M_EQ, "ARS " + es(M_EQ, 0) + " de margen por cliente que vuelve (" + es(M_EQ / M_CANON, 1) + " veces G51)",
     M_EQ, "ARS por año"),
    (S_EQ_DESC, "tasa de éxito " + es(S_EQ_DESC * 100, 1) + " %", S_EQ_DESC, "fracción"),
    (TC_EQ_REGLA, es(TC_EQ_REGLA, 2) + " ARS/USD", TC_EQ_REGLA, "ARS/USD"),
    (TC_EQ_REGLA, es(TC_EQ_REGLA, 2) + " ARS/USD", TC_EQ_REGLA, "ARS/USD"),
    (None, "no existe: el recurrente (USD " + es(REC_MVP) + " por año) supera lo que deja la lista; con horizonte "
     "infinito el ROI tiende a " + es(ROI_REGLA_H_INF, 1).replace("-", "−") + " %", ROI_REGLA_H_INF, "%"),
]
assert len(EQ_FILAS) == len(sensibilidad)
for x, (v, txt, cuenta, unidad) in zip(sensibilidad, EQ_FILAS):
    x["equilibrio_regla"] = {"valor": v, "texto": txt, "cuenta": cuenta, "unidad": unidad}
esperar("G43 con descuento", round(S_EQ_DESC * 100, 1), 49.6)
esperar("G43 sin descuento", round(S_EQ_SIN * 100, 1), 39.7)
esperar("G44 regla con descuento", round(TC_EQ_REGLA, 2), 21.57)

# Gráfico de la B 3.5 (cambio 149, DG9 b): ROI de la regla en cada variable, una barra por fila de la tabla
ETIQUETA_3_5 = ["Adopción 50 %", "Margen de una compra", None, "Integración al doble", "Éxito 0,63 %",
                "Descuento usado por los FP: apertura", "Margen bruto de 2025", "Sin descuento",
                "20 % a los clientes de alto valor", "Margen por persona unificada", "Éxito 1,12 % (los que cruzan)",
                "Tipo de cambio de 2024", "Tipo de cambio de 2022", "Horizonte de 3 años"]
grafico_3_5 = {
    "que": "ROI a un año de la regla sin modelo (con 15 % de descuento) al mover una variable por vez",
    "roi_base_pct": ROI_MVP_BASE,
    "barras": [{"etiqueta": et, "variable": x["variable"], "probado": x["probado"], "roi_regla_pct": x["roi_mvp_pct"],
                "diferencia_con_la_base_pp": x["roi_mvp_pct"] - ROI_MVP_BASE,
                "equilibrio": x["equilibrio_regla"]["texto"]}
               for et, x in zip(ETIQUETA_3_5, sensibilidad) if x["roi_mvp_pct"] is not None],
}


# G52 (cambio 152): 13 de 1.162 contra 3 de 408 no se separan del azar (Fisher exacta, dos colas)
def fisher_dos_colas(a, n1, b, n2):
    k, n = a + b, n1 + n2

    def prob(x):
        return math.comb(n1, x) * math.comb(n2, k - x) / math.comb(n, k)
    p_obs = prob(a)
    return sum(prob(x) for x in range(max(0, k - n2), min(k, n1) + 1) if prob(x) <= p_obs * (1 + 1e-9))


P_FISHER = fisher_dos_colas(K_COMPRA_VP, N_ENV_VP, K_COMPRA_FP, N_ENV_FP)
esperar("G52 no cruzan", (N_ENV_FP, K_COMPRA_FP), (408, 3))

esperar("G59", round(M_EQ), 599274)
esperar("G60", round(H_EQ_MES, 1), 44.4)
esperar("G58", round(VECES_REC, 1), 20.0)
esperar("G52 Fisher", round(P_FISHER, 2), 0.77)
if FALLAS:
    print("Fallan las cifras fijadas en el registro:")
    for f in FALLAS:
        print("  -", f)
    sys.exit(1)

equilibrios = {
    "beneficio_por_caso_ars": {"regla_con_descuento": M_EQ, "veces_g08": M_EQ / M_BASE,
                               "modelo_sobre_la_regla": M_EQ_PROY},
    "tasa_exito": {"regla_con_descuento": S_EQ_DESC, "regla_sin_descuento": S_EQ_SIN},
    "tipo_de_cambio": {"regla_con_descuento": TC_EQ_REGLA, "regla_sin_descuento": tc_eq["mvp_sin_descuento"],
                       "modelo_sobre_la_regla": tc_eq["proyecto"]},
    "adopcion_veces_la_lista": ADOP_EQ, "margen_bruto_sobre_facturacion": MARGEN_EQ,
    "roi_regla_r_0_pct": ROI_REGLA_R0, "roi_regla_horizonte_infinito_pct": ROI_REGLA_H_INF,
}
horas_equilibrio = {"horas_por_mes": H_EQ_MES, "tarifa_usd_hora": TARIFA_HORA,
                    "costo_primer_anio_usd": costo_total(CM), "beneficio_regla_usd": B_REGLA}
recurrente_contra_beneficio = {"recurrente_regla_usd_anual": REC_MVP, "beneficio_regla_usd_anual": B_REGLA,
                               "veces": VECES_REC}

# G53: aciertos por mes de la regla en la lista de 500 sin filtro (pendientes 10 y 54). Desde la B v1.1 (24/10,
# pendiente 76) la meta de la 4.5 se fija sobre la lista de contactables, que mide la etapa 3: G56, en contenido_b.py.
meta_criterio_1 = {
    "regla_aciertos_por_mes": REG["vp"] / CORTES_VALIDACION,
    "logistica_aciertos_extra_por_mes": CR["diferencia_aciertos"] / CORTES_VALIDACION,
    "aciertos_por_mes_por_punto": ACIERTOS_POR_PUNTO / CORTES_VALIDACION,
    "aciertos_extra_por_mes_para_pagar": mejora_minima["puntos_para_pagar_costo_incremental"]
    * ACIERTOS_POR_PUNTO / CORTES_VALIDACION,
}


# ============================================================ marco económico de la v3.0 (24/11/2026): G64 a G69
# Devolución del E3 (filas 3.1 a 3.6 y 11; pendientes 178 a 180, 206 y 209 de wiki/entregables/entregable-4.md).
# El piloto se costea aparte de la inversión de la regla (G64); lo que sigue se parte en dos variantes, la
# operación mínima (G66) y la producción completa (G65); el umbral de pase del piloto (G67) es lo que paga el
# primer año de la operación mínima. Cálculo de .workforce/presentacion-final/fase-2/econ/memo_calc.py, con las
# decisiones del canon v1.0 (la operación mínima la hace un analista part-time pago, envío 71; la limpieza de
# identidad es condición de la operación mínima y no del piloto). Tarifas de G37.

# Planilla de la regla, que corre cada mes una persona de Marketing designada por Sofía R. (24 h del equipo)
HORAS_PLANILLA = {
    "regla del umbral: umbral = máx(90; 1,5 × intervalo mediano), días para cruzar, orden y corte en 500": 8,
    "control del 60 % de cada mes, compra devuelta como actividad e identidad por la tabla del 31/12/2025": 6,
    "columnas de exclusión y de marca": 2,
    "prueba de la planilla contra la regla del E3 sobre el extracto actual": 4,
    "guía de corrida": 4,
}
H_PLANILLA = sum(HORAS_PLANILLA.values())                                # 24
TALLERES_PILOTO = 1                                                      # el de la semana 5
HORAS_MARKETING_LISTA = HORAS_OPERADOR_MES                               # 8 h por lista, horas de Casa Óga
H_LEGAL = sum(h for h, _ in HORAS_LEGAL.values())                        # 20 (G48)
# G49: 32 h del equipo + 4 h de separar control y ramas en cada corrida; desde la v3.0 las 4 h también son del
# equipo (Francisco C. sortea, D 12.4). El costo, USD 1.350, no cambia.
H_PIL = sum(HORAS_PILOTO_EQUIPO.values()) + HORAS_PILOTO_OPERADOR       # 36
PM_LINEAS = [
    {"componente": "Planilla de la regla y guía de corrida", "horas": H_PLANILLA, "usd": H_PLANILLA * TARIFA_HORA,
     "linea_de_g39": "Consultor / Data Scientist senior (1 mes): solo la planilla y la guía"},
    {"componente": "Adecuación legal del equipo (L3, L4 y L5)", "horas": H_LEGAL, "usd": H_LEGAL * TARIFA_HORA,
     "linea_de_g39": "Adecuación legal del equipo, entera (G48)"},
    {"componente": "Sorteo, medición e informes del piloto", "horas": H_PIL, "usd": H_PIL * TARIFA_HORA,
     "linea_de_g39": "Piloto con grupo de control, entera (G49)"},
    {"componente": "Un taller con el equipo de Sofía R. y quien corre la planilla (semana 5)", "horas": None,
     "usd": TALLERES_PILOTO * TALLER, "linea_de_g39": "Capacitación: 1 de los 2 talleres"},
]
PM_UNICOS = sum(x["usd"] for x in PM_LINEAS)
PM_HORAS = sum(x["horas"] or 0 for x in PM_LINEAS)
PM_TOTAL = PM_UNICOS * (1 + CONTINGENCIA)
MEDICION_SOLA = H_PIL * TARIFA_HORA * (1 + CONTINGENCIA)                 # G69: medir, con su contingencia
piloto_minimo = {
    "id": "G64",
    "que_es": "el MVP (la planilla mensual de la regla) operado tres meses con grupo de control y dos ramas",
    "lineas": PM_LINEAS, "horas_equipo": PM_HORAS, "unicos_usd": PM_UNICOS,
    "contingencia_usd": PM_UNICOS * CONTINGENCIA, "total_usd": PM_TOTAL,
    "horas_planilla": HORAS_PLANILLA,
    "horas_marketing": HORAS_MARKETING_LISTA * PILOTO_MESES,
    "horas_marketing_a_la_tarifa_de_g37_usd": HORAS_MARKETING_LISTA * PILOTO_MESES * TARIFA_HORA,   # fuera de X
    "acciones_marketing_ars": ACC_PIL_ARS, "acciones_marketing_usd": usd(ACC_PIL_ARS),
    "medicion_sola_usd": MEDICION_SOLA, "resto_usd": PM_TOTAL - MEDICION_SOLA,
    # un duplicado de identidad (alta posterior al 31/12/2025) cuesta un mensaje de más: sin o con descuento
    "duplicado_un_mensaje_de_mas_ars": {"sin_descuento": COSTO_RAMA_SIN, "con_descuento": COSTO_RAMA_DESC},
}


def etapa(unicos, recurrentes):
    """Costos de una etapa después del piloto: únicos con 15 % de contingencia y recurrente anual (en caja)."""
    u, rec = sum(unicos.values()), sum(recurrentes.values())
    inv = u * (1 + CONTINGENCIA)
    return {"unicos": unicos, "unicos_usd": u, "contingencia_usd": u * CONTINGENCIA, "inversion_usd": inv,
            "recurrentes": recurrentes, "recurrente_usd_anual": rec, "primer_anio_usd": inv + rec,
            "tres_anios_usd": inv + 3 * rec, "recurrente_sobre_inversion": rec / inv}


_LIMPIEZA = SEMANAS_LIMPIEZA * TARIFA_SEMANA
produccion_completa = dict(id="G65", **etapa(
    {"data scientist: tablero del mes y corrida con un comando (1 mes menos la planilla)":
     MESES_DS_MVP * TARIFA_DS_MES - H_PLANILLA * TARIFA_HORA,
     "sprint de integración / ETL: exportación automática con un mismo corte": SEMANAS_ETL * TARIFA_SEMANA,
     "limpieza de datos maestros: identidad rehecha con el extracto del momento": _LIMPIEZA,
     "segundo taller": (TALLERES - TALLERES_PILOTO) * TALLER},
    {"operador de la lista, 8 h por mes": HORAS_OPERADOR_MES * 12 * TARIFA_HORA, "soporte": SOPORTE_MES * 12}))
operacion_minima = dict(id="G66", **etapa(
    {"limpieza de datos maestros: identidad rehecha con el extracto del momento": _LIMPIEZA},
    {"analista part-time, 8 h por mes (envío 71)": HORAS_OPERADOR_MES * 12 * TARIFA_HORA}))
# sensibilidad (B 3.5): la operación mínima la absorbe una persona de Marketing sin costo adicional
_sin_costo = etapa(operacion_minima["unicos"], {"persona de Marketing sin costo adicional": 0.0})
# comprobación: piloto mínimo + producción completa = la regla de G39 (únicos, inversión, año 1 y recurrente)
comprobacion_g39 = {
    "unicos_usd": PM_UNICOS + produccion_completa["unicos_usd"], "unicos_g39_usd": CM["suma_unicos"],
    "inversion_usd": PM_TOTAL + produccion_completa["inversion_usd"], "inversion_g39_usd": CM["inversion_inicial"],
    "anio_1_usd": PM_TOTAL + produccion_completa["primer_anio_usd"], "anio_1_g39_usd": costo_total(CM),
    "recurrente_usd": produccion_completa["recurrente_usd_anual"], "recurrente_g39_usd": CM["recurrente_anual"],
}
for _k in ("unicos", "inversion", "anio_1", "recurrente"):
    assert abs(comprobacion_g39[f"{_k}_usd"] - comprobacion_g39[f"{_k}_g39_usd"]) < 1e-9, _k


# G67: umbral de pase del piloto, en diferencia de cruce a 90 días (control menos contactados, fuera del 20 %),
# con la misma s_equilibrio de G62 sobre la lista de 500 contactables: variante × horizonte × descuento
def umbral_pase(costo_anual_usd, con_descuento):
    r, d = (R_BASE, DESCUENTO) if con_descuento else (0.0, 0.0)
    s = s_equilibrio(CT["vp"], CT["fp"], costo_anual_usd, r, d)
    return {"costo_anual_usd": costo_anual_usd, "s_equilibrio": s, "diferencia_cruce_90d_pp": s * P_CRUCE_CTRL * 100}


_VARIANTES = {"operacion_minima": operacion_minima, "produccion_completa": produccion_completa,
              "operacion_minima_sin_costo_adicional": _sin_costo}
_HORIZONTES = {"solo_recurrente": lambda p: p["recurrente_usd_anual"],
               "primer_anio_con_la_inversion_que_queda": lambda p: p["primer_anio_usd"],
               "tres_anios_por_anio": lambda p: p["tres_anios_usd"] / 3}
UMB_PASE = {v: {h: {"con_descuento": umbral_pase(f(p), True), "sin_descuento": umbral_pase(f(p), False)}
                for h, f in _HORIZONTES.items()} for v, p in _VARIANTES.items()}


def _par(v, h):
    return tuple(round(UMB_PASE[v][h][k]["diferencia_cruce_90d_pp"], 2) for k in ("con_descuento", "sin_descuento"))


U_CON = UMB_PASE["operacion_minima"]["primer_anio_con_la_inversion_que_queda"]["con_descuento"]["diferencia_cruce_90d_pp"]
U_SIN = UMB_PASE["operacion_minima"]["primer_anio_con_la_inversion_que_queda"]["sin_descuento"]["diferencia_cruce_90d_pp"]
# la referencia de G62 (12,41 y 9,92) es la producción completa, solo recurrente: la misma cuenta
assert abs(UMB_PASE["produccion_completa"]["solo_recurrente"]["con_descuento"]["diferencia_cruce_90d_pp"]
           - DIF["recurrente_con_descuento"]) < 1e-9
# con la limpieza de identidad dentro del piloto (sensibilidad, B 3.5): X sube y el umbral pasa a solo recurrente
X_CON_LIMPIEZA = PM_TOTAL + operacion_minima["inversion_usd"]
umbral_de_pase = {
    "id": "G67",
    "regla": "Primero, las dos ramas juntas contra el control: si el intervalo de 95 % de la diferencia de cruce "
             "incluye el cero, contactar no mostró efecto y el proyecto cierra con el piloto. Si no lo incluye, cada "
             "rama se compara con su número: la rama con descuento y la rama sin descuento, lo que paga el primer año "
             "de la operación mínima. Se sigue con la rama que llega; si llegan las dos, con la que deja más valor; "
             "si no llega ninguna, el proyecto cierra.",
    "que_decide": {"variante": "operacion_minima", "horizonte": "primer_anio_con_la_inversion_que_queda",
                   "con_descuento_pp": U_CON, "sin_descuento_pp": U_SIN},
    "por_variante": UMB_PASE,
    "produccion_completa_primer_anio_pp": {
        "con_descuento": UMB_PASE["produccion_completa"]["primer_anio_con_la_inversion_que_queda"]["con_descuento"]["diferencia_cruce_90d_pp"],
        "sin_descuento": UMB_PASE["produccion_completa"]["primer_anio_con_la_inversion_que_queda"]["sin_descuento"]["diferencia_cruce_90d_pp"]},
    "referencia_g62_solo_recurrente_completa_pp": {"con_descuento": DIF["recurrente_con_descuento"],
                                                   "sin_descuento": DIF["recurrente_sin_descuento"]},
    "esperado_con_la_tasa_observada_pp": DIF_ESPERADA,
    "veces_lo_esperado": {"con_descuento": U_CON / DIF_ESPERADA, "sin_descuento": U_SIN / DIF_ESPERADA},
}
sensibilidad_umbral_de_pase = {
    "sin_costo_adicional": {"que": "la operación mínima la absorbe una persona de Marketing sin costo adicional",
                            "con_descuento_pp": _par("operacion_minima_sin_costo_adicional",
                                                     "primer_anio_con_la_inversion_que_queda")[0],
                            "sin_descuento_pp": _par("operacion_minima_sin_costo_adicional",
                                                     "primer_anio_con_la_inversion_que_queda")[1],
                            "primer_anio_usd": _sin_costo["primer_anio_usd"]},
    "limpieza_dentro_del_piloto": {"que": "la identidad se rehace dentro del piloto",
                                   "piloto_usd": X_CON_LIMPIEZA,
                                   "con_descuento_pp": _par("operacion_minima", "solo_recurrente")[0],
                                   "sin_descuento_pp": _par("operacion_minima", "solo_recurrente")[1]},
}


# G68: lo que ve el piloto. Potencia de la prueba de dos proporciones de mde_desigual (misma convención: la tasa
# base en el primer grupo, dos colas, 5 %), si el efecto real fuera justo el umbral de cada rama
def potencia_desigual(p0, n1, n2, efecto_pp, alpha=ALFA):
    za = NormalDist().inv_cdf(1 - alpha / 2)
    mid = efecto_pp / 100
    p1 = p0 + mid
    pbar = (n1 * p0 + n2 * p1) / (n1 + n2)
    se0 = math.sqrt(pbar * (1 - pbar) * (1 / n1 + 1 / n2))
    se1 = math.sqrt(p0 * (1 - p0) / n1 + p1 * (1 - p1) / n2)
    return NormalDist().cdf((mid - za * se0) / se1)


# control de la convención: en el efecto mínimo detectable la potencia es 80 %
assert abs(potencia_desigual(P0_NO_CRUCE, POR_RAMA, CONTROL, MDE_PIL["cruce_90d"]["por_rama_contra_control_pp"])
           - POTENCIA) < 1e-6
_lo, _hi = 1000, 200000   # tamaño por grupo para detectar lo esperado (0,79), grupos iguales, sin tope (memo)
while _hi - _lo > 1:
    _mid = (_lo + _hi) // 2
    _lo, _hi = (_lo, _mid) if mde_desigual(P0_NO_CRUCE, _mid, _mid) <= DIF_ESPERADA else (_mid, _hi)
N_PARA_ESPERADO = _hi
potencia_piloto = {
    "id": "G68",
    "mde_por_rama_pp": MDE_PIL["cruce_90d"]["por_rama_contra_control_pp"],
    "mde_ramas_juntas_pp": MDE_PIL["cruce_90d"]["ramas_juntas_contra_control_pp"],   # lo que ve el primer paso
    "potencia_rama_sin_descuento_en_su_umbral": potencia_desigual(P0_NO_CRUCE, POR_RAMA, CONTROL, U_SIN),
    "potencia_rama_con_descuento_en_su_umbral": potencia_desigual(P0_NO_CRUCE, POR_RAMA, CONTROL, U_CON),
    "potencia_ramas_juntas_en_el_umbral_sin_descuento": potencia_desigual(P0_NO_CRUCE, TRAT_FUERA, CONTROL, U_SIN),
    "esperado_pp": DIF_ESPERADA,
    "clientes_por_grupo_para_ver_lo_esperado": N_PARA_ESPERADO,
    "fuera_del_20_por_mes": FUERA_PIL / PILOTO_MESES,
}

# G69: valor de la información
valor_informacion = {
    "id": "G69",
    "medicion_sola_usd": MEDICION_SOLA, "resto_usd": PM_TOTAL - MEDICION_SOLA,
    "decide_operacion_minima_primer_anio_usd": operacion_minima["primer_anio_usd"],
    "decide_produccion_completa_primer_anio_usd": produccion_completa["primer_anio_usd"],
    "piloto_sobre_operacion_minima": PM_TOTAL / operacion_minima["primer_anio_usd"],
    "piloto_sobre_produccion_completa": PM_TOTAL / produccion_completa["primer_anio_usd"],
}

# G54 y G58 desde la v3.0: lo que deja la lista que sale (500 contactables, H16) contra el costo de seguir
B_LISTA_CONT = ANUALIZAR * (CT["vp"] * V_BASE["vp"] + CT["fp"] * V_BASE["fp"]) / TC_BASE    # USD 264,54 (H16, G54)
relacion_recurrente = {
    "lista_contactables_usd_anual": B_LISTA_CONT,
    "operacion_minima_recurrente_sobre_inversion": operacion_minima["recurrente_sobre_inversion"],
    "produccion_completa_recurrente_sobre_inversion": produccion_completa["recurrente_sobre_inversion"],
    "regla_v2_recurrente_sobre_inversion": CM["recurrente_sobre_inicial"],                 # 42,1 % (G39)
    "operacion_minima_recurrente_sobre_lo_que_deja_la_lista": operacion_minima["recurrente_usd_anual"] / B_LISTA_CONT,
}
roi_piloto_mas_produccion = {
    "con_la_completa_un_anio_pct": roi(B_LISTA_CONT, PM_TOTAL + produccion_completa["primer_anio_usd"]),
    "con_la_minima_un_anio_pct": roi(B_LISTA_CONT, PM_TOTAL + operacion_minima["primer_anio_usd"]),
    "costo_con_la_completa_usd": PM_TOTAL + produccion_completa["primer_anio_usd"],
    "costo_con_la_minima_usd": PM_TOTAL + operacion_minima["primer_anio_usd"],
}

# valores del canon v1.0 (piloto mínimo, etapas, umbral de pase, potencia, valor de la información)
esperar("G64", (PM_UNICOS, round(PM_UNICOS * CONTINGENCIA, 2), PM_TOTAL, PM_HORAS, H_PLANILLA,
                piloto_minimo["horas_marketing"], round(MEDICION_SOLA, 2), round(PM_TOTAL - MEDICION_SOLA, 2)),
        (3900.0, 585.0, 4485.0, 80, 24, 24, 1552.5, 2932.5))
esperar("G64 duplicado", tuple(round(v) for v in piloto_minimo["duplicado_un_mensaje_de_mas_ars"].values()), (25, 54))
esperar("G65", tuple(round(produccion_completa[k], 2) for k in ("unicos_usd", "inversion_usd", "recurrente_usd_anual",
                                                                   "primer_anio_usd", "tres_anios_usd")), (8500.0, 9775.0, 6000.0, 15775.0, 27775.0))
esperar("G66", tuple(round(operacion_minima[k], 2) for k in ("inversion_usd", "recurrente_usd_anual",
                                                                "primer_anio_usd", "tres_anios_usd")),
        (1725.0, 3600.0, 5325.0, 12525.0))
esperar("G67 decide", _par("operacion_minima", "primer_anio_con_la_inversion_que_queda"), (11.04, 8.82))
esperar("G67 completa, primer año", _par("produccion_completa", "primer_anio_con_la_inversion_que_queda"),
        (32.21, 25.81))
esperar("G67 referencia G62", _par("produccion_completa", "solo_recurrente"), (12.41, 9.92))
esperar("G67 mínima, solo recurrente", _par("operacion_minima", "solo_recurrente"), (7.55, 6.02))
esperar("G67 tres años", (_par("operacion_minima", "tres_anios_por_anio"), _par("produccion_completa", "tres_anios_por_anio")),
        ((8.71, 6.95), (19.01, 15.22)))
esperar("G67 sin costo adicional", _par("operacion_minima_sin_costo_adicional", "primer_anio_con_la_inversion_que_queda"),
        (3.75, 2.97))
esperar("G67 limpieza dentro del piloto", X_CON_LIMPIEZA, 6210.0, tol=1e-9)
esperar("G67 s de equilibrio", tuple(round(UMB_PASE["operacion_minima"]["primer_anio_con_la_inversion_que_queda"][k]
                                            ["s_equilibrio"] * 100, 2) for k in ("con_descuento", "sin_descuento")),
        (14.26, 11.40))
esperar("G68", (round(potencia_piloto["mde_por_rama_pp"], 2), round(potencia_piloto["mde_ramas_juntas_pp"], 2),
                round(100 * potencia_piloto["potencia_rama_sin_descuento_en_su_umbral"]),
                round(100 * potencia_piloto["potencia_rama_con_descuento_en_su_umbral"]),
                round(100 * potencia_piloto["potencia_ramas_juntas_en_el_umbral_sin_descuento"]),
                N_PARA_ESPERADO, round(potencia_piloto["fuera_del_20_por_mes"])),
        (9.63, 8.38, 73, 89, 84, 44661, 351))
esperar("G69", (round(valor_informacion["piloto_sobre_operacion_minima"] * 100, 1),
                round(valor_informacion["piloto_sobre_produccion_completa"] * 100, 1)), (84.2, 28.4))
esperar("G54 lista que sale", round(B_LISTA_CONT, 2), 264.54)
# cifras de la v2.0 que la v3.0 cita sin cambio de valor (G34, G37, G38, G40, G41, G48)
esperar("G34", (round(usd(VAL_INC * ANUALIZAR), 2), round(usd(VAL_REG * ANUALIZAR), 2), round(usd(VAL_MOD * ANUALIZAR), 2)),
        (5.38, 299.49, 304.87))
esperar("G37", (TARIFA_DS_MES, TARIFA_SEMANA, TARIFA_HORA, TALLER, SOPORTE_MES), (4000.0, 1500.0, 37.5, 900.0, 200.0))
esperar("G38", (CP["inversion_inicial"], CP["recurrente_anual"], C_PROY), (23460.0, 7200.0, 30660.0))
esperar("G40", (round(C_INC, 2), round(escenarios["esperado"]["proyecto"]["roi_pct"], 2)), (10400.0, -99.95))
esperar("G41", round(escenarios["esperado"]["mvp_con_descuento"]["roi_pct"], 2), -98.52)
esperar("G48", (H_LEGAL, H_LEGAL * TARIFA_HORA), (20, 750.0))
esperar("G54 piloto más completa", round(roi_piloto_mas_produccion["con_la_completa_un_anio_pct"], 2), -98.69)
esperar("G58 v3.0", (round(relacion_recurrente["operacion_minima_recurrente_sobre_lo_que_deja_la_lista"], 1),
                     round(relacion_recurrente["operacion_minima_recurrente_sobre_inversion"] * 100),
                     round(relacion_recurrente["regla_v2_recurrente_sobre_inversion"] * 100, 1)), (13.6, 209, 42.1))
if FALLAS:
    print("Fallan las cifras del canon v1.0 (G54, G58, G64 a G69):")
    for f in FALLAS:
        print("  -", f)
    sys.exit(1)


# ============================================================ salida

def r2(x, d=2):
    return None if x is None else round(float(x), d)


out = {
    "tipo_de_cambio": {"base_30_12_2025": TC_BASE, "30_12_2024": TC_2024, "30_12_2022": TC_2022,
                       "fuente": "BCRA, Com. A 3500, tipo de cambio mayorista de referencia; API de estadísticas "
                                 "monetarias v4.0, variable 5, consultada el 13/10/2026"},
    "tasa_exito": {"envios_cerca_del_umbral": N_ENV, "compras_7d": K_COMPRA, "tasa": S_BASE,
                   "ic95_wilson": [S_LO, S_HI], "aperturas": K_ABRE, "tasa_apertura": K_ABRE / N_ENV,
                   "falsos_positivos": {"envios_a_los_que_no_cruzan": N_ENV_FP, "compras_7d": K_COMPRA_FP,
                                        "aperturas": K_ABRE_FP, "r_oferta_7_dias": R_BASE,
                                        "r_apertura": R_APERTURA},
                   "por_canal": {c: {"envios": int(r_["count"]), "compras_7d": int(r_["sum"])}
                                 for c, r_ in por_canal.iterrows()},
                   "por_canal_todos_los_envios": {c: {"envios": int(r_["count"]), "compras_7d": int(r_["sum"]),
                                                      "tasa": r_["sum"] / r_["count"],
                                                      "ic95_wilson": list(wilson(int(r_["sum"]), int(r_["count"])))}
                                                  for c, r_ in por_canal_todos.iterrows()},
                   "particiones_usadas": sorted(cerca["particion"].unique().tolist()),
                   "envios_cruzados_con_el_dataset": int(len(cruce))},
    "parametros": {"accion": ACCION_BASE, "costo_accion_ars": C_ACC, "descuento": DESCUENTO,
                   "ticket_medio_ars": TICKET, "facturacion_media_2024_ars": FAC_2024_REG,
                   "margen_2024": MARGEN["2024"], "margen_2025": MARGEN["2025"],
                   "m_base_ars": M_BASE, "m_conservador_ars": M_CONS,
                   "facturacion_2024_elegibles_ars": FAC_ELEG_2024, "clientes_elegibles_activos_2024": N_ELEG_2024,
                   "m_optimista_ars": M_OPT,
                   "anualizar": ANUALIZAR, "horizonte_anios": HORIZONTE},
    "celda_4_4": {
        "unitario_ars": V_BASE, "unitario_usd": {k: usd(v) for k, v in V_BASE.items()},
        "modelo": {"matriz": MOD, "neto_ars": VAL_MOD, "neto_usd": usd(VAL_MOD),
                   "por_celda_ars": {k: MOD[k] * V_BASE[k] for k in ("vp", "fp", "fn", "vn")}},
        "regla": {"matriz": REG, "neto_ars": VAL_REG, "neto_usd": usd(VAL_REG),
                  "por_celda_ars": {k: REG[k] * V_BASE[k] for k in ("vp", "fp", "fn", "vn")}},
        "regla_como_clasificador_2_5": {"matriz": CLF, "neto_ars": VAL_CLF, "neto_usd": usd(VAL_CLF)},
        "incremental_ars": VAL_INC, "incremental_usd": usd(VAL_INC),
        "incremental_anual_ars": VAL_INC * ANUALIZAR, "incremental_anual_usd": usd(VAL_INC * ANUALIZAR),
        "regla_anual_usd": usd(VAL_REG * ANUALIZAR), "modelo_anual_usd": usd(VAL_MOD * ANUALIZAR),
        "margen_perdido_fn_ars": FN_PERDIDO,
        "margen_perdido_fn_usd": {k: usd(v) for k, v in FN_PERDIDO.items()},
        "perdida_esperada": {
            "matriz": PEM, "neto_ars": VAL_PE, "neto_usd": usd(VAL_PE),
            "contra_modelo_ars": VAL_PE - VAL_MOD, "contra_modelo_anual_usd": usd((VAL_PE - VAL_MOD) * ANUALIZAR),
            "margen_propio": {
                "facturacion_anualizada_vp_ars": FA_VP, "margen": MARGEN["2024"],
                "neto_ars": PROPIO, "neto_usd": {k: usd(v) for k, v in PROPIO.items()},
                "pe_contra_modelo_ars": PROPIO["perdida_esperada"] - PROPIO["modelo"],
                "pe_contra_modelo_anual_usd": usd((PROPIO["perdida_esperada"] - PROPIO["modelo"]) * ANUALIZAR),
                "modelo_contra_regla_anual_usd": usd((PROPIO["modelo"] - PROPIO["regla"]) * ANUALIZAR)}},
    },
    "costos_proyecto": CP, "costos_mvp": CM,
    "costo_total_anio_1": {"proyecto": C_PROY, "mvp": C_MVP, "incremental": C_INC},
    "escenarios": escenarios,
    "esperado": {"beneficio_ars": B_BASE_ARS, "beneficio_usd": B_BASE, "costo_usd": C_INC, "roi_pct": ROI_BASE,
                 "payback": payback(B_BASE, C_INC),
                 "proyecto_completo": {"beneficio_ars": B_COMPLETO_ARS, "beneficio_usd": usd(B_COMPLETO_ARS),
                                       "costo_usd": C_PROY, "roi_pct": roi(usd(B_COMPLETO_ARS), C_PROY),
                                       "payback": payback(usd(B_COMPLETO_ARS), C_PROY)}},
    "sensibilidad": sensibilidad,
    "umbral": umbral,
    "tc_equilibrio": tc_eq,
    "mejora_minima": mejora_minima,
    "retener_contra_reemplazar": retener,
    "adecuacion_legal": {"horas": {k: h for k, (h, _) in HORAS_LEGAL.items()},
                         "que": {k: q for k, (_, q) in HORAS_LEGAL.items()},
                         "costo_usd": sum(h for h, _ in HORAS_LEGAL.values()) * TARIFA_HORA,
                         "casa_oga_usd": 0.0},
    "piloto": piloto,
    "alto_valor": {"definicion": "20 % de mayor monetary de cada corte", "en_vp": HA_VP, "en_fp": HA_FP,
                   "en_la_lista": HA_LISTA},
    "margen_persona_unificada": {"personas_2024": N_CAN_2024, "facturacion_media_ars": FAC_2024_CAN,
                                 "m_ars": M_CANON, "registros_2024": int(len(fac24))},
    "tasa_exito_cruzan": {"envios": N_ENV_VP, "compras_7d": K_COMPRA_VP, "tasa": S_CRUZAN,
                          "fisher_p_contra_no_cruzan": P_FISHER,
                          "no_cruzan": {"envios": N_ENV_FP, "compras_7d": K_COMPRA_FP, "tasa": R_BASE}},
    "equilibrios": equilibrios,
    "horas_equilibrio": horas_equilibrio,
    "recurrente_contra_beneficio": recurrente_contra_beneficio,
    "grafico_3_5": grafico_3_5,
    "meta_criterio_1": meta_criterio_1,
    # v3.0 (24/11/2026): marco económico del canon (G64 a G69); las claves de arriba no cambian de sentido
    "piloto_minimo": piloto_minimo,
    "produccion_completa": produccion_completa,
    "operacion_minima": operacion_minima,
    "comprobacion_g39": comprobacion_g39,
    "umbral_de_pase": umbral_de_pase,
    "sensibilidad_umbral_de_pase": sensibilidad_umbral_de_pase,
    "potencia_piloto": potencia_piloto,
    "valor_informacion": valor_informacion,
    "relacion_recurrente": relacion_recurrente,
    "roi_piloto_mas_produccion": roi_piloto_mas_produccion,
}
SALIDA.mkdir(exist_ok=True)

# E3A-01 a E3A-05: lo que deja la regla por año medido en cada trimestre y cada ventana de doce meses del
# histórico (cv_temporal.py, 17 controles; escribe salida/cv_temporal.json). Lee los valores de esta corrida.
sys.path.insert(0, str(AQUI))
import cv_temporal  # noqa: E402
CV = cv_temporal.calcular(json.loads(json.dumps(out, ensure_ascii=False, default=float)))
_rp = CV["rangos_regla_usd_anual"]["proporcional_a_500_sin_filtro"]["sep2023_sep2024"]
_ri = CV["rangos_incremental_usd_anual"]["inc_prop_500_usd"]["trimestre_x4"]
_ro = CV["roi"]["mvp_proporcional_a_500_sin_filtro"]
rango_anual = {
    "ids": ["E3A-01", "E3A-02", "E3A-04", "E3A-05"],
    "que_es": "lo que deja la regla por año (lista de 500, sin filtro, proporcional a 500) medido en cada trimestre "
              "×4 y en cada ventana de doce meses entre septiembre de 2023 y septiembre de 2024",
    "trimestre_x4_usd": [_rp["trimestre_x4"]["min"], _rp["trimestre_x4"]["max"]],
    "doce_meses_usd": [_rp["doce_meses"]["min"], _rp["doce_meses"]["max"]],
    "roi_pct": [_ro["roi_min_pct"], _ro["roi_max_pct"]],
    "incremental_trimestre_x4_usd": [_ri["min"], _ri["max"]],
    # E3A-02, solo para el anexo: la lista de 500 tal cual sale en cada trimestre (sin hacerla proporcional)
    "lista_tal_cual_usd": [CV["roi"]["mvp_lista_500_sin_filtro"]["beneficio_min"],
                           CV["roi"]["mvp_lista_500_sin_filtro"]["beneficio_max"]],
    "lista_tal_cual_roi_pct": [CV["roi"]["mvp_lista_500_sin_filtro"]["roi_min_pct"],
                               CV["roi"]["mvp_lista_500_sin_filtro"]["roi_max_pct"]],
    "fraccion_proporcional_sin_filtro": CV["fraccion_proporcional_sin_filtro"],   # la de la C 7.1 (J-B-05)
    "fuente": "salida/cv_temporal.json",
}
esperar("E3A fracción proporcional", round(rango_anual["fraccion_proporcional_sin_filtro"] * 100, 1), 20.9)
esperar("E3A-01", (round(rango_anual["trimestre_x4_usd"][0], 2), round(rango_anual["trimestre_x4_usd"][1], 2),
                   round(rango_anual["doce_meses_usd"][0], 2), round(rango_anual["doce_meses_usd"][1], 2)),
        (301.45, 335.78, 319.77, 321.42))
esperar("E3A-05", tuple(round(x, 2) for x in rango_anual["roi_pct"]), (-98.51, -98.34))
esperar("E3A-04", tuple(round(x, 2) for x in rango_anual["incremental_trimestre_x4_usd"]), (-5.39, 6.82))
if FALLAS:
    print("Fallan las cifras del rango anual (E3A):")
    for f in FALLAS:
        print("  -", f)
    sys.exit(1)
out["rango_anual"] = rango_anual
(SALIDA / "economia.json").write_text(json.dumps(out, ensure_ascii=False, indent=1, default=float) + "\n",
                                      encoding="utf-8")

# Planilla de la 4.6: una fila por número, con su cálculo
filas = []


def fila(sec, concepto, valor, unidad, calculo, reg):
    filas.append([sec, concepto, valor if isinstance(valor, str) else r2(valor), unidad, calculo, reg])


fila("supuesto", "tipo de cambio de referencia", TC_BASE, "ARS/USD", "BCRA Com. A 3500, 30/12/2025", "G30")
fila("supuesto", "tipo de cambio 30/12/2024 (sensibilidad)", TC_2024, "ARS/USD", "BCRA Com. A 3500", "G30")
fila("supuesto", "tipo de cambio 30/12/2022 (sensibilidad)", TC_2022, "ARS/USD", "BCRA Com. A 3500", "G30")
fila("supuesto", "tasa de éxito: compra a 7 días cerca del umbral", S_BASE * 100, "%",
     f"{K_COMPRA} / {N_ENV} envíos", "G31")
fila("supuesto", "tasa de éxito, límite inferior del IC95", S_LO * 100, "%", "Wilson", "G31")
fila("supuesto", "tasa de éxito, límite superior del IC95", S_HI * 100, "%", "Wilson", "G31")
fila("supuesto", "falsos positivos que usan el descuento: compra a 7 días de los que no cruzan", R_BASE * 100, "%",
     f"{K_COMPRA_FP} / {N_ENV_FP} envíos; oferta válida 7 días (G32)", "G31")
fila("supuesto", "falsos positivos que usan el descuento si la oferta vale hasta la próxima compra (apertura)",
     R_APERTURA * 100, "%", f"{K_ABRE_FP} / {N_ENV_FP} envíos (sensibilidad)", "G31")
fila("supuesto", "costo de la acción (WhatsApp con oferta personalizada)", C_ACC, "ARS", "catálogo, ACC03", "G32")
fila("supuesto", "descuento sobre una compra", DESCUENTO * TICKET, "ARS", "0,15 × ticket medio (G06, D07)", "G32")
fila("supuesto", "margen que vuelve, esperado", M_BASE, "ARS", "40.664 × 0,3758 (G08)", "G32")
fila("supuesto", "margen que vuelve, conservador (una compra)", M_CONS, "ARS", "ticket medio × 0,3758", "G32")
fila("supuesto", "margen que vuelve, optimista (tres compras o más)", M_OPT, "ARS",
     f"{es(FAC_ELEG_2024)} × 0,3758", "G32")
for k in ("vp", "fp", "fn", "vn"):
    fila("4.4", f"valor unitario {k.upper()}", V_BASE[k], "ARS", "VP: s(m − dt) − c; FP: −c − r·d·t; FN y VN: 0", "G33")
fila("4.4", "valor neto del modelo, validación", VAL_MOD, "ARS", "Σ cantidad × valor (G19)", "G34")
fila("4.4", "valor neto de la regla, validación", VAL_REG, "ARS", "Σ cantidad × valor (G20)", "G34")
fila("4.4", "valor incremental, validación", VAL_INC, "ARS", "modelo − regla", "G34")
fila("4.4", "valor incremental anual", usd(VAL_INC * ANUALIZAR), "USD", "× 4 ÷ tipo de cambio", "G34")
fila("4.4", "margen perdido por los FN del modelo (aparte)", FN_PERDIDO["modelo"], "ARS", "476 × G08", "G35")
fila("4.4", "techo del incremental anual con éxito de 100 %", usd(TECHO_INC_ANUAL), "USD", "s = 1", "G36")
fila("4.4", "valor neto de la lista por pérdida esperada, validación", VAL_PE, "ARS", "Σ cantidad × valor (G27)", "G47")
fila("4.4", "pérdida esperada menos modelo, anual", usd((VAL_PE - VAL_MOD) * ANUALIZAR), "USD",
     "(G47 − G34 modelo) × 4 ÷ tipo de cambio", "G47")
for k, v in PROPIO.items():
    fila("4.4", f"valor neto con el margen de cada cliente, {k.replace('_', ' ')}, validación", v, "ARS",
         "s (0,3758 × Σ F̂ de los VP − VP d t) − VP c − FP (c + r d t)", "G47")
fila("4.4", "pérdida esperada menos modelo con el margen de cada cliente, anual",
     usd((PROPIO["perdida_esperada"] - PROPIO["modelo"]) * ANUALIZAR), "USD", "× 4 ÷ tipo de cambio", "G47")
for x in CP["unicos"]:
    fila("3.2 proyecto", x["componente"], x["usd"], "USD", x["calculo"], "G38")
fila("3.2 proyecto", "contingencia 15 %", CP["contingencia"], "USD", "15 % de los únicos", "G38")
fila("3.2 proyecto", "inversión inicial", CP["inversion_inicial"], "USD", "únicos + contingencia", "G38")
for x in CP["recurrentes"]:
    fila("3.2 proyecto", x["componente"], x["usd_anual"], "USD/año", x["calculo"], "G38")
fila("3.2 proyecto", "recurrente anual", CP["recurrente_anual"], "USD/año", "suma", "G38")
fila("3.2 proyecto", "total año 1", CP["total_anio_1"], "USD", "inicial + recurrente", "G38")
fila("3.2 MVP", "inversión inicial", CM["inversion_inicial"], "USD", "1 mes de data scientist; resto igual", "G39")
fila("3.2 MVP", "recurrente anual", CM["recurrente_anual"], "USD/año", "sin nube", "G39")
fila("3.2 MVP", "total año 1", CM["total_anio_1"], "USD", "inicial + recurrente", "G39")
fila("3.2", "costo incremental del modelo sobre la regla, año 1", C_INC, "USD",
     "total año 1 del proyecto − total año 1 del MVP", "G40")
for n, e in escenarios.items():
    for clave, sec, reg in (("proyecto", "3.4 modelo sobre la regla", "G40"),
                            ("proyecto_completo", "3.4 proyecto completo frente a no contactar", "G40"),
                            ("mvp_con_descuento", "3.4 MVP con descuento", "G41"),
                            ("mvp_sin_descuento", "3.4 MVP sin descuento", "G41")):
        p = e[clave]
        fila(sec, f"{n}: beneficio anual", p["beneficio_usd"], "USD", "valor anual de la 4.4", reg)
        fila(sec, f"{n}: ROI", p["roi_pct"], "%", "(B − C) / C × 100", reg)
        fila(sec, f"{n}: payback", str(p["payback_meses"]), "meses", "C / B × 12", reg)
for x in sensibilidad:
    fila("3.5 modelo sobre la regla", x["variable"] + " → " + x["probado"], x["roi_proyecto_pct"], "%", "una variable por vez", "G42")
    if x["roi_mvp_pct"] is not None:
        fila("3.5 MVP", x["variable"] + " → " + x["probado"], x["roi_mvp_pct"], "%", "una variable por vez", "G42")
fila("3.6", "tasa de éxito de equilibrio, MVP con descuento", umbral["mvp_s_equilibrio_con_descuento"] * 100,
     "%", "ROI del MVP = 0", "G43")
fila("3.6", "tasa de éxito de equilibrio, MVP sin descuento", umbral["mvp_s_equilibrio_sin_descuento"] * 100,
     "%", "ROI del MVP = 0", "G43")
for k, v in tc_eq.items():
    fila("3.6", f"tipo de cambio de equilibrio, {k.replace('_', ' ')}", "no existe" if v is None else v, "ARS/USD",
         "B en ARS / C en USD", "G44")
fila("3.5 y 3.6", "valor de un punto de precisión sobre la regla, anual", mejora_minima["valor_por_punto_usd_anual"],
     "USD", "15 aciertos × 4 × (v_VP − v_FP) ÷ tipo de cambio", "G46")
fila("3.5 y 3.6", "puntos de precisión para pagar el costo incremental",
     mejora_minima["puntos_para_pagar_costo_incremental"], "puntos", "costo incremental / valor de un punto", "G46")
fila("3.5 y 3.6", "máximo posible sobre la regla", mejora_minima["maximo_posible_pp"], "puntos",
     "(1 − precisión de la regla) × 100", "G46")
fila("3.5 y 3.6", "valor del máximo posible, anual", mejora_minima["valor_del_maximo_usd_anual"], "USD",
     "máximo × valor de un punto", "G46")
fila("3.5 y 3.6", "puntos para pagar el costo incremental con éxito de 100 %",
     mejora_minima["con_exito_100"]["puntos_para_pagar_costo_incremental"], "puntos", "s = 1", "G46")
for k in ("con_descuento", "sin_descuento"):
    fila("3.1", f"costo por cliente retenido, {k.replace('_', ' ')}", retener["costo_por_cliente_retenido_ars"][k],
         "ARS", "costo anual de las acciones / clientes que vuelven", "G45")
fila("3.1", "costo de adquisición 2025 por alta", CAC_2025, "ARS", "G04", "G45")
fila("3.2", "adecuación legal del equipo (L3 a L5)", out["adecuacion_legal"]["costo_usd"], "USD",
     f"{sum(h for h, _ in HORAS_LEGAL.values())} h × USD {es(TARIFA_HORA, 2)}", "G48")
fila("3.2", "adecuación legal de Casa Óga (L1, L2, L6)", 0.0, "USD", "fuera de los USD 30.000", "G48")
fila("3.2 y 3.6", "piloto: horas del equipo (sorteo, medición e informes)", piloto["costo_horas_usd"], "USD",
     f"{sum(HORAS_PILOTO_EQUIPO.values())} h + {HORAS_PILOTO_OPERADOR} h × USD {es(TARIFA_HORA, 2)}", "G49")
fila("3.2 y 3.6", "piloto: acciones sobre los contactados (paga Marketing)", piloto["acciones_marketing_ars"], "ARS",
     f"{es(ALTO_PIL, 2)} de alto valor × ARS {es(COSTO_ALTO, 2)} + {es(POR_RAMA, 2)} con descuento × ARS "
     f"{es(COSTO_RAMA_DESC, 2)} + {es(POR_RAMA, 2)} sin descuento × ARS {es(COSTO_RAMA_SIN, 2)}", "G49")
fila("3.6", "piloto: señal temprana, diferencia mínima detectable en la compra a 7 días, dos ramas contra el control",
     piloto["mde_pp"], "puntos",
     f"{es(TRAT_FUERA, 2)} contactados fuera del 20 % contra {CONTROL} de control, p0 {es(P0_C16 * 100, 2)} %", "G49")
fila("3.6", "piloto: compra a 7 días, una rama contra el control", MDE_PIL["compra_7d"]["por_rama_contra_control_pp"],
     "puntos", f"{es(POR_RAMA, 2)} contra {CONTROL}", "G49")
fila("3.6", "piloto: cruce a 90 días del control (fuera del 20 % de mayor facturación)", P_CRUCE_CTRL * 100, "%",
     f"{es(CT['vp_fuera'], 2)} / {es(CT['fuera'], 2)} de la lista de contactables en validación", "G61")
fila("3.6", "piloto: diferencia mínima detectable a 90 días, una rama contra el control",
     MDE_PIL["cruce_90d"]["por_rama_contra_control_pp"], "puntos", f"{es(POR_RAMA, 2)} contra {CONTROL}", "G61")
fila("3.6", "piloto: diferencia mínima detectable a 90 días, entre ramas", MDE_PIL["cruce_90d"]["entre_ramas_pp"],
     "puntos", f"{es(POR_RAMA, 2)} contra {es(POR_RAMA, 2)}", "G61")
fila("3.6", "referencia: diferencia de cruce a 90 días que paga el recurrente de la producción completa, con descuento",
     DIF["recurrente_con_descuento"], "puntos", "s de equilibrio con USD 6.000 × 77,4 %", "G62")
fila("3.6", "referencia: diferencia de cruce a 90 días que paga el recurrente de la producción completa, sin descuento",
     DIF["recurrente_sin_descuento"], "puntos", "s de equilibrio con USD 6.000, d = r = 0, × 77,4 %", "G62")
fila("3.6", "diferencia esperada con la tasa de éxito observada", DIF_ESPERADA, "puntos", "1,02 % × 77,4 %", "G62")
fila("3.6", "costo recurrente de las semanas 19 a 28", REC_ESPERA, "USD",
     "pausa entre el fin del piloto y la decisión: no corre ningún costo recurrente", "G63")
fila("3.3", "horas por mes de Marketing reasignadas que dejan la regla en ROI 0", H_EQ_MES, "h/mes",
     "(USD 20.260 − USD 299,49) / USD 37,50 / 12", "G60")
fila("3.4", "veces que el recurrente de la operación mínima supera lo que deja la lista por año",
     relacion_recurrente["operacion_minima_recurrente_sobre_lo_que_deja_la_lista"], "veces",
     f"USD 3.600 / USD {es(B_LISTA_CONT, 2)} (lista de 500 contactables)", "G58")
fila("3.5", "beneficio por caso con el que la regla da ROI 0", M_EQ, "ARS por año", "despeja m en ROI de la regla = 0",
     "G59")
fila("3.5", "parte de la lista de la regla de alto valor, entre los VP", HA_VP * 100, "%",
     "20 % de mayor facturación acumulada del corte", "G50")
fila("3.5", "parte de la lista de la regla de alto valor, entre los FP", HA_FP * 100, "%",
     "20 % de mayor facturación acumulada del corte", "G50")
fila("3.5", "margen que vuelve por persona unificada", M_CANON, "ARS", f"{es(FAC_2024_CAN)} × 0,3758", "G51")
fila("3.5", "tasa de éxito sobre los que cruzan el umbral", S_CRUZAN * 100, "%",
     f"{K_COMPRA_VP} / {N_ENV_VP} envíos", "G52")
fila("4.5", "aciertos por mes de la regla en la lista de 500 sin filtro (la meta del criterio de éxito 1 usa la "
     "de contactables, Parte C 7.2)", meta_criterio_1["regla_aciertos_por_mes"],
     "aciertos/mes", "VP de la regla en validación / 3", "G53")

# v3.0 (24/11/2026): marco económico del canon, G64 a G69, y rango anual (E3A)
for x in PM_LINEAS:
    fila("3.2 piloto mínimo", x["componente"], x["usd"], "USD",
         (f"{x['horas']} h × USD {es(TARIFA_HORA, 2)}" if x["horas"] else "1 taller × USD 900") + "; " + x["linea_de_g39"],
         "G64")
fila("3.2 piloto mínimo", "contingencia 15 %", piloto_minimo["contingencia_usd"], "USD", "15 % de los únicos", "G64")
fila("3.2 piloto mínimo", "total", PM_TOTAL, "USD", f"USD {es(PM_UNICOS)} + 15 %; {PM_HORAS} h del equipo", "G64")
fila("3.2 piloto mínimo", "horas de Marketing (fuera del presupuesto)", piloto_minimo["horas_marketing"], "h",
     "8 h por lista × 3 listas", "G64")
for nom, et, reg in (("3.2 producción completa", produccion_completa, "G65"),
                     ("3.2 operación mínima", operacion_minima, "G66")):
    for k, v in et["unicos"].items():
        fila(nom, k, v, "USD", "único", reg)
    fila(nom, "inversión con 15 % de contingencia", et["inversion_usd"], "USD", "únicos × 1,15", reg)
    for k, v in et["recurrentes"].items():
        fila(nom, k, v, "USD/año", "recurrente en caja", reg)
    fila(nom, "primer año", et["primer_anio_usd"], "USD", "inversión + recurrente", reg)
fila("3.2", "piloto mínimo más producción completa", comprobacion_g39["anio_1_usd"], "USD",
     "USD 4.485 + USD 15.775 = total año 1 de la regla (G39)", "G39")
for k, txt in (("con_descuento", "con descuento"), ("sin_descuento", "sin descuento")):
    fila("3.6", f"umbral de pase del piloto, {txt}", umbral_de_pase["que_decide"][f"{k}_pp"], "puntos",
         f"s de equilibrio con USD {es(operacion_minima['primer_anio_usd'])} (primer año de la operación mínima) "
         "× 77,4 %", "G67")
    fila("3.6", f"lo que paga el primer año de la producción completa, {txt}",
         umbral_de_pase["produccion_completa_primer_anio_pp"][k], "puntos",
         f"s de equilibrio con USD {es(produccion_completa['primer_anio_usd'])} × 77,4 %", "G67")
    fila("3.5", f"umbral de pase si la operación mínima no tiene costo adicional, {txt}",
         sensibilidad_umbral_de_pase["sin_costo_adicional"][f"{k}_pp"], "puntos",
         f"s de equilibrio con USD {es(_sin_costo['primer_anio_usd'])} × 77,4 %", "G67")
    fila("3.5", f"umbral de pase con la limpieza dentro del piloto (USD {es(X_CON_LIMPIEZA)}), {txt}",
         sensibilidad_umbral_de_pase["limpieza_dentro_del_piloto"][f"{k}_pp"], "puntos",
         "s de equilibrio con USD 3.600 × 77,4 %", "G67")
fila("3.6", "potencia de una rama si el efecto es su umbral, sin descuento",
     potencia_piloto["potencia_rama_sin_descuento_en_su_umbral"] * 100, "%",
     f"{es(POR_RAMA, 2)} contra {CONTROL}, dos colas, 5 %", "G68")
fila("3.6", "potencia de una rama si el efecto es su umbral, con descuento",
     potencia_piloto["potencia_rama_con_descuento_en_su_umbral"] * 100, "%",
     f"{es(POR_RAMA, 2)} contra {CONTROL}, dos colas, 5 %", "G68")
fila("3.6", "diferencia mínima detectable a 90 días, las dos ramas juntas contra el control",
     potencia_piloto["mde_ramas_juntas_pp"], "puntos", f"{es(TRAT_FUERA, 2)} contra {CONTROL}", "G68")
fila("3.6", "clientes por grupo para ver lo esperado", N_PARA_ESPERADO, "clientes",
     f"diferencia mínima detectable = {es(DIF_ESPERADA, 2)} puntos, grupos iguales", "G68")
fila("3.6", "clientes por mes fuera del 20 % en el piloto", potencia_piloto["fuera_del_20_por_mes"], "clientes",
     f"{es(FUERA_PIL, 2)} / 3", "G68")
fila("3.6", "medición sola del piloto", MEDICION_SOLA, "USD", f"{H_PIL} h × USD {es(TARIFA_HORA, 2)} × 1,15", "G69")
fila("3.6", "resto del piloto (planilla, taller y legal)", PM_TOTAL - MEDICION_SOLA, "USD", "USD 4.485 − medición", "G69")
fila("3.3", "lo que deja por año la lista de 500 contactables", B_LISTA_CONT, "USD",
     "4 × (VP × v_VP + FP × v_FP) ÷ tipo de cambio (H16)", "G54")
fila("3.4", "ROI de un año del piloto mínimo más la producción completa", roi_piloto_mas_produccion["con_la_completa_un_anio_pct"],
     "%", f"(USD {es(B_LISTA_CONT, 2)} − USD 20.260) / USD 20.260 × 100", "G54")
fila("3.4", "recurrente sobre inversión de la regla (v2.0)", CM["recurrente_sobre_inicial"] * 100, "%",
     "USD 6.000 / USD 14.260", "G58")
fila("3.4", "recurrente sobre inversión de la operación mínima", operacion_minima["recurrente_sobre_inversion"] * 100,
     "%", "USD 3.600 / USD 1.725", "G58")
for k, txt, reg in (("trimestre_x4_usd", "trimestre × 4", "E3A-01"), ("doce_meses_usd", "doce meses", "E3A-01"),
                    ("roi_pct", "ROI de la regla", "E3A-05"),
                    ("incremental_trimestre_x4_usd", "incremental del modelo, trimestre × 4", "E3A-04")):
    for i, borde in enumerate(("mínimo", "máximo")):
        fila("3.3 rango anual", f"{txt}, {borde}", rango_anual[k][i], "%" if k == "roi_pct" else "USD/año",
             "cv_temporal.py, septiembre de 2023 a septiembre de 2024", reg)

# Etapa 4 (Parte D, 8.2; 28/10, auditoría F6, V-B-016 y V-D-046): la plantilla pide actualizar el ROI si el
# test cambia el beneficio. Las filas de test se leen de etapa4.json (J12). economia.json no cambia.
e4 = json.loads(ETAPA4.read_text(encoding="utf-8"))
NOMBRE_TEST = {"modelo_sobre_la_regla": "modelo sobre la regla",
               "proyecto_completo": "proyecto completo frente a no contactar",
               "regla_sin_modelo": "MVP con descuento"}
BASE_B = {"modelo_sobre_la_regla": escenarios["esperado"]["proyecto"],
          "proyecto_completo": escenarios["esperado"]["proyecto_completo"],
          "regla_sin_modelo": escenarios["esperado"]["mvp_con_descuento"]}
for x in e4["contra_roi_b_3_4"]["evaluado"]:
    base = BASE_B[x["fila"]]
    assert abs(x["b_3_4"]["beneficio_usd"] - base["beneficio_usd"]) < 1e-6, x["fila"]   # etapa4 leyó esta 3.4
    for lista, nombre_lista in (("contactables", "lista de 500 contactables"), ("sin_filtro", "lista de 500 sin filtro")):
        v = x[lista]
        fila("8.2 test (Parte D)", f"{NOMBRE_TEST[x['fila']]}, {nombre_lista}: beneficio anual", v["beneficio_usd"],
             "USD", "valor neto de test en 5 cortes × 12 / 5, con los valores por celda de la 4.4", "J12")
        fila("8.2 test (Parte D)", f"{NOMBRE_TEST[x['fila']]}, {nombre_lista}: ROI", v["roi_pct"], "%",
             f"(B − C) / C × 100, C = USD {es(x['costo_usd'])}", "J12")
# 03/11 (fase W9, V4): salen las dos filas J19 (equilibrio en test, 46,9 %, y la diferencia de compra a 7 días,
# 40,42 puntos, de la escala vieja de H49). El umbral del piloto es el de G62 (filas 3.6); la D ya no cita el 46,9 %.

with open(SALIDA / "costos_beneficios_roi.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["seccion", "concepto", "valor", "unidad", "calculo", "fila_registro"])
    w.writerows(filas)

print(f"economia.json y costos_beneficios_roi.csv escritos en {SALIDA}")
print(f"tasa de éxito {S_BASE:.4%} ({K_COMPRA}/{N_ENV}), IC {S_LO:.4%} a {S_HI:.4%}; "
      f"r {R_BASE:.4%} ({K_COMPRA_FP}/{N_ENV_FP}); apertura de los que no cruzan {R_APERTURA:.4%}")
print(f"4.4: modelo ARS {VAL_MOD:,.0f}, regla ARS {VAL_REG:,.0f}, incremental ARS {VAL_INC:,.0f} "
      f"(USD {usd(VAL_INC):,.2f}; anual USD {usd(VAL_INC * ANUALIZAR):,.2f})")
print(f"costo año 1: proyecto USD {C_PROY:,.0f}, MVP USD {C_MVP:,.0f}, incremental USD {C_INC:,.0f}; "
      f"ROI base (modelo sobre la regla) {ROI_BASE:.1f} %")
print(f"mejora mínima: un punto vale USD {mejora_minima['valor_por_punto_usd_anual']:,.2f} por año; "
      f"hacen falta {mejora_minima['puntos_para_pagar_costo_incremental']:,.0f} puntos y hay {MAX_PP:.1f}")
print(f"pérdida esperada: ARS {VAL_PE:,.0f} con valores medios; con margen propio, PE − modelo "
      f"USD {usd((PROPIO['perdida_esperada'] - PROPIO['modelo']) * ANUALIZAR):,.2f} por año")

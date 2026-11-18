"""
Build final: capa de datos de /final/, la presentación final del 24/11/2026 (canon de la corrida, tableros.final).

    python3 -I pipeline/build_final.py

Reemplaza a la decisión N0-7 (/final/ leía D3 de e3/src/datos_e3.js): /final/ tiene payload propio, sacado de los
JSON del vault que escriben los generadores de las partes, sin copia intermedia. Lee, sin modificarlos:

- entregas/entregable-3/_build/B/economia/salida/economia.json (v3.0: piloto mínimo, operación mínima, producción
  completa, umbral de pase, potencia, valor de la información y calendario desde la aprobación) y cv_temporal.json
- entregas/entregable-3/_build/A/modelado/salida/etapa1.json y devoluciones_v02.json (si existe);
  _build/A/factibilidad/salida/condiciones.json
- entregas/entregable-3/_build/B/modelado/salida/etapa2.json, _build/C/modelado/salida/etapa3.json,
  _build/D/modelado/salida/etapa4.json
- entregas/entregable-3/_build/C/modelado/salida/indicador_6_5.json (H50, indicador de la limitación principal de la C)
- entregas/entregable-3/_build/C/contenido_c.py (SCORES, puntaje legal H40) y _build/A/contenido_a.py (puntajes de
  la tabla de scoring, F16), leídos con ast sin importarlos
- entregas/entregable-4/_build/A/registro/cifras-F3.json: las cifras K de la parte de Gestión del E4 (la copia del
  registro que deja generar_a.py junto al generador)
- (17/11, F6) entregas/entregable-4/_build/A/contenido_a.py (épicas, historias y precondiciones de la primera lista,
  leídas con ast), _build/A/tmp/lista_de_muestra.json (la lista de muestra al corte 2025-08) y _build/A/registro/
  canon.json (criterios de go-live y plan); y raw/datasets/unidad-1/Transacciones_clientes.csv, contado mes a mes para
  el control del 60 % (D28, H46) y el embudo del extracto de ventas (C20). Dan las tablas ventas_2025,
  tramos_de_cruce, lista_muestra, backlog, plan, legal_previas y riesgos_criticos de las vistas de /final/.

Escribe final/src/datos_final.js con «export const DF = {...}». Solo biblioteca estándar.

Anclas: cada una es una fila del registro de cifras del E4 (wiki/entregables/cifras-entregable-4.md) por su id; una
fila con varios valores usa «id.parte» (G67.con_descuento). Cada ancla compara el valor leído del JSON, formateado
como lo muestra la pantalla (toFixed de JS, punto de miles, coma decimal, menos U+2212: las reglas de
e3/src/formato.js), con el número que escribe el documento entregado, escrito acá como literal. Además, controles
cruzados entre fuentes (G64 contra las K, G39 contra G64 + G65, calendario contra K15). Si algo no cierra, o si
falta una clave en un JSON, imprime la tabla o la clave y sale con código 1 sin escribir nada.

Determinista: dos corridas seguidas dan los mismos bytes (sin fechas de corrida; cada fuente va con su nombre de
archivo y su sha256, sin rutas).
"""
from __future__ import annotations

import ast
from ast import literal_eval as literal
import hashlib
import json
import os
import sys
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

APP = Path(__file__).resolve().parents[1]
SALIDA = APP / "final" / "src" / "datos_final.js"
NBSP = " "
MENOS = "−"


def raiz_vault() -> Path:
    """La raíz del vault: FPDD_VAULT si está, si no la primera carpeta hacia arriba con entregas/entregable-3
    (sirve desde app/ y desde un worktree app/.wt-*)."""
    if os.environ.get("FPDD_VAULT"):
        return Path(os.environ["FPDD_VAULT"]).resolve()
    for p in APP.parents:
        if (p / "entregas" / "entregable-3" / "_build").is_dir():
            return p
    sys.exit("No encuentro el vault (una carpeta con entregas/entregable-3/_build); defina FPDD_VAULT.")


VAULT = raiz_vault()
E3 = VAULT / "entregas" / "entregable-3" / "_build"
FUENTES = {
    "economia": E3 / "B" / "economia" / "salida" / "economia.json",
    "cv_temporal": E3 / "B" / "economia" / "salida" / "cv_temporal.json",
    "etapa1": E3 / "A" / "modelado" / "salida" / "etapa1.json",
    "condiciones": E3 / "A" / "factibilidad" / "salida" / "condiciones.json",
    "etapa2": E3 / "B" / "modelado" / "salida" / "etapa2.json",
    "etapa3": E3 / "C" / "modelado" / "salida" / "etapa3.json",
    "etapa4": E3 / "D" / "modelado" / "salida" / "etapa4.json",
    "indicador_6_5": E3 / "C" / "modelado" / "salida" / "indicador_6_5.json",
    "cifras_f3": VAULT / "entregas" / "entregable-4" / "_build" / "A" / "registro" / "cifras-F3.json",
    # (F6, contenido de /final/) la lista de muestra de la PoC (E4 A 3.2) y el canon que lee el generador de la A
    # del E4 (plan, hitos y criterios de go-live de la 4.1 a 4.3), en la copia que deja junto a su registro
    "lista_muestra": VAULT / "entregas" / "entregable-4" / "_build" / "A" / "tmp" / "lista_de_muestra.json",
    "canon": VAULT / "entregas" / "entregable-4" / "_build" / "A" / "registro" / "canon.json",
}
GENERADORES = {"contenido_c": E3 / "C" / "contenido_c.py", "contenido_a": E3 / "A" / "contenido_a.py",
               "contenido_a_e4": VAULT / "entregas" / "entregable-4" / "_build" / "A" / "contenido_a.py"}
# (F6) el extracto de ventas tal como llegó (raw/ se lee, nunca se escribe): filas, limpieza (C20) y la serie
# mensual del control del 60 % (D28), con el mismo método que entregas/entregable-2/_build/A/serie_mensual.py
CRUDOS = {"transacciones": VAULT / "raw" / "datasets" / "unidad-1" / "Transacciones_clientes.csv"}
OPCIONALES = {"devoluciones": E3 / "A" / "modelado" / "salida" / "devoluciones_v02.json"}

# Puntajes que no vienen en los JSON: se leen con ast del generador de la parte que los escribe.
# A 1.2, tabla de scoring (F16): filas («nombre», «puntaje», …) de contenido_a.py del E3.
CONDICIONES = [("datos", "Datos suficientes"), ("calidad", "Calidad utilizable"),
               ("infraestructura", "Infraestructura"), ("capacidad_humana", "Capacidad humana")]
# C 5.3 v3.0, puntaje legal del estado actual (H40): SCORES de contenido_c.py, en este orden.
LEGAL = [("proteccion_datos", "Protección de datos personales"), ("seguridad", "Seguridad y control de accesos"),
         ("conservacion", "Conservación y trazabilidad fiscal"), ("contratos", "Contratos con proveedores externos"),
         ("explicabilidad", "Explicabilidad del modelo (IA)")]
TRAMO_CON_CONDICIONES = (1.6, 2.5)
PUNTAJES: dict[str, list[int]] = {}   # los llena modelado(): «condiciones» y «legal»


# ============================================================ utilidades

def sha256(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


class Falta(Exception):
    """Una clave que no está en un JSON de entrada: sale como falla con nombre, no como traceback."""


class Nodo(dict):
    def __init__(self, d: dict, ruta: str):
        super().__init__(d)
        self.ruta = ruta

    def __getitem__(self, k):
        if k not in self:
            raise Falta(f"{self.ruta}: falta la clave «{k}»")
        return envolver(dict.__getitem__(self, k), f"{self.ruta}.{k}")


class Lista(list):
    def __init__(self, v: list, ruta: str):
        super().__init__(v)
        self.ruta = ruta

    def __getitem__(self, i):
        try:
            return envolver(list.__getitem__(self, i), f"{self.ruta}[{i}]")
        except IndexError:
            raise Falta(f"{self.ruta}: no tiene el elemento {i}") from None

    def __iter__(self):
        for i, v in enumerate(list.__iter__(self)):
            yield envolver(v, f"{self.ruta}[{i}]")


def envolver(v, ruta: str):
    if isinstance(v, dict):
        return Nodo(v, ruta)
    if isinstance(v, list):
        return Lista(v, ruta)
    return v


def cargar(p: Path):
    return envolver(json.loads(p.read_text(encoding="utf-8")), p.name)


def lista_de(p: Path, nombre: str) -> list:
    """La lista literal asignada a «nombre» en un .py, leída con ast (sin importar el módulo)."""
    for nodo in ast.walk(ast.parse(p.read_text(encoding="utf-8"))):
        if isinstance(nodo, ast.Assign) and any(isinstance(x, ast.Name) and x.id == nombre for x in nodo.targets):
            return ast.literal_eval(nodo.value)
    raise Falta(f"{p.name}: no encuentro {nombre} = [...]")


def puntajes_de_tabla(p: Path, nombres: list[str]) -> list[int]:
    """El puntaje de cada fila («nombre», «puntaje», …) de una tabla literal de un .py, leído con ast."""
    vistos: dict[str, str] = {}
    for nodo in ast.walk(ast.parse(p.read_text(encoding="utf-8"))):
        if isinstance(nodo, ast.Tuple) and len(nodo.elts) >= 2 and all(isinstance(e, ast.Constant) for e in nodo.elts[:2]):
            a, b = nodo.elts[0].value, nodo.elts[1].value
            if a in nombres and isinstance(b, str) and b.isdigit():
                if a in vistos and vistos[a] != b:
                    raise Falta(f"{p.name}: dos puntajes para «{a}»")
                vistos[a] = b
    faltan = [n for n in nombres if n not in vistos]
    if faltan:
        raise Falta(f"{p.name}: sin puntaje para {faltan}")
    return [int(vistos[n]) for n in nombres]


def fijo(x, dec: int = 0, signo: bool = False) -> str:
    """formato.js fijo(): toFixed(dec) de JS (mitad lejos del cero, sobre el valor binario exacto), punto de miles,
    coma decimal, menos U+2212 y nunca «−0»."""
    q = Decimal(abs(x)).quantize(Decimal(1).scaleb(-dec), rounding=ROUND_HALF_UP)
    ent, _, fr = f"{q:f}".partition(".")
    cuerpo = f"{int(ent):,}".replace(",", ".") + ("," + fr if fr else "")
    if not q:
        return cuerpo
    if x < 0:
        return MENOS + cuerpo
    return "+" + cuerpo if signo else cuerpo


def fecha(iso: str) -> str:
    a, m, d = iso[:10].split("-")
    return f"{d}/{m}/{a}"


# Cómo se escribe cada unidad en pantalla (formato.js: usd, pct, pctDirecto, fijo)
def texto_de(valor, unidad: str, dec: int) -> str:
    if unidad == "USD":
        return "USD" + NBSP + fijo(valor, dec)
    if unidad == "USD por año":
        return "USD" + NBSP + fijo(valor, dec) + " por año"
    if unidad == "ARS":
        return "ARS" + NBSP + fijo(valor, dec)
    if unidad == "fracción":
        return fijo(valor * 100, dec) + NBSP + "%"
    if unidad == "%":
        return fijo(valor, dec) + NBSP + "%"
    if unidad == "puntos":
        return fijo(valor, dec) + " puntos"
    if unidad == "de cada 100":
        return fijo(valor, dec) + " de cada 100"
    if unidad == "fecha":
        return fecha(valor)
    return fijo(valor, dec)


# ============================================================ anclas y controles

ANCLAS: dict[str, dict] = {}
FILAS: list[dict] = []
CONTROLES: list[dict] = []


def ancla(id_: str, definicion: str, valor, unidad: str, dec: int, doc: str, x: float = 1.0) -> None:
    """valor × x con dec decimales tiene que dar doc, el número que escribe el documento entregado."""
    if id_ in ANCLAS:
        sys.exit(f"ancla repetida: {id_}")
    if unidad == "fecha":
        mostrado = fecha(valor)
    else:
        mostrado = fijo(valor * x, dec)
    ok = mostrado == doc
    FILAS.append({"id": id_, "definicion": definicion, "doc": doc, "mostrado": mostrado, "ok": ok})
    ANCLAS[id_] = {"valor": valor, "unidad": unidad, "texto": texto_de(valor, unidad, dec), "definicion": definicion}


def texto_fijo(id_: str, definicion: str, texto: str) -> None:
    """Una fila del registro que es texto (una lista de valores, un rango de fechas): va tal cual."""
    if id_ in ANCLAS:
        sys.exit(f"ancla repetida: {id_}")
    ANCLAS[id_] = {"valor": None, "unidad": "texto", "texto": texto, "definicion": definicion}


def control(nombre: str, a, b, tol: float = 1e-9) -> None:
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        ok = abs(a - b) <= tol * max(1.0, abs(b))
    else:
        ok = a == b
    CONTROLES.append({"nombre": nombre, "a": a, "b": b, "ok": ok})


# ============================================================ piezas

def economia(eco: dict) -> None:
    pm, om, pc = eco["piloto_minimo"], eco["operacion_minima"], eco["produccion_completa"]
    ancla("G64", "piloto mínimo: costo único de tres meses con 15 % de contingencia", pm["total_usd"], "USD", 0, "4.485")
    ancla("G64.unicos", "piloto mínimo sin contingencia", pm["unicos_usd"], "USD", 0, "3.900")
    ancla("G64.contingencia", "contingencia del piloto mínimo (15 %)", pm["contingencia_usd"], "USD", 0, "585")
    ancla("G64.horas_equipo", "horas del equipo del piloto mínimo", pm["horas_equipo"], "horas", 0, "80")
    ancla("G64.horas_marketing", "horas de la persona de Marketing que corre la planilla", pm["horas_marketing"],
          "horas", 0, "24")
    ancla("G49.acciones", "acciones de retención del piloto, que paga Marketing", pm["acciones_marketing_ars"],
          "ARS", 0, "53.538")
    pil = eco["piloto"]
    ancla("G49.meses", "meses del piloto", pil["meses"], "meses", 0, "3")
    ancla("G49.lista_mes", "lista de contactables por mes", pil["lista_mes"], "clientes", 0, "500")
    ancla("G49.control_mes", "grupo de control por mes", pil["control_mes"], "clientes", 0, "100")
    ancla("G49.contactados", "contactados en los tres meses", pil["tratados"], "clientes", 0, "1.200")
    ancla("G49.por_rama", "contactados por rama en los tres meses, fuera del 20 % de mayor facturación",
          pil["metrica_decision"]["mde"]["por_rama"], "clientes", 2, "376,67")
    ramas = pil["ramas"]
    ancla("G49.costo_con_descuento", "costo por contactado de la rama con descuento",
          ramas["con_descuento"]["costo_por_contactado_ars"], "ARS", 2, "53,84")
    ancla("G49.costo_alto_valor", "costo por contactado en el 20 % de mayor facturación",
          ramas["alto_valor"]["costo_por_contactado_ars"], "ARS", 2, "53,38")
    ancla("G49.costo_sin_descuento", "costo por contactado de la rama sin descuento",
          ramas["sin_descuento"]["costo_por_contactado_ars"], "ARS", 0, "25")
    control("G49 acciones = suma de las tres ramas", sum(r["acciones_ars"] for r in ramas.values()),
            pm["acciones_marketing_ars"])
    control("G49 contactados = suma de las tres ramas", sum(r["contactados"] for r in ramas.values()), pil["tratados"])
    control("G64 duplicado con descuento = costo de la rama con descuento",
            pm["duplicado_un_mensaje_de_mas_ars"]["con_descuento"], ramas["con_descuento"]["costo_por_contactado_ars"])
    ancla("G66.inversion", "operación mínima: inversión (identidad rehecha más 15 %)", om["inversion_usd"], "USD", 0,
          "1.725")
    ancla("G66.recurrente", "operación mínima: analista part-time, 8 h por mes", om["recurrente_usd_anual"],
          "USD por año", 0, "3.600")
    ancla("G66.primer_anio", "operación mínima: primer año", om["primer_anio_usd"], "USD", 0, "5.325")
    ancla("G65.inversion", "producción completa: inversión con 15 %", pc["inversion_usd"], "USD", 0, "9.775")
    ancla("G65.recurrente", "producción completa: operador y soporte", pc["recurrente_usd_anual"], "USD por año", 0,
          "6.000")
    ancla("G65.primer_anio", "producción completa: primer año", pc["primer_anio_usd"], "USD", 0, "15.775")
    g39 = eco["comprobacion_g39"]
    ancla("G39", "costo del año 1 de la regla: piloto mínimo más producción completa", g39["anio_1_usd"], "USD", 0,
          "20.260")
    ancla("G39.unicos", "costos únicos de la regla", g39["unicos_usd"], "USD", 0, "12.400")
    ancla("G39.inversion", "inversión inicial de la regla", g39["inversion_usd"], "USD", 0, "14.260")
    control("G39 = G64 + G65 (año 1)", pm["total_usd"] + pc["primer_anio_usd"], g39["anio_1_usd"])
    control("G39 = G64 + G65 (únicos)", pm["unicos_usd"] + pc["unicos_usd"], g39["unicos_usd"])
    control("G39 de economia.json = costos_mvp", g39["anio_1_usd"], eco["costos_mvp"]["total_anio_1"])

    u = eco["umbral_de_pase"]
    qd, pv = u["que_decide"], u["por_variante"]
    if (qd["variante"], qd["horizonte"]) != ("operacion_minima", "primer_anio_con_la_inversion_que_queda"):
        sys.exit(f"umbral_de_pase.que_decide no es la operación mínima en su primer año: {qd}")
    ancla("G67.con_descuento", "umbral de pase del piloto, rama con 15 % de descuento", qd["con_descuento_pp"],
          "puntos", 2, "11,04")
    ancla("G67.sin_descuento", "umbral de pase del piloto, rama sin descuento", qd["sin_descuento_pp"], "puntos", 2,
          "8,82")
    dec = pv["operacion_minima"]["primer_anio_con_la_inversion_que_queda"]
    ancla("G67.s_con_descuento", "tasa de éxito de equilibrio con la operación mínima, con descuento",
          dec["con_descuento"]["s_equilibrio"], "fracción", 2, "14,26", x=100)
    ancla("G67.s_sin_descuento", "tasa de éxito de equilibrio con la operación mínima, sin descuento",
          dec["sin_descuento"]["s_equilibrio"], "fracción", 2, "11,40", x=100)
    for etapa, cos, cd, sd in (("operacion_minima", "4.175", "8,71", "6,95"),
                               ("produccion_completa", "9.258,33", "19,01", "15,22")):
        v = pv[etapa]["tres_anios_por_anio"]
        corto = "minima" if etapa == "operacion_minima" else "completa"
        ancla(f"G67.{corto}_tres_anios_costo", f"{etapa.replace('_', ' ')}: costo de tres años repartido por año",
              v["con_descuento"]["costo_anual_usd"], "USD por año", 2 if "," in cos else 0, cos)
        ancla(f"G67.{corto}_tres_anios_con_descuento", f"{etapa.replace('_', ' ')}, tres años: umbral con descuento",
              v["con_descuento"]["diferencia_cruce_90d_pp"], "puntos", 2, cd)
        ancla(f"G67.{corto}_tres_anios_sin_descuento", f"{etapa.replace('_', ' ')}, tres años: umbral sin descuento",
              v["sin_descuento"]["diferencia_cruce_90d_pp"], "puntos", 2, sd)
    control("G67 tres años de la operación mínima = (I + 3R) / 3", pv["operacion_minima"]["tres_anios_por_anio"]
            ["con_descuento"]["costo_anual_usd"], om["tres_anios_usd"] / 3)
    control("G67 tres años de la producción completa = (I + 3R) / 3", pv["produccion_completa"]["tres_anios_por_anio"]
            ["con_descuento"]["costo_anual_usd"], pc["tres_anios_usd"] / 3)
    pcp = pv["produccion_completa"]["primer_anio_con_la_inversion_que_queda"]
    ancla("G67.completa_con_descuento", "efecto que paga la producción completa en su primer año, con descuento",
          pcp["con_descuento"]["diferencia_cruce_90d_pp"], "puntos", 2, "32,21")
    ancla("G67.completa_sin_descuento", "efecto que paga la producción completa en su primer año, sin descuento",
          pcp["sin_descuento"]["diferencia_cruce_90d_pp"], "puntos", 2, "25,81")
    s = eco["sensibilidad_umbral_de_pase"]
    ancla("G67.sin_costo_con_descuento", "umbral si la operación mínima la absorbe Marketing, con descuento",
          s["sin_costo_adicional"]["con_descuento_pp"], "puntos", 2, "3,75")
    ancla("G67.sin_costo_sin_descuento", "umbral si la operación mínima la absorbe Marketing, sin descuento",
          s["sin_costo_adicional"]["sin_descuento_pp"], "puntos", 2, "2,97")
    ancla("G67.limpieza_piloto", "piloto con la identidad rehecha adentro", s["limpieza_dentro_del_piloto"]["piloto_usd"],
          "USD", 0, "6.210")
    ref = pv["produccion_completa"]["solo_recurrente"]
    ancla("G62.con_descuento", "referencia: recurrente de la producción completa, con descuento",
          ref["con_descuento"]["diferencia_cruce_90d_pp"], "puntos", 2, "12,41")
    ancla("G62.sin_descuento", "referencia: recurrente de la producción completa, sin descuento",
          ref["sin_descuento"]["diferencia_cruce_90d_pp"], "puntos", 2, "9,92")
    ancla("G62.tasa_observada", "diferencia de cruce con la tasa observada (no es un pronóstico)",
          u["esperado_con_la_tasa_observada_pp"], "puntos", 2, "0,79")

    p = eco["potencia_piloto"]
    ancla("G68.mde_rama", "efecto que el piloto ve 80 de cada 100 veces, por rama", p["mde_por_rama_pp"], "puntos", 2,
          "9,63")
    ancla("G68.mde_juntas", "efecto que ve el primer paso, las dos ramas juntas", p["mde_ramas_juntas_pp"], "puntos", 2,
          "8,38")
    ancla("G68.potencia_sin_descuento", "veces de cada 100 que el piloto ve 8,82 puntos en la rama sin descuento",
          p["potencia_rama_sin_descuento_en_su_umbral"] * 100, "de cada 100", 0, "73")
    ancla("G68.potencia_con_descuento", "veces de cada 100 que el piloto ve 11,04 puntos en la rama con descuento",
          p["potencia_rama_con_descuento_en_su_umbral"] * 100, "de cada 100", 0, "89")
    ancla("G68.potencia_juntas", "veces de cada 100 que el primer paso ve 8,82 puntos con las dos ramas juntas",
          p["potencia_ramas_juntas_en_el_umbral_sin_descuento"] * 100, "de cada 100", 0, "84")
    ancla("G68.clientes_por_grupo", "clientes por grupo para ver la diferencia con la tasa observada",
          p["clientes_por_grupo_para_ver_lo_esperado"], "clientes", 0, "44.661")
    ancla("G68.fuera_del_20_por_mes", "clientes por mes de la lista fuera del 20 % de mayor facturación",
          p["fuera_del_20_por_mes"], "clientes", 0, "351")
    control("G68 = G61 (MDE por rama)", p["mde_por_rama_pp"],
            eco["piloto"]["metrica_decision"]["mde"]["cruce_90d"]["por_rama_contra_control_pp"])

    vi = eco["valor_informacion"]
    ancla("G69.medicion", "valor de la información: lo que cuesta medir", vi["medicion_sola_usd"], "USD", 2, "1.552,50")
    ancla("G69.resto", "resto del piloto: planilla, capacitación y consentimiento", vi["resto_usd"], "USD", 2,
          "2.932,50")
    control("G69 medición + resto = G64", vi["medicion_sola_usd"] + vi["resto_usd"], pm["total_usd"])

    md = eco["piloto"]["metrica_decision"]
    ancla("G61.cruce_control", "cruce del umbral a 90 días sin contacto, fuera del 20 %", md["p0_cruce_90d_control"],
          "fracción", 2, "77,41", x=100)
    ancla("G31", "tasa de éxito observada: compra a 7 días cerca del umbral, sin grupo de control",
          eco["tasa_exito"]["tasa"], "fracción", 2, "1,02", x=100)

    c4 = eco["celda_4_4"]
    ancla("G34.regla", "lo que deja la regla por año, lista de 500 sin filtro", c4["regla_anual_usd"], "USD por año", 2,
          "299,49")
    ancla("G34.modelo", "lo que deja el modelo por año, lista de 500 sin filtro", c4["modelo_anual_usd"],
          "USD por año", 2, "304,87")
    ancla("G34.incremental", "lo que suma el modelo sobre la regla por año", c4["incremental_anual_usd"],
          "USD por año", 2, "5,38")
    ancla("G41", "ROI a un año de la regla sin filtro", eco["escenarios"]["esperado"]["mvp_con_descuento"]["roi_pct"],
          "%", 2, "−98,52")
    ancla("G40", "costo que el modelo agrega al año 1", eco["costo_total_anio_1"]["incremental"], "USD", 0, "10.400")
    ancla("G40.roi", "ROI a un año del modelo sobre la regla", eco["escenarios"]["esperado"]["proyecto"]["roi_pct"],
          "%", 2, "−99,95")
    ancla("G38", "costo del año 1 con modelo", eco["costos_proyecto"]["total_anio_1"], "USD", 0, "30.660")
    ancla("C28", "presupuesto declarado por Casa Óga", eco["costos_proyecto"]["presupuesto_C28"], "USD", 0, "30.000")
    rr = eco["roi_piloto_mas_produccion"]
    ancla("G54", "lo que deja la lista de 500 contactables por año", eco["relacion_recurrente"]["lista_contactables_usd_anual"],
          "USD por año", 2, "264,54")
    ancla("G54.roi", "ROI a un año del piloto mínimo más la producción completa", rr["con_la_completa_un_anio_pct"],
          "%", 2, "−98,69")
    control("G54 costo = G39", rr["costo_con_la_completa_usd"], g39["anio_1_usd"])
    ancla("G58", "veces que el recurrente de la operación mínima supera lo que deja la lista",
          eco["relacion_recurrente"]["operacion_minima_recurrente_sobre_lo_que_deja_la_lista"], "veces", 1, "13,6")

    ra = eco["rango_anual"]
    ancla("E3A-01.min", "lo que deja la regla por año, lista proporcional, trimestre × 4: mínimo",
          ra["trimestre_x4_usd"][0], "USD por año", 2, "301,45")
    ancla("E3A-01.max", "ídem, máximo", ra["trimestre_x4_usd"][1], "USD por año", 2, "335,78")
    ancla("E3A-01.doce_min", "ídem, doce meses seguidos: mínimo", ra["doce_meses_usd"][0], "USD por año", 2, "319,77")
    ancla("E3A-01.doce_max", "ídem, doce meses seguidos: máximo", ra["doce_meses_usd"][1], "USD por año", 2, "321,42")
    ancla("E3A-04.min", "incremental del modelo sobre la regla, trimestre × 4: mínimo",
          ra["incremental_trimestre_x4_usd"][0], "USD por año", 2, "−5,39")
    ancla("E3A-04.max", "ídem, máximo", ra["incremental_trimestre_x4_usd"][1], "USD por año", 2, "6,82")
    ancla("E3A-05.min", "ROI de la regla con la lista proporcional: mínimo", ra["roi_pct"][0], "%", 2, "−98,51")
    ancla("E3A-05.max", "ídem, máximo", ra["roi_pct"][1], "%", 2, "−98,34")

    cal = eco["piloto"]["calendario"]
    ancla("G63.semana_1", "lunes de la semana 1 si María G. aprueba con la entrega del 24/11/2026", cal["semana_1"],
          "fecha", 0, "30/11/2026")
    ancla("G63.primera_lista", "primera lista: lunes de la semana 6", cal["primera_lista"]["lunes"], "fecha", 0,
          "04/01/2027")
    ancla("G63.primera_lista_hasta", "primera lista: a más tardar", cal["primera_lista"]["hasta"], "fecha", 0,
          "14/01/2027")
    ancla("G63.tercera_lista", "tercera lista: lunes de la semana 14", cal["tercera_lista"]["lunes"], "fecha", 0,
          "01/03/2027")
    ancla("G63.preliminar", "informe preliminar: semana 20", cal["preliminar"]["lunes"], "fecha", 0, "12/04/2027")
    ancla("G63.decision", "decisión: lunes de la semana 28", cal["final"]["lunes"], "fecha", 0, "07/06/2027")
    ancla("G63.semana_decision", "semana de la decisión", cal["final"]["semana"], "semana", 0, "28")
    ancla("G63.recurrente_espera", "costo recurrente de las semanas 19 a 28", cal["recurrente_semanas_19_a_28_usd"],
          "USD", 0, "0")
    return cal


def modelado(e1: dict, e2: dict, e3: dict, e4: dict, co: dict) -> None:
    lb = e1["lineas_base_validacion"]
    ancla("F09", "precisión de la lista de 500 de la regla, validación sin filtro",
          lb["regla_umbral"]["lista_capacidad"]["precision"], "fracción", 1, "81,6", x=100)
    ancla("F07", "precisión de la lista de 500 de la práctica actual, validación sin filtro",
          lb["practica_actual"]["lista_capacidad"]["precision"], "fracción", 1, "36,2", x=100)

    def lista500(tabla, metodo):
        r = [f for f in e3["umbral"][tabla][metodo] if f["umbral"].startswith("lista de 500")]
        if len(r) != 1:
            sys.exit(f"etapa3.json umbral.{tabla}.{metodo}: {len(r)} filas de la lista de 500")
        return r[0]["precision"]
    ancla("H05", "precisión de la lista de 500 de la logística ajustada, validación sin filtro",
          lista500("filas", "modelo"), "fracción", 1, "82,6", x=100)
    ancla("H16", "precisión de la lista de 500 contactables de la regla, validación", lista500("filtradas", "regla_umbral"),
          "fracción", 1, "75,8", x=100)
    ancla("H15", "precisión de la lista de 500 contactables de la logística ajustada, validación",
          lista500("filtradas", "modelo"), "fracción", 1, "73,9", x=100)
    ancla("H13", "precisión de la lista de 500 contactables de la práctica actual, validación",
          lista500("filtradas", "practica_actual"), "fracción", 1, "32,8", x=100)
    control("F09 = etapa3 (regla sin filtro)", lb["regla_umbral"]["lista_capacidad"]["precision"],
            lista500("filas", "regla_umbral"))

    m = e4["medicion"]
    pr = m["principal"]
    ancla("J03.regla", "precisión de la lista de 500 contactables de la regla, test", pr["regla_umbral"]["precision"],
          "fracción", 2, "86,13", x=100)
    ancla("J03.logistica", "precisión de la lista de 500 contactables de la logística ajustada, test",
          pr["logistica_ajustada"]["precision"], "fracción", 2, "85,88", x=100)
    ancla("J17", "precisión de la lista de 500 contactables de la práctica actual, test",
          m["secundarias"]["practica_actual_contactables"]["precision"], "fracción", 1, "37,6", x=100)
    dif = pr["diferencia_logistica_menos_regla"]
    d = (pr["logistica_ajustada"]["precision"] - pr["regla_umbral"]["precision"]) * 100
    ancla("J09", "logística menos regla en test, lista de 500 contactables: empate", d, "puntos", 2, "−0,25")
    ancla("J09.ic_inferior", "límite inferior del intervalo del 95 %", dif["ic95"][0] * 100, "puntos", 2, "−1,45")
    ancla("J09.ic_superior", "límite superior del intervalo del 95 %", dif["ic95"][1] * 100, "puntos", 2, "0,79")
    ancla("J09.replicas", "réplicas a favor del modelo", dif["replicas_con_a_mejor"], "fracción", 1, "31,0", x=100)
    ancla("J02.tasa", "tasa de positivos del test (se van en 90 días)", m["tasa_base"], "fracción", 2, "25,35", x=100)
    ancla("J02.contactables", "filas contactables del test", m["contactables"]["filas"], "filas", 0, "9.962")

    puntajes = PUNTAJES["condiciones"] = puntajes_de_tabla(GENERADORES["contenido_a"], [n for _, n in CONDICIONES])
    ancla("F16", "puntaje técnico de la A 1.2, promedio de las cuatro condiciones", sum(puntajes) / len(puntajes),
          "de 3", 2, "2,25")
    ancla("G10", "positivos para entrenar (entrenamiento con embargo)", e2["particion"]["entrenamiento"]["positivos"],
          "filas", 0, "4.636")
    ancla("C19", "ventas sin cliente identificado", co["nulos"]["ventas_sin_cliente_pct"], "%", 1, "44,8")

    legal = PUNTAJES["legal"] = lista_de(GENERADORES["contenido_c"], "SCORES")
    if len(legal) != len(LEGAL):
        raise Falta(f"contenido_c.py: SCORES tiene {len(legal)} puntajes y la tabla legal {len(LEGAL)} dimensiones")
    prom = sum(legal) / len(legal)
    if not TRAMO_CON_CONDICIONES[0] <= prom <= TRAMO_CON_CONDICIONES[1]:
        sys.exit(f"H40: {prom} fuera del tramo «viable con condiciones»")
    ancla("H40", "puntaje legal del estado actual, promedio de cinco dimensiones", prom, "de 3", 1, "1,8")


def devueltas(dv: dict) -> None:
    r = dv["resumen"]
    ancla("E3A-07.filas_sin", "filas elegibles del v0.2 sin contar la compra devuelta", r["elegibles_filas_todos"]["A"],
          "filas", 0, "59.585")
    ancla("E3A-07.filas_con", "filas elegibles contándola", r["elegibles_filas_todos"]["B"], "filas", 0, "60.432")
    ancla("E3A-07.precision_con", "precisión de la lista de 500 de la regla en validación, contándola",
          r["precision_500_sin_filtro_pct"]["B"], "%", 2, "82,34")
    ancla("E3A-07.variacion_cortes", "variación de esa precisión entre los tres cortes de validación",
          r["variacion_precision_entre_cortes_validacion_pts"], "puntos", 2, "2,67")


def indicador(ind: dict, e3: dict) -> None:
    ref = ind["referencia"]
    if (ref["desde"], ref["hasta"], ref["cortes"]) != ("2023-10-31", "2024-12-31", 15):
        raise Falta(f"indicador_6_5.json: la referencia no es octubre de 2023 a diciembre de 2024 en 15 cortes: {dict(ref)}")
    ancla("H50.parte", "parte de los contactables que ocupa la lista en cada corte (la de 500 en validación)",
          ind["fraccion_de_los_contactables"], "fracción", 1, "29,8", x=100)
    ancla("H50.contactables_validacion", "contactables de validación", ind["contactables_validacion"], "clientes", 0,
          "5.038")
    ancla("H50.min", "cruce a 90 días de la lista menos el de toda la base elegible: mínimo de la referencia",
          ref["diferencia_min_pp"], "puntos", 1, "51,4")
    ancla("H50.max", "ídem, máximo de la referencia", ref["diferencia_max_pp"], "puntos", 1, "55,3")
    ancla("H50.validacion", "ídem, en validación (no se cita en la C)", ind["validacion"]["diferencia_pp"], "puntos", 1,
          "53,2")
    ctl = ind["control_lista_500_validacion"]
    h16 = [f for f in e3["umbral"]["filtradas"]["regla_umbral"] if f["umbral"].startswith("lista de 500")][0]["precision"]
    control("H50 control: lista de 500 fija de validación = H16", ctl["cruce_lista"], h16)
    control("H50 control: 1.137 aciertos de la lista de 500 (H16)", ctl["aciertos"], 1137.0)
    control("H50 parte = 1.500 / contactables de validación", ind["fraccion_de_los_contactables"],
            1500 / ind["contactables_validacion"])


# Cifras K en USD (vienen como texto «3.450»): su línea de costos únicos de G65, que con 15 % tiene que dar la K.
USD_K = {"K21": "sprint de integración", "K22": "data scientist"}


def gestion(k_filas: list, eco: dict, cal: dict) -> None:
    pm = eco["piloto_minimo"]
    por_id = {}
    for f in k_filas:
        i = f["id"]
        if not i.startswith("K"):
            continue
        por_id[i] = f["cifra"]
        if isinstance(f["cifra"], bool):
            sys.exit(f"{i}: cifra booleana")
        if isinstance(f["cifra"], int):
            unidad = "horas" if "horas" in f["definicion"] else "cantidad"
            ancla(i, f["definicion"], f["cifra"], unidad, 0, fijo(f["cifra"]))
        elif i in USD_K:
            usd = int(str(f["cifra"]).replace(".", ""))
            por_id[i] = usd
            ancla(i, f["definicion"], usd, "USD", 0, str(f["cifra"]))
        else:
            texto_fijo(i, f["definicion"], str(f["cifra"]))
    faltan = [k for k in ("K01", "K02", "K03", "K07", "K08", "K09", "K10", "K12", "K15", "K21", "K22")
              if k not in por_id]
    if faltan:
        sys.exit(f"cifras-F3.json: faltan {faltan}")
    control("K07 = G64 horas del equipo", por_id["K07"], pm["horas_equipo"])
    control("K08 = horas de planilla y guía (G64)", por_id["K08"], sum(pm["horas_planilla"].values()))
    control("K08 = línea de la planilla de G64", por_id["K08"], pm["lineas"][0]["horas"])
    control("K09 = adecuación legal (G48)", por_id["K09"], sum(eco["adecuacion_legal"]["horas"].values()))
    control("K10 = sorteo, medición e informes (G49)", por_id["K10"], pm["lineas"][2]["horas"])
    control("K07 = K08 + K09 + K10", por_id["K07"], por_id["K08"] + por_id["K09"] + por_id["K10"])
    control("K12 = una semana de analista (USD 1.500 / USD 37,50)", por_id["K12"],
            eco["operacion_minima"]["unicos_usd"] / 37.5)
    for k, prefijo in USD_K.items():
        linea = [v for c, v in eco["produccion_completa"]["unicos"].items() if c.startswith(prefijo)]
        if len(linea) != 1:
            raise Falta(f"economia.json: produccion_completa.unicos sin una línea «{prefijo}…»")
        control(f"{k} = {prefijo} de G65 × 1,15", por_id[k], linea[0] * 1.15)
    d1, h1 = fecha(cal["semana_1"]), fecha(cal["semana_1_hasta"])
    control("K15 trae la semana 1 de G63", f"1: {d1[:5]} al {h1}" in por_id["K15"], True)
    control("K15 trae la semana 6 de G63", f"6: {fecha(cal['primera_lista']['lunes'])[:5]} al" in por_id["K15"], True)


# ============================================================ F6: piezas del contenido de /final/

MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]


def ventas(p: Path, co: dict, canon: dict) -> dict:
    """C20 (limpieza del extracto de ventas) y D28 (operaciones de cada mes de 2025 contra el mismo mes de 2024, el
    control del 60 %), leídos del CSV crudo con la base de serie_mensual.py: filas sin duplicados, monto_neto > 0."""
    import csv
    import re
    with p.open(encoding="utf-8", newline="") as f:
        filas = list(csv.reader(f))
    cab, cuerpo = filas[0], filas[1:]
    unicas = list(dict.fromkeys(tuple(r) for r in cuerpo))
    i_m, i_f, i_c = cab.index("monto_neto"), cab.index("fecha"), cab.index("id_cliente")
    con_cliente = [r for r in unicas if r[i_c].strip()]
    positivas = [r for r in con_cliente if float(r[i_m]) > 0]
    ancla("C20.crudo", "filas del extracto de ventas tal como llegó", len(cuerpo), "filas", 0, "50.250")
    ancla("C20.unicas", "filas sin duplicados de fila completa", len(unicas), "filas", 0, "50.000")
    ancla("C20.con_cliente", "filas con cliente identificado", len(con_cliente), "filas", 0, "27.606")
    ancla("C20.positivas", "filas con cliente y monto positivo", len(positivas), "filas", 0, "27.276")
    ancla("C20.repetidas", "filas repetidas que se sacan", len(cuerpo) - len(unicas), "filas", 0, "250")
    ancla("C20.sin_cliente", "filas sin cliente identificado: quedan fuera de la lista", len(unicas) - len(con_cliente),
          "filas", 0, "22.394")
    ancla("C20.no_positivas", "filas con cliente y monto no positivo (devoluciones): no suman facturación",
          len(con_cliente) - len(positivas), "filas", 0, "330")
    control("C20 únicas = condiciones.json", len(unicas), co["nulos"]["ventas_unicas"])
    control("C20 sin cliente = condiciones.json", len(unicas) - len(con_cliente), co["nulos"]["ventas_sin_cliente_filas"])
    control("C20 crudo = inventario de condiciones.json",
            len(cuerpo), [x["filas"] for x in co["inventario"] if x["archivo"] == "Transacciones_clientes.csv"][0])
    control("C19 = sin cliente / únicas", round((len(unicas) - len(con_cliente)) / len(unicas) * 100, 2),
            co["nulos"]["ventas_sin_cliente_pct"])

    # el umbral del mes sale del criterio 2 de go-live del canon («debajo del 60 % de las operaciones…»)
    m = re.search(r"debajo del (\d+) % de las operaciones", canon["plan"]["criterios_go_live"][1]["criterio"])
    if not m:
        raise Falta("canon.json: el criterio 2 de go-live no trae «debajo del N % de las operaciones»")
    umbral = int(m.group(1)) / 100
    ancla("H46.umbral_mes", "un mes con menos de esta parte de las operaciones del mismo mes del año anterior no se usa",
          umbral, "fracción", 0, "60", x=100)
    ops: dict[str, int] = {}
    for r in unicas:
        if float(r[i_m]) > 0:
            ops[r[i_f][:7]] = ops.get(r[i_f][:7], 0) + 1
    meses = []
    for mes in range(1, 13):
        k, k0 = f"2025-{mes:02d}", f"2024-{mes:02d}"
        meses.append({"mes": k, "rotulo": MESES_CORTOS[mes - 1], "operaciones": ops[k], "anio_anterior": ops[k0],
                      "parte": ops[k] / ops[k0], "se_usa": ops[k] / ops[k0] >= umbral})
    for k, d in {"2025-01": "1.390", "2025-12": "255"}.items():
        ancla(f"D28.ops_{k}", f"operaciones de {k}", ops[k], "operaciones", 0, d)
    for k, d in {"2025-08": "63", "2025-09": "53", "2025-10": "44", "2025-11": "36", "2025-12": "18"}.items():
        ancla(f"D28.parte_{k}", f"operaciones de {k} sobre las del mismo mes de 2024",
              ops[k] / ops[k.replace("2025", "2024")], "fracción", 0, d, x=100)
    fuera = [x for x in meses if not x["se_usa"]]
    ancla("D28.meses_fuera", "meses de 2025 debajo del umbral del mes (septiembre a diciembre)", len(fuera), "meses", 0, "4")
    control("D28: los meses que no pasan son septiembre a diciembre de 2025", [x["mes"] for x in fuera],
            ["2025-09", "2025-10", "2025-11", "2025-12"])
    control("D28: agosto de 2025 es el último mes que pasa", [x["mes"] for x in meses if x["se_usa"]][-1], "2025-08")
    control("D28: ops de enero 2022 (registro: 44)", ops["2022-01"], 44)
    control("D28: ops de diciembre 2022 (registro: 893)", ops["2022-12"], 893)
    return {"anio": 2025, "anio_anterior": 2024, "umbral": umbral, "meses": meses}


def objetivo_y_piloto(e1: dict, eco: dict, lm: dict, kf: list) -> dict:
    """F03, F04 (qué es irse: la tasa de cruce por días para cruzar), C03 (umbral del cliente), el desglose de G64 y la
    lista de muestra de la PoC (E4 A 3.2) con su control contra K16 a K19."""
    import re
    tr = {t["tramo"]: t for t in e1["tramos_de_cruce"]["dev"]}
    tramos = []
    for clave, rot, doc in (("menos de 30", "menos30", "91,7"), ("30 a 59", "30a59", "76,2"),
                            ("60 a 89", "60a89", "65,5"), ("90 o más", "90mas", "0,0")):
        t = tr[clave]
        ancla(f"F04.{rot}", f"tasa de positivos en validación a {clave} días de cruzar el umbral", t["tasa"],
              "fracción", 1, doc, x=100)
        tramos.append({"tramo": clave, "filas": t["filas"], "positivos": t["positivos"], "tasa": t["tasa"]})
    est = e1["ficha"]["estructura"]
    ancla("F03.lejos", "parte de las filas a 90 días o más de cruzar su umbral, sin positivos",
          est["pct_no_alcanzables"], "fracción", 1, "66,5", x=100)
    control("F03: a 90 días o más no hay positivos", est["positivos_no_alcanzables"], 0)
    clave = [k for k in eco["piloto_minimo"]["horas_planilla"] if k.startswith("regla del umbral")]
    m = re.search(r"máx\((\d+); ([\d,]+) ×", clave[0]) if len(clave) == 1 else None
    if not m:
        raise Falta("economia.json: piloto_minimo.horas_planilla sin «umbral = máx(N; F × intervalo mediano)»")
    ancla("C03.minimo_dias", "umbral del cliente: días mínimos", int(m.group(1)), "días", 0, "90")
    ancla("C03.factor", "umbral del cliente: veces el intervalo mediano entre compras",
          float(m.group(2).replace(",", ".")), "veces", 1, "1,5")

    pm = eco["piloto_minimo"]
    lin = pm["lineas"]
    for i, (nombre, doc) in enumerate((("planilla", "900"), ("legal", "750"), ("medicion", "1.350"), ("taller", "900"))):
        ancla(f"G64.{nombre}", lin[i]["componente"], lin[i]["usd"], "USD", 0, doc)
    control("G64 = suma de las cuatro líneas", sum(x["usd"] for x in lin), pm["unicos_usd"])
    ancla("G64.horas_por_lista", "horas de la persona de Marketing por lista",
          pm["horas_marketing"] / eco["piloto"]["meses"], "horas", 0, "8")
    ancla("G49.descuento", "descuento de la rama con descuento", eco["piloto"]["ramas"]["con_descuento"]["descuento"],
          "fracción", 0, "15", x=100)
    m = re.match(r"(\d+) % de mayor", eco["alto_valor"]["definicion"])
    if not m:
        raise Falta("economia.json: alto_valor.definicion no empieza con «N % de mayor»")
    ancla("G49.alto_valor", "el grupo de mayor facturación que se contacta entero (sin control)", int(m.group(1)) / 100,
          "fracción", 0, "20", x=100)

    k = {f["id"]: f["cifra"] for f in kf}
    ancla("K18.con_descuento", "lista de muestra: rama con descuento", lm["rama_con_descuento"], "clientes", 0, "124")
    ancla("K18.sin_descuento", "lista de muestra: rama sin descuento", lm["rama_sin_descuento"], "clientes", 0, "123")
    control("K16 = alto valor de la lista de muestra", lm["alto_valor"], k["K16"])
    control("K17 = fuera del 20 % de la lista de muestra", lm["fuera_del_20"], k["K17"])
    control("K18 = ramas de la lista de muestra", f"{lm['rama_con_descuento']} y {lm['rama_sin_descuento']}", k["K18"])
    control("K19 = las dos ramas", lm["rama_con_descuento"] + lm["rama_sin_descuento"], k["K19"])
    control("lista de muestra: 500 = alto valor + control + ramas",
            lm["alto_valor"] + lm["control"] + lm["rama_con_descuento"] + lm["rama_sin_descuento"], lm["largo"])
    control("lista de muestra: control = G49", lm["control"], eco["piloto"]["control_mes"])
    return {"tramos_de_cruce": tramos,
            "lista_muestra": {"corte": lm["corte"], "largo": lm["largo"], "alto_valor": lm["alto_valor"],
                              "control": lm["control"], "con_descuento": lm["rama_con_descuento"],
                              "sin_descuento": lm["rama_sin_descuento"]}}


def semanas_de(txt: str) -> tuple[int, int]:
    """«1 y 2» → (1, 2); «1 a 3» → (1, 3); «5» → (5, 5); «4 y antes de cada lista» → (4, 4)."""
    import re
    n = [int(x) for x in re.findall(r"\d+", txt.split(" y antes")[0])]
    return (n[0], n[-1])


def valor_ast(nodo, nombres: dict):
    """El valor literal de un nodo, resolviendo además dict(...) y los nombres de cadenas del módulo (MKT)."""
    if isinstance(nodo, ast.Call) and isinstance(nodo.func, ast.Name) and nodo.func.id == "dict":
        return {kw.arg: valor_ast(kw.value, nombres) for kw in nodo.keywords}
    if isinstance(nodo, ast.Name):
        if nodo.id not in nombres:
            raise Falta(f"contenido_a.py del E4: nombre sin valor «{nodo.id}»")
        return nombres[nodo.id]
    if isinstance(nodo, (ast.List, ast.Tuple)):
        v = [valor_ast(e, nombres) for e in nodo.elts]
        return v if isinstance(nodo, ast.List) else tuple(v)
    return literal(nodo)


def gestion_tablas(p: Path, canon: dict, kf: list, cal: dict, c: Path) -> dict:
    """El backlog (E4 A 2.1 y 2.2), el plan (4.1), las acciones legales previas (4.2, criterio 1 de go-live) y los
    riesgos críticos de la C 6.3, leídos con ast de los generadores; controles contra las K y contra G63."""
    import re
    arbol = ast.parse(p.read_text(encoding="utf-8"))
    nombres, epicas, historias, previas = {}, None, None, None
    for nodo in arbol.body:
        if isinstance(nodo, ast.Assign) and isinstance(nodo.targets[0], ast.Name):
            n = nodo.targets[0].id
            if isinstance(nodo.value, ast.Constant) and isinstance(nodo.value.value, str):
                nombres[n] = nodo.value.value
            elif n == "EPICAS":
                epicas = literal(nodo.value)
            elif n == "HISTORIAS":
                historias = valor_ast(nodo.value, nombres)
    for nodo in ast.walk(arbol):
        if (isinstance(nodo, ast.Call) and isinstance(nodo.func, ast.Name) and nodo.func.id == "T" and nodo.args
                and isinstance(nodo.args[0], ast.Constant) and nodo.args[0].value == "Precondiciones de la primera lista"):
            previas = literal(nodo.args[2])
    if epicas is None or historias is None or previas is None:
        raise Falta("contenido_a.py del E4: falta EPICAS, HISTORIAS o la tabla «Precondiciones de la primera lista»")
    k = {f["id"]: f["cifra"] for f in kf}
    grupo = {"hecha": "hecha", "planilla": "piloto", "legal": "piloto", "piloto": "piloto", "despues": "despues"}
    hs = [{"id": h["id"], "epica": int(h["id"].split("-")[1]), "grupo": grupo[h["grupo"]]} for h in historias]
    control("K01 = épicas del backlog", len(epicas), k["K01"])
    control("K02 = historias", len(hs), k["K02"])
    control("K04 = hechas", sum(h["grupo"] == "hecha" for h in hs), k["K04"])
    control("K05 = del piloto mínimo", sum(h["grupo"] == "piloto" for h in hs), k["K05"])
    control("K06 = después del piloto", sum(h["grupo"] == "despues" for h in hs), k["K06"])
    control("K07 = horas de las historias del piloto",
            sum(h["horas"] or 0 for h in historias if grupo[h["grupo"]] == "piloto"), k["K07"])

    pl = canon["plan"]
    fases = []
    for f in pl["fases"]:
        a, b = semanas_de(f["semanas"])
        fases.append({"n": f["n"], "fase": f["fase"], "desde": a, "hasta": b, "responsable": f["responsable"]})
    control("K14 = duración de cada fase", ", ".join(str(f["hasta"] - f["desde"] + 1) for f in fases), k["K14"])
    hitos = [{"n": h["n"], "semana": h["semana"], "responsable": h["responsable"]} for h in pl["hitos"]]
    sem = {h["n"]: h["semana"] for h in hitos}
    control("hito 7 (go-live) = semana de la primera lista (G63)", sem[7], cal["primera_lista"]["semana"])
    control("hito 8 = semana de la tercera lista (G63)", sem[8], cal["tercera_lista"]["semana"])
    control("hito 9 = semana del informe preliminar (G63)", sem[9], cal["preliminar"]["semana"])
    control("hito 10 = semana de la decisión (G63)", sem[10], cal["final"]["semana"])
    control("la última fase termina en la semana de la decisión", fases[-1]["hasta"], cal["final"]["semana"])

    acciones = []
    for prec, resp, semana, _ in previas:
        m = re.search(r"\((L\d)\)|filtro (L\d)", prec)
        if m:
            acciones.append({"codigo": m.group(1) or m.group(2), "semana": semanas_de(semana)[0]})
    acciones.sort(key=lambda x: x["semana"])
    criterio_1 = re.findall(r"L\d", pl["criterios_go_live"][0]["criterio"])
    control("acciones legales previas = las del criterio 1 de go-live", sorted(a["codigo"] for a in acciones),
            sorted(criterio_1))
    control("L4 en la semana del hito 1", [a["semana"] for a in acciones if a["codigo"] == "L4"], [sem[1]])
    control("acciones legales previas antes de la primera lista", max(a["semana"] for a in acciones) < sem[7], True)

    top3 = None
    for nodo in ast.parse(c.read_text(encoding="utf-8")).body:
        if isinstance(nodo, ast.Assign) and any(isinstance(x, ast.Name) and x.id == "TOP3" for x in nodo.targets):
            top3 = literal(nodo.value.elts[0])
    if top3 is None:
        raise Falta("contenido_c.py: no encuentro TOP3")
    return {"backlog": {"epicas": [{"n": e[0], "nombre": e[1]} for e in epicas], "historias": hs},
            "plan": {"semanas": cal["final"]["semana"], "fases": fases, "hitos": hitos},
            "legal_previas": {"n": len(acciones), "acciones": acciones},
            "riesgos_criticos": {"n": len(top3)}}


def tablas(eco: dict, cal: dict) -> dict:
    u = eco["umbral_de_pase"]["por_variante"]
    filas = []
    for etapa, horizonte, rotulo, decide in (
            ("operacion_minima", "primer_anio_con_la_inversion_que_queda", "operación mínima, primer año", True),
            ("operacion_minima", "solo_recurrente", "operación mínima, solo recurrente", False),
            ("produccion_completa", "primer_anio_con_la_inversion_que_queda", "producción completa, primer año", False),
            ("produccion_completa", "solo_recurrente", "producción completa, solo recurrente (referencia)", False)):
        v = u[etapa][horizonte]
        filas.append({"etapa": etapa, "horizonte": horizonte, "rotulo": rotulo, "decide": decide,
                      "costo_usd": v["con_descuento"]["costo_anual_usd"],
                      "con_descuento_pp": v["con_descuento"]["diferencia_cruce_90d_pp"],
                      "sin_descuento_pp": v["sin_descuento"]["diferencia_cruce_90d_pp"]})
    return {
        "condiciones": [{"id": i, "nombre": n, "puntaje": p} for (i, n), p in zip(CONDICIONES, PUNTAJES["condiciones"])],
        "escala_tecnica": {"hasta": 3},
        "legal": [{"id": i, "nombre": n, "puntaje": p} for (i, n), p in zip(LEGAL, PUNTAJES["legal"])],
        "umbral_de_pase": filas,
        "calendario": cal,
    }


# ============================================================ main

def main() -> int:
    falta = [str(p) for p in list(FUENTES.values()) + list(GENERADORES.values()) + list(CRUDOS.values())
             if not p.exists()]
    if falta:
        print("faltan fuentes:\n  " + "\n  ".join(falta))
        return 1
    usadas = {**FUENTES, **GENERADORES, **CRUDOS}
    try:
        eco, cv, e1, co, e2, e3, e4, ind, kf, lm, canon = (cargar(FUENTES[k]) for k in
                                                  ("economia", "cv_temporal", "etapa1", "condiciones", "etapa2",
                                                   "etapa3", "etapa4", "indicador_6_5", "cifras_f3", "lista_muestra",
                                                   "canon"))
        cal = economia(eco)
        control("E3A-01 de economia.json = cv_temporal.json", eco["rango_anual"]["trimestre_x4_usd"][0],
                cv["roi"]["mvp_proporcional_a_500_sin_filtro"]["beneficio_min"])
        modelado(e1, e2, e3, e4, co)
        indicador(ind, e3)
        if OPCIONALES["devoluciones"].exists():
            devueltas(cargar(OPCIONALES["devoluciones"]))
            usadas["devoluciones"] = OPCIONALES["devoluciones"]
        kfl = kf if isinstance(kf, list) else kf["filas"]
        gestion(kfl, eco, cal)
        tab = tablas(eco, cal)
        tab["ventas_2025"] = ventas(CRUDOS["transacciones"], co, canon)
        tab.update(objetivo_y_piloto(e1, eco, lm, kfl))
        tab.update(gestion_tablas(GENERADORES["contenido_a_e4"], canon, kfl, cal, GENERADORES["contenido_c"]))
    except Falta as e:
        print(f"FALLA de entrada: {e}. No se escribe {SALIDA.relative_to(APP)}.")
        return 1

    print(f"{'ID':28s}{'DOCUMENTO':>14s}{'PANTALLA':>14s}  OK")
    for a in FILAS:
        print(f"{a['id']:28s}{a['doc']:>14s}{a['mostrado']:>14s}  {'OK' if a['ok'] else 'FALLA'}")
    print(f"\n{'CONTROL':60s}  OK")
    for c in CONTROLES:
        print(f"{c['nombre'][:60]:60s}  {'OK' if c['ok'] else 'FALLA: ' + repr(c['a']) + ' contra ' + repr(c['b'])}")
    fallan = [a for a in FILAS if not a["ok"]] + [c for c in CONTROLES if not c["ok"]]
    if fallan:
        print(f"\n{len(fallan)} anclas o controles no cierran. No se escribe {SALIDA.relative_to(APP)}.")
        return 1

    df = {
        "meta": {
            "version": "final-1.0",
            "fuentes": [{"archivo": p.name, "sha256": sha256(p)} for p in usadas.values()],
        },
        "anclas": ANCLAS,
        "tablas": tab,
    }
    texto = json.dumps(df, ensure_ascii=False, indent=1)
    js = ("// Generado por pipeline/build_final.py desde los JSON del vault (canon de la corrida, tableros.final). No editar a mano.\n"
          "// Cada ancla es una fila del registro de cifras del E4 por su id: valor, unidad y texto con las reglas de\n"
          "// e3/src/formato.js.\n"
          f"export const DF = {texto};\n")
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    if SALIDA.exists() and SALIDA.read_text(encoding="utf-8") == js:
        print(f"\n{len(FILAS)} anclas y {len(CONTROLES)} controles en verde. {SALIDA.relative_to(APP)} sin cambios.")
        return 0
    SALIDA.write_text(js, encoding="utf-8")
    print(f"\n{len(FILAS)} anclas y {len(CONTROLES)} controles en verde. Escrito {SALIDA.relative_to(APP)} "
          f"({len(js.encode('utf-8')) / 1024:.1f} KB).")
    return 0


if __name__ == "__main__":
    sys.exit(main())

"""
Build final: capa de datos de /final/, la presentación final del 24/11/2026 (canon v1.1, tableros.final).

    python3 -I pipeline/build_final.py

Reemplaza a la decisión N0-7 (/final/ leía D3 de e3/src/datos_e3.js): /final/ tiene payload propio, sacado de los
JSON del vault que escriben los generadores de las partes, sin copia intermedia. Lee, sin modificarlos:

- entregas/entregable-3/_build/B/economia/salida/economia.json (v3.0: piloto mínimo, operación mínima, producción
  completa, umbral de pase, potencia, valor de la información y calendario desde la aprobación) y cv_temporal.json
- entregas/entregable-3/_build/A/modelado/salida/etapa1.json y devoluciones_v02.json (si existe);
  _build/A/factibilidad/salida/condiciones.json
- entregas/entregable-3/_build/B/modelado/salida/etapa2.json, _build/C/modelado/salida/etapa3.json,
  _build/D/modelado/salida/etapa4.json
- .workforce/presentacion-final/fase-4/cifras-F3.json: las cifras K de la parte de Gestión del E4

Escribe final/src/datos_final.js con «export const DF = {...}». Solo biblioteca estándar.

Anclas: cada una es una fila del registro de cifras del E4 (wiki/entregables/cifras-entregable-4.md) por su id; una
fila con varios valores usa «id.parte» (G67.con_descuento). Cada ancla compara el valor leído del JSON, formateado
como lo muestra la pantalla (toFixed de JS, punto de miles, coma decimal, menos U+2212: las reglas de
e3/src/formato.js), con el número que escribe el documento entregado, escrito acá como literal. Además, controles
cruzados entre fuentes (G64 contra las K, G39 contra G64 + G65, calendario contra K15). Si algo no cierra, imprime
la tabla y sale con código 1 sin escribir nada.

Determinista: dos corridas seguidas dan los mismos bytes (sin fechas de corrida; las fuentes van con su sha256).
"""
from __future__ import annotations

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
    "cifras_f3": VAULT / ".workforce" / "presentacion-final" / "fase-4" / "cifras-F3.json",
}
OPCIONALES = {"devoluciones": E3 / "A" / "modelado" / "salida" / "devoluciones_v02.json"}

# Constantes que no vienen en los JSON (se dicen en su fila del registro):
# A 1.2, tabla de scoring (F16): la capacidad humana sigue en 2 con otra razón (canon plan.capacidad_humana_a_1_2).
CONDICIONES = [("datos", "Datos suficientes", 3), ("calidad", "Calidad utilizable", 2),
               ("infraestructura", "Infraestructura", 2), ("capacidad_humana", "Capacidad humana", 2)]
# C 5.3 v3.0, puntaje legal del estado actual (H40, canon economia.legal): protección de datos baja de 2 a 1.
LEGAL = [("proteccion_datos", "Protección de datos personales", 1), ("seguridad", "Seguridad y control de accesos", 2),
         ("conservacion", "Conservación y trazabilidad fiscal", 2), ("contratos", "Contratos con proveedores externos", 2),
         ("explicabilidad", "Explicabilidad del modelo (IA)", 2)]
TRAMO_CON_CONDICIONES = (1.6, 2.5)


# ============================================================ utilidades

def sha256(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def cargar(p: Path) -> dict:
    return json.loads(p.read_text(encoding="utf-8"))


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

    puntajes = [p for _, _, p in CONDICIONES]
    ancla("F16", "puntaje técnico de la A 1.2, promedio de las cuatro condiciones", sum(puntajes) / len(puntajes),
          "de 3", 2, "2,25")
    ancla("G10", "positivos para entrenar (entrenamiento con embargo)", e2["particion"]["entrenamiento"]["positivos"],
          "filas", 0, "4.636")
    ancla("C19", "ventas sin cliente identificado", co["nulos"]["ventas_sin_cliente_pct"], "%", 1, "44,8")

    legal = [p for _, _, p in LEGAL]
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
        else:
            texto_fijo(i, f["definicion"], str(f["cifra"]))
    faltan = [k for k in ("K01", "K02", "K03", "K07", "K08", "K09", "K10", "K12", "K15") if k not in por_id]
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
    d1, h1 = fecha(cal["semana_1"]), fecha(cal["semana_1_hasta"])
    control("K15 trae la semana 1 de G63", f"1: {d1[:5]} al {h1}" in por_id["K15"], True)
    control("K15 trae la semana 6 de G63", f"6: {fecha(cal['primera_lista']['lunes'])[:5]} al" in por_id["K15"], True)


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
        "condiciones": [{"id": i, "nombre": n, "puntaje": p} for i, n, p in CONDICIONES],
        "escala_tecnica": {"hasta": 3},
        "legal": [{"id": i, "nombre": n, "puntaje": p} for i, n, p in LEGAL],
        "umbral_de_pase": filas,
        "calendario": cal,
    }


# ============================================================ main

def main() -> int:
    falta = [str(p) for p in FUENTES.values() if not p.exists()]
    if falta:
        print("faltan fuentes:\n  " + "\n  ".join(falta))
        return 1
    eco, cv, e1, co, e2, e3, e4, kf = (cargar(FUENTES[k]) for k in
                                         ("economia", "cv_temporal", "etapa1", "condiciones", "etapa2", "etapa3",
                                          "etapa4", "cifras_f3"))
    cal = economia(eco)
    control("E3A-01 de economia.json = cv_temporal.json", eco["rango_anual"]["trimestre_x4_usd"][0],
            cv["roi"]["mvp_proporcional_a_500_sin_filtro"]["beneficio_min"])
    modelado(e1, e2, e3, e4, co)
    usadas = dict(FUENTES)
    if OPCIONALES["devoluciones"].exists():
        devueltas(cargar(OPCIONALES["devoluciones"]))
        usadas["devoluciones"] = OPCIONALES["devoluciones"]
    gestion(kf if isinstance(kf, list) else kf["filas"], eco, cal)

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
            "registro": "wiki/entregables/cifras-entregable-4.md",
            "fuentes": [{"archivo": str(p.relative_to(VAULT)), "sha256": sha256(p)} for p in usadas.values()],
        },
        "anclas": ANCLAS,
        "tablas": tablas(eco, cal),
    }
    texto = json.dumps(df, ensure_ascii=False, indent=1)
    js = ("// Generado por pipeline/build_final.py desde los JSON del vault (canon v1.1, tableros.final). No editar a mano.\n"
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

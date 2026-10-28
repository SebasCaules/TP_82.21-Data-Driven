"""
Build E3: capa de datos de la presentación interactiva /e3/ (contrato en pipeline/CONTRACT_E3.md).

    python3 -I pipeline/build_e3.py

Lee, sin modificarlos:
- data/e3/etapa2.json, etapa3.json, economia.json y condiciones.json: copias byte a byte de la salida
  de los generadores de las partes A, B y C del Entregable 3; etapa4.json y etapa4_validacion.json, de la
  etapa 4 de la Parte D (el test, abierto una sola vez). Las deja
  entregas/entregable-3/_build/F/presentacion/exportar_web.py.
- src/datos.js (payload del tablero del E1) y data/raw/Campanias_marketing.csv (copia de la cátedra).
- e3/src/contenido_e3.js: el texto de la presentación (C3), para comprobar que cada ancla que la
  diapositiva escribe está escrita igual ahí.

Escribe e3/src/datos_e3.js con «export const D3 = {...}». Solo biblioteca estándar.

Anclas: cada una compara un valor de D3, formateado como lo mostrará la pantalla (toFixed de JS con
coma decimal y punto de miles), con el número que escribe el documento entregado, escrito acá como
literal junto al id de su fila en wiki/entregables/cifras-entregable-3.md. Si una no cierra, imprime
la tabla y sale con código 1 sin escribir nada. Aparte, los controles de reimplementación comparan
la fórmula de la grilla económica (copiada de _build/B/economia/economia.py) con lo que ese script
escribió en economia.json.

Determinista: dos corridas dan los mismos bytes.
"""
from __future__ import annotations

import hashlib
import json
import sys
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

APP = Path(__file__).resolve().parents[1]
DATOS = APP / "data" / "e3"
CONTENIDO = APP / "e3" / "src" / "contenido_e3.js"
SALIDA = APP / "e3" / "src" / "datos_e3.js"
ENTRADAS = ("etapa2.json", "etapa3.json", "economia.json", "condiciones.json", "etapa4.json", "etapa4_validacion.json",
            "serie_riesgo.json")
# (27/10, W3) dos fuentes de la app que no son de las partes del E3: el payload del tablero del E1 (C08, C14, C18)
# y la copia de los datos crudos de la cátedra (J51). Su sha256 también va en D3.meta.fuentes.
# (28/10, F6b) serie_riesgo.json es la serie de la alerta de drift de la D v1.3, 10.2 (J53), que escribe
# entregas/entregable-3/_build/D/drift/serie_riesgo.py; reemplaza al semáforo del E1 (J52).
E1_PAYLOAD = APP / "src" / "datos.js"
CAMPANIAS = APP / "data" / "raw" / "Campanias_marketing.csv"

# Constantes que no vienen en los JSON: salen del texto de la Parte A y se dicen en el contrato.
# A 2.1, definición del target: θ = máx(90 días; 1,5 × intervalo mediano), ventana de 90 días.
FACTOR_UMBRAL, PISO_DIAS, VENTANA_DIAS = 1.5, 90, 90
# A 1.2, tabla de scoring (F16): condiciones.json no trae los puntajes.
CONDICIONES = [("datos", "Datos suficientes", 3), ("calidad", "Calidad utilizable", 2),
               ("infraestructura", "Infraestructura", 2), ("capacidad_humana", "Capacidad humana", 2)]
# A 1.2, escala de interpretación del promedio.
ESCALA = [(1.0, 1.5, "No factible"), (1.6, 2.0, "Factibilidad baja"),
          (2.1, 2.5, "Factibilidad media"), (2.6, 3.0, "Factibilidad alta")]
# Grilla de la tasa de éxito: paso de 0,01 puntos hasta 5 % y de 0,1 puntos hasta 100 %.
TRAMOS_GRILLA = [(0.0, 0.05, 0.0001), (0.05, 1.0, 0.001)]


# ============================================================ utilidades

def cargar(nombre: str) -> dict:
    return json.loads((DATOS / nombre).read_text(encoding="utf-8"))


def sha256(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def es(x, dec: int = 0) -> str:
    """El número como lo muestra la pantalla: toFixed(dec) de JS (mitad lejos del cero, sobre el valor
    binario exacto), punto de miles, coma decimal y el menos tipográfico."""
    d = Decimal(x).quantize(Decimal(1).scaleb(-dec), rounding=ROUND_HALF_UP)
    signo = "−" if d < 0 else ""
    ent, _, fr = f"{abs(d):f}".partition(".")
    return signo + f"{int(ent):,}".replace(",", ".") + ("," + fr if fr else "")


def r6(x: float) -> float:
    """Valores de la grilla con 6 decimales; sin −0."""
    y = round(x, 6)
    return 0.0 if y == 0 else y


def cargar_c3() -> dict:
    texto = CONTENIDO.read_text(encoding="utf-8")
    marca = "export const C3 = "
    if marca not in texto:
        sys.exit(f"{CONTENIDO}: no encuentro «{marca}». Corre antes exportar_web.py.")
    return json.loads(texto[texto.index(marca) + len(marca):texto.rindex(";")])


# ============================================================ anclas y controles

ANCLAS: list[dict] = []
CONTROLES: list[dict] = []
C3_TEXTO: dict[str, str] = {}


def ancla(id_: str, nombre: str, valor, doc: str, dec: int | None = None, x: float = 1.0,
          donde: str = "", c3: str | None = None) -> None:
    """valor × x formateado con dec decimales tiene que dar doc, el número que escribe el documento.
    Con dec None compara valor == doc tal cual. c3: «d6» o «A2», donde C3 tiene que escribir doc."""
    mostrado = valor if dec is None else es(valor * x, dec)
    ok = mostrado == doc
    nota = ""
    if c3 is not None:
        if doc not in C3_TEXTO[c3]:
            ok, nota = False, f"C3 {c3} no escribe «{doc}»"
    ANCLAS.append({"id": id_, "nombre": nombre, "documento": doc, "mostrado": mostrado,
                   "donde": donde + (f" · C3 {c3}" if c3 else ""), "ok": ok, "nota": nota})


def control(nombre: str, valor: float, json_valor: float, tol: float = 1e-9) -> None:
    ok = abs(valor - json_valor) <= tol * max(1.0, abs(json_valor))
    CONTROLES.append({"nombre": nombre, "valor": valor, "json": json_valor, "ok": ok})


# ============================================================ piezas

def armar_caso(e3: dict) -> dict:
    cr = e3["caso_real"]
    v = cr["valores"]
    caso = {
        "id_cliente": cr["id_cliente_canonico"], "corte": cr["corte"],
        "gap_mediano_dias": v["gap_mediano"], "umbral_dias": v["umbral"], "recency_dias": v["recency_dias"],
        "dias_para_cruzar": v["dias_para_cruzar"], "ventana_dias": VENTANA_DIAS,
        "factor_umbral": FACTOR_UMBRAL, "piso_dias": PISO_DIAS,
        "y_churn_90": cr["y_churn_90"], "cruzo_en_la_ventana": cr["y_churn_90"] == 1,
        "puesto_lista_modelo": cr["puesto_en_la_lista"], "puesto_lista_regla": cr["puesto_en_la_regla"],
        "probabilidad": cr["probabilidad"],
    }
    ancla("H23", "caso: intervalo mediano (días)", caso["gap_mediano_dias"], "162", 0, donde="C 7.3", c3="d3")
    ancla("H23", "caso: umbral (días)", caso["umbral_dias"], "243", 0, donde="C 7.3", c3="d3")
    ancla("H23", "caso: días sin comprar al corte", caso["recency_dias"], "181", 0, donde="C 7.3", c3="d3")
    ancla("H23", "caso: días que faltaban", caso["dias_para_cruzar"], "62", 0, donde="registro H23; gráfico d3")
    ancla("H23", "caso: corte", caso["corte"], "2024-07-31", donde="registro H23 (31/07/2024)")
    ancla("H23", "caso: cruzó en los 90 días", caso["cruzo_en_la_ventana"], True, donde="C 7.3")
    ancla("A 2.1", "caso: umbral = máx(90; 1,5 × intervalo)",
          max(PISO_DIAS, FACTOR_UMBRAL * caso["gap_mediano_dias"]), "243", 0, donde="definición del target")
    ancla("H23", "caso: faltaban = umbral − días sin comprar",
          caso["umbral_dias"] - caso["recency_dias"], "62", 0, donde="registro H23")
    return caso


def armar_tecnica(e2: dict, co: dict, c3: dict) -> dict:
    puntajes = [p for _, _, p in CONDICIONES]
    promedio = sum(puntajes) / len(puntajes)
    nivel = next(n for lo, hi, n in ESCALA if lo <= round(promedio, 2) <= hi)
    tec = {
        "condiciones": [{"id": i, "nombre": n, "puntaje": p} for i, n, p in CONDICIONES],
        "promedio": promedio, "nivel": nivel,
        "escala": [{"desde": lo, "hasta": hi, "nivel": n} for lo, hi, n in ESCALA],
        "positivos_entrenamiento": e2["particion"]["entrenamiento"]["positivos"],
        "ventas_sin_cliente_pct": co["nulos"]["ventas_sin_cliente_pct"],
    }
    ancla("F16", "técnica: promedio", promedio, "2,25", 2, donde="A 1.2", c3="d4")
    ancla("F16", "técnica: nivel", nivel, "Factibilidad media", donde="A 1.3 (2,1 a 2,5)")
    filas_d4 = [f["rotulo"] for f in next(d for d in c3["DIAPOSITIVAS"] if d["n"] == 4)["filas"]]
    rotulos = {"datos": "Datos", "calidad": "Calidad", "infraestructura": "Infraestructura",
               "capacidad_humana": "Capacidad humana"}
    # (27/10) El puntaje de cada fila de la 4 lo dibuja la web desde D3 («3/3»); C3 solo trae el rótulo, en el
    # mismo orden que las condiciones.
    for k, (i, _, p) in enumerate(CONDICIONES):
        ancla("F16", f"técnica: rótulo {i}", filas_d4[k] == rotulos[i], True, donde="A 1.2 · C3 d4 filas")
    ancla("G10", "técnica: positivos para entrenar", tec["positivos_entrenamiento"], "4.636", 0, donde="A 1.1", c3="d4")
    ancla("C19", "técnica: ventas sin cliente (%)", tec["ventas_sin_cliente_pct"], "44,8", 1, donde="A 1.2", c3="d4")
    return tec


def _medidas(lst: dict) -> dict:
    return {"precision": lst["precision"], "recall": lst["recall"], "aciertos": lst["aciertos"],
            "largo": lst["largo"], "positivos": lst["positivos"]}


def armar_modelos(e2: dict, e3: dict) -> dict:
    pa, m = e2["particion"], e2["modelos"]
    pr = next(f for f in e3["umbral"]["filas"]["practica_actual"] if f["umbral"] == "lista de 500 por corte")
    tope = pa["maximo_lista_500"]["entrenamiento"]

    def modelo(clave, id_, nombre, grupo):
        mm = m[clave]
        return {"id": id_, "nombre": nombre, "grupo": grupo,
                "entrenamiento": _medidas(mm["entrenamiento"]["lista_500"]),
                "validacion": _medidas(mm["validacion"]["lista_500"]),
                "auc_pr_validacion": mm["validacion"]["auc_pr"]}

    filas = [
        {"id": "tasa_base", "nombre": "Clase mayoritaria (lista sin orden)", "grupo": "hoy",
         "entrenamiento": {"precision": pa["entrenamiento"]["tasa"]},
         "validacion": {"precision": pa["validacion"]["tasa"]}},
        {"id": "practica_actual", "nombre": "Práctica actual: más días sin comprar", "grupo": "hoy",
         "entrenamiento": None,
         "validacion": {"precision": pr["precision"], "recall": pr["recall"], "aciertos": pr["vp"],
                        "largo": pr["casos_marcados"], "positivos": pa["validacion"]["positivos"]}},
        modelo("arbol", "arbol", "Árbol de decisión", "modelo"),
        modelo("hgb", "hgb", "Gradient boosting", "modelo"),
        modelo("regla_umbral", "regla_umbral", "Regla del umbral, sin modelo", "regla"),
        modelo("logistica", "logistica", "Regresión logística", "modelo"),
    ]
    cr = e2["mejor"]["contra_regla"]
    coef = {c["termino"]: c["coeficiente"] for c in e2["coeficientes_logistica"]}
    mod = {
        "validacion": {"desde": pa["validacion"]["desde"], "hasta": pa["validacion"]["hasta"],
                       "cortes": pa["validacion"]["cortes"], "filas": pa["validacion"]["filas"],
                       "positivos": pa["validacion"]["positivos"], "tasa": pa["validacion"]["tasa"],
                       "largo_lista": pa["maximo_lista_500"]["validacion"]["largo"]},
        "entrenamiento": {"desde": pa["entrenamiento"]["desde"], "hasta": pa["entrenamiento"]["hasta"],
                          "cortes": pa["entrenamiento"]["cortes"], "filas": pa["entrenamiento"]["filas"],
                          "positivos": pa["entrenamiento"]["positivos"], "tasa": pa["entrenamiento"]["tasa"],
                          "largo_lista": tope["largo"], "techo_aciertos": tope["aciertos_maximos"],
                          "techo_precision": tope["precision_maxima"]},
        "filas": filas,
        "contra_regla": {"modelo": e2["mejor"]["modelo"], "diferencia_pp": cr["diferencia_precision_pp"],
                         "ic95_pp": [cr["bootstrap"]["ic95"][0] * 100, cr["bootstrap"]["ic95"][1] * 100],
                         "aciertos_de_mas": cr["diferencia_aciertos"],
                         "contactos": pa["maximo_lista_500"]["validacion"]["largo"],
                         "replicas_a_favor": cr["bootstrap"]["replicas_con_a_mejor"]},
        "coeficientes": [{"variable": "gap_mediano", "coeficiente": coef["gap_mediano"]},
                         {"variable": "recency_dias", "coeficiente": coef["recency_dias"]}],
    }
    f = {r["id"]: r for r in filas}
    ancla("F08", "modelos: tasa base en validación (%)", f["tasa_base"]["validacion"]["precision"], "23,9", 1, 100,
          donde="A 2.5; gráfico d6")
    ancla("F07", "modelos: práctica actual (%)", f["practica_actual"]["validacion"]["precision"], "36,2", 1, 100,
          donde="A 2.5", c3="d6")
    ancla("G14", "modelos: árbol en validación (%)", f["arbol"]["validacion"]["precision"], "80,5", 1, 100,
          donde="B 4.1; gráfico d6")
    ancla("G15", "modelos: gradient boosting en validación (%)", f["hgb"]["validacion"]["precision"], "81,5", 1, 100,
          donde="B 4.1; gráfico d6")
    ancla("G11", "modelos: regla en validación (%)", f["regla_umbral"]["validacion"]["precision"], "81,6", 1, 100,
          donde="B 4.1", c3="d6")
    ancla("G11", "modelos: aciertos de la regla", f["regla_umbral"]["validacion"]["aciertos"], "1.223,67", 2,
          donde="B 4.1")
    ancla("G13", "modelos: logística en validación (%)", f["logistica"]["validacion"]["precision"], "82,5", 1, 100,
          donde="B 4.1", c3="d6")
    ancla("G13", "modelos: logística en entrenamiento (%)", f["logistica"]["entrenamiento"]["precision"], "62,4", 1,
          100, donde="B 4.1")
    ancla("G10", "modelos: tasa base en entrenamiento (%)", f["tasa_base"]["entrenamiento"]["precision"], "31,4", 1,
          100, donde="B 4.1")
    ancla("G11", "modelos: regla en entrenamiento (%)", f["regla_umbral"]["entrenamiento"]["precision"], "62,7", 1,
          100, donde="B 4.2")
    ancla("G14", "modelos: árbol en entrenamiento (%)", f["arbol"]["entrenamiento"]["precision"], "62,5", 1, 100,
          donde="B 4.1")
    ancla("G15", "modelos: gradient boosting en entrenamiento (%)", f["hgb"]["entrenamiento"]["precision"], "66,0", 1,
          100, donde="B 4.1", c3="d6")
    ancla("G12", "modelos: techo de la lista en entrenamiento (%)", tope["precision_maxima"], "66,3", 1, 100,
          donde="B 4.1", c3="d6")
    ancla("G17", "modelos: logística − regla (puntos)", mod["contra_regla"]["diferencia_pp"], "0,89", 2,
          donde="B 4.2", c3="d6")
    ancla("G17", "modelos: IC 95 % inferior (puntos)", mod["contra_regla"]["ic95_pp"][0], "−0,21", 2,
          donde="B 4.2", c3="d6")
    ancla("G17", "modelos: IC 95 % superior (puntos)", mod["contra_regla"]["ic95_pp"][1], "1,91", 2,
          donde="B 4.2", c3="d6")
    ancla("G17", "modelos: aciertos de más en 1.500", mod["contra_regla"]["aciertos_de_mas"], "13,3", 1,
          donde="B 4.2", c3="d6")
    ancla("G17", "modelos: contactos de validación", mod["contra_regla"]["contactos"], "1.500", 0,
          donde="B 4.2", c3="d6")
    ancla("G24", "modelos: coeficiente de gap_mediano", coef["gap_mediano"], "−5,07", 2, donde="B 4.2", c3="d6")
    ancla("G24", "modelos: coeficiente de recency_dias", coef["recency_dias"], "2,34", 2, donde="B 4.2", c3="d6")
    return mod


METODOS = {"modelo": "logistica_ajustada", "regla_umbral": "regla", "practica_actual": "practica_actual"}

# Importancia por permutación: las variables que escribe la C 7.3 y la etiqueta del gráfico de d7.
ETIQUETAS_IMPORTANCIA = {
    "gap_mediano": "días entre compras",
    "recency_sobre_umbral": "días sin comprar ÷ umbral",
    "recency_dias": "días sin comprar",
    "ticket_90d": "ticket de 90 días",
    "envios_acum": "envíos acumulados",
    "edad": "edad",
}
DE_LA_REGLA = ("gap_mediano", "recency_sobre_umbral", "recency_dias")


def _fila_lista(metodo: str, filtro: str, r: dict) -> dict:
    tipo = {"lista": "lista", "lista filtrada": "lista", "umbral": "umbral"}[r["tipo"]]
    if r["umbral"].startswith("regla como clasificador"):
        tipo = "clasificador"
    largo = r["por_corte"][0] if tipo == "lista" else None
    if tipo == "lista" and len(set(r["por_corte"])) != 1:
        sys.exit(f"lista con largo distinto por corte: {r['umbral']}")
    c = r.get("contactables")
    return {"metodo": metodo, "filtro": filtro, "tipo": tipo, "largo_mes": largo, "por_corte": r["por_corte"],
            "casos": r["casos_marcados"], "vp": r["vp"], "fp": r["fp"], "precision": r["precision"],
            "recall": r["recall"], "usd_anio": r["valor_neto_anual_usd"],
            "contactables": None if not c else {"quedan": c["quedan"], "vp": c["vp"], "precision": c["precision"]}}


def armar_lista(e3: dict) -> dict:
    u = e3["umbral"]
    filas = []
    for grupo, filtro in (("filas", "sin_filtro"), ("filtradas", "contactables")):
        for clave, metodo in METODOS.items():
            filas.extend(_fila_lista(metodo, filtro, r) for r in u[grupo][clave])

    def busca(metodo, filtro, largo=None, tipo="lista"):
        return next(f for f in filas if f["metodo"] == metodo and f["filtro"] == filtro and f["tipo"] == tipo
                    and (largo is None or f["largo_mes"] == largo))

    m500c, r500c = busca("logistica_ajustada", "contactables", 500), busca("regla", "contactables", 500)
    m500 = busca("logistica_ajustada", "sin_filtro", 500)
    med = e3["medidos"]
    imp = {r["variable"]: r for r in e3["importancia"]}
    orden = sorted(e3["importancia"], key=lambda r: -r["caida_lista_500_pp"])
    ultima = max(orden.index(imp[v]) for v in ETIQUETAS_IMPORTANCIA)
    lista = {
        "validacion": {"cortes": len(u["contactables_por_corte"]), "filas": e3["segmentos"]["global"]["filas"],
                       "positivos": e3["segmentos"]["global"]["positivos"],
                       "contactables": u["contactables_en_validacion"],
                       "contactables_por_corte": u["contactables_por_corte"],
                       "positivos_contactables": round(m500c["vp"] / m500c["recall"]),
                       "sin_consentimiento": u["sin_consentimiento"], "con_baja": u["con_baja"]},
        "filas": filas,
        "elegida": {"metodo": "regla", "filtro": "contactables", "largo_mes": 500},
        "elegida_modelo": {"metodo": "logistica_ajustada", "filtro": "contactables", "largo_mes": 500},
        "regla_menos_modelo_500_contactables": {
            "aciertos": r500c["vp"] - m500c["vp"],
            "ic95_pp_modelo_menos_regla": [x * 100 for x in e3["contra"]["filtrada_logistica_ajustada_menos_regla"]["ic95"]]},
        # (27/10, crítica del W3, hallazgo 3) H06: la logística ajustada menos la regla en la lista de 500 sin
        # filtro de validación, la fila «Sin filtrar · validación» de la vista 4 (la D 11.2 la cita: «−0,50 a
        # +1,81 en la C»). Hasta W3 esa fila usaba G17, la logística de la Parte B sin ajustar.
        "modelo_menos_regla_500_sin_filtro": {
            "diferencia_pp": (m500["vp"] - busca("regla", "sin_filtro", 500)["vp"]) / m500["casos"] * 100,
            "ic95_pp": [x * 100 for x in e3["contra"]["logistica_ajustada_menos_regla"]["ic95"]],
            "aciertos_de_mas": m500["vp"] - busca("regla", "sin_filtro", 500)["vp"],
            "replicas_a_favor": e3["contra"]["logistica_ajustada_menos_regla"]["replicas_con_a_mejor"]},
        "no_contactables_lista_500": m500["casos"] - m500["contactables"]["quedan"],
        "precision_de_equilibrio": u["precision_de_equilibrio"],
        "ajuste": {
            "pliegues": len(e3["pliegues"]),
            "brecha_pp": [
                {"id": "regla_umbral", "antes": med["regla_umbral"]["brecha"]["lista_proporcional_pp"], "despues": None},
                {"id": "logistica", "antes": med["logistica_inicial"]["brecha"]["lista_proporcional_pp"],
                 "despues": med["logistica_ajustada"]["brecha"]["lista_proporcional_pp"]},
                {"id": "hgb", "antes": med["hgb_inicial"]["brecha"]["lista_proporcional_pp"],
                 "despues": med["hgb_ajustado"]["brecha"]["lista_proporcional_pp"]}],
            "precision_validacion": {"logistica_ajustada": med["logistica_ajustada"]["validacion"]["lista_500"]["precision"],
                                     "hgb_ajustado": med["hgb_ajustado"]["validacion"]["lista_500"]["precision"],
                                     "regla_umbral": med["regla_umbral"]["validacion"]["lista_500"]["precision"]},
        },
        "importancia": [
            {"variable": r["variable"], "etiqueta": ETIQUETAS_IMPORTANCIA.get(r["variable"]),
             "caida_pp": r["caida_lista_500_pp"], "desvio_pp": r["desvio_pp"],
             "coeficiente": r["direccion"]["coeficiente"], "de_la_regla": r["variable"] in DE_LA_REGLA,
             "en_diapositiva": r["variable"] in ETIQUETAS_IMPORTANCIA}
            for r in orden[:ultima + 1]],
        "variables_del_modelo": len(e3["importancia"]),
    }

    # (24/10) Diapositiva 7: por cada largo y filtro, quién acierta más entre la regla y la logística
    # ajustada y por cuántos aciertos (validación, 3 cortes). La resta va acá y no en el navegador.
    comparaciones = []
    for filtro in ("sin_filtro", "contactables"):
        largos = sorted({f["largo_mes"] for f in filas if f["filtro"] == filtro and f["tipo"] == "lista"})
        for largo in largos:
            r = busca("regla", filtro, largo)
            m = busca("logistica_ajustada", filtro, largo)
            dif = r["vp"] - m["vp"]
            comparaciones.append({"filtro": filtro, "largo_mes": largo,
                                  "gana": "regla" if dif > 1e-9 else "logistica_ajustada" if dif < -1e-9 else "empate",
                                  "aciertos_de_mas": abs(dif)})
    lista["comparaciones"] = comparaciones
    c500 = next(c for c in comparaciones if c["filtro"] == "contactables" and c["largo_mes"] == 500)
    ancla("H16", "lista: comparación 500 contactables, aciertos de más",
          c500["aciertos_de_mas"], "29", 0, donde="C 7.2", c3="d7")
    ancla("H16", "lista: comparación 500 contactables, gana", c500["gana"], "regla", donde="C 7.2")
    # (24/10) Las diez comparaciones del selector, contra la fila H48 del registro (regla menos
    # logística ajustada, aciertos en los 3 cortes de validación). La de 500 sin filtro es la de H06.
    H48 = {("sin_filtro", 500): ("logistica_ajustada", "15,3"), ("sin_filtro", 600): ("regla", "18,9"),
           ("sin_filtro", 700): ("regla", "41,9"), ("sin_filtro", 800): ("regla", "49,0"),
           ("contactables", 300): ("logistica_ajustada", "11,8"), ("contactables", 400): ("regla", "13,3"),
           ("contactables", 500): ("regla", "29,0"), ("contactables", 600): ("regla", "16,0"),
           ("contactables", 700): ("empate", "0,0"), ("contactables", 800): ("empate", "0,0")}
    if {(c["filtro"], c["largo_mes"]) for c in comparaciones} != set(H48):
        sys.exit("las comparaciones de la diapositiva 7 no son las diez de H48")
    for c in comparaciones:
        gana, doc = H48[(c["filtro"], c["largo_mes"])]
        q = f"{c['filtro']} {c['largo_mes']}"
        ancla("H48", f"lista: comparación {q}, gana", c["gana"], gana, donde="registro H48")
        ancla("H48", f"lista: comparación {q}, aciertos de más", c["aciertos_de_mas"], doc, 1,
              donde="registro H48" + ("; H06" if q == "sin_filtro 500" else ""))
    # las precisiones que el selector deja ver, por método, filtro y largo
    PRECISIONES = {
        ("logistica_ajustada", "sin_filtro"): ("H11", {500: "82,6", 600: "79,2", 700: "75,3", 800: "69,3"}),
        ("regla", "sin_filtro"): ("H12", {500: "81,6", 600: "80,2", 700: "77,3", 800: "71,4"}),
        ("logistica_ajustada", "contactables"): ("H15", {300: "84,9", 400: "79,8", 500: "73,9", 600: "64,4",
                                                         700: "56,0", 800: "49,0"}),
        ("regla", "contactables"): ("H16", {300: "83,6", 400: "80,9", 500: "75,8", 600: "65,3", 700: "56,0",
                                            800: "49,0"}),
    }
    for (metodo, filtro), (id_, por_largo) in PRECISIONES.items():
        largos = sorted(f["largo_mes"] for f in filas
                        if f["metodo"] == metodo and f["filtro"] == filtro and f["tipo"] == "lista")
        if largos != sorted(por_largo):
            sys.exit(f"largos de {metodo} {filtro}: {largos}, el registro {id_} trae {sorted(por_largo)}")
        for largo, doc in por_largo.items():
            ancla(id_, f"lista: precisión {metodo} {filtro} {largo}", busca(metodo, filtro, largo)["precision"],
                  doc, 1, 100, donde=f"registro {id_}")

    # anexo A2 (C 7.2): una fila por fila del anexo
    a2 = [
        (busca("logistica_ajustada", "sin_filtro", tipo="umbral"), "1.485", "82,4", "71,4", "301,17", "H11"),
        (m500, "1.500", "82,6", "72,3", "305,68", "H11"),
        (busca("logistica_ajustada", "sin_filtro", 700), "2.100", "75,3", "92,3", "366,00", "H11"),
        (busca("logistica_ajustada", "contactables", 400), "1.200", "79,8", "81,5", "231,15", "H15"),
        (m500c, "1.500", "73,9", "94,3", "252,84", "H15"),
        (busca("logistica_ajustada", "contactables", 600), "1.800", "64,4", "98,6", "234,60", "H15"),
        (r500c, "1.500", "75,8", "96,8", "264,54", "H16"),
        (busca("practica_actual", "contactables", 500), "1.500", "32,8", "41,8", "4,15", "H13"),
    ]
    for f, casos, prec, rec, usd, id_ in a2:
        q = f"{f['metodo']} {f['filtro']} {f['largo_mes'] or f['tipo']}"
        ancla(id_, f"A2 {q}: casos", f["casos"], casos, 0, donde="C 7.2", c3="A2")
        ancla(id_, f"A2 {q}: precisión", f["precision"], prec, 1, 100, donde="C 7.2", c3="A2")
        ancla(id_, f"A2 {q}: recall", f["recall"], rec, 1, 100, donde="C 7.2", c3="A2")
        ancla(id_, f"A2 {q}: USD por año", f["usd_anio"], usd, 2, donde="C 7.2", c3="A2")
    ancla("H16", "lista: aciertos de más de la regla, 500 contactables",
          lista["regla_menos_modelo_500_contactables"]["aciertos"], "29", 0, donde="C 7.2", c3="d7")
    ancla("H45", "lista: no contactables en la de 500 sin filtro", lista["no_contactables_lista_500"], "483", 0,
          donde="C 7.2", c3="A2")
    h06 = lista["modelo_menos_regla_500_sin_filtro"]
    ancla("H06", "lista: logística ajustada − regla, 500 sin filtro (puntos)", h06["diferencia_pp"], "1,02", 2,
          donde="C 7.1; D 11.2")
    ancla("H06", "lista: IC 95 % inferior (puntos)", h06["ic95_pp"][0], "−0,50", 2, donde="C 7.1; D 11.2")
    ancla("H06", "lista: IC 95 % superior (puntos)", h06["ic95_pp"][1], "1,81", 2, donde="C 7.1; D 11.2")
    ancla("H06", "lista: aciertos de más en 1.500", h06["aciertos_de_mas"], "15,3", 1, donde="C 7.1")
    ancla("H06", "lista: réplicas a favor del modelo (%)", h06["replicas_a_favor"], "86,5", 1, 100, donde="C 7.1")
    ancla("H01", "lista: pliegues temporales", lista["ajuste"]["pliegues"], "4", 0, donde="C 7.1", c3="d7")
    b = {x["id"]: x for x in lista["ajuste"]["brecha_pp"]}
    ancla("H08", "lista: brecha del gradient boosting antes", b["hgb"]["antes"], "18,1", 1, donde="C 7.1", c3="d7")
    ancla("H08", "lista: brecha del gradient boosting después", b["hgb"]["despues"], "6,4", 1, donde="C 7.1", c3="d7")
    ancla("H08", "lista: brecha de la logística antes", b["logistica"]["antes"], "4,3", 1, donde="C 7.1")
    ancla("H08", "lista: brecha de la logística después", b["logistica"]["despues"], "4,5", 1, donde="C 7.1")
    ancla("H05", "lista: logística ajustada sin filtro (%)",
          lista["ajuste"]["precision_validacion"]["logistica_ajustada"], "82,6", 1, 100, donde="C 7.1", c3="d7")
    for v, doc in (("gap_mediano", "34,4"), ("recency_sobre_umbral", "24,0"), ("recency_dias", "7,6"),
                   ("ticket_90d", "0,8"), ("envios_acum", "0,6"), ("edad", "0,4")):
        ancla("H21", f"lista: importancia de {v}", imp[v]["caida_lista_500_pp"], doc, 1,
              donde="C 7.3; gráfico d7")
    return lista


def armar_economia(eco: dict, e2: dict, e3: dict) -> dict:
    p, te = eco["parametros"], eco["tasa_exito"]
    S_OBS, (S_LO, S_HI) = te["tasa"], te["ic95_wilson"]
    S_CRUZAN = eco["tasa_exito_cruzan"]["tasa"]
    R = te["falsos_positivos"]["r_oferta_7_dias"]
    M, D, T, C = p["m_base_ars"], p["descuento"], p["ticket_medio_ars"], p["costo_accion_ars"]
    TC, ANU = eco["tipo_de_cambio"]["base_30_12_2025"], p["anualizar"]
    REG, MOD = eco["celda_4_4"]["regla"]["matriz"], eco["celda_4_4"]["modelo"]["matriz"]
    DIF = e2["mejor"]["contra_regla"]["diferencia_aciertos"]
    LARGO = MOD["largo"]
    ct = eco["costo_total_anio_1"]
    C_PROY, C_MVP, C_INC = ct["proyecto"], ct["mvp"], ct["incremental"]
    PRESUPUESTO = eco["costos_proyecto"]["presupuesto_C28"]
    POR_PUNTO = LARGO / 100

    # --- la fórmula de economia.py (valores, neto, regla_anual, inc_anual, roi), sin pandas
    def valores(s, d=D, r=R):
        return {"vp": s * (M - d * T) - C, "fp": -C - r * d * T, "fn": 0.0, "vn": 0.0}

    def neto(mat, v):
        return sum(mat[k] * v[k] for k in ("vp", "fp", "fn", "vn"))

    def regla_usd(s, d=D, r=R):
        return ANU * neto(REG, valores(s, d, r)) / TC

    def modelo_usd(s, d=D, r=R):
        v = valores(s, d, r)
        return 1.0 * ANU * DIF * (v["vp"] - v["fp"]) / TC

    def roi(b, c):
        return (b - c) / c * 100

    def punto_usd(s):
        v = valores(s)
        return POR_PUNTO * ANU * (v["vp"] - v["fp"]) / TC

    def s_equilibrio(d, r):
        vp, fp = REG["vp"] * ANU, REG["fp"] * ANU
        fijo = vp * C + fp * (C + r * d * T)
        return (C_MVP * TC / 1 + fijo) / (vp * (M - d * T))

    s_eq_con, s_eq_sin = s_equilibrio(D, R), s_equilibrio(0.0, 0.0)
    max_pp = (1 - REG["vp"] / LARGO) * 100

    # --- grilla: s de 0 a 1 con los puntos notables insertados exactos
    notables = [("cero", 0.0, "nadie vuelve"),
                ("ic95_inferior", S_LO, "límite inferior del intervalo del 95 %"),
                ("observada", S_OBS, "compra a 7 días después de un envío, sin grupo de control"),
                ("solo_cruzan", S_CRUZAN, "la misma compra, solo en los que cruzaron el umbral"),
                ("ic95_superior", S_HI, "límite superior del intervalo del 95 %"),
                ("equilibrio_sin_descuento", s_eq_sin, "la regla se paga sin descuento"),
                ("equilibrio_con_descuento", s_eq_con, "la regla se paga con 15 % de descuento"),
                ("cien", 1.0, "vuelven todos los contactados que se iban a ir")]
    puntos = set()
    for lo, hi, paso in TRAMOS_GRILLA:
        k0, k1 = round(lo / paso), round(hi / paso)
        dec = len(str(paso).split(".")[1])
        puntos.update(round(k * paso, dec) for k in range(k0, k1 + 1))
    puntos.update(s for _, s, _ in notables)
    ss = sorted(puntos)
    col = {c: [] for c in ("s", "regla_usd", "regla_roi_pct", "regla_usd_sin", "regla_roi_pct_sin",
                           "modelo_usd", "modelo_roi_pct", "modelo_usd_sin", "modelo_roi_pct_sin",
                           "acierto_ars", "punto_usd", "puntos_para_pagar", "veces")}
    for s in ss:
        ru, ru0, pu = regla_usd(s), regla_usd(s, 0.0, 0.0), punto_usd(s)
        mu, mu0 = modelo_usd(s), modelo_usd(s, 0.0, 0.0)
        col["s"].append(s)
        col["regla_usd"].append(r6(ru))
        col["regla_roi_pct"].append(r6(roi(ru, C_MVP)))
        col["regla_usd_sin"].append(r6(ru0))
        col["regla_roi_pct_sin"].append(r6(roi(ru0, C_MVP)))
        col["modelo_usd"].append(r6(mu))
        col["modelo_roi_pct"].append(r6(roi(mu, C_INC)))
        col["modelo_usd_sin"].append(r6(mu0))
        col["modelo_roi_pct_sin"].append(r6(roi(mu0, C_INC)))
        col["acierto_ars"].append(r6(valores(s)["vp"]))
        col["punto_usd"].append(r6(pu))
        col["puntos_para_pagar"].append(r6(C_INC / pu))
        col["veces"].append(r6(s / S_OBS))
    idx = {i: ss.index(s) for i, s, _ in notables}
    grilla = {"tramos": [{"desde": lo, "hasta": hi, "paso": paso} for lo, hi, paso in TRAMOS_GRILLA],
              "n": len(ss),
              "notables": [{"id": i, "s": s, "i": idx[i], "rotulo": rot} for i, s, rot in notables],
              **col}

    def g(columna, notable):
        return grilla[columna][idx[notable]]

    cp, cm = eco["costos_proyecto"], eco["costos_mvp"]
    fr = next(f for f in e3["umbral"]["filtradas"]["regla_umbral"]
              if f["umbral"] == "lista de 500 por corte, solo contactables")
    regla_cont = ANU * neto({"vp": fr["vp"], "fp": fr["fp"], "fn": 0.0, "vn": 0.0}, valores(S_OBS)) / TC
    v_obs = valores(S_OBS)
    econ = {
        "parametros": {
            "s_observada": S_OBS, "envios": te["envios_cerca_del_umbral"], "compras_7d": te["compras_7d"],
            "s_ic95": [S_LO, S_HI], "s_solo_cruzan": S_CRUZAN,
            "envios_solo_cruzan": eco["tasa_exito_cruzan"]["envios"],
            "compras_7d_solo_cruzan": eco["tasa_exito_cruzan"]["compras_7d"],
            "contactados_por_exito": 1 / S_OBS,
            "r": R, "envios_no_cruzan": te["falsos_positivos"]["envios_a_los_que_no_cruzan"],
            "compras_7d_no_cruzan": te["falsos_positivos"]["compras_7d"],
            "margen_anual_ars": M, "descuento": D, "ticket_medio_ars": T, "costo_accion_ars": C,
            "accion": p["accion"], "tipo_de_cambio": TC, "tipo_de_cambio_fecha": "2025-12-30",
            "anualizar": ANU, "cortes_validacion": 3, "listas_por_anio": 12,
            "aciertos_de_mas_modelo": DIF, "contactos_validacion": LARGO, "aciertos_por_punto": POR_PUNTO,
        },
        "valores_celda_ars": v_obs,
        "matrices": {
            "regla": {**{k: REG[k] for k in ("vp", "fp", "fn", "vn", "largo")},
                      "neto_ars": eco["celda_4_4"]["regla"]["neto_ars"], "anual_usd": regla_usd(S_OBS)},
            "modelo": {**{k: MOD[k] for k in ("vp", "fp", "fn", "vn", "largo")},
                       "neto_ars": eco["celda_4_4"]["modelo"]["neto_ars"],
                       "anual_usd": ANU * neto(MOD, v_obs) / TC},
        },
        "costos": {
            "con_modelo": {"unicos_usd": cp["suma_unicos"], "contingencia_usd": cp["contingencia"],
                           "inversion_inicial_usd": cp["inversion_inicial"], "recurrente_usd": cp["recurrente_anual"],
                           "total_anio_1_usd": cp["total_anio_1"]},
            "regla_sin_modelo": {"unicos_usd": cm["suma_unicos"], "contingencia_usd": cm["contingencia"],
                                 "inversion_inicial_usd": cm["inversion_inicial"],
                                 "recurrente_usd": cm["recurrente_anual"], "total_anio_1_usd": cm["total_anio_1"]},
            "incremental_usd": C_INC, "presupuesto_usd": PRESUPUESTO,
            "con_modelo_menos_presupuesto_usd": C_PROY - PRESUPUESTO,
            "presupuesto_menos_regla_usd": PRESUPUESTO - C_MVP,
        },
        "observada": {"regla_usd": regla_usd(S_OBS), "regla_roi_pct": roi(regla_usd(S_OBS), C_MVP),
                      "regla_usd_sin": regla_usd(S_OBS, 0.0, 0.0),
                      "regla_roi_pct_sin": roi(regla_usd(S_OBS, 0.0, 0.0), C_MVP),
                      "modelo_usd": modelo_usd(S_OBS), "modelo_roi_pct": roi(modelo_usd(S_OBS), C_INC),
                      "punto_usd": punto_usd(S_OBS), "puntos_para_pagar": C_INC / punto_usd(S_OBS)},
        "regla_contactables": {"vp": fr["vp"], "fp": fr["fp"], "usd_anio": regla_cont,
                               "roi_pct": roi(regla_cont, C_MVP)},
        "umbral": {"s_equilibrio_con_descuento": s_eq_con, "s_equilibrio_sin_descuento": s_eq_sin,
                   "veces_con_descuento": s_eq_con / S_OBS, "veces_sin_descuento": s_eq_sin / S_OBS,
                   "modelo_usd_con_s_100": modelo_usd(1.0), "modelo_roi_pct_con_s_100": roi(modelo_usd(1.0), C_INC),
                   "modelo_se_paga_con_s_100": modelo_usd(1.0) >= C_INC,
                   "maximo_pp": max_pp, "valor_del_maximo_usd": max_pp * punto_usd(S_OBS),
                   "puntos_para_pagar_con_s_100": C_INC / punto_usd(1.0)},
        "grilla": grilla,
    }

    # --- controles de reimplementación contra lo que escribió economia.py
    def sens(variable, probado):
        return next(x for x in eco["sensibilidad"]
                    if x["variable"] == variable and x["probado"].startswith(probado))

    s_lo_sens = sens("Tasa de éxito de la acción", "límite inferior del intervalo")
    s_cr_sens = sens("Tasa de éxito de la acción", "compra a 7 días de los que cruzan")
    sin_desc_sens = sens("Descuento de la oferta", "sin descuento")
    control("VP unitario", v_obs["vp"], eco["celda_4_4"]["unitario_ars"]["vp"])
    control("FP unitario", v_obs["fp"], eco["celda_4_4"]["unitario_ars"]["fp"])
    control("regla anual USD", regla_usd(S_OBS), eco["celda_4_4"]["regla_anual_usd"])
    control("regla ROI", roi(regla_usd(S_OBS), C_MVP), eco["escenarios"]["esperado"]["mvp_con_descuento"]["roi_pct"])
    control("regla sin descuento USD", regla_usd(S_OBS, 0.0, 0.0),
            eco["escenarios"]["esperado"]["mvp_sin_descuento"]["beneficio_usd"])
    control("regla sin descuento ROI", roi(regla_usd(S_OBS, 0.0, 0.0), C_MVP),
            eco["escenarios"]["esperado"]["mvp_sin_descuento"]["roi_pct"])
    control("modelo USD", modelo_usd(S_OBS), eco["esperado"]["beneficio_usd"])
    control("modelo ROI", roi(modelo_usd(S_OBS), C_INC), eco["esperado"]["roi_pct"])
    control("modelo sin descuento ROI", roi(modelo_usd(S_OBS, 0.0, 0.0), C_INC), sin_desc_sens["roi_proyecto_pct"])
    control("regla sin descuento ROI (sensibilidad)", roi(regla_usd(S_OBS, 0.0, 0.0), C_MVP),
            sin_desc_sens["roi_mvp_pct"])
    control("s inferior: ROI modelo", roi(modelo_usd(S_LO), C_INC), s_lo_sens["roi_proyecto_pct"])
    control("s inferior: ROI regla", roi(regla_usd(S_LO), C_MVP), s_lo_sens["roi_mvp_pct"])
    control("s solo cruzan: ROI modelo", roi(modelo_usd(S_CRUZAN), C_INC), s_cr_sens["roi_proyecto_pct"])
    control("s solo cruzan: ROI regla", roi(regla_usd(S_CRUZAN), C_MVP), s_cr_sens["roi_mvp_pct"])
    control("equilibrio con descuento", s_eq_con, eco["umbral"]["mvp_s_equilibrio_con_descuento"])
    control("equilibrio sin descuento", s_eq_sin, eco["umbral"]["mvp_s_equilibrio_sin_descuento"])
    control("veces con descuento", s_eq_con / S_OBS, eco["umbral"]["veces_la_tasa_base_con_descuento"])
    control("veces sin descuento", s_eq_sin / S_OBS, eco["umbral"]["veces_la_tasa_base"])
    control("modelo con s = 100 %", modelo_usd(1.0), eco["umbral"]["proyecto_techo_incremental_usd"])
    control("ROI del modelo con s = 100 %", roi(modelo_usd(1.0), C_INC), eco["umbral"]["proyecto_roi_con_exito_100_pct"])
    control("valor de un punto", punto_usd(S_OBS), eco["mejora_minima"]["valor_por_punto_usd_anual"])
    control("puntos para pagar", C_INC / punto_usd(S_OBS), eco["mejora_minima"]["puntos_para_pagar_costo_incremental"])
    control("máximo posible", max_pp, eco["mejora_minima"]["maximo_posible_pp"])
    control("valor de un punto con s = 100 %", punto_usd(1.0),
            eco["mejora_minima"]["con_exito_100"]["valor_por_punto_usd_anual"])
    control("regla 500 contactables USD", regla_cont, fr["valor_neto_anual_usd"])
    control("costo incremental", C_PROY - C_MVP, C_INC)

    # --- anclas (d8, d9, A3, A6 y la Parte B)
    ancla("G31", "economía: s observada (%)", S_OBS, "1,02", 2, 100, donde="B supuestos")
    ancla("G31", "economía: s, IC 95 % inferior (%)", S_LO, "0,63", 2, 100, donde="B 3.5", c3="A3")
    ancla("G31", "economía: s, IC 95 % superior (%)", S_HI, "1,65", 2, 100, donde="B 3.5")
    ancla("G52", "economía: s solo los que cruzan (%)", S_CRUZAN, "1,12", 2, 100, donde="B 3.5", c3="A3")
    ancla("G31", "economía: contactados por cada uno que vuelve", 1 / S_OBS, "98", 0, donde="B 4.4", c3="d8")
    ancla("G31", "economía: r (%)", R, "0,74", 2, 100, donde="B 4.4")
    ancla("G08", "economía: margen anual por cliente (ARS)", M, "15.282", 0, donde="B 4.4")
    ancla("G32", "economía: descuento (%)", D, "15", 0, 100, donde="B supuestos")
    ancla("G32", "economía: costo de la acción (ARS)", C, "25", 0, donde="B supuestos", c3="d8")
    ancla("G33", "economía: valor de un acierto (ARS)", g("acierto_ars", "observada"), "99,96", 2,
          donde="B 4.4", c3="d8")
    ancla("G33", "economía: valor de un falso positivo (ARS)", v_obs["fp"], "−47,21", 2, donde="B 4.4", c3="d8")
    ancla("G40", "economía: modelo sobre la regla (USD/año)", g("modelo_usd", "observada"), "5,38", 2,
          donde="B 3.4", c3="d8")
    ancla("G40", "economía: ROI del modelo sobre la regla (%)", g("modelo_roi_pct", "observada"), "−99,95", 2,
          donde="B 3.6", c3="A3")
    ancla("G41", "economía: regla (USD/año)", g("regla_usd", "observada"), "299,49", 2, donde="B 3.6", c3="d9")
    ancla("G41", "economía: ROI de la regla (%)", g("regla_roi_pct", "observada"), "−98,52", 2,
          donde="B 3.6", c3="d9")
    ancla("G41", "economía: regla sin descuento (USD/año)", g("regla_usd_sin", "observada"), "419,53", 2,
          donde="B 3.4")
    ancla("G42", "economía: ROI de la regla sin descuento (%)", g("regla_roi_pct_sin", "observada"), "−97,93", 2,
          donde="B 3.5", c3="A3")
    ancla("G42", "economía: ROI del modelo sin descuento (%)", g("modelo_roi_pct_sin", "observada"), "−99,95", 2,
          donde="B 3.5", c3="A3")
    ancla("G42", "economía: s inferior, ROI del modelo (%)", g("modelo_roi_pct", "ic95_inferior"), "−99,97", 2,
          donde="B 3.5", c3="A3")
    ancla("G42", "economía: s inferior, ROI de la regla (%)", g("regla_roi_pct", "ic95_inferior"), "−99,32", 2,
          donde="B 3.5", c3="A3")
    ancla("G42", "economía: s solo cruzan, ROI del modelo (%)", g("modelo_roi_pct", "solo_cruzan"), "−99,94", 2,
          donde="B 3.5", c3="A3")
    ancla("G42", "economía: s solo cruzan, ROI de la regla (%)", g("regla_roi_pct", "solo_cruzan"), "−98,32", 2,
          donde="B 3.5", c3="A3")
    ancla("G43", "economía: s de equilibrio con descuento (%)", g("s", "equilibrio_con_descuento"), "49,6", 1, 100,
          donde="B 3.6", c3="d9")
    ancla("G43", "economía: s de equilibrio sin descuento (%)", g("s", "equilibrio_sin_descuento"), "39,7", 1, 100,
          donde="B 3.6")
    ancla("G43", "economía: veces lo observado, con descuento", g("veces", "equilibrio_con_descuento"), "48,6", 1,
          donde="B 3.6", c3="d9")
    ancla("G43", "economía: veces lo observado, sin descuento", g("veces", "equilibrio_sin_descuento"), "39,0", 1,
          donde="registro G43")
    ancla("G43", "economía: ROI de la regla en el equilibrio con descuento", g("regla_roi_pct", "equilibrio_con_descuento"),
          "0,00", 2, donde="B 3.6 (ROI 0)")
    ancla("G43", "economía: ROI de la regla en el equilibrio sin descuento",
          g("regla_roi_pct_sin", "equilibrio_sin_descuento"), "0,00", 2, donde="B 3.6 (ROI 0)")
    ancla("G36", "economía: modelo con s = 100 % (USD/año)", g("modelo_usd", "cien"), "448,90", 2, donde="B 3.1")
    ancla("G36", "economía: ROI del modelo con s = 100 % (%)", g("modelo_roi_pct", "cien"), "−95,68", 2,
          donde="registro G36 (la parte no lo escribe)")
    ancla("G36", "economía: el modelo no se paga con s = 100 %", econ["umbral"]["modelo_se_paga_con_s_100"], False,
          donde="B 3.6")
    ancla("G46", "economía: valor de un punto (USD/año)", g("punto_usd", "observada"), "6,05", 2, donde="B 3.6",
          c3="d8")
    ancla("G46", "economía: puntos para pagar el modelo", g("puntos_para_pagar", "observada"), "1.719", 0,
          donde="B 3.6", c3="d8")
    ancla("G46", "economía: máximo posible sobre la regla (puntos)", max_pp, "18,4", 1, donde="B 3.6", c3="d8")
    ancla("G46", "economía: valor del máximo (USD/año)", econ["umbral"]["valor_del_maximo_usd"], "111,46", 2,
          donde="B 3.6")
    ancla("G46", "economía: valor de un punto con s = 100 % (USD/año)", g("punto_usd", "cien"), "505,02", 2,
          donde="B 3.6")
    ancla("G46", "economía: puntos para pagar con s = 100 %", g("puntos_para_pagar", "cien"), "20,6", 1,
          donde="B 3.6")
    ancla("G38", "economía: año 1 con modelo (USD)", C_PROY, "30.660", 0, donde="B 3.2", c3="A6")
    ancla("G38", "economía: inversión inicial con modelo (USD)", cp["inversion_inicial"], "23.460", 0,
          donde="B 3.2", c3="A6")
    ancla("G38", "economía: recurrente con modelo (USD/año)", cp["recurrente_anual"], "7.200", 0, donde="B 3.2")
    ancla("G39", "economía: año 1 de la regla (USD)", C_MVP, "20.260", 0, donde="B 3.2", c3="A6")
    ancla("G39", "economía: inversión inicial de la regla (USD)", cm["inversion_inicial"], "14.260", 0,
          donde="B 3.2", c3="A6")
    ancla("G40", "economía: costo incremental del modelo (USD)", C_INC, "10.400", 0, donde="B 3.2", c3="d8")
    ancla("C28", "economía: presupuesto (USD)", PRESUPUESTO, "30.000", 0, donde="B 3.2")
    ancla("G38", "economía: con modelo, sobre el presupuesto (USD)", C_PROY - PRESUPUESTO, "660", 0,
          donde="B 3.2")
    ancla("G39", "economía: regla, debajo del presupuesto (USD)", PRESUPUESTO - C_MVP, "9.740", 0,
          donde="B 3.2")
    ancla("G54", "economía: regla con contactables (USD/año)", regla_cont, "264,54", 2, donde="B 3.3")
    ancla("G54", "economía: ROI de la regla con contactables (%)", roi(regla_cont, C_MVP), "−98,69", 2,
          donde="B 3.3")
    return econ


def armar_piloto(eco: dict, e2: dict) -> dict:
    pi = eco["piloto"]
    # (26/10) Umbral de producción del piloto (H49): la tasa de éxito que paga la regla (49,56 %), llevada a
    # todos los contactados con la precisión de la regla en validación (81,58 %).
    prec_regla = e2["modelos"]["regla_umbral"]["validacion"]["lista_500"]["precision"]
    pil = {
        "meses": pi["meses"], "lista_mes": pi["lista_mes"], "control_mes": pi["control_mes"],
        "contactados_mes": pi["lista_mes"] - pi["control_mes"],
        "tratados": pi["tratados"], "control": pi["control"],
        "diferencia_detectable_pp": pi["mde_pp"], "compra_7d_base": pi["p0_compra_7d"],
        "horas_equipo": sum(pi["horas_equipo"].values()), "horas_operador": pi["horas_operador"],
        "costo_horas_usd": pi["costo_horas_usd"],
        "acciones_ars": pi["acciones_marketing_ars"], "acciones_usd": pi["acciones_marketing_usd"],
        "costo_por_tratado_ars": pi["costo_por_tratado_ars"],
        "umbral_produccion_pp": eco["umbral"]["mvp_s_equilibrio_con_descuento"] * prec_regla * 100,
    }
    ancla("G49", "piloto: lista por mes", pil["lista_mes"], "500", 0, donde="B 3.6")
    ancla("G49", "piloto: control por mes", pil["control_mes"], "80", 0, donde="B 3.6", c3="d12")
    ancla("G49", "piloto: contactados por mes", pil["contactados_mes"], "420", 0, donde="gráfico d12 (500 − 80)")
    ancla("G49", "piloto: tratados", pil["tratados"], "1.260", 0, donde="B 3.6", c3="d12")
    ancla("G49", "piloto: control", pil["control"], "240", 0, donde="B 3.6", c3="d12")
    ancla("G49", "piloto: diferencia detectable (puntos)", pil["diferencia_detectable_pp"], "2,87", 2,
          donde="B 3.6", c3="d12")
    ancla("G49", "piloto: horas (USD)", pil["costo_horas_usd"], "1.350", 0, donde="B 3.6", c3="d12")
    ancla("G49", "piloto: acciones (ARS)", pil["acciones_ars"], "68.289", 0, donde="B 3.6")
    ancla("G49", "piloto: acciones (USD)", pil["acciones_usd"], "46,79", 2, donde="B 3.6", c3="d12")
    ancla("G49", "piloto: meses", pil["meses"], 3, donde="B 3.6 (tres meses)")
    ancla("H49", "piloto: umbral de producción (puntos)", pil["umbral_produccion_pp"], "40,4", 1,
          donde="C 6.2 y 6.3; gráfico d12", c3="d12")
    return pil


# ============================================================ Parte D y lo que faltaba (27/10, W3)
#
# test: la etapa 4 (el test, abierto una sola vez el 27/10/2026), J01 a J21. encuadre y legal: las cifras de las
# vistas 2 y 6 que hasta W2 solo estaban en el texto de C3 (C14, C08, H40, C18 y J22). plan: el plan del proyecto
# de la sección 12 de la D (J50). monitoreo: la campaña de noviembre (J51) y la alerta de drift (J53 desde el 28/10;
# hasta la D v1.2, el semáforo del E1, J52).

# huella de etapa4.json que cita el registro (J01) y etapa4-resumen.md: si cambia, el test se habría vuelto a correr
ETAPA4_SHA256 = "0368611d7d797b3bec39f19764d2e3496d9c74e539a8b6c2e8cdf03099844fbd"
# C 5.3 (H40): puntaje de cada dimensión legal y tramo de la escala. etapa3.json no trae los puntajes.
LEGAL = [("proteccion_datos", "Protección de datos personales", 2),
         ("seguridad_accesos", "Seguridad y control de accesos", 2),
         ("conservacion_fiscal", "Conservación y trazabilidad fiscal", 2),
         ("contratos_proveedores", "Contratos con proveedores externos", 2),
         ("explicabilidad", "Explicabilidad del modelo", 2)]
TRAMO_LEGAL = (1.6, 2.5, "Viable con condiciones")
# D 12 (J50): fases del plan en semanas (primera, última); la semana 1 empieza el lunes 02/11/2026. Es la tabla
# FASES de _build/D/contenido_d_solucion.py, con sus mismos asserts de duración y orden.
SEMANA_1 = "2026-11-02"
FASES_PLAN = [("gobierno", "Precondiciones de gobierno", 1, 2),
              ("datos", "Integración y limpieza de datos", 1, 3),
              ("planilla", "Planilla, tablero y guía de corrida", 1, 4),
              ("prueba", "Corrida de prueba y capacitación", 5, 5),
              ("piloto", "Piloto", 6, 18),
              ("decision", "Informe y decisión", 19, 20)]
# (28/10, F6b) designa_l1: María G. designa quién inscribe las bases en la AAIP en la semana 2 (D v1.3, 12.3 y 12.4).
HITOS_PLAN = {"alcance": 1, "regla_y_operador_del_piloto": 2, "designa_l1": 2, "acciones_legales_y_control": 4,
              "extracto_regenerado": 6, "go_live": 6, "operador_despues_del_piloto": 13, "decision": 20}


def cargar_e1() -> dict:
    texto = E1_PAYLOAD.read_text(encoding="utf-8")
    marca = "export const D = "
    return json.loads(texto[texto.index(marca) + len(marca):].strip().rstrip(";"))


def armar_encuadre(e1: dict) -> dict:
    va = {r["anio"]: r["ventas"] for r in e1["series"]["ventas_anuales"]}
    enc = {"ventas_2024_ars": va[2024], "ventas_2025_ars": va[2025],
           "variacion_ventas_2025_pct": (va[2025] / va[2024] - 1) * 100,
           "capacidad_contacto_mes": e1["meta"]["capacidad_contacto"]}
    ancla("C14", "encuadre: ventas 2025 contra 2024 (%)", enc["variacion_ventas_2025_pct"], "−35,6", 1,
          donde="A 1.1", c3="d3")
    ancla("C14", "encuadre: ventas 2025 (ARS M)", va[2025] / 1e6, "225,0", 1, donde="registro C14")
    ancla("C14", "encuadre: ventas 2024 (ARS M)", va[2024] / 1e6, "349,7", 1, donde="registro C14")
    ancla("C08", "encuadre: capacidad de contacto, piso", enc["capacidad_contacto_mes"][0], "500", 0, donde="A 1.5",
          c3="d3")
    ancla("C08", "encuadre: capacidad de contacto, techo", enc["capacidad_contacto_mes"][1], "800", 0, donde="A 1.5",
          c3="d3")
    return enc


def armar_legal(e1: dict, c3: dict) -> dict:
    d10 = next(d for d in c3["DIAPOSITIVAS"] if d["n"] == 10)
    a4 = next(a for a in c3["ANEXOS"] if a["n"] == "A4")
    co = e1["series"]["consentimiento"]
    puntajes = [p for _, _, p in LEGAL]
    leg = {
        "dimensiones": [{"id": i, "nombre": n, "puntaje": p} for i, n, p in LEGAL],
        "promedio": sum(puntajes) / len(puntajes),
        "tramo": {"desde": TRAMO_LEGAL[0], "hasta": TRAMO_LEGAL[1], "nivel": TRAMO_LEGAL[2]},
        "envios_sin_consentimiento": co["envios_a_no_acepta"],
        "envios_sin_consentimiento_tasa": co["pct_envios_a_no_acepta"],
        "no_consintieron_contactados_tasa": co["pct_alcance"],
        "riesgos": len(a4["filas"]), "riesgos_criticos": len(a4["destacar"]),
    }
    ancla("H40", "legal: promedio", leg["promedio"], "2,0", 1, donde="C 5.3", c3="d10")
    ancla("H40", "legal: nombres y puntajes de las dimensiones",
          [(x["dimension"], x["puntaje"]) for x in d10["dimensiones"]] == [(n, str(p)) for _, n, p in LEGAL], True,
          donde="C 5.3 · C3 d10 dimensiones")
    ancla("H40", "legal: tramo de la escala", f"{es(TRAMO_LEGAL[0], 1)} a {es(TRAMO_LEGAL[1], 1)}", "1,6 a 2,5",
          donde="C 5.3", c3="d10")
    ancla("C18", "legal: envíos sin consentimiento", leg["envios_sin_consentimiento"], "7.078", 0,
          donde="registro C18")
    ancla("C18", "legal: envíos sin consentimiento (%)", leg["envios_sin_consentimiento_tasa"], "30,1", 1, 100,
          donde="C 5.1", c3="d10")
    ancla("C18", "legal: no consintieron y fueron contactados (%)", leg["no_consintieron_contactados_tasa"], "98,3",
          1, 100, donde="registro C18")
    ancla("J22", "legal: riesgos en la matriz", leg["riesgos"], "13", 0, donde="C 6.2", c3="A4")
    ancla("J22", "legal: riesgos críticos (destacados en A4)", leg["riesgos_criticos"], "3", 0,
          donde="C 6.2 · C3 A4 destacar")
    return leg


def _medidas_test(p: dict) -> dict:
    return {"precision": p["precision"], "recall": p["recall"], "f1": p["f1"],
            "auc_roc_contactables": p["auc_roc_contactables"], "casos": p["casos_marcados"],
            "vp": p["vp"], "fp": p["fp"], "fn": p["fn"], "vn": p["vn"],
            "usd": p["valor_neto_usd"], "usd_anio": p["valor_neto_anual_usd"], "aciertos_por_mes": p["aciertos_por_mes"],
            "precision_por_corte": [x["precision"] for x in p["precision_por_corte"]]}


# segmentos de la lista de 500 sin filtro que cita el registro (J15, J21): id → (segmento, valor) de etapa4.json
SEGMENTOS_TEST = {"mujeres": ("genero", "F"), "hombres": ("genero", "M"), "genero_x": ("genero", "X"),
                  "alto_valor": ("alto valor", "20 % de mayor facturación"),
                  "menos_de_12_meses": ("antigüedad", "menos de 12 meses"),
                  "alta_online": ("canal de alta", "online"), "alta_fisica": ("canal de alta", "fisico")}


def armar_test(e4: dict, v4: dict, eco: dict, e3: dict) -> dict:
    M, MV = e4["medicion"], v4["medicion"]
    P, PV = M["principal"], MV["principal"]
    SEC, CR = M["secundarias"], M["criterio"]
    SF = SEC["sin_filtro"]
    lt, rt = P["logistica_ajustada"], P["regla_umbral"]
    lv, rv = PV["logistica_ajustada"], PV["regla_umbral"]
    n_t, n_v = len(M["cortes"]), len(MV["cortes"])
    pos_t, pos_v = M["contactables"]["positivos"], MV["contactables"]["positivos"]
    fi = e4["ficha_8_3"]
    mo = fi["modelo"]
    linea = e4["apertura"][0].split("\t")
    # J19: la fórmula de economia.s_equilibrio_mvp con la matriz de la regla en la lista de test, llevada a un año
    pa = eco["parametros"]
    t_, d_, c_ = pa["ticket_medio_ars"], pa["descuento"], pa["costo_accion_ars"]
    r_ = eco["tasa_exito"]["falsos_positivos"]["r_oferta_7_dias"]
    vp_a, fp_a = rt["vp"] * M["anualizar"], rt["fp"] * M["anualizar"]
    costo_ars = eco["costo_total_anio_1"]["mvp"] * eco["tipo_de_cambio"]["base_30_12_2025"]
    s_eq = (costo_ars + vp_a * c_ + fp_a * (c_ + r_ * d_ * t_)) / (vp_a * (pa["m_base_ars"] - d_ * t_))
    seg_t = {(r["segmento"], r["valor"]): r for r in SEC["segmentos"]["filas"]}
    seg_v = {(r["segmento"], r["valor"]): r for r in e3["segmentos"]["filas"]}
    sfl, sfr = SF["logistica_ajustada"], SF["regla_umbral"]
    dsf = SEC["diferencia_sin_filtro_logistica_menos_regla"]
    cal = SEC["calibracion"]
    coef = {c["termino"]: c for c in mo["coeficientes"]}
    test = {
        "apertura": {"fecha": linea[0], "lineas": len(e4["apertura"]), "preregistro_version": fi["preregistro_version"],
                     "control_cifras": e4["validacion"]["control"]["cifras"],
                     "control_reproducen": e4["validacion"]["control"]["reproducen"],
                     "etapa4_sha256": sha256(DATOS / "etapa4.json")},
        "conjunto": {"cortes": M["cortes"], "desde": M["cortes"][0], "hasta": M["cortes"][-1], "filas": M["filas"],
                     "positivos": M["positivos"], "tasa": M["tasa_base"], "anualizar": M["anualizar"],
                     "contactables": M["contactables"]["filas"], "contactables_por_corte": M["contactables"]["por_corte"],
                     "positivos_contactables": pos_t, "positivos_contactables_tasa": pos_t / M["contactables"]["filas"],
                     "positivos_contactables_por_corte": pos_t / n_t},
        "validacion": {"cortes": MV["cortes"], "contactables": MV["contactables"]["filas"],
                       "positivos_contactables": pos_v, "positivos_contactables_por_corte": pos_v / n_v,
                       "techo_precision": pos_v / (500 * n_v)},
        "entrenamiento": {**M["entrenamiento"], "tasa": M["entrenamiento"]["positivos"] / M["entrenamiento"]["filas"]},
        "metodos": {
            "logistica_ajustada": {"test": _medidas_test(lt), "validacion": _medidas_test(lv)},
            "regla": {"test": _medidas_test(rt), "validacion": _medidas_test(rv)},
            "practica_actual": {"test": _medidas_test(SEC["practica_actual_contactables"]),
                                "validacion": _medidas_test(MV["secundarias"]["practica_actual_contactables"])},
        },
        "tabla_8_1": [{k: r[k] for k in ("fila", "baseline_test", "modelo_validacion", "modelo_test",
                                         "diferencia_test_menos_validacion", "baseline_validacion")}
                      for r in e4["tabla_8_1"]],
        "fuera_de_la_lista": {"test": lt["fn"], "test_tasa": lt["fn"] / pos_t,
                              "validacion": lv["fn"], "validacion_tasa": lv["fn"] / pos_v},
        "contra_regla": {"diferencia_pp": (lt["precision"] - rt["precision"]) * 100,
                         "ic95_pp": [x * 100 for x in P["diferencia_logistica_menos_regla"]["ic95"]],
                         "replicas_a_favor": P["diferencia_logistica_menos_regla"]["replicas_con_a_mejor"],
                         "aciertos_de_menos": rt["vp"] - lt["vp"],
                         "aciertos_extra_por_mes": CR["aciertos_extra_por_mes"],
                         "validacion_diferencia_pp": (lv["precision"] - rv["precision"]) * 100,
                         "validacion_ic95_pp": [x * 100 for x in PV["diferencia_logistica_menos_regla"]["ic95"]]},
        "decision": {"condicion_1": CR["condicion_1_intervalo_excluye_el_cero"],
                     "ic95_inferior_pp": CR["ic95_limite_inferior"] * 100,
                     "condicion_2": CR["condicion_2_paga_lo_que_agrega"],
                     "aciertos_extra_por_mes": CR["aciertos_extra_por_mes"],
                     "aciertos_por_mes_para_pagar": CR["aciertos_extra_por_mes_para_pagar"],
                     "costo_incremental_usd": CR["costo_incremental_usd"],
                     "valor_extra_anual_usd": CR["valor_extra_anual_usd"],
                     "sigue_la_regla": e4["decision"]["resultado"] == "la lista sigue con la regla del umbral",
                     "resultado": e4["decision"]["resultado"]},
        "sin_filtro": {
            "logistica_ajustada": {"precision": sfl["lista_500"]["precision"], "aciertos": sfl["lista_500"]["aciertos"],
                                   "largo": sfl["lista_500"]["largo"], "recall": sfl["lista_500"]["recall"],
                                   "usd_anio": sfl["lista_500"]["valor_neto_anual_usd"], "auc_roc": sfl["auc_roc"],
                                   "decil_superior": sfl["decil_superior"]},
            "regla": {"precision": sfr["lista_500"]["precision"], "aciertos": sfr["lista_500"]["aciertos"],
                      "largo": sfr["lista_500"]["largo"], "recall": sfr["lista_500"]["recall"],
                      "usd_anio": sfr["lista_500"]["valor_neto_anual_usd"], "auc_roc": sfr["auc_roc"],
                      "decil_superior": sfr["decil_superior"]},
            "diferencia_pp": (sfl["lista_500"]["precision"] - sfr["lista_500"]["precision"]) * 100,
            "ic95_pp": [x * 100 for x in dsf["ic95"]], "replicas_a_favor": dsf["replicas_con_a_mejor"],
            "aciertos_de_mas_por_mes": (sfl["lista_500"]["aciertos"] - sfr["lista_500"]["aciertos"]) / n_t,
            "usd_anio_de_mas": sfl["lista_500"]["valor_neto_anual_usd"] - sfr["lista_500"]["valor_neto_anual_usd"]},
        "roi_b_3_4": [{"fila": r["fila"], "id": r["id"], "costo_usd": r["costo_usd"],
                       **{k: {"usd": r[k]["beneficio_usd"], "roi_pct": r[k]["roi_pct"],
                              "recupera_en_el_anio": r[k]["recupera_en_el_anio"]}
                          for k in ("b_3_4", "contactables", "sin_filtro")},
                       "cambia_el_veredicto": r["cambia_el_veredicto"]}
                      for r in e4["contra_roi_b_3_4"]["evaluado"]],
        "meta_y_alerta": {"regla_aciertos_por_mes": SEC["meta_criterio_1"]["regla_aciertos_por_mes"],
                          "meta_aciertos_por_mes": SEC["meta_criterio_1"]["meta"],
                          "regla_precision_por_corte": SEC["alerta_fila_10"]["regla_precision_por_corte"],
                          "regla_precision_minima": min(SEC["alerta_fila_10"]["regla_precision_por_corte"]),
                          "regla_precision_maxima": max(SEC["alerta_fila_10"]["regla_precision_por_corte"]),
                          "alerta_precision": SEC["alerta_fila_10"]["umbral"]},
        "calibracion": {"brier": cal["brier"], "brier_tasa_base": cal["brier_tasa_base"],
                        "probabilidad_media": cal["probabilidad_media"], "tasa_observada": cal["tasa_observada"],
                        "positivos_esperados": cal["positivos_esperados"],
                        "positivos_observados": cal["positivos_observados"], "ece_deciles": cal["ece_deciles"],
                        "lista_500_probabilidad_media": cal["lista_500"]["probabilidad_media"],
                        "lista_500_precision": cal["lista_500"]["precision_observada"]},
        "segmentos": {
            "lista_precision": SEC["segmentos"]["global"]["precision"],
            "lista_precision_regla": SEC["segmentos"]["global"]["precision_regla"],
            "filas": [{"id": i, "segmento": s, "valor": v, "en_lista": seg_t[(s, v)]["en_lista"],
                       "precision": seg_t[(s, v)]["precision"], "ic95": seg_t[(s, v)]["ic95"],
                       "diferencia_pp": seg_t[(s, v)]["diferencia_pp"],
                       "precision_regla": seg_t[(s, v)]["precision_regla"],
                       "diferencia_regla_pp": (seg_t[(s, v)]["precision_regla"]
                                               - SEC["segmentos"]["global"]["precision_regla"]) * 100,
                       "validacion_diferencia_pp": seg_v[(s, v)]["diferencia_pp"]}
                      for i, (s, v) in SEGMENTOS_TEST.items()]},
        "modelo": {"nombre": fi["nombre"], "version": fi["preregistro_version"], "scikit_learn": fi["scikit_learn"],
                   "C": fi["configuracion"]["C"], "min_frecuencia": fi["configuracion"]["min_frecuencia"],
                   "sin": fi["sin"],
                   "agrupadas": len(mo["agrupadas_min_frecuencia"]["motivo_ultima_devolucion"]),
                   "agrupadas_etapa3": len(e3["agrupadas_min_frecuencia"]["motivo_ultima_devolucion"]),
                   "variables": mo["variables"], "terminos_con_intercepto": mo["terminos_con_intercepto"],
                   "iteraciones": mo["iteraciones"], "pliegues": len(e3["pliegues"]),
                   "coeficientes": [{k: c[k] for k in ("termino", "variable", "valor", "coeficiente", "filas", "sentido")}
                                    for c in mo["coeficientes"][:6]],
                   "importancia": [{"variable": x["variable"], "caida_pp": x["caida_lista_500_pp"],
                                    "desvio_pp": x["desvio_pp"]} for x in fi["importancia_c_7_3"]],
                   "probabilidad_del_ultimo_puesto": fi["probabilidad_del_ultimo_puesto"],
                   "probabilidad_del_ultimo_puesto_minima": min(fi["probabilidad_del_ultimo_puesto"]),
                   "probabilidad_del_ultimo_puesto_maxima": max(fi["probabilidad_del_ultimo_puesto"])},
        "equilibrio": {"s_equilibrio": s_eq, "precision_lista": rt["precision"],
                       "diferencia_compra_7d_pp": s_eq * rt["precision"] * 100,
                       "costo_anio_1_usd": eco["costo_total_anio_1"]["mvp"]},
    }

    T, D, CO = test, test["conjunto"], test["contra_regla"]
    L, R, PA = (test["metodos"][k] for k in ("logistica_ajustada", "regla", "practica_actual"))
    lista = lambda xs, dec, x=100: " · ".join(es(v * x, dec) for v in xs)  # noqa: E731
    # J01
    ancla("J01", "test: huella de etapa4.json", T["apertura"]["etapa4_sha256"] == ETAPA4_SHA256, True,
          donde="registro J01 (sha256 0368611d…)")
    ancla("J01", "test: líneas de apertura", T["apertura"]["lineas"], "1", 0, donde="D 8.1")
    ancla("J01", "test: fecha de apertura", T["apertura"]["fecha"], "2026-10-27T15:55:55-03:00",
          donde="registro J01 (27/10/2026 15:55:55)")
    ancla("J01", "test: cifras de validación que reproducen", T["apertura"]["control_reproducen"], "125", 0,
          donde="registro J01 (125 de 125)")
    # J02
    ancla("J02", "test: cortes", len(D["cortes"]), "5", 0, donde="D 8.1")
    ancla("J02", "test: primer y último corte", f"{D['desde']} a {D['hasta']}", "2025-01-31 a 2025-05-31",
          donde="registro J02 (31/01 a 31/05/2025)")
    ancla("J02", "test: filas", D["filas"], "14.211", 0, donde="D 8.1")
    ancla("J02", "test: positivos", D["positivos"], "3.602", 0, donde="D 8.1")
    ancla("J02", "test: tasa de positivos (%)", D["tasa"], "25,35", 2, 100, donde="registro J02")
    ancla("J02", "test: contactables", D["contactables"], "9.962", 0, donde="D 8.1")
    ancla("J02", "test: contactables por corte", " · ".join(es(x, 0) for x in D["contactables_por_corte"]),
          "1.973 · 1.969 · 2.005 · 2.016 · 1.999", donde="registro J02")
    ancla("J02", "test: positivos contactables", D["positivos_contactables"], "2.521", 0, donde="D 8.2")
    ancla("J02", "test: positivos contactables (%)", D["positivos_contactables_tasa"], "25,3", 1, 100,
          donde="registro J02")
    ancla("J02", "entrenamiento final: filas", T["entrenamiento"]["filas"], "18.882", 0, donde="D 8.3")
    ancla("J02", "entrenamiento final: cortes", T["entrenamiento"]["cortes"], "18", 0, donde="D 8.3")
    ancla("J02", "entrenamiento final: clientes", T["entrenamiento"]["clientes"], "2.921", 0, donde="D 8.3")
    ancla("J02", "entrenamiento final: positivos", T["entrenamiento"]["positivos"], "5.698", 0, donde="D 8.3")
    ancla("J02", "entrenamiento final: período", f"{T['entrenamiento']['desde']} a {T['entrenamiento']['hasta']}",
          "2023-01-31 a 2024-06-30", donde="registro J02")
    # J03
    ancla("J03", "test: precisión de la logística (%)", L["test"]["precision"], "85,88", 2, 100, donde="D 8.1")
    ancla("J03", "test: aciertos de la logística", L["test"]["vp"], "2.147", 0, donde="D 8.1")
    ancla("J03", "test: precisión de la regla (%)", R["test"]["precision"], "86,13", 2, 100, donde="D 8.1")
    ancla("J03", "test: aciertos de la regla", R["test"]["vp"], "2.153,35", 2, donde="D 8.1")
    ancla("J03", "test: precisión por corte, logística (%)", lista(L["test"]["precision_por_corte"], 1),
          "84,6 · 87,2 · 86,6 · 87,0 · 84,0", donde="registro J03")
    ancla("J03", "test: precisión por corte, regla (%)", lista(R["test"]["precision_por_corte"], 2),
          "83,60 · 86,72 · 87,00 · 88,20 · 85,15", donde="registro J03 (83,6; 86,72; 87,0; 88,2 y 85,15)")
    ancla("J03", "tabla 8.1: métrica principal = precisión", T["tabla_8_1"][0]["modelo_test"], "85,9", 1, 100,
          donde="D 8.1")
    # J04
    ancla("J04", "test: recall de la logística (%)", L["test"]["recall"], "85,16", 2, 100, donde="D 8.1")
    ancla("J04", "test: F1 de la logística (%)", L["test"]["f1"], "85,52", 2, 100, donde="D 8.1")
    ancla("J04", "test: recall de la regla (%)", R["test"]["recall"], "85,42", 2, 100, donde="D 8.1")
    ancla("J04", "test: F1 de la regla (%)", R["test"]["f1"], "85,77", 2, 100, donde="D 8.1")
    ancla("J04", "validación: recall de la logística (%)", L["validacion"]["recall"], "94,30", 2, 100,
          donde="registro J04 (H15)")
    ancla("J04", "validación: F1 de la logística (%)", L["validacion"]["f1"], "82,84", 2, 100, donde="registro J04")
    # J05
    ancla("J05", "test: AUC-ROC de la logística", L["test"]["auc_roc_contactables"], "0,974", 3, donde="D 8.1")
    ancla("J05", "test: AUC-ROC de la regla", R["test"]["auc_roc_contactables"], "0,979", 3, donde="D 8.1")
    ancla("J05", "validación: AUC-ROC de la logística", L["validacion"]["auc_roc_contactables"], "0,966", 3,
          donde="D 8.1")
    ancla("J05", "validación: AUC-ROC de la regla", R["validacion"]["auc_roc_contactables"], "0,970", 3,
          donde="registro J05")
    ancla("J05", "test: AUC-ROC de la práctica actual", PA["test"]["auc_roc_contactables"], "0,660", 3,
          donde="registro J05")
    # J06
    ancla("J06", "test: valor neto de la logística (USD, 5 cortes)", L["test"]["usd"], "135,64", 2,
          donde="registro J06")
    ancla("J06", "test: valor neto de la logística (USD/año)", L["test"]["usd_anio"], "325,52", 2, donde="D 8.1")
    ancla("J06", "test: valor neto de la regla (USD, 5 cortes)", R["test"]["usd"], "136,28", 2, donde="registro J06")
    ancla("J06", "test: valor neto de la regla (USD/año)", R["test"]["usd_anio"], "327,06", 2, donde="D 8.1")
    ancla("J06", "test: logística menos regla (USD/año)", L["test"]["usd_anio"] - R["test"]["usd_anio"], "−1,54", 2,
          donde="D 8.2")
    ancla("J06", "validación: valor neto de la logística (USD/año)", L["validacion"]["usd_anio"], "252,84", 2,
          donde="D 8.1")
    ancla("J06", "validación: valor neto de la regla (USD/año)", R["validacion"]["usd_anio"], "264,54", 2,
          donde="registro J06 (H16)")
    # J07: test − validación, columna de la 8.1
    tb = {r["fila"]: r["diferencia_test_menos_validacion"] for r in T["tabla_8_1"]}
    ancla("J07", "8.1: precisión, test − validación (puntos)", tb["precision"], "12,0", 1, 100, donde="D 8.1")
    ancla("J07", "8.1: recall, test − validación (puntos)", tb["recall"], "−9,1", 1, 100, donde="D 8.1")
    ancla("J07", "8.1: F1, test − validación (puntos)", tb["f1"], "2,7", 1, 100, donde="D 8.1")
    ancla("J07", "8.1: AUC-ROC, test − validación", tb["auc_roc"], "0,008", 3, donde="D 8.1")
    ancla("J07", "8.1: valor neto, test − validación (USD/año)", tb["valor_neto_anual_usd"], "72,68", 2,
          donde="D 8.1")
    # J08
    for metodo, cel, docs in (("logistica_ajustada", "test", ("2.147", "374", "353", "7.088")),
                              ("regla", "test", ("2.153,35", "367,65", "346,65", "7.094,35")),
                              ("logistica_ajustada", "validacion", ("1.108", "67", "392", "3.471"))):
        m = test["metodos"][metodo][cel]
        for k, doc in zip(("vp", "fn", "fp", "vn"), docs):
            ancla("J08", f"matriz {cel}, {metodo}: {k.upper()}", m[k], doc, 2 if "," in doc else 0,
                  donde="D 8.1" if metodo == "logistica_ajustada" and cel == "test" else "registro J08")
    ancla("J08", "matriz test: filas contactables", sum(L["test"][k] for k in ("vp", "fn", "fp", "vn")), "9.962", 0,
          donde="D 8.1")
    # J09
    ancla("J09", "test: logística − regla (puntos)", CO["diferencia_pp"], "−0,25", 2, donde="D 8.2")
    ancla("J09", "test: IC 95 % inferior (puntos)", CO["ic95_pp"][0], "−1,45", 2, donde="D 8.2")
    ancla("J09", "test: IC 95 % superior (puntos)", CO["ic95_pp"][1], "0,79", 2, donde="D 8.2")
    ancla("J09", "test: réplicas a favor del modelo (%)", CO["replicas_a_favor"], "31,0", 1, 100, donde="D 8.2")
    ancla("J09", "test: aciertos de menos de la logística (5 cortes)", CO["aciertos_de_menos"], "6,35", 2,
          donde="D 8.2")
    ancla("J09", "test: aciertos extra por mes", CO["aciertos_extra_por_mes"], "−1,27", 2, donde="D 8.2")
    ancla("J09", "validación: logística − regla (puntos)", CO["validacion_diferencia_pp"], "−1,93", 2,
          donde="registro J09 (H16)")
    ancla("J09", "validación: IC 95 % (puntos)", " a ".join(es(x, 2) for x in CO["validacion_ic95_pp"]),
          "−3,25 a −1,07", donde="registro J09 (H16)")
    # J10
    DE = test["decision"]
    ancla("J10", "decisión: condición 1 (el intervalo excluye el cero)", DE["condicion_1"], False, donde="D 8.2")
    ancla("J10", "decisión: límite inferior del intervalo (puntos)", DE["ic95_inferior_pp"], "−1,45", 2,
          donde="D 8.2")
    ancla("J10", "decisión: condición 2 (paga lo que agrega)", DE["condicion_2"], False, donde="D 8.2")
    ancla("J10", "decisión: aciertos extra por mes", DE["aciertos_extra_por_mes"], "−1,27", 2, donde="D 8.2")
    ancla("J10", "decisión: aciertos por mes que pagan el costo", DE["aciertos_por_mes_para_pagar"], "8.595", 0,
          donde="D 8.2")
    ancla("J10", "decisión: costo incremental (USD)", DE["costo_incremental_usd"], "10.400", 0, donde="D 8.2")
    ancla("J10", "decisión: la lista sigue con la regla", DE["sigue_la_regla"], True, donde="D 8.2")
    # J11
    S = test["sin_filtro"]
    ancla("J11", "sin filtro: precisión de la logística (%)", S["logistica_ajustada"]["precision"], "90,32", 2, 100,
          donde="D 8.2")
    ancla("J11", "sin filtro: aciertos de la logística", S["logistica_ajustada"]["aciertos"], "2.258", 0,
          donde="registro J11")
    ancla("J11", "sin filtro: recall de la logística (%)", S["logistica_ajustada"]["recall"], "62,7", 1, 100,
          donde="registro J11")
    ancla("J11", "sin filtro: precisión de la regla (%)", S["regla"]["precision"], "89,26", 2, 100,
          donde="registro J11")
    ancla("J11", "sin filtro: aciertos de la regla", S["regla"]["aciertos"], "2.231,4", 1, donde="registro J11")
    ancla("J11", "sin filtro: logística − regla (puntos)", S["diferencia_pp"], "1,06", 2, donde="D 8.2")
    ancla("J11", "sin filtro: IC 95 % (puntos)", " a ".join(es(x, 2) for x in S["ic95_pp"]), "0,41 a 1,95",
          donde="D 8.2 (+0,41 a +1,95)")
    ancla("J11", "sin filtro: réplicas a favor del modelo (%)", S["replicas_a_favor"], "99,9", 1, 100,
          donde="registro J11")
    ancla("J11", "sin filtro: aciertos de más por mes", S["aciertos_de_mas_por_mes"], "5,32", 2, donde="D 8.2")
    ancla("J11", "sin filtro: valor neto de la logística (USD/año)", S["logistica_ajustada"]["usd_anio"], "352,39",
          2, donde="D 8.2")
    ancla("J11", "sin filtro: valor neto de la regla (USD/año)", S["regla"]["usd_anio"], "345,95", 2, donde="D 8.2")
    ancla("J11", "sin filtro: logística − regla (USD/año)", S["usd_anio_de_mas"], "6,44", 2, donde="D 8.2")
    ancla("J11", "sin filtro: AUC-ROC de la logística", S["logistica_ajustada"]["auc_roc"], "0,972", 3,
          donde="registro J11")
    ancla("J11", "sin filtro: AUC-ROC de la regla", S["regla"]["auc_roc"], "0,977", 3, donde="registro J11")
    ancla("J11", "sin filtro: decil superior de la logística (%)", S["logistica_ajustada"]["decil_superior"], "93,2",
          1, 100, donde="registro J11")
    ancla("J11", "sin filtro: decil superior de la regla (%)", S["regla"]["decil_superior"], "93,7", 1, 100,
          donde="registro J11")
    # J12
    J12 = {"modelo_sobre_la_regla": ("10.400", ("5,38", "−99,95"), ("−1,54", "−100,01"), ("6,44", "−99,94")),
           "proyecto_completo": ("30.660", ("304,87", "−99,01"), ("325,52", "−98,94"), ("352,39", "−98,85")),
           "regla_sin_modelo": ("20.260", ("299,49", "−98,52"), ("327,06", "−98,39"), ("345,95", "−98,29"))}
    if [r["fila"] for r in test["roi_b_3_4"]] != list(J12):
        sys.exit(f"contra_roi_b_3_4: filas {[r['fila'] for r in test['roi_b_3_4']]}, el registro J12 trae {list(J12)}")
    for r in test["roi_b_3_4"]:
        costo, *celdas = J12[r["fila"]]
        ancla("J12", f"8.2 {r['fila']}: costo del año 1 (USD)", r["costo_usd"], costo, 0, donde="D 8.2")
        for k, (u, roi_) in zip(("b_3_4", "contactables", "sin_filtro"), celdas):
            ancla("J12", f"8.2 {r['fila']}, {k}: USD/año", r[k]["usd"], u, 2, donde="D 8.2")
            ancla("J12", f"8.2 {r['fila']}, {k}: ROI (%)", r[k]["roi_pct"], roi_, 2, donde="D 8.2")
            ancla("J12", f"8.2 {r['fila']}, {k}: recupera en el año", r[k]["recupera_en_el_anio"], False,
                  donde="D 8.2")
        ancla("J12", f"8.2 {r['fila']}: cambia el veredicto", r["cambia_el_veredicto"], False, donde="D 8.2")
    # J13
    MA = test["meta_y_alerta"]
    ancla("J13", "regla en test: aciertos por mes", MA["regla_aciertos_por_mes"], "430,67", 2, donde="D 8.2")
    ancla("J13", "meta del criterio 1 (aciertos por mes)", MA["meta_aciertos_por_mes"], "379", 0, donde="D 8.2")
    ancla("J13", "regla en test: precisión por corte, mínima (%)", MA["regla_precision_minima"], "83,6", 1, 100,
          donde="D 8.2")
    ancla("J13", "regla en test: precisión por corte, máxima (%)", MA["regla_precision_maxima"], "88,2", 1, 100,
          donde="D 8.2")
    ancla("J13", "alerta de la fila 10 (%)", MA["alerta_precision"], "72,0", 1, 100, donde="D 8.2 (H44)")
    # J14
    CA = test["calibracion"]
    ancla("J14", "calibración: Brier", CA["brier"], "0,066", 3, donde="registro J14")
    ancla("J14", "calibración: Brier con la tasa base", CA["brier_tasa_base"], "0,189", 3, donde="registro J14")
    ancla("J14", "calibración: probabilidad media (%)", CA["probabilidad_media"], "21,8", 1, 100, donde="D 8.2")
    ancla("J14", "calibración: tasa observada (%)", CA["tasa_observada"], "25,3", 1, 100, donde="D 8.2")
    ancla("J14", "calibración: positivos esperados", CA["positivos_esperados"], "3.104", 0, donde="registro J14")
    ancla("J14", "calibración: error por deciles", CA["ece_deciles"], "0,058", 3, donde="registro J14")
    ancla("J14", "calibración: la lista promete (%)", CA["lista_500_probabilidad_media"], "80,4", 1, 100,
          donde="registro J14")
    ancla("J14", "calibración: la lista acierta (%)", CA["lista_500_precision"], "90,3", 1, 100, donde="registro J14")
    # J15 y J21
    SG = {s["id"]: s for s in test["segmentos"]["filas"]}
    J15 = {"mujeres": ("1.132", "91,3", "89,5 a 92,8", "89,9"), "hombres": ("1.175", "90,0", "88,2 a 91,6", "89,0"),
           "genero_x": ("66", "80,3", "69,2 a 88,1", None), "alto_valor": ("727", "87,6", "85,0 a 89,8", "86,5"),
           "menos_de_12_meses": ("62", "91,9", "82,5 a 96,5", None), "alta_online": ("1.034", "91,3", None, None),
           "alta_fisica": ("1.466", "89,6", None, None)}
    for i, (lug, prec, ic, regla) in J15.items():
        s = SG[i]
        ancla("J15", f"segmento {i}: lugares en la lista", s["en_lista"], lug, 0, donde="D 8.2")
        ancla("J15", f"segmento {i}: precisión (%)", s["precision"], prec, 1, 100, donde="D 8.2")
        if ic:
            ancla("J15", f"segmento {i}: intervalo de Wilson (%)", " a ".join(es(x * 100, 1) for x in s["ic95"]), ic,
                  donde="registro J15")
        if regla:
            ancla("J15", f"segmento {i}: precisión de la regla (%)", s["precision_regla"], regla, 1, 100,
                  donde="registro J15")
    for i, (t_doc, v_doc) in {"menos_de_12_meses": ("1,6", "−4,0"), "alta_online": ("1,0", "−1,9"),
                              "alto_valor": ("−2,7", "−3,0")}.items():
        ancla("J21", f"segmento {i}: diferencia en test (puntos)", SG[i]["diferencia_pp"], t_doc, 1, donde="D 8.3")
        ancla("J21", f"segmento {i}: diferencia en validación (puntos)", SG[i]["validacion_diferencia_pp"], v_doc, 1,
              donde="registro J21 (H25 a H27)")
    ancla("J21", "segmento alto_valor: la regla contra su lista (puntos)", SG["alto_valor"]["diferencia_regla_pp"],
          "−2,8", 1, donde="D 8.3")
    ancla("J21", "segmentos: precisión de toda la lista (%)", test["segmentos"]["lista_precision"], "90,32", 2, 100,
          donde="registro J21")
    # J16 y J20
    MO = test["modelo"]
    ancla("J16", "modelo: C", MO["C"], "0,01", 2, donde="D 8.3")
    ancla("J16", "modelo: min_frecuencia", MO["min_frecuencia"], "100", 0, donde="D 8.3")
    ancla("J16", "modelo: motivos agrupados (18 cortes)", MO["agrupadas"], "3", 0, donde="D 8.3")
    ancla("J16", "modelo: motivos agrupados (16 cortes, etapa 3)", MO["agrupadas_etapa3"], "5", 0, donde="D 8.3")
    ancla("J16", "modelo: variables", MO["variables"], "39", 0, donde="D 8.3")
    ancla("J16", "modelo: términos con el intercepto", MO["terminos_con_intercepto"], "75", 0, donde="D 8.3")
    ancla("J16", "modelo: iteraciones", MO["iteraciones"], "31", 0, donde="D 8.3")
    ancla("J16", "modelo: variable que sale", MO["sin"], ["genero"], donde="D 8.3")
    for c, doc in zip(MO["coeficientes"], ("−2,47", "1,31", "0,68", "0,24", "−0,18", "0,18")):
        ancla("J16", f"modelo: coeficiente de {c['termino']}", c["coeficiente"], doc, 2, donde="D 8.3")
    ancla("J16", "modelo: filas con ticket_90d vacío", MO["coeficientes"][5]["filas"], "5.173", 0,
          donde="registro J16")
    ancla("J16", "modelo: probabilidad del último puesto, mínima", MO["probabilidad_del_ultimo_puesto_minima"], "0,32",
          2, donde="D 8.3")
    ancla("J16", "modelo: probabilidad del último puesto, máxima", MO["probabilidad_del_ultimo_puesto_maxima"], "0,39",
          2, donde="D 8.3")
    ancla("J20", "modelo: versión", MO["version"], "1.1", donde="D 8.3")
    ancla("J20", "modelo: scikit-learn", MO["scikit_learn"], "1.9.1", donde="D 8.3")
    ancla("J20", "entrenamiento final: positivos (%)", T["entrenamiento"]["tasa"], "30,2", 1, 100, donde="D 8.3")
    ancla("J20", "modelo: pliegues temporales", MO["pliegues"], "4", 0, donde="D 8.3 (C 7.1)")
    # J17
    ancla("J17", "práctica actual en test: precisión (%)", PA["test"]["precision"], "37,6", 1, 100, donde="D 8.2")
    ancla("J17", "práctica actual en test: USD/año", PA["test"]["usd_anio"], "33,35", 2, donde="D 8.2")
    # J18
    V = test["validacion"]
    F = test["fuera_de_la_lista"]
    ancla("J18", "validación: positivos contactables", V["positivos_contactables"], "1.175", 0, donde="D 8.2")
    ancla("J18", "validación: positivos contactables por corte", V["positivos_contactables_por_corte"], "392", 0,
          donde="D 8.2")
    ancla("J18", "test: positivos contactables por corte", D["positivos_contactables_por_corte"], "504", 0,
          donde="D 8.2")
    ancla("J18", "validación: techo de la lista (%)", V["techo_precision"], "78,3", 1, 100, donde="D 8.2")
    ancla("J18", "test: positivos contactables fuera de la lista", F["test"], "374", 0, donde="D 8.2")
    ancla("J18", "test: fuera de la lista (%)", F["test_tasa"], "14,8", 1, 100, donde="D 8.2")
    ancla("J18", "validación: positivos contactables fuera de la lista", F["validacion"], "67", 0, donde="D 8.2")
    ancla("J18", "validación: fuera de la lista (%)", F["validacion_tasa"], "5,7", 1, 100, donde="registro J18")
    # J19
    EQ = test["equilibrio"]
    ancla("J19", "test: s de equilibrio de la regla (%)", EQ["s_equilibrio"], "46,9", 1, 100, donde="D 11.2")
    ancla("J19", "test: diferencia de compra a 7 días que paga la regla (puntos)", EQ["diferencia_compra_7d_pp"],
          "40,4", 1, donde="D 11.2 (igual que H49)")
    return test


def armar_plan() -> dict:
    from datetime import date, timedelta
    lunes = date.fromisoformat(SEMANA_1)

    def inicio(sem):
        return (lunes + timedelta(weeks=sem - 1)).isoformat()

    def fin(sem):
        return (lunes + timedelta(weeks=sem, days=-1)).isoformat()

    fases = [{"id": i, "nombre": n, "desde_semana": a, "hasta_semana": b, "semanas": b - a + 1,
              "desde": inicio(a), "hasta": fin(b)} for i, n, a, b in FASES_PLAN]
    plan = {"semana_1": SEMANA_1, "fases": fases, "semanas": max(f["hasta_semana"] for f in fases),
            "hitos_semana": HITOS_PLAN}
    f = {x["id"]: x for x in fases}
    ancla("J50", "plan: semanas de cada fase", " · ".join(str(x["semanas"]) for x in fases), "2 · 3 · 4 · 1 · 13 · 2",
          donde="D 12.1")
    ancla("J50", "plan: semanas en total", plan["semanas"], "20", 0, donde="D 12.1")
    ancla("J50", "plan: el piloto empieza en el go-live", f["piloto"]["desde_semana"] == HITOS_PLAN["go_live"], True,
          donde="D 12.1")
    ancla("J50", "plan: semana 1", f"{SEMANA_1} a {fin(1)}", "2026-11-02 a 2026-11-08", donde="registro J50")
    ancla("J50", "plan: piloto", f"{f['piloto']['desde']} a {f['piloto']['hasta']}", "2026-12-07 a 2027-03-07",
          donde="D 12.1 (07/12/2026 a 07/03/2027)")
    ancla("J50", "plan: decisión hasta", f["decision"]["hasta"], "2027-03-21", donde="D 12.1 (21/03/2027)")
    ancla("J50", "plan: operador antes del tercer mes del piloto",
          f["piloto"]["desde_semana"] < HITOS_PLAN["operador_despues_del_piloto"] < f["piloto"]["desde_semana"] + 8 + 1,
          True, donde="D 12.2 (C 6.3, riesgo 2)")
    return plan


def armar_monitoreo(drift: dict) -> dict:
    import csv
    from collections import defaultdict
    primero: dict[str, str] = {}
    with CAMPANIAS.open(encoding="utf-8", newline="") as fh:
        for r in csv.DictReader(fh):
            c, f_ = r["id_campania"], r["fecha_envio"]
            if c not in primero or f_ < primero[c]:
                primero[c] = f_
    nov = defaultdict(list)
    for c, f_ in primero.items():
        if f_[5:7] == "11":
            nov[f_[:4]].append((f_, c))
    campanias = [{"anio": int(a), "fecha": min(v)[0], "id_campania": min(v)[1]} for a, v in sorted(nov.items())]
    # (28/10, F6b) La alerta de drift de la D v1.3, 10.2 (J53): una suba de más de 2,1 puntos en un mes de los clientes
    # en riesgo sobre elegibles, con la identidad unida del E2; la mayor suba de 12/2023 a 08/2025. Referencias: 50,4 %
    # al 31/12/2025 y 38,5 % al 31/08/2025, antes de los meses de cobertura no confirmada (DC-09).
    serie = {s["corte"]: s for s in drift["serie"]}
    ref, ref_dc09 = serie["2025-12-31"], serie[drift["ventana_umbral"][1]]
    mon = {"campanias_noviembre": campanias,
           "drift": {"umbral_suba_pp": drift["umbral_suba_pp"], "umbral_corte": drift["umbral_corte"],
                     "ventana_umbral": drift["ventana_umbral"], "saltaria_en": drift["saltaria_en"],
                     "referencia": ref["pct"] / 100, "referencia_corte": ref["corte"],
                     "en_riesgo": ref["en_riesgo"], "elegibles": ref["elegibles"],
                     "antes_dc09": ref_dc09["pct"] / 100, "antes_dc09_corte": ref_dc09["corte"]}}
    ancla("J51", "campañas: primer envío de noviembre por año",
          " · ".join(f"{c['fecha']} {c['id_campania']}" for c in campanias),
          "2022-11-02 CAMP015 · 2023-11-16 CAMP039 · 2024-11-04 CAMP027 · 2025-11-12 CAMP018", donde="D 12.2")
    ancla("J53", "drift: suba en un mes que dispara la alerta (pp)", drift["umbral_suba_pp"], "2,1", 1, donde="D 10.2")
    ancla("J53", "drift: en riesgo sobre elegibles al 31/12/2025 (%)", mon["drift"]["referencia"], "50,4", 1, 100,
          donde="D 10.2 (D22)")
    ancla("J53", "drift: al 31/08/2025, antes de DC-09 (%)", mon["drift"]["antes_dc09"], "38,5", 1, 100,
          donde="D 10.2 (E01)")
    ancla("J53", "drift: cortes en que habría saltado", " · ".join(drift["saltaria_en"]),
          "2025-10-31 · 2025-11-30 · 2025-12-31", donde="registro J53")
    return mon


# ============================================================ main

def main() -> int:
    for n in ENTRADAS:
        if not (DATOS / n).exists():
            print(f"falta {DATOS / n}: corre antes entregas/entregable-3/_build/F/presentacion/exportar_web.py")
            return 1
    e2, e3, eco, co, e4, v4, drift = (cargar(n) for n in ENTRADAS)
    e1 = cargar_e1()
    c3 = cargar_c3()
    for d in c3["DIAPOSITIVAS"]:
        C3_TEXTO[f"d{d['n']}"] = json.dumps(d, ensure_ascii=False)
    for a in c3["ANEXOS"]:
        C3_TEXTO[a["n"]] = json.dumps(a, ensure_ascii=False)

    d3 = {
        "meta": {
            "version": "e3-1.1",
            "fuentes": [{"archivo": f"data/e3/{n}", "sha256": sha256(DATOS / n)} for n in ENTRADAS]
            + [{"archivo": str(f.relative_to(APP)), "sha256": sha256(f)} for f in (E1_PAYLOAD, CAMPANIAS)],
            "contenido": {"archivo": "e3/src/contenido_e3.js", "version": c3["VERSION"], "sha256": sha256(CONTENIDO)},
        },
        "caso": armar_caso(e3),
        "tecnica": armar_tecnica(e2, co, c3),
        "modelos": armar_modelos(e2, e3),
        "lista": armar_lista(e3),
        "economia": armar_economia(eco, e2, e3),
        "piloto": armar_piloto(eco, e2),
        "encuadre": armar_encuadre(e1),
        "legal": armar_legal(e1, c3),
        "test": armar_test(e4, v4, eco, e3),
        "plan": armar_plan(),
        "monitoreo": armar_monitoreo(drift),
    }

    print(f"{'ID':6s}{'ANCLA':58s}{'DOCUMENTO':>14s}{'PANTALLA':>14s}  OK")
    for a in ANCLAS:
        print(f"{a['id']:6s}{a['nombre'][:57]:58s}{str(a['documento']):>14s}{str(a['mostrado']):>14s}  "
              f"{'OK' if a['ok'] else 'FALLA ' + a['nota']}")
    print(f"\n{'CONTROL DE REIMPLEMENTACIÓN':44s}{'build_e3':>22s}{'economia.json':>22s}  OK")
    for c in CONTROLES:
        print(f"{c['nombre']:44s}{c['valor']:22.12f}{c['json']:22.12f}  {'OK' if c['ok'] else 'FALLA'}")
    fallan = [a for a in ANCLAS if not a["ok"]] + [c for c in CONTROLES if not c["ok"]]
    if fallan:
        print(f"\n{len(fallan)} anclas o controles no cierran. No se escribe {SALIDA.relative_to(APP)}.")
        return 1

    d3["anclas"] = [{k: a[k] for k in ("id", "nombre", "documento", "donde")} for a in ANCLAS]
    # la grilla va con una columna por renglón; el resto, indentado
    grilla = d3["economia"]["grilla"]
    columnas = {k: v for k, v in grilla.items() if isinstance(v, list) and k not in ("tramos", "notables")}
    for k in columnas:
        grilla[k] = f"@@{k}@@"
    texto = json.dumps(d3, ensure_ascii=False, indent=1)
    for k, valores in columnas.items():
        texto = texto.replace(f'"@@{k}@@"', json.dumps(valores, separators=(",", ":")))
    js = ("// Generado por pipeline/build_e3.py desde data/e3/*.json (contrato: pipeline/CONTRACT_E3.md).\n"
          "// No editar a mano.\n"
          f"export const D3 = {texto};\n")
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(js, encoding="utf-8")
    print(f"\n{len(ANCLAS)} anclas y {len(CONTROLES)} controles en verde. Escrito {SALIDA.relative_to(APP)} "
          f"({len(js.encode('utf-8')) / 1024:.1f} KB; grilla de {grilla['n']} puntos).")
    return 0


if __name__ == "__main__":
    sys.exit(main())

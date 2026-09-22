"""
Build E2 — orquestador del pipeline de calidad (CONTRACT_E2.md). Arma las 15
decisiones, las vistas V01-V12 y las anclas de la seccion 5; si todas cierran
escribe data/payload/e2.json y e2/src/datos_e2.js. Si alguna ancla falla,
imprime la tabla ok/falla y sale con codigo 1 sin escribir nada.

No importa nada de datos.js/build.py del E1: solo loader/features/series como
librerias puras, tal como pide el contrato.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
import calidad  # noqa: E402
import features  # noqa: E402
import loader  # noqa: E402
import series  # noqa: E402
import tablon  # noqa: E402
from pack import _jsonify  # noqa: E402

APP_DIR = Path(__file__).resolve().parents[1]
DATA_E1 = APP_DIR / "data" / "raw"
DATA_E2 = APP_DIR / "data" / "raw_e2"
OUT_JSON = APP_DIR / "data" / "payload" / "e2.json"
OUT_JS = APP_DIR / "e2" / "src" / "datos_e2.js"
TABLON_DIR = APP_DIR.parent / "entregas" / "entregable-2" / "_build" / "B" / "dataset"
TABLON_RESUMEN = TABLON_DIR / "resumen_tablon.json"

CORTE_REF = calidad.CORTE_REF
CORTE_SENS = calidad.CORTE_SENS
CORTE_2026 = pd.Timestamp("2026-08-31")
UMBRAL_COBERTURA = 0.60

_NUEVAS: list[dict] = []


def _nueva(nombre: str, valor) -> None:
    _NUEVAS.append({"nombre": nombre, "valor": valor})


# ============================================================ meta.archivos
_ARCHIVOS_CFG = [
    # (nombre, carpeta, path, col_fecha, sistema, granularidad)
    ("Transacciones_clientes.csv", DATA_E1, "fecha",
     "POS + e-commerce", "transacción"),
    ("Campanias_marketing.csv", DATA_E1, "fecha_envio",
     "sistema de campañas (segmentos sin origen declarado)", "envío"),
    ("Clientes.csv", DATA_E1, "fecha_alta",
     "CRM de fidelización + POS + checkout", "cliente"),
    ("Fidelizacion.csv", DATA_E1, "fecha_inscripcion",
     "programa de fidelización (sin linaje documentado)", "socio"),
    ("Tiendas.csv", DATA_E1, "fecha_apertura",
     "maestro de tiendas", "tienda"),
    ("Calendario.csv", DATA_E1, "fecha",
     "calendario operativo (origen no declarado)", "día"),
    ("Calendario.csv", DATA_E2, "fecha",
     "calendario operativo, extendido a 2026-08-31 (origen no declarado)", "día"),
    ("Catalogo_Acciones_Retencion.csv", DATA_E2, None,
     "contrato con proveedor de fidelización + definición de Marketing", "acción"),
    ("Contenido_Campanias.csv", DATA_E2, "fecha_envio",
     "sistema de gestión de campañas", "campaña"),
    ("Devoluciones.csv", DATA_E2, "fecha_devolucion",
     "POS / sistema contable", "devolución"),
    ("Historial_Bajas_No_Contacto.csv", DATA_E2, "fecha_solicitud",
     "CRM de fidelización (acepta_marketing en POS/checkout)", "solicitud"),
    ("Identidad_resuelta.csv", DATA_E2, None,
     "trabajo analítico propio (no es un sistema fuente)", "alias de cliente"),
    ("Interacciones_soporte_mensual.csv", DATA_E2, "mes",
     "sistema de atención al cliente", "cliente-mes"),
]


def _armar_meta_archivos() -> list[dict]:
    salida = []
    for nombre, carpeta, col_fecha, sistema, granularidad in _ARCHIVOS_CFG:
        df = pd.read_csv(carpeta / nombre)
        origen_dir = "raw" if carpeta == DATA_E1 else "raw_e2"
        entrada = {
            "nombre": nombre, "sistema": sistema, "filas": int(len(df)),
            "granularidad": granularidad,
            "origen_dir": origen_dir,
            # "Calendario.csv" aparece dos veces (raw y raw_e2, distinto contenido:
            # ver notes al final del build): 'ruta' es unica y sirve para
            # desambiguar cualquier lookup por nombre en el tablero.
            "ruta": f"{origen_dir}/{nombre}",
        }
        if col_fecha:
            fechas = pd.to_datetime(df[col_fecha])
            entrada["desde"] = fechas.min().strftime("%Y-%m-%d")
            entrada["hasta"] = fechas.max().strftime("%Y-%m-%d")
        else:
            entrada["desde"] = None
            entrada["hasta"] = None
        salida.append(entrada)
    return salida


# ================================================================ V01..V12
_PUNTO_ORACION_RE = re.compile(r"(?<!\d)\.(?!\d)")


def _partir_primera_oracion(texto: str) -> tuple[str, str]:
    """Corta `texto` en (primera oracion, resto), por el primer punto que separa
    oraciones (no el separador de miles de un numero, '50.000'). Si no hay uno,
    la primera oracion es el texto entero y el resto queda vacio."""
    m = _PUNTO_ORACION_RE.search(texto)
    if not m:
        return texto.strip(), ""
    primera, resto = texto[:m.end()], texto[m.end():]
    return primera.strip(), resto.strip()


def _partir_decision_justificacion(texto: str) -> tuple[str, str]:
    """Separa la celda 'Decision y justificacion' del registro en (decision,
    justificacion). Las celdas del wiki marcan esa frontera con ':' o ';' antes
    del primer punto de oracion (p. ej. DC-01 'dedupe de fila completa: el
    negocio confirmo...'); si no hay ninguno de los dos, cae al primer punto
    (_partir_primera_oracion). Si tampoco hay punto, la celda es una sola
    clausula sin justificacion aparte en el registro (p. ej. DC-03) y esta
    queda vacia: no se inventa una."""
    m_punto = _PUNTO_ORACION_RE.search(texto)
    limite = m_punto.start() if m_punto else len(texto)
    candidatos = [p for p in (texto.find(":", 0, limite), texto.find(";", 0, limite)) if p != -1]
    if candidatos:
        corte = min(candidatos)
        return texto[:corte].strip(), texto[corte + 1:].strip()
    return _partir_primera_oracion(texto)


# Las celdas de decisiones[] (archivo/hallazgo/decision_justificacion/antes/
# despues/estado) se LEEN de wiki/sintesis/decisiones-de-calidad-de-datos.md
# en cada corrida (CONTRACT_E2.md seccion 2: "los textos salen de las celdas,
# no se inventan"): una transcripcion a mano queda desactualizada apenas el
# wiki cambia (paso el 22/09: 8 celdas de DC-09/11/12/13/14 divergieron de una
# version hardcodeada). _DECISIONES_META completa lo que la tabla del wiki NO
# tiene (dimension de calidad de datos y la vista Vnn de cada decision): eso
# es metadata de este contrato, no texto citable.
WIKI_DECISIONES = APP_DIR.parent / "wiki" / "sintesis" / "decisiones-de-calidad-de-datos.md"
_MD_INLINE_RE = re.compile(r"[`*]")


def _limpiar_md(texto: str) -> str:
    """Saca backticks y asteriscos de enfasis markdown de una celda de tabla del
    wiki; el texto en si no se toca."""
    return _MD_INLINE_RE.sub("", texto).strip()


def _leer_decisiones_wiki() -> list[dict]:
    """Parsea la tabla '## Las decisiones' de WIKI_DECISIONES (7 columnas: id,
    Archivo, Hallazgo, Decision y justificacion, Antes, Despues, Estado)."""
    lineas = WIKI_DECISIONES.read_text(encoding="utf-8").splitlines()
    inicio = next(i for i, l in enumerate(lineas) if l.startswith("| id | Archivo"))
    filas = []
    for linea in lineas[inicio + 2:]:
        linea = linea.strip()
        if not linea.startswith("|"):
            break
        celdas = [c.strip() for c in linea.strip("|").split("|")]
        if len(celdas) != 7:
            raise ValueError(f"fila de '{WIKI_DECISIONES.name}' con {len(celdas)} celdas, esperaba 7: {linea!r}")
        id_, archivo, hallazgo, decision_justificacion, antes, despues, estado = (_limpiar_md(c) for c in celdas)
        filas.append(dict(id=id_, archivo=archivo, hallazgo=hallazgo,
                           decision_justificacion=decision_justificacion,
                           antes=antes, despues=despues, estado=estado))
    if len(filas) != 15:
        raise ValueError(f"'{WIKI_DECISIONES.name}' trae {len(filas)} decisiones, esperaba 15 (DC-01..DC-15)")
    return filas


_DECISIONES_META = {
    "DC-01": dict(dimension="unicidad", vista="V02"),
    "DC-02": dict(dimension="exactitud", vista="V05"),
    "DC-03": dict(dimension="consistencia", vista="V01"),
    "DC-04": dict(dimension="unicidad", vista="V04"),
    "DC-05": dict(dimension="unicidad", vista="V06"),
    "DC-06": dict(dimension="consistencia", vista="V07"),
    "DC-07": dict(dimension="validez", vista="V01"),
    "DC-08": dict(dimension="consistencia", vista="V02"),
    "DC-09": dict(dimension="completitud", vista="V03"),
    "DC-10": dict(dimension="exactitud", vista="V08"),
    "DC-11": dict(dimension="completitud", vista="V09"),
    "DC-12": dict(dimension="actualidad", vista="V06"),
    "DC-13": dict(dimension="unicidad", vista="V07"),
    "DC-14": dict(dimension="completitud", vista="V01"),  # decision N0 del 22/09: declarada, se ve en la tabla de V01
    "DC-15": dict(dimension="trazabilidad", vista="V12"),
}


def _armar_decisiones_fuente() -> list[dict]:
    filas = _leer_decisiones_wiki()
    ids_vistos = {f["id"] for f in filas}
    ids_esperados = set(_DECISIONES_META)
    if ids_vistos != ids_esperados:
        raise ValueError(f"ids de '{WIKI_DECISIONES.name}' {sorted(ids_vistos)} "
                          f"!= ids esperados {sorted(ids_esperados)}")
    return [{**fila, **_DECISIONES_META[fila["id"]]} for fila in filas]


_DECISIONES_FUENTE = _armar_decisiones_fuente()

_CIFRA_RE = re.compile(r"\b[CDE]\d{2}\b")


def _pares_antes_despues(ctx: dict) -> dict:
    """Un (valor, etiqueta) antes/despues por decision, tomado de las vistas ya
    calculadas (nunca de un numero suelto): el par que mejor resume el hallazgo
    de esa DC. No son las unicas cifras de la decision (eso vive en 'antes'/
    'despues' de texto libre del registro, seccion `hallazgo`/`impacto`)."""
    sc, v02, v03, v04, v05, v06, v07, v08, v09 = (
        ctx["stage_counts"], ctx["v02"], ctx["v03"], ctx["v04"], ctx["v05"],
        ctx["v06"], ctx["v07"], ctx["v08"], ctx["v09"])
    e1 = v02["riesgo"]["al_corte_ref"]
    al2026 = v02["riesgo"]["al_2026_08_31"]
    sens = v03["sensibilidad"]
    despues = v04["despues"]
    nps25 = next(f for f in v09["nps_anual"] if f["anio"] == 2025)
    ofertas_antes_n = sum(o["antes"]["n"] for o in v07["ofertas"] if o["antes"])
    n_acciones_catalogo = len(ctx["tabla_dc14"])
    n_acciones_con_proxy = sum(1 for f in ctx["tabla_dc14"] if f["tasa_exito_proxy_pct"] is not None)

    return {
        "DC-01": ((sc["crudo"], "filas"), (sc["dedupe"], "filas")),
        "DC-02": ((v05["unidades"]["antes"], "unidades"), (v05["unidades"]["despues"], "unidades")),
        "DC-03": ((ctx["grafias_canal_antes"], "grafías de canal"),
                  (ctx["canales_normalizados_despues"], "valores normalizados")),
        "DC-04": ((v04["antes"]["clientes"], "clientes"), (despues["clientes"], "clientes")),
        "DC-05": ((v06["envios"]["antes"], "envíos"), (v06["envios"]["despues"], "envíos")),
        "DC-06": ((v07["gold"]["envios"], "envíos 'Gold' (segmento)"), (v07["gold"]["socios"], "socios Gold (nivel real)")),
        "DC-07": ((sc["edades_fuera_de_rango"], "edades fuera de [15,100]"),
                  (sc["edades_fuera_de_rango"] + sc["edades_nulas"], "edades a nulo con bandera")),
        "DC-08": ((al2026["pct"], "% en riesgo (calendario extendido, 31/08/2026)"),
                  (e1["pct"], "% en riesgo (corte 31/12/2025)")),
        "DC-09": ((e1["pct"], "% riesgo al 31/12/2025 (en revisión)"),
                  (sens["corte_sens"]["pct"], "% riesgo al 31/08/2025 (sensibilidad)")),
        "DC-10": ((v08["variacion_pct"], "% variación precio unitario 2022-2025"),
                  (v08["variacion_pct"], "% variación (sin deflactar, limitación declarada)")),
        "DC-11": ((nps25["con_todo"], "NPS medio 2025 (todas las filas)"),
                  (nps25["solo_con_interaccion"], "NPS medio 2025 (solo con interacción)")),
        "DC-12": ((v06["bajas"]["total"], "bajas totales"), (v06["bajas"]["hasta_corte"], "bajas ≤ corte (analisis de comportamiento)")),
        "DC-13": ((ofertas_antes_n, "envíos con oferta única (sin CAMP004/CAMP034)"), (v06["envios"]["despues"], "envíos con oferta (duplicados resueltos)")),
        "DC-14": ((n_acciones_catalogo, "acciones con costo, sin tasa de éxito"),
                  (n_acciones_con_proxy, "acciones con tasa proxy asignada")),
        "DC-15": ((None, "sin diccionario"), (None, "sin diccionario")),
    }


def _armar_decisiones(ctx: dict) -> list[dict]:
    pares = _pares_antes_despues(ctx)
    salida = []
    for fila in _DECISIONES_FUENTE:
        decision, justificacion = _partir_decision_justificacion(fila["decision_justificacion"])
        hallazgo, _ = _partir_primera_oracion(fila["hallazgo"])
        impacto, _ = _partir_primera_oracion(fila["despues"])

        cifras = sorted(set(_CIFRA_RE.findall(
            fila["hallazgo"] + " " + fila["decision_justificacion"] + " " +
            fila["antes"] + " " + fila["despues"])))

        (valor_antes, etq_antes), (valor_despues, etq_despues) = pares[fila["id"]]

        salida.append({
            "id": fila["id"], "archivo": fila["archivo"], "dimension": fila["dimension"],
            "hallazgo": hallazgo,
            "decision": decision, "justificacion": justificacion,
            "estado": fila["estado"],
            "antes": {"valor": valor_antes, "etiqueta": etq_antes},
            "despues": {"valor": valor_despues, "etiqueta": etq_despues},
            "impacto": impacto, "cifras": cifras, "vista": fila["vista"],
        })
    return salida


def _armar_v01(decisiones: list[dict], meta_archivos: list[dict]) -> dict:
    por_estado: dict[str, int] = {}
    for d in decisiones:
        por_estado[d["estado"]] = por_estado.get(d["estado"], 0) + 1

    por_archivo: dict[str, list[str]] = {}
    for d in decisiones:
        por_archivo.setdefault(d["archivo"], []).append(d["id"])

    return {
        "n_archivos": len(meta_archivos), "n_decisiones": len(decisiones),
        "por_estado": por_estado,
        "por_archivo": [{"archivo": a, "decisiones": ids} for a, ids in por_archivo.items()],
    }


def _armar_v02(tx_e1: pd.DataFrame, clientes: pd.DataFrame, meta_archivos: list[dict]) -> dict:
    """Riesgo ANTES de DC-04 (loader.load_transacciones + features.client_facts,
    tal cual el E1), en el corte de referencia y en el corte del calendario
    extendido (2026-08-31)."""
    dims = {"region": features.REGIONES, "categoria": features.CATEGORIAS, "rfm": features.RFM_SEGMENTOS}
    F_ref = features.client_facts(tx_e1, CORTE_REF)
    F_2026 = features.client_facts(tx_e1, CORTE_2026)

    archivos_vista = [
        {"nombre": a["nombre"], "desde": a["desde"], "hasta": a["hasta"], "filas": a["filas"],
         "tipo": "contexto" if a["nombre"] in ("Calendario.csv", "Historial_Bajas_No_Contacto.csv") else "transaccional"}
        for a in meta_archivos
    ]

    # la lista de 800 en riesgo de mayor anualizado se arma SIEMPRE sobre la base
    # antes de DC-04 (igual que C11 del registro, 568 de 800): "las tres cifras
    # que cambian" del wiki (decisiones-de-calidad-de-datos.md) solo atribuye el
    # movimiento de "contactables de la lista de 800" a DC-12 (bajas), no a DC-04;
    # aplicar DC-04 a la lista movería 568->567 sin que el wiki lo documente como
    # tal, y ese numero ya se reporto a la catedra. V06 reusa esta misma lista_e1
    # (ver _armar_v06) en vez de recalcularla sobre tx_e2 (post DC-04).
    lista_e1 = features.top_lista(F_ref, clientes, dims, n=800)
    contactables_800_e1 = int(lista_e1["mk"].sum())

    return {
        "archivos": archivos_vista, "corte_ref": CORTE_REF.strftime("%Y-%m-%d"),
        "riesgo": {
            "al_2026_08_31": {"corte": CORTE_2026.strftime("%Y-%m-%d"), **calidad.resumen_riesgo(F_2026)},
            "al_corte_ref": {"corte": CORTE_REF.strftime("%Y-%m-%d"), **calidad.resumen_riesgo(F_ref)},
        },
        "_contactables_800_e1": contactables_800_e1,  # ancla `contactables 800`, ver anclas()
    }


def _armar_v03(pos: pd.DataFrame, tx_e2: pd.DataFrame) -> dict:
    """Cobertura mensual (DC-09) sobre `pos` (filas unicas monto>0, sin filtrar
    id_cliente, ANTES de DC-04) y sensibilidad de riesgo (DESPUES de DC-04)."""
    serie_completa = calidad.meses_cobertura(pos, UMBRAL_COBERTURA)
    serie = [f for f in serie_completa if "2023-01" <= f["mes"] <= "2025-12"]
    meses_flag = [f["mes"] for f in serie if f["flag"]]

    F_ref = features.client_facts(tx_e2, CORTE_REF)
    F_sens = features.client_facts(tx_e2, CORTE_SENS)

    return {
        "serie": serie, "meses_flag": meses_flag,
        "sensibilidad": {
            "corte_ref": {"corte": CORTE_REF.strftime("%Y-%m-%d"), **calidad.resumen_riesgo(F_ref)},
            "corte_sens": {"corte": CORTE_SENS.strftime("%Y-%m-%d"), **calidad.resumen_riesgo(F_sens)},
        },
    }


def _armar_v04(tx_e1: pd.DataFrame, tx_e2: pd.DataFrame, idr: pd.DataFrame) -> dict:
    F_antes = features.client_facts(tx_e1, CORTE_REF)
    F_despues = features.client_facts(tx_e2, CORTE_REF)
    mapa = idr.set_index("id_cliente")["id_cliente_canonico"]

    dup_con_actividad = calidad.duplicados_con_actividad(F_antes, mapa)

    personas = idr.groupby("id_cliente_canonico").size()
    personas_por_n_ids = [
        {"n_ids": int(n), "personas": int(cant)}
        for n, cant in personas.value_counts().sort_index().items()
    ]

    return {
        "antes": {
            "clientes": int(tx_e1["id_cliente"].nunique()),
            **calidad.resumen_riesgo(F_antes),
        },
        "despues": {
            "clientes": int(len(F_despues)),
            **calidad.resumen_riesgo(F_despues),
        },
        "personas_por_n_ids": personas_por_n_ids,
        "duplicados_con_actividad": dup_con_actividad,
    }


def _armar_v05(tx_dedupe: pd.DataFrame, devoluciones: pd.DataFrame) -> dict:
    unidades = calidad.unidades_antes_despues(tx_dedupe)
    dev = calidad.serie_devoluciones(tx_dedupe, devoluciones)
    return {
        "unidades": {"antes": unidades["antes"], "despues": unidades["despues"]},
        "devoluciones": {"crudas": dev["crudas"], "unicas": dev["unicas"]},
        "serie": dev["serie"], "desfase_dias": dev["desfase_dias"], "motivos": dev["motivos"],
    }


def _tasas_embudo(df: pd.DataFrame) -> dict:
    return {
        "abre_pct": round(float(df["abierto"].mean()) * 100, 1),
        "clic_pct": round(float(df["click"].mean()) * 100, 1),
        "compra_pct": round(float(df["compra_7dias"].mean()) * 100, 2),
    }


def _armar_v06(ca_cruda: pd.DataFrame, ca_limpia: pd.DataFrame, clientes: pd.DataFrame,
               bajas_contacto: pd.DataFrame, lista_800_despues: pd.DataFrame,
               mapa_identidad: pd.Series) -> dict:
    merged = ca_limpia.merge(clientes[["acepta_marketing"]], left_on="id_cliente", right_index=True, how="left")
    sin_cons = merged[merged["acepta_marketing"] == False]  # noqa: E712

    # 'despues' (base limpia) via series.embudo_campanias (E1, reusada tal cual);
    # 'antes' (base cruda, con duplicados) no tiene funcion del E1 que la exponga
    # como tasa global (embudo_campanias siempre dedupea antes de armar 'global'),
    # asi que se calcula aca con la misma formula (media de cada columna booleana).
    embudo_e1 = series.embudo_campanias(ca_cruda, CORTE_REF)
    despues_embudo = {
        "abre_pct": round(embudo_e1["global"]["abre"] * 100, 1),
        "clic_pct": round(embudo_e1["global"]["clic"] * 100, 1),
        "compra_pct": round(embudo_e1["global"]["compra_7dias"] * 100, 2),
    }

    # lista_800: CONTRACT_E2.md seccion 3, V06 (distinta de la ancla `contactables
    # 800`/C11, que es pre DC-04 y vive aparte en v02["_contactables_800_e1"]).
    # Aca la lista sale de features.top_lista sobre la base DESPUES de DC-04
    # (lista_800_despues, armada en main() con tx_e2/F_despues), y las bajas se
    # mapean a id_cliente_canonico antes de cruzar: Historial_Bajas_No_Contacto.csv
    # trae ids crudos, y la lista ya esta en ids canonicos.
    acepta = lista_800_despues["mk"] == 1
    bajas_canonicas = set(bajas_contacto["id_cliente"].map(lambda i: mapa_identidad.get(i, i)))
    tiene_baja = lista_800_despues["id"].isin(bajas_canonicas)
    contactables_sin_consentimiento = int(acepta.sum())
    contactables_sin_baja = int((acepta & ~tiene_baja).sum())

    return {
        "envios": {"antes": int(len(ca_cruda)), "despues": int(len(ca_limpia))},
        "embudo": {"antes": _tasas_embudo(ca_cruda), "despues": despues_embudo},
        "sin_consentimiento": {
            "n": int(len(sin_cons)),
            "pct": round(len(sin_cons) / len(ca_limpia) * 100, 1),
        },
        "bajas": {
            "total": int(len(bajas_contacto)),
            "hasta_corte": int((pd.to_datetime(bajas_contacto["fecha_solicitud"]) <= CORTE_REF).sum()),
            "2026": int((pd.to_datetime(bajas_contacto["fecha_solicitud"]).dt.year == 2026).sum()),
        },
        "lista_800": {
            "contactables_consentimiento": contactables_sin_consentimiento,
            "contactables_sin_baja": contactables_sin_baja,
        },
    }


def _armar_v07(ca_limpia: pd.DataFrame, contenido_crudo: pd.DataFrame, contenido_resuelto: pd.DataFrame,
               casos: list[dict], fidelizacion: pd.DataFrame) -> dict:
    contenido_norm_crudo = calidad.normalizar_tipo_oferta(contenido_crudo)
    dup_ids = contenido_norm_crudo.loc[contenido_norm_crudo["id_campania"].duplicated(keep=False), "id_campania"].unique()
    cou_antes = contenido_norm_crudo[~contenido_norm_crudo["id_campania"].isin(dup_ids)].drop_duplicates("id_campania")
    conv_antes = calidad.conversion_por_oferta(ca_limpia, cou_antes)
    conv_despues = calidad.conversion_por_oferta(ca_limpia, contenido_resuelto)

    j_simple = ca_limpia.merge(contenido_crudo[["id_campania"]], on="id_campania", how="inner")
    envios_duplicados_por_join = int(len(j_simple) - len(ca_limpia))

    jj = ca_limpia.merge(fidelizacion[["id_cliente", "nivel"]], on="id_cliente", how="left")
    envios_gold = int((ca_limpia["segmento_objetivo"] == "Gold").sum())
    evaluables = jj[jj["segmento_objetivo"].isin(["Bronze", "Silver", "Gold"]) & jj["nivel"].notna()]
    coincidencia_pct = round(float((evaluables["segmento_objetivo"] == evaluables["nivel"]).mean()) * 100, 1)
    socios_gold = int((fidelizacion["nivel"] == "Gold").sum())

    tipos = sorted(set(conv_antes) | set(conv_despues))
    ofertas = [{"tipo": t, "antes": conv_antes.get(t), "despues": conv_despues.get(t)} for t in tipos]

    return {
        "casos": casos, "ofertas": ofertas,
        "envios_duplicados_por_join": envios_duplicados_por_join,
        "gold": {"envios": envios_gold, "socios": socios_gold, "coincidencia_pct": coincidencia_pct},
    }


def _armar_v08(tx_crudo: pd.DataFrame) -> dict:
    precios = calidad.mediana_precio_unitario(tx_crudo)
    ipc = calidad.ipc_acumulado()
    v22 = next(f["valor"] for f in precios["mediana_unitaria"] if f["anio"] == 2022)
    v25 = next(f["valor"] for f in precios["mediana_unitaria"] if f["anio"] == 2025)
    return {
        "mediana_unitaria": precios["mediana_unitaria"], "ipc": ipc,
        "variacion_pct": round((v25 / v22 - 1) * 100, 1),
        "por_categoria": precios["por_categoria"],
    }


def _armar_v09(soporte: pd.DataFrame, tx_e1: pd.DataFrame) -> dict:
    sop_flag = calidad.nps_con_sin_interaccion(soporte)
    n_sin_inter = int(sop_flag["nps_sin_interaccion"].sum())

    reclamos_por_cliente_mes = []
    sop_flag2 = sop_flag.copy()
    sop_flag2["anio"] = pd.to_datetime(sop_flag2["mes"]).dt.year
    for anio, grupo in sop_flag2[pd.to_datetime(sop_flag2["mes"]) <= CORTE_REF].groupby("anio"):
        reclamos_por_cliente_mes.append({"anio": int(anio), "valor": round(float(grupo["reclamos"].mean()), 2)})

    F_e1 = features.client_facts(tx_e1, CORTE_REF)
    s = sop_flag[pd.to_datetime(sop_flag["mes"]) <= CORTE_REF].groupby("id_cliente").agg(
        rec=("reclamos", "sum"), nps=("nps_promedio", "mean"))
    x = F_e1.join(s, how="inner")

    return {
        "filas": int(len(soporte)),
        "sin_interaccion": {"n": n_sin_inter, "pct": round(n_sin_inter / len(soporte) * 100, 1)},
        "nps_anual": calidad.nps_anual(sop_flag, CORTE_REF),
        "reclamos_por_cliente_mes": reclamos_por_cliente_mes,
        "riesgo_vs_soporte": {
            "en_riesgo": {
                "reclamos_acum": round(float(x.loc[x["en_riesgo"], "rec"].mean()), 2),
                "nps": round(float(x.loc[x["en_riesgo"], "nps"].mean()), 1),
            },
            "sin_riesgo": {
                "reclamos_acum": round(float(x.loc[~x["en_riesgo"], "rec"].mean()), 2),
                "nps": round(float(x.loc[~x["en_riesgo"], "nps"].mean()), 1),
            },
        },
    }


def _armar_v10(v02: dict, v04: dict, v03: dict) -> dict:
    e1 = v02["riesgo"]["al_corte_ref"]
    despues = v04["despues"]
    sens = v03["sensibilidad"]["corte_sens"]
    delta_pct = round(despues["pct"] - e1["pct"], 1)
    delta_expo = round(despues["exposicion_M"] - e1["exposicion_M"], 1)
    return {
        "e1": {"pct": e1["pct"], "exposicion_M": e1["exposicion_M"], "en_riesgo": e1["en_riesgo"], "elegibles": e1["elegibles"]},
        "despues": {"pct": despues["pct"], "exposicion_M": despues["exposicion_M"], "en_riesgo": despues["en_riesgo"], "elegibles": despues["elegibles"]},
        "sens": {"corte": CORTE_SENS.strftime("%Y-%m-%d"), **sens},
        "cambios": [{"decision": "DC-04", "delta_pct_pp": delta_pct, "delta_exposicion_M": delta_expo}],
    }


def _armar_v11() -> dict:
    """Construye el tablon (pipeline/tablon.py, CONTRACT_E2.md seccion 4), lo
    escribe fuera de app/ (CSV gzip + resumen_tablon.json) y devuelve el resumen:
    V11 es una copia de ese resumen."""
    df, resumen = tablon.construir(DATA_E1, DATA_E2)
    TABLON_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = TABLON_DIR / f"{resumen['nombre']}.csv.gz"
    df.to_csv(csv_path, index=False, compression="gzip")
    TABLON_RESUMEN.write_text(json.dumps(resumen, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"tablon: {csv_path} ({len(df)} filas) y {TABLON_RESUMEN}")
    return resumen


def _armar_v12() -> dict:
    """Lo que se le reporta a Casa Oga (decisiones-de-calidad-de-datos.md,
    seccion 'Lo que se le reporta a Casa Oga')."""
    return {"pedidos": [
        {"id": "DC-13", "que": "confirmar la fila correcta de CAMP004 y CAMP034",
         "detalle": "Contenido_Campanias.csv trae dos filas para cada una; el equipo resolvió por criterio y pide que Casa Óga confirme cuál es la real.",
         "estado": "pendiente del negocio"},
        {"id": "DC-09", "que": "explicar la caída de operaciones de septiembre a diciembre de 2025",
         "detalle": "esos meses quedan marcados 'cobertura no confirmada' (menos del 60 % de las operaciones del mismo mes del año anterior).",
         "estado": "pendiente del negocio"},
        {"id": "D18", "que": "confirmar las 598 bajas sin solicitud registrada",
         "detalle": "598 clientes sin consentimiento no tienen una fila en Historial_Bajas_No_Contacto.csv que lo explique.",
         "estado": "pendiente del negocio"},
        {"id": "DC-07", "que": "corregir en origen 106 edades fuera de rango y 74 filas de fidelización inconsistentes",
         "detalle": "edades fuera de [15, 100] y puntos_canjeados > puntos_acumulados; pedido a Sistemas.",
         "estado": "pendiente del negocio"},
        {"id": "DC-15", "que": "el diccionario de datos columna por columna",
         "detalle": "no está en el DOCX del 08/09; se pide la versión del campus.",
         "estado": "pendiente del negocio"},
    ]}


# =================================================================== anclas
def _anclas(v02, v03, v04, v05, v06, v07, v08, v09, stage_counts, meses_flag) -> list[dict]:
    def a(nombre, valor, esperado, tol=0):
        if isinstance(esperado, list):
            ok = list(valor) == list(esperado)
        elif tol == 0:
            ok = valor == esperado
        else:
            ok = abs(valor - esperado) <= tol
        return {"nombre": nombre, "valor": valor, "esperado": esperado, "ok": bool(ok)}

    e1 = v02["riesgo"]["al_corte_ref"]
    al2026 = v02["riesgo"]["al_2026_08_31"]
    d = v04["despues"]

    return [
        a("filas crudas", stage_counts["crudo"], 50250),
        a("filas unicas", stage_counts["dedupe"], 50000),
        a("ventas M", stage_counts["ventas_M"], 994.4, 0.05),
        a("unidades antes", v05["unidades"]["antes"], 107352),
        a("unidades despues", v05["unidades"]["despues"], 106028),
        a("devoluciones crudas", v05["devoluciones"]["crudas"], 613),
        a("devoluciones unicas", v05["devoluciones"]["unicas"], 608),
        a("clientes antes", v04["antes"]["clientes"], 5978),
        a("elegibles antes", e1["elegibles"], 4940),
        a("en riesgo antes", e1["en_riesgo"], 2452),
        a("riesgo pct antes", e1["pct"], 49.6, 0.05),
        a("exposicion M antes", e1["exposicion_M"], 94.9, 0.05),
        a("riesgo pct 2026-08-31", al2026["pct"], 85.2, 0.05),
        a("en riesgo 2026-08-31", al2026["en_riesgo"], 4207),
        a("duplicados con actividad", v04["duplicados_con_actividad"], 348),
        a("clientes despues", d["clientes"], 5634),
        a("riesgo pct despues", d["pct"], 50.4, 0.05),
        a("exposicion M despues", d["exposicion_M"], 96.4, 0.05),
        a("envios crudos", v06["envios"]["antes"], 23729),
        a("envios unicos", v06["envios"]["despues"], 23529),
        a("clic pct despues", v06["embudo"]["despues"]["clic_pct"], 8.8, 0.05),
        a("sin consentimiento", v06["sin_consentimiento"]["n"], 7078),
        a("sin consentimiento pct", v06["sin_consentimiento"]["pct"], 30.1, 0.05),
        a("contactables 800", v02["_contactables_800_e1"], 568),
        a("bajas total", v06["bajas"]["total"], 1211),
        a("bajas hasta corte", v06["bajas"]["hasta_corte"], 812),
        a("bajas 2026", v06["bajas"]["2026"], 399),
        a("envios gold", v07["gold"]["envios"], 5066),
        a("socios gold", v07["gold"]["socios"], 3),
        a("coincidencia gold pct", v07["gold"]["coincidencia_pct"], 30.1, 0.05),
        a("precio mediana 2022", next(f["valor"] for f in v08["mediana_unitaria"] if f["anio"] == 2022), 8900),
        a("precio mediana 2025", next(f["valor"] for f in v08["mediana_unitaria"] if f["anio"] == 2025), 8221),
        a("precio variacion pct", v08["variacion_pct"], -7.6, 0.05),
        a("filas soporte", v09["filas"], 14976),
        a("nps sin interaccion", v09["sin_interaccion"]["n"], 4312),
        a("nps sin interaccion pct", v09["sin_interaccion"]["pct"], 28.8, 0.05),
        a("nps 2022", next(f["con_todo"] for f in v09["nps_anual"] if f["anio"] == 2022), 41.8, 0.05),
        a("nps 2025", next(f["con_todo"] for f in v09["nps_anual"] if f["anio"] == 2025), 16.2, 0.05),
        a("ofertas base antes", sum(o["antes"]["n"] for o in v07["ofertas"] if o["antes"]), 22614),
        a("cupon fijo tasa antes", next(o["antes"]["tasa_pct"] for o in v07["ofertas"] if o["tipo"] == "Cupón fijo"), 1.49, 0.05),
        a("edades fuera de rango", stage_counts["edades_fuera_de_rango"], 106),
        a("edades nulas", stage_counts["edades_nulas"], 524),
        a("meses flag", meses_flag, ["2025-09", "2025-10", "2025-11", "2025-12"]),
    ]


def main() -> int:
    # ---- bases E1 (reuso de loader/features, sin tocar el E1) ----
    tx_e1 = loader.load_transacciones(DATA_E1)          # dedupe + id_cliente + monto>0
    clientes = loader.load_clientes(DATA_E1)
    ca_e1 = loader.load_campanias(DATA_E1)               # SIN dedupe (crudo, 23.729 filas)
    fidelizacion = loader.load_fidelizacion(DATA_E1)

    stage = loader.stage_counts(DATA_E1)
    tx_crudo = pd.read_csv(DATA_E1 / "Transacciones_clientes.csv")
    tx_dedupe = calidad.aplicar_dedupe_transacciones(tx_crudo)
    tx_dedupe["fecha"] = pd.to_datetime(tx_dedupe["fecha"])
    pos = tx_dedupe[tx_dedupe["monto_neto"] > 0].copy()          # todos los canales, sin filtrar id_cliente
    ventas_M = round(float(pos["monto_neto"].sum()) / 1e6, 1)

    cl_edades = calidad.marcar_edades(pd.read_csv(DATA_E1 / "Clientes.csv"))
    stage_counts = {
        "crudo": stage["crudo"], "dedupe": stage["dedupe"], "identificado": stage["identificado"],
        "monto_pos": stage["monto_pos"], "ventas_M": ventas_M,
        "edades_fuera_de_rango": int(cl_edades["edad_flag"].sum()),
        "edades_nulas": int(pd.read_csv(DATA_E1 / "Clientes.csv")["edad"].isna().sum()),
    }

    # ---- DC-04: mapa de identidad ----
    idr = pd.read_csv(DATA_E2 / "Identidad_resuelta.csv")
    mapa = idr.set_index("id_cliente")["id_cliente_canonico"]
    tx_e2 = calidad.mapear_identidad(tx_e1, mapa, col="id_cliente")   # POST DC-04, funciones del E1

    # ---- DC-05: envios ----
    ca_e2 = calidad.dedupe_envios(ca_e1)

    # ---- DC-13: contenido de campanias ----
    contenido_crudo = pd.read_csv(DATA_E2 / "Contenido_Campanias.csv")
    contenido_resuelto, casos_dc13 = calidad.dedupe_contenido_campanias(contenido_crudo, ca_e1)

    # ---- otros CSV de unidad 2 ----
    devoluciones = pd.read_csv(DATA_E2 / "Devoluciones.csv")
    bajas = pd.read_csv(DATA_E2 / "Historial_Bajas_No_Contacto.csv")
    soporte = pd.read_csv(DATA_E2 / "Interacciones_soporte_mensual.csv")
    catalogo = pd.read_csv(DATA_E2 / "Catalogo_Acciones_Retencion.csv")

    meta_archivos = _armar_meta_archivos()

    dims = {"region": features.REGIONES, "categoria": features.CATEGORIAS, "rfm": features.RFM_SEGMENTOS}
    F_despues_ref = features.client_facts(tx_e2, CORTE_REF)          # DESPUES de DC-04, corte ref
    lista_800_despues = features.top_lista(F_despues_ref, clientes, dims, n=800)

    v02 = _armar_v02(tx_e1, clientes, meta_archivos)
    v03 = _armar_v03(pos, tx_e2)
    v04 = _armar_v04(tx_e1, tx_e2, idr)
    v05 = _armar_v05(tx_dedupe, devoluciones)
    v06 = _armar_v06(ca_e1, ca_e2, clientes, bajas, lista_800_despues, mapa)
    v07 = _armar_v07(ca_e2, contenido_crudo, contenido_resuelto, casos_dc13, fidelizacion)
    v08 = _armar_v08(tx_crudo)
    v09 = _armar_v09(soporte, tx_e1)
    v10 = _armar_v10(v02, v04, v03)
    v11 = _armar_v11()
    v12 = _armar_v12()

    # ---- DC-14: tasa proxy por accion (usa la conversion 'despues' de V07) ----
    # Se calcula ANTES de las decisiones para que DC-14.antes/despues salgan de
    # esta tabla (len(catalogo)) y no de un literal (ver _pares_antes_despues).
    conv_despues = {o["tipo"]: o["despues"] for o in v07["ofertas"]}
    tabla_dc14 = calidad.tasa_exito_proxy_por_accion(catalogo, conv_despues)

    ctx = {"stage_counts": stage_counts, "v02": v02, "v03": v03, "v04": v04,
           "v05": v05, "v06": v06, "v07": v07, "v08": v08, "v09": v09,
           "tabla_dc14": tabla_dc14, "grafias_canal_antes": int(tx_crudo["canal"].nunique()),
           "canales_normalizados_despues": int(tx_e1["canal_norm"].nunique())}
    decisiones = _armar_decisiones(ctx)
    v01 = _armar_v01(decisiones, meta_archivos)

    anclas = _anclas(v02, v03, v04, v05, v06, v07, v08, v09, stage_counts, v03["meses_flag"])

    ok = all(a["ok"] for a in anclas)
    print(f"\n{'ANCLA':32s}{'VALOR':>14s}{'ESPERADO':>14s}  OK")
    for a in anclas:
        estado = "OK" if a["ok"] else "FALLA"
        print(f"{a['nombre']:32s}{str(a['valor']):>14s}{str(a['esperado']):>14s}  {estado}")

    if not ok:
        print("\nHAY ANCLAS QUE NO CIERRAN. No se escribe e2.json ni datos_e2.js.")
        return 1

    del v02["_contactables_800_e1"]
    payload = {
        "meta": {
            "version": "e2-1.0", "corte_ref": CORTE_REF.strftime("%Y-%m-%d"),
            "corte_sens": CORTE_SENS.strftime("%Y-%m-%d"), "ultima_venta": stage["fecha_max"],
            "umbral_cobertura": UMBRAL_COBERTURA, "archivos": meta_archivos,
        },
        "decisiones": decisiones,
        "vistas": {
            "V01": v01, "V02": v02, "V03": v03, "V04": v04, "V05": v05, "V06": v06,
            "V07": v07, "V08": v08, "V09": v09, "V10": v10, "V11": v11, "V12": v12,
        },
        "anclas": anclas, "stage_counts": stage_counts,
    }
    payload = _jsonify(payload)

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JS.parent.mkdir(parents=True, exist_ok=True)
    raw = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    OUT_JSON.write_text(raw, encoding="utf-8")
    OUT_JS.write_text(f"export const D2 = {raw};\n", encoding="utf-8")
    print(f"\nescrito: {OUT_JSON} ({len(raw)/1024:.1f} KB) y {OUT_JS}")

    # ---------------------------------------------------------------- NUEVAS
    sens = v03["sensibilidad"]["corte_sens"]
    _nueva("sensibilidad 2025-08-31: elegibles", sens["elegibles"])
    _nueva("sensibilidad 2025-08-31: en riesgo", sens["en_riesgo"])
    _nueva("sensibilidad 2025-08-31: pct", sens["pct"])
    _nueva("sensibilidad 2025-08-31: exposicion M", sens["exposicion_M"])
    _nueva("contactables sin baja (800, base despues de DC-04, E02)", v06["lista_800"]["contactables_sin_baja"])
    for o in v07["ofertas"]:
        if o["despues"]:
            _nueva(f"conversion oferta despues · {o['tipo']}",
                   f"{o['despues']['tasa_pct']}% (IC {o['despues']['ic_lo']}-{o['despues']['ic_hi']}), n={o['despues']['n']}")
    for f in v09["nps_anual"]:
        _nueva(f"NPS {f['anio']} solo con interaccion", f["solo_con_interaccion"])
    _nueva("desfase mediano devoluciones (dias)", v05["desfase_dias"]["mediana"])
    _nueva("envios duplicados por el join (base DC-05, 23.529)", v07["envios_duplicados_por_join"])
    for caso in casos_dc13:
        etiqueta = f"{caso['elegida']['tipo_oferta']} ({caso['criterio']})"
        if caso.get("desempate"):
            etiqueta += " — BLOCKED: " + caso["desempate"]
        _nueva(f"fila elegida {caso['id_campania']}", etiqueta)

    print(f"\n{'NUEVAS':60s}VALOR")
    for n in _NUEVAS:
        print(f"{n['nombre']:60s}{n['valor']}")

    print(f"\nDC-14 tabla proxy (no tiene vista Vnn en la seccion 3; no viaja en e2.json):")
    for fila in tabla_dc14:
        print(f"  {fila['id_accion']:6s}{fila['accion']:38s}{fila['tipo_oferta_proxy'] or '—':14s}"
              f"tasa={fila['tasa_exito_proxy_pct']}")

    print("\nnotes:")
    print("- envios_duplicados_por_join da 915 (base DC-05, 23.529 envios limpios), no 920: "
          "el registro (DC-13 'antes') cita 920 calculado sobre la base cruda de 23.729 antes de "
          "DC-05; el orden de la seccion 1 del contrato aplica DC-05 antes que DC-13, asi que 915 "
          "es el numero reproducible con ese orden. Se declara acá, no se pisa en silencio.")
    print("- archivo 'unidad 2' = raw_e2/*.csv EXCEPTO Casos_Cualitativos_Clientes.csv (20 filas, "
          "narrativa cualitativa sin uso en ninguna DC/vista de este contrato): con esa lectura los "
          "'13 archivos' de meta.archivos cierran (6 del E1 + 7 de unidad 2, incluye el Calendario "
          "extendido de raw_e2, que aparece dos veces con distinto contenido: la version E1 y la "
          "version 'unidad 2' extendida a 2026-08-31).")
    print("- decisiones[].archivo usa el texto literal de la columna 'Archivo' del registro "
          "(p. ej. 'Transacciones · Devoluciones' para DC-02), no un unico nombre de CSV: preserva "
          "la cita textual en vez de elegir un archivo primario no declarado.")
    print("- decisiones[].decision/.justificacion se separan cortando la celda 'Decision y "
          "justificacion' del registro en ':' o ';' (lo que aparezca primero, antes del primer "
          "punto de oracion); sin ninguno de los dos, en el primer punto; sin punto tampoco, la "
          "celda es una sola clausula y .justificacion queda vacia (asi es DC-03 en el registro: "
          "'catálogo cerrado de dos valores, normalizado en la carga', sin una segunda clausula "
          "que sea justificacion). .impacto sale de la celda 'Despues'.")
    print("- BLOCKED (no resuelto por este build, ver CONTRACT_E2.md DC-13): CAMP034 tiene la MISMA "
          "fecha_envio (coincide con Campanias_marketing) Y la MISMA fecha_creacion (2023-06-10) "
          "entre sus dos filas de Contenido_Campanias; el contrato no da un tercer criterio para "
          "este caso. decisiones/V07.casos trae 'criterio': 'fecha_creacion más reciente' (dentro "
          "del enum del contrato) mas una clave 'desempate' que declara el empate, y se conserva "
          "la primera fila del archivo (Envío gratis) de forma arbitraria y documentada, no como "
          "respuesta del negocio. Pregunta pendiente para Casa Óga (ya en V12/DC-13): ¿cual de las "
          "dos filas de CAMP034 es la real, Envío gratis o Descuento?")
    print("- V06.lista_800 (contactables de la lista de 800): sale de features.top_lista sobre la "
          "base DESPUES de DC-04 (tx_e2/F_despues_ref, CONTRACT_E2.md seccion 3), y las bajas de "
          "Historial_Bajas_No_Contacto.csv se mapean a id_cliente_canonico antes de cruzarlas. Da "
          "567 con consentimiento y 549 sin ninguna baja, como fija E02 del registro. La ancla "
          "`contactables 800` (C11 = 568) sigue aparte, pre DC-04, en v02/_contactables_800_e1: no "
          "es la misma cifra ni la misma base, y no se mezclan.")
    print("- DC-14 (decision N0-11 del 22/09, CONTRACT_E2.md seccion 1): declarada. El costo se usa "
          "como vigente al 22/09; la tasa de exito por accion se construye en el E3. La tabla proxy "
          "de arriba es editorial (_ACCION_OFERTA_MAP) y no viaja en e2.json; vista = V01.")

    return 0


if __name__ == "__main__":
    sys.exit(main())

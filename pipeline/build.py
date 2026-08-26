"""Pipeline de punta a punta: de los 6 CSV crudos al payload que consume la SPA.

Un solo comando, sin pasos manuales:

    python3 pipeline/build.py

Escribe data/payload/datos.json y src/datos.js. Si una de las anclas del CONTRACT
no da exacto, corta y no escribe nada.
"""
import json
import sys
import time
from pathlib import Path

import features
import loader
import pack

RAIZ = Path(__file__).resolve().parents[1]
DATA_DIR = RAIZ / "data" / "raw"
OUT_JSON = RAIZ / "data" / "payload" / "datos.json"
OUT_JS = RAIZ / "src" / "datos.js"

DIMS = {
    "region": features.REGIONES,
    "categoria": features.CATEGORIAS,
    "rfm": features.RFM_SEGMENTOS,
    "quintil": [1, 2, 3, 4, 5],
}

# Anclas del CONTRACT seccion 5. Se chequean sobre el corte de referencia.
CORTE_REF = "2025-12-31"
CORTE_ANTERIOR = "2025-09-30"


def _millones(x):
    return round(x / 1e6, 1)


def main():
    t0 = time.time()
    import pandas as pd
    import series

    counts = loader.stage_counts(DATA_DIR)
    tx = loader.load_transacciones(DATA_DIR)
    clientes = loader.load_clientes(DATA_DIR)
    camp = loader.load_campanias(DATA_DIR)
    lista_cortes = loader.cortes()

    # Indice global de ids de cliente: el contrato pide que la lista viaje con un
    # indice uint16, no con el string "CLI00001" repetido 20.000 veces.
    ids_cliente = sorted(tx["id_cliente"].unique())
    pos_cliente = {cid: i for i, cid in enumerate(ids_cliente)}

    contingencias = []
    listas = []
    exposicion_por_corte = []
    resumen_por_corte = []

    for corte in lista_cortes:
        facts = features.client_facts(tx, corte)
        cont = features.contingency(facts, DIMS)
        lista = features.top_lista(facts, clientes, DIMS, n=800)
        lista["id"] = lista["id"].map(pos_cliente).astype(int)

        contingencias.append(cont)
        listas.append(lista)

        en_riesgo = facts["en_riesgo"]
        # Un cliente con poca historia infla su gasto anualizado: dividir la facturacion
        # por 0,2 anios da una tasa anual que no existe. A los en_riesgo no los alcanza
        # (nunca bajan de 0,61 anios), pero si al denominador. Se mide y se declara en vez
        # de corregirlo en silencio: al corte de referencia son 111 clientes con menos de un
        # anio de historia, que aportan el 2,8% de la base anualizada; en 2023-12 son 1.048
        # y aportan la mayor parte del total.
        anios = (corte - facts["primera"]).dt.days / 365.25
        corta = anios < 1.0
        exposicion_por_corte.append({
            "corte": corte.strftime("%Y-%m-%d"),
            "exposicion": int(round(facts.loc[en_riesgo, "anualizado"].sum())),
            "base_anualizada": int(round(facts["anualizado"].sum())),
            "base_anualizada_1a": int(round(facts.loc[~corta, "anualizado"].sum())),
            "clientes": int(len(facts)),
            "clientes_historia_corta": int(corta.sum()),
            "elegibles": int(facts["elegible"].sum()),
            "en_riesgo": int(en_riesgo.sum()),
        })
        resumen_por_corte.append(facts)

    # El corte de referencia es el ultimo de la lista (2025-12-31)
    facts_ref = resumen_por_corte[-1]
    anclas = _anclas(counts, facts_ref, tx)

    fallidas = [a for a in anclas if not a["ok"]]
    if fallidas:
        for a in fallidas:
            print(f"ANCLA FALLIDA  {a['nombre']}: esperado={a['esperado']} real={a['real']}")
        print(f"\n{len(fallidas)} anclas fallidas. No se escribe el payload.", file=sys.stderr)
        return 1

    bloques = {
        "dims": {k: list(v) for k, v in DIMS.items()},
        "clientes_ids": ids_cliente,
        "cortes": [c.strftime("%Y-%m-%d") for c in lista_cortes],
        "contingencias": contingencias,
        "listas": listas,
        "series": {
            "recompra_trimestral": series.recompra_trimestral(tx, hasta=pd.Timestamp(CORTE_REF)),
            "base_activa_anual": series.base_activa_anual(tx),
            "ventas_anuales": _ventas_anuales(DATA_DIR),
            "embudo_campanias": series.embudo_campanias(camp, pd.Timestamp(CORTE_REF)),
            "consentimiento": series.consentimiento(camp, clientes),
            "estacionalidad": series.estacionalidad(tx, tx_total=_tx_total(DATA_DIR)),
            "exposicion_por_corte": exposicion_por_corte,
        },
        "stage_counts": counts,
        "anclas": anclas,
        "meta": {
            "corte_ref": CORTE_REF,
            "capacidad_contacto": [500, 800],
            "meta_recompra": [10.0, 11.0],
            "base_recompra": [8.0, 9.0],
            "marca_a_superar": 1.39,
            "moneda": "ARS nominales, sin deflactar",
            "proxy": "sin compra por mas de 90 dias o mas de 1,5 veces el ritmo propio del cliente",
        },
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    payload = pack.pack_payload(bloques)
    tam = pack.emit(payload, str(OUT_JSON), str(OUT_JS))

    print(f"{len(anclas)}/{len(anclas)} anclas OK")
    print(f"payload json {tam['bytes_json'] / 1024:.0f} KB · js {tam['bytes_js'] / 1024:.0f} KB")
    print(f"{time.time() - t0:.1f} s")
    return 0


def _tx_total(data_dir):
    """Base sin filtrar cliente: dedupe + monto > 0 (49.392 filas).

    Es la base de "ventas de la empresa": la venta anonima es venta igual, y es la que
    reproduce las cifras anuales y la estacionalidad del wiki. La base por cliente
    identificado (27.276) mide otra cosa y no las reproduce — lo devolvieron como
    bloqueo los workers de series y tenian razon.
    """
    import pandas as pd

    raw = pd.read_csv(Path(data_dir) / "Transacciones_clientes.csv").drop_duplicates()
    raw = raw[raw["monto_neto"] > 0].copy()
    raw["fecha"] = pd.to_datetime(raw["fecha"])
    return raw


def _ventas_anuales(data_dir):
    """Ventas por anio sobre la base SIN filtrar cliente (dedupe + monto > 0, 49.392 filas).

    Es la base que reproduce las cifras del wiki (123,8 / 295,8 / 349,7 / 225,0 M y el
    -35,6% de 2025), y es la correcta para "ventas de la empresa": la venta anonima es
    venta igual. La serie por cliente identificado mide otra cosa y va aparte, con el
    porcentaje identificado al lado.
    """
    import pandas as pd

    raw = _tx_total(data_dir)
    anio = raw["fecha"].dt.year
    total = raw.groupby(anio)["monto_neto"].sum()
    ident = raw[raw["id_cliente"].notna()].groupby(anio)["monto_neto"].sum()
    return [
        {
            "anio": int(a),
            "ventas": int(round(total[a])),
            "ventas_identificadas": int(round(ident[a])),
            "pct_identificado": round(100 * ident[a] / total[a], 1),
        }
        for a in sorted(total.index)
    ]


def _anclas(counts, facts, tx):
    """Las anclas del CONTRACT seccion 5, sobre el corte de referencia."""
    import pandas as pd

    er = facts["en_riesgo"]
    expo = facts.loc[er, "anualizado"].sum()
    base_anual = facts["anualizado"].sum()
    q = facts.groupby("quintil")["en_riesgo"].mean() * 100
    reg = facts.groupby("region")["en_riesgo"].mean() * 100
    reg_reales = reg.drop("Solo online", errors="ignore")

    facts_ant = features.client_facts(tx, pd.Timestamp(CORTE_ANTERIOR))
    expo_ant = facts_ant.loc[facts_ant["en_riesgo"], "anualizado"].sum()

    def chk(nombre, real, esperado):
        return {"nombre": nombre, "real": real, "esperado": esperado, "ok": real == esperado}

    return [
        chk("filas identificadas", counts["monto_pos"], 27276),
        chk("fecha minima", counts["fecha_min"], "2022-01-03"),
        chk("fecha maxima", counts["fecha_max"], "2025-12-29"),
        chk("clientes con compra valida", int(len(facts)), 5978),
        chk("elegibles", int(facts["elegible"].sum()), 4940),
        chk("en riesgo", int(er.sum()), 2452),
        chk("exposicion anual (M)", _millones(expo), 94.9),
        chk("base anualizada (M)", _millones(base_anual), 204.6),
        chk("facturacion en riesgo (M)", _millones(facts.loc[er, "facturacion"].sum()), 262.8),
        chk("facturacion base (M)", _millones(facts["facturacion"].sum()), 550.2),
        chk("exposicion 30/09/2025 (M)", _millones(expo_ant), 80.1),
        chk("en riesgo 30/09/2025", int(facts_ant["en_riesgo"].sum()), 1943),
        chk("riesgo Q5 (%)", round(q.loc[5], 1), 51.8),
        chk("riesgo Q1 (%)", round(q.loc[1], 1), 13.3),
        chk("amplitud regiones (pp)", round(reg_reales.max() - reg_reales.min(), 1), 2.8),
        chk("crudo", counts["crudo"], 50250),
        chk("dedupe", counts["dedupe"], 50000),
        chk("identificado", counts["identificado"], 27606),
        chk("montos negativos crudo", counts["neg_crudo"], 613),
        chk("montos negativos post dedupe", counts["neg_dedupe"], 608),
        chk("ids duplicados crudo", counts["dup_ids_crudo"], 250),
        chk("ids duplicados post dedupe", counts["dup_ids_post"], 0),
    ] + [
        chk(f"ventas {v['anio']} (M)", _millones(v["ventas"]), esperado)
        for v, esperado in zip(_ventas_anuales(DATA_DIR), [123.8, 295.8, 349.7, 225.0])
    ] + _anclas_estacionalidad(tx) + _anclas_campanias()


def _anclas_campanias():
    """El embudo y el consentimiento. La tabla por segmento del wiki esta declarada
    sobre los 23.729 del dataset; el embudo global, sobre los 23.529 limpios. Se
    chequean las dos bases contra su propia fuente."""
    import pandas as pd
    import series

    camp = loader.load_campanias(DATA_DIR)
    clientes = loader.load_clientes(DATA_DIR)
    e = series.embudo_campanias(camp, pd.Timestamp(CORTE_REF))
    c = series.consentimiento(camp, clientes)
    seg = {x["segmento"]: x for x in e["por_segmento_completa"]}

    def chk(nombre, real, esperado):
        return {"nombre": nombre, "real": real, "esperado": esperado, "ok": real == esperado}

    return [
        chk("envios base completa", e["base_completa_envios"], 23729),
        chk("envios base limpia", e["base_limpia_envios"], 23529),
        chk("embudo abre (%)", round(100 * e["global"]["abre"], 1), 35.1),
        chk("embudo clic (%)", round(100 * e["global"]["clic"], 1), 8.8),
        chk("embudo compra 7d (%)", round(100 * e["global"]["compra_7dias"], 1), 1.2),
        chk("marca a superar Inactivos 90d (%)",
            round(100 * seg["Inactivos 90d"]["compra_7dias"], 2), 1.39),
        chk("compra a 7 dias sin clic previo", e["compra_sin_click_previo"], 0),
        chk("envios sin consentimiento", c["envios_a_no_acepta"], 7078),
        chk("envios sin consentimiento (%)", round(100 * c["pct_envios_a_no_acepta"], 1), 30.1),
        chk("alcance de los que no consintieron (%)", round(100 * c["pct_alcance"], 1), 98.3),
        chk("envios huerfanos", c["envios_huerfanos"], 46),
    ] + [
        chk(f"envios segmento {s}", seg[s]["envios"], n)
        for s, n in (("Silver", 6164), ("Gold", 5117), ("Bronze", 4703),
                     ("Inactivos 90d", 4399), ("Todos", 3346))
    ]


def _anclas_estacionalidad(tx):
    """Diciembre y febrero, los dos extremos que declara el wiki. Van sobre la venta
    total (con anonima incluida): es lo que mide 'cuando vende la empresa'."""
    import series

    por_mes = {e["mes"]: e for e in series.estacionalidad(tx, tx_total=_tx_total(DATA_DIR))}
    return [
        {
            "nombre": f"estacionalidad mes {mes} (M)",
            "real": _millones(por_mes[mes]["promedio"]),
            "esperado": esperado,
            "ok": _millones(por_mes[mes]["promedio"]) == esperado,
        }
        for mes, esperado in ((12, 29.0), (2, 16.5))
    ]


if __name__ == "__main__":
    sys.exit(main())

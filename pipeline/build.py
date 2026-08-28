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

# Capacidad de contacto declarada (CONTRACT 4.3, decision compuerta 1).
CAPACIDAD = (500, 800)

# El experimento que la vista 13 propone: la capacidad del corte partida en dos ramas de
# mensaje y un control sin envio, y cuantos cortes se corre. El reparto es 9-9-2 en cada
# ciclo de 20 sobre la lista ya ordenada por exposicion, asi que las tres ramas quedan
# estratificadas por exposicion sin sortear nada (la pantalla arma la asignacion con el
# mismo ciclo). 800 / 20 = 40 ciclos exactos -> 360 / 360 / 80.
RAMAS_EXPERIMENTO = (360, 360, 80)
CORTES_EXPERIMENTO = 3


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
    facturacion_anual_cohorte = []
    resumen_por_corte = []

    for corte in lista_cortes:
        facts = features.client_facts(tx, corte)
        cont = features.contingency(facts, DIMS, corte=corte)
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
            "sensibilidad": features.sensibilidad_umbral(tx, corte),
        })
        # La cohorte fija del corte mirada hacia atras, anio por anio. Va por corte y no
        # por celda a proposito: partir `f` por anio en la contingencia serian ocho columnas
        # mas sobre 17.136 celdas y casi un mega de payload, y el bundle de un solo archivo
        # es una promesa del proyecto. El precio es que la vista D1 no acepta filtros, y lo
        # declara (PANTALLAS.depende = 'corte').
        facturacion_anual_cohorte.append({
            "corte": corte.strftime("%Y-%m-%d"),
            "anios": series.facturacion_anual_cohorte(tx, facts, corte),
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
            "facturacion_anual_cohorte": facturacion_anual_cohorte,
            "consentimiento_anual": series.consentimiento_anual(camp, clientes),
            "criterios_orden": series.criterios_orden(facts_ref, camp, capacidad=CAPACIDAD[1]),
            "potencia_experimento": series.potencia_experimento(
                p0=series.embudo_campanias(camp, pd.Timestamp(CORTE_REF))["global"]["compra_7dias"],
                n_por_rama=RAMAS_EXPERIMENTO[0],
                cortes=CORTES_EXPERIMENTO,
            ),
        },
        "stage_counts": counts,
        "anclas": anclas,
        "meta": {
            "corte_ref": CORTE_REF,
            "capacidad_contacto": list(CAPACIDAD),
            # Reparto propuesto de la capacidad del corte en dos ramas y un control. Vive
            # aca y no en la pantalla porque `potencia_experimento` se calcula con estos
            # mismos numeros: si la pantalla los tuviera aparte, el MDE del payload podria
            # quedar describiendo un experimento distinto del que la vista propone.
            "experimento": {
                "ramas": list(RAMAS_EXPERIMENTO),
                "cortes_previstos": CORTES_EXPERIMENTO,
            },
            "meta_recompra": [10.0, 11.0],
            "base_recompra": [8.0, 9.0],
            "marca_a_superar": 1.39,
            # Umbrales de semaforo de la Parte D §2.1. En los dos de riesgo, menos es mejor.
            "umbral_en_riesgo": [38.0, 42.0],
            "umbral_q5": [45.0, 52.0],
            # No es "ARS nominales": el extracto no tiene deriva de precios (medicion
            # 27/08/2026, CONTRACT.md 1). Decir "nominales" afirma del dato algo que el
            # dato no sostiene.
            "moneda": "ARS del extracto, sin deriva de precios (-7,6 % de 2022 a 2025)",
            "proxy": "sin compra por más de 90 días o más de 1,5 veces el ritmo propio del cliente",
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
    ] + _anclas_estacionalidad(tx) + _anclas_campanias() + _anclas_dimensiones(facts) \
        + _anclas_concentracion(facts) \
      + _anclas_sensibilidad(tx) + _anclas_variantes(facts, tx) \
      + _anclas_series_globales(tx)


def _anclas_series_globales(tx):
    """Las dos series que no dependen del corte: recompra trimestral y base activa anual.

    Ninguna estaba anclada, y la recompra es el KPI de cabecera de la vista 05 y el
    primero de los tres pedidos de la vista 14. La Parte D §6.1 afirma que ninguna cifra
    llega a pantalla sin chequeo; sin estas anclas la afirmacion era falsa justo para el
    numero que el directorio mira primero.
    """
    import pandas as pd

    import series

    rec = series.recompra_trimestral(tx, hasta=pd.Timestamp(CORTE_REF))
    con_tasa = [x for x in rec if x["tasa"] is not None]
    pico = max(con_tasa, key=lambda x: x["tasa"])
    ultimo = con_tasa[-1]

    base = series.base_activa_anual(tx)
    activos = [x["activos"] for x in base]
    var_2025 = round((activos[3] - activos[2]) / activos[2] * 100, 1)

    def chk(nombre, real, esperado):
        return {"nombre": nombre, "real": real, "esperado": esperado, "ok": real == esperado}

    return [
        chk("recompra trimestres calculables", len(con_tasa), 15),
        chk("recompra pico (trimestre)", pico["trimestre"], "2024Q2"),
        chk("recompra pico (%)", round(pico["tasa"] * 100, 1), 19.0),
        chk("recompra ultimo (trimestre)", ultimo["trimestre"], "2025Q3"),
        chk("recompra ultimo (%)", round(ultimo["tasa"] * 100, 1), 8.5),
        chk("recompra ultimo por debajo de la linea base 8-9", round(ultimo["tasa"] * 100, 1) < 9.0, True),
        chk("base activa 2022", activos[0], 2472),
        chk("base activa 2023", activos[1], 4472),
        chk("base activa 2024", activos[2], 4755),
        chk("base activa 2025", activos[3], 3956),
        chk("primeras compras 2023", base[1]["nuevos"], 2647),
        chk("primeras compras 2025", base[3]["nuevos"], 111),
        chk("variacion base activa 2025 (%)", var_2025, -16.8),
    ]


def _anclas_variantes(facts, tx):
    """Las cuatro series que alimentan las vistas 02, 08, 10 y 13 despues del rediseno.
    Ninguna de las cuatro estaba anclada porque ninguna existia, y las cuatro afirman algo
    en un titulo de pantalla: si el numero se mueve, el titulo miente y el pipeline tiene
    que frenar antes de escribir el payload.

    Las tres afirmaciones ancladas como booleano son las que se leen en el dibujo:
    la cohorte se derrumba en 2025, el incumplimiento NO baja anio a anio, y ningun
    criterio alternativo se distingue del actual por su tasa de compra."""
    import pandas as pd
    import series

    camp = loader.load_campanias(DATA_DIR)
    clientes = loader.load_clientes(DATA_DIR)

    coh = series.facturacion_anual_cohorte(tx, facts, pd.Timestamp(CORTE_REF))
    con = series.consentimiento_anual(camp, clientes)
    cri = series.criterios_orden(facts, camp, capacidad=CAPACIDAD[1])
    pot = series.potencia_experimento(
        p0=series.embudo_campanias(camp, pd.Timestamp(CORTE_REF))["global"]["compra_7dias"],
        n_por_rama=RAMAS_EXPERIMENTO[0], cortes=CORTES_EXPERIMENTO)

    por_anio = {c["anio"]: c for c in coh}
    con_anio = {c["anio"]: c for c in con}
    por_crit = {c["criterio"]: c for c in cri["criterios"]}
    actual = por_crit["Exposición · actual"]

    def chk(nombre, real, esperado):
        return {"nombre": nombre, "real": real, "esperado": esperado, "ok": real == esperado}

    return [
        chk(f"cohorte en riesgo {a} (%)", round(100 * por_anio[a]["pct_en_riesgo"], 1), e)
        for a, e in ((2022, 47.3), (2023, 52.1), (2024, 54.8), (2025, 31.2))
    ] + [
        # El titulo de la vista 02: la cohorte pesaba mas de la mitad y este anio pesa un
        # tercio. Si el maximo dejara de estar en 2024 o 2025 dejara de ser el minimo, la
        # frase "dejaron de comprar este anio" ya no sale del dibujo.
        chk("la cohorte pesa menos en 2025 que en cualquier anio previo",
            por_anio[2025]["pct_en_riesgo"] < min(por_anio[a]["pct_en_riesgo"] for a in (2022, 2023, 2024)),
            True),
        chk("facturacion identificada de la cohorte 2024 (M)", _millones(por_anio[2024]["en_riesgo"]), 106.0),
    ] + [
        chk(f"envios sin consentimiento {a} (%)", round(100 * con_anio[a]["pct_sin_consentimiento"], 1), e)
        for a, e in ((2022, 29.5), (2023, 31.2), (2024, 30.3), (2025, 29.6))
    ] + [
        # La vista 10 tenia que titular "la correccion ya esta en marcha". No hay correccion:
        # los cuatro anios caen en menos de dos puntos de amplitud. El ancla fija el hallazgo.
        chk("amplitud del incumplimiento entre anios (pp)",
            round(100 * (max(c["pct_sin_consentimiento"] for c in con)
                         - min(c["pct_sin_consentimiento"] for c in con)), 1), 1.7),
        chk("envios por anio suman la base limpia",
            sum(c["envios"] for c in con), 23529),
    ] + [
        chk(f"exposicion criterio {c} (M)", _millones(por_crit[c]["exposicion"]), e)
        for c, e in (("Exposición · actual", 49.5), ("Q5 con recency > 180 d", 32.1),
                     ("Segmento Hibernando", 12.3), ("Azar", 31.0))
    ] + [
        chk(f"clientes disponibles criterio {c}", por_crit[c]["clientes_disponibles"], e)
        for c, e in (("Exposición · actual", 2452), ("Q5 con recency > 180 d", 525),
                     ("Segmento Hibernando", 490), ("Azar", 2452))
    ] + [
        chk(f"compra 7d criterio {c} (%)", round(100 * por_crit[c]["compra_7dias"], 2), e)
        for c, e in (("Exposición · actual", 1.42), ("Q5 con recency > 180 d", 1.72),
                     ("Segmento Hibernando", 0.84), ("Azar", 1.18))
    ] + [
        # El titulo de la vista 08: en tasa de compra no se distingue ninguno del actual,
        # en pesos la diferencia es de decenas de millones. Las dos mitades, ancladas.
        chk("ningun criterio alternativo se distingue del actual por tasa",
            all(c["solapa_con_actual"] for c in cri["criterios"]), True),
        chk("el criterio actual es el de mayor exposicion",
            all(c["exposicion"] <= actual["exposicion"] for c in cri["criterios"]), True),
        chk("costo en exposicion del peor criterio (M)",
            _millones(min(c["costo_exposicion"] for c in cri["criterios"])), -37.2),
    ] + [
        # La vista 13 propone un experimento y declara lo que ese experimento NO puede
        # detectar. El MDE es el numero que sostiene esa salvedad.
        chk("MDE del experimento propuesto (pp)", round(pot["mde_pp"], 2), 1.71),
        chk("el MDE supera la tasa base", pot["mde"] > pot["p0"], True),
    ]


def _anclas_dimensiones(facts):
    """Las dos dimensiones que el arnes de contingencia no ancla contra el wiki: la tabla
    RFM y el corte por region y categoria. Sin esto, un cambio en la regla de segmentacion
    o en la asignacion de region pasaria los 201.819 chequeos sin que nadie se entere: el
    arnes prueba que el payload coincide con client_facts, no que client_facts sea correcto.
    Los valores son los recomputados, no los del wiki: cuatro filas del wiki difieren por un
    empate de borde de un solo cliente (ver docs/verificacion.md)."""
    def chk(nombre, real, esperado):
        return {"nombre": nombre, "real": real, "esperado": esperado, "ok": real == esperado}

    rfm = facts.groupby("rfm").agg(n=("en_riesgo", "size"), ri=("en_riesgo", "sum"),
                                   f=("facturacion", "sum"))
    esperado_rfm = {
        "Campeones": (1014, 257, 160.0), "En riesgo": (1018, 974, 109.9),
        "Leales": (820, 478, 90.6), "Perdidos": (1128, 230, 86.7),
        "Hibernando": (1373, 490, 66.9), "Potenciales": (591, 23, 35.5),
        "Nuevos": (34, 0, 0.5),
    }
    out = []
    for seg, (n, ri, fm) in esperado_rfm.items():
        out.append(chk(f"rfm {seg} clientes", int(rfm.loc[seg, "n"]), n))
        out.append(chk(f"rfm {seg} en riesgo", int(rfm.loc[seg, "ri"]), ri))
        out.append(chk(f"rfm {seg} facturacion (M)", _millones(rfm.loc[seg, "f"]), fm))

    reg = facts.groupby("region")["en_riesgo"].agg(["size", "mean"])
    out.append(chk("region AMBA (%)", round(100 * reg.loc["AMBA", "mean"], 1), 43.2))
    out.append(chk("region Patagonia (%)", round(100 * reg.loc["Patagonia", "mean"], 1), 40.4))
    out.append(chk("Solo online clientes", int(reg.loc["Solo online", "size"]), 317))
    out.append(chk("Solo online riesgo (%)", round(100 * reg.loc["Solo online", "mean"], 1), 12.9))

    cat = facts.groupby("categoria")["en_riesgo"].mean() * 100
    out.append(chk("amplitud categoria (pp)", round(cat.max() - cat.min(), 1), 15.5))
    out.append(chk("categoria Muebles (%)", round(cat.loc["Muebles"], 1), 44.4))
    out.append(chk("categoria Bano (%)", round(cat.loc["Baño"], 1), 28.9))
    return out


def _anclas_sensibilidad(tx):
    """El rango del umbral del proxy que muestra D0. Antes eran tres literales en el JSX
    sin ninguna linea de codigo que los generara, que es exactamente lo que la capa (d) del
    protocolo prohibe."""
    import pandas as pd

    s = features.sensibilidad_umbral(tx, pd.Timestamp(CORTE_REF))
    esperado = {60: 95.1, 90: 94.9, 120: 93.5}
    return [
        {"nombre": f"sensibilidad umbral {x['umbral']}d (M)", "real": _millones(x["exposicion"]),
         "esperado": esperado[x["umbral"]], "ok": _millones(x["exposicion"]) == esperado[x["umbral"]]}
        for x in s
    ]


def _anclas_concentracion(facts):
    """La curva de concentracion de la vista 09: que parte de la EXPOSICION cubre el
    operativo si contacta a los primeros k de la lista, contra lo que cubriria contactando
    a k al azar.

    Es el argumento de esa pantalla ("el orden importa mas que el alcance") y hasta ahora
    no estaba en ningun lado: la pantalla solo mostraba cobertura de cabezas. Se calcula
    aca, desde client_facts, que es el camino independiente del payload.
    """
    riesgo = facts[facts["en_riesgo"]].sort_values("anualizado", ascending=False)
    total = float(riesgo["anualizado"].sum())
    n = int(len(riesgo))
    acum = riesgo["anualizado"].cumsum()

    def chk(nombre, real, esperado):
        return {"nombre": nombre, "real": real, "esperado": esperado, "ok": real == esperado}

    def parte(k):
        return round(100 * float(acum.iloc[min(k, n) - 1]) / total, 1)

    return [
        chk("clientes en riesgo (corte ref)", n, 2452),
        chk("concentracion top 500 (%)", parte(500), 37.0),
        chk("concentracion top 800 (%)", parte(800), 52.1),
        # El contrafactual: contactar k al azar cubre k/n de la exposicion en esperanza.
        chk("al azar top 500 (%)", round(100 * 500 / n, 1), 20.4),
        chk("al azar top 800 (%)", round(100 * 800 / n, 1), 32.6),
        # Lo que la pantalla afirma: ordenar rinde casi el doble a 500 contactos.
        chk("ventaja del orden a 500 (x)", round(parte(500) / (100 * 500 / n), 2), 1.81),
    ]


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
    ] + [
        chk(f"compras 7d segmento {s}", seg[s]["compras"], n)
        for s, n in (("Silver", 82), ("Gold", 53), ("Bronze", 45),
                     ("Inactivos 90d", 61), ("Todos", 45))
    ] + [
        # Los bordes del IC de Wilson, contra el calculo hecho aparte (ver el comentario
        # de series._wilson). Sin esto el intervalo seria una cifra sin chequeo, que es
        # justo lo que el proyecto no admite.
        chk(f"IC95 compra 7d {s} (pp)",
            [round(100 * x, 2) for x in seg[s]["compra_7dias_ic"]], borde)
        for s, borde in (("Bronze", [0.72, 1.28]), ("Gold", [0.79, 1.35]),
                         ("Inactivos 90d", [1.08, 1.78]), ("Silver", [1.07, 1.65]),
                         ("Todos", [1.01, 1.79]))
    ] + [
        # El hallazgo que la pantalla M2b afirma, anclado como booleano: el mejor segmento
        # y el peor tienen intervalos que se tocan, asi que la diferencia observada no
        # separa a uno de otro. Si algun dia dejaran de solaparse, el ancla se cae y el
        # titulo de esa pantalla deja de ser cierto.
        chk("IC de Inactivos 90d y Bronze se solapan",
            seg["Inactivos 90d"]["compra_7dias_ic"][0] <= seg["Bronze"]["compra_7dias_ic"][1],
            True),
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

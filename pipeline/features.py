"""Metricas por cliente, tabla de contingencia y listas de marketing.

Todo se recalcula desde cero por corte usando solo tx con fecha <= corte (CONTRACT.md #3).
Recibe siempre el tx ya limpio de loader.load_transacciones.
"""

import numpy as np
import pandas as pd

# dims fijas del contrato (orden = indice usado para empaquetar k, qs, gk)
REGIONES = ["AMBA", "Centro", "Cuyo", "NOA", "Patagonia", "Solo online"]
CATEGORIAS = ["Baño", "Cocina y mesa", "Decoracion", "Iluminacion", "Muebles",
              "Organizacion", "Textil hogar"]
RFM_SEGMENTOS = ["Campeones", "En riesgo", "Leales", "Hibernando", "Nuevos",
                  "Potenciales", "Perdidos"]


def _gap_mediano_por_cliente(d: pd.DataFrame) -> pd.Series:
    """Mediana de dias entre compras consecutivas, por cliente. Vectorizado:
    ordena por cliente+fecha una vez y agrupa el diff en dias."""
    orden = d.sort_values(["id_cliente", "fecha"])
    dias = orden.groupby("id_cliente")["fecha"].diff().dt.days
    return dias.groupby(orden["id_cliente"]).median()


def _region_dominante(d: pd.DataFrame) -> pd.Series:
    """Region donde cada cliente concentra mas monto_neto, entre sus tx en tienda
    fisica (region_tx != '__online__'). Sin ninguna -> 'Solo online'."""
    fisico = d[d["region_tx"] != "__online__"]
    por_region = fisico.groupby(["id_cliente", "region_tx"])["monto_neto"].sum()
    dominante = por_region.groupby("id_cliente").idxmax().map(lambda t: t[1])
    return dominante


def _categoria_dominante(d: pd.DataFrame) -> pd.Series:
    """Categoria donde cada cliente concentra mas monto_neto."""
    por_cat = d.groupby(["id_cliente", "categoria"])["monto_neto"].sum()
    return por_cat.groupby("id_cliente").idxmax().map(lambda t: t[1])


def _qcut_rank_5(serie: pd.Series, ascending: bool) -> pd.Series:
    """qcut sobre el rank(method='first') de la serie, 5 bins, labels 1..5.
    Rompe empates por orden de aparicion (rank method='first'), como pide el contrato."""
    rank = serie.rank(method="first", ascending=ascending)
    return pd.qcut(rank, 5, labels=[1, 2, 3, 4, 5]).astype(int)


def _segmento_rfm(R: pd.Series, F: pd.Series, M: pd.Series, n_compras: pd.Series) -> pd.Series:
    """Primera regla que aplica gana, en el orden exacto de CONTRACT.md #3."""
    seg = pd.Series("Perdidos", index=R.index, dtype=object)
    aun_sin_asignar = pd.Series(True, index=R.index)

    reglas = [
        ("Campeones", (R >= 4) & (F >= 4) & (M >= 4)),
        ("En riesgo", (R <= 2) & (F >= 3)),
        ("Leales", (R >= 3) & (F >= 4)),
        ("Hibernando", (R <= 2) & (F <= 2)),
        ("Nuevos", (R >= 4) & (n_compras == 1)),
        ("Potenciales", (R >= 4) & (F <= 2)),
    ]
    for nombre, cond in reglas:
        gana = aun_sin_asignar & cond
        seg[gana] = nombre
        aun_sin_asignar &= ~cond
    return seg


def client_facts(tx: pd.DataFrame, corte: pd.Timestamp) -> pd.DataFrame:
    d = tx[tx["fecha"] <= corte]

    agg = d.groupby("id_cliente").agg(
        facturacion=("monto_neto", "sum"),
        n_compras=("monto_neto", "size"),
        primera=("fecha", "min"),
        ultima=("fecha", "max"),
    )

    agg["recency"] = (corte - agg["ultima"]).dt.days
    agg["gap_mediano"] = _gap_mediano_por_cliente(d)

    agg["elegible"] = agg["n_compras"] >= 3
    agg["en_riesgo"] = agg["elegible"] & (
        agg["recency"] > np.maximum(90, 1.5 * agg["gap_mediano"])
    )

    anios = (corte - agg["primera"]).dt.days / 365.25
    agg["anualizado"] = np.where(anios == 0, agg["facturacion"], agg["facturacion"] / anios)

    agg["quintil"] = pd.qcut(agg["facturacion"], 5, labels=[1, 2, 3, 4, 5]).astype(int)

    agg["region"] = _region_dominante(d).reindex(agg.index).fillna("Solo online")
    agg["categoria"] = _categoria_dominante(d).reindex(agg.index)

    agg["R"] = _qcut_rank_5(agg["recency"], ascending=False)
    agg["F"] = _qcut_rank_5(agg["n_compras"], ascending=True)
    agg["M"] = _qcut_rank_5(agg["facturacion"], ascending=True)

    agg["rfm"] = _segmento_rfm(agg["R"], agg["F"], agg["M"], agg["n_compras"])

    return agg


def sensibilidad_umbral(tx: pd.DataFrame, corte: pd.Timestamp, umbrales=(60, 90, 120)) -> list:
    """Exposicion recalculada con otros umbrales del proxy. El BAN muestra un valor puntual
    y la guia (Cairo) pide declarar la incertidumbre: esto la mide en vez de suponerla.
    Va sobre la base completa del corte, sin filtros: es una propiedad del proxy, no del corte
    de la base."""
    d = tx[tx["fecha"] <= corte]
    agg = d.groupby("id_cliente").agg(
        facturacion=("monto_neto", "sum"), n_compras=("monto_neto", "size"),
        primera=("fecha", "min"), ultima=("fecha", "max"))
    recency = (corte - agg["ultima"]).dt.days
    gap = _gap_mediano_por_cliente(d)
    anios = (corte - agg["primera"]).dt.days / 365.25
    anualizado = np.where(anios == 0, agg["facturacion"], agg["facturacion"] / anios)
    elegible = agg["n_compras"] >= 3

    salida = []
    for u in umbrales:
        en_riesgo = elegible & (recency > np.maximum(u, 1.5 * gap))
        salida.append({
            "umbral": int(u),
            "en_riesgo": int(en_riesgo.sum()),
            "exposicion": int(round(float(np.asarray(anualizado)[en_riesgo.to_numpy()].sum()))),
        })
    return salida


def contingency(facts: pd.DataFrame, dims: dict, corte=None) -> pd.DataFrame:
    reg_idx = facts["region"].map({r: i for i, r in enumerate(dims["region"])})
    cat_idx = facts["categoria"].map({c: i for i, c in enumerate(dims["categoria"])})
    rfm_idx = facts["rfm"].map({s: i for i, s in enumerate(dims["rfm"])})
    q = facts["quintil"].astype(int)

    k = ((reg_idx * 7 + cat_idx) * 7 + rfm_idx) * 5 + (q - 1)

    # Historia corta por celda, no global: la nota del BAN se filtra igual que el BAN.
    if corte is not None:
        anios = (pd.Timestamp(corte) - facts["primera"]).dt.days / 365.25
        corta = (anios < 1.0).to_numpy()
    else:
        corta = np.zeros(len(facts), dtype=bool)

    tabla = pd.DataFrame({
        "k": k,
        "n": 1,
        "nr": facts["en_riesgo"].astype(int),
        "ne": facts["elegible"].astype(int),
        "f": facts["facturacion"],
        "fr": np.where(facts["en_riesgo"], facts["facturacion"], 0.0),
        "a": facts["anualizado"],
        "ar": np.where(facts["en_riesgo"], facts["anualizado"], 0.0),
        "nhc": corta.astype(int),
        "ahc": np.where(corta, facts["anualizado"], 0.0),
    })

    out = tabla.groupby("k", as_index=False).sum()
    for col in ["k", "n", "nr", "ne", "f", "fr", "a", "ar", "nhc", "ahc"]:
        out[col] = out[col].round().astype(int)
    return out.sort_values("k").reset_index(drop=True)


def top_lista(facts: pd.DataFrame, clientes: pd.DataFrame, dims: dict, n: int = 800) -> pd.DataFrame:
    en_riesgo = facts[facts["en_riesgo"]].sort_values("anualizado", ascending=False).head(n)

    reg_idx = en_riesgo["region"].map({r: i for i, r in enumerate(dims["region"])})
    cat_idx = en_riesgo["categoria"].map({c: i for i, c in enumerate(dims["categoria"])})
    rfm_idx = en_riesgo["rfm"].map({s: i for i, s in enumerate(dims["rfm"])})
    q = en_riesgo["quintil"].astype(int)

    acepta = clientes["acepta_marketing"].reindex(en_riesgo.index).fillna(False)

    lista = pd.DataFrame({
        "id": en_riesgo.index,
        "a": en_riesgo["anualizado"].round().astype(int),
        "rec": en_riesgo["recency"].astype(int),
        "gap": en_riesgo["gap_mediano"].round().astype(int),
        "qs": ((q - 1) * 8 + rfm_idx).astype(int).values,
        "gk": (reg_idx * 8 + cat_idx).astype(int).values,
        "mk": acepta.astype(int).values,
    })
    return lista.reset_index(drop=True)

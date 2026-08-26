"""Empaquetado final del payload (pipeline -> SPA).

Unico dueno: este archivo. No depende de la API interna de loader/features/series
mas alla de lo que declara el ENV; solo consume los bloques ya calculados y los
serializa segun CONTRACT.md seccion 4.

Decisiones de forma tomadas aca (no cambian el contrato, solo el layout JSON,
que el contrato no fija):

- `contingencias` y `listas` viajan como LISTA posicional alineada con `cortes`,
  no como dict con la fecha repetida 25 veces de clave: el contrato ya pide
  "sin strings repetidos" y las fechas se emiten una sola vez en `cortes`.
- `series.exposicion_por_corte` (CONTRACT 4.4) se deriva sumando `ar` de cada
  contingencia por corte. Es una reduccion sin perdida sobre las mismas celdas
  que ya viajan en el payload (4.2: "toda combinacion de filtros es una suma de
  celdas"), asi que no hace falta una funcion nueva en series.py.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd

# columnas de cada bloque, en el orden que fija CONTRACT.md (4.2 y 4.3)
_COLS_CONTINGENCIA = ("k", "n", "nr", "ne", "f", "fr", "a", "ar", "nhc", "ahc")
_COLS_LISTA = ("id", "a", "rec", "gap", "qs", "gk", "mk")


def _int(x):
    """Castea a int nativo de Python. Rechaza floats con parte fraccionaria:
    si algo que deberia ser entero llega con decimales, es un bug upstream,
    no algo para redondear en silencio aca (regla dura: cero redondeo intermedio)."""
    if isinstance(x, (int, np.integer)):
        return int(x)
    if isinstance(x, (float, np.floating)):
        xf = float(x)
        if xf.is_integer():
            return int(xf)
        raise ValueError(f"valor no entero donde se esperaba entero: {x!r}")
    raise TypeError(f"tipo no soportado para entero: {type(x)!r}")


def _fecha_str(x) -> str:
    if isinstance(x, str):
        return x
    return pd.Timestamp(x).strftime("%Y-%m-%d")


def _jsonify(obj):
    """Conversion generica y recursiva a tipos nativos serializables. Se usa
    en los bloques de forma libre (dims, series, meta, anclas, stage_counts):
    ahi no hay un esquema de columnas fijo para castear campo por campo."""
    if obj is None:
        return obj
    if isinstance(obj, bool):
        return obj
    if isinstance(obj, np.bool_):
        return bool(obj)
    if isinstance(obj, (int, np.integer)):
        return int(obj)
    if isinstance(obj, (float, np.floating)):
        return float(obj)
    if isinstance(obj, str):
        return obj
    if isinstance(obj, (pd.Timestamp, np.datetime64)):
        return _fecha_str(obj)
    if isinstance(obj, dict):
        return {str(k): _jsonify(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_jsonify(v) for v in obj]
    if isinstance(obj, np.ndarray):
        return [_jsonify(v) for v in obj.tolist()]
    if isinstance(obj, pd.Series):
        return [_jsonify(v) for v in obj.tolist()]
    if isinstance(obj, pd.DataFrame):
        return {c: [_jsonify(v) for v in obj[c].tolist()] for c in obj.columns}
    return obj


def _align_por_corte(cortes_str: list[str], coleccion, nombre: str) -> list:
    """Acepta `coleccion` como lista posicional (mismo orden que `cortes`) o
    como dict keyed por fecha (str o Timestamp). Devuelve siempre una lista
    alineada 1 a 1 con `cortes_str`."""
    if isinstance(coleccion, dict):
        normalizado = {_fecha_str(k): v for k, v in coleccion.items()}
        faltantes = [c for c in cortes_str if c not in normalizado]
        if faltantes:
            raise KeyError(f"{nombre}: faltan los cortes {faltantes}")
        return [normalizado[c] for c in cortes_str]
    coleccion = list(coleccion)
    if len(coleccion) != len(cortes_str):
        raise ValueError(
            f"{nombre}: se esperaban {len(cortes_str)} cortes, llegaron {len(coleccion)}"
        )
    return coleccion


def _columnar(df: pd.DataFrame, cols: tuple[str, ...], nombre: str) -> dict:
    faltantes = [c for c in cols if c not in df.columns]
    if faltantes:
        raise KeyError(f"{nombre}: faltan columnas {faltantes}")
    out = {c: [_int(v) for v in df[c].tolist()] for c in cols}
    if len(set(out["k" if "k" in cols else cols[0]])) != len(df):
        raise ValueError(f"{nombre}: claves duplicadas dentro del mismo corte")
    return out


def pack_payload(bloques: dict) -> dict:
    """Arma el payload final listo para `emit`.

    `bloques` trae: dims, cortes, contingencias (25), listas (25), series,
    stage_counts, anclas, meta. `contingencias` y `listas` pueden llegar como
    lista alineada con `cortes` o como dict keyed por fecha; ver `_align_por_corte`.
    """
    cortes_str = [_fecha_str(c) for c in bloques["cortes"]]

    contingencias_in = _align_por_corte(cortes_str, bloques["contingencias"], "contingencias")
    listas_in = _align_por_corte(cortes_str, bloques["listas"], "listas")

    contingencias = [
        _columnar(df, _COLS_CONTINGENCIA, f"contingencias[{cortes_str[i]}]")
        for i, df in enumerate(contingencias_in)
    ]
    listas = [
        _columnar(df, _COLS_LISTA, f"listas[{cortes_str[i]}]")
        for i, df in enumerate(listas_in)
    ]

    # exposicion_por_corte (CONTRACT 4.4): suma de 'ar' por corte, derivada de
    # las mismas celdas de la contingencia. Ver docstring del modulo.
    series_out = _jsonify(dict(bloques.get("series") or {}))
    # N0, integracion: build.py ya arma exposicion_por_corte con corte, base anualizada,
    # clientes, elegibles y en_riesgo — lo que necesitan el BAN y la serie de "como vengo".
    # Aca solo se completa si no vino, derivandola de las mismas celdas que ya viajan.
    if "exposicion_por_corte" not in series_out:
        series_out["exposicion_por_corte"] = [sum(c["ar"]) for c in contingencias]
    else:
        # chequeo de consistencia: la exposicion declarada tiene que ser la suma de 'ar'
        for i, fila in enumerate(series_out["exposicion_por_corte"]):
            derivada = sum(contingencias[i]["ar"])
            if abs(fila["exposicion"] - derivada) > len(contingencias[i]["ar"]):
                raise ValueError(
                    f"exposicion_por_corte[{i}] dice {fila['exposicion']} pero las celdas "
                    f"suman {derivada}"
                )

    return {
        "dims": _jsonify(bloques["dims"]),
        "clientes_ids": _jsonify(bloques.get("clientes_ids", [])),
        "cortes": cortes_str,
        "contingencias": contingencias,
        "listas": listas,
        "series": series_out,
        "stage_counts": _jsonify(bloques["stage_counts"]),
        "anclas": _jsonify(bloques["anclas"]),
        "meta": _jsonify(bloques.get("meta", {})),
    }


def emit(payload: dict, out_json: str, out_js: str) -> dict:
    """Escribe el JSON crudo y el modulo JS que lo bundlea. Sin base64, sin
    compresion: JSON plano minificado. Imprime UNA linea con los dos tamanos
    en KB (criterio de aceptacion del proyecto)."""
    raw = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    js = f"export const D = {raw};\n"

    out_json_path = Path(out_json)
    out_js_path = Path(out_js)
    out_json_path.parent.mkdir(parents=True, exist_ok=True)
    out_js_path.parent.mkdir(parents=True, exist_ok=True)
    out_json_path.write_text(raw, encoding="utf-8")
    out_js_path.write_text(js, encoding="utf-8")

    bytes_json = len(raw.encode("utf-8"))
    bytes_js = len(js.encode("utf-8"))
    print(f"payload: {bytes_json / 1024:.1f} KB (json) / {bytes_js / 1024:.1f} KB (js)")
    return {"bytes_json": bytes_json, "bytes_js": bytes_js}


if __name__ == "__main__":
    # No se puede correr el pipeline completo todavia (loader/features/series
    # se escriben en paralelo). Arma un payload SINTETICO con la misma forma
    # y magnitudes declaradas en el ENV, para decidir la arquitectura por
    # tamano. Semilla fija: el numero tiene que ser reproducible.
    import argparse

    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out-json", default=str(Path(__file__).parent / "dist" / "payload.sintetico.json"))
    ap.add_argument("--out-js", default=str(Path(__file__).parent / "dist" / "payload.sintetico.js"))
    args = ap.parse_args()

    rng = np.random.default_rng(42)

    N_CORTES = 25
    N_CELDAS_POR_CORTE = 700  # ENV: "~700 celdas" (696 ocupadas reales al ultimo corte)
    N_FILAS_LISTA = 800  # CONTRACT 4.3: tope de capacidad declarada
    N_COMBOS_POSIBLES = 6 * 7 * 7 * 5  # region x categoria x rfm x quintil = 1470
    N_CLIENTES = 6050  # tamano real de Clientes.csv

    cortes = pd.date_range("2023-12-31", periods=N_CORTES, freq="ME")

    dims = {
        "region": ["CABA", "GBA", "Centro", "NOA", "NEA", "Solo online"],
        "categoria": ["Indumentaria", "Calzado", "Accesorios", "Hogar", "Deportes", "Belleza", "Electro"],
        "rfm": ["Campeones", "En riesgo", "Leales", "Hibernando", "Nuevos", "Potenciales", "Perdidos"],
        "quintil": [1, 2, 3, 4, 5],
    }

    contingencias = []
    listas = []
    for _ in range(N_CORTES):
        ks = rng.choice(N_COMBOS_POSIBLES, size=N_CELDAS_POR_CORTE, replace=False)
        n = rng.integers(1, 60, size=N_CELDAS_POR_CORTE)
        nr = rng.integers(0, n + 1)
        ne = np.maximum(nr, rng.integers(0, n + 1))
        f = rng.integers(1_000, 3_000_000, size=N_CELDAS_POR_CORTE)
        fr = (f * (nr / np.maximum(n, 1))).astype(np.int64)
        a = rng.integers(1_000, 1_500_000, size=N_CELDAS_POR_CORTE)
        ar = (a * (nr / np.maximum(n, 1))).astype(np.int64)
        contingencias.append(pd.DataFrame({
            "k": ks, "n": n, "nr": nr, "ne": ne, "f": f, "fr": fr, "a": a, "ar": ar,
        }))

        ids = rng.choice(N_CLIENTES, size=N_FILAS_LISTA, replace=False)
        listas.append(pd.DataFrame({
            "id": ids,
            "a": rng.integers(1_000, 2_000_000, size=N_FILAS_LISTA),
            "rec": rng.integers(0, 900, size=N_FILAS_LISTA),
            "gap": rng.integers(0, 400, size=N_FILAS_LISTA),
            "qs": rng.integers(0, 256, size=N_FILAS_LISTA),
            "gk": rng.integers(0, 256, size=N_FILAS_LISTA),
            "mk": rng.integers(0, 2, size=N_FILAS_LISTA),
        }))

    series = {
        "recompra_trimestral": [
            {"trimestre": t, "tasa": round(float(rng.uniform(0.08, 0.11)), 4)}
            for t in [f"{y}Q{q}" for y in (2022, 2023, 2024, 2025) for q in (1, 2, 3, 4)][:15]
        ],
        "base_activa_anual": [
            {"anio": y, "activos": int(rng.integers(2000, 6000)), "primeras_compras": int(rng.integers(300, 2000))}
            for y in (2022, 2023, 2024, 2025)
        ],
        "embudo_campanias": {
            "segmentos": dims["rfm"],
            "envios": [int(rng.integers(1000, 4000)) for _ in dims["rfm"]],
            "abre": [int(rng.integers(200, 1500)) for _ in dims["rfm"]],
            "click": [int(rng.integers(50, 600)) for _ in dims["rfm"]],
            "compra_7dias": [int(rng.integers(5, 200)) for _ in dims["rfm"]],
            "base_dataset": 23729,
            "base_limpia": 23529,
        },
        "consentimiento": {"envios_sin_consentimiento": int(rng.integers(0, 500))},
    }

    stage_counts = {
        "crudo": 50250, "dedupe": 50000, "identificado": 27606, "monto_pos": 27276,
        "neg_crudo": 613, "neg_dedupe": 608, "dup_ids_crudo": 250, "dup_ids_post": 0,
        "fecha_min": "2022-01-03", "fecha_max": "2025-12-29",
    }

    anclas = {
        "filas_identificadas": 27276, "clientes_con_compra_valida": 5978, "elegibles": 4940,
        "en_riesgo": 2452, "exposicion_anual_ars": 94_900_000, "base_anualizada_ars": 204_600_000,
        "facturacion_historica_en_riesgo_ars": 262_800_000, "facturacion_base_ars": 550_200_000,
    }

    meta = {"corte_default": "2025-12-31", "moneda": "ARS nominal", "n_cortes": N_CORTES}

    bloques = {
        "dims": dims,
        "cortes": list(cortes),
        "contingencias": contingencias,
        "listas": listas,
        "series": series,
        "stage_counts": stage_counts,
        "anclas": anclas,
        "meta": meta,
    }

    payload = pack_payload(bloques)
    emit(payload, args.out_json, args.out_js)

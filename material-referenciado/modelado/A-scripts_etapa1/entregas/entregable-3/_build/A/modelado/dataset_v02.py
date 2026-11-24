"""
Dataset churn_cliente_corte_v0.2: el v0.1 del Entregable 2 con tres cambios de la etapa 1. Mismas
filas, mismos cortes, misma partición.

  1. Target evaluado cada día de (T, T+90], como lo escribe el anexo de fórmulas (ecuación del
     target). El v0.1 lo evaluaba en T+30, T+60 y T+90 y dejaba en 0 a quien cruzaba su umbral y
     volvía a comprar entre dos evaluaciones; el E2 dejó este cambio anotado para la v0.2.
  2. Fuera: nivel, puntos_canjeados y meses_sin_movimiento (decisión "excluir" del control de
     fugas, comun.DECISIONES). Fidelizacion.csv es una foto del extracto: el valor en T no se puede
     reconstruir.
  3. Recalculadas: aperturas_90d, clics_90d y compro_7d_alguna (decisión "recalcular"), contando
     solo envíos con fecha ≤ T − 7: la respuesta a un envío de los 7 días previos al corte puede
     ocurrir después de T.

El target no necesita la regla completa: un cliente elegible y sin riesgo en T, con ρ días sin
comprar y umbral θ, cruza el día T+s con s = ⌊θ − ρ⌋ + 1 si no compra antes, y una compra dentro
de la ventana lo deja por debajo del umbral hasta el final (θ ≥ 90). Antes de cambiar nada, el
script reproduce con esa lógica el target del v0.1 (las tres evaluaciones) y las tres variables de
campaña con el corte en T, fila por fila, y corta si una sola no coincide.

Uso:    python3 entregas/entregable-3/_build/A/modelado/dataset_v02.py
Salida: dataset/churn_cliente_corte_v0.2.csv.gz y dataset/resumen_v0.2.json
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
import comun  # noqa: E402
from comun import HORIZONTE_DIAS, TARGET  # noqa: E402

APP = comun.RAIZ / "app"
sys.path.insert(0, str(APP / "pipeline"))
import tablon  # noqa: E402

NOMBRE = "churn_cliente_corte_v0.2"
EXCLUIDAS = comun.features_por_decision("excluir")
RECALCULADAS = comun.features_por_decision("recalcular")
ESPERA_RESPUESTA = pd.Timedelta(days=7)
D90 = pd.Timedelta(days=90)


def dias_a_proxima_compra(df: pd.DataFrame, tx: pd.DataFrame) -> pd.Series:
    """Días entre T y la primera compra posterior a T de cada fila; NaN si no vuelve a comprar
    dentro del extracto (última venta: 29/12/2025)."""
    fechas = tx.groupby("id_cliente")["fecha"].apply(lambda s: np.sort(s.unique()))
    out = np.full(len(df), np.nan)
    for i, (cliente, t) in enumerate(zip(df["id_cliente_canonico"], df["corte"])):
        f = fechas.get(cliente)
        j = np.searchsorted(f, np.datetime64(t), side="right")
        if j < len(f):
            out[i] = (f[j] - np.datetime64(t)) / np.timedelta64(1, "D")
    return pd.Series(out, index=df.index)


def target(dias_para_cruzar: pd.Series, proxima: pd.Series, puntos=None) -> pd.Series:
    """1 si el cliente cruza su umbral en (T, T+90]. Con `puntos` (30, 60, 90) reproduce la
    evaluación del v0.1; sin `puntos`, la evaluación diaria del anexo."""
    s = np.floor(dias_para_cruzar) + 1                       # primer día con ρ > θ si no compra
    if puntos is not None:                                   # primer punto de evaluación ≥ s
        s = pd.Series(np.select([s <= p for p in puntos], puntos, default=np.inf), index=s.index)
    no_compro = proxima.isna() | (proxima > s)
    return ((s <= HORIZONTE_DIAS) & no_compro).astype(int)


def respuesta(campanias: pd.DataFrame, t: pd.Timestamp, ids: pd.Index, hasta: pd.Timestamp) -> pd.DataFrame:
    """Las tres variables de respuesta a campañas en el corte T, contando solo envíos con fecha
    ≤ `hasta` (T en el v0.1, T − 7 en el v0.2)."""
    ventana = campanias[(campanias["fecha_envio"] > t - D90) & (campanias["fecha_envio"] <= hasta)]
    historia = campanias[campanias["fecha_envio"] <= hasta]
    return pd.DataFrame({
        "aperturas_90d": ventana.groupby("id_cliente")["abierto"].sum().reindex(ids).fillna(0).astype(int),
        "clics_90d": ventana.groupby("id_cliente")["click"].sum().reindex(ids).fillna(0).astype(int),
        "compro_7d_alguna": (historia.groupby("id_cliente")["compra_7dias"].any()
                             .reindex(ids, fill_value=False).astype(bool)),
    }, index=ids)


def main() -> None:
    v01 = comun.cargar(comun.DATASET_V01)
    base = tablon._bases(APP / "data" / "raw", APP / "data" / "raw_e2")

    # 1. Target diario, después de reproducir el del v0.1.
    proxima = dias_a_proxima_compra(v01, base["tx"])
    y_tres = target(v01["dias_para_cruzar"], proxima, puntos=(30, 60, 90))
    assert (y_tres.values == v01[TARGET].values).all(), "no reproduce el target del v0.1"
    y_diario = target(v01["dias_para_cruzar"], proxima)
    assert ((y_diario == 0) & (v01[TARGET] == 1)).sum() == 0

    # 2 y 3. Variables de campaña, después de reproducir las del v0.1.
    v02 = v01.drop(columns=["umbral", "dias_para_cruzar", "alcanzable"]).copy()
    v02[TARGET] = y_diario.values
    cambios = {f: 0 for f in RECALCULADAS}
    for t, idx in v02.groupby("corte").groups.items():
        ids = pd.Index(v02.loc[idx, "id_cliente_canonico"])
        igual_v01 = respuesta(base["campanias"], t, ids, hasta=t)
        nuevo = respuesta(base["campanias"], t, ids, hasta=t - ESPERA_RESPUESTA)
        for f in RECALCULADAS:
            assert (igual_v01[f].values == v02.loc[idx, f].values).all(), f"{t.date()} {f}: no reproduce el v0.1"
            cambios[f] += int((nuevo[f].values != v02.loc[idx, f].values).sum())
            v02.loc[idx, f] = nuevo[f].values
    v02 = v02.drop(columns=EXCLUIDAS)

    assert len(v02) == len(v01) and (v02["particion"].values == v01["particion"].values).all()
    comun.DATASET_V02.parent.mkdir(exist_ok=True)
    v02.to_csv(comun.DATASET_V02, index=False, compression="gzip")

    nuevos = (v02[TARGET] == 1) & (v01[TARGET] == 0)
    por = []
    for p in ["train", "dev", "gap", "test", "test_flag"]:
        m = v02["particion"] == p
        por.append({"particion": p, "filas": int(m.sum()), "positivos_v01": int(v01.loc[m, TARGET].sum()),
                    "positivos": int(v02.loc[m, TARGET].sum()), "tasa_pct": round(100 * v02.loc[m, TARGET].mean(), 2)})
    resumen = {
        "nombre": NOMBRE, "base": comun.DATASET_V01.name,
        "filas": len(v02), "columnas": v02.shape[1], "n_features": v02.shape[1] - 5,
        "clientes_distintos": int(v02["id_cliente_canonico"].nunique()),
        "positivos_v01": int(v01[TARGET].sum()), "positivos": int(v02[TARGET].sum()),
        "tasa_global_pct": round(100 * v02[TARGET].mean(), 2),
        "positivos_nuevos_por_evaluacion_diaria": int(nuevos.sum()),
        "excluidas": EXCLUIDAS, "recalculadas": RECALCULADAS, "filas_que_cambian": cambios,
        "por_particion": por,
        "notas": [
            "y_churn_90 evaluado cada día de (T, T+90] (anexo, ecuación del target); el v0.1 lo evaluaba "
            "en T+30, T+60 y T+90. Ningún positivo del v0.1 pasa a 0.",
            "aperturas_90d y clics_90d cuentan envíos con fecha en (T − 90, T − 7]; compro_7d_alguna, envíos "
            "con fecha ≤ T − 7. envios_90d y envios_acum siguen contando hasta T: el envío se conoce en T.",
            "Antes de cambiar nada se reproducen el target y las tres variables de campaña del v0.1 fila por fila.",
        ],
    }
    (comun.DATASET_V02.parent / "resumen_v0.2.json").write_text(
        json.dumps(resumen, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(resumen, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

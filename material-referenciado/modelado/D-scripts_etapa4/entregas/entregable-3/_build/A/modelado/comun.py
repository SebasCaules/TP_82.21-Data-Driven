"""
Piezas comunes del modelado del Entregable 3 (etapas 1 a 4): carga del tablón, columnas derivadas
de la regla del umbral, partición con embargo y métricas de lista por corte.

Las importan etapa1.py y las etapas siguientes. Solo usa pandas, numpy y scikit-learn.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

RAIZ = Path(__file__).resolve().parents[5]
DATASET_V01 = RAIZ / "entregas" / "entregable-2" / "finales" / "B-churn_cliente_corte_v0.1.csv"
DATASET_V02 = Path(__file__).resolve().parent / "dataset" / "churn_cliente_corte_v0.2.csv.gz"

TARGET = "y_churn_90"
HORIZONTE_DIAS = 90
# C08: Marketing gestiona de 500 a 800 clientes por mes (envío 29); se toma el límite inferior.
CAPACIDAD = 500
DECIL = 0.10
# Se reservan hasta la etapa 4 (test) o quedan fuera de la evaluación por DC-09 (test_flag).
RESERVADAS = ("test", "test_flag")


def cargar(ruta: Path = DATASET_V01) -> pd.DataFrame:
    """El tablón completo, con el umbral θ_i(T), los días que faltan para cruzarlo y la marca de
    alcanzable (el cliente puede cruzar dentro del horizonte si no vuelve a comprar)."""
    df = pd.read_csv(ruta, parse_dates=["corte"])
    df["umbral"] = np.maximum(90.0, 1.5 * df["gap_mediano"])          # anexo, ecuación del umbral
    df["dias_para_cruzar"] = df["umbral"] - df["recency_dias"]        # > 0: nadie está en riesgo en T
    df["alcanzable"] = df["dias_para_cruzar"] < HORIZONTE_DIAS
    return df


def sin_reservadas(df: pd.DataFrame) -> pd.DataFrame:
    """Saca test y test_flag. Toda métrica se calcula después de esto."""
    out = df[~df["particion"].isin(RESERVADAS)].copy()
    assert not out["particion"].isin(RESERVADAS).any()
    return out


def entrenamiento_para_validacion(df: pd.DataFrame) -> pd.DataFrame:
    """Filas de entrenamiento cuya ventana de target (T, T+90] cierra antes del primer corte de
    validación. Es la misma regla que separa validación de prueba con los cortes `gap`: sin ella,
    los targets de los cortes de mayo y junio de 2024 miran meses que ya son de validación."""
    primer_dev = df.loc[df["particion"] == "dev", "corte"].min()
    cierra_antes = df["corte"] + pd.Timedelta(days=HORIZONTE_DIAS) < primer_dev
    return df[(df["particion"] == "train") & cierra_antes]


def aciertos_esperados(puntaje, y, k: int) -> float:
    """Positivos entre los k de mayor puntaje. Los empates en el borde se reparten en proporción,
    que es lo mismo que desempatar al azar: un puntaje constante da la tasa base."""
    puntaje = np.asarray(puntaje, dtype=float)
    y = np.asarray(y, dtype=int)
    k = min(int(k), len(puntaje))
    if k == 0:
        return 0.0
    borde = np.sort(puntaje)[::-1][k - 1]
    arriba = puntaje > borde
    empate = puntaje == borde
    faltan = k - int(arriba.sum())
    return float(y[arriba].sum() + y[empate].sum() * faltan / empate.sum())


def lista_por_corte(df: pd.DataFrame, puntaje: str, k: int | None = None,
                    fraccion: float | None = None) -> dict:
    """La lista de cada corte (los k primeros, o una fracción de las filas del corte), con los
    aciertos sumados sobre los cortes: precisión = aciertos / largo de las listas; recall =
    aciertos / positivos de los cortes."""
    aciertos = largo = positivos = 0.0
    for _, g in df.groupby("corte"):
        kk = k if k is not None else int(round(fraccion * len(g)))
        kk = min(kk, len(g))
        aciertos += aciertos_esperados(g[puntaje], g[TARGET], kk)
        largo += kk
        positivos += g[TARGET].sum()
    return {"largo": int(largo), "aciertos": aciertos, "positivos": int(positivos),
            "precision": aciertos / largo, "recall": aciertos / positivos}


# Las tres preguntas de la lámina 17 por grupo de variables y la decisión. La tercera pregunta
# (¿explica el target sospechosamente bien?) la responde el AUC medido, no esta tabla.
_TX = ("sí", "no", "mantener", "transacciones con fecha ≤ T (test de fugas E15)")
_FIJO = ("sí, foto sin fecha", "no", "mantener",
         "atributo del alta en Clientes.csv; no depende de lo que el cliente haga después de T")
_SOPORTE = ("sí", "no", "mantener", "panel de soporte con mes ≤ T (E15; tiene_panel corregido en el E2)")
_UMBRAL = ("sí", "no", "mantener",
           "entra en la definición del target: lo explica por construcción, no por datos posteriores "
           "a T; la regla del umbral es la línea base que el modelo tiene que superar")
_FOTO_FID = ("no: Fidelizacion.csv es una foto del extracto", "sí", "excluir",
             "el valor en T no se puede reconstruir: el archivo trae el último movimiento, y el vacío "
             "en T depende de si hubo movimiento después de T")
_RESPUESTA = ("en parte", "sí", "recalcular",
              "la respuesta a un envío de los 7 días previos a T (apertura, clic, compra a 7 días) "
              "puede ocurrir después de T: se cuentan solo envíos con fecha ≤ T − 7")
DECISIONES = {
    "recency_dias": _UMBRAL, "gap_mediano": _UMBRAL, "recency_sobre_umbral": _UMBRAL,
    "frequency": _TX, "compras_90d": _TX, "compras_90d_prev": _TX, "monetary": _TX,
    "ticket_medio": _TX, "ticket_90d": _TX, "n_tiendas_distintas": _TX,
    "n_categorias_distintas": _TX, "categoria_dominante": _TX, "pct_online": _TX,
    "region_dominante": _TX, "formato_tienda": _TX,
    "meses_desde_alta": ("sí", "no", "mantener", "la menor entre fecha de alta y primera compra, ambas ≤ T"),
    "canal_alta": _FIJO, "genero": _FIJO, "provincia": _FIJO,
    "edad": ("sí, foto del extracto", "no", "mantener",
             "la edad del extracto difiere en hasta 3 años de la edad en T; no depende del comportamiento"),
    "edad_flag": ("sí, foto del extracto", "no", "mantener", "marca de edad nula o fuera de rango (DC-07)"),
    "es_socio": ("sí", "no", "mantener", "socio si fecha_inscripcion ≤ T"),
    "nivel": ("no: Fidelizacion.csv es una foto del extracto", "no se sabe", "excluir",
              "es el nivel de hoy, no el de T, y sin historial no se puede reconstruir"),
    "puntos_canjeados": _FOTO_FID, "meses_sin_movimiento": _FOTO_FID,
    "envios_90d": ("sí", "no", "mantener", "envíos con fecha ≤ T"),
    "envios_acum": ("sí", "no", "mantener", "envíos con fecha ≤ T"),
    "ultimo_canal_campania": ("sí", "no", "mantener", "canal del último envío con fecha ≤ T"),
    "aperturas_90d": _RESPUESTA, "clics_90d": _RESPUESTA, "compro_7d_alguna": _RESPUESTA,
    "reclamos_90d": _SOPORTE, "reclamos_acum": _SOPORTE, "consultas_90d": _SOPORTE,
    "nps_ultimo": _SOPORTE, "nps_sin_interaccion_flag": _SOPORTE, "tiene_panel": _SOPORTE,
    "n_devoluciones": ("sí", "no", "mantener", "fecha_devolucion ≤ T"),
    "motivo_ultima_devolucion": ("sí", "no", "mantener", "fecha_devolucion ≤ T"),
    "pidio_baja": ("sí", "no", "mantener", "fecha_solicitud ≤ T; las 399 bajas de 2026 quedan fuera (D03)"),
    "mes_corte": ("sí, se conoce de antemano", "no", "mantener", "calendario"),
    "temporada": ("sí, se conoce de antemano", "no", "mantener", "calendario"),
    "dias_a_proximo_evento": ("sí, se conoce de antemano", "no", "mantener", "calendario"),
}


def features_por_decision(decision: str) -> list[str]:
    """Las variables del v0.1 con esa decisión del control de fugas, en el orden de DECISIONES."""
    return [f for f, (_, _, d, _) in DECISIONES.items() if d == decision]

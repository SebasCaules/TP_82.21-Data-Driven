"""
Loader — lectura y limpieza de los CSV crudos de Casa Oga.

Contrato completo en CONTRACT.md. Nada de lo que hay aca decide de nuevo lo que
ya esta cerrado ahi: si un numero no cierra contra las anclas, es un BLOCKED,
no un ajuste a mano.
"""
from pathlib import Path

import pandas as pd

_CANAL_MAP = {
    "Tienda": "fisico",
    "tienda": "fisico",
    "Online": "online",
    "E-commerce": "online",
}


def cortes() -> list[pd.Timestamp]:
    """25 fines de mes, 2023-12-31 a 2025-12-31 (CONTRACT.md #2)."""
    return list(pd.date_range("2023-12-31", "2025-12-31", freq="ME"))


def load_transacciones(data_dir) -> pd.DataFrame:
    """Transacciones limpias segun el orden fijo del contrato (#1).

    dedupe de fila completa -> id_cliente no nulo -> monto_neto > 0.
    Agrega canal_norm ('fisico'|'online') y region_tx (region de la tienda
    segun Tiendas.csv; '__online__' si la fila no tiene id_tienda).
    """
    data_dir = Path(data_dir)
    tx = pd.read_csv(data_dir / "Transacciones_clientes.csv")

    tx = tx.drop_duplicates()
    tx = tx[tx["id_cliente"].notna()]
    tx = tx[tx["monto_neto"] > 0].copy()

    tx["fecha"] = pd.to_datetime(tx["fecha"])
    tx["canal_norm"] = tx["canal"].map(_CANAL_MAP)

    tiendas = pd.read_csv(data_dir / "Tiendas.csv")
    region_por_tienda = tiendas.set_index("id_tienda")["region"]
    tx["region_tx"] = tx["id_tienda"].map(region_por_tienda).fillna("__online__")

    return tx


def stage_counts(data_dir) -> dict:
    """Conteos de las 4 etapas de limpieza + diagnosticos de calidad (CONTRACT.md #1)."""
    data_dir = Path(data_dir)
    crudo_df = pd.read_csv(data_dir / "Transacciones_clientes.csv")

    dedupe_df = crudo_df.drop_duplicates()
    identificado_df = dedupe_df[dedupe_df["id_cliente"].notna()]
    monto_pos_df = identificado_df[identificado_df["monto_neto"] > 0]

    fechas = pd.to_datetime(crudo_df["fecha"])

    return {
        "crudo": len(crudo_df),
        "dedupe": len(dedupe_df),
        "identificado": len(identificado_df),
        "monto_pos": len(monto_pos_df),
        "neg_crudo": int((crudo_df["monto_neto"] <= 0).sum()),
        "neg_dedupe": int((dedupe_df["monto_neto"] <= 0).sum()),
        "dup_ids_crudo": int(crudo_df["id_transaccion"].duplicated().sum()),
        "dup_ids_post": int(dedupe_df["id_transaccion"].duplicated().sum()),
        "fecha_min": fechas.min().strftime("%Y-%m-%d"),
        "fecha_max": fechas.max().strftime("%Y-%m-%d"),
    }


def load_clientes(data_dir) -> pd.DataFrame:
    """Clientes indexados por id_cliente, acepta_marketing como bool de verdad."""
    data_dir = Path(data_dir)
    clientes = pd.read_csv(data_dir / "Clientes.csv", index_col="id_cliente")
    if clientes["acepta_marketing"].dtype != bool:
        clientes["acepta_marketing"] = (
            clientes["acepta_marketing"].astype(str).str.strip().str.lower() == "true"
        )
    return clientes


def load_tiendas(data_dir) -> pd.DataFrame:
    data_dir = Path(data_dir)
    return pd.read_csv(data_dir / "Tiendas.csv")


def load_campanias(data_dir) -> pd.DataFrame:
    data_dir = Path(data_dir)
    camp = pd.read_csv(data_dir / "Campanias_marketing.csv")
    camp["fecha_envio"] = pd.to_datetime(camp["fecha_envio"])
    return camp


def load_fidelizacion(data_dir) -> pd.DataFrame:
    data_dir = Path(data_dir)
    return pd.read_csv(data_dir / "Fidelizacion.csv")


if __name__ == "__main__":
    _DATA_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"

    esperado = {
        "crudo": 50250,
        "dedupe": 50000,
        "identificado": 27606,
        "monto_pos": 27276,
        "neg_crudo": 613,
        "neg_dedupe": 608,
        "dup_ids_crudo": 250,
        "dup_ids_post": 0,
        "fecha_min": "2022-01-03",
        "fecha_max": "2025-12-29",
    }

    counts = stage_counts(_DATA_DIR)
    ok = True
    for clave, valor_esperado in esperado.items():
        valor_real = counts[clave]
        estado = "OK" if valor_real == valor_esperado else "MISMATCH"
        if valor_real != valor_esperado:
            ok = False
        print(f"{estado:8s} {clave:15s} esperado={valor_esperado!r:15} real={valor_real!r}")

    tx = load_transacciones(_DATA_DIR)
    print(f"\nload_transacciones: {len(tx)} filas, columnas={list(tx.columns)}")
    print(f"canal_norm nulos: {tx['canal_norm'].isna().sum()}")
    print(f"region_tx unicos: {sorted(tx['region_tx'].unique())}")

    ejes = cortes()
    print(f"\ncortes(): {len(ejes)} valores, {ejes[0].date()} .. {ejes[-1].date()}")

    clientes = load_clientes(_DATA_DIR)
    print(f"\nload_clientes: {len(clientes)} filas, index={clientes.index.name}, "
          f"acepta_marketing dtype={clientes['acepta_marketing'].dtype}")

    print("\nTODO OK" if ok else "\nHAY MISMATCH")

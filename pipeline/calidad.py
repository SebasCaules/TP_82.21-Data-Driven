"""
Calidad — las decisiones DC-01 a DC-15 del contrato E2 (CONTRACT_E2.md seccion 1),
como funciones puras. No hace I/O propio: recibe DataFrames ya leidos y devuelve
copias corregidas. No toca nada del E1 (loader.py, features.py, series.py).
"""
from __future__ import annotations

import numpy as np
import pandas as pd

import series as _series_e1

CORTE_REF = pd.Timestamp("2025-12-31")
CORTE_SENS = pd.Timestamp("2025-08-31")

_CANAL_ALTA_MAP = {"Tienda": "fisico", "Sucursal": "fisico", "Online": "online"}

_TIPO_OFERTA_MAP = {
    "2x1": "2x1",
    "cupon fijo ars": "Cupón fijo",
    "cupón fijo ars": "Cupón fijo",
    "descuento %": "Descuento",
    "envio gratis": "Envío gratis",
    "envío gratis": "Envío gratis",
    "puntos extra": "Puntos extra",
}


# ---------------------------------------------------------------- DC-01 ----
def aplicar_dedupe_transacciones(tx_crudo: pd.DataFrame) -> pd.DataFrame:
    """DC-01: dedupe de fila completa sobre Transacciones_clientes.csv."""
    return tx_crudo.drop_duplicates().copy()


# ---------------------------------------------------------------- DC-02 ----
def aplicar_signo_devoluciones(tx_dedupe: pd.DataFrame) -> pd.DataFrame:
    """DC-02: conserva filas negativas con bandera es_devolucion; no se filtran."""
    out = tx_dedupe.copy()
    out["es_devolucion"] = out["monto_neto"] < 0
    return out


def unidades_antes_despues(tx_dedupe: pd.DataFrame) -> dict:
    """DC-02: unidades sumando todo signo (antes) vs. solo filas monto>0 (despues)."""
    antes = int(tx_dedupe["unidades"].sum())
    despues = int(tx_dedupe.loc[tx_dedupe["monto_neto"] > 0, "unidades"].sum())
    return {"antes": antes, "despues": despues, "infla_pct": round((antes / despues - 1) * 100, 1)}


def serie_devoluciones(tx_dedupe: pd.DataFrame, devoluciones: pd.DataFrame) -> dict:
    """DC-02: devoluciones por fila negativa (post dedupe) y por fecha_devolucion
    (join con Devoluciones.csv por id_transaccion), con el desfase entre ambas."""
    neg = tx_dedupe.loc[tx_dedupe["monto_neto"] < 0, ["id_transaccion", "fecha"]].copy()
    dv = devoluciones.copy()
    dv["fecha_devolucion"] = pd.to_datetime(dv["fecha_devolucion"])

    j = neg.merge(dv, on="id_transaccion", how="inner")
    j["desfase"] = (j["fecha_devolucion"] - j["fecha"]).dt.days

    por_fila = neg.assign(mes=neg["fecha"].dt.to_period("M").astype(str)).groupby("mes").size()
    por_fecha = dv.assign(mes=dv["fecha_devolucion"].dt.to_period("M").astype(str)).groupby("mes").size()
    meses = sorted(set(por_fila.index) | set(por_fecha.index))
    serie = [
        {"mes": m, "por_fila_negativa": int(por_fila.get(m, 0)), "por_fecha_devolucion": int(por_fecha.get(m, 0))}
        for m in meses
    ]

    motivos = [{"motivo": m, "n": int(n)} for m, n in dv["motivo"].value_counts().items()]

    return {
        "crudas": int(len(dv)),
        "unicas": int(len(neg)),
        "serie": serie,
        "desfase_dias": {
            "mediana": float(j["desfase"].median()),
            "min": int(j["desfase"].min()),
            "max": int(j["desfase"].max()),
        },
        "motivos": motivos,
    }


# ---------------------------------------------------------------- DC-03 ----
def normalizar_canal_alta(clientes: pd.DataFrame) -> pd.DataFrame:
    """DC-03: canal_alta a catalogo cerrado {fisico, online} (Tienda/Sucursal -> fisico)."""
    out = clientes.copy()
    out["canal_alta_norm"] = out["canal_alta"].map(_CANAL_ALTA_MAP)
    return out


# ---------------------------------------------------------------- DC-04 ----
def mapear_identidad(df: pd.DataFrame, mapa: pd.Series, col: str = "id_cliente") -> pd.DataFrame:
    """DC-04: reemplaza `col` por su id_cliente_canonico segun `mapa` (Identidad_resuelta.csv,
    id_cliente -> id_cliente_canonico). Ids ausentes del mapa quedan igual."""
    out = df.copy()
    out[col] = out[col].map(lambda i: mapa.get(i, i))
    return out


def duplicados_con_actividad(facts_antes: pd.DataFrame, mapa: pd.Series) -> int:
    """DC-04: cuantos ids con actividad (facts antes del mapeo) son un alias no canonico."""
    activos = set(facts_antes.index)
    return sum(1 for i in activos if i in mapa.index and mapa[i] != i)


# ---------------------------------------------------------------- DC-05 ----
def dedupe_envios(campanias_crudo: pd.DataFrame) -> pd.DataFrame:
    """DC-05: dedupe de fila completa sobre Campanias_marketing.csv."""
    return campanias_crudo.drop_duplicates().copy()


# ---------------------------------------------------------------- DC-06 ----
def nivel_fidelizacion(ids: pd.Index, fidelizacion: pd.DataFrame) -> pd.Series:
    """DC-06: nivel del programa por id_cliente (Fidelizacion.nivel; 'no socio' si no esta).
    El segmento de campana NO se usa como nivel."""
    nivel = fidelizacion.set_index("id_cliente")["nivel"]
    return pd.Series(ids, index=ids).map(nivel).fillna("no socio")


# ---------------------------------------------------------------- DC-07 ----
def marcar_edades(clientes: pd.DataFrame, minimo: int = 15, maximo: int = 100) -> pd.DataFrame:
    """DC-07: edad fuera de [minimo, maximo] -> NaN con edad_flag; no se borran filas."""
    out = clientes.copy()
    fuera = out["edad"].notna() & ((out["edad"] < minimo) | (out["edad"] > maximo))
    out["edad_flag"] = fuera
    out.loc[fuera, "edad"] = np.nan
    return out


def marcar_puntos_invalidos(fidelizacion: pd.DataFrame) -> pd.DataFrame:
    """DC-07: puntos_canjeados > puntos_acumulados -> ambos a NaN con puntos_flag."""
    out = fidelizacion.copy()
    invalido = out["puntos_canjeados"] > out["puntos_acumulados"]
    out["puntos_flag"] = invalido
    out.loc[invalido, ["puntos_canjeados", "puntos_acumulados"]] = np.nan
    return out


def marcar_altas_futuras(clientes: pd.DataFrame, corte: pd.Timestamp = CORTE_REF) -> pd.DataFrame:
    """DC-07: fecha_alta posterior al corte -> bandera fecha_alta_flag (no se borra ni se NaNea)."""
    out = clientes.copy()
    fecha_alta = pd.to_datetime(out["fecha_alta"])
    out["fecha_alta_flag"] = fecha_alta > corte
    return out


# ---------------------------------------------------------------- DC-08 ----
def filtrar_corte_comportamiento(df: pd.DataFrame, corte: pd.Timestamp, col_fecha: str = "fecha") -> pd.DataFrame:
    """DC-08: para cruces de comportamiento, solo datos con `col_fecha` <= corte.
    Calendario e Historial_Bajas NO pasan por aca: quedan enteros como contexto."""
    fechas = pd.to_datetime(df[col_fecha])
    return df.loc[fechas <= corte].copy()


# ---------------------------------------------------------------- DC-09 ----
def meses_cobertura(tx: pd.DataFrame, umbral: float = 0.60) -> list[dict]:
    """DC-09: por mes, razon de ventas contra el mismo mes del anio anterior; flag
    'cobertura_no_confirmada' si razon < umbral. tx = filas unicas con monto > 0."""
    conteo = tx.set_index("fecha")["monto_neto"].resample("ME").count()
    conteo.index = conteo.index.to_period("M")

    salida = []
    for periodo, n in conteo.items():
        prev = periodo - 12
        n_prev = int(conteo.get(prev)) if prev in conteo.index else None
        ratio = round(n / n_prev, 4) if n_prev else None
        flag = bool(ratio is not None and ratio < umbral)
        salida.append({
            "mes": str(periodo), "n": int(n), "n_prev": n_prev, "ratio": ratio, "flag": flag,
        })
    return salida


def resumen_riesgo(facts: pd.DataFrame) -> dict:
    """Elegibles, en riesgo, pct y exposicion (M, una decimal) sobre un client_facts ya calculado."""
    elegibles = int(facts["elegible"].sum())
    en_riesgo = int(facts["en_riesgo"].sum())
    exposicion_m = round(float(facts.loc[facts["en_riesgo"], "anualizado"].sum()) / 1e6, 1)
    pct = round(en_riesgo / elegibles * 100, 1) if elegibles else None
    return {"elegibles": elegibles, "en_riesgo": en_riesgo, "pct": pct, "exposicion_M": exposicion_m}


# ---------------------------------------------------------------- DC-10 ----
# El extracto no se deflacta (DC-10, declarada). IPC INDEC nivel general, cifra
# externa citada en D09 (wiki/entregables/cifras-entregable-2.md): 94.8% / 211.4%
# / 117.8% de inflacion interanual 2022/2023/2024. No sale de app/data: es un dato
# macro publicado, no algo que este pipeline pueda recalcular desde el extracto.
_IPC_INTERANUAL = {2022: 0.948, 2023: 2.114, 2024: 1.178}


def ipc_acumulado(base_anio: int = 2022, hasta_anio: int = 2025) -> list[dict]:
    """DC-10: indice IPC acumulado, base 100 en `base_anio` (acumulado=1.0)."""
    salida = [{"anio": base_anio, "acumulado": 1.0}]
    acc = 1.0
    for anio in range(base_anio + 1, hasta_anio + 1):
        acc *= 1 + _IPC_INTERANUAL[anio - 1]
        salida.append({"anio": anio, "acumulado": round(acc, 3)})
    return salida


def mediana_precio_unitario(tx_crudo: pd.DataFrame) -> dict:
    """DC-10/C29: mediana de monto_neto/unidades por fila, sobre filas CRUDAS
    (sin dedupe) con monto y unidades > 0, por anio. No se deflacta."""
    base = tx_crudo[(tx_crudo["monto_neto"] > 0) & (tx_crudo["unidades"] > 0)].copy()
    base["fecha"] = pd.to_datetime(base["fecha"])
    base["precio_unitario"] = base["monto_neto"] / base["unidades"]
    base["anio"] = base["fecha"].dt.year

    por_anio = base.groupby("anio")["precio_unitario"].median()
    mediana = [{"anio": int(a), "valor": round(float(v))} for a, v in por_anio.items()]

    por_categoria = []
    for cat, grupo in base.groupby("categoria"):
        v22 = grupo.loc[grupo["anio"] == 2022, "precio_unitario"].median()
        v25 = grupo.loc[grupo["anio"] == 2025, "precio_unitario"].median()
        pct = round((v25 / v22 - 1) * 100, 1) if v22 else None
        por_categoria.append({"categoria": cat, "v2022": round(float(v22)), "v2025": round(float(v25)), "pct": pct})

    return {"mediana_unitaria": mediana, "por_categoria": por_categoria}


# ---------------------------------------------------------------- DC-11 ----
def nps_con_sin_interaccion(soporte: pd.DataFrame) -> pd.DataFrame:
    """DC-11: nps_sin_interaccion = reclamos==0 & consultas==0 & nps_promedio no nulo."""
    out = soporte.copy()
    out["nps_sin_interaccion"] = (
        (out["reclamos"] == 0) & (out["consultas"] == 0) & out["nps_promedio"].notna()
    )
    return out


def nps_anual(soporte_flag: pd.DataFrame, corte: pd.Timestamp = CORTE_REF) -> list[dict]:
    """DC-11: NPS medio por anio, con todas las filas y solo con las que tienen interaccion."""
    d = soporte_flag[pd.to_datetime(soporte_flag["mes"]) <= corte].copy()
    d["anio"] = pd.to_datetime(d["mes"]).dt.year

    salida = []
    for anio, grupo in d.groupby("anio"):
        con_interaccion = grupo.loc[~grupo["nps_sin_interaccion"]]
        salida.append({
            "anio": int(anio),
            "con_todo": round(float(grupo["nps_promedio"].mean()), 1),
            "solo_con_interaccion": round(float(con_interaccion["nps_promedio"].mean()), 1),
            "n_filas": int(len(grupo)),
            "n_sin_interaccion": int(grupo["nps_sin_interaccion"].sum()),
        })
    return salida


# ---------------------------------------------------------------- DC-12 ----
def filtrar_bajas(bajas: pd.DataFrame, corte: pd.Timestamp = CORTE_REF) -> dict:
    """DC-12: dos vistas de Historial_Bajas_No_Contacto. 'comportamiento' recorta a
    fecha_solicitud <= corte (no hay ventas de 2026); 'contacto' usa TODAS (una baja
    vale desde que se pide, aunque sea de 2026)."""
    fecha = pd.to_datetime(bajas["fecha_solicitud"])
    return {
        "comportamiento": bajas.loc[fecha <= corte].copy(),
        "contacto": bajas.copy(),
    }


# ---------------------------------------------------------------- DC-13 ----
def normalizar_tipo_oferta(contenido: pd.DataFrame) -> pd.DataFrame:
    """DC-13: tipo_oferta normalizado de 8 grafias a 5 valores canonicos."""
    out = contenido.copy()
    clave = out["tipo_oferta"].str.strip().str.lower()
    out["tipo_oferta_norm"] = clave.map(lambda s: _TIPO_OFERTA_MAP.get(s, s))
    return out


def dedupe_contenido_campanias(contenido: pd.DataFrame, campanias_crudo: pd.DataFrame) -> tuple[pd.DataFrame, list[dict]]:
    """DC-13: dedupe de Contenido_Campanias por id_campania. Para cada id_campania
    duplicado: se queda la fila cuya fecha_envio coincide con la de
    Campanias_marketing; si ninguna o las dos coinciden, la de fecha_creacion mas
    reciente (si tambien empata esa, se conserva la primera fila del archivo, caso
    que se declara en el resultado). Devuelve (contenido resuelto sin duplicados,
    lista de casos elegida/descartada)."""
    co = normalizar_tipo_oferta(contenido)
    fecha_real = campanias_crudo.drop_duplicates("id_campania").set_index("id_campania")["fecha_envio"]
    fecha_real = pd.to_datetime(fecha_real)

    dup_ids = co.loc[co["id_campania"].duplicated(keep=False), "id_campania"].unique()
    casos = []
    filas_resueltas = []

    for cid in dup_ids:
        sub = co[co["id_campania"] == cid].copy()
        coincide = pd.to_datetime(sub["fecha_envio"]) == fecha_real.get(cid)

        desempate = None
        if coincide.sum() == 1:
            elegida = sub[coincide].iloc[0]
            criterio = "fecha_envio coincide"
        else:
            # ninguna o las dos coinciden con Campanias_marketing: gana fecha_creacion
            # mas reciente (criterio del contrato). Si fecha_creacion TAMBIEN empata,
            # el contrato no define un tercer criterio: es un caso BLOCKED de
            # CONTRACT_E2.md seccion 1 (DC-13), no una decision de este modulo. Se
            # conserva la primera fila del archivo de forma deterministica para que
            # el resto del pipeline pueda correr, pero 'criterio' se mantiene dentro
            # del enum del contrato y el empate se declara aparte en 'desempate'
            # (no viaja como texto libre dentro de 'criterio').
            orden = sub.sort_values("fecha_creacion", ascending=False)
            elegida = orden.iloc[0]
            criterio = "fecha_creacion más reciente"
            if len(orden) > 1 and orden["fecha_creacion"].iloc[0] == orden["fecha_creacion"].iloc[1]:
                elegida = sub.iloc[0]
                desempate = ("fecha_envio y fecha_creacion empatan las dos; CONTRACT_E2.md no da un "
                              "tercer criterio. Se conserva la primera fila del archivo (BLOCKED: "
                              "requiere que Casa Óga confirme la fila real, ver V12/DC-13).")

        descartada = sub.loc[sub.index != elegida.name].iloc[0]
        filas_resueltas.append(elegida)
        caso = {
            "id_campania": cid,
            "elegida": {
                "fecha_creacion": elegida["fecha_creacion"], "fecha_envio": elegida["fecha_envio"],
                "tipo_oferta": elegida["tipo_oferta_norm"],
            },
            "descartada": {
                "fecha_creacion": descartada["fecha_creacion"], "fecha_envio": descartada["fecha_envio"],
                "tipo_oferta": descartada["tipo_oferta_norm"],
            },
            "criterio": criterio,
        }
        if desempate:
            caso["desempate"] = desempate
        casos.append(caso)

    co_unicas = co[~co["id_campania"].isin(dup_ids)]
    resuelto = pd.concat([co_unicas, pd.DataFrame(filas_resueltas)], ignore_index=True)
    return resuelto, casos


def conversion_por_oferta(envios: pd.DataFrame, contenido_resuelto: pd.DataFrame) -> dict:
    """Tasa de compra a 7 dias por tipo_oferta (ya normalizado), con IC de Wilson 95%."""
    j = envios.merge(contenido_resuelto[["id_campania", "tipo_oferta_norm"]], on="id_campania", how="inner")
    salida = {}
    for tipo, grupo in j.groupby("tipo_oferta_norm"):
        n = int(len(grupo))
        compras = int(grupo["compra_7dias"].sum())
        tasa = round(compras / n * 100, 2) if n else None
        ic = _wilson(compras, n)
        salida[tipo] = {
            "n": n, "compras": compras, "tasa_pct": tasa,
            "ic_lo": round(ic[0], 2) if ic else None, "ic_hi": round(ic[1], 2) if ic else None,
        }
    return salida


def _wilson(exitos: int, n: int):
    """Intervalo de Wilson 95% para una proporcion. Reusa series._wilson (E1) y
    lo pasa de fraccion a porcentaje."""
    ic = _series_e1._wilson(exitos, n)
    return None if ic is None else (ic[0] * 100, ic[1] * 100)


# ---------------------------------------------------------------- DC-14 ----
# BLOCKED (CONTRACT_E2.md DC-14, seccion 1): la decision cita "el mapa de la
# seccion 4" para llevar cada accion del catalogo a un tipo_oferta de campanias,
# pero CONTRACT_E2.md seccion 4 (el tablon) no trae ningun mapa de ese tipo, y
# Catalogo_Acciones_Retencion.csv no tiene columna de mapeo. No hay una lectura
# del contrato que resuelva esto sin una decision editorial: el mapa de abajo es
# esa decision (cada accion, al mecanismo de oferta mas afin por su descripcion),
# documentada aca para que quede trazable, no una interpretacion literal del
# contrato. Pendiente: que el contrato incorpore el mapa formal o que DC-14 baje
# a `pendiente del negocio` en vez de `aplicada`. Ver notes de build_e2.py.
_ACCION_OFERTA_MAP = {
    "Email con descuento": "Descuento",
    "SMS con puntos extra": "Puntos extra",
    "WhatsApp con oferta personalizada": "Descuento",
    "Llamado de vendedor": "Descuento",
    "Envio gratis (canal online)": "Envío gratis",
}


def tasa_exito_proxy_por_accion(catalogo: pd.DataFrame, conversion_ofertas: dict) -> list[dict]:
    """DC-14: tasa de exito proxy = compra a 7 dias por tipo_oferta (DC-13, base
    'despues' de 23.529) mapeada a cada accion del catalogo."""
    salida = []
    for _, fila in catalogo.iterrows():
        oferta = _ACCION_OFERTA_MAP.get(fila["accion"])
        proxy = conversion_ofertas.get(oferta) if oferta else None
        salida.append({
            "id_accion": fila["id_accion"], "accion": fila["accion"], "canal": fila["canal"],
            "costo_unitario_ars": float(fila["costo_unitario_ars"]),
            "tipo_oferta_proxy": oferta,
            "tasa_exito_proxy_pct": proxy["tasa_pct"] if proxy else None,
        })
    return salida


# ---------------------------------------------------------------- DC-15 ----
def documentacion_pendiente() -> dict:
    """DC-15: sin calculo, solo estado. El diccionario columna por columna no esta
    en el DOCX del 08/09; se pide la version del campus (pendiente del negocio)."""
    return {
        "estado": "pendiente del negocio",
        "que": "diccionario de datos columna por columna",
        "detalle": "no esta en el DOCX del 08/09; se pide la version del campus",
    }


# ------------------------------------------------------- orquestadores -----
_ARCHIVOS_E1 = ("Calendario.csv", "Campanias_marketing.csv", "Clientes.csv",
                "Fidelizacion.csv", "Tiendas.csv", "Transacciones_clientes.csv")
_ARCHIVOS_E2 = ("Calendario.csv", "Catalogo_Acciones_Retencion.csv", "Contenido_Campanias.csv",
                "Devoluciones.csv", "Historial_Bajas_No_Contacto.csv", "Identidad_resuelta.csv",
                "Interacciones_soporte_mensual.csv")


def _leer(data_dir, nombre: str) -> pd.DataFrame:
    from pathlib import Path
    return pd.read_csv(Path(data_dir) / nombre)


def base_cruda(data_dir_e1, data_dir_e2) -> dict:
    """Los 13 CSV tal cual llegan, sin ninguna decision aplicada."""
    salida = {nombre: _leer(data_dir_e1, nombre) for nombre in _ARCHIVOS_E1}
    salida["Calendario_e2.csv"] = _leer(data_dir_e2, "Calendario.csv")
    for nombre in _ARCHIVOS_E2:
        if nombre == "Calendario.csv":
            continue
        salida[nombre] = _leer(data_dir_e2, nombre)
    return salida


def base_corregida(data_dir_e1, data_dir_e2, corte: pd.Timestamp = CORTE_REF) -> dict:
    """Los 13 CSV con las decisiones DC-01..DC-08 y DC-12 aplicadas, en el orden de
    CONTRACT_E2.md seccion 1: DC-01 -> DC-02 -> DC-03 -> DC-05 -> DC-13 -> DC-04 ->
    DC-07 -> DC-12 -> DC-08 (corte). DC-09/10/11/14 son lecturas, no transforman."""
    crudo = base_cruda(data_dir_e1, data_dir_e2)

    tx = aplicar_dedupe_transacciones(crudo["Transacciones_clientes.csv"])          # DC-01
    tx["fecha"] = pd.to_datetime(tx["fecha"])
    tx = aplicar_signo_devoluciones(tx)                                             # DC-02
    tx["canal_norm"] = tx["canal"].str.lower().replace({"e-commerce": "online"}).replace({"tienda": "fisico"})

    clientes = normalizar_canal_alta(crudo["Clientes.csv"])                         # DC-03

    campanias = dedupe_envios(crudo["Campanias_marketing.csv"])                     # DC-05
    campanias["fecha_envio"] = pd.to_datetime(campanias["fecha_envio"])

    contenido, casos_dc13 = dedupe_contenido_campanias(                              # DC-13
        crudo["Contenido_Campanias.csv"], crudo["Campanias_marketing.csv"])

    idr = crudo["Identidad_resuelta.csv"]
    mapa = idr.set_index("id_cliente")["id_cliente_canonico"]
    for col in ("id_cliente",):
        tx = mapear_identidad(tx, mapa, col=col)
        campanias = mapear_identidad(campanias, mapa, col=col)
    clientes_mapeado = clientes.copy()
    clientes_mapeado.index = clientes_mapeado["id_cliente"] if "id_cliente" in clientes_mapeado else clientes_mapeado.index
    fidelizacion = mapear_identidad(crudo["Fidelizacion.csv"], mapa, col="id_cliente")   # DC-04
    devoluciones = mapear_identidad(crudo["Devoluciones.csv"], mapa, col="id_cliente")
    soporte = mapear_identidad(crudo["Interacciones_soporte_mensual.csv"], mapa, col="id_cliente")
    bajas = mapear_identidad(crudo["Historial_Bajas_No_Contacto.csv"], mapa, col="id_cliente")

    clientes = marcar_edades(clientes)                                              # DC-07
    clientes = marcar_altas_futuras(clientes, corte)
    fidelizacion = marcar_puntos_invalidos(fidelizacion)

    bajas_vistas = filtrar_bajas(bajas, corte)                                      # DC-12

    tx_comportamiento = filtrar_corte_comportamiento(tx, corte, "fecha")            # DC-08 (corte)

    return {
        "transacciones": tx,
        "transacciones_comportamiento": tx_comportamiento,
        "clientes": clientes,
        "campanias": campanias,
        "contenido_campanias": contenido,
        "casos_dc13": casos_dc13,
        "fidelizacion": fidelizacion,
        "devoluciones": devoluciones,
        "soporte": soporte,
        "bajas_comportamiento": bajas_vistas["comportamiento"],
        "bajas_contacto": bajas_vistas["contacto"],
        "mapa_identidad": mapa,
        "calendario": crudo["Calendario_e2.csv"],
        "tiendas": crudo["Tiendas.csv"],
        "catalogo_acciones": crudo["Catalogo_Acciones_Retencion.csv"],
    }

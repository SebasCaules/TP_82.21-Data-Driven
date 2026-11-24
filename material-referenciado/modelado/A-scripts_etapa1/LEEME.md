# Scripts de la Parte A del Entregable 3 (Grupo 2)

Reproducen las cifras de la Parte A. Las carpetas son las del repositorio del equipo: cada script
busca sus entradas por ruta relativa, así que se corren desde la carpeta donde se descomprimió el zip.
Requieren Python 3 con pandas, numpy y scikit-learn.

## Sección 2: etapa 1 del modelado

    python3 entregas/entregable-3/_build/A/modelado/etapa1.py

Lee el dataset del E2 (`entregas/entregable-2/finales/B-churn_cliente_corte_v0.1.csv`), sobre el
que corre el control de fugas, y el v0.2 (`modelado/dataset/churn_cliente_corte_v0.2.csv.gz`), sobre
el que mide la ficha, la partición y las líneas base. Escribe `modelado/salida/etapa1.json` y
`modelado/salida/fugas_por_variable.csv`. Las particiones de test solo se cuentan: ninguna métrica las usa.

    python3 entregas/entregable-3/_build/A/modelado/lista_500.py

Lee `modelado/salida/etapa1.json` y escribe `modelado/salida/lista_500.json`: la matriz de confusión y el F1
de cada línea base en la lista de 500 por corte (sección 2.5).

    python3 entregas/entregable-3/_build/A/modelado/devoluciones_v02.py

Compras devueltas (sección 2.1): arma las filas de la regla con la compra devuelta sin contar (la lectura del
v0.2, que reproduce fila por fila) y contada como actividad, y escribe `modelado/salida/devoluciones_v02.json`.
Necesita lo mismo que `dataset_v02.py` (abajo) y `entregas/entregable-3/_build/B/modelado/etapa2.py`, que
viene en B-scripts_etapa2.zip: se descomprime en esta misma raíz.

`modelado/dataset_v02.py` arma el v0.2 desde el v0.1. Además necesita:

- el pipeline del E2, que es solo código: la carpeta `app/` del repositorio del equipo
  (https://github.com/SebasCaules/TP_82.21-Data-Driven), en esta misma raíz;
- los 14 CSV de la cátedra de las unidades 1 y 2, copiados desde el set que recibió cada equipo:
  los 6 de unidad-1 en `app/data/raw/` y los 8 de unidad-2 en `app/data/raw_e2/` (los nombres son
  los de la lista de la sección 1).

Después se corre

    python3 entregas/entregable-3/_build/A/modelado/dataset_v02.py

## Sección 1: evidencia de la factibilidad técnica

    python3 entregas/entregable-3/_build/A/factibilidad/condiciones.py

Necesita 16 CSV del caso con sus nombres originales, en estas carpetas de la misma raíz:

- `raw/datasets/unidad-1/` (6): Calendario.csv, Campanias_marketing.csv, Clientes.csv,
  Fidelizacion.csv, Tiendas.csv, Transacciones_clientes.csv
- `raw/datasets/unidad-2/` (8): Calendario.csv, Casos_Cualitativos_Clientes.csv,
  Catalogo_Acciones_Retencion.csv, Contenido_Campanias.csv, Devoluciones.csv,
  Historial_Bajas_No_Contacto.csv, Identidad_resuelta.csv, Interacciones_soporte_mensual.csv
- `raw/datasets/unidad-3/` (2, enviados por Casa Óga el 13/10): Costo_Margen_Categoria_Mensual.csv,
  Inversion_Marketing_Anual.csv

Escribe `factibilidad/salida/condiciones.json`: inventario, cruces entre fuentes y nulos.

# Factibilidad económica (Entregable 3, Parte B, sección 3 y 4.4)

Generador del valor en dinero de la matriz de confusión (4.4), la estructura de costos (3.2), los
beneficios (3.3), el ROI por escenario (3.4), la sensibilidad (3.5) y el umbral de viabilidad
(3.6), con el piloto mínimo, la operación mínima y la producción completa (G64 a G69) y el rango anual
(E3A). Página de trabajo: `wiki/entregables/factibilidad-economica-parte-b.md`. Cifras: filas G30 a
G69 y E3A de `wiki/entregables/cifras-entregable-4.md` (no hay G57).

## Cómo se regenera

```bash
python3 -I entregas/entregable-3/_build/B/modelado/etapa2.py     # si cambió el modelado
python3 -I entregas/entregable-3/_build/B/economia/economia.py
```

Tarda unos segundos. Necesita pandas, numpy y scikit-learn (`cv_temporal.py` ajusta las logísticas
del rango anual). La salida es determinista: dos corridas dan los mismos tres archivos, byte a byte. Sale con código 1, sin escribir nada, si una cifra de entrada no
coincide con su fila del registro (G01, G04, G05, G06, G08, G17, G19 a G21, G27, C16, D07, D27, F13).

## Qué lee

| Entrada | Para qué |
|---|---|
| `../modelado/salida/etapa2.json` | matrices de la lista de 500 del modelo y de la regla (G19, G20), la de la regla como clasificador (G21), intervalo de la diferencia (G17) y la lista por pérdida esperada con la facturación anualizada de sus aciertos (G27) |
| `../datos/margen_marketing.json` | costo de adquisición e inversión en retención (G04, G05) |
| `../../A/factibilidad/salida/condiciones.json` | margen bruto anual con cuatro decimales (G01: 0,3758 en 2024) |
| `../../A/modelado/dataset/churn_cliente_corte_v0.2.csv.gz` | estado de cada cliente al corte anterior a cada envío (`comun.cargar`, `comun.sin_reservadas`: test y test_flag no se usan) |
| `raw/datasets/unidad-1/`: Transacciones_clientes, Campanias_marketing | ticket medio (D07), facturación por cliente (D27), compra a 7 días (s, y r en los envíos a clientes que no cruzan) y apertura |
| `raw/datasets/unidad-2/`: Identidad_resuelta, Catalogo_Acciones_Retencion | id canónico de cada envío; costo de la acción |
| `raw/datasets/unidad-3/Inversion_Marketing_Anual.csv` | inversión en retención de 2025 en pesos |
| `raw/Respuestas_Consultas_Entregable_3.md` | verifica el texto del tope de descuento (G06) |
| `../../C/modelado/salida/etapa3.json` | pliegues de la C 7.1 y lista de contactables, para `cv_temporal.py` (E3A) |

Los supuestos que no salen de los datos están al principio de `economia.py`, cada uno con su
origen: tipo de cambio del BCRA (G30), tarifas del ejemplo de la clase 11 y horas del equipo (G37),
acción, descuento, vigencia de la oferta (7 días) y anualización (G32, G34). El ROI del modelo compara
su beneficio incremental con lo que agrega al costo de la regla (G40); el proyecto completo frente a no
contactar va aparte.

## Qué escribe

| Archivo | Contenido |
|---|---|
| `salida/economia.json` | todas las cifras; la clave de cada fila del registro va en su columna de cálculo |
| `salida/costos_beneficios_roi.csv` | la planilla de la 4.6: sección, concepto, valor, unidad, cálculo y fila del registro |
| `salida/cv_temporal.json` | rango anual por validación cruzada temporal, con sus 17 controles (E3A) |

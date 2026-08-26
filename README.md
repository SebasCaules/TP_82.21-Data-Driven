# Casa Óga — tablero de riesgo de pérdida de clientes

Entregable 1 de **82.21 Factibilidad de Proyectos Data Driven** (ITBA, 2C 2026), Grupo 2.
Tablero interactivo para el directorio y para Marketing, con el pipeline que produce cada
cifra que muestra.

| | |
|---|---|
| Sebastián Caules | 64331 · programación y organización |
| Tomás Ferreccio | 64934 · investigación de material |
| Matías Sola | 64322 · tratamiento de datos |
| Francisco Cattaneo | 64900 · investigación de fórmulas matemáticas |
| Juan Manuel Rilo | 64037 · consolidación de datos y fórmulas |

## Correrlo

```bash
npm install
pip install -r requirements.txt
npm run todo
```

`todo` encadena las cinco etapas y corta en la primera que falle:

| Comando | Qué hace |
|---|---|
| `npm run datos` | pipeline de punta a punta desde los 6 CSV. **Corta si una ancla no da exacto** |
| `npm run validar` | arnés: las anclas más la contingencia celda a celda y la grilla completa de filtros |
| `npm run golden` | golden files generados por Python desde `client_facts` |
| `npm run paridad` | compara la agregación de JS contra esos golden files |
| `npm run build` | bundle a un solo HTML autocontenido en `dist/` |

`npm run dev` levanta el servidor de desarrollo.

## Qué garantiza el arnés

Ninguna cifra llega a pantalla sin chequeo. La cadena se cierra en dos tramos, y los dos
usan `client_facts` como verdad independiente:

```
pipeline/validate.py   payload            == client_facts     201.900 chequeos
test/paridad.mjs       agregacion.js(payload) == client_facts  606.270 chequeos
```

Las 75 anclas cubren las cifras del wiki de la materia: 27.276 filas identificadas, ventana
2022-01-03 a 2025-12-29, 5.978 clientes con compra válida, 4.940 elegibles, 2.452 en riesgo,
ARS 94,9 M de exposición anual, la tabla RFM completa, el corte por región y categoría, el
embudo de campañas y la sensibilidad del proxy a su umbral.

La grilla de filtros se valida completa: 2.688 combinaciones × 25 cortes. No es una muestra.

## Arquitectura

```
pipeline/          Python. Toda la aritmética con riesgo de divergencia vive acá
  CONTRACT.md      el contrato de datos. Ningún módulo lo cambia
  loader.py        carga y limpieza, con el conteo de las cuatro etapas
  features.py      métricas por cliente, contingencia y lista de contacto
  series.py        recompra trimestral, embudo de campañas, consentimiento
  pack.py          empaquetado columnar del payload
  build.py         orquestación + las 75 anclas
  validate.py      el arnés
  golden.py        golden files para el test de paridad
src/               React. Solo filtra y suma
  agregacion.js    la única lógica de datos del navegador
  graficos.jsx     primitivas SVG, sin librería de gráficos
  pantallas/       una pantalla por gráfico
docs/              documento LaTeX de fórmulas y el registro de diseño
data/raw/          los 6 CSV de la cátedra, copiados para que el repo sea reproducible
```

El navegador no calcula recency, gap mediano, quintiles, RFM ni riesgo: recibe una tabla de
contingencia ya resuelta y hace `filter` y `sum`. Esa restricción es lo que hace validable la
grilla completa de combinaciones.

**Sin librería de gráficos.** Cada barra y cada línea es SVG generado a mano. Para cuatro
formas el peso no se justifica, y el control fino del alto es lo que permite resolver cada
pantalla sin scroll.

## El bundle

Un solo HTML autocontenido: datos embebidos, tipografías del sistema, cero CDN, cero
`fetch` en runtime. El mismo archivo se sirve por GitHub Pages y se abre con doble clic
desde el Finder. El aula puede no tener red.

## Los datos

Los 6 datasets son sintéticos, provistos por la cátedra. No hay datos personales reales.
El análisis los trata igual que a datos reales porque el caso lo pide: `Clientes.csv` trae
email, edad, género y provincia, y la Ley 25.326 art. 12 es parte del análisis del caso.
Por eso el pipeline corre local y el tablero nunca muestra nombre ni mail, solo código de
cliente.

## Lo que el tablero no afirma

- Que una campaña recupere los ARS 94,9 M. Es exposición, no recupero.
- Que el proxy mida churn. Es una regla operativa sobre inactividad.
- Que exista un modelo predictivo. Los bloques que lo anticipan van rotulados
  "Modelo predictivo (en desarrollo)".

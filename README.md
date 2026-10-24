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
pipeline/validate.py   payload            == client_facts     201.959 chequeos
test/paridad.mjs       agregacion.js(payload) == client_facts  606.270 chequeos
```

Las 134 anclas cubren las cifras del wiki de la materia: 27.276 filas identificadas, ventana
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
  build.py         orquestación + las 134 anclas
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

## Sitio publicado

GitHub Pages sirve cuatro cosas desde un solo sitio: `/` es una landing estática que elige
entre los entregables, `/e1/` es este tablero, `/e2/` es el de calidad de datos y `/e3/` es la
presentación del Entregable 3. La landing vive en `landing/index.html`, sin build propio.

| Comando | Qué hace |
|---|---|
| `npm run sitio` | arma `dist-site/` a partir de `landing/`, `dist/`, `dist-e2/` y `dist-e3/` (`scripts/armar-sitio.mjs`) |
| `npm run build:site` | corre `build`, `build:e2`, `build:e3` y `sitio` en orden |
| `npm run preview:site` | sirve `dist-site/` en local para revisar el sitio completo |

Los archivos que se abren por doble clic no cambian: `dist/index.html` (E1),
`dist-e2/index.html` (E2) y `dist-e3/index.html` (E3) siguen siendo exactamente lo que generan
`npm run build`, `npm run build:e2` y `npm run build:e3`. `dist-site/` es solo el empaquetado
para Pages y no se versiona.

## Presentación del Entregable 3 (`/e3/`)

La presentación del 27/10/2026 en el navegador: las 12 diapositivas del PPTX del equipo, en el
mismo orden y con el mismo texto, más los anexos A1 a A6 de respaldo. Donde ayuda a contestar
preguntas, la diapositiva se mueve: la tasa de éxito con y sin descuento (9), el largo y el
filtro de la lista (7), validación o entrenamiento (6) y la matriz de los 13 riesgos (11). Un
solo HTML autocontenido en `dist-e3/index.html`: se abre con doble clic, sin red.

El texto sale del vault y los números de las salidas de las partes; el navegador no calcula
(contrato en `pipeline/CONTRACT_E3.md`, diseño por diapositiva en `e3/DISENO.md`).

```bash
# en el vault, entregas/entregable-3/_build/F/presentacion/
python3 exportar_web.py --app <app>    # e3/src/contenido_e3.js y data/e3/*.json
# en la app
python3 -I pipeline/build_e3.py         # e3/src/datos_e3.js; corta si una de sus anclas no da
npm run build:e3                        # dist-e3/index.html
python3 scripts/verificar_e3.py         # desborde, consola, red, teclado y controles, a 5 resoluciones
```

`npm run dev:e3` la levanta en el puerto 5179. El verificador usa Playwright de Python
(`pip install playwright`); si no encuentra su Chromium, abre el Chrome instalado.

| Tecla | Qué hace |
|---|---|
| → ↓ Espacio Av Pág Enter | siguiente; en la 3 y la 6, el paso que sigue (el pie avisa «paso 1 de 3 · → sigue aquí») |
| ← ↑ Re Pág Retroceso | anterior; deshace un paso solo si a la diapositiva se llegó con →; en un anexo, vuelve a la diapositiva de la que se vino |
| Inicio · Fin | primera · última |
| número y Enter | ir a esa diapositiva |
| clic a la izquierda o a la derecha | anterior · siguiente, en todas las diapositivas |
| O | vista general |
| A | anexos |
| N | notas del orador: guion, quién lo dice y su tiempo |
| F · F5 | pantalla completa (F5 es lo que manda el botón de iniciar de un control remoto) |
| . · B | pantalla en negro; cualquier tecla vuelve |
| Esc | cierra lo abierto; nunca cambia la diapositiva ni muestra la vista general |
| ? | atajos |

Un control tocado con el mouse cambia y suelta el foco: → sigue pasando de diapositiva. Con Tab el
foco queda en el control, las flechas lo mueven (↑ y ↓ saltan entre las marcas del deslizante de la
9) y Esc lo suelta. La página va en la URL (`#3`, `#a2`). Al abrir en la portada, una pista de 4 s
recuerda los atajos.

Para presentar con notas: con la pantalla extendida, abrir la misma dirección en dos ventanas, una
en el proyector y otra en la laptop con N. Las dos se siguen (la que se abre toma la posición de la
otra) y se puede avanzar desde cualquiera. Con la pantalla duplicada, las notas se verían en el
proyector: N queda para ensayar.

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

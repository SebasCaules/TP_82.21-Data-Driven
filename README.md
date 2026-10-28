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

La presentación del Entregable 3 (Partes A a D) en el navegador, con el armazón del tablero del E2:
riel de capítulos a la izquierda, la pregunta de cada vista como encabezado, una banda de cifras con
la tarjeta de decisión y un gráfico. Siete vistas presentadas y siete anexos de respaldo (A1 a A7)
que se abren solo si preguntan. Los controles para explorar (precisión por método, simulador de la
tasa de éxito, acciones legales, riesgos, flujo y plan del piloto) llegan cerrados detrás de
«Explorar». La letra es la del E2 por un factor uniforme, k = mín(1,2; ancho / 1152; alto / 640) y nunca menos de 1. Un solo HTML
autocontenido en `dist-e3/index.html`: se abre con doble clic, sin red.

| # | Pregunta | Sale de |
|---|---|---|
| 1 | ¿Conviene anticipar a quien deja de comprar? | Partes A, B y C; veredicto integrado de la D 11.1 |
| 2 | ¿Quién se va? | A 2.1; C 7.3 |
| 3 | ¿Se puede hacer? | A 1.1 a 1.6 |
| 4 | ¿El modelo mejora a la regla? | B 4; C 7; D 8.1, 8.2 y 11.2 (el test) |
| 5 | ¿Se paga? | B 3 y 4; C 7.2 |
| 6 | ¿Es legal y seguro? | C 5 y 6 |
| 7 | ¿Qué decide María G. con el piloto? | D 9, 11.1 y 12 |

El texto y el guion de cada vista salen del vault y los números de las salidas de las partes; el
navegador no calcula (contrato en `pipeline/CONTRACT_E3.md`; el diseño, en la última sección de
`e3/DISENO.md`, «Decisiones (27/10, W1): el armazón del E2»).

```bash
# en el vault, entregas/entregable-3/_build/F/
python3 dossiers/guion-presentacion-e3/armar.py --app <app>   # guion, tiempos y capturas (lee las de abajo)
python3 presentacion/exportar_web.py --app <app>              # e3/src/contenido_e3.js y data/e3/*.json
# en la app
python3 -I pipeline/build_e3.py                     # e3/src/datos_e3.js; corta si una de sus anclas no da
npm run build:e3                                    # dist-e3/index.html
python3 scripts/verificar_e3.py --sin-esqueletos    # desborde, consola, red, teclado, notas y contenido, 5 resoluciones
python3 scripts/paridad_e3.py                       # estilos, cajas y reglas del E2, 4 resoluciones
# en el vault
python3 presentacion/verificar.py --web <app>/dist-e3/index.html   # cada número visible contra las Partes A a D
```

`npm run dev:e3` la levanta en el puerto 5179. Los verificadores usan Playwright de Python
(`pip install playwright`); si no encuentran su Chromium, abren el Chrome instalado.

| Tecla | Qué hace |
|---|---|
| → ↓ Av Pág | vista siguiente (Av Pág también con el foco en un control: es el control remoto) |
| ← ↑ Re Pág | vista anterior |
| Inicio · Fin | primera vista · último anexo |
| riel | lleva a cada vista o anexo |
| N | notas del orador debajo del tablero: el guion de la vista, quién lo dice y su tiempo |
| F · F5 | pantalla completa (F5 es lo que manda el botón de iniciar de un control remoto) |
| . · B | pantalla en negro; cualquier tecla vuelve sin cambiar de vista |
| I | imprime todas las vistas |
| Esc | suelta el foco de un control |

La vista va en la URL (`#v04`, `#a2`). Para presentar con notas: con la pantalla extendida, el
tablero en el proyector y, en la laptop, la misma dirección con `?notas` (o «Abrir en otra ventana»
desde el panel N). Las dos ventanas se siguen y se puede avanzar desde cualquiera.

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

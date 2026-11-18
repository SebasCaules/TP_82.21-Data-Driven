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

GitHub Pages sirve cinco cosas desde un solo sitio: `/` es una landing estática que elige
entre los entregables, `/e1/` es este tablero, `/e2/` es el de calidad de datos, `/e3/` es la
presentación del Entregable 3 y `/final/` la presentación final. La landing vive en
`landing/index.html`, sin build propio.

| Comando | Qué hace |
|---|---|
| `npm run sitio` | arma `dist-site/` a partir de `landing/`, `dist/`, `dist-e2/`, `dist-e3/` y `dist-final/` (`scripts/armar-sitio.mjs`) |
| `npm run build:site` | corre `build`, `build:e2`, `build:e3`, `build:final` y `sitio` en orden |
| `npm run preview:site` | sirve `dist-site/` en local para revisar el sitio completo |

Los archivos que se abren por doble clic no cambian: `dist/index.html` (E1),
`dist-e2/index.html` (E2), `dist-e3/index.html` (E3) y `dist-final/index.html` (presentación final)
siguen siendo exactamente lo que generan `npm run build`, `npm run build:e2`, `npm run build:e3` y
`npm run build:final`. `dist-site/` es solo el empaquetado para Pages y no se versiona.

## Presentación del Entregable 3 (`/e3/`)

La presentación del Entregable 3 (Partes A a D) en el navegador, con el armazón del tablero del E2:
riel de capítulos a la izquierda, la pregunta de cada vista como encabezado, una banda de cifras con
la tarjeta de decisión y un gráfico. Diez vistas: ocho de las Partes A a D y dos de la corrección al
consolidado del Grupo 5. Desde el 01/11 nada va detrás de un botón: lo importante está en su vista (el MVP en la
3, validación y test en la 4, el costo con modelo en la 5, el plan legal en la 6, el flujo y el plan del piloto en
la 8). Desde el 02/11 no hay anexos: lo vital de cada uno quedó en las vistas 4, 5 y 6. La letra es la del E2 por
un factor uniforme, k = mín(1,2; ancho / 1152; alto / 640) y nunca menos de 1. Un solo HTML autocontenido en
`dist-e3/index.html`: se abre con doble clic, sin red.

| # | Pregunta | Sale de |
|---|---|---|
| 1 | ¿Conviene anticipar a quien deja de comprar? | Partes A, B y C; veredicto integrado de la D 11.1 |
| 2 | ¿Quién se va? | A 2.1; C 7.3 |
| 3 | ¿Se puede hacer? | A 1.1 a 1.6 |
| 4 | ¿El modelo mejora a la regla? | B 4; C 7; D 8.1, 8.2 y 11.2 (el test) |
| 5 | ¿Se paga? | B 3 y 4; C 7.2 |
| 6 | ¿Es legal y seguro? | C 5 y 6 |
| 7 | ¿Qué decide María G. con el piloto? | D 11.1 y 12.2 |
| 8 | ¿Cómo funciona cada mes y en qué semana? | D 9.2 y 12.1 a 12.4 |
| 9 | ¿Qué le corregimos al Grupo 5? | planilla de correcciones al Grupo 5 |
| 10 | ¿Qué está bien y qué nos deja? | planilla de correcciones al Grupo 5 |

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
| Inicio · Fin | primera vista · última vista |
| riel | lleva a cada vista |
| N | notas del orador debajo del tablero: el guion de la vista y su tiempo |
| F · F5 | pantalla completa (F5 es lo que manda el botón de iniciar de un control remoto) |
| . · B | pantalla en negro; cualquier tecla vuelve sin cambiar de vista |
| I | imprime todas las vistas |
| Esc | suelta el foco de un control |

La vista va en la URL (`#v04`). Para presentar con notas: con la pantalla extendida, el
tablero en el proyector y, en la laptop, la misma dirección con `?notas` (o «Abrir en otra ventana»
desde el panel N). Las dos ventanas se siguen y se puede avanzar desde cualquiera.

## Presentación final (`/final/`)

La presentación final (24/11, 30 minutos, cinco integrantes) con el esqueleto y la estética de `/e3/`: el mismo
riel, la misma banda de tarjetas con la tarjeta verde de decisión, la misma letra y los mismos colores, el mismo zoom
uniforme y las mismas teclas. Un solo HTML autocontenido en `dist-final/index.html`.

Tiene payload propio: `pipeline/build_final.py` lee los JSON de los generadores de las partes en el vault y escribe
`final/src/datos_final.js` (DF). `DF.anclas` va por id del registro de cifras (`G67.con_descuento`): valor, unidad y
texto con las reglas de `e3/src/formato.js`. Todo el texto sale de `final/src/contenido_final.js` (CF), que importa DF
para interpolar las cifras en preguntas y rótulos: ni CF ni las vistas escriben un número. Desde el 17/11 CF trae
el contenido real: quince vistas en los siete bloques del canon (apertura, datos, modelo, economía, legal, gestión y
cierre), 23 minutos de exposición.

CF.BLOQUES es la única lista que ordena la presentación: cada bloque tiene id, título, rótulo del riel, integrante y
sus vistas; cada vista, id, rótulo del riel, pregunta, fuente, segundos y los textos que escribe. De esa lista salen
el recorrido, los grupos del riel, el número de cada vista (su posición) y los tiempos de las notas.

Las notas del orador (N) no se escriben en CF: desde el 18/11 (canon v1.3) salen del guion de la presentación.
`exportar_notas.py`, en `entregas/presentacion-final/_build/F/dossiers/guion-presentacion-final/` del vault, escribe
`final/src/notas_final.js` con las frases de `guion.py` que no se saltan en la versión de 15 minutos, y `Notas.jsx` lo
lee. El archivo queda versionado, así el tablero se construye sin el vault; `check_final_f6.py` lo compara con el guion
cuando el vault está. Para cambiar una nota se cambia el guion y se vuelve a exportar.

| Archivo | Qué es |
|---|---|
| `final/src/contenido_final.js` | CF: bloques, vistas, segundos y textos |
| `final/src/notas_final.js` | las notas del orador, exportadas del guion (no se edita a mano) |
| `final/src/vistas/index.jsx` | registro: deriva el recorrido, el riel y los tiempos de CF |
| `final/src/vistas/Vnn_*.jsx` | una vista por archivo, con `meta = { id }`; sin archivo, la vista es esqueleto |
| `final/src/App.jsx`, `Notas.jsx`, `MarcaInicio.jsx` | copias adaptadas de las de `/e3/` |
| `final/src/textos.js`, `TarjetaCifra.jsx`, `estilos_final.css` | textos de una vista, tarjeta de cifra y encabezado del gráfico, comunes a las vistas |
| `final/src/Plantilla.jsx` | la forma común de una vista: banda con decisión, qué mide, conclusión y un gráfico |
| `final/src/barras.jsx`, `svg.jsx` | BarrasH con el ancho de rótulo medido, y las piezas de texto de los SVG propios |

Las vistas importan los componentes del E2 y del E3 sin copiarlos (`Banda.jsx`, `TarjetaDecision.jsx`, `escala.js`,
`zoom.js`, `formato.js`, `texto.jsx`, `cifra.jsx`, `src/graficos.jsx`). `/final/` no toca `src/`, `e2/` ni `e3/`.

Para sumar una vista: se lista en el bloque que corresponde de CF (id, título, pregunta, segundos, textos) y se
crea `final/src/vistas/Vnn_Nombre.jsx` con `meta = { id }`, que lee sus textos con `textosDe(id)` y sus cifras de
`DF.anclas`. Para sumar una cifra: un `ancla(id, definición, valor, unidad, decimales, "número del documento")` en
`build_final.py`, que corta con código 1 si el valor del JSON no da el número que escribe el documento.
Para sumar o mover un bloque, se edita CF.BLOQUES: el riel, el recorrido y los tiempos lo siguen solos.

```bash
npm run dev:final                                    # servidor de desarrollo, puerto 5180
npm run build:final                                  # dist-final/index.html
python3 -I pipeline/build_final.py                   # DF desde los JSON del vault (corta si una cifra no cierra)
python3 -I scripts/verificar_final.py                # desborde, consola, red, teclado, notas, impresión y contenido
                                                     # contra CF y DF, 5 resoluciones; con --sin-esqueletos y
                                                     # --sin-muestra antes de presentar
npm run build:e2 && python3 -I scripts/paridad_final.py --vista v07   # letra, cajas y reglas del E2, 4 resoluciones
npx vite build --config scripts/vite.final-sobre.config.js   # el HTML para mandar, en dist-final-sobre/
python3 scripts/check_app_f4.py                      # todo lo anterior más /e3/ intacto y el anexo de fórmulas
python3 scripts/check_final_f6.py                    # contenido de /final/: lo anterior, el HTML del sobre, git, lista negra
                                                     # y notas iguales al guion; --textos RUTA escribe el texto de cada vista
```

Los dos verificadores terminan con `RESULTADO: OK` o `RESULTADO: FALLA`. Las teclas son las de `/e3/`. Las notas (N o
`?notas`) dicen además quién presenta la vista, el tiempo acumulado de su bloque contra el total del bloque y el
acumulado de la presentación contra los 23 minutos de exposición. No hay temporizador en vivo.

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

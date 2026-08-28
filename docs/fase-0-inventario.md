# Fase 0 — inventario de reconciliación

Salida obligatoria antes de spawnear workers. Fecha 2026-08-25. Entrega 01/09 (7 días).
Fuentes leídas: `CLAUDE.md`, DOCX Parte D, `guia-dashboard-directorio`,
`analisis-exploratorio-churn`, `perfilado-datasets-casa-oga`,
`relevamiento-respuestas-que-cambia`, `entregable-1`, los 6 `fuente-dataset-*`,
`wiki/index.md`, `entregas/entregable-1/25-08/consignas.md`, ficha F07 del BAN,
y `raw/clases/clase-04/Clase 4.md`.

## 0. Lo que apareció después de escribirse el runbook

`raw/clases/clase-04/Clase 4.md` (mtime 25/08 14:49) no existía cuando se escribió
`consignas.md`, que dice textual: "todavía no están el apunte del usuario ni las slides".
Por `CLAUDE.md`, lo dicho en clase pisa a la guía. Contenido:

| Lo que dice la clase 4 | Qué obliga |
|---|---|
| "Reporte: informa, cierra un ciclo. Dashboard: sostiene una decisión recurrente" | el artefacto se juzga como dashboard, no como presentación |
| "Va a tratar de mirar el futuro pero también el pasado para ver cómo vengo" | serie histórica + comparación contra corte anterior, no solo foto |
| "Se debe poder explorar, interactividad" | D3 deja de ser preferencia del equipo y pasa a criterio de cátedra |
| "Si armamos algo que muestra todo muy lindo se va a dejar de ver, debe haber movimiento" | un tablero estático de 8 láminas no cumple la consigna de la clase |
| "Las preguntas del diseño del dashboard son las que van a decidir las decisiones" | las 6 preguntas de negocio de la Parte D §1.2 son el índice de pantallas |

Consecuencia directa: **D3 y D4 dejan de ser decisiones discutibles del equipo y pasan a
ser requisito de la cátedra.** El corte móvil es la implementación literal de "ver cómo
vengo". Ninguna de las dos se recorta por tiempo.

## 1. Qué necesita la SPA · de dónde sale · qué falta

| Qué necesita la SPA | De dónde sale | Qué falta |
|---|---|---|
| Definición del proxy de churn | `analisis-exploratorio-churn`; verificada y reproducida | nada |
| Las 5 anclas de validación | recomputadas hoy: las cinco exactas | nada |
| 6 KPIs con fórmula, umbral, dueño y fuente | DOCX Parte D §2.1 | 2 de los 6 no son computables hoy (ver C-10) |
| 5 perfiles de usuario y su pregunta | DOCX Parte D §3.1 | nada |
| Filtros declarados | DOCX Parte D §4.1: mes de corte, región, categoría, segmento RFM | regla de asignación de región (C-04) |
| Cifras permitidas | guía, "Los números disponibles" (12 cifras) + tabla RFM | 2 en disputa (C-04, C-05) |
| Las 4 correcciones a la vista | guía, "Las 4 correcciones traducidas a instrucciones" | nada |
| 25 reglas de Knaflic con página + canon externo | guía, "Reglas de diseño" y "Canon externo" | nada |
| Protocolo (a)(b)(c)(d) de validación | guía, "Protocolo de revisión de salida de IA" | el arnés hay que escribirlo |
| Widget del BAN congelado | ficha F07 con tokens, tres anchos y contrato de datos de 6 campos | nada |
| Meta y baseline del indicador | relevamiento: base 8-9 %, meta 10-11 % primer año, dueño María G. | nada |
| Capacidad de contacto | relevamiento: 500 a 800 clientes/mes | nada |
| Esquema de los 6 CSV | `fuente-dataset-*` + `head -1` confirmado hoy | nada |
| Serie de IPC para deflactar | **no está en `raw/`** y ya no hace falta: el extracto no tiene deriva de precios (medición 27/08) | Q-02 cerrada |
| Costos y margen | no existen en los datasets | fuera de alcance, ya declarado en Parte D §5.1 |

## 2. Contradicciones encontradas

Trece. Cinco ya resueltas por cómputo hoy, cuatro se resuelven en el pipeline, cuatro son
de documento y van al integrado del 01/09.

| # | Contradicción | Estado |
|---|---|---|
| C-01 | 613 montos ≤ 0 (Parte D, perfilado) contra 608 (`analisis-exploratorio`) | **resuelta**: 613 en crudo, 608 después del dedupe de fila completa. Las dos fuentes tienen razón en etapas distintas; ninguna lo declaraba. El pipeline reporta las cuatro etapas |
| C-02 | Método de dedupe: `sort\|uniq` de la guía contra "250 transacciones duplicadas" del wiki | **resuelta**: son las mismas 250 filas. 250 `id_transaccion` duplicados en crudo y 0 después del dedupe de fila completa. Los dos métodos coinciden |
| C-03 | "Q5 duplica a Q1" (guía, regla 22) contra "casi cuadruplica" (Parte D, viz 3) | **resuelta**: 13,3 % contra 51,8 % = **3,89×**. Vale "casi cuadruplica". El texto de la regla 22 es un ejemplo de cómo se escribe un título, no una cifra del caso |
| C-04 | Amplitud del riesgo por región: 4,7 pp contra 2,8 pp | **al pipeline**: depende de cómo se asigna región a un cliente que compra en varias tiendas. Se define la regla, se calcula y se declara al pie del gráfico |
| C-05 | "Cae cuatro trimestres seguidos" (Parte D, viz 1) contra "de 19,0 % a 8,5 % en cinco trimestres" (guía) | **al pipeline**: la tabla del wiki saltea 2024Q3, que es donde se rompe la monotonía. Se recalcula la serie trimestral completa |
| C-06 | "La V1 queda fija al 31/12/2025" (Parte D §4.1 y §5.1) contra el corte móvil (D4) | **al documento integrado**: el DOCX no se toca (D8). La clase 4 respalda el corte móvil, así que la corrección va con argumento, no como enmienda |
| C-07 | Parte D §6.1 declara "HTML + SVG local, servido con `python -m http.server`" y el BOCETO apunta a un archivo de `demos/` | **al documento integrado**: la herramienta real es React + Vite bundleado a un HTML autocontenido, que además resuelve el `fetch` que la Parte D daba por pendiente |
| C-08 | `wiki/index.md:151` cita `raw/catedra/Respuestas Grupo2.xlsx`; la ruta no existe | **al wiki** (S-01): la real es `raw/Respuestas_Preguntas.xlsx` |
| C-09 | "Facturación histórica / años de historia" es ambiguo | **resuelta**: los años van desde la primera compra **hasta el corte**. Da 94,9 M exactos; hasta la última compra daría 170,6 M. Verificadas las dos |
| C-10 | Dos de los 6 KPIs de la Parte D no son computables hoy: cobertura de contacto y compra a 7 días sobre contactados | **al diseño**: no existe lista contactada. Van rotulados "Modelo predictivo (en desarrollo)" mostrando baseline (1,39 %) y capacidad (500-800), sin inventar un valor actual |
| C-11 | Base de campañas: 23.729 envíos (Parte D §5.1) contra 23.529 limpios (embudo del wiki) | **al pipeline**: se recalculan las dos y se declaran las dos al pie, como ya hacía la guía |
| C-12 | La guía y `entregable-1` describen el tablero como ocho pantallas HTML+SVG ya construidas y "56/56 chequeos" | **al wiki** (compuerta 6): esa sección documenta la implementación de `demos/`, fuera de alcance por §0. Se agrega la sección de la SPA sin borrar el registro histórico |
| C-13 | D1 (una pantalla por gráfico) contra Few, citado en la propia guía: "consolidated and arranged on a single screen so the information can be monitored at a glance" | **al diseño**: ver §4 |

## 3. Las 5 anclas, verificadas hoy

Corte 31/12/2025, sobre `app/data/raw/` (copia con md5 idéntico a `raw/`).

| Chequeo | Esperado | Obtenido |
|---|---|---|
| Filas identificadas (dedupe + cliente + monto > 0) | 27.276 | **27.276** |
| Ventana de fechas | 2022-01-03 a 2025-12-29 | **2022-01-03 a 2025-12-29** |
| Clientes con compra válida | 5.978 | **5.978** |
| Elegibles (≥ 3 compras) | 4.940 | **4.940** |
| En riesgo | 2.452 | **2.452** |

Derivadas verificadas en la misma corrida: exposición anual **94,9 M**, facturación
histórica en riesgo **262,8 M**, base con compra **550,2 M**, base anualizada **204,6 M**
(94,9 / 204,6 = 46,4 %, el relleno de la barra de F07), exposición al 30/09/2025 **80,1 M**
(la marca del corte anterior), ratio Q5/Q1 **3,89×**.

Etapas de limpieza: 50.250 crudo → 50.000 dedupe → 27.606 identificado → 27.276 monto > 0.

## 4. Alcance recortado contra el 01/09

Lo que entra completo, sin recorte: pipeline con las 5 anclas, las dos vistas (D2), corte
móvil (D4), todo interactivo (D3), bundle único offline, deploy a Pages, `.tex` de fórmulas,
arnés de validación, comité de diseño, propagación al wiki.

Cuatro recortes, todos con motivo:

| # | Recorte | Motivo |
|---|---|---|
| R-01 | Meses de corte: **25** (2023-12-31 a 2025-12-31), no los 37 posibles desde 2022-12 | 2022 es año de ramp-up declarado por el propio wiki ("arranca en enero casi sin volumen"). Un corte con menos de dos años de historia hace la exposición anualizada incomparable. 25 cortes dejan igual la comparación interanual del primer mes mostrado. Reduce el payload y la grilla de validación en un tercio |
| R-02 | La tabla de detalle de Marketing muestra el **top-N por pérdida esperada atado a la capacidad de 500-800**, con el total en riesgo declarado al lado, en vez de las 2.452 filas | es más fiel al pedido del negocio que un volcado completo: Sofía R. decide a quién contacta esta semana dentro de su capacidad. Además una lista completa no se resuelve sin scroll (D1) |
| R-03 | Sin deflactación por IPC | el motivo original era que no hay serie de IPC en `raw/`. La medición del 27/08 lo reemplaza por uno más fuerte: el precio unitario implícito del extracto baja 7,6 % entre 2022 y 2025 y va plano en las siete categorías, así que **no hay inflación que deflactar** |
| R-04 | Drill-down por tienda queda fuera, como ya declara la Parte D §6.1 ("fuera de alcance V1") | no se amplía el alcance ya entregado |

Un agregado, no un recorte, y es la respuesta a C-13: **el bloque de directorio abre con una
pantalla 00 consolidada** (BAN F07 + las tres tarjetas de apoyo + el estado del indicador
contra la meta), y recién después arranca la secuencia de un gráfico por pantalla. Es la
"single screen" que pide Few sin romper D1, cuesta una pantalla y le da al roleplay el
"monitored at a glance" que la definición de dashboard exige. La secuencia posterior es la
narrativa de Minto y Knaflic cap. 7.

## 5. Arquitectura de datos: la recomendación que va a compuerta 2

El runbook plantea dos opciones. Ninguna de las dos tal cual: la medición de hoy habilita
una tercera que las combina y elimina el riesgo de paridad.

| Opción | Tamaño medido | Riesgo |
|---|---|---|
| Precálculo total de combinaciones | ~5,8 MB con 3 dimensiones de filtro y 25 cortes | payload inviable para un HTML único |
| Cálculo en el navegador desde transacciones | 27.276 filas × 10 B = **0,27 MB** (0,37 MB en base64) | hay que reimplementar recency, gap mediano, quintilado y RFM en JS y probar paridad exacta |
| **Tabla de hechos por (corte × cliente), agregación en el navegador** | 25 × ~6.000 filas; con empaquetado (flag de riesgo en bitset, anualizado en uint32, quintil y RFM en un byte) queda **por debajo de 1 MB** | el navegador solo filtra y suma. Toda la aritmética con riesgo de divergencia queda en Python |

La tercera es la recomendación. Python calcula lo difícil y lo valida contra sus propias
anclas; el JS hace `filter` y `sum`, que es lo único que se puede probar de forma exhaustiva
sobre las 9.600 combinaciones (25 cortes × 6 regiones × 8 categorías × 8 segmentos, contando
el nivel "todos" de cada dimensión). Medición fina y decisión definitiva, en compuerta 2.

## 6. Preguntas abiertas

| # | Pregunta | Recomendación | Compuerta | Estado |
|---|---|---|---|---|
| Q-01 | ¿25 meses de corte (2023-12 a 2025-12) o los 37 desde 2022-12? | 25, por R-01 | 1 | abierta |
| Q-02 | ¿Deflactar por IPC o declarar los pesos como nominales? El wiki lo pide "antes del tablero del 01/09" y la Parte C ya comprometió importes deflactados en dos criterios de éxito, pero no hay serie de IPC en `raw/` y bajar una es traer un dato que el equipo no puede citar de una fuente propia | **ninguna de las dos.** La medición del 27/08 muestra que el extracto no tiene deriva de precios: deflactar fabrica una caída real del 95 % y "pesos nominales" afirma del dato algo que el dato no sostiene. Se declara lo medido y se le pide al negocio la base de precios de `monto_neto`. Enmienda 15 | 1 | **cerrada 27/08** |
| Q-03 | La tabla de detalle de Marketing, ¿top-N por capacidad (R-02) o las 2.452 filas paginadas? | top-N, por R-02 | 1 | abierta |
| Q-04 | El backlog de 8 épicas sigue sin entrar a ninguna entrega y el programa lo pide dentro del Entregable 1. ¿Entra a esta corrida o se resuelve aparte? | aparte: es documento, no tablero, y meterlo acá desenfoca la corrida a 7 días | 1 | abierta |

## 7. Lo que se dice una sola vez sobre las decisiones cerradas

Ninguna de las once decisiones parece equivocada. La única tensión real es C-13, y se
resuelve con la pantalla 00 sin tocar D1. D3 y D4, que eran las que más costaban, quedaron
respaldadas por el apunte de la clase 4: hoy son requisito de cátedra, no preferencia.

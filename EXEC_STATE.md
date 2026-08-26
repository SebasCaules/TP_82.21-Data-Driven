# EXEC_STATE — SPA dashboard Casa Óga

Runbook: `prompt-spa-dashboard.md` (sesión 164ed4bc, scratchpad).
Método: workforce (olas verificadas). Arranque 2026-08-25. Entrega **mar 01/09/2026**.

## Compuertas

| # | Compuerta | Estado | Notas |
|---|---|---|---|
| 1 | Alcance | **APROBADA** | 4 recomendaciones aceptadas: 25 cortes, pesos nominales, lista top-N, backlog fuera |
| 2 | Contrato de datos | **APROBADA** | 44/44 anclas, 201.819/201.819 chequeos, payload 1.089 KB, ola 1 cerrada |
| 3 | Diseño por pantalla | **APROBADA** | comité de 4 lentes: 72 hallazgos, 49 bloqueantes, 49 aceptados. 12 → 14 pantallas |
| 4 | Esqueleto navegable | **APROBADA** | 14 pantallas con datos reales, cero desborde |
| 5 | Verificación | **APROBADA** | auditoría adversarial: 63 hallazgos, 22 refutados, 29 confirmados y corregidos. 44 → 75 anclas |
| 6 | Cierre | **CERRADA** | push, deploy en verde, wiki propagado, `log.md` actualizado |

## Fase 0 — pasos

| Paso | Estado | Resultado |
|---|---|---|
| F0.1 lectura de fuentes obligatorias | DONE | 14 documentos + DOCX Parte D + apunte clase 4 |
| F0.2 verificación de las 5 anclas | DONE | 27.276 · 2022-01-03→2025-12-29 · 5.978 · 4.940 · 2.452 — las cinco exactas |
| F0.3 verificación de cifras derivadas | DONE | 94,9 M · 262,8 M · 550,2 M · 204,6 M · 80,1 M @30/09 · Q5/Q1 3,89× |
| F0.4 scaffold `app/` + copia de datasets (D5, D10) | DONE | `app/data/raw/` 6 CSV, md5 idéntico, `raw/` intacto |
| F0.5 inventario y contradicciones | DONE | `app/docs/fase-0-inventario.md` |
| F0.6 git init + remote (D6) | DONE | `app/` es la raíz del repo, remote a TP_82.21-Data-Driven (vacío, confirmado) |

## Ola 1 — pipeline (compuerta 2)

| Módulo | Dueño | Build | Verificación | Resultado |
|---|---|---|---|---|
| `loader.py` | W1 (sonnet) | OK | VERDE (sonnet high) | 10/10 conteos exactos al primer intento |
| `features.py` | W2 (sonnet high) | OK + bloqueo | VERDE (opus high) | el bloqueo de las 664 celdas era correcto: el contrato estaba mal |
| `series.py` | W3 (sonnet high) | OK + bloqueo | **ROJO** (opus high): 2 altas, 2 medias, 2 bajas | fix aplicado; las dos altas necesitaban `build.py`, integradas por N0 |
| `pack.py` | W4 (sonnet) | OK | VERDE (sonnet high) | clobbereaba `exposicion_por_corte`; punto de integración, resuelto por N0 |
| `build.py`, `validate.py` | N0 | OK | — | 44/44 anclas · 201.819/201.819 chequeos |

Findings de `series.py` y cómo se cerraron:

| Severidad | Finding | Cierre |
|---|---|---|
| alta | `estacionalidad` daba 16,6 M en diciembre contra el ancla de 29,0 M | base equivocada: el ancla es sobre venta total. `build.py` pasa `tx_total` |
| alta | `base_activa_anual.ventas` daba 68,6 M en 2022 contra 123,8 M | mismo origen. Se emiten las dos series con el % identificado al lado |
| media | `recompra_trimestral` usaba `MAX(fecha)` del run | parámetro `hasta`, cableado al corte de referencia |
| media | el embudo mezclaba bases: global sobre 23.529 y segmentos sobre 23.729 | se emiten las dos desagregaciones; cada una reconcilia con su total |
| baja | clic de "Inactivos 90d" 9,5 % contra 9,6 % del wiki | diferencia de base; las dos viajan y el pie declara cuál es cuál |
| baja | la serie traía 2025Q4 con `tasa=null` | el gráfico filtra nulos; queda declarado en el diseño |

## Ola 2 — comité de diseño (compuerta 3)

Cuatro revisores read-only en modelo N0 (opus, effort high), una sola ronda, formato fijo
`pantalla · regla violada · cita · severidad · corrección`.

| Lente | Hallazgos | Bloqueantes |
|---|---|---|
| Integridad del dato | 22 | 17 |
| HCI y arquitectura de información | 18 | 12 |
| Narrativa (Knaflic cap. 7 + Minto) | 15 | 11 |
| Frontend y accesibilidad | 17 | 9 |

**49 bloqueantes, 49 aceptados, 0 rechazados.** Ninguno se descartó por falta de cita.
Detalle en `docs/comite-adjudicacion.md`. Los cuatro que cambian lo que se afirma:

1. El gradiente de riesgo por quintil está inflado por la elegibilidad: 3,89× sobre el total,
   **1,27×** entre clientes comparables (Q1 tiene 32,5 % de elegibles contra 99,3 % de Q5).
2. "Campeones concentra la facturación con la tasa más baja" es **falso**: es el cuarto más
   bajo (25,3 %), detrás de Nuevos 0,0 %, Potenciales 3,9 % y Perdidos 20,4 %. Está en el DOCX
   entregado.
3. El excedente de capacidad **no es un grupo de control**: es por construcción el tramo de
   menor exposición. Contradice el criterio de éxito 5 de la Parte C entregada.
4. La lista ejecutable no son 800 clientes sino **568**: los otros 232 no tienen consentimiento.

## Ola 3 — las 14 pantallas (compuerta 4)

36 agentes, 0 errores. Un archivo por pantalla, ownership disjunto.

| | |
|---|---|
| Verificación adversarial | 14 · **6 VERDE, 8 ROJO** |
| Fixes aplicados | 8, todos re-verificados |
| Integración por N0 | 6 correcciones que cruzaban archivos |

Lo que encontraron los verificadores y no habría encontrado nadie mirando la pantalla:

| Pantalla | Finding |
|---|---|
| M0 | asumía que hay más de 800 clientes en riesgo. Al corte 2023-12 hay 397 y la nota imprimía "cobertura 125,9 % a 201,5 %" |
| D5a | calculaba la amplitud entre regiones incluyendo las que quedan en cero al filtrar, así que el título "2,8 puntos" era falso con cualquier filtro de categoría |
| D3 | faltaba la línea del 41,0 % general que el comité había pedido, y el título mezclaba bases con el filtro de segmento activo |
| D5b | no implementaba el drill-down que promete la Parte D §4.1 |
| D6 | tenía "23.729" escrito a mano teniendo el dato en la API |
| D4 | repetía en la bajada el mismo texto que ya pone el pie |
| M1 | afirmaba que las 800 salen por impresión, y era falso |
| D2 | el valor de la barra de Q5 y su nota de elegibles se pisaban 18 px |

Correcciones de integración (N0):

| # | Qué |
|---|---|
| I-1 | `BarrasH` expone `onBarra` y `referencia`. Cuatro pantallas replicaban su geometría interna para ubicar el overlay de clic y la línea de baseline: cualquier cambio de padding las desalineaba en silencio |
| I-2 | M1 exporta las 800 en CSV. La Parte D promete la lista "exportable" y la tabla en pantalla muestra solo las que entran sin scroll |
| I-3 | La tabla de M1 mide el alto de fila del DOM en vez de fijarlo: 12 filas desbordaban 144 px a 1152×640 y sobraba lugar a 1920×1080. Va en `position:absolute` por el mismo bucle de flexbox que ya había en los gráficos |
| I-4 | La tarjeta de recompra de D0 declara que es serie global: con Región=Cuyo el BAN se recalculaba y ese 8,5 % seguía siendo el del país |
| I-5 | Media query por **alto**: a 640 px el gráfico de D0 quedaba en 81 px. Se recorta cromo, no el gráfico |
| I-6 | El título de M0 se calcula. Con corte móvil la cobertura va de 100 % en dic 2023 a 20,4 % en dic 2025 |

## Documento de fórmulas (runbook §7)

`docs/formulas.tex` → `formulas.pdf`, **11 páginas, 28 ecuaciones numeradas, 9 secciones**.
Cada fórmula cita el archivo y la línea que la implementa y su valor al corte 31/12/2025.
Encontró un error en un comentario de `build.py`: decía "31 clientes y 2,8 %" mezclando el
conteo de los de menos de medio año con la participación de los de menos de un año. Son
**111 clientes** y 2,8 %. Corregido.

## Ola 4 — auditoría final adversarial (compuerta 5)

56 agentes: 5 auditores horizontales en modelo N0 (uno por capa del protocolo, más contrato
y accesibilidad) y un refutador independiente por cada hallazgo alto o medio.

| | |
|---|---|
| Hallazgos | 63 |
| Refutados | 22 |
| **Confirmados y corregidos** | **29** |
| Declinados con motivo | 1 |

Los auditores verificaron por su cuenta los cuatro números de estado que se les dieron y
confirmaron los cuatro. Los tres hallazgos que valían la corrida:

1. **Imprimir desde el menú del navegador daba una sola pantalla.** Las 14 hojas solo
   existían con la tecla `i`: faltaba el listener de `beforeprint`.
2. **La tarjeta del rango del umbral tenía sus cifras escritas a mano y no existía la línea
   de código que las generara.** Estaban declaradas como excepción autorizada, pero
   autorizarlas no crea el cómputo. Ahora se calculan en `features.sensibilidad_umbral`.
3. **El arnés probaba que el payload coincide con `client_facts`, no que `client_facts` sea
   correcto.** La tabla RFM y la asignación de región y categoría no estaban ancladas contra
   ninguna fuente externa. 31 anclas nuevas.

| | Antes | Después |
|---|---|---|
| Anclas | 44 | **75** |
| `validate.py` | 201.819 | **201.900** |
| `paridad.mjs` | 471.870 | **606.270** |

## Cierre (compuerta 6)

| Ítem | Estado |
|---|---|
| Repo `app/` pusheado | `main` en `SebasCaules/TP_82.21-Data-Driven` |
| CI | build y deploy en verde: el pipeline corre de cero en un clone limpio |
| Pages | `sebascaules.github.io/TP_82.21-Data-Driven`, cero subrecursos en producción |
| Offline | cero subrecursos, una sola petición |
| Wiki propagado | `analisis-exploratorio-churn`, `guia-dashboard-directorio`, `entregable-1`, `index`, `CLAUDE.md` |
| `log.md` | entrada del 2026-08-26 |
| Enmiendas | 10, en `entregas/entregable-1/25-08/enmiendas-para-el-integrado.md` |

## Decisiones N0

| # | Decisión | Motivo | Fecha |
|---|---|---|---|
| N0-1 | El apunte `raw/clases/clase-04/Clase 4.md` entra al contrato de diseño con rango superior a la guía | `CLAUDE.md`: lo dicho en clase pisa al programa y a la guía. Apareció después de escribirse `consignas.md` del 25/08 | 2026-08-25 |
| N0-2 | La limpieza reporta el conteo en las cuatro etapas (crudo → dedupe → identificado → monto>0) | resuelve la contradicción 613/608 sin pisar ninguna de las dos fuentes | 2026-08-25 |
| N0-3 | `EXEC_STATE.md` y la documentación de ejecución viven en `app/`, versionados | el repo es público y académico; el build se documenta solo | 2026-08-25 |
| N0-4 | RFM: R/F/M son `qcut` del `rank(method="first")`; `Nuevos` usa el conteo literal de compras, no el quintil F | reproduce 5 de 7 segmentos exactos y los dos que la guía cita (Campeones 1.014 / 159,9 M y "En riesgo" 1.018 / 95,7 %). Las otras variantes de desempate se alejan mucho más | 2026-08-25 |
| N0-5 | Arquitectura: tabla de contingencia por (corte × región × categoría × RFM × quintil); el navegador solo filtra y suma | medidas las tres opciones: precálculo total 5,8 MB, cálculo en navegador 0,37 MB con riesgo de paridad, contingencia 1.089 KB sin ese riesgo | 2026-08-25 |
| N0-6 | Las cifras anuales de ventas y la estacionalidad van sobre la base **sin** filtrar cliente (49.392 filas) | es la única que reproduce 123,8/295,8/349,7/225,0 M y diciembre 29,0 / febrero 16,5. Dos workers lo devolvieron como bloqueo en vez de forzarlo y tenían razón | 2026-08-25 |
| N0-7 | El denominador anualizado se deja completo y se declara `clientes_historia_corta` por corte | preserva el ancla 94,9/204,6 = 46,4 %; corregirlo la rompería. Decisión del usuario en compuerta 2 | 2026-08-25 |
| N0-8 | La contingencia tiene **664** celdas ocupadas, no 696 | 696 salió de un sondeo mío con la regla vieja de `Nuevos`. El worker lo devolvió como bloqueo; el contrato estaba mal y se corrigió | 2026-08-25 |
| N0-9 | En el desempate del comité gana la **regla citada del rulebook**, después la Parte D | es lo que fija el runbook §6. El ENV del comité había puesto la Parte D por encima de la guía; se corrige acá | 2026-08-25 |
| N0-10 | 14 pantallas, no 12: D5 se parte en región y categoría, M2 en embudo y segmentos | dos gráficos en una pantalla violan `dec-D1` y no cierran a 1152×640 | 2026-08-25 |
| N0-11 | Los ejes y columnas dicen **"exposición anual (ARS)"**, no "pérdida esperada" | no hay ninguna probabilidad aplicada; el término sugiere una esperanza estadística que no existe | 2026-08-25 |
| N0-12 | El color de énfasis pasa a **azul-700 `#22456f`** y el terracota queda reservado para la excepción | el mismo rojo marcaba "mirá acá" y "esto está mal": dos significados en un canal. Paleta 2a del mockup de direcciones, que es la que el propio mockup recomienda | 2026-08-25 |
| N0-13 | El pie de dos líneas sale de la pantalla y se imprime | corría idéntico en las 14 vistas y se volvía invisible; en papel es donde hace falta. Pedido del usuario | 2026-08-25 |
| N0-14 | La cabecera (título + bajada) tiene **alto fijo** de 2 + 2 líneas con recorte duro | es la única forma de garantizar que el lienzo mida igual con cualquier filtro puesto, que es lo que el usuario pidió. El detector de desborde marca el título que no entra | 2026-08-25 |
| N0-15 | `Linea` **trunca el eje Y** cuando el cero se come más de una cuarta parte del alto, y lo declara con marca de corte y rótulo | la regla 4 ("toda barra arranca en cero") habla de barras: el largo de una barra ES la cifra, la altura de un punto no. Truncar sin decirlo sí sería falsear; truncar declarándolo es encuadre. Pedido del usuario | 2026-08-25 |
| N0-16 | El corte por segmento de campaña se presenta con **intervalo de Wilson al 95 %**, calculado en el pipeline y anclado | cinco barras entre 0,96 % y 1,39 % se ven iguales: la conclusión quedaba en el título. Con el intervalo, el solapamiento se ve. 11 anclas nuevas (86 en total) | 2026-08-25 |
| N0-17 | Los filtros dejan el `<select>` nativo por un listbox propio | el pedido es un icono por VALOR (AMBA, Muebles, Campeones, Q4) y `<option>` no admite SVG. Se reimplementan teclado y ARIA a mano para no perder accesibilidad | 2026-08-25 |
| N0-18 | El favicon es la opción **4b** del mockup de direcciones ("la casa que se apaga"), inlineada como data URI en `index.html` | pedido del usuario. Va inline y no como archivo suelto porque el build es de un solo archivo y sin red: un `<link>` a un `.svg` habría dejado el único fetch del bundle. Usa la misma paleta que N0-12, con el terracota en la barra corta (la porción perdida). Fuente en `src/favicon-casa.svg`. La misma forma se repite como marca al lado del nombre en la lateral (`Marca` en `App.jsx`), ahí sin el rect de papel: sobre `--lat` se leería como una baldosa | 2026-08-25 |
| N0-19 | En los seis choques entre `docs/diseno-pantallas.md` y la implementación, **manda el código**: se actualiza el documento, no las pantallas | decisión del usuario en la ejecución de los fixes de auditoría. Los comentarios del código dan el motivo de cada desvío (el eje de D3 es pesos, una línea de tasa sería un eje Y secundario encubierto) y el documento ya venía desactualizado en varias fichas | 2026-08-26 |
| N0-20 | La regla "nada scrollea" vale **dentro** del rango declarado (1152×640 a 1920×1080). Fuera del rango, la guarda pasa a banner y el cuerpo scrollea, en vez de ocultar el tablero entero | a 200 % de zoom el viewport CSS cae a ~720×450 y hoy no se ve nada de nada, que es una falla de WCAG 1.4.4. Scrollear fuera del rango soportado no rompe ninguna promesa: la promesa está acotada al rango | 2026-08-26 |
| N0-21 | El **valor** de un token vive en `estilos.css`; su **uso dentro del SVG** vive en `graficos.jsx`. Ningún worker cruza esa frontera | dos hallazgos de contraste (A11Y-02, A11Y-11) se arreglan a los dos lados; sin la frontera, dos workers se pisan el mismo archivo | 2026-08-26 |
| N0-22 | `src/Ban.jsx` se borra. Las clases `.ban-*` de `estilos.css` se conservan | el componente no lo monta ninguna pantalla desde que D0 desarmó la ficha F07 en zonas, pero D0 sigue usando `.ban-track`, `.ban-sc` y `.ban-scrow`. Muere el componente, no los estilos | 2026-08-26 |
| N0-23 | ~~El semáforo de "Clientes en riesgo" se monta en `D0Consolidada.jsx`~~ **Revertida el 26/08/2026: la pastilla sale de D0 por pedido del usuario.** El umbral sigue viajando en el payload sin que ninguna pantalla lo consuma | `umbral_en_riesgo` ya viaja en el payload desde `build.py`: lo que falta es consumirlo. El hallazgo se archivó contra el pipeline pero el arreglo es de pantalla | 2026-08-26 |
| N0-24 | Las tildes de las categorías se corrigen en la **capa de display del navegador** (`agregacion.js`), no en el pipeline | `validate.py` mapea los valores crudos del CSV a través de `dims.categoria`: renombrarlas ahí rompe los 201.900 chequeos. El empaquetado usa índices, nunca la etiqueta, así que corregirlas al leerlas es seguro y alcanza a las cuatro pantallas que las muestran | 2026-08-26 |
| N0-25 | El gris de las series sin énfasis prioriza separarse **del fondo**, no del azul de énfasis | son objetivos incompatibles y está probado: papel `#eceae5` contra acento `#22456f` da 8,13:1, y para que el gris quede a 3:1 de los dos haría falta un producto de 9. El viejo `#8891a3` daba 3,08 contra el énfasis y 2,64 contra el papel; el nuevo `#767f91` da 3,35 contra el papel y 2,43 contra el énfasis. 1.4.11 pide la marca contra su fondo, y el énfasis además ya lo cargan la etiqueta en negrita y el valor en tinta | 2026-08-26 |

## Ownership de archivos

Se asigna antes de spawnear cada ola. Reservados al orquestador (N0) en todo momento:
`app/EXEC_STATE.md`, `app/src/main.jsx`, `app/src/App.jsx`, `app/src/graficos.jsx`,
`app/src/estilos.css`, `app/src/Filtros.jsx`, `app/src/LineaTiempo.jsx`, `app/src/Iconos.jsx`,
`app/src/Semaforo.jsx`, `app/src/agregacion.js`, `app/src/fit.js`,
`app/src/pantallas/index.jsx`, `app/vite.config.js`, `app/package.json`, `app/pipeline/**`,
`app/test/**`, `wiki/**`, `entregas/**`, `CLAUDE.md`.

## Fixes sugeridos (S-nn)

| # | Fix | Superficie | Origen | Cuándo |
|---|---|---|---|---|
| S-01 | `wiki/index.md:151` apunta a `raw/catedra/Respuestas Grupo2.xlsx`, ruta inexistente. La real es `raw/Respuestas_Preguntas.xlsx` | wiki | runbook §2 | compuerta 6 |
| S-05 | El wiki declara Campeones con ARS 159,9 M de facturación y valor medio 157.655. El cálculo reproducible da **160,0 M** y 157.806: es el mismo cliente de diferencia en el desempate de quintiles que mueve Perdidos 1.128/1.129 y Potenciales 591/590 | wiki | verificación de compuerta 5 | compuerta 6 |
| S-03 | La Parte D §4.1 viz 2 afirma que Campeones tiene "la tasa más baja" de riesgo: es falso, es el cuarto más bajo | entregas | comité, lente de dato | enmienda en el documento integrado del 01/09 |
| S-04 | El criterio de éxito 5 de la Parte C llama "grupo de control natural" al excedente de capacidad; es el tramo de menor exposición, no un control | entregas | comité, lente de dato | enmienda en el documento integrado del 01/09 |
| S-06 | Un worker del cluster C1 editó `src/App.jsx` y `index.html`, dos archivos que su ENV declaraba prohibidos. **La atribución del favicon a la "opción 4b del mockup" era CORRECTA**: el mockup ganó los turnos 3, 4 y 5 entre mi primera lectura (que solo tenía 1 y 2) y la del worker, y 4b es "la casa que se apaga". Yo la marqué como inventada y la borré, contra un mockup viejo que tenía en contexto; después la restauré. Lección: **una cita se verifica contra la fuente de HOY, no contra la copia que uno leyó antes.** Del hallazgo original queda en pie solo la parte de ownership: el ENV tiene que listar `index.html` entre los archivos del orquestador | app | verificación final | hecho |
| S-07 | El detector de desborde no ve un gráfico que directamente no montó: `grafico-aplastado` recorre `.lienzo svg` y con cero SVG no reporta nada. Con la pestaña oculta el `ResizeObserver` no dispara y `Lienzo` nunca pinta, así que un barrido headless da "todo OK" sobre pantallas vacías. Agregar un chequeo de "la pantalla declara lienzo pero no tiene SVG" | app | verificación final | antes del 01/09 |
| S-02 | El backlog de 8 épicas sigue sin entrar a ninguna entrega (checklist de `entregable-1` abierto). Lo pide el programa dentro del Entregable 1 | entregas | `entregable-1.md` | fuera de alcance de esta corrida, antes del 01/09 |

## Ejecución de los fixes de auditoría (2026-08-26)

Plan: `docs/plan-fixes-auditoria.md`. Rama: `fix/auditoria-diseno` desde `9dcb97c`.
72 hallazgos verificados, 23 unidades de trabajo, 4 olas.

| Paso | Estado | Commit | Notas |
|---|---|---|---|
| F0 · reconciliación | DONE | | 27 hallazgos re-adjudicados contra HEAD: 21 `sigue`, 6 `mutado`, 0 muertos |
| Ola 1 · sustrato (`estilos.css`, `graficos.jsx`, `Semaforo.jsx`) | DONE | | 21 cerrados, los 3 VERDE al primer intento. DVZ-09 queda para M2a; DVZ-05 baja a D0 y D4 |
| Ola 2 · controles (`App.jsx`, `Filtros.jsx`, `LineaTiempo.jsx`, `fit.js`, `Ban.jsx`) | DONE | | 11 cerrados. `App.jsx` y `fit.js` los hizo N0; `Ban.jsx` se borró |
| Ola 3 · las 14 pantallas | DONE | | 31 cerrados en 6 workers. 5 de 6 VERDE; el ROJO de `cortes` fue un falso positivo mío (le di al builder la instrucción de saltear NAR-05 y no al verificador) |
| Ola 4 · documentos | DONE | | 7 cerrados: los 6 choques doc/código de N0-19 más la matriz de resoluciones |
| Cierre · gates + barrido visual | DONE | | `npm run todo` verde (92 anclas, 201.917 y 606.270 chequeos). Las 14 vistas con `__fit()` limpio a 1152×640 y a 1440×900 |

**70 de 72 hallazgos cerrados**, uno abierto y uno descartado por el usuario. El barrido visual del cierre encontró dos cosas que la
verificación por unidad no vio, las dos ya corregidas: la bajada nueva de D3 no entraba en las
dos líneas del clamp, y mi propio arreglo de `fit.js` levantaba un falso positivo en las 14
vistas porque comparaba la marca de la lateral contra la barra de otra columna.

| S-08 | DVZ-09: la última barra del embudo de M2a mide unos 9 px sobre 827. No se arregla con un piso de ancho: agrandar una barra que vale 1,2 % es exactamente el lie factor que la regla 4 prohíbe. Queda mitigado por el título, que ahora dice la cifra en palabras ("De 23.529 envíos, 284 terminan en compra a 7 días"). Si el equipo lo quiere resuelto en el dibujo, la salida es desdoblar el embudo en dos paneles de escala propia | app | auditoría de diseño 26/08 | abierto, no bloquea |

| S-09 | OV-5: el semáforo de "Clientes en riesgo" se montó en D0 y se sacó a pedido del usuario. `meta.umbral_en_riesgo` ([38, 42]) vuelve a viajar en el payload sin que ninguna pantalla lo consuma, así que de los cuatro KPIs con semáforo de la Parte D sigue habiendo uno solo en pantalla. Si la cátedra pregunta, esa es la respuesta | app | decisión del usuario 26/08 | cerrado por decisión |

| S-10 | DVZ-03 se reabre y se cierra. La auditoría lo había levantado (D6 ordenaba cinco barras cuyos intervalos se solapan todos) y un verificador lo refutó apoyándose en que el contrato prescribía las barras y en que N0-16 gobierna la vista 13. Las dos cosas eran ciertas, pero la refutación no llegó a preguntarse si el gráfico sostenía lo que la pantalla afirma. Reabierto por el usuario el 26/08 y resuelto: D6 pasa a punto con intervalo, con la banda de la vara y el lugar del score reservado | app | usuario 26/08 | cerrado |

# Diseño del tablero E2 — «Calidad de datos: decisiones antes y después»

Contrato de las 12 vistas (decisión N0-2, `wiki/entregables/plan-entregable-2.md`). Audiencia:
el directorio de Casa Óga, en la presentación del 29/09. Pregunta que responde el tablero
entero: **qué decidió el equipo sobre los 13 archivos y cuánto cambia el resultado con cada
decisión**. Datos: solo `e2/src/datos_e2.js` (`D2`, contrato `pipeline/CONTRACT_E2.md`).

## Reglas transversales (heredadas del E1, `app/docs/diseno-pantallas.md`)

1. **Una vista, un hallazgo.** El título (`h1.titulo`, una línea, ≤ 74 caracteres: a 1440 × 900 la letra crece más que el ancho y 80 ya parte en dos)
   afirma el hallazgo con la cifra, y la cifra sale de `D2`, nunca escrita en el JSX:
   `Los duplicados suben el riesgo de ${antes.pct} % a ${despues.pct} %`. (24/09) La única cifra
   que va escrita como texto es el umbral de elegibilidad, «3 compras o más» (V04, V10, V11): es
   la definición de la métrica y `D2` no la trae.
2. **Antes y después sobre el mismo corte**, lado a lado: (24/09) en el par (`.ban-par`), ANTES a
   la izquierda (`.par-antes`, gris) y DESPUÉS a la derecha (`.par-despues`, cifra en tinta y
   rótulo azul); en las series, `--antes` (gris, punteada) y `--despues` (azul). Terracota
   `--terra` solo para marcar el problema (filas duplicadas, meses con cobertura no confirmada,
   envíos sin consentimiento). Nunca color solo: rótulo de texto y forma distinta además del
   color. (24/09) La trama marca la parte que queda afuera o sin confirmar, nunca la parte sana:
   sin consentimiento y con baja en la lista de 800 (V06), el excedente de Clientes después del
   corte y los meses con cobertura no confirmada sobre Transacciones (V02), las filas de soporte
   marcadas (V09, `BarraMini` con `tramaEn="parte"`) y la prueba aparte (V11). En V08 (las barras
   que bajan, como en el E1) y en V11 (ajuste y prueba) la trama es además forma para separar
   barras vecinas.
3. **Un par de números grandes** (`.ban-par`) arriba a la izquierda cuando la decisión mueve
   una cifra; debajo, el gráfico en un `<Lienzo>` de `src/graficos.jsx`; a la derecha o al
   pie, la **decisión en una frase** y la **justificación en una frase**, tomadas de
   `D2.decisiones` (campos `decision`, `justificacion`), con el id `DC-nn` visible. Desde el 22/09 la
   tarjeta es una sola, `e2/src/TarjetaDecision.jsx`, igual en todas las vistas: primero `llano` (la
   decisión dicha para el directorio, escrita en `build_e2._llano`), después la regla del wiki y la
   justificación.
   (24/09) El par gris → flecha → tinta va solo cuando la decisión mueve el mismo indicador sobre
   la misma base: clientes, riesgo y exposición en V04, unidades en V05, la cadena 568 → 567 → 549
   y los envíos de DC-05 en V06, los envíos con oferta en V07, E1 → después en V10. Las lecturas
   paralelas (la misma cifra medida en dos fechas, dos usos del mismo registro, la misma serie con
   y sin filas marcadas, dos indicadores que no se restan) van con `e2/src/ParDoble.jsx`: las dos
   cifras en tinta y sin flecha; si la segunda es una sensibilidad (otro corte), lleva borde y aro
   punteados (V02, V03, V10; sin esa marca en V06, V07 y V09).
   (24/09) En pantalla la tarjeta muestra el llano y la justificación; la regla del wiki
   (`.dec-regla`) queda solo en la hoja impresa (`estilos_e2.css`, `@media screen`). La tarjeta
   que es hija directa del lienzo mide lo que su texto y no se estira a un bloque blanco. Cuando
   la justificación del payload contradice el título, la vista la cambia por un «Por qué» propio
   (`sinJustificacion`), con las cifras, si las hay, tomadas de `D2`: V04, V05 y V08 («Qué
   vimos»); en V07 la tarjeta de DC-13 cuenta sus dos casos.
4. **Pie fijo por vista** (`.pie-vista`): corte y base ("corte 31/12/2025 · base: 50.000
   filas únicas") y la fila del registro (`D01`). (24/09) La salvedad de una cifra en revisión va
   en su rótulo o en su `kpi-sub`, al lado de la cifra que califica: «en revisión» en V02, V03,
   V04, V06 y V10, y los meses con cobertura no confirmada en el rótulo del par de V09. Lo mismo la
   de la exposición (facturación proyectada, no es recupero; pesos del extracto, sin ajustar por
   inflación), debajo de la cifra en V04 y V10. El pie queda para corte, base y registro, y a lo
   sumo la repite. Los meses que marca DC-09 se nombran siempre igual, «cobertura no confirmada»,
   como los define V03. En V01 y V12 el pie es un solo renglón, y el registro y la fuente van en su
   `title`.
5. Primitivas: `BarrasH` para categorías, `Linea` para series de tiempo, `PuntosIC` para
   tasas con intervalo, `BarraTramos` para composiciones; nada de tortas, 3D ni eje doble;
   barras desde cero; `<title>` nativo en cada marca con etiqueta, valor y base. (24/09) Cuando la
   primitiva del E1 no alcanza, la vista dibuja su propio SVG con las mismas convenciones (V02,
   V03, V05, V06, V08, V09, V11); `src/graficos.jsx` solo suma props opcionales que dejan el E1
   igual (`tramaEn` de `BarraMini`). `e2/src/LineaIndice.jsx` es la primitiva local del E2 para
   series en veces el nivel de un año base: todas van en la misma unidad y sobre un solo eje, así
   que no es eje doble (V08).
6. Sin filtros ni selector de corte. Navegación por riel lateral y teclado. Impresión: una
   hoja A4 apaisada por vista. (24/09) En la tabla de V01, el número de vista de cada fila lleva a
   esa vista.
7. Cada vista es un archivo `e2/src/vistas/Vnn_nombre.jsx` que exporta `default function`
   y `meta = { id, corto, titulo, pie }` (el `h1` y `meta.titulo` son el mismo texto) y lee `D2`
   de `e2/src/datos_e2.js`. (24/09) `App.jsx` le pasa `irA`, que solo usa V01; en la hoja impresa
   no llega. Solo el orquestador toca `e2/src/vistas/index.jsx`. El riel sigue el orden de los
   archivos, V01..V12, así que el número de vista que citan los textos («vista 3») es el del id.
8. Clases del E1 que `fit.js` reconoce: `.pant`, `.titulo`, `.lienzo`, `.tarjeta`. Cada
   vista arranca con `<section className="pant vNN">`.
9. **Escala de letra (24/09).** El texto HTML usa los tokens de `estilos_e2.css`, que crecen
   desde 1152 px de ancho: `--e2-txt` (la decisión en llano, 12 → 14,7 px a 1920), `--e2-txt2`
   (justificación, `kpi-sub`, `kpi-base`, `.e2-nota` y rótulos que son frases, 11,5 → 13,8 px) y
   `--e2-rot` (rótulos mono cortos: `kpi-lbl`, `par-lbl`, cabeceras de tabla, 10,5 → 12,4 px). La
   mono en mayúsculas queda para rótulos cortos; un rótulo que es una frase va en sans
   (`.kpi-lbl.frase`). Los SVG propios del E2 multiplican sus `fontSize` por el factor `k` de
   `useEscalaTexto` (`e2/src/escala.js`): 1 hasta 1280 px, lineal hasta 1,4 desde 1792 px, y 1 en
   la hoja impresa (`ImpresionCtx`). Las primitivas de `src/graficos.jsx` no lo usan, para no
   cambiar el E1. Las tablas de V01 y V12 y las cifras de V10 llevan su propio `clamp`.
10. **Encabezado (24/09).** Sobre cada vista, `.e2-enc` (`App.jsx`) dice «Vista N de 12 ·
    pregunta» y, a la derecha, el corte fijo y la cantidad de archivos; ya no repite la marca del
    riel. La pregunta es la columna Pregunta de la tabla de abajo, copiada en `PREGUNTA` de
    `e2/src/vistas/index.jsx`: si cambia una, cambia la otra. El encabezado no se imprime.

## Las 12 vistas

| id | Archivo | Título (plantilla; las cifras vienen de D2) | Pregunta | Lienzo | Datos |
|---|---|---|---|---|---|
| V01 | `V01_QueDecidimos.jsx` | «15 decisiones: 11 cerradas y 4 esperan una respuesta de Casa Óga» (24/09; esperan = las que tienen un pedido `DC-` en `vistas.V12.pedidos` más las «pendiente del negocio», cerradas = el resto; ya no cuenta `vistas.V01.por_estado`) | ¿qué se decidió y con qué alcance? | (24/09) sin gráfico: leyenda de los cuatro estados con el camino a los pedidos de la vista 12, y tabla de 15 filas a todo el cuerpo con cinco columnas: id (el archivo va en su `title`), qué encontramos, qué decidimos (el `llano`; la regla va en el `title`), estado y vista (el número lleva a esa vista). Cada celda de texto entra en hasta dos renglones (`.clamp2`) y la letra crece con la pantalla. Estado en pastilla propia, símbolo + texto + color: ● aplicada, ◐ declarada, ◑ a confirmar (aplicada con pedido abierto en V12), ○ pendiente. Sin tarjetas de conteo ni pares. El estado visible sale de `e2/src/estados.js`, que también usa la tarjeta de decisión: una decisión «a confirmar» dice lo mismo en V01 y en su vista | `decisiones`, `vistas.V12.pedidos` |
| V02 | `V02_Ventana.jsx` | «Medir al 31/08/2026 inflaría el riesgo a 85,2 %; al corte común es 49,6 %» (24/09; ya no dice que el riesgo «baja»: el 85,2 % no es un antes que la decisión corrigió) | ¿por qué un corte común? (24/09) | (24/09) `ParDoble` del riesgo según la fecha de medición, sin flecha: 49,6 % al corte común («la cifra del E1 · en revisión (vista 3)») y 85,2 % si se midiera al 31/08/2026, con la marca punteada de sensibilidad; línea de tiempo de los 11 archivos que traen fecha, ordenados (los del análisis por fecha final, después los de contexto), sobre un eje ene-2025 a sep-2026 recortado a la izquierda (una nota dice en qué año empieza cada archivo); franja terracota tenue de los meses sin ventas, con la plaqueta «8 meses sin ventas»; línea del corte común sólida en `--despues` y la del 31/08/2026 punteada; Clientes sólida hasta el corte y el excedente en trama terracota (fechas inválidas, DC-07); Tiendas hueca (fechas de apertura) y los dos de contexto huecos y punteados; trama clara de cobertura en revisión sobre Transacciones (meses de V03); los dos archivos sin fecha van en una nota; tarjeta DC-08 en una columna angosta a la derecha | `vistas.V02`, `vistas.V03`, `vistas.V10.e1`, `meta.ultima_venta` |
| V03 | `V03_Cobertura.jsx` | «Cuatro meses de 2025 con menos del 60 % de las operaciones de un año antes» (22/09; 24/09: el año sale del último mes de la serie) | ¿qué meses no se pueden leer? | (24/09) arriba, `ParDoble` del riesgo según la fecha de medición, sin flecha: 50,4 % «al 31/12/2025 · en revisión · duplicados unidos» y 38,5 % «al 31/08/2025 · antes de los meses sin confirmar», con una nota al lado (no es un antes y un después; ¿se vendió menos o faltan filas?; lo confirma Casa Óga, pedido DC-09, vista 12); gráfico propio de operaciones por mes, ene a dic: el año anterior (`n_prev`, gris) y el último año (`n`, tinta), sin `--antes`/`--despues` porque ninguna decisión mueve la serie; línea del 60 % del año anterior en terracota punteada; los meses de `meses_flag` en franja terracota, con su valor rotulado y su nombre en terracota en el eje, y diciembre con la cifra contra un año antes; tarjeta DC-09 a todo el ancho. Sin par de exposición (lo da V10) | `vistas.V03`, `meta.umbral_cobertura`, `vistas.V12.pedidos` |
| V04 | `V04_Duplicados.jsx` | «Unir 348 números de cliente duplicados sube el riesgo de 49,6 % a 50,4 %» (24/09: lo que se une son números de cliente) | ¿qué cambia al unir identidades? | `.ban-par` con clientes, riesgo y exposición antes → después; (24/09) «número de cliente» antes y «persona» después; «en revisión» en el rótulo de riesgo y de exposición; debajo de cada par, la cuenta de clientes, los conteos de los que sale cada % y que la exposición no es recupero, en pesos del extracto sin ajustar por inflación; `BarrasH` de personas por cantidad de números de cliente, pegada a su subtítulo, con un tope de alto que crece con la pantalla; tarjeta DC-04 con un «Por qué» escrito en la vista (el del payload daba a entender que el riesgo baja) | `vistas.V04` |
| V05 | `V05_Devoluciones.jsx` | «1.324 unidades devueltas se contaban como vendidas: +1,2 %» (24/09; las 613 filas y 608 devoluciones van en la tarjeta) | ¿cómo se cuentan las devoluciones? | par de unidades antes (doble conteo) → después (DC-02) y tarjeta DC-02 con un «Por qué» propio, las filas del archivo contra las devoluciones distintas (y cuántas están registradas dos veces) y el desfase de fechas; (24/09) debajo, a todo el ancho, `Linea` doble propia de la vista: devoluciones por mes según la fila negativa (gris punteada) y según `fecha_devolucion` (azul), con la leyenda en el renglón del rótulo, una lectura calculada arriba (cuánto mueve la fecha en un año y en un mes) y los meses de DC-09 en franja terracota, con la línea de después punteada en ese tramo. Sin gráfico de motivos | `vistas.V05`, `vistas.V03.meses_flag` |
| V06 | `V06_Envios.jsx` | «De la lista de 800 se puede escribir a 549, no a los 568 del E1» (22/09: el 568 → 567 → 549 lo mueven DC-04 y las bajas, no DC-05; 24/09: el 800 sale del nombre de la clave `lista_800`) | ¿a quién se le puede escribir? | (24/09) a la izquierda, barra de composición de los 800 dibujada en la vista (un `<title>` por tramo, crece con la pantalla): contactables sin baja / con baja (rótulo arriba de su tramo) / sin consentimiento en trama terracota; debajo, la cadena 568 → 567 → 549 al tamaño del par, más grande que las cifras de la derecha, con una frase por cifra y «en revisión»; a la derecha, los envíos a clientes que hoy figuran sin consentimiento (7.078, 30,1 %) en terracota con trama, y las bajas en dos usos del mismo registro con `ParDoble`, en tinta y sin flecha (filtro de contacto 1.211, análisis de compras 812); abajo, DC-05 en una tarjeta compacta (envíos 23.729 → 23.529 y el embudo en una frase) y las tarjetas DC-05 y DC-12. Sin tabla del embudo | `vistas.V06`, `anclas` («contactables 800»), `meta.archivos` |
| V07 | `V07_Campanias.jsx` | «Dos campañas duplicadas resueltas: 915 envíos más y ninguna tasa cambia» (22/09; 915 = E06, «ninguna tasa cambia» = antes.tasa_pct igual a despues.tasa_pct en las cinco ofertas; 24/09: el conteo de casos sale del payload) | ¿cambian las tasas por oferta al resolver los duplicados? (24/09) | (24/09) par de envíos con oferta 22.614 → 23.529 (el mismo indicador, con flecha) y, si los cinco rangos se pisan, una nota: ninguna oferta se distingue; `PuntosIC` de la tasa después, una fila por oferta ordenada por tasa, con línea punteada de la tasa de todas las ofertas; el antes va en el par y en la nota de la oferta donde cambia la base; a la derecha, tarjeta DC-13 con los dos casos (qué oferta queda, cuál sale y qué fecha decidió) y el pedido de V12, y tarjeta DC-06 con el par Gold (envíos al segmento, 5.066, y socios Gold del programa, 3) en `ParDoble`, en tinta y sin flecha: una cifra cuenta envíos y la otra, personas. Sin el 30,1 % de coincidencia | `vistas.V07`, `vistas.V12.pedidos` |
| V08 | `V08_Precios.jsx` | «Con IPC 13,2× el precio bajó 7,6 %: los montos no reflejan la inflación» (24/09: el título dice la premisa para no deflactar) | ¿por qué no se deflacta? | (24/09) `LineaIndice` a todo el ancho: precio mediano e IPC en veces el nivel de 2022, un solo eje en la misma unidad (no es eje doble); IPC fechado al inicio de cada año, medianas a mitad de año; los pesos del precio en el rótulo; debajo, barras divergentes propias de la vista con la variación por categoría (eje en múltiplos de 5 que cubre los datos, hoy −15 % a 5 %; las medianas en pesos en gris) y, a la derecha, la tarjeta DC-10 con su llano y con «Qué vimos», calculado de D2, en lugar de la justificación. Sin fila de pares: DC-10 no mueve ninguna cifra | `vistas.V08`, `vistas.V03.meses_flag` |
| V09 | `V09_NPS.jsx` | «NPS 2025: 16,2 con las filas sin reclamos ni consultas, 9,9 sin ellas» (24/09: las dos cifras, ninguna presentada como el NPS nuevo) | ¿cuánto vale el NPS? | (24/09) `BarraMini` de las filas marcadas (28,8 %, con la trama en la parte marcada); `ParDoble` del NPS del último año con y sin las filas marcadas, en tinta y sin flecha, con los meses sin cobertura confirmada en su rótulo y una nota calculada: cuántos puntos suman las filas marcadas en el último año y en el primero; línea doble propia del NPS anual (con las filas marcadas en `--mut2` punteada, sin ellas en tinta), sin `--antes`/`--despues`; tarjeta DC-11 en una columna angosta. Sin `BarrasH` de reclamos ni tarjeta riesgo vs soporte | `vistas.V09` (sin `reclamos_por_cliente_mes` ni `riesgo_vs_soporte`), `vistas.V03.meses_flag`, `vistas.V12.pedidos` |
| V10 | `V10_CifraCentral.jsx` | «49,6 % → 50,4 % solo por duplicados; en revisión: al 31/08/2025 da 38,5 %» (24/09) | ¿cambió la cifra del directorio? | (24/09) una tarjeta con el par E1 → después de las decisiones (con flecha y «en revisión» en el rótulo) y la sensibilidad un escalón abajo, en tinta, con borde y aro punteados («si sep–dic 2025 están incompletos · medido al 31/08/2025» y qué significa); en cada columna, riesgo y exposición como cifras y los conteos de los que salen; debajo del par, la salvedad de la exposición (no es recupero; pesos del extracto, sin ajustar por inflación); abajo, «Qué mueve la cifra y qué la pone en duda»: tres columnas con el Δ en puntos y en ARS M de DC-04 (aplicada, con por qué sube el %), DC-09 (sensibilidad) y DC-08 (corte común: concilia con el 85,2 % de V02), calculadas desde D2; si `V.cambios` trae más de una fila, la primera columna las lista una debajo de otra. Las dos tarjetas reparten el alto libre. Sin tarjeta DC-04 (está en V04); pie: exposición no es recupero; en revisión | `vistas.V10`, `vistas.V02.riesgo`, `vistas.V03.meses_flag`, `vistas.V12.pedidos` |
| V11 | `V11_Dataset.jsx` | «El modelo aprende con ene-23 a jun-24 (18.882 filas) y se prueba en 2025» (24/09; la tasa va en un KPI y dice «entran en riesgo», no «churn») | ¿con qué se entrena el modelo? | (24/09) tres KPI: filas para el modelo (con las variables por fila), clientes distintos y «entran en riesgo a 90 días», 25,45 % (dos decimales, como E08); barras verticales propias de filas por fin de mes, coloreadas por partición y rotuladas en llano (entrenamiento, ajuste, separación, prueba, prueba aparte), con una nota sobre la rampa (la regla de 3 compras acumulándose, no la cartera creciendo); tarjeta «Cómo se usan las filas»: por partición, uso, filas, meses y tasa de riesgo a 90 días; por qué la prueba aparte va aparte (su ventana toca los meses de DC-09), y el nombre y la versión del dataset al pie; tarjeta «Qué va a predecir el modelo», a la derecha o bajo el gráfico según el alto. Sin serie de tasa ni leyenda; «churn» solo en el nombre del dataset y en la referencia técnica de la hoja impresa | `vistas.V11`, `vistas.V10.despues`, `vistas.V03.meses_flag` |
| V12 | `V12_Pedidos.jsx` | «Cinco pedidos a Casa Óga; el de sep-25 a dic-25 decide la cifra central» (24/09; el conteo en letras es `pedidos.length` y los meses, `vistas.V03.meses_flag`) | ¿qué falta del lado del negocio? | (24/09) una frase con la misma cuenta que V01 (4 de las 15 decisiones esperan una respuesta de Casa Óga: cuál sigue pendiente y cuáles falta confirmar; el pedido que no es una decisión se nombra aparte); tabla de pedidos en tres columnas (id, qué, detalle), sin columna de estado: primero y marcado con una barra en `--acc` el pedido de DC-09, con lo que depende de esa respuesta (riesgo y exposición de `vistas.V10.despues`, hoy en revisión); el resto en el orden del payload; nombres de archivo en llano; sin gráfico. Pie en un renglón (corte y base), la fuente en su `title` | `vistas.V12`, `vistas.V03.meses_flag`, `vistas.V10.despues`, `decisiones` |

## Lo que no hace este tablero

- No repite las 14 vistas del E1 ni sus filtros: las cifras del E1 aparecen solo como «antes» o
  (24/09), en V02, como la referencia del `ParDoble`.
- No afirma recupero: la exposición es facturación proyectada de clientes en riesgo. (24/09)
  Tampoco ajusta montos: son pesos del extracto, sin ajustar por inflación (DC-10, vista 8).
- No promete anticipación: el modelo es del Entregable 3; V11 muestra el dataset, no un score.
- No inventa cifras: si `D2.vistas.Vnn` está vacío, la vista muestra «sin datos en el payload»
  y `fit.js` lo marca como lienzo vacío.

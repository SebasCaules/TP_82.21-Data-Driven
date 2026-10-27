# Diseño de la presentación E3 (`/e3/`)

> **Desde el 27/10 (W1) manda la última sección, «Decisiones (27/10, W1): el armazón del E2».** Las reglas
> transversales y la tabla por diapositiva de abajo describen el escenario fijo de 1600 × 900, que se fue;
> quedan como referencia del contenido de cada diapositiva (el código está en el commit `a06f88c`,
> `e3/src/diapositivas/`).

La presentación del Entregable 3 (27/10/2026) en el navegador. Desde el 27/10 es la única versión: el
PPTX del equipo se borró a pedido del usuario. El texto sigue saliendo de
`entregas/entregable-3/_build/F/presentacion/contenido.py` del vault. El texto sale de `C3` (`e3/src/contenido_e3.js`) y los valores de los
gráficos de `D3` (`e3/src/datos_e3.js`); el contrato de los dos está en `pipeline/CONTRACT_E3.md`.

## Reglas transversales

1. **Escenario fijo.** 1600 × 900 lógicos, 120 px por pulgada del PPTX (13,333 × 7,5 in), escalado
   para entrar entero en la ventana; lo que sobra queda como banda color papel. Nada scrollea. Las
   cajas caen donde las puso `armar.py` y la letra es la del PPTX en puntos × 1,667: título 43 px,
   cuerpo 21 a 23 px, pie 15 px. Lo que el PPTX no tiene (controles, lecturas, rótulos de los
   gráficos nuevos) va a 19 o 20 px; fuera del pie, nada debajo de 17 px (marcas de eje): a 1024 × 768
   el escenario se ve a 0,64 y 15 px son 9,6 px reales (24/10).
2. **Lo que muestra el PPTX, no más.** El título es la afirmación de C3. Lo que se dice va en las
   notas del orador (N), con quién lo dice y su tiempo.
3. **Identidad del E1 y el E2.** `main.jsx` importa `src/estilos.css` entero, como el E2; las clases
   propias llevan el prefijo `e3-`. Terracota solo para lo que no cierra, siempre con rótulo o signo.
4. **Cifras.** Ninguna escrita en el JSX: texto de C3, valores de D3 formateados con
   `e3/src/formato.js` (toFixed, punto de miles, coma decimal, menos U+2212, «USD 5,38»). Las marcas
   de eje y de navegación llevan `data-escala`; los valores que dependen de un control,
   `data-simulacion`. En el estado inicial la pantalla coincide con el PPTX y con el documento.
5. **Interfaz nueva** (rótulos de controles, ayuda): fragmentos cortos, sin «pendiente», «abierto»
   ni «a definir».
6. **Pasos** solo en la 3 y la 6, tres en cada una. → muestra el paso que sigue y, completo, pasa de
   diapositiva. Mientras quedan pasos, el pie dice «paso 1 de 3 · → sigue aquí» (para quien ensayó
   con el PDF, que no tiene pasos). ← deshace un paso solo si a la diapositiva se llegó con →; al
   llegar hacia atrás, por la vista general, por número o por la URL, la diapositiva se ve completa
   y ← pasa a la anterior. `GUION_PASOS` (`diapositivas/index.js`) dice desde qué frase del guion
   acompaña cada paso; las notas lo marcan. Si el equipo no ensaya los pasos, `PASOS = {}` los saca.
7. **Controles** con mouse y teclado. Tocado con el mouse, un control cambia y suelta el foco: →
   sigue pasando de diapositiva. Con Tab el foco queda en el control y las flechas lo mueven; Esc lo
   suelta; Av Pág y Re Pág siguen pasando de diapositiva. Al salir de una diapositiva, cada control
   vuelve a su valor inicial (la diapositiva se monta de nuevo). La tarjeta, la fila o el gráfico
   que solo se resalta no es un control: el clic en la franja derecha o izquierda pasa de
   diapositiva en todas, también en la 2 y la 4.
8. **Gráficos** en SVG a mano; las escalas, con `escalaNice` de `src/graficos.jsx`.
9. **Movimiento**: 260 ms al cambiar de diapositiva, 220 ms al revelar un paso;
   `prefers-reduced-motion` los apaga.
10. **Anexos** fuera del recorrido: se llega con A, desde la vista general o con `#a1` a `#a6`. En un
    anexo, → pasa al siguiente y ← vuelve a la diapositiva de la que se vino (guardada en
    `history.state`, sobrevive a recargar). Abierto directo por la URL no hay de dónde se vino: el
    botón dice «Ir a la diapositiva 12».
11. **Control remoto** (24/10). Av Pág y Re Pág pasan de diapositiva; F5 pide pantalla completa y no
    recarga; Esc cierra lo abierto y nunca muestra la vista general (los remotos mandan F5 y Esc con
    el mismo botón); «.» y B ponen la pantalla en negro hasta la próxima tecla. Una tecla mantenida
    no recorre la presentación.
12. **Dos ventanas** (24/10). Con la misma dirección abierta dos veces, las ventanas se siguen
    (`BroadcastChannel`): la del proyector sin notas y la de la laptop con N. La que se abre toma la
    posición de la que ya estaba. Al abrir en la portada, una pista de 4 s fuera del escenario
    nombra los atajos.

## Por diapositiva

| # | Mensaje | Pieza | Interacción | Estado inicial | Cifras |
|---|---|---|---|---|---|
| 1 | ¿Conviene anticipar a los clientes que dejan de comprar? | portada en tinta, equipo | — | como el PPTX | C3; el pie es `C3.PIE` y no la línea fija de `armar.py` |
| 2 | La lista sale con la regla y un piloto mide si contactar sirve | cuatro tarjetas y la decisión; solo «No viable» en terracota, la tasa de éxito avisa con la banda | «ver la n →» en cada tarjeta: Técnica a la 4, Legal a la 10, Económica a la 8, tasa de éxito a la 9 | como el PPTX | C3 |
| 3 | Un cliente se va cuando pasa su propio umbral | definiciones, línea de tiempo de CLI03296, tres cifras | tres pasos: ritmo y umbral; corte y lo que faltaba; los 90 días siguientes | completa salvo al llegar con → | `D3.caso` (H23); tarjetas de C3 |
| 4 | Técnicamente factible; el límite es quién opera | barras de 1 a 3, promedio, banda de factibilidad media; cuatro filas | puntero o foco en una condición resalta su fila, y al revés | sin resaltado | `D3.tecnica` (F16); filas de C3 |
| 5 | El MVP es una planilla mensual | flujo de cinco pasos, tres hechos | — | como el PPTX | C3 |
| 6 | Ningún modelo le gana a la regla por más que el ruido | precisión de la lista de 500 por modelo; intervalo de la logística menos la regla | tres pasos: el piso, la regla, los modelos; en el paso 3, Validación / Entrenamiento (en entrenamiento, el techo de 66,3 %) | Validación, completa | `D3.modelos` (F07, F08, G10 a G17, G24) |
| 7 | Con la lista que se puede mandar, el modelo queda debajo | precisión de regla y logística ajustada para un largo y un filtro; importancia por permutación con leyenda (variables de la regla, las demás) | filtro (sin filtro, solo contactables) y largo (300 a 800; sin filtro, desde 500) | 500 contactables: 75,8 %, 73,9 %, 29 más para la regla | `D3.lista.filas` (H11, H12, H15, H16) y `.comparaciones` (H48), `.importancia` (H21) |
| 8 | Aun en su mejor caso, el modelo suma USD 5,38 y cuesta USD 10.400 más | valor de cada celda, la cuenta del modelo contra la regla, la lista contactable (USD 11,70 debajo), umbral de viabilidad dibujado a escala | — | como el PPTX | C3; 1.719 y 18,4 de `D3.economia` (G46) |
| 9 | Ni la regla sola recupera su costo | costo del año 1 y, en el mismo eje, el beneficio anual simulado de la regla; deslizante de la tasa de éxito; tres lecturas: s, ROI de la regla, ROI del modelo sobre la regla | s de 0,63 % (borde inferior del IC 95 %) a 100 % por la grilla, con el tramo de 0,63 a 5 % ampliado y rotulado (marcas en el IC, en la observada y en los dos equilibrios; ↑ ↓ saltan entre marcas); con / sin descuento, que cambia la regla y el modelo | s = 1,02 %, con 15 % de descuento | `D3.economia.costos` (G38, G39, C28) y `.grilla` (G31 a G54); llamadas y veredicto de C3 |
| 10 | Legalmente viable con condiciones | cinco dimensiones, promedio, alerta del 30,1 %, plan L1 a L6 en dos tramos | — | como el PPTX | C3 |
| 11 | Tres riesgos críticos, con señal y umbral | tres tarjetas; matriz de los 13 | un botón alterna la matriz; clic o foco en un riesgo muestra su texto (el puntero solo lo marca) | las tres tarjetas | C3 y su anexo A4 |
| 12 | Un piloto de tres meses decide si se invierte más | la regla de decisión: hasta 2,87 puntos no se distingue de cero, de 2,87 a 40,4 el contacto funciona y la lista no se paga, desde 40,4 se invierte; hechos; lo que se presenta a María G. | — | como el PPTX | `D3.piloto` (G49, H49); C3 |
| A1 a A7 | respaldo para preguntas | tabla con las filas que C3 destaca | «Volver a la diapositiva N» | — | C3 |

## Decisiones (24/10)

- **9, con y sin descuento.** El selector cambia la regla y el modelo: la grilla trae
  `modelo_usd_sin` y `modelo_roi_pct_sin` (24/10). Antes el modelo quedaba con 15 % de descuento
  en los dos casos y el gráfico mezclaba supuestos.
- **9, una idea.** Ni la regla se paga con lo observado, ni el modelo con ninguna tasa. Salen (24/10)
  la barra de lo que suma el modelo (USD 5,38 no se ve en un eje de USD 40.000 y tiene su
  diapositiva, la 8), «veces la tasa observada» (la llamada dice 48,6 veces) y la nota de la tasa
  observada (la dice la tarjeta 4 de la 2 y el guion).
- **9, el eje.** Va de 0 a USD 40.000 para que los costos del PPTX se lean igual. Un beneficio que
  pasa el eje sigue con una flecha y su valor escrito.
- **9, desde dónde.** El deslizante empieza en 0,63 %, el borde inferior del IC 95 %: debajo de
  0,3 % la regla pierde más que su costo y el ROI baja de −100 %, una cifra que nadie sostiene.
- **7, la diferencia.** Cuántos aciertos más tiene la que gana viene precalculado en
  `D3.lista.comparaciones` (`build_e3.py`) y anclado a la fila H48 del registro: el navegador no
  resta. Con fracción (la regla reparte los empates del último puesto) se muestra con «≈»: «≈ 15».
- **7, la importancia.** Muestra las seis variables del PPTX y no se titula como las de más peso:
  `reclamos_90d` (0,5 puntos) pesa más que `edad` y no está en la diapositiva ni en la C 7.3.
- **6, entrenamiento.** La práctica actual no se midió en entrenamiento (`null`): se dice así, sin
  barra. El pie de la figura cambia al período de entrenamiento.
- **11, la matriz.** Probabilidad por impacto con los 13 riesgos del anexo A4 de C3; los tres
  críticos, en azul como en el anexo.
- **Notas del orador.** Debajo del escenario, que se achica para dejarles lugar: nunca tapan el
  título. En el aula, con pantalla extendida, van en una segunda ventana en la laptop (regla 12);
  con pantalla duplicada, el aula las vería: se ensaya con N y se presenta sin.
- **2, las tarjetas.** No son botones: el salto a su diapositiva va en «ver la n →», abajo a la
  derecha, de 44 px de alto. El clic en el resto de la tarjeta pasa de diapositiva como en todas.

## Verificación

- `python3 scripts/verificar_e3.py` (app): cada página a cinco resoluciones, el recorrido por teclado
  y cada control en sus extremos; capturas en `e3/capturas-verif/` (no se versiona).
- `python3 verificar.py --web <app>/dist-e3/index.html` (vault, carpeta de la presentación): cada
  número visible en el estado inicial, salvo `data-escala` y `data-simulacion`, contra el texto de
  las partes A, B y C, con las mismas excepciones que el PPTX.

## Decisiones (26/10)

- **Letra.** Arial también en la web (`.e3-app` redefine `--fuente`): con Segoe UI o Tahoma los cortes de
  línea no eran los del PPTX que ensayó el equipo. El cuerpo sube a 23,5-26,5 px, y las notas y los pies
  pasan a letra recta; el recorte de texto de `contenido.py` deja lugar para eso.
- **9.** Dos llamadas: el ROI por escenario y el 49,6 %. Sale «USD 660», que ya muestra el gráfico. El
  deslizante marca solo el equilibrio del descuento elegido.
- **10.** La escala de la cátedra va debajo del promedio, y las normas en la columna derecha, debajo del
  plan, en lugar del pie de genero.
- **A7.** Matriz de confusión de la logística y la regla (B 4.3 y 4.4).

## Decisiones (27/10): forma de tablero, contada como historia

Pedido del usuario: «parecida al de las últimas entregas, con una forma de contar como storytelling y sin
tanta interacción necesaria para presentar».

- **Riel de capítulos** (`Marco.jsx`, `CAPITULOS` en `diapositivas/index.js`), como los tableros del E1 y el
  E2. Cada capítulo es una pregunta (el problema, ¿se puede hacer?, ¿el modelo mejora?, ¿se paga?, ¿es legal y
  seguro?, la propuesta) y los anexos van al pie como respaldo. El contenido arranca en x = 256: `M` y
  `ANCHO` de `Marco.jsx` cambian, y los gráficos se angostaron en lugar de achicar la letra.
- **Pregunta y respuesta.** Cada vista lleva arriba la pregunta grande (`pregunta` de C3) y la respuesta en una
  línea (`titulo`). Sin rótulo de sección: el capítulo lo dice el riel.
- **Sin pasos** (`PASOS = {}`): cada vista llega completa.
- **Controles detrás de «Explorar»** (`BotonExplorar`, `controles.jsx`), cerrados al llegar: el selector de la 6, el
  filtro y el largo de la 7, el simulador de la 9 y la matriz de la 11. La 9 presenta en su lugar la escala
  quieta de la tasa de éxito (1,02 % contra 49,6 %). Salen los «ver la n →» de la 2: navega el riel.
- **Reglas 6 y 7.** Las reglas transversales 6 (pasos) y 7 (controles) quedan reemplazadas por esto.


## Decisiones (27/10, W1): el armazón del E2

Pedido del usuario: «/e3/ estéticamente exactamente igual a /e1/ y /e2/», más corta. Plan del E3 (frente web) y
decisiones N0-5 y N0-6.

- **El armazón es el del E2.** `e3/src/App.jsx` es `e2/src/App.jsx` (riel `.lat`, encabezado `.e2-enc` con la
  pregunta como `h1`, `.cuerpo`, flujo de impresión, transición entre vistas) y `main.jsx` importa
  `src/estilos.css`, `e2/src/estilos_e2.css` y `src/fit.js` tal cual. Las vistas usan `e2/src/Banda.jsx` (con
  `TarjetaDecision`) y las primitivas de `src/graficos.jsx`. Rigen las reglas 11 (banda de cifras y tarjeta
  de decisión), 12 (la pregunta en el encabezado, sin título ni pie) y 13 H1 (una cifra dominante) del
  `e2/DISENO.md`. `estilos_e3.css` no nombra ninguna clase del armazón; ni `src/**` ni `e2/**` cambian.
- **Letra más grande (N0-5 y N0-13): zoom uniforme, letra contra la ventana real.** k = máx(1; mín(1,2;
  ancho / 1152; alto / 640)) (`zoom.js`): 1 a 1152 × 640, 1,186 a 1366 × 768 y 1,2 desde 1536 × 864. El tablero
  va en `.e3-vp`, una caja del tamaño de la ventana lógica (ancho / k × alto / k) con `zoom: k`. Para que las
  hojas compartidas, que miden en vw, vh y `@media`, midan contra esa caja, `vite.e3.config.js` reescribe al
  empaquetar el E3 vw → cqw, vh → cqh y los `@media` de ancho o alto → `@container`. Así las cajas de /e3/ a
  W × H son las de /e2/ a W/k × H/k, ampliadas k veces.
  - (W2.0, N0-13) La letra no sigue esa regla. En W1 la pregunta y las cifras grandes medían lo mismo que en
    /e2/ en la misma ventana (el E2 ya las escala con la ventana y el zoom solo devolvía lo que la ventana
    lógica quitaba) y el resto crecía entre 1,02 y 1,20. Ahora las declaraciones de letra (`font`,
    `font-size`, `line-height`, `letter-spacing` y las variables que alguna hoja usa en ellas: `--e2-txt`,
    `--e2-txt2`, `--e2-rot`) conservan sus vw y vh, que bajo el zoom valen k veces lo de /e2/; dentro de un
    `@media` de ancho o alto quedan en un `@media` aparte, contra la ventana real (el riel de 11,5 px de
    `max-height: 730px` del E1 se aplica según la ventana real, como en /e2/), y el resto pasa al
    `@container`. Resultado medido: **cada texto de /e3/ a W × H mide k veces lo que mide en /e2/ en la misma
    ventana**, la pregunta y las cifras grandes incluidas (tabla en `paridad_e3.py`, sección 2).
  - Los SVG de las vistas escalan su letra con `useEscalaTexto` del E2 (`e2/src/escala.js`), que mide la
    ventana real; el zoom la multiplica por k. En estilos en línea, la letra va en px, vw o vh (crece ×k como
    en /e2/) y los largos de la caja en cqw o cqh, que miden la ventana lógica.
  - Precio: la caja sigue siendo la del E2 en la ventana lógica y la letra es k veces más grande, así que lo
    que en el E2 entraba justo no entra. La ventana más angosta para el texto es 1366 × 768 (lógica 1152 ×
    648, letra ×1,186). Medido en la vista 5: el riel entra con 13 px de aire sobre su pie si ningún nombre
    se parte (por eso la 8 es «Paso a producción»); en la banda entran tres cifras con anchos 2 / 3 / 2 y
    rótulos de hasta unos 125 px lógicos. A 1440 × 900 (16:10, fuera del rango verificado) la cifra grande
    de la 5 invade 5 px el relleno de su tarjeta: crece con el alto de la ventana.
- **El encabezado.** A la derecha, «5 / 9 · Parte B 3.2…» (vista y fuente en C3) y, en el lugar de la
  miniatura del mapa de calidad del E2, el avance de la historia: una barra por vista, mismo marco y medidas
  (118 × 46), así el encabezado tiene el alto del E2.
- **El riel.** Nueve vistas y el grupo «Respaldo» con los anexos A1 a A7 de C3 (`vistas/index.jsx`). Una vista
  es un archivo `Vnn_*.jsx` (o `An_*.jsx`) que exporta `default` y `meta = { id }`; sin archivo, la vista se
  muestra como esqueleto con su pregunta. Cada vista declara de qué diapositivas de C3 sale (`de`): de ahí
  sale el guion de las notas.
- **Quien presenta (N0-6).** Las teclas del E2 (flechas con el foco libre o en el riel, Inicio, Fin, F, I)
  más Av Pág y Re Pág, que pasan de vista siempre (control remoto); F5 pide pantalla completa sin recargar;
  N abre las notas debajo del tablero, que se achica para dejarles lugar: el panel toma el 35 % del alto,
  con letra de 14 px, para que el guion más largo (el de la 6) entre sin desplazar a 1366 × 768 (con las
  notas, k baja a 0,78 a esa resolución: se ensaya, no se proyecta); desde el panel, «Abrir en otra ventana» abre `?notas`, solo las notas. «.» y B ponen la pantalla en
  negro y cualquier tecla vuelve. Una tecla mantenida no recorre. Dos ventanas con la misma dirección se
  siguen (`BroadcastChannel`).
- **Decisiones: un id y un estado por decisión (`decisiones.js`).** La tarjeta del E2 muestra «id · estado»
  (DC-04 · APLICADA). En el E3 el id es la letra de la Parte y el área (A-TEC, B-ECO, C-LEG) y el estado, el
  veredicto de la tarjeta de la diapositiva 2 de C3 (factibilidad media, no viable, viable con condiciones).
  Toda vista toma su par con `decision(id, …)`; ninguna lo arma con el kicker. La propuesta se suma ahí en W2.
- **Sin controles a la vista.** Lo que una vista deje tocar va detrás de «Explorar» (`controles.jsx`),
  cerrado al llegar. En W1 ninguna vista tiene controles; el simulador de la tasa de éxito de la 5 queda para
  W2.
- **Vista 5, de muestra.** Banda: lo que suma el modelo por año (USD 5,38, con los USD 10.400 de más en su
  frase), el ROI del modelo sobre la regla a un año (la cifra dominante) y la tasa de éxito que pagaría la
  regla (49,6 %, con la observada en su frase); con cuatro tarjetas, a 1152 × 640 las cifras no entran.
  Desde W2.0, anchos 2 / 3 / 2 (con 3 / 4 / 3 el −99,95 % no entra en la central a 1366 × 768) y la moneda y
  el «%» un escalón más chicos (`.par-unidad`). Rótulos cortos para que entren en una línea de 1152 × 640 a
  1920 × 1080 («Suma el modelo», «ROI sobre la regla», «Éxito necesario», que reemplaza a «Para pagar la
  regla» porque a 1366 × 768 se partía; el largo va al title). Decisión: «No viable tal como está planteado» (C3, diapositiva 9),
  con «B-ECO · no viable». Gráfico: `BarrasH` del costo del año 1
  con modelo y solo la regla contra el beneficio anual de la regla, con el presupuesto marcado.

### Verificación (desde W1)

- `python3 scripts/paridad_e3.py`, a 1152 × 640, 1366 × 768, 1536 × 864 y 1920 × 1080: lo estático; la letra
  (desde W2.0), /e3/ contra /e2/ en la misma ventana, donde el cociente de tamaño, interlineado, espaciado y
  ancho dibujado de cada texto (riel, pregunta, encabezado, cifras y frases de la banda, tarjeta de decisión,
  textos del gráfico y esqueleto) tiene que dar k, con la tabla impresa; el armazón, /e2/ en la ventana
  lógica contra /e3/, sin la letra (colores, bordes, relleno y la posición y el ancho de las cajas); las
  reglas 11 y 12 y los desbordes que `__fit` no ve (texto cortado en la banda, cifra más ancha que su
  tarjeta, riel encimado con su pie) en cada vista, y la hoja de contacto
  `entregas/entregable-3/_build/workforce/fase-w1/e2-e3-1536.png` del vault.
- `python3 scripts/verificar_e3.py`: cada vista a cinco resoluciones con `__fit`, consola y red limpias, y el
  recorrido de quien presenta, con cada rótulo de la banda en una línea y el guion de cada vista entero en el
  panel de notas a 1366 × 768 y 1536 × 864. Desde W3 y antes de exportar se corre con `--sin-esqueletos`, que
  falla si alguna vista sigue mostrando «se arma en la etapa siguiente».

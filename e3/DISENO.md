# Diseño de la presentación E3 (`/e3/`)

La presentación del Entregable 3 (27/10/2026) en el navegador. Mismo orden, títulos y textos que el
PPTX del equipo (`entregas/entregable-3/equipo/presentacion-e3.pptx` del vault): quien ensayó con el
PPTX reconoce cada diapositiva. El texto sale de `C3` (`e3/src/contenido_e3.js`) y los valores de los
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
| 2 | La lista sale con la regla y un piloto mide si contactar sirve | cuatro tarjetas y la decisión | «ver la n →» en cada tarjeta: Técnica a la 4, Legal a la 10, Económica a la 8, riesgo más crítico a la 9 | como el PPTX | C3 |
| 3 | Un cliente se va cuando pasa su propio umbral | definiciones, línea de tiempo de CLI03296, tres cifras | tres pasos: ritmo y umbral; corte y lo que faltaba; los 90 días siguientes | completa salvo al llegar con → | `D3.caso` (H23); tarjetas de C3 |
| 4 | Técnicamente factible; el límite es quién opera | barras de 1 a 3, promedio, banda de factibilidad media; cuatro filas | puntero o foco en una condición resalta su fila, y al revés | sin resaltado | `D3.tecnica` (F16); filas de C3 |
| 5 | El MVP es una planilla mensual | flujo de cinco pasos, tres hechos | — | como el PPTX | C3 |
| 6 | Ningún modelo le gana a la regla por más que el ruido | precisión de la lista de 500 por modelo; intervalo de la logística menos la regla | tres pasos: el piso, la regla, los modelos; en el paso 3, Validación / Entrenamiento (en entrenamiento, el techo de 66,3 %) | Validación, completa | `D3.modelos` (F07, F08, G10 a G17, G24) |
| 7 | Con la lista que se puede mandar, el modelo queda debajo | precisión de regla y logística ajustada para un largo y un filtro; importancia por permutación con leyenda (variables de la regla, las demás) | filtro (sin filtro, solo contactables) y largo (300 a 800; sin filtro, desde 500) | 500 contactables: 75,8 %, 73,9 %, 29 más para la regla | `D3.lista.filas` (H11, H12, H15, H16) y `.comparaciones` (H48), `.importancia` (H21) |
| 8 | El modelo suma USD 5,38 y cuesta USD 10.400 más | dos números, matriz valorizada con su fórmula, umbral de viabilidad dibujado a escala | — | como el PPTX | C3; 1.719 y 18,4 de `D3.economia` (G46) |
| 9 | Ni la regla sola recupera su costo | costo del año 1 y, en el mismo eje, el beneficio anual simulado de la regla; deslizante de la tasa de éxito; tres lecturas: s, ROI de la regla, ROI del modelo sobre la regla | s de 0,63 % (borde inferior del IC 95 %) a 100 % por la grilla, con el tramo de 0,63 a 5 % ampliado y rotulado (marcas en el IC, en la observada y en los dos equilibrios; ↑ ↓ saltan entre marcas); con / sin descuento, que cambia la regla y el modelo | s = 1,02 %, con 15 % de descuento | `D3.economia.costos` (G38, G39, C28) y `.grilla` (G31 a G54); llamadas y veredicto de C3 |
| 10 | Legalmente viable con condiciones | cinco dimensiones, promedio, alerta del 30,1 %, plan L1 a L6 en dos tramos | — | como el PPTX | C3 |
| 11 | Tres riesgos críticos, con señal y umbral | tres tarjetas; matriz de los 13 | un botón alterna la matriz; clic o foco en un riesgo muestra su texto (el puntero solo lo marca) | las tres tarjetas | C3 y su anexo A4 |
| 12 | Un piloto de tres meses decide si se invierte más | lista de 500 por mes con el control rayado; hechos; lo que se presenta a María G. | — | como el PPTX | `D3.piloto` (G49); C3 |
| A1 a A6 | respaldo para preguntas | tabla con las filas que C3 destaca | «Volver a la diapositiva N» | — | C3 |

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

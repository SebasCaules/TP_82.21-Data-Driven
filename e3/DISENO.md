# Diseño de la presentación E3 (`/e3/`)

La presentación del Entregable 3 (27/10/2026) en el navegador. Mismo orden, títulos y textos que el
PPTX del equipo (`entregas/entregable-3/equipo/presentacion-e3.pptx` del vault): quien ensayó con el
PPTX reconoce cada diapositiva. El texto sale de `C3` (`e3/src/contenido_e3.js`) y los valores de los
gráficos de `D3` (`e3/src/datos_e3.js`); el contrato de los dos está en `pipeline/CONTRACT_E3.md`.

## Reglas transversales

1. **Escenario fijo.** 1600 × 900 lógicos, 120 px por pulgada del PPTX (13,333 × 7,5 in), escalado
   para entrar entero en la ventana; lo que sobra queda como banda color papel. Nada scrollea. Las
   cajas caen donde las puso `armar.py` y la letra es la del PPTX en puntos × 1,667: título 43 px,
   cuerpo 21 a 23 px, pie 15 px.
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
   diapositiva; ← vuelve un paso. Al llegar hacia atrás, por la vista general, por número o por la
   URL, la diapositiva se ve completa. `GUION_PASOS` (`diapositivas/index.js`) dice desde qué frase
   del guion acompaña cada paso; las notas lo marcan.
7. **Controles** con mouse y teclado. Con el foco en uno, las flechas lo mueven; Esc devuelve el
   foco a la presentación; Av Pág y Re Pág siguen pasando de diapositiva. Al salir de una
   diapositiva, cada control vuelve a su valor inicial (la diapositiva se monta de nuevo).
8. **Gráficos** en SVG a mano; las escalas, con `escalaNice` de `src/graficos.jsx`.
9. **Movimiento**: 260 ms al cambiar de diapositiva, 220 ms al revelar un paso;
   `prefers-reduced-motion` los apaga.
10. **Anexos** fuera del recorrido: se llega con A, desde la vista general o con `#a1` a `#a6`. En un
    anexo, → pasa al siguiente y ← vuelve a la diapositiva de la que se vino (guardada en
    `history.state`, sobrevive a recargar).

## Por diapositiva

| # | Mensaje | Pieza | Interacción | Estado inicial | Cifras |
|---|---|---|---|---|---|
| 1 | ¿Conviene anticipar a los clientes que dejan de comprar? | portada en tinta, equipo | — | como el PPTX | C3; el pie es `C3.PIE` y no la línea fija de `armar.py` |
| 2 | La lista sale con la regla y un piloto mide si contactar sirve | cuatro tarjetas y la decisión | cada tarjeta lleva a su diapositiva: Técnica a la 4, Legal a la 10, Económica a la 8, riesgo más crítico a la 9 | como el PPTX | C3 |
| 3 | Un cliente se va cuando pasa su propio umbral | definiciones, línea de tiempo de CLI03296, tres cifras | tres pasos: ritmo y umbral; corte y lo que faltaba; los 90 días siguientes | completa salvo al llegar con → | `D3.caso` (H23); tarjetas de C3 |
| 4 | Técnicamente factible; el límite es quién opera | barras de 1 a 3, promedio, banda de factibilidad media; cuatro filas | puntero o foco en una condición resalta su fila, y al revés | sin resaltado | `D3.tecnica` (F16); filas de C3 |
| 5 | El MVP es una planilla mensual | flujo de cinco pasos, tres hechos | — | como el PPTX | C3 |
| 6 | Ningún modelo le gana a la regla por más que el ruido | precisión de la lista de 500 por modelo; intervalo de la logística menos la regla | Validación / Entrenamiento (en entrenamiento, el techo de 66,3 %); tres pasos: el piso, la regla, los modelos | Validación, completa | `D3.modelos` (F07, F08, G11 a G17, G12, G24) |
| 7 | Con la lista que se puede mandar, el modelo queda debajo | precisión de regla y logística para un largo y un filtro; importancia por permutación | filtro (sin filtro, solo contactables) y largo (300 a 800; sin filtro, desde 500) | 500 contactables: 75,8 %, 73,9 %, 29 más para la regla | `D3.lista.filas` y `.comparaciones` (H11 a H16), `.importancia` (H21) |
| 8 | El modelo suma USD 5,38 y cuesta USD 10.400 más | dos números, matriz valorizada con su fórmula, umbral de viabilidad dibujado a escala | — | como el PPTX | C3; 1.719 y 18,4 de `D3.economia` (G46) |
| 9 | Ni la regla sola recupera su costo | costo del año 1 y, en el mismo eje, el beneficio anual simulado de la regla y del modelo; deslizante de la tasa de éxito | s de 0 a 100 % por la grilla (marcas en el IC 95 % y en los dos equilibrios; ↑ ↓ saltan entre marcas); con / sin descuento | s = 1,02 %, con 15 % de descuento | `D3.economia.costos` (G38, G39, C28) y `.grilla` (G31 a G54); llamadas y veredicto de C3 |
| 10 | Legalmente viable con condiciones | cinco dimensiones, promedio, alerta del 30,1 %, plan L1 a L6 en dos tramos | — | como el PPTX | C3 |
| 11 | Tres riesgos críticos, con señal y umbral | tres tarjetas; matriz de los 13 | un botón alterna la matriz; puntero o foco en un riesgo muestra su texto | las tres tarjetas | C3 y su anexo A4 |
| 12 | Un piloto de tres meses decide si se invierte más | lista de 500 por mes con el control rayado; hechos; lo que se presenta a María G. | — | como el PPTX | `D3.piloto` (G49); C3 |
| A1 a A6 | respaldo para preguntas | tabla con las filas que C3 destaca | «Volver a la diapositiva N» | — | C3 |

## Decisiones (24/10)

- **9, el modelo sin descuento.** La grilla no trae el beneficio del modelo sin descuento: el
  selector cambia la regla y el ROI del modelo dice «con 15 % de descuento» en los dos casos.
- **9, el eje.** Va de 0 a USD 40.000 para que los costos del PPTX se lean igual. Un beneficio que
  pasa el eje sigue con una flecha y su valor escrito; uno negativo queda en cero con su valor.
- **9, la tasa observada.** Fija debajo del deslizante, con el texto de la tarjeta 4 de la
  diapositiva 2: compra a 7 días sin grupo de control, un techo y no un efecto medido.
- **7, la diferencia.** Cuántos aciertos más tiene la que gana viene precalculado en
  `D3.lista.comparaciones` (`build_e3.py`): el navegador no resta.
- **7, la importancia.** Muestra las seis variables del PPTX y no se titula como las de más peso:
  `reclamos_90d` (0,5 puntos) pesa más que `edad` y no está en la diapositiva ni en la C 7.3.
- **6, entrenamiento.** La práctica actual no se midió en entrenamiento (`null`): se dice así, sin
  barra. El pie de la figura cambia al período de entrenamiento.
- **11, la matriz.** Probabilidad por impacto con los 13 riesgos del anexo A4 de C3; los tres
  críticos, en azul como en el anexo.
- **Notas del orador.** Debajo del escenario, que se achica para dejarles lugar: nunca tapan el
  título.

## Verificación

- `python3 scripts/verificar_e3.py` (app): cada página a cinco resoluciones, el recorrido por teclado
  y cada control en sus extremos; capturas en `e3/capturas-verif/` (no se versiona).
- `python3 verificar.py --web <app>/dist-e3/index.html` (vault, carpeta de la presentación): cada
  número visible en el estado inicial, salvo `data-escala` y `data-simulacion`, contra el texto de
  las partes A, B y C, con las mismas excepciones que el PPTX.

# Diseño del tablero E2 — «Calidad de datos: decisiones antes y después»

Contrato de las 12 vistas (decisión N0-2, `wiki/entregables/plan-entregable-2.md`). Audiencia:
el directorio de Casa Óga, en la presentación del 29/09. Pregunta que responde el tablero
entero: **qué decidió el equipo sobre los 13 archivos y cuánto cambia el resultado con cada
decisión**. Datos: solo `e2/src/datos_e2.js` (`D2`, contrato `pipeline/CONTRACT_E2.md`).

## Reglas transversales (heredadas del E1, `app/docs/diseno-pantallas.md`)

1. **Una vista, un hallazgo.** El título (`h1.titulo`, una línea, ≤ 74 caracteres: a 1440 × 900 la letra crece más que el ancho y 80 ya parte en dos)
   afirma el hallazgo con la cifra, y la cifra sale de `D2`, nunca escrita en el JSX:
   `Los duplicados suben el riesgo de ${antes.pct} % a ${despues.pct} %`.
2. **Antes y después sobre el mismo corte**, lado a lado con la clase `.antes-despues`:
   columna izquierda ANTES (token `--antes`, gris), derecha DESPUÉS (`--despues`, azul).
   Terracota `--terracota` solo para marcar el problema (filas duplicadas, meses con
   cobertura no confirmada, envíos sin consentimiento). Nunca color solo: rótulo de texto
   y forma distinta además del color.
3. **Un par de números grandes** (`.ban-par`) arriba a la izquierda cuando la decisión mueve
   una cifra; debajo, el gráfico en un `<Lienzo>` de `src/graficos.jsx`; a la derecha o al
   pie, la **decisión en una frase** y la **justificación en una frase**, tomadas de
   `D2.decisiones` (campos `decision`, `justificacion`), con el id `DC-nn` visible. Desde el 22/09 la
   tarjeta es una sola, `e2/src/TarjetaDecision.jsx`, igual en todas las vistas: primero `llano` (la
   decisión dicha para el directorio, escrita en `build_e2._llano`), después la regla del wiki y la
   justificación.
4. **Pie fijo por vista** (`.pie-vista`): corte y base ("corte 31/12/2025 · base: 50.000
   filas únicas"), la fila del registro (`D01`) y la salvedad cuando la cifra está en revisión
   ("riesgo y exposición en revisión por la cobertura de 2025, ver V03").
5. Primitivas: `BarrasH` para categorías, `Linea` para series de tiempo, `PuntosIC` para
   tasas con intervalo, `BarraTramos` para composiciones; nada de tortas, 3D ni eje doble;
   barras desde cero; `<title>` nativo en cada marca con etiqueta, valor y base.
6. Sin filtros ni selector de corte. Navegación por riel lateral y teclado. Impresión: una
   hoja A4 apaisada por vista.
7. Cada vista es un archivo `e2/src/vistas/Vnn_nombre.jsx` que exporta `default function`
   y recibe `{ D2 }` por props. Solo el orquestador toca `e2/src/vistas/index.jsx`.
8. Clases del E1 que `fit.js` reconoce: `.pant`, `.titulo`, `.lienzo`, `.tarjeta`. Cada
   vista arranca con `<section className="pant vNN">`.

## Las 12 vistas

| id | Archivo | Título (plantilla; las cifras vienen de D2) | Pregunta | Lienzo | Datos |
|---|---|---|---|---|---|
| V01 | `V01_QueDecidimos.jsx` | «15 decisiones: 12 aplicadas, 2 declaradas y 1 a la espera del negocio» (conteos de `vistas.V01.por_estado`; 22/09) | ¿qué se decidió y con qué alcance? | tabla de 15 filas: id, archivo, hallazgo, decisión (una frase), estado como pastilla `Semaforo` (aplicada = meta, declarada = cerca, pendiente = fuera) y la vista donde se ve | `decisiones`, `vistas.V01` |
| V02 | `V02_Ventana.jsx` | «Con las ventanas alineadas al 31/12/2025 el riesgo baja de 85,2 % a 49,6 %» | ¿por qué el corte común? | línea de tiempo por archivo: 13 barras horizontales (desde → hasta) sobre un eje 2022-01 a 2026-08, con la línea vertical del corte; los dos archivos de contexto en gris punteado | `vistas.V02` |
| V03 | `V03_Cobertura.jsx` | «Cuatro meses de 2025 con menos del 60 % de las operaciones de un año antes» (22/09; el riesgo según la fecha de medición va en el par, sin flecha) | ¿qué meses no se pueden leer? | `Linea` de la razón mes / mismo mes del año anterior, 2023-01 a 2025-12, con banda del umbral 0,60 y los meses marcados; par de números: riesgo al 31/12/2025 y al 31/08/2025 | `vistas.V03` |
| V04 | `V04_Duplicados.jsx` | «Resolver 348 clientes duplicados sube el riesgo de 49,6 % a 50,4 %» | ¿qué cambia al unir identidades? | `.ban-par` con clientes, riesgo y exposición antes/después; `BarrasH` de personas por cantidad de ids | `vistas.V04` |
| V05 | `V05_Devoluciones.jsx` | «613 devoluciones ya restadas: sumarlas otra vez infla 1,2 % las unidades» (22/09) | ¿cómo se cuentan las devoluciones? | `Linea` doble: devoluciones por mes según la fecha de la fila negativa y según `fecha_devolucion`; `BarrasH` de motivos | `vistas.V05` |
| V06 | `V06_Envios.jsx` | «De la lista de 800 se puede escribir a 549, no a los 568 del E1» (22/09: el 568 → 567 → 549 lo mueven DC-04 y las bajas, no DC-05) | ¿a quién se le puede escribir? | `BarraTramos` de la lista de 800: contactables / sin consentimiento / con baja; par de números de envíos antes/después y embudo | `vistas.V06` |
| V07 | `V07_Campanias.jsx` | «Dos campañas duplicadas resueltas: 915 envíos más y ninguna tasa cambia» (22/09; 915 = E06, «ninguna tasa cambia» = antes.tasa_pct igual a despues.tasa_pct en las cinco ofertas) | ¿qué oferta convierte? | `PuntosIC` antes/después por tipo de oferta; tarjeta con los dos casos CAMP004 y CAMP034 y la fila elegida; tarjeta Gold (5.066 envíos, 3 socios) | `vistas.V07` |
| V08 | `V08_Precios.jsx` | «Precio unitario bajó 7,6 % en pesos corrientes; IPC acumulado 13,2×» (22/09, D09) | ¿por qué no se deflacta? | dos `Linea` en paneles separados (mediana anual; IPC acumulado base 2022 = 1), nunca eje doble; `BarrasH` de variación por categoría | `vistas.V08` |
| V09 | `V09_NPS.jsx` | «28,8 % de filas de soporte con NPS sin reclamos ni consultas: se marcan» (22/09) | ¿cuánto vale el NPS? | `Linea` doble del NPS anual (con todo / solo con interacción); `BarrasH` de reclamos por cliente-mes por año; tarjeta riesgo vs soporte | `vistas.V09` |
| V10 | `V10_CifraCentral.jsx` | «Frente al E1, solo unir duplicados mueve el riesgo: 49,6 % → 50,4 %» (22/09) | ¿cambió la cifra del directorio? | tres pares grandes (E1 → después → sensibilidad 31/08/2025); una línea por decisión con Δ puntos y Δ ARS M mientras `V.cambios` traiga una sola fila; `BarrasH` de cambios por decisión cuando traiga más de una (22/09); pie: exposición no es recupero; en revisión | `vistas.V10` |
| V11 | `V11_Dataset.jsx` | «N filas cliente × corte, K features, tasa de churn a 90 días de X %» | ¿con qué se entrena el modelo? | `BarrasH` o barras verticales de filas por corte coloreadas por partición (train / dev / gap / test / test_flag), `Linea` de tasa de positivos por corte; tarjeta con nombre y versión | `vistas.V11` |
| V12 | `V12_Pedidos.jsx` | «Cinco cosas quedan en manos de Casa Óga» | ¿qué falta del lado del negocio? | tabla de pedidos con estado; sin gráfico | `vistas.V12` |

## Lo que no hace este tablero

- No repite las 14 vistas del E1 ni sus filtros: las cifras del E1 aparecen solo como «antes».
- No afirma recupero: la exposición es facturación proyectada de clientes en riesgo.
- No promete anticipación: el modelo es del Entregable 3; V11 muestra el dataset, no un score.
- No inventa cifras: si `D2.vistas.Vnn` está vacío, la vista muestra «sin datos en el payload»
  y `fit.js` lo marca como lienzo vacío.

# Verificación — compuerta 5

Protocolo (a)(b)(c)(d) de `wiki/entregables/guia-dashboard-directorio.md`, más la matriz de
resoluciones y la auditoría final adversarial.

## Cadena de validación

Se cierra en dos tramos y los dos usan `client_facts` como verdad independiente. Ninguno
compara el payload contra sí mismo, que sería probar nada.

```
pipeline/validate.py    payload == client_facts                201.819 chequeos
test/paridad.mjs        agregacion.js(payload) == client_facts  471.870 chequeos
```

| Etapa | Cobertura | Resultado |
|---|---|---|
| Anclas | 44 cifras del wiki, del corte de referencia y del corte anterior | **44/44** |
| Contingencia | celda a celda, 25 cortes | **175/175** |
| Grilla de filtros | 2.688 combinaciones × 25 cortes | **201.600/201.600** |
| Paridad Python ↔ JS | las mismas 2.688 × 25, más la decodificación de las 1.470 claves | **471.870/471.870** |

Tolerancias declaradas: los conteos (`n`, `nr`, `ne`) se exigen exactos, sin tolerancia. En
los campos de dinero se acepta 1 peso por celda sumada, porque Python redondea el total de
cada celda y el navegador suma celdas ya redondeadas. En la práctica se activa en 11 de 175
casos, y 1 peso sobre ARS 94,9 M es 1 parte en 95 millones.

## Contraste contra "Los números disponibles" del wiki

Las ocho cifras que la guía declara como permitidas, recomputadas hoy:

| Cifra | Wiki | Pipeline |
|---|---|---|
| Clientes en riesgo | 41,0 % | **41,0 %** |
| Riesgo en Q5 | 51,8 % (619) | **51,8 % (619)** |
| Exposición anual | ARS 94,9 M | **ARS 94,9 M** |
| Facturación en riesgo | ARS 262,8 M | **ARS 262,8 M** |
| Facturación de la base | ARS 550,2 M | **ARS 550,2 M** |
| Facturación de los 619 de Q5 | ARS 113,6 M | **ARS 113,6 M** |
| Recency mediana | 277 días | **277 días** |
| Compra a 7 días del criterio actual | 1,39 % | **1,39 %** |

Las diferencias están todas en la tabla RFM y todas salen del mismo empate de borde:

| Segmento | Wiki | Pipeline | Diferencia |
|---|---|---|---|
| Campeones | 1.014 · 25,3 % · 159,9 M | 1.014 · 25,3 % · **160,0 M** | ARS 0,1 M |
| Leales | 820 · 58,3 % · 90,8 M | 820 · 58,3 % · **90,6 M** | ARS 0,2 M |
| Perdidos | **1.129** · 20,4 % · 86,7 M | **1.128** · 20,4 % · 86,7 M | un cliente |
| Potenciales | **590** · 3,9 % · 35,5 M | **591** · 3,9 % · 35,5 M | un cliente |
| En riesgo · Hibernando · Nuevos | — | — | exactos |

Un solo cliente cae del otro lado de un borde de quintil y se lleva su facturación consigo.
La regla del pipeline está escrita y es reproducible; la del wiki salió de un script que este
proyecto no puede leer. Se corrige el wiki, no el tablero (S-05).

## Matriz de resoluciones

Detector propio (`src/fit.js`). No usa `scrollHeight`, que da cero con `overflow:hidden` y
produce el falso negativo conocido: compara rectángulos con `getBoundingClientRect` y detecta
superposición con el pie y con el encabezado, desborde lateral, texto recortado y gráfico
aplastado por debajo de 90 px.

| Resolución | 14 pantallas | Con filtro | 3 cortes |
|---|---|---|---|
| 1152 × 640 | limpio | limpio | limpio |
| 1280 × 800 | limpio | limpio | limpio |
| 1366 × 768 | limpio | limpio | limpio |
| 1440 × 900 | limpio | limpio | limpio |
| 1920 × 1080 | limpio | limpio | limpio |

Dos fallas reales que el detector cazó y que la captura de pantalla no mostraba:

1. **Bucle de realimentación de flexbox.** Un SVG con tamaño fijo en píxeles dentro del flujo
   impide que su contenedor flex se achique, así que el contenedor mide lo que mide el
   contenido y el contenido mide lo que mide el contenedor. Se resolvió sacando el SVG del
   flujo con `position:absolute`. Volvió a aparecer en la tabla de M1 y se resolvió igual.
2. **Gráfico aplastado a 640 px de alto.** El de D0 quedaba en 81 px. Se recortó cromo del
   encabezado y de las tarjetas con una media query por **alto**, no por ancho, que es la
   variable que aprieta. La regla de la guía manda: si un párrafo no cabe, se corta el
   párrafo antes que achicar el gráfico.

## Impresión

14 hojas A4 apaisadas de 180 mm, una por pantalla, con corte y filtros activos en el pie de
cada hoja. Ningún gráfico por debajo de 90 px (mínimo 193). M1 imprime 16 filas.

El modo de impresión renderiza las 14 en flujo normal, no con `display:none`: el
`ResizeObserver` que dimensiona cada SVG mide cero en un elemento oculto y los gráficos
saldrían vacíos.

## Offline

| Chequeo | Resultado |
|---|---|
| `fetch(` en el bundle | **0** |
| `XMLHttpRequest`, `WebSocket`, `importScripts`, `sendBeacon` | 0 |
| `import()` dinámico | 0 |
| `<script src>` externo | 0 |
| `<link>` | 0 |
| Subrecursos pedidos en runtime | **0** (una sola petición, la del documento) |

El polyfill de `modulePreload` de Vite era el único `fetch` que quedaba. Con todo inlineado
no llegaba a disparar, pero se desactivó para que la afirmación sea estructural y no
incidental.

Peso: 1,35 MB en un archivo; 470 KB transferidos comprimidos.

## Lectura horizontal — los 14 títulos en orden

El chequeo de Knaflic cap. 7: leer solo los títulos tiene que contar la historia.

**Directorio**

1. Casi la mitad del ingreso anual de la base está en clientes hoy en riesgo por falta de compra reciente
2. No es un mal año: el 47,8 % de todo lo facturado desde 2022 está en las mismas manos
3. El riesgo sube con el valor del cliente, pero menos de lo que sugiere el total
4. El riesgo no está donde está la plata: Campeones concentra ARS 160,0 M de los 550,2 M históricos (29,1 %) y aporta ARS 15,5 M de los 94,9 M de exposición
5. La recompra pasó de 19,0 % a 8,5 % en 5 trimestres, por debajo de la línea base de 8-9 %
6. La geografía no explica el riesgo: 2,8 puntos entre la región más alta y la más baja
7. La categoría sí mueve la aguja: 15,5 puntos entre Muebles y Baño
8. Todavía no hay score que comparar: el objetivo es superar el 1,39 % del criterio actual
9. Tres decisiones, ninguna cuesta presupuesto nuevo

**Marketing**

1. La capacidad cubre entre el 20,4 % y el 32,6 % de los clientes en riesgo: el orden importa más que el alcance
2. Tres de cada diez envíos van a clientes que no dieron consentimiento
3. Los 800 de mayor exposición concentran ARS 49,5 M de los 94,9 M, y solo 568 se pueden contactar
4. El embudo termina en 1,2 %: las campañas masivas no discriminan
5. Ningún segmento se despega: entre 0,96 % y 1,39 % de compra a 7 días

Todos los títulos se recalculan con el corte y los filtros. Ninguno lleva una magnitud fija
escrita a mano, que con corte móvil sería falsa en 24 de los 25 cortes.

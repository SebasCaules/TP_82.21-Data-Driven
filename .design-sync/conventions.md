# Tablero Casa Óga — cómo construir con este sistema

Primitivas de gráfico en SVG puro para un tablero de riesgo de clientes. Sin librería de
gráficos: cada barra y cada línea es SVG generado a mano.

## Setup: no hay provider

Ningún componente lee contexto. No hay `ThemeProvider`, no hay tema que inyectar. Lo único
que hace falta es que `styles.css` esté cargado: ahí viven los tokens en `:root` y las
clases de andamio. Sin ese archivo los gráficos dibujan las formas pero pierden todo el
color de marca.

Tres componentes no se montan sueltos:

- `Plaqueta` y `ReferenciaV` devuelven `<g>`, no un `<svg>` propio. Van **dentro** de un
  `<svg>` que vos abras.
- `Tramas` devuelve `<defs>` y monta los patrones `url(#trama)` y `url(#trama-exc)`. Las
  primitivas de barra ya lo montan solas; solo lo necesitás si componés SVG a mano.

`Lienzo` es el único que mide: entrega `{ w, h }` como render prop desde el tamaño real de
su contenedor. Va adentro de un flex con alto definido (usa `flex: 1; min-height: 0`). Las
demás primitivas piden `w` y `h` explícitos y no se autoajustan.

## El idioma: tokens CSS, no clases de utilidad

No hay Tailwind ni nada parecido. El color entra por props (`tono`, `tinta`, `color`) y el
valor es siempre una custom property, nunca un hex suelto.

| Familia | Tokens | Para qué |
|---|---|---|
| Énfasis | `--acc` | el único color de énfasis, una cosa por gráfico |
| Excepción | `--terra`, `--terra-osc` | SOLO lo que no se puede ejecutar: sin consentimiento, fuera de meta, no contactable. Nunca significa "acá mirá" |
| Estado | `--sem-meta`, `--sem-cerca`, `--sem-fuera` | reservados al semáforo, jamás en una serie |
| Series | `--gris`, `--gris2`, `--azul3`, `--azul1`, `--sel` | todo lo que no es el énfasis |
| Trama | `'trama'`, `'trama-exc'` | valores especiales de `tono`, no colores: resuelven a los patrones de `Tramas` |
| Superficie | `--papel`, `--sup`, `--lat`, `--bd`, `--bd2`, `--trk`, `--zona` | fondo, tarjeta, hairlines, lavado de zona |
| Texto | `--ink`, `--lbl`, `--mut`, `--mut2`, `--eje` | tinta, etiqueta, secundario, ejes |
| Tipografía | `--fuente`, `--mono` | stacks del sistema. No hay webfonts y no puede haberlas |

`rampa(i)` devuelve `{ tono, tinta }` del escalón i cuando una vista necesita varias series
de la misma familia sin inventar colores.

## Las clases que existen

Pocas, para el andamio alrededor del gráfico: `.pant` (la pantalla), `.titulo`, `.bajada`,
`.lienzo`, `.tarjeta`, `.kpi-lbl`, `.kpi-sub`, `.tabular` (cifras alineadas), `.chip-f` y
`.chip-claro` (controles), `.sem` (la pastilla de estado, la monta `Semaforo`). Todo lo
demás se resuelve con estilos inline sobre los tokens de arriba.

## Reglas que el sistema hace cumplir

- Ninguna lectura depende solo del color: siempre hay forma, trama, posición o rótulo. Esto
  se imprime en blanco y negro y se proyecta.
- Toda tasa lleva su base escrita. `BarrasApiladas100` la pide en `sub` justamente porque
  normaliza contra el total de cada fila: dos barras del mismo largo sobre bases distintas
  no son dos poblaciones iguales.
- Un solo énfasis por gráfico.
- Nada scrollea: cada vista entra en una pantalla.

## Dónde está la verdad

- `styles.css` y lo que importa: los tokens y las clases tal cual se sirven.
- `components/general/<Nombre>/<Nombre>.prompt.md`: props reales y ejemplos por componente.
- `guidelines/docs/diseno-pantallas.md`: el registro de diseño de las 14 vistas del tablero,
  con la razón de cada decisión.

## Ejemplo

```jsx
<section className="pant">
  <h1 className="titulo">Q5 marca 51,8 % y Q1 13,3 %: el salto es composición</h1>
  <p className="bajada">La cuña de no elegibles se derrite de Q1 a Q5.</p>
  <div className="lienzo">
    <Lienzo>
      {({ w, h }) => (
        <BarrasApiladas100
          w={w} h={h} anchoEtiqueta={78}
          tituloEje="Composición del quintil (% sobre sus clientes)"
          filas={[{
            etiqueta: 'Q5', sub: 'mayor valor', enfasis: true,
            segmentos: [
              { clave: 'En riesgo', valor: 619, tono: 'var(--acc)', tinta: '#fff',
                enfasis: true, plaqueta: true, texto: '51,8 %' },
              { clave: 'Elegible sin riesgo', valor: 569, tono: 'var(--gris)' },
              { clave: 'No elegible', valor: 8, tono: 'trama' },
            ],
          }]}
          referencia={{ valor: 41.0, etiqueta: 'general 41,0 %' }} />
      )}
    </Lienzo>
  </div>
</section>
```

import { Lienzo, Linea, BarrasH } from 'tablero-casa-oga'

const caja: React.CSSProperties = { display: 'flex', width: 880, height: 300 }
const pc = (v: number) => `${v.toFixed(1).replace('.', ',')} %`
const millones = (v: number) => `ARS ${(v / 1e6).toFixed(1).replace('.', ',')} M`

const RECOMPRA = [
  { etiqueta: "'24Q1", valor: 18.28 }, { etiqueta: "'24Q2", valor: 19.03 },
  { etiqueta: "'24Q3", valor: 18.42 }, { etiqueta: "'24Q4", valor: 18.61 },
  { etiqueta: "'25Q1", valor: 16.0 }, { etiqueta: "'25Q2", valor: 12.91 },
  { etiqueta: "'25Q3", valor: 8.5 },
]

/** Lienzo es el unico componente que MIDE. Todas las primitivas piden w y h explicitos, y
 *  este los provee como render prop a partir del alto y ancho reales del contenedor. Va
 *  dentro de un flex con alto definido: usa flex 1 y minHeight 0. */
export const MidiendoUnaLinea = () => (
  <div style={caja}>
    <Lienzo>
      {({ w, h }) => (
        <Linea serie={RECOMPRA} w={w} h={h} formato={pc}
               banda={[10, 11]} rotuloBanda="meta"
               tituloY="% que recompra en 90 dias" tituloEje="Trimestre" />
      )}
    </Lienzo>
  </div>
)

/** El mismo contenedor con otra primitiva adentro: lo que cambia es el hijo, no la caja.
 *  Con la mitad del alto, el grafico se recalcula en vez de recortarse. */
export const MismaCajaOtraPrimitiva = () => (
  <div style={{ ...caja, height: 200 }}>
    <Lienzo>
      {({ w, h }) => (
        <BarrasH
          datos={[
            { etiqueta: 'AMBA', valor: 40514582, enfasis: true },
            { etiqueta: 'Centro', valor: 19671043 },
            { etiqueta: 'NOA', valor: 16082440 },
          ]}
          w={w} h={h} anchoEtiqueta={90} formato={millones} formatoEje={millones}
          tituloEje="Exposicion anual por region" />
      )}
    </Lienzo>
  </div>
)

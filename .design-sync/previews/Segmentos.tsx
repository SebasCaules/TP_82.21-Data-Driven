import { Segmentos } from 'tablero-casa-oga'

const fila: React.CSSProperties = { display: 'flex', gap: 20, alignItems: 'center', padding: 4 }
const chip: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px',
  border: '1px solid var(--bd)', borderRadius: 3, background: 'var(--sup)',
  font: '600 11px/1.45 var(--fuente)', color: 'var(--lbl)',
}
const Chip = ({ children }: { children: React.ReactNode }) => <span style={chip}>{children}</span>

/** Racimo: los segmentos, agrupados y de distinto peso. Monolinea, trazo 1.4 a 1.5, siempre en currentColor: hereda el color
 *  del texto que lo acompana en vez de traer uno propio. */
export const Tamanos = () => (
  <div style={fila}>
    <Segmentos />
    <Segmentos width={20} height={20} />
    <Segmentos width={32} height={32} />
    <Segmentos width={48} height={48} />
  </div>
)

/** En currentColor: el mismo icono toma el color del contenedor. El ultimo va en el
 *  terracota de excepcion. */
export const HeredaElColor = () => (
  <div style={fila}>
    <span style={{ color: 'var(--ink)' }}><Segmentos width={28} height={28} /></span>
    <span style={{ color: 'var(--acc)' }}><Segmentos width={28} height={28} /></span>
    <span style={{ color: 'var(--mut)' }}><Segmentos width={28} height={28} /></span>
    <span style={{ color: 'var(--terra)' }}><Segmentos width={28} height={28} /></span>
  </div>
)

/** Donde va de verdad: adentro del chip de filtro, al lado del valor elegido. Fuera de los
 *  filtros no se usa, porque en la etiqueta de un grafico compite con el dato. */
export const EnElChipDeFiltro = () => (
  <div style={fila}>
    <Chip><Segmentos width={14} height={14} /> Campeones</Chip>
      <Chip><Segmentos width={14} height={14} /> Hibernando</Chip>
  </div>
)

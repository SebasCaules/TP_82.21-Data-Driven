import { Escalera } from 'tablero-casa-oga'

const fila: React.CSSProperties = { display: 'flex', gap: 20, alignItems: 'center', padding: 4 }
const chip: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px',
  border: '1px solid var(--bd)', borderRadius: 3, background: 'var(--sup)',
  font: '600 11px/1.45 var(--fuente)', color: 'var(--lbl)',
}
const Chip = ({ children }: { children: React.ReactNode }) => <span style={chip}>{children}</span>

/** Escalera: los quintiles de valor. Monolinea, trazo 1.4 a 1.5, siempre en currentColor: hereda el color
 *  del texto que lo acompana en vez de traer uno propio. */
export const Tamanos = () => (
  <div style={fila}>
    <Escalera />
    <Escalera width={20} height={20} />
    <Escalera width={32} height={32} />
    <Escalera width={48} height={48} />
  </div>
)

/** En currentColor: el mismo icono toma el color del contenedor. El ultimo va en el
 *  terracota de excepcion. */
export const HeredaElColor = () => (
  <div style={fila}>
    <span style={{ color: 'var(--ink)' }}><Escalera width={28} height={28} /></span>
    <span style={{ color: 'var(--acc)' }}><Escalera width={28} height={28} /></span>
    <span style={{ color: 'var(--mut)' }}><Escalera width={28} height={28} /></span>
    <span style={{ color: 'var(--terra)' }}><Escalera width={28} height={28} /></span>
  </div>
)

/** Donde va de verdad: adentro del chip de filtro, al lado del valor elegido. Fuera de los
 *  filtros no se usa, porque en la etiqueta de un grafico compite con el dato. */
export const EnElChipDeFiltro = () => (
  <div style={fila}>
    <Chip><Escalera width={14} height={14} /> Q4</Chip>
      <Chip><Escalera width={14} height={14} /> Q1</Chip>
  </div>
)

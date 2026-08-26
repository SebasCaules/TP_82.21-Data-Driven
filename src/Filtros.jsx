// Filtros. Cada dimensión es un botón desplegable con su icono, su valor actual y su
// caret: los tres son afordancia, no adorno. Antes eran cajas de texto con un borde fino y
// no se leían como algo que se puede tocar.
//
// El <select> nativo va encima, transparente: teclado, lector de pantalla y el desplegable
// del sistema salen gratis, y el chip es solo la piel.

import { dims, hayFiltro } from './agregacion.js'
import { Escalera, Region, Segmentos, Categoria } from './Iconos.jsx'

const DIMENSIONES = [
  { id: 'region', etq: 'Región', Icono: Region },
  { id: 'categoria', etq: 'Categoría', Icono: Categoria },
  { id: 'rfm', etq: 'Segmento', Icono: Segmentos },
  { id: 'quintil', etq: 'Quintil', Icono: Escalera },
]

export function etiquetaValor(dim, v) {
  return dim === 'quintil' ? `Q${dims.quintil[v]}` : dims[dim][v]
}

function Caret() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true" className="caret">
      <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Filtros({ filtro, setFiltro, activos, reiniciar, modificado }) {
  const puestos = DIMENSIONES.filter(({ id }) => filtro[id] !== null).length

  return (
    <div className={`filtros${activos ? '' : ' inertes'}`}>
      <span className="filtros-lbl">
        Filtrar por
        {puestos > 0 && <b className="tabular">{puestos}</b>}
      </span>

      {DIMENSIONES.map(({ id, etq, Icono }) => {
        const puesto = filtro[id] !== null
        return (
          <span key={id} className={`chip-f${puesto ? ' on' : ''}`}>
            <select
              aria-label={etq}
              disabled={!activos}
              value={puesto ? filtro[id] : ''}
              onChange={(e) => setFiltro({
                ...filtro,
                [id]: e.target.value === '' ? null : Number(e.target.value),
              })}
            >
              <option value="">Todas las {etq.toLowerCase()}s</option>
              {dims[id].map((v, i) => (
                <option key={v} value={i}>{id === 'quintil' ? `Q${v}` : v}</option>
              ))}
            </select>

            <Icono width={12} height={12} aria-hidden="true" />
            <span className="chip-f-txt" aria-hidden="true">
              {puesto ? etiquetaValor(id, filtro[id]) : etq}
            </span>

            {puesto && activos ? (
              <button type="button" className="chip-f-x"
                      onClick={(e) => { e.stopPropagation(); setFiltro({ ...filtro, [id]: null }) }}
                      aria-label={`Quitar el filtro de ${etq}`}>×</button>
            ) : <Caret />}
          </span>
        )
      })}

      {!activos && <span className="filtros-nota">no aplican en esta vista</span>}

      {modificado && activos && (
        <button type="button" className="chip-f reset" onClick={reiniciar}
                title="Volver al estado inicial (Esc)">
          <span className="chip-f-txt">Limpiar</span>
        </button>
      )}
    </div>
  )
}

export { DIMENSIONES }

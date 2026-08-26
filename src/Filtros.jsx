// Filtros. Cada dimensión es un chip que muestra SU VALOR ACTUAL, no solo su nombre: antes
// los cuatro decían "Región: todas" y había que leerlos enteros para saber si estaba puesto.
// Ahora el chip activo se invierte, lleva el valor y trae su propia ✕.
//
// Debajo, un <select> nativo transparente: teclado, lector de pantalla y el desplegable del
// sistema salen gratis, y el chip es solo la piel.

import { dims, hayFiltro } from './agregacion.js'

const DIMENSIONES = [
  { id: 'region', etq: 'Región' },
  { id: 'categoria', etq: 'Categoría' },
  { id: 'rfm', etq: 'Segmento' },
  { id: 'quintil', etq: 'Quintil' },
]

export function etiquetaValor(dim, v) {
  return dim === 'quintil' ? `Q${dims.quintil[v]}` : dims[dim][v]
}

export default function Filtros({ filtro, setFiltro, activos, corteInicial, reiniciar, modificado }) {
  return (
    <div className={`filtros${activos ? '' : ' inertes'}`}>
      <span className="filtros-lbl">Filtros</span>

      {DIMENSIONES.map(({ id, etq }) => {
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
              <option value="">{etq}: todas</option>
              {dims[id].map((v, i) => (
                <option key={v} value={i}>{id === 'quintil' ? `Q${v}` : v}</option>
              ))}
            </select>
            <span className="chip-f-txt" aria-hidden="true">
              {puesto ? <><i>{etq}</i> {etiquetaValor(id, filtro[id])}</> : etq}
            </span>
            {puesto && activos && (
              <button type="button" className="chip-f-x"
                      onClick={() => setFiltro({ ...filtro, [id]: null })}
                      aria-label={`Quitar el filtro de ${etq}`}>×</button>
            )}
          </span>
        )
      })}

      {!activos && <span className="filtros-nota">no aplican en esta vista</span>}

      {modificado && (
        <button type="button" className="chip-f reset" onClick={reiniciar}
                title="Volver al estado inicial (Esc)">
          <span className="chip-f-txt">volver al inicio</span>
        </button>
      )}
    </div>
  )
}

export { DIMENSIONES }

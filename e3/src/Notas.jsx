// Notas del orador de /e3/ (27/10, W1, decisión N0-6). El guion de C3 de las diapositivas de las que
// sale la vista, con quién lo dice y su tiempo. Dos formas, las dos fuera del tablero:
// - el panel (N), debajo: la caja del tablero se achica para dejarle lugar, nunca lo tapa;
// - la ventana aparte («Abrir en otra ventana» del panel, o la dirección con ?notas): solo las notas,
//   para la laptop mientras el proyector muestra el tablero. Las dos ventanas se siguen (App.jsx).
// Van en píxeles reales, sin el zoom del tablero: son para quien presenta.

import { C3 } from './contenido_e3.js'
import { VISTAS, TOTAL_VISTAS, diapositivasDe, etiquetaDe } from './vistas/index.jsx'
import { mmss } from './formato.js'
import { Rico } from './texto.jsx'

function Cuerpo({ vista }) {
  const ds = diapositivasDe(vista)
  const segundos = ds.reduce((s, d) => s + (d.segundos || 0), 0)
  const i = VISTAS.indexOf(vista)
  const sigue = VISTAS[i + 1] && !VISTAS[i + 1].respaldo ? VISTAS[i + 1] : null
  return (
    <>
      <p className="e3-notas-cab">
        <b>{vista.respaldo ? `Anexo ${vista.id}` : `${etiquetaDe(vista).replace(/^0/, '')} / ${TOTAL_VISTAS}`}</b>
        {' · '}{vista.pregunta}
        {ds.length > 0 && <span>{` · ${[...new Set(ds.map((d) => d.quien))].join(', ')} · ${mmss(segundos)}`}</span>}
        <span>{` · total ${mmss(C3.TIEMPOS.total_s)}`}</span>
      </p>
      <div className="e3-notas-txt">
        {vista.respaldo && <p>Respaldo para preguntas. Fuente: {vista.anexo.fuente}.</p>}
        {!vista.respaldo && ds.length === 0 && <p>Esta vista todavía no tiene guion en C3.</p>}
        {ds.map((d) => (
          <p key={d.n}><span className="e3-notas-quien">{d.quien}</span><Rico t={d.guion} /></p>
        ))}
      </div>
      {sigue && <p className="e3-notas-sigue">Sigue: {sigue.pregunta}</p>}
    </>
  )
}

/** Panel de notas, debajo del tablero (N). */
export function PanelNotas({ vista, alto, onVentana }) {
  return (
    <aside className="e3-notas" style={{ height: alto }} aria-label="Notas del orador">
      <button type="button" className="e3-notas-abrir" onClick={onVentana}>Abrir en otra ventana</button>
      <Cuerpo vista={vista} />
    </aside>
  )
}

/** Ventana aparte con solo las notas. */
export function VentanaNotas({ vista }) {
  return (
    <div className="e3-notas e3-notas-ventana" aria-label="Notas del orador">
      <Cuerpo vista={vista} />
      <p className="e3-notas-ayuda">Av Pág y Re Pág, o las flechas, pasan de vista en las dos ventanas.</p>
    </div>
  )
}

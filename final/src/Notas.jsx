// Notas del orador de /final/ (17/11). Es e3/src/Notas.jsx con el guion de la presentación en lugar del de C3, y
// un renglón más: quién presenta la vista y el tiempo acumulado de su bloque. Las mismas dos formas, fuera del tablero:
// - el panel (N), debajo: la caja del tablero se achica para dejarle lugar, nunca lo tapa;
// - la ventana aparte («Abrir en otra ventana» del panel, o la dirección con ?notas): solo las notas, para la laptop
//   mientras el proyector muestra el tablero. Las dos ventanas se siguen (App.jsx).
// Van en píxeles reales, sin el zoom del tablero, con las clases .e3-notas* de estilos_e3.css. Sin temporizador en vivo:
// los tiempos son los de CF (segundos de cada vista, sumados por vistas/index.jsx).
// (18/11, canon v1.3) El texto sale de notas_final.js, que exporta el guion (exportar_notas.py): las frases que no se
// saltan en la versión de 15 minutos. Una sola fuente para lo que se dice; acá no se escribe guion.

import { CF } from './contenido_final.js'
import { NOTAS } from './notas_final.js'
import { VISTAS, TOTAL_VISTAS, etiquetaDe, grupoDe, tiemposDe } from './vistas/index.jsx'
import { mmss } from '../../e3/src/formato.js'
import { Rico } from '../../e3/src/texto.jsx'

function Cuerpo({ vista }) {
  const t = tiemposDe(vista)
  const bloque = grupoDe(vista)
  const objetivo = CF.TIEMPOS?.objetivo_s
  const i = VISTAS.indexOf(vista)
  const sigue = VISTAS[i + 1] ?? null
  const notas = NOTAS[vista.id] ?? []
  return (
    <>
      <p className="e3-notas-cab">
        <b>{`${etiquetaDe(vista).replace(/^0/, '')} / ${TOTAL_VISTAS}`}</b>
        {' · '}{vista.pregunta}
        <span>{` · ${mmss(t.vista)}`}</span>
        <span>{` · total ${mmss(t.totalHasta)} de ${mmss(objetivo ?? t.total)}`}</span>
      </p>
      <p className="e3-notas-cab fin-notas-quien">
        <b>{`Presenta ${vista.integrante}`}</b>
        {` · ${bloque.titulo}: ${mmss(t.bloqueHasta)} de ${mmss(t.bloque)}`}
      </p>
      <div className="e3-notas-txt">
        {notas.length === 0 && <p>Esta vista no tiene guion en notas_final.js.</p>}
        {notas.map((p, j) => (
          <p key={j}><Rico t={p} /></p>
        ))}
      </div>
      {sigue && (
        <p className="e3-notas-sigue">
          Sigue: {sigue.pregunta}{sigue.integrante !== vista.integrante ? ` · presenta ${sigue.integrante}` : ''}
        </p>
      )}
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

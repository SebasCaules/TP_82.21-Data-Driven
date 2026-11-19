// Notas del orador de /final/ (17/11). Es e3/src/Notas.jsx con el guion de la presentación en lugar del de C3, y
// un renglón más: quién presenta la vista y el tiempo acumulado de su bloque. Las mismas dos formas, fuera del tablero:
// - el panel (N), debajo: la caja del tablero se achica para dejarle lugar, nunca lo tapa;
// - la ventana aparte («Abrir en otra ventana» del panel, o la dirección con ?notas): solo las notas, para la laptop
//   mientras el proyector muestra el tablero. Las dos ventanas se siguen (App.jsx).
// Van en píxeles reales, sin el zoom del tablero, con las clases .e3-notas* de estilos_e3.css. Sin temporizador en vivo:
// los tiempos son los de CF (segundos de cada vista, sumados por vistas/index.jsx).
// (18/11, canon v1.3) El texto sale de notas_final.js, que exporta el guion (exportar_notas.py): las frases que no se
// saltan en la versión de 15 minutos. Una sola fuente para lo que se dice; acá no se escribe guion.
// (19/11, fase 9, spec 2.1) Con más de un paso, la cabecera dice «paso k de N» después de «n / 16» (App.jsx pasa el paso
// vigente; las dos ventanas están siempre en el mismo). (fase 10) N llega hasta 6; el renglón no cambia.
// (19/11, fase 11) La cabecera lleva la referencia al informe de la vista (vista.referencia.rotulo, vistas/index.jsx),
// la misma del botón de información del encabezado. El guion pasa a dar lo que se dice paso por paso: las notas aceptan
// las dos formas (una lista de párrafos, o párrafos con su paso; ver normalizar) y, con pasos, marcan «▸ paso k» donde
// se aprieta la tecla y resaltan el paso vigente. Una vista sin notas (por ejemplo, una vista nueva que el guion
// todavía no exportó) lo dice y no rompe nada.

import { useEffect, useRef } from 'react'
import { CF } from './contenido_final.js'
import { NOTAS } from './notas_final.js'
import { VISTAS, TOTAL_VISTAS, etiquetaDe, grupoDe, tiemposDe } from './vistas/index.jsx'
import { mmss } from '../../e3/src/formato.js'
import { Rico } from '../../e3/src/texto.jsx'

const esTexto = (x) => typeof x === 'string' && x.trim() !== ''
const textos = (x) => (Array.isArray(x) ? x.filter(esTexto) : esTexto(x) ? [x] : [])

/** Las notas de una vista como grupos { paso, parrafos }, en orden; `paso` es null si el guion no lo dice. Acepta:
 *  - una lista de párrafos (la forma de la fase 10): ['…', '…'] → un grupo sin paso;
 *  - una lista por paso: [['…'], ['…', '…']] o ['…', ['…']] cuando cada elemento es un arreglo;
 *  - objetos con su paso: [{ paso: 1, texto | frases | parrafos | dice }, …] (los que no traen paso van sin paso);
 *  - un objeto por paso: { 1: [...], 2: '…' } o { pasos: [...] }.
 *  Lo que no entiende, lo deja afuera. */
export function normalizar(entrada) {
  if (entrada == null) return []
  if (!Array.isArray(entrada) && typeof entrada === 'object') {
    if (Array.isArray(entrada.pasos)) {
      return entrada.pasos.map((x, i) => ({ paso: i + 1, parrafos: textos(x) })).filter((g) => g.parrafos.length)
    }
    return Object.entries(entrada)
      .filter(([k]) => /^\d+$/.test(k))
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([k, x]) => ({ paso: Number(k), parrafos: textos(x) }))
      .filter((g) => g.parrafos.length)
  }
  if (!Array.isArray(entrada)) return esTexto(entrada) ? [{ paso: null, parrafos: [entrada] }] : []
  if (entrada.every((x) => typeof x === 'string')) return entrada.length ? [{ paso: null, parrafos: textos(entrada) }] : []
  const grupos = []
  entrada.forEach((x, i) => {
    if (Array.isArray(x)) grupos.push({ paso: i + 1, parrafos: textos(x) })
    else if (x && typeof x === 'object') {
      const p = Number.isInteger(x.paso) ? x.paso : null
      const parrafos = textos(x.texto ?? x.frases ?? x.parrafos ?? x.dice)
      const previo = grupos[grupos.length - 1]
      if (previo && previo.paso === p) previo.parrafos.push(...parrafos)
      else grupos.push({ paso: p, parrafos })
    } else if (esTexto(x)) {
      // un texto suelto entre pasos: en una lista por paso, es su paso; si no, sin paso
      grupos.push({ paso: entrada.some(Array.isArray) ? i + 1 : null, parrafos: [x] })
    }
  })
  return grupos.filter((g) => g.parrafos.length)
}

function Cuerpo({ vista, paso = 1, pasos = 1 }) {
  const t = tiemposDe(vista)
  const bloque = grupoDe(vista)
  const objetivo = CF.TIEMPOS?.objetivo_s
  const i = VISTAS.indexOf(vista)
  const sigue = VISTAS[i + 1] ?? null
  const grupos = normalizar(NOTAS?.[vista.id])
  const conPasos = grupos.some((g) => g.paso != null)
  const caja = useRef(null)
  // con pasos, el del paso vigente queda a la vista dentro del panel
  useEffect(() => {
    if (!conPasos) return
    caja.current?.querySelector('.fin-notas-actual')?.scrollIntoView?.({ block: 'nearest' })
  }, [conPasos, paso, vista.id])
  return (
    <>
      <p className="e3-notas-cab">
        <b>{`${etiquetaDe(vista).replace(/^0/, '')} / ${TOTAL_VISTAS}`}</b>
        {pasos > 1 && <b className="fin-notas-paso">{` · paso ${paso} de ${pasos}`}</b>}
        {' · '}{vista.pregunta}
        {vista.referencia && <span>{` · ${vista.referencia.rotulo}`}</span>}
        <span>{` · ${mmss(t.vista)}`}</span>
        <span>{` · total ${mmss(t.totalHasta)} de ${mmss(objetivo ?? t.total)}`}</span>
      </p>
      <p className="e3-notas-cab fin-notas-quien">
        <b>{`Presenta ${vista.integrante}`}</b>
        {` · ${bloque.titulo}: ${mmss(t.bloqueHasta)} de ${mmss(t.bloque)}`}
      </p>
      <div className="e3-notas-txt" ref={caja}>
        {grupos.length === 0 && <p>Esta vista todavía no tiene notas: el guion no las exportó (notas_final.js).</p>}
        {grupos.map((g, j) => {
          const actual = conPasos && g.paso === paso
          const clase = conPasos ? (actual ? 'fin-notas-grupo fin-notas-actual' : 'fin-notas-grupo fin-notas-otro') : undefined
          return (
            <div key={j} className={clase}>
              {g.paso != null && <p className="fin-notas-marca">{`▸ paso ${g.paso}`}</p>}
              {g.parrafos.map((p, k) => <p key={k}><Rico t={p} /></p>)}
            </div>
          )
        })}
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
export function PanelNotas({ vista, paso, pasos, alto, onVentana }) {
  return (
    <aside className="e3-notas" style={{ height: alto }} aria-label="Notas del orador">
      <button type="button" className="e3-notas-abrir" onClick={onVentana}>Abrir en otra ventana</button>
      <Cuerpo vista={vista} paso={paso} pasos={pasos} />
    </aside>
  )
}

/** Ventana aparte con solo las notas. */
export function VentanaNotas({ vista, paso, pasos }) {
  return (
    <div className="e3-notas e3-notas-ventana" aria-label="Notas del orador">
      <Cuerpo vista={vista} paso={paso} pasos={pasos} />
      <p className="e3-notas-ayuda">Av Pág y Re Pág, o las flechas, avanzan y retroceden paso a paso en las dos ventanas.</p>
    </div>
  )
}

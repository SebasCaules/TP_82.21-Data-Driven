// Marco común de las vistas y los anexos, en coordenadas del escenario de 1600 × 900.
//
// (27/10, pedido del usuario) Con la forma de los tableros del E1 y el E2: un riel a la izquierda con
// los capítulos de la historia (cada uno, una pregunta) y, en cada vista, la pregunta grande arriba y la
// respuesta en una línea debajo. Lo que sigue en la vista es la evidencia. Sin rótulo de sección: el
// capítulo ya lo dice el riel. El pie lleva la marca, la fuente y quién la presenta.

import { createContext, useContext } from 'react'
import { C3 } from '../contenido_e3.js'
import MarcaInicio from '../MarcaInicio.jsx'
import { Rico } from '../texto.jsx'
import { CAPITULOS } from './index.js'

export const TOTAL = C3.DIAPOSITIVAS.length
export const RIEL = 216         // ancho del riel
export const M = 256            // arranque del contenido
export const ANCHO = 1600 - M - 56
export const Y0 = 214           // arranque del cuerpo, debajo de la pregunta y la respuesta

/** Navegación desde el riel: App.jsx la provee; en las miniaturas no hay y el riel no navega. */
export const NavCtx = createContext(null)

/** style de una caja absoluta en coordenadas del escenario. */
export const caja = (x, y, w, h) => ({ left: x, top: y, width: w, ...(h != null ? { height: h } : {}) })

/** El pie de C3 («Casa Óga · Entregable 3 · …») con la marca como enlace a la landing. */
export function PieMarca({ className = '' }) {
  const i = C3.PIE.indexOf(' · ')
  return (
    <span className={className}>
      <MarcaInicio>{C3.PIE.slice(0, i)}</MarcaInicio>
      {C3.PIE.slice(i)}
    </span>
  )
}

function Riel({ n, anexo }) {
  const nav = useContext(NavCtx)
  const ir = (id) => nav?.ir(id)
  const tab = nav ? 0 : -1
  return (
    <nav className="e3-riel" aria-label="Capítulos">
      <button type="button" className="e3-riel-marca" tabIndex={tab} onClick={() => ir('1')}>
        <b>Casa Óga</b>
        <span>Entregable 3</span>
      </button>
      {CAPITULOS.map((c, k) => (
        <div key={k} className="e3-riel-cap">
          {c.nombre && <p className="e3-riel-nombre">{c.nombre}</p>}
          {c.vistas.map(([v, corto]) => (
            <button key={v} type="button" tabIndex={tab} onClick={() => ir(String(v))}
                    className={`e3-riel-item ${v === n ? 'on' : ''}`} aria-current={v === n ? 'page' : undefined}>
              <span className="e3-riel-n" data-escala="">{String(v).padStart(2, '0')}</span>{corto}
            </button>
          ))}
        </div>
      ))}
      <div className="e3-riel-cap">
        <p className="e3-riel-nombre">Respaldo</p>
        <div className="e3-riel-anexos">
          {C3.ANEXOS.map((a) => (
            <button key={a.n} type="button" tabIndex={tab} onClick={() => ir(a.n.toLowerCase())}
                    className={`e3-riel-chip ${anexo === a.n ? 'on' : ''}`} title={a.titulo}
                    aria-current={anexo === a.n ? 'page' : undefined}>
              <span data-escala="">{a.n}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="e3-riel-ayuda">→ sigue · N notas · F pantalla completa</p>
    </nav>
  )
}

export default function Marco({ pregunta, titulo, fuente, n, anexo, derecha, children, clase = '' }) {
  return (
    <div className={`e3-dia ${clase}`}>
      <Riel n={n} anexo={anexo} />
      <div className="e3-avance" aria-hidden="true">
        {n != null && <i style={{ width: `${(100 * (n - 1)) / (TOTAL - 1)}%` }} />}
      </div>
      {pregunta ? (
        <>
          <h1 className="e3-pregunta"><Rico t={pregunta} /></h1>
          <p className="e3-respuesta"><Rico t={titulo} /></p>
        </>
      ) : <h1 className="e3-pregunta e3-pregunta-sola"><Rico t={titulo} /></h1>}
      {children}
      <footer className="e3-pie">
        <PieMarca className="e3-pie-izq" />
        <span className="e3-pie-centro">{fuente ? 'Fuente: ' + fuente : ''}</span>
        <span className="e3-pie-der">{derecha}</span>
      </footer>
    </div>
  )
}

/** «Sebastian C. · 3 / 12»: el número va marcado como navegación, no como cifra del documento. */
export function QuienN({ quien, n }) {
  return <span>{quien}{'  ·  '}<span data-escala="">{n}{' / '}{TOTAL}</span></span>
}

// Diapositiva 5: el stack del MVP (A 1.5 y 1.6). Flujo de cinco pasos y tres hechos, como el PPTX.
import { Fragment } from 'react'
import { Rico } from '../texto.jsx'
import Marco, { ANCHO, M, QuienN, Y0, caja } from './Marco.jsx'

export default function Mvp({ d }) {
  const n = d.pasos.length
  const sep = 46
  const w = (ANCHO - sep * (n - 1)) / n
  const m = d.hechos.length
  const w2 = (ANCHO - 30 * (m - 1)) / m
  return (
    <Marco kicker={d.kicker} titulo={d.titulo} fuente={d.fuente} n={d.n} derecha={<QuienN quien={d.quien} n={d.n} />}>
      {d.pasos.map((p, k) => (
        <Fragment key={p.titulo}>
          <div className="e3-tarjeta e3-paso" style={caja(M + k * (w + sep), Y0, w, 374)}>
            <span className="e3-paso-n">{k + 1}</span>
            <p className="e3-paso-titulo"><Rico t={p.titulo} /></p>
            <p className="e3-paso-texto"><Rico t={p.texto} /></p>
          </div>
          {k < n - 1 && (
            <svg className="e3-flecha-paso" style={caja(M + k * (w + sep) + w + 7, Y0 + 168, 32, 38)} aria-hidden="true">
              <path d="M0,10 H18 V0 L32,19 L18,38 V28 H0 Z" />
            </svg>
          )}
        </Fragment>
      ))}
      {d.hechos.map((h, k) => (
        <div key={k} className="e3-hecho" style={caja(M + k * (w2 + 30), 636, w2, 174)}>
          <p className="e3-hecho-valor"><Rico t={h.valor} /></p>
          <p className="e3-hecho-texto"><Rico t={h.texto} /></p>
        </div>
      ))}
    </Marco>
  )
}

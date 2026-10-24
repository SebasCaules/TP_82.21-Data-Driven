// Diapositiva 11: riesgos (C 6.2 y 6.3). Los tres críticos, como el PPTX. (24/10) Un botón muestra
// la matriz de los 13 (probabilidad por impacto) del anexo A4 de C3, con los tres críticos
// resaltados; el texto de cada riesgo aparece al pasar el puntero o al tocarlo.
import { Fragment, useState } from 'react'
import { C3 } from '../contenido_e3.js'
import { Rico } from '../texto.jsx'
import Marco, { ANCHO, M, QuienN, Y0, caja } from './Marco.jsx'

const A4 = C3.ANEXOS.find((a) => a.n === 'A4')
const COL = Object.fromEntries(A4.columnas.map((c, k) => [c, k]))
const RIESGOS = A4.filas.map((f, k) => ({
  n: f[COL['#']], tipo: f[COL['Tipo']], texto: f[COL['Riesgo']], prob: f[COL['Prob.']], imp: f[COL['Impacto']],
  estrategia: f[COL['Estrategia']], critico: A4.destacar.includes(k),
}))
const NIVELES = ['A', 'M', 'B']                    // alta arriba; el impacto crece a la derecha
const NOMBRE = { A: 'alta', M: 'media', B: 'baja' }

function Matriz({ estatico }) {
  const criticos = RIESGOS.filter((r) => r.critico)
  const [sel, setSel] = useState(criticos[0]?.n)
  const r = RIESGOS.find((x) => x.n === sel)
  const impactos = [...NIVELES].reverse()
  return (
    <div className="e3-matriz" style={caja(M, Y0, ANCHO, 500)}>
      <div className="e3-matriz-grilla" role="group" aria-label="Matriz de riesgos: probabilidad por impacto">
        <span className="e3-matriz-eje-y">Probabilidad</span>
        {NIVELES.map((p) => (
          <Fragment key={p}>
            <span className="e3-matriz-niv">{NOMBRE[p]}</span>
            {impactos.map((im) => (
              <div key={im} className={`e3-matriz-celda ${p === 'A' && im === 'A' ? 'peor' : ''}`}>
                {RIESGOS.filter((x) => x.prob === p && x.imp === im).map((x) => (
                  <button key={x.n} type="button" className={`e3-chip ${x.critico ? 'critico' : ''} ${x.n === sel ? 'on' : ''}`}
                          tabIndex={estatico ? -1 : 0} data-control="" aria-label={`Riesgo ${x.n}: ${x.texto}`}
                          onMouseEnter={() => setSel(x.n)} onFocus={() => setSel(x.n)} onClick={() => setSel(x.n)}>
                    {x.n}
                  </button>
                ))}
              </div>
            ))}
          </Fragment>
        ))}
        <span /><span />
        {impactos.map((im) => <span key={im} className="e3-matriz-niv x">{NOMBRE[im]}</span>)}
        <span /><span />
        <span className="e3-matriz-eje-x">Impacto</span>
      </div>
      <div className="e3-matriz-detalle">
        {r && (
          <>
            <p className="e3-rotulo">Riesgo {r.n} · {r.tipo}{r.critico ? ' · crítico' : ''}</p>
            <p className="e3-matriz-texto">{r.texto}</p>
            <p className="e3-matriz-dato">Probabilidad {NOMBRE[r.prob]} · impacto {NOMBRE[r.imp]} · {r.estrategia}</p>
          </>
        )}
        <p className="e3-matriz-leyenda"><i className="e3-chip critico muestra" aria-hidden="true" /> En azul, los tres críticos de la diapositiva.</p>
      </div>
    </div>
  )
}

export default function Riesgos({ d, estatico }) {
  const [matriz, setMatriz] = useState(false)
  const sep = 36
  const w = (ANCHO - sep * (d.columnas.length - 1)) / d.columnas.length
  return (
    <Marco kicker={d.kicker} titulo={d.titulo} fuente={d.fuente} n={d.n} derecha={<QuienN quien={d.quien} n={d.n} />}>
      {matriz ? <Matriz estatico={estatico} /> : d.columnas.map((c, k) => (
        <div key={c.n} className={`e3-tarjeta e3-riesgo ${k === 0 ? 'malo' : ''}`} style={caja(M + k * (w + sep), Y0, w, 498)}>
          <div className="e3-riesgo-cab">
            <span className="e3-riesgo-n">{c.n}</span>
            <p className="e3-riesgo-titulo"><Rico t={c.riesgo} /></p>
          </div>
          {c.filas.map((f) => (
            <div key={f.rotulo} className="e3-riesgo-par">
              <p className="e3-rotulo">{f.rotulo}</p>
              <p className="e3-riesgo-texto"><Rico t={f.texto} /></p>
            </div>
          ))}
        </div>
      ))}
      <p className="e3-nota" style={caja(M, 762, 1080)}><Rico t={d.nota} /></p>
      <button type="button" className="e3-boton" style={caja(1196, 754, 332, 46)} tabIndex={estatico ? -1 : 0}
              onClick={() => setMatriz((v) => !v)} aria-pressed={matriz}>
        {matriz ? 'Ver los tres críticos' : 'Ver la matriz de riesgos'}
      </button>
    </Marco>
  )
}

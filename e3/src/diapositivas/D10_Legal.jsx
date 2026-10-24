// Diapositiva 10: factibilidad legal (C 5.1 a 5.4, B 3.2). Las cinco dimensiones, el promedio, la
// alerta del 30,1 % y el plan L1 a L6 con dueño en dos tramos. Todo de C3, como el PPTX.
import { Rico } from '../texto.jsx'
import Marco, { M, QuienN, Y0, caja } from './Marco.jsx'

export default function Legal({ d }) {
  const wl = 636
  const xr = M + wl + 54
  const wr = 1600 - M - xr
  let y = Y0
  const tramos = d.plan.map((t) => {
    const top = y
    y += 44 + t.acciones.length * 67 + 14
    return { ...t, top }
  })
  return (
    <Marco kicker={d.kicker} titulo={d.titulo} fuente={d.fuente} n={d.n} derecha={<QuienN quien={d.quien} n={d.n} />}>
      <p className="e3-rotulo e3-abs" style={caja(M, Y0, wl)}>Puntaje por dimensión (1 a 3)</p>
      {d.dimensiones.map((x, k) => (
        <div key={x.dimension} className="e3-dim" style={caja(M, Y0 + 44 + k * 51, wl, 45)}>
          <span>{x.dimension}</span><b className="e3-dim-p">{x.puntaje}</b>
        </div>
      ))}
      <div className="e3-promedio" style={caja(M, Y0 + 44 + 5 * 51 + 6, wl, 66)}>
        <span>Promedio: {d.promedio.texto}</span><b>{d.promedio.valor}</b>
      </div>
      <div className="e3-alerta" style={caja(M, Y0 + 44 + 5 * 51 + 90, wl, 140)}>
        <p className="e3-alerta-valor"><Rico t={d.alerta.valor} /></p>
        <p className="e3-alerta-texto"><Rico t={d.alerta.texto} /></p>
      </div>
      {tramos.map((t) => (
        <div key={t.cuando} className="e3-tramo" style={caja(xr, t.top, wr)}>
          <p className="e3-rotulo">{t.cuando}</p>
          {t.acciones.map((a) => (
            <div key={a.id} className="e3-accion">
              <b className={`e3-accion-id ${t === tramos[tramos.length - 1] ? 'ultimo' : ''}`}>{a.id}</b>
              <span className="e3-accion-que"><Rico t={a.que} /></span>
              <span className="e3-accion-quien"><Rico t={a.quien} /></span>
            </div>
          ))}
        </div>
      ))}
      <p className="e3-nota" style={caja(M, 774, 1456)}><Rico t={d.nota} /></p>
    </Marco>
  )
}

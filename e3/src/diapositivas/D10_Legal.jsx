// Diapositiva 10: factibilidad legal (C 5.1 a 5.4). Las cinco dimensiones, el promedio con la escala de
// la cátedra, la alerta del 30,1 % y el plan L1 a L6 con dueño en dos tramos. Todo de C3, como el PPTX.
// (26/10) Las normas van abajo del plan, en la columna derecha, en lugar del pie de genero.
import { Rico } from '../texto.jsx'
import Marco, { M, QuienN, Y0, caja } from './Marco.jsx'

export default function Legal({ d }) {
  const wl = 600
  const xr = M + wl + 50
  const wr = 1600 - M - xr
  let y = Y0
  const tramos = d.plan.map((t) => {
    const top = y
    y += 44 + t.acciones.length * 63 + 12
    return { ...t, top }
  })
  return (
    <Marco kicker={d.kicker} titulo={d.titulo} fuente={d.fuente} n={d.n} derecha={<QuienN quien={d.quien} n={d.n} />}>
      <p className="e3-rotulo e3-abs" style={caja(M, Y0, wl)}>Puntaje por dimensión (1 a 3)</p>
      {d.dimensiones.map((x, k) => (
        <div key={x.dimension} className="e3-dim" style={caja(M, Y0 + 44 + k * 52, wl, 46)}>
          <span>{x.dimension}</span><b className="e3-dim-p">{x.puntaje}</b>
        </div>
      ))}
      <div className="e3-promedio" style={caja(M, Y0 + 44 + 5 * 52 + 4, wl, 64)}>
        <span>Promedio: {d.promedio.texto}</span><b><Rico t={d.promedio.valor} /></b>
      </div>
      <p className="e3-escala-legal" style={caja(M, Y0 + 44 + 5 * 52 + 74, wl)}><Rico t={d.escala} /></p>
      <div className="e3-alerta" style={caja(M, Y0 + 44 + 5 * 52 + 110, wl, 148)}>
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
      <p className="e3-nota" style={caja(xr, y + 4, wr)}><Rico t={d.nota} /></p>
    </Marco>
  )
}

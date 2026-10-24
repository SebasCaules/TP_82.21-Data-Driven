// Diapositiva 8: factibilidad económica (B 3.3, 3.5 y 4.4). La matriz valorizada con su fórmula, los
// dos números grandes de C3 y el umbral de viabilidad. (24/10) El umbral va dibujado a escala: los
// 1.719 puntos que harían falta contra los 18,4 que hay entre la regla y una lista perfecta
// (D3.economia.observada.puntos_para_pagar y umbral.maximo_pp, G46).
import { D3 } from '../datos_e3.js'
import { puntos, fijo } from '../formato.js'
import { Rico } from '../texto.jsx'
import Marco, { M, QuienN, Y0, caja } from './Marco.jsx'

const E = D3.economia

function AEscala() {
  const falta = E.observada.puntos_para_pagar
  const hay = E.umbral.maximo_pp
  const W = 420
  return (
    <div className="e3-escala" role="img"
         aria-label={`A escala: hacen falta ${puntos(falta)} puntos y hay ${fijo(hay, 1)}`}>
      <p className="e3-rotulo">A escala</p>
      <div className="e3-escala-fila">
        <span className="e3-escala-txt"><b>{puntos(falta)} puntos</b> harían falta</span>
        <span className="e3-escala-barra malo" style={{ width: W }} />
      </div>
      <div className="e3-escala-fila">
        <span className="e3-escala-txt"><b>{fijo(hay, 1)} puntos</b> hay entre la regla y una lista perfecta</span>
        <span className="e3-escala-barra" style={{ width: Math.max(2, (W * hay) / falta) }} />
      </div>
    </div>
  )
}

export default function Economia({ d }) {
  const wl = 882
  const wg = (wl - 30) / 2
  const xr = M + wl + 48
  const wr = 1600 - M - xr
  return (
    <Marco kicker={d.kicker} titulo={d.titulo} fuente={d.fuente} n={d.n} derecha={<QuienN quien={d.quien} n={d.n} />}>
      {d.grandes.map((g, k) => (
        <div key={k} className={`e3-tarjeta e3-grande ${k ? 'malo' : ''}`} style={caja(M + k * (wg + 30), Y0, wg, 170)}>
          <p className="e3-grande-valor"><Rico t={g.valor} /></p>
          <p className="e3-grande-texto"><Rico t={g.texto} /></p>
        </div>
      ))}
      <p className="e3-rotulo" style={{ ...caja(M, 426, wl), position: 'absolute' }}>
        Valor esperado de cada celda, frente a no contactar
      </p>
      {d.celdas.map((c, k) => (
        <div key={c.celda} className="e3-celda" style={caja(M, 466 + k * 94, wl, 86)}>
          <p className="e3-celda-rot">{c.celda}</p>
          <p className={`e3-celda-valor ${c.valor.includes('−') ? 'malo' : ''}`}><Rico t={c.valor} /></p>
          <p className="e3-celda-texto"><Rico t={c.texto} /></p>
        </div>
      ))}
      <p className="e3-formula" style={caja(M, 754, wl)}>{d.formula}</p>
      <div className="e3-panel" style={caja(xr, Y0, wr, 552)}>
        <p className="e3-rotulo">{d.callout.titulo}</p>
        <p className="e3-panel-grande">{puntos(E.observada.puntos_para_pagar)} puntos</p>
        <p className="e3-panel-sub">harían falta para pagar el modelo</p>
        <p className="e3-panel-texto"><Rico t={d.callout.texto} /></p>
        <AEscala />
      </div>
    </Marco>
  )
}

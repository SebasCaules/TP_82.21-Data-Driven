// Diapositiva 8: factibilidad económica (B 3.3, 3.5 y 4.4; C 7.2). El valor de cada celda de la matriz,
// la cuenta del modelo contra la regla, lo que pasa con la lista que se puede mandar y el umbral de
// viabilidad. (24/10) El umbral va dibujado a escala: los 1.719 puntos que harían falta contra los 18,4
// que hay entre la regla y una lista perfecta (D3.economia.observada.puntos_para_pagar y
// umbral.maximo_pp, G46). (26/10) Salen las dos cifras grandes, que repetían el título, y la fórmula
// con símbolos que la pantalla no definía (queda en la B 4.4 y en la guía de defensa).
import { D3 } from '../datos_e3.js'
import { puntos, fijo } from '../formato.js'
import { Rico } from '../texto.jsx'
import Marco, { ANCHO, M, QuienN, Y0, caja } from './Marco.jsx'

const E = D3.economia

function AEscala() {
  const falta = E.observada.puntos_para_pagar
  const hay = E.umbral.maximo_pp
  const W = 380
  return (
    <div className="e3-escala" role="img"
         aria-label={`A escala: hacen falta ${puntos(falta)} puntos y hay ${fijo(hay, 1)}`}>
      <p className="e3-rotulo">A escala</p>
      <div className="e3-escala-fila">
        <span className="e3-escala-txt"><b>{puntos(falta)} puntos</b> harían falta</span>
        <span className="e3-escala-barra malo" style={{ width: W }} />
      </div>
      <div className="e3-escala-fila">
        <span className="e3-escala-txt"><b>{fijo(hay, 1)} puntos</b> entre la regla y una lista perfecta</span>
        <span className="e3-escala-barra" style={{ width: Math.max(2, (W * hay) / falta) }} />
      </div>
    </div>
  )
}

export default function Economia({ d }) {
  const wl = 760
  const xr = M + wl + 40
  const wr = M + ANCHO - xr
  const y0 = Y0 + 50
  const paso = 113
  const yc = y0 + 3 * paso
  return (
    <Marco pregunta={d.pregunta} titulo={d.titulo} fuente={d.fuente} n={d.n} derecha={<QuienN quien={d.quien} n={d.n} />}>
      <p className="e3-rotulo" style={{ ...caja(M, Y0, wl), position: 'absolute' }}>
        Valor esperado de cada celda, frente a no contactar
      </p>
      {d.celdas.map((c, k) => (
        <div key={c.celda} className="e3-celda" style={caja(M, y0 + k * paso, wl, 103)}>
          <p className="e3-celda-rot">{c.celda}</p>
          <p className={`e3-celda-valor ${c.valor.includes('−') ? 'malo' : ''}`}><Rico t={c.valor} /></p>
          <p className="e3-celda-texto"><Rico t={c.texto} /></p>
        </div>
      ))}
      <p className="e3-cadena" style={caja(M, yc + 14, wl)}><Rico t={d.cadena} /></p>
      <p className="e3-filtro" style={caja(M, yc + 108, wl)}><Rico t={d.filtro} /></p>
      <div className="e3-panel" style={caja(xr, Y0, wr, 570)}>
        <p className="e3-rotulo">{d.callout.titulo}</p>
        <p className="e3-panel-grande">{puntos(E.observada.puntos_para_pagar)} puntos</p>
        <p className="e3-panel-sub">harían falta para pagar el modelo</p>
        <p className="e3-panel-texto"><Rico t={d.callout.texto} /></p>
        <AEscala />
      </div>
    </Marco>
  )
}

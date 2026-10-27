// Diapositiva 12: la propuesta (B 3.6, C 6.3 y 6.4). (26/10) El gráfico deja de repetir tres meses
// iguales y muestra la regla de decisión del piloto: debajo de 2,87 puntos no se distingue de cero (con
// 240 de control), entre 2,87 y 40,4 el contacto funciona pero la lista no se paga, y desde 40,4 se
// invierte en producción (D3.piloto.diferencia_detectable_pp y umbral_produccion_pp, G49 y H49). Los
// hechos, lo que se presenta a María G. y lo que sigue, de C3.
import { D3 } from '../datos_e3.js'
import { fijo } from '../formato.js'
import { Rico } from '../texto.jsx'
import Marco, { ANCHO, M, QuienN, Y0, caja } from './Marco.jsx'

const P = D3.piloto
const TOPE = 56

function Grafico() {
  const W = 620, x0 = 18, x1 = 600
  const x = (v) => x0 + (v / TOPE) * (x1 - x0)
  const mde = P.diferencia_detectable_pp, paga = P.umbral_produccion_pp
  const y0 = 66, h = 168
  return (
    <svg width={W} height={300} className="e3-svg" role="img"
         aria-label={`Decisión del piloto: debajo de ${fijo(mde, 2)} puntos no se distingue de cero; desde ${fijo(paga, 1)} se invierte en producción`}>
      <rect x={x(0)} y={y0} width={x(mde) - x(0)} height={h} className="e3-zona-gris" />
      <rect x={x(mde)} y={y0} width={x(paga) - x(mde)} height={h} className="e3-zona-azul1" />
      <rect x={x(paga)} y={y0} width={x(TOPE) - x(paga)} height={h} className="e3-barra-acc" />
      <text x={(x(mde) + x(paga)) / 2} y={y0 + h / 2 - 26} textAnchor="middle" className="e3-t e3-t-19">
        <tspan x={(x(mde) + x(paga)) / 2}>contactar funciona,</tspan>
        <tspan x={(x(mde) + x(paga)) / 2} dy="26">pero la lista no se paga:</tspan>
        <tspan x={(x(mde) + x(paga)) / 2} dy="26">cerrar o repetir sin descuento</tspan>
      </text>
      <text x={(x(paga) + x(TOPE)) / 2} y={y0 + h / 2 - 6} textAnchor="middle" className="e3-t e3-t-19 e3-t-b e3-t-blanco">
        <tspan x={(x(paga) + x(TOPE)) / 2}>se invierte</tspan>
        <tspan x={(x(paga) + x(TOPE)) / 2} dy="26">en producción</tspan>
      </text>
      {[mde, paga].map((v, k) => (
        <g key={k}>
          <line x1={x(v)} x2={x(v)} y1={y0 - 18} y2={y0 + h} className="e3-linea-ink" />
          <text x={x(v)} y={y0 - 26} textAnchor="middle" className="e3-t e3-t-22 e3-t-b">{fijo(v, k ? 1 : 2)}</text>
        </g>
      ))}
      <text x={x(mde) + 36} y={y0 - 26} className="e3-t e3-t-19 e3-t-lbl">← lo mínimo que distingue de cero</text>
      <line x1={x0} x2={x1} y1={y0 + h} y2={y0 + h} className="e3-eje" />
      {[0, 10, 20, 30, 40, 50].map((v) => (
        <text key={v} x={x(v)} y={y0 + h + 22} textAnchor="middle" className="e3-t e3-t-17 e3-t-lbl" data-escala="">{v}</text>
      ))}
      <text x={W / 2} y={y0 + h + 50} textAnchor="middle" className="e3-t e3-t-17 e3-t-lbl">
        Compra a 7 días al tercer mes: contactados menos control, en puntos
      </text>
    </svg>
  )
}

export default function Piloto({ d }) {
  const xr = M + 660
  const wr = M + ANCHO - xr
  return (
    <Marco pregunta={d.pregunta} titulo={d.titulo} fuente={d.fuente} n={d.n} derecha={<QuienN quien={d.quien} n={d.n} />}>
      <figure className="e3-figura" style={caja(M, Y0, 620, 300)}>
        <Grafico />
      </figure>
      <div className="e3-hechos" style={caja(M, Y0 + 318, 620)}>
        {d.hechos.map((h, k) => <p key={k}><Rico t={h} /></p>)}
      </div>
      <div className="e3-panel" style={caja(xr, Y0, wr, 538)}>
        <p className="e3-rotulo">{d.pedidos_titulo}</p>
        <ol className="e3-pedidos">
          {d.pedidos.map((t, k) => <li key={k}><Rico t={t} /></li>)}
        </ol>
      </div>
      <p className="e3-nota" style={caja(M, 790, ANCHO)}><Rico t={d.nota} /></p>
    </Marco>
  )
}

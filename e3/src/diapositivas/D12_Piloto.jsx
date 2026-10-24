// Diapositiva 12: la propuesta (B 3.6, C 6.4). El piloto de tres meses: por mes, los contactados y el
// grupo de control (rayado, sin contacto), con los valores de D3.piloto; los hechos, lo que se
// presenta a María G. y lo que sigue, de C3.
import { D3 } from '../datos_e3.js'
import { entero } from '../formato.js'
import { escalaNice } from '../../../src/graficos.jsx'
import { Rico } from '../texto.jsx'
import Marco, { M, QuienN, Y0, caja } from './Marco.jsx'

const P = D3.piloto
const ESC = escalaNice(P.lista_mes, 5)

function Grafico({ id }) {
  const W = 648, x0 = 84, x1 = 620
  const x = (v) => x0 + (v / ESC.max) * (x1 - x0)
  const meses = Array.from({ length: P.meses }, (_, k) => k + 1)
  return (
    <svg width={W} height={300} className="e3-svg" role="img"
         aria-label={`${P.meses} meses: ${P.contactados_mes} contactados y ${P.control_mes} de control por mes`}>
      <defs>
        <pattern id={`${id}-ctl`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" className="e3-trama-fondo" />
          <line x1="0" y1="0" x2="0" y2="10" className="e3-trama-linea" />
        </pattern>
      </defs>
      {meses.map((m, k) => {
        const y = 42 + k * 74
        return (
          <g key={m}>
            <text x={x0 - 10} y={y + 7} textAnchor="end" className="e3-t e3-t-19">Mes {m}</text>
            <rect x={x0} y={y - 22} width={x(P.contactados_mes) - x0} height={44} className="e3-barra-acc" />
            <text x={(x0 + x(P.contactados_mes)) / 2} y={y + 7} textAnchor="middle" className="e3-t e3-t-19 e3-t-blanco">
              {entero(P.contactados_mes)} contactados
            </text>
            <rect x={x(P.contactados_mes)} y={y - 22} width={x(P.lista_mes) - x(P.contactados_mes)} height={44}
                  fill={`url(#${id}-ctl)`} className="e3-barra-control" />
            <text x={(x(P.contactados_mes) + x(P.lista_mes)) / 2} y={y + 7} textAnchor="middle"
                  className="e3-t e3-t-19 e3-t-b e3-t-acc e3-halo">{entero(P.control_mes)}</text>
          </g>
        )
      })}
      <line x1={x0} x2={x1} y1={240} y2={240} className="e3-eje" />
      {ESC.ticks.map((v) => (
        <text key={v} x={x(v)} y={261} textAnchor="middle" className="e3-t e3-t-17 e3-t-lbl" data-escala="">{entero(v)}</text>
      ))}
      <text x={(x0 + x1) / 2} y={288} textAnchor="middle" className="e3-t e3-t-17 e3-t-lbl">
        Lista mensual de {entero(P.lista_mes)} (rayado: grupo de control, sin contacto)
      </text>
    </svg>
  )
}

export default function Piloto({ d, estatico }) {
  const xr = 798
  const wr = 1600 - M - xr
  return (
    <Marco kicker={d.kicker} titulo={d.titulo} fuente={d.fuente} n={d.n} derecha={<QuienN quien={d.quien} n={d.n} />}>
      <figure className="e3-figura" style={caja(M, Y0, 648, 300)}>
        <Grafico id={`e3-d12${estatico ? '-m' : ''}`} />
      </figure>
      <div className="e3-hechos" style={caja(M, Y0 + 316, 690)}>
        {d.hechos.map((h, k) => <p key={k}><Rico t={h} /></p>)}
      </div>
      <div className="e3-panel" style={caja(xr, Y0, wr, 522)}>
        <p className="e3-rotulo">{d.pedidos_titulo}</p>
        <ol className="e3-pedidos">
          {d.pedidos.map((t, k) => <li key={k}><Rico t={t} /></li>)}
        </ol>
      </div>
      <p className="e3-nota" style={caja(M, 786, 1456)}><Rico t={d.nota} /></p>
    </Marco>
  )
}

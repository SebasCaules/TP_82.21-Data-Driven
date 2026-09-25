// V06b · Envíos repetidos — segunda pantalla de la vista 6 (25/09, pedido del usuario: una sola
// decisión por tarjeta). DC-05 saca los 200 envíos de campaña repetidos (copias idénticas campo por
// campo); la pregunta es si eso mueve el embudo de las campañas. Mismos datos que V06
// (D2.vistas.V06: envios y embudo); nada se escribe a mano.
//
// El embudo va en tres paneles chicos, uno por etapa, cada uno con su propia escala desde cero:
// abrir (35 %), hacer clic (9 %) y comprar a 7 días (1 %) no entran en un solo eje sin que la
// compra desaparezca. En cada panel, la barra de antes en gris y la de sin repetidos en --acc.

import { Lienzo, escalaNice } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, pct } from '../formato.js'
import { useEscalaTexto } from '../escala.js'
import Banda from '../Banda.jsx'

const v06 = D2.vistas.V06
const dc05 = D2.decisiones.find((d) => d.id === 'DC-05')
const { envios, embudo } = v06
const repetidos = envios.antes - envios.despues

const ETAPAS = [
  { etq: 'Abre el mail', clave: 'abre_pct', dec: 1 },
  { etq: 'Hace clic', clave: 'clic_pct', dec: 1 },
  { etq: 'Compra a 7 días', clave: 'compra_pct', dec: 2 },
]

const TITULO = `${entero(repetidos)} envíos repetidos fuera: el embudo casi no se mueve`

export const meta = {
  id: 'V06b',
  dc: 'DC-05',
  corto: 'Envíos repetidos',
  titulo: TITULO,
  pie: 'envíos D15 · embudo de campañas',
}

export default function V06bEnviosRepetidos() {
  const k = useEscalaTexto()
  return (
    <section className="pant v06b">
      <Banda dcs={[dc05]}>
        <div className="tarjeta e2-central" title={`${entero(repetidos)} filas con id_envio repetido, idénticas campo por campo`}>
          <span className="kpi-lbl"><span>Envíos de campaña</span></span>
          <div className="ban-par">
            <div className="par-item par-antes">
              <span className="par-lbl">Antes</span>
              <span className="par-val tabular e2-cifra">{entero(envios.antes)}</span>
            </div>
            <span className="par-flecha" aria-hidden="true">→</span>
            <div className="par-item par-despues">
              <span className="par-lbl">Sin repetidos</span>
              <span className="par-val tabular e2-cifra">{entero(envios.despues)}</span>
            </div>
          </div>
          <p className="e2-linea">{entero(repetidos)} copias idénticas fuera.</p>
        </div>
      </Banda>

      <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}>
        <span className="kpi-lbl frase">Embudo de las campañas: antes y sin los repetidos</span>
        <Lienzo>
          {({ w, h }) => <Embudo w={w} h={h} k={k} />}
        </Lienzo>
      </div>
    </section>
  )
}

/** Tres paneles, uno por etapa del embudo, cada uno con su escala desde cero: dos barras
 *  verticales (antes en gris, sin repetidos en --acc) con su valor arriba. */
function Embudo({ w, h, k }) {
  if (w < 240) return null
  const gap = Math.round(28 * k)
  const panel = (w - gap * (ETAPAS.length - 1)) / ETAPAS.length
  const fEtq = 14 * k
  const fVal = 20 * k
  const fLey = 11.5 * k
  const padT = Math.round(fVal + 14 * k)
  const padB = Math.round(fEtq + fLey + 26 * k)
  const ih = Math.max(40, h - padT - padB)
  const anchoBarra = Math.min(90 * k, panel * 0.26)
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={'Embudo de campañas, antes y sin repetidos: ' + ETAPAS.map((e) =>
           `${e.etq} ${pct(embudo.antes[e.clave], e.dec)} y ${pct(embudo.despues[e.clave], e.dec)}`).join('; ')}>
      {ETAPAS.map((e, i) => {
        const x0 = i * (panel + gap)
        const a = embudo.antes[e.clave]
        const d = embudo.despues[e.clave]
        const { max } = escalaNice(Math.max(a, d))
        const Y = (v) => padT + ih - (v / max) * ih
        const cx = x0 + panel / 2
        const barras = [
          { v: a, x: cx - anchoBarra - 6 * k, fill: 'var(--gris)', etq: 'antes' },
          { v: d, x: cx + 6 * k, fill: 'var(--acc)', etq: 'sin repetidos' },
        ]
        return (
          <g key={e.clave}>
            <line x1={x0} x2={x0 + panel} y1={padT + ih} y2={padT + ih} stroke="var(--eje)" strokeWidth="1" />
            {barras.map((b) => (
              <g key={b.etq}>
                <title>{`${e.etq} · ${b.etq}: ${pct(b.v, e.dec)}`}</title>
                <rect x={b.x} y={Y(b.v)} width={anchoBarra} height={padT + ih - Y(b.v)} fill={b.fill} />
                <text x={b.x + anchoBarra / 2} y={Y(b.v) - 6 * k} fontSize={fVal} fontWeight={700}
                      fill={b.fill === 'var(--acc)' ? 'var(--acc)' : 'var(--mut2)'} textAnchor="middle"
                      className="tabular">{pct(b.v, e.dec)}</text>
                <text x={b.x + anchoBarra / 2} y={padT + ih + 14 * k} fontSize={fLey} fill="var(--mut2)"
                      textAnchor="middle">{b.etq}</text>
              </g>
            ))}
            <text x={cx} y={padT + ih + 16 * k + fLey + fEtq * 0.9} fontSize={fEtq} fontWeight={700}
                  fill="var(--ink)" textAnchor="middle">{e.etq}</text>
          </g>
        )
      })}
    </svg>
  )
}

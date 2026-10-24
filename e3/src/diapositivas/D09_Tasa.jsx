// Diapositiva 9: la tasa de éxito (B 3.2 y 3.4 a 3.6). La pieza central de la presentación.
//
// (24/10) A la izquierda, el costo del año 1 del PPTX (con modelo y regla sin modelo, presupuesto) y,
// en el mismo eje, el beneficio anual simulado de la regla y lo que suma el modelo. Debajo, el
// deslizante de la tasa de éxito s sobre la grilla precalculada de D3.economia.grilla (el navegador
// no calcula: lee la fila i). Arranca en la tasa observada, 1,02 %, con marcas en el intervalo del
// 95 % y en los dos equilibrios. Se tiene que ver que el modelo no paga sus USD 10.400 con ninguna
// tasa y que la regla necesita 48,6 veces lo observado. El selector con / sin descuento cambia la
// regla; la grilla no trae el modelo sin descuento, así que el modelo se lee siempre con descuento.
// Los valores que dependen del control llevan data-simulacion. Las llamadas y el veredicto de C3
// quedan como en el PPTX.
import { useState } from 'react'
import { C3 } from '../contenido_e3.js'
import { D3 } from '../datos_e3.js'
import { fijo, pct, pctDirecto, tasa, usd } from '../formato.js'
import { Deslizante, Opciones } from '../controles.jsx'
import { escalaNice } from '../../../src/graficos.jsx'
import { Rico } from '../texto.jsx'
import Marco, { ANCHO, M, QuienN, Y0, caja } from './Marco.jsx'

const E = D3.economia
const G = E.grilla
const N = (id) => G.notables.find((x) => x.id === id)
const OBS = N('observada')
const IC = [N('ic95_inferior'), N('ic95_superior')]
const EQ = { con: N('equilibrio_con_descuento'), sin: N('equilibrio_sin_descuento') }
const IMANES = G.notables.map((x) => x.i)
const COSTOS = [
  { nombre: 'Con modelo', c: E.costos.con_modelo },
  { nombre: 'Regla sin modelo', c: E.costos.regla_sin_modelo },
]
const ESC = escalaNice(E.costos.con_modelo.total_anio_1_usd * 1.25, 4)
// Marcas de la escala del deslizante: la grilla cambia de paso en 5 %, así que se ubican por índice.
const indiceDeS = (v) => G.s.findIndex((s) => Math.abs(s - v) < 1e-9)
const MARCAS_S = [0, 0.05, 0.25, 0.5, 0.75, 1].map((v) => ({ v, i: indiceDeS(v) })).filter((m) => m.i >= 0)
const QUIEBRE = indiceDeS(G.tramos[0].hasta)
const RIESGO = (() => {
  const t = C3.DIAPOSITIVAS.find((x) => x.n === 2).tarjetas
  return t.find((x) => x.area === 'Riesgo más crítico') ?? t[t.length - 1]
})()
const DESC = pct(E.parametros.descuento, 0)

function Grafico({ i, desc, id }) {
  const W = 840, x0 = 236, x1 = 790
  const x = (v) => x0 + (Math.max(0, Math.min(v, ESC.max)) / ESC.max) * (x1 - x0)
  const regla = desc === 'con' ? G.regla_usd[i] : G.regla_usd_sin[i]
  const modelo = G.modelo_usd[i]
  const sim = { 'data-simulacion': '' }
  const beneficio = (v, y, nombre) => {
    const fuera = v > ESC.max
    const dentro = fuera || x(v) + 150 > W
    return (
      <g>
        <text x={x0 - 10} y={y + 6} textAnchor="end" className="e3-t e3-t-17">{nombre}</text>
        <rect x={x0} y={y - 10} width={Math.max(0, x(v) - x0)} height={20} fill={`url(#${id}-sim)`} className="e3-barra-sim" />
        {fuera && <path d={`M${x1},${y - 13} L${x1 + 11},${y} L${x1},${y + 13} Z`} className="e3-punta-sim" />}
        <text x={dentro ? x(v) - 8 : x(v) + 8} y={y + 6} textAnchor={dentro ? 'end' : 'start'}
              className={`e3-t e3-t-17 e3-t-b ${dentro ? 'e3-t-halo-acc' : 'e3-halo'}`} {...sim}>
          {usd(v, 2)}
        </text>
      </g>
    )
  }
  const ppto = E.costos.presupuesto_usd
  return (
    <svg width={W} height={212} className="e3-svg" role="img"
         aria-label={`Costo del año 1 y beneficio anual simulado con tasa de éxito ${tasa(G.s[i])}`}>
      <defs>
        <pattern id={`${id}-sim`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" className="e3-trama-fondo" />
          <line x1="0" y1="0" x2="0" y2="8" className="e3-trama-linea" />
        </pattern>
      </defs>
      {COSTOS.map((f, k) => {
        const y = 36 + k * 36
        const ini = f.c.inversion_inicial_usd, tot = f.c.total_anio_1_usd
        return (
          <g key={f.nombre}>
            <text x={x0 - 10} y={y + 6} textAnchor="end" className="e3-t e3-t-19">{f.nombre}</text>
            <rect x={x(0)} y={y - 13} width={x(ini) - x0} height={26} className="e3-barra-acc" />
            <rect x={x(ini)} y={y - 13} width={x(tot) - x(ini)} height={26} className="e3-barra-azul3" />
            <text x={x(tot) + 8} y={y + 7} className="e3-t e3-t-19 e3-t-b">{usd(tot)}</text>
          </g>
        )
      })}
      <line x1={x(ppto)} x2={x(ppto)} y1={20} y2={88} className="e3-linea-ppto" />
      <text x={x(ppto)} y={16} textAnchor="middle" className="e3-t e3-t-15 e3-t-b e3-t-terra e3-halo">presupuesto {usd(ppto)}</text>
      {/* guía: el costo de la regla, desde el final de su barra hasta su beneficio */}
      <line x1={x(E.costos.regla_sin_modelo.total_anio_1_usd)} x2={x(E.costos.regla_sin_modelo.total_anio_1_usd)}
            y1={84} y2={130} className="e3-guia" />
      <text x={x0 - 10} y={101} textAnchor="end" className="e3-t e3-t-13 e3-t-lbl e3-mayus">Beneficio anual simulado</text>
      {beneficio(regla, 120, 'Regla')}
      <line x1={x(E.costos.incremental_usd)} x2={x(E.costos.incremental_usd)} y1={138} y2={162} className="e3-guia" />
      <text x={x(E.costos.incremental_usd) + 6} y={156} className="e3-t e3-t-15 e3-t-lbl">
        {usd(E.costos.incremental_usd)}, lo que agrega el modelo
      </text>
      {beneficio(modelo, 150, 'Lo que suma el modelo')}
      <line x1={x0} x2={x1} y1={170} y2={170} className="e3-eje" />
      {ESC.ticks.map((v) => (
        <text key={v} x={x(v)} y={187} textAnchor="middle" className="e3-t e3-t-15 e3-t-lbl" data-escala="">{fijo(v, 0)}</text>
      ))}
      <g className="e3-leyenda" transform={`translate(${x0}, 204)`}>
        <rect x={0} y={-11} width={22} height={12} className="e3-barra-acc" />
        <text x={30} y={0} className="e3-t e3-t-15">inversión inicial</text>
        <rect x={176} y={-11} width={22} height={12} className="e3-barra-azul3" />
        <text x={206} y={0} className="e3-t e3-t-15">recurrente del año</text>
      </g>
    </svg>
  )
}

function Lectura({ rotulo, valor, estado, malo }) {
  return (
    <div className="e3-lectura">
      <p className="e3-lectura-rot">{rotulo}</p>
      <p className={`e3-lectura-valor ${malo ? 'malo' : ''}`}>
        <b data-simulacion="">{valor}</b>{estado && <span>{estado}</span>}
      </p>
    </div>
  )
}

export default function Tasa({ d, estatico }) {
  const [i, setI] = useState(OBS.i)
  const [desc, setDesc] = useState('con')
  const id = `e3-d9${estatico ? '-m' : ''}`
  const reglaRoi = desc === 'con' ? G.regla_roi_pct[i] : G.regla_roi_pct_sin[i]
  const modeloRoi = G.modelo_roi_pct[i]
  const eq = EQ[desc]
  const ancho = 610
  const xi = (k) => (k / (G.n - 1)) * ancho
  return (
    <Marco kicker={d.kicker} titulo={d.titulo} fuente={d.fuente} n={d.n} derecha={<QuienN quien={d.quien} n={d.n} />}>
      <figure className="e3-figura" style={caja(M, Y0, 840, 212)}>
        <Grafico i={i} desc={desc} id={id} />
      </figure>
      <p className="e3-pie-figura" style={caja(M, Y0 + 216, 840)}><Rico t={d.pie_figura} /></p>
      <div className="e3-sim" style={caja(M, 478, 840, 250)}>
        <div className="e3-sim-cab">
          <span className="e3-sim-marca">Simulación con la fórmula de la Parte B</span>
          <Opciones etiqueta="Descuento de la oferta" valor={desc} onCambio={setDesc}
                    opciones={[{ valor: 'con', texto: `Con ${DESC} de descuento` }, { valor: 'sin', texto: 'Sin descuento' }]} />
        </div>
        <div className="e3-sim-fila">
          <div className="e3-sim-s">
            <p className="e3-lectura-rot">Tasa de éxito s</p>
            <p className="e3-sim-valor" data-simulacion="">{tasa(G.s[i])}</p>
          </div>
          <Deslizante n={G.n} valor={i} onCambio={setI} imanes={IMANES} ancho={ancho} alto={84}
                      etiqueta="Tasa de éxito" textoValor={tasa(G.s[i])}>
            <div className="e3-desliz-banda" style={{ left: xi(IC[0].i), width: xi(IC[1].i) - xi(IC[0].i) }} />
            <span className="e3-desliz-arriba" style={{ left: (xi(IC[0].i) + xi(IC[1].i)) / 2 }} data-escala="">IC 95 %</span>
            {Object.entries(EQ).map(([k, n]) => (
              <i key={k} className={`e3-desliz-marca ${k === desc ? 'on' : ''}`} style={{ left: xi(n.i) }} />
            ))}
            <span className="e3-desliz-arriba fuerte" style={{ left: xi(eq.i) }} data-escala="">
              {tasa(eq.s)}: la regla se paga
            </span>
            <i className="e3-desliz-marca obs" style={{ left: xi(OBS.i) }} />
            <span className="e3-desliz-abajo obs" style={{ left: xi(OBS.i) - 4 }} data-escala="">{tasa(OBS.s)} observada</span>
            <i className="e3-desliz-quiebre" style={{ left: xi(QUIEBRE) }} title="La escala cambia en 5 %" />
            {MARCAS_S.map((m) => (
              <span key={m.v} className={`e3-desliz-abajo ${m.v === 0 ? 'izq' : m.v === 1 ? 'der' : ''}`}
                    style={{ left: xi(m.i) }} data-escala="">
                {m.v === 1 ? '100 %' : pct(m.v, 0)}
              </span>
            ))}
          </Deslizante>
        </div>
        <div className="e3-lecturas">
          <Lectura rotulo="ROI de la regla" valor={pctDirecto(reglaRoi, 2)} malo={reglaRoi < 0}
                   estado={reglaRoi < 0 ? 'no se paga' : 'se paga'} />
          <Lectura rotulo={`ROI del modelo, con ${DESC} de descuento`} valor={pctDirecto(modeloRoi, 2)} malo={modeloRoi < 0}
                   estado={modeloRoi < 0 ? 'no se paga' : 'se paga'} />
          <Lectura rotulo="Veces la tasa observada" valor={fijo(G.veces[i], 1)} />
        </div>
        <p className="e3-sim-nota"><b>{RIESGO.valor}</b>: {RIESGO.escala}. <Rico t={RIESGO.texto} /></p>
      </div>
      <div className="e3-llamadas" style={caja(966, Y0, 562)}>
        {d.callouts.map((c) => (
          <div key={c.titulo} className="e3-llamada" style={{ height: 160 }}>
            <p className="e3-llamada-titulo"><Rico t={c.titulo} /></p>
            <p className="e3-llamada-texto"><Rico t={c.texto} /></p>
          </div>
        ))}
      </div>
      <div className="e3-decision malo" style={caja(M, 738, ANCHO, 88)}><p><Rico t={d.decision} /></p></div>
    </Marco>
  )
}

// Diapositiva 9: la tasa de éxito (B 3.2 y 3.4 a 3.6). La pieza central de la presentación.
//
// (24/10) A la izquierda, el costo del año 1 del PPTX (con modelo y regla sin modelo, presupuesto) y,
// en el mismo eje, el beneficio anual simulado de la regla. Debajo, el deslizante de la tasa de éxito
// s sobre la grilla precalculada de D3.economia.grilla (el navegador no calcula: lee la fila i), y tres
// lecturas: s, el ROI de la regla y el del modelo sobre la regla. Arranca en la tasa observada, 1,02 %.
// Se tiene que ver que el modelo no paga sus USD 10.400 con ninguna tasa y que la regla necesita
// 49,6 % (48,6 veces lo observado, en la llamada de C3).
//
// Después de la crítica del 24/10:
// - El selector con / sin descuento cambia la regla y el modelo (modelo_*_sin de la grilla).
// - Sin la barra de lo que suma el modelo (USD 5,38 no se ve en un eje de USD 40.000; está en la 8),
//   sin «veces la tasa observada» (la llamada ya dice 48,6 veces) y sin la nota de la tasa observada
//   (la dice la tarjeta 4 de la diapositiva 2 y el guion). Lo que queda va a 19 px o más.
// - El deslizante empieza en el borde inferior del IC 95 % (0,63 %), lo que la Parte B sostiene: por
//   debajo de 0,3 % la regla pierde más que su costo y el ROI baja de −100 %, sin nada que defender.
// - La escala del deslizante cambia en 5 %: el tramo de 0,63 a 5 % va sombreado, con marcas cada
//   punto y su rótulo; de 5 a 100 %, marcas cada 25.
// Los valores que dependen del control llevan data-simulacion. Las llamadas y el veredicto de C3
// quedan como en el PPTX.
import { useState } from 'react'
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
const DESDE = IC[0].i
const IMANES = G.notables.filter((x) => x.i >= DESDE).map((x) => x.i)
const COSTOS = [
  { nombre: 'Con modelo', c: E.costos.con_modelo },
  { nombre: 'Regla sin modelo', c: E.costos.regla_sin_modelo },
]
const ESC = escalaNice(E.costos.con_modelo.total_anio_1_usd * 1.25, 4)
// Marcas de la escala del deslizante: la grilla cambia de paso en 5 %, así que se ubican por índice.
const indiceDeS = (v) => G.s.findIndex((s) => Math.abs(s - v) < 1e-9)
const MARCAS_S = [0.01, 0.02, 0.03, 0.04, 0.05, 0.25, 0.5, 0.75, 1].map((v) => ({ v, i: indiceDeS(v) }))
  .filter((m) => m.i >= DESDE)
const QUIEBRE = indiceDeS(G.tramos[0].hasta)
const DESC = pct(E.parametros.descuento, 0)

function Grafico({ i, desc, id }) {
  const W = 840, x0 = 250, x1 = 780
  const x = (v) => x0 + (Math.max(0, Math.min(v, ESC.max)) / ESC.max) * (x1 - x0)
  const regla = desc === 'con' ? G.regla_usd[i] : G.regla_usd_sin[i]
  const fuera = regla > ESC.max
  const dentro = fuera || x(regla) + 150 > W
  const ppto = E.costos.presupuesto_usd
  const yb = 134
  return (
    <svg width={W} height={214} className="e3-svg" role="img"
         aria-label={`Costo del año 1 y beneficio anual simulado de la regla con tasa de éxito ${tasa(G.s[i])}`}>
      <defs>
        <pattern id={`${id}-sim`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" className="e3-trama-fondo" />
          <line x1="0" y1="0" x2="0" y2="8" className="e3-trama-linea" />
        </pattern>
      </defs>
      {COSTOS.map((f, k) => {
        const y = 46 + k * 44
        const ini = f.c.inversion_inicial_usd, tot = f.c.total_anio_1_usd
        return (
          <g key={f.nombre}>
            <text x={x0 - 10} y={y + 7} textAnchor="end" className="e3-t e3-t-20">{f.nombre}</text>
            <rect x={x(0)} y={y - 14} width={x(ini) - x0} height={28} className="e3-barra-acc" />
            <rect x={x(ini)} y={y - 14} width={x(tot) - x(ini)} height={28} className="e3-barra-azul3" />
            <text x={x(tot) + 8} y={y + 7} className="e3-t e3-t-19 e3-t-b e3-halo">{usd(tot)}</text>
          </g>
        )
      })}
      <line x1={x(ppto)} x2={x(ppto)} y1={26} y2={106} className="e3-linea-ppto" />
      <text x={x(ppto)} y={19} textAnchor="middle" className="e3-t e3-t-19 e3-t-b e3-t-terra e3-halo">presupuesto {usd(ppto)}</text>
      {/* guía: el costo de la regla, desde el final de su barra hasta su beneficio */}
      <line x1={x(E.costos.regla_sin_modelo.total_anio_1_usd)} x2={x(E.costos.regla_sin_modelo.total_anio_1_usd)}
            y1={106} y2={yb + 12} className="e3-guia" />
      <text x={x0 - 10} y={yb + 7} textAnchor="end" className="e3-t e3-t-20">Beneficio de la regla</text>
      <rect x={x0} y={yb - 11} width={Math.max(0, x(regla) - x0)} height={22} fill={`url(#${id}-sim)`} className="e3-barra-sim" />
      {fuera && <path d={`M${x1},${yb - 14} L${x1 + 12},${yb} L${x1},${yb + 14} Z`} className="e3-punta-sim" />}
      <text x={dentro ? x(regla) - 8 : x(regla) + 8} y={yb + 7} textAnchor={dentro ? 'end' : 'start'}
            className={`e3-t e3-t-20 e3-t-b ${dentro ? 'e3-t-halo-acc' : 'e3-halo'}`} data-simulacion="">
        {usd(regla, 2)}
      </text>
      <line x1={x0} x2={x1} y1={158} y2={158} className="e3-eje" />
      {ESC.ticks.map((v) => (
        <text key={v} x={x(v)} y={179} textAnchor="middle" className="e3-t e3-t-17 e3-t-lbl" data-escala="">{fijo(v, 0)}</text>
      ))}
      <g className="e3-leyenda" transform="translate(96, 207)">
        <rect x={0} y={-13} width={22} height={14} className="e3-barra-acc" />
        <text x={30} y={0} className="e3-t e3-t-19">inversión inicial</text>
        <rect x={200} y={-13} width={22} height={14} className="e3-barra-azul3" />
        <text x={230} y={0} className="e3-t e3-t-19">recurrente del año</text>
        <rect x={418} y={-13} width={22} height={14} fill={`url(#${id}-sim)`} className="e3-barra-sim" />
        <text x={448} y={0} className="e3-t e3-t-19">beneficio anual de la regla</text>
      </g>
    </svg>
  )
}

function Lectura({ rotulo, valor, estado, malo, clase = '' }) {
  return (
    <div className={`e3-lectura ${clase}`}>
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
  const modeloRoi = desc === 'con' ? G.modelo_roi_pct[i] : G.modelo_roi_pct_sin[i]
  const eq = EQ[desc]
  const ancho = 804
  const xi = (k) => ((k - DESDE) / (G.n - 1 - DESDE)) * ancho
  const xq = xi(QUIEBRE)
  return (
    <Marco kicker={d.kicker} titulo={d.titulo} fuente={d.fuente} n={d.n} derecha={<QuienN quien={d.quien} n={d.n} />}>
      <figure className="e3-figura" style={caja(M, Y0, 840, 214)}>
        <Grafico i={i} desc={desc} id={id} />
      </figure>
      <p className="e3-pie-figura" style={caja(M, Y0 + 218, 840)}><Rico t={d.pie_figura} /></p>
      <div className="e3-sim" style={caja(M, 484, 840, 244)}>
        <div className="e3-sim-cab">
          <span className="e3-sim-marca">Simulación con la fórmula de la Parte B</span>
          <Opciones etiqueta="Descuento de la oferta" valor={desc} onCambio={setDesc}
                    opciones={[{ valor: 'con', texto: `Con ${DESC} de descuento` }, { valor: 'sin', texto: 'Sin descuento' }]} />
        </div>
        <Deslizante n={G.n} desde={DESDE} valor={i} onCambio={setI} imanes={IMANES} ancho={ancho} alto={106}
                    etiqueta="Tasa de éxito" textoValor={tasa(G.s[i])}>
          <div className="e3-desliz-tramo" style={{ left: 0, width: xq }} />
          <div className="e3-desliz-banda" style={{ left: xi(IC[0].i), width: xi(IC[1].i) - xi(IC[0].i) }} />
          <span className="e3-desliz-arriba izq obs" style={{ left: xi(OBS.i) - 4 }} data-escala="">
            <b>{tasa(OBS.s)} observada</b> · banda: IC 95 %
          </span>
          {/* (26/10) Solo la marca del equilibrio que corresponde al descuento elegido: la otra quedaba
              gris y sin rótulo. */}
          <i className="e3-desliz-marca on" style={{ left: xi(eq.i) }} />
          <span className="e3-desliz-arriba izq fuerte" style={{ left: xi(eq.i) - 2 }} data-escala="">
            {tasa(eq.s)}: la regla se paga
          </span>
          <i className="e3-desliz-marca obs" style={{ left: xi(OBS.i) }} />
          <i className="e3-desliz-quiebre" style={{ left: xq }} aria-hidden="true" />
          {MARCAS_S.map((m) => (
            <span key={m.v} className={`e3-desliz-abajo ${m.v === 1 ? 'der' : ''}`}
                  style={{ left: xi(m.i) }} data-escala="">
              {m.v === 1 ? '100 %' : pct(m.v, 0)}
            </span>
          ))}
          <span className="e3-desliz-tramo-rot" style={{ left: 0, width: xq }} data-escala="">
            {fijo(IC[0].s * 100, 2)} a 5 %: tramo ampliado
          </span>
          <span className="e3-desliz-tramo-rot" style={{ left: xq, width: ancho - xq }} data-escala="">
            5 a 100 %
          </span>
        </Deslizante>
        <div className="e3-lecturas">
          <Lectura rotulo="Tasa de éxito s" valor={tasa(G.s[i])} clase="tasa" />
          <Lectura rotulo="ROI de la regla" valor={pctDirecto(reglaRoi, 2)} malo={reglaRoi < 0}
                   estado={reglaRoi < 0 ? 'no se paga' : 'se paga'} />
          <Lectura rotulo="ROI del modelo sobre la regla" valor={pctDirecto(modeloRoi, 2)} malo={modeloRoi < 0}
                   estado={modeloRoi < 0 ? 'no se paga' : 'se paga'} />
        </div>
      </div>
      <div className="e3-llamadas" style={caja(966, Y0, 562)}>
        {d.callouts.map((c) => (
          <div key={c.titulo} className="e3-llamada" style={{ height: 236 }}>
            <p className="e3-llamada-titulo"><Rico t={c.titulo} /></p>
            <p className="e3-llamada-texto"><Rico t={c.texto} /></p>
          </div>
        ))}
      </div>
      <div className="e3-decision malo" style={caja(M, 738, ANCHO, 88)}><p><Rico t={d.decision} /></p></div>
    </Marco>
  )
}

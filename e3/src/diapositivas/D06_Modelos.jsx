// Diapositiva 6: modelado, etapas 1 y 2 (A 2.5, B 4.1 y 4.2). Precisión de la lista de 500 por modelo
// (D3.modelos.filas, en el orden del gráfico del PPTX) y el intervalo de la logística menos la regla.
// (24/10) Tres pasos, como el guion: 1, el piso (tasa base y práctica actual); 2, la regla; 3, los
// modelos, sus llamadas y el intervalo. El selector Validación / Entrenamiento muestra que el gradient
// boosting memoriza: en entrenamiento llega casi al techo de la lista.
import { useState } from 'react'
import { D3 } from '../datos_e3.js'
import { entero, fijo, mesAnio, pct } from '../formato.js'
import { Opciones } from '../controles.jsx'
import { escalaNice } from '../../../src/graficos.jsx'
import { Rico } from '../texto.jsx'
import Marco, { M, QuienN, Y0, caja } from './Marco.jsx'

const MD = D3.modelos
const LARGO_MES = D3.lista.elegida.largo_mes
const PASO_DE = { hoy: 1, regla: 2, modelo: 3 }
const MARCAS_PCT = escalaNice(100, 4).ticks          // 0, 25, 50, 75, 100
const CLASE = (f) => (f.grupo === 'regla' ? 'e3-barra-acc' : f.grupo === 'modelo' ? 'e3-barra-azul3'
  : f.id === 'tasa_base' ? 'e3-barra-gris2' : 'e3-barra-gris')

function Barras({ conjunto, paso }) {
  const W = 840, x0 = 336, x1 = 770
  const x = (v) => x0 + (v / 100) * (x1 - x0)
  const fila = (k) => 22 + k * 37
  const ent = conjunto === 'entrenamiento'
  const techo = MD.entrenamiento.techo_precision * 100
  const sim = { 'data-simulacion': '' }
  return (
    <svg width={W} height={282} className="e3-svg" role="img"
         aria-label={`Precisión de la lista de ${LARGO_MES} por modelo, ${conjunto}`}>
      {ent && paso >= 3 && <line x1={x(techo)} x2={x(techo)} y1={2} y2={232} className="e3-linea-techo" />}
      {MD.filas.map((f, k) => {
        const med = f[conjunto]
        const ve = paso >= PASO_DE[f.grupo] ? '' : 'e3-oculto'
        return (
          <g key={f.id} className={ve}>
            <text x={x0 - 10} y={fila(k) + 6} textAnchor="end" className="e3-t e3-t-17">{f.nombre}</text>
            {med ? (
              <>
                <rect x={x0} y={fila(k) - 13} width={x(med.precision * 100) - x0} height={26} className={CLASE(f)} />
                <text x={x(med.precision * 100) + 7} y={fila(k) + 6} className={`e3-t e3-t-17 e3-halo ${f.grupo === 'regla' ? 'e3-t-b' : ''}`} {...sim}>
                  {pct(med.precision, 1)}
                </text>
              </>
            ) : (
              <text x={x0 + 6} y={fila(k) + 6} className="e3-t e3-t-15 e3-t-mut">no se midió en entrenamiento</text>
            )}
          </g>
        )
      })}
      <line x1={x0} x2={x1} y1={236} y2={236} className="e3-eje" />
      {MARCAS_PCT.map((v) => (
        <g key={v} data-escala="">
          <line x1={x(v)} x2={x(v)} y1={236} y2={242} className="e3-eje" />
          <text x={x(v)} y={260} textAnchor="middle" className="e3-t e3-t-15 e3-t-lbl">{v === 100 ? '100 %' : v}</text>
        </g>
      ))}
      <text x={(x0 + x1) / 2} y={280} textAnchor="middle" className="e3-t e3-t-15 e3-t-lbl" {...(ent ? sim : {})}>
        {ent
          ? `Precisión de la lista en los ${MD.entrenamiento.cortes} cortes de entrenamiento`
          : `Aciertos sobre ${entero(MD.validacion.largo_lista)} contactos (lista de ${LARGO_MES} × ${MD.validacion.cortes} meses de validación)`}
      </text>
    </svg>
  )
}

/** Logística menos regla, en puntos, con su intervalo del 95 %: cruza el cero (G17). */
function Intervalo() {
  const cr = MD.contra_regla
  const [lo, hi] = cr.ic95_pp
  const W = 840, x0 = 70, x1 = 790
  const desde = Math.floor(lo), hasta = Math.ceil(hi) + 1        // un punto de aire a la derecha
  const x = (v) => x0 + ((v - desde) / (hasta - desde)) * (x1 - x0)
  const y = 50
  const marcas = Array.from({ length: hasta - desde + 1 }, (_, k) => desde + k)
  return (
    <svg width={W} height={96} className="e3-svg" role="img"
         aria-label={`Logística menos regla: ${fijo(cr.diferencia_pp, 2, true)} puntos, intervalo ${fijo(lo, 2, true)} a ${fijo(hi, 2, true)}`}>
      <line x1={x(0)} x2={x(0)} y1={14} y2={70} className="e3-linea-cero" />
      <line x1={x(lo)} x2={x(hi)} y1={y} y2={y} className="e3-ic" />
      <line x1={x(lo)} x2={x(lo)} y1={y - 9} y2={y + 9} className="e3-ic" />
      <line x1={x(hi)} x2={x(hi)} y1={y - 9} y2={y + 9} className="e3-ic" />
      <circle cx={x(cr.diferencia_pp)} cy={y} r={8} className="e3-punto" />
      <text x={x(cr.diferencia_pp)} y={y - 16} textAnchor="middle" className="e3-t e3-t-19 e3-t-b e3-t-acc">
        {fijo(cr.diferencia_pp, 2, true)}
      </text>
      <text x={x(lo) - 10} y={y + 6} textAnchor="end" className="e3-t e3-t-17">{fijo(lo, 2, true)}</text>
      <text x={x(hi) + 10} y={y + 6} className="e3-t e3-t-17">{fijo(hi, 2, true)}</text>
      <line x1={x0} x2={x1} y1={74} y2={74} className="e3-eje" />
      {marcas.map((v) => (
        <text key={v} x={x(v)} y={93} textAnchor="middle" className="e3-t e3-t-15 e3-t-lbl" data-escala="">
          {fijo(v, 0, true)}
        </text>
      ))}
    </svg>
  )
}

export default function Modelos({ d, paso = 3, estatico }) {
  const [conjunto, setConjunto] = useState('validacion')
  const hc = 184
  return (
    <Marco kicker={d.kicker} titulo={d.titulo} fuente={d.fuente} n={d.n} paso={paso} pasos={3}
           derecha={<QuienN quien={d.quien} n={d.n} />}>
      <figure className="e3-figura e3-figura-ctl" style={caja(M, Y0, 840, 340)}>
        <div className="e3-figura-cab">
          {conjunto === 'entrenamiento' && paso >= 3 && (
            <span className="e3-techo" data-simulacion="">
              <i aria-hidden="true" /> techo de la lista en entrenamiento: {pct(MD.entrenamiento.techo_precision, 1)}
            </span>
          )}
          <Opciones etiqueta="Conjunto" valor={conjunto} onCambio={setConjunto}
                    opciones={[{ valor: 'validacion', texto: 'Validación' }, { valor: 'entrenamiento', texto: 'Entrenamiento' }]} />
        </div>
        <Barras conjunto={conjunto} paso={paso} />
      </figure>
      <p className="e3-pie-figura" style={caja(M, Y0 + 350, 840)}>
        {conjunto === 'validacion' ? <Rico t={d.pie_figura} /> : (
          <span data-simulacion="">
            Precisión de la lista sin filtrar consentimiento ni bajas, entrenamiento de{' '}
            {mesAnio(MD.entrenamiento.desde)} a {mesAnio(MD.entrenamiento.hasta)}.
          </span>
        )}
      </p>
      <div className={`e3-figura e3-ic-caja ${paso >= 3 ? '' : 'e3-oculto'}`} style={caja(M, 636, 840, 164)}>
        <p className="e3-rotulo">Logística menos regla en validación, en puntos · intervalo del 95 %</p>
        <Intervalo />
      </div>
      <div className={`e3-llamadas ${paso >= 3 ? '' : 'e3-oculto'}`} style={caja(966, Y0, 562)}>
        {d.callouts.map((c) => (
          <div key={c.titulo} className="e3-llamada" style={{ height: hc }}>
            <p className="e3-llamada-titulo"><Rico t={c.titulo} /></p>
            <p className="e3-llamada-texto"><Rico t={c.texto} /></p>
          </div>
        ))}
      </div>
    </Marco>
  )
}

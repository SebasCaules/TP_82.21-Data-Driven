// Diapositiva 4: factibilidad técnica (A 1.1 a 1.3, F16). Las cuatro condiciones de 1 a 3, la línea
// del promedio y la banda de factibilidad media de la escala de la cátedra. (24/10) Pasar el puntero
// o el foco por una condición resalta su fila, y al revés. Las condiciones no son controles: el clic
// sobre ellas pasa de diapositiva como en cualquier otro lugar de la franja.
import { useState } from 'react'
import { D3 } from '../datos_e3.js'
import { fijo } from '../formato.js'
import { Rico } from '../texto.jsx'
import Marco, { M, QuienN, Y0, caja } from './Marco.jsx'

const T = D3.tecnica
const MEDIA = T.escala.find((e) => e.nivel === T.nivel)
// Marcas del eje: los enteros de la escala de la cátedra (1 a 3); el eje sigue un poco más allá
// para que entre el rótulo de la barra de 3.
const DESDE = T.escala[0].desde, HASTA = T.escala[T.escala.length - 1].hasta
const MARCAS = Array.from({ length: HASTA - DESDE + 1 }, (_, k) => DESDE + k)

function Grafico({ activa, setActiva, estatico }) {
  const W = 672, H = 290, x0 = 196, x1 = 640
  const tope = HASTA * 1.15
  const x = (v) => x0 + (v / tope) * (x1 - x0)
  const fila = (k) => 62 + k * 52
  return (
    <svg width={W} height={H} className="e3-svg" role="group" aria-label="Puntaje de las cuatro condiciones técnicas">
      <rect x={x(MEDIA.desde)} y={36} width={x(MEDIA.hasta) - x(MEDIA.desde)} height={214} className="e3-banda" />
      {T.condiciones.map((c, k) => (
        <g key={c.id} className={`e3-cond ${activa === c.id ? 'on' : ''}`} tabIndex={estatico ? -1 : 0}
           role="img" aria-label={`${c.nombre}: ${c.puntaje}`}
           onMouseEnter={() => setActiva(c.id)} onMouseLeave={() => setActiva(null)}
           onFocus={() => setActiva(c.id)} onBlur={() => setActiva(null)}>
          <rect x={0} y={fila(k) - 25} width={W} height={50} className="e3-cond-fondo" />
          <text x={x0 - 10} y={fila(k) + 7} textAnchor="end" className="e3-t e3-t-19">{c.nombre}</text>
          <rect x={x0} y={fila(k) - 17} width={x(c.puntaje) - x0} height={34}
                className={c.puntaje === 3 ? 'e3-barra-acc' : 'e3-barra-azul3'} />
          <text x={x(c.puntaje) + 9} y={fila(k) + 8} className="e3-t e3-t-22 e3-t-b">{c.puntaje}</text>
        </g>
      ))}
      <line x1={x(T.promedio)} x2={x(T.promedio)} y1={36} y2={250} className="e3-linea-prom" />
      <text x={x(T.promedio)} y={24} textAnchor="middle" className="e3-t e3-t-b e3-halo">promedio {fijo(T.promedio, 2)}</text>
      <line x1={x0} x2={W - 8} y1={252} y2={252} className="e3-eje" />
      {MARCAS.map((v) => (
        <g key={v} data-escala="">
          <line x1={x(v)} x2={x(v)} y1={252} y2={258} className="e3-eje" />
          <text x={x(v)} y={279} textAnchor="middle" className="e3-t e3-t-lbl">{v}</text>
        </g>
      ))}
    </svg>
  )
}

export default function Tecnica({ d, estatico }) {
  const [activa, setActiva] = useState(null)
  const filas = d.filas.map((f, k) => ({ ...f, id: T.condiciones[k]?.id, puntaje: T.condiciones[k]?.puntaje }))
  return (
    <Marco kicker={d.kicker} titulo={d.titulo} fuente={d.fuente} n={d.n} derecha={<QuienN quien={d.quien} n={d.n} />}>
      <figure className="e3-figura" style={caja(M, Y0 + 12, 672, 290)}>
        <Grafico activa={activa} setActiva={setActiva} estatico={estatico} />
      </figure>
      <p className="e3-pie-figura" style={caja(M, Y0 + 316, 672)}>
        <i className="e3-muestra-banda" aria-hidden="true" /> <Rico t={d.pie_figura} />
      </p>
      <div className="e3-filas" style={caja(798, Y0, 730)}>
        {filas.map((f) => (
          <div key={f.rotulo} className={`e3-fila ${activa === f.id ? 'on' : ''}`}
               onMouseEnter={() => setActiva(f.id)} onMouseLeave={() => setActiva(null)}>
            {/* (27/10) El puntaje grande, con «/3» chico, en lugar de «Datos · 3». */}
            <p className="e3-fila-rotulo"><b className="e3-fila-p">{f.puntaje}<small className="e3-chico">/3</small></b> <Rico t={f.rotulo} /></p>
            <p className="e3-fila-texto"><Rico t={f.texto} /></p>
          </div>
        ))}
      </div>
      <p className="e3-nota" style={caja(M, 762, 1456)}><Rico t={d.nota} /></p>
    </Marco>
  )
}

// Diapositiva 3: el problema. La línea de tiempo del cliente CLI03296 (C 7.3, H23) en tres pasos,
// como la narra el guion (24/10): 1, su ritmo y su umbral; 2, el corte y lo que faltaba; 3, los 90
// días siguientes, en los que cruza. Cada número sale de D3.caso.
import { useId } from 'react'
import { D3 } from '../datos_e3.js'
import { fecha, fijo } from '../formato.js'
import { Rico } from '../texto.jsx'
import Marco, { ANCHO, M, QuienN, Y0, caja } from './Marco.jsx'

const C = D3.caso
const FIG = { x: M + 560, y: Y0 + 6, w: ANCHO - 560, h: 276 }

function Linea({ paso }) {
  const uid = 'e3' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const ve = (k) => (paso >= k ? '' : 'e3-oculto')
  const dx = 1.62                                   // px por día (27/10: la figura es más angosta)
  const x = (dias) => 24 + dias * dx
  const fin = C.recency_dias + C.ventana_dias
  const yb = 98, hb = 44                            // barra
  return (
    <svg width={FIG.w} height={212} className="e3-svg" role="img"
         aria-label={`Cliente ${C.id_cliente}: intervalo mediano ${C.gap_mediano_dias} días, umbral ${C.umbral_dias}, ${C.recency_dias} días sin comprar al corte`}>
      <line x1={x(0)} x2={x(fin + 10)} y1={yb + hb / 2} y2={yb + hb / 2} className="e3-eje" />
      {/* paso 3: la ventana de 90 días */}
      <g className={ve(3)}>
        <rect x={x(C.recency_dias)} y={yb} width={C.ventana_dias * dx} height={hb} className="e3-ventana" />
        <path d={`M${x(C.recency_dias)},${yb + hb + 8} v8 H${x(fin)} v-8`} className="e3-llave" />
        <text x={x(C.recency_dias + C.ventana_dias / 2)} y={yb + hb + 40} textAnchor="middle" className="e3-t e3-t-acc">
          {C.ventana_dias} días siguientes
        </text>
      </g>
      {/* paso 1: el ritmo (intervalo mediano) y el umbral */}
      <g className={ve(1)}>
        <path d={`M${x(0)},70 v-8 H${x(C.gap_mediano_dias)} v8`} className="e3-llave e3-llave-gris" />
        <text x={x(C.gap_mediano_dias / 2)} y={54} textAnchor="middle" className="e3-t e3-t-lbl">
          cada {C.gap_mediano_dias} días
        </text>
        <line x1={x(0)} x2={x(0)} y1={yb + hb} y2={yb + hb + 18} className="e3-eje" />
        <text x={x(0)} y={yb + hb + 40} className="e3-t e3-t-lbl">última compra</text>
      </g>
      {/* paso 2: el corte */}
      <g className={ve(2)}>
        <rect x={x(0)} y={yb} width={C.recency_dias * dx} height={hb} className="e3-barra-ink" />
        <text x={x(C.recency_dias / 2)} y={yb + hb / 2 + 6} textAnchor="middle" className="e3-t e3-t-blanco e3-t-b">
          {C.recency_dias} días sin comprar al corte
        </text>
        <line x1={x(C.recency_dias)} x2={x(C.recency_dias)} y1={18} y2={yb} className="e3-linea-ink" />
        <text x={x(C.recency_dias) - 6} y={26} textAnchor="end" className="e3-t">corte T · {fecha(C.corte)}</text>
        <line x1={x(C.recency_dias) + 3} x2={x(C.umbral_dias) - 3} y1={78} y2={78} className="e3-flecha"
              markerStart={`url(#${uid}i)`} markerEnd={`url(#${uid}d)`} />
        <text x={x((C.recency_dias + C.umbral_dias) / 2)} y={68} textAnchor="middle" className="e3-t e3-t-acc">
          faltaban {C.dias_para_cruzar}
        </text>
      </g>
      {/* el umbral va arriba de la barra */}
      <g className={ve(1)}>
        <line x1={x(C.umbral_dias)} x2={x(C.umbral_dias)} y1={18} y2={yb + hb + 12} className="e3-umbral" />
        <text x={x(C.umbral_dias) + 7} y={26} className="e3-t e3-t-terra e3-t-b">
          umbral: {fijo(C.factor_umbral, 1)} × {C.gap_mediano_dias} = {C.umbral_dias} días
        </text>
      </g>
      <defs>
        <marker id={`${uid}d`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" className="e3-punta" />
        </marker>
        <marker id={`${uid}i`} viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M10,0 L0,5 L10,10 z" className="e3-punta" />
        </marker>
      </defs>
    </svg>
  )
}

export default function Problema({ d }) {
  const paso = 3        // (27/10) sin pasos: la vista se presenta completa
  const defs = d.definicion.slice(0, -1)
  const firma = d.definicion[d.definicion.length - 1]
  const sep = 30
  const w = (ANCHO - sep * (d.cifras.length - 1)) / d.cifras.length
  return (
    <Marco pregunta={d.pregunta} titulo={d.titulo} fuente={d.fuente} n={d.n}
           derecha={<QuienN quien={d.quien} n={d.n} />}>
      <div className="e3-defs" style={caja(M, Y0, 520)}>
        {defs.map((t, k) => <p key={k}><Rico t={t} /></p>)}
      </div>
      <p className="e3-firma" style={caja(M, 588, 520)}><Rico t={firma} /></p>
      <figure className="e3-figura" style={caja(FIG.x, FIG.y, FIG.w, FIG.h)}>
        <Linea paso={paso} />
        <figcaption className="e3-figura-nota">
          <span className={paso >= 1 ? '' : 'e3-oculto'}>Intervalo mediano entre compras: {C.gap_mediano_dias} días.</span>{' '}
          <span className={paso >= 3 ? '' : 'e3-oculto'}>
            Cruzó su umbral dentro de los {C.ventana_dias} días: es un positivo.
          </span>
        </figcaption>
      </figure>
      <p className="e3-pie-figura" style={caja(FIG.x, FIG.y + FIG.h + 10, FIG.w)}><Rico t={d.pie_figura} /></p>
      {d.cifras.map((c, k) => (
        <div key={k} className="e3-tarjeta e3-cifra" style={caja(M + k * (w + sep), 666, w, 144)}>
          <span className={`e3-cifra-valor ${c.valor.startsWith('−') ? 'malo' : ''}`}><Rico t={c.valor} /></span>
          <span className="e3-cifra-texto"><Rico t={c.texto} /></span>
        </div>
      ))}
    </Marco>
  )
}

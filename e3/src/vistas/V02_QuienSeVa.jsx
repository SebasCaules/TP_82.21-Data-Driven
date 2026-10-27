// V02 · ¿Quién se va? (Parte A 2.1, Parte C 6.5 y 7.3; diapositiva 3 de C3). W2, con la forma de la vista 5:
// banda de cifras con la tarjeta de decisión a la derecha y un gráfico a todo el ancho debajo.
//
// - Banda: la caída de ventas de 2025 contra 2024 (C14), la cifra dominante (regla 13 H1 del E2), y la
//   capacidad de contacto de Marketing por mes (C08), un escalón más chica. Las dos con su texto de C3
//   (`cifras` de la diapositiva 3) y la unidad un escalón más chica (.par-unidad), como en la vista 5.
// - Decisión: la definición del umbral, «A-UMB · vigente» de decisiones.js (DEF-UMBRAL del registro de
//   decisiones de los hitos). La frase corta se arma con el factor y el piso de D3.caso; la definición
//   completa de C3 va al title.
// - Gráfico: la línea de tiempo del cliente real CLI03296 (H23), sin los tres pasos de la diapositiva:
//   su ritmo, los días sin comprar al corte, el umbral, lo que le faltaba y los 90 días siguientes, en
//   los que lo pasó. Encima, la regla que el dibujo muestra («Se va si pasa su umbral…», C3).
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) y el texto de C3 (contenido_e3.js).
// Lo que no entra (el rubro según CAME, la nota «Envío N», «el modelo busca a los que lo van a pasar») va
// al title de su tarjeta y al guion de las notas. La cita al relevamiento («(envío 29)») queda solo en el
// title: los códigos internos van fuera de pantalla (regla 13 H13 del E2).

import { useId } from 'react'
import { Lienzo, escalaNice } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { entero, fecha, fijo } from '../formato.js'
import { plano, sinCodigos, sinCortes } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { Cifra } from '../cifra.jsx'
import { anchoTexto as ancho } from '../medir.js'

const C = D3.caso
const D = C3.DIAPOSITIVAS.find((d) => d.n === 3)
const [CAIDA, CONTACTO] = D.cifras
const [DEF_UMBRAL, DEF_SE_VA, DEF_MODELO] = D.definicion.map(plano)
const sinPunto = (t) => t.replace(/\.$/, '')

// La decisión: id y estado de decisiones.js, como toda vista. La frase corta (≤ 60 caracteres, regla 11
// del E2) con los valores de D3; la definición entera de C3, al title.
const ID_DEC = 'A-UMB'
const DECISION = decision(ID_DEC, {
  llano_corto: `Umbral = ${fijo(C.factor_umbral, 1)} × su ritmo, mínimo ${entero(C.piso_dias)} días`,
  llano: `${DEF_UMBRAL} ${DEF_SE_VA} ${DEF_MODELO}`,
  decision: sinPunto(DEF_UMBRAL),
})

/** La línea de tiempo del cliente, en días desde su última compra. `w`/`h` los mide Lienzo; `k` es el
 *  factor de letra del E2 (escala.js), que el zoom del E3 multiplica. */
function LineaCliente({ w, h, k }) {
  const uid = 'v02' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const fT = 13.5 * k                    // rótulos
  const fF = 14.5 * k                    // rótulos que mandan (corte, umbral, «se va»)
  const fTick = 10.5 * k
  const fTit = 11 * k
  const fin = C.recency_dias + C.ventana_dias
  const { max, ticks } = escalaNice(fin)
  const padL = Math.round(6 * k)
  const padR = Math.round(10 * k)
  const x = (d) => padL + (d / max) * (w - padL - padR)

  // Alto: filas de rótulos arriba, la barra y la llave de la ventana, el eje abajo. Lo que sobra se
  // reparte arriba y abajo para que el dibujo quede centrado en la tarjeta.
  const hFila = Math.round(fT * 1.35)
  const hb = Math.round(Math.max(30 * k, Math.min(80 * k, h * 0.2)))
  const fijoAlto = fF * 1.2 + hFila + 14 * k + hb + 10 * k + hFila + 8 * k + fTick + 10 * k + fTit + 6 * k
  const y0 = Math.max(2, (h - fijoAlto) * 0.45)
  const yA = y0 + fF                     // corte y umbral
  const yB = yA + hFila                  // ritmo y lo que faltaba
  const yLlave = yB + 9 * k
  const yb = yLlave + 5 * k + 9 * k      // barra
  const yLlaveV = yb + hb + 8 * k        // llave de la ventana
  const yEje = yLlaveV + 8 * k + hFila + 4 * k

  const xc = x(C.recency_dias)
  const xu = x(C.umbral_dias)
  const xf = x(fin)

  const tCorte = `corte ${fecha(C.corte)}`
  const tUmbral = `umbral ${entero(C.umbral_dias)} días`
  const tFormula = `= ${fijo(C.factor_umbral, 1)} × ${entero(C.gap_mediano_dias)}`
  // El rótulo del umbral va a la derecha de su línea; si no entra, se corre hasta tocar el borde derecho.
  const anchoUmbral = Math.max(ancho(tUmbral, fF, 700), ancho(tFormula, fT))
  const xUmbralTxt = Math.min(xu + 7 * k, w - 2 - anchoUmbral)
  const tVentana = `${entero(C.ventana_dias)} días siguientes`
  // El punto donde pasa el umbral, sobre el centro de la barra (solo si lo pasó en la ventana).
  const yMedio = yb + hb / 2

  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`Cliente ${C.id_cliente}: compra cada ${entero(C.gap_mediano_dias)} días, umbral ` +
           `${entero(C.umbral_dias)} días, ${entero(C.recency_dias)} días sin comprar al corte del ${fecha(C.corte)}, ` +
           `le faltaban ${entero(C.dias_para_cruzar)}; ${C.cruzo_en_la_ventana ? 'pasó' : 'no pasó'} su umbral en los ` +
           `${entero(C.ventana_dias)} días siguientes`}>
      <defs>
        <marker id={`${uid}d`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--acc)" />
        </marker>
        <marker id={`${uid}i`} viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M10,0 L0,5 L10,10 z" fill="var(--acc)" />
        </marker>
      </defs>

      {/* La ventana: los 90 días siguientes al corte, en azul claro, con su llave debajo. */}
      <g>
        <title>{`los ${entero(C.ventana_dias)} días siguientes al corte`}</title>
        <rect x={xc} y={yb} width={Math.max(0, xf - xc)} height={hb} fill="var(--azul1)" />
        <path d={`M${xc},${yLlaveV} v${6 * k} H${xf} v${-6 * k}`} fill="none" stroke="var(--acc)" strokeWidth="1.5" />
        <text x={(xc + xf) / 2} y={yLlaveV + 6 * k + fT * 1.05} fontSize={fT} fill="var(--acc)" fontWeight={600}
              textAnchor="middle">{tVentana}</text>
      </g>

      {/* Los días sin comprar al corte: la barra que hay que mirar, en --acc. */}
      <g>
        <title>{`${entero(C.recency_dias)} días sin comprar al corte del ${fecha(C.corte)}`}</title>
        <rect x={x(0)} y={yb} width={Math.max(2, xc - x(0))} height={hb} fill="var(--acc)" />
        <text x={(x(0) + xc) / 2} y={yMedio} fontSize={fF} fontWeight={700} fill="#fff" textAnchor="middle"
              dominantBaseline="central" className="tabular">{`${entero(C.recency_dias)} días sin comprar`}</text>
      </g>

      {/* Su ritmo: el intervalo mediano entre compras, como llave sobre la barra. */}
      <g>
        <title>{`intervalo mediano entre compras: ${entero(C.gap_mediano_dias)} días`}</title>
        <path d={`M${x(0)},${yLlave + 6 * k} v${-6 * k} H${x(C.gap_mediano_dias)} v${6 * k}`} fill="none"
              stroke="var(--mut2)" strokeWidth="1.5" />
        <text x={(x(0) + x(C.gap_mediano_dias)) / 2} y={yB} fontSize={fT} fill="var(--mut2)" fontWeight={500}
              textAnchor="middle" className="tabular">{`compra cada ${entero(C.gap_mediano_dias)} días`}</text>
      </g>

      {/* Lo que le faltaba al corte para pasar su umbral. */}
      <g>
        <title>{`al corte le faltaban ${entero(C.dias_para_cruzar)} días para pasar su umbral`}</title>
        <line x1={xc + 3} x2={xu - 3} y1={yLlave + 3 * k} y2={yLlave + 3 * k} stroke="var(--acc)" strokeWidth="1.5"
              markerStart={`url(#${uid}i)`} markerEnd={`url(#${uid}d)`} />
        <text x={(xc + xu) / 2} y={yB} fontSize={fT} fill="var(--acc)" fontWeight={600} textAnchor="middle"
              className="tabular">{`faltaban ${entero(C.dias_para_cruzar)}`}</text>
      </g>

      {/* El corte: línea en tinta, la fecha a su izquierda. */}
      <g>
        <title>{`corte T: ${fecha(C.corte)}`}</title>
        <line x1={xc} x2={xc} y1={yA - fF * 0.9} y2={yb + hb + 4 * k} stroke="var(--ink)" strokeWidth="2" />
        <text x={xc - 7 * k} y={yA} fontSize={fF} fill="var(--ink)" fontWeight={700} textAnchor="end"
              className="tabular">{tCorte}</text>
      </g>

      {/* El umbral, en terracota con su rótulo: pasarlo es irse. */}
      <g>
        <title>{`umbral = máx(${entero(C.piso_dias)}; ${fijo(C.factor_umbral, 1)} × ${entero(C.gap_mediano_dias)}) = ` +
          `${entero(C.umbral_dias)} días`}</title>
        <line x1={xu} x2={xu} y1={yA - fF * 0.9} y2={yb + hb + 4 * k} stroke="var(--terra)" strokeWidth="2" />
        <text x={xUmbralTxt} y={yA} fontSize={fF} fill="var(--terra)" fontWeight={700} className="tabular">{tUmbral}</text>
        <text x={xUmbralTxt} y={yB} fontSize={fT} fill="var(--terra)" fontWeight={500} className="tabular">{tFormula}</text>
      </g>

      {/* Dónde lo pasó: dentro de la ventana, sobre la línea del umbral. */}
      {C.cruzo_en_la_ventana && (
        <g>
          <title>{`pasó su umbral dentro de los ${entero(C.ventana_dias)} días siguientes: es un positivo`}</title>
          <circle cx={xu} cy={yMedio} r={5 * k} fill="var(--terra)" stroke="#fff" strokeWidth="1.5" />
          <text x={xu + 10 * k} y={yMedio} fontSize={fF} fill="var(--terra)" fontWeight={700}
                dominantBaseline="central">se va</text>
        </g>
      )}

      {/* Eje de días, con su título en la punta (regla 21). */}
      <g>
        <line x1={x(0)} x2={x(max)} y1={yEje} y2={yEje} stroke="var(--eje)" strokeWidth="1" />
        {ticks.map((t, i) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={yEje} y2={yEje + 4} stroke="var(--eje)" strokeWidth="1" />
            <text x={x(t)} y={yEje + 5 + fTick} fontSize={fTick} fill="var(--mut)" className="tabular"
                  textAnchor={i === 0 ? 'start' : i === ticks.length - 1 ? 'end' : 'middle'}>{fijo(t, 0)}</text>
          </g>
        ))}
        <text x={x(max)} y={yEje + 5 + fTick + 8 * k + fTit} fontSize={fTit} fill="var(--mut2)" textAnchor="end"
              fontFamily="var(--mono)" fontWeight={600} letterSpacing=".09em"
              style={{ textTransform: 'uppercase' }}>días desde la última compra</text>
      </g>
    </svg>
  )
}

export const meta = { id: 'V02', dc: ID_DEC }

export default function V02QuienSeVa() {
  const k = useEscalaTexto()
  const [caidaLinea] = plano(CAIDA.texto).split('. ')
  return (
    <section className="pant v02">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta e2-central" style={{ gridColumn: 'span 1' }}
             title={`${D.kicker}: ${plano(CAIDA.valor)} de ${plano(CAIDA.texto)}`}>
          <span className="kpi-lbl"><span>{D.kicker}</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra texto={CAIDA.valor} /></div>
          </div>
          <p className="e2-linea">{sinCortes(caidaLinea)}</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 1' }}
             title={`${plano(CONTACTO.valor)}: ${plano(CONTACTO.texto)}. ${D.definicion.length > 3 ? plano(D.definicion[3]) : ''}`}>
          <span className="kpi-lbl"><span>Capacidad de Marketing</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra texto={CONTACTO.valor} sec /></div>
          </div>
          <p className="e2-linea">{sinCortes(sinCodigos(CONTACTO.texto))}</p>
        </div>
      </Banda>

      <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }} title={plano(D.pie_figura)}>
        <span className="kpi-lbl frase">
          <span>{sinPunto(DEF_SE_VA)}</span>
          <b className="tabular">{`${sinPunto(plano(D.pie_figura)).replace(/\s*\([^)]*\)$/, '')} · ${C.id_cliente}`}</b>
        </span>
        <div style={{ flex: '1 1 0', minHeight: 0, marginTop: 'clamp(6px, 1.6cqh, 20px)', display: 'flex', flexDirection: 'column' }}>
          <Lienzo className="lienzo">
            {({ w, h }) => <LineaCliente w={w} h={h} k={k} />}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}

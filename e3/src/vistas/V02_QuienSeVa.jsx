// V02 · ¿Quién se va? (Parte A 2.1, Parte C 6.5 y 7.3; diapositiva 3 de C3). Banda de cifras con la tarjeta
// de decisión a la derecha y la línea de tiempo de un cliente a todo el ancho debajo.
//
// Decisiones del 28/10 (unidad V02 de .workforce/PLAN.md, con las correcciones del crítico):
// - Banda, un número por tarjeta y la central primero (N0-6). Central: la parte de los clientes que se va,
//   D3.test.conjunto.tasa (25,35 %, registro J02): de las filas cliente × corte del test (cortes de enero a
//   mayo de 2025, clientes elegibles que al corte todavía no pasaron su umbral; pipeline/tablon.py), las que
//   pasan su umbral en los 90 días siguientes. Responde la pregunta de la vista. El rótulo arma «90» con
//   D3.caso.ventana_dias. Secundaria: la caída de ventas de 2025 contra 2024 (D3.encuadre, C14) con el
//   fragmento «no se sabe cuánto es mercado» (pendiente 74 del E3 y bloque D de C 6.1): ya no dice «con
//   meses incompletos», que desmentía la cifra; el texto entero de C3 (meses incompletos, CAME) va al title.
//   Sale la capacidad de Marketing (500/mes): no responde quién se va; queda en el guion y en la V04.
// - Decisión: la definición del umbral, «A-UMB · vigente» de decisiones.js (DEF-UMBRAL). La frase corta se
//   arma con el factor y el piso de D3.caso; la definición completa de C3 va al title.
// - Gráfico: la línea de tiempo del cliente real CLI03296 (H23), el mejor gráfico del tablero. Llena el alto
//   de su tarjeta: la barra crece con lo que sobra y el eje baja al pie. El dato en --acc (los días sin
//   comprar, el umbral y el punto donde «se va»); el contexto en --e3-ctx y --e3-eje; la ventana de 90 días
//   marcada con contorno (--e3-contorno) y rótulo en tinta, con un lavado leve (--e3-zona) detrás. La
//   conclusión del gráfico es su título (.e3-conclusion); la definición de «se va» (C3), debajo.
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) con formato.js, y el texto de C3.
// Los códigos internos («envío 29», la nota «Envío N») van solo en los title (regla 13 H13 del E2).

import { useId } from 'react'
import { Lienzo, escalaNice } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { entero, fecha, fijo, pct, pctDirecto } from '../formato.js'
import { plano, sinCodigos } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { Cifra } from '../cifra.jsx'
import { anchoTexto as ancho } from '../medir.js'
import './V02.css'

const C = D3.caso
const T = D3.test.conjunto
const D = C3.DIAPOSITIVAS.find((d) => d.n === 3)
const [CAIDA] = D.cifras
const [DEF_UMBRAL, DEF_SE_VA, DEF_MODELO] = D.definicion.map(plano)
const sinPunto = (t) => t.replace(/\.$/, '')

// Las dos tarjetas de la banda: rótulo (≤ 22 caracteres), cifra de D3 con formato.js, fragmento sin cifra.
const SE_VAN = {
  rotulo: `Se van en ${entero(C.ventana_dias)} días`,
  valor: pct(T.tasa, 2),
  linea: 'de los que siguen comprando',
  title: `${pct(T.tasa, 2)}: de ${entero(T.filas)} filas cliente × corte del test (cortes del ${fecha(T.desde)} al ` +
    `${fecha(T.hasta)}; clientes que al corte no pasaron su umbral), ${entero(T.positivos)} lo pasan en los ` +
    `${entero(C.ventana_dias)} días siguientes. ${DEF_SE_VA}`,
}
const VENTAS = {
  rotulo: 'Ventas 2025 vs. 2024',
  valor: pctDirecto(D3.encuadre.variacion_ventas_2025_pct, 1),
  linea: 'no se sabe cuánto es mercado',
  title: `${plano(CAIDA.valor)}: ${sinCodigos(plano(CAIDA.texto))}`,
}

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
  const fT = 15 * k                      // rótulos
  const fF = 17 * k                      // rótulos que mandan (corte, umbral, «se va»)
  const fTick = 12 * k
  const fTit = 12 * k
  const fin = C.recency_dias + C.ventana_dias
  const { max, ticks } = escalaNice(fin)
  const padL = Math.round(6 * k)
  const padR = Math.round(10 * k)
  const x = (d) => padL + (d / max) * (w - padL - padR)

  // Alto, de arriba abajo: dos filas de rótulos, las llaves, la barra, la llave de la ventana con su
  // rótulo y el eje con su título al pie. La barra se queda con lo que sobra (hasta el 45 % del alto);
  // si aún sobra, un tercio va arriba y el resto entre la ventana y el eje.
  const hFila = Math.round(fT * 1.4)
  const arriba = fF + hFila + 9 * k + 14 * k                              // de y0 a la barra
  const abajo = 9 * k + 6 * k + fT * 1.25 + 14 * k + 5 + fTick + 8 * k + fTit + 4 * k
  const hb = Math.round(Math.max(30 * k, Math.min(h * 0.45, h - arriba - abajo)))
  const sobra = Math.max(0, h - arriba - abajo - hb)
  const y0 = Math.max(2, sobra / 3)
  const yA = y0 + fF                     // corte y umbral
  const yB = yA + hFila                  // ritmo y lo que faltaba
  const yLlave = yB + 9 * k
  const yb = yLlave + 14 * k             // barra
  const yLlaveV = yb + hb + 9 * k        // llave de la ventana
  const yEje = h - (4 * k + fTit + 8 * k + fTick + 5)   // el eje, al pie de la tarjeta

  const xc = x(C.recency_dias)
  const xu = x(C.umbral_dias)
  const xf = x(fin)
  const yMedio = yb + hb / 2

  const tCorte = `corte ${fecha(C.corte)}`
  const tUmbral = `umbral ${entero(C.umbral_dias)} días`
  const tFormula = `= ${fijo(C.factor_umbral, 1)} × ${entero(C.gap_mediano_dias)}`
  // El rótulo del umbral va a la derecha de su línea; si no entra, se corre hasta tocar el borde derecho.
  const anchoUmbral = Math.max(ancho(tUmbral, fF, 700), ancho(tFormula, fT))
  const xUmbralTxt = Math.min(xu + 8 * k, w - 2 - anchoUmbral)
  const tVentana = `${entero(C.ventana_dias)} días siguientes al corte`

  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`Cliente ${C.id_cliente}: compra cada ${entero(C.gap_mediano_dias)} días, umbral ` +
           `${entero(C.umbral_dias)} días, ${entero(C.recency_dias)} días sin comprar al corte del ${fecha(C.corte)}, ` +
           `le faltaban ${entero(C.dias_para_cruzar)}; ${C.cruzo_en_la_ventana ? 'pasó' : 'no pasó'} su umbral en los ` +
           `${entero(C.ventana_dias)} días siguientes`}>
      <defs>
        <marker id={`${uid}d`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--ink)" />
        </marker>
        <marker id={`${uid}i`} viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M10,0 L0,5 L10,10 z" fill="var(--ink)" />
        </marker>
      </defs>

      {/* La ventana: los 90 días siguientes al corte. Contorno y rótulo en tinta; el lavado solo separa. */}
      <g>
        <title>{`los ${entero(C.ventana_dias)} días siguientes al corte`}</title>
        <rect x={xc} y={yb} width={Math.max(0, xf - xc)} height={hb} fill="var(--e3-zona, rgba(34, 69, 111, .16))"
              stroke="var(--e3-contorno, #4f5a6e)" strokeWidth="1.5" strokeDasharray={`${6 * k} ${4 * k}`} />
        <path d={`M${xc},${yLlaveV} v${6 * k} H${xf} v${-6 * k}`} fill="none"
              stroke="var(--e3-contorno, #4f5a6e)" strokeWidth="2" />
        <text x={(xc + xf) / 2} y={yLlaveV + 6 * k + fT * 1.1} fontSize={fT} fill="var(--ink)" fontWeight={600}
              textAnchor="middle">{tVentana}</text>
      </g>

      {/* Los días sin comprar al corte: la barra que hay que mirar, en --acc. */}
      <g>
        <title>{`${entero(C.recency_dias)} días sin comprar al corte del ${fecha(C.corte)}`}</title>
        <rect x={x(0)} y={yb} width={Math.max(2, xc - x(0))} height={hb} fill="var(--acc)" />
        <text x={(x(0) + xc) / 2} y={yMedio} fontSize={fF * 1.15} fontWeight={700} fill="#fff" textAnchor="middle"
              dominantBaseline="central" className="tabular">{`${entero(C.recency_dias)} días sin comprar`}</text>
      </g>

      {/* Su ritmo: el intervalo mediano entre compras, como llave sobre la barra (contexto). */}
      <g>
        <title>{`intervalo mediano entre compras: ${entero(C.gap_mediano_dias)} días`}</title>
        <path d={`M${x(0)},${yLlave + 6 * k} v${-6 * k} H${x(C.gap_mediano_dias)} v${6 * k}`} fill="none"
              stroke="var(--e3-eje, #6a7489)" strokeWidth="1.5" />
        <text x={(x(0) + x(C.gap_mediano_dias)) / 2} y={yB} fontSize={fT} fill="var(--e3-ctx, #5a6478)" fontWeight={500}
              textAnchor="middle" className="tabular">{`compra cada ${entero(C.gap_mediano_dias)} días`}</text>
      </g>

      {/* Lo que le faltaba al corte para pasar su umbral. */}
      <g>
        <title>{`al corte le faltaban ${entero(C.dias_para_cruzar)} días para pasar su umbral`}</title>
        <line x1={xc + 3} x2={xu - 3} y1={yLlave + 3 * k} y2={yLlave + 3 * k} stroke="var(--ink)" strokeWidth="1.5"
              markerStart={`url(#${uid}i)`} markerEnd={`url(#${uid}d)`} />
        <text x={(xc + xu) / 2} y={yB} fontSize={fT} fill="var(--ink)" fontWeight={600} textAnchor="middle"
              className="tabular">{`faltaban ${entero(C.dias_para_cruzar)}`}</text>
      </g>

      {/* El corte: línea en tinta, la fecha a su izquierda. */}
      <g>
        <title>{`corte T: ${fecha(C.corte)}`}</title>
        <line x1={xc} x2={xc} y1={yA - fF * 0.9} y2={yb + hb + 4 * k} stroke="var(--ink)" strokeWidth="2" />
        <text x={xc - 8 * k} y={yA} fontSize={fF} fill="var(--ink)" fontWeight={700} textAnchor="end"
              className="tabular">{tCorte}</text>
      </g>

      {/* El umbral, en --acc con su rótulo: pasarlo es irse. */}
      <g>
        <title>{`umbral = máx(${entero(C.piso_dias)}; ${fijo(C.factor_umbral, 1)} × ${entero(C.gap_mediano_dias)}) = ` +
          `${entero(C.umbral_dias)} días`}</title>
        <line x1={xu} x2={xu} y1={yA - fF * 0.9} y2={yb + hb + 4 * k} stroke="var(--acc)" strokeWidth="3" />
        <text x={xUmbralTxt} y={yA} fontSize={fF} fill="var(--acc)" fontWeight={700} className="tabular">{tUmbral}</text>
        <text x={xUmbralTxt} y={yB} fontSize={fT} fill="var(--acc)" fontWeight={500} className="tabular">{tFormula}</text>
      </g>

      {/* Dónde lo pasó: dentro de la ventana, sobre la línea del umbral. */}
      {C.cruzo_en_la_ventana && (
        <g>
          <title>{`pasó su umbral dentro de los ${entero(C.ventana_dias)} días siguientes: es un positivo`}</title>
          <circle cx={xu} cy={yMedio} r={7 * k} fill="var(--acc)" stroke="#fff" strokeWidth="2" />
          <text x={xu + 13 * k} y={yMedio} fontSize={fF * 1.15} fill="var(--acc)" fontWeight={700}
                dominantBaseline="central">se va</text>
        </g>
      )}

      {/* Eje de días, con su título en la punta (regla 21). */}
      <g>
        <line x1={x(0)} x2={x(max)} y1={yEje} y2={yEje} stroke="var(--e3-eje, #6a7489)" strokeWidth="1.5" />
        {ticks.map((t, i) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={yEje} y2={yEje + 5} stroke="var(--e3-eje, #6a7489)" strokeWidth="1.5" />
            <text x={x(t)} y={yEje + 5 + fTick} fontSize={fTick} fill="var(--e3-ctx, #5a6478)" className="tabular"
                  fontWeight={500}
                  textAnchor={i === 0 ? 'start' : i === ticks.length - 1 ? 'end' : 'middle'}>{fijo(t, 0)}</text>
          </g>
        ))}
        <text x={x(max)} y={yEje + 5 + fTick + 8 * k + fTit} fontSize={fTit} fill="var(--e3-ctx, #5a6478)"
              textAnchor="end" fontFamily="var(--mono)" fontWeight={600} letterSpacing=".09em"
              style={{ textTransform: 'uppercase' }}>días desde la última compra</text>
      </g>
    </svg>
  )
}

export const meta = { id: 'V02', dc: ID_DEC }

function TarjetaCifra({ c, central, span }) {
  return (
    <div className={`tarjeta${central ? ' e2-central' : ''}`} style={{ gridColumn: `span ${span}` }} title={c.title}>
      <span className="kpi-lbl"><span>{c.rotulo}</span></span>
      <div className="ban-par">
        <div className="par-item par-unico"><Cifra texto={c.valor} sec={!central} /></div>
      </div>
      <p className="e2-linea">{c.linea}</p>
    </div>
  )
}

export default function V02QuienSeVa() {
  const k = useEscalaTexto()
  const conclusion = C.cruzo_en_la_ventana
    ? <>Este cliente pasó su umbral <b className="tabular">{`${entero(C.dias_para_cruzar)} días`}</b> después del corte: se va</>
    : <>Este cliente no pasó su umbral en los <b className="tabular">{`${entero(C.ventana_dias)} días`}</b> siguientes</>
  return (
    <section className="pant v02">
      <Banda dcs={[DECISION]}>
        <TarjetaCifra c={SE_VAN} central span={3} />
        <TarjetaCifra c={VENTAS} span={2} />
      </Banda>

      <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }} title={plano(D.pie_figura)}>
        <div className="e3-v02-cab">
          <div className="e3-v02-fila">
            <p className="e3-conclusion">{conclusion}</p>
            <span className="e3-v02-quien tabular">{`Cliente real · ${C.id_cliente}`}</span>
          </div>
          <p className="e3-v02-def">{DEF_SE_VA}</p>
        </div>
        <div style={{ flex: '1 1 0', minHeight: 0, marginTop: 'clamp(8px, 2cqh, 24px)', display: 'flex', flexDirection: 'column' }}>
          <Lienzo className="lienzo">
            {({ w, h }) => <LineaCliente w={w} h={h} k={k} />}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}

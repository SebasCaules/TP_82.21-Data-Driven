// D1 — la exposición contra las dos bases posibles. Dos barras segmentadas desde cero
// (regla 4), una por base (el gasto anual estimado y lo histórico acumulado), con el
// tramo en riesgo en el único color de énfasis y el resto con trama (regla 18, A-1):
// ninguna lectura depende solo del color. El denominador anualizado se nombra siempre
// "gasto anual estimado", nunca "lo que la base factura por año": no es un número de
// ventas real, es facturación dividida por años de antigüedad (capa a del protocolo).

import { Lienzo, BarraTramos } from '../graficos.jsx'
import { pesos, millones, pct, entero } from '../agregacion.js'

export default function D1({ info }) {
  const pctAnual = info.pct
  const pctHist = info.facturacion ? (100 * info.facturacionRiesgo) / info.facturacion : 0

  // El segundo tramo sale de restar sobre valores YA redondeados a la misma resolución
  // que pesos()/millones() (0,1 M), no del valor crudo: sumar dos tramos redondeados por
  // separado podía dar 449,8 M cuando la bajada, redondeando el total, declaraba 449,9 M.
  // Redondeando primero y restando después, los tramos siempre suman lo que dice la bajada.
  const redondeoM = (x) => Math.round(x / 1e5) * 1e5

  const tramosAnual = [
    { etiqueta: 'Exposición (en riesgo)', valor: info.exposicion, enfasis: true },
    { etiqueta: 'Resto del gasto estimado',
      valor: Math.max(0, redondeoM(info.baseAnualizada) - redondeoM(info.exposicion)) },
  ]
  const tramosHist = [
    { etiqueta: 'Facturación en riesgo', valor: info.facturacionRiesgo, enfasis: true },
    { etiqueta: 'Resto facturado',
      valor: Math.max(0, redondeoM(info.facturacion) - redondeoM(info.facturacionRiesgo)) },
  ]

  return (
    <section className="pant">
      <h1 className="titulo">
        No es un mal año: el {pct(pctHist)} de todo lo facturado desde 2022 está en las
        mismas manos
      </h1>
      <p className="bajada">
        El gasto anual estimado de la base es ARS {millones(info.baseAnualizada)}. Lo
        facturado desde 2022, ARS {millones(info.facturacion)}.
        {info.historiaCorta > 0 && (
          <> {entero(info.historiaCorta)} {info.historiaCorta === 1 ? 'cliente' : 'clientes'} con
            menos de un año inflan el anualizado; sin ellos son ARS {millones(info.baseAnualizada1a)}.</>
        )}
      </p>

      <div className="lienzo" style={{ flexDirection: 'column' }}>
        <div className="tarjeta" style={{ flex: 1, minHeight: 0 }}>
          <div className="kpi-lbl">
            Exposición sobre gasto anual estimado
            <b>{pct(pctAnual)}</b>
          </div>
          <Lienzo>
            {({ w, h }) => (
              // Sin alturaBarra el tramo queda con un tope de 58 px y la mitad de la
              // tarjeta abajo en blanco: se pide el alto disponible menos el margen fijo
              // que la primitiva reserva arriba (rótulo, 20 px) y abajo (nota, 34 px).
              <div style={{ position: 'relative', width: w, height: h }}>
                <BarraTramos tramos={tramosAnual} w={w} h={h} formato={pesos}
                             alturaBarra={Math.max(30, h - 54)} />
                {/* BarraTramos normaliza contra su propio total y llena siempre el ancho
                    completo: sin esta base a la vista, este panel y el de abajo (con una
                    base 2,7 veces mayor) se leen como del mismo tamaño porque miden lo
                    mismo en pantalla. */}
                <svg width={w} height={h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  <text x={w} y={11} fontSize="10" fill="var(--mut)" letterSpacing=".07em"
                        textAnchor="end" style={{ textTransform: 'uppercase' }}>
                    gasto anual · {pesos(info.baseAnualizada)}
                  </text>
                </svg>
              </div>
            )}
          </Lienzo>
        </div>
        <div className="tarjeta" style={{ flex: 1, minHeight: 0 }}>
          <div className="kpi-lbl">
            Facturación en riesgo sobre histórico acumulado
            <b>{pct(pctHist)}</b>
          </div>
          <Lienzo>
            {({ w, h }) => (
              <div style={{ position: 'relative', width: w, height: h }}>
                <BarraTramos tramos={tramosHist} w={w} h={h} formato={pesos}
                             alturaBarra={Math.max(30, h - 54)} />
                <svg width={w} height={h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  <text x={w} y={11} fontSize="10" fill="var(--mut)" letterSpacing=".07em"
                        textAnchor="end" style={{ textTransform: 'uppercase' }}>
                    histórico · {pesos(info.facturacion)}
                  </text>
                </svg>
              </div>
            )}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}

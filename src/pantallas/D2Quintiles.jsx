// D2 — riesgo por quintil de valor. La barra sigue el denominador que fija la Parte D
// (riesgo sobre el total del quintil, nr/n): eso no se toca. Lo que corrige el comité
// es la lectura: el salto Q1→Q2 es de composición (Q1 está compuesto en su mayoría por
// clientes sin historial suficiente para calificar como riesgo), no un efecto de valor.

import { Lienzo, BarrasH } from '../graficos.jsx'
import Semaforo, { estadoInverso } from '../Semaforo.jsx'
import { entero, meta, pct, porDimension } from '../agregacion.js'

const ANCHO_ETIQUETA = 54

export default function D2({ iCorte, filtro, info, verEnLista }) {
  const q = porDimension(iCorte, 'quintil', filtro)

  // El baseline es el promedio del propio array de barras, no info: cuando el filtro
  // ES quintil, porDimension no lo aplica al eje (las 5 barras no cambian), pero
  // corteInfo sí filtra y el "general" terminaba mostrando la tasa de un solo quintil.
  const totalGeneral = q.reduce((s, c) => ({ n: s.n + c.n, nr: s.nr + c.nr }), { n: 0, nr: 0 })
  const promedio = totalGeneral.n ? (100 * totalGeneral.nr) / totalGeneral.n : 0

  const datos = q.map((c, i) => ({
    etiqueta: `Q${i + 1}`,
    valor: c.n ? (100 * c.nr) / c.n : 0,
    nota: `${entero(c.nr)} de ${entero(c.ne)} elegibles`,
    enfasis: i === 4,
  }))

  // Tasa entre clientes comparables: sobre elegibles (nr/ne), no sobre el total del quintil.
  const tasaElegibles = (c) => (c.ne ? (100 * c.nr) / c.ne : 0)
  const gradQ1 = tasaElegibles(q[0])
  const gradQ5 = tasaElegibles(q[4])
  const pctElegiblesQ1 = q[0].n ? (100 * q[0].ne) / q[0].n : 0
  const sinHistoriaQ1 = 100 - pctElegiblesQ1

  // Con algunos filtros Q1 se queda sin clientes o sin elegibles: ahí el 100 % y el 0,0 %
  // del gradiente no son una medición, son el guard de división por cero. La bajada de
  // composición no aplica: no hay nada que descomponer.
  const sinBaseQ1 = q[0].n === 0 || q[0].ne === 0
  const sube = gradQ5 >= gradQ1
  const ratio = gradQ1 ? (gradQ5 / gradQ1).toFixed(2).replace('.', ',') : null

  // Piso de base para la comparación entre elegibles: con ne de un dígito la tasa cae en
  // un puñado de valores posibles (1 de 2 da 50,0 %) y puesta al lado de una tasa de
  // cientos de casos parece medir lo mismo sin serlo. Por debajo del piso, la bajada
  // declara los conteos en vez de la tasa.
  const BASE_MINIMA_GRADIENTE = 30
  const baseFlaca = !sinBaseQ1 && (q[0].ne < BASE_MINIMA_GRADIENTE || q[4].ne < BASE_MINIMA_GRADIENTE)

  let bajada
  if (sinBaseQ1) {
    bajada = 'Con este filtro Q1 no tiene clientes con historia suficiente: el gradiente entre elegibles se lee sobre los quintiles con base.'
  } else if (baseFlaca) {
    bajada = `El salto Q1→Q2 es de composición: ${pct(sinHistoriaQ1)} de Q1 tiene menos de 3 compras, no califica como riesgo. La base de elegibles es chica en este recorte (Q1: ${entero(q[0].ne)}, Q5: ${entero(q[4].ne)}): la tasa entre elegibles no alcanza para comparar.`
  } else if (sube) {
    // ratio puede quedar en null con gradQ1 en 0 (hay elegibles pero ninguno en riesgo):
    // ahí no hay "veces" que declarar, y el guard evita imprimir "null" en pantalla.
    bajada = `El salto Q1→Q2 es de composición: ${pct(sinHistoriaQ1)} de Q1 tiene menos de 3 compras, no califica como riesgo. Entre elegibles el gradiente real va de ${pct(gradQ1)} a ${pct(gradQ5)}${ratio != null ? `, ${ratio}×` : ''}.`
  } else {
    // gradQ5 < gradQ1: no llamarlo "gradiente" ni prometer una subida que en este
    // estado no se da, para no chocar con el título de la pantalla.
    bajada = `El salto Q1→Q2 es de composición: ${pct(sinHistoriaQ1)} de Q1 tiene menos de 3 compras, no califica como riesgo. Entre elegibles, Q1 y Q5 van de ${pct(gradQ1)} a ${pct(gradQ5)}.`
  }

  return (
    <section className="pant">
      <h1 className="titulo">
        El riesgo sube con el valor, pero menos de lo que sugiere el total
      </h1>
      <p className="bajada">{bajada}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="kpi-lbl" style={{ display: 'inline' }}>Riesgo en Q5</span>
        <b className="tabular" style={{ fontSize: 15 }}>{pct(datos[4].valor)}</b>
        <Semaforo estado={estadoInverso(datos[4].valor, meta.umbral_q5)} de="riesgo en Q5" />
      </div>
      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <div style={{ position: 'relative', width: w, height: h }}>
              <BarrasH
                datos={datos} w={w} h={h}
                formato={(v) => pct(v)} formatoEje={(v) => pct(v, 0)}
                tituloEje="% en riesgo sobre el total del quintil"
                anchoEtiqueta={ANCHO_ETIQUETA}
                referencia={{ valor: promedio, etiqueta: `general ${pct(promedio)}` }}
                onBarra={verEnLista ? (i) => verEnLista('quintil', i) : undefined}
              />
              {/* Cabecera de la columna de notas, mismo recurso que D3: la nota es nr/ne
                  (otro denominador que el de la barra, que es nr/n) y sin rótulo se lee
                  como si fuera la fracción que dibuja la barra. */}
              <svg width={w} height={h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <text x={w} y={11} fontSize="10" fill="var(--mut)" letterSpacing=".07em"
                      textAnchor="end" style={{ textTransform: 'uppercase' }}>
                  riesgo entre elegibles
                </text>
              </svg>
            </div>
          )}
        </Lienzo>
      </div>
    </section>
  )
}



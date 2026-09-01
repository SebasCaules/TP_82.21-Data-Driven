// D2 — riesgo por quintil de valor, en composición al 100 %. La barra sigue el denominador
// que fija la Parte D (riesgo sobre el total del quintil, nr/n): ese bloque arranca en cero
// y es el mismo largo que dibujaba la barra simple, no se toca. Lo que agrega el formato es
// la CAUSA del salto Q1→Q2: la cuña de no elegibles (menos de 3 compras, por definición
// fuera del cálculo de riesgo) se derrite de Q1 a Q5 y se ve por qué Q1 marca 13,3 %.
//
// La tasa entre elegibles (nr/ne) no está dibujada: es una razón entre dos bloques que el
// ojo no calcula. Va como nota de cada fila, con su encabezado, igual que en D3.

import { Lienzo, BarrasApiladas100 } from '../graficos.jsx'
import Semaforo, { estadoInverso } from '../Semaforo.jsx'
import { entero, meta, pct, porDimension } from '../agregacion.js'
import { Def } from '../Glosario.jsx'

const ANCHO_ETIQUETA = 78

// El bloque del medio lleva su cifra adentro, así que su relleno es el fondo de un rótulo:
// no puede ser el gris medio de las series, que da 3,9:1 con la tinta. Es el paso intermedio
// de la rampa de composición, corrido un escalón desde rampa(2) para conservar 0,06 de salto
// de luminosidad contra la base nueva de la trama. Los tres pasos de D2 —#22456f, este y
// #aab4c3— pasan las cuatro comprobaciones de rampa ordinal contra la tarjeta blanca:
// monótona, saltos ≥ 0,06, extremo claro 2,09:1, un solo tono (8° de dispersión).
// Con la tinta da 5,9:1. El 3:1 contra el papel lo da el contorno.
const SIN_RIESGO = { tono: '#8ba0b7', tinta: 'var(--ink)' }


export default function D2({ iCorte, filtro, info, verEnLista }) {
  const q = porDimension(iCorte, 'quintil', filtro)

  // El baseline es el promedio del propio array de barras, no info: cuando el filtro
  // ES quintil, porDimension no lo aplica al eje (las 5 barras no cambian), pero
  // corteInfo sí filtra y el "general" terminaba mostrando la tasa de un solo quintil.
  const totalGeneral = q.reduce((s, c) => ({ n: s.n + c.n, nr: s.nr + c.nr }), { n: 0, nr: 0 })
  const promedio = totalGeneral.n ? (100 * totalGeneral.nr) / totalGeneral.n : 0

  const tasa = (c) => (c.n ? (100 * c.nr) / c.n : 0)
  const filas = q.map((c, i) => ({
    etiqueta: `Q${i + 1}`,
    sub: i === 0 ? 'menor valor' : i === 4 ? 'mayor valor' : null,
    nota: c.ne ? pct((100 * c.nr) / c.ne) : '—',
    // Los dos extremos son la comparación del título (13,3 % contra 51,8 %) y de la bajada
    // (40,9 % contra 52,1 % entre elegibles). Q2-Q4 son el camino entre uno y otro: van
    // translúcidos, y los extremos se leen a full. La grilla queda equiespaciada.
    enfasis: i === 0 || i === 4,
    segmentos: [
      {
        clave: 'En riesgo', valor: c.nr, tono: 'var(--acc)', tinta: '#fff', enfasis: true,
        // Con un filtro que deja la tasa en un dígito, el bloque de acento se angosta y su
        // cifra —que es el KPI de la pantalla— no entra adentro: sale sobre plaqueta, nunca
        // se cae del dibujo.
        plaqueta: true,
        texto: c.n ? pct(tasa(c)) : null,
      },
      {
        // Los otros dos bloques llevaban su cifra y este no: la composición se leía
        // incompleta y había que restar de cabeza.
        clave: 'Elegible sin riesgo', valor: Math.max(0, c.ne - c.nr), ...SIN_RIESGO,
        borde: true,
        texto: c.n ? pct((100 * Math.max(0, c.ne - c.nr)) / c.n) : null,
      },
      {
        clave: 'No elegible', valor: Math.max(0, c.n - c.ne), tono: 'trama',
        texto: c.n ? pct((100 * (c.n - c.ne)) / c.n) : null,
      },
    ],
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

  // El título es lo que el gráfico dibuja: el salto entre extremos y la cuña que lo explica.
  const titulo = sinBaseQ1
    ? `Q1 se queda sin base en este recorte: Q5 marca ${pct(tasa(q[4]))}`
    : `El salto de ${pct(tasa(q[0]))} a ${pct(tasa(q[4]))} es composición: ${pct(sinHistoriaQ1)} de Q1 no califica`

  let bajada
  if (sinBaseQ1) {
    bajada = 'Con este filtro Q1 no tiene clientes con historia suficiente: el gradiente entre elegibles se lee sobre los quintiles con base.'
  } else if (baseFlaca) {
    bajada = `La base de elegibles es chica en este recorte (Q1: ${entero(q[0].ne)}, Q5: ${entero(q[4].ne)}): la tasa entre elegibles no alcanza para comparar. El bloque de acento sigue siendo nr/n, el denominador del KPI.`
  } else if (sube) {
    // ratio puede quedar en null con gradQ1 en 0 (hay elegibles pero ninguno en riesgo):
    // ahí no hay "veces" que declarar, y el guard evita imprimir "null" en pantalla.
    bajada = `Entre elegibles el gradiente real va de ${pct(gradQ1)} a ${pct(gradQ5)}${ratio != null ? `, ${ratio}×` : ''}: menos de la mitad del salto que muestra el total. El bloque de acento es nr/n, el denominador del KPI.`
  } else {
    // gradQ5 < gradQ1: no prometer una subida que en este estado no se da.
    bajada = `Entre elegibles, Q1 y Q5 van de ${pct(gradQ1)} a ${pct(gradQ5)}. El bloque de acento es nr/n, el denominador del KPI.`
  }

  return (
    <section className="pant">
      <h1 className="titulo">{titulo}</h1>
      <p className="bajada">{bajada}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="kpi-lbl" style={{ display: 'inline' }}>
          <Def id="umbral-q5">Riesgo en Q5</Def>
        </span>
        <b className="tabular" style={{ fontSize: 15 }}>{pct(tasa(q[4]))}</b>
        <Semaforo estado={estadoInverso(tasa(q[4]), meta.umbral_q5)} de="riesgo en Q5"
                  glosario="umbral-q5" />
      </div>
      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <BarrasApiladas100
              filas={filas} w={w} h={h}
              anchoEtiqueta={ANCHO_ETIQUETA}
              apagaResto
              tituloEje="Composición del quintil (% sobre sus clientes)"
              encabezadoNota="riesgo entre elegibles"
              leyenda={[
                { etiqueta: 'En riesgo (nr/n, desde cero)', tono: 'var(--acc)', enfasis: true },
                { etiqueta: 'Elegible sin riesgo', tono: SIN_RIESGO.tono, borde: true },
                { etiqueta: 'No elegible (menos de 3 compras)', tono: 'trama' },
              ]}
              referencia={{ valor: promedio, etiqueta: `general ${pct(promedio)}` }}
              onFila={verEnLista ? (i) => verEnLista('quintil', i) : undefined}
            />
          )}
        </Lienzo>
      </div>
    </section>
  )
}

// V11 · Dataset de entrenamiento — con qué se entrena el modelo del Entregable 3. No es un
// antes/después de una decisión (por eso no lleva .ban-par): es el resultado del tablón que
// arma pipeline/tablon.py sobre la base ya corregida por DC-01 a DC-04 y DC-08. Contrato:
// app/e2/DISENO.md fila V11, app/pipeline/CONTRACT_E2.md §3 y §4 (vistas.V11 = copia de
// resumen_tablon.json), registro fila E08.
//
// El gráfico principal es propio: BarrasH es horizontal y acá la pregunta es una serie de
// 33 cortes mensuales, así que la primitiva no alcanza (mismo motivo que el gráfico propio de
// V03). Las barras van coloreadas por partición con el esquema que fija DISENO.md: train en
// --despues sólido, test en --ink con trama clara (se confundía con train), gap en --antes (gris, la
// misma semántica que "antes de la decisión" en el resto del tablero), y las dos particiones
// que necesitan distinguirse por algo más que el color llevan trama: dev (azul claro) y
// test_flag, la partición cuya ventana de target cae en los meses que DC-09 marcó "cobertura
// no confirmada" y que por eso se aisló de test en vez de descartarse. La leyenda de texto
// va aparte, arriba del gráfico, para que ningún color se lea solo (regla 2 del DISEÑO).
//
// La tasa de churn por corte es una serie de tiempo aparte, en su propio <Lienzo>: no hay eje
// doble (regla transversal 5), y mezclar volumen de filas con una tasa en el mismo dibujo
// pediría justo eso. Es un segundo gráfico propio (no la primitiva `Linea`) por la misma
// razón que el de arriba: a 1152×640 la tarjeta le deja a esta serie muy poco alto, y la
// primitiva genérica reserva marcas y rótulo de pico pensados para un panel más alto. Con
// este alto, sus seis marcas del eje Y se pisaban entre sí y el rótulo del valor más alto
// (que acá cae siempre en el primer corte, ene-23, el techo de la serie) se dibujaba centrado
// sobre el punto, es decir mitad para cada lado, así que la mitad izquierda quedaba fuera del
// eje y montada sobre las marcas, y su caja tapaba el título del eje ("% churn a 90 días").
// Con el eje propio, las marcas usan paso de 25 puntos (0 / 25 / 50, cae justo con el techo de
// la serie) y bajan a solo 0 / techo si ni así entran con aire; y el rótulo del punto más alto
// se ancla hacia ADENTRO del gráfico (nunca centrado sobre el borde) y nunca sube más arriba
// que el primer renglón de marcas, así que no compite con el título.

import { Lienzo, Plaqueta, escalaNice } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, pct, fechaCorta, mesCorto } from '../formato.js'

const V = D2.vistas.V11

const hayDatos = !!(V && Array.isArray(V.cortes) && V.cortes.length)

// pct() formatea con toFixed, que en JS redondea sobre la representación binaria del número:
// 25.45 se guarda como 25.44999999999999928..., así que (25.45).toFixed(1) da "25.4" en vez
// de "25.5" (doble redondeo). Para la tasa global, que además figura tal cual en la fila E08
// del registro (25,45 % → 25,5 % a un decimal), se redondea half-up ANTES de formatear; en la
// escala de un porcentaje a 1 decimal, multiplicar por 10 corrige la representación binaria
// antes del round. No toca formato.js (es compartido con el resto de las vistas): el ajuste
// vive acá, donde se usa la cifra afectada.
// Dos decimales, como la fila E08 del registro y la Parte B (25,45 %): a un decimal el
// tablero, el documento y el registro dejaban de decir el mismo número.
const TASA_GLOBAL = hayDatos ? V.tasa_global_pct : null

// El título dice el hallazgo con la cifra: volumen del tablón, cuántas features y la tasa
// global de churn a 90 días. Todo sale de D2; si el payload cambia, el título cambia solo.
const TITULO = hayDatos
  ? `${entero(V.filas)} filas cliente × corte, ${V.n_features} features, `
    + `${pct(TASA_GLOBAL, 2)} de churn a 90 días`
  : 'Dataset de entrenamiento'

// Qué evalúa el target, en llano para el directorio: la nota técnica de D2 (notas[0], con
// nombres de función y sin tildes) no se lee en segundos. La referencia técnica queda en el pie.
const NOTA_TARGET = 'Cada fila es un cliente con 3 compras o más que no está en riesgo a fin de '
  + 'un mes. Se revisa si está en riesgo 30, 60 y 90 días después: si lo está en alguna de las '
  + 'tres fechas, la fila cuenta como churn.'

// El pie repite lo que todo pie del tablero trae (corte y base, regla transversal 4): acá la
// base es la unidad de fila del tablón, no filas crudas, así que se arma con los mismos datos
// del payload (cortes, primero y último) en vez de escribir la cuenta a mano.
const PIE = hayDatos
  ? 'Una fila por cliente con 3 compras o más y sin riesgo a cada fin de mes, '
    + `${V.cortes.length} cortes del ${fechaCorta(V.cortes[0].corte)} al `
    + `${fechaCorta(V.cortes[V.cortes.length - 1].corte)}; los datos se separan por fecha, `
    + `no al azar · datos hasta ${fechaCorta(D2.meta.corte_ref)} · registro: E08; `
    + 'target Y_i(T) del Anexo 1 v2.1; pipeline/tablon.py'
  : 'registro: E08; target Y_i(T) del Anexo 1 v2.1; pipeline/tablon.py'

export const meta = {
  id: 'V11',
  corto: 'Datos para el modelo',
  titulo: TITULO,
  pie: PIE,
}

// Orden cronológico real de las particiones (train arranca la serie, test_flag la cierra):
// leer la leyenda y la tarjeta de rangos de izquierda a derecha sigue el eje de tiempo.
const ORDEN_PARTICION = ['train', 'dev', 'gap', 'test', 'test_flag']
const ETQ_PARTICION = {
  train: 'train',
  dev: 'dev',
  gap: 'gap',
  test: 'test',
  test_flag: 'test_flag · DC-09',
}
// Solo la leyenda del gráfico lleva el nombre en llano; la tarjeta de rangos conserva el
// rótulo corto para no envolver.
const ETQ_LEYENDA = {
  train: 'train · entrenamiento',
  dev: 'dev · ajuste',
  gap: 'gap · separación',
  test: 'test · prueba',
  test_flag: 'test_flag · prueba sin cobertura confirmada (DC-09)',
}
// Mismo esquema de color en la leyenda, en la tarjeta de rangos y en las barras del gráfico:
// una sola paleta, tres lugares. dev y test_flag llevan trama además de color (forma propia,
// no solo tinte) porque son las dos particiones que DC-09 obliga a distinguir de sus vecinas
// (dev del resto de entrenamiento; test_flag de test).
const ESTILO_PARTICION = {
  train: { swatch: { background: 'var(--despues)' }, relleno: 'var(--despues)' },
  dev: {
    swatch: { backgroundImage: 'repeating-linear-gradient(45deg, var(--azul3), var(--azul3) 2px, var(--acc) 2px, var(--acc) 3px)' },
    relleno: 'url(#v11-trama-dev)',
  },
  gap: { swatch: { background: 'var(--antes)' }, relleno: 'var(--antes)' },
  test: {
    swatch: { backgroundImage: 'repeating-linear-gradient(-45deg, var(--ink), var(--ink) 2px, var(--sup) 2px, var(--sup) 3px)' },
    relleno: 'url(#v11-trama-test)',
  },
  test_flag: {
    swatch: { backgroundImage: 'repeating-linear-gradient(45deg, var(--terra), var(--terra) 2px, var(--terra-osc) 2px, var(--terra-osc) 3px)' },
    relleno: 'url(#v11-trama-testflag)',
  },
}

function SwatchParticion({ particion }) {
  return (
    <span aria-hidden="true" style={{
      width: 11, height: 11, borderRadius: 2, flexShrink: 0,
      ...ESTILO_PARTICION[particion].swatch,
    }}
    />
  )
}

function LeyendaParticion() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 16px', margin: '4px 0 2px' }}>
      {ORDEN_PARTICION.map((p) => (
        <span key={p} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11, fontWeight: 600, color: 'var(--mut2)',
        }}
        >
          <SwatchParticion particion={p} />
          {ETQ_LEYENDA[p]}
        </span>
      ))}
    </div>
  )
}

/** Un rango: desde el primer corte de esa partición hasta el último, y sus filas totales. */
function rangosParticion(v) {
  return ORDEN_PARTICION.map((p) => {
    const cs = v.cortes.filter((c) => c.particion === p)
    const agg = v.por_particion.find((x) => x.particion === p)
    return {
      particion: p,
      desde: cs.length ? cs[0].corte : null,
      hasta: cs.length ? cs[cs.length - 1].corte : null,
      filas: agg ? agg.filas : 0,
    }
  })
}

const EJE = 'var(--eje)'
const MUT = 'var(--mut)'
const MUT2 = 'var(--mut2)'

/**
 * Barras verticales de filas por corte, coloreadas por partición. Gráfico propio (no
 * BarrasH, que es horizontal): la lectura es una serie de tiempo de 33 puntos mensuales.
 * Barras desde cero (regla 4), eje con marcas y título en las dos puntas (regla 21), <title>
 * nativo con etiqueta + valor + partición + tasa en cada barra (regla 14/marca).
 */
function GraficoFilasPorCorte({ w, h, cortes }) {
  if (!cortes.length) return null
  const padL = 46
  // 24: deja aire entre el título del eje (y=11) y la marca superior y los rótulos de partición
  const padT = 24
  const padB = 40
  const padR = 8
  const iw = Math.max(20, w - padL - padR)
  const ih = Math.max(20, h - padT - padB)
  const n = cortes.length
  const paso = iw / n
  const anchoBarra = Math.max(2, paso * 0.62)

  const crudo = Math.max(...cortes.map((c) => c.filas))
  const { max: tope, ticks } = escalaNice(crudo, 4)
  const Y = (v) => padT + ih - (v / tope) * ih
  const yBase = Y(0)
  const X = (i) => padL + i * paso + paso / 2
  const xFin = padL + iw

  // Rótulo directo de cada partición, centrado sobre su grupo y apenas arriba de la barra más
  // alta que queda debajo del texto (no del grupo entero: train es largo y su rótulo flotaba).
  // Si dos rótulos vecinos se pisan (ancho estimado a 10,5 px), quedan solo train, test y
  // test_flag; la leyenda sigue como apoyo.
  const todos = ORDEN_PARTICION.map((p) => {
    const idx = cortes.map((c, i) => (c.particion === p ? i : -1)).filter((i) => i >= 0)
    if (!idx.length) return null
    const x = (X(idx[0]) + X(idx[idx.length - 1])) / 2
    const medio = p.length * 3.3
    const debajo = cortes.filter((c, i) => Math.abs(X(i) - x) <= medio + anchoBarra / 2)
    const alto = Math.max(...(debajo.length ? debajo : idx.map((i) => cortes[i])).map((c) => c.filas))
    return { particion: p, x, y: Y(alto) - 5, medio }
  }).filter(Boolean)
  const sePisan = todos.some((g, k) => k > 0 && todos[k - 1].x + todos[k - 1].medio + 4 > g.x - g.medio)
  const grupos = sePisan ? todos.filter((g) => ['train', 'test', 'test_flag'].includes(g.particion)) : todos

  return (
    <svg width={w} height={h} role="img"
         aria-label={`Filas por corte, ${n} cortes, coloreadas por partición: `
           + cortes.map((c) => `${mesCorto(c.corte)} ${entero(c.filas)} filas ${c.particion}`).join(', ')}
         style={{ display: 'block' }}
    >
      <defs>
        {/* dev: azul claro con trama. Misma construcción que Tramas() de src/graficos.jsx
            (base clara + línea diagonal un paso más oscura) pero en la rampa de azules, que
            no tiene una trama propia ahí: acá vive nomás para esta vista. */}
        <pattern id="v11-trama-dev" width="6" height="6" patternUnits="userSpaceOnUse"
                 patternTransform="rotate(45)">
          <rect width="6" height="6" fill="var(--azul3)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--acc)" strokeWidth="2" opacity=".55" />
        </pattern>
        {/* test_flag: terracota con trama, misma paleta que la excepción del resto del
            tablero (--terra / --terra-osc), para que la partición que DC-09 aisló se lea
            como lo que es: la excepción, no una categoría más. */}
        {/* test: tinta con trama clara en sentido contrario a dev, para que no se confunda
            con train cuando la tinta y el azul oscuro se acercan en el proyector. */}
        <pattern id="v11-trama-test" width="6" height="6" patternUnits="userSpaceOnUse"
                 patternTransform="rotate(-45)">
          <rect width="6" height="6" fill="var(--ink)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--sup)" strokeWidth="2" opacity=".45" />
        </pattern>
        <pattern id="v11-trama-testflag" width="6" height="6" patternUnits="userSpaceOnUse"
                 patternTransform="rotate(45)">
          <rect width="6" height="6" fill="var(--terra)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--terra-osc)" strokeWidth="2" />
        </pattern>
      </defs>

      <text fontFamily="var(--mono)" x={padL} y={11} fontSize="11" fill={MUT2}
            letterSpacing=".09em" fontWeight={600} style={{ textTransform: 'uppercase' }}>
        filas
      </text>

      <line x1={padL} x2={padL} y1={padT} y2={yBase} stroke={EJE} strokeWidth="1" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL - 4} x2={padL} y1={Y(t)} y2={Y(t)} stroke={EJE} strokeWidth="1" />
          <text x={padL - 8} y={Y(t)} fontSize="10.5" fill={MUT} textAnchor="end"
                dominantBaseline="central" className="tabular">{entero(t)}</text>
        </g>
      ))}
      <line x1={padL} x2={xFin} y1={yBase} y2={yBase} stroke={EJE} strokeWidth="1" />

      {cortes.map((c, i) => {
        const alto = Math.max(1, Y(0) - Y(c.filas))
        const x = X(i) - anchoBarra / 2
        const estilo = ESTILO_PARTICION[c.particion] || ESTILO_PARTICION.test
        return (
          <g key={c.corte}>
            <title>
              {`${mesCorto(c.corte)} · ${entero(c.filas)} filas · partición ${c.particion} `
                + `· ${pct(c.tasa_pct)} de churn a 90 días`}
            </title>
            <rect x={x} y={Y(c.filas)} width={anchoBarra} height={alto} fill={estilo.relleno} />
          </g>
        )
      })}

      {grupos.map((g) => (
        <text key={`g${g.particion}`} x={g.x} y={g.y} fontSize="10.5" fill={MUT2}
              textAnchor="middle" fontWeight={600}>{g.particion}</text>
      ))}

      {/* eje X: mesCorto cada 3 meses (regla del DISEÑO para esta vista), nada en diagonal */}
      {cortes.map((c, i) => {
        if (i % 3 !== 0 && i !== n - 1) return null
        return (
          <g key={`x${c.corte}`}>
            <line x1={X(i)} x2={X(i)} y1={yBase} y2={yBase + 4} stroke={EJE} strokeWidth="1" />
            <text x={X(i)} y={yBase + 17} fontSize="10" fill={MUT} textAnchor="middle">
              {mesCorto(c.corte)}
            </text>
          </g>
        )
      })}
      <text fontFamily="var(--mono)" x={xFin} y={yBase + 34} fontSize="11" fill={MUT2}
            textAnchor="end" letterSpacing=".09em" fontWeight={600}
            style={{ textTransform: 'uppercase' }}>
        corte, {mesCorto(cortes[0].corte)} a {mesCorto(cortes[cortes.length - 1].corte)}
      </text>
    </svg>
  )
}

/**
 * Escala de marcas del eje Y en paso de 25 puntos porcentuales (0, 25, 50, …), el paso que
 * un director lee sin calcular. Con el alto de tarjeta que le toca a este panel a 1152×640
 * (bien menos que el de un <Lienzo> de ancho completo) hasta cuatro marcas de a 25 llegan a
 * pisarse: si no entran con aire mínimo entre renglón y renglón, la escala baja a solo
 * 0 y el techo. `ih` es el alto disponible del área de dibujo, ya sin los márgenes del eje.
 */
function marcasPct(crudo, ih) {
  const techo = Math.max(25, Math.ceil(crudo / 25) * 25)
  const todas = []
  for (let v = 0; v <= techo + 1e-9; v += 25) todas.push(v)
  const altoRenglon = 15 // fuente 10.5 + aire mínimo para no pisarse
  if (ih / Math.max(1, todas.length - 1) >= altoRenglon) return { techo, ticks: todas }
  return { techo, ticks: [0, techo] }
}

/**
 * Tasa de churn a 90 días por corte, serie de tiempo en su propio <Lienzo> (no la primitiva
 * `Linea`: ver la nota del encabezado del archivo). Línea sola, sin bandas ni zonas: esta
 * vista no tiene meta que cumplir, solo describe el dataset. <title> nativo en cada punto
 * con mes, tasa y partición (regla 14/marca).
 */
function GraficoTasaPorCorte({ w, h, cortes }) {
  if (!cortes.length) return null
  const padL = 34
  const padT = 24
  const padB = 40
  // 16, no 10: el último rótulo del eje X (mesCorto, hasta "sep-25") se ancla 'middle' sobre
  // X(n-1) = xFin, y esas ~30 px de ancho le sobresalen ~15 px del lado derecho. Con padR=10
  // el Lienzo (overflow hidden) recortaba esa mitad y "sep-25" se leía "sep-2". 16 px de aire
  // alcanzan para el rótulo más largo que produce mesCorto (tres letras + guión + dos dígitos).
  const padR = 16
  const iw = Math.max(20, w - padL - padR)
  const ih = Math.max(20, h - padT - padB)
  const n = cortes.length

  const crudo = Math.max(...cortes.map((c) => c.tasa_pct))
  const { techo, ticks } = marcasPct(crudo, ih)
  const X = (i) => padL + (n > 1 ? (i / (n - 1)) * iw : iw / 2)
  const Y = (v) => padT + ih - (v / techo) * ih
  const yBase = Y(0)
  const xFin = padL + iw

  const puntos = cortes.map((c, i) => [X(i), Y(c.tasa_pct)])
  // test_flag (DC-09): franja terracota desde medio paso antes de su primer corte y tramo
  // punteado desde el último punto anterior, porque su target cae en meses sin cobertura
  // confirmada. Si el payload no trae test_flag, la línea queda entera sólida.
  const iFlag = cortes.findIndex((c) => c.particion === 'test_flag')
  const paso = n > 1 ? iw / (n - 1) : iw
  const corteSolido = iFlag > 0 ? iFlag - 1 : iFlag === 0 ? 0 : n - 1
  const linea = puntos.slice(0, corteSolido + 1).map((p) => p.join(',')).join(' ')
  const lineaFlag = iFlag >= 0 ? puntos.slice(corteSolido).map((p) => p.join(',')).join(' ') : ''

  // Punto de valor más alto: siempre el primer corte en esta serie (el churn a 90 días baja
  // con el tiempo), pero se calcula igual por si el payload cambia. Se ancla hacia ADENTRO
  // del área de dibujo (nunca centrado sobre el punto) para no quedar montado sobre las
  // marcas del eje cuando el pico cae en el primer o el último corte, y nunca sube por
  // encima del primer renglón de marcas para no taparle el título al eje.
  const iPico = cortes.reduce((mejor, c, i) => (c.tasa_pct > cortes[mejor].tasa_pct ? i : mejor), 0)
  const iUlt = n - 1
  const anclaEn = (x) => (x - padL < 34 ? 'start' : xFin - x < 34 ? 'end' : 'middle')
  const yEtq = (y) => Math.max(padT + 16, Math.min(y, yBase - 8))

  return (
    <svg width={w} height={h} role="img"
         aria-label={`Tasa de churn a 90 días por corte, ${n} cortes: `
           + cortes.map((c) => `${mesCorto(c.corte)} ${pct(c.tasa_pct)} partición ${c.particion}`).join(', ')}
         style={{ display: 'block' }}
    >
      {iFlag >= 0 && (
        <rect x={X(iFlag) - paso / 2} y={padT} width={xFin - (X(iFlag) - paso / 2)}
              height={ih} fill="var(--terra)" opacity=".07" />
      )}

      <text fontFamily="var(--mono)" x={padL + 6} y={11} fontSize="11" fill={MUT2}
            letterSpacing=".09em" fontWeight={600} style={{ textTransform: 'uppercase' }}>
        % churn a 90 días
      </text>
      {iFlag >= 0 && (
        <text x={xFin} y={11} fontSize="10" fill="var(--terra)" fontWeight={600} textAnchor="end">
          test_flag · cobertura no confirmada (DC-09)
        </text>
      )}

      <line x1={padL} x2={padL} y1={padT} y2={yBase} stroke={EJE} strokeWidth="1" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL - 4} x2={padL} y1={Y(t)} y2={Y(t)} stroke={EJE} strokeWidth="1" />
          <text x={padL - 8} y={Y(t)} fontSize="10.5" fill={MUT} textAnchor="end"
                dominantBaseline="central" className="tabular">{entero(t)} %</text>
        </g>
      ))}
      <line x1={padL} x2={xFin} y1={yBase} y2={yBase} stroke={EJE} strokeWidth="1" />

      <polyline points={linea} fill="none" stroke="var(--acc)" strokeWidth="2.25"
                strokeLinejoin="round" strokeLinecap="round" />
      {lineaFlag && (
        <polyline points={lineaFlag} fill="none" stroke="var(--acc)" strokeWidth="2.25"
                  strokeDasharray="4 3" strokeLinejoin="round" />
      )}

      {cortes.map((c, i) => (
        <g key={c.corte}>
          <title>
            {`${mesCorto(c.corte)} · ${pct(c.tasa_pct)} de churn a 90 días · partición ${c.particion}`}
          </title>
          <circle cx={puntos[i][0]} cy={puntos[i][1]} r={i === iUlt ? 4 : 2.25}
                  fill="var(--acc)" stroke="var(--sup)" strokeWidth={i === iUlt ? 1.75 : 1} />
        </g>
      ))}

      {iPico !== iUlt && (
        <Plaqueta x={puntos[iPico][0]} y={yEtq(puntos[iPico][1] - 13)}
                  texto={pct(cortes[iPico].tasa_pct)} fuente={11} peso={700} color={'var(--ink)'}
                  anclaje={anclaEn(puntos[iPico][0])} />
      )}
      <Plaqueta x={puntos[iUlt][0]} y={yEtq(puntos[iUlt][1] - 13)}
                texto={pct(cortes[iUlt].tasa_pct)} fuente={11} peso={700} color={'var(--ink)'}
                anclaje={anclaEn(puntos[iUlt][0])} />

      {/* eje X: mesCorto cada 3 meses, nada en diagonal (regla 16) */}
      {cortes.map((c, i) => {
        if (i % 3 !== 0 && i !== n - 1) return null
        return (
          <g key={`x${c.corte}`}>
            <line x1={X(i)} x2={X(i)} y1={yBase} y2={yBase + 4} stroke={EJE} strokeWidth="1" />
            <text x={X(i)} y={yBase + 17} fontSize="10" fill={MUT} textAnchor="middle">
              {mesCorto(c.corte)}
            </text>
          </g>
        )
      })}
      <text fontFamily="var(--mono)" x={xFin} y={yBase + 34} fontSize="11" fill={MUT2}
            textAnchor="end" letterSpacing=".09em" fontWeight={600}
            style={{ textTransform: 'uppercase' }}>
        corte, {mesCorto(cortes[0].corte)} a {mesCorto(cortes[cortes.length - 1].corte)}
      </text>
    </svg>
  )
}

export default function V11Dataset() {
  if (!hayDatos) {
    return (
      <section className="pant v11">
        <h1 className="titulo">{TITULO}</h1>
        <p className="pie-vista">sin datos en el payload</p>
      </section>
    )
  }

  const rangos = rangosParticion(V)

  return (
    <section className="pant v11">
      <h1 className="titulo">{TITULO}</h1>

      <div style={{ display: 'flex', gap: 'clamp(12px, 1.8vw, 30px)', flex: '0 0 auto' }}>
        <div className="tarjeta" style={{ flex: '1 1 0', minWidth: 0 }}>
          <span className="kpi-lbl">Filas × columnas</span>
          <span className="kpi-val tabular">{entero(V.filas)} × {V.columnas}</span>
          <span className="kpi-base">{V.n_features} features de entrada</span>
        </div>
        <div className="tarjeta" style={{ flex: '1 1 0', minWidth: 0 }}>
          <span className="kpi-lbl">Clientes distintos</span>
          <span className="kpi-val tabular">{entero(V.clientes_distintos)}</span>
          <span className="kpi-base">
            {V.cortes.length} cortes, {fechaCorta(V.cortes[0].corte)} a{' '}
            {fechaCorta(V.cortes[V.cortes.length - 1].corte)}
          </span>
        </div>
        <div className="tarjeta" style={{ flex: '1 1 0', minWidth: 0 }}>
          <span className="kpi-lbl">Filas con churn a 90 días</span>
          <span className="kpi-val tabular">{entero(V.positivos)}</span>
          <span className="kpi-base">{pct(TASA_GLOBAL, 2)} sobre el total de filas</span>
        </div>
      </div>

      <div className="lienzo">
        <div style={{
          flex: '2 1 0', minWidth: 0, display: 'flex', flexDirection: 'column',
          gap: 'clamp(10px, 1.5vh, 16px)',
        }}
        >
          <div className="tarjeta" style={{ flex: '1.5 1 0', minHeight: 0 }}>
            <span className="kpi-lbl">Filas por corte, por partición</span>
            <LeyendaParticion />
            <Lienzo className="lienzo">
              {({ w, h }) => <GraficoFilasPorCorte w={w} h={h} cortes={V.cortes} />}
            </Lienzo>
          </div>

          <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}>
            <span className="kpi-lbl">Tasa de churn a 90 días, por corte</span>
            <Lienzo className="lienzo">
              {({ w, h }) => <GraficoTasaPorCorte w={w} h={h} cortes={V.cortes} />}
            </Lienzo>
          </div>
        </div>

        <div style={{
          flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column',
          gap: 'clamp(10px, 1.5vh, 16px)',
        }}
        >
          <div className="tarjeta" style={{ flex: '1.6 1 0', minHeight: 0 }}>
            {/* Sin kpi-sub: filas/columnas/features ya están en la primera tarjeta de arriba
                ("Filas × columnas") y repetirlas acá le sacaba a la lista de particiones el
                alto que necesita para no desbordar la tarjeta (ver nota más abajo). */}
            <span className="kpi-lbl">Dataset</span>
            <span className="kpi-val" style={{ fontSize: 'clamp(14px, 1.2vw, 17px)', marginTop: 4 }}>
              {V.nombre}
            </span>
            <div style={{
              marginTop: 6, paddingTop: 5, borderTop: '1px dotted var(--bd)',
              display: 'flex', flexDirection: 'column', gap: 3, minHeight: 0,
            }}
            >
              {/* Fila en DOS renglones (rótulo+conteo arriba, rango de cortes abajo): con todo
                  en una sola línea, "test_flag · DC-09" (el rótulo más largo) le comía el
                  ancho al rango de fechas y lo hacía envolver, desbordando la tarjeta hacia la
                  de abajo. Apilado, cada fila se lee sola sin depender del ancho del rótulo
                  vecino, y con line-height ajustado (no el 1.5 de body) entran las cinco más
                  la línea de test_flag/DC-09 de abajo sin desbordar a 1152 × 640. */}
              {rangos.map((r) => (
                <div key={r.particion} style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5, lineHeight: 1.2 }}>
                    <SwatchParticion particion={r.particion} />
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                      {ETQ_PARTICION[r.particion]}
                    </span>
                    <span className="tabular" style={{ marginLeft: 'auto', color: 'var(--mut2)', fontWeight: 600 }}>
                      {entero(r.filas)} filas
                    </span>
                  </div>
                  <div className="tabular" style={{ fontSize: 10.5, lineHeight: 1.2, color: 'var(--mut)', paddingLeft: 18 }}>
                    {fechaCorta(r.desde)}–{fechaCorta(r.hasta)}
                  </div>
                </div>
              ))}
            </div>
            {/* Por qué test_flag es su propia partición, en una línea: el detalle completo
                (decisión + justificación de DC-09) ya está en la vista 03, que es donde se
                decide la cobertura no confirmada. Repetirlo entero acá era la misma tarjeta
                dos veces en el tablero. */}
            <p style={{ margin: '5px 0 0', fontSize: 10.5, lineHeight: 1.2, color: 'var(--mut)' }}>
              test_flag aislado por <b style={{ color: 'var(--mut2)' }}>DC-09</b> (ver vista 03)
            </p>
          </div>

          <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}>
            <span className="kpi-lbl">Cómo se mide el target</span>
            <p style={{ margin: '6px 0 0', fontSize: 'var(--e2-txt2)', lineHeight: 1.35, color: 'var(--ink)' }}>
              {NOTA_TARGET}
            </p>
          </div>
        </div>
      </div>

      <p className="pie-vista">{PIE}</p>
    </section>
  )
}

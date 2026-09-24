// V08 — Precios. Responde por qué el consolidado no deflacta: el precio unitario mediano del
// extracto casi no se movió mientras el IPC multiplicó el nivel general por trece, así que la
// serie en pesos no sigue a la inflación y ajustarla fabricaría una caída real que no existe.
//
// (24/09, FOR-V08-1) Precio e IPC van en UNA LineaIndice (e2/src/LineaIndice.jsx), en veces
// el nivel de 2022: las dos series comparten unidad, así que un solo eje no es eje doble. Los
// dos paneles de escalas propias de antes mostraban la forma pero no la magnitud (las dos
// curvas terminaban a la misma altura) y obligaban a redondear el precio a miles («9 → 8»,
// −11 % a la vista contra el −7,6 % del dato). IPC fechado al inicio de cada año (el acumulado
// de una fila es la inflación hasta diciembre del año anterior), medianas a mitad de año.
// Cada punto trae su <title>, así que la capa puntosDeLinea/PuntosTitulo ya no hace falta.
//
// (24/09) Sale la fila de tarjetas de arriba (22/09, D1-14/D4-16): DC-10 no mueve ninguna
// cifra, así que no hay par (regla 3 de DISENO.md). Los pesos exactos quedan una sola vez,
// en el rótulo del gráfico; la fuente del IPC y la salvedad de 2025 van al pie. El alto que
// libera es el que necesitaban la línea y las barras a 1152×640.
//
// (24/09) La línea va sola y a todo el ancho; la tarjeta de la decisión baja a la fila de
// las barras, a la derecha. Al lado de la línea medía lo que su texto y dejaba debajo un
// hueco de casi la mitad de la fila; al lado de las barras la fila mide casi lo mismo que la
// tarjeta en 1152 a 1366 y el aire que queda en pantallas grandes cae en la esquina, no junto
// al gráfico principal. La línea se lleva el alto que sobra (2,2 contra 1).
//
// (24/09, NAR-V08-1) La premisa va en el título y en la tarjeta: con el IPC a 13,2× un precio
// que baja no es un precio que sigue a la inflación. La tarjeta suma «Qué vimos», calculado
// de D2 (la baja real que daría deflactar). No se muestra la justificación del payload: dice
// «nominales», que el E1 dejó de afirmar (8640faf), y «Qué vimos» dice lo mismo con cifras.
// El llano sí va, tal como está en el registro.
//
// La variación por categoría (2022→2025) va en barras divergentes porque tiene signo: seis
// de siete categorías caen y una sube. (24/09, FOR-V08-2 y VIS-V08-1) Son un SVG propio de
// esta vista y no BarrasDivergentes de src/graficos.jsx, que es del E1 y no se toca: el eje
// va de −15 % a 5 % en vez de ±15 % (la mitad «sube» quedaba vacía), las medianas en pesos
// van en gris y sin negrita (eran lo más oscuro del gráfico y el dato es el %), y el
// encabezado dice cuántas bajan. Categorías con tilde (formato.categoria).
//
// Auditoría T-12 (22/09): el título no pasa los 74 caracteres con datos reales.

import { Lienzo, Tramas } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { pct, pesos, decimal, fechaCorta, mesCorto, categoria } from '../formato.js'
import { useEscalaTexto } from '../escala.js'
import TarjetaDecision from '../TarjetaDecision.jsx'
import LineaIndice, { anchoTexto } from '../LineaIndice.jsx'

const V = D2.vistas.V08
const DC10 = D2.decisiones.find((d) => d.id === 'DC-10')
const DC09 = D2.decisiones.find((d) => d.id === 'DC-09')
const numeroVista = (id) => Number(id.slice(1))

const anioPrecioIni = V.mediana_unitaria[0]?.anio ?? null
const anioPrecioFin = V.mediana_unitaria[V.mediana_unitaria.length - 1]?.anio ?? null
const anioIpcIni = V.ipc[0]?.anio ?? null
const anioIpcFin = V.ipc[V.ipc.length - 1]?.anio ?? null
const ipcUltimo = V.ipc[V.ipc.length - 1]?.acumulado ?? null
const verboPrecio = V.variacion_pct < 0 ? 'bajó' : 'subió'
const m0 = V.mediana_unitaria[0]?.valor ?? null
const mN = V.mediana_unitaria[V.mediana_unitaria.length - 1]?.valor ?? null
// El IPC de cada fila es el acumulado al 1 de enero de ese año: «ene-25».
const eneDe = (anio) => mesCorto(`${anio}-01`)
// Lo que daría deflactar: el precio final llevado a pesos del inicio con el IPC acumulado.
const variacionReal = (mN / ipcUltimo / m0 - 1) * 100

// (24/09) Meses con cobertura no confirmada (DC-09, vista 3) dentro de cada año: el de la
// mediana final los incluye, y eso se dice en su <title> y en el pie.
const MESES_FLAG = D2.vistas.V03?.meses_flag ?? []
const flagDe = (anio) => MESES_FLAG.filter((m) => m.startsWith(`${anio}-`))
const flagFin = flagDe(anioPrecioFin)
const SALVEDAD_FIN = flagFin.length
  ? `${anioPrecioFin} incluye ${mesCorto(flagFin[0])} a ${mesCorto(flagFin[flagFin.length - 1])}, ` +
    `con cobertura no confirmada (${DC09?.id ?? 'DC-09'}, vista ${numeroVista('V03')})`
  : null

// (24/09, NAR-V08-1) El título dice la premisa: el IPC y el precio van en direcciones
// opuestas, así que los montos no reflejan la inflación.
const TITULO = `Con IPC ${decimal(ipcUltimo, 1)}× el precio ${verboPrecio} ` +
  `${pct(Math.abs(V.variacion_pct))}: los montos no reflejan la inflación`

// (24/09) Una sola constante para meta.pie y la pantalla, así no divergen. La premisa para no
// deflactar es la del E1 (8640faf): el precio del extracto no sigue al IPC. Las cifras del
// registro de DC-10 salen de su payload (cifras); C29 no está en D2.
const REGISTRO = ['C29', ...(DC10?.cifras ?? [])].join(', ')
const PIE = `corte ${fechaCorta(D2.meta.corte_ref)} · base: filas con monto y unidades > 0, crudas · ` +
  `IPC: INDEC, acumulado a ${eneDe(anioIpcFin)} (${anioIpcFin} no se cuenta, D09) · ` +
  (SALVEDAD_FIN ? `${SALVEDAD_FIN} · ` : '') +
  `registro: ${REGISTRO} · el precio del extracto no sigue al IPC (consulta 3): no se deflacta`

export const meta = {
  id: 'V08',
  corto: 'Precios',
  titulo: TITULO,
  pie: PIE,
}

/** Una cifra con su unidad no se parte en dos renglones («93,0 / %»). */
const Cifra = ({ children }) => <span style={{ whiteSpace: 'nowrap' }}>{children}</span>

export default function V08Precios() {
  // Precio en veces su mediana inicial, a mitad de cada año; IPC al 1 de enero de cada año.
  const series = [
    {
      id: 'ipc',
      tono: 'var(--mut2)',
      punteado: true,
      grosor: 2,
      rotuloFinal: `IPC ${decimal(ipcUltimo, 1)}× (a ${eneDe(anioIpcFin)})`,
      puntos: V.ipc.map((d) => ({
        t: d.anio,
        v: d.acumulado,
        titulo: d.anio === anioIpcIni
          ? `${eneDe(d.anio)}: base del IPC (1×) · INDEC`
          : `${eneDe(d.anio)}: ${decimal(d.acumulado, 1)}× acumulado desde ${eneDe(anioIpcIni)} · INDEC`,
      })),
    },
    {
      id: 'precio',
      tono: 'var(--acc)',
      grosor: 2.5,
      rotuloFinal: `precio ${decimal(mN / m0, 2)}×`,
      puntos: V.mediana_unitaria.map((d) => {
        const flag = flagDe(d.anio)
        return {
          t: d.anio + 0.5,
          v: d.valor / m0,
          titulo: `${d.anio}: ${pesos(d.valor)}, mediana del año (${decimal(d.valor / m0, 2)}× ${anioPrecioIni})` +
            (flag.length ? ` · incluye ${mesCorto(flag[0])} a ${mesCorto(flag[flag.length - 1])}, ` +
              `cobertura no confirmada (vista ${numeroVista('V03')})` : ''),
        }
      }),
    },
  ]
  const anios = V.mediana_unitaria.map((d) => d.anio)

  // Iluminación primero (la caída más fuerte) y Baño al final (la única que sube): el orden
  // lee el dibujo de arriba abajo como el ranking que es, no como el orden del catálogo.
  const categorias = [...V.por_categoria].sort((a, b) => a.pct - b.pct)
  const datosCategorias = categorias.map((c) => ({
    etiqueta: categoria(c.categoria),
    valor: c.pct,
    nota: `${pesos(c.v2022)} → ${pesos(c.v2025)}`,
  }))
  const nBaja = categorias.filter((c) => c.pct < 0).length
  const nSube = categorias.filter((c) => c.pct > 0).length
  // Dominio en múltiplos de 5 que cubre los datos por los dos lados (hoy −15 a 5).
  const pcts = categorias.map((c) => c.pct)
  const dominio = [
    -5 * Math.ceil(Math.abs(Math.min(0, ...pcts)) / 5),
    5 * Math.ceil(Math.max(0, ...pcts) / 5),
  ]

  return (
    <section className="pant v08">
      <h1 className="titulo">{TITULO}</h1>

      {/* (24/09) La línea índice va sola y a todo el ancho: al lado, la tarjeta de la decisión
          (que mide lo que su texto) dejaba vacía casi la mitad de la columna. 2,2 contra 1 de
          las barras: a 1152×640 manda el piso de 180 px de las barras y la línea se queda con
          el resto, que deja el precio (0,92× en un eje hasta 15×) a 15 px de la base; en
          pantallas grandes el alto que sobra va a la línea y no a la fila de la tarjeta. */}
      <div className="lienzo" style={{ flex: '2.2 1 0' }}>
        <div className="tarjeta" style={{ minWidth: 0, paddingTop: 6, paddingBottom: 6 }}>
          <span className="kpi-lbl frase" style={{ flex: '0 0 auto' }}>
            <span>
              Veces el nivel de {anioPrecioIni} · precio mediano{' '}
              <span style={{ whiteSpace: 'nowrap' }}>{pesos(m0)} → {pesos(mN)}</span>
            </span>
          </span>
          <Lienzo className="lienzo">
            {({ w, h }) => (
              <LineaIndice series={series} anios={anios} w={w} h={h} tituloX="año"
                           referencia={{ v: 1, texto: `nivel ${anioPrecioIni}` }} />
            )}
          </Lienzo>
        </div>
      </div>

      {/* Barras y decisión en la misma fila (24/09): el divergente tiene ancho de sobra (3
          contra 1) y la tarjeta, corta, mide casi lo mismo que la fila. Piso de alto: con
          180 px cada una de las siete filas mide ~17 px a 1152×640 (con el título del eje
          debajo, como en la primitiva del E1, eran 13 y las etiquetas se pisaban). El título
          va en el renglón de las marcas: los 22 px que ahorra son aire para las filas. */}
      <div className="lienzo" style={{ flex: '1 1 0', minHeight: 180 }}>
        <div className="tarjeta" style={{ minWidth: 0, flex: '3 1 0', paddingTop: 6, paddingBottom: 6 }}>
          <Lienzo className="lienzo">
            {({ w, h }) => (
              <Divergentes
                datos={datosCategorias} w={w} h={h} dominio={dominio}
                tituloEje={`variación ${anioPrecioIni} → ${anioPrecioFin}`}
                encabezadoNota={`mediana ${anioPrecioIni} → ${anioPrecioFin}`}
                rotuloNeg={nBaja ? `baja en ${nBaja} de ${categorias.length}` : null}
                rotuloPos={nSube ? `sube en ${nSube}` : null}
              />
            )}
          </Lienzo>
        </div>

        <TarjetaDecision dc={DC10} sinJustificacion style={{ minWidth: 0, flex: '1 1 0' }}>
          <p className="dec-just">
            <b>Qué vimos.</b> Con un IPC de {decimal(ipcUltimo, 1)}× el precio del extracto{' '}
            {verboPrecio} <Cifra>{pct(Math.abs(V.variacion_pct))}</Cifra>: la serie no sigue a la
            inflación. Ajustarla por IPC daría una {variacionReal < 0 ? 'baja' : 'suba'} real
            de <Cifra>{pct(Math.abs(variacionReal))}</Cifra>, una anomalía encima de otra.
          </p>
        </TarjetaDecision>
      </div>

      <p className="pie-vista">{PIE}</p>
    </section>
  )
}

/**
 * Barras divergentes de la variación por categoría (24/09). Mismo dibujo que
 * BarrasDivergentes del E1 (lavado neutro del lado negativo, trama en las barras que bajan,
 * el cero en tinta de punta a punta, valor al extremo de cada barra, nota a la derecha) con
 * tres diferencias que la primitiva no admite sin tocar el E1: el dominio lo fija la vista
 * (FOR-V08-2), la nota va en gris y sin negrita (VIS-V08-1) y la letra escala con k.
 */
function Divergentes({ datos, w, h, dominio, tituloEje, encabezadoNota, rotuloNeg, rotuloPos }) {
  const k = useEscalaTexto()
  if (!datos.length || w < 200) return null
  const [dmin, dmax] = dominio[1] > dominio[0] ? dominio : [dominio[0], dominio[0] + 5]
  const fCab = 12 * k
  const fEje = 10.5 * k
  const padTop = Math.ceil(fCab + 12)
  const altoEje = Math.ceil(fEje + 12)
  const disponible = Math.max(40, h - padTop - altoEje)
  const paso = disponible / datos.length
  const alto = Math.max(9, Math.min(paso * 0.62, 40 * k))
  // (24/09) El tope por renglón subió (0,42 y 0,46 → 0,52 y 0,56): la fila de las barras es
  // más baja en pantallas grandes y así la letra sigue a k como antes. A 1152 mandan los pisos.
  const fuente = Math.max(10.5, Math.min(13 * k, paso * 0.52))
  const fuenteEtq = Math.max(11.5, Math.min(15 * k, paso * 0.56))
  const fmtEje = (t) => pct(t, 0)

  const anchoEtiqueta = Math.ceil(Math.max(
    ...datos.map((d) => anchoTexto(d.etiqueta, fuenteEtq)),
    anchoTexto(tituloEje, fEje),
  )) + 12
  const anchoValor = Math.max(34, ...datos.map((d) => anchoTexto(pct(d.valor), fuente, 500) + 10))
  const anchoNota = Math.ceil(Math.max(
    encabezadoNota ? anchoTexto(encabezadoNota, fEje) : 0,
    ...datos.map((d) => (d.nota ? anchoTexto(d.nota, fuente, 400) : 0)),
  )) + 14
  const x0 = anchoEtiqueta + anchoValor
  const ancho = Math.max(60, w - x0 - anchoValor - anchoNota)
  const xDe = (v) => x0 + ((v - dmin) / (dmax - dmin)) * ancho
  const xc = xDe(0)
  const yBase = padTop + disponible
  const pasoEje = dmax - dmin <= 30 ? 5 : 10
  const ticks = []
  for (let t = dmin; t <= dmax + 1e-9; t += pasoEje) ticks.push(t)
  const yCab = padTop / 2 - 2

  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`${tituloEje}: ` + datos.map((d) => `${d.etiqueta} ${pct(d.valor)}`).join(', ')}>
      <Tramas />
      {/* El lado negativo va sobre un lavado neutro: la zona se ve antes que las barras. */}
      <rect x={x0} y={padTop} width={Math.max(0, xc - x0)} height={disponible} fill="var(--zona)" />
      {rotuloNeg && (
        <text x={xc - 10} y={yCab} fontSize={fCab} fontWeight={600} fill="var(--mut2)"
              textAnchor="end" dominantBaseline="central">{rotuloNeg}</text>
      )}
      {rotuloPos && (
        <text x={xc + 10} y={yCab} fontSize={fCab} fontWeight={600} fill="var(--mut2)"
              dominantBaseline="central">{rotuloPos}</text>
      )}
      {encabezadoNota && (
        <text x={w} y={yCab} fontSize={fEje} fill="var(--mut)" textAnchor="end"
              dominantBaseline="central">{encabezadoNota}</text>
      )}

      {datos.map((d, i) => {
        const y = padTop + i * paso + (paso - alto) / 2
        const neg = d.valor < 0
        const x1 = xDe(Math.min(0, d.valor))
        const x2 = xDe(Math.max(0, d.valor))
        return (
          <g key={d.etiqueta}>
            <title>{`${d.etiqueta} · ${pct(d.valor)} · ${tituloEje}` +
              (d.nota ? ` · ${encabezadoNota}: ${d.nota}` : '')}</title>
            <text x={anchoEtiqueta - 9} y={y + alto / 2} fontSize={fuenteEtq} fill="var(--mut2)"
                  textAnchor="end" dominantBaseline="central">{d.etiqueta}</text>
            {d.valor !== 0 && (
              <rect x={x1} y={y} width={Math.max(2, x2 - x1)} height={alto}
                    fill={neg ? 'url(#trama)' : 'var(--gris)'}
                    stroke={neg ? 'var(--gris)' : 'none'} strokeWidth="1" />
            )}
            <text x={neg ? x1 - 6 : x2 + 6} y={y + alto / 2} fontSize={fuente} fill="var(--mut2)"
                  fontWeight={500} textAnchor={neg ? 'end' : 'start'} dominantBaseline="central"
                  className="tabular">{pct(d.valor)}</text>
            {d.nota && (
              <text x={w} y={y + alto / 2} fontSize={fuente} fill="var(--mut)" fontWeight={400}
                    textAnchor="end" dominantBaseline="central" className="tabular">{d.nota}</text>
            )}
          </g>
        )
      })}

      <line x1={x0} x2={x0 + ancho} y1={yBase} y2={yBase} stroke="var(--eje)" strokeWidth="1" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={xDe(t)} x2={xDe(t)} y1={yBase} y2={yBase + 4} stroke="var(--eje)" strokeWidth="1" />
          <text x={xDe(t)} y={yBase + 6} fontSize={fEje} fill="var(--mut)" textAnchor="middle"
                dominantBaseline="hanging" className="tabular">{fmtEje(t)}</text>
        </g>
      ))}
      {/* Título del eje en el renglón de las marcas, bajo la columna de categorías. */}
      <text x={anchoEtiqueta - 9} y={yBase + 6} fontSize={fEje} fill="var(--mut)" textAnchor="end"
            dominantBaseline="hanging">{tituloEje}</text>
      {/* El cero es el eje del gráfico: en tinta, de punta a punta y más grueso que el resto. */}
      <line x1={xc} x2={xc} y1={padTop - 4} y2={yBase + 5} stroke="var(--ink)" strokeWidth="2" />
    </svg>
  )
}

// M1 — la lista de Marketing. Responde "¿a quiénes contacto esta semana?": el ranking
// completo (hasta 800, ya ordenado por exposición descendente en agregacion.js) se corta
// en cuatro tramos de 200, uno por semana de contacto. Cuántas filas entran en pantalla se
// mide, no se fija: el piso es 3 y el techo lo da el alto real de la caja a 1152x640, para
// no scrollear nunca (usa el mismo useMedida que Lienzo, porque la tabla necesita saber su
// propio alto disponible). Sin columna de score real: se rotula "Modelo predictivo · en
// desarrollo", mismo criterio que los KPIs no computables (C-10). Si el filtro activo no
// deja ningún cliente del top global, se declara en vez de mostrar una tabla vacía.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { lista, entero, pesos, millones, SIN_FILTRO } from '../agregacion.js'
import { useMedida } from '../graficos.jsx'

const pesosFinos = (x) => `ARS ${entero(x)}`

const TAMANO_TRAMO = 200

const COLUMNAS = [
  { campo: 'anualizado', etiqueta: 'Exposición anual', num: true },
  { campo: 'recency', etiqueta: 'Recency', num: true },
  { campo: 'gap', etiqueta: 'Gap propio', num: true },
  { campo: 'categoria', etiqueta: 'Categoría', num: false },
  { campo: 'consiente', etiqueta: 'Consentimiento', num: false },
]

/** Descarga las filas completas en CSV. La Parte D §4.1 promete la lista "exportable", y
 *  la tabla en pantalla muestra solo las que entran sin scroll: sin esto, las otras no
 *  existen en ningun lado. Blob local, sin red. */
function descargar(filas, corte) {
  const cab = ['cliente', 'exposicion_anual_ars', 'recency_dias', 'gap_mediano_dias',
               'quintil', 'segmento_rfm', 'region', 'categoria', 'consiente_marketing']
  const cuerpo = filas.map((f) => [f.id, f.anualizado, f.recency, f.gap, f.quintil,
    f.rfm, f.region, f.categoria, f.consiente ? 'si' : 'no'].join(','))
  const csv = [cab.join(','), ...cuerpo].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `lista-contacto-${corte}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function M1({ info, filtro, iCorte }) {
  const [tramo, setTramo] = useState(0)
  const [orden, setOrden] = useState({ campo: 'anualizado', dir: 'desc' })
  // Cuantas filas entran se mide, no se fija: 12 desbordaban a 1152x640 y sobraba lugar
  // a 1920x1080. Y el alto de fila tambien se mide del DOM en vez de estimarse, porque
  // depende del clamp() de la tipografia y estimarlo cortaba filas por la mitad.
  const [cajaRef, caja] = useMedida()
  const tablaRef = useRef(null)
  const [medidas, setMedidas] = useState({ fila: 25, cabecera: 28 })

  // Un tramo nuevo de corte o de filtro reordena la base: se vuelve al primero.
  useEffect(() => { setTramo(0) }, [iCorte, filtro])

  const filas = lista(iCorte, filtro)
  const sinRepresentantes = filas.length === 0

  const totalTop = filas.reduce((s, f) => s + f.anualizado, 0)
  const conConsentimiento = filas.filter((f) => f.consiente).length

  const sortedFilas = useMemo(() => {
    const arr = [...filas]
    const { campo, dir } = orden
    arr.sort((a, b) => {
      const va = a[campo]
      const vb = b[campo]
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : va === vb ? 0 : va > vb ? 1 : -1
      return dir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [filas, orden])

  const numTramos = Math.max(1, Math.ceil(filas.length / TAMANO_TRAMO))
  const tramoActivo = Math.min(tramo, numTramos - 1)
  const inicio = tramoActivo * TAMANO_TRAMO
  // Piso de 3 filas, sin margen artificial: el redondeo para abajo del floor ya garantiza
  // que la tabla no se pase (sin scroll es la unica propiedad que importa).
  const cabenFilas = caja.h > 0
    ? Math.max(3, Math.floor((caja.h - medidas.cabecera - 2) / medidas.fila))
    : 4
  const visibles = sortedFilas.slice(inicio, inicio + cabenFilas)

  useLayoutEffect(() => {
    const t = tablaRef.current
    if (!t) return
    const fila = t.querySelector('tbody tr')
    const cab = t.querySelector('thead')
    if (!fila || !cab) return
    const f = fila.getBoundingClientRect().height
    const c = cab.getBoundingClientRect().height
    if (f > 0 && (Math.abs(f - medidas.fila) > 0.6 || Math.abs(c - medidas.cabecera) > 0.6)) {
      setMedidas({ fila: f, cabecera: c })
      return
    }
  })

  function alternarOrden(campo) {
    setOrden((o) => (o.campo === campo
      ? { campo, dir: o.dir === 'asc' ? 'desc' : 'asc' }
      : { campo, dir: campo === 'anualizado' ? 'desc' : 'asc' }))
  }

  function exportarCSV() {
    const encabezados = ['cliente', 'exposicion_anual', 'recency_dias', 'gap_propio_dias', 'categoria', 'consentimiento']
    const cuerpo = filas.map((f) => [
      f.id, Math.round(f.anualizado), f.recency, f.gap, f.categoria, f.consiente ? 'si' : 'no',
    ].join(';'))
    const csv = [encabezados.join(';'), ...cuerpo].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `marketing-lista-corte-${iCorte}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  if (sinRepresentantes) {
    // El top global se recorta antes de filtrar (agregacion.js): un filtro puede tener
    // exposición agregada propia y aun así no aportar ningún cliente individual si ninguno
    // de ellos alcanza el piso del ranking global. Se declara en vez de mostrar 0/0/0.
    const globalLista = lista(iCorte, SIN_FILTRO)
    const pisoExposicion = globalLista.length ? Math.min(...globalLista.map((f) => f.anualizado)) : 0
    return (
      <section className="pant">
        <h1 className="titulo" style={{ fontWeight: 500, fontSize: 'clamp(14px, 1.25vw, 18px)' }}>
          El filtro activo no aporta ningún cliente al ranking de exposición
        </h1>
        <p className="bajada">
          El ranking sale del top {entero(globalLista.length)} global, cuyo piso es{' '}
          {pesosFinos(pisoExposicion)} anuales. Este filtro agrega {pesos(info.exposicion)} de
          exposición, pero ningún cliente del recorte llega a ese piso.
        </p>
        <div className="lienzo">
          <div className="tarjeta" style={{ flex: 1 }}>
            <div className="kpi-lbl">Sin representantes en el ranking</div>
            <div className="kpi-sub" style={{ marginTop: 8, fontSize: '13px', lineHeight: 1.6 }}>
              El ranking de Marketing prioriza por exposición individual sobre el top global,
              no por filtro. Un quintil, región o categoría puede concentrar exposición sin que
              ninguno de sus clientes esté entre los de mayor exposición absoluta.
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="pant">
      <h1 className="titulo" style={{ fontWeight: 500, fontSize: 'clamp(14px, 1.25vw, 18px)' }}>
        Los {entero(filas.length)} de mayor exposición concentran {pesos(totalTop)} de los{' '}
        {millones(info.exposicion)}, y solo {entero(conConsentimiento)} se pueden contactar
      </h1>
      <p className="bajada">
        La tabla se ordena por exposición anual descendente y cada cabecera reordena. En
        pantalla van las primeras del tramo activo; el botón exporta los {entero(filas.length)} completos.
      </p>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(8px,1.3vh,16px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span className="kpi-lbl">Tramo semanal</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {Array.from({ length: numTramos }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={i === tramoActivo}
                  onClick={() => setTramo(i)}
                  style={{
                    fontFamily: 'inherit',
                    fontSize: '11.5px',
                    fontWeight: i === tramoActivo ? 700 : 400,
                    textDecoration: i === tramoActivo ? 'underline' : 'none',
                    padding: '2px 8px',
                    cursor: 'pointer',
                  }}
                >
                  Semana {i + 1} {i === tramoActivo ? '(activa)' : ''}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={exportarCSV}
            style={{
              fontFamily: 'inherit',
              fontSize: '11.5px',
              fontWeight: 600,
              padding: '2px 8px',
              cursor: 'pointer',
              background: 'none',
              border: '1px solid var(--bd)',
              color: 'inherit',
            }}
          >
            Exportar CSV · {entero(filas.length)} completos
          </button>
        </div>

        {/* La tabla va en position:absolute por el mismo motivo que los SVG: en flujo,
            su alto empuja al contenedor flex y el contenedor mide lo que mide la tabla,
            que es lo que la tabla estaba tratando de averiguar. */}
        <div ref={cajaRef} style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        <table ref={tablaRef} className="lista-tabla"
               style={{ position: 'absolute', left: 0, right: 0, top: 0 }}>
          <thead>
            <tr>
              <th>Cliente</th>
              {COLUMNAS.map((c) => (
                <th
                  key={c.campo}
                  className={c.num ? 'num' : undefined}
                  role="button"
                  tabIndex={0}
                  aria-sort={orden.campo === c.campo ? (orden.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  onClick={() => alternarOrden(c.campo)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternarOrden(c.campo) }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {c.etiqueta}{orden.campo === c.campo ? (orden.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
              <th>Acción sugerida</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((f) => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td className="num destacado">{pesosFinos(f.anualizado)}</td>
                <td className="num">{entero(f.recency)} d</td>
                <td className="num">{entero(f.gap)} d</td>
                <td>{f.categoria}</td>
                <td className={f.consiente ? '' : 'no'}>{f.consiente ? 'Sí' : 'No'}</td>
                <td style={{ fontStyle: 'italic' }}>Modelo predictivo · en desarrollo</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </section>
  )
}

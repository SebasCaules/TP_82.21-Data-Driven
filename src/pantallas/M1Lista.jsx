// M1 — la lista de Marketing. Responde "¿a quiénes contacto esta semana?": el ranking
// completo (hasta 800, ya ordenado por exposición descendente en agregacion.js) se corta
// en cuatro tramos de 200, uno por semana de contacto. Cuántas filas entran en pantalla se
// mide, no se fija: el piso es 3 y el techo lo da el alto real de la caja a 1152x640, para
// no scrollear nunca (usa el mismo useMedida que Lienzo, porque la tabla necesita saber su
// propio alto disponible). Sin columna de score real: no hay "Acción sugerida" por fila
// (veinte celdas idénticas no son datos), el modelo predictivo en desarrollo se declara
// una sola vez en la bajada. Si el filtro activo no deja ningún cliente del top global, se
// declara en vez de mostrar una tabla vacía.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { lista, entero, pesos, millones, hayFiltro, SIN_FILTRO } from '../agregacion.js'
import { DIMENSIONES, etiquetaValor } from '../Filtros.jsx'
import { useMedida } from '../graficos.jsx'

const pesosFinos = (x) => `ARS ${entero(x)}`

const TAMANO_TRAMO = 200

// Nombre prosa de cada campo ordenable, para que la bajada declare el criterio activo en
// vez de una frase fija que se desactualiza en cuanto se toca otra cabecera.
const ETIQUETA_ORDEN = {
  anualizado: 'exposición anual',
  recency: 'recency',
  gap: 'gap propio',
  region: 'región',
  categoria: 'categoría',
  consiente: 'consentimiento',
}

// Para el nombre del CSV: sin tildes ni espacios, que un nombre de archivo no depende del
// sistema operativo que lo reciba.
function slug(s) {
  return String(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Ocho columnas no se leen como lista priorizada: quedan las que justifican por qué ESE
// cliente entra a la tabla (exposición) y por qué está en riesgo (recency, gap), más
// consentimiento porque sin él no se puede llamar. Región y categoría solo aportan cuando
// son el recorte activo (si no, las 200 filas dicen lo mismo); se agregan condicionadas
// al filtro en vez de ir siempre.
const COLUMNAS_FIJAS = [
  { campo: 'anualizado', etiqueta: 'Exposición anual', num: true },
  { campo: 'recency', etiqueta: 'Recency', num: true },
  { campo: 'gap', etiqueta: 'Gap propio', num: true },
]
const COLUMNA_CONSENTIMIENTO = { campo: 'consiente', etiqueta: 'Consentimiento', num: false }

function celda(f, campo) {
  switch (campo) {
    case 'anualizado': return pesosFinos(f.anualizado)
    case 'recency': return `${entero(f.recency)} d`
    case 'gap': return `${entero(f.gap)} d`
    case 'region': return f.region
    case 'categoria': return f.categoria
    case 'consiente': return f.consiente ? 'Sí' : 'No'
    default: return null
  }
}

/** Mismas clases que usaba la tabla fija original: num alinea, destacado resalta el dato
 *  que ordena la lista (exposición), y el "No" de consentimiento se marca aparte porque es
 *  la excepción que decide si se puede llamar, no el criterio de orden. */
function claseCelda(c, f) {
  const clases = []
  if (c.num) clases.push('num')
  if (c.campo === 'anualizado') clases.push('destacado')
  if (c.campo === 'consiente' && !f.consiente) clases.push('no')
  return clases.join(' ') || undefined
}

export default function M1({ info, filtro, setFiltro, iCorte, volverAlOrigen, origenCorto }) {
  const [tramo, setTramo] = useState(0)
  const [orden, setOrden] = useState({ campo: 'anualizado', dir: 'desc' })
  // Cuantas filas entran se mide, no se fija: 12 desbordaban a 1152x640 y sobraba lugar
  // a 1920x1080. Y el alto de fila tambien se mide del DOM en vez de estimarse, porque
  // depende del clamp() de la tipografia y estimarlo cortaba filas por la mitad.
  const [cajaRef, caja] = useMedida()
  const tablaRef = useRef(null)
  const [medidas, setMedidas] = useState({ fila: 25, cabecera: 28 })

  // Un tramo nuevo de corte, de filtro o de orden reordena la base: se vuelve al primero.
  // Sin `orden` en las dependencias, tocar una cabecera reordenaba las 800 filas por debajo
  // del tramo activo y "Semana 3" pasaba a ser otro lote de clientes sin que la pestaña lo
  // avisara.
  useEffect(() => { setTramo(0) }, [iCorte, filtro, orden])

  const COLUMNAS = useMemo(() => [
    ...COLUMNAS_FIJAS,
    ...(filtro.region !== null ? [{ campo: 'region', etiqueta: 'Región', num: false }] : []),
    ...(filtro.categoria !== null ? [{ campo: 'categoria', etiqueta: 'Categoría', num: false }] : []),
    COLUMNA_CONSENTIMIENTO,
  ], [filtro.region, filtro.categoria])

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
    // El nombre y las columnas llevan corte y filtro: dos exportaciones de recortes
    // distintos (Región AMBA, después Categoría Muebles) ya no comparten nombre de archivo
    // ni quedan indistinguibles una vez abiertas.
    const dimsActivas = DIMENSIONES.filter(({ id }) => filtro[id] !== null)
    const filtroTxt = dimsActivas.length
      ? dimsActivas.map(({ id, etq }) => `${etq}: ${etiquetaValor(id, filtro[id])}`).join(' · ')
      : 'ninguno'
    const filtroSlug = dimsActivas.length
      ? `-${dimsActivas.map(({ id }) => `${id}-${slug(etiquetaValor(id, filtro[id]))}`).join('-')}`
      : ''
    const encabezados = ['cliente', 'exposicion_anual', 'recency_dias', 'gap_propio_dias', 'region', 'categoria', 'consentimiento', 'corte', 'filtro']
    const cuerpo = filas.map((f) => [
      f.id, Math.round(f.anualizado), f.recency, f.gap, f.region, f.categoria, f.consiente ? 'si' : 'no', info.corte, filtroTxt,
    ].join(';'))
    const csv = [encabezados.join(';'), ...cuerpo].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `marketing-lista-${info.corte}${filtroSlug}.csv`
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

  const filtroActivo = hayFiltro(filtro)
  const dimensionesActivas = DIMENSIONES.filter(({ id }) => filtro[id] !== null)
  const etiquetasFiltro = dimensionesActivas
    .map(({ id, etq }) => `${etq}: ${etiquetaValor(id, filtro[id])}`)
    .join(' · ')

  return (
    <section className="pant">
      <h1 className="titulo" style={{ fontWeight: 500, fontSize: 'clamp(14px, 1.25vw, 18px)' }}>
        Los {entero(filas.length)} de mayor exposición concentran {pesos(totalTop)} de los{' '}
        {millones(info.exposicion)}, y solo {entero(conConsentimiento)} se pueden contactar
      </h1>
      <p className="bajada">
        Ordenada por {ETIQUETA_ORDEN[orden.campo] ?? orden.campo}{' '}
        {orden.dir === 'desc' ? 'descendente' : 'ascendente'}; cada cabecera reordena. La acción
        sugerida (modelo predictivo, en desarrollo) es igual para toda la lista. El botón exporta
        los {entero(filas.length)} completos.
      </p>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(6px,1vh,12px)' }}>
        {/* flex:'0 0 auto' explícito: .lienzo > * en estilos.css da flex:1 1 0 a todo hijo
            directo (pensado para las tarjetas en fila de las otras pantallas). En esta
            columna eso repartía el alto en partes iguales entre tabs, nota y tabla; solo
            la tabla (cajaRef, más abajo) tiene que crecer. */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', flex: '0 0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span className="kpi-lbl">Tramo semanal</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* .chip-f + .on ya resuelve fondo, borde, hover y foco (Filtros.jsx la usa
                  igual); el invertido de .on más el "(activa)" en el rótulo marcan el
                  tramo activo sin depender del color solo. Sin .chip-f-txt (ancho fijo en
                  ch, pensado para el valor del filtro) porque acá el rótulo cambia de
                  largo con "(activa)"; el font solo se repone inline porque .chip-f no lo
                  fija cuando no se usa ese hijo. */}
              {Array.from({ length: numTramos }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={i === tramoActivo}
                  onClick={() => setTramo(i)}
                  className={`chip-f${i === tramoActivo ? ' on' : ''}`}
                  style={{ font: '600 11px/1.45 var(--fuente)' }}
                >
                  Semana {i + 1} {i === tramoActivo ? '(activa)' : ''}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={exportarCSV} className="chip-claro">
            Exportar CSV · {entero(filas.length)} completos
          </button>
        </div>
        <div className="kpi-sub" style={{ marginTop: -4, flex: '0 0 auto' }}>
          La capacidad de contacto se reparte en 4 semanas: cada tramo es el lote de esa semana.
        </div>

        {/* Se ve cuando hay un filtro activo o cuando se llegó acá por drill-down (App.jsx →
            verEnLista): un click en otra vista trae a esta pantalla con un filtro puesto y
            sin este aviso no se entiende por qué la lista cambió. setFiltro(SIN_FILTRO) limpia
            las CUATRO dimensiones a la vez, no solo la que trajo el drill-down; por eso la
            etiqueta dice cuántos filtros se van a sacar cuando hay más de uno, en vez de
            hablar siempre de "filtro" en singular. Volver a {origenCorto} restaura filtro y
            vista de antes del clic (volverAlOrigen es null si no se llegó por drill-down, así
            que el botón no se monta). */}
        {(filtroActivo || volverAlOrigen) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
            fontSize: '11.5px', color: 'var(--mut2)', flex: '0 0 auto',
          }}>
            {filtroActivo && <span>Este recorte sale de {etiquetasFiltro}.</span>}
            {filtroActivo && (
              <button type="button" className="chip-claro" onClick={() => setFiltro(SIN_FILTRO)}>
                {dimensionesActivas.length > 1 ? `Quitar los ${dimensionesActivas.length} filtros` : 'Quitar filtro'}
              </button>
            )}
            {volverAlOrigen && (
              <button type="button" className="chip-claro" onClick={volverAlOrigen}>
                Volver a {origenCorto}
              </button>
            )}
          </div>
        )}

        {/* La tabla va en position:absolute por el mismo motivo que los SVG: en flujo,
            su alto empuja al contenedor flex y el contenedor mide lo que mide la tabla,
            que es lo que la tabla estaba tratando de averiguar. */}
        <div ref={cajaRef} style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        <table ref={tablaRef} className="lista-tabla"
               style={{ position: 'absolute', left: 0, right: 0, top: 0 }}>
          <thead>
            <tr>
              <th className="num">N.º</th>
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
            </tr>
          </thead>
          <tbody>
            {visibles.map((f, i) => (
              <tr key={f.id}>
                <td className="num">{inicio + i + 1}</td>
                <td>{f.id}</td>
                {COLUMNAS.map((c) => (
                  <td key={c.campo} className={claseCelda(c, f)}>
                    {celda(f, c.campo)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </section>
  )
}

// M1 — la lista de contacto, leída por tramo (dirección 13d). Antes esta pantalla mostraba
// las filas de clientes de un tramo por vez, con orden por cabecera y tantas filas como
// entraran medidas del DOM. Lo que NO mostraba era que los cuatro lotes semanales no valen
// lo mismo: la lista sale ordenada por exposición, así que la semana 1 concentra casi el
// doble de pesos que la semana 4 con la misma cantidad de contactos. Eso es lo que decide
// cómo se reparte el esfuerzo del mes, y no se veía en ningún lado.
//
// Lo que se pierde y dónde queda. Las filas cliente por cliente ya no están en pantalla; el
// botón de exportar sigue bajando los ~800 completos con todas sus columnas, que es como la
// lista llega a Marketing de verdad (nadie llama leyendo de un proyector). El drill-down de
// las vistas de diagnóstico sigue trayendo acá con el filtro puesto: lo que cambia es que la
// respuesta pasa a ser "cuánto pesa este recorte y en qué semana cae", no "estos veinte ids".
//
// Los tramos se recalculan sobre el recorte activo: con un filtro puesto la lista puede tener
// menos de 800 y los tramos son los que haya. Si el filtro no deja ningún cliente del top
// global, se declara en vez de dibujar cuatro barras en cero.
//
// Solo código de cliente en el CSV: sin nombre ni mail.

import { lista, entero, pesos, millones, pct, hayFiltro, SIN_FILTRO } from '../agregacion.js'
import { DIMENSIONES, etiquetaValor } from '../Filtros.jsx'
import { Lienzo, BarrasH } from '../graficos.jsx'
import { Def } from '../Glosario.jsx'

const pesosFinos = (x) => `ARS ${entero(x)}`

const TAMANO_TRAMO = 200

const plural = (n, sing, plur) => (n === 1 ? sing : plur)

/** Escala de monto del recorte activo. En millones un filtro chico colapsa el eje a "0,1 M"
 *  repetido seis veces: por debajo del millón la unidad pasa a miles, que es donde el dato
 *  todavía tiene resolución. La eligen los datos, no el llamador. */
function escalaMonto(max) {
  return max >= 1e6
    ? (v) => millones(v)
    : (v) => `${entero(Math.round(v / 1000))} K`
}

// Para el nombre del CSV: sin tildes ni espacios, que un nombre de archivo no depende del
// sistema operativo que lo reciba.
function slug(s) {
  return String(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** El valor más frecuente de un campo dentro del tramo. Es lo que hace legible la columna de
 *  composición: "Hibernando · AMBA · Muebles" dice a quién se le habla esa semana mucho mejor
 *  que tres porcentajes. Empate: gana el primero en aparecer, que en una lista ordenada por
 *  exposición es el de mayor exposición. */
function moda(filas, campo) {
  const cuenta = new Map()
  for (const f of filas) cuenta.set(f[campo], (cuenta.get(f[campo]) ?? 0) + 1)
  let mejor = null
  let max = -1
  for (const [valor, n] of cuenta) if (n > max) { mejor = valor; max = n }
  return mejor
}

function resumirTramo(filas, etiqueta) {
  const contactables = filas.filter((f) => f.consiente)
  const exposicion = filas.reduce((s, f) => s + f.anualizado, 0)
  return {
    etiqueta,
    clientes: filas.length,
    exposicion,
    ticket: filas.length ? exposicion / filas.length : 0,
    contactables: contactables.length,
    alcanzable: contactables.reduce((s, f) => s + f.anualizado, 0),
    composicion: filas.length
      ? [moda(filas, 'rfm'), moda(filas, 'region'), moda(filas, 'categoria')].join(' · ')
      : '—',
  }
}

export default function M1({ info, filtro, setFiltro, iCorte, volverAlOrigen, origenCorto }) {
  const filas = lista(iCorte, filtro)

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
    const encabezados = ['cliente', 'tramo', 'exposicion_anual', 'recency_dias', 'gap_propio_dias', 'region', 'categoria', 'consentimiento', 'corte', 'filtro']
    const cuerpo = filas.map((f, i) => [
      f.id, `Semana ${Math.floor(i / TAMANO_TRAMO) + 1}`, Math.round(f.anualizado), f.recency,
      f.gap, f.region, f.categoria, f.consiente ? 'si' : 'no', info.corte, filtroTxt,
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

  if (filas.length === 0) {
    // El top global se recorta antes de filtrar (agregacion.js): un filtro puede tener
    // exposición agregada propia y aun así no aportar ningún cliente individual si ninguno
    // de ellos alcanza el piso del ranking global. Se declara en vez de mostrar 0/0/0.
    const globalLista = lista(iCorte, SIN_FILTRO)
    const pisoExposicion = globalLista.length ? Math.min(...globalLista.map((f) => f.anualizado)) : 0
    return (
      <section className="pant">
        <h1 className="titulo">
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

  const numTramos = Math.ceil(filas.length / TAMANO_TRAMO)
  const tramos = Array.from({ length: numTramos }, (_, i) =>
    resumirTramo(filas.slice(i * TAMANO_TRAMO, (i + 1) * TAMANO_TRAMO), `Semana ${i + 1}`))
  const total = resumirTramo(filas, 'Total')

  const primero = tramos[0]
  const ultimo = tramos[tramos.length - 1]
  const veces = ultimo.exposicion ? primero.exposicion / ultimo.exposicion : 0
  // El último tramo puede quedar corto si el recorte no es múltiplo de 200: entonces la
  // comparación "con los mismos N contactos" deja de ser cierta y la frase no se escribe.
  const mismoTamano = primero.clientes === ultimo.clientes

  const fmtMonto = escalaMonto(total.exposicion)

  const datos = tramos.map((t, i) => ({
    etiqueta: t.etiqueta,
    valor: t.exposicion,
    sufijo: `${entero(t.clientes)} ${plural(t.clientes, 'cliente', 'clientes')}`,
    nota: `${entero(t.contactables)} ${plural(t.contactables, 'contactable', 'contactables')}`,
    enfasis: i === 0,
  }))

  const filtroActivo = hayFiltro(filtro)
  const dimensionesActivas = DIMENSIONES.filter(({ id }) => filtro[id] !== null)
  const etiquetasFiltro = dimensionesActivas
    .map(({ id, etq }) => `${etq}: ${etiquetaValor(id, filtro[id])}`)
    .join(' · ')

  return (
    <section className="pant">
      <h1 className="titulo">
        {numTramos > 1
          ? <>La {primero.etiqueta.toLowerCase()} vale {veces.toFixed(1).replace('.', ',')} veces
              la {ultimo.etiqueta.toLowerCase()}
              {mismoTamano
                ? <> con los mismos {entero(ultimo.clientes)} contactos</>
                : <> con {entero(primero.clientes)} contactos contra {entero(ultimo.clientes)}</>}</>
          : <>El recorte entra en un solo tramo: {entero(total.clientes)}{' '}
              {plural(total.clientes, 'cliente', 'clientes')} y ARS {fmtMonto(total.exposicion)}</>}
      </h1>
      <p className="bajada">
        {numTramos > 1 && <>ARS {fmtMonto(primero.exposicion)} contra{' '}
          {fmtMonto(ultimo.exposicion)}. </>}
        La lista sale ordenada por <Def id="exposicion">exposición</Def> y se corta en{' '}
        <Def id="tramo">lotes de {entero(TAMANO_TRAMO)}</Def>, uno por semana.
        {' '}{entero(total.contactables)} de {entero(total.clientes)}{' '}
        {plural(total.contactables, 'se puede contactar', 'se pueden contactar')}{' '}
        ({pct(100 * total.contactables / total.clientes)}): ARS {fmtMonto(total.alcanzable)} de
        los {fmtMonto(total.exposicion)}.
      </p>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(6px, 1vh, 14px)' }}>
        <Lienzo>
          {({ w, h }) => (
            <BarrasH
              datos={datos} w={w} h={h}
              formato={fmtMonto}
              formatoEje={fmtMonto}
              anchoEtiqueta={118}
              tituloEje="Exposición anual del tramo (ARS)"
            />
          )}
        </Lienzo>

        <div className="tarjeta" style={{ flex: '0 0 auto' }}>
          <table className="lista-tabla">
            <thead>
              <tr>
                <th><Def id="tramo">Tramo</Def></th>
                <th className="num">Clientes</th>
                <th className="num"><Def id="exposicion">Exposición</Def></th>
                <th className="num"><Def id="ticket-medio">Ticket medio</Def></th>
                <th className="num"><Def id="contactable">Contactables</Def></th>
                <th className="num">Exposición alcanzable</th>
                <th>Composición dominante</th>
              </tr>
            </thead>
            <tbody>
              {[...tramos, total].map((t, i) => (
                <tr key={t.etiqueta} className={i === 0 ? 'activa' : undefined}>
                  <td className="destacado">{t.etiqueta}</td>
                  <td className="num">{entero(t.clientes)}</td>
                  <td className="num destacado">{fmtMonto(t.exposicion)}</td>
                  <td className="num">{entero(Math.round(t.ticket / 1000))} K</td>
                  <td className="num">{entero(t.contactables)}</td>
                  <td className="num">{fmtMonto(t.alcanzable)}</td>
                  <td>
                    {t === total
                      ? `${pct(100 * t.exposicion / info.exposicion)} de los ${millones(info.exposicion)}`
                      : t.composicion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '10px', flexWrap: 'wrap', paddingTop: '8px',
          }}>
            <span className="kpi-base" style={{ paddingTop: 0 }}>
              {filtroActivo && <>Este recorte sale de {etiquetasFiltro}. </>}
              El CSV baja {plural(filas.length, 'la fila completa', `las ${entero(filas.length)} filas completas`)},{' '}
              cliente por cliente, con su tramo.
            </span>
            <span style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
              <button type="button" onClick={exportarCSV} className="chip-claro">
                Exportar CSV · {entero(filas.length)}{' '}
                {plural(filas.length, 'fila', 'filas')}
              </button>
            </span>
          </div>
        </div>
      </div>

      <p className="z-nota">
        Repartir por exposición en vez de por orden dejaría los tramos parejos y quitaría la
        urgencia de la primera semana: es una decisión de Marketing, no del tablero. La acción
        sugerida por modelo predictivo está en desarrollo y sería igual para toda la lista.
      </p>
    </section>
  )
}

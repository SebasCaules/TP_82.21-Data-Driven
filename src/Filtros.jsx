// Filtros. Cuatro desplegables, uno por dimension.
//
// Por que un listbox propio y no el <select> nativo: el pedido es que CADA VALOR lleve su
// icono (AMBA, Muebles, Campeones, Q4), y un <option> nativo no admite SVG. El precio es
// tener que reimplementar teclado y ARIA a mano, que es lo que hace el bloque de abajo:
// combobox + listbox + option, flechas, Inicio/Fin, Enter, Escape, salto por letra y cierre
// al clickear afuera. Sin eso el icono seria una mejora que rompe el teclado.
//
// `ejeExento` es la dimension que la pantalla activa desagrega. Su filtro NO se aplica a su
// propio eje (si no, el grafico colapsaria a una barra), y eso hay que declararlo: antes lo
// decia una linea del pie, que ya no existe. El chip lo dice por aria-label y estilo, pero
// eso no alcanza para quien mira la pantalla sin pasar el mouse ni usar lector: por eso el
// aviso se repite en texto siempre visible, al lado del contador de filtros.

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { dims } from './agregacion.js'
import { Escalera, Region, Segmentos, Categoria, iconoDeValor } from './Iconos.jsx'

const DIMENSIONES = [
  { id: 'region', etq: 'Región', plural: 'Todas las regiones', Icono: Region },
  { id: 'categoria', etq: 'Categoría', plural: 'Todas las categorías', Icono: Categoria },
  { id: 'rfm', etq: 'Segmento', plural: 'Todos los segmentos', Icono: Segmentos },
  { id: 'quintil', etq: 'Quintil', plural: 'Todos los quintiles', Icono: Escalera },
]

export function etiquetaValor(dim, v) {
  return dim === 'quintil' ? `Q${dims.quintil[v]}` : dims[dim][v]
}

function Caret() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true" className="caret">
      <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Un desplegable con icono por opcion. `valor` es el indice elegido o null. */
function Chip({ dim, valor, onElegir, activo, exento }) {
  const { id, etq, plural, Icono } = dim
  const opciones = dims[id]
  const [abierto, setAbierto] = useState(false)
  const [foco, setFoco] = useState(valor ?? 0)
  const caja = useRef(null)
  const listaId = useId()
  const tecleo = useRef({ txt: '', t: 0 })
  // Id de cada <li role="option">, para aria-activedescendant. -1 es la fila "Todas las...".
  const idOpcion = (i) => `${listaId}-op${i}`

  const puesto = valor !== null
  const IconoActual = puesto ? (iconoDeValor(id, opciones[valor]) ?? Icono) : Icono

  const cerrar = useCallback((devolverFoco = true) => {
    setAbierto(false)
    if (devolverFoco) caja.current?.querySelector('.chip-f-btn')?.focus()
  }, [])

  // Clic afuera y scroll cierran. Sin esto, el popup queda flotando sobre otra vista.
  useEffect(() => {
    if (!abierto) return
    const fuera = (e) => { if (!caja.current?.contains(e.target)) setAbierto(false) }
    document.addEventListener('pointerdown', fuera)
    return () => document.removeEventListener('pointerdown', fuera)
  }, [abierto])

  const elegir = (i) => { onElegir(i); cerrar() }

  // Las teclas se consumen acá: App.jsx escucha en window y navegaría de vista con las
  // flechas mientras el desplegable está abierto.
  const onKey = (e) => {
    if (!activo) return
    const n = opciones.length
    if (!abierto) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); e.stopPropagation()
        // -1 es la fila "Todas las ...", que es la que esta elegida cuando no hay filtro:
        // arrancar en 0 dejaba resaltada la primera opcion real, que no es la vigente.
        setFoco(valor ?? -1); setAbierto(true)
      }
      return
    }
    e.stopPropagation()
    if (e.key === 'Escape') { e.preventDefault(); cerrar() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setFoco((f) => Math.min(n - 1, f + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFoco((f) => Math.max(-1, f - 1)) }
    else if (e.key === 'Home') { e.preventDefault(); setFoco(-1) }
    else if (e.key === 'End') { e.preventDefault(); setFoco(n - 1) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(foco < 0 ? null : foco) }
    else if (e.key === 'Tab') { cerrar(false) }
    else if (e.key.length === 1) {
      // Salto por letra, como el select nativo.
      const ahora = Date.now()
      tecleo.current.txt = ahora - tecleo.current.t > 700 ? e.key : tecleo.current.txt + e.key
      tecleo.current.t = ahora
      const q = tecleo.current.txt.toLowerCase()
      const i = opciones.findIndex((o) => String(id === 'quintil' ? `q${o}` : o).toLowerCase().startsWith(q))
      if (i >= 0) setFoco(i)
    }
  }

  const texto = puesto ? etiquetaValor(id, valor) : etq
  const aviso = exento ? `${etq}: en esta vista el filtro no recorta su propio eje` : etq

  return (
    <span ref={caja} className={`chip-f-caja${abierto ? ' abierto' : ''}`}>
      <button
        type="button"
        className={`chip-f chip-f-btn${puesto ? ' on' : ''}${exento ? ' exento' : ''}`}
        role="combobox"
        aria-expanded={abierto}
        aria-controls={abierto ? listaId : undefined}
        aria-haspopup="listbox"
        aria-activedescendant={abierto ? idOpcion(foco) : undefined}
        aria-label={`${aviso}${puesto ? `: ${texto}` : ''}`}
        disabled={!activo}
        title={exento ? aviso : undefined}
        onClick={() => { if (activo) { setFoco(valor ?? -1); setAbierto((a) => !a) } }}
        onKeyDown={onKey}
      >
        <IconoActual aria-hidden="true" />
        <span className="chip-f-txt" aria-hidden="true">{texto}</span>
        {/* El caret queda siempre montado: la ✕ de sacar el filtro ahora vive afuera,
            como boton hermano (no puede haber un control interactivo anidado dentro
            de otro control interactivo). */}
        <span className="chip-f-fin"><Caret /></span>
      </button>

      {/* Boton hermano, no anidado en el combobox: un <span role="button"> adentro de
          un <button> es HTML invalido y el foco de teclado nunca llegaba ahi. Se
          reserva con visibility en vez de montar/desmontar, por el mismo motivo que
          el caret de arriba: no correrle el ancho al chip y, detras, al riel del mes
          de corte cada vez que se pone o saca un filtro. */}
      <button type="button" className="chip-f-x"
              style={{ visibility: puesto && activo ? 'visible' : 'hidden' }}
              disabled={!(puesto && activo)}
              aria-label={`Quitar el filtro de ${etq}`}
              onClick={() => onElegir(null)}>×</button>

      {abierto && (
        <ul className="chip-menu" id={listaId} role="listbox" aria-label={etq}
            onKeyDown={onKey}>
          <li role="option" id={idOpcion(-1)} aria-selected={!puesto}
              className={`chip-op${!puesto ? ' sel' : ''}${foco === -1 ? ' foco' : ''}`}
              onPointerEnter={() => setFoco(-1)}
              onClick={() => elegir(null)}>
            <span className="chip-op-i" />
            {plural}
          </li>
          {opciones.map((o, i) => {
            const IconoOp = iconoDeValor(id, o)
            return (
              <li key={o} role="option" id={idOpcion(i)} aria-selected={valor === i}
                  className={`chip-op${valor === i ? ' sel' : ''}${foco === i ? ' foco' : ''}`}
                  onPointerEnter={() => setFoco(i)}
                  onClick={() => elegir(i)}>
                <span className="chip-op-i">{IconoOp && <IconoOp width={13} height={13} />}</span>
                {id === 'quintil' ? `Q${o}` : o}
              </li>
            )
          })}
        </ul>
      )}
    </span>
  )
}

export default function Filtros({ filtro, setFiltro, activos, reiniciar, modificado, ejeExento }) {
  const puestos = DIMENSIONES.filter(({ id }) => filtro[id] !== null).length
  // El chip exento ya lo declara por aria-label y por estilo (borde punteado), pero eso
  // no se ve sin pasar el mouse ni sin lector de pantalla. Se repite en texto fijo, para
  // que quien mira la pantalla vea que ese filtro esta puesto y no recorta esta vista.
  const dimExenta = DIMENSIONES.find(({ id }) => id === ejeExento)
  const filtroExento = activos && dimExenta && filtro[dimExenta.id] !== null

  return (
    <div className={`filtros${activos ? '' : ' inertes'}`}>
      {/* "Filtros" y no "Filtrar por": el rótulo hace falta para saber qué es esa fila, pero
          la versión larga costaba 92 px del riel del corte. El contador tiene su lugar
          reservado aunque esté en cero, para que el riel no se mueva al aparecer. */}
      <span className="filtros-lbl">
        Filtros
        <b className="tabular" style={puestos ? undefined : { visibility: 'hidden' }}
           aria-hidden={!puestos}>{puestos || 0}</b>
      </span>

      {/* Montado siempre que la vista tenga eje exento (nunca cambia en la vida del
          componente: lo fija la pantalla, no el filtro), y oculto con visibility en vez
          de desmontado. Mismo motivo que el contador de arriba y la ✕ de cada chip: si el
          ancho lo decidiera el contenido, poner o sacar el filtro de ese eje le correría
          el riel del mes de corte de al lado. */}
      {dimExenta && activos && (
        <span className="filtros-nota" aria-hidden={!filtroExento}
              style={filtroExento ? undefined : { visibility: 'hidden' }}>
          {dimExenta.etq} no recorta esta vista
        </span>
      )}

      {DIMENSIONES.map((d) => (
        <Chip key={d.id} dim={d} valor={filtro[d.id]} activo={activos}
              exento={activos && filtro[d.id] !== null && d.id === ejeExento}
              onElegir={(i) => setFiltro({ ...filtro, [d.id]: i })} />
      ))}

      {/* Ranura de ancho fijo al final. Adentro va "Limpiar" o el aviso de que los filtros
          no aplican, y a veces nada: si el ancho lo decidiera el contenido, cada cambio de
          filtro le movería el riel del mes de corte, que está pegado a la derecha.
          "Limpiar" gana aunque los filtros estén inertes: el corte sigue siendo global, y
          si se movió (modificado) hace falta un camino de vuelta visible, no solo Esc. */}
      <span className="filtros-cola">
        {modificado
          ? (
            <button type="button" className="chip-f reset" onClick={reiniciar}
                    title="Volver al estado inicial (Esc)">
              <span className="chip-f-txt">Limpiar</span>
            </button>
          )
          : !activos && <span className="filtros-nota">no aplican acá</span>}
      </span>
    </div>
  )
}

export { DIMENSIONES }

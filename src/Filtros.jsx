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
// decia una linea del pie, que ya no existe. Ahora lo dice el propio chip.

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
        aria-controls={listaId}
        aria-haspopup="listbox"
        aria-label={`${aviso}${puesto ? `: ${texto}` : ''}`}
        disabled={!activo}
        title={exento ? aviso : undefined}
        onClick={() => { if (activo) { setFoco(valor ?? -1); setAbierto((a) => !a) } }}
        onKeyDown={onKey}
      >
        <IconoActual aria-hidden="true" />
        <span className="chip-f-txt" aria-hidden="true">{texto}</span>
        {/* Ranura de ancho fijo: la ✕ y el caret no miden lo mismo, y alternarlos le movía
            el ancho al chip y, detrás, al riel del mes de corte. */}
        <span className="chip-f-fin">
          {puesto && activo ? (
            <span className="chip-f-x" role="button" tabIndex={-1}
                  aria-label={`Quitar el filtro de ${etq}`}
                  onClick={(e) => { e.stopPropagation(); onElegir(null) }}>×</span>
          ) : <Caret />}
        </span>
      </button>

      {abierto && (
        <ul className="chip-menu" id={listaId} role="listbox" aria-label={etq}
            onKeyDown={onKey}>
          <li role="option" aria-selected={!puesto}
              className={`chip-op${!puesto ? ' sel' : ''}${foco === -1 ? ' foco' : ''}`}
              onPointerEnter={() => setFoco(-1)}
              onClick={() => elegir(null)}>
            <span className="chip-op-i" />
            {plural}
          </li>
          {opciones.map((o, i) => {
            const IconoOp = iconoDeValor(id, o)
            return (
              <li key={o} role="option" aria-selected={valor === i}
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

      {DIMENSIONES.map((d) => (
        <Chip key={d.id} dim={d} valor={filtro[d.id]} activo={activos}
              exento={activos && filtro[d.id] !== null && d.id === ejeExento}
              onElegir={(i) => setFiltro({ ...filtro, [d.id]: i })} />
      ))}

      {/* Ranura de ancho fijo al final. Adentro va "Limpiar" o el aviso de que los filtros
          no aplican, y a veces nada: si el ancho lo decidiera el contenido, cada cambio de
          filtro le movería el riel del mes de corte, que está pegado a la derecha. */}
      <span className="filtros-cola">
        {!activos
          ? <span className="filtros-nota">no aplican acá</span>
          : modificado && (
            <button type="button" className="chip-f reset" onClick={reiniciar}
                    title="Volver al estado inicial (Esc)">
              <span className="chip-f-txt">Limpiar</span>
            </button>
          )}
      </span>
    </div>
  )
}

export { DIMENSIONES }

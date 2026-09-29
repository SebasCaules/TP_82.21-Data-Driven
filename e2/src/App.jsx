// Armazón del tablero E2. Mismo patrón que src/App.jsx del E1 (riel lateral + .cuerpo +
// flujo de impresión), sin barra de controles: esta SPA no tiene corte móvil ni filtros —
// cada vista compara "antes" y "después" de las decisiones DC sobre el mismo corte fijo
// (CORTE_REF, 2025-12-31) — así que no hay controles que apagar con leyenda (Nielsen H1):
// directamente no existen.

import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { VISTAS, etiquetaDe, indiceDe, grupoDe, TOTAL_VISTAS } from './vistas/index.jsx'
import { D2 } from './datos_e2.js'
import { fechaCorta } from './formato.js'
import MarcaInicio from '../../src/MarcaInicio.jsx'
import { ImpresionCtx } from './escala.js'
import { MapaMini } from './MapaCalidad.jsx'

/** (26/09, revisión UX H8) La vista va en la URL («#v07b»): se puede recargar o compartir una
 *  vista, y Atrás y Adelante del navegador recorren las vistas en vez de salir del tablero. */
const hashDe = (i) => `#${VISTAS[i].id.toLowerCase()}`
function indiceDeHash() {
  const i = VISTAS.findIndex((v) => `#${v.id.toLowerCase()}` === location.hash.toLowerCase())
  return i >= 0 ? i : 0
}
const TITULO_BASE = 'Casa Óga · Calidad de datos'

export default function App() {
  const [indice, setIndice] = useState(indiceDeHash)
  const [imprimiendo, setImprimiendo] = useState(false)

  const vista = VISTAS[indice]

  const irA = useCallback((i) => {
    setIndice(Math.max(0, Math.min(VISTAS.length - 1, i)))
  }, [])
  // (25/09) Ir a una vista por su id («V12») o a la pantalla de una decisión («DC-05»).
  const irAVista = useCallback((ref) => {
    const i = indiceDe(ref)
    if (i >= 0) setIndice(i)
  }, [])

  const imprimirTodo = useCallback(() => {
    // Mismos dos rAF que el E1: dan tiempo a que el flujo de hojas esté montado y medido
    // antes de abrir el diálogo. En una pestaña oculta rAF no dispara, así que ahí no se
    // imprime (window.print quedaría desincronizado del flujo montado).
    if (document.visibilityState === 'hidden') return
    setImprimiendo(true)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.print()
      setImprimiendo(false)
    }))
  }, [])

  // La URL y el título de la pestaña siguen a la vista. La primera vez reemplaza la entrada del
  // historial (abrir el tablero no agrega un paso); después, cada cambio agrega uno.
  const primera = useRef(true)
  useEffect(() => {
    const h = hashDe(indice)
    if (location.hash.toLowerCase() !== h) {
      // Si el navegador no deja tocar el historial (algunos, con el HTML abierto como archivo), el
      // hash igual cambia y Atrás sigue funcionando.
      try {
        if (primera.current) history.replaceState(null, '', h)
        else history.pushState(null, '', h)
      } catch {
        location.hash = h
      }
    }
    primera.current = false
    document.title = `${preguntaTitulo(vista.pregunta ?? vista.corto)} · ${TITULO_BASE}`
  }, [indice, vista])
  useEffect(() => {
    const alVolver = () => setIndice(indiceDeHash())
    window.addEventListener('popstate', alVolver)
    return () => window.removeEventListener('popstate', alVolver)
  }, [])

  // Si el foco ya está en el riel (Tab y después flechas), sigue a la vista activa: si no,
  // el anillo de foco queda en el botón anterior y el activo se ve sin foco. No roba el foco
  // desde ningún otro control.
  useEffect(() => {
    const activo = document.activeElement
    if (activo && activo.classList && activo.classList.contains('lat-item')) {
      document.querySelector('.lat-item.on')?.focus()
    }
  }, [indice])

  // Imprimir desde el menú del navegador tiene que dar todas las hojas, no la vista activa.
  useEffect(() => {
    // flushSync: el navegador toma la instantánea al volver de beforeprint; sin esto
    // imprimiría la vista activa porque React aún no montó las hojas.
    const antes = () => flushSync(() => setImprimiendo(true))
    const despues = () => setImprimiendo(false)
    window.addEventListener('beforeprint', antes)
    window.addEventListener('afterprint', despues)
    return () => {
      window.removeEventListener('beforeprint', antes)
      window.removeEventListener('afterprint', despues)
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      // Igual que el E1: dentro de un control mandan las teclas nativas, y 'f'/'i' solo
      // actúan con el foco fuera de todo control (WCAG 2.1.4).
      if (t.tagName === 'SELECT' || t.tagName === 'INPUT' || t.isContentEditable) return
      if (t.getAttribute && t.getAttribute('role') === 'slider') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      // Un botón del riel cuenta como suelto: tras elegir una vista con el mouse el foco
      // queda ahí, y F e I tienen que seguir funcionando.
      const suelto = t === document.body || t === document.documentElement ||
        (t.classList && t.classList.contains('lat-item'))
      // (26/09, revisión UX H9) Las flechas, Inicio y Fin cambian de vista solo con el foco libre o
      // en el riel: con el foco en otro control (una ficha de V01, un botón), la vista no cambia
      // debajo del foco. En V01 las flechas mueven el foco entre fichas (moverFoco).
      if (!suelto && ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { irA(indice + 1); e.preventDefault() }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { irA(indice - 1); e.preventDefault() }
      else if (e.key === 'Home') { irA(0); e.preventDefault() }
      else if (e.key === 'End') { irA(VISTAS.length - 1); e.preventDefault() }
      else if ((e.key === 'f' || e.key === 'F') && suelto) {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen?.()
      } else if ((e.key === 'i' || e.key === 'I') && suelto) imprimirTodo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [indice, irA, imprimirTodo])

  return (
    <div className="app">
      <div className="chico">
        <h1>Este tablero necesita una pantalla más grande</h1>
        <p>
          Está hecho para leerse sin desplazar la página, en proyector y en laptop, de
          1152&nbsp;×&nbsp;640 a 1920&nbsp;×&nbsp;1080. Amplíe la ventana o ábralo en una
          pantalla más grande.
        </p>
      </div>

      <Lateral indice={indice} irA={irA} />

      <div className="principal">
        <p className="solo-lector" aria-live="polite">{`Vista ${etiquetaDe(vista)} de ${TOTAL_VISTAS}: ${vista.pregunta ?? vista.titulo}`}</p>
        <Encabezado indice={indice} vista={vista} />

        <main className="cuerpo">
          {/* irA: V01 lleva a cada vista desde su tabla (24/09). En la hoja impresa no va. */}
          {imprimiendo ? <Impresion /> : <vista.Componente irA={irA} irAVista={irAVista} vistaDe={vistaDe} />}
        </main>
      </div>
    </div>
  )
}

/** (25/09, pedido del usuario) El encabezado de cada vista es la pregunta que responde, grande:
 *  es el h1 de la página. Las vistas ya no llevan título propio ni pie. A la derecha, chico, en
 *  qué vista se está y el corte fijo con el que trabaja toda la SPA (CONTRACT_E2.md §0). */
function Encabezado({ indice, vista }) {
  return (
    <header className="e2-enc">
      <h1 className="e2-preg">{preguntaTitulo(vista.pregunta ?? vista.corto)}</h1>
      <div className="e2-enc-der">
        <span className="e2-enc-corte">{`${etiquetaDe(vista).replace(/^0/, '')} / ${TOTAL_VISTAS} · corte ${fechaCorta(D2.meta.corte_ref)}`}</span>
        {/* (29/09) Miniatura del mapa de calidad con las celdas de la decisión de esta vista; abre un modal. */}
        {vista.id !== 'V01b' && <MapaMini key={vista.id} dcs={DCS_VISTA[vista.id] ?? (vista.dc ? [vista.dc] : [])} etiqueta={etiquetaDe(vista)} />}
      </div>
    </header>
  )
}

/** (29/09) Decisiones que resalta la miniatura cuando la vista no declara una sola en meta.dc. */
const DCS_VISTA = {
  V01: ['DC-01', 'DC-02', 'DC-03', 'DC-04', 'DC-05', 'DC-06', 'DC-07', 'DC-08', 'DC-11', 'DC-12', 'DC-13', 'DC-14', 'DC-15'],
  V10: ['DC-04', 'DC-08'],
  V12: ['DC-07', 'DC-13'],
}

/** «¿qué cambió y qué falta?» → «¿Qué cambió y qué falta?» */
const preguntaTitulo = (p) => (p ? p.replace(/^(¿?)(\p{L})/u, (_, a, b) => a + b.toUpperCase()) : p)

/** (25/09) La pantalla que muestra una decisión: la que la declara en meta.dc; si ninguna, la
 *  vista del payload (DC-01, DC-03, DC-07, DC-14 y, desde el 28/09, DC-15 viven en el detalle de V01). */
function vistaDe(dc) {
  const v = VISTAS.find((x) => x.dc === dc.id)
  return v ? v.id : dc.vista
}

/** El favicon 4b del mockup de direcciones, igual que en el E1 (src/App.jsx). */
const Marca = () => (
  <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M16 1.5 L31 13 L31 30.5 L1 30.5 L1 13 Z" fill="var(--ink)" />
    <rect x="6" y="17" width="5" height="9" fill="var(--azul1)" />
    <rect x="13.5" y="20" width="5" height="6" fill="var(--azul3)" />
    <rect x="21" y="23.5" width="5" height="2.5" fill="var(--terra)" />
  </svg>
)

function Lateral({ indice, irA }) {
  return (
    <nav className="lat" aria-label="Vistas del tablero">
      <div className="lat-marca">
        <MarcaInicio><Marca /><span className="lat-oga">Casa Óga</span></MarcaInicio>
        <span className="lat-sub">calidad de datos: antes y después</span>
      </div>

      <ol className="lat-lista">
        {VISTAS.map((v, i) => {
          // (26/09, revisión UX H2) Rótulo de grupo al abrir cada grupo, como en el riel del E1.
          const grupo = grupoDe(v)
          const abre = grupo.nombre && (i === 0 || grupoDe(VISTAS[i - 1]) !== grupo)
          return (
            <li key={v.id}>
              {abre && <div className="lat-grupo"><span>{grupo.nombre}</span></div>}
              <button type="button" onClick={() => irA(i)}
                      className={`lat-item${i === indice ? ' on' : ''}`}
                      aria-current={i === indice ? 'page' : undefined}>
                <span className="lat-n tabular">{etiquetaDe(v)}</span>
                <span className="lat-txt">{v.corto}</span>
              </button>
            </li>
          )
        })}
      </ol>

      {/* (24/09) Tres renglones en vez de cuatro: los atajos son para quien presenta, no para
          el directorio. Inicio y Fin quedan en el title. */}
      <div className="lat-pie" title="↑ ↓ cambiar de vista · Inicio / Fin: primera y última · F: pantalla completa · I: imprimir">
        <span>↑ ↓ cambiar de vista</span>
        <span>F: pantalla completa</span>
        <span>I: imprimir</span>
      </div>
    </nav>
  )
}

/** Flujo de impresión: una hoja A4 apaisada por vista, en flujo normal (nunca display:none),
 *  igual patrón que Impresion en src/App.jsx del E1. */
function Impresion() {
  // ImpresionCtx: los SVG propios del E2 escalan la letra con la ventana (escala.js); en la
  // hoja el factor vuelve a 1, porque el ancho de la ventana no dice nada del papel.
  return (
    <ImpresionCtx.Provider value={true}>
      <div className="impresion-flujo">
        {VISTAS.map((v) => (
          <div className="hoja" key={v.id}>
            <h1 className="e2-preg">{preguntaTitulo(v.pregunta ?? v.corto)}</h1>
            <v.Componente />
          </div>
        ))}
      </div>
    </ImpresionCtx.Provider>
  )
}

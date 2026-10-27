// Armazón de /e3/ (27/10, W1). Es el App.jsx del E2 (e2/src/App.jsx: riel lateral, encabezado con la
// pregunta, .cuerpo, flujo de impresión) con tres cambios, nada más:
// 1. Letra más grande (N0-5): todo el tablero va dentro de .e3-vp, una caja del tamaño de la ventana
//    lógica con `zoom: k` (zoom.js). Las hojas compartidas miden contra esa caja (vite.e3.config.js).
// 2. Las teclas de quien presenta (N0-6): Av Pág y Re Pág del control remoto pasan de vista siempre;
//    F5 pide pantalla completa sin recargar; N abre las notas del orador (Notas.jsx); «.» y B ponen la
//    pantalla en negro hasta la próxima tecla; una tecla mantenida no recorre el tablero.
// 3. Dos ventanas con la misma dirección se siguen (BroadcastChannel): la del proyector y la de la
//    laptop con las notas, en panel (N) o solas (?notas).
// Sin controles a la vista: lo que una vista deje tocar va detrás de «Explorar» (controles.jsx),
// cerrado al llegar.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { VISTAS, etiquetaDe, grupoDe, TOTAL_VISTAS, diapositivasDe } from './vistas/index.jsx'
import MarcaInicio from './MarcaInicio.jsx'
import { ImpresionCtx } from '../../e2/src/escala.js'
import { VentanaCtx, medir } from './zoom.js'
import { PanelNotas, VentanaNotas } from './Notas.jsx'

const hashDe = (i) => `#${VISTAS[i].id.toLowerCase()}`
function indiceDeHash() {
  const i = VISTAS.findIndex((v) => `#${v.id.toLowerCase()}` === location.hash.toLowerCase())
  return i >= 0 ? i : 0
}
const TITULO_BASE = 'Casa Óga · Entregable 3'
const CANAL = 'casa-oga-e3'
const SOLO_NOTAS = /(^|[?&])notas\b/.test(location.search)
// El panel de notas toma este tanto del alto de la ventana; el tablero, el resto.
const NOTAS_ALTO = 0.35

/** Ventana lógica al día con el tamaño real, descontando el panel de notas si está abierto. Con las
 *  notas, k puede bajar de 1 (zoom.js): se ensaya en una laptop, no se proyecta. */
function useVentana(notas) {
  const calc = useCallback(() => {
    const alto = notas ? Math.round(window.innerHeight * NOTAS_ALTO) : 0
    return { ...medir(window.innerWidth, window.innerHeight - alto, notas ? 0.5 : 1), notasAlto: alto }
  }, [notas])
  const [v, setV] = useState(calc)
  useLayoutEffect(() => {
    setV(calc())
    const al = () => setV(calc())
    window.addEventListener('resize', al)
    return () => window.removeEventListener('resize', al)
  }, [calc])
  return v
}

function pantallaCompleta() {
  try {
    if (document.fullscreenElement) document.exitFullscreen?.()?.catch?.(() => {})
    else document.documentElement.requestFullscreen?.()?.catch?.(() => {})
  } catch { /* sin pantalla completa (vista previa, iframe) */ }
}

export default function App() {
  const [indice, setIndiceCrudo] = useState(indiceDeHash)
  const [imprimiendo, setImprimiendo] = useState(false)
  const [notas, setNotas] = useState(false)
  const [negro, setNegro] = useState(false)
  const ventana = useVentana(notas)
  const vista = VISTAS[indice]

  // Cambio de vista con la transición del E2 (View Transitions con dirección; si no hay, WAAPI).
  const actual = useRef(indice)
  const setIndice = useCallback((i) => {
    if (i === actual.current) return
    const dir = i > actual.current ? 'adelante' : 'atras'
    actual.current = i
    document.documentElement.dataset.dir = dir
    if (!SOLO_NOTAS && document.startViewTransition && document.visibilityState === 'visible') {
      document.startViewTransition(() => flushSync(() => setIndiceCrudo(i)))
    } else setIndiceCrudo(i)
  }, [])
  const irA = useCallback((i) => setIndice(Math.max(0, Math.min(VISTAS.length - 1, i))), [setIndice])
  const irAVista = useCallback((id) => {
    const i = VISTAS.findIndex((v) => v.id === id)
    if (i >= 0) setIndice(i)
  }, [setIndice])

  const cuerpo = useRef(null)
  const montada = useRef(false)
  useLayoutEffect(() => {
    if (!montada.current) { montada.current = true; return }
    if (document.startViewTransition || !cuerpo.current?.animate) return
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches
    const dy = document.documentElement.dataset.dir === 'atras' ? -18 : 18
    cuerpo.current.animate(
      quieto ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 0, transform: `translateY(${dy}px)` }, { opacity: 1, transform: 'none' }],
      { duration: quieto ? 140 : 340, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    )
  }, [indice])

  const imprimirTodo = useCallback(() => {
    if (document.visibilityState === 'hidden') return
    setImprimiendo(true)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.print()
      setImprimiendo(false)
    }))
  }, [])

  // URL y título siguen a la vista, como en el E2.
  const primera = useRef(true)
  useEffect(() => {
    const h = hashDe(indice)
    if (location.hash.toLowerCase() !== h) {
      try {
        if (primera.current) history.replaceState(null, '', location.search + h)
        else history.pushState(null, '', location.search + h)
      } catch {
        location.hash = h
      }
    }
    primera.current = false
    document.title = `${SOLO_NOTAS ? 'Notas · ' : ''}${vista.pregunta} · ${TITULO_BASE}`
  }, [indice, vista])
  useEffect(() => {
    const alVolver = () => setIndice(indiceDeHash())
    window.addEventListener('popstate', alVolver)
    return () => window.removeEventListener('popstate', alVolver)
  }, [setIndice])

  useEffect(() => {
    const activo = document.activeElement
    if (activo && activo.classList && activo.classList.contains('lat-item')) {
      document.querySelector('.lat-item.on')?.focus()
    }
  }, [indice])

  useEffect(() => {
    const antes = () => flushSync(() => setImprimiendo(true))
    const despues = () => setImprimiendo(false)
    window.addEventListener('beforeprint', antes)
    window.addEventListener('afterprint', despues)
    return () => {
      window.removeEventListener('beforeprint', antes)
      window.removeEventListener('afterprint', despues)
    }
  }, [])

  // Dos ventanas, un solo tablero. La que se abre pide la vista a las que ya están y la toma; después,
  // cada cambio local se publica y las demás lo siguen. Lo que llega no se vuelve a publicar.
  const canal = useRef(null)
  const recibido = useRef(null)
  const indiceRef = useRef(indice)
  indiceRef.current = indice
  useEffect(() => {
    let c
    try { c = new BroadcastChannel(CANAL) } catch { return undefined }
    canal.current = c
    c.onmessage = (m) => {
      const d = m.data || {}
      if (d.tipo === 'pide') return c.postMessage({ tipo: 'pos', id: VISTAS[indiceRef.current].id })
      if (d.tipo !== 'pos') return
      const i = VISTAS.findIndex((v) => v.id === d.id)
      if (i < 0 || i === indiceRef.current) return
      recibido.current = d.id
      setIndice(i)
    }
    c.postMessage({ tipo: 'pide' })
    return () => { c.close(); canal.current = null }
  }, [setIndice])
  const publicada = useRef(false)
  useEffect(() => {
    const id = VISTAS[indice].id
    if (!publicada.current) { publicada.current = true; return }      // al abrir, no mueve a las otras
    if (recibido.current === id) { recibido.current = null; return }
    recibido.current = null
    try { canal.current?.postMessage({ tipo: 'pos', id }) } catch { /* cerrado */ }
  }, [indice])

  const abrirVentanaNotas = useCallback(() => {
    const url = `${location.pathname}?notas${hashDe(actual.current)}`
    try { window.open(url, 'casa-oga-e3-notas', 'width=900,height=640') } catch { /* sin ventanas */ }
  }, [])

  // Teclado: las teclas del E2 (flechas, Inicio, Fin, F, I) y las de quien presenta.
  const teclas = useRef(null)
  teclas.current = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return
    const k = e.key
    if (negro) {                                   // cualquier tecla vuelve de la pantalla en negro
      if (!['Shift', 'Control', 'Alt', 'Meta'].includes(k)) { e.preventDefault(); setNegro(false) }
      return
    }
    if (k === 'F5') { e.preventDefault(); return pantallaCompleta() }      // botón del control remoto
    // Av Pág y Re Pág (el control remoto) pasan de vista aunque el foco esté en un control.
    if (k === 'PageDown' || k === 'PageUp') {
      e.preventDefault()
      if (!e.repeat) irA(indiceRef.current + (k === 'PageDown' ? 1 : -1))
      return
    }
    const t = e.target
    if (t.tagName === 'SELECT' || t.tagName === 'INPUT' || t.isContentEditable) return
    if (t.getAttribute && (t.getAttribute('role') === 'slider' || t.closest?.('[data-control]'))) {
      if (k === 'Escape') t.blur?.()
      return
    }
    const suelto = t === document.body || t === document.documentElement ||
      (t.classList && t.classList.contains('lat-item'))
    if (k === 'Escape') { if (!suelto) t.blur?.(); return }
    if (!suelto && ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(k)) return
    if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(k)) {
      e.preventDefault()
      if (e.repeat) return                         // una tecla mantenida no recorre el tablero
      if (k === 'ArrowDown' || k === 'ArrowRight') irA(indiceRef.current + 1)
      else if (k === 'ArrowUp' || k === 'ArrowLeft') irA(indiceRef.current - 1)
      else if (k === 'Home') irA(0)
      else irA(VISTAS.length - 1)
      return
    }
    if (!suelto || e.repeat) return
    const l = k.toLowerCase()
    if (l === 'f') pantallaCompleta()
    else if (l === 'i' && !SOLO_NOTAS) imprimirTodo()
    else if (l === 'n' && !SOLO_NOTAS) setNotas((x) => !x)
    else if ((l === 'b' || k === '.') && !SOLO_NOTAS) setNegro(true)
    else return
    e.preventDefault()
  }
  useEffect(() => {
    const h = (e) => teclas.current(e)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  if (SOLO_NOTAS) return <VentanaNotas vista={vista} />

  const Vista = vista.Componente
  return (
    <>
      <div className="e3-vp" style={{ zoom: ventana.k, width: ventana.w, height: ventana.h }}>
        <div className="e3-vp-dentro">
          <VentanaCtx.Provider value={ventana}>
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
                <p className="solo-lector" aria-live="polite">{`Vista ${etiquetaDe(vista)}: ${vista.pregunta}`}</p>
                <Encabezado vista={vista} />
                <main className="cuerpo" ref={cuerpo}>
                  {imprimiendo ? <Impresion /> : <Vista vista={vista} irAVista={irAVista} />}
                </main>
              </div>
            </div>
          </VentanaCtx.Provider>
        </div>
      </div>
      {notas && <PanelNotas vista={vista} alto={ventana.notasAlto} onVentana={abrirVentanaNotas} />}
      {negro && <div className="e3-negro" role="presentation" onClick={() => setNegro(false)} />}
    </>
  )
}

/** El encabezado del E2 (regla 12): la pregunta, grande, es el h1. A la derecha, chico, en qué vista se
 *  está y de qué parte del documento sale. */
function Encabezado({ vista }) {
  const fuente = diapositivasDe(vista).map((d) => d.fuente).filter(Boolean).pop()
  const donde = vista.respaldo ? `${vista.id} · ${vista.anexo.fuente}`
    : `${etiquetaDe(vista).replace(/^0/, '')} / ${TOTAL_VISTAS}${fuente ? ` · ${fuente.split(' · ')[0]}` : ''}`
  return (
    <header className="e2-enc">
      <h1 className="e2-preg">{vista.pregunta}</h1>
      <div className="e2-enc-der">
        <span className="e2-enc-corte">{donde}</span>
        <Avance vista={vista} />
      </div>
    </header>
  )
}

/** (27/10, W1) En el lugar de la miniatura del mapa de calidad del E2, el avance de la historia: una
 *  barra por vista presentada, las ya vistas en azul claro y la actual en tinta. Mide lo mismo que la
 *  miniatura (118 × 46 con su marco), así el encabezado tiene el alto del E2. En el respaldo, ninguna
 *  barra se marca. */
function Avance({ vista }) {
  const historia = VISTAS.filter((v) => !v.respaldo)
  const i = historia.indexOf(vista)
  return (
    <span className="e3-avance" aria-hidden="true"
          title={i >= 0 ? `Vista ${i + 1} de ${historia.length}` : `Respaldo · ${vista.id}`}>
      <span className="e3-avance-barras" style={{ gridTemplateColumns: `repeat(${historia.length}, minmax(0, 1fr))` }}>
        {historia.map((v, j) => (
          <i key={v.id} className={i < 0 ? '' : j < i ? 'vista' : j === i ? 'actual' : ''} />
        ))}
      </span>
    </span>
  )
}

/** El favicon 4b, igual que en el E1 y el E2. */
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
        <span className="lat-sub">factibilidad: de la idea al piloto</span>
      </div>

      <ol className="lat-lista">
        {VISTAS.map((v, i) => {
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

      <div className="lat-pie" title="↑ ↓ o Av Pág y Re Pág: cambiar de vista · Inicio / Fin: primera y última · N: notas del orador · B o «.»: pantalla en negro · F: pantalla completa · I: imprimir">
        <span>↑ ↓ cambiar de vista</span>
        <span>N: notas · B: negro</span>
        <span>F: pantalla completa</span>
      </div>
    </nav>
  )
}

/** Flujo de impresión del E2: una hoja A4 apaisada por vista. */
function Impresion() {
  return (
    <ImpresionCtx.Provider value={true}>
      <div className="impresion-flujo">
        {VISTAS.map((v) => (
          <div className="hoja" key={v.id}>
            <h1 className="e2-preg">{v.pregunta}</h1>
            <v.Componente vista={v} />
          </div>
        ))}
      </div>
    </ImpresionCtx.Provider>
  )
}

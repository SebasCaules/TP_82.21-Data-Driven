// Armazón de /final/, la presentación final (17/11). Es e3/src/App.jsx (el armazón del E2 con el zoom uniforme, las teclas
// de quien presenta, las dos ventanas que se siguen, las notas, la pantalla en negro y la impresión) con estos cambios,
// nada más:
// - el registro de vistas es final/src/vistas/index.jsx, que deriva el recorrido, el riel y los tiempos de CF.BLOQUES
//   (contenido_final.js); el número de cada vista sale de su posición y el riel lleva el id en data-id;
// - título de la pestaña, subtítulo del riel, canal entre ventanas y nombre de la ventana de notas propios;
// - el encabezado toma la fuente de CF (vista.fuente) en vez de armarla con las diapositivas de C3;
// - las notas (Notas.jsx) dicen además quién presenta la vista y el tiempo acumulado de su bloque.
// Sin temporizador en vivo: los tiempos de las notas son los de CF.
// Los módulos sin datos del E2 y del E3 (escala.js, zoom.js) se importan tal cual; este archivo es copia porque el de /e3/
// importa el registro y las notas del E3.
// (18/11, spec de dataviz b.1, c y S-07, S-08, S-10) La unidad u (escala.js) se calcula acá con la ventana lógica y llega
// a las vistas por UCtx y al CSS por --fin-u; el piso del zoom baja a 0,85 (a 1024 × 768 la vista entra entera, sin
// aviso); P oculta y muestra el riel (modo de proyección optativo: por defecto el riel se ve, y la pantalla completa sola
// no lo oculta).
// (18/11, fase 8, spec 1.1 y 1.5) El marco se arma con dos claves de variantes.js: `sec` (la sección de la vista sobre el
// título) y `nav` (cómo dice el riel dónde estamos: a línea de avance, b lista liviana con barra de avance arriba, c solo
// los bloques). Sale el índice de teclas del riel (las teclas siguen iguales) y el gráfico de barritas del encabezado: a
// la derecha queda «n / 15 · fuente». Una vista con `meta.plena` se dibuja sin riel ni encabezado, con la ventana lógica
// entera. Los estilos del marco están en estilos_marco.css, en u.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { VISTAS, BLOQUES, etiquetaDe, grupoDe, indiceDe, TOTAL_VISTAS } from './vistas/index.jsx'
import { CF } from './contenido_final.js'
import MarcaInicio from './MarcaInicio.jsx'
import { ImpresionCtx } from '../../e2/src/escala.js'
import { VentanaCtx, medir } from '../../e3/src/zoom.js'
import { PanelNotas, VentanaNotas } from './Notas.jsx'
import { UCtx, calcularU } from './escala.js'
import { variante } from './variantes.js'

// Las letras del marco no cambian sin recargar (salen de la URL o de variantes.js).
const NAV = ['a', 'b', 'c'].includes(variante('nav')) ? variante('nav') : 'a'
const SEC = variante('sec') === 'b' ? 'b' : 'a'

const hashDe = (i) => `#${VISTAS[i].id.toLowerCase()}`
function indiceDeHash() {
  const i = VISTAS.findIndex((v) => `#${v.id.toLowerCase()}` === location.hash.toLowerCase())
  return i >= 0 ? i : 0
}
const TITULO_BASE = CF.TITULO
const CANAL = 'casa-oga-final'
const SOLO_NOTAS = /(^|[?&])notas\b/.test(location.search)
// El panel de notas toma este tanto del alto de la ventana; el tablero, el resto.
const NOTAS_ALTO = 0.35

/** Ventana lógica al día con el tamaño real, descontando el panel de notas si está abierto. Con las
 *  notas, k puede bajar a 0,5 (zoom.js): se ensaya en una laptop, no se proyecta. Sin notas, el piso es 0,85
 *  (18/11, FD-05): un proyector de 1024 × 768 da k 0,889 y ventana lógica 1152 × 864, sin aviso de pantalla chica. */
function useVentana(notas) {
  const calc = useCallback(() => {
    const alto = notas ? Math.round(window.innerHeight * NOTAS_ALTO) : 0
    return { ...medir(window.innerWidth, window.innerHeight - alto, notas ? 0.5 : 0.85), notasAlto: alto }
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
  const [proy, setProy] = useState(false)
  const ventana = useVentana(notas)
  const u = calcularU(ventana.w, ventana.h)
  // La unidad del riel: u en 16:9; si sobra alto (4:3), crece con el alto hasta 1,15 u (estilos_marco.css). Con 1,15 el
  // título más ancho (V09) sigue entrando junto a «n / 15 · fuente» a 1024 × 768, con 34 u de margen.
  const ru = u * Math.min(1.15, Math.max(1, ventana.h / 1080 / u))
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
    try { window.open(url, 'casa-oga-final-notas', 'width=900,height=640') } catch { /* sin ventanas */ }
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
    else if (l === 'p' && !SOLO_NOTAS) setProy((x) => !x)
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
  // (spec 1.5) La vista a pantalla completa no lleva riel ni encabezado: recibe la ventana lógica entera.
  const plena = vista.plena === true
  return (
    <>
      <div className="e3-vp"
           style={{ zoom: ventana.k, width: ventana.w, height: ventana.h, '--fin-u': `${u}px`, '--fin-ru': `${ru}px` }}>
        <div className="e3-vp-dentro">
          <VentanaCtx.Provider value={ventana}>
          <UCtx.Provider value={u}>
            <div className={`app fin-nav-${NAV}${proy ? ' fin-proy' : ''}${plena ? ' fin-app-plena' : ''}`}>
              <div className="chico">
                <h1>Este tablero necesita una pantalla más grande</h1>
                <p>
                  Está hecho para leerse sin desplazar la página, en proyector y en laptop, de
                  1152&nbsp;×&nbsp;640 a 1920&nbsp;×&nbsp;1080. Amplíe la ventana o ábralo en una
                  pantalla más grande.
                </p>
              </div>

              {!plena && <Lateral indice={indice} irA={irA} />}

              <div className="principal">
                <p className="solo-lector" aria-live="polite">{`Vista ${etiquetaDe(vista)}: ${vista.pregunta}`}</p>
                {!plena && <Encabezado vista={vista} />}
                <main className="cuerpo" ref={cuerpo}>
                  {imprimiendo ? <Impresion /> : <Vista vista={vista} irAVista={irAVista} />}
                </main>
              </div>
            </div>
          </UCtx.Provider>
          </VentanaCtx.Provider>
        </div>
      </div>
      {notas && <PanelNotas vista={vista} alto={ventana.notasAlto} onVentana={abrirVentanaNotas} />}
      {negro && <div className="e3-negro" role="presentation" onClick={() => setNegro(false)} />}
    </>
  )
}

/** El encabezado del E2 (regla 12): la pregunta, grande, es el h1, en un renglón. A la derecha, «n / 15 · fuente» en letra
 *  secundaria. Tres formas (estilos_marco.css):
 *  - sec.a: arriba, la sección de la vista (el nombre del bloque en el riel, «2 · Regla y piloto»; «Apertura» y «Cierre»)
 *    con su filete en el acento y, en el mismo renglón a la derecha, «n / 15 · fuente»; debajo, el título a todo el ancho.
 *    128 u de alto.
 *  - sec.b: el título y «n / 15 · fuente» en un renglón, como estaba. 96 u.
 *  - nav.b: la barra de avance por bloques pegada al borde superior, con el nombre del bloque en curso debajo de su tramo
 *    (hace de sección: no se repite), y el renglón del título como en sec.b. 128 u. */
function Encabezado({ vista }) {
  const fuente = vista.fuente ?? ''
  const donde = `${etiquetaDe(vista).replace(/^0/, '')} / ${TOTAL_VISTAS}${fuente ? ` · ${fuente}` : ''}`
  const forma = NAV === 'b' ? 'barra' : SEC === 'a' ? 'seccion' : 'simple'
  return (
    <header className={`e2-enc fin-enc fin-enc-${forma}`}>
      {forma === 'barra' && <BarraAvance vista={vista} />}
      {forma === 'seccion' && <p className="fin-enc-sec">{grupoDe(vista).nombre}</p>}
      <h1 className="e2-preg">{vista.pregunta}</h1>
      <span className="e2-enc-corte fin-enc-donde">{donde}</span>
    </header>
  )
}

/** Estado de la vista j respecto de la actual i: vista, actual o la que falta. */
const estadoDe = (j, i) => (j < i ? 'fin-visto' : j === i ? 'fin-actual' : 'fin-falta')

/** (nav.b) La barra de avance, partida en los bloques: cada tramo mide lo que su cantidad de vistas y tiene una celda por
 *  vista; llena hasta la vista en curso (las vistas en azul claro, la actual en tinta). Debajo del tramo en curso, el
 *  nombre del bloque (pegado a la derecha en los dos últimos, para que no se salga). */
function BarraAvance({ vista }) {
  const i = indiceDe(vista.id)
  const bloque = grupoDe(vista)
  const j = BLOQUES.indexOf(bloque)
  const antes = BLOQUES.slice(0, j).reduce((s, b) => s + b.ids.length, 0)
  const derecha = antes + bloque.ids.length / 2 > TOTAL_VISTAS * 2 / 3
  return (
    <div className="fin-avance" style={{ gridTemplateColumns: BLOQUES.map((b) => `${b.ids.length}fr`).join(' ') }}>
      {BLOQUES.map((b, k) => (
        <span key={b.id} className={`fin-avance-tramo${b === bloque ? ' fin-actual' : ''}`} aria-hidden="true"
              style={{ gridColumn: k + 1, gridTemplateColumns: `repeat(${b.ids.length}, minmax(0, 1fr))` }}>
          {b.ids.map((id) => <i key={id} className={estadoDe(indiceDe(id), i)} />)}
        </span>
      ))}
      <span className="fin-avance-nombre" style={{ gridColumn: j + 1, justifySelf: derecha ? 'end' : 'start' }}>
        {bloque.nombre}
      </span>
    </div>
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

/** El riel: la marca y el subtítulo arriba, y debajo una de tres formas (nav). Sin índice de teclas (las teclas siguen
 *  iguales). En las tres, la vista actual es el `.lat-item.on` con aria-current, un clic navega y el riel no se imprime. */
function Lateral({ indice, irA }) {
  const Riel = NAV === 'c' ? RielBloques : NAV === 'b' ? RielLista : RielLinea
  return (
    <nav className={`lat fin-riel fin-riel-${NAV}`} aria-label="Vistas del tablero">
      <div className="lat-marca">
        <MarcaInicio><Marca /><span className="lat-oga">Casa Óga</span></MarcaInicio>
        <span className="lat-sub">{CF.SUBTITULO}</span>
      </div>
      <Riel indice={indice} irA={irA} />
    </nav>
  )
}

/** El botón de una vista en el riel. `marca` va antes del título: el nodo (a), el número (b) o nada (c); la vista actual
 *  lleva además el filete en el acento (b y c). */
function ItemVista({ v, i, indice, irA, marca = null }) {
  const on = i === indice
  return (
    <button type="button" onClick={() => irA(i)} data-id={v.id}
            className={`lat-item${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined}>
      {marca}
      {on && NAV !== 'a' && <span className="fin-filete" aria-hidden="true" />}
      <span className="lat-txt">{v.titulo}</span>
    </button>
  )
}

/** (nav.a) Línea de avance: una línea vertical con un nodo por vista. La línea y los nodos ya vistos van en azul claro, el
 *  nodo actual más grande y en tinta, los que faltan vacíos; el nombre de cada bloque, como rótulo chico sobre su primer
 *  nodo. La línea se arma por tramos (rótulo, mitad de arriba y mitad de abajo de cada fila), cada uno con su color. */
function RielLinea({ indice, irA }) {
  const bloqueActual = grupoDe(VISTAS[indice])
  return (
    <ol className="lat-lista">
      {VISTAS.map((v, i) => {
        const grupo = grupoDe(v)
        const abre = i === 0 || grupoDe(VISTAS[i - 1]) !== grupo
        return (
          <li key={v.id} className={estadoDe(i, indice)}>
            {abre && (
              <div className={`lat-grupo${grupo === bloqueActual ? ' fin-grupo-on' : ''}`}><span>{grupo.nombre}</span></div>
            )}
            <ItemVista v={v} i={i} indice={indice} irA={irA} marca={<span className="fin-nodo" aria-hidden="true" />} />
          </li>
        )
      })}
    </ol>
  )
}

/** (nav.b) Lista liviana: número y título, el rótulo de cada bloque sin separadores, la actual con filete en el acento y su
 *  texto en 600. El avance va arriba del área principal (BarraAvance). */
function RielLista({ indice, irA }) {
  const bloqueActual = grupoDe(VISTAS[indice])
  return (
    <ol className="lat-lista">
      {VISTAS.map((v, i) => {
        const grupo = grupoDe(v)
        const abre = i === 0 || grupoDe(VISTAS[i - 1]) !== grupo
        return (
          <li key={v.id} className={estadoDe(i, indice)}>
            {abre && (
              <div className={`lat-grupo${grupo === bloqueActual ? ' fin-grupo-on' : ''}`}><span>{grupo.nombre}</span></div>
            )}
            <ItemVista v={v} i={i} indice={indice} irA={irA}
                       marca={<span className="lat-n tabular">{etiquetaDe(v)}</span>} />
          </li>
        )
      })}
    </ol>
  )
}

/** (nav.c) Solo los bloques, grandes: cada uno con un punto por vista (vista, actual, falta). El bloque en curso abre sus
 *  vistas debajo. Un clic en un bloque lleva a su primera vista. */
function RielBloques({ indice, irA }) {
  const bloqueActual = grupoDe(VISTAS[indice])
  return (
    <ol className="lat-lista">
      {BLOQUES.map((b) => {
        const abierto = b === bloqueActual
        const primera = indiceDe(b.ids[0])
        return (
          <li key={b.id} className={`fin-bloque${abierto ? ' fin-abierto' : ''}`}>
            <button type="button" className="lat-item fin-bloque-btn" onClick={() => irA(primera)} data-bloque={b.id}>
              <span className="fin-bloque-nombre">{b.nombre}</span>
              <span className="fin-puntos" aria-hidden="true">
                {b.ids.map((id) => <i key={id} className={`fin-punto ${estadoDe(indiceDe(id), indice)}`} />)}
              </span>
            </button>
            {abierto && (
              <ol className="fin-sub">
                {b.ids.map((id) => {
                  const i = indiceDe(id)
                  return <li key={id}><ItemVista v={VISTAS[i]} i={i} indice={indice} irA={irA} /></li>
                })}
              </ol>
            )}
          </li>
        )
      })}
    </ol>
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

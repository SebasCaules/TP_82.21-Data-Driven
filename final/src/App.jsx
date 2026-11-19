// Armazón de /final/, la presentación final (17/11). Es e3/src/App.jsx (el armazón del E2 con el zoom uniforme, las teclas
// de quien presenta, las dos ventanas que se siguen, las notas, la pantalla en negro y la impresión) con estos cambios,
// nada más:
// - el registro de vistas es final/src/vistas/index.jsx, que deriva el recorrido, el riel y los tiempos de CF.BLOQUES
//   (contenido_final.js); el número de cada vista sale de su posición y el riel lleva el id en data-id;
// - título de la pestaña, subtítulo del riel, canal entre ventanas y nombre de la ventana de notas propios;
// - el encabezado toma la referencia al informe de CF (vista.informe; desde la fase 11, en el botón de información);
// - las notas (Notas.jsx) dicen además quién presenta la vista y el tiempo acumulado de su bloque.
// Sin temporizador en vivo: los tiempos de las notas son los de CF.
// Los módulos sin datos del E2 y del E3 (escala.js, zoom.js) se importan tal cual; este archivo es copia porque el de /e3/
// importa el registro y las notas del E3.
// (18/11, spec de dataviz b.1, c y S-07, S-08, S-10) La unidad u (escala.js) se calcula acá con la ventana lógica y llega
// a las vistas por UCtx y al CSS por --fin-u; el piso del zoom baja a 0,85 (a 1024 × 768 la vista entra entera, sin
// aviso); P oculta y muestra el riel (modo de proyección optativo: por defecto el riel se ve, y la pantalla completa sola
// no lo oculta).
// (18/11, fase 8) Sale el índice de teclas del riel (las teclas siguen iguales) y el gráfico de barritas del encabezado. Una
// vista con `meta.plena` se dibuja sin riel ni encabezado, con la ventana lógica entera. Los estilos del marco están en
// estilos_marco.css, en u.
// (19/11, fase 9, spec 3) Quedan fijas las ramas que eligió el usuario: riel con línea de avance y la sección de la vista
// sobre el título. Las otras formas del riel y del encabezado se borraron.
// (19/11, fase 9, spec 2) Avance por pasos (pasos.js): la posición es { i, paso, completa }. Avanzar (→, ↓, Av Pág)
// enciende el paso siguiente y en el último pasa a la vista siguiente, en su paso 1; retroceder (←, ↑, Re Pág) apaga el
// último y en el paso 1 vuelve a la vista anterior completa. Inicio, Fin, el clic en el riel, el enlace (#v05) y el
// historial del navegador abren la vista completa; ?paso=k abre ese paso (para las capturas); sin enlace, el tablero
// arranca en el paso 1 de la primera vista. El cambio de paso no usa la transición de vista: solo cambian las opacidades
// (estilos_final.css). El canal entre ventanas lleva también el paso, las notas dicen «paso k de N», el encabezado lleva
// un punto por paso y la hoja impresa dibuja cada vista completa.
// (19/11, fase 10, spec 2 y 3) Hasta 6 pasos por vista. Cada posición sabe cómo se llegó a ella (llegada()): avanzando
// un paso o entrando a la vista siguiente con → ('adelante', con `llega` = el paso que llegó), retrocediendo ('atras') o
// de otro modo ('quieto': al abrir, Inicio, Fin, el riel, el enlace, ?paso=k). .app lleva data-avance y data-llega, y
// PasoCtx lleva llega y desdeVista: solo lo que acaba de llegar avanzando se anima (Paso, Anima, useAnima); sin avanzar,
// los cambios son instantáneos (estilos_final.css). Al entrar a una vista con →, --fin-anima-base retrasa las animaciones
// del paso 1 hasta que el cuerpo nuevo entra. Una vista con VistaLienzo (Plantilla.jsx) usa el riel y el encabezado
// como cualquier otra; `plena` sigue igual.
// (19/11, fase 11, spec 2.3) Sale la cita del encabezado: arriba a la derecha quedan «n / 16» con los puntos y un botón
// chico de información. El botón (clic, Enter o la tecla R) abre un recuadro con la referencia («Informe, sección 23.6»)
// y un enlace por sección, «Abrir en el informe», a INFORME.url#page=N en otra pestaña (VISTAS[i].referencia, de
// vistas/index.jsx). Se cierra con Escape, con otro clic (en el botón o fuera del recuadro) y al cambiar de vista; no
// se imprime, no cambia el paso y con el foco en el botón o en un enlace las flechas siguen pasando de paso.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { VISTAS, etiquetaDe, grupoDe, TOTAL_VISTAS } from './vistas/index.jsx'
import { CF } from './contenido_final.js'
import MarcaInicio from './MarcaInicio.jsx'
import { ImpresionCtx } from '../../e2/src/escala.js'
import { VentanaCtx, medir } from '../../e3/src/zoom.js'
import { PanelNotas, VentanaNotas } from './Notas.jsx'
import { UCtx, calcularU } from './escala.js'
import { PasoCtx } from './pasos.js'

const hashDe = (i) => `#${VISTAS[i].id.toLowerCase()}`
/** La vista del enlace (#v05), o -1 si no hay o no existe. */
const indiceDeHash = () => VISTAS.findIndex((v) => `#${v.id.toLowerCase()}` === location.hash.toLowerCase())
const TITULO_BASE = CF.TITULO
const CANAL = 'casa-oga-final'
const SOLO_NOTAS = /(^|[?&])notas\b/.test(location.search)
// El panel de notas toma este tanto del alto de la ventana; el tablero, el resto.
const NOTAS_ALTO = 0.35

// ?paso=k (las capturas, scripts/captura_vista.py): se lee al abrir y no se arrastra a las direcciones siguientes.
const PASO_URL = Number((location.search.match(/(?:^|[?&])paso=(\d+)/) ?? [])[1]) || 0
const BUSQUEDA = location.search.replace(/([?&])paso=\d+(&|$)/, '$1').replace(/[?&]$/, '')

// ---------------------------------------------------------------- posición: { i, paso, completa }
const pasosEn = (i) => VISTAS[i].pasos
const completa = (i) => ({ i, paso: pasosEn(i), completa: true })
const enPaso = (i, paso) => ({ i, paso: Math.max(1, Math.min(pasosEn(i), paso)), completa: false })
const igual = (a, b) => a.i === b.i && a.paso === b.paso && a.completa === b.completa
const clave = (p) => `${p.i}:${p.paso}:${p.completa ? 1 : 0}`
const QUIETO = { avance: 'quieto', llega: 0, desdeVista: false }
/** Cómo se llegó de `vieja` a `nueva` (las dos { i, paso, completa }): 'adelante' si es el paso siguiente de la misma
 *  vista o el paso 1 de la vista siguiente desde el último de esta (llega: ese paso; desdeVista: si cambió de vista);
 *  'atras' si es un paso anterior o una vista anterior; si no, 'quieto' (la vista completa, un salto, el enlace). */
function llegada(vieja, nueva) {
  if (nueva.completa) return QUIETO
  if (nueva.i === vieja.i && !vieja.completa && nueva.paso === vieja.paso + 1) {
    return { avance: 'adelante', llega: nueva.paso, desdeVista: false }
  }
  if (nueva.i === vieja.i + 1 && nueva.paso === 1 && vieja.paso === pasosEn(vieja.i)) {
    return { avance: 'adelante', llega: 1, desdeVista: true }
  }
  if (nueva.i < vieja.i || (nueva.i === vieja.i && nueva.paso < vieja.paso)) return { ...QUIETO, avance: 'atras' }
  return QUIETO
}
// Lo que esperan las animaciones del paso 1 al entrar a una vista con →: el cuerpo nuevo entra a los 100 ms y tarda 380
// (::view-transition-new(e2-cuerpo), estilos_e2.css; sin View Transitions, 340 ms de WAAPI).
const BASE_DESDE_VISTA = '260ms'

/** Al abrir: ?paso=k, ese paso de la vista del enlace (o de la primera); con enlace, la vista completa; sin enlace, el
 *  paso 1 de la primera (se empieza a presentar). */
function posicionInicial() {
  const h = indiceDeHash()
  if (PASO_URL) return { ...enPaso(Math.max(0, h), PASO_URL), ...QUIETO }
  return { ...(h >= 0 ? completa(h) : enPaso(0, 1)), ...QUIETO }
}

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
  const [pos, setPosCrudo] = useState(posicionInicial)
  const [imprimiendo, setImprimiendo] = useState(false)
  const [notas, setNotas] = useState(false)
  const [negro, setNegro] = useState(false)
  const [proy, setProy] = useState(false)
  // el recuadro de información está abierto en la vista `infoEn` (-1: cerrado): al cambiar de vista se cierra solo
  const [infoEn, setInfoEn] = useState(-1)
  const ventana = useVentana(notas)
  const u = calcularU(ventana.w, ventana.h)
  // La unidad del riel: u en 16:9; si sobra alto (4:3), crece con el alto hasta 1,15 u (estilos_marco.css). Con 1,15 el
  // título más ancho (V09) sigue entrando junto a «n / 16» y el botón de información a 1024 × 768.
  const ru = u * Math.min(1.15, Math.max(1, ventana.h / 1080 / u))
  const indice = pos.i
  const vista = VISTAS[indice]
  const pasos = vista.pasos
  const info = infoEn === indice

  // La posición vigente, al día antes de que React dibuje: las teclas y el canal calculan desde acá.
  const actual = useRef(pos)
  /** Cambio de posición. Entre vistas, con la transición del E2 (View Transitions con dirección; si no hay, WAAPI); dentro
   *  de una vista, sin transición de vista: Paso (svg.jsx) cambia solo su opacidad. La posición nueva lleva cómo se llegó
   *  a ella (llegada). */
  const setPos = useCallback((destino) => {
    const vieja = actual.current
    if (igual(destino, vieja)) return
    const nueva = { ...destino, ...llegada(vieja, destino) }
    actual.current = nueva
    if (nueva.i !== vieja.i) {
      document.documentElement.dataset.dir = nueva.i > vieja.i ? 'adelante' : 'atras'
      if (!SOLO_NOTAS && document.startViewTransition && document.visibilityState === 'visible') {
        const t = document.startViewTransition(() => flushSync(() => setPosCrudo(nueva)))
        // (19/11, fase 11) con dos cambios seguidos, el navegador saltea la primera transición y rechaza su `ready`
        // («Transition was skipped»): no es un error, pero sin este catch queda como rechazo sin atender en la consola
        t.ready.catch(() => {})
        return
      }
    }
    setPosCrudo(nueva)
  }, [])
  const avanzar = useCallback(() => {
    const { i, paso } = actual.current
    if (paso < pasosEn(i)) setPos(enPaso(i, paso + 1))
    else if (i < VISTAS.length - 1) setPos(enPaso(i + 1, 1))
  }, [setPos])
  const retroceder = useCallback(() => {
    const { i, paso } = actual.current
    if (paso > 1) setPos(enPaso(i, paso - 1))
    else if (i > 0) setPos(completa(i - 1))
  }, [setPos])
  /** Inicio, Fin, el riel y el enlace: la vista completa (también la misma, si estaba a medio avanzar). */
  const irA = useCallback((i) => setPos(completa(Math.max(0, Math.min(VISTAS.length - 1, i)))), [setPos])
  const irAVista = useCallback((id) => {
    const i = VISTAS.findIndex((v) => v.id === id)
    if (i >= 0) irA(i)
  }, [irA])

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

  // URL y título siguen a la vista, como en el E2. ?paso=k no pasa a las direcciones siguientes.
  const primera = useRef(true)
  useEffect(() => {
    const h = hashDe(indice)
    if (location.hash.toLowerCase() !== h) {
      try {
        // con la ruta delante: «#v04» solo, relativo, conservaría la búsqueda de ahora (y con ella ?paso=k)
        if (primera.current) history.replaceState(null, '', location.pathname + BUSQUEDA + h)
        else history.pushState(null, '', location.pathname + BUSQUEDA + h)
      } catch {
        location.hash = h
      }
    }
    primera.current = false
    document.title = `${SOLO_NOTAS ? 'Notas · ' : ''}${vista.pregunta} · ${TITULO_BASE}`
  }, [indice, vista])
  useEffect(() => {
    const alVolver = () => { const i = indiceDeHash(); if (i >= 0) irA(i) }
    window.addEventListener('popstate', alVolver)
    return () => window.removeEventListener('popstate', alVolver)
  }, [irA])

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

  // Dos ventanas, un solo tablero. La que se abre pide la posición (vista y paso) a las que ya están y la toma; después,
  // cada cambio local se publica y las demás lo siguen. Lo que llega no se vuelve a publicar.
  const canal = useRef(null)
  const recibido = useRef(null)
  useEffect(() => {
    let c
    try { c = new BroadcastChannel(CANAL) } catch { return undefined }
    canal.current = c
    const mensaje = (p) => ({ tipo: 'pos', id: VISTAS[p.i].id, paso: p.paso, completa: p.completa })
    c.onmessage = (m) => {
      const d = m.data || {}
      if (d.tipo === 'pide') return c.postMessage(mensaje(actual.current))
      if (d.tipo !== 'pos') return
      const i = VISTAS.findIndex((v) => v.id === d.id)
      if (i < 0) return
      const nueva = d.completa === false && Number.isInteger(d.paso) ? enPaso(i, d.paso) : completa(i)
      if (igual(nueva, actual.current)) return
      recibido.current = clave(nueva)
      setPos(nueva)
    }
    c.postMessage({ tipo: 'pide' })
    return () => { c.close(); canal.current = null }
  }, [setPos])
  const publicada = useRef(false)
  useEffect(() => {
    if (!publicada.current) { publicada.current = true; return }      // al abrir, no mueve a las otras
    if (recibido.current === clave(pos)) { recibido.current = null; return }
    recibido.current = null
    try {
      canal.current?.postMessage({ tipo: 'pos', id: VISTAS[pos.i].id, paso: pos.paso, completa: pos.completa })
    } catch { /* cerrado */ }
  }, [pos])

  // El recuadro de información: se abre en la vista actual y se cierra con otro clic en el botón; un clic fuera del botón
  // y del recuadro también lo cierra (un clic en el riel lo cierra y cambia de vista).
  const alternarInfo = useCallback(() => setInfoEn((x) => (x === actual.current.i ? -1 : actual.current.i)), [])
  useEffect(() => {
    if (!info) return undefined
    const fuera = (e) => { if (!e.target.closest?.('.fin-info, .fin-info-recuadro')) setInfoEn(-1) }
    document.addEventListener('pointerdown', fuera)
    return () => document.removeEventListener('pointerdown', fuera)
  }, [info])

  const abrirVentanaNotas = useCallback(() => {
    const url = `${location.pathname}?notas${hashDe(actual.current.i)}`
    try { window.open(url, 'casa-oga-final-notas', 'width=900,height=640') } catch { /* sin ventanas */ }
  }, [])

  // Teclado: las teclas del E2 (flechas, Inicio, Fin, F, I) y las de quien presenta. Una tecla mantenida no recorre.
  const teclas = useRef(null)
  teclas.current = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return
    const k = e.key
    if (negro) {                                   // cualquier tecla vuelve de la pantalla en negro, sin cambiar el paso
      if (!['Shift', 'Control', 'Alt', 'Meta'].includes(k)) { e.preventDefault(); setNegro(false) }
      return
    }
    if (k === 'F5') { e.preventDefault(); return pantallaCompleta() }      // botón del control remoto
    // Av Pág y Re Pág (el control remoto) avanzan y retroceden aunque el foco esté en un control.
    if (k === 'PageDown' || k === 'PageUp') {
      e.preventDefault()
      if (!e.repeat) (k === 'PageDown' ? avanzar : retroceder)()
      return
    }
    const t = e.target
    if (t.tagName === 'SELECT' || t.tagName === 'INPUT' || t.isContentEditable) return
    if (t.getAttribute && (t.getAttribute('role') === 'slider' || t.closest?.('[data-control]'))) {
      if (k === 'Escape') t.blur?.()
      return
    }
    // (fase 11) el botón de información y los enlaces de su recuadro no se quedan con las flechas ni con las letras
    const enInfo = Boolean(t.closest?.('.fin-info, .fin-info-recuadro'))
    const suelto = t === document.body || t === document.documentElement ||
      (t.classList && t.classList.contains('lat-item')) || enInfo
    if (k === 'Escape' && actual.current.i === infoEn) {
      // cierra el recuadro; si el foco estaba en uno de sus enlaces, vuelve al botón
      e.preventDefault()
      if (t.closest?.('.fin-info-recuadro')) document.querySelector('.fin-info')?.focus()
      setInfoEn(-1)
      return
    }
    if (k === 'Escape') { if (!suelto) t.blur?.(); return }
    if (!suelto && ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(k)) return
    if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(k)) {
      e.preventDefault()
      if (e.repeat) return                         // una tecla mantenida no recorre el tablero
      if (k === 'ArrowDown' || k === 'ArrowRight') avanzar()
      else if (k === 'ArrowUp' || k === 'ArrowLeft') retroceder()
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
    else if (l === 'r' && !SOLO_NOTAS && !imprimiendo) alternarInfo()
    else return
    e.preventDefault()
  }
  useEffect(() => {
    const h = (e) => teclas.current(e)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const paso = useMemo(() => ({
    paso: pos.paso, pasos, completa: pos.completa, llega: pos.llega ?? 0, desdeVista: pos.desdeVista === true,
  }), [pos, pasos])

  if (SOLO_NOTAS) return <VentanaNotas vista={vista} paso={pos.paso} pasos={pasos} />

  const Vista = vista.Componente
  // (spec 1.5 de la fase 8) La vista a pantalla completa no lleva riel ni encabezado: recibe la ventana lógica entera.
  const plena = vista.plena === true
  return (
    <>
      <div className="e3-vp"
           style={{ zoom: ventana.k, width: ventana.w, height: ventana.h, '--fin-u': `${u}px`, '--fin-ru': `${ru}px` }}>
        <div className="e3-vp-dentro">
          <VentanaCtx.Provider value={ventana}>
          <UCtx.Provider value={u}>
            <div className={`app${proy ? ' fin-proy' : ''}${plena ? ' fin-app-plena' : ''}`}
                 data-vista={vista.id} data-paso={pos.paso} data-pasos={pasos}
                 data-completa={pos.completa ? '' : undefined}
                 data-avance={pos.avance ?? 'quieto'} data-llega={pos.llega || undefined}
                 style={pos.desdeVista ? { '--fin-anima-base': BASE_DESDE_VISTA } : undefined}>
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
                {!plena && (
                  <Encabezado vista={vista} paso={pos.paso} pasos={pasos} info={info && !imprimiendo}
                              alternarInfo={alternarInfo} />
                )}
                <main className="cuerpo" ref={cuerpo}>
                  {imprimiendo ? <Impresion /> : (
                    <PasoCtx.Provider value={paso}>
                      <Vista vista={vista} irAVista={irAVista} />
                    </PasoCtx.Provider>
                  )}
                </main>
                {plena && !imprimiendo && <Puntos paso={pos.paso} pasos={pasos} clase="fin-pasos-plena" />}
              </div>
            </div>
          </UCtx.Provider>
          </VentanaCtx.Provider>
        </div>
      </div>
      {notas && <PanelNotas vista={vista} paso={pos.paso} pasos={pasos} alto={ventana.notasAlto} onVentana={abrirVentanaNotas} />}
      {negro && <div className="e3-negro" role="presentation" onClick={() => setNegro(false)} />}
    </>
  )
}

/** Un punto chico por paso de la vista (encendidos hasta el vigente), para quien presenta. Nada si la vista tiene un solo
 *  paso. Sin texto: el lector de pantalla lee «paso k de N». */
function Puntos({ paso, pasos, clase = '' }) {
  if (pasos <= 1) return null
  return (
    <span className={`fin-pasos ${clase}`} role="img" aria-label={`paso ${paso} de ${pasos}`}>
      {Array.from({ length: pasos }, (_, j) => <i key={j} className={j < paso ? 'fin-on' : undefined} />)}
    </span>
  )
}

/** El encabezado del E2 (regla 12): arriba, la sección de la vista (el nombre del bloque en el riel, «2 · Regla y
 *  piloto»; «Apertura» y «Cierre») con su filete en el acento y, en el mismo renglón a la derecha, los puntos del avance,
 *  «n / 16» en letra secundaria y el botón de información; debajo, la pregunta, grande, es el h1, en un renglón a todo el
 *  ancho. 128 u. (fase 11) La cita ya no se ve: la lleva el recuadro del botón. */
function Encabezado({ vista, paso, pasos, info, alternarInfo }) {
  const donde = `${etiquetaDe(vista).replace(/^0/, '')} / ${TOTAL_VISTAS}`
  const ref = vista.referencia
  return (
    <header className="e2-enc fin-enc">
      <p className="fin-enc-sec">{grupoDe(vista).nombre}</p>
      <h1 className="e2-preg">{vista.pregunta}</h1>
      <span className="e2-enc-corte fin-enc-donde">
        <Puntos paso={paso} pasos={pasos} />
        {donde}
        {ref && (
          <button type="button" className="fin-info" onClick={alternarInfo} aria-expanded={info}
                  aria-controls={info ? 'fin-info-recuadro' : undefined}
                  aria-label="Referencia en el informe (tecla R)" title="Referencia en el informe (R)">
            <IconoInfo />
          </button>
        )}
      </span>
      {ref && info && <RecuadroInfo referencia={ref} />}
    </header>
  )
}

/** La «i» del botón, dibujada con CSS (sin letra y sin SVG: src/fit.js toma todo svg del encabezado como algo que pisa
 *  la barra): un punto y un trazo (estilos_marco.css, .fin-info-i). Toma el color del botón. */
const IconoInfo = () => <span className="fin-info-i" aria-hidden="true" />

/** El recuadro del botón de información: la referencia y un enlace por sección a la hoja del PDF donde empieza, en otra
 *  pestaña. Con más de una sección, cada enlace lleva el nombre de la suya. */
function RecuadroInfo({ referencia }) {
  const varias = referencia.enlaces.length > 1
  return (
    <div id="fin-info-recuadro" className="fin-info-recuadro" role="region" aria-label="Referencia en el informe">
      <p className="fin-info-ref">{referencia.rotulo}</p>
      <ul className="fin-info-enlaces">
        {referencia.enlaces.map((x) => (
          <li key={x.clave}>
            {varias && <span className="fin-info-sec">{x.nombre}</span>}
            <a href={x.href} target="_blank" rel="noopener"
               aria-label={`Abrir en el informe: ${x.nombre}, página ${x.pagina} (otra pestaña)`}>
              Abrir en el informe
            </a>
            <span className="fin-info-pag">{`p. ${x.pagina}`}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Estado de la vista j respecto de la actual i: vista, actual o la que falta. */
const estadoDe = (j, i) => (j < i ? 'fin-visto' : j === i ? 'fin-actual' : 'fin-falta')

/** El favicon 4b, igual que en el E1 y el E2. */
const Marca = () => (
  <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M16 1.5 L31 13 L31 30.5 L1 30.5 L1 13 Z" fill="var(--ink)" />
    <rect x="6" y="17" width="5" height="9" fill="var(--azul1)" />
    <rect x="13.5" y="20" width="5" height="6" fill="var(--azul3)" />
    <rect x="21" y="23.5" width="5" height="2.5" fill="var(--terra)" />
  </svg>
)

/** El riel: la marca y el subtítulo arriba y, debajo, la línea de avance: una línea vertical con un nodo por vista. La
 *  línea y los nodos ya vistos van en azul claro, el nodo actual más grande y en tinta, los que faltan vacíos; el nombre
 *  de cada bloque, como rótulo chico sobre su primer nodo. Sin índice de teclas (las teclas siguen iguales). La vista
 *  actual es el `.lat-item.on` con aria-current, un clic abre la vista completa y el riel no se imprime. */
function Lateral({ indice, irA }) {
  const bloqueActual = grupoDe(VISTAS[indice])
  return (
    <nav className="lat fin-riel" aria-label="Vistas del tablero">
      <div className="lat-marca">
        <MarcaInicio><Marca /><span className="lat-oga">Casa Óga</span></MarcaInicio>
        <span className="lat-sub">{CF.SUBTITULO}</span>
      </div>
      <ol className="lat-lista">
        {VISTAS.map((v, i) => {
          const grupo = grupoDe(v)
          const abre = i === 0 || grupoDe(VISTAS[i - 1]) !== grupo
          const on = i === indice
          return (
            <li key={v.id} className={estadoDe(i, indice)}>
              {abre && (
                <div className={`lat-grupo${grupo === bloqueActual ? ' fin-grupo-on' : ''}`}><span>{grupo.nombre}</span></div>
              )}
              <button type="button" onClick={() => irA(i)} data-id={v.id}
                      className={`lat-item${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined}>
                <span className="fin-nodo" aria-hidden="true" />
                <span className="lat-txt">{v.titulo}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** Flujo de impresión del E2: una hoja A4 apaisada por vista, cada una completa (todos sus pasos encendidos). */
function Impresion() {
  return (
    <ImpresionCtx.Provider value={true}>
      <div className="impresion-flujo">
        {VISTAS.map((v) => (
          <div className="hoja" key={v.id}>
            <h1 className="e2-preg">{v.pregunta}</h1>
            <PasoCtx.Provider value={{ paso: v.pasos, pasos: v.pasos, completa: true, llega: 0, desdeVista: false }}>
              <v.Componente vista={v} />
            </PasoCtx.Provider>
          </div>
        ))}
      </div>
    </ImpresionCtx.Provider>
  )
}

// Controles de las diapositivas: botones de opción y deslizante. Con mouse y con teclado.
//
// (24/10) Con el foco en un control, las flechas (y Inicio, Fin) mueven el control y no la
// diapositiva: el control llama preventDefault y App.jsx ignora las teclas ya atendidas. Esc
// devuelve el foco a la presentación. Avance de página y Retroceso de página (lo que mandan los
// controles remotos) siguen pasando de diapositiva aunque el foco esté acá.
// Todo control lleva data-control: App.jsx no avanza con un clic sobre él.

import { useRef } from 'react'

const MOVER = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }

/** Botones de opción (radiogroup) con foco itinerante. opciones: [{ valor, texto, deshabilitada? }] */
export function Opciones({ etiqueta, opciones, valor, onCambio, className = '', escala = false }) {
  const refs = useRef({})
  const activas = opciones.filter((o) => !o.deshabilitada)
  const elegir = (v) => {
    onCambio(v)
    refs.current[v]?.focus()
  }
  const alTeclear = (e) => {
    const k = activas.findIndex((o) => o.valor === valor)
    if (e.key in MOVER) {
      const sig = activas[Math.max(0, Math.min(activas.length - 1, k + MOVER[e.key]))]
      if (sig) elegir(sig.valor)
    } else if (e.key === 'Home') elegir(activas[0].valor)
    else if (e.key === 'End') elegir(activas[activas.length - 1].valor)
    else if (e.key === 'Escape') e.currentTarget.contains(document.activeElement) && document.activeElement.blur()
    else return
    e.preventDefault()
  }
  return (
    <div role="radiogroup" aria-label={etiqueta} className={`e3-opciones ${className}`} data-control=""
         onKeyDown={alTeclear}>
      {opciones.map((o) => (
        <button key={o.valor} type="button" role="radio" aria-checked={o.valor === valor}
                ref={(el) => { refs.current[o.valor] = el }}
                tabIndex={o.valor === valor ? 0 : -1} disabled={o.deshabilitada}
                className={o.valor === valor ? 'on' : ''} onClick={() => elegir(o.valor)}
                {...(escala ? { 'data-escala': '' } : {})}>
          {o.texto}
        </button>
      ))}
    </div>
  )
}

/**
 * Deslizante sobre un índice de 0 a n − 1. La posición es lineal en el índice (la grilla de la
 * tasa de éxito no es uniforme: la escala la dibuja quien lo usa). imanes: índices que atraen al
 * arrastrar y a los que saltan ↑ y ↓. ← y → mueven un paso; con Mayúsculas, diez.
 */
export function Deslizante({ n, valor, onCambio, imanes = [], etiqueta, textoValor, ancho, alto = 44,
                             children }) {
  const pista = useRef(null)
  const riel = useRef(null)
  const desdePuntero = (e) => {
    const r = riel.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(r.width, e.clientX - r.left))
    let i = Math.round((x / r.width) * (n - 1))
    // imán: a 12 px de pantalla de una marca, cae en la marca
    for (const m of imanes) if (Math.abs((m / (n - 1)) * r.width - x) <= 12) { i = m; break }
    onCambio(i)
  }
  const abajo = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    e.currentTarget.focus()
    desdePuntero(e)
  }
  const mueve = (e) => { if (e.buttons & 1) desdePuntero(e) }
  const alTeclear = (e) => {
    const orden = [...imanes].sort((a, b) => a - b)
    let i = null
    if (e.key === 'ArrowLeft') i = valor - (e.shiftKey ? 10 : 1)
    else if (e.key === 'ArrowRight') i = valor + (e.shiftKey ? 10 : 1)
    else if (e.key === 'ArrowUp') i = orden.find((m) => m > valor) ?? n - 1
    else if (e.key === 'ArrowDown') i = [...orden].reverse().find((m) => m < valor) ?? 0
    else if (e.key === 'Home') i = 0
    else if (e.key === 'End') i = n - 1
    else if (e.key === 'Escape') { e.currentTarget.blur(); e.preventDefault(); return }
    else return
    e.preventDefault()
    onCambio(Math.max(0, Math.min(n - 1, i)))
  }
  const x = (valor / (n - 1)) * ancho
  return (
    <div className="e3-desliz" style={{ width: ancho, height: alto }} data-control="">
      {children}
      <div ref={pista} className="e3-desliz-pista" role="slider" tabIndex={0} aria-label={etiqueta}
           aria-valuemin={0} aria-valuemax={n - 1} aria-valuenow={valor} aria-valuetext={textoValor}
           onPointerDown={abajo} onPointerMove={mueve} onKeyDown={alTeclear}>
        <div ref={riel} className="e3-desliz-riel" />
        <div className="e3-desliz-lleno" style={{ width: x }} />
        <div className="e3-desliz-perilla" style={{ left: x }} />
      </div>
    </div>
  )
}

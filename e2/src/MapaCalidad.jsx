// (29/09, pedido del usuario) Mapa de calidad: 13 archivos × 7 dimensiones, antes (Parte A 3.1) y
// después de las decisiones (Parte B 1.1). Datos en mapa.js. Tres usos: la vista 1b (los dos mapas
// lado a lado), la miniatura del encabezado de cada vista (después, con las celdas de la decisión de
// esa pantalla resaltadas) y el modal que abre la miniatura para ver esas celdas de cerca.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DIMS, MAPA } from './mapa.js'

// (29/09, cierre) Dos estados para el público: tratada o declarada. Ninguna celda queda pendiente.
const LETRA = {
  corregida: 'C', 'corregida en parte': 'C½', marcada: 'M', 'corte común': 'F', declarada: 'D',
}
const GRUPO = {
  corregida: 'tratada', 'corregida en parte': 'tratada', marcada: 'tratada', 'corte común': 'tratada',
  declarada: 'declarada',
}
const letraDespues = (c) => LETRA[c.despues]

/** Celdas del mapa que cierra alguna de las decisiones dadas. */
export function celdasDe(dcs) {
  const out = []
  if (!dcs?.length) return out
  MAPA.forEach((f) => f.celdas.forEach((c, j) => {
    if (dcs.includes(c.ref)) out.push({ archivo: f.archivo, dim: DIMS[j], ...c })
  }))
  return out
}

const CORTO = { Completitud: 'Compl.', Consistencia: 'Consist.', Exactitud: 'Exact.', Actualidad: 'Actual.', Validez: 'Validez', Unicidad: 'Unic.', Trazabilidad: 'Traz.' }

export function Mapa({ modo = 'despues', resaltar = [], mini = false, corto = false }) {
  const marcar = resaltar.length > 0
  // (29/09) La miniatura tiene la misma orientación que el mapa (13 archivos × 7 dimensiones), con
  // celdas anchas y bajas para que entre en el alto del encabezado sin empujar la vista.
  if (mini) {
    return (
      <div className="mapa mapa-mini" role="img" aria-label="Mapa de calidad después de las decisiones">
        {MAPA.map((f) => DIMS.map((d, j) => {
          const c = f.celdas[j]
          const on = marcar && resaltar.includes(c.ref)
          return <span key={d + f.archivo} className={`mapa-c ${c.despues ? GRUPO[c.despues] : 'ok'} ${marcar ? (on ? 'on' : 'off') : ''}`} />
        }))}
      </div>
    )
  }
  let orden = 0
  return (
    <div className={`mapa ${mini ? 'mapa-mini' : ''}`} role="img"
      aria-label={`Mapa de calidad ${modo === 'antes' ? 'antes' : 'después'} de las decisiones`}>
      {!mini && <span />}
      {!mini && DIMS.map((d) => <span key={d} className="mapa-dim" title={d}>{corto ? CORTO[d] : d}</span>)}
      {MAPA.map((f) => [
        !mini && <span key={f.archivo} className="mapa-arch">{f.archivo.replaceAll('_', ' ')}</span>,
        ...f.celdas.map((c, j) => {
          const on = marcar && resaltar.includes(c.ref)
          const clase = modo === 'antes'
            ? (c.antes === '✕' ? 'grave' : c.antes === '▲' ? 'aviso' : 'ok')
            : (c.despues ? GRUPO[c.despues] : 'ok')
          const texto = modo === 'antes' ? c.antes : (c.despues ? letraDespues(c) : '✓')
          const title = `${f.archivo} · ${DIMS[j]}: ${c.hallazgo || 'sin hallazgo'}` +
            (c.despues ? ` → ${c.despues}${c.ref && c.ref !== '—' ? ` (${c.ref})` : ''}` : '')
          return (
            <span key={f.archivo + j} title={title} style={on ? { '--i': Math.min(orden++, 12) } : undefined}
              className={`mapa-c ${clase} ${marcar ? (on ? 'on' : 'off') : ''}`}>
              {!mini && texto}
            </span>
          )
        }),
      ])}
    </div>
  )
}

// (29/09) Los conteos salen de MAPA. Desde el cierre del 29/09 no queda ninguna celda pendiente:
// las ocho que lo estaban quedaron declaradas (seis de trazabilidad, cuya corrección en origen es de
// Casa Óga, y las dos del calendario).
const CELDAS = MAPA.flatMap((f) => f.celdas)
const cuenta = (pred) => CELDAS.filter(pred).length
const N_ANTES = { ok: cuenta((c) => c.antes === '✓'), aviso: cuenta((c) => c.antes === '▲'), grave: cuenta((c) => c.antes === '✕') }
const N_DESPUES = {
  ok: cuenta((c) => !c.despues),
  tratada: cuenta((c) => GRUPO[c.despues] === 'tratada'),
  declarada: cuenta((c) => GRUPO[c.despues] === 'declarada'),
}

export function Leyenda({ modo }) {
  return modo === 'antes' ? (
    <p className="mapa-ley"><i className="mapa-c ok">✓</i> sin hallazgo ({N_ANTES.ok}) <i className="mapa-c aviso">▲</i> hallazgo ({N_ANTES.aviso}) <i className="mapa-c grave">✕</i> hallazgo grave ({N_ANTES.grave})</p>
  ) : (
    <p className="mapa-ley"><i className="mapa-c ok">✓</i> sin hallazgo ({N_DESPUES.ok}) <i className="mapa-c tratada">C</i> tratada: C corregida · C½ en parte · M marcada · F corte común ({N_DESPUES.tratada}) <i className="mapa-c declarada">D</i> declarada ({N_DESPUES.declarada})</p>
  )
}

/** (29/09, pedido del usuario) La caja del modal nace de la miniatura y vuelve a ella: se mide dónde
 *  está el botón y se anima la caja desde ese rectángulo (FLIP). El contenido aparece cuando la caja
 *  ya casi llegó, para que el escalado no deforme el texto a la vista; después se encienden, en
 *  cascada, las celdas de la decisión. Con movimiento reducido, solo un fundido corto. */
const LLEGA = 'cubic-bezier(0.16, 1, 0.3, 1)'
const SALE = 'cubic-bezier(0.4, 0, 1, 1)'
const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches

function desdeBoton(boton, caja) {
  const b = boton.getBoundingClientRect()
  const c = caja.getBoundingClientRect()
  const dx = b.left + b.width / 2 - (c.left + c.width / 2)
  const dy = b.top + b.height / 2 - (c.top + c.height / 2)
  return `translate(${dx}px, ${dy}px) scale(${b.width / c.width}, ${b.height / c.height})`
}

/** Miniatura del encabezado: abre un modal con los dos mapas y las celdas de la decisión. */
export function MapaMini({ dcs, etiqueta }) {
  // cerrado → abierto → cerrando → cerrado: el modal sigue montado mientras vuelve a la miniatura.
  const [estado, setEstado] = useState('cerrado')
  const boton = useRef(null)
  const fondo = useRef(null)
  const caja = useRef(null)
  const cerrarBtn = useRef(null)
  const celdas = celdasDe(dcs)

  useLayoutEffect(() => {
    if (estado !== 'abierto' || !caja.current?.animate) return
    cerrarBtn.current?.focus({ preventScroll: true })
    if (quieto()) {
      fondo.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 })
      return
    }
    fondo.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' })
    caja.current.animate(
      [{ transform: desdeBoton(boton.current, caja.current), borderRadius: '3px', boxShadow: '0 0 0 rgba(0,0,0,0)' },
        { transform: 'none', borderRadius: '4px', boxShadow: '0 10px 40px rgba(0, 0, 0, .25)' }],
      { duration: 460, easing: LLEGA },
    )
    caja.current.querySelectorAll(':scope > *').forEach((n) =>
      n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, delay: 170, easing: 'ease-out', fill: 'backwards' }))
    boton.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' })
  }, [estado])

  const cerrar = useCallback(() => {
    if (estado !== 'abierto') return
    setEstado('cerrando')
    // El reloj de respaldo cierra igual si la pestaña queda oculta a mitad de camino (ahí las
    // animaciones no avanzan y .finished no llega).
    let hecho = false
    const fin = () => {
      if (hecho) return
      hecho = true
      boton.current?.getAnimations().forEach((a) => a.cancel())
      setEstado('cerrado')
      boton.current?.focus({ preventScroll: true })
    }
    setTimeout(fin, 400)
    if (!caja.current?.animate) return fin()
    if (quieto()) {
      fondo.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' }).finished.then(fin, fin)
      return
    }
    caja.current.querySelectorAll(':scope > *').forEach((n) =>
      n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, fill: 'forwards' }))
    fondo.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-in', fill: 'forwards' })
    boton.current?.getAnimations().forEach((a) => a.cancel())
    boton.current?.animate([{ opacity: 0 }, { opacity: 0, offset: .75 }, { opacity: 1 }], { duration: 280 })
    caja.current.animate(
      [{ transform: 'none', opacity: 1 }, { transform: desdeBoton(boton.current, caja.current), opacity: .6 }],
      { duration: 280, easing: SALE, fill: 'forwards' },
    ).finished.then(fin, fin)
  }, [estado])

  useEffect(() => {
    if (estado === 'cerrado') return
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); cerrar() }
      // El foco queda dentro del modal: el único control es Cerrar.
      else if (e.key === 'Tab') { e.preventDefault(); cerrarBtn.current?.focus() }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [estado, cerrar])

  const nombre = dcs?.length > 2 ? `${dcs.length} decisiones` : dcs?.join(' y ')
  const titulo = dcs?.length
    ? (celdas.length ? `${nombre}: ${celdas.length} ${celdas.length === 1 ? 'celda' : 'celdas'} del mapa de calidad` : `${nombre} no cierra una celda del mapa`)
    : 'Mapa de calidad después de las decisiones'
  return (
    <>
      <button type="button" ref={boton} className="mapa-boton" onClick={() => setEstado('abierto')} title={`${titulo}. Clic para ampliar`}
        aria-haspopup="dialog" aria-expanded={estado === 'abierto'}>
        <Mapa modo="despues" resaltar={dcs ?? []} mini />
      </button>
      {estado !== 'cerrado' && (
        <div className={`mapa-modal ${estado}`} ref={fondo} role="dialog" aria-modal="true" aria-label={titulo} onClick={cerrar}>
          <div className="mapa-modal-caja" ref={caja} onClick={(e) => e.stopPropagation()}>
            <div className="mapa-modal-enc">
              <strong>{etiqueta ? `Vista ${etiqueta} · ` : ''}{titulo}</strong>
              <button type="button" ref={cerrarBtn} className="mapa-cerrar" onClick={cerrar} aria-label="Cerrar">×</button>
            </div>
            <div className="mapa-par">
              <div><p className="mapa-rot">Antes (Parte A, 3.1)</p><Mapa modo="antes" resaltar={dcs ?? []} corto /></div>
              <div><p className="mapa-rot">Después de las decisiones (Parte B, 1.1)</p><Mapa modo="despues" resaltar={dcs ?? []} corto /></div>
            </div>
            {celdas.length > 0 && celdas.length <= 6 && (
              <ul className="mapa-lista">
                {celdas.map((c) => (
                  <li key={c.archivo + c.dim}><b>{c.archivo.replaceAll('_', ' ')} · {c.dim}.</b> {c.hallazgo} → {c.despues}</li>
                ))}
              </ul>
            )}
            <Leyenda modo="despues" />
          </div>
        </div>
      )}
    </>
  )
}

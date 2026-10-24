// Presentación interactiva del Entregable 3 (27/10/2026). Las 12 diapositivas del PPTX, en el mismo
// orden y con el mismo texto (C3), más los anexos A1 a A6.
//
// (24/10) Escenario 16:9 de 1600 × 900 lógicos, escalado para entrar entero en la ventana: lo que
// sobra queda como banda color papel. Nada scrollea. La página va en la URL (#3, #a2): recargar no
// pierde el lugar y Atrás del navegador recorre. Navegación para cinco oradores con un control remoto
// (Avance y Retroceso de página) o el teclado; los atajos están en Ayuda.jsx.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ANEXOS, DIAPOSITIVAS, pagina } from './diapositivas/index.js'
import { Ayuda, ListaAnexos, Notas, VistaGeneral } from './Capas.jsx'

const W = 1600
const H = 900
const TOTAL = DIAPOSITIVAS.length
const ULTIMA = String(TOTAL)
const SIGUIENTE = new Set(['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'])
const ANTERIOR = new Set(['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'])
const INTERACTIVO = 'button, a, input, select, textarea, [role=slider], [role=radio], [role=button], [data-control]'

const idDeHash = () => {
  const id = decodeURIComponent(location.hash.slice(1)).toLowerCase()
  return pagina(id) ? id : '1'
}
// El origen de un anexo (la diapositiva a la que vuelve) va en history.state: sobrevive a recargar.
const origenGuardado = () => {
  try {
    const o = history.state?.origen
    return o && pagina(String(o))?.tipo === 'diapositiva' ? String(o) : null
  } catch {
    return null
  }
}

/** Escala del escenario para que entre entero en la zona, centrado. */
function useEscala(ref) {
  const [e, setE] = useState({ s: 0, x: 0, y: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    const medir = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      const s = Math.min(w / W, h / H)
      setE({ s, x: (w - W * s) / 2, y: (h - H * s) / 2 })
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return e
}

function pantallaCompleta() {
  try {
    if (document.fullscreenElement) document.exitFullscreen?.()?.catch?.(() => {})
    else document.documentElement.requestFullscreen?.()?.catch?.(() => {})
  } catch { /* sin pantalla completa (vista previa, iframe): no pasa nada */ }
}

export default function App() {
  const [pos, setPos] = useState(() => {
    const id = idDeHash()
    return { id, paso: pagina(id).pasos, dir: null, origen: origenGuardado() }
  })
  const [capa, setCapa] = useState(null)          // 'general' | 'anexos' | 'ayuda'
  const [notas, setNotas] = useState(false)
  const [buffer, setBuffer] = useState('')
  const zona = useRef(null)
  const esc = useEscala(zona)
  const pag = pagina(pos.id)

  // Ir a una página. Al llegar a un anexo se recuerda de qué diapositiva se vino; de un anexo a otro,
  // se conserva. Sin paso, la diapositiva se ve completa (al volver, desde la vista general o al saltar).
  const ir = useCallback((id, { paso, dir = 0 } = {}) => {
    const p = pagina(id)
    if (!p) return
    setPos((prev) => {
      const antes = pagina(prev.id)
      const origen = p.tipo !== 'anexo' ? null : antes.tipo === 'diapositiva' ? prev.id : prev.origen
      return { id, paso: paso ?? p.pasos, dir, origen }
    })
  }, [])
  const volver = useCallback(() => {
    setPos((prev) => {
      const id = prev.origen ?? ULTIMA
      return { id, paso: pagina(id).pasos, dir: -1, origen: null }
    })
  }, [])

  const siguiente = useCallback(() => {
    const p = pagina(pos.id)
    if (p.tipo === 'diapositiva') {
      if (pos.paso < p.pasos) setPos({ ...pos, paso: pos.paso + 1 })
      else if (p.n < TOTAL) ir(DIAPOSITIVAS[p.n].id, { paso: 1, dir: 1 })
      return
    }
    const k = ANEXOS.findIndex((a) => a.id === p.id)
    if (k < ANEXOS.length - 1) ir(ANEXOS[k + 1].id, { dir: 1 })
    else volver()
  }, [pos, ir, volver])
  const anterior = useCallback(() => {
    const p = pagina(pos.id)
    if (p.tipo === 'anexo') return volver()
    if (pos.paso > 1) setPos({ ...pos, paso: pos.paso - 1 })
    else if (p.n > 1) ir(DIAPOSITIVAS[p.n - 2].id, { dir: -1 })
  }, [pos, ir, volver])

  // URL y título. La primera vez reemplaza la entrada del historial; después cada página agrega una.
  const primera = useRef(true)
  useEffect(() => {
    const h = '#' + pos.id
    const estado = { origen: pos.origen }
    try {
      if (primera.current || location.hash.toLowerCase() === h) history.replaceState(estado, '', h)
      else history.pushState(estado, '', h)
    } catch {
      if (location.hash.toLowerCase() !== h) location.hash = h
    }
    primera.current = false
    const p = pagina(pos.id)
    document.title = (p.tipo === 'anexo' ? `Anexo ${p.a.n}` : `${p.n} / ${TOTAL}`) + ' · Casa Óga · Entregable 3'
  }, [pos.id, pos.origen])
  useEffect(() => {
    const alVolver = () => {
      const id = idDeHash()
      setPos({ id, paso: pagina(id).pasos, dir: 0, origen: origenGuardado() })
    }
    window.addEventListener('popstate', alVolver)
    return () => window.removeEventListener('popstate', alVolver)
  }, [])

  // Número y Enter: salta a esa diapositiva. El número tipeado se borra solo a los 2,5 s.
  useEffect(() => {
    if (!buffer) return
    const t = setTimeout(() => setBuffer(''), 2500)
    return () => clearTimeout(t)
  }, [buffer])

  // Teclado. Las capas (vista general, anexos) atienden sus propias teclas; un control con foco atiende
  // las flechas y llama preventDefault. Las teclas con Cmd, Ctrl o Alt no se capturan.
  const teclas = useRef(null)
  teclas.current = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return
    const k = e.key
    if (capa === 'ayuda') {
      if (k === 'Escape' || k === '?') { e.preventDefault(); setCapa(null) }
      return
    }
    if (capa) return
    const t = e.target instanceof Element ? e.target : null
    const enControl = t?.closest('[data-control]')
    const enBoton = t?.closest('button, a')          // los que el navegador activa con Espacio o Enter
    if (k === 'Escape') {
      e.preventDefault()
      if (buffer) return setBuffer('')
      if (enControl || enBoton) return t.blur()
      return setCapa('general')
    }
    if (/^[0-9]$/.test(k)) { e.preventDefault(); return setBuffer((b) => (b + k).slice(-2)) }
    if (buffer && k === 'Enter') {
      e.preventDefault()
      const n = Number(buffer)
      setBuffer('')
      if (n >= 1 && n <= TOTAL) ir(String(n), { dir: 0 })
      return
    }
    if (buffer && k === 'Backspace') { e.preventDefault(); return setBuffer((b) => b.slice(0, -1)) }
    if ((k === ' ' || k === 'Enter') && enBoton) return        // activa el botón con foco
    if (SIGUIENTE.has(k)) { e.preventDefault(); return siguiente() }
    if (ANTERIOR.has(k)) { e.preventDefault(); return anterior() }
    if (k === 'Home') { e.preventDefault(); return ir('1', { dir: -1 }) }
    if (k === 'End') { e.preventDefault(); return ir(ULTIMA, { dir: 1 }) }
    const l = k.toLowerCase()
    if (l === 'f') { e.preventDefault(); return pantallaCompleta() }
    if (l === 'n') { e.preventDefault(); return setNotas((v) => !v) }
    if (l === 'o') { e.preventDefault(); return setCapa('general') }
    if (l === 'a') { e.preventDefault(); return setCapa('anexos') }
    if (k === '?') { e.preventDefault(); return setCapa('ayuda') }
  }
  useEffect(() => {
    const h = (e) => teclas.current(e)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  // Un botón tocado con el mouse suelta el foco: así las teclas del control remoto siguen pasando de
  // diapositiva. Los botones de opción y el deslizante lo conservan (las flechas los mueven).
  useEffect(() => {
    const h = (e) => {
      if (e.detail === 0) return
      const b = e.target instanceof Element ? e.target.closest('button:not([role=radio]), a') : null
      if (b && !b.closest('.e3-capa')) b.blur()
    }
    window.addEventListener('click', h)
    return () => window.removeEventListener('click', h)
  }, [])

  // Clic en la franja izquierda o derecha del escenario: retrocede o avanza. Nunca sobre un control.
  const alClic = (e) => {
    if (capa || (e.target instanceof Element && e.target.closest(INTERACTIVO))) return
    if (window.getSelection?.().toString()) return
    const r = e.currentTarget.getBoundingClientRect()
    const f = (e.clientX - r.left) / r.width
    if (f < 0.3) anterior()
    else if (f > 0.7) siguiente()
  }

  const irDesdeCapa = (id) => { setCapa(null); ir(id, { dir: 0 }) }
  const Comp = pag.Componente
  const animacion = pos.dir == null ? '' : pos.dir > 0 ? 'adelante' : pos.dir < 0 ? 'atras' : 'salto'
  return (
    <div className={`e3-app ${notas ? 'con-notas' : ''}`}>
      <main className="e3-zona" ref={zona}>
        <div className="e3-escenario" onClick={alClic}
             style={{ transform: `translate(${esc.x}px, ${esc.y}px) scale(${esc.s})`, visibility: esc.s ? 'visible' : 'hidden' }}>
          <div key={pos.id} className={`e3-pagina ${animacion}`}>
            <Comp d={pag.d} a={pag.a} paso={pos.paso} ir={(id) => ir(id, { dir: 1 })}
                  origen={pos.origen ?? ULTIMA} volver={volver} />
          </div>
        </div>
        {buffer && <div className="e3-buffer" role="status">Ir a la diapositiva <b>{buffer}</b> · Enter</div>}
      </main>
      {notas && <Notas pag={pag} paso={pos.paso} />}
      {capa === 'general' && <VistaGeneral actual={pos.id} onIr={irDesdeCapa} onCerrar={() => setCapa(null)} />}
      {capa === 'anexos' && (
        <ListaAnexos actual={pos.id} origen={pag.tipo === 'anexo' ? pos.origen ?? ULTIMA : null}
                     onIr={irDesdeCapa} onVolver={() => { setCapa(null); volver() }} onCerrar={() => setCapa(null)} />
      )}
      {capa === 'ayuda' && <Ayuda onCerrar={() => setCapa(null)} />}
    </div>
  )
}

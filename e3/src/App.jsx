// Presentación interactiva del Entregable 3 (27/10/2026). Las 12 diapositivas del PPTX, en el mismo
// orden y con el mismo texto (C3), más los anexos A1 a A6.
//
// (24/10) Escenario 16:9 de 1600 × 900 lógicos, escalado para entrar entero en la ventana: lo que
// sobra queda como banda color papel. Nada scrollea. La página va en la URL (#3, #a2): recargar no
// pierde el lugar y Atrás del navegador recorre. Navegación para cinco oradores con un control remoto
// (Avance y Retroceso de página, F5, Esc, «.») o el teclado; los atajos están en Capas.jsx (Ayuda).
// Dos ventanas abiertas en la misma presentación se siguen (BroadcastChannel): una en el proyector y
// otra con las notas (N) en la laptop.

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
const CANAL = 'casa-oga-e3'

// (24/10) Un hash con un escape mal formado (#%) hace fallar decodeURIComponent: va a la portada.
const idDeHash = () => {
  let id
  try {
    id = decodeURIComponent(location.hash.slice(1)).toLowerCase()
  } catch {
    return '1'
  }
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
  const [negro, setNegro] = useState(false)       // pantalla en negro («.» o B, como PowerPoint)
  const [buffer, setBuffer] = useState('')
  const [pista, setPista] = useState(() => pos.id === '1')
  const zona = useRef(null)
  const esc = useEscala(zona)
  const pag = pagina(pos.id)
  const posRef = useRef(pos)
  posRef.current = pos

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
  // (24/10) ← deshace un paso solo si a la diapositiva se llegó con → (pos.dir > 0) y los pasos se
  // fueron mostrando. Llegada hacia atrás, por salto o por la URL: ← pasa a la anterior, como en un PDF.
  const anterior = useCallback(() => {
    const p = pagina(pos.id)
    if (p.tipo === 'anexo') return volver()
    if (pos.paso > 1 && pos.dir > 0) setPos({ ...pos, paso: pos.paso - 1 })
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
      const origen = origenGuardado()
      // (24/10) Un hash inválido (#0, #a7, #%) lleva a la portada; si la portada ya estaba, el efecto de
      // la URL no vuelve a correr y la barra quedaría con el hash inválido: se corrige acá.
      if (location.hash.toLowerCase() !== '#' + id) {
        try { history.replaceState({ origen }, '', '#' + id) } catch { /* sin historial */ }
      }
      setPos({ id, paso: pagina(id).pasos, dir: 0, origen })
    }
    window.addEventListener('popstate', alVolver)
    return () => window.removeEventListener('popstate', alVolver)
  }, [])

  // Dos ventanas, una sola presentación. La que se abre pide la posición a las que ya están y la sigue;
  // después, cada cambio local se publica y las demás lo siguen. Lo que llega no se vuelve a publicar.
  const canal = useRef(null)
  const recibido = useRef(null)
  useEffect(() => {
    let c
    try { c = new BroadcastChannel(CANAL) } catch { return undefined }
    canal.current = c
    c.onmessage = (m) => {
      const d = m.data || {}
      const p = posRef.current
      if (d.tipo === 'pide') return c.postMessage({ tipo: 'pos', id: p.id, paso: p.paso, dir: p.dir, origen: p.origen })
      if (d.tipo !== 'pos' || !pagina(d.id)) return
      if (p.id === d.id && p.paso === d.paso) return
      recibido.current = `${d.id}:${d.paso}`
      // dir viaja con la posición: ← en la otra ventana deshace el paso igual que en esta
      setPos({ id: d.id, paso: d.paso, dir: d.dir ?? 0, origen: d.origen ?? null })
    }
    c.postMessage({ tipo: 'pide' })
    return () => { c.close(); canal.current = null }
  }, [])
  const publicada = useRef(false)
  useEffect(() => {
    const clave = `${pos.id}:${pos.paso}`
    if (!publicada.current) { publicada.current = true; return }   // al abrir, no mueve a las otras
    if (recibido.current === clave) { recibido.current = null; return }
    recibido.current = null
    try { canal.current?.postMessage({ tipo: 'pos', id: pos.id, paso: pos.paso, dir: pos.dir, origen: pos.origen }) } catch { /* cerrado */ }
  }, [pos.id, pos.paso, pos.origen])

  // Número y Enter: salta a esa diapositiva. El número tipeado dura 8 s, o hasta otra tecla de navegación.
  useEffect(() => {
    if (!buffer) return undefined
    const t = setTimeout(() => setBuffer(''), 8000)
    return () => clearTimeout(t)
  }, [buffer])

  // La pista de atajos de la portada: se apaga a los 4 s o con la primera tecla o clic.
  useEffect(() => {
    if (!pista) return undefined
    const t = setTimeout(() => setPista(false), 4000)
    return () => clearTimeout(t)
  }, [pista])

  // Teclado. Las capas (vista general, anexos) atienden sus propias teclas; un control con foco atiende
  // las flechas y llama preventDefault. Las teclas con Cmd, Ctrl o Alt no se capturan; una tecla
  // mantenida apretada (repeat) no recorre la presentación.
  const teclas = useRef(null)
  teclas.current = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return
    if (pista) setPista(false)
    if (e.repeat) return
    const k = e.key
    if (negro) {                                   // cualquier tecla vuelve de la pantalla en negro
      if (!['Shift', 'Control', 'Alt', 'Meta'].includes(k)) { e.preventDefault(); setNegro(false) }
      return
    }
    if (k === 'F5') { e.preventDefault(); return pantallaCompleta() }   // el botón del control remoto
    if (capa === 'ayuda') {
      if (k === 'Escape' || k === '?') { e.preventDefault(); setCapa(null) }
      return
    }
    if (capa) return
    const t = e.target instanceof Element ? e.target : null
    const enControl = t?.closest('[data-control]')
    const enBoton = t?.closest('button, a')          // los que el navegador activa con Espacio o Enter
    if (k === 'Escape') {
      // (24/10) Esc ya no abre la vista general: el botón de los controles remotos que manda F5 manda
      // Esc la vez siguiente, y en el aula la grilla de miniaturas no tiene que aparecer por reflejo.
      e.preventDefault()
      if (buffer) return setBuffer('')
      if (enControl || enBoton) t.blur()
      return
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
    if (buffer) setBuffer('')
    if (SIGUIENTE.has(k)) { e.preventDefault(); return siguiente() }
    if (ANTERIOR.has(k)) { e.preventDefault(); return anterior() }
    if (k === 'Home') { e.preventDefault(); return ir('1', { dir: -1 }) }
    if (k === 'End') { e.preventDefault(); return ir(ULTIMA, { dir: 1 }) }
    const l = k.toLowerCase()
    if (l === 'f') { e.preventDefault(); return pantallaCompleta() }
    if (l === 'n') { e.preventDefault(); return setNotas((v) => !v) }
    if (l === 'o') { e.preventDefault(); return setCapa('general') }
    if (l === 'a') { e.preventDefault(); return setCapa('anexos') }
    if (l === 'b' || k === '.') { e.preventDefault(); return setNegro(true) }
    if (k === '?') { e.preventDefault(); return setCapa('ayuda') }
  }
  useEffect(() => {
    const h = (e) => teclas.current(e)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  // (24/10) Un control tocado con el mouse suelta el foco, también los botones de opción: así →, ←,
  // Espacio y Enter siguen pasando de diapositiva. Con el teclado (Tab) el foco queda y las flechas
  // mueven el control. El deslizante lo suelta al levantar el puntero (controles.jsx).
  useEffect(() => {
    const h = (e) => {
      if (pista) setPista(false)
      if (e.detail === 0) return
      const b = e.target instanceof Element ? e.target.closest('button, a') : null
      if (b && !b.closest('.e3-capa')) b.blur()
    }
    window.addEventListener('click', h)
    return () => window.removeEventListener('click', h)
  }, [pista])

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
                  origen={pos.origen} volver={volver} />
          </div>
        </div>
        {buffer && <div className="e3-buffer" role="status">Ir a la diapositiva <b>{buffer}</b> · Enter</div>}
        {pista && pos.id === '1' && (
          <p className="e3-pista" role="note">→ siguiente · O vista general · A anexos · ? atajos</p>
        )}
      </main>
      {notas && <Notas pag={pag} paso={pos.paso} />}
      {capa === 'general' && <VistaGeneral actual={pos.id} onIr={irDesdeCapa} onCerrar={() => setCapa(null)} />}
      {capa === 'anexos' && (
        <ListaAnexos actual={pos.id} origen={pag.tipo === 'anexo' ? pos.origen : null} enAnexo={pag.tipo === 'anexo'}
                     onIr={irDesdeCapa} onVolver={() => { setCapa(null); volver() }} onCerrar={() => setCapa(null)} />
      )}
      {capa === 'ayuda' && <Ayuda onCerrar={() => setCapa(null)} />}
      {negro && <div className="e3-negro" role="presentation" onClick={() => setNegro(false)} />}
    </div>
  )
}

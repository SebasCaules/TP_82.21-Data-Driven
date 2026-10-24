// Capas fuera del escenario: notas del orador (N), vista general (O), lista de anexos (A) y ayuda de
// atajos (?). Van en píxeles reales, no escalados: son para quien presenta.

import { memo, useEffect, useRef, useState } from 'react'
import { C3 } from './contenido_e3.js'
import { ANEXOS, DIAPOSITIVAS, PAGINAS, tramosDelGuion } from './diapositivas/index.js'
import { mmss } from './formato.js'
import { Rico } from './texto.jsx'

const TOTAL = DIAPOSITIVAS.length
const lista = (ns) => (ns.length > 1 ? `${ns[0]} a ${ns[ns.length - 1]}` : String(ns[0]))

/** Notas del orador: el guion de C3, quién lo dice, su tiempo y el turno. Debajo del escenario, que se
 *  achica para dejarles lugar: nunca tapan el título. */
export function Notas({ pag, paso }) {
  if (pag.tipo === 'anexo') {
    return (
      <aside className="e3-notas" aria-label="Notas del orador">
        <p className="e3-notas-cab"><b>Anexo {pag.a.n}</b> · respaldo para preguntas</p>
        <p className="e3-notas-txt">Se muestra solo si preguntan. Fuente: {pag.a.fuente}.</p>
        <p className="e3-notas-ayuda">← vuelve a la diapositiva · → pasa al anexo siguiente</p>
      </aside>
    )
  }
  const d = pag.d
  const turno = C3.TIEMPOS.turnos.find((t) => t.diapositivas.includes(d.n))
  const tramos = tramosDelGuion(d.n, d.guion)
  return (
    <aside className="e3-notas" aria-label="Notas del orador">
      <p className="e3-notas-cab">
        <b>{d.quien}</b> · {d.n} / {TOTAL} · {mmss(d.segundos)}
        {turno && <span> · turno: diapositivas {lista(turno.diapositivas)}, {mmss(turno.segundos)}</span>}
        <span> · total {mmss(C3.TIEMPOS.total_s)}</span>
      </p>
      <div className="e3-notas-txt">
        {tramos.map((t, k) => (
          <p key={k} className={t.paso != null && t.paso === paso ? 'actual' : ''}>
            {t.paso != null && <span className="e3-notas-paso">paso {t.paso}</span>}
            <Rico t={t.texto} />
          </p>
        ))}
      </div>
    </aside>
  )
}

/** Miniatura de una página: el mismo componente, completo y sin interacción, escalado. */
const Miniatura = memo(function Miniatura({ p, k }) {
  const C = p.Componente
  return (
    <div className="e3-mini-escenario" style={{ transform: `scale(${k})` }} inert>
      <C d={p.d} a={p.a} paso={p.pasos} estatico origen="" volver={() => {}} />
    </div>
  )
})

function useVentana() {
  const [v, setV] = useState({ w: innerWidth, h: innerHeight })
  useEffect(() => {
    const h = () => setV({ w: innerWidth, h: innerHeight })
    addEventListener('resize', h)
    return () => removeEventListener('resize', h)
  }, [])
  return v
}

/** Vista general: las 12 diapositivas y los 6 anexos en miniatura. Clic, o flechas y Enter, para ir. */
export function VistaGeneral({ actual, onIr, onCerrar }) {
  const caja = useRef(null)
  const [sel, setSel] = useState(Math.max(0, PAGINAS.findIndex((p) => p.id === actual)))
  const v = useVentana()
  const cols = 6
  const tw = Math.floor(Math.min((v.w - 64 - (cols - 1) * 14) / cols, ((v.h - 120) / 3 - 30) * (16 / 9)))
  const k = tw / 1600
  useEffect(() => { caja.current?.focus() }, [])
  useEffect(() => { caja.current?.querySelector('.e3-mini.sel')?.scrollIntoView?.({ block: 'nearest' }) }, [sel])
  const alTeclear = (e) => {
    const mov = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }
    if (e.key in mov) setSel((s) => Math.max(0, Math.min(PAGINAS.length - 1, s + mov[e.key])))
    else if (e.key === 'Enter' || e.key === ' ') onIr(PAGINAS[sel].id)
    else if (e.key === 'Escape' || e.key.toLowerCase() === 'o') onCerrar()
    else if (e.key === 'Home') setSel(0)
    else if (e.key === 'End') setSel(PAGINAS.length - 1)
    else return
    e.preventDefault()
  }
  const grupo = (ps, desde) => ps.map((p, j) => (
    // (24/10) div y no button: la miniatura contiene los botones de la diapositiva (inertes), y un
    // botón no puede contener otro. Flechas y Enter los atiende la capa.
    <div key={p.id} role="button" className={`e3-mini ${desde + j === sel ? 'sel' : ''} ${p.id === actual ? 'actual' : ''}`}
         aria-label={p.tipo === 'anexo' ? `Anexo ${p.a.n}` : `Diapositiva ${p.n}`}
         style={{ width: tw }} onClick={() => onIr(p.id)}>
      <span className="e3-mini-marco" style={{ width: tw, height: (tw * 9) / 16 }}>
        <Miniatura p={p} k={k} />
      </span>
      <span className="e3-mini-rot">
        {p.tipo === 'anexo' ? <><b>{p.a.n}</b> {p.a.titulo}</> : <><b>{p.n}</b> {p.d.quien}</>}
      </span>
    </div>
  ))
  return (
    <div className="e3-capa e3-general" role="dialog" aria-label="Vista general" tabIndex={-1} ref={caja} onKeyDown={alTeclear}>
      <p className="e3-capa-cab"><b>Vista general</b> · flechas y Enter para ir · Esc para cerrar</p>
      <div className="e3-general-grilla" style={{ gridTemplateColumns: `repeat(${cols}, ${tw}px)` }}>
        {grupo(DIAPOSITIVAS, 0)}
        {grupo(ANEXOS, DIAPOSITIVAS.length)}
      </div>
    </div>
  )
}

/** Lista de anexos: A1 a A6 con su título; desde un anexo, también la vuelta a la diapositiva (la de
 *  origen, o la última si el anexo se abrió directo por la URL). */
export function ListaAnexos({ actual, origen, enAnexo, onIr, onVolver, onCerrar }) {
  const caja = useRef(null)
  const items = [...(enAnexo ? [{ id: 'volver' }] : []), ...ANEXOS]
  const [sel, setSel] = useState(Math.max(0, items.findIndex((x) => x.id === actual)))
  useEffect(() => { caja.current?.focus() }, [])
  const elegir = (x) => (x.id === 'volver' ? onVolver() : onIr(x.id))
  const alTeclear = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') setSel((s) => Math.min(items.length - 1, s + 1))
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') setSel((s) => Math.max(0, s - 1))
    else if (e.key === 'Enter' || e.key === ' ') elegir(items[sel])
    else if (/^[1-9]$/.test(e.key) && ANEXOS[Number(e.key) - 1]) onIr(ANEXOS[Number(e.key) - 1].id)
    else if (e.key === 'Escape' || e.key.toLowerCase() === 'a') onCerrar()
    else return
    e.preventDefault()
  }
  return (
    <div className="e3-capa e3-capa-velo" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="e3-anexos" role="dialog" aria-label="Anexos" tabIndex={-1} ref={caja} onKeyDown={alTeclear}>
        <p className="e3-capa-cab"><b>Anexos</b> · respaldo para preguntas · número o Enter para abrir</p>
        <ul>
          {items.map((x, j) => (
            <li key={x.id}>
              <button type="button" className={`${j === sel ? 'sel' : ''} ${x.id === actual ? 'actual' : ''}`}
                      onClick={() => elegir(x)}>
                {x.id === 'volver'
                  ? (origen ? <>← Volver a la diapositiva {origen}</> : <>← Ir a la diapositiva {TOTAL}</>)
                  : <><b>{x.a.n}</b><span>{x.a.titulo}</span></>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const ATAJOS = [
  ['→  ↓  Espacio  Av Pág  Enter', 'siguiente (en la 3 y la 6, el paso que sigue)'],
  ['←  ↑  Re Pág  Retroceso', 'anterior; en un anexo, vuelve a la diapositiva'],
  ['Inicio  ·  Fin', 'primera  ·  última'],
  ['número y Enter', 'ir a esa diapositiva'],
  ['clic a la izquierda o a la derecha', 'anterior  ·  siguiente'],
  ['O', 'vista general'],
  ['A', 'anexos'],
  ['F  ·  F5', 'pantalla completa (F5 es el botón del control remoto)'],
  ['.  ·  B', 'pantalla en negro; cualquier tecla vuelve'],
  ['Esc', 'cierra lo abierto; nunca cambia la diapositiva'],
  ['N', 'notas, para ensayar. En el aula: otra ventana con la misma dirección y N, en la laptop; las dos ventanas se siguen'],
  ['Tab hasta un control', 'flechas lo mueven; ↑ ↓ saltan entre marcas; Esc lo suelta. Con el mouse, → sigue pasando de diapositiva'],
]

export function Ayuda({ onCerrar }) {
  return (
    <div className="e3-capa e3-ayuda" role="dialog" aria-label="Atajos de teclado">
      <p className="e3-capa-cab"><b>Atajos</b> · Esc para cerrar</p>
      <dl>
        {ATAJOS.map(([t, q]) => <div key={t}><dt>{t}</dt><dd>{q}</dd></div>)}
      </dl>
      <button type="button" className="e3-ayuda-cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>
    </div>
  )
}

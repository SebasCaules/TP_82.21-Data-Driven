// Armazón del tablero E2. Mismo patrón que src/App.jsx del E1 (riel lateral + .cuerpo +
// flujo de impresión), sin barra de controles: esta SPA no tiene corte móvil ni filtros —
// cada vista compara "antes" y "después" de las decisiones DC sobre el mismo corte fijo
// (CORTE_REF, 2025-12-31) — así que no hay controles que apagar con leyenda (Nielsen H1):
// directamente no existen.

import { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { VISTAS } from './vistas/index.jsx'
import { D2 } from './datos_e2.js'
import { fechaCorta } from './formato.js'
import MarcaInicio from '../../src/MarcaInicio.jsx'
import { ImpresionCtx } from './escala.js'

export default function App() {
  const [indice, setIndice] = useState(0)
  const [imprimiendo, setImprimiendo] = useState(false)

  const vista = VISTAS[indice]

  const irA = useCallback((i) => {
    setIndice(Math.max(0, Math.min(VISTAS.length - 1, i)))
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
        <p className="solo-lector" aria-live="polite">{`Vista ${indice + 1} de ${VISTAS.length}: ${vista.titulo}`}</p>
        <Encabezado indice={indice} vista={vista} />

        <main className="cuerpo">
          {/* irA: V01 lleva a cada vista desde su tabla (24/09). En la hoja impresa no va. */}
          {imprimiendo ? <Impresion /> : <vista.Componente irA={irA} />}
        </main>
      </div>
    </div>
  )
}

/** Sin barra de filtros ni corte: qué vista es y qué pregunta responde, y el corte fijo con
 *  el que trabaja toda la SPA. Ver CONTRACT_E2.md §0: cada vista muestra "antes" y "después"
 *  sobre el mismo corte, no un corte que se elige. (24/09) Antes repetía la marca del riel. */
function Encabezado({ indice, vista }) {
  return (
    <header className="e2-enc">
      <span className="e2-enc-preg">
        <b>{`Vista ${indice + 1} de ${VISTAS.length}`}</b>{vista.pregunta ? ` · ${vista.pregunta}` : ''}
      </span>
      <span className="e2-enc-corte">{`corte ${fechaCorta(D2.meta.corte_ref)} · datos de ${D2.meta.archivos.length} archivos`}</span>
    </header>
  )
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
        {VISTAS.map((v, i) => (
          <li key={v.id}>
            <button type="button" onClick={() => irA(i)}
                    className={`lat-item${i === indice ? ' on' : ''}`}
                    aria-current={i === indice ? 'page' : undefined}>
              <span className="lat-n tabular">{String(i + 1).padStart(2, '0')}</span>
              <span className="lat-txt">{v.corto}</span>
            </button>
          </li>
        ))}
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
            <v.Componente />
          </div>
        ))}
      </div>
    </ImpresionCtx.Provider>
  )
}

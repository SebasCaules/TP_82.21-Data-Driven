// Armazón del tablero.
//
// Estructura: barra lateral con las 14 vistas numeradas y UNA barra de controles arriba,
// filtros a la izquierda y mes de corte a la derecha, todo en el mismo renglón.
//
// Sin pie de pantalla. Las dos líneas de advertencias corrían idénticas en las 14 vistas y
// eran ruido: lo que no se puede inferir se dice en la bajada de la pantalla que lo necesita,
// y las cuatro correcciones obligatorias de la cátedra viajan en la hoja impresa, que es el
// entregable. En pantalla, el dato que las resume ("exposición, no recupero") va pegado al
// número, no a 600 px de distancia.
//
// Lo que la verificación dejó fijo y no cambia al cambiar de piel: el corte y los filtros se
// apagan donde no aplican (Nielsen H1), el drill-down salta a la lista con el filtro puesto
// (Parte D §4.1) e imprimir da las 14 hojas.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { SIN_FILTRO, corteInfo, cortes, hayFiltro, meta, mesCorte } from './agregacion.js'
import Filtros, { DIMENSIONES, etiquetaValor } from './Filtros.jsx'
import LineaTiempo from './LineaTiempo.jsx'
import { GRUPOS, PANTALLAS } from './pantallas/index.jsx'

const CORTE_INICIAL = cortes.length - 1
const INDICE_LISTA = PANTALLAS.findIndex((p) => p.id === 'M1')

export default function App() {
  const [indice, setIndice] = useState(0)
  const [iCorte, setICorte] = useState(CORTE_INICIAL)
  const [filtro, setFiltro] = useState(SIN_FILTRO)
  const [imprimiendo, setImprimiendo] = useState(false)
  // De dónde vino el drill-down. Sin esto el lector que hizo clic en una barra queda en la
  // lista de Marketing y tiene que rastrear en la lateral la vista que estaba mirando.
  const [origen, setOrigen] = useState(null)

  const pantalla = PANTALLAS[indice]
  const info = useMemo(() => corteInfo(iCorte, filtro), [iCorte, filtro])
  const usaCorte = pantalla.depende !== 'ninguno'
  const usaFiltros = pantalla.depende === 'todo'

  const irA = useCallback((i) => {
    // Navegar a mano cancela la vuelta: el origen deja de ser el lugar del que se salió.
    setOrigen(null)
    setIndice(Math.max(0, Math.min(PANTALLAS.length - 1, i)))
  }, [])

  /** Drill-down: fija el valor como filtro y salta a la lista (Parte D §4.1). */
  const verEnLista = useCallback((dim, idx) => {
    setOrigen({ indice, filtro })
    setFiltro((f) => ({ ...f, [dim]: idx }))
    setIndice(INDICE_LISTA)
  }, [indice, filtro])

  /** Deshace el drill-down entero: filtro y vista vuelven a como estaban antes del clic. */
  const volverAlOrigen = useCallback(() => {
    if (!origen) return
    setFiltro(origen.filtro)
    setIndice(origen.indice)
    setOrigen(null)
  }, [origen])

  const imprimirTodo = useCallback(() => {
    // Los dos rAF existen para que el flujo de 14 hojas esté montado y medido antes del
    // diálogo. En una pestaña oculta rAF no dispara: quedaría el flujo montado y el diálogo
    // saltaría de sorpresa al volver. Con la pestaña oculta no se imprime.
    if (document.visibilityState === 'hidden') return
    setImprimiendo(true)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.print()
      setImprimiendo(false)
    }))
  }, [])

  // Imprimir desde el menú del navegador tiene que dar las 14 hojas, no la vista activa.
  useEffect(() => {
    const antes = () => setImprimiendo(true)
    const despues = () => setImprimiendo(false)
    window.addEventListener('beforeprint', antes)
    window.addEventListener('afterprint', despues)
    return () => {
      window.removeEventListener('beforeprint', antes)
      window.removeEventListener('afterprint', despues)
    }
  }, [])

  const modificado = iCorte !== CORTE_INICIAL || hayFiltro(filtro)
  const reiniciar = useCallback(() => { setICorte(CORTE_INICIAL); setFiltro(SIN_FILTRO) }, [])

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      // Dentro de un control mandan las teclas nativas: el select de filtros y el slider
      // del timeline consumen flechas.
      if (t.tagName === 'SELECT' || t.tagName === 'INPUT' || t.isContentEditable) return
      if (t.getAttribute && t.getAttribute('role') === 'slider') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      // 2.1.4 pide que un atajo de una sola letra se pueda apagar, remapear, o que actúe solo
      // cuando el componente tiene el foco. Vale la tercera: 'f' e 'i' andan con el foco suelto
      // y no dentro de un control, así que tipear en un chip de filtro ya no abre la impresión.
      const suelto = t === document.body || t === document.documentElement
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { irA(indice + 1); e.preventDefault() }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { irA(indice - 1); e.preventDefault() }
      else if (e.key === 'Home') { irA(0); e.preventDefault() }
      else if (e.key === 'End') { irA(PANTALLAS.length - 1); e.preventDefault() }
      else if ((e.key === 'f' || e.key === 'F') && suelto) {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen?.()
      } else if ((e.key === 'i' || e.key === 'I') && suelto) imprimirTodo()
      else if (e.key === 'Escape' && modificado) reiniciar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [indice, modificado, irA, reiniciar, imprimirTodo])

  const irALista = useCallback(() => setIndice(INDICE_LISTA), [])
  const ctx = {
    info, filtro, setFiltro, iCorte, irA, irALista, verEnLista, usaFiltros,
    volverAlOrigen: origen ? volverAlOrigen : null,
    origenCorto: origen ? PANTALLAS[origen.indice].corto : null,
  }

  return (
    <div className="app">
      <div className="chico">
        <h1>Este tablero necesita una pantalla más grande</h1>
        <p>
          Está diseñado para resolverse <b>sin scroll</b> en proyector y en laptop, de
          1152&nbsp;×&nbsp;640 a 1920&nbsp;×&nbsp;1080. Agrandá la ventana o abrilo en una
          pantalla más grande.
        </p>
      </div>

      <Lateral indice={indice} irA={irA} />

      <div className="principal">
        <div className="barra">
          <Filtros filtro={filtro} setFiltro={setFiltro} activos={usaFiltros}
                   reiniciar={reiniciar} modificado={modificado} ejeExento={pantalla.eje} />
          <div className={`barra-corte${usaCorte ? '' : ' apagada'}`}>
            <LineaTiempo iCorte={iCorte} setICorte={setICorte} activo={usaCorte} />
          </div>
        </div>

        <main className="cuerpo">
          {imprimiendo
            ? <Impresion ctx={ctx} info={info} filtro={filtro} />
            : <pantalla.Componente {...ctx} />}
        </main>
      </div>
    </div>
  )
}

/** La marca: el favicon 4b del mockup de direcciones ("la casa que se apaga"). No vive en
    `Iconos.jsx` porque ese set es monolínea en currentColor y solo para filtros; esta es una
    forma plana de cuatro colores. Va sin el rect de fondo del favicon (papel #eceae5): en la
    pestaña ese fondo da contraste, sobre la lateral #f2f1ee se vería como una baldosa. */
const Marca = () => (
  <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M16 1.5 L31 13 L31 30.5 L1 30.5 L1 13 Z" fill="var(--ink)" />
    <rect x="6" y="17" width="5" height="9" fill="var(--azul1)" />
    <rect x="13.5" y="20" width="5" height="6" fill="var(--azul3)" />
    <rect x="21" y="23.5" width="5" height="2.5" fill="var(--terra)" />
  </svg>
)

/** Las 14 vistas numeradas. Los grupos separan con un rótulo, no con un conmutador. */
function Lateral({ indice, irA }) {
  return (
    <nav className="lat" aria-label="Vistas del tablero">
      <div className="lat-marca">
        <div className="lat-nombre"><Marca /><span className="lat-oga">Casa Óga</span></div>
        <span className="lat-sub">riesgo de pérdida de clientes</span>
      </div>

      <ol className="lat-lista">
        {PANTALLAS.map((p, i) => {
          const grupo = GRUPOS.find((g) => g.id === p.grupo)
          const abre = i === 0 || PANTALLAS[i - 1].grupo !== p.grupo
          return (
            <li key={p.id}>
              {abre && (
                <div className="lat-grupo">
                  <span>{grupo.nombre}</span>
                  <i>{grupo.detalle}</i>
                </div>
              )}
              <button type="button" onClick={() => irA(i)}
                      className={`lat-item${i === indice ? ' on' : ''}`}
                      aria-current={i === indice ? 'page' : undefined}>
                <span className="lat-n tabular">{String(i + 1).padStart(2, '0')}</span>
                <span className="lat-txt">{p.corto}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="lat-pie">
        <span>↑ ↓ cambia de vista</span>
        <span>F pantalla completa · I imprime</span>
      </div>
    </nav>
  )
}

function Impresion({ ctx, info, filtro }) {
  return (
    <div className="impresion-flujo">
      {PANTALLAS.map((p) => (
        <div className="hoja" key={p.id}>
          <p.Componente {...ctx} usaFiltros={p.depende === 'todo'} />
          <PieImpreso info={info} filtro={filtro} pantalla={p}
                      usaFiltros={p.depende === 'todo'} usaCorte={p.depende !== 'ninguno'} />
        </div>
      ))}
    </div>
  )
}

/**
 * Pie SOLO de la hoja impresa. En pantalla estorbaba; en papel es obligatorio: la cátedra
 * pidió las cuatro correcciones (proxy declarado, exposición ≠ recupero, pesos nominales,
 * denominador del anualizado) y la hoja se lee sin el tablero al lado.
 */
function PieImpreso({ info, filtro, pantalla, usaFiltros, usaCorte }) {
  // El filtro de la dimensión que la vista desagrega NO recorta su propio eje (agregacion.js).
  // En pantalla lo declara el chip; en papel el chip no existe, así que si el pie lo listara
  // como uno más, la hoja afirmaría un recorte que el gráfico no aplicó.
  const activos = DIMENSIONES
    .filter(({ id }) => filtro[id] !== null)
    .map(({ id, etq }) => `${etq}: ${etiquetaValor(id, filtro[id])}`
      + (id === pantalla.eje ? ' (no recorta el eje de esta vista)' : ''))

  return (
    <footer className="pie-impreso">
      <div className="pie-l">
        <span><b>Corte</b> {usaCorte ? mesCorte(info.corte) : 'serie completa 2022-2025'}</span>
        <span className="sep">|</span>
        <span><b>Filtros</b> {!usaFiltros ? 'no aplican en esta vista'
          : activos.length ? activos.join(' · ') : 'ninguno'}</span>
        <span className="sep">|</span>
        <span><b>{pantalla.predictivo ? 'Modelo predictivo · en desarrollo' : 'Diagnóstico · datos históricos'}</b></span>
        {pantalla.pie && (<><span className="sep">|</span><span>{pantalla.pie}</span></>)}
      </div>
      <div className="pie-l">
        <span><b>Churn</b> proxy operativo: {meta.proxy}</span>
        <span className="sep">|</span>
        <span>el monto en riesgo es <b>exposición, no recupero</b></span>
        <span className="sep">|</span>
        <span>pesos nominales sin deflactar</span>
        <span className="sep">|</span>
        <span>gasto anual estimado = facturación ÷ años desde la primera compra hasta el corte</span>
      </div>
    </footer>
  )
}

// Control del mes de corte: un riel con la manija del corte activo sobre la regla de los 25.
//
// Todo en UN renglon y a la misma altura que los chips de filtro. Antes era una pila de tres
// filas (rotulo+valor / pista / extremos) y quedaba desalineada con los filtros de al lado.
//
// Por que caja, flechas y manija. La version anterior era una linea de ticks suelta al lado
// de cuatro chips que si traen borde, fondo, sombra y caret: el ojo leia los chips como
// controles y esto como una regla decorativa, y nadie lo tocaba. Ahora usa LA MISMA caja que
// un chip -- 28 px, borde de 1 px, radio 4, sombra de una linea -- para entrar en el mismo
// juego, y adentro pone las tres marcas que dicen "esto se mueve": el riel con el tramo
// recorrido lleno, la manija con sus estrias, y una flecha por lado para pasar de a un corte.
// Las flechas ademas resuelven lo que arrastrar no resuelve bien: elegir un mes exacto entre
// 25 en 200 px.
//
// El rotulo y el mes tambien entraron a la caja, cada uno detras de su hairline. Esa es la
// parte que contesta "para que sirve": mover la manija y ver cambiar ESE numero, dentro del
// mismo objeto que se titula "mes de corte", no admite otra lectura. Afuera, como estaban,
// el mes se leia como un rotulo de fecha y el riel no se leia como nada. Mientras se
// arrastra el mes sale ademas en un globo pegado a la manija, que es adonde mira el que
// arrastra.
//
// Accesible por teclado: la pista es un slider (flechas, Inicio, Fin, PageUp/PageDown) y las
// dos flechas son botones de 24x24 (2.5.8) que se deshabilitan en los extremos. El estado no
// depende del color: la manija es una forma y una posicion, no un tinte.

import { useCallback, useRef } from 'react'
import { cortes, mesCorte } from './agregacion.js'

/** Calendario con la ultima celda llena: el corte es fin de mes. Se define aca y no en
 *  `Iconos.jsx` porque ese set es solo de filtros (ver su cabecera). Es lo unico que queda
 *  diciendo "mes" por debajo de 1300 px, donde el rotulo se oculta por ancho. */
const Calendario = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor"
       strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
       aria-hidden="true" className="tl-ico">
    <rect x="2" y="3.4" width="12" height="10.6" rx="1.2" />
    <path d="M2 6.9h12M5.4 1.9v2.6M10.6 1.9v2.6" />
    <rect x="9.8" y="9.2" width="2.8" height="2.6" rx=".5" fill="currentColor" stroke="none" />
  </svg>
)

const Chevron = ({ atras }) => (
  <svg width="8" height="10" viewBox="0 0 8 10" aria-hidden="true">
    <path d={atras ? 'M5.5 1.4L2.1 5l3.4 3.6' : 'M2.5 1.4L5.9 5 2.5 8.6'}
          fill="none" stroke="currentColor" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function LineaTiempo({ iCorte, setICorte, activo = true }) {
  const ref = useRef(null)
  const n = cortes.length
  const pos = `${(iCorte / (n - 1)) * 100}%`
  const mes = mesCorte(cortes[iCorte])

  const desdeX = useCallback((clientX) => {
    const r = ref.current.getBoundingClientRect()
    const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    return Math.round(t * (n - 1))
  }, [n])

  // El guard de `activo` va acá y no solo en el CSS: `pointer-events: none` sobre la caja
  // apagada alcanza para el mouse, pero deja el camino abierto a cualquier evento que llegue
  // sin hit-test. El teclado lleva el mismo guard más abajo.
  const onPointer = useCallback((e) => {
    if (!activo) return
    if (e.buttons !== 1 && e.type !== 'pointerdown') return
    setICorte(desdeX(e.clientX))
  }, [activo, desdeX, setICorte])

  // Actualizador funcional: si llegan varias teclas antes de un re-render, cada una parte
  // del valor real y no del que quedó capturado en el closure.
  const paso = useCallback((d) => {
    setICorte((v) => Math.min(n - 1, Math.max(0, v + d)))
  }, [n, setICorte])

  // Si el riel esta inactivo (activo=false) no hay que mover nada: antes las flechas
  // cambiaban igual el corte global aunque la pantalla no lo usara para nada, y el
  // teclado tabulaba directo a un control fantasma.
  //
  // Va tambien en los dos botones: sin esto, después de clickear una flecha el foco queda
  // en ella y las flechas del teclado cambiaban de VISTA en lugar de seguir moviendo el
  // corte. `stopPropagation` es lo que impide que la tecla llegue al listener de window.
  const onKey = useCallback((e) => {
    if (!activo) return
    const salto = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: 1, ArrowDown: -1,
                    PageUp: 3, PageDown: -3 }[e.key]
    if (salto !== undefined) paso(salto)
    else if (e.key === 'Home') setICorte(0)
    else if (e.key === 'End') setICorte(n - 1)
    else return
    e.preventDefault()
    e.stopPropagation()
  }, [n, setICorte, paso, activo])

  return (
    <div className="tl">
      {/* El rótulo cede en tres pasos, no en uno: "Mes de corte" -> "Corte" -> el
          calendario. Cada escalón devuelve ancho al riel, que es lo que se defiende. */}
      <span className="tl-lbl"><span className="tl-lbl-mes">Mes de</span>{' '}corte</span>
      <Calendario />

      <button type="button" className="tl-paso" aria-label="Corte anterior"
              disabled={!activo || iCorte === 0}
              onClick={() => paso(-1)} onKeyDown={onKey}>
        <Chevron atras />
      </button>

      <div
        className="tl-pista"
        role="slider"
        tabIndex={activo ? 0 : -1}
        aria-label="Mes de corte"
        aria-valuemin={0}
        aria-valuemax={n - 1}
        aria-valuenow={iCorte}
        aria-disabled={!activo}
        aria-valuetext={mes}
        title={`Arrastrá para elegir el mes de corte · ${mesCorte(cortes[0])} a ${mesCorte(cortes[n - 1])}, ${n} cortes`}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); onPointer(e) }}
        onPointerMove={onPointer}
        onKeyDown={onKey}
      >
        <div className="tl-medida" ref={ref}>
          <div className="tl-riel" aria-hidden="true">
            <span className="tl-lleno" style={{ width: pos }} />
          </div>

          {/* Un tick por corte, más alto en cada diciembre: da la escala sin poner un eje. */}
          <div className="tl-ticks" aria-hidden="true">
            {cortes.map((c) => (
              <span key={c} className={`tl-tick${c.slice(5, 7) === '12' ? ' anio' : ''}`} />
            ))}
          </div>

          <span className="tl-manija" style={{ left: pos }} aria-hidden="true" />
          <span className="tl-globo tabular" style={{ left: pos }} aria-hidden="true">{mes}</span>
        </div>
      </div>

      <button type="button" className="tl-paso" aria-label="Corte siguiente"
              disabled={!activo || iCorte === n - 1}
              onClick={() => paso(1)} onKeyDown={onKey}>
        <Chevron />
      </button>

      <strong className="tl-val tabular">{mes}</strong>
    </div>
  )
}

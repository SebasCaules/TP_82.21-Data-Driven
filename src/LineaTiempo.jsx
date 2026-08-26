// Control del mes de corte: una pista de ticks, uno por corte, con la marca del activo.
//
// Todo en UN renglon y a la misma altura que los chips de filtro. Antes era una pila de tres
// filas (rotulo+valor / pista / extremos) y quedaba desalineada con los filtros de al lado.
// Los extremos de la serie se leen en los ticks altos, uno por diciembre, y en el valor
// activo: no hacen falta tres rotulos mas.
//
// Accesible por teclado: la pista es un slider (flechas, Inicio, Fin, PageUp/PageDown).
// El estado no depende del color: el corte activo lleva marca alta y llena, y su mes
// impreso al lado en negrita.

import { useCallback, useRef } from 'react'
import { cortes, mesCorte } from './agregacion.js'

export default function LineaTiempo({ iCorte, setICorte, activo = true }) {
  const ref = useRef(null)
  const n = cortes.length

  const desdeX = useCallback((clientX) => {
    const r = ref.current.getBoundingClientRect()
    const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    return Math.round(t * (n - 1))
  }, [n])

  const onPointer = useCallback((e) => {
    if (e.buttons !== 1 && e.type !== 'pointerdown') return
    setICorte(desdeX(e.clientX))
  }, [desdeX, setICorte])

  // Actualizador funcional: si llegan varias teclas antes de un re-render, cada una parte
  // del valor real y no del que quedó capturado en el closure.
  const onKey = useCallback((e) => {
    const salto = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: 1, ArrowDown: -1,
                    PageUp: 3, PageDown: -3 }[e.key]
    if (salto !== undefined) {
      setICorte((v) => Math.min(n - 1, Math.max(0, v + salto)))
      e.preventDefault()
    } else if (e.key === 'Home') { setICorte(0); e.preventDefault() }
    else if (e.key === 'End') { setICorte(n - 1); e.preventDefault() }
  }, [n, setICorte])

  return (
    <div className="tl">
      {/* "Corte" y no "Mes de corte": el rótulo corto le devuelve ~55 px a la pista,
          que es el control que gana con ser largo. El mockup 5a lo escribe así. */}
      <span className="tl-lbl">Corte</span>

      <div
        ref={ref}
        className="tl-pista"
        role="slider"
        tabIndex={0}
        aria-label="Mes de corte"
        aria-valuemin={0}
        aria-valuemax={n - 1}
        aria-valuenow={iCorte}
        aria-disabled={!activo}
        aria-valuetext={mesCorte(cortes[iCorte])}
        title={`${mesCorte(cortes[0])} – ${mesCorte(cortes[n - 1])}, ${n} cortes`}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); onPointer(e) }}
        onPointerMove={onPointer}
        onKeyDown={onKey}
      >
        {/* Un tick por corte, más alto en cada diciembre: da la escala sin poner un eje. */}
        <div className="tl-ticks" aria-hidden="true">
          {cortes.map((c, i) => (
            <span key={c}
                  className={`tl-tick${c.slice(5, 7) === '12' ? ' anio' : ''}${i === iCorte ? ' on' : ''}`} />
          ))}
        </div>
      </div>

      <strong className="tl-val tabular">{mesCorte(cortes[iCorte])}</strong>
    </div>
  )
}

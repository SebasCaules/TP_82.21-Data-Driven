// Timeline de los 25 cortes. Reemplaza al <select> del encabezado.
//
// No es un adorno: la trayectoria de la exposición ES el "ver cómo vengo" que pide el apunte
// de la clase 4, así que el control de corte y la serie que lo justifica son el mismo objeto.
// Mover el corte es recorrer la curva.
//
// Accesible por teclado: la pista es un slider (flechas, Inicio, Fin, PageUp/PageDown) y
// cada tick tiene su valor. El estado no depende del color: el corte activo lleva marca
// vertical llena y su fecha impresa al lado.

import { useCallback, useRef } from 'react'
import { cortes, mesCorte, millones, series } from './agregacion.js'

export default function LineaTiempo({ iCorte, setICorte, activo = true }) {
  const ref = useRef(null)
  const expo = series.exposicion_por_corte.map((x) => x.exposicion)
  const max = Math.max(...expo) || 1
  const n = cortes.length
  const actual = series.exposicion_por_corte[iCorte]

  const desdeX = useCallback((clientX) => {
    const r = ref.current.getBoundingClientRect()
    const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    return Math.round(t * (n - 1))
  }, [n])

  const onPointer = useCallback((e) => {
    if (e.buttons !== 1 && e.type !== 'pointerdown') return
    setICorte(desdeX(e.clientX))
  }, [desdeX, setICorte])

  const onKey = useCallback((e) => {
    const salto = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: 1, ArrowDown: -1,
                    PageUp: 3, PageDown: -3 }[e.key]
    if (salto !== undefined) { setICorte(Math.min(n - 1, Math.max(0, iCorte + salto))); e.preventDefault() }
    else if (e.key === 'Home') { setICorte(0); e.preventDefault() }
    else if (e.key === 'End') { setICorte(n - 1); e.preventDefault() }
  }, [iCorte, n, setICorte])

  // Área bajo la curva, en coordenadas de 0 a 100 para que escale con el ancho.
  const px = (i) => (i / (n - 1)) * 100
  const py = (v) => 100 - (v / max) * 88
  const linea = expo.map((v, i) => `${px(i)},${py(v)}`).join(' ')
  const area = `0,100 ${linea} 100,100`

  return (
    <div className="tl">
      <div className="tl-izq">
        <span className="tl-lbl">Mes de corte</span>
        <strong className="tl-val tabular">{mesCorte(cortes[iCorte])}</strong>
      </div>

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
        aria-valuetext={`${mesCorte(cortes[iCorte])}, exposición ARS ${millones(actual.exposicion)}`}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); onPointer(e) }}
        onPointerMove={onPointer}
        onKeyDown={onKey}
      >
        <svg className="tl-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polygon points={area} className="tl-area" />
          <polyline points={linea} className="tl-linea" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Ticks: uno por corte, más alto cada enero. Dan la escala sin ejes. */}
        <div className="tl-ticks" aria-hidden="true">
          {cortes.map((c, i) => (
            <span key={c} className={`tl-tick${c.slice(5, 7) === '12' ? ' anio' : ''}${i === iCorte ? ' on' : ''}`} />
          ))}
        </div>

        {/* Cerca del borde derecho la etiqueta se saldría del ancho: se voltea al otro lado. */}
        <span className="tl-cursor" style={{ left: `${px(iCorte)}%` }} aria-hidden="true">
          <b className="tabular" style={px(iCorte) > 72 ? { right: 6 } : { left: 6, right: 'auto' }}>
            ARS {millones(actual.exposicion)}
          </b>
        </span>
      </div>

      <div className="tl-der">
        <span className="tl-rango tabular">{mesCorte(cortes[0])} → {mesCorte(cortes[n - 1])}</span>
        <span className="tl-lbl">{n} meses</span>
      </div>
    </div>
  )
}

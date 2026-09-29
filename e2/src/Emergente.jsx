// Texto emergente del E2 (29/09, pedido del usuario después de la presentación: las marcas de la
// vista 11b necesitaban explicarse en el lugar). Se abre al pasar el mouse o al llegar con Tab, y
// se cierra al salir, al perder el foco o con Escape. Usa la ficha del glosario del E1
// (`.def-pop`, src/estilos.css) para que los dos tableros expliquen igual.
//
// Va en un portal: las tarjetas de la vista recortan lo que se sale (`overflow: hidden`). El clic
// no se lleva el foco (`preventDefault` en mousedown): con el foco en la marca, las flechas dejan
// de cambiar de vista (App.jsx, H9) y quien presenta se queda trabado en la pantalla.
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MARGEN = 8

export default function Emergente({ contenido, children, className = '', etiqueta }) {
  const [abierto, setAbierto] = useState(false)
  const [pos, setPos] = useState(null)
  const ref = useRef(null)
  const refPop = useRef(null)
  const id = useId()

  // Arriba del disparador y centrada; si no entra arriba, abajo. Nunca fuera de la ventana.
  useLayoutEffect(() => {
    if (!abierto) { setPos(null); return }
    const r = ref.current.getBoundingClientRect()
    const p = refPop.current.getBoundingClientRect()
    const left = Math.min(Math.max(MARGEN, r.left + r.width / 2 - p.width / 2), window.innerWidth - p.width - MARGEN)
    const arriba = r.top - p.height - MARGEN
    setPos({ left, top: arriba >= MARGEN ? arriba : Math.min(r.bottom + MARGEN, window.innerHeight - p.height - MARGEN) })
  }, [abierto])

  useEffect(() => {
    if (!abierto) return
    const cerrar = () => setAbierto(false)
    window.addEventListener('resize', cerrar)
    return () => window.removeEventListener('resize', cerrar)
  }, [abierto])

  return (
    <>
      <span
        ref={ref}
        className={`e2-emerge ${className}`.trim()}
        tabIndex={0}
        aria-label={etiqueta}
        aria-describedby={abierto ? id : undefined}
        onMouseEnter={() => setAbierto(true)}
        onMouseLeave={() => setAbierto(false)}
        onMouseDown={(e) => e.preventDefault()}
        onFocus={() => setAbierto(true)}
        onBlur={() => setAbierto(false)}
        onKeyDown={(e) => { if (e.key === 'Escape' && abierto) { e.stopPropagation(); setAbierto(false) } }}
      >
        {children}
      </span>
      {abierto && createPortal(
        <div
          ref={refPop}
          id={id}
          role="tooltip"
          className="def-pop e2-emergente"
          style={pos ? { left: pos.left, top: pos.top } : { left: 0, top: 0, visibility: 'hidden' }}
        >
          {contenido}
        </div>,
        document.body,
      )}
    </>
  )
}

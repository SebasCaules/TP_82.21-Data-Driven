// Factor de escala para el texto dentro de los SVG propios del E2 (24/09, LEG-TRANSVERSAL-1).
// Lienzo dibuja en px reales, así que una letra de 10 px en el SVG mide 10 px a 1152 y a
// 1920: en proyector las anotaciones, que son las que sostienen cada hallazgo, quedaban
// ilegibles. Las vistas multiplican sus fontSize por k: 1 hasta 1280 px de ancho, crece
// lineal y topa en 1,4 (1792 px en adelante). En la hoja impresa k = 1: el ancho de la
// ventana no dice nada del papel. Las primitivas compartidas con el E1 (src/graficos.jsx)
// no lo usan, para no cambiar el tablero ya entregado.

import { createContext, useContext, useEffect, useState } from 'react'

export const ImpresionCtx = createContext(false)

const factor = () => (typeof window === 'undefined' ? 1 : Math.min(1.4, Math.max(1, window.innerWidth / 1280)))

export function useEscalaTexto() {
  const imprimiendo = useContext(ImpresionCtx)
  const [k, setK] = useState(factor)
  useEffect(() => {
    const onResize = () => setK(factor())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return imprimiendo ? 1 : k
}

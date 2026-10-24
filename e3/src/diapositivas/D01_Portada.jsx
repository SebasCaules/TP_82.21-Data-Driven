// Diapositiva 1: portada. Fondo tinta, como el PPTX; el pie de C3 en lugar de la línea fija de
// armar.py, para que el texto salga de una sola fuente.
import { C3 } from '../contenido_e3.js'
import { ANCHO, M, PieMarca, TOTAL, caja } from './Marco.jsx'

export default function Portada({ d }) {
  return (
    <div className="e3-dia e3-portada">
      <div className="e3-avance" aria-hidden="true"><i style={{ width: `${100 / TOTAL}%` }} /></div>
      <p className="e3-kicker" style={caja(M, 120, ANCHO)}>{d.kicker}</p>
      <h1 className="e3-portada-titulo" style={caja(M, 182, 1300)}>{d.titulo}</h1>
      <p className="e3-portada-bajada" style={caja(M, 428, 1300)}>{d.bajada}</p>
      <div className="e3-portada-linea" style={caja(M, 552, ANCHO, 1)} />
      <ul className="e3-equipo" style={caja(M, 576, ANCHO)}>
        {C3.EQUIPO.map((p) => (
          <li key={p.nombre}><b>{p.nombre}</b><span>{p.rol}</span></li>
        ))}
      </ul>
      <div className="e3-portada-pie" style={caja(M, 780, ANCHO)}><PieMarca /></div>
    </div>
  )
}

// V01b · Mapa de calidad antes y después (29/09, pedido del usuario). Los 13 archivos por las 7
// dimensiones: a la izquierda, el mapa de la Parte A (3.1) tal como llegan los datos; a la derecha,
// el mismo mapa después de las 15 decisiones (Parte B, 1.1). Datos en ../mapa.js.
import { Mapa, Leyenda } from '../MapaCalidad.jsx'

export const meta = { id: 'V01b', corto: 'Mapa de calidad', titulo: 'Mapa de calidad antes y después de las decisiones' }

export default function V01bMapa() {
  return (
    <section className="pant v01b">
      <div className="mapa-par grande">
        <div className="tarjeta">
          <p className="mapa-rot">Antes · 48 de 91 celdas con hallazgo</p>
          <Mapa modo="antes" />
          <Leyenda modo="antes" />
        </div>
        <div className="tarjeta">
          <p className="mapa-rot">Después de las 15 decisiones</p>
          <Mapa modo="despues" />
          <Leyenda modo="despues" />
        </div>
      </div>
    </section>
  )
}

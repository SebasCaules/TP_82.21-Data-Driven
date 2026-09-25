// Banda de cifras del E2 (25/09, regla del usuario): la franja de arriba de toda vista con
// decisión. A la izquierda, las tarjetas de cifra de la vista (children, con las clases de
// .e2-kpis: .e2-central, .e2-si); a la derecha, siempre en el mismo lugar y con el mismo ancho y
// alto, la tarjeta de decisión con solo el llano. El alto de la banda es fijo (--e2-banda-h en
// estilos_e2.css) para que la tarjeta de decisión sea el mismo rectángulo en todas las vistas;
// lo que no entre en la banda va al gráfico de abajo.

import TarjetaDecision from './TarjetaDecision.jsx'

export default function Banda({ dcs, children }) {
  return (
    <div className="e2-banda">
      <div className="e2-kpis e2-banda-cifras">{children}</div>
      <TarjetaDecision dcs={dcs} />
    </div>
  )
}

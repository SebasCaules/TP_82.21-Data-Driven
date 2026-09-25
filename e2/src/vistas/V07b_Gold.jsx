// V07b · Nivel Gold — segunda pantalla de la vista 7 (25/09, pedido del usuario: una sola
// decisión por tarjeta). DC-06: el segmento «Gold» con el que Marketing etiqueta sus campañas no es
// el nivel del programa de fidelización. Las dos cifras de la banda son dos lecturas que no se
// restan (envíos contra personas): van sin flecha, la de la campaña en terracota porque es la
// etiqueta que confunde y la del programa en --acc. Debajo, los socios del programa por nivel
// (D2.vistas.V07.gold.por_nivel, D23), cada barra con el color de su nivel.

import { Lienzo, BarrasH } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero } from '../formato.js'
import { useEscalaTexto } from '../escala.js'
import Banda from '../Banda.jsx'

const V = D2.vistas.V07
const DC06 = D2.decisiones.find((d) => d.id === 'DC-06')
const G = V.gold
const ORDEN = ['Bronze', 'Silver', 'Gold']
const NIVELES = ORDEN.filter((n) => G.por_nivel && n in G.por_nivel)

const TITULO = `«Gold» en las campañas: ${entero(G.envios)} envíos; socios Gold del programa: ${entero(G.socios)}`

export const meta = {
  id: 'V07b',
  dc: 'DC-06',
  corto: 'Nivel Gold',
  titulo: TITULO,
  pie: 'D17, D23',
}

export default function V07bGold() {
  const k = useEscalaTexto()
  // (25/09, pedido del usuario: acá no hay nada que resaltar) Cada barra con el color de su nivel,
  // en tonos de la paleta; la de Gold, con un ancho mínimo visible (son 3 socios de 4.043).
  const COLOR = { Bronze: 'var(--bronce)', Silver: 'var(--plata)', Gold: 'var(--oro)' }
  const datos = NIVELES.map((n) => ({
    etiqueta: n,
    valor: G.por_nivel[n],
    color: COLOR[n],
    anchoMin: n === 'Gold' ? 4 : undefined,
    sufijo: n === 'Gold' ? 'socios' : undefined,
  }))
  return (
    <section className="pant v07b">
      <Banda dcs={[DC06]}>
        <div className="tarjeta" title="Envíos de campaña con segmento_objetivo = Gold (D17)">
          <span className="kpi-lbl"><span>«Gold» en las campañas</span></span>
          <div className="ban-par">
            <div className="par-item">
              <span className="par-lbl">Envíos con esa etiqueta</span>
              <span className="par-val tabular e2-cifra" style={{ color: 'var(--terra)' }}>{entero(G.envios)}</span>
            </div>
          </div>
          <p className="e2-linea">La etiqueta de Marketing.</p>
        </div>
        <div className="tarjeta e2-central" title="Socios con nivel Gold en Fidelizacion.csv (D23)">
          <span className="kpi-lbl"><span>Gold en el programa</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <span className="par-lbl">Socios con ese nivel</span>
              <span className="par-val tabular e2-cifra">{entero(G.socios)}</span>
            </div>
          </div>
          <p className="e2-linea">El nivel real, de Fidelización.</p>
        </div>
      </Banda>

      <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}>
        <span className="kpi-lbl frase">Socios del programa de fidelización, por nivel</span>
        <div style={{ flex: '1 1 0', minHeight: 0, maxHeight: Math.round(300 * k), marginTop: 'clamp(6px, 1.6vh, 20px)', display: 'flex', flexDirection: 'column' }}>
          <Lienzo className="lienzo">
            {({ w, h }) => (
              <BarrasH datos={datos} w={w} h={h} formato={entero} anchoEtiqueta={Math.round(96 * k)} tituloEje="Socios" />
            )}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}

// V05 · ¿Se paga? (Parte B 3.2 a 3.6; diapositivas 8 y 9 de C3). Banda de cifras con la tarjeta de decisión
// a la derecha y un gráfico a todo el ancho debajo.
//
// Decisiones del 28/10 (unidad V05 de .workforce/PLAN.md, con las correcciones del crítico):
// - Banda, un número por tarjeta y la central primero (N0-6). Central: el ROI de la regla sola a un año en el
//   escenario esperado (D3.economia.observada.regla_roi_pct, −98,52 %, G41), la cifra propia de esta vista:
//   ni la regla sin modelo recupera su costo. Ya no es el ROI del modelo sobre la regla (−99,95 %), que es la
//   central de la vista 1 y no se repite. Después, en tarjetas separadas, lo que suma el modelo sobre la regla
//   (observada.modelo_usd, USD 5,38 por año, G40) y lo que cuesta de más en el año 1
//   (costos.incremental_usd, USD 10.400, C28). El 49,6 % de tasa de éxito necesaria sale de la banda: lo
//   muestra la vista 1. Rótulos ≤ 22 caracteres y fragmentos sin segundo número (N0-8); el detalle, al title.
//   Anchos 3 / 2 / 2: con menos, el −98,52 % no entra en la central a 1366 × 768. Los dos montos van sin
//   «USD» en la cifra y con «dólares» en el fragmento: «USD 10.400» mide 225 px con su relleno a 1366 × 768
//   y la tarjeta de ancho 2 mide 188 (ningún reparto de la grilla de 7 de la banda le da más sin dejar
//   afuera el −98,52 %); el rótulo con «(USD)» pasa de una línea.
// - Decisión: el veredicto de C3 (diapositiva 9), solo la frase corta en negrita; el resto, al title.
// - Gráfico (V05_Simulador.jsx, TarjetaCostoBeneficio): dos barras, el costo del año 1 de la regla sola
//   (USD 20.260, contexto) contra su beneficio anual (USD 299,49, --acc). La astilla del beneficio es el
//   mensaje; la conclusión, arriba en .e3-conclusion, es la frase de la tarjeta «Económica» de la
//   diapositiva 2 de C3. El costo con modelo y el presupuesto pasan a «Explorar», junto al simulador.
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) con formato.js y el texto de C3
// (contenido_e3.js).

import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { fijo, pctDirecto, usd } from '../formato.js'
import { plano } from '../texto.jsx'
import { decision } from '../decisiones.js'
import { Cifra } from '../cifra.jsx'
import { TarjetaCostoBeneficio } from './V05_Simulador.jsx'
import './V05.css'

const E = D3.economia
const D8 = C3.DIAPOSITIVAS.find((d) => d.n === 8)
const D9 = C3.DIAPOSITIVAS.find((d) => d.n === 9)

// La decisión de la diapositiva 9: «**No viable tal como está planteado.** Ningún supuesto…». La parte en
// negrita es la frase corta de la tarjeta (≤ 60 caracteres, regla 11 del E2); el resto va al title.
// El id y el estado («B-ECO · no viable») salen del vocabulario único de decisiones.js.
const [, NEGRITA = '', RESTO = ''] = D9.decision.match(/^\*\*(.+?)\*\*\s*(.*)$/) ?? []
const DECISION = decision('B-ECO', {
  llano_corto: NEGRITA.replace(/\.$/, ''),
  llano: plano(D9.decision),
  decision: NEGRITA.replace(/\.$/, ''),
  justificacion: RESTO,
})

// La fila «Regla sola» de la tabla de ROI de la diapositiva 9 (conservador, esperado, optimista), al title.
const ROI_REGLA = D9.roi.filas.find(([f]) => f === 'Regla sola')
const ESCENARIOS = ROI_REGLA ? D9.roi.columnas.map((c, i) => `${c.toLowerCase()} ${ROI_REGLA[1][i]}`).join(', ') : ''
const C_MOD = E.costos.con_modelo.total_anio_1_usd
const C_REG = E.costos.regla_sin_modelo.total_anio_1_usd

// Las tres tarjetas: rótulo (≤ 22 caracteres), cifra de D3 con formato.js, fragmento sin cifra.
const ROI = {
  rotulo: 'ROI de la regla sola',
  valor: pctDirecto(E.observada.regla_roi_pct, 2),
  linea: 'a un año, escenario esperado',
  title: `ROI de la regla sin modelo a un año, lista de 500 sin filtro en validación: ${ESCENARIOS}.`,
}
const SUMA = {
  rotulo: 'Suma el modelo',
  valor: fijo(E.observada.modelo_usd, 2),
  linea: 'dólares por año, sobre la regla',
  title: `Lo que suma el modelo sobre la regla: ${usd(E.observada.modelo_usd, 2)} por año. ${plano(D8.cadena)} ${plano(D8.filtro)}`,
}
const CUESTA = {
  rotulo: 'Cuesta el modelo',
  valor: fijo(E.costos.incremental_usd),
  linea: 'dólares más el primer año',
  title: `El modelo cuesta ${usd(E.costos.incremental_usd)} más que la regla en el año 1: ${usd(C_MOD)} con modelo contra ${usd(C_REG)} con la regla sola; el presupuesto es `
    + `${usd(E.costos.presupuesto_usd)}.`,
}

export const meta = { id: 'V05', dc: 'B-ECO' }

function TarjetaCifra({ c, central, span }) {
  return (
    <div className={`tarjeta${central ? ' e2-central' : ''}`} style={{ gridColumn: `span ${span}` }} title={c.title}>
      <span className="kpi-lbl"><span>{c.rotulo}</span></span>
      <div className="ban-par">
        <div className="par-item par-unico"><Cifra texto={c.valor} sec={!central} /></div>
      </div>
      <p className="e2-linea">{c.linea}</p>
    </div>
  )
}

export default function V05SePaga() {
  return (
    <section className="pant v05">
      <Banda dcs={[DECISION]}>
        <TarjetaCifra c={ROI} central span={3} />
        <TarjetaCifra c={SUMA} span={2} />
        <TarjetaCifra c={CUESTA} span={2} />
      </Banda>

      <TarjetaCostoBeneficio />
    </section>
  )
}

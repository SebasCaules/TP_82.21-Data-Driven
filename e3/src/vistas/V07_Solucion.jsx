// V07 · ¿Qué solución? (Parte D 9.1; lámina 4 de la clase 13; diapositiva 13 de C3). Nueva el 30/10, con el
// rehecho de /e3/ sin «Explorar» (e3/DISENO.md, «Decisiones (30/10)»).
//
// - Banda: la precisión de la lista en test de las tres formas de armarla (D 8.1 y 9.1; J03 y J17), la regla
//   primero (la central, la que se adopta), después el modelo y el orden de hoy. Decisión «Solución · propuesta»
//   (D-SOL de decisiones.js): lo que sale de la escalera.
// - Cuerpo: la escalera de la lámina 4 aplicada a Casa Óga y las alternativas de la D 9.1, en una tabla. Cada fila
//   es un escalón (la pregunta y su respuesta en el caso) con la alternativa que le corresponde: qué resuelve,
//   cuánto cuesta, qué deja sin resolver y si se adopta (las columnas de la 9.1). La primera fila es la situación
//   de hoy («No hacer nada»); el escalón 1 no tiene fila en la 9.1: es la integración del pipeline del E2 (D 9.2:
//   «une los registros de cada persona y frena un mes con menos del 60 %»), con la cobertura no confirmada desde
//   septiembre de 2025 (D 10.2, DC-09). En azul, lo que se adopta. La conclusión, arriba: el resultado.
// - La señal del escalón 4 es el AUC-ROC de la regla en test, 0,979 (D 8.1, J05).
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) con formato.js. El texto resume la D 9.1 en
// fragmentos; la tabla no corta celdas (tope = Infinity): achica la letra hasta que entra.

import { Lienzo } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { entero, fijo, pct, usd } from '../formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { Cifra } from '../cifra.jsx'
import { TablaSvg } from '../Respaldo.jsx'
import './V07.css'

const TM = D3.test.metodos
const E = D3.economia
const CO = D3.test.contra_regla
const MA = D3.test.meta_y_alerta
const S = D3.solucion
const LARGO = D3.lista.elegida.largo_mes

const REGLA = pct(TM.regla.test.precision, 1)
const MODELO = pct(TM.logistica_ajustada.test.precision, 1)
const HOY = pct(TM.practica_actual.test.precision, 1)
const AUC = fijo(TM.regla.test.auc_roc_contactables, 3)
const pp = (x) => fijo(x, 2, true)

if (!(TM.regla.test.precision > TM.logistica_ajustada.test.precision) || !(CO.ic95_pp[0] < 0 && CO.ic95_pp[1] > 0)) {
  throw new Error('V07: el test ya no sostiene que el modelo no le gana a la regla')
}

const DECISION = decision('D-SOL', {
  llano_corto: 'Identidad unida, tablero y regla con cálculo mensual',
  llano: 'La solución combina la identidad unida del E2, el tablero del mes y la regla del umbral, con el cálculo '
    + 'de la lista automatizado. La analítica predictiva queda para más adelante.',
  decision: 'Identidad unida, tablero y regla con cálculo mensual',
  justificacion: `Parte D 9.1. En test la regla acierta ${REGLA}, la logística ${MODELO} y ordenar por días sin `
    + `comprar ${HOY}. El modelo agrega ${usd(E.costos.incremental_usd)} al costo del primer año.`,
})

const COLUMNAS = [
  { titulo: 'Escalón', ancho: 2.3 },
  { titulo: 'Alternativa', ancho: 1.25 },
  { titulo: 'Qué resuelve', ancho: 2.1 },
  { titulo: 'Costo', ancho: 1.55 },
  { titulo: 'Qué deja sin resolver', ancho: 1.95 },
  { titulo: '¿Se adopta?', ancho: 1.85 },
]
const FILAS = [
  { celdas: ['Hoy', 'No hacer nada', 'Nada nuevo: Sofía R. elige por segmento o a mano',
    'Sin costo del proyecto; horas de Marketing sin medir',
    `No sabe quién está por irse; ${pct(D3.legal.envios_sin_consentimiento_tasa, 1)} de los envíos fue a quien no acepta marketing`,
    `No: ordenar por días sin comprar acierta ${HOY}`] },
  { marcada: true, celdas: ['1 · ¿Los datos se pueden cruzar? Sí, con la identidad unida del E2', 'Integración',
    `Une los registros de cada persona y frena un mes con menos del ${pct(S.completitud_minima, 0)} de las operaciones`,
    'Pipeline del E2 en Python, sin licencias', 'Desde septiembre de 2025 la cobertura del extracto no está confirmada',
    'Sí, como base de todo lo demás'] },
  { marcada: true, celdas: ['2 · ¿El problema es que no se ve? Sí: Sofía R. elige a mano',
    'Analítica descriptiva y tablero', 'Muestra el riesgo en pesos por región y categoría',
    'Incluido en el MVP: tablero HTML sin licencias', 'Confirma el cruce del umbral; no dice a quién contactar antes',
    'Sí: el directorio lo sigue una vez por mes'] },
  { celdas: ['3 · ¿Hay trabajo manual repetitivo? Sí: la lista de cada mes', 'Automatizar la decisión',
    'Mandar la campaña sin revisión, con la lista cargada en el CRM', 'Integración con el CRM sin cotizar',
    'Saca a Sofía R. de la exclusión y de validar las marcas',
    'No. Se automatiza el cálculo de la lista, un comando por mes'] },
  { marcada: true, celdas: [`4 · ¿Anticipar cambia la decisión? Hay señal: la regla separa bien (AUC ${AUC} en test)`,
    'Regla de negocio',
    `Lista de ${entero(LARGO)} contactables, primero los más cerca del umbral: acierta ${REGLA}, ${fijo(MA.regla_aciertos_por_mes, 2)} por mes`,
    `${usd(E.costos.regla_sin_modelo.total_anio_1_usd)} el año 1`,
    `Si el contacto hace volver a alguien: solo se conoce ${pct(E.parametros.s_observada, 2)}, sin control`,
    `Sí, es la primera versión: supera la meta de ${entero(MA.meta_aciertos_por_mes)} por mes`] },
  { celdas: ['4 · ¿Vale la plata? No', 'Modelo predictivo', `Ordena por probabilidad: acierta ${MODELO}, igual que la regla`,
    `${usd(E.costos.con_modelo.total_anio_1_usd)} el año 1, ${fijo(E.costos.incremental_usd, 0)} más que la regla`,
    `No le gana a la regla: ${pp(CO.diferencia_pp)} puntos, de ${pp(CO.ic95_pp[0])} a ${pp(CO.ic95_pp[1])}`,
    'No, para más adelante: vuelve si su costo baja'] },
]

export const meta = { id: 'V07', dc: 'D-SOL' }

export default function V07Solucion() {
  const k = useEscalaTexto()
  return (
    <section className="pant v07s">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta e2-central" style={{ gridColumn: 'span 3' }}
             title={`Precisión de la lista de ${entero(LARGO)} contactables por mes en test, la regla del umbral (Parte D 8.1 y 9.1).`}>
          <span className="kpi-lbl"><span>Regla en test</span></span>
          <div className="ban-par"><div className="par-item par-unico"><Cifra texto={REGLA} /></div></div>
          <p className="e2-linea">acierta de la lista</p>
        </div>
        <div className="tarjeta" style={{ gridColumn: 'span 2' }}
             title={`La logística ajustada en la misma lista: ${MODELO}, ${pp(CO.diferencia_pp)} puntos contra la regla (Parte D 8.1).`}>
          <span className="kpi-lbl"><span>Modelo en test</span></span>
          <div className="ban-par"><div className="par-item par-unico"><Cifra texto={MODELO} sec /></div></div>
          <p className="e2-linea">no le gana a la regla</p>
        </div>
        <div className="tarjeta" style={{ gridColumn: 'span 2' }}
             title={`Ordenar por más días sin comprar, como Marketing con sus inactivos: ${HOY} en test (Parte D 9.1).`}>
          <span className="kpi-lbl"><span>Orden de hoy</span></span>
          <div className="ban-par"><div className="par-item par-unico"><Cifra texto={HOY} sec /></div></div>
          <p className="e2-linea">por días sin comprar</p>
        </div>
      </Banda>

      <div className="tarjeta e3-v07s-graf" title={`Parte D 9.1 y lámina 4 de la clase 13. ${DECISION.justificacion}`}>
        <p className="e3-conclusion">
          Resultado: <b>identidad unida, tablero y regla con cálculo automático</b>; la predictiva, más adelante
        </p>
        <div className="e3-v07s-lienzo">
          <Lienzo className="lienzo">
            {({ w, h }) => (
              <TablaSvg w={w} h={h} k={k} columnas={COLUMNAS} filas={FILAS} base={14} minimo={9.5} tope={Infinity}
                        etiqueta="Escalera de la solución y alternativas de la Parte D 9.1" />
            )}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}

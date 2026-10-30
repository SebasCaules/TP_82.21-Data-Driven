// V03 · ¿Se puede hacer? (Parte A 1.1 a 1.5; diapositiva 4 de C3). Banda de cifras con la tarjeta
// de decisión a la derecha y un gráfico a todo el ancho debajo.
//
// Decisiones del 28/10 (.workforce/PLAN.md, unidad V03 y «Correcciones del crítico»):
// - Banda: un número por tarjeta, la central primero (N0-6). Central: el puntaje técnico 2,25/3 con
//   el tramo de la escala de D3 como fragmento («promedio: factibilidad media», sin segundo número,
//   N0-8). Después, los casos para entrenar de la condición «Datos» y las ventas sin cliente de
//   «Calidad». Rótulos de C3 (≤ 22 caracteres); la fila entera de C3, al title.
// - Decisión: el título de la diapositiva 4 sin «los datos alcanzan y», que dicen la banda y el gráfico.
//   Par «A-TEC · factibilidad media» de decisiones.js.
// - Gráfico: tarjeta de puntaje (V03Puntaje.jsx) en vez de las barras 3/2/2/2 con tramo y promedio, que
//   no distinguían el límite (tres barras iguales). Una fila por condición de D3 (tecnica.condiciones):
//   pips chicos y la razón grande, de la fila de C3 sin la cita al relevamiento y sin repetir las cifras
//   de la banda. «Datos» toma su razón del guion de la diapositiva 4 («alcanzan con margen»), porque su
//   fila de C3 empieza con 4.636; «Calidad» reescribe su fila sin el 44,8 % («Ventas sin cliente
//   identificado»). Solo «Capacidad humana» va en --acc y peso 700: es el límite que dice la decisión.
//   Sin eje ni tramo sombreado.
// - Conclusión del gráfico (.e3-conclusion, arriba a la izquierda): la cola del título de la diapositiva
//   4, «Los datos alcanzan y el límite es quién opera la lista», con el límite en --acc.
// - (30/10, sin «Explorar») El MVP de la diapositiva 5 (pasos y hechos), que iba detrás de «Explorar», pasa a la
//   vista 8, «¿Cómo funciona cada mes?», con su guion. Sale también la línea «MVP: USD 0…», que a 1366 × 768 no se veía.
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) y el texto de C3 (contenido_e3.js).

import { Lienzo } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { fijo, pctDirecto } from '../formato.js'
import { plano, sinCodigos } from '../texto.jsx'
import { decision } from '../decisiones.js'
import { Cifra } from '../cifra.jsx'
import { TarjetaPuntaje } from './V03Puntaje.jsx'
import './V03.css'

const T = D3.tecnica
const D4 = C3.DIAPOSITIVAS.find((d) => d.n === 4)
const TOPE_ESCALA = T.escala[T.escala.length - 1].hasta

// La fila de C3 de cada condición de D3: el rótulo de C3 es el comienzo del nombre de D3 («Datos» y
// «Datos suficientes»).
const filaDe = (c) => D4.filas.find((f) => c.nombre.startsWith(f.rotulo))
const mayuscula = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t)

const ID_LIMITE = 'capacidad_humana'
const LIMITE = T.condiciones.find((c) => c.id === ID_LIMITE)
// Las cifras que ya muestra la banda: ninguna razón del gráfico las repite.
const CIFRAS_BANDA = [fijo(T.positivos_entrenamiento, 0), fijo(T.ventas_sin_cliente_pct, 1)]
const sinCifraDeBanda = (t) => !!t && !CIFRAS_BANDA.some((n) => t.includes(n))

// La razón de una condición, un fragmento de una línea de su fila de C3 (sin la cita al relevamiento),
// y el detalle que sigue a los dos puntos si no trae números. Ver la cabecera para «Datos» y «Calidad».
function razonDe(c) {
  const t = sinCodigos(plano(filaDe(c)?.texto)).trim().replace(/\.$/, '')
  if (c.id === 'datos') {
    const m = (D4.guion || '').match(/datos (alcanzan[^:.;]*)/i)
    if (m) return { razon: mayuscula(m[1].trim()) }
  }
  const pct = t.match(/^[\d.,]+\s*%\s*de las (.+?) no tiene (.+)$/)
  if (pct) return { razon: `${mayuscula(pct[1])} sin ${pct[2]}` }
  const [antes, ...resto] = t.split(/:\s+/)
  const detalle = resto.join(': ')
  if (sinCifraDeBanda(antes)) {
    return { razon: mayuscula(antes), detalle: detalle && !/\d/.test(detalle) ? detalle : undefined }
  }
  return { razon: mayuscula(t.split(/[;:.]\s+/).find(sinCifraDeBanda) ?? c.nombre) }
}
const FILAS = T.condiciones.map((c) => ({
  id: c.id, nombre: c.nombre, puntaje: c.puntaje, limite: c.id === ID_LIMITE, ...razonDe(c),
}))

// La decisión: el título de la diapositiva 4 sin «los datos alcanzan y». Si C3 cambia de forma, queda el
// título entero y la verificación avisa si pasa de 60 caracteres. La conclusión del gráfico es la cola
// entera del título («los datos alcanzan y el límite es quién opera la lista»).
const [, CABEZA, COLA] = D4.titulo.match(/^(.+?):.*\by\s+(.+)$/) ?? []
const CORTA = CABEZA && COLA ? `${CABEZA}: ${COLA}` : D4.titulo
const TRAS_DOS_PUNTOS = D4.titulo.includes(':') ? D4.titulo.slice(D4.titulo.indexOf(':') + 1).trim() : D4.titulo
const CONCLUSION_ANTES = COLA && TRAS_DOS_PUNTOS.endsWith(COLA)
  ? mayuscula(TRAS_DOS_PUNTOS.slice(0, TRAS_DOS_PUNTOS.length - COLA.length)) : ''
const CONCLUSION_LIMITE = CONCLUSION_ANTES ? COLA : mayuscula(TRAS_DOS_PUNTOS)
const DECISION = decision('A-TEC', {
  llano_corto: CORTA,
  llano: plano(D4.titulo),
  decision: CORTA,
  justificacion: `${plano(filaDe(LIMITE)?.texto)} ${plano(D4.nota)}`,
})

export const meta = { id: 'V03', dc: 'A-TEC' }

export default function V03SePuedeHacer() {
  const k = useEscalaTexto()
  const datos = filaDe(T.condiciones.find((c) => c.id === 'datos'))
  const calidad = filaDe(T.condiciones.find((c) => c.id === 'calidad'))
  return (
    <section className="pant v03">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta e2-central" style={{ gridColumn: 'span 3' }}
             title={`Puntaje técnico: promedio de las ${T.condiciones.length} condiciones, de ${fijo(T.escala[0].desde, 0)} a ${fijo(TOPE_ESCALA, 0)}. ${T.nivel}. ${plano(D4.pie_figura)}`}>
          <span className="kpi-lbl"><span>Puntaje técnico</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra num={fijo(T.promedio, 2)} unidad={`/${fijo(TOPE_ESCALA, 0)}`} />
            </div>
          </div>
          <p className="e2-linea">{`promedio: ${T.nivel.toLowerCase()}`}</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 2' }} title={`${datos.rotulo}. ${plano(datos.texto)}`}>
          <span className="kpi-lbl"><span>{datos.rotulo}</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra num={fijo(T.positivos_entrenamiento, 0)} sec />
            </div>
          </div>
          <p className="e2-linea">casos positivos para entrenar</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 2' }} title={`${calidad.rotulo}. ${plano(calidad.texto)}`}>
          <span className="kpi-lbl"><span>{calidad.rotulo}</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra texto={pctDirecto(T.ventas_sin_cliente_pct, 1)} sec />
            </div>
          </div>
          <p className="e2-linea">de las ventas no tiene cliente</p>
        </div>
      </Banda>

      <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}>
        <div className="e3-v03-cab">
          <p className="e3-conclusion">{CONCLUSION_ANTES}<b>{CONCLUSION_LIMITE}</b></p>
        </div>
        <div className="e3-v03-graf">
          <Lienzo className="lienzo">
            {({ w, h }) => <TarjetaPuntaje filas={FILAS} tope={TOPE_ESCALA} k={k} w={w} h={h} />}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}

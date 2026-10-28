// V03 · ¿Se puede hacer? (Parte A 1.1 a 1.6; diapositivas 4 y 5 de C3). Banda de cifras con la tarjeta
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
//   4, «Los datos alcanzan y el límite es quién opera la lista», con el límite en --acc. A la derecha, lo
//   barato del MVP (diapositiva 5) si hay lugar (V03.css lo oculta en la ventana lógica de 1152) y el
//   botón que lo abre.
// - Explorar: el MVP de la diapositiva 5 (cinco pasos y tres hechos), en el lugar del gráfico y centrado
//   en el alto de la tarjeta. Cerrado al llegar; el guion de la 5 está en las notas (N).
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) y el texto de C3 (contenido_e3.js).

import { useState } from 'react'
import { Lienzo } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { fijo, pctDirecto } from '../formato.js'
import { Rico, plano, sinCodigos } from '../texto.jsx'
import { decision } from '../decisiones.js'
import { BotonExplorar } from '../controles.jsx'
import { Cifra } from '../cifra.jsx'
import { TarjetaPuntaje } from './V03Puntaje.jsx'
import './V03.css'

const T = D3.tecnica
const D4 = C3.DIAPOSITIVAS.find((d) => d.n === 4)
const D5 = C3.DIAPOSITIVAS.find((d) => d.n === 5)
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

// Lo barato del MVP (diapositiva 5): «USD 0 en licencias y 1 computadora».
const [LIC, PC] = D5.hechos
const MVP_CORTO = `MVP: ${plano(LIC.valor)} ${plano(LIC.texto)} y ${plano(PC.valor)}`

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

// El MVP de la diapositiva 5, detrás de «Explorar»: los pasos en orden y los tres hechos debajo.
function Mvp() {
  return (
    <div style={{ flex: '1 1 0', minHeight: 0, marginTop: 'clamp(6px, 1.6cqh, 20px)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'clamp(8px, 2cqh, 22px)' }}>
      <ol style={{ display: 'grid', gridTemplateColumns: `repeat(${D5.pasos.length}, minmax(0, 1fr))`,
                   gap: 'clamp(8px, 1cqw, 16px)', margin: 0, padding: 0, listStyle: 'none' }}>
        {D5.pasos.map((p, i) => (
          <li key={p.titulo} style={{ minWidth: 0, border: '1px solid var(--bd)', borderTop: '3px solid var(--azul3)',
                                      padding: 'clamp(6px, 1.4cqh, 14px) clamp(8px, 0.9cqw, 14px)' }}>
            <span className="kpi-lbl"><span>{`${i + 1} · ${p.titulo}`}</span></span>
            <p className="e2-nota"><Rico t={p.texto} /></p>
          </li>
        ))}
      </ol>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${D5.hechos.length}, minmax(0, 1fr))`,
                    gap: 'clamp(8px, 1cqw, 16px)' }}>
        {D5.hechos.map((h) => (
          <p key={h.valor} className="e2-linea" style={{ margin: 0 }}>
            <b><Rico t={h.valor} /></b>{' '}<Rico t={sinCodigos(h.texto)} />
          </p>
        ))}
      </div>
    </div>
  )
}

export const meta = { id: 'V03', dc: 'A-TEC' }

export default function V03SePuedeHacer() {
  const k = useEscalaTexto()
  const [explorar, setExplorar] = useState(false)
  const datos = filaDe(T.condiciones.find((c) => c.id === 'datos'))
  const calidad = filaDe(T.condiciones.find((c) => c.id === 'calidad'))
  // Tocado con el mouse, el botón suelta el foco: las flechas siguen pasando de vista (patrón de V07).
  const soltar = (e) => { if (e.detail) e.target.closest?.('button')?.blur() }
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
          {explorar
            ? <p className="e3-conclusion">{plano(D5.titulo)}</p>
            : <p className="e3-conclusion">{CONCLUSION_ANTES}<b>{CONCLUSION_LIMITE}</b></p>}
          {!explorar && (
            <span className="e3-v03-mvp tabular"
                  title={D5.hechos.map((x) => `${plano(x.valor)} ${plano(x.texto)}`).join(' · ')}>{MVP_CORTO}</span>
          )}
          <span style={{ alignSelf: 'center', display: 'flex' }} onClick={soltar}>
            <BotonExplorar abierto={explorar} onCambio={setExplorar} />
          </span>
        </div>
        {explorar ? <Mvp /> : (
          <div className="e3-v03-graf">
            <Lienzo className="lienzo">
              {({ w, h }) => <TarjetaPuntaje filas={FILAS} tope={TOPE_ESCALA} k={k} w={w} h={h} />}
            </Lienzo>
          </div>
        )}
      </div>
    </section>
  )
}

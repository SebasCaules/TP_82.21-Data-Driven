// V03 · ¿Se puede hacer? (Parte A 1.1 a 1.6; diapositivas 4 y 5 de C3). Misma forma que la vista 5:
// banda de cifras con la tarjeta de decisión a la derecha y un gráfico a todo el ancho debajo.
//
// - Banda: el puntaje técnico, la cifra que responde la pregunta y la única al tamaño máximo (F16;
//   regla 13 H1 del E2), los casos para entrenar de la condición «Datos» (G10) y las ventas sin cliente
//   de la condición «Calidad» (C19). Anchos 2 / 3 / 2 como la 5 (W2.0): con la letra ×k, una tarjeta
//   más ancha deja sin lugar a las otras a 1366 × 768. Rótulos de hasta 15 caracteres para que entren
//   en una línea; la fila entera de C3, al title.
// - Decisión: el título de la diapositiva 4 de C3 («Sí, con condiciones: los datos alcanzan y el límite
//   es quién opera la lista», 74 caracteres) sin el tramo de los datos, que ya dicen la banda y el
//   gráfico; el resto, al title. Par «A-TEC · factibilidad media» de decisiones.js.
// - Gráfico: el puntaje de cada una de las cuatro condiciones (PuntajeDimensiones, la misma pieza que la
//   vista 6), con el tramo de factibilidad media de la escala de D3 sombreado y el promedio punteado. La
//   barra que hay que mirar, la capacidad humana (el límite que dice la decisión), en --acc; las demás en
//   gris (regla 12 del E2). Las condiciones que la banda no cubre llevan su razón al lado, de la fila de
//   C3 sin la cita al relevamiento (va al title). Arriba, a la derecha, lo barato del MVP (diapositiva 5:
//   USD 0 en licencias y 1 computadora), al lado del botón que lo abre.
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
import PuntajeDimensiones from '../PuntajeDimensiones.jsx'

const T = D3.tecnica
const D4 = C3.DIAPOSITIVAS.find((d) => d.n === 4)
const D5 = C3.DIAPOSITIVAS.find((d) => d.n === 5)
const TOPE_ESCALA = T.escala[T.escala.length - 1].hasta

// La fila de C3 de cada condición de D3: el rótulo de C3 es el comienzo del nombre de D3 («Datos» y
// «Datos suficientes»).
const filaDe = (c) => D4.filas.find((f) => c.nombre.startsWith(f.rotulo))
// La razón corta de una fila: hasta los dos puntos, el punto y coma o el punto («Sin servidor ni BI»).
const razon = (t) => (t || '').split(/[:;.](?:\s|$)/)[0]

const ID_LIMITE = 'capacidad_humana'
const LIMITE = T.condiciones.find((c) => c.id === ID_LIMITE)
// El tramo de la escala de la cátedra en el que cae el promedio (D3: «Factibilidad media», 2,1 a 2,5).
const TRAMO = T.escala.find((e) => e.nivel === T.nivel)
// Lo barato del MVP (diapositiva 5): «USD 0 en licencias y 1 computadora».
const [LIC, PC] = D5.hechos
const MVP_CORTO = `MVP: ${plano(LIC.valor)} ${plano(LIC.texto)} y ${plano(PC.valor)}`

// La decisión: el título de la diapositiva 4 sin «los datos alcanzan y». Si C3 cambia de forma, queda el
// título entero y la verificación avisa si pasa de 60 caracteres.
const [, CABEZA, COLA] = D4.titulo.match(/^(.+?):.*\by\s+(.+)$/) ?? []
const CORTA = CABEZA && COLA ? `${CABEZA}: ${COLA}` : D4.titulo
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
  // Cuatro filas, las dos plaquetas de arriba (tramo y promedio) y el eje.
  const tope = Math.round((4 * 62 + 90) * k + 14)
  const datos = filaDe(T.condiciones.find((c) => c.id === 'datos'))
  const calidad = filaDe(T.condiciones.find((c) => c.id === 'calidad'))
  const dims = T.condiciones.map((c) => ({
    nombre: c.nombre,
    valor: c.puntaje,
    enfasis: c.id === ID_LIMITE,
    // La banda ya explica datos y calidad; la infraestructura y la capacidad humana, al lado de su barra.
    nota: c.id === 'datos' || c.id === 'calidad' ? undefined : razon(sinCodigos(filaDe(c)?.texto)),
  }))
  const tramo = TRAMO && {
    desde: TRAMO.desde, hasta: TRAMO.hasta,
    rotulo: `${TRAMO.nivel.toLowerCase()} · ${fijo(TRAMO.desde, 1)} a ${fijo(TRAMO.hasta, 1)}`,
  }
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
          <p className="e2-linea">{`promedio de las ${T.condiciones.length} condiciones`}</p>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1cqw, 16px)' }}>
          <span className="kpi-lbl frase" style={{ flex: '1 1 auto' }}>
            <span>{explorar ? plano(D5.titulo) : 'Puntaje de cada condición técnica'}</span>
            {!explorar && <b className="tabular" title={D5.hechos.map((x) => `${plano(x.valor)} ${plano(x.texto)}`).join(' · ')}>{MVP_CORTO}</b>}
          </span>
          <BotonExplorar abierto={explorar} onCambio={setExplorar} />
        </div>
        {explorar ? <Mvp /> : (
          <div style={{ flex: '1 1 0', minHeight: 0, maxHeight: tope, marginTop: 'clamp(6px, 1.6cqh, 20px)',
                        display: 'flex', flexDirection: 'column' }}>
            <Lienzo className="lienzo">
              {({ w, h }) => (
                <PuntajeDimensiones dims={dims} tope={TOPE_ESCALA} tramo={tramo} k={k} w={w} h={h}
                                    promedio={{ valor: T.promedio, rotulo: `promedio ${fijo(T.promedio, 2)}` }} />
              )}
            </Lienzo>
          </div>
        )}
      </div>
    </section>
  )
}

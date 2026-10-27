// V04 · ¿El modelo mejora a la regla? (Parte A 2.2, 2.3 y 2.5 · Parte B 4.1 a 4.5 · Parte C 7.1 a 7.3;
// diapositivas 6 y 7 de C3). (27/10, W2) Misma forma que V05: banda de cifras con la tarjeta de decisión
// a la derecha y un gráfico a todo el ancho debajo.
//
// - Banda: sin filtrar, la logística acierta +0,89 puntos más que la regla, con un intervalo que incluye
//   el 0 (G17); en la lista que sale, 500 contactables por mes, la regla acierta 75,8 % (H16) y la
//   logística ajustada 73,9 % (H15), 29 aciertos menos (H48). La cifra dominante (regla 13 H1 del E2) es
//   la de la regla en la lista que sale, en --acc como su barra del gráfico. Anchos 3 / 3 / 2 y no los
//   2 / 3 / 2 de V05: con la letra ×k, «Mejora sin filtrar» y su frase no entran en dos de siete a
//   1366 × 768, y una frase de tres renglones (o de dos bajo la cifra grande) agranda la banda. Por eso
//   la tercera dice solo «29 aciertos menos» (cifra y nombre sin partir); «misma lista» y el horizonte
//   (los 3 meses de validación, que dice la frase del gráfico), al title.
// - Decisión: «C-MOD · sale la regla» de decisiones.js (MOD-05, MOD-06 y VER-MVP del registro de
//   decisiones de los hitos; la Parte C 7 cierra la comparación) y el título de la diapositiva 6 de C3
//   (≤ 60 caracteres); el de la 7 y las llamadas, al title.
// - Gráfico: precisión de la lista de 500 por modelo, validación sin filtrar (F07, F08, G11, G13 a G15),
//   en el orden de D3; la regla en --acc y el resto en gris. Los cuatro métodos quedan a la par y lejos
//   de los dos pisos: eso es «por más que el ruido».
// - Explorar: el mismo gráfico en entrenamiento, con el techo de la lista en la frase (G12): el gradient
//   boosting llega casi al techo y en validación empata (memoriza). El techo no va como línea: pisaba los
//   rótulos de las barras de 62 %. Cerrado al llegar.
// - A las notas (N, guion de las diapositivas 6 y 7): los dos pisos en palabras, el ajuste de la etapa 3
//   (H01, H08), los 483 lugares no contactables (H45), el control de fugas y la importancia por
//   permutación (H21); el largo de la lista y el filtro van al anexo A2.
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) y el texto de C3 (contenido_e3.js).

import { useState } from 'react'
import { Lienzo, BarrasH } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { NBSP, aciertos, entero, fijo, pct } from '../formato.js'
import { plano } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { BotonExplorar, Opciones } from '../controles.jsx'
import { Cifra } from '../cifra.jsx'

const MD = D3.modelos
const L = D3.lista
const D6 = C3.DIAPOSITIVAS.find((d) => d.n === 6)
const D7 = C3.DIAPOSITIVAS.find((d) => d.n === 7)

// La decisión: el modelo no reemplaza a la regla (C-MOD de decisiones.js).
const ID_DECISION = 'C-MOD'
const DECISION = decision(ID_DECISION, {
  llano_corto: D6.titulo,
  llano: `${D6.titulo}. ${D7.titulo}.`,
  decision: D6.titulo,
  justificacion: D6.callouts.concat(D7.callouts).map((c) => `${plano(c.titulo)}: ${plano(c.texto)}`).join(' '),
})

const CR = MD.contra_regla
const LARGO = L.elegida.largo_mes
const lista = (metodo, filtro) =>
  L.filas.find((f) => f.tipo === 'lista' && f.metodo === metodo && f.filtro === filtro && f.largo_mes === LARGO)
const REGLA = lista(L.elegida.metodo, L.elegida.filtro)
const MODELO = lista(L.elegida_modelo.metodo, L.elegida_modelo.filtro)
const COMP = L.comparaciones.find((c) => c.filtro === L.elegida.filtro && c.largo_mes === LARGO)

const CONJUNTOS = [{ valor: 'validacion', texto: 'Validación' }, { valor: 'entrenamiento', texto: 'Entrenamiento' }]

export const meta = { id: 'V04', dc: ID_DECISION }

export default function V04ModeloORegla() {
  const k = useEscalaTexto()
  const [explorar, setExplorar] = useState(false)
  const [conjunto, setConjunto] = useState('validacion')
  const ent = conjunto === 'entrenamiento'
  const tope = Math.round((6 * 56 + 56) * k)
  const barras = MD.filas.filter((f) => f[conjunto]).map((f) => ({
    etiqueta: f.nombre,
    valor: f[conjunto].precision,
    enfasis: f.grupo === 'regla',
  }))
  const techo = MD.entrenamiento.techo_precision
  return (
    <section className="pant v04">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta" style={{ gridColumn: 'span 3' }}
             title={`Logística menos regla en la lista de ${entero(LARGO)} sin filtrar, validación. ${plano(D6.callouts[0].texto)}`}>
          <span className="kpi-lbl"><span>Mejora sin filtrar</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra num={fijo(CR.diferencia_pp, 2, true)} sec />
            </div>
          </div>
          <p className="e2-linea">{`puntos para la logística; intervalo ${fijo(CR.ic95_pp[0], 2, true)} a ${fijo(CR.ic95_pp[1], 2, true)}`}</p>
        </div>

        <div className="tarjeta e2-central" style={{ gridColumn: 'span 3' }}
             title={`Precisión de la regla del umbral en la lista que sale. ${plano(D7.callouts[1].texto)}`}>
          <span className="kpi-lbl"><span>Regla, lista que sale</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra texto={pct(REGLA.precision, 1)} /></div>
          </div>
          <p className="e2-linea">{`${entero(LARGO)}${NBSP}contactables por mes`}</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 2' }}
             title={`Precisión de la logística ajustada en la misma lista: ${aciertos(COMP.aciertos_de_mas)} aciertos menos que la regla en ${MD.validacion.cortes} meses de validación (${entero(MD.validacion.largo_lista)} contactos). ${plano(D7.titulo)}.`}>
          <span className="kpi-lbl"><span>Logística</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra texto={pct(MODELO.precision, 1)} sec /></div>
          </div>
          <p className="e2-linea">{`${aciertos(COMP.aciertos_de_mas)}${NBSP}aciertos menos`}</p>
        </div>
      </Banda>

      <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1cqw, 16px)' }}>
          <span className="kpi-lbl frase" style={{ flex: '1 1 auto' }}>
            <span>{`Precisión de la lista de ${entero(LARGO)} por mes, sin filtrar${ent ? ', en entrenamiento' : ''}`}</span>
            <b className="tabular">
              {ent
                ? `${MD.entrenamiento.cortes} cortes; techo ${pct(techo, 1)}`
                : `${entero(MD.validacion.largo_lista)} contactos en ${MD.validacion.cortes} meses de validación`}
            </b>
          </span>
          {explorar && (
            <Opciones etiqueta="Conjunto" valor={conjunto} onCambio={setConjunto} opciones={CONJUNTOS} />
          )}
          <BotonExplorar abierto={explorar}
                         onCambio={(v) => { setExplorar(v); if (!v) setConjunto('validacion') }} />
        </div>
        <div style={{ flex: '1 1 0', minHeight: 0, maxHeight: tope, marginTop: 'clamp(6px, 1.6cqh, 20px)',
                      display: 'flex', flexDirection: 'column' }}>
          <Lienzo className="lienzo">
            {({ w, h }) => (
              <BarrasH
                datos={barras} w={w} h={h}
                formato={(v) => pct(v, 1)}
                formatoEje={(v) => pct(v, 0)}
                anchoEtiqueta={Math.round(270 * k)}
                tituloEje="Precisión de la lista"
                tope={1}
              />
            )}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}

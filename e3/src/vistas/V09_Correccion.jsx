// V09 · ¿Qué le corregimos al Grupo 5? (01/11, W5; diapositiva 14 de C3). La corrección del Grupo 2 al consolidado
// del E3 del Grupo 5, en el formato de la devolución de la cátedra al E2: una fila por bloque de secciones, «Completo»
// o «Revisar». (01/11) Con la planilla v2.0: 13 bloques, 5 en «Revisar» (la v1.0 tenía 56 filas y 20).
//
// - Banda: la central, los bloques a revisar sobre el total (en terracota: es lo que no cierra); al lado, el conteo
//   por parte (General, A a D), una celda por bloque, las de «Revisar» en terracota y primero. Es el gráfico de la
//   vista (el único .lienzo).
// - Decisión: «E-CRI · aplicado», el criterio de la planilla v2.0: un bloque queda en «Revisar» solo si tiene un error
//   que cambia una cifra o el método, o algo que la cátedra ya nos pidió corregir.
// - Debajo, las cinco observaciones en «Revisar»: título, sección puntual («ref») y página del PDF del Grupo 5, como
//   las escribe la planilla, y la corrección en una línea. La cita textual («Dice»), el problema y la cifra van al
//   title del ítem (02/11, W6: UX-11 y VIS-06; el oral no la lee). Arriba de la lista, qué se revisó y en qué formato
//   (C3, diapositiva 14, «contexto»; COB-20). Los textos propios llevan NBSP antes de «%», como pct() de formato.js;
//   las citas quedan textuales (UX-18). El subtítulo dice de qué son las cinco: cuatro de cifras o de método (A 2.2, B 3.3, D 10.3 y
//   D 11.2) y la quinta, del orden del documento (la carátula). Hasta la v1.0 decía «dos cambian cifras; tres piden
//   escribir lo que falta», que dejó de ser cierto con el top nuevo.
// (02/11, W7) Planilla v2.2: seis observaciones en los mismos cinco bloques. La cuarta (T6, el umbral del piloto de
//   su 10.2) va en el bloque de go-live junto a la tercera; salió de revisarlos con lo que el Grupo 4 nos marcó a
//   nosotros. La conclusión pasa a «Cinco son de cifras o de método; la sexta, del orden del documento».
// Ninguna cifra ni texto de la corrección escrito acá: todo sale de D3.correccion (correcciones.json de _build/E/).

import { Lienzo } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { NBSP, entero } from '../formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { Cifra } from '../cifra.jsx'
import { sinCortes } from '../texto.jsx'
import { anchoTexto as ancho } from '../medir.js'
import './V09.css'

const CO = D3.correccion
const T = CO.total
const DOC = CO.documento
const D14 = C3.DIAPOSITIVAS.find((d) => d.n === 14)

const DECISION = decision('E-CRI', {
  llano_corto: 'Revisar: cifra, método o lo que la cátedra ya pidió',
  llano: 'Un bloque de secciones queda en «Revisar» solo si tiene un error que cambia una cifra o el método, o algo '
    + `que la cátedra ya nos pidió corregir. De ${entero(T.filas)} bloques, ${entero(T.revisar)} quedan en «Revisar» `
    + `y ${entero(T.completo)} en «Completo».`,
  decision: 'una fila por bloque de secciones, «Completo» o «Revisar» y la sugerencia, como consultores externos',
  justificacion: 'el formato de la devolución de la cátedra al Grupo 2 en el E2; las cifras se recalcularon con los '
    + 'CSV del caso, y lo que el Grupo 5 cita de respuestas de Casa Óga que no tenemos no se marca como error.',
})

const TITULO_CENTRAL = `${entero(T.revisar)} de ${entero(T.filas)} bloques de secciones en «Revisar» y `
  + `${entero(T.completo)} en «Completo». Consolidado del Grupo 5 ${DOC.version}, del ${DOC.fecha}, `
  + `${entero(DOC.paginas)} páginas.`
const CONCLUSION = 'Cinco son de cifras o de método; la sexta, del orden del documento'

/** «70%» → «70 %» en los textos propios (no en las citas del Grupo 5): el mismo espacio que pone pct(). */
const conEspacio = (t) => String(t).replace(/(\d)%/g, `$1${NBSP}%`)

/** «D 11.2 · pág. 74», como la planilla: la sección puntual (ref); la carátula, solo la parte. */
const donde = (t) => `${t.parte}${t.parte === 'General' ? '' : ` ${t.ref}`} · pág.${NBSP}${t.pagina}`

export const meta = { id: 'V09', dc: 'E-CRI' }

// ---------------------------------------------------------------- el conteo por parte (el gráfico)

const INK = 'var(--ink)'
const CTX = 'var(--e3-ctx, #5a6478)'
const CTX_R = 'var(--e3-ctx-relleno, #a9b1bf)'
const TERRA = 'var(--terra)'

function Conteo({ w, h, k }) {
  const n = CO.conteo.length
  const max = Math.max(...CO.conteo.map((c) => c.filas))
  const gap = 14 * k
  const cw = (w - gap * (n - 1)) / n
  // letra: el rótulo mono, la cifra de «Revisar» y su «de N»; baja si el alto no alcanza (1152 × 640)
  // y también si el ancho de una columna no alcanza para «Parte D» o «2 de 4»
  const alto = Math.max(0.6, Math.min(1, h / (92 * k)))
  const necesita = Math.max(...CO.conteo.map((c) => Math.max(
    ancho(c.rotulo.toUpperCase(), 11.5 * k, 600, true) + 0.08 * 11.5 * k * c.rotulo.length,
    ancho(entero(c.revisar), 24 * k, 700) + 5 * k + ancho(`de ${entero(c.filas)}`, 14 * k, 500))))
  const ajuste = Math.min(alto, (cw - 2) / necesita)
  const fRot = 11.5 * k * ajuste
  const fNum = 24 * k * ajuste
  const fDe = 14 * k * ajuste
  const sep = 1.5 * k
  const celda = (cw - sep * (max - 1)) / max
  // las cajas de texto llegan un 25 % debajo de la base y un 95 % arriba: el número no toca el rótulo
  const yRot = fRot
  const yNum = yRot + fRot * 0.3 + fNum * 0.95 + 4 * k * ajuste
  const yCel = yNum + fNum * 0.25 + 5 * k * ajuste
  const hCel = Math.max(6, h - yCel - 1)
  const aria = CO.conteo.map((c) => `${c.rotulo}: ${c.revisar} de ${c.filas} a revisar`).join('; ')
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`Secciones en «Revisar» por parte, una celda por sección: ${aria}`}>
      {CO.conteo.map((c, i) => {
        const x = i * (cw + gap)
        const tNum = entero(c.revisar)
        return (
          <g key={c.parte}>
            <title>{`${c.rotulo}: ${c.filas} secciones, ${c.revisar} en «Revisar» y ${c.completo} en «Completo».`}</title>
            <text x={x} y={yRot} fontSize={fRot} fontWeight={600} fill={CTX} fontFamily="var(--mono)"
                  letterSpacing={`${0.08 * fRot}`} style={{ textTransform: 'uppercase' }}>{c.rotulo}</text>
            <text x={x} y={yNum} fontSize={fNum} fontWeight={700} fill={TERRA} className="tabular">{tNum}</text>
            <text x={x + ancho(tNum, fNum, 700) + 5 * k * ajuste} y={yNum} fontSize={fDe} fontWeight={500} fill={INK}
                  className="tabular">{`de ${entero(c.filas)}`}</text>
            {Array.from({ length: c.filas }, (_, j) => (
              <rect key={j} x={x + j * (celda + sep)} y={yCel} width={celda} height={hCel}
                    fill={j < c.revisar ? TERRA : CTX_R} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------- la vista

export default function V09Correccion() {
  const k = useEscalaTexto()
  return (
    <section className="pant v09">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta e2-central e3-v09-central" style={{ gridColumn: 'span 3' }} title={TITULO_CENTRAL}>
          <span className="kpi-lbl"><span>A revisar</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra num={entero(T.revisar)} unidad={`${NBSP}de${NBSP}${entero(T.filas)}`} />
            </div>
          </div>
          {/* (02/11, W7) Era «bloques con algo que corregir»: desde la v2.2, los Completo también llevan sugerencias */}
          <p className="e2-linea">bloques en «Revisar»</p>
        </div>

        <div className="tarjeta e3-v09-conteo" style={{ gridColumn: 'span 4' }}>
          <span className="kpi-lbl"><span>Revisar por parte</span></span>
          <div className="e3-v09-lienzo">
            <Lienzo className="lienzo">
              {({ w, h }) => <Conteo w={w} h={h} k={k} />}
            </Lienzo>
          </div>
        </div>
      </Banda>

      <div className="tarjeta e3-v09-obs">
        <p className="e3-conclusion">{CONCLUSION}</p>
        <p className="e3-v09-ctx">{D14.contexto}</p>
        <ol className="e3-v09-lista">
          {CO.top.map((t) => (
            <li key={t.id} className="e3-v09-item"
                title={`Dice: «${t.cita}»\n${conEspacio(t.problema)} (${conEspacio(t.cifra)})`}>
              <span className="e3-v09-n tabular">{t.n}</span>
              <div className="e3-v09-txt">
                <p className="e3-v09-tit">
                  <b>{sinCortes(conEspacio(t.titulo_corto))}</b>
                  <span className="e3-v09-donde tabular">{donde(t)}</span>
                </p>
                <p className="e3-v09-corr"><b>Corrección.</b>{` ${sinCortes(conEspacio(t.correccion))}`}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

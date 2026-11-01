// A4 · ¿Qué riesgos hay y qué se hace con cada uno? (Parte C 6.2 y 6.3; anexo A4 de C3). Respaldo: se
// abre si preguntan por los riesgos (guion, «Anexos de respaldo»). La vista 6 nombra los tres críticos en su banda;
// acá están los 13 y, arriba de la tabla, la señal de cada crítico.
//
// - Frase: cuántos son críticos sobre el total (D3.legal, J22: el conteo del anexo A4).
// - Pieza: la tabla del anexo, con los tres críticos de la 6.3 marcados (`destacar` de C3). Probabilidad e
//   impacto se escriben enteros (Alta, Media, Baja) en lugar de A, M y B: así la tabla no necesita la
//   leyenda del pie de C3, que va al title (sin pie en pantalla, regla 12 del E2).
// - (Crítica del W3, hallazgo 4a) La fila 12 se lee como la dejó la D 11.2, que modifica la C 6.2, fila 12.
//   (F6b, 28/10, H-2-071) Desde la D v1.2 la 11.2 nombra el género X: la celda dice el alto valor y el género X
//   en test y el title, todo lo que cambió. Texto y title salen de riesgo12.js, el mismo de la vista 6.
// - (01/11, a la vista) Arriba de la tabla, los tres críticos de la diapositiva 11 (C 6.3 a 6.5), uno por columna:
//   qué se mide, el umbral y quién lo mira. Hasta el 01/11 eso iba detrás de un botón en la vista 6. La tabla achica
//   su letra para entrar en lo que queda.
// Ninguna cifra escrita acá: la tabla es la de C3, las señales son las de la diapositiva 11 de C3 y la frase y la
// fila 12 salen de D3.

import { C3 } from '../contenido_e3.js'
import { D3 } from '../datos_e3.js'
import { entero } from '../formato.js'
import { Rico, plano } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { TablaSvg, TarjetaRespaldo, columnasDeAnexo, filasDeAnexo } from '../Respaldo.jsx'
import { RIESGO_12, TITULO_12 } from '../riesgo12.js'
import './R_A4.css'

const A = C3.ANEXOS.find((a) => a.n === 'A4')
const L = D3.legal
const NIVEL = { A: 'Alta', M: 'Media', B: 'Baja' }
const COL = Object.fromEntries(A.columnas.map((c, j) => [c, j]))
const NIVELES = [COL['Prob.'], COL.Impacto]
if (NIVELES.some((j) => j == null)) throw new Error('R_A4: el anexo A4 de C3 no trae «Prob.» o «Impacto»')

const FILAS = filasDeAnexo(A).map((f) => ({
  ...f,
  celdas: f.celdas.map((c, j) => (NIVELES.includes(j) ? NIVEL[c] ?? c
    : j === COL.Riesgo && f.celdas[COL['#']] === '12' ? RIESGO_12 : c)),
  ...(f.celdas[COL['#']] === '12' ? { title: TITULO_12 } : {}),
}))
if (!FILAS.some((f) => f.celdas[COL.Riesgo] === RIESGO_12)) throw new Error('R_A4: el anexo A4 de C3 no trae la fila 12')
const COLUMNAS = columnasDeAnexo(A, {
  [COL['#']]: { alinear: 'izq' },
  [COL['Prob.']]: { titulo: 'Probab.' },
})

// Los críticos, en el orden de las columnas de la diapositiva 11 (A4.destacar sigue ese orden: 4, 2 y 6).
const D11 = C3.DIAPOSITIVAS.find((d) => d.n === 11)
const CRITICOS = A.destacar.map((i, j) => ({ n: A.filas[i][COL['#']], senal: D11.columnas[j] }))
if (CRITICOS.length !== L.riesgos_criticos || CRITICOS.some((c) => !c.senal)) {
  throw new Error('R_A4: los críticos del anexo A4 no coinciden con las columnas de la diapositiva 11')
}

function Criticos() {
  return (
    <div className="e3-ra4-criticos" style={{ gridTemplateColumns: `repeat(${CRITICOS.length}, minmax(0, 1fr))` }}
         title={`${plano(D11.titulo)}. ${plano(D11.nota)}`}>
      {CRITICOS.map((c) => (
        <div key={c.n}>
          <p className="e3-ra4-tit">{`Riesgo ${c.n} · ${plano(c.senal.riesgo)}`}</p>
          {c.senal.filas.map((f) => (
            <p key={f.rotulo} className="e3-ra4-fila"><span>{`${f.rotulo}:`}</span>{' '}<Rico t={f.texto} /></p>
          ))}
        </div>
      ))}
    </div>
  )
}

export const meta = { id: 'A4' }

export default function RA4Riesgos() {
  const k = useEscalaTexto()
  return (
    <TarjetaRespaldo
      clase="ra4"
      frase="Cada riesgo y qué se hace con él; en azul, los críticos de la C 6.3"
      cifra={`${entero(L.riesgos_criticos)} críticos de ${entero(L.riesgos)}`}
      arriba={<Criticos />}
      title={`${plano(A.titulo)}. ${plano(A.pie ?? '')} Fuente: ${A.fuente} · D 11.2 · registro ${A.ids.join(', ')}, J21, J22, J23`}
      dibujo={({ w, h }) => (
        <TablaSvg w={w} h={h} k={k} columnas={COLUMNAS} filas={FILAS} etiqueta={plano(A.titulo)} />
      )}
    />
  )
}

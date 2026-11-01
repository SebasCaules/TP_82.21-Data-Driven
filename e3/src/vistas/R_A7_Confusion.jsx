// A7 · ¿Dónde fallan el modelo y la regla? (Parte B 4.3 y 4.4 y Parte D 8.1; anexo A7 de C3).
// Respaldo: se abre si preguntan por la matriz de confusión o de dónde salen los USD 5,38 (guion, «Anexos
// de respaldo»).
//
// - Pieza: las dos matrices lado a lado, la logística y la regla del umbral, con la misma disposición que
//   la D 8.1 (filas: pasó o no su umbral; columnas: en la lista o fuera). El acierto, sobre --azul1 y en
//   --acc; el resto en tinta. Debajo de cada una, su valor neto. Al pie del dibujo, el valor de cada celda
//   en pesos (B 4.4), el mismo en las dos mediciones (la D 8.1 usa los valores de la B 4.4), y por qué la
//   regla tiene decimales (D 8.1: empates del borde repartidos en proporción).
// - (Crítica del W3, hallazgo 2) En validación la logística es la de la Parte B, sin ajustar (G19, G34:
//   1.237 aciertos, 82,5 %); la ajustada acierta 1.239 (H05). Por eso se rotula «Regresión logística (Parte
//   B)»; «Logística ajustada» queda para la medición de test, que es el modelo final de la D 8.1.
// - Al llegar, la medición del anexo de C3: la lista de 500 sin filtro en los cortes de validación, de
//   donde sale el valor neto de la B 4.4 (D3.economia.matrices, G33 y G40).
// - Explorar (cerrado al llegar): «Test» muestra la matriz de la D 8.1, la lista de 500 contactables por
//   corte en los cortes de test, con el valor por año (D3.test.metodos, J03 a J06 y J08). La frase dice la
//   población de cada una (las filas que suman las cuatro celdas: 7.173 en validación, A 2.2; 9.962
//   contactables en test, D 8.1): no son la misma lista.
// Ninguna cifra escrita acá: validación sale de D3.economia.matrices (las mismas cifras del anexo A7 de
// C3), test de D3.test.metodos y el valor por celda de la tabla de C3.

import { useState } from 'react'
import { C3 } from '../contenido_e3.js'
import { D3 } from '../datos_e3.js'
import { ars, entero, fijo, usd } from '../formato.js'
import { plano, sinCortes } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { BotonExplorar, Opciones } from '../controles.jsx'
import { TarjetaRespaldo } from '../Respaldo.jsx'
import { anchoTexto } from '../medir.js'

const A = C3.ANEXOS.find((a) => a.n === 'A7')
const COL = Object.fromEntries(A.columnas.map((c, j) => [c, j]))
// Las cuatro celdas, en el orden de C3: acierto (VP), falso positivo, falso negativo, verdadero negativo.
const [F_VP, F_FP, F_FN, F_VN] = A.filas
const valorCelda = (f) => f[COL['Valor por caso (ARS)']]
const rotulo = (f) => f[COL.Celda]
/** «Acierto (VP)» → «acierto»: el nombre de la celda en una frase, sin la sigla. */
const enFrase = (f) => rotulo(f).replace(/\s*\([^)]*\)$/, '').toLowerCase()

const M = D3.economia.matrices
const TM = D3.test.metodos
const LARGO = D3.lista.elegida.largo_mes
const cantidad = (x) => fijo(x, Number.isInteger(x) ? 0 : 2)

const MEDICIONES = {
  validacion: {
    frase: `Lista de ${entero(LARGO)} sin filtro, ${D3.modelos.validacion.cortes} cortes de validación: ` +
      `${entero(D3.modelos.validacion.filas)} filas`,
    cifra: `valor neto ${ars(M.modelo.neto_ars)} y ${ars(M.regla.neto_ars)} en ${D3.modelos.validacion.cortes} meses`,
    metodos: [
      { nombre: 'Regresión logística (Parte B)', m: M.modelo, neto: `${ars(M.modelo.neto_ars)} en ${D3.modelos.validacion.cortes} meses` },
      { nombre: 'Regla del umbral', m: M.regla, neto: `${ars(M.regla.neto_ars)} en ${D3.modelos.validacion.cortes} meses` },
    ],
    fuente: 'B 4.3 y 4.4 · registro G19, G33, G34 y G40',
  },
  test: {
    frase: `Lista de ${entero(LARGO)} contactables por corte, ${D3.test.conjunto.cortes.length} cortes de test: ` +
      `${entero(D3.test.conjunto.contactables)} filas contactables`,
    cifra: `${usd(TM.logistica_ajustada.test.usd_anio, 2)} y ${usd(TM.regla.test.usd_anio, 2)} por año`,
    metodos: [
      { nombre: 'Logística ajustada', m: TM.logistica_ajustada.test, neto: `${usd(TM.logistica_ajustada.test.usd_anio, 2)} por año` },
      { nombre: 'Regla del umbral', m: TM.regla.test, neto: `${usd(TM.regla.test.usd_anio, 2)} por año` },
    ],
    fuente: 'D 8.1 · registro J03 a J06 y J08',
  },
}
const OPCIONES = [{ valor: 'validacion', texto: 'Validación' }, { valor: 'test', texto: 'Test' }]

export const meta = { id: 'A7' }

function Matrices({ w, h, k, medicion }) {
  const fTit = 15 * k
  const fCab = 11 * k
  const fNum = 24 * k
  const fRot = 12 * k
  const fNeto = 13.5 * k
  const gap = 36 * k
  const filasCab = ['Pasó su umbral', 'No lo pasó']
  const colsCab = ['En la lista', 'Fuera de la lista']
  const anchoFilaCab = Math.max(...filasCab.map((t) => anchoTexto(t, fRot + 1, 500))) + 14 * k
  const panelW = (w - gap) / 2
  const celdaW = (panelW - anchoFilaCab) / 2

  const altoTit = fTit * 1.7
  const altoCab = fCab * 2
  const altoNeto = fNeto * 2.2
  const altoPie = fRot * 3.8
  const celdaH = Math.max(fNum + fRot * 2.6, Math.min((h - altoTit - altoCab - altoNeto - altoPie) / 2, 140 * k))
  // El conjunto, centrado en el alto libre de la tarjeta (un poco arriba del centro), como en el E2.
  const alto = altoTit + altoCab + celdaH * 2 + altoNeto + altoPie
  const y0 = Math.max(0, (h - alto) * 0.4)
  const yM = y0 + altoTit + altoCab
  const yPie = yM + celdaH * 2 + altoNeto + fRot * 1.2

  const mono = { fontFamily: 'var(--mono)', fontWeight: 500, letterSpacing: `${0.06 * fCab}` }
  const pie = `Valor por caso: ${enFrase(F_VP)} ARS ${valorCelda(F_VP)} · ` +
    `${enFrase(F_FP)} ARS ${valorCelda(F_FP)} · los demás, ${valorCelda(F_FN)}`
  const pie2 = 'Los decimales de la regla son empates del último puesto, repartidos en proporción'

  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={medicion.metodos.map((x) => `${x.nombre}: ${cantidad(x.m.vp)} aciertos, ${cantidad(x.m.fp)} falsos positivos, ` +
           `${cantidad(x.m.fn)} falsos negativos, ${cantidad(x.m.vn)} verdaderos negativos; valor neto ${x.neto}`).join('. ')}>
      {medicion.metodos.map((met, p) => {
        const x0 = p * (panelW + gap)
        const xc = x0 + anchoFilaCab
        const celdas = [
          { f: F_VP, v: met.m.vp, fila: 0, col: 0, acierto: true },
          { f: F_FN, v: met.m.fn, fila: 0, col: 1 },
          { f: F_FP, v: met.m.fp, fila: 1, col: 0 },
          { f: F_VN, v: met.m.vn, fila: 1, col: 1 },
        ]
        return (
          <g key={met.nombre}>
            <text x={xc} y={y0 + fTit} fontSize={fTit} fontWeight={600} fill="var(--ink)">{met.nombre}</text>
            {colsCab.map((t, j) => (
              <text key={t} x={xc + celdaW * (j + 0.5)} y={y0 + altoTit + fCab} fontSize={fCab} fill="var(--mut2)"
                    textAnchor="middle" {...mono}>{t.toUpperCase()}</text>
            ))}
            {filasCab.map((t, i) => (
              <text key={t} x={x0} y={yM + celdaH * (i + 0.5)} fontSize={fRot + 1} fontWeight={500} fill="var(--ink)"
                    dominantBaseline="central">{t}</text>
            ))}
            {celdas.map((c) => {
              const cx = xc + celdaW * c.col
              const cy = yM + celdaH * c.fila
              return (
                <g key={rotulo(c.f)}>
                  <title>{`${met.nombre} · ${sinCortes(rotulo(c.f))}: ${cantidad(c.v)}`}</title>
                  <rect x={cx} y={cy} width={celdaW} height={celdaH} fill={c.acierto ? 'var(--azul1)' : 'var(--sup)'}
                        stroke="var(--bd)" />
                  <text x={cx + celdaW / 2} y={cy + celdaH / 2 - fRot * 0.55} fontSize={fNum} fontWeight={600}
                        fill={c.acierto ? 'var(--acc)' : 'var(--ink)'} textAnchor="middle" dominantBaseline="central"
                        className="tabular">{cantidad(c.v)}</text>
                  <text x={cx + celdaW / 2} y={cy + celdaH / 2 + fNum * 0.62} fontSize={fRot} fill="var(--mut2)"
                        textAnchor="middle" dominantBaseline="central">{rotulo(c.f)}</text>
                </g>
              )
            })}
            <text x={xc} y={yM + celdaH * 2 + altoNeto * 0.6} fontSize={fNeto} fill="var(--ink)">
              <tspan fontWeight={400} fill="var(--mut2)">Valor neto: </tspan>
              <tspan fontWeight={600} className="tabular">{met.neto}</tspan>
            </text>
          </g>
        )
      })}
      <text x={anchoFilaCab} y={Math.min(yPie, h - fRot * 1.8)} fontSize={fRot} fill="var(--mut2)" className="tabular">
        {sinCortes(pie)}
      </text>
      <text x={anchoFilaCab} y={Math.min(yPie + fRot * 1.4, h - fRot * 0.4)} fontSize={fRot} fill="var(--mut2)">
        {pie2}
      </text>
    </svg>
  )
}

export default function RA7Confusion() {
  const k = useEscalaTexto()
  const [explorar, setExplorar] = useState(false)
  const [cual, setCual] = useState('validacion')
  const med = MEDICIONES[cual]
  return (
    <TarjetaRespaldo
      clase="ra7"
      frase={med.frase}
      cifra={med.cifra}
      title={`${plano(A.titulo)}. ${plano(A.pie ?? '')} Fuente: ${med.fuente}`}
      controles={<BotonExplorar abierto={explorar} onCambio={(v) => { setExplorar(v); if (!v) setCual('validacion') }} />}
      opciones={explorar ? [{ rotulo: 'Medición', control: <Opciones etiqueta="Medición" valor={cual} onCambio={setCual} opciones={OPCIONES} /> }] : null}
      dibujo={({ w, h }) => <Matrices w={w} h={h} k={k} medicion={med} />}
    />
  )
}

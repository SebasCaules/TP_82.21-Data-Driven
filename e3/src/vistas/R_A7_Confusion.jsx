// A7 · ¿Dónde fallan el modelo y la regla? (Parte B 4.3 y 4.4, Parte C 7.2 y Parte D 8.1; anexo A7 de C3).
// Respaldo: se abre si preguntan por la matriz de confusión, por la validación o de dónde salen los USD 5,38
// (guion, «Anexos de respaldo»).
//
// (30/10, sin «Explorar») Hasta el 30/10 el anexo mostraba la validación y escondía el test detrás de «Explorar», y
// la vista 4 escondía ahí la diferencia en validación y la precisión de cada método. Ahora todo está a la vista, en
// un solo dibujo de cuatro piezas:
// - Arriba a la izquierda, logística menos regla con su intervalo en las cuatro listas, validación y test, sin
//   filtrar y la que sale (FILAS_TODAS y Diferencias de la vista 4: H06, J09, J11). En validación ganaba la regla;
//   en test, empate.
// - Arriba a la derecha, la precisión de la lista de 500 contactables por mes de cada método, en validación y en
//   test (H13, H15, H16, J03, J17).
// - Abajo, las matrices de confusión: en test, la lista de 500 contactables por corte de la D 8.1 (J03 a J06 y J08),
//   y en validación, la lista de 500 sin filtro de la B 4.4 de donde sale el valor neto (G33 y G40). La frase dice la
//   población de cada una (las filas que suman las cuatro celdas: 9.962 contactables en test; 7.173 en validación):
//   no son la misma lista. En validación la logística es la de la Parte B, sin ajustar (crítica del W3, hallazgo 2).
// - Al pie, el valor de cada celda en pesos (B 4.4), el mismo en las dos mediciones, y por qué la regla tiene
//   decimales (D 8.1: empates del borde repartidos en proporción).
// Un solo svg de primer nivel (paridad_e3.py: un gráfico por vista); las piezas van en <g> con su traslado.
// Ninguna cifra escrita acá: validación sale de D3.economia.matrices (las mismas cifras del anexo A7 de C3), test
// de D3.test.metodos, las precisiones de D3.test.metodos y el valor por celda de la tabla de C3.

import { C3 } from '../contenido_e3.js'
import { D3 } from '../datos_e3.js'
import { ars, entero, fijo, pct, usd } from '../formato.js'
import { plano, sinCortes } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { TarjetaRespaldo } from '../Respaldo.jsx'
import { anchoTexto } from '../medir.js'
import { Diferencias, FILAS_TODAS } from './V04_ModeloORegla.jsx'

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
const NV = D3.modelos.validacion.cortes
const NT = D3.test.conjunto.cortes.length
const cantidad = (x) => fijo(x, Number.isInteger(x) ? 0 : 2)

const MEDICIONES = [
  {
    id: 'test',
    titulo: `Test · ${entero(LARGO)} contactables por corte · ${entero(D3.test.conjunto.contactables)} filas`,
    metodos: [
      { nombre: 'Logística ajustada', m: TM.logistica_ajustada.test, neto: `${usd(TM.logistica_ajustada.test.usd_anio, 2)} por año` },
      { nombre: 'Regla del umbral', m: TM.regla.test, neto: `${usd(TM.regla.test.usd_anio, 2)} por año` },
    ],
  },
  {
    id: 'validacion',
    titulo: `Validación · ${entero(LARGO)} sin filtro · ${entero(D3.modelos.validacion.filas)} filas`,
    metodos: [
      { nombre: 'Logística (Parte B)', m: M.modelo, neto: `${ars(M.modelo.neto_ars)} en ${NV} meses` },
      { nombre: 'Regla del umbral', m: M.regla, neto: `${ars(M.regla.neto_ars)} en ${NV} meses` },
    ],
  },
]

// Precisión de la lista de 500 contactables por mes, por método, en validación y en test.
const PRECISIONES = [
  { nombre: 'Regla del umbral', v: TM.regla.validacion.precision, t: TM.regla.test.precision, enfasis: true },
  { nombre: 'Logística ajustada', v: TM.logistica_ajustada.validacion.precision, t: TM.logistica_ajustada.test.precision },
  { nombre: 'Práctica actual', v: TM.practica_actual.validacion.precision, t: TM.practica_actual.test.precision },
]

export const meta = { id: 'A7' }

const MUT2 = 'var(--mut2)'
const INK = 'var(--ink)'
const mono = (f) => ({ fontFamily: 'var(--mono)', fontWeight: 500, letterSpacing: `${0.06 * f}` })

const anchoMono = (t, f) => anchoTexto(String(t).toUpperCase(), f, 500, true) + 0.06 * f * String(t).length
/** Título de una pieza: mono, mayúsculas, en contexto; si no entra en `max`, la letra baja hasta que entra. */
function Titulo({ x, y, f, texto, max = Infinity }) {
  const fx = Math.min(f, f * (max / Math.max(1, anchoMono(texto, f))))
  return <text x={x} y={y} fontSize={fx} fill={MUT2} {...mono(fx)}>{texto.toUpperCase()}</text>
}
/** «Falso negativo (FN)» → «FN»: la sigla, si el nombre no entra en la celda. */
const sigla = (t) => (t.match(/\(([^)]+)\)$/) ?? [, t])[1]

/** Las dos matrices de una medición, lado a lado, en una caja de w × h. */
function Matrices({ w, h, k, medicion }) {
  const fTit = 13 * k
  const fCab = 10 * k
  const fRot = 10.5 * k
  const fNeto = 11.5 * k
  const gap = 16 * k
  const filasCab = ['Pasó su umbral', 'No lo pasó']
  const colsCab = ['En la lista', 'Fuera']
  // Los rótulos de fila, una sola vez, a la izquierda de la primera matriz; la segunda usa todo su panel.
  const anchoFilaCab = Math.max(...filasCab.map((t) => anchoTexto(t, fRot, 500))) + 8 * k
  const panelW = (w - anchoFilaCab - gap) / 2
  const celdaW = panelW / 2
  const masAncha = Math.max(...medicion.metodos.flatMap((x) => [x.m.vp, x.m.fn, x.m.fp, x.m.vn])
    .map((v) => anchoTexto(cantidad(v), 100, 600) / 100))
  const fNum = Math.min(20 * k, h / 9, (celdaW - 10 * k) / masAncha)
  const altoTit = fTit * 1.6
  const altoCab = fCab * 1.9
  const altoNeto = fNeto * 1.9
  const celdaH = Math.max(fNum + fRot * 2.4, (h - altoTit - altoCab - altoNeto) / 2)
  const yM = altoTit + altoCab
  return (
    <g role="img" aria-label={medicion.metodos.map((x) => `${x.nombre}: ${cantidad(x.m.vp)} aciertos, ${cantidad(x.m.fp)} falsos positivos, ` +
      `${cantidad(x.m.fn)} falsos negativos, ${cantidad(x.m.vn)} verdaderos negativos; valor neto ${x.neto}`).join('. ')}>
      {medicion.metodos.map((met, p) => {
        const x0 = p === 0 ? 0 : anchoFilaCab + panelW + gap
        const xc = anchoFilaCab + p * (panelW + gap)
        const celdas = [
          { f: F_VP, v: met.m.vp, fila: 0, col: 0, acierto: true },
          { f: F_FN, v: met.m.fn, fila: 0, col: 1 },
          { f: F_FP, v: met.m.fp, fila: 1, col: 0 },
          { f: F_VN, v: met.m.vn, fila: 1, col: 1 },
        ]
        return (
          <g key={met.nombre}>
            <text x={xc} y={fTit} fontSize={Math.min(fTit, fTit * panelW / anchoTexto(met.nombre, fTit, 600))}
                  fontWeight={600} fill={INK}>{met.nombre}</text>
            {colsCab.map((t, j) => (
              <text key={t} x={xc + celdaW * (j + 0.5)} y={altoTit + fCab} fontSize={fCab} fill={MUT2}
                    textAnchor="middle" {...mono(fCab)}>{t.toUpperCase()}</text>
            ))}
            {p === 0 && filasCab.map((t, i) => (
              <text key={t} x={x0} y={yM + celdaH * (i + 0.5)} fontSize={fRot} fontWeight={500} fill={INK}
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
                  <text x={cx + celdaW / 2} y={cy + celdaH / 2 - fRot * 0.75} fontSize={fNum} fontWeight={600}
                        fill={c.acierto ? 'var(--acc)' : INK} textAnchor="middle" dominantBaseline="central"
                        className="tabular">{cantidad(c.v)}</text>
                  <text x={cx + celdaW / 2} y={cy + celdaH / 2 - fRot * 0.75 + fNum * 0.5 + fRot * 0.8} fontSize={fRot} fill={MUT2}
                        textAnchor="middle" dominantBaseline="central">
                    {anchoTexto(rotulo(c.f), fRot, 400) > celdaW - 8 * k ? sigla(rotulo(c.f)) : rotulo(c.f)}
                  </text>
                </g>
              )
            })}
            <text x={xc} y={yM + celdaH * 2 + altoNeto * 0.65} fill={INK}
                  fontSize={Math.min(fNeto, fNeto * panelW / anchoTexto(`Valor neto: ${met.neto}`, fNeto, 600))}>
              <tspan fontWeight={400} fill={MUT2}>Valor neto: </tspan>
              <tspan fontWeight={600} className="tabular">{met.neto}</tspan>
            </text>
          </g>
        )
      })}
    </g>
  )
}

/** La precisión de la lista de cada método, en validación y en test: tres filas, dos columnas de cifras. */
function Precisiones({ w, h, k }) {
  const f = Math.min(17 * k, h / 8)
  const fCab = 10.5 * k
  const xV = w * 0.66
  const xT = w
  const yCab = fCab * 1.3
  const paso = Math.min((h - yCab - 10 * k) / PRECISIONES.length, f * 2.6)
  const y0 = yCab + 10 * k
  return (
    <g role="table" aria-label={`Precisión de la lista de ${entero(LARGO)} contactables por mes: ` +
      PRECISIONES.map((p) => `${p.nombre}, ${pct(p.v, 1)} en validación y ${pct(p.t, 1)} en test`).join('; ')}>
      <text x={xV} y={yCab} fontSize={fCab} fill={MUT2} textAnchor="end" {...mono(fCab)}>VALIDACIÓN</text>
      <text x={xT} y={yCab} fontSize={fCab} fill={MUT2} textAnchor="end" {...mono(fCab)}>TEST</text>
      <line x1={0} x2={w} y1={yCab + 5 * k} y2={yCab + 5 * k} stroke={INK} strokeWidth="1.5" />
      {PRECISIONES.map((p, i) => {
        const y = y0 + paso * (i + 0.5)
        const peso = p.enfasis ? 700 : 500
        return (
          <g key={p.nombre}>
            <text x={0} y={y} fontSize={f} fontWeight={peso} fill={p.enfasis ? INK : 'var(--e3-ctx, #5a6478)'}
                  dominantBaseline="central">{p.nombre}</text>
            <text x={xV} y={y} fontSize={f} fontWeight={peso} fill={p.enfasis ? INK : 'var(--e3-ctx, #5a6478)'}
                  textAnchor="end" dominantBaseline="central" className="tabular">{pct(p.v, 1)}</text>
            <text x={xT} y={y} fontSize={f} fontWeight={p.enfasis ? 700 : 600} fill={p.enfasis ? 'var(--acc)' : INK}
                  textAnchor="end" dominantBaseline="central" className="tabular">{pct(p.t, 1)}</text>
            <line x1={0} x2={w} y1={y0 + paso * (i + 1)} y2={y0 + paso * (i + 1)} stroke="var(--bd)" strokeWidth="1" />
          </g>
        )
      })}
    </g>
  )
}

function Dibujo({ w, h, k }) {
  const fT = 11 * k
  const gapX = 34 * k
  const gapY = 16 * k
  const fPie = 11 * k
  const altoPie = fPie * 1.5
  const altoTit = fT * 1.9
  const hArriba = Math.round((h - altoPie - gapY * 2) * 0.56)
  const hAbajo = h - altoPie - gapY * 2 - hArriba
  const wIzq = Math.round((w - gapX) * 0.6)
  const wDer = w - gapX - wIzq
  const wMat = (w - gapX) / 2
  const yAbajo = hArriba + gapY
  const pie = `Valor por caso: ${enFrase(F_VP)} ARS ${valorCelda(F_VP)} · ${enFrase(F_FP)} ARS ${valorCelda(F_FP)} · ` +
    `los demás, ${valorCelda(F_FN)}. Los decimales de la regla son empates del último puesto, repartidos en proporción.`
  return (
    <svg width={w} height={h} role="group" style={{ display: 'block' }}
         aria-label="Dónde fallan el modelo y la regla: diferencia con su intervalo, precisión por método y matrices de confusión">
      <Titulo x={0} y={fT} f={fT} max={wIzq} texto="Logística menos regla, en puntos, con su intervalo" />
      <g transform={`translate(0, ${altoTit})`}>
        <Diferencias filas={FILAS_TODAS} w={wIzq} h={hArriba - altoTit} k={k * 0.82} tituloEje="Logística menos regla (puntos)" />
      </g>
      <Titulo x={wIzq + gapX} y={fT} f={fT} max={wDer} texto={`Precisión, ${entero(LARGO)} contactables por mes`} />
      <g transform={`translate(${wIzq + gapX}, ${altoTit})`}>
        <Precisiones w={wDer} h={hArriba - altoTit} k={k} />
      </g>
      <line x1={0} x2={w} y1={hArriba + gapY / 2} y2={hArriba + gapY / 2} stroke="var(--bd)" strokeWidth="1" />
      {MEDICIONES.map((med, i) => (
        <g key={med.id} transform={`translate(${i * (wMat + gapX)}, ${yAbajo})`}>
          <Titulo x={0} y={fT} f={fT} max={wMat} texto={med.titulo} />
          <g transform={`translate(0, ${altoTit})`}>
            <Matrices w={wMat} h={hAbajo - altoTit} k={k} medicion={med} />
          </g>
        </g>
      ))}
      <text x={0} y={h - fPie * 0.35} fontSize={fPie} fill={MUT2} className="tabular">{sinCortes(pie)}</text>
    </svg>
  )
}

export default function RA7Confusion() {
  const k = useEscalaTexto()
  return (
    <TarjetaRespaldo
      clase="ra7"
      frase="Validación y test, lado a lado: en validación ganaba la regla; en la lista que sale de test, empatan"
      cifra={`${usd(TM.logistica_ajustada.test.usd_anio, 2)} y ${usd(TM.regla.test.usd_anio, 2)} por año en test`}
      title={`${plano(A.titulo)}. ${plano(A.pie ?? '')} Fuente: B 4.3 y 4.4 (validación, registro G19, G33, G34 y G40); ` +
        'C 7.2 (H13, H15, H16); D 8.1 (test, J03 a J06, J08, J09, J11, J17); vista 4 (H06).'}
      dibujo={({ w, h }) => <Dibujo w={w} h={h} k={k} />}
    />
  )
}

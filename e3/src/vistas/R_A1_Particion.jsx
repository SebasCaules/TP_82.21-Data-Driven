// A1 · ¿Cómo se parten los datos en el tiempo? (Parte A 2.2 y Parte D 8.1 y 8.3; anexo A1 de C3).
// Respaldo: se abre si preguntan cómo se separaron entrenamiento, validación y test (guion, «Anexos de
// respaldo»).
//
// - Frase: el orden en el tiempo y cuándo se midió el test (D3.test.apertura, J01: una sola vez, el
//   27/10/2026). El título de C3 decía «el test sigue reservado hasta la etapa 4»: la etapa 4 ya lo midió,
//   así que la fila del test lo dice y el título queda al title solo como fuente.
// - Pieza: la tabla del anexo con una columna de meses (enero de 2023 a septiembre de 2025, los cortes del
//   dataset): cada conjunto es una barra en su tramo, así se ve que no se pisan. El test va en --acc; el
//   entrenamiento en azul claro; validación en gris; los meses que separan (embargo, separación) y los
//   que quedan fuera, sin relleno. Al final, el entrenamiento del modelo final de la etapa 4 (D 8.3): los
//   18 cortes, con mayo y junio de 2024 de vuelta (D3.test.entrenamiento, J02 y J20).
// Ninguna cifra escrita acá: las filas son las de C3 (A 2.2) y la del modelo final y la fecha salen de D3.
// Los meses de cada barra se leen del texto de C3 («2023-01 a 2024-04 (16)»), el mismo que muestra la tabla.

import { C3 } from '../contenido_e3.js'
import { D3 } from '../datos_e3.js'
import { entero, fecha, pct } from '../formato.js'
import { plano, sinCortes } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { TablaSvg, TarjetaRespaldo } from '../Respaldo.jsx'
import { anchoTexto } from '../medir.js'

const A = C3.ANEXOS.find((a) => a.n === 'A1')
const T = D3.test
const COL = Object.fromEntries(A.columnas.map((c, j) => [c, j]))

// Meses: índice desde enero del primer año de los cortes.
const mesDe = (iso) => { const [a, m] = iso.split('-').map(Number); return a * 12 + m - 1 }
const TRAMO = /(\d{4}-\d{2})\s+(?:a|y)\s+(\d{4}-\d{2})/

// Cada fila de C3: nombre, nota (lo que dice el texto de «Cortes» además de los meses), tramo y estilo.
const ESTILO = {
  Entrenamiento: 'entrenamiento', Embargo: 'hueco', 'Validación': 'validacion', 'Separación': 'hueco',
  'Fuera de la evaluación': 'fuera',
}
const FILAS_C3 = A.filas.map((f) => {
  const cortes = f[COL.Cortes]
  const m = cortes.match(TRAMO)
  if (!m) throw new Error(`R_A1: no leo los meses de «${cortes}» en el anexo A1 de C3`)
  const esTest = /^Test\b/.test(f[COL.Conjunto])
  const nombre = esTest ? 'Test' : f[COL.Conjunto]
  const resto = cortes.replace(TRAMO, '').replace(/^[\s:]+/, '').trim()
  const n = resto.match(/^\((\d+)\)$/)
  const nota = esTest ? `${n ? `${n[1]} cortes; ` : ''}medido una vez, el ${fecha(T.apertura.fecha.slice(0, 10))}`
    : n ? `${n[1]} cortes` : resto
  return {
    nombre, nota, desde: mesDe(m[1]), hasta: mesDe(m[2]), estilo: esTest ? 'test' : ESTILO[nombre] ?? 'hueco',
    celdas: [nombre, cortes, f[COL.Filas], f[COL.Positivos], f[COL.Prevalencia]],
    marcada: esTest,
  }
})
const FINAL = {
  nombre: 'Modelo final (etapa 4)',
  nota: `${entero(T.entrenamiento.cortes)} cortes: entrenamiento y embargo`,
  desde: mesDe(T.entrenamiento.desde.slice(0, 7)), hasta: mesDe(T.entrenamiento.hasta.slice(0, 7)),
  estilo: 'entrenamiento',
  // Prevalencia con dos decimales, como el resto de la columna (crítica del W3, hallazgo 12): 30,18 %, el
  // 30,2 % de J20 (5.698 de 18.882 filas, J02).
  celdas: ['Modelo final (etapa 4)', '', entero(T.entrenamiento.filas), entero(T.entrenamiento.positivos),
    pct(T.entrenamiento.tasa, 2)],
  title: `Parte D 8.3 · registro J02 y J20: el modelo final se entrena otra vez con ${entero(T.entrenamiento.cortes)} ` +
    `cortes, del ${fecha(T.entrenamiento.desde)} al ${fecha(T.entrenamiento.hasta)}, ${entero(T.entrenamiento.clientes)} clientes`,
}
const FILAS = [...FILAS_C3, FINAL]
const PRIMERO = Math.min(...FILAS.map((f) => f.desde))
const ULTIMO = Math.max(...FILAS.map((f) => f.hasta))
const MESES = ULTIMO - PRIMERO + 1
const ANIOS = []
for (let m = PRIMERO; m <= ULTIMO; m++) if (m % 12 === 0 || m === PRIMERO) ANIOS.push(m)

const RELLENO = {
  entrenamiento: { fill: 'var(--azul3)' },
  validacion: { fill: 'var(--gris)' },
  test: { fill: 'var(--acc)' },
  hueco: { fill: 'var(--sup)', stroke: 'var(--gris)', strokeDasharray: '3 2' },
  fuera: { fill: 'var(--sup)', stroke: 'var(--gris2)', strokeDasharray: '3 2' },
}

export const meta = { id: 'A1' }

export default function RA1Particion() {
  const k = useEscalaTexto()
  const xMes = (caja, m) => caja.x + ((m - PRIMERO) / MESES) * caja.w

  const columnas = [
    {
      titulo: A.columnas[COL.Conjunto], ancho: 4.2, alinear: 'izq', renglones: 2,
      dibujar: (fila, c) => {
        const fN = c.f
        const fNota = c.f * 0.82
        return (
          <>
            <text x={c.x} y={c.y + c.h / 2 - fN * 0.55} fontSize={fN} fontWeight={fila.marcada ? 600 : 500}
                  fill="var(--ink)" dominantBaseline="central">{fila.nombre}</text>
            <text x={c.x} y={c.y + c.h / 2 + fN * 0.68} fontSize={fNota} fill="var(--mut2)"
                  dominantBaseline="central">{recortar(sinCortes(fila.nota), c.w, fNota)}</text>
          </>
        )
      },
    },
    {
      titulo: 'Meses', ancho: 4.6, alinear: 'izq',
      dibujarTitulo: (c) => ANIOS.map((m) => (
        <text key={m} x={xMes(c, m)} y={c.h / 2} fontSize={c.fT} fontFamily="var(--mono)" fontWeight={500}
              fill="var(--mut2)" dominantBaseline="central" data-escala="">{Math.floor(m / 12)}</text>
      )),
      dibujar: (fila, c) => {
        const alto = Math.min(c.h * 0.46, c.f * 1.25)
        const y = c.y + (c.h - alto) / 2
        return (
          <>
            {ANIOS.filter((m) => m !== PRIMERO).map((m) => (
              <line key={m} x1={xMes(c, m)} x2={xMes(c, m)} y1={c.y + 2} y2={c.y + c.h - 2} stroke="var(--bd)" />
            ))}
            <rect x={xMes(c, fila.desde)} y={y} width={Math.max(2, xMes(c, fila.hasta + 1) - xMes(c, fila.desde) - 1)}
                  height={alto} rx={1.5} strokeWidth="1.25" {...RELLENO[fila.estilo]} />
          </>
        )
      },
    },
    { titulo: A.columnas[COL.Filas], ancho: 1.3 },
    { titulo: A.columnas[COL.Positivos], ancho: 1.4 },
    { titulo: A.columnas[COL.Prevalencia], ancho: 1.5 },
  ]
  const filas = FILAS.map((f) => ({
    celdas: [f.celdas[0], '', f.celdas[2], f.celdas[3], f.celdas[4]],
    marcada: f.marcada, nombre: f.nombre, nota: f.nota, desde: f.desde, hasta: f.hasta, estilo: f.estilo,
    title: f.title ?? `${f.nombre} · ${plano(f.celdas[1])} · ${f.celdas[2]} filas · ${f.celdas[3]} positivos · ${f.celdas[4]}`,
  }))

  return (
    <TarjetaRespaldo
      clase="ra1"
      frase="Entrenamiento, validación y test en orden de tiempo, con meses de separación entre ellos"
      cifra={`test medido una vez, el ${fecha(T.apertura.fecha.slice(0, 10))}`}
      title={`${plano(A.titulo)} (Parte A, antes de la etapa 4). Fuente: ${A.fuente}, D 8.1 y 8.3 · registro ` +
        `${A.ids.join(', ')}, J01, J02 y J20`}
      dibujo={({ w, h }) => (
        <TablaSvg w={w} h={h} k={k} columnas={columnas} filas={filas} base={13.5}
                  etiqueta="Partición por cortes mensuales: entrenamiento, embargo, validación, separación, test y modelo final" />
      )}
    />
  )
}

/** El texto entero si entra en `max` px; si no, cortado con «…». */
function recortar(t, max, f) {
  if (anchoTexto(t, f) <= max) return t
  let s = t
  while (s.length > 1 && anchoTexto(`${s}…`, f) > max) s = s.slice(0, -1).trimEnd()
  return `${s}…`
}

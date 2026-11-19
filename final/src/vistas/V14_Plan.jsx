// V14 · El plan (gestión, Sebastian C.). Las seis fases del plan (tabla plan de DF, leída por build_final.py del canon y
// controlada contra la Parte A del E4) sobre las semanas desde la aprobación, de la 1 a la última (plan.semanas).
// (19/11, fase 9, ficha V14) El usuario: «mucho menos texto, sacale los responsables o dejalo como una nota de pie que no
// invada; además de las semanas ponele una fecha aprox con mes y año». Después: «deja a los responsables pero sin
// estorbar […] una capa como papel de calcar por encima que se vea al final de todo». Queda:
//   - arriba, el eje de tiempo: un renglón de semanas (un número por semana, «Semana») y debajo uno de meses (una marca
//     donde empieza cada mes y su nombre, con el año en el primero y en enero; «Si se aprueba hoy»). Las fechas salen de
//     calendario.semana_1 de DF (el lunes de la semana 1 si María G. aprueba con la entrega del 24/11/2026) y se controlan
//     contra los lunes de la primera lista y de la decisión del calendario;
//   - encima de los números, solo los tres hitos que dice la conclusión: primera lista, informe preliminar y decisión
//     (rombo con su nombre; sin leyenda). Salen el acuerdo y la tercera lista;
//   - una franja por fase con su flecha en tinta de la semana `desde` a la `hasta` y su nombre corto (adentro si entra);
//     salen los conectores, la pastilla «Hoy», la leyenda, la animación de entrada y los textos al pasar el mouse;
//   - el único acento: la decisión (G63.semana_decision), rombo en ACC, pastilla «Decisión» y la barra a la que llega la
//     última flecha;
//   - los responsables, en la capa del último paso: un velo claro sobre el dibujo y el nombre de cada uno a la izquierda de
//     su fila, como papel de calcar.
// Pasos (las notas: «6 fases en 28 semanas», «la primera lista sale en la semana 6», «la decisión es en la semana 28»):
//   1. la preparación (las fases que terminan antes de la primera lista), con el eje; 2. el piloto y la primera lista;
//   3. la medición, el informe preliminar y la decisión; 4. la capa de responsables.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { ACC, CTX, EJE, INK, PISTA, SUP, TRAZO, Compuerta, Flecha, FranjasFila, Paso, ancho, duro, escalaSemanas, tam,
  useU } from '../svg.jsx'

const ID = 'V14'
const PL = DF.tablas.plan
const CAL = DF.tablas.calendario
const X = textosDe(ID)
const G = X.grafico
const SEM = PL.semanas
const SEM_DEC = DF.anclas['G63.semana_decision'].valor
const SEM_LISTA = CAL.primera_lista.semana
const FASES = PL.fases

const MEDICION = FASES.find((f) => f.hasta === SEM_DEC)
if (!MEDICION) throw new Error('V14: ninguna fase termina en la semana de la decisión')
/** El paso en que se enciende lo que pasa en la semana s: preparación, piloto, o medición y decisión. */
const pasoDe = (s) => (s < SEM_LISTA ? 1 : s < MEDICION.desde ? 2 : 3)
const CAPA = 4
export const meta = { id: ID, pasos: CAPA }

const HITOS = [
  { clave: 'primera', semana: SEM_LISTA },
  { clave: 'preliminar', semana: CAL.preliminar.semana },
  { clave: 'decision', semana: SEM_DEC, dec: true },
].map((x) => ({ ...x, texto: G.hitos[x.clave], paso: pasoDe(x.semana) }))

for (const x of HITOS) {
  if (!Number.isInteger(x.semana) || x.semana < 1 || x.semana > SEM) throw new Error(`V14: el hito «${x.clave}» no cae en una semana del plan`)
}
for (const f of FASES) {
  if (!(f.desde >= 1 && f.hasta <= SEM && f.hasta >= f.desde)) throw new Error(`V14: la fase «${f.fase}» se sale del plan`)
  if (!G.fases[f.n]) throw new Error(`V14: la fase ${f.n} no tiene nombre corto en textos_vistas/V14.js`)
}

// Fechas de referencia: la semana s empieza el lunes semana_1 + 7 (s − 1) días. Los meses que empiezan dentro del plan,
// con su lugar en semanas desde el arranque.
const DIA = 86400000
const T0 = Date.parse(`${CAL.semana_1}T00:00:00Z`)
const lunes = (s) => new Date(T0 + (s - 1) * 7 * DIA).toISOString().slice(0, 10)
if (lunes(SEM_LISTA) !== CAL.primera_lista.lunes || lunes(SEM_DEC) !== CAL.final.lunes) {
  throw new Error('V14: las fechas de referencia no coinciden con los lunes del calendario de DF')
}
const MESES = (() => {
  const fin = T0 + SEM * 7 * DIA
  const d0 = new Date(T0)
  const out = []
  for (let k = d0.getUTCDate() === 1 ? 0 : 1; ; k++) {
    const t = Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + k, 1)
    if (t >= fin) break
    const iso = new Date(t).toISOString().slice(0, 10)
    out.push({ iso, semanas: (t - T0) / (7 * DIA), anio: !out.length || iso.slice(5, 7) === '01' })
  }
  return out
})()

// Medidas en u.
const M = { fase: 26, quien: 24, hito: 24, eje: 23, pad: 12, rombo: 26, romboDec: 40, barra: 10, hueco: 3, punta: 18 }
const LLENA = 0.9
/** Opacidad del velo de la capa de responsables: las flechas se siguen leyendo debajo y los nombres quedan encima. */
const VELO = 0.45

/** Pastilla llena en ACC con el texto en blanco, centrada en (x, y): el rótulo de la decisión. */
const medidaPastilla = (texto, f, u) => ({ w: ancho(texto, f, 700) + 32 * u, h: f * 1.55 })
function Pastilla({ u, x, y, texto, f }) {
  const p = medidaPastilla(texto, f, u)
  return (
    <g>
      <rect x={x - p.w / 2} y={y - p.h / 2} width={p.w} height={p.h} rx={p.h / 2} fill={ACC} />
      <text x={x} y={y} fontSize={f} fontWeight={700} fill={SUP} textAnchor="middle" dominantBaseline="central">{texto}</text>
    </g>
  )
}

function Dibujo({ w, h }) {
  const u = useU()
  const fF = tam(M.fase, u), fQ = tam(M.quien, u), fH = tam(M.hito, u), fE = tam(M.eje, u)
  const pad = M.pad * u
  const g = M.hueco * u
  const n = FASES.length

  // a la izquierda, los títulos de los dos renglones del eje y, en el último paso, los responsables; el resto del ancho es
  // de las semanas. La pastilla de la decisión, centrada en su semana, entra a la derecha.
  const izq = Math.max(ancho(G.semana, fE, 600), ancho(G.mes, fE, 600),
    ...FASES.map((f) => ancho(duro(f.responsable), fQ, 700)))
  const x0 = izq + 36 * u
  const xTit = x0 - 18 * u
  const pD = medidaPastilla(G.hitos.decision, fH, u)
  const dw = Math.min((w - x0) / SEM, (w - x0 - pD.w / 2 - 2 * u) / (SEM_DEC - 0.5))
  const S = escalaSemanas({ x0, x1: x0 + dw * SEM, desde: 1, hasta: SEM })
  const xFin = S.fin(SEM)
  const xDec = S.centro(SEM_DEC)
  const mBarra = (M.barra * u) / 2
  const rD = (M.romboDec * u) / 2

  // alto: rótulos de los hitos, rombos, números de las semanas, meses y las filas, que reparten LLENA del lienzo
  const hLab = Math.max(fH * 1.3, pD.h)
  const cab = hLab + 8 * u + 2 * rD + 10 * u + fE * 1.2 + 10 * u + fE * 1.2 + 14 * u
  const fila = Math.max(50 * u, Math.min(96 * u, (LLENA * h - cab) / n))
  const total = cab + n * fila
  const yTop = Math.max(0, (h - total) / 2)
  const yLab = yTop + hLab / 2
  const yDia = yTop + hLab + 8 * u + rD
  const yNum = yDia + rD + 10 * u + fE * 0.6
  const yMes = yNum + fE * 1.2 + 10 * u
  const y0 = yMes + fE * 0.6 + 14 * u
  const yFin = y0 + n * fila
  const t = Math.max(30 * u, Math.min(44 * u, fila * 0.62))
  const yc = (i) => y0 + (i + 0.5) * fila
  const xFecha = (semanas) => x0 + semanas * dw

  // cada fase: su flecha y su nombre corto, adentro (en blanco) si entra; si no, a la derecha
  const filas = FASES.map((f, i) => {
    const x1 = S.inicio(f.desde) + g
    const x2 = f.hasta === SEM_DEC ? xDec - mBarra : S.fin(f.hasta) - g
    const nombre = G.fases[f.n]
    const wN = ancho(nombre, fF, 400)
    const dentro = wN + 2 * pad + M.punta * u <= x2 - x1
    return { ...f, i, x1, x2, nombre, wN, dentro, xt: dentro ? x1 + pad : x2 + 12 * u, paso: pasoDe(f.desde) }
  })

  // rótulos de los hitos: centrados en su semana, sin salir del lienzo
  const rot = HITOS.map((x) => {
    const wl = x.dec ? pD.w : ancho(x.texto, fH, 600)
    return { ...x, xs: S.centro(x.semana), xc: Math.min(Math.max(S.centro(x.semana), wl / 2), w - wl / 2) }
  })

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <FranjasFila u={u} x0={x0} x1={xFin} y0={y0} filas={n} alto={fila} guia={false} />

      {/* eje de tiempo: guías verticales en el borde de cada semana, la línea con sus marcas, los números y los meses */}
      {Array.from({ length: SEM + 1 }, (_, i) => i + 1).map((s) => (
        <g key={`g${s}`}>
          <line x1={S.inicio(s)} x2={S.inicio(s)} y1={y0} y2={yFin} stroke={PISTA} strokeWidth={TRAZO.guia * u} />
          <line x1={S.inicio(s)} x2={S.inicio(s)} y1={y0 - 8 * u} y2={y0} stroke={EJE} strokeWidth={TRAZO.base * u} />
        </g>
      ))}
      <line x1={x0} x2={xFin} y1={y0} y2={y0} stroke={EJE} strokeWidth={TRAZO.base * u} />
      {Array.from({ length: SEM }, (_, i) => i + 1).map((s) => (
        <text key={`n${s}`} x={S.centro(s)} y={yNum} fontSize={fE} fill={CTX} textAnchor="middle"
              dominantBaseline="central">{fijo(s)}</text>
      ))}
      {MESES.map((m) => (
        <g key={m.iso}>
          <line x1={xFecha(m.semanas)} x2={xFecha(m.semanas)} y1={yMes - fE * 0.6} y2={y0} stroke={EJE}
                strokeWidth={TRAZO.base * u} />
          <text x={xFecha(m.semanas) + 8 * u} y={yMes} fontSize={fE} fill={CTX} dominantBaseline="central">
            {G.rotuloMes(m.iso, m.anio)}
          </text>
        </g>
      ))}
      <text x={xTit} y={yNum} fontSize={fE} fontWeight={600} fill={CTX} textAnchor="end" dominantBaseline="central">
        {G.semana}
      </text>
      <text x={xTit} y={yMes} fontSize={fE} fontWeight={600} fill={CTX} textAnchor="end" dominantBaseline="central">
        {G.mes}
      </text>

      {/* fases: flecha de la semana de arranque a la de cierre, con su nombre corto */}
      {filas.map((f) => (
        <Paso key={f.n} n={f.paso}>
          <Flecha u={u} x1={f.x1} x2={f.x2} y={yc(f.i)} grosor={t / u} punta={M.punta} estado="curso" />
          {!f.dentro && (
            // fondo del nombre con el color de su franja: las guías no le pasan por detrás a la letra
            <g>
              <rect x={f.xt - 6 * u} y={yc(f.i) - fF * 0.62} width={f.wN + 12 * u} height={fF * 1.24} fill={SUP} />
              {f.i % 2 === 0 && (
                <rect x={f.xt - 6 * u} y={yc(f.i) - fF * 0.62} width={f.wN + 12 * u} height={fF * 1.24} fill={PISTA}
                      fillOpacity={0.4} />
              )}
            </g>
          )}
          <text x={f.xt} y={yc(f.i)} fontSize={fF} fill={f.dentro ? SUP : INK} dominantBaseline="central">{f.nombre}</text>
        </Paso>
      ))}

      {/* hitos: rombo encima del número de su semana y el rótulo arriba; la decisión, en ACC con su barra */}
      {rot.map((x) => (
        <Paso key={x.clave} n={x.paso}>
          {x.dec && <rect x={xDec - mBarra} y={y0} width={M.barra * u} height={yFin - y0} fill={ACC} />}
          {x.dec
            ? <Pastilla u={u} x={x.xc} y={yLab} texto={x.texto} f={fH} />
            : <text x={x.xc} y={yLab} fontSize={fH} fontWeight={600} fill={INK} textAnchor="middle"
                    dominantBaseline="central">{x.texto}</text>}
          <Compuerta u={u} x={x.xs} y={yDia} s={x.dec ? M.romboDec : M.rombo} estado={x.dec ? 'hecho' : 'curso'} />
        </Paso>
      ))}

      {/* capa de responsables (último paso): un velo claro sobre las filas, con borde, como papel de calcar (el eje y los
          hitos quedan nítidos), y el nombre de cada responsable a la izquierda de su fila */}
      <Paso n={CAPA} oculto>
        <rect x={TRAZO.guia * u} y={y0 - 10 * u} width={w - 2 * TRAZO.guia * u} height={yFin - y0 + 20 * u} rx={8 * u}
              fill={SUP} fillOpacity={VELO} stroke={EJE} strokeWidth={TRAZO.guia * u} />
        {filas.map((f) => (
          <text key={f.n} x={xTit} y={yc(f.i)} fontSize={fQ} fontWeight={700} fill={INK} textAnchor="end"
                dominantBaseline="central">{duro(f.responsable)}</text>
        ))}
      </Paso>
    </svg>
  )
}

export default function V14Plan() {
  return (
    <Vista id={ID}
           items={[{ clave: 'decide', valor: fijo(SEM_DEC) }]}
           cifras={[fijo(SEM_LISTA), fijo(CAL.preliminar.semana), fijo(SEM_DEC)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}

// V05 · Regla contra modelo (modelo, Francisco C.). Precisión de la lista mensual en la prueba final: regla (J03.regla),
// modelo (J03.logistica) y práctica actual (J17); la diferencia modelo menos regla (J09) con su intervalo
// (J09.ic_inferior a J09.ic_superior).
// (18/11, fase 8, spec 2 V05) El usuario: «hay un baseline, el modelo da algo y la práctica actual otra». Dos versiones:
//   a  Dos paneles. Izquierda, contra la práctica actual: eje de 0 a 100 %, la práctica actual como línea de base
//      punteada y dos barras (regla, modelo) partidas en la base: hasta la línea en gris, lo que la supera en tinta.
//      Derecha, modelo menos regla: eje en puntos centrado en 0, la línea del cero («sin diferencia») y el punto con su
//      intervalo en el acento, que la cruza. El acento es solo la diferencia: el foco de la vista.
//   b  Un eje de 0 a 100 % con las tres marcas (práctica actual, modelo, regla) y el tramo donde regla y modelo casi
//      coinciden ampliado abajo, unido por la lupa (recuadro, tallo y abanico). En el ampliado, la llave entre las dos
//      marcas lleva la diferencia (J09, sin signo, como en la conclusión).
// Banda y conclusión sin cambios: tarjeta J03.regla, subfila J09 y J17, conclusión con |J09|.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { variante } from '../variantes.js'
import { NBSP, fijo, pct } from '../../../e3/src/formato.js'
import { ACC, CTX, EJE, FIN_GRIS, INK, PISTA, REALCE, SUP, TRAZO, EjeX, Leyenda, LlaveH, altoEjeX, ancho, escalaLinda,
  punteado, rectRedondo, tam, useU } from '../svg.jsx'

const ID = 'V05'
const A = DF.anclas
const T = textosDe(ID)
const B = T.barras

const REGLA = A['J03.regla'].valor
const MODELO = A['J03.logistica'].valor
const HOY = A.J17.valor
const DIF = A.J09.valor
const IC = [A['J09.ic_inferior'].valor, A['J09.ic_superior'].valor]
const PUNTOS = T.dif.unidad

export const meta = { id: ID }

const LETRA_EJE = 23

/** Línea de referencia punteada de 3 u en tinta (línea de base, cero). */
function Referencia({ u, x, y1, y2 }) {
  return <line x1={x} x2={x} y1={y1} y2={y2} stroke={INK} strokeWidth={TRAZO.umbral * u} strokeDasharray={punteado(u)} />
}

/** Rótulo de una línea de referencia: nombre (26 u, 600, tinta) con su valor opcional (700) y, debajo, la nota (22 u,
 *  CTX), centrados en x. yA e yB son las líneas de base de los dos renglones. */
function RotuloReferencia({ u, x, yA, yB, nombre, valor, nota }) {
  const f = tam(26, u)
  return (
    <g>
      <text x={x} y={yA} fontSize={f} fill={INK} textAnchor="middle">
        <tspan fontWeight={600}>{nombre}</tspan>
        {valor && <tspan dx={10 * u} fontWeight={700}>{valor}</tspan>}
      </text>
      <text x={x} y={yB} fontSize={tam(22, u)} fill={CTX} textAnchor="middle">{nota}</text>
    </g>
  )
}

/** Muestra de leyenda del intervalo: una barra horizontal en el acento con sus topes. */
const muestraIntervalo = ({ u, x, y, s }) => (
  <g>
    <line x1={x - s / 2} x2={x + s / 2} y1={y} y2={y} stroke={ACC} strokeWidth={5 * u} />
    <line x1={x - s / 2} x2={x - s / 2} y1={y - s / 2.4} y2={y + s / 2.4} stroke={ACC} strokeWidth={3 * u} />
    <line x1={x + s / 2} x2={x + s / 2} y1={y - s / 2.4} y2={y + s / 2.4} stroke={ACC} strokeWidth={3 * u} />
  </g>
)
const muestraPunto = (fill, stroke) => ({ u, x, y, s }) => (
  <circle cx={x} cy={y} r={s / 2.6} fill={fill} stroke={stroke ?? 'none'} strokeWidth={stroke ? 3 * u : 0} />
)

/** Punta de flecha chica (triángulo de 12 u en CTX) con la punta en (x, y), hacia 'izq' o 'der'. */
function Punta({ u, x, y, lado }) {
  const s = (lado === 'izq' ? 1 : -1) * 12 * u
  return <path d={`M${x} ${y} L${x + s} ${y - 7 * u} L${x + s} ${y + 7 * u} Z`} fill={CTX} />
}

// ---------------------------------------------------------------- versión a: dos paneles

function DosPaneles({ w, h }) {
  const u = useU()
  const X = T.dos
  const mY = 0.04 * h
  const gap = 88 * u
  const wIzq = (w - gap) * 0.6
  const xDer = wIzq + gap
  const fTit = tam(28, u)
  const fLey = tam(24, u)
  const fRot = tam('cat', u)
  const fVal = tam('valFoco', u)
  const fEje = tam(LETRA_EJE, u)

  // renglones de arriba abajo: título, leyenda, rótulo de las referencias (dos renglones), filas, eje
  const yTit = mY + fTit * 0.8
  const yLey = yTit + 22 * u + fLey / 2
  const yRefA = yLey + fLey / 2 + 30 * u + tam(26, u) * 0.8
  const yRefB = yRefA + 10 * u + tam(22, u) * 0.85
  const yLinea = yRefB + 12 * u
  const yFil0 = yLinea + 10 * u
  const yEje = h - mY - altoEjeX(u, true)

  // panel izquierdo: barras desde 0 partidas en la línea de base
  const filas = [{ et: B.regla, v: REGLA }, { et: B.modelo, v: MODELO }]
  const x0 = Math.max(...filas.map((f) => ancho(f.et, fRot, 600))) + 24 * u
  const escI = escalaLinda(1)
  const fmtI = (v) => pct(v, 0)
  const medioI = ancho(fmtI(escI.tope), fEje, 400) / 2
  const valW = Math.max(...filas.map((f) => ancho(pct(f.v), fVal, 700)))
  const vMax = Math.max(...filas.map((f) => f.v))
  const L = Math.min(wIzq - x0 - medioI, (wIzq - x0 - valW - 16 * u) / (vMax / escI.tope))
  const xi = (v) => x0 + (v / escI.tope) * L
  const paso = (yEje - yFil0) / filas.length
  const t = Math.min(92 * u, 0.56 * paso)
  const sep = TRAZO.separacion * u

  // panel derecho: modelo menos regla, eje en puntos centrado en 0
  const ext = escalaLinda(Math.max(...IC.map(Math.abs)), 2)
  const marcasD = [...ext.marcas.slice(1).reverse().map((v) => -v), ...ext.marcas]
  const fmtD = (v) => fijo(v, 0, true)
  const padD = Math.max(...marcasD.map((v) => ancho(fmtD(v), fEje, 400))) / 2 + 6 * u
  const xd0 = xDer + padD
  const xd1 = w - padD
  const xd = (v) => xd0 + ((v + ext.tope) / (2 * ext.tope)) * (xd1 - xd0)
  const yc = (yFil0 + yEje) / 2
  const fNum = tam(30, u)
  const fCap = tam(24, u)
  const fMejor = tam(22, u)
  const yMejor = yEje - 22 * u

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {/* separador entre paneles */}
      <line x1={wIzq + gap / 2} x2={wIzq + gap / 2} y1={mY} y2={h - mY} stroke={PISTA} strokeWidth={TRAZO.guia * u} />

      {/* ---- izquierda: contra la práctica actual */}
      <text x={0} y={yTit} fontSize={fTit} fontWeight={700} fill={INK}>{X.izq.titulo}</text>
      <Leyenda u={u} x={0} y={yLey} items={[
        { marca: 'contexto', texto: X.izq.hasta },
        { marca: 'curso', texto: X.izq.sobre },
      ]} />
      <EjeX u={u} x0={x0} x1={x0 + L} y={yEje} min={0} max={escI.tope} marcas={escI.marcas} formato={fmtI}
            titulo={B.eje} grilla yGrilla={yFil0} />
      <Referencia u={u} x={xi(HOY)} y1={yLinea} y2={yEje} />
      <RotuloReferencia u={u} x={xi(HOY)} yA={yRefA} yB={yRefB} nombre={X.izq.base} valor={pct(HOY)}
                        nota={X.izq.baseNota} />
      {filas.map((f, i) => {
        const yf = yFil0 + (i + 0.5) * paso
        const yb = yf - t / 2
        const xb = xi(HOY)
        return (
          <g key={f.et}>
            <title>{`${f.et} · ${pct(f.v)}`}</title>
            <text x={x0 - 24 * u} y={yf} fontSize={fRot} fontWeight={600} fill={INK} textAnchor="end"
                  dominantBaseline="central">{f.et}</text>
            <rect x={x0} y={yb} width={Math.max(0, xb - x0 - sep / 2)} height={t} fill={FIN_GRIS} />
            <path d={rectRedondo(xb + sep / 2, yb, Math.max(0, xi(f.v) - xb - sep / 2), t, TRAZO.radio * u)} fill={INK} />
            <text x={xi(f.v) + 16 * u} y={yf} fontSize={fVal} fontWeight={700} fill={INK}
                  dominantBaseline="central">{pct(f.v)}</text>
          </g>
        )
      })}
      <line x1={x0} x2={x0} y1={yFil0} y2={yEje} stroke={EJE} strokeWidth={TRAZO.base * u} />

      {/* ---- derecha: modelo menos regla */}
      <text x={xDer} y={yTit} fontSize={fTit} fontWeight={700} fill={INK}>{X.der.titulo}</text>
      <Leyenda u={u} x={xDer} y={yLey} items={[
        { marca: muestraPunto(ACC), texto: X.der.punto },
        { marca: muestraIntervalo, texto: X.der.intervalo },
      ]} />
      <EjeX u={u} x0={xd0} x1={xd1} y={yEje} min={-ext.tope} max={ext.tope} marcas={marcasD} formato={fmtD}
            titulo={X.der.eje} grilla yGrilla={yFil0} />
      <Referencia u={u} x={xd(0)} y1={yLinea} y2={yEje} />
      <RotuloReferencia u={u} x={xd(0)} yA={yRefA} yB={yRefB} nombre={X.der.cero} nota={X.der.ceroNota} />
      {/* hacia dónde gana cada uno */}
      <Punta u={u} x={xd0} y={yMejor} lado="izq" />
      <text x={xd0 + 18 * u} y={yMejor} fontSize={fMejor} fill={CTX} dominantBaseline="central">{X.der.mejorRegla}</text>
      <Punta u={u} x={xd1} y={yMejor} lado="der" />
      <text x={xd1 - 18 * u} y={yMejor} fontSize={fMejor} fill={CTX} textAnchor="end"
            dominantBaseline="central">{X.der.mejorModelo}</text>
      {/* intervalo y punto */}
      <g>
        <title>{T.decision.larga}</title>
        <line x1={xd(IC[0])} x2={xd(IC[1])} y1={yc} y2={yc} stroke={ACC} strokeWidth={10 * u} />
        {IC.map((v) => (
          <line key={v} x1={xd(v)} x2={xd(v)} y1={yc - 22 * u} y2={yc + 22 * u} stroke={ACC} strokeWidth={5 * u} />
        ))}
        <circle cx={xd(DIF)} cy={yc} r={17 * u} fill={ACC} stroke={SUP} strokeWidth={4 * u} />
        <text x={xd(DIF) + 10 * u} y={yc - 40 * u} fontSize={fNum} fontWeight={700} fill={INK} textAnchor="end">
          {`${fijo(DIF, 2)}${NBSP}${PUNTOS}`}
        </text>
        {IC.map((v) => (
          <text key={v} x={xd(v)} y={yc + 32 * u} fontSize={fCap} fontWeight={600} fill={CTX} textAnchor="middle"
                dominantBaseline="hanging">{fijo(v, 2)}</text>
        ))}
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------- versión b: un eje y la lupa

function Lupa({ w, h }) {
  const u = useU()
  const X = T.lupa
  const mY = 0.04 * h
  const fLey = tam(24, u)
  const fNom = tam(26, u)
  const fVal = tam(30, u)
  const fNota = tam(22, u)
  const fEje = tam(LETRA_EJE, u)
  const abajo = altoEjeX(u, true)
  const rChico = 10 * u
  const rGrande = 17 * u

  // eje principal, de 0 a 100 %
  const esc = escalaLinda(1)
  const fmt = (v) => pct(v, 0)
  const x0 = ancho(fmt(esc.min), fEje, 400) / 2 + 4 * u
  const x1 = w - ancho(fmt(esc.tope), fEje, 400) / 2 - 4 * u
  const xs = (v) => x0 + ((v - esc.min) / (esc.tope - esc.min)) * (x1 - x0)
  // renglones de arriba: el nombre y el valor de cada marca, el recuadro de la lupa y el eje
  const yNomB = mY + fNom * 0.8
  const yValB = yNomB + fVal * 0.95 + 4 * u
  const fy0 = yValB + 14 * u
  const yEje1 = fy0 + 26 * u
  const fy1 = yEje1 + 26 * u
  // la leyenda, arriba a la izquierda: las dos marcas que en el eje quedan juntas (la práctica actual y el recuadro
  // llevan su rótulo al lado)
  const yLey = yNomB - fNom * 0.3

  // tramo ampliado: medio punto de precisión de cada lado, redondeado al punto
  const lo = Math.floor(Math.min(REGLA, MODELO) * 100 - 0.5) / 100
  const hi = Math.ceil(Math.max(REGLA, MODELO) * 100 + 0.5) / 100
  const escZ = escalaLinda(hi, 4, lo)
  const fmtZ = (v) => pct(v, 1)
  const fx0 = xs(lo)
  const fx1 = xs(hi)

  // panel ampliado, unido al recuadro por un tallo y un abanico
  const yTallo = yEje1 + abajo + 8 * u
  const py0 = yTallo + 30 * u
  const py1 = h - mY
  const padZ = Math.max(...escZ.marcas.map((v) => ancho(fmtZ(v), fEje, 400))) / 2 + 40 * u
  const zx0 = padZ
  const zx1 = w - padZ
  const zs = (v) => zx0 + ((v - lo) / (hi - lo)) * (zx1 - zx0)
  const zy = py1 - 20 * u - abajo
  // de las marcas a la nota de arriba hay 54 u de guía y 145 u de rótulos; si el panel tiene más alto (ventanas 4:3),
  // la guía crece para que el grupo quede centrado entre el rótulo del panel y el eje
  const yTitZ = py0 + 20 * u + fLey * 0.8
  const natural = 54 * u + rGrande + 18 * u + 20 * u + fVal * 0.95 + 4 * u + fNota
  const sobra = Math.max(0, zy - yTitZ - 24 * u - natural)
  const yPts = zy - 54 * u - sobra / 2
  const yLlave = yPts - rGrande - 18 * u
  const yDif = yLlave - 8 * u - 12 * u
  const yEmpate = yDif - fVal * 0.95 - 4 * u
  const xMedio = (zs(MODELO) + zs(REGLA)) / 2
  const lupa = `M${fx0} ${fy0} H${fx1} V${yTallo} L${w} ${py0} V${py1} H0 V${py0} L${fx0} ${yTallo} Z`
  const nombreValor = (nombre, valor) => [
    <tspan key="n" fontWeight={600} fontSize={fNom}>{nombre}</tspan>,
    <tspan key="v" dx={10 * u} fontWeight={700} fontSize={fVal}>{valor}</tspan>,
  ]
  const itemsLey = [
    { marca: muestraPunto(ACC), texto: X.regla },
    { marca: muestraPunto(SUP, ACC), texto: X.modelo },
  ]

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {/* la lupa: recuadro, tallo, abanico y panel en un solo trazado */}
      <path d={lupa} fill={REALCE} stroke={EJE} strokeWidth={TRAZO.guia * u} strokeLinejoin="round" />

      {/* eje principal con las tres marcas */}
      <EjeX u={u} x0={x0} x1={x1} y={yEje1} min={esc.min} max={esc.tope} marcas={esc.marcas} formato={fmt}
            titulo={B.eje} anclaTitulo="start" />
      <Leyenda u={u} x={0} y={yLey} items={itemsLey} />
      <rect x={fx0} y={fy0} width={fx1 - fx0} height={fy1 - fy0} rx={4 * u} fill="none" stroke={INK}
            strokeWidth={2.5 * u} />
      <g>
        <title>{`${X.hoy} · ${pct(HOY)}`}</title>
        <circle cx={xs(HOY)} cy={yEje1} r={rChico} fill={FIN_GRIS} />
        <text x={xs(HOY)} y={yNomB} fontSize={fNom} fontWeight={600} fill={INK} textAnchor="middle">{X.hoy}</text>
        <text x={xs(HOY)} y={yValB} fontSize={fVal} fontWeight={700} fill={INK} textAnchor="middle">{pct(HOY)}</text>
      </g>
      <g>
        <title>{`${X.juntos} · ${pct(REGLA)} · ${pct(MODELO)}`}</title>
        <circle cx={xs(MODELO)} cy={yEje1} r={rChico - 1.5 * u} fill={SUP} stroke={ACC} strokeWidth={3 * u} />
        <circle cx={xs(REGLA)} cy={yEje1} r={rChico - 1.5 * u} fill={ACC} />
        <text x={(fx0 + fx1) / 2} y={yNomB} fontSize={fNom} fontWeight={600} fill={INK} textAnchor="middle">{X.juntos}</text>
        <text x={(fx0 + fx1) / 2} y={yValB} fontSize={fNota} fill={CTX} textAnchor="middle">{X.juntosNota}</text>
      </g>

      {/* panel ampliado: las dos marcas sobre el eje, con su guía, y la llave de la diferencia */}
      <text x={24 * u} y={yTitZ} fontSize={fLey} fontWeight={600} fill={CTX}>{X.tramo}</text>
      <EjeX u={u} x0={zx0} x1={zx1} y={zy} min={lo} max={escZ.tope} marcas={escZ.marcas} formato={fmtZ}
            titulo={X.ejeZoom} grilla yGrilla={yPts} />
      {[MODELO, REGLA].map((v) => (
        <line key={v} x1={zs(v)} x2={zs(v)} y1={yPts} y2={zy} stroke={ACC} strokeWidth={3 * u} />
      ))}
      <circle cx={zs(MODELO)} cy={yPts} r={rGrande - 2 * u} fill={SUP} stroke={ACC} strokeWidth={4 * u} />
      <circle cx={zs(REGLA)} cy={yPts} r={rGrande} fill={ACC} />
      <text x={zs(MODELO) - rGrande - 14 * u} y={yPts} fill={INK} fontSize={fNom} textAnchor="end"
            dominantBaseline="central">{nombreValor(X.modelo, pct(MODELO))}</text>
      <text x={zs(REGLA) + rGrande + 14 * u} y={yPts} fill={INK} fontSize={fNom} textAnchor="start"
            dominantBaseline="central">{nombreValor(X.regla, pct(REGLA))}</text>
      <LlaveH u={u} x1={zs(MODELO)} x2={zs(REGLA)} y={yLlave} lado="arriba" />
      <text x={xMedio} y={yDif} fontSize={fVal} fontWeight={700} fill={INK} textAnchor="middle">
        {`${fijo(Math.abs(DIF), 2)}${NBSP}${PUNTOS}`}
      </text>
      <text x={xMedio} y={yEmpate} fontSize={fNota} fill={CTX} textAnchor="middle">{X.empate}</text>
    </svg>
  )
}

export default function V05ReglaModelo() {
  const b = variante(ID) === 'b'
  return (
    <Vista id={ID}
           items={[
             { clave: 'regla', valor: pct(REGLA) },
             { clave: 'dif', valor: fijo(DIF, 2) },
             { clave: 'hoy', valor: pct(HOY) },
           ]}
           cifras={[fijo(Math.abs(DIF), 2)]}>
      {({ w, h }) => (b ? <Lupa w={w} h={h} /> : <DosPaneles w={w} h={h} />)}
    </Vista>
  )
}

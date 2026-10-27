// A5 · ¿El error es parejo entre segmentos? (Parte C 7.4 y Parte D 11.2; anexo A5 de C3). Respaldo: se
// abre si preguntan dónde se equivoca más el modelo (guion, «Anexos de respaldo»).
//
// El anexo de C3 es la C 7.4 (validación) y su título dice que «la brecha por género también la tiene la
// regla». La etapa 4 lo midió de nuevo en test y la D 11.2 cambia la lectura: en test la brecha por género
// no aparece, menos de 12 meses y alta online pasan a positivo y solo el alto valor repite. Por eso la
// pieza muestra las dos mediciones, una al lado de la otra.
//
// - Frase: el modelo y la lista (logística ajustada, lista de 500 sin filtro) y qué se resta. Cifra: la
//   precisión de mujeres y de hombres en test, como la escribe la D 11.2, y la de género X, que la D no
//   nombra: es la diferencia más grande del gráfico (−10,0 puntos, 66 lugares, su intervalo de 69,2 a
//   88,1 % queda debajo del 90,3 % de toda la lista; crítica del W3, hallazgo 4b). D3.test.segmentos, J15.
// - Pieza: un punto por segmento y medición, en puntos de precisión contra toda la lista (logística
//   ajustada, lista de 500 sin filtro, la misma población que la C 7.4): validación con un aro gris, test
//   con un punto en --acc, unidos por una línea; el cero, la lista entera. A la derecha, los lugares que
//   el segmento ocupa en la lista de test (pocos lugares, poca precisión en la diferencia), con su rótulo
//   de columna arriba (hallazgo 6). Los formatos
//   de tienda de la C 7.4 no se midieron en test y quedan en el anexo de C3.
// - En el title de cada fila, la precisión, el intervalo y la diferencia de la regla en test.
// Ninguna cifra escrita acá: todo sale de D3.test.segmentos (las diferencias de validación son las de
// etapa3.json, H25 a H28, las mismas de la C 7.4).

import { C3 } from '../contenido_e3.js'
import { D3 } from '../datos_e3.js'
import { entero, fijo, pct } from '../formato.js'
import { plano } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { TarjetaRespaldo } from '../Respaldo.jsx'
import { anchoTexto } from '../medir.js'

const A = C3.ANEXOS.find((a) => a.n === 'A5')
const S = D3.test.segmentos
const NOMBRE = {
  mujeres: 'Mujeres',
  hombres: 'Hombres',
  genero_x: 'Género X',
  alto_valor: '20 % de mayor facturación',
  menos_de_12_meses: 'Menos de 12 meses de cliente',
  alta_online: 'Alta online',
  alta_fisica: 'Alta en tienda física',
}
const FILAS = S.filas.map((f) => ({ ...f, nombre: NOMBRE[f.id] ?? f.valor }))
const fila = (id) => FILAS.find((f) => f.id === id)
const MUJ = fila('mujeres')
const HOM = fila('hombres')
const GX = fila('genero_x')
if (!MUJ || !HOM || !GX) throw new Error('R_A5: D3.test.segmentos no trae mujeres, hombres y género X')
const CABEZA_LUGARES = 'lugares en la lista de test'

const puntos = (x) => fijo(x, 1, true)
const CORTES_TEST = D3.test.conjunto.cortes.length
const CORTES_VAL = D3.modelos.validacion.cortes

export const meta = { id: 'A5' }

function Puntos({ w, h, k }) {
  const fEtq = 14 * k
  const fVal = 12.5 * k
  const fTick = 10.5 * k
  const fTit = 11 * k
  const fLey = 12 * k
  const r = 5.5 * k

  const valores = FILAS.flatMap((f) => [f.diferencia_pp, f.validacion_diferencia_pp])
  const lo = Math.floor(Math.min(0, ...valores) / 2) * 2 - 2
  const hi = Math.ceil(Math.max(0, ...valores) / 2) * 2 + 2
  const ticks = []
  for (let v = lo; v <= hi; v += 2) ticks.push(v)

  const x0 = Math.max(...FILAS.map((f) => anchoTexto(f.nombre, fEtq, 500))) + 16 * k
  const textoLugares = (f) => entero(f.en_lista)
  const anchoDer = Math.max(anchoTexto(CABEZA_LUGARES, fLey),
    ...FILAS.map((f) => anchoTexto(textoLugares(f), fVal))) + 18 * k
  const x1 = w - anchoDer
  const x = (v) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0)

  const altoLey = fLey * 2
  const altoEje = fTick + fTit + 22 * k
  const disponible = h - altoLey - altoEje
  const paso = Math.min(disponible / FILAS.length, 64 * k)
  const yFila = (i) => altoLey + paso * (i + 0.5)
  const yEje = altoLey + paso * FILAS.length

  // Rótulo de valor: cada punto escribe el suyo hacia afuera del par, para que no se pisen.
  const rotulos = (f) => {
    const t = f.diferencia_pp, v = f.validacion_diferencia_pp
    const testDer = t >= v
    return [
      { valor: v, x: x(v) + (testDer ? -1 : 1) * (r + 5 * k), ancla: testDer ? 'end' : 'start', clase: 'val' },
      { valor: t, x: x(t) + (testDer ? 1 : -1) * (r + 5 * k), ancla: testDer ? 'start' : 'end', clase: 'test' },
    ]
  }

  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`Diferencia de precisión contra toda la lista, en puntos, por segmento: ` +
           FILAS.map((f) => `${f.nombre}: validación ${puntos(f.validacion_diferencia_pp)}, test ${puntos(f.diferencia_pp)}`).join('; ')}>
      {/* leyenda: los dos marcadores, arriba a la izquierda del área de puntos */}
      <g>
        <circle cx={x0 + r} cy={fLey * 0.8} r={r} fill="var(--sup)" stroke="var(--gris)" strokeWidth={2} />
        <text x={x0 + r * 2 + 6 * k} y={fLey * 0.8} fontSize={fLey} fill="var(--mut2)" dominantBaseline="central">
          {`validación (${CORTES_VAL} cortes)`}
        </text>
        <circle cx={x0 + r + anchoTexto(`validación (${CORTES_VAL} cortes)`, fLey) + 40 * k} cy={fLey * 0.8} r={r}
                fill="var(--acc)" />
        <text x={x0 + r * 2 + anchoTexto(`validación (${CORTES_VAL} cortes)`, fLey) + 46 * k} y={fLey * 0.8}
              fontSize={fLey} fill="var(--ink)" fontWeight={600} dominantBaseline="central">
          {`test (${CORTES_TEST} cortes)`}
        </text>
      </g>

      {/* el rótulo de la columna de la derecha */}
      <text x={w} y={fLey * 0.8} fontSize={fLey} fill="var(--mut2)" textAnchor="end" dominantBaseline="central">
        {CABEZA_LUGARES}
      </text>

      {/* el cero: la precisión de toda la lista */}
      <line x1={x(0)} x2={x(0)} y1={altoLey - 4 * k} y2={yEje} stroke="var(--ink)" strokeWidth="1.5" />

      {FILAS.map((f, i) => {
        const y = yFila(i)
        const t = f.diferencia_pp
        const v = f.validacion_diferencia_pp
        return (
          <g key={f.id}>
            <title>{`${f.nombre} · test: precisión ${pct(f.precision, 1)} (IC 95 % ${pct(f.ic95[0], 1)} a ` +
              `${pct(f.ic95[1], 1)}), ${puntos(t)} puntos; la regla, ${puntos(f.diferencia_regla_pp)} · validación: ` +
              `${puntos(v)} puntos · ${entero(f.en_lista)} lugares en la lista de test`}</title>
            {i > 0 && <line x1={0} x2={w} y1={y - paso / 2} y2={y - paso / 2} stroke="var(--bd2)" />}
            <text x={x0 - 16 * k} y={y} fontSize={fEtq} fill="var(--ink)" fontWeight={500} textAnchor="end"
                  dominantBaseline="central">{f.nombre}</text>
            <line x1={x(v)} x2={x(t)} y1={y} y2={y} stroke="var(--gris2)" strokeWidth={2.5} />
            <circle cx={x(v)} cy={y} r={r} fill="var(--sup)" stroke="var(--gris)" strokeWidth={2} />
            <circle cx={x(t)} cy={y} r={r} fill="var(--acc)" />
            {rotulos(f).map((rt) => (
              <text key={rt.clase} x={rt.x} y={y} fontSize={fVal} textAnchor={rt.ancla} dominantBaseline="central"
                    fill={rt.clase === 'test' ? 'var(--ink)' : 'var(--mut2)'} fontWeight={rt.clase === 'test' ? 600 : 400}
                    className="tabular">{puntos(rt.valor)}</text>
            ))}
            <text x={w} y={y} fontSize={fVal} fill="var(--mut2)" textAnchor="end" dominantBaseline="central"
                  className="tabular">{textoLugares(f)}</text>
          </g>
        )
      })}

      {/* eje de puntos */}
      <line x1={x0} x2={x1} y1={yEje} y2={yEje} stroke="var(--eje)" />
      {ticks.map((v) => (
        <g key={v}>
          <line x1={x(v)} x2={x(v)} y1={yEje} y2={yEje + 4 * k} stroke="var(--eje)" />
          <text x={x(v)} y={yEje + 6 * k + fTick} fontSize={fTick} fill="var(--mut)" textAnchor="middle"
                className="tabular" data-escala="">{v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0'}</text>
        </g>
      ))}
      <text x={x1} y={yEje + 14 * k + fTick + fTit} fontSize={fTit} fill="var(--mut2)" textAnchor="end"
            fontFamily="var(--mono)" fontWeight={600} letterSpacing={`${0.08 * fTit}`}>
        PUNTOS CONTRA TODA LA LISTA
      </text>
    </svg>
  )
}

export default function RA5Segmentos() {
  const k = useEscalaTexto()
  return (
    <TarjetaRespaldo
      clase="ra5"
      frase="Logística ajustada, lista de 500 sin filtro: cada segmento contra toda la lista"
      cifra={`en test, mujeres ${pct(MUJ.precision, 1)} y hombres ${pct(HOM.precision, 1)}; género X, ` +
        `${entero(GX.en_lista)} lugares, ${pct(GX.precision, 1)}`}
      title={`Logística ajustada, lista de 500 sin filtro. Toda la lista acierta ${pct(S.lista_precision, 1)} en test ` +
        `(la regla, ${pct(S.lista_precision_regla, 1)}). Validación: ${plano(A.titulo)} (${A.fuente}). ` +
        `Fuente: C 7.4 y D 11.2 · registro ${A.ids.join(', ')}, J15 y J21`}
      dibujo={({ w, h }) => <Puntos w={w} h={h} k={k} />}
    />
  )
}

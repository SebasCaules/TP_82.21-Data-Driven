// D3 — dónde está la plata contra dónde está el riesgo, en barras divergentes. Cada barra es
// la diferencia entre cuánto pesa el segmento en la FACTURACIÓN y cuánto pesa en la
// EXPOSICIÓN, en puntos de participación: es la frase del título convertida en una sola
// cifra dibujada, en vez de dos distribuciones que el lector tiene que restar de memoria.
//
// El orden de la resta lo fija el signo, no la comodidad: el negativo tiene que ser el mal
// desempeño. Un segmento que pesa más en el riesgo que en lo que factura está sobreexpuesto
// y va a la izquierda; el que factura más de lo que arriesga va a la derecha. Con la resta
// al revés, el −12,7 le tocaba a Campeones, que es justamente el segmento sano.
//
// Lo que el formato pierde son los niveles (un segmento chico y uno grande pueden dar el
// mismo desvío), así que la exposición de cada segmento va como columna al costado, con su
// barra de magnitud: el desvío dice de qué lado está el segmento, la columna dice cuánta
// plata hay detrás.
// Título y bases salen de porDimension, no de info: no mezclan bases con filtro.rfm activo.

import { Lienzo, BarrasDivergentes } from '../graficos.jsx'
import { montoM, pct, porDimension, dims } from '../agregacion.js'

// Puntos de participación, con signo. No es un porcentaje de nada: es la resta de dos.
// El signo lo pone el formato y no el eje: el lado ya dice de qué lado cae, pero el número
// suelto ("6,0") copiado a un mail o leído en la impresión no.
const puntos = (v) => Math.abs(v).toFixed(1).replace('.', ',')
const conSigno = (v) => (v < -0.05 ? `−${puntos(v)}` : v > 0.05 ? `+${puntos(v)}` : puntos(v))
const marcaEje = (v) => (v < 0 ? `−${Math.abs(v)}` : v > 0 ? `+${v}` : '0')

export default function D3({ iCorte, filtro, info, verEnLista }) {
  const r = porDimension(iCorte, 'rfm', filtro)
  const enRiesgoIdx = dims.rfm.indexOf('En riesgo')

  // porDimension('rfm', filtro) neutraliza filtro.rfm sobre su propio eje: usar sus
  // propios totales como base, no info (que sí aplica filtro.rfm y quedaría con un
  // numerador de 7 segmentos contra un denominador de uno solo).
  const tot = r.reduce(
    (s, c) => ({ f: s.f + c.f, ar: s.ar + c.ar }),
    { f: 0, ar: 0 }
  )

  const filas = r.map((c, i) => {
    const pExp = tot.ar ? (100 * c.ar) / tot.ar : 0
    const pFac = tot.f ? (100 * c.f) / tot.f : 0
    return { etiqueta: dims.rfm[i], exp: pExp, fac: pFac, dif: pFac - pExp, ar: c.ar, _i: i }
  })

  // Las dos participaciones suman 100 cada una, así que los desvíos suman cero: siempre hay
  // al menos uno de cada lado y orden[0] no puede ser negativo.
  const orden = [...filas].sort((a, b) => b.dif - a.dif)
  const subexpuesto = orden[0]
  // Con un filtro que deja un solo segmento con datos, la diferencia es cero por
  // construcción y no hay nada que afirmar: el título lo dice en vez de nombrar un desvío
  // de décimas como si fuera un hallazgo.
  const plano = !subexpuesto || Math.abs(subexpuesto.dif) < 0.05

  const datos = orden.map((f) => ({
    etiqueta: f.etiqueta,
    valor: f.dif,
    // Cada monto lleva su signo de peso además de la magnitud: la columna se lee como plata
    // sin ir a buscar la moneda al encabezado, que es lo que pasaba con "23,5 M" a secas.
    nota: montoM(f.ar),
    notaValor: f.ar,
    notaSuf: f._i === enRiesgoIdx ? 'circular' : null,
    enfasis: !plano && f._i === subexpuesto._i,
    _i: f._i,
  }))

  return (
    <section className="pant">
      <h1 className="titulo">
        {plano
          ? 'Con este recorte el riesgo se reparte igual que la facturación'
          : `${subexpuesto.etiqueta}: ${pct(subexpuesto.fac)} de lo facturado y ${pct(subexpuesto.exp)} de la exposición`}
      </h1>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <BarrasDivergentes
              datos={datos} w={w} h={h}
              formato={conSigno} formatoEje={marcaEje}
              tituloEje="Facturación menos exposición, en puntos de participación"
              anchoEtiqueta={106}
              encabezadoNota="exposición del segmento"
              rotuloPos="más plata que riesgo →"
              rotuloNeg="← más riesgo que plata (trama)"
              onBarra={verEnLista ? (i, d) => verEnLista('rfm', d._i) : undefined}
            />
          )}
        </Lienzo>
      </div>
    </section>
  )
}

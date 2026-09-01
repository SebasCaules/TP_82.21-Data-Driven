// D3 — dónde está el riesgo contra dónde está la plata, en barras divergentes. Cada barra es
// la diferencia entre cuánto pesa el segmento en la EXPOSICIÓN y cuánto pesa en la
// FACTURACIÓN, en puntos de participación: es la frase del título convertida en una sola
// cifra dibujada, en vez de dos distribuciones que el lector tiene que restar de memoria.
//
// El orden de la resta lo fija la decisión, no la aritmética. La pantalla existe para elegir
// dónde va el presupuesto de retención, y lo que se elige son los segmentos que pesan más en
// el riesgo que en lo que facturan. Esos van a la DERECHA, en positivo, sólidos y sobre la
// mitad limpia: el lado positivo es el lado que se elige. Los sanos quedan a la izquierda, en
// trama y sobre el lavado.
//
// La resta iba al revés y el título terminaba nombrando a Campeones, que es el segmento del
// que no hay que ocuparse. Un tablero de decisión no puede liderar con la buena noticia.
// El precio de la vuelta: un número positivo acá NO es una buena noticia, es una prioridad.
// Por eso los dos extremos van rotulados y el eje dice el orden de la resta.
//
// Lo que el formato pierde son los niveles (un segmento chico y uno grande pueden dar el
// mismo desvío), así que la exposición de cada segmento va como columna al costado, con su
// barra de magnitud: el desvío dice de qué lado está el segmento, la columna dice cuánta
// plata hay detrás.
// Título y bases salen de porDimension, no de info: no mezclan bases con filtro.rfm activo.

import { Lienzo, BarrasDivergentes } from '../graficos.jsx'
import { montoM, pct, porDimension, dims } from '../agregacion.js'
import { Def } from '../Glosario.jsx'

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
    return { etiqueta: dims.rfm[i], exp: pExp, fac: pFac, dif: pExp - pFac, ar: c.ar, _i: i }
  })

  // Las dos participaciones suman 100 cada una, así que los desvíos suman cero: siempre hay
  // al menos uno de cada lado y orden[0] no puede ser negativo.
  const orden = [...filas].sort((a, b) => b.dif - a.dif)
  const sobreexpuesto = orden[0]
  // Con un filtro que deja un solo segmento con datos, la diferencia es cero por
  // construcción y no hay nada que afirmar: el título lo dice en vez de nombrar un desvío
  // de décimas como si fuera un hallazgo.
  const plano = !sobreexpuesto || Math.abs(sobreexpuesto.dif) < 0.05

  const datos = orden.map((f) => ({
    etiqueta: f.etiqueta,
    valor: f.dif,
    // Cada monto lleva su signo de peso además de la magnitud: la columna se lee como plata
    // sin ir a buscar la moneda al encabezado, que es lo que pasaba con "23,5 M" a secas.
    nota: montoM(f.ar),
    notaValor: f.ar,
    notaSuf: f._i === enRiesgoIdx ? 'circular' : null,
    enfasis: !plano && f._i === sobreexpuesto._i,
    _i: f._i,
  }))

  return (
    <section className="pant">
      <h1 className="titulo">
        {plano
          ? 'Con este recorte el riesgo se reparte igual que la facturación'
          : `${sobreexpuesto.etiqueta}: ${pct(sobreexpuesto.exp)} de la exposición contra ${pct(sobreexpuesto.fac)} de lo facturado`}
      </h1>

      {/* Los siete nombres del eje son la única cosa de esta pantalla que no se puede
          deducir del dibujo: "Hibernando" no dice con qué regla entró nadie ahí. La ficha
          del glosario trae las tres notas y las siete reglas en orden. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="kpi-lbl" style={{ display: 'inline' }}>
          <Def id="rfm">Cómo se arma cada segmento</Def>
        </span>
      </div>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <BarrasDivergentes
              datos={datos} w={w} h={h}
              formato={conSigno} formatoEje={marcaEje}
              tituloEje="Exposición menos facturación, en puntos de participación"
              anchoEtiqueta={106}
              encabezadoNota="exposición del segmento"
              rotuloPos="más riesgo que plata: se eligen →"
              rotuloNeg="← más plata que riesgo (trama)"
              onBarra={verEnLista ? (i, d) => verEnLista('rfm', d._i) : undefined}
            />
          )}
        </Lienzo>
      </div>
    </section>
  )
}

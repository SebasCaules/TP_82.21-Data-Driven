// M2a — el embudo de la campaña masiva, sobre series.embudo_campanias.global (base limpia,
// 23.529 envíos). Un paso por barra, cada barra al 100 % de SU propia base: lo que avanza
// contra lo que se pierde. Las cuatro etapas en conteo absoluto tenían tres órdenes de
// magnitud entre la primera y la última, así que la barra de compra a 7 días era un pelo
// contra el borde y la conversión de cada paso —que es lo propio de un embudo— no estaba
// dibujada en ningún lado.
//
// Lo que se pierde es la escala absoluta: tres barras del mismo largo sobre bases de 23.529,
// 8.266 y 2.059 se pueden leer como tres poblaciones iguales. Por eso cada fila lleva su
// base escrita y la bajada declara la compra sobre el total.
// Serie global: no depende del corte ni de los filtros.

import { Lienzo, BarrasApiladas100 } from '../graficos.jsx'
import { entero, pct, series } from '../agregacion.js'

export default function M2a() {
  const emb = series.embudo_campanias
  const g = emb.global
  const envios = g.envios
  const abre = Math.round(envios * g.abre)
  const clic = Math.round(envios * g.clic)
  const compras = Math.round(envios * g.compra_7dias)

  const pasos = [
    { etiqueta: 'Envío → Abre', base: envios, avanza: abre },
    { etiqueta: 'Abre → Clic', base: abre, avanza: clic },
    { etiqueta: 'Clic → Compra', base: clic, avanza: compras },
  ].map((p) => ({ ...p, retencion: p.base ? (100 * p.avanza) / p.base : 0 }))

  // El peor paso se nombra en el título y se marca en la fila. No lleva un color propio:
  // el acento ya significa "los que avanzan" adentro de este gráfico y no puede significar
  // dos cosas a la vez: la marca va en la etiqueta de la fila (`marcaEnfasis`).
  const peor = pasos.reduce((m, p) => (p.retencion < m.retencion ? p : m), pasos[0])

  // Con el eje en base, el largo de la barra ES el embudo: 23.529, 8.265, 2.059. El precio
  // es que el tramo de acento del ultimo paso mide 12 px, y ahi no entra "284 · 13,8 %".
  // Adentro va solo el porcentaje, que es lo que se compara entre pasos; los dos conteos
  // pasan al subtitulo de la fila. Asi cada cifra queda pegada a su bloque en vez de
  // aparecer sobre plaqueta a la derecha de la barra, leyendose como si fuera del vecino.
  const filas = pasos.map((p) => ({
    etiqueta: p.etiqueta,
    sub: `${entero(p.avanza)} de ${entero(p.base)}`,
    enfasis: p === peor,
    segmentos: [
      {
        clave: `avanza ${p.etiqueta}`, valor: p.avanza, tono: 'var(--acc)', tinta: '#fff',
        enfasis: true, plaqueta: true,
        texto: pct(p.retencion),
      },
      {
        clave: `se pierde ${p.etiqueta}`, valor: Math.max(0, p.base - p.avanza), tono: 'trama',
        texto: pct(100 - p.retencion),
      },
    ],
  }))

  // Las otras composiciones al 100 % declaran sus dos tramos en la leyenda y esta no lo
  // hacía: el bloque de acento se identificaba solo por el título del eje, y la cifra que
  // lleva adentro son números pelados. Con dos series, leyenda.
  const leyenda = [
    { etiqueta: 'avanza al paso siguiente', tono: 'var(--acc)', enfasis: true },
    { etiqueta: 'se pierde en el paso', tono: 'trama' },
  ]

  return (
    <section className="pant">
      {/* COPY-05: "las campañas masivas no discriminan" era una afirmación sobre diferencias
          entre segmentos que este embudo, un solo agregado sin desagregar, no puede sostener.
          Esa comparación es tema de M2b (M2bSegmentos.jsx), que la dibuja con evidencia. */}
      <h1 className="titulo">
        El peor paso, {peor.etiqueta}, pierde {pct(100 - peor.retencion)} de lo que recibe
      </h1>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <BarrasApiladas100
              filas={filas} leyenda={leyenda} w={w} h={h}
              anchoEtiqueta={138}
              marcaEnfasis
              maximo={pasos[0].base}
              formatoEje={(v) => entero(v)}
              tituloEje="Envíos que entran a cada paso"
            />
          )}
        </Lienzo>
      </div>
    </section>
  )
}

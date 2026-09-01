// M2a — el embudo de la campaña masiva, sobre series.embudo_campanias.global (base limpia,
// 23.529 envíos). Un paso por barra y UN denominador para las tres: los envíos. La cifra de
// cada barra es cuántos de los 23.529 llegan hasta ahí, así que la última dice 1,2 %, que es
// el número que después usa el experimento de M2b como p0 y el que aparece en el .tex.
//
// Antes cada barra iba sobre su propio paso anterior (35,1 · 24,9 · 13,8). Esa lectura es la
// conversión del paso y sigue estando: es la que decide cuál es el peor y la que dice el
// título. Lo que no hacía era dejar ver el 1,2 %, que es la cifra con la que se negocia la
// próxima campaña. Con base común, el largo del bloque de acento Y su porcentaje dicen lo
// mismo, que es lo que un embudo tiene que cumplir.
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

  // `share` es sobre los envíos y es lo que se dibuja y se rotula. `retencion` es sobre el
  // paso anterior: no se dibuja, pero es la que define cuál es el peor paso y la que dice el
  // título, porque "pierde 86,2 % de lo que recibe" es una afirmación sobre el paso, no
  // sobre el total.
  const pasos = [
    { etiqueta: 'Abre', paso: 'Envío → Abre', avanza: abre, previo: envios },
    { etiqueta: 'Clic', paso: 'Abre → Clic', avanza: clic, previo: abre },
    { etiqueta: 'Compra a 7 días', paso: 'Clic → Compra', avanza: compras, previo: clic },
  ].map((p) => ({
    ...p,
    share: envios ? (100 * p.avanza) / envios : 0,
    retencion: p.previo ? (100 * p.avanza) / p.previo : 0,
  }))

  // El peor paso se nombra en el título y se marca en la fila. No lleva un color propio:
  // el acento ya significa "los que avanzan" adentro de este gráfico y no puede significar
  // dos cosas a la vez: la marca va en la etiqueta de la fila (`marcaEnfasis`).
  const peor = pasos.reduce((m, p) => (p.retencion < m.retencion ? p : m), pasos[0])

  // Las tres barras arrancan en 23.529 y el acento se achica: 8.265, 2.059, 284. El precio de
  // la base comun es que el acento del ultimo paso mide 11 px, y ahi la cifra no entra
  // adentro: sale sobre plaqueta, en el tono del acento, que es lo que la ata a su bloque.
  // El tramo que no llega se dibuja y no se rotula: con las dos cifras cada fila sumaba 100 y
  // se leia como una composicion cerrada en vez de un paso del embudo.
  const filas = pasos.map((p) => ({
    etiqueta: p.etiqueta,
    sub: `${entero(p.avanza)} de ${entero(envios)}`,
    enfasis: p === peor,
    segmentos: [
      {
        clave: `llega a ${p.etiqueta}`, valor: p.avanza, tono: 'var(--acc)', tinta: '#fff',
        enfasis: true, plaqueta: true,
        texto: pct(p.share),
      },
      {
        clave: `no llega a ${p.etiqueta}`, valor: Math.max(0, envios - p.avanza), tono: 'trama',
      },
    ],
  }))

  // Las otras composiciones al 100 % declaran sus dos tramos en la leyenda y esta no lo
  // hacía: el bloque de acento se identificaba solo por el título del eje, y la cifra que
  // lleva adentro son números pelados. Con dos series, leyenda.
  const leyenda = [
    { etiqueta: 'llega al paso, en % de los envíos', tono: 'var(--acc)', enfasis: true },
    { etiqueta: 'no llega', tono: 'trama' },
  ]

  return (
    <section className="pant">
      {/* COPY-05: "las campañas masivas no discriminan" era una afirmación sobre diferencias
          entre segmentos que este embudo, un solo agregado sin desagregar, no puede sostener.
          Esa comparación es tema de M2b (M2bSegmentos.jsx), que la dibuja con evidencia. */}
      <h1 className="titulo">
        Solo {pct(peor.share)} de los envíos termina en compra, y el peor salto es {peor.paso}
      </h1>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <BarrasApiladas100
              filas={filas} leyenda={leyenda} w={w} h={h}
              anchoEtiqueta={138}
              marcaEnfasis
              maximo={envios}
              formatoEje={(v) => entero(v)}
              tituloEje="Envíos que llegan a cada paso (base: los 23.529)"
            />
          )}
        </Lienzo>
      </div>
    </section>
  )
}

// D1 — la trayectoria de la cohorte (dirección 4c). Antes esta vista dibujaba la exposición
// contra las dos bases posibles: dos barras de tramos que decían de qué tamaño es el problema
// pero no desde cuándo. La misma pregunta la contesta mejor la vista 01 (la cifra) y la 03
// (el reparto por quintil); lo que faltaba era el eje del tiempo sobre la MISMA gente.
//
// Cohorte fija: los clientes en riesgo AL CORTE, mirados hacia atrás año por año. No es la
// tasa de riesgo de cada año — esa es la serie de 25 cortes de la vista 01 — y las dos no
// tienen por qué coincidir. Cada barra va al 100 % sobre la facturación identificada de SU
// año, que entre 2022 y 2024 casi se triplica: comparar los montos crudos no diría nada.
//
// Por qué no acepta filtros. Abrir la serie por celda de contingencia serían ocho columnas
// más sobre 17.136 celdas, casi un mega de payload, y el bundle de un solo archivo que se
// abre con doble clic es una promesa del proyecto. La vista se declara `depende: 'corte'` y
// App.jsx apaga los filtros con leyenda, en vez de dejarlos activos sin efecto (Nielsen H1).

import { Lienzo, BarrasApiladas100 } from '../graficos.jsx'
import { millones, pct, entero, series } from '../agregacion.js'
import { Def } from '../Glosario.jsx'

const ACC = 'var(--acc)'

export default function D1({ info, iCorte }) {
  const anios = series.facturacion_anual_cohorte[iCorte].anios

  // El título contrasta el último año contra el mejor de los ANTERIORES, no contra el mejor
  // de todos: si el máximo cayera en el último año, la frase compararía un año consigo mismo.
  // Los cortes arrancan en dic 2023, así que siempre hay al menos dos años y `previos` nunca
  // queda vacío.
  const ultimo = anios[anios.length - 1]
  const previos = anios.slice(0, -1)
  const pico = previos.reduce((a, b) => (b.pct_en_riesgo > a.pct_en_riesgo ? b : a))
  const pctPico = 100 * pico.pct_en_riesgo
  const pctUltimo = 100 * ultimo.pct_en_riesgo
  const cae = pctUltimo < pctPico
  const caida = Math.abs(pctPico - pctUltimo)
  const totales = anios.map((a) => a.total)

  // De más reciente a más viejo: el año del corte va arriba y en énfasis, que es por donde
  // arranca la lectura. El eje del tiempo baja, no sube.
  const filas = [...anios].reverse().map((a) => {
    const resto = a.total - a.en_riesgo
    const pctRiesgo = 100 * a.pct_en_riesgo
    return {
      etiqueta: a.parcial ? `${a.anio} · al corte` : String(a.anio),
      sub: `ARS ${millones(a.total)}`,
      enfasis: a === ultimo,
      segmentos: [
        {
          clave: 'clientes hoy en riesgo', valor: a.en_riesgo, tono: ACC, tinta: '#fff',
          enfasis: true, texto: `${millones(a.en_riesgo)} · ${pct(pctRiesgo)}`,
        },
        {
          clave: 'resto de la base', valor: resto, tono: 'trama', tinta: 'var(--ink)',
          texto: `${millones(resto)} · ${pct(100 - pctRiesgo)}`,
        },
      ],
    }
  })

  const leyenda = [
    { etiqueta: `clientes en riesgo al corte (${entero(info.enRiesgo)})`, tono: ACC, enfasis: true },
    { etiqueta: 'resto de la base en ese año', tono: 'trama' },
  ]

  return (
    <section className="pant">
      <h1 className="titulo">
        Los mismos clientes pesaban {pct(pctPico)} de lo facturado en {pico.anio} y
        {' '}{pct(pctUltimo)} en {ultimo.anio}
      </h1>
      <p className="bajada">
        {cae
          ? <>Son {caida.toFixed(1).replace('.', ',')} puntos menos sobre exactamente la misma
              gente. </>
          : <>El peso de la cohorte todavía no baja. </>}
        <Def id="cohorte-fija">Cohorte fija</Def>: los {entero(info.enRiesgo)} clientes{' '}
        <Def id="en-riesgo">en riesgo</Def> al <Def id="corte">corte</Def>, mirados hacia atrás.
        Cada barra va sobre la <Def id="facturacion-identificada">facturación identificada</Def>{' '}
        de su propio año, de ARS {millones(Math.min(...totales))} a
        ARS {millones(Math.max(...totales))}.
      </p>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <BarrasApiladas100
              filas={filas} leyenda={leyenda} w={w} h={h}
              anchoEtiqueta={150}
              alturaBarra={110}
              tituloEje="Participación en la facturación identificada del año"
            />
          )}
        </Lienzo>
      </div>

      {/* La circularidad, declarada. Sin esta nota el gráfico se lee como hallazgo entero y
          la mitad es definición: el proxy marca en riesgo justamente al que dejó de comprar. */}
      <p className="z-nota">
        El <Def id="en-riesgo">proxy</Def> define la cohorte por haber dejado de comprar, así
        que el peso de {ultimo.anio} está en parte determinado por esa definición y no es
        hallazgo. Lo que no es definición es cuánto pesaba esa misma gente
        antes: {pct(100 * anios[0].pct_en_riesgo)} en {anios[0].anio}. Cada barra es una
        participación dentro de su propio año, así que la lectura no depende de la{' '}
        <Def id="base-de-precios">base de precios</Def> del extracto.
      </p>
    </section>
  )
}

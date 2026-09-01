// M2b — de reportar cinco segmentos a proponer un experimento (dirección 15f). La versión
// anterior dibujaba las cinco tasas de compra por segmento con su intervalo y titulaba que
// ninguno se despega. Era cierto y estaba bien dibujado, pero la conclusión de esa vista era
// "no se puede concluir nada", repetida cada mes sobre los mismos datos. Con cinco tasas
// indistinguibles el reporte no cambia ninguna decisión.
//
// Lo que la reemplaza es la comparación que falta y por qué falta. Hoy hay una sola tasa
// medible —la de los que recibieron campaña— y no hay contra qué compararla: el dataset no
// tiene grupo de control, así que el efecto de la campaña no es computable por más grande que
// sea la base. Los dos renglones vacíos del gráfico son eso, y son la mitad del argumento.
//
// La otra mitad es el tamaño. `series.potencia_experimento` calcula la diferencia mínima
// detectable con las ramas y los cortes que la propuesta declara (meta.experimento, fijado en
// build.py). Da 1,71 pp sobre una tasa base de 1,21 %: el experimento propuesto solo puede
// ganar si el efecto es enorme. Declararlo antes de correrlo es lo que evita gastar tres
// cortes para volver a escribir "no concluyente".
//
// La asignación a ramas es determinística, no sorteada: un ciclo fijo sobre la lista que ya
// viene ordenada por exposición reparte las tres ramas estratificadas por exposición sin
// depender de una semilla que después habría que justificar.
//
// La propuesta es hacia adelante: se arma sobre la lista del corte de referencia, que es la
// capacidad declarada de 800, y no sobre el corte que alguien tenga puesto. En cortes viejos
// la base en riesgo es más chica (397 clientes en dic 2023) y las ramas no darían los 360 con
// los que está calculado el mínimo detectable: la vista quedaría proponiendo un experimento y
// mostrando la potencia de otro. Por eso `depende: 'ninguno'`, igual que antes.

import { Lienzo, PuntosIC } from '../graficos.jsx'
import { lista, cortes, entero, pesos, millones, pct, series, meta, SIN_FILTRO } from '../agregacion.js'
import { Def } from '../Glosario.jsx'

// El MDE es una diferencia entre dos tasas: se lee en PUNTOS porcentuales, no en por ciento.
// Escrito como '1,71 %' al lado de una base de '1,21 %' se leía como si fueran comparables.
const pp = (v) => `${v.toFixed(2).replace('.', ',')} pp`

// Largo del ciclo de asignación. 20 divide exacto a los 800 de la capacidad y a las ramas
// 360/360/80 propuestas (9 · 9 · 2 por ciclo).
const CICLO = 20

const RAMAS = [
  { id: 'A · reactivación', mensaje: 'volvé a llevar lo que ya comprabas', mide: 'compra a 7 y a 30 días' },
  { id: 'B · cuidado', mensaje: 'novedades de tu categoría', mide: 'compra a 7 y a 30 días' },
  { id: 'C · control', mensaje: 'sin envío', mide: 'línea base del período' },
]

export default function M2b() {
  const g = series.embudo_campanias.global
  const pot = series.potencia_experimento
  const reparto = meta.experimento.ramas
  const nCortes = meta.experimento.cortes_previstos

  const tasa = 100 * g.compra_7dias
  const ic = g.compra_7dias_ic.map((x) => x * 100)
  const mde = pot.mde_pp

  // La lista del corte de referencia, sin filtro: la capacidad declarada entera.
  const filas = lista(cortes.length - 1, SIN_FILTRO)

  // Cortes acumulados del ciclo, derivados del reparto que declara el payload: si mañana
  // build.py propone 400/400/0, la asignación se mueve sola y la vista no miente.
  const totalReparto = reparto.reduce((s, r) => s + r, 0)
  const limites = []
  let acumulado = 0
  for (const r of reparto) {
    acumulado += (r / totalReparto) * CICLO
    limites.push(acumulado)
  }
  const ramaDe = (i) => limites.findIndex((lim) => (i % CICLO) < lim)

  const asignadas = RAMAS.map((r, j) => {
    const suyas = filas.filter((_, i) => ramaDe(i) === j)
    return {
      ...r,
      n: suyas.length,
      exposicion: suyas.reduce((s, f) => s + f.anualizado, 0),
    }
  })
  const totalN = asignadas.reduce((s, r) => s + r.n, 0)
  const totalExp = asignadas.reduce((s, r) => s + r.exposicion, 0)
  const control = asignadas[asignadas.length - 1]

  const datos = [
    {
      etiqueta: 'Recibieron campaña', valor: tasa, ic, enfasis: true,
      nota: `${entero(g.envios)} envíos · ${entero(g.compras)} compras`,
    },
    {
      etiqueta: 'No recibieron campaña', vacio: true,
      nota: 'el dataset no tiene grupo de control',
    },
    {
      etiqueta: 'Efecto de la campaña', vacio: true,
      nota: 'no computable: sin asignación aleatoria',
    },
  ]

  // La vara no es una tasa observada: es el umbral que el experimento propuesto podría
  // distinguir. Que caiga tan a la derecha del punto medido ES la advertencia.
  const referencia = {
    valor: tasa + mde,
    ic: [tasa + mde, tasa + mde],
    rotulo: `mínimo detectable en ${nCortes} cortes`,
  }

  return (
    <section className="pant">
      <h1 className="titulo">
        Falta el control: {nCortes} cortes solo detectan {pp(mde)} sobre una base
        de {pct(tasa, 2)}
      </h1>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(6px, 1vh, 14px)' }}>
        <Lienzo>
          {({ w, h }) => (
            <PuntosIC
              datos={datos} w={w} h={h}
              formato={(v) => pct(v, 2)}
              tituloEje="% de compra a 7 días del envío (IC 95 % de Wilson)"
              anchoEtiqueta={168}
              referencia={referencia}
            />
          )}
        </Lienzo>

        <div className="tarjeta" style={{ flex: '0 0 auto' }}>
          <table className="lista-tabla">
            <thead>
              <tr>
                <th>Rama</th>
                <th>Mensaje</th>
                <th className="num"><Def id="capacidad">Clientes por corte</Def></th>
                <th className="num"><Def id="exposicion">Exposición alcanzada</Def></th>
                <th>Qué se mide</th>
              </tr>
            </thead>
            <tbody>
              {asignadas.map((r, i) => (
                <tr key={r.id} className={i === 0 ? 'activa' : undefined}>
                  <td className="destacado">{r.id}</td>
                  <td>{r.mensaje}</td>
                  <td className="num">{entero(r.n)}</td>
                  <td className="num destacado">{millones(r.exposicion)}</td>
                  <td>{r.mide}</td>
                </tr>
              ))}
              <tr>
                <td className="destacado">Total por corte</td>
                <td>—</td>
                <td className="num">{entero(totalN)}</td>
                <td className="num destacado">{millones(totalExp)}</td>
                <td>{nCortes} cortes para concluir</td>
              </tr>
            </tbody>
          </table>
          <div className="kpi-base" style={{ display: 'flex', gap: 'clamp(14px, 2.4vw, 40px)', flexWrap: 'wrap' }}>
            <span>Asignación por ciclo de {CICLO} sobre la lista ordenada por exposición: las ramas quedan estratificadas sin sortear</span>
            <span><Def id="mde">Detectable</Def> con {nCortes} cortes: {pp(mde)} contra una base de {pct(tasa, 2)}</span>
            <span>Potencia {pct(100 * pot.potencia, 0)}, α {pot.alpha.toString().replace('.', ',')}, dos colas</span>
          </div>
        </div>
      </div>

      <p className="z-nota">
        El control de {entero(control.n)} clientes no se contacta durante {nCortes} cortes: son{' '}
        {pesos(control.exposicion)} de exposición que se dejan sin tocar a propósito, y hay que
        decirlo. Los cinco segmentos actuales dejan de reportarse. El{' '}
        <Def id="mde">mínimo detectable</Def> baja con la raíz del número de cortes: la mitad de
        esa diferencia pediría cuatro veces más cortes.
      </p>
    </section>
  )
}

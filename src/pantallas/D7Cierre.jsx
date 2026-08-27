// D7 — cierre del bloque Directorio. No agrega grafico: es el desarrollo del pedido que ya
// subio a D0 (regla 24, lead with the ending). Piramide de Minto: conclusion en el titulo,
// soporte en los tres articulos, pedido explicito al cierre (regla 25).
//
// Composicion de ACTA, no de tarjetas. Tres tarjetas separadas dejaban aire atrapado en el
// padding de cada una y el pedido quedaba como una caja de media pantalla con un parrafo
// flotando en el medio. Ahora hay UNA superficie con tres articulos a columna completa,
// separados por filete, y el pedido es una banda terminal con el filete de acento arriba:
// se lee como el renglon de la resolucion, no como una tarjeta mas.
//
// Cada columna tiene cuatro bandas con ritmo propio, y por eso llena su alto sin estirar
// nada: numeral y rotulo, la decision en una frase, la cifra que la justifica, y el costo
// anclado abajo. La numeracion grande va en el mono del sistema, que es la voz que el
// tablero ya usa para sus rotulos.
//
// Cada articulo cierra con SU prueba: la serie de recompra contra la banda de meta, y las
// dos particiones. Antes ese tramo quedaba en blanco. El espacio no estaba desaprovechado,
// estaba sin ganar: lo que lo gana es la evidencia de la decision que la columna propone,
// que es justo lo que un cierre tiene que poder mostrar cuando alguien pregunta.

import Semaforo, { estadoRecompra } from '../Semaforo.jsx'
import { Lienzo, Chispa, BarraMini } from '../graficos.jsx'
import { Def } from '../Glosario.jsx'
import {
  entero, lista, meta, mesCorte, pesos, pct, series,
} from '../agregacion.js'

export default function D7({ info, iCorte, filtro }) {
  // La serie de recompra es global (no depende del corte ni de los filtros, igual que en
  // D0 y D4).
  const serieRecompra = series.recompra_trimestral.filter((r) => r.tasa != null)
  const ultima = serieRecompra.length ? serieRecompra[serieRecompra.length - 1] : null
  const valorRecompra = ultima ? ultima.tasa * 100 : null
  const [metaLo, metaHi] = meta.meta_recompra
  const [capLo, capHi] = meta.capacidad_contacto
  const cs = series.consentimiento

  const topExposicion = lista(iCorte, filtro)
  const topConConsentimiento = lista(iCorte, filtro, true)
  const sumaTop = topExposicion.reduce((s, r) => s + r.anualizado, 0)
  const pctTop = info.exposicion ? (100 * sumaTop) / info.exposicion : 0
  const sinConsentimiento = topExposicion.length - topConConsentimiento.length
  // Con cuatro filtros encima el recorte puede quedar sin un solo cliente. "0,0 % de los
  // ARS 0,0 M" es aritmeticamente correcto y no dice nada: el articulo lo declara.
  const vacio = topExposicion.length === 0

  return (
    <section className="pant cab-1">
      <h1 className="titulo">Tres decisiones, ninguna cuesta presupuesto nuevo</h1>
      <p className="bajada">Corren con los datos y la capacidad que ya mostró el tablero.</p>

      {/* El pedido va arriba, no al pie: es lo único que la pantalla le pide al directorio,
          y al pie lo leía el que llegaba hasta abajo. Los tres artículos pasan a ser su
          fundamento, que es el orden de Minto. */}
      <div className="pedido">
        <span className="pedido-lbl">Pedido</span>
        <p className="pedido-txt">
          Aprobar las tres decisiones y tomar el corte de <b>{mesCorte(info.corte)}</b> como
          primera lectura contra los umbrales declarados.
        </p>
      </div>

      <div className="lienzo acta-wrap">
        <div className="acta">
          <Articulo
            n="01"
            rotulo="Indicador de directorio"
            decision={<>La <Def id="recompra-90">recompra a 90 días</Def> pasa a ser el número del directorio.</>}
            cifra={valorRecompra != null ? pct(valorRecompra) : '—'}
            pieCifra={`meta ${metaLo} a ${metaHi} %`}
            marca={valorRecompra != null && (
              <Semaforo estado={estadoRecompra(valorRecompra, meta.meta_recompra)}
                        de="recompra a 90 días" glosario="recompra-90" />
            )}
            apoyo="Dueña: María G. Cadencia mensual."
            prueba={<Lienzo>{({ w, h }) => (
              <Chispa serie={serieRecompra.map((r) => r.tasa * 100)} w={w} h={h}
                      banda={[metaLo, metaHi]} tonoBanda="var(--sem-meta)"
                      rotuloBanda="meta" rotulo={pct(valorRecompra)} />
            )}</Lienzo>}
            pieprueba={`${serieRecompra[0].trimestre} a ${ultima.trimestre}`}
            costo="Ya se mide cada corte, con semáforo y cadencia de la Parte D."
          />
          <Articulo
            n="02"
            rotulo="Orden de la lista"
            decision={<>La lista se ordena por <Def id="criterio-orden">exposición</Def>, no por segmento.</>}
            cifra={vacio ? '—' : pct(pctTop)}
            pieCifra={vacio ? 'no hay clientes con este recorte' : `de los ${pesos(info.exposicion)} en riesgo`}
            apoyo={vacio
              ? 'El criterio no depende del recorte.'
              : `${entero(topExposicion.length)} clientes de ${pesos(sumaTop)}.`}
            prueba={<Lienzo>{({ w, h }) => (
              <BarraMini parte={sumaTop} total={info.exposicion} w={w} h={h}
                         alturaBarra={Math.min(66, h * 0.46)} rotulo={vacio ? null : pct(pctTop)}
                         pie={vacio ? null : `de ${pesos(info.exposicion)} en riesgo`} />
            )}</Lienzo>}
            pieprueba=""
            costo={`Misma capacidad de ${capLo} a ${capHi} por mes: cambia el corte, no el cupo.`}
          />
          <Articulo
            n="03"
            rotulo="Filtro de consentimiento"
            decision={<>Cada envío se filtra por <Def id="consentimiento">consentimiento</Def> antes de salir.</>}
            cifra={pct(cs.pct_envios_a_no_acepta * 100)}
            pieCifra={`${entero(cs.envios_a_no_acepta)} de ${entero(cs.envios_base)} envíos hoy`}
            apoyo={vacio
              ? 'La base es la campaña completa, no el recorte.'
              : `En este corte, ${entero(sinConsentimiento)} de ${entero(topExposicion.length)}.`}
            prueba={<Lienzo>{({ w, h }) => (
              <BarraMini parte={cs.envios_a_no_acepta} total={cs.envios_base} w={w} h={h}
                         alturaBarra={Math.min(66, h * 0.46)} excepcion
                         rotulo={pct(cs.pct_envios_a_no_acepta * 100)}
                         pie={`de ${entero(cs.envios_base)} envíos`} />
            )}</Lienzo>}
            pieprueba=""
            costo="Filtro previo sobre la misma lista. No suma envíos."
          />
        </div>

      </div>
    </section>
  )
}

/** Un artículo del acta. El costo va anclado abajo (margin-top:auto en .art-costo): así las
 *  tres columnas cierran a la misma altura aunque la decisión tenga distinto largo. */
function Articulo({ n, rotulo, decision, cifra, pieCifra, marca, apoyo, prueba, pieprueba, costo }) {
  return (
    <article className="art">
      <div className="art-cab">
        <span className="art-n tabular">{n}</span>
        <span className="art-rot">{rotulo}</span>
      </div>

      <p className="art-decision">{decision}</p>

      <div className="art-cifra">
        <span className="art-val tabular">{cifra}</span>
        <span className="art-val-pie">{pieCifra}</span>
      </div>

      {/* .art-marca se monta siempre, no solo en la columna 01: si no, esa columna arranca
          .art-apoyo y .art-prueba más abajo que 02 y 03 (VIS-12) porque solo ella suma el
          alto de la pastilla del semáforo. Donde no hay marca real se reserva el mismo hueco
          con visibility:hidden (no display:none, que no ocupa espacio): mismo componente,
          mismo alto, invisible y afuera del árbol de accesibilidad. */}
      <div className="art-marca" style={marca ? undefined : { visibility: 'hidden' }}>
        {marca || <Semaforo estado="fuera" tamano="chico" />}
      </div>
      <p className="art-apoyo">{apoyo}</p>

      {/* La prueba absorbe el alto que sobra (flex:1 en .art-prueba), así la columna no
          queda con un hueco entre el apoyo y el costo. */}
      {prueba && (
        <div className="art-prueba">
          {prueba}
          {pieprueba && <span className="art-prueba-pie">{pieprueba}</span>}
        </div>
      )}

      <p className="art-costo"><span>Costo cero</span>{costo}</p>
    </article>
  )
}

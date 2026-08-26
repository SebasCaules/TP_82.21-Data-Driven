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

      <div className="lienzo acta-wrap">
        <div className="acta">
          <Articulo
            n="01"
            rotulo="Indicador de directorio"
            decision="La recompra a 90 días pasa a ser el número que el directorio mira cada corte."
            cifra={valorRecompra != null ? pct(valorRecompra) : '—'}
            pieCifra={`meta ${metaLo} a ${metaHi} %`}
            marca={valorRecompra != null && (
              <Semaforo estado={estadoRecompra(valorRecompra, meta.meta_recompra)}
                        de="recompra a 90 días" />
            )}
            apoyo="Dueña: María G. Cadencia mensual."
            prueba={<Lienzo>{({ w, h }) => (
              <Chispa serie={serieRecompra.map((r) => r.tasa * 100)} w={w} h={h}
                      banda={[metaLo, metaHi]} />
            )}</Lienzo>}
            pieprueba={`${serieRecompra[0].trimestre} a ${ultima.trimestre} contra la banda de meta`}
            costo="Ya se mide todos los cortes. El semáforo y la cadencia están fijados en la Parte D."
          />
          <Articulo
            n="02"
            rotulo="Orden de la lista"
            decision="La lista de Marketing se ordena por exposición, no por segmento de fidelización."
            cifra={vacio ? '—' : pct(pctTop)}
            pieCifra={vacio ? 'no hay clientes con este recorte' : `de los ${pesos(info.exposicion)} en riesgo`}
            apoyo={vacio
              ? 'La decisión no depende del recorte: es el criterio con el que se ordena la lista.'
              : `Los ${entero(topExposicion.length)} primeros concentran ${pesos(sumaTop)}.`}
            prueba={<Lienzo>{({ w, h }) => (
              <BarraMini parte={sumaTop} total={info.exposicion} w={w} h={h} alturaBarra={Math.min(78, h * 0.5)} />
            )}</Lienzo>}
            pieprueba={vacio ? '' : `la parte llena son los ${entero(topExposicion.length)} de mayor exposición`}
            costo={`Misma capacidad de ${capLo} a ${capHi} contactos por mes: cambia el criterio de corte, no el cupo.`}
          />
          <Articulo
            n="03"
            rotulo="Filtro de consentimiento"
            decision="Cada envío se filtra por consentimiento antes de salir."
            cifra={pct(cs.pct_envios_a_no_acepta * 100)}
            pieCifra={`${entero(cs.envios_a_no_acepta)} de ${entero(cs.envios_base)} envíos hoy`}
            apoyo={vacio
              ? 'La campaña completa es la base de esta cifra, no el recorte.'
              : `En este corte son ${entero(sinConsentimiento)} de ${entero(topExposicion.length)}.`}
            prueba={<Lienzo>{({ w, h }) => (
              <BarraMini parte={cs.envios_a_no_acepta} total={cs.envios_base} w={w} h={h}
                         alturaBarra={Math.min(78, h * 0.5)} excepcion />
            )}</Lienzo>}
            pieprueba="la parte llena son los envíos que hoy salen sin permiso"
            costo="Filtro previo sobre la misma lista. No suma envíos ni gente nueva."
          />
        </div>

        <div className="pedido">
          <span className="pedido-lbl">Pedido<br />al directorio</span>
          <p className="pedido-txt">
            Aprobar las tres decisiones en esta reunión y tomar el corte de{' '}
            <b>{mesCorte(info.corte)}</b> como primera lectura contra los umbrales ya
            declarados.
          </p>
          <span className="pedido-sello tabular">{mesCorte(info.corte)}</span>
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

      {marca && <div className="art-marca">{marca}</div>}
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

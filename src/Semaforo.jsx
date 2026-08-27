// Semaforo con las tres etiquetas que fija la Parte D §2.1. Cada estado cambia de FORMA
// ademas de color y lleva su texto: el negocio pidio explicitamente no depender del color,
// y en una impresion en blanco y negro el color no existe.
//
// Antes era un renglon de 10,5 px que se leia como leyenda del grafico y habia que buscarlo.
// Ahora es una pastilla con borde, rotulo ESTADO y la forma a la izquierda: el elemento que
// el directorio mira primero tiene que verse primero.

import { Def } from './Glosario.jsx'
import { ESTADOS, Luz } from './SemaforoLuz.jsx'

export function estadoRecompra(valor, [lo]) {
  if (valor >= lo) return 'meta'
  if (valor >= lo - 1) return 'cerca'
  return 'fuera'
}

/** Para los KPIs donde MENOS es mejor: clientes en riesgo (verde <38 %, amarillo 38-42 %,
 *  rojo >42 %) y riesgo en Q5 (verde <45 %, amarillo 45-52 %, rojo >52 %). Los umbrales
 *  salen de la Parte D §2.1 entregada, no se inventan aca. Devuelve claves 'inv-*' propias
 *  (no 'meta'/'cerca'/'fuera') porque el rótulo de la banda del medio es otro: ver ESTADOS. */
export function estadoInverso(valor, [lo, hi]) {
  if (valor < lo) return 'inv-meta'
  if (valor <= hi) return 'inv-cerca'
  return 'inv-fuera'
}

/**
 * `tamano`: 'chico' para meterlo en la cabecera de una tarjeta, 'grande' para cuando el
 * estado ES el mensaje de la pantalla. `de` nombra el indicador, porque una pastilla suelta
 * que dice "Fuera de meta" no dice fuera de meta de que.
 *
 * `glosario` es la entrada del glosario con los tres cortes del semaforo. Sin ella la
 * pastilla dice el estado pero no contra que: los umbrales estaban en la Parte D, o sea en
 * otro archivo, y "fuera de meta" es justo la afirmacion que alguien va a querer discutir en
 * el momento. Con ella, la pastilla entera es el disparador y muestra verde/ambar/rojo con
 * sus cortes. El espaciador invisible de D7 no la pasa, y por eso no se vuelve interactivo.
 */
export default function Semaforo({ estado, sufijo, de, contra, tamano = 'chico', glosario }) {
  const e = ESTADOS[estado] ?? ESTADOS.fuera
  const leido = `Estado${de ? ` de ${de}` : ''}: ${e.texto}${sufijo ? `, ${sufijo}` : ''}` +
                `${contra ? `, ${contra}` : ''}`
  const pastilla = (
    <span className={`sem sem-${e.forma} sem-${tamano}`}
          role={glosario ? undefined : 'img'}
          aria-label={glosario ? undefined : leido}>
      {/* El rótulo ESTADO al frente es lo que separa la pastilla de una leyenda del gráfico.
          Solo en el tamaño grande: dentro de una tarjeta angosta empuja el texto afuera, y
          ahí el rótulo de la tarjeta ya dice de qué indicador se trata. */}
      {tamano === 'grande' && <span className="sem-cab" aria-hidden="true">Estado</span>}
      <Luz luz={e.luz} />
      <span className="sem-txt" aria-hidden="true">
        {e.texto}{sufijo ? <b className="tabular">{'\u00a0'}{sufijo}</b> : null}
      </span>
      {contra && <span className="sem-contra" aria-hidden="true">{contra}</span>}
    </span>
  )

  if (!glosario) return pastilla
  return (
    <Def id={glosario} className="def-sem" etiqueta={`${leido}. Ver los umbrales y la ecuación`}>
      {pastilla}
    </Def>
  )
}

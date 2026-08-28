// Glosario del tablero: cada término que decide algo lleva, a un toque, su definición, la
// ecuación con la que se calcula, el umbral contra el que se lee y de dónde sale.
//
// Por qué existe. El tablero afirma cosas ("2.452 en riesgo", "fuera de meta", "no se
// distingue de la vara") que dependen de definiciones que no están en pantalla: qué cuenta
// como en riesgo, contra qué umbral se pinta el semáforo, qué intervalo se usó. Antes eso
// vivía en la Parte D y en pipeline/CONTRACT.md, es decir en otro archivo y en otra reunión.
// Un directorio que pregunta "¿por qué ese es el umbral?" en la mitad de la presentación
// tiene que poder verlo ahí mismo.
//
// Qué NO es. No es ayuda contextual ni un tour. No explica cómo usar la interfaz: explica de
// dónde sale el número. Si una entrada no tiene ecuación o umbral, esos renglones no se
// dibujan en vez de rellenarse con prosa.
//
// Fuente única. Los umbrales numéricos salen de `meta` (el payload), no de acá: si mañana
// build.py cambia `umbral_en_riesgo`, el glosario lo sigue solo. Lo que está escrito a mano
// es la prosa y la ecuación, que no viven en ningún lado más.

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { meta } from './agregacion.js'
import { ESTADOS, Luz } from './SemaforoLuz.jsx'

const [RIESGO_LO, RIESGO_HI] = meta.umbral_en_riesgo
const [Q5_LO, Q5_HI] = meta.umbral_q5
const [META_LO, META_HI] = meta.meta_recompra
const [BASE_LO, BASE_HI] = meta.base_recompra
const [CAP_LO, CAP_HI] = meta.capacidad_contacto

const coma = (n) => String(n).replace('.', ',')

export const GLOSARIO = {
  'en-riesgo': {
    termino: 'Cliente en riesgo',
    definicion: 'Cliente elegible que lleva sin comprar más de 90 días o más de una vez y media su propio ritmo. Es una regla operativa sobre inactividad, no una predicción de abandono.',
    ecuacion: 'en_riesgo = elegible ∧ recency > máx(90 d, 1,5 × gap_mediano)',
    umbral: '90 días es el piso absoluto; el factor 1,5 lo hace relativo al cliente, para que uno que compra cada 20 días no se mida con la misma vara que uno que compra cada 200.',
    fuente: 'CONTRACT.md §3 · pipeline/features.py',
  },
  elegible: {
    termino: 'Elegible',
    definicion: 'Cliente con historia suficiente para tener un ritmo propio. Uno que compró dos veces no tiene mediana de intervalo que valga.',
    ecuacion: 'elegible = n_compras ≥ 3',
    fuente: 'CONTRACT.md §3',
  },
  recency: {
    termino: 'Recency',
    definicion: 'Días entre la última compra del cliente y el corte.',
    ecuacion: 'recency = corte − última compra',
    fuente: 'CONTRACT.md §3',
  },
  'gap-mediano': {
    termino: 'Gap mediano',
    definicion: 'El ritmo propio del cliente: la mediana de los días entre sus compras consecutivas. Mediana y no promedio, porque una compra aislada de hace tres años no tiene que mover el ritmo.',
    ecuacion: 'gap_mediano = mediana(días entre compras consecutivas)',
    fuente: 'CONTRACT.md §3',
  },
  anualizado: {
    termino: 'Gasto anualizado',
    definicion: 'Lo que el cliente gasta por año, estimado sobre toda su historia. El divisor va hasta el CORTE y no hasta la última compra: si no, el que dejó de comprar quedaría con un anualizado inflado justo por haber dejado de comprar.',
    ecuacion: 'anualizado = facturación ÷ años,  años = (corte − primera compra) ÷ 365,25',
    umbral: 'Con menos de un año de historia el divisor es menor que 1 y el anualizado se infla. No se corrige: se declara, con el conteo de clientes afectados y la base sin ellos.',
    fuente: 'CONTRACT.md §3 · pipeline/features.py',
  },
  exposicion: {
    termino: 'Exposición',
    definicion: 'La facturación anual que está en manos de clientes en riesgo. Es lo que está expuesto, NO lo que se recupera: ninguna campaña devuelve esa cifra.',
    ecuacion: 'exposición = Σ anualizado de los clientes en riesgo',
    fuente: 'CONTRACT.md §3 · Parte D §1',
  },
  'facturacion-identificada': {
    termino: 'Facturación identificada',
    definicion: 'Ventas con id_cliente conocido. Es alrededor del 55 % de la venta total de la empresa: el resto no se puede atribuir a nadie y no entra en ningún cálculo por cliente.',
    ecuacion: 'identificada = Σ monto_neto de las filas con id_cliente conocido',
    fuente: 'pipeline/series.py · base_activa_anual',
  },
  'cohorte-fija': {
    termino: 'Cohorte fija',
    definicion: 'Los clientes se clasifican UNA sola vez, al corte, y después se les mira toda la historia hacia atrás. No es la tasa de riesgo de cada año: esa es otra lectura y no tiene por qué coincidir.',
    ecuacion: 'cohorte = { clientes en riesgo al corte } — fija para los cuatro años',
    umbral: 'El proxy define la cohorte por haber dejado de comprar, así que la caída del último año es en parte definición. Lo que no es definición es cuánto pesaban antes.',
    fuente: 'pipeline/series.py · facturacion_anual_cohorte',
  },
  quintil: {
    termino: 'Quintil de valor',
    definicion: 'La base partida en cinco grupos iguales por facturación acumulada. Q5 es el 20 % que más factura.',
    ecuacion: 'quintil = qcut(facturación, 5) → 1 a 5',
    fuente: 'CONTRACT.md §3',
  },
  rfm: {
    termino: 'Segmento RFM',
    definicion: 'Siete segmentos excluyentes sobre los quintiles de recency, frecuencia y monto. Las reglas se evalúan en orden y la primera que aplica gana.',
    ecuacion: 'Campeones R≥4∧F≥4∧M≥4 · En riesgo R≤2∧F≥3 · Leales R≥3∧F≥4 · Hibernando R≤2∧F≤2 · Nuevos R≥4∧n=1 · Potenciales R≥4∧F≤2 · Perdidos: el resto',
    fuente: 'CONTRACT.md §3',
  },
  'umbral-riesgo': {
    termino: 'Umbral de clientes en riesgo',
    definicion: 'El semáforo del porcentaje de la base que está en riesgo. Acá menos es mejor, así que el verde es el tramo bajo.',
    semaforo: [
      { estado: 'inv-fuera', rango: `más de ${coma(RIESGO_HI)} %` },
      { estado: 'inv-cerca', rango: `${coma(RIESGO_LO)} a ${coma(RIESGO_HI)} %` },
      { estado: 'inv-meta', rango: `menos de ${coma(RIESGO_LO)} %` },
    ],
    umbral: 'Los tres cortes los fijó el negocio antes de ver el dato, no salen de la distribución observada.',
    fuente: 'Parte D §2.1',
  },
  'umbral-q5': {
    termino: 'Umbral de riesgo en Q5',
    definicion: 'El mismo semáforo aplicado al quintil que más factura, donde el riesgo cuesta más plata por cliente.',
    semaforo: [
      { estado: 'inv-fuera', rango: `más de ${coma(Q5_HI)} %` },
      { estado: 'inv-cerca', rango: `${coma(Q5_LO)} a ${coma(Q5_HI)} %` },
      { estado: 'inv-meta', rango: `menos de ${coma(Q5_LO)} %` },
    ],
    umbral: 'Más alto es peor: la luz verde es el tramo bajo, al revés que en la recompra.',
    fuente: 'Parte D §2.1',
  },
  'recompra-90': {
    termino: 'Recompra a 90 días',
    definicion: 'De los clientes que compraron en un trimestre, qué parte vuelve a comprar dentro de los 90 días siguientes a esa última compra. Un trimestre entra al cálculo solo si su cierre más 90 días cae dentro de los datos: los que no, se cortan y no se interpolan.',
    ecuacion: 'recompra = clientes con otra compra ≤ 90 d ÷ clientes del trimestre',
    semaforo: [
      { estado: 'fuera', rango: `menos de ${coma(META_LO - 1)} %` },
      { estado: 'cerca', rango: `${coma(META_LO - 1)} a ${coma(META_LO)} %` },
      { estado: 'meta', rango: `${coma(META_LO)} % o más` },
    ],
    umbral: `La meta declarada es ${coma(META_LO)} a ${coma(META_HI)} % y la línea base histórica ${coma(BASE_LO)} a ${coma(BASE_HI)} %: el corte de "por debajo" cae justo sobre esa base.`,
    fuente: 'CONTRACT.md §4.4 · Parte D §2.1',
  },
  'compra-7dias': {
    termino: 'Compra a 7 días',
    definicion: 'Envíos seguidos de una compra del mismo cliente dentro de la semana. Es atribución por ventana, no causalidad: nadie asignó las campañas al azar.',
    ecuacion: 'compra_7d = envíos con compra ≤ 7 d ÷ envíos',
    umbral: 'En estos datos ninguna compra a 7 días ocurre sin clic previo, así que el salto de abrir a comprar es mecánico.',
    fuente: 'pipeline/series.py · embudo_campanias',
  },
  'ic-wilson': {
    termino: 'Intervalo de Wilson (95 %)',
    definicion: 'La precisión de una tasa. Se usa el de Wilson y no el normal porque con p cerca de 0,01 y n de pocos miles el de Wald se sale del [0, 1] y subestima el ancho. Dos intervalos que se pisan no se distinguen entre sí.',
    ecuacion: 'centro = (p + z²∕2n) ÷ (1 + z²∕n),  radio = z·√(p(1−p)∕n + z²∕4n²) ÷ (1 + z²∕n),  z = 1,96',
    fuente: 'pipeline/series.py · _wilson',
  },
  'criterio-orden': {
    termino: 'Criterio de orden',
    definicion: 'La regla con la que se arma la lista de contacto. Cada criterio define un subconjunto de la base en riesgo y de ahí se toman los de mayor anualizado hasta llenar la capacidad.',
    ecuacion: 'lista = ordenar(subconjunto, anualizado ↓)[1 … capacidad]',
    umbral: 'Se elige por cobertura y no por tasa: las diferencias de tasa caen todas dentro de sus intervalos, las de cobertura son de decenas de millones.',
    fuente: 'pipeline/series.py · criterios_orden',
  },
  'compras-esperadas': {
    termino: 'Compras esperadas',
    definicion: 'La tasa observada multiplicada por la capacidad. No es un pronóstico: es la aritmética de una tasa que ya se reporta, con su intervalo propagado por el mismo factor.',
    ecuacion: 'esperadas = compra_7d × capacidad,  intervalo = [lo, hi] × capacidad',
    fuente: 'pipeline/series.py · criterios_orden',
  },
  azar: {
    termino: 'Criterio al azar',
    definicion: 'La vara nula: qué cobertura da elegir clientes en riesgo sin ningún criterio. No se sortea, se reporta el valor esperado; una corrida con semilla habría pedido justificar la semilla.',
    ecuacion: 'exposición esperada = capacidad × anualizado medio de la base en riesgo',
    fuente: 'pipeline/series.py · criterios_orden',
  },
  capacidad: {
    termino: 'Capacidad de contacto',
    definicion: 'Cuántos clientes puede contactar Marketing por mes. Es una restricción declarada del negocio, no un resultado del análisis: fija el tamaño de la lista y de cualquier experimento.',
    ecuacion: `capacidad = ${CAP_LO} a ${CAP_HI} contactos por mes`,
    fuente: 'CONTRACT.md §4.3 · decisión compuerta 1',
  },
  tramo: {
    termino: 'Tramo semanal',
    definicion: 'La lista ordenada por exposición se corta en lotes de 200, uno por semana de contacto. Como el orden es por exposición, el primer lote vale bastante más que el último.',
    ecuacion: 'tramo k = lista[200·(k−1) + 1 … 200·k]',
    fuente: 'Parte D §4 · src/pantallas/M1Lista.jsx',
  },
  'ticket-medio': {
    termino: 'Ticket medio del tramo',
    definicion: 'La exposición del tramo repartida entre sus clientes. Dice cuánto vale contactar a uno cualquiera de ese lote.',
    ecuacion: 'ticket = exposición del tramo ÷ clientes del tramo',
    fuente: 'src/pantallas/M1Lista.jsx',
  },
  contactable: {
    termino: 'Contactable',
    definicion: 'Cliente que consintió recibir comunicaciones. Sin consentimiento no se puede contactar aunque esté primero en la lista.',
    ecuacion: 'contactable = acepta_marketing en el maestro de Clientes',
    fuente: 'Ley 25.326 · Parte D §6.1',
  },
  consentimiento: {
    termino: 'Envío sin consentimiento',
    definicion: 'Envío que salió a un cliente con acepta_marketing en falso. Es incumplimiento reconocido por el negocio, no una métrica de desempeño.',
    ecuacion: 'sin_consentimiento = envíos a clientes con acepta_marketing = falso ÷ envíos',
    umbral: 'La meta es cero, no una tendencia. Cualquier valor por encima de cero es incumplimiento.',
    fuente: 'Ley 25.326 art. 12 · Parte D §6.1',
  },
  mde: {
    termino: 'Diferencia mínima detectable',
    definicion: 'El efecto más chico que un experimento de ese tamaño puede distinguir del ruido. Si el efecto real es menor, el resultado va a ser "no concluyente" se corra o no: declararlo antes es lo que evita gastar los cortes para no aprender nada.',
    ecuacion: 'n por rama = (z₍₁₋α∕₂₎·√(2p̄(1−p̄)) + z₍potencia₎·√(p₀(1−p₀) + p₁(1−p₁)))² ÷ δ²',
    umbral: 'α 0,05 a dos colas, potencia 80 %. El mínimo detectable baja con la raíz del número de cortes: la mitad de la diferencia pide cuatro veces más cortes.',
    fuente: 'pipeline/series.py · potencia_experimento',
  },
  corte: {
    termino: 'Corte',
    definicion: 'Fin de mes. Todo se recalcula desde cero en cada corte usando solo transacciones anteriores a él: recency, ritmo, quintiles, RFM y riesgo. Nunca se usa la fecha máxima de los datos como corte.',
    ecuacion: '25 cortes mensuales, de dic 2023 a dic 2025',
    fuente: 'CONTRACT.md §2 y §6.2',
  },
  'base-de-precios': {
    termino: 'Base de precios',
    definicion: 'El extracto no tiene deriva de precios: el precio unitario implícito baja 7,6 % entre 2022 y 2025 y va plano en las siete categorías, contra un IPC que en el período multiplicó los precios por más de 13. Los importes no son pesos corrientes y el negocio todavía no declaró qué son. Por eso no se deflacta: no hay inflación en el dato que corregir.',
    ecuacion: 'mediana de monto_neto / unidades: 8.900 (2022) → 8.221 (2025)',
    fuente: 'CONTRACT.md §1 · medición del 27/08/2026',
  },
}

/**
 * Término con su ficha. Se abre con clic o con Enter y se cierra con Escape, con un clic
 * afuera o volviendo a tocarlo.
 *
 * La ficha se monta en un portal al <body>, en position:fixed calculada del rect del
 * disparador. Dos razones, las dos duras:
 *   · adentro de `.pant` hay overflow:hidden por todos lados —es lo que sostiene la promesa
 *     de cero scroll— y un popover en flujo queda recortado por la primera caja que lo
 *     contiene;
 *   · la mitad de los términos viven dentro de un <p> (la bajada, la z-nota), y un <p> no
 *     puede contener un <div> ni otro <p>. En flujo, React tira error de anidado inválido y
 *     el navegador cierra el párrafo por su cuenta, que rompe el layout de la cabecera.
 */
export function Def({ id, children, className = '', etiqueta }) {
  const entrada = GLOSARIO[id]
  const [abierto, setAbierto] = useState(false)
  const [pos, setPos] = useState(null)
  const refBoton = useRef(null)
  const refPop = useRef(null)
  const idPop = useId()

  // Dos pasadas, a propósito y sin lista de dependencias. En la primera la ficha todavía no
  // tiene ancho fijo, así que su alto medido es el de un <div> a ancho natural y no el real:
  // con ese alto la prueba de "¿entra abajo?" daba que sí y tres términos del pie de página
  // quedaban con la mitad de la ficha fuera de la ventana. La primera pasada fija el ancho,
  // la segunda mide el alto correcto y reubica. El guard de identidad corta el ciclo.
  useLayoutEffect(() => {
    if (!abierto || !refBoton.current || !refPop.current) return
    const r = refBoton.current.getBoundingClientRect()
    const ancho = Math.min(430, window.innerWidth - 24)
    const alto = refPop.current.offsetHeight
    const abajo = r.bottom + 8
    const arriba = r.top - alto - 8
    // Abajo del término salvo que no entre, y ahí sale arriba. El clamp final es el que
    // garantiza que nunca se salga, aunque el alto sorprenda.
    const preferido = abajo + alto <= window.innerHeight - 8 ? abajo : arriba
    const siguiente = {
      left: Math.max(12, Math.min(r.left, window.innerWidth - ancho - 12)),
      top: Math.max(8, Math.min(preferido, window.innerHeight - alto - 8)),
      width: ancho,
    }
    setPos((previo) => (previo
      && previo.left === siguiente.left
      && previo.top === siguiente.top
      && previo.width === siguiente.width
      ? previo : siguiente))
  })

  useEffect(() => {
    if (!abierto) return
    const fuera = (e) => {
      if (refPop.current?.contains(e.target) || refBoton.current?.contains(e.target)) return
      setAbierto(false)
    }
    const tecla = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); setAbierto(false); refBoton.current?.focus() }
    }
    // La ficha va anclada a coordenadas de ventana: al cambiar de tamaño queda flotando en
    // el lugar equivocado, así que se cierra. El handler se saca en la limpieza y no con
    // `once`: si no, cada apertura que se cierra sin resize deja un listener colgado.
    const alRedimensionar = () => setAbierto(false)
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', tecla, true)
    window.addEventListener('resize', alRedimensionar)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', tecla, true)
      window.removeEventListener('resize', alRedimensionar)
    }
  }, [abierto])

  // Un id que no está en el glosario no puede romper la pantalla: se devuelve el texto pelado.
  if (!entrada) return <>{children}</>

  // `etiqueta` la usa el semáforo: ahí el botón envuelve la pastilla entera y el rótulo
  // calculado ("Umbral de riesgo en Q5") taparía el estado, que es lo primero que tiene que
  // anunciarse. Con ella se anuncian los dos, en ese orden.
  return (
    <>
      <button
        ref={refBoton}
        type="button"
        className={`def ${className}`.trim()}
        aria-expanded={abierto}
        aria-controls={abierto ? idPop : undefined}
        aria-label={etiqueta
          || `${typeof children === 'string' ? children : entrada.termino}. Ver definición, ecuación y umbral`}
        onClick={() => setAbierto((v) => !v)}
      >
        {children}
      </button>
      {abierto && createPortal(
        <div
          ref={refPop}
          id={idPop}
          role="dialog"
          aria-label={entrada.termino}
          className="def-pop"
          style={pos
            ? { left: pos.left, top: pos.top, width: pos.width }
            : { left: 0, top: 0, width: Math.min(430, window.innerWidth - 24), visibility: 'hidden' }}
        >
          <span className="def-pop-term">{entrada.termino}</span>
          <p className="def-pop-def">{entrada.definicion}</p>
          {entrada.ecuacion && <code className="def-pop-eq">{entrada.ecuacion}</code>}
          {/* Los tres cortes dibujados y no escritos. "verde < 45 % · ámbar 45 a 52 %" es
              justamente lo que el semáforo existe para no tener que leer: acá cada banda
              lleva su propio semáforo con la luz que le toca prendida, así la ficha se lee
              de un vistazo y en el mismo lenguaje que la pastilla que la abrió. */}
          {entrada.semaforo && (
            <ul className="def-pop-sem">
              {entrada.semaforo.map((banda) => {
                const e = ESTADOS[banda.estado]
                return (
                  <li key={banda.estado} className={`sem-${e.forma}`}>
                    <Luz luz={e.luz} />
                    <b>{e.texto}</b>
                    <span className="tabular">{banda.rango}</span>
                  </li>
                )
              })}
            </ul>
          )}
          {entrada.umbral && (
            <p className="def-pop-umb"><i>Umbral de decisión</i>{entrada.umbral}</p>
          )}
          <span className="def-pop-src">{entrada.fuente}</span>
        </div>,
        document.body,
      )}
    </>
  )
}

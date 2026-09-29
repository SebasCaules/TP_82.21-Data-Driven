// V11b · Variables del dataset (29/09, pedido del usuario). Segunda pantalla de la vista 11: las 43
// variables de churn_cliente_corte_v0.1 agrupadas por archivo de origen, con las que llegaron en el
// Entregable 2 marcadas. «Ver la tabla completa» abre en un modal la tabla de variables de la Parte B
// (sección 3): variable, tipo, rol, fuente, cálculo, accionable, riesgo de sesgo y nota. Datos en
// ../variables.js.
//
// (29/09, después de la presentación) Las marcas confundían: «foto sin fecha», «N con sesgo alto» y
// «nuevo en el E2» iban con el mismo estilo, sin leyenda y por archivo, aunque las dos primeras
// valen para algunas variables y no para el archivo entero. Ahora cada variable lleva su marca
// (rombo: riesgo de sesgo alto; reloj: sin historia), hay una leyenda arriba y cada variable abre
// un texto emergente con su cálculo, de dónde sale el sesgo y por qué igual entra.
import { useEffect, useState } from 'react'
import { TABLA, GRUPOS } from '../variables.js'
import Emergente from '../Emergente.jsx'

export const meta = { id: 'V11b', corto: 'Variables del modelo', titulo: 'Las 43 variables del dataset, por archivo de origen' }

// Fila de la tabla de la Parte B de cada variable: algunas filas agrupan varias
// («compras_90d, compras_90d_prev»), así que se parten por coma.
const FILA = Object.fromEntries(TABLA.flatMap((f) => f.variable.split(', ').map((v) => [v, f])))

// Sin historia: los atributos de Clientes.csv sin fecha propia y el nivel de socio, que salen de
// una foto única del extracto y valen igual en los 33 cortes (app/pipeline/tablon.py). es_socio sí
// se corta en T (fecha_inscripcion), y los puntos y los meses sin movimiento quedan vacíos cuando
// el último movimiento es posterior a T.
const SIN_HISTORIA = new Set(['canal_alta', 'edad', 'edad_flag', 'genero', 'provincia', 'nivel'])

// De dónde sale el riesgo de sesgo alto de cada variable: los sesgos del caso de
// wiki/conceptos/seleccion-de-datos.md y, para las bajas, el motivo más común de
// wiki/fuentes/fuente-dataset-bajas-no-contacto.md.
const FAMILIA = {
  identificacion: 'Sesgo de identificación: solo cuenta las compras con el cliente identificado, así que dejar de identificarse se ve igual que dejar de comprar.',
  contacto: 'Sesgo de contacto: Marketing eligió a quién escribirle, así que la variable mide a quién se contactó y no solo cómo responde el cliente.',
  panel: 'Sesgo de panel: solo una parte de los clientes tiene registros de soporte, así que la variable puede separar a quien está en el panel y no a quien se va.',
  tiendas: 'Depende de dónde tiene tiendas Casa Óga y de qué formato: describe al cliente, no habilita una acción.',
  bajas: 'Sesgo de contacto: la baja depende de cuántos mensajes recibió el cliente; el motivo más común es el exceso de comunicaciones.',
}
const FAMILIA_DE = {
  y_churn_90: 'identificacion', recency_dias: 'identificacion', recency_sobre_umbral: 'identificacion',
  envios_90d: 'contacto', envios_acum: 'contacto', aperturas_90d: 'contacto', clics_90d: 'contacto',
  acepta_marketing: 'contacto', pidio_baja: 'bajas',
  reclamos_90d: 'panel', reclamos_acum: 'panel', consultas_90d: 'panel', nps_ultimo: 'panel',
  nps_sin_interaccion_flag: 'panel', tiene_panel: 'panel',
  region_dominante: 'tiendas', formato_tienda: 'tiendas',
}
// Qué se hace con el sesgo, según el papel de la variable en la tabla.
const destino = (rol) => (rol === 'TARGET'
  ? 'Es lo que se predice: el sesgo se declara como límite de lo que mide el modelo.'
  : rol === 'filtro'
    ? 'No entra al modelo: solo decide a quién se le puede escribir.'
    : 'Entra igual: el sesgo se declara y el E3 mide cuánto aporta la variable.')

const SESGO_LEYENDA = 'Columna «Riesgo de sesgo» de la Parte B, sección 3 (criterio 6 de la clase 8). Alto quiere decir que la variable puede reflejar lo que decidió el negocio (a quién contactó, quién se identifica en caja, quién tiene registros de soporte, dónde hay tiendas) más que la conducta del cliente. No la saca del modelo: el sesgo se declara y el E3 mide cuánto aporta cada una.'
const HISTORIA = 'El extracto trae un solo valor por cliente, del día en que se sacaron los datos, y se usa el mismo en todos los cortes. En un corte viejo puede ser un dato posterior a esa fecha: es un riesgo de fuga declarado en la Parte B, 2.1.'
const HISTORIA_LEYENDA = 'Edad, género, provincia y canal de alta (Clientes) y el nivel de socio (Fidelización) vienen como una foto del día de extracción, sin fechas de cambio. Todas las demás variables usan solo datos con fecha anterior al corte. Es un riesgo de fuga declarado en la Parte B, 2.1.'

export function MarcaSesgo() {
  return <svg className="v11b-marca sesgo" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 .6 9.4 5 5 9.4.6 5Z" /></svg>
}
export function MarcaHistoria() {
  return (
    <svg className="v11b-marca historia" viewBox="0 0 10 10" aria-hidden="true">
      <circle cx="5" cy="5" r="4" /><path d="M5 2.6V5l1.7 1.1" />
    </svg>
  )
}

function Ficha({ nombre, fila }) {
  const sesgo = fila?.sesgo === 'alto'
  return (
    <>
      <span className="v11b-ficha-nombre">{nombre}</span>
      {fila && <p className="def-pop-def">{fila.calculo}</p>}
      {sesgo && (
        <p className="v11b-ficha-marca">
          <MarcaSesgo /><span><b>Riesgo de sesgo alto.</b> {FAMILIA[FAMILIA_DE[nombre]]} {destino(fila.rol)}</span>
        </p>
      )}
      {SIN_HISTORIA.has(nombre) && (
        <p className="v11b-ficha-marca"><MarcaHistoria /><span><b>Sin historia.</b> {HISTORIA}</span></p>
      )}
      {fila?.nota && <span className="def-pop-src">{fila.nota}</span>}
    </>
  )
}

function Variable({ nombre }) {
  const fila = FILA[nombre]
  const sesgo = fila?.sesgo === 'alto'
  const historia = SIN_HISTORIA.has(nombre)
  const marcas = [sesgo && 'riesgo de sesgo alto', historia && 'sin historia'].filter(Boolean).join(', ')
  return (
    <Emergente
      className={`v11b-var${sesgo ? ' sesgo' : ''}${historia ? ' historia' : ''}`}
      etiqueta={marcas ? `${nombre}: ${marcas}` : nombre}
      contenido={<Ficha nombre={nombre} fila={fila} />}
    >
      {sesgo && <MarcaSesgo />}{historia && <MarcaHistoria />}{nombre}
    </Emergente>
  )
}

function Leyenda() {
  return (
    <ul className="v11b-leyenda" aria-label="Leyenda de las marcas">
      <li>
        <Emergente className="v11b-ley" contenido={<p className="def-pop-def">{SESGO_LEYENDA}</p>}>
          <MarcaSesgo /><b>Riesgo de sesgo alto</b>
        </Emergente>
        <span>refleja decisiones del negocio; entra igual y el E3 mide cuánto aporta</span>
      </li>
      <li>
        <Emergente className="v11b-ley" contenido={<p className="def-pop-def">{HISTORIA_LEYENDA}</p>}>
          <MarcaHistoria /><b>Sin historia</b>
        </Emergente>
        <span>un solo valor por cliente, el mismo en todos los cortes</span>
      </li>
    </ul>
  )
}

const total = GRUPOS.reduce((s, g) => s + g.variables.length, 0)
const nuevas = GRUPOS.filter((g) => g.nuevo).reduce((s, g) => s + g.variables.length, 0)

export default function V11bVariables() {
  const [abierto, setAbierto] = useState(false)
  useEffect(() => {
    if (!abierto) return
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setAbierto(false) } }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [abierto])
  return (
    <section className="pant v11b">
      <div className="v11b-banda">
        <p className="v11b-resumen">
          <b>{total} variables</b> de {GRUPOS.length} archivos. <b>{nuevas}</b> salen de los archivos que
          llegaron en el Entregable 2 (soporte, devoluciones y bajas): con ellas se busca llegar a la meta de lift.
        </p>
        <button type="button" className="v11b-ver" onClick={() => setAbierto(true)}>Ver la tabla completa →</button>
      </div>
      <Leyenda />
      <div className="v11b-grilla">
        {GRUPOS.map((g) => (
          <div key={g.clave} className={`tarjeta v11b-grupo ${g.nuevo ? 'nuevo' : ''}`}>
            <div className="v11b-enc">
              <span className="v11b-nombre">{g.nombre}</span>
              {g.nuevo && <span className="v11b-nuevo">nuevo en el E2</span>}
              <span className="v11b-n">{g.variables.length}</span>
            </div>
            <ul className="v11b-vars">
              {g.variables.map((v) => <li key={v}><Variable nombre={v} /></li>)}
            </ul>
          </div>
        ))}
      </div>
      {abierto && (
        <div className="mapa-modal" role="dialog" aria-modal="true" aria-label="Tabla de variables" onClick={() => setAbierto(false)}>
          <div className="mapa-modal-caja v11b-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mapa-modal-enc">
              <strong>Tabla de variables · Parte B, sección 3</strong>
              <button type="button" className="mapa-cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar">×</button>
            </div>
            <Leyenda />
            <table className="v11b-tabla">
              <thead><tr><th>Variable</th><th>Tipo</th><th>Rol</th><th>Fuente</th><th>Cálculo</th><th>Accionable</th><th>Riesgo de sesgo</th><th>Nota</th></tr></thead>
              <tbody>
                {TABLA.map((f) => (
                  <tr key={f.variable} className={f.rol === 'TARGET' ? 'target' : ''}>
                    <td className="v11b-var-celda">
                      {f.variable.split(', ').map((v, i) => (
                        <span key={v}>{i > 0 && ', '}{SIN_HISTORIA.has(v) && <MarcaHistoria />}{v}</span>
                      ))}
                    </td>
                    <td>{f.tipo}</td><td>{f.rol}</td><td>{f.fuente}</td><td>{f.calculo}</td><td>{f.accionable}</td>
                    <td className={`s-${f.sesgo}`}>
                      {f.sesgo === 'alto'
                        ? (
                          <Emergente
                            className="v11b-sesgo-alto"
                            etiqueta="riesgo de sesgo alto"
                            contenido={<p className="def-pop-def">{FAMILIA[FAMILIA_DE[f.variable.split(', ')[0]]]} {destino(f.rol)}</p>}
                          >
                            <MarcaSesgo />alto
                          </Emergente>
                        )
                        : f.sesgo}
                    </td>
                    <td>{f.nota}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}

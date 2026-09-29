// V11b · Variables del dataset (29/09, pedido del usuario). Segunda pantalla de la vista 11: las 43
// variables de churn_cliente_corte_v0.1 agrupadas por archivo de origen, con las que llegaron en el
// Entregable 2 marcadas. «Ver la tabla completa» abre en un modal la tabla de variables de la Parte B
// (sección 3): variable, tipo, rol, fuente, cálculo, accionable, sesgo y nota. Datos en ../variables.js.
import { useEffect, useState } from 'react'
import { TABLA, GRUPOS } from '../variables.js'

export const meta = { id: 'V11b', corto: 'Variables del modelo', titulo: 'Las 43 variables del dataset, por archivo de origen' }

const FOTO = new Set(['Clientes', 'Fidelizacion'])
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
          llegaron en el Entregable 2 (soporte, devoluciones y bajas): de esas señales depende llegar a la meta de lift.
        </p>
        <button type="button" className="v11b-ver" onClick={() => setAbierto(true)}>Ver la tabla completa →</button>
      </div>
      <div className="v11b-grilla">
        {GRUPOS.map((g) => (
          <div key={g.clave} className={`tarjeta v11b-grupo ${g.nuevo ? 'nuevo' : ''}`}>
            <div className="v11b-enc">
              <span className="v11b-nombre">{g.nombre}</span>
              <span className="v11b-n">{g.variables.length}</span>
            </div>
            <div className="v11b-chips">
              {g.nuevo && <span className="v11b-chip nuevo">nuevo en el E2</span>}
              {FOTO.has(g.clave) && <span className="v11b-chip foto">foto sin fecha</span>}
              {g.sesgo_alto > 0 && <span className="v11b-chip sesgo">{g.sesgo_alto} con sesgo alto</span>}
            </div>
            <p className="v11b-vars">{g.variables.join(' · ')}</p>
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
            <table className="v11b-tabla">
              <thead><tr><th>Variable</th><th>Tipo</th><th>Rol</th><th>Fuente</th><th>Cálculo</th><th>Accionable</th><th>Sesgo</th><th>Nota</th></tr></thead>
              <tbody>
                {TABLA.map((f) => (
                  <tr key={f.variable} className={f.rol === 'TARGET' ? 'target' : ''}>
                    <td className="v11b-var">{f.variable}</td><td>{f.tipo}</td><td>{f.rol}</td><td>{f.fuente}</td>
                    <td>{f.calculo}</td><td>{f.accionable}</td><td className={`s-${f.sesgo}`}>{f.sesgo}</td><td>{f.nota}</td>
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

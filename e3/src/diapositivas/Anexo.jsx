// Anexos A1 a A6: tablas de respaldo para preguntas, con las filas que C3 marca en `destacar`.
// Se llega con A, desde la vista general o con #a1 a #a6; «Volver» lleva a la diapositiva de origen.
// (24/10) Abierto directo por la URL no hay origen: el botón dice «Ir a la diapositiva 12», no «Volver».
import Marco, { ANCHO, M, TOTAL, caja } from './Marco.jsx'
import { Rico } from '../texto.jsx'

const NUMERO = /^[−+\-]?[\d.,]+( %)?$/

export default function Anexo({ a, origen, volver, estatico }) {
  const total = a.anchos.reduce((s, x) => s + x, 0)
  const denso = a.filas.length + 1 > 10
  const destacar = new Set(a.destacar ?? [])
  return (
    <Marco kicker={`Anexo ${a.n} · respaldo para preguntas`} titulo={a.titulo} fuente={a.fuente}
           derecha={<>Anexo {a.n}</>} clase="e3-es-anexo">
      {!estatico && (
        <button type="button" className="e3-volver" style={caja(1128, 34, 400, 40)} onClick={volver}>
          {origen ? '← Volver a la diapositiva ' : '← Ir a la diapositiva '}
          <span data-escala="">{origen || TOTAL}</span>
        </button>
      )}
      <div className="e3-anexo-cuerpo" style={caja(M, 216, ANCHO)}>
      <table className={`e3-tabla ${denso ? 'densa' : ''}`}>
        <colgroup>{a.anchos.map((w, k) => <col key={k} style={{ width: `${(100 * w) / total}%` }} />)}</colgroup>
        <thead><tr>{a.columnas.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {a.filas.map((f, k) => (
            <tr key={k} className={destacar.has(k) ? 'destacada' : ''}>
              {f.map((v, j) => (
                <td key={j} className={j > 0 && NUMERO.test(v) ? 'num' : ''}><Rico t={v} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {a.pie && <p className="e3-nota e3-anexo-pie"><Rico t={a.pie} /></p>}
      </div>
    </Marco>
  )
}

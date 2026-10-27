// Diapositiva 2: la respuesta. Cuatro tarjetas, cada una con un botón a su diapositiva (24/10): Técnica
// a la 4, Legal a la 10, Económica a la 8 y la tasa de éxito a la 9. La tarjeta no es un botón:
// el clic en la franja derecha o izquierda pasa de diapositiva, como en las demás. (26/10) La tasa de
// éxito avisa con la banda terracota y la cifra en tinta: el rojo de la cifra queda solo para «No viable».
import { Rico, plano } from '../texto.jsx'
import Marco, { ANCHO, M, QuienN, Y0, caja } from './Marco.jsx'

// Por el área de C3; si el texto cambia, por el orden de las tarjetas.
const DESTINO = { 'Técnica': 4, 'Legal': 10, 'Económica': 8, 'Tasa de éxito': 9 }
const POR_ORDEN = [4, 10, 8, 9]
// Terracota solo para lo que no cierra, como el PPTX.
const MALO = new Set(['Económica'])
const ALERTA = new Set(['Tasa de éxito'])

export default function Respuesta({ d, ir, estatico }) {
  const sep = 30
  const w = (ANCHO - sep * (d.tarjetas.length - 1)) / d.tarjetas.length
  return (
    <Marco kicker={d.kicker} titulo={d.titulo} fuente={d.fuente} n={d.n} derecha={<QuienN quien={d.quien} n={d.n} />}>
      {d.tarjetas.map((t, k) => {
        const destino = DESTINO[t.area] ?? POR_ORDEN[k]
        const malo = MALO.has(t.area)
        return (
          <div key={t.area} className={`e3-tarjeta e3-veredicto ${malo ? 'malo' : ''} ${ALERTA.has(t.area) ? 'alerta' : ''}`}
               style={caja(M + k * (w + sep), Y0, w, 396)}>
            <span className="e3-rotulo">{t.area}</span>
            <span className={`e3-veredicto-valor ${plano(t.valor).length > 6 && !t.valor.includes('[[') ? 'largo' : ''}`}><Rico t={t.valor} /></span>
            <span className="e3-veredicto-escala"><Rico t={t.escala} /></span>
            <span className="e3-veredicto-texto"><Rico t={t.texto} /></span>
            <button type="button" className="e3-ir" tabIndex={estatico ? -1 : 0}
                    onClick={() => ir?.(String(destino))} aria-label={`${t.area}: ir a la diapositiva ${destino}`}>
              ver la <span data-escala="">{destino}</span> →
            </button>
          </div>
        )
      })}
      <div className="e3-decision" style={caja(M, 650, ANCHO, 156)}><p><Rico t={d.decision} /></p></div>
    </Marco>
  )
}

// Formato de los números de la presentación E3 (contrato: pipeline/CONTRACT_E3.md, §1).
//
// (24/10) Mismo redondeo que las anclas de build_e3.py: toFixed(d) de JS sobre el valor absoluto
// (mitad lejos del cero, sobre el valor binario exacto), punto de miles, coma decimal y el menos
// tipográfico U+2212. Los miles se agregan sobre la cadena de toFixed y no con toLocaleString: así
// no hay un segundo redondeo y 1.719 sale con punto en cualquier navegador.
// No se calcula nada acá: cada función recibe un valor de D3 y devuelve cómo se escribe.

const MENOS = '−'
export const NBSP = ' '

/** 1718.93 → "1.719"; -98.5217, 2 → "−98,52"; signo: true agrega «+» a los positivos. */
export function fijo(x, d = 0, signo = false) {
  if (x == null || Number.isNaN(x)) return '—'
  const s = Math.abs(x).toFixed(d)
  const [ent, fr] = s.split('.')
  const cuerpo = ent.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (fr ? ',' + fr : '')
  if (/^0+$/.test(s.replace('.', ''))) return cuerpo          // «0,00», nunca «−0,00»
  if (x < 0) return MENOS + cuerpo
  return signo ? '+' + cuerpo : cuerpo
}

/** Fracción de 0 a 1 → "75,8 %" (se multiplica por 100 antes de redondear). */
export const pct = (frac, d = 1, signo = false) => fijo(frac * 100, d, signo) + NBSP + '%'
/** Porcentaje ya multiplicado por 100 (campos _pct) → "−98,52 %". */
export const pctDirecto = (x, d = 2, signo = false) => fijo(x, d, signo) + NBSP + '%'
export const usd = (x, d = 0) => 'USD' + NBSP + fijo(x, d)
export const ars = (x, d = 0) => 'ARS' + NBSP + fijo(x, d)
export const entero = (x) => fijo(x, 0)

/** Tasa de éxito s: 2 decimales debajo de 5 %, 1 decimal arriba, «100 %» en el extremo. */
export const tasa = (s) => (s >= 1 ? '100' + NBSP + '%' : pct(s, s < 0.05 ? 2 : 1))

/** Puntos para pagar el modelo: entero si es 100 o más, un decimal si es menos (B 3.6). */
export const puntos = (x) => fijo(x, x >= 100 ? 0 : 1)

/** Aciertos: entero si lo es; si no, un decimal (la regla promedia empates: 15,3). */
export const aciertos = (x) => fijo(x, Math.abs(x - Math.round(x)) < 1e-6 ? 0 : 1)

/** "2024-07-31" → "31/07/2024" */
export const fecha = (iso) => {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

/** "2023-01-31" → "enero de 2023" */
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre',
  'noviembre', 'diciembre']
export const mesAnio = (iso) => {
  const [a, m] = iso.split('-')
  return `${MESES[Number(m) - 1]} de ${a}`
}

/** 65 → "1:05" (tiempos del guion). */
export const mmss = (seg) => `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`

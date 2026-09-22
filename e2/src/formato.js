// Formateadores es-AR para las vistas del E2. Copia mínima de los de src/agregacion.js del
// E1 (que no se importa acá porque arrastra src/datos.js, 1,2 MB, al bundle de E2).

const fmtEntero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

/** 50250 → "50.250" */
export const entero = (x) => (x == null || Number.isNaN(x) ? '—' : fmtEntero.format(Math.round(x)))

/** 49.6 → "49,6 %" */
export const pct = (x, dec = 1) => (x == null || Number.isNaN(x) ? '—' : x.toFixed(dec).replace('.', ',') + ' %')

/** 94.9 → "ARS 94,9 M" (x ya en millones) */
export const montoM = (x, dec = 1) => (x == null || Number.isNaN(x) ? '—' : 'ARS ' + x.toFixed(dec).replace('.', ',') + ' M')

/** 12345.6 → "12.345,6" */
export const decimal = (x, dec = 1) => (x == null || Number.isNaN(x) ? '—' : x.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec }))

/** 8900 → "ARS 8.900" */
export const pesos = (x) => (x == null || Number.isNaN(x) ? '—' : 'ARS ' + fmtEntero.format(Math.round(x)))

/** "2025-09" → "sep-25"; "2025-12-31" → "31/12/2025" */
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export const mesCorto = (ym) => { const [a, m] = ym.split('-'); return `${MESES[+m - 1]}-${a.slice(2)}` }
export const fechaCorta = (iso) => { const [a, m, d] = iso.split('-'); return `${d}/${m}/${a}` }

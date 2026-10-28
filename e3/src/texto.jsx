// Texto de C3 en pantalla. El marcado **negrita** de contenido.py llega sin resolver (contrato §2):
// se resuelve acá. Los espacios duros son los mismos que pone armar.py en el PPTX (_sin_cortes):
// antes de %, entre nombre e inicial (María G.) y después de USD o ARS, para que un corte de línea
// no deje nada huérfano.

import { NBSP } from './formato.js'

export function sinCortes(t) {
  return t
    .replace(/ %/g, NBSP + '%')
    .replace(/([A-Za-zÁÉÍÓÚáéíóúñÑ]) ([A-ZÁÉÍÓÚ]\.)/g, `$1${NBSP}$2`)
    .replace(/\b(USD|ARS) /g, `$1${NBSP}`)
}

/** Texto de C3 con sus negritas y, desde el 27/10, [[unidad chica]] pegada a una cifra grande («2,25[[/3]]»). */
export function Rico({ t }) {
  if (!t) return null
  const partes = sinCortes(t).split(/(\*\*.+?\*\*|\[\[.+?\]\])/)
  return partes.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (p.startsWith('[[') && p.endsWith(']]')) return <small key={i} className="e3-chico">{p.slice(2, -2)}</small>
    return p || null
  })
}

/** El texto sin marcado, para un title o un aria-label. */
export const plano = (t) => (t || '').replace(/\*\*/g, '').replace(/\[\[|\]\]/g, '')

/** (27/10, W2) El texto sin las citas al relevamiento («(envío 29)», «(inferido del envío 71)», «, envío
 *  17»): los códigos internos van fuera de pantalla (regla 13 H13 del E2) y quedan en el title. */
export const sinCodigos = (t) => (t || '')
  .replace(/\s*\((?:inferido del )?envío \d+\)/g, '')
  .replace(/,\s*envío \d+(?=\))/g, '')

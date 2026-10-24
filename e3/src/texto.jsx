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

/** Texto de C3 con sus negritas. */
export function Rico({ t }) {
  if (!t) return null
  const partes = sinCortes(t).split(/(\*\*.+?\*\*)/)
  return partes.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p || null)
}

/** El texto sin marcado, para un title o un aria-label. */
export const plano = (t) => (t || '').replace(/\*\*/g, '')

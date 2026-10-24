// Registro de páginas: las 12 diapositivas de C3, en su orden, y los 6 anexos. Solo App.jsx lo lee.
//
// (24/10) Pasos dentro de una diapositiva solo donde el guion narra una secuencia: la 3 (el ritmo y
// el umbral, el corte, el cruce) y la 6 (el piso, la regla, los modelos). GUION_PASOS dice desde
// qué frase del guion de C3 acompaña cada paso, para marcarlo en las notas del orador.
import { C3 } from '../contenido_e3.js'
import Portada from './D01_Portada.jsx'
import Respuesta from './D02_Respuesta.jsx'
import Problema from './D03_Problema.jsx'
import Tecnica from './D04_Tecnica.jsx'
import Mvp from './D05_Mvp.jsx'
import Modelos from './D06_Modelos.jsx'
import Lista from './D07_Lista.jsx'
import Economia from './D08_Economia.jsx'
import Tasa from './D09_Tasa.jsx'
import Legal from './D10_Legal.jsx'
import Riesgos from './D11_Riesgos.jsx'
import Piloto from './D12_Piloto.jsx'
import Anexo from './Anexo.jsx'

const COMPONENTES = {
  portada: Portada, veredictos: Respuesta, problema: Problema, figura_filas: Tecnica, flujo: Mvp,
  economia: Economia, legal: Legal, riesgos: Riesgos, piloto: Piloto,
}
// figura_callouts tiene tres diapositivas distintas en la web: se eligen por número.
const POR_NUMERO = { 6: Modelos, 7: Lista, 9: Tasa }

export const PASOS = { 3: 3, 6: 3 }
export const GUION_PASOS = {
  3: ['y al corte llevaba', 'En los 90 días siguientes'],
  6: ['La regla del umbral, sin modelo', 'Después entrenamos tres modelos'],
}

export const DIAPOSITIVAS = C3.DIAPOSITIVAS.map((d) => ({
  id: String(d.n), tipo: 'diapositiva', n: d.n, d,
  pasos: PASOS[d.n] ?? 1,
  Componente: POR_NUMERO[d.n] ?? COMPONENTES[d.tipo],
}))
export const ANEXOS = C3.ANEXOS.map((a) => ({ id: a.n.toLowerCase(), tipo: 'anexo', a, pasos: 1, Componente: Anexo }))
export const PAGINAS = [...DIAPOSITIVAS, ...ANEXOS]
export const pagina = (id) => PAGINAS.find((p) => p.id === id)

/** El guion partido en tramos por paso: [{ paso, texto }]. Si una frase no aparece, va entero. */
export function tramosDelGuion(n, guion) {
  const anclas = GUION_PASOS[n]
  if (!anclas) return [{ paso: null, texto: guion }]
  const cortes = anclas.map((a) => guion.indexOf(a))
  if (cortes.some((c) => c < 0)) return [{ paso: null, texto: guion }]
  const bordes = [0, ...cortes, guion.length]
  return bordes.slice(0, -1).map((b, k) => ({ paso: k + 1, texto: guion.slice(b, bordes[k + 1]).trim() }))
}

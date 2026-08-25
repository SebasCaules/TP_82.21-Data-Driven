// Registro de pantallas. El orden ES la narrativa: leer solo los titulos, en orden,
// tiene que contar la historia completa (Knaflic cap. 7 pag. 181-183).
//
// Cada entrada declara la pregunta de negocio de la Parte D §1.2 que responde. La clase 4
// dijo que esas preguntas son las que deciden las decisiones, asi que son el indice.

import D0 from './D0Consolidada.jsx'
import D2 from './D2Quintiles.jsx'

export const BLOQUES = [
  { id: 'directorio', nombre: 'Directorio', cadencia: 'mensual' },
  { id: 'marketing', nombre: 'Marketing', cadencia: 'semanal' },
]

export const PANTALLAS = [
  {
    id: 'D0',
    bloque: 'directorio',
    corto: 'Cuánto hay en riesgo',
    pregunta: '¿Cuánta facturación anual está hoy en riesgo y qué parte de la base la explica?',
    Componente: D0,
  },
  {
    id: 'D2',
    bloque: 'directorio',
    corto: 'Riesgo por valor',
    pregunta: '¿El riesgo se concentra en los clientes que más facturan o en los de menor valor?',
    Componente: D2,
  },
]

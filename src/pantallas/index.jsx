// Registro de pantallas. El orden ES la narrativa: leer solo los titulos, en orden,
// tiene que contar la historia completa (Knaflic cap. 7 pag. 181-183).
//
// `depende` declara que controles tienen efecto, y App.jsx los apaga con leyenda donde no
// aplican: un control que se ve activo y no hace nada es la falla canonica de visibilidad
// del estado (Nielsen H1). Fue un bloqueante del comite.
//   'todo'    -> corte y filtros
//   'corte'   -> solo el corte
//   'ninguno' -> serie global, ni corte ni filtros
//
// `eje` es la dimension sobre la que la pantalla desagrega. El filtro de ESA dimension no
// se aplica a su propio eje (si no, el grafico colapsaria a una sola barra), asi que el pie
// lo declara en vez de dejar creer que la vista esta recortada.
//
// El bloque de Marketing va M0 · M3 · M1 · M2a · M2b: "¿se puede ejecutar la lista?" es
// previa a "¿a quienes contacto?".

import D0 from './D0Consolidada.jsx'
import D1 from './D1Exposicion.jsx'
import D2 from './D2Quintiles.jsx'
import D3 from './D3Segmentos.jsx'
import D4 from './D4Recompra.jsx'
import D5a from './D5aRegion.jsx'
import D5b from './D5bCategoria.jsx'
import D6 from './D6Criterio.jsx'
import D7 from './D7Cierre.jsx'
import M0 from './M0Cobertura.jsx'
import M1 from './M1Lista.jsx'
import M2a from './M2aEmbudo.jsx'
import M2b from './M2bSegmentos.jsx'
import M3 from './M3Consentimiento.jsx'

// Las 14 vistas van en UN solo recorrido, no en dos bloques conmutables. La distinción de
// audiencia no desaparece: pasa a ser una marca por vista (cuadrado = directorio, círculo =
// marketing) y una marca de grupo, que es lo que separa sin partir.
export const GRUPOS = [
  { id: 'diagnostico', nombre: 'Diagnóstico', detalle: 'datos históricos' },
  { id: 'operacion', nombre: 'Operación', detalle: 'a quién se contacta' },
  { id: 'decision', nombre: 'Decisión', detalle: 'qué se pide' },
]

export const PANTALLAS = [
  {
    id: 'D0', grupo: 'diagnostico', audiencia: 'ambas', depende: 'todo', Componente: D0,
    corto: 'Cuánto hay en riesgo',
    pregunta: '¿Cuánta facturación anual está hoy en riesgo y qué parte de la base la explica?',
  },
  {
    id: 'D1', grupo: 'diagnostico', audiencia: 'directorio', depende: 'todo', Componente: D1,
    corto: 'Exposición vs. base',
    pregunta: '¿De qué tamaño es el problema contra el total?',
  },
  {
    id: 'D2', eje: 'quintil', grupo: 'diagnostico', audiencia: 'directorio', depende: 'todo', Componente: D2,
    corto: 'Riesgo por valor',
    pregunta: '¿El riesgo se concentra en los que más facturan o en los de menor valor?',
    pie: 'La tasa va sobre el total del quintil, que es el denominador del KPI de la Parte D',
  },
  {
    id: 'D3', eje: 'rfm', grupo: 'diagnostico', audiencia: 'ambas', depende: 'todo', Componente: D3,
    corto: 'Dónde está la plata',
    pregunta: '¿Dónde conviene gastar el presupuesto de retención?',
  },
  {
    id: 'D4', grupo: 'diagnostico', audiencia: 'directorio', depende: 'ninguno', Componente: D4,
    corto: 'Recompra vs. meta',
    pregunta: '¿La recompra a 90 días se mueve hacia la meta de 10-11 %?',
    pie: 'Los trimestres sin ventana de 90 días completa se cortan, no se interpolan',
  },
  {
    id: 'D5a', eje: 'region', grupo: 'diagnostico', audiencia: 'ambas', depende: 'todo', Componente: D5a,
    corto: 'Región',
    pregunta: '¿Qué región concentra la exposición?',
    pie: 'Región = la tienda donde el cliente concentra su gasto hasta el corte. Apertura por tienda: fuera de alcance V1',
  },
  {
    id: 'D5b', eje: 'categoria', grupo: 'diagnostico', audiencia: 'ambas', depende: 'todo', Componente: D5b,
    corto: 'Categoría',
    pregunta: '¿Qué categoría concentra la exposición?',
    pie: 'Organización 199 y Baño 166 clientes: las tasas del extremo bajo se mueven con pocos casos',
  },
  {
    id: 'D6', grupo: 'diagnostico', audiencia: 'directorio', depende: 'ninguno', Componente: D6, predictivo: true,
    corto: 'Contra el criterio',
    pregunta: '¿La lista priorizada rinde más que el criterio actual?',
    pie: 'Base de campañas: 23.729 envíos del dataset',
  },
  {
    id: 'M0', grupo: 'operacion', audiencia: 'marketing', depende: 'todo', Componente: M0,
    corto: 'Cobertura',
    pregunta: '¿A cuántos alcanza a contactar Marketing y cuáles quedan sin cubrir?',
  },
  {
    id: 'M3', grupo: 'operacion', audiencia: 'marketing', depende: 'ninguno', Componente: M3,
    corto: 'Consentimiento',
    pregunta: '¿La lista se puede ejecutar tal cual?',
  },
  {
    id: 'M1', grupo: 'operacion', audiencia: 'marketing', depende: 'todo', Componente: M1,
    corto: 'La lista',
    pregunta: '¿A quiénes contacto esta semana?',
    pie: 'Solo código de cliente: sin nombre ni mail',
  },
  {
    id: 'M2a', grupo: 'operacion', audiencia: 'marketing', depende: 'ninguno', Componente: M2a,
    corto: 'El embudo',
    pregunta: '¿Qué rindió la campaña?',
    pie: 'Embudo global sobre 23.529 envíos limpios; el corte por segmento va sobre los 23.729 del dataset',
  },
  {
    id: 'M2b', grupo: 'operacion', audiencia: 'marketing', depende: 'ninguno', Componente: M2b,
    corto: 'Por segmento',
    pregunta: '¿Algún segmento discrimina?',
    pie: 'Base de campañas: 23.729 envíos del dataset',
  },
  {
    id: 'D7', grupo: 'decision', audiencia: 'ambas', depende: 'todo', Componente: D7,
    corto: 'Cierre',
    pregunta: '¿Qué se decide hoy?',
  },
]

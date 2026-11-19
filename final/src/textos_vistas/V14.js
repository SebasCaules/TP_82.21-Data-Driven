// Textos nuevos de V14, mezclados en textosDe('V14'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// (19/11, fase 9, ficha V14: «mucho menos texto»; «además de las semanas ponele una fecha aprox con mes y año»)
// grafico: el título del renglón de semanas y el del renglón de meses (las fechas son de referencia: la semana 1 empieza el
// lunes siguiente a la aprobación escrita de María G., calendario.regla de DF; la presentación es el 24/11/2026, por eso
// «hoy»), el nombre corto de cada mes (con el año en el primero y en enero), el rótulo de cada hito y el nombre corto de
// cada fase por su n en la tabla plan de DF (el nombre completo y el responsable, en el informe, sección 36.1).

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export default {
  grafico: {
    semana: 'Semana',
    mes: 'Si se aprueba hoy',
    /** "2027-01-01" → «ene 2027» (con el año) o «ene». */
    rotuloMes: (iso, conAnio) => {
      const [a, m] = iso.split('-')
      return conAnio ? `${MESES[Number(m) - 1]} ${a}` : MESES[Number(m) - 1]
    },
    hitos: {
      primera: 'Primera lista',
      preliminar: 'Informe preliminar',
      decision: 'Decisión',
    },
    fases: {
      1: 'Precondiciones',
      2: 'Datos del piloto',
      3: 'Planilla de la regla',
      4: 'Corrida de prueba',
      5: 'Piloto: tres listas',
      6: 'Medición del piloto',
    },
  },
}

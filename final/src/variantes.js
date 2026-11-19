// Variantes en prueba de /final/ (18/11, observaciones del usuario sobre el intermedio). Cada clave es una decisión de
// diseño: 'a' es la versión elegida por defecto y las otras letras, las alternativas que el usuario compara antes de
// cerrar. La URL cambia cualquier clave sin tocar el código, antes del #vista:
//
//   index.html?var=nav.b,V05.b#v05        (con las notas: ?notas&var=nav.b)
//
// Claves del marco: nav (riel y avance), sec (sección sobre el título), dec (tarjeta de decisión), cab (texto sobre el
// gráfico), kpi (subfila de cifras). Claves de vista: el id («V05»), solo en las vistas que traen alternativa.
// Cuando el usuario elija, cada clave queda fija en su letra y se borran este archivo y las ramas que no se usan.

export const VARIANTES = {
  nav: 'a',
  sec: 'a',
  dec: 'a',
  cab: 'a',
  kpi: 'a',
}

function deURL() {
  const out = {}
  if (typeof location === 'undefined') return out
  const m = location.search.match(/(?:^|[?&])var=([^&#]*)/)
  if (!m) return out
  for (const par of decodeURIComponent(m[1]).split(',')) {
    const [clave, letra] = par.split('.')
    if (clave && letra) out[clave.trim()] = letra.trim().toLowerCase()
  }
  return out
}

const URL_VAR = deURL()

/** La letra vigente de una decisión: la de la URL, la de VARIANTES o 'a'. */
export const variante = (clave) => URL_VAR[clave] ?? VARIANTES[clave] ?? 'a'

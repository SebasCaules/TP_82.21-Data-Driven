// Variantes de /final/ (19/11, segunda vuelta de las observaciones del usuario). El usuario ya eligió en la fase 8: riel con
// línea de avance, sección sobre el título, decisión pegada arriba, banda sin subfila y conclusión de un renglón; V05 y V15
// en su versión b y el resto en la a. Esas ramas quedan fijas en el código y las que no se eligieron se borran.
//
// Queda una sola clave en prueba, por URL (index.html?var=rev.b#v05):
//   rev: cómo se ve lo que todavía no se reveló en el avance por pasos. 'a', atenuado (lo elegido); 'b', oculto.

export const VARIANTES = {
  rev: 'a',
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

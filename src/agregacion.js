// Unica logica de datos del lado del navegador: decodificar la clave de celda,
// filtrar y sumar. Nada mas. Recency, gap mediano, quintiles, RFM y riesgo se
// calculan en Python (pipeline/features.py) y llegan ya resueltos en la celda.
//
// La identidad "toda combinacion de filtros es una suma de celdas" esta probada
// en pipeline/validate.py sobre las 2.688 combinaciones x 25 cortes. El test de
// paridad de test/paridad.mjs vuelve a probarla contra esta implementacion.

import { D } from './datos.js'

export const NCAT = 7
export const NRFM = 7
export const NQ = 5

// Las categorias llegan del CSV de la catedra sin tilde ("Decoracion", "Iluminacion",
// "Organizacion") mientras "Bano" si conserva la enie. En crudo no se tocan: raw/ es inmutable,
// y renombrarlas en el pipeline tampoco sirve porque validate.py mapea los valores del CSV a
// traves de esta misma lista y romperia los 201.946 chequeos. Se corrigen aca, que es la capa
// de display: el empaquetado usa indices, nunca la etiqueta.
const TILDES = {
  Decoracion: 'Decoración',
  Iluminacion: 'Iluminación',
  Organizacion: 'Organización',
}

export const dims = { ...D.dims, categoria: D.dims.categoria.map((c) => TILDES[c] ?? c) }
export const cortes = D.cortes
export const meta = D.meta
export const series = D.series
export const anclas = D.anclas
export const stageCounts = D.stage_counts

/** Descompone la clave empaquetada k en sus cuatro indices. */
export function decodificar(k) {
  const q = k % NQ
  const resto1 = (k - q) / NQ
  const rfm = resto1 % NRFM
  const resto2 = (resto1 - rfm) / NRFM
  const cat = resto2 % NCAT
  const reg = (resto2 - cat) / NCAT
  return { reg, cat, rfm, q }
}

const CAMPOS = ['n', 'nr', 'ne', 'f', 'fr', 'a', 'ar', 'nhc', 'ahc']

/** Filtro vacio: todas las dimensiones en "todos". */
export const SIN_FILTRO = { region: null, categoria: null, rfm: null, quintil: null }

export function hayFiltro(filtro) {
  return filtro.region !== null || filtro.categoria !== null ||
         filtro.rfm !== null || filtro.quintil !== null
}

/**
 * Suma las celdas del corte `iCorte` que matchean el filtro.
 * Devuelve los siete acumuladores mas los derivados que usan las pantallas.
 */
export function agregar(iCorte, filtro = SIN_FILTRO) {
  const c = D.contingencias[iCorte]
  const acc = { n: 0, nr: 0, ne: 0, f: 0, fr: 0, a: 0, ar: 0, nhc: 0, ahc: 0 }

  for (let i = 0; i < c.k.length; i++) {
    const { reg, cat, rfm, q } = decodificar(c.k[i])
    if (filtro.region !== null && reg !== filtro.region) continue
    if (filtro.categoria !== null && cat !== filtro.categoria) continue
    if (filtro.rfm !== null && rfm !== filtro.rfm) continue
    if (filtro.quintil !== null && q !== filtro.quintil) continue
    for (const campo of CAMPOS) acc[campo] += c[campo][i]
  }
  return acc
}

/**
 * Desagrega por una dimension: devuelve un acumulador por cada valor de `eje`,
 * respetando el resto del filtro. Es lo que alimenta todo grafico de barras.
 */
export function porDimension(iCorte, eje, filtro = SIN_FILTRO) {
  const largos = { region: dims.region.length, categoria: NCAT, rfm: NRFM, quintil: NQ }
  const salida = Array.from({ length: largos[eje] }, () => ({
    n: 0, nr: 0, ne: 0, f: 0, fr: 0, a: 0, ar: 0, nhc: 0, ahc: 0,
  }))
  const c = D.contingencias[iCorte]

  for (let i = 0; i < c.k.length; i++) {
    const idx = decodificar(c.k[i])
    if (filtro.region !== null && eje !== 'region' && idx.reg !== filtro.region) continue
    if (filtro.categoria !== null && eje !== 'categoria' && idx.cat !== filtro.categoria) continue
    if (filtro.rfm !== null && eje !== 'rfm' && idx.rfm !== filtro.rfm) continue
    if (filtro.quintil !== null && eje !== 'quintil' && idx.q !== filtro.quintil) continue

    const destino = eje === 'region' ? idx.reg
      : eje === 'categoria' ? idx.cat
      : eje === 'rfm' ? idx.rfm
      : idx.q
    for (const campo of CAMPOS) salida[destino][campo] += c[campo][i]
  }
  return salida
}

/** La lista de Marketing del corte, filtrada. Ya viene ordenada por anualizado. */
export function lista(iCorte, filtro = SIN_FILTRO, soloConsentimiento = false) {
  const l = D.listas[iCorte]
  const filas = []
  for (let i = 0; i < l.id.length; i++) {
    const q = Math.floor(l.qs[i] / 8)
    const rfm = l.qs[i] % 8
    const reg = Math.floor(l.gk[i] / 8)
    const cat = l.gk[i] % 8
    if (filtro.region !== null && reg !== filtro.region) continue
    if (filtro.categoria !== null && cat !== filtro.categoria) continue
    if (filtro.rfm !== null && rfm !== filtro.rfm) continue
    if (filtro.quintil !== null && q !== filtro.quintil) continue
    if (soloConsentimiento && !l.mk[i]) continue
    filas.push({
      id: D.clientes_ids[l.id[i]],
      anualizado: l.a[i],
      recency: l.rec[i],
      gap: l.gap[i],
      quintil: q + 1,
      rfm: dims.rfm[rfm],
      region: dims.region[reg],
      categoria: dims.categoria[cat],
      consiente: !!l.mk[i],
    })
  }
  return filas
}

/** Datos del corte: los campos que consume la ficha F07 del BAN. */
export function corteInfo(iCorte, filtro = SIN_FILTRO) {
  const a = agregar(iCorte, filtro)
  const previo = iCorte > 0 ? agregar(iCorte - 1, filtro) : null
  const s = D.series.exposicion_por_corte[iCorte]
  return {
    corte: cortes[iCorte],
    cortePrevio: iCorte > 0 ? cortes[iCorte - 1] : null,
    exposicion: a.ar,
    baseAnualizada: a.a,
    pct: a.a ? (100 * a.ar) / a.a : 0,
    exposicionPrevia: previo ? previo.ar : null,
    clientes: a.n,
    elegibles: a.ne,
    enRiesgo: a.nr,
    facturacion: a.f,
    facturacionRiesgo: a.fr,
    // Declarado, no corregido: en cortes viejos el anualizado infla el denominador porque
    // divide por los anios desde la primera compra. Sale de la celda, no de la serie global:
    // con un filtro puesto, la nota tiene que hablar de la base filtrada.
    historiaCorta: a.nhc,
    baseAnualizada1a: a.a - a.ahc,
    // La sensibilidad al umbral del proxy es una propiedad del proxy, no del corte de la
    // base: va sobre la base completa y la pantalla lo declara.
    sensibilidad: s.sensibilidad,
  }
}

// --- formato ---------------------------------------------------------------

const NF = new Intl.NumberFormat('es-AR')

export function millones(x, dec = 1) {
  return `${(x / 1e6).toFixed(dec).replace('.', ',')} M`
}
export function pesos(x) {
  return `ARS ${millones(x)}`
}
/** Magnitud en pesos con el signo adelante: "$ 23,5 M". Donde la unidad va en una escala o
 *  en una columna de magnitudes, el signo evita ir a buscar la moneda al encabezado;
 *  `pesos()` sigue siendo la forma larga para la prosa. */
export function montoM(x, dec = 1) {
  return `$ ${millones(x, dec)}`
}
export function entero(x) {
  return NF.format(Math.round(x))
}
export function pct(x, dec = 1) {
  return `${x.toFixed(dec).replace('.', ',')} %`
}
export function fechaCorta(iso) {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}
export function mesCorte(iso) {
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const [a, m] = iso.split('-')
  return `${MESES[Number(m) - 1]} ${a}`
}

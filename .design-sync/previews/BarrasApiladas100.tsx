import { BarrasApiladas100, rampa } from 'tablero-casa-oga'

const pc = (v: number) => `${v.toFixed(1).replace('.', ',')} %`

/** Riesgo por quintil de valor, al corte 31/12/2025. El bloque de acento es nr/n, que es
 *  el denominador del KPI; la cuna de no elegibles (menos de 3 compras) se derrite de Q1 a
 *  Q5 y es lo que explica el salto de 13,3 % a 51,8 %. La nota de cada fila es la tasa
 *  entre elegibles, que el ojo no puede calcular de la barra. */
export const RiesgoPorQuintil = () => (
  <BarrasApiladas100
    w={940} h={330} anchoEtiqueta={78}
    tituloEje="Composicion del quintil (% sobre sus clientes)"
    encabezadoNota="riesgo entre elegibles"
    filas={[
      { q: 'Q1', sub: 'menor valor', n: 1196, nr: 159, ne: 389, nota: '40,9 %' },
      { q: 'Q2', sub: null, n: 1195, nr: 508, ne: 1067, nota: '47,6 %' },
      { q: 'Q3', sub: null, n: 1196, nr: 572, ne: 1123, nota: '50,9 %' },
      { q: 'Q4', sub: null, n: 1195, nr: 594, ne: 1173, nota: '50,6 %' },
      { q: 'Q5', sub: 'mayor valor', n: 1196, nr: 619, ne: 1188, nota: '52,1 %' },
    ].map((r, i) => ({
      etiqueta: r.q, sub: r.sub, nota: r.nota, enfasis: i === 4,
      segmentos: [
        { clave: 'En riesgo', valor: r.nr, tono: 'var(--acc)', tinta: '#fff',
          enfasis: true, plaqueta: true, texto: pc((100 * r.nr) / r.n) },
        { clave: 'Elegible sin riesgo', valor: r.ne - r.nr, tono: 'var(--gris)' },
        { clave: 'No elegible', valor: r.n - r.ne, tono: 'trama',
          texto: pc((100 * (r.n - r.ne)) / r.n) },
      ],
    }))}
    leyenda={[
      { etiqueta: 'En riesgo (nr/n, desde cero)', tono: 'var(--acc)', enfasis: true },
      { etiqueta: 'Elegible sin riesgo', tono: 'var(--gris)' },
      { etiqueta: 'No elegible (menos de 3 compras)', tono: 'trama' },
    ]}
    referencia={{ valor: 41.0, etiqueta: 'general 41,0 %' }}
  />
)

/** Dos barras con conectores: cuanto pesa cada region en los clientes contra cuanto pesa
 *  en la exposicion. La inclinacion del conector ES la diferencia. Un solo orden para las
 *  dos filas, si no el conector mediria el reordenamiento en vez del desvio. */
export const ClientesContraExposicion = () => {
  const partes = [
    { etiqueta: 'AMBA', n: 2328, ar: 40514582 },
    { etiqueta: 'Centro', n: 1231, ar: 19671043 },
    { etiqueta: 'NOA', n: 983, ar: 16082440 },
    { etiqueta: 'Cuyo', n: 963, ar: 14970513 },
    { etiqueta: 'Patagonia', n: 156, ar: 2490553 },
  ].map((p, k) => ({ ...p, ...rampa(k) }))
  const totalN = partes.reduce((s, p) => s + p.n, 0)
  const totalAr = partes.reduce((s, p) => s + p.ar, 0)
  const seg = (p: typeof partes[0], valor: number, share: number) => ({
    clave: p.etiqueta, valor, tono: p.tono, tinta: p.tinta,
    enfasis: p === partes[0], texto: `${p.etiqueta} ${pc(share)}`,
  })
  return (
    <BarrasApiladas100
      w={940} h={250} anchoEtiqueta={106} conectores
      tituloEje="Participacion de cada region en el total"
      rotuloResto="Tramos sin lugar para el rotulo (clientes -> exposicion):"
      textoResto={(it: any) => `${it.clave} ${pc(it.pcts[0])} -> ${pc(it.pcts[1])}`}
      filas={[
        { etiqueta: 'Clientes', sub: `base ${totalN.toLocaleString('es-AR')}`,
          segmentos: partes.map((p) => seg(p, p.n, (100 * p.n) / totalN)) },
        { etiqueta: 'Exposicion', sub: 'base ARS 93,7 M',
          segmentos: partes.map((p) => seg(p, p.ar, (100 * p.ar) / totalAr)) },
      ]}
    />
  )
}

/** El embudo de campanias como tres pasos, cada uno normalizado contra SU base. La base va
 *  escrita en cada fila: tres barras del mismo largo sobre 23.529, 8.266 y 2.059 envios no
 *  son tres poblaciones iguales, y sin la base escrita lo parecen. */
export const EmbudoDeCampania = () => {
  const pasos = [
    { etiqueta: 'Envio -> Abre', base: 23529, avanza: 8266 },
    { etiqueta: 'Abre -> Clic', base: 8266, avanza: 2059 },
    { etiqueta: 'Clic -> Compra', base: 2059, avanza: 284 },
  ].map((p) => ({ ...p, ret: (100 * p.avanza) / p.base }))
  const peor = pasos.reduce((m, p) => (p.ret < m.ret ? p : m), pasos[0])
  return (
    <BarrasApiladas100
      w={940} h={270} anchoEtiqueta={122}
      tituloEje="Participacion dentro de cada paso - avanza contra se pierde"
      filas={pasos.map((p) => ({
        etiqueta: p.etiqueta, sub: `base ${p.base.toLocaleString('es-AR')}`,
        enfasis: p === peor,
        segmentos: [
          { clave: `avanza ${p.etiqueta}`, valor: p.avanza, tono: 'var(--acc)', tinta: '#fff',
            enfasis: true, plaqueta: true,
            texto: `${p.avanza.toLocaleString('es-AR')} - ${pc(p.ret)}` },
          { clave: `se pierde ${p.etiqueta}`, valor: p.base - p.avanza, tono: 'trama',
            texto: `se pierden ${(p.base - p.avanza).toLocaleString('es-AR')} - ${pc(100 - p.ret)}` },
        ],
      }))}
    />
  )
}

/** Una sola fila, con el tono de excepcion. El terracota tramado no significa "aca mira":
 *  significa que ese tramo no se puede ejecutar. 7.078 de 23.529 envios salen sin
 *  consentimiento del cliente. */
export const TramoDeExcepcion = () => (
  <BarrasApiladas100
    w={940} h={190} anchoEtiqueta={104} alturaBarra={84}
    tituloEje="Participacion en el total de envios"
    filas={[{
      etiqueta: 'Envios',
      sub: 'base 23.529',
      segmentos: [
        { clave: 'Con consentimiento', valor: 16451, tono: 'var(--gris2)',
          texto: 'Con consentimiento - 16.451 - 69,9 %' },
        { clave: 'Sin consentimiento', valor: 7078, tono: 'trama-exc', tinta: '#fff',
          enfasis: true, texto: 'Sin consentimiento - 30,1 %' },
      ],
    }]}
  />
)

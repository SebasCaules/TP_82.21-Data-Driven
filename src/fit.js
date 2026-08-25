// Detector de desborde. Se expone como window.__fit() para poder interrogarlo desde
// afuera a distintas resoluciones.
//
// El falso negativo conocido: con overflow:hidden el scrollHeight da cero y un chequeo
// ingenuo concluye "no scrollea" mientras el cuerpo pinta encima del pie. Por eso aca
// se comprueba la SUPERPOSICION de rectangulos, no solo el scroll.

const SELECTORES = [
  '.titulo', '.bajada', '.rotulo', '.lienzo', '.tarjeta', '.ban',
  'table', 'svg', '.lista-tabla', '.cierre', '.kpi',
]

function rects(raiz) {
  const salida = []
  for (const sel of SELECTORES) {
    for (const el of raiz.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) salida.push({ el, sel, r })
    }
  }
  return salida
}

export function chequear() {
  const problemas = []
  const vw = window.innerWidth
  const vh = window.innerHeight

  const pie = document.querySelector('.pie')
  const enc = document.querySelector('.enc')
  const pieTop = pie ? pie.getBoundingClientRect().top : vh
  const encBot = enc ? enc.getBoundingClientRect().bottom : 0

  // 1. scroll real, en el documento y en cada contenedor
  if (document.documentElement.scrollHeight > vh + 1) {
    problemas.push({
      tipo: 'scroll-documento',
      detalle: `scrollHeight ${document.documentElement.scrollHeight} > alto ${vh}`,
    })
  }
  for (const el of document.querySelectorAll('*')) {
    if (el.scrollHeight > el.clientHeight + 1 && el.clientHeight > 0) {
      const est = getComputedStyle(el)
      if (est.overflowY === 'auto' || est.overflowY === 'scroll') {
        problemas.push({ tipo: 'scroll-contenedor', detalle: `${clase(el)} scrollea` })
      }
    }
  }

  // 2. superposicion con el pie o con el encabezado. Este es el chequeo que el
  //    scrollHeight no ve cuando hay overflow:hidden.
  for (const { el, sel, r } of rects(document)) {
    if (el.closest('.pie') || el.closest('.enc') || el.closest('.impresion')) continue
    if (r.bottom > pieTop + 1) {
      problemas.push({
        tipo: 'pisa-el-pie',
        detalle: `${sel} ${clase(el)} llega a ${Math.round(r.bottom)} y el pie arranca en ${Math.round(pieTop)}`,
      })
    }
    if (r.top < encBot - 1) {
      problemas.push({
        tipo: 'pisa-el-encabezado',
        detalle: `${sel} ${clase(el)} arranca en ${Math.round(r.top)} y el encabezado termina en ${Math.round(encBot)}`,
      })
    }
    if (r.right > vw + 1) {
      problemas.push({
        tipo: 'desborda-a-la-derecha',
        detalle: `${sel} ${clase(el)} llega a ${Math.round(r.right)} y el ancho es ${vw}`,
      })
    }
    if (r.left < -1) {
      problemas.push({ tipo: 'desborda-a-la-izquierda', detalle: `${sel} ${clase(el)}` })
    }
  }

  // 3. texto recortado por el contenedor (clip sin ellipsis)
  for (const el of document.querySelectorAll('.titulo, .bajada, .ban-val, .rotulo')) {
    if (el.scrollWidth > el.clientWidth + 2) {
      problemas.push({ tipo: 'texto-recortado', detalle: `${clase(el)} "${el.textContent.slice(0, 40)}"` })
    }
  }

  // 4. un grafico aplastado es ilegible aunque no desborde
  for (const svg of document.querySelectorAll('.lienzo svg')) {
    const r = svg.getBoundingClientRect()
    if (r.height < 90) {
      problemas.push({ tipo: 'grafico-aplastado', detalle: `svg de ${Math.round(r.height)} px de alto` })
    }
  }

  return { ancho: vw, alto: vh, ok: problemas.length === 0, problemas }
}

function clase(el) {
  return el.className && typeof el.className === 'string'
    ? '.' + el.className.split(' ').filter(Boolean).slice(0, 2).join('.')
    : el.tagName.toLowerCase()
}

if (typeof window !== 'undefined') {
  window.__fit = chequear
  // ?fit marca en rojo lo que desborda, para verlo sin abrir la consola
  if (location.search.includes('fit')) {
    const pintar = () => {
      document.querySelectorAll('.fit-mal').forEach((e) => e.classList.remove('fit-mal'))
      const r = chequear()
      if (!r.ok) document.querySelector('.cuerpo')?.classList.add('fit-mal')
      console.log('[fit]', r.ancho + 'x' + r.alto, r.ok ? 'OK' : r.problemas)
    }
    window.addEventListener('resize', pintar)
    setTimeout(pintar, 300)
  }
}

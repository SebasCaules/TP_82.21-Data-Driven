// Detector de desborde. Se expone como window.__fit() para poder interrogarlo desde
// afuera a distintas resoluciones.
//
// El falso negativo conocido: con overflow:hidden el scrollHeight da cero y un chequeo
// ingenuo concluye "no scrollea" mientras el cuerpo pinta encima del pie. Por eso aca
// se comprueba la SUPERPOSICION de rectangulos, no solo el scroll.

const SELECTORES = [
  '.titulo', '.bajada', '.rotulo', '.lienzo', '.tarjeta', '.ban-track',
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

  // 0. Lo primero: ¿hay app? Con una excepcion en render, React deja el root vacio y
  //    todos los chequeos de abajo recorren cero elementos y devuelven OK. Un barrido
  //    automatico daba "todo bien" sobre una pantalla en blanco por un crash.
  const raiz = document.getElementById('root')
  if (!raiz || !raiz.querySelector('.pant, .impresion-flujo')) {
    return {
      ancho: vw, alto: vh, ok: false,
      problemas: [{ tipo: 'sin-pantalla', detalle: 'el root no tiene ninguna .pant: la app no montó' }],
    }
  }

  // El pie de pantalla salio (N0-13) y el encabezado de cada vista nunca existio como `.enc`:
  // el encabezado real es la barra de controles. Con los selectores viejos, `.pie` y `.enc` no
  // matcheaban nada y los dos chequeos de superposicion comparaban contra el borde de la
  // ventana y contra cero, o sea que no comparaban nada. Las cajas que existen hoy son estas.
  const barra = document.querySelector('.barra')
  const cuerpo = document.querySelector('.cuerpo')
  const pieTop = cuerpo ? cuerpo.getBoundingClientRect().bottom : vh
  const encBot = barra ? barra.getBoundingClientRect().bottom : 0

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
    // La lateral es otra columna: su marca arranca mas arriba que la barra sin pisar nada.
    // El chequeo de superposicion con la barra solo tiene sentido dentro del cuerpo.
    if (el.closest('.barra') || el.closest('.lat') || el.closest('.impresion-flujo')) continue
    if (r.bottom > pieTop + 1) {
      problemas.push({
        tipo: 'se-pasa-del-cuerpo',
        detalle: `${sel} ${clase(el)} llega a ${Math.round(r.bottom)} y el cuerpo termina en ${Math.round(pieTop)}`,
      })
    }
    if (r.top < encBot - 1) {
      problemas.push({
        tipo: 'pisa-la-barra',
        detalle: `${sel} ${clase(el)} arranca en ${Math.round(r.top)} y la barra termina en ${Math.round(encBot)}`,
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

  // 3b. titulo o bajada que no entra en las lineas reservadas. La cabecera tiene alto FIJO
  //     para que el lienzo no cambie de tamano al mover un filtro; el precio es que un texto
  //     largo se corta en silencio. Esto lo hace ruidoso.
  for (const el of document.querySelectorAll('.titulo, .bajada')) {
    if (el.scrollHeight > el.clientHeight + 2) {
      problemas.push({
        tipo: 'texto-cortado-por-el-clamp',
        detalle: `${clase(el)} necesita ${el.scrollHeight} px y tiene ${el.clientHeight}: "${el.textContent.slice(0, 60)}"`,
      })
    }
  }

  // 4. un grafico aplastado es ilegible aunque no desborde.
  //    Solo los SVG de grafico: los iconos van DENTRO de un <svg> y miden 13 px a proposito,
  //    asi que un chequeo ingenuo los reportaba a los siete como aplastados.
  for (const svg of document.querySelectorAll('.lienzo svg')) {
    if (svg.parentElement.closest('svg')) continue        // icono anidado
    if (svg.hasAttribute('data-icono')) continue
    // Las miniaturas del cierre miden poco a proposito: son la prueba al pie de una cifra,
    // no el grafico de la pantalla.
    if (svg.hasAttribute('data-chispa')) continue
    const r = svg.getBoundingClientRect()
    if (r.height < 90) {
      problemas.push({ tipo: 'grafico-aplastado', detalle: `svg de ${Math.round(r.height)} px de alto` })
    }
  }

  // 5. una caja de grafico que quedo VACIA. Es distinto de "esta pantalla no tiene
  //    grafico": la caja existe, se midio, y no pinto nada. Pasaba con la pestana oculta,
  //    donde el ResizeObserver no dispara y Lienzo nunca llega a tener medida. Sin este
  //    chequeo, un barrido automatico daba "todo OK" sobre pantallas en blanco.
  for (const caja of document.querySelectorAll('.lienzo-caja')) {
    const pintura = caja.querySelector('.lienzo-pintura')
    if (pintura && pintura.children.length === 0) {
      problemas.push({
        tipo: 'lienzo-vacio',
        detalle: `caja de ${Math.round(caja.getBoundingClientRect().width)}x${Math.round(caja.getBoundingClientRect().height)} sin nada dibujado`,
      })
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

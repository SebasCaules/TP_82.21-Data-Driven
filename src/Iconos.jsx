// Iconos monolínea, 14 px, trazo 1.5, siempre en currentColor. Uno por vista.
//
// No son decoración: en la barra lateral el número identifica la vista y el icono la hace
// reconocible de un vistazo, que es lo que pide una barra de 14 entradas. Fuera de ahí no se
// usan. El vocabulario es de retail de hogar (etiqueta, lámpara, pin, embudo) para que el
// tablero se parezca a Casa Óga y no a un dashboard genérico.

const base = {
  width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.5,
  strokeLinecap: 'round', strokeLinejoin: 'round',
  'aria-hidden': 'true', style: { flexShrink: 0 },
}

/** Moneda apilada: la exposición en pesos. */
export const Plata = (p) => (
  <svg {...base} {...p}>
    <ellipse cx="8" cy="4.2" rx="5.2" ry="2.2" />
    <path d="M2.8 4.2v3.4c0 1.2 2.3 2.2 5.2 2.2s5.2-1 5.2-2.2V4.2" />
    <path d="M2.8 7.6V11c0 1.2 2.3 2.2 5.2 2.2s5.2-1 5.2-2.2V7.6" />
  </svg>
)

/** Dos marcos anidados: la parte contra el total. */
export const Proporcion = (p) => (
  <svg {...base} {...p}>
    <rect x="1.8" y="3.2" width="12.4" height="9.6" rx="1" />
    <rect x="1.8" y="3.2" width="5.6" height="9.6" rx="1" fill="currentColor" stroke="none" opacity=".85" />
  </svg>
)

/** Escalera: los quintiles de valor. */
export const Escalera = (p) => (
  <svg {...base} {...p}>
    <path d="M1.6 13.2h12.8" />
    <path d="M3.2 13.2v-2.4M6.1 13.2V8.6M9 13.2V6M11.9 13.2V3.2" />
  </svg>
)

/** Racimo: los segmentos, agrupados y de distinto peso. */
export const Segmentos = (p) => (
  <svg {...base} {...p}>
    <circle cx="4.4" cy="5" r="2.4" />
    <circle cx="11.2" cy="4.4" r="1.6" />
    <circle cx="10.4" cy="10.8" r="2.8" fill="currentColor" stroke="none" opacity=".85" />
    <circle cx="3.6" cy="11.4" r="1.4" />
  </svg>
)

/** Serie que cae: la recompra trimestral. */
export const Tendencia = (p) => (
  <svg {...base} {...p}>
    <path d="M1.8 4.6l3.4 3.2 2.6-2 4 4.4" />
    <path d="M14.2 6.6v3.6h-3.6" />
  </svg>
)

/** Pin: la apertura por región. */
export const Region = (p) => (
  <svg {...base} {...p}>
    <path d="M8 14.2s4.8-4.3 4.8-7.6A4.8 4.8 0 003.2 6.6c0 3.3 4.8 7.6 4.8 7.6z" />
    <circle cx="8" cy="6.5" r="1.7" />
  </svg>
)

/** Lámpara de pie: la categoría de producto. Es el objeto más Casa Óga del set. */
export const Categoria = (p) => (
  <svg {...base} {...p}>
    <path d="M4.6 6.6L8 1.8l3.4 4.8z" />
    <path d="M8 6.6v6.2" />
    <path d="M5.8 14.2h4.4" />
  </svg>
)

/** Diana: el criterio a superar. */
export const Marca = (p) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="8" r="6.2" />
    <circle cx="8" cy="8" r="2.6" />
  </svg>
)

/** Corchete de capacidad: cuánto entra y cuánto queda afuera. */
export const Capacidad = (p) => (
  <svg {...base} {...p}>
    <path d="M4.6 2.6H2.4v10.8h2.2" />
    <path d="M11.4 2.6h2.2v10.8h-2.2" />
    <path d="M6.6 8h2.8" />
  </svg>
)

/** Escudo con tilde: el consentimiento. */
export const Consentimiento = (p) => (
  <svg {...base} {...p}>
    <path d="M8 1.8l5 2v4.4c0 3.2-2.2 5.4-5 6-2.8-.6-5-2.8-5-6V3.8z" />
    <path d="M5.9 7.8L7.4 9.3l2.9-3" />
  </svg>
)

/** Renglones: la lista de contacto. */
export const Lista = (p) => (
  <svg {...base} {...p}>
    <path d="M2 4.2h12M2 8h12M2 11.8h7.6" />
  </svg>
)

/** Embudo: el funnel de campaña. */
export const Embudo = (p) => (
  <svg {...base} {...p}>
    <path d="M1.8 2.8h12.4L9.4 8.2v4.6l-2.8 1.4V8.2z" />
  </svg>
)

/** Barras comparadas: el corte por segmento objetivo. */
export const Comparar = (p) => (
  <svg {...base} {...p}>
    <path d="M2.4 13.4V9.6M6.1 13.4V4.2M9.9 13.4V7M13.6 13.4V2.4" />
  </svg>
)

/** Banderín: el pedido concreto. */
export const Decision = (p) => (
  <svg {...base} {...p}>
    <path d="M3.6 14.2V2.2" />
    <path d="M3.6 2.6h8.8l-2 3 2 3H3.6z" />
  </svg>
)

/** Marcas de audiencia. Cuadrado lleno = directorio, círculo = marketing, los dos = ambas.
 *  Es la "división con marcas" que reemplaza al conmutador de bloques: la vista sigue
 *  declarando para quién es, sin partir el recorrido en dos. */
export function MarcaAudiencia({ audiencia }) {
  const t = { directorio: 'Directorio · mensual', marketing: 'Marketing · semanal', ambas: 'Las dos vistas' }
  return (
    <span className={`aud aud-${audiencia}`} title={t[audiencia]} aria-label={t[audiencia]} role="img">
      <i />{audiencia === 'ambas' && <i className="dos" />}
    </span>
  )
}

export const ICONOS = {
  D0: Plata, D1: Proporcion, D2: Escalera, D3: Segmentos, D4: Tendencia,
  D5a: Region, D5b: Categoria, D6: Marca, D7: Decision,
  M0: Capacidad, M3: Consentimiento, M1: Lista, M2a: Embudo, M2b: Comparar,
}

// --- Categorías del catálogo -------------------------------------------------
// Un objeto por categoría, en la etiqueta de la barra. NO codifican el dato: el largo de la
// barra ya lo hace y el nombre ya está escrito. Son redundantes a propósito, para que la
// categoría se encuentre de un vistazo y para que el gráfico se parezca a Casa Óga y no a
// un tablero cualquiera. Pintar las siete barras de colores distintos sí habría sido
// decoración: rompe la regla del énfasis único y no agrega nada que la etiqueta no diga.

const cat = {
  viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4,
  strokeLinecap: 'round', strokeLinejoin: 'round',
  'data-icono': '', 'aria-hidden': 'true',
}

/** Gota: Baño. */
const Bano = (p) => <svg {...cat} {...p}><path d="M8 2.2s4 4.3 4 7a4 4 0 11-8 0c0-2.7 4-7 4-7z" /></svg>
/** Taza: Cocina y mesa. */
const Cocina = (p) => <svg {...cat} {...p}><path d="M2.8 5.4h8.4v4a4.2 4.2 0 01-8.4 0z" /><path d="M11.2 6.4h1.4a1.7 1.7 0 010 3.4h-1.4" /><path d="M3.2 13.6h8" /></svg>
/** Jarrón: Decoración. */
const Decoracion = (p) => <svg {...cat} {...p}><path d="M6 2.4h4l-.7 2.2c1.7 1 2.7 2.6 2.7 4.5 0 2.6-1.8 4.5-4 4.5s-4-1.9-4-4.5c0-1.9 1-3.5 2.7-4.5z" /></svg>
/** Lámpara de pie: Iluminación. */
const Iluminacion = (p) => <svg {...cat} {...p}><path d="M4.6 6.6L8 1.8l3.4 4.8z" /><path d="M8 6.6v6.2" /><path d="M5.8 14.2h4.4" /></svg>
/** Silla: Muebles. */
const Muebles = (p) => <svg {...cat} {...p}><path d="M4.4 8.6V3.2a1 1 0 011-1h5.2a1 1 0 011 1v5.4" /><path d="M3.2 8.6h9.6" /><path d="M4.8 8.6v5" /><path d="M11.2 8.6v5" /></svg>
/** Cajas apiladas: Organización. */
const Organizacion = (p) => <svg {...cat} {...p}><rect x="2.4" y="8.4" width="11.2" height="5.2" rx=".8" /><rect x="4.2" y="3.2" width="7.6" height="5.2" rx=".8" /><path d="M6.6 8.4v-5.2M8 13.6V8.4" /></svg>
/** Almohadón: Textil hogar. */
const Textil = (p) => <svg {...cat} {...p}><path d="M3.4 3.4h9.2a1 1 0 011 1v7.2a1 1 0 01-1 1H3.4a1 1 0 01-1-1V4.4a1 1 0 011-1z" /><path d="M2.6 4.2l3 2.6M13.4 4.2l-3 2.6M2.6 11.8l3-2.6M13.4 11.8l-3-2.6" /></svg>

/** Por el valor literal que trae el CSV, con y sin tilde. */
export const ICONO_CATEGORIA = {
  'Baño': Bano,
  'Cocina y mesa': Cocina,
  'Decoracion': Decoracion, 'Decoración': Decoracion,
  'Iluminacion': Iluminacion, 'Iluminación': Iluminacion,
  'Muebles': Muebles,
  'Organizacion': Organizacion, 'Organización': Organizacion,
  'Textil hogar': Textil,
}

// Iconos monolinea, trazo 1.4-1.5, siempre en currentColor.
//
// Van SOLO en los filtros. Dos niveles:
//   - uno por DIMENSION (region, categoria, segmento, quintil), en el chip cerrado;
//   - uno por VALOR (AMBA, Muebles, Campeones, Q4...), en la lista desplegable y en el chip
//     cuando ese valor esta puesto.
// El del valor es el que hace trabajo real: con el filtro puesto el chip cambia de texto y el
// icono es lo que deja reconocer de un vistazo que se eligio, sin releer.
//
// Fuera de los filtros no se usan. En las etiquetas de un grafico competian con el dato.

const base = {
  width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.5,
  strokeLinecap: 'round', strokeLinejoin: 'round',
  'aria-hidden': 'true', style: { flexShrink: 0 },
}
const v = { ...base, strokeWidth: 1.4 }

// --- dimensiones -------------------------------------------------------------

/** Pin: la apertura por region. */
export const Region = (p) => (
  <svg {...base} {...p}>
    <path d="M8 14.2s4.8-4.3 4.8-7.6A4.8 4.8 0 003.2 6.6c0 3.3 4.8 7.6 4.8 7.6z" />
    <circle cx="8" cy="6.5" r="1.7" />
  </svg>
)

/** Lampara de pie: la categoria de producto. Es el objeto mas Casa Oga del set. */
export const Categoria = (p) => (
  <svg {...base} {...p}>
    <path d="M4.6 6.6L8 1.8l3.4 4.8z" /><path d="M8 6.6v6.2" /><path d="M5.8 14.2h4.4" />
  </svg>
)

/** Racimo: los segmentos, agrupados y de distinto peso. */
export const Segmentos = (p) => (
  <svg {...base} {...p}>
    <circle cx="4.4" cy="5" r="2.4" /><circle cx="11.2" cy="4.4" r="1.6" />
    <circle cx="10.4" cy="10.8" r="2.8" fill="currentColor" stroke="none" opacity=".85" />
    <circle cx="3.6" cy="11.4" r="1.4" />
  </svg>
)

/** Escalera: los quintiles de valor. */
export const Escalera = (p) => (
  <svg {...base} {...p}>
    <path d="M1.6 13.2h12.8" />
    <path d="M3.2 13.2v-2.4M6.1 13.2V8.6M9 13.2V6M11.9 13.2V3.2" />
  </svg>
)

// --- regiones ----------------------------------------------------------------
// Geografia, no banderas: lo que distingue a cada region en el mapa argentino.

/** Torres apretadas: el area metropolitana. */
const AMBA = (p) => (
  <svg {...v} {...p}>
    <path d="M2 13.6h12" />
    <path d="M3.2 13.6V7.4h2.6v6.2M7.4 13.6V3.4h2.6v10.2M11.6 13.6V8.6h1.6v5" />
  </svg>
)
/** Espiga: la pampa. */
const Centro = (p) => (
  <svg {...v} {...p}>
    <path d="M8 14V5.4" />
    <path d="M8 5.4C8 3.4 9.4 2 11 2c0 2-1.4 3.4-3 3.4zM8 5.4C8 3.4 6.6 2 5 2c0 2 1.4 3.4 3 3.4z" />
    <path d="M8 9.2c0-1.7 1.2-2.9 2.6-2.9 0 1.7-1.2 2.9-2.6 2.9zM8 9.2c0-1.7-1.2-2.9-2.6-2.9 0 1.7 1.2 2.9 2.6 2.9z" />
  </svg>
)
/** Cordillera con vid: Cuyo. */
const Cuyo = (p) => (
  <svg {...v} {...p}>
    <path d="M1.6 12.4l3.6-6 2.4 3.6 2.4-4.4 4.4 6.8z" />
    <circle cx="5.6" cy="3.4" r="1.1" /><circle cx="8.2" cy="2.4" r="1.1" />
  </svg>
)
/** Cerro en capas: el NOA. */
const NOA = (p) => (
  <svg {...v} {...p}>
    <path d="M1.8 13h12.4L8 3.2z" />
    <path d="M4.2 9.2h7.6M5.6 6.8h4.8" />
  </svg>
)
/** Arbol volcado por el viento: la Patagonia. */
const Patagonia = (p) => (
  <svg {...v} {...p}>
    <path d="M6.6 14V7.6" />
    <path d="M6.6 7.6c0-2.6 1.8-4.4 4.6-4.6-.2 2.8-2 4.6-4.6 4.6z" />
    <path d="M2 11.6h3.2M2.4 9h2.4" />
  </svg>
)
/** Pantalla con cursor: sin tienda asignada, solo online. */
const SoloOnline = (p) => (
  <svg {...v} {...p}>
    <rect x="1.8" y="2.8" width="12.4" height="8.4" rx="1" />
    <path d="M6 13.8h4" />
    <path d="M6.8 5.6l3.4 3.4-1.6.3-.6 1.6z" fill="currentColor" stroke="none" />
  </svg>
)

// --- categorias del catalogo -------------------------------------------------
// Un objeto por categoria. El vocabulario es de retail de hogar, para que el tablero se
// parezca a Casa Oga y no a un tablero cualquiera.

/** Gota: Bano. */
const Bano = (p) => <svg {...v} {...p}><path d="M8 2.2s4 4.3 4 7a4 4 0 11-8 0c0-2.7 4-7 4-7z" /></svg>
/** Taza: Cocina y mesa. */
const Cocina = (p) => <svg {...v} {...p}><path d="M2.8 5.4h8.4v4a4.2 4.2 0 01-8.4 0z" /><path d="M11.2 6.4h1.4a1.7 1.7 0 010 3.4h-1.4" /><path d="M3.2 13.6h8" /></svg>
/** Jarron: Decoracion. */
const Decoracion = (p) => <svg {...v} {...p}><path d="M6 2.4h4l-.7 2.2c1.7 1 2.7 2.6 2.7 4.5 0 2.6-1.8 4.5-4 4.5s-4-1.9-4-4.5c0-1.9 1-3.5 2.7-4.5z" /></svg>
/** Lampara de pie: Iluminacion. */
const Iluminacion = (p) => <svg {...v} {...p}><path d="M4.6 6.6L8 1.8l3.4 4.8z" /><path d="M8 6.6v6.2" /><path d="M5.8 14.2h4.4" /></svg>
/** Silla: Muebles. */
const Muebles = (p) => <svg {...v} {...p}><path d="M4.4 8.6V3.2a1 1 0 011-1h5.2a1 1 0 011 1v5.4" /><path d="M3.2 8.6h9.6" /><path d="M4.8 8.6v5" /><path d="M11.2 8.6v5" /></svg>
/** Cajas apiladas: Organizacion. */
const Organizacion = (p) => <svg {...v} {...p}><rect x="2.4" y="8.4" width="11.2" height="5.2" rx=".8" /><rect x="4.2" y="3.2" width="7.6" height="5.2" rx=".8" /><path d="M6.6 8.4v-5.2M8 13.6V8.4" /></svg>
/** Almohadon: Textil hogar. */
const Textil = (p) => <svg {...v} {...p}><path d="M3.4 3.4h9.2a1 1 0 011 1v7.2a1 1 0 01-1 1H3.4a1 1 0 01-1-1V4.4a1 1 0 011-1z" /><path d="M2.6 4.2l3 2.6M13.4 4.2l-3 2.6M2.6 11.8l3-2.6M13.4 11.8l-3-2.6" /></svg>

// --- segmentos RFM -----------------------------------------------------------
// Cada uno dice el estado del cliente, no una jerarquia decorativa.

/** Trofeo: Campeones. */
const Campeones = (p) => <svg {...v} {...p}><path d="M4.6 2.4h6.8v3.2a3.4 3.4 0 01-6.8 0z" /><path d="M4.6 3.4H2.8v1a2 2 0 002 2M11.4 3.4h1.8v1a2 2 0 01-2 2" /><path d="M8 9v2.4M5.8 13.6h4.4l-.6-2.2H6.4z" /></svg>
/** Reloj con la aguja pasada: En riesgo. */
const EnRiesgo = (p) => <svg {...v} {...p}><circle cx="8" cy="8.4" r="5.4" /><path d="M8 5.2v3.2l2.4 1.6" /><path d="M8 1.2v1.6" /></svg>
/** Flecha que vuelve: Leales, el que recompra. */
const Leales = (p) => <svg {...v} {...p}><path d="M13 8a5 5 0 11-1.6-3.7" /><path d="M13.4 1.8v3.2h-3.2" /></svg>
/** Luna: Hibernando. */
const Hibernando = (p) => <svg {...v} {...p}><path d="M12.8 9.8A5.6 5.6 0 016.2 3.2a5.6 5.6 0 106.6 6.6z" /></svg>
/** Brote: Nuevos. */
const Nuevos = (p) => <svg {...v} {...p}><path d="M8 14V6.8" /><path d="M8 6.8C8 4.6 9.6 3 11.8 3 11.8 5.2 10.2 6.8 8 6.8z" /><path d="M8 9.4C8 7.8 6.7 6.5 5.1 6.5 5.1 8.1 6.4 9.4 8 9.4z" /></svg>
/** Flecha en ascenso: Potenciales. */
const Potenciales = (p) => <svg {...v} {...p}><path d="M2 12.4l4-4.2 2.8 2.4L14 4.2" /><path d="M10.4 4.2H14v3.4" /></svg>
/** Puerta abierta: Perdidos. */
const Perdidos = (p) => <svg {...v} {...p}><path d="M9.4 2.2v11.6l-4-1V3.2z" /><path d="M9.4 2.2h3.2v11.6H9.4" /><circle cx="7.6" cy="8.2" r=".7" fill="currentColor" stroke="none" /></svg>

// --- quintiles ---------------------------------------------------------------

/** Cinco barras crecientes con la del quintil pedido llena. La forma dice cual es sin leer
 *  el numero, que es lo que un icono tiene que hacer. */
function Quintil(n) {
  const alturas = [3, 5, 7, 9, 11]
  const Q = (p) => (
    <svg {...v} {...p}>
      <path d="M1.4 13.6h13.2" />
      {alturas.map((h, i) => (
        <rect key={i} x={2.2 + i * 2.5} y={13.6 - h - 0.4} width="1.8" height={h}
              fill={i === n - 1 ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="1"
              opacity={i === n - 1 ? 1 : 0.45} />
      ))}
    </svg>
  )
  return Q
}

// --- mapas por valor ---------------------------------------------------------
// Las claves son el valor LITERAL que trae el payload, con y sin tilde donde el CSV varia.

export const ICONO_VALOR = {
  region: {
    'AMBA': AMBA,
    'Centro': Centro,
    'Cuyo': Cuyo,
    'NOA': NOA,
    'Patagonia': Patagonia,
    'Solo online': SoloOnline,
  },
  categoria: {
    'Baño': Bano, 'Bano': Bano,
    'Cocina y mesa': Cocina,
    'Decoracion': Decoracion, 'Decoración': Decoracion,
    'Iluminacion': Iluminacion, 'Iluminación': Iluminacion,
    'Muebles': Muebles,
    'Organizacion': Organizacion, 'Organización': Organizacion,
    'Textil hogar': Textil,
  },
  rfm: {
    'Campeones': Campeones,
    'En riesgo': EnRiesgo,
    'Leales': Leales,
    'Hibernando': Hibernando,
    'Nuevos': Nuevos,
    'Potenciales': Potenciales,
    'Perdidos': Perdidos,
  },
  quintil: {
    1: Quintil(1), 2: Quintil(2), 3: Quintil(3), 4: Quintil(4), 5: Quintil(5),
  },
}

/** Devuelve el icono del valor `v` de la dimension `dim`, o null si no hay. */
export function iconoDeValor(dim, valor) {
  return ICONO_VALOR[dim]?.[valor] ?? null
}

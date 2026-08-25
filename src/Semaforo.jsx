// Semaforo con las tres etiquetas que fija la Parte D §2.1. Cada estado cambia de FORMA
// ademas de color y lleva su texto: el negocio pidio explicitamente no depender del color,
// y en una impresion en blanco y negro el color no existe.

const ESTADOS = {
  meta: { texto: 'En meta', forma: 'lleno' },
  cerca: { texto: 'Por debajo', forma: 'medio' },
  fuera: { texto: 'Fuera de meta', forma: 'vacio' },
}

export function estadoRecompra(valor, [lo]) {
  if (valor >= lo) return 'meta'
  if (valor >= lo - 1) return 'cerca'
  return 'fuera'
}

export default function Semaforo({ estado, sufijo }) {
  const e = ESTADOS[estado] ?? ESTADOS.fuera
  return (
    <span className={`sem sem-${e.forma}`}>
      <i aria-hidden="true" />
      {e.texto}{sufijo ? ` · ${sufijo}` : ''}
    </span>
  )
}

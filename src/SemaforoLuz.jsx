// El dibujo del semáforo y la tabla de estados, aparte del componente que los usa.
//
// Viven en su propio módulo porque los necesitan dos lados que se importan entre sí: la
// pastilla (`Semaforo.jsx`) la dibuja, y la ficha del glosario (`Glosario.jsx`) dibuja las
// TRES a la vez para mostrar los cortes. Con la tabla adentro de `Semaforo.jsx` el import
// quedaba en ciclo (Semaforo → Glosario → Semaforo): resuelve, pero es frágil y no hay por
// qué pagarlo cuando lo compartido es un dibujo y un diccionario.

const ESTADOS = {
  meta: { texto: 'En meta', forma: 'lleno', luz: 2 },
  cerca: { texto: 'Por debajo', forma: 'medio', luz: 1 },
  fuera: { texto: 'Fuera de meta', forma: 'vacio', luz: 0 },
  // Rótulos propios para estadoInverso: comparten forma/color con meta/cerca/fuera (mismo
  // umbral, mismo semáforo) pero no su texto. 'Por debajo' tiene sentido para la recompra
  // (más es mejor), no para un KPI donde menos es mejor: ahí la banda del medio no está
  // "por debajo" de nada, está en zona de alerta arriba del umbral verde.
  'inv-meta': { texto: 'Dentro del umbral', forma: 'lleno', luz: 2 },
  'inv-cerca': { texto: 'En zona de alerta', forma: 'medio', luz: 1 },
  'inv-fuera': { texto: 'Sobre el umbral', forma: 'vacio', luz: 0 },
}

// Las tres luces, de arriba abajo, con su color de estado. Es la paleta reservada de
// semáforo (--sem-*), la misma que ya usaba la pastilla: no entra ningún color nuevo.
const LUCES = ['var(--sem-fuera)', 'var(--sem-cerca)', 'var(--sem-meta)']

/**
 * El semáforo dibujado como semáforo: caja, tres luces y poste. La luz encendida marca el
 * estado por POSICIÓN antes que por color —arriba fuera, medio alerta, abajo en meta—, que
 * es el canal redundante que la pastilla necesita para sobrevivir a una impresión en blanco
 * y negro y a un daltónico. Las apagadas quedan como aro tenue: sin ellas no se lee como
 * semáforo, sino como un punto de color.
 *
 * Va en currentColor para la caja (hereda el --tono del estado) y en la paleta reservada
 * para las luces. Trazo de 1.3 a 1.4, el mismo peso que los íconos de Iconos.jsx.
 */
function Luz({ luz }) {
  return (
    <svg className="sem-ico" viewBox="0 0 16 26" fill="none" aria-hidden="true">
      <rect x="2.7" y="1" width="10.6" height="19.6" rx="3.1"
            stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 20.6v4.1M5.4 24.7h5.2" stroke="currentColor" strokeWidth="1.4"
            strokeLinecap="round" />
      {[5.9, 10.8, 15.7].map((cy, i) => (
        <circle key={cy} cx="8" cy={cy} r="2.35"
                fill={i === luz ? LUCES[i] : 'none'}
                stroke={LUCES[i]} strokeWidth="1.1"
                opacity={i === luz ? 1 : 0.3} />
      ))}
    </svg>
  )
}

export { ESTADOS, LUCES, Luz }

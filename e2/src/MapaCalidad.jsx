// (29/09, pedido del usuario) Mapa de calidad: 13 archivos × 7 dimensiones, antes (Parte A 3.1) y
// después de las decisiones (Parte B 1.1). Datos en mapa.js. Tres usos: la vista 1b (los dos mapas
// lado a lado), la miniatura del encabezado de cada vista (después, con las celdas de la decisión de
// esa pantalla resaltadas) y el modal que abre la miniatura para ver esas celdas de cerca.
import { useEffect, useState } from 'react'
import { DIMS, MAPA } from './mapa.js'

const LETRA = {
  corregida: 'C', 'corregida en parte': 'C½', marcada: 'M', 'corte común': 'F',
  declarada: 'D', pendiente: 'N',
}
const GRUPO = {
  corregida: 'tratada', 'corregida en parte': 'tratada', marcada: 'tratada', 'corte común': 'tratada',
  declarada: 'declarada', pendiente: 'pendiente',
}
const letraDespues = (c) => (c.despues === 'pendiente' && c.ref?.startsWith('equipo') ? 'E' : LETRA[c.despues])

/** Celdas del mapa que cierra alguna de las decisiones dadas. */
export function celdasDe(dcs) {
  const out = []
  if (!dcs?.length) return out
  MAPA.forEach((f) => f.celdas.forEach((c, j) => {
    if (dcs.includes(c.ref)) out.push({ archivo: f.archivo, dim: DIMS[j], ...c })
  }))
  return out
}

export function Mapa({ modo = 'despues', resaltar = [], mini = false }) {
  const marcar = resaltar.length > 0
  // (29/09) La miniatura va traspuesta (7 filas de dimensiones × 13 columnas de archivos) para que
  // entre en el alto del encabezado sin empujar la vista hacia abajo.
  if (mini) {
    return (
      <div className="mapa mapa-mini" role="img" aria-label="Mapa de calidad después de las decisiones">
        {DIMS.map((d, j) => MAPA.map((f) => {
          const c = f.celdas[j]
          const on = marcar && resaltar.includes(c.ref)
          return <span key={d + f.archivo} className={`mapa-c ${c.despues ? GRUPO[c.despues] : 'ok'} ${marcar ? (on ? 'on' : 'off') : ''}`} />
        }))}
      </div>
    )
  }
  return (
    <div className={`mapa ${mini ? 'mapa-mini' : ''}`} role="img"
      aria-label={`Mapa de calidad ${modo === 'antes' ? 'antes' : 'después'} de las decisiones`}>
      {!mini && <span />}
      {!mini && DIMS.map((d) => <span key={d} className="mapa-dim">{d}</span>)}
      {MAPA.map((f) => [
        !mini && <span key={f.archivo} className="mapa-arch">{f.archivo.replaceAll('_', ' ')}</span>,
        ...f.celdas.map((c, j) => {
          const on = marcar && resaltar.includes(c.ref)
          const clase = modo === 'antes'
            ? (c.antes === '✕' ? 'grave' : c.antes === '▲' ? 'aviso' : 'ok')
            : (c.despues ? GRUPO[c.despues] : 'ok')
          const texto = modo === 'antes' ? c.antes : (c.despues ? letraDespues(c) : '✓')
          const title = `${f.archivo} · ${DIMS[j]}: ${c.hallazgo || 'sin hallazgo'}` +
            (c.despues ? ` → ${c.despues}${c.ref && c.ref !== '—' ? ` (${c.ref})` : ''}` : '')
          return (
            <span key={f.archivo + j} title={title}
              className={`mapa-c ${clase} ${marcar ? (on ? 'on' : 'off') : ''}`}>
              {!mini && texto}
            </span>
          )
        }),
      ])}
    </div>
  )
}

export function Leyenda({ modo }) {
  return modo === 'antes' ? (
    <p className="mapa-ley"><i className="mapa-c ok">✓</i> sin hallazgo (43) <i className="mapa-c aviso">▲</i> hallazgo (27) <i className="mapa-c grave">✕</i> hallazgo grave (21)</p>
  ) : (
    <p className="mapa-ley"><i className="mapa-c ok">✓</i> sin hallazgo (43) <i className="mapa-c tratada">C</i> tratada: C corregida · C½ en parte · M marcada · F corte común (25) <i className="mapa-c declarada">D</i> declarada (15) <i className="mapa-c pendiente">N</i> pendiente: N del negocio · E del equipo (8)</p>
  )
}

/** Miniatura del encabezado: abre un modal con los dos mapas y las celdas de la decisión. */
export function MapaMini({ dcs, etiqueta }) {
  const [abierto, setAbierto] = useState(false)
  const celdas = celdasDe(dcs)
  useEffect(() => {
    if (!abierto) return
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setAbierto(false) } }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [abierto])
  const titulo = dcs?.length
    ? (celdas.length ? `${dcs.join(', ')} en el mapa de calidad: ${celdas.length} ${celdas.length === 1 ? 'celda' : 'celdas'}` : `${dcs.join(', ')} no cierra una celda del mapa`)
    : 'Mapa de calidad después de las decisiones'
  return (
    <>
      <button type="button" className="mapa-boton" onClick={() => setAbierto(true)} title={`${titulo}. Clic para ampliar`}>
        <Mapa modo="despues" resaltar={dcs ?? []} mini />
      </button>
      {abierto && (
        <div className="mapa-modal" role="dialog" aria-modal="true" aria-label={titulo} onClick={() => setAbierto(false)}>
          <div className="mapa-modal-caja" onClick={(e) => e.stopPropagation()}>
            <div className="mapa-modal-enc">
              <strong>{etiqueta ? `Vista ${etiqueta} · ` : ''}{titulo}</strong>
              <button type="button" className="mapa-cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar">×</button>
            </div>
            <div className="mapa-par">
              <div><p className="mapa-rot">Antes (Parte A, 3.1)</p><Mapa modo="antes" resaltar={dcs ?? []} /></div>
              <div><p className="mapa-rot">Después de las decisiones (Parte B, 1.1)</p><Mapa modo="despues" resaltar={dcs ?? []} /></div>
            </div>
            {celdas.length > 0 && (
              <ul className="mapa-lista">
                {celdas.map((c) => (
                  <li key={c.archivo + c.dim}><b>{c.archivo.replaceAll('_', ' ')} · {c.dim}</b>: {c.antes} {c.hallazgo} → {c.despues} ({c.ref})</li>
                ))}
              </ul>
            )}
            <Leyenda modo="despues" />
          </div>
        </div>
      )}
    </>
  )
}

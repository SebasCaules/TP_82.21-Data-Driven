// Armazon del tablero: encabezado con los dos bloques, selector de corte, filtros,
// riel de pantallas, cuerpo y pie fijo.
//
// Estado que se conserva al cambiar de bloque: el corte y los filtros. Las dos
// audiencias miran el mismo corte de los datos con distinta pregunta, asi que
// perder el contexto al apretar el boton seria un costo de navegacion gratuito.

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  SIN_FILTRO, corteInfo, cortes, dims, hayFiltro, mesCorte, meta,
} from './agregacion.js'
import { BLOQUES, PANTALLAS } from './pantallas/index.jsx'

const DIM_ETIQUETA = {
  region: 'Región',
  categoria: 'Categoría',
  rfm: 'Segmento',
  quintil: 'Quintil',
}

export default function App() {
  const [bloque, setBloque] = useState('directorio')
  const [indice, setIndice] = useState(0)
  const [iCorte, setICorte] = useState(cortes.length - 1)
  const [filtro, setFiltro] = useState(SIN_FILTRO)

  const pantallas = useMemo(() => PANTALLAS.filter((p) => p.bloque === bloque), [bloque])
  const pantalla = pantallas[Math.min(indice, pantallas.length - 1)]
  const info = useMemo(() => corteInfo(iCorte, filtro), [iCorte, filtro])

  const irA = useCallback((i) => {
    setIndice(Math.max(0, Math.min(pantallas.length - 1, i)))
  }, [pantallas.length])

  const cambiarBloque = useCallback((b) => {
    setBloque(b)
    setIndice(0)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return
      if (e.key === 'ArrowRight') { irA(indice + 1); e.preventDefault() }
      else if (e.key === 'ArrowLeft') { irA(indice - 1); e.preventDefault() }
      else if (e.key >= '1' && e.key <= '9') irA(Number(e.key) - 1)
      else if (e.key === 'b' || e.key === 'B') {
        cambiarBloque(bloque === 'directorio' ? 'marketing' : 'directorio')
      } else if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen?.()
      } else if (e.key === 'i' || e.key === 'I') window.print()
      else if (e.key === 'Escape' && hayFiltro(filtro)) setFiltro(SIN_FILTRO)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [indice, bloque, filtro, irA, cambiarBloque])

  const ctx = { info, filtro, setFiltro, iCorte, irA, bloque, cambiarBloque }

  return (
    <div className="app">
      <header className="enc">
        <div className="marca">Casa Óga <span>· riesgo de pérdida de clientes</span></div>

        <div className="bloques" role="group" aria-label="Vista">
          {BLOQUES.map((b) => (
            <button key={b.id} onClick={() => cambiarBloque(b.id)}
                    aria-pressed={bloque === b.id}
                    title={`${b.nombre} · ${b.cadencia}`}>
              <Marca activo={bloque === b.id} />
              {b.nombre}<span style={{ opacity: 0.7, fontWeight: 400 }}> · {b.cadencia}</span>
            </button>
          ))}
        </div>

        <nav className="riel" aria-label="Pantallas">
          {pantallas.map((p, i) => (
            <button key={p.id} onClick={() => irA(i)}
                    aria-current={i === indice}
                    aria-label={`Pantalla ${i + 1}: ${p.corto}`}
                    title={p.corto}>{i + 1}</button>
          ))}
        </nav>

        <div className="ctrl">
          <label htmlFor="corte">Mes de corte</label>
          <select id="corte" value={iCorte} onChange={(e) => setICorte(Number(e.target.value))}>
            {cortes.map((c, i) => (
              <option key={c} value={i}>{mesCorte(c)}</option>
            ))}
          </select>

          {Object.entries(DIM_ETIQUETA).map(([dim, etq]) => (
            <select key={dim} aria-label={etq}
                    value={filtro[dim] === null ? '' : filtro[dim]}
                    onChange={(e) => setFiltro({
                      ...filtro,
                      [dim]: e.target.value === '' ? null : Number(e.target.value),
                    })}>
              <option value="">{etq}: todas</option>
              {dims[dim === 'quintil' ? 'quintil' : dim].map((v, i) => (
                <option key={v} value={i}>{dim === 'quintil' ? `Q${v}` : v}</option>
              ))}
            </select>
          ))}

          {hayFiltro(filtro) && (
            <button className="chip" onClick={() => setFiltro(SIN_FILTRO)}
                    title="Quitar todos los filtros (Esc)">
              limpiar filtros <b>×</b>
            </button>
          )}
        </div>
      </header>

      <main className="cuerpo">
        <pantalla.Componente {...ctx} />
      </main>

      <Pie info={info} filtro={filtro} pantalla={pantalla} />
    </div>
  )
}

/** Marca del bloque activo: forma distinta, no solo color (requisito del negocio). */
function Marca({ activo }) {
  return (
    <span aria-hidden="true" style={{
      width: 8, height: 8, flexShrink: 0,
      background: activo ? 'currentColor' : 'transparent',
      border: '1.5px solid currentColor',
      borderRadius: activo ? 0 : '50%',
    }} />
  )
}

function Pie({ info, filtro, pantalla }) {
  const activos = Object.entries(filtro)
    .filter(([, v]) => v !== null)
    .map(([d, v]) => `${DIM_ETIQUETA[d]}: ${d === 'quintil' ? `Q${dims.quintil[v]}` : dims[d][v]}`)

  return (
    <footer className="pie">
      <span><b>Corte</b> {mesCorte(info.corte)}</span>
      <span className="sep">|</span>
      <span><b>Filtros</b> {activos.length ? activos.join(' · ') : 'ninguno'}</span>
      <span className="sep">|</span>
      <span><b>Churn</b> proxy operativo: {meta.proxy}</span>
      <span className="sep">|</span>
      <span>Los ARS {(info.exposicion / 1e6).toFixed(1).replace('.', ',')} M son <b>exposición, no recupero</b></span>
      <span className="sep">|</span>
      <span>Importes en pesos nominales, sin deflactar</span>
      {pantalla.pie && (<><span className="sep">|</span><span>{pantalla.pie}</span></>)}
    </footer>
  )
}

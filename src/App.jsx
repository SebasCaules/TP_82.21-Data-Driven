// Armazon del tablero. Incorpora las correcciones de HCI del comite (compuerta 3):
// riel clickeable, tecla 0, aterrizaje declarado al cambiar de bloque con memoria por
// bloque, filtros apagados con leyenda donde no aplican, drill-down a la lista, vuelta
// al estado inicial, y el selector de corte dibujado como serie de exposicion.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  SIN_FILTRO, corteInfo, cortes, dims, hayFiltro, mesCorte, meta, series,
} from './agregacion.js'
import { SerieCortes } from './graficos.jsx'
import { BLOQUES, PANTALLAS } from './pantallas/index.jsx'

const DIM_ETIQUETA = {
  region: 'Región',
  categoria: 'Categoría',
  rfm: 'Segmento',
  quintil: 'Quintil',
}
const CORTE_INICIAL = cortes.length - 1

export default function App() {
  const [bloque, setBloque] = useState('directorio')
  const [indices, setIndices] = useState({ directorio: 0, marketing: 0 })
  const [iCorte, setICorte] = useState(CORTE_INICIAL)
  const [filtro, setFiltro] = useState(SIN_FILTRO)
  const ultimoBloque = useRef({ directorio: 0, marketing: 0 })
  const [imprimiendo, setImprimiendo] = useState(false)

  const pantallas = useMemo(() => PANTALLAS.filter((p) => p.bloque === bloque), [bloque])
  const indice = Math.min(indices[bloque], pantallas.length - 1)
  const pantalla = pantallas[indice]
  const info = useMemo(() => corteInfo(iCorte, filtro), [iCorte, filtro])

  // Que controles tienen efecto en esta pantalla. Un control que se ve activo y no hace
  // nada es la falla canonica de visibilidad del estado (Nielsen H1).
  const usaCorte = pantalla.depende !== 'ninguno'
  const usaFiltros = pantalla.depende === 'todo'

  const irA = useCallback((i) => {
    setIndices((s) => ({ ...s, [bloque]: Math.max(0, Math.min(pantallas.length - 1, i)) }))
  }, [bloque, pantallas.length])

  const cambiarBloque = useCallback((b) => {
    if (b === bloque) return
    ultimoBloque.current[bloque] = indices[bloque]
    setBloque(b)
    // Aterriza en la pantalla 0 del destino la primera vez; despues, donde quedo.
    setIndices((s) => ({ ...s, [b]: ultimoBloque.current[b] ?? 0 }))
  }, [bloque, indices])

  /** Drill-down: fija el valor como filtro y salta a la lista. Lo promete la Parte D §4.1
   *  y es el unico puente por contenido entre los dos bloques. */
  const verEnLista = useCallback((dim, idx) => {
    setFiltro((f) => ({ ...f, [dim]: idx }))
    ultimoBloque.current.directorio = indices.directorio
    setBloque('marketing')
    setIndices((s) => ({ ...s, marketing: PANTALLAS.filter((p) => p.bloque === 'marketing')
      .findIndex((p) => p.id === 'M1') }))
  }, [indices.directorio])

  /** Imprime las 14 pantallas, no solo la activa. Se renderizan en flujo normal (no con
   *  display:none) porque el ResizeObserver que dimensiona cada SVG mide cero en un
   *  elemento oculto y los graficos saldrian vacios. */
  const imprimirTodo = useCallback(() => {
    setImprimiendo(true)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.print()
      setImprimiendo(false)
    }))
  }, [])

  const modificado = iCorte !== CORTE_INICIAL || hayFiltro(filtro)
  const reiniciar = useCallback(() => { setICorte(CORTE_INICIAL); setFiltro(SIN_FILTRO) }, [])

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      // Dentro de un control mandan las teclas nativas: un select de 25 cortes consume
      // flechas y digitos.
      if (t.tagName === 'SELECT' || t.tagName === 'INPUT' || t.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowRight') { irA(indice + 1); e.preventDefault() }
      else if (e.key === 'ArrowLeft') { irA(indice - 1); e.preventDefault() }
      else if (e.key === '0') irA(0)
      else if (e.key >= '1' && e.key <= '9') irA(Number(e.key) - 1)
      else if (e.key === 'b' || e.key === 'B') {
        cambiarBloque(bloque === 'directorio' ? 'marketing' : 'directorio')
      } else if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen?.()
      } else if (e.key === 'i' || e.key === 'I') imprimirTodo()
      else if (e.key === 'Escape' && modificado) reiniciar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [indice, bloque, modificado, irA, cambiarBloque, reiniciar])

  const ctx = { info, filtro, setFiltro, iCorte, irA, verEnLista, usaFiltros }

  return (
    <div className="app">
      <header className="enc">
        <div className="marca">Casa Óga <span>· riesgo de pérdida de clientes</span></div>

        <div className="bloques" role="tablist" aria-label="Vista">
          {BLOQUES.map((b) => (
            <button key={b.id} role="tab" onClick={() => cambiarBloque(b.id)}
                    aria-selected={bloque === b.id} aria-pressed={bloque === b.id}>
              <Marca activo={bloque === b.id} />
              {b.nombre}<span style={{ opacity: 0.72, fontWeight: 400 }}> · {b.cadencia}</span>
            </button>
          ))}
        </div>

        <nav className="riel" aria-label="Pantallas">
          {pantallas.map((p, i) => (
            <button key={p.id} onClick={() => irA(i)}
                    aria-current={i === indice}
                    aria-label={`Pantalla ${i + 1}: ${p.corto}`} title={p.corto}>{i + 1}</button>
          ))}
        </nav>

        <div className="ctrl">
          <div className={`corte-caja ${usaCorte ? '' : 'apagado'}`}>
            <label htmlFor="corte">Mes de corte</label>
            <select id="corte" value={iCorte} disabled={!usaCorte}
                    onChange={(e) => setICorte(Number(e.target.value))}>
              {cortes.map((c, i) => <option key={c} value={i}>{mesCorte(c)}</option>)}
            </select>
            <div className="corte-serie" title="Exposición por corte">
              <SerieCortes
                valores={series.exposicion_por_corte.map((x) => x.exposicion)}
                activo={iCorte} w={148} h={20} />
            </div>
          </div>

          <div className={usaFiltros ? '' : 'apagado'} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(DIM_ETIQUETA).map(([dim, etq]) => (
              <select key={dim} aria-label={etq} disabled={!usaFiltros}
                      value={filtro[dim] === null ? '' : filtro[dim]}
                      onChange={(e) => setFiltro({
                        ...filtro,
                        [dim]: e.target.value === '' ? null : Number(e.target.value),
                      })}>
                <option value="">{etq}: todas</option>
                {dims[dim].map((v, i) => (
                  <option key={v} value={i}>{dim === 'quintil' ? `Q${v}` : v}</option>
                ))}
              </select>
            ))}
          </div>

          {!usaFiltros && (
            <span className="aviso">
              {usaCorte ? 'Esta pantalla no depende de los filtros'
                        : 'Serie completa: no depende del corte ni de los filtros'}
            </span>
          )}

          {modificado && (
            <button className="chip" onClick={reiniciar} title="Volver al estado inicial (Esc)">
              volver al inicio <b>×</b>
            </button>
          )}
        </div>
      </header>

      <main className="cuerpo">
        {imprimiendo
          ? <Impresion ctx={ctx} info={info} filtro={filtro} />
          : <pantalla.Componente {...ctx} />}
      </main>

      <Pie info={info} filtro={filtro} pantalla={pantalla} usaFiltros={usaFiltros} usaCorte={usaCorte} />
    </div>
  )
}

/** Las 14 pantallas, una hoja A4 apaisada cada una, con corte y filtros en el pie. */
function Impresion({ ctx, info, filtro }) {
  return (
    <div className="impresion-flujo">
      {PANTALLAS.map((p) => (
        <div className="hoja" key={p.id}>
          <p.Componente {...ctx} usaFiltros={p.depende === 'todo'} />
          <Pie info={info} filtro={filtro} pantalla={p}
               usaFiltros={p.depende === 'todo'} usaCorte={p.depende !== 'ninguno'} />
        </div>
      ))}
    </div>
  )
}

/** Marca del bloque activo: forma distinta, no solo color. */
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

/** Pie de dos lineas. Antes eran cinco y comian 107 px de 640. */
function Pie({ info, filtro, pantalla, usaFiltros, usaCorte }) {
  const activos = Object.entries(filtro)
    .filter(([, v]) => v !== null)
    .map(([d, v]) => `${DIM_ETIQUETA[d]}: ${d === 'quintil' ? `Q${dims.quintil[v]}` : dims[d][v]}`)

  return (
    <footer className="pie">
      <div className="pie-l">
        <span><b>Corte</b> {usaCorte ? mesCorte(info.corte) : 'serie completa 2022-2025'}</span>
        <span className="sep">|</span>
        <span><b>Filtros</b> {!usaFiltros ? 'no aplican en esta pantalla'
          : activos.length ? activos.join(' · ') : 'ninguno'}</span>
        <span className="sep">|</span>
        <span><b>{pantalla.predictivo ? 'Modelo predictivo · en desarrollo' : 'Diagnóstico · datos históricos'}</b></span>
        {pantalla.pie && (<><span className="sep">|</span><span>{pantalla.pie}</span></>)}
      </div>
      <div className="pie-l">
        <span><b>Churn</b> proxy operativo: {meta.proxy}</span>
        <span className="sep">|</span>
        <span>el monto en riesgo es <b>exposición, no recupero</b></span>
        <span className="sep">|</span>
        <span>pesos nominales sin deflactar</span>
        <span className="sep">|</span>
        <span>gasto anual estimado = facturación ÷ años desde la primera compra hasta el corte</span>
      </div>
    </footer>
  )
}

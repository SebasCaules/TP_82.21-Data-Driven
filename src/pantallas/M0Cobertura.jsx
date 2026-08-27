// M0 — cobertura de la capacidad de Marketing. La pregunta de la vista es a cuantos alcanza
// a contactar Marketing y que queda afuera, y su titulo afirma que EL ORDEN importa mas que
// el alcance.
//
// Curva de concentracion y no cuadricula de unidades: la cuadricula solo sabia contar
// cabezas, asi que el dibujo no sostenia el titulo. Con las dos curvas la afirmacion se
// verifica de un vistazo y la distancia vertical entre ellas ES la ventaja de ordenar.
// Las cifras estan ancladas en el pipeline (_anclas_concentracion, desde client_facts).
//
// Los tres KPIs de la cabecera SON la lectura del grafico: no son cifras fijas al costado
// sino el punto elegido de la curva. Pasar el mouse los mueve, hacer clic fija el valor, y
// las flechas lo corren de a 10. Asi la pregunta operativa -"si contacto a 640, cuanta
// exposicion cubro"- se responde en la pantalla en vez de quedar para una planilla.
//
// El excedente no es grupo de control (comite-adjudicacion.md, hallazgo 3): es el tramo de
// menor exposicion, que es justo lo que la cola aplanada de la curva muestra.

import { useCallback, useState } from 'react'
import { Lienzo, CurvaConcentracion } from '../graficos.jsx'
import { entero, lista, meta, pct, pesos } from '../agregacion.js'
import { Def } from '../Glosario.jsx'

export default function M0({ info, iCorte, filtro }) {
  const [capLo, capHi] = meta.capacidad_contacto
  const [fijado, setFijado] = useState(null)
  const [hover, setHover] = useState(null)
  // Texto crudo del campo mientras se escribe. Sin esto el input es un controlado atado al
  // valor derivado: al borrarlo saltaba a 1 y los digitos siguientes se pegaban a ese 1, asi
  // que escribir "640" daba "1640". Con `null` el campo muestra el valor vigente; con texto,
  // muestra lo que el usuario esta tecleando.
  const [texto, setTexto] = useState(null)

  const enRiesgo = info.enRiesgo
  const total = info.exposicion

  // La lista ya viene ordenada por gasto anualizado descendente desde el pipeline.
  const filas = lista(iCorte, filtro)
  const acum = []
  filas.reduce((s, r) => { const v = s + r.anualizado; acum.push(v); return v }, 0)

  const n = acum.length
  const hay = n > 0 && total > 0
  const kBase = Math.min(capLo, n)
  const k = hay ? Math.max(1, Math.min(n, hover ?? fijado ?? kBase)) : 0

  const cubre = hay ? (100 * acum[k - 1]) / total : 0
  const azar = enRiesgo ? Math.min(100, (100 * k) / enRiesgo) : 0
  const ventaja = azar ? cubre / azar : 0
  const cubreBase = hay ? (100 * acum[kBase - 1]) / total : 0
  const azarBase = enRiesgo ? Math.min(100, (100 * kBase) / enRiesgo) : 0

  const onHover = useCallback((v) => setHover(v), [])
  const onFijar = useCallback((v) => {
    setFijado(Math.max(1, Math.min(acum.length || 1, Math.round(v))))
    setHover(null)
    setTexto(null)
  }, [acum.length])

  // Mientras se escribe manda el texto, asi el campo se puede vaciar sin que salte a 1 y
  // los digitos no se pegan al valor viejo. Reglas:
  //   - vacio, o "0", o a medio escribir: se deja escribir y el corte no se mueve;
  //   - dentro de rango: el corte se mueve en vivo;
  //   - pasado del tope: se corrige EN EL ACTO al tope y el texto se reescribe. Corregir
  //     recien al salir del campo dejaba un "9999" en pantalla que no era el corte real.
  const onTexto = useCallback((v) => {
    const tope = acum.length || 1
    const num = Number(v)
    if (v.trim() === '' || !Number.isFinite(num)) { setTexto(v); return }
    if (num > tope) {
      setTexto(String(tope)); setFijado(tope); setHover(null); return
    }
    setTexto(v)
    if (num >= 1) { setFijado(Math.round(num)); setHover(null) }
  }, [acum.length])

  // Al salir del campo vuelve a mostrar el corte vigente: si quedo vacio o en cero, se
  // descarta lo tecleado y el corte sigue donde estaba.
  const cerrarTexto = useCallback(() => setTexto(null), [])

  return (
    <section className="pant">
      <h1 className="titulo">
        {hay
          ? `Contactar ${entero(kBase)} de ${entero(enRiesgo)} cubre ${pct(cubreBase)} de la exposición, no ${pct(azarBase)}`
          : enRiesgo === 0
            ? 'Sin clientes en riesgo con este recorte'
            : 'El filtro activo no aporta ningún cliente al ranking de exposición'}
      </h1>
      <p className="bajada">
        {hay
          // CIF-04: con un filtro, kBase puede colapsar a cuantas filas del top 800 global
          // sobreviven al filtro, muy por debajo de la capacidad declarada. Se declara en
          // vez de dejar que el titulo lo presente como una decision. La bajada larga de
          // abajo ya repite la ventaja que muestra el KPI "Ventaja sobre el azar", asi que
          // en este caso se reemplaza entera (no se le agrega texto) para no desbordar el
          // recorte de dos lineas de .bajada.
          ? (kBase < capLo
              ? <>La lista es el recorte del top 800 que sobrevive al filtro, no la
                  capacidad: aporta {entero(n)} de los {entero(enRiesgo)} en riesgo.</>
              : <>La lista se ordena por exposición, así que el orden rinde{' '}
                  {(cubreBase / (azarBase || 1)).toFixed(2).replace('.', ',')} veces más que
                  el alcance. Movete sobre la curva, hacé clic para fijar un corte, o
                  escribí el número exacto arriba.</>)
          : enRiesgo === 0
            ? 'Ninguna combinación de filtros deja clientes en riesgo en este corte.'
            : <>El ranking prioriza exposición individual sobre el top 800 global, no por
                filtro. Hay {entero(enRiesgo)} en riesgo con este recorte, pero ninguno entra
                a ese top 800.</>}
      </p>

      {/* Los tres KPIs son la lectura del punto elegido, no cifras fijas. El primero ademas
          es el CONTROL: se escribe el numero exacto, o se mueve de a diez, o se salta a los
          dos cortes declarados. Acertar 640 arrastrando el mouse sobre 800 px es cuestion de
          punteria; escribirlo no. */}
      <div className="cob-cab">
        <div className="cob-k">
          <span className="cob-k-etq"><label htmlFor="cob-n">Contactos</label></span>
          <span className="cob-k-ctl">
            <button type="button" onClick={() => onFijar(k - 10)} disabled={!hay || k <= 1}
                    aria-label="Diez contactos menos">−</button>
            <input id="cob-n" type="number" inputMode="numeric"
                   className="cob-k-val tabular"
                   value={texto ?? (hay ? String(k) : '')}
                   min={1} max={n} disabled={!hay}
                   onFocus={(ev) => { try { ev.target.select() } catch { /* number input */ } }}
                   onChange={(ev) => onTexto(ev.target.value)}
                   onBlur={cerrarTexto}
                   onKeyDown={(ev) => {
                     ev.stopPropagation()
                     if (ev.key === 'Enter') ev.currentTarget.blur()
                     else if (ev.key === 'Escape') { setTexto(null); ev.currentTarget.blur() }
                   }} />
            <button type="button" onClick={() => onFijar(k + 10)} disabled={!hay || k >= n}
                    aria-label="Diez contactos más">+</button>
          </span>
          <span className="cob-k-ap">
            de {entero(enRiesgo)} en riesgo · ir a{' '}
            <button type="button" className="cob-salto" onClick={() => onFijar(capLo)}
                    disabled={!hay || capLo > n}>{capLo}</button>{' o '}
            <button type="button" className="cob-salto" onClick={() => onFijar(capHi)}
                    disabled={!hay || capHi > n}>{capHi}</button>
          </span>
        </div>
        <Kpi etq="Exposición que cubre" val={hay ? pct(cubre) : '—'} acc
             ap={hay ? `${pesos(acum[k - 1])} de ${pesos(total)}` : '—'} />
        <Kpi etq="Ventaja sobre el azar"
             val={hay ? `${ventaja.toFixed(2).replace('.', ',')} ×` : '—'}
             ap={hay ? `contactando ${entero(k)} al azar cubriría ${pct(azar)}` : '—'} />
      </div>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <CurvaConcentracion
              acum={acum} total={total} nRiesgo={enRiesgo} capLo={capLo} capHi={capHi}
              w={w} h={h} kFijado={fijado} kHover={hover}
              onHover={onHover} onFijar={onFijar} formatoPct={(v) => pct(v)}
              tituloY="% de la exposición en riesgo que queda cubierta"
              tituloX="Clientes contactados, de mayor a menor exposición" />
          )}
        </Lienzo>
      </div>
    </section>
  )
}

/** Un KPI de la cabecera. Cambia con el punto elegido en la curva. */
function Kpi({ etq, val, ap, acc = false }) {
  return (
    <div className="cob-k">
      <span className="cob-k-etq">{etq}</span>
      <span className={`cob-k-val tabular${acc ? ' acc' : ''}`}>{val}</span>
      <span className="cob-k-ap">{ap}</span>
    </div>
  )
}

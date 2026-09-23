// V07 · Campañas: ofertas y Gold — dos hallazgos de Contenido_Campanias.csv y Fidelizacion.csv.
//
// DC-13: CAMP004 y CAMP034 traen dos filas cada una en Contenido_Campanias.csv (join mal
// armado). El dedupe deja 23.529 envíos con oferta contra 22.614 de la base vieja, y con esa
// base corregida la tasa de conversión a 7 días por tipo de oferta se puede medir de nuevo:
// el gráfico muestra que las cinco ofertas caen en el mismo intervalo, ninguna se distingue.
// CAMP034 no tiene ganador: fecha_envio y fecha_creacion empatan entre las dos filas, así que
// el criterio de DC-13 no decide (ver `casos[i].desempate` en el payload) y se muestra el
// empate y la fila que queda mientras se espera la confirmación de Casa Óga (V12).
//
// DC-06: el segmento "Gold" que manda Marketing en las campañas no es el nivel del programa
// de fidelización. De 5.066 envíos etiquetados "Gold", solo 3 socios son Gold de verdad
// (Fidelizacion.nivel); el resto del segmento no coincide con ningún nivel del programa.

import { useEffect, useState } from 'react'
import { Lienzo, PuntosIC } from '../../../src/graficos.jsx'
import { entero, fechaCorta, pct } from '../formato.js'
import { D2 } from '../datos_e2.js'
import TarjetaDecision from '../TarjetaDecision.jsx'

// Título, pie y `meta` comparten las cifras, calculadas acá a nivel de módulo para que
// ninguna copia las escriba a mano.
const V = D2.vistas.V07
const DC13 = D2.decisiones.find((d) => d.id === 'DC-13')
const DC06 = D2.decisiones.find((d) => d.id === 'DC-06')
const BASE_DESPUES = V.ofertas.reduce((s, o) => s + o.despues.n, 0)

// La afirmación "ninguna tasa cambia" solo se escribe si el payload la sostiene oferta por oferta.
const todasIguales = V.ofertas.every((o) => o.antes && o.antes.tasa_pct === o.despues.tasa_pct)
const TITULO = todasIguales
  ? `Dos campañas duplicadas resueltas: ${entero(V.envios_duplicados_por_join)} envíos más y ninguna tasa cambia`
  : `Dos campañas duplicadas resueltas: ${entero(V.envios_duplicados_por_join)} envíos más en la base de conversión`

const PIE = `corte ${fechaCorta(D2.meta.corte_ref)} · base ${entero(BASE_DESPUES)} envíos con oferta, ` +
  `duplicados resueltos (E03, E07); antes ${entero(DC13.antes.valor)} (D16) · ` +
  `Gold ${entero(V.gold.envios)} envíos / ${entero(V.gold.socios)} socios; coincidencia segmento-nivel ` +
  `${pct(V.gold.coincidencia_pct)} sobre los envíos a socios (D17) · tasas con intervalo de Wilson al 95 %`

// true si la ventana tiene al menos `px` de alto; se actualiza al redimensionar.
function useAltoMinimo(px) {
  const q = `(min-height: ${px}px)`
  const [ok, setOk] = useState(() => typeof window === 'undefined' || window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const f = () => setOk(m.matches)
    f()
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [q])
  return ok
}

export const meta = {
  id: 'V07',
  corto: 'Campañas: ofertas y Gold',
  titulo: TITULO,
  pie: PIE,
}

export default function V07Campanias() {
  const v = V

  // Dos filas por oferta (antes/después) para que la comparación quede en el mismo renglón:
  // "antes" tenue y sin énfasis (gris, más fino), "después" con énfasis (azul, el color de
  // --despues en esta paleta es el mismo --acc que ya usa la primitiva).
  // La nota "n envíos" va en todas las filas solo si el svg es ancho: con la tasa a dos
  // decimales, el rótulo de Cupón fijo (IC hasta 1,86 % en una escala a 2 %) pisa la nota por
  // debajo de ~800 px. Ahí quedan solo las notas de Envío gratis, la oferta donde cambia la
  // base (ahí caen los envíos que suma el dedupe).
  const puntos = (w) => v.ofertas.flatMap((o) => {
    const conNota = w >= 800 || o.antes.n !== o.despues.n
    return [
      {
        etiqueta: `${o.tipo} antes`,
        valor: o.antes.tasa_pct,
        ic: [o.antes.ic_lo, o.antes.ic_hi],
        tenue: true,
        nota: conNota ? `${entero(o.antes.n)} envíos` : undefined,
      },
      {
        etiqueta: `${o.tipo} después`,
        valor: o.despues.tasa_pct,
        ic: [o.despues.ic_lo, o.despues.ic_hi],
        enfasis: true,
        nota: conNota ? `${entero(o.despues.n)} envíos` : undefined,
      },
    ]
  })

  // Solo a 1152×640 la regla técnica no entra en las dos tarjetas de decisión sin empujar el
  // pie fuera de la pantalla; desde 720 px de alto sí (medido a 1280×720 y 1366×768).
  const conRegla = useAltoMinimo(720)

  return (
    <section className="pant v07">
      <h1 className="titulo">{TITULO}</h1>

      <div className="lienzo v07-cuerpo">
        {/* Columna izquierda: el gráfico, con el antes/después de DC-13 como encabezado */}
        <div className="tarjeta" style={{ flex: '1.7 1 0' }}>
          <span className="kpi-lbl">
            <span>Conversión a 7 días por oferta: el punto es la tasa y la línea su rango probable al 95 %</span><b>DC-13</b>
          </span>

          <div className="ban-par" style={{ marginTop: 6 }}>
            <div className="par-item par-antes">
              <span className="par-lbl">{DC13.antes.etiqueta}</span>
              <span className="par-val tabular">{entero(DC13.antes.valor)}</span>
            </div>
            <span className="par-flecha">→</span>
            <div className="par-item par-despues">
              <span className="par-lbl">{DC13.despues.etiqueta}</span>
              <span className="par-val tabular">{entero(DC13.despues.valor)}</span>
            </div>
          </div>

          <Lienzo>
            {({ w, h }) => (
              <PuntosIC
                datos={puntos(w)}
                w={w} h={h}
                formato={(x) => pct(x, 2)}
                tituloEje="Conversión a 7 días · IC 95 % (Wilson)"
                anchoEtiqueta={150}
              />
            )}
          </Lienzo>
        </div>

        {/* Columna derecha: los dos casos, el cruce Gold y las dos decisiones */}
        <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          <div className="tarjeta" style={{ flex: '1 1 auto' }}>
            <span className="kpi-lbl">
              Las dos filas duplicadas <b>DC-13</b>
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 6, minHeight: 0 }}>
              {v.casos.map((c) => (
                <div key={c.id_campania}>
                  {/* id y fila elegida en un renglón: con las dos tarjetas de decisión la columna
                      no entra a 1152x640 si cada caso ocupa tres */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                    <span className="kpi-val" style={{ fontSize: 15, marginTop: 0 }}>{c.id_campania}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--ink)' }}>
                      {c.elegida.tipo_oferta} · {fechaCorta(c.elegida.fecha_creacion)}
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--mut)', marginTop: 1, lineHeight: 1.25 }}>
                    {c.desempate
                      ? 'empate total: se conserva la primera fila del archivo, pendiente de confirmación de Casa Óga (vista 12)'
                      : c.criterio}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="tarjeta" style={{ flex: '1 1 auto' }}>
            <span className="kpi-lbl">
              "Gold" de campañas no es el nivel del programa <b>DC-06</b>
            </span>
            <div className="ban-par" style={{ marginTop: 6 }}>
              <div className="par-item par-antes">
                <span className="par-lbl">Envíos al segmento Gold</span>
                <span className="par-val tabular">{entero(DC06.antes.valor)}</span>
              </div>
              <span className="par-flecha" aria-hidden="true">vs.</span>
              <div className="par-item par-despues">
                <span className="par-lbl">Socios Gold en el programa</span>
                <span className="par-val tabular">{entero(DC06.despues.valor)}</span>
              </div>
            </div>
            <span className="kpi-base">
              Segmento de la campaña y nivel del programa coinciden en el {pct(v.gold.coincidencia_pct)} de
              los envíos a socios (D17)
            </span>
          </div>

          <TarjetaDecision dc={DC13} sinJustificacion sinRegla={!conRegla} style={{ flex: '0 0 auto' }} />
          <TarjetaDecision dc={DC06} sinRegla={!conRegla} style={{ flex: '0 0 auto' }} />
        </div>
      </div>

      <p
        className="pie-vista"
        style={{
          flexShrink: 0, margin: 0, marginTop: 2, paddingTop: 6,
          borderTop: '1px dotted var(--bd)',
          font: '400 10.5px/1.4 var(--mono)', color: 'var(--mut)',
        }}
      >
        {PIE}
      </p>
    </section>
  )
}

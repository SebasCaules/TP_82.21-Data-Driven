// V07 · Campañas: join y Gold — dos hallazgos de Contenido_Campanias.csv y Fidelizacion.csv.
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

import { Lienzo, PuntosIC } from '../../../src/graficos.jsx'
import { entero, fechaCorta, pct } from '../formato.js'
import { D2 } from '../datos_e2.js'

// El título y `meta.titulo` (≤ 74 caracteres) comparten la misma cifra, calculada acá afuera
// a nivel de módulo para que ninguna de las dos copias la escriba a mano.
const V = D2.vistas.V07
const BASE_DESPUES = V.ofertas.reduce((s, o) => s + o.despues.n, 0)
const TITULO = `Con el join arreglado, ${entero(BASE_DESPUES)} envíos y ninguna oferta convierte distinto`

export const meta = {
  id: 'V07',
  corto: 'Campañas: join y Gold',
  titulo: TITULO,
  pie: 'join y Gold de campañas',
}

export default function V07Campanias() {
  const v = D2.vistas.V07
  const dc13 = D2.decisiones.find((d) => d.id === 'DC-13')
  const dc06 = D2.decisiones.find((d) => d.id === 'DC-06')

  // La cifra del título sale de sumar la base "después" de cada oferta, no del campo suelto
  // de la decisión: así el número que se lee arriba es el mismo que suman las barras de abajo.
  const baseDespues = BASE_DESPUES

  // Dos filas por oferta (antes/después) para que la comparación quede en el mismo renglón:
  // "antes" tenue y sin énfasis (gris, más fino), "después" con énfasis (azul, el color de
  // --despues en esta paleta es el mismo --acc que ya usa la primitiva).
  const puntos = v.ofertas.flatMap((o) => [
    {
      etiqueta: `${o.tipo} antes`,
      valor: o.antes.tasa_pct,
      ic: [o.antes.ic_lo, o.antes.ic_hi],
      tenue: true,
      nota: `${entero(o.antes.n)} env.`,
    },
    {
      etiqueta: `${o.tipo} después`,
      valor: o.despues.tasa_pct,
      ic: [o.despues.ic_lo, o.despues.ic_hi],
      enfasis: true,
      nota: `${entero(o.despues.n)} env.`,
    },
  ])

  return (
    <section className="pant v07">
      <h1 className="titulo">{TITULO}</h1>

      <div className="lienzo v07-cuerpo">
        {/* Columna izquierda: el gráfico, con el antes/después de DC-13 como encabezado */}
        <div className="tarjeta" style={{ flex: '1.7 1 0' }}>
          <span className="kpi-lbl">
            Conversión a 7 días por oferta, antes y después del dedupe <b>DC-13</b>
          </span>

          <div className="ban-par" style={{ marginTop: 6 }}>
            <div className="par-item par-antes">
              <span className="par-lbl">{dc13.antes.etiqueta}</span>
              <span className="par-val tabular">{entero(dc13.antes.valor)}</span>
            </div>
            <span className="par-flecha">→</span>
            <div className="par-item par-despues">
              <span className="par-lbl">{dc13.despues.etiqueta}</span>
              <span className="par-val tabular">{entero(dc13.despues.valor)}</span>
            </div>
          </div>

          <Lienzo>
            {({ w, h }) => (
              <PuntosIC
                datos={puntos}
                w={w} h={h}
                formato={(x) => pct(x)}
                tituloEje="Tasa de conversión a 7 días"
                anchoEtiqueta={150}
              />
            )}
          </Lienzo>
        </div>

        {/* Columna derecha: los dos casos, el cruce Gold y las dos decisiones */}
        <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          <div className="tarjeta" style={{ flex: 1 }}>
            <span className="kpi-lbl">
              Las dos filas duplicadas <b>DC-13</b>
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 6, minHeight: 0 }}>
              {v.casos.map((c) => (
                <div key={c.id_campania}>
                  <span className="kpi-val" style={{ fontSize: 15, marginTop: 0 }}>{c.id_campania}</span>
                  <div style={{ fontSize: 11.5, color: 'var(--ink)', marginTop: 1 }}>
                    {c.elegida.tipo_oferta} · {fechaCorta(c.elegida.fecha_creacion)}
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

          <div className="tarjeta" style={{ flex: 0.85 }}>
            <span className="kpi-lbl">
              "Gold" de campañas no es el nivel del programa <b>DC-06</b>
            </span>
            <div className="ban-par" style={{ marginTop: 6 }}>
              <div className="par-item par-antes">
                <span className="par-lbl">{dc06.antes.etiqueta}</span>
                <span className="par-val tabular">{entero(dc06.antes.valor)}</span>
              </div>
              <span className="par-flecha">→</span>
              <div className="par-item par-despues">
                <span className="par-lbl">{dc06.despues.etiqueta}</span>
                <span className="par-val tabular">{entero(dc06.despues.valor)}</span>
              </div>
            </div>
            <span className="kpi-base">
              Cruce Fidelización × campañas: {pct(v.gold.coincidencia_pct)} de coincidencia sobre{' '}
              {entero(v.gold.envios)} envíos "Gold" (D17)
            </span>
          </div>

          <div className="tarjeta" style={{ flex: 1.15 }}>
            <span className="kpi-lbl">
              Decisiones <b>DC-13 · DC-06</b>
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 6, minHeight: 0 }}>
              {[dc13, dc06].map((d) => (
                <div key={d.id}>
                  <span className="kpi-lbl" style={{ fontSize: 9.5 }}>{d.id}</span>
                  <p style={{ margin: '2px 0 0', fontSize: 11, lineHeight: 1.3, color: 'var(--ink)' }}>
                    {d.decision}
                  </p>
                  {d.justificacion && (
                    <p style={{ margin: '2px 0 0', fontSize: 10, lineHeight: 1.3, color: 'var(--mut)' }}>
                      {d.justificacion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
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
        corte {fechaCorta(D2.meta.corte_ref)} · base {entero(baseDespues)} envíos con oferta,
        duplicados resueltos (D16) · Gold {entero(v.gold.envios)} envíos / {v.gold.socios} socios,{' '}
        {pct(v.gold.coincidencia_pct)} de coincidencia (D17) · tasas con intervalo de Wilson al 95 %
      </p>
    </section>
  )
}

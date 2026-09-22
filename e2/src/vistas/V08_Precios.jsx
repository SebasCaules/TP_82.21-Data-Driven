// V08 — Precios. Responde por qué el consolidado no deflacta: el precio unitario mediano
// bajó en pesos corrientes mientras el IPC multiplicó el nivel general por trece. La mediana
// anual y el IPC van en dos <Lienzo> separados (nunca eje doble, regla transversal 5): son
// dos series de escalas distintas y un eje compartido las mezclaría en el mismo dibujo. La
// variación por categoría (2022→2025) va en BarrasDivergentes porque tiene signo: seis de
// siete categorías caen y una sube, y BarrasH no admite barras hacia la izquierda.
//
// DC-10 es una decisión DECLARADA, no aplicada: antes y después son el mismo -7,6 %, porque
// lo que cambia no es el número sino la salvedad que lo acompaña (CONTRACT_E2.md, DC-10).
// Arriba van dos tarjetas .kpi normales, no un .ban-par: esas clases significan antes/después
// de una decisión en todo el tablero, y acá no hay corrección, hay precio contra inflación.
// Las dos cifras del hallazgo (cuánto bajó el precio, cuánto multiplicó el IPC) se muestran
// en tinta neutra (--ink), sin flecha entre ellas.

import { Lienzo, Linea, BarrasDivergentes } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, pct, pesos, decimal, fechaCorta } from '../formato.js'

const V = D2.vistas.V08
const DC10 = D2.decisiones.find((d) => d.id === 'DC-10')

const anioPrecioIni = V.mediana_unitaria[0]?.anio ?? null
const anioPrecioFin = V.mediana_unitaria[V.mediana_unitaria.length - 1]?.anio ?? null
const anioIpcIni = V.ipc[0]?.anio ?? null
const anioIpcFin = V.ipc[V.ipc.length - 1]?.anio ?? null
const ipcUltimo = V.ipc[V.ipc.length - 1]?.acumulado ?? null
const verboPrecio = V.variacion_pct < 0 ? 'bajó' : 'subió'

const TITULO = `Precio unitario ${verboPrecio} ${pct(Math.abs(V.variacion_pct))} en pesos ` +
  `corrientes mientras el IPC multiplicó por ${entero(ipcUltimo)}`

export const meta = {
  id: 'V08',
  corto: 'Precios',
  titulo: TITULO,
  pie: 'C29 · D08 · D09 — pesos corrientes, sin deflactar',
}

export default function V08Precios() {
  const seriePrecio = V.mediana_unitaria.map((d) => ({ etiqueta: String(d.anio), valor: d.valor }))
  const serieIpc = V.ipc.map((d) => ({ etiqueta: String(d.anio), valor: d.acumulado }))

  // Q1 primero (la caída más fuerte) y Baño al final (la única que sube): el orden lee el
  // dibujo de arriba abajo como el ranking que es, no como el orden alfabético del catálogo.
  const categorias = [...V.por_categoria].sort((a, b) => a.pct - b.pct)
  const datosCategorias = categorias.map((c) => ({
    etiqueta: c.categoria,
    valor: c.pct,
    enfasis: c.categoria === categorias[0].categoria,
    nota: `${pesos(c.v2022)} → ${pesos(c.v2025)}`,
  }))

  return (
    <section className="pant v08">
      <h1 className="titulo">{TITULO}</h1>

      <div style={{ display: 'flex', gap: 'clamp(12px, 1.8vw, 30px)', flex: '0 0 auto' }}>
        <div className="tarjeta" style={{ flex: '0 0 auto', minWidth: 150 }}>
          <span className="kpi-lbl">Precio unitario {anioPrecioIni}→{anioPrecioFin}</span>
          <span className="kpi-val tabular">{pct(V.variacion_pct)}</span>
          <span className="kpi-base">mediana de monto_neto/unidades</span>
        </div>

        <div className="tarjeta" style={{ flex: '0 0 auto', minWidth: 150 }}>
          <span className="kpi-lbl">IPC acumulado {anioIpcIni}→{anioIpcFin}</span>
          <span className="kpi-val tabular">{decimal(ipcUltimo, 1)}x</span>
          <span className="kpi-base">base {anioIpcIni} = 1</span>
        </div>

        <div className="tarjeta" style={{ flex: '1 1 0', minWidth: 0 }}>
          <span className="kpi-lbl">Decisión <b className="tabular">DC-10</b></span>
          <p style={{ font: '600 13px/1.35 var(--fuente)', color: 'var(--ink)', margin: '6px 0 0' }}>
            {DC10.decision}
          </p>
          <p style={{ fontSize: 11.5, lineHeight: 1.35, color: 'var(--mut2)', margin: '5px 0 0' }}>
            {DC10.justificacion}
          </p>
        </div>
      </div>

      <div className="lienzo" style={{ flex: '1 1 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span className="kpi-lbl" style={{ display: 'inline', flex: '0 0 auto', marginBottom: 4 }}>
            Precio unitario, mediana anual
          </span>
          <Lienzo className="lienzo">
            {({ w, h }) => (
              // Miles, sin decimal: el primer punto (2022) ES el pico de la serie, y como no
              // es el último Linea le dibuja su propia etiqueta flotante justo sobre el eje Y
              // (el punto cae en x = padL, fijo por la primitiva). Con un decimal la etiqueta
              // ("8,9") seguía tapando el último dígito de la marca del eje ("10,0"): no hay
              // formatoEje aparte en esta primitiva, un solo formato vale para las dos. Los
              // pesos exactos ya están arriba (-7,6 %) y en la tabla de categorías.
              <Linea serie={seriePrecio} w={w} h={h} formato={(v) => entero(v / 1000)}
                     tituloY="miles de pesos corrientes, mediana" tituloEje="año" />
            )}
          </Lienzo>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span className="kpi-lbl" style={{ display: 'inline', flex: '0 0 auto', marginBottom: 4 }}>
            IPC acumulado, base 2022 = 1
          </span>
          <Lienzo className="lienzo">
            {({ w, h }) => (
              <Linea serie={serieIpc} w={w} h={h} formato={(v) => `${decimal(v, 1)}x`}
                     tituloY="índice acumulado" tituloEje="año" />
            )}
          </Lienzo>
        </div>
      </div>

      <div className="lienzo" style={{ flex: '1 1 0' }}>
        <Lienzo className="lienzo">
          {({ w, h }) => (
            <BarrasDivergentes
              datos={datosCategorias} w={w} h={h} formato={pct}
              tituloEje="variación 2022 → 2025" anchoEtiqueta={118}
              encabezadoNota="mediana 2022 → 2025"
              rotuloPos="sube" rotuloNeg="baja"
            />
          )}
        </Lienzo>
      </div>

      <p className="pie-vista">
        corte <b>{fechaCorta(D2.meta.corte_ref)}</b> · base: filas con monto y unidades &gt; 0,
        crudas · registro <b>C29</b>, <b>D08</b>, <b>D09</b> · pesos corrientes confirmados por
        el negocio (consulta 3): no se deflacta
      </p>
    </section>
  )
}

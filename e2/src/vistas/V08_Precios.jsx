// V08 — Precios. Responde por qué el consolidado no deflacta: el precio unitario mediano
// bajó en pesos corrientes mientras el IPC multiplicó el nivel general por trece. La mediana
// anual y el IPC van en dos <Lienzo> separados (nunca eje doble, regla transversal 5): son
// dos series de escalas distintas y un eje compartido las mezclaría en el mismo dibujo. La
// variación por categoría (2022→2025) va en BarrasDivergentes porque tiene signo: seis de
// siete categorías caen y una sube, y BarrasH no admite barras hacia la izquierda.
//
// DC-10 es una decisión DECLARADA, no aplicada: antes y después son el mismo -7,6 %, porque
// lo que cambia no es el número sino la salvedad que lo acompaña (CONTRACT_E2.md, DC-10).
// Auditoría T-05: sin un .ban-par explícito esa declaración no se veía en ningún lado, así
// que la primera tarjeta ahora es un .ban-par (antes: lectura nominal; después: mismo valor,
// marcado como sin cambio) en vez del kpi suelto que tenía antes.
//
// Auditoría T-11: Linea no pone <title> en cada punto, solo en el pico y en el punto bajo el
// cursor. Como esta vista no puede tocar graficos.jsx, puntosDeLinea() recalcula la misma
// grilla (padL/padT/padB/padR y escalaNice) que usa la primitiva y dibuja un <circle> con
// <title> encima de cada dato, en un <svg> transparente superpuesto al de Linea.
//
// Auditoría T-12: el título pasaba los 74 caracteres con datos reales (80). La redacción de
// abajo lo acorta sin perder el hallazgo.

import { Lienzo, Linea, BarrasDivergentes, escalaNice } from '../../../src/graficos.jsx'
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
  `corrientes; IPC multiplicó ×${entero(ipcUltimo)}`

export const meta = {
  id: 'V08',
  corto: 'Precios',
  titulo: TITULO,
  pie: 'C29 · D08 · D09 — pesos corrientes, sin deflactar',
}

/** Misma grilla que arma <Linea> (graficos.jsx) para w/h/tituloY dados, sin banda ni zonas
 *  (los dos paneles de esta vista no las usan, así que padR da siempre 30). Se recalcula acá
 *  porque la vista no puede tocar graficos.jsx para exponer las coordenadas: es la única
 *  forma de que un punto propio caiga exacto sobre la curva que dibuja la primitiva. */
function puntosDeLinea(serie, w, h, { tituloY, titulo }) {
  const padL = 50
  const padT = tituloY ? 26 : 14
  const padB = 56
  const padR = 30
  const iw = Math.max(20, w - padL - padR)
  const ih = Math.max(20, h - padT - padB)
  const vals = serie.filter((p) => p.valor != null).map((p) => p.valor)
  if (!vals.length) return []
  const { max } = escalaNice(Math.max(...vals), 4)
  const x = (i) => padL + (i / Math.max(1, serie.length - 1)) * iw
  const y = (v) => padT + ih - (v / max) * ih
  return serie
    .map((p, i) => (p.valor == null ? null : { x: x(i), y: y(p.valor), key: p.etiqueta, titulo: titulo(p) }))
    .filter(Boolean)
}

/** Capa transparente con un <circle><title> por punto, superpuesta al <svg> de Linea. Solo
 *  el círculo captura puntero (pointerEvents en el svg va en none): el área de foco de Linea
 *  sigue funcionando debajo sin que esta capa se interponga. */
function PuntosTitulo({ puntos, w, h }) {
  return (
    <svg width={w} height={h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
         aria-hidden="true">
      {puntos.map((p) => (
        <circle key={p.key} cx={p.x} cy={p.y} r="3" fill="var(--acc)" stroke="var(--sup)"
                strokeWidth="1.5" style={{ pointerEvents: 'auto' }}>
          <title>{p.titulo}</title>
        </circle>
      ))}
    </svg>
  )
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
        <div className="tarjeta" style={{ flex: '1 1 280px', minWidth: 0 }}>
          <span className="kpi-lbl">Precio unitario {anioPrecioIni}→{anioPrecioFin} — <b className="tabular">DC-10</b></span>
          <div className="ban-par" style={{ marginTop: 6, flexWrap: 'wrap' }}>
            <div className="par-item par-antes">
              <span className="par-lbl">Antes</span>
              <span className="par-val" style={{ fontSize: 15.5, lineHeight: 1.32 }}>
                {pct(V.variacion_pct)} nominal ({anioPrecioIni} → {anioPrecioFin})
              </span>
            </div>
            <span className="par-flecha">→</span>
            <div className="par-item par-despues">
              <span className="par-lbl">Después</span>
              <span className="par-val" style={{ fontSize: 15.5, lineHeight: 1.32 }}>
                {pct(V.variacion_pct)}, sin deflactar: sin cambio (DC-10 declarada)
              </span>
            </div>
          </div>
        </div>

        <div className="tarjeta" style={{ flex: '0 0 auto', minWidth: 130 }}>
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
            {({ w, h }) => {
              const puntos = puntosDeLinea(seriePrecio, w, h, {
                tituloY: true,
                titulo: (p) => `${p.etiqueta}: ${pesos(p.valor)}, mediana`,
              })
              return (
                <div style={{ position: 'relative', width: w, height: h }}>
                  {/* Miles, sin decimal: el primer punto (2022) ES el pico de la serie, y
                      como no es el último Linea le dibuja su propia etiqueta flotante justo
                      sobre el eje Y (el punto cae en x = padL, fijo por la primitiva). Con un
                      decimal la etiqueta ("8,9") seguía tapando el último dígito de la marca
                      del eje ("10,0"): no hay formatoEje aparte en esta primitiva, un solo
                      formato vale para las dos. Los pesos exactos ya están en el par de
                      arriba y en la tabla de categorías; el <title> de cada punto los repite
                      sin redondear. */}
                  <Linea serie={seriePrecio} w={w} h={h} formato={(v) => entero(v / 1000)}
                         tituloY="miles de pesos corrientes, mediana" tituloEje="año" />
                  <PuntosTitulo puntos={puntos} w={w} h={h} />
                </div>
              )
            }}
          </Lienzo>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span className="kpi-lbl" style={{ display: 'inline', flex: '0 0 auto', marginBottom: 4 }}>
            IPC acumulado, base 2022 = 1
          </span>
          <Lienzo className="lienzo">
            {({ w, h }) => {
              const puntos = puntosDeLinea(serieIpc, w, h, {
                tituloY: true,
                titulo: (p) => `${p.etiqueta}: ${decimal(p.valor, 1)}x acumulado (base ${anioIpcIni} = 1)`,
              })
              return (
                <div style={{ position: 'relative', width: w, height: h }}>
                  <Linea serie={serieIpc} w={w} h={h} formato={(v) => `${decimal(v, 1)}x`}
                         tituloY="índice acumulado" tituloEje="año" />
                  <PuntosTitulo puntos={puntos} w={w} h={h} />
                </div>
              )
            }}
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

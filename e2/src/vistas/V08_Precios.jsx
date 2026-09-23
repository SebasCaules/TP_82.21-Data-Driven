// V08 — Precios. Responde por qué el consolidado no deflacta: el precio unitario mediano
// bajó en pesos corrientes mientras el IPC multiplicó el nivel general por trece. La mediana
// anual y el IPC van en dos <Lienzo> separados (nunca eje doble, regla transversal 5): son
// dos series de escalas distintas y un eje compartido las mezclaría en el mismo dibujo. La
// variación por categoría (2022→2025) va en BarrasDivergentes porque tiene signo: seis de
// siete categorías caen y una sube, y BarrasH no admite barras hacia la izquierda.
//
// DC-10 es una decisión DECLARADA, no aplicada: antes y después son el mismo -7,6 %, porque
// lo que cambia no es el número sino la salvedad que lo acompaña (CONTRACT_E2.md, DC-10).
// Auditoría del 22/09 (D1-14, D4-16): el par antes/después repetía la misma cifra a los dos
// lados, así que la primera tarjeta muestra un solo valor (mediana inicial → final) y la
// salvedad va en el kpi-sub. La declaración la lleva la TarjetaDecision.
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
import TarjetaDecision from '../TarjetaDecision.jsx'

const V = D2.vistas.V08
const DC10 = D2.decisiones.find((d) => d.id === 'DC-10')

const anioPrecioIni = V.mediana_unitaria[0]?.anio ?? null
const anioPrecioFin = V.mediana_unitaria[V.mediana_unitaria.length - 1]?.anio ?? null
const anioIpcIni = V.ipc[0]?.anio ?? null
const anioIpcFin = V.ipc[V.ipc.length - 1]?.anio ?? null
const ipcUltimo = V.ipc[V.ipc.length - 1]?.acumulado ?? null
const verboPrecio = V.variacion_pct < 0 ? 'bajó' : 'subió'

const TITULO = `Precio unitario ${verboPrecio} ${pct(Math.abs(V.variacion_pct))} en pesos ` +
  `corrientes; IPC acumulado ${decimal(ipcUltimo, 1)}×`
// A 1152x640 cada px vertical va al area de dibujo: el piso de fit.js es 90 px.
const PAD_GRAF = { paddingTop: 6, paddingBottom: 6 }
const m0 = V.mediana_unitaria[0]?.valor ?? null
const mN = V.mediana_unitaria[V.mediana_unitaria.length - 1]?.valor ?? null

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
    // Sin énfasis (D2-11): el orden ya dice cuál baja más; el azul se lee como "corregido".
    enfasis: false,
    nota: `${pesos(c.v2022)} → ${pesos(c.v2025)}`,
  }))

  return (
    <section className="pant v08">
      <h1 className="titulo">{TITULO}</h1>

      <div style={{ display: 'flex', gap: 'clamp(12px, 1.8vw, 30px)', flex: '0 0 auto' }}>
        <div className="tarjeta" style={{ flex: '1 1 280px', minWidth: 0 }}>
          <span className="kpi-lbl"><span>Mediana del precio unitario, pesos corrientes</span><b>DC-10</b></span>
          <span className="kpi-val tabular"
                style={{ fontSize: 'clamp(17px, 1.75vw, 30px)', whiteSpace: 'nowrap' }}>
            {pesos(m0)} ({anioPrecioIni}) → {pesos(mN)} ({anioPrecioFin})
          </span>
          <span className="kpi-sub" style={{ minHeight: 0 }}>{pct(V.variacion_pct)}, sin ajustar por inflación (DC-10 declarada)</span>
        </div>

        <div className="tarjeta" style={{ flex: '0 1 300px', minWidth: 150 }}>
          <span className="kpi-lbl">IPC acumulado, inflación {anioIpcIni} a {anioIpcFin - 1}</span>
          <span className="kpi-val tabular">{decimal(ipcUltimo, 1)}×</span>
          <span className="kpi-base" style={{ minHeight: 0, paddingTop: 3 }}>INDEC, {anioIpcFin} no se cuenta (D09)</span>
        </div>

      </div>

      {/* La decisión va como tercera columna de la fila de líneas y no en la fila de arriba:
          con regla y justificación mide unos 190 px de alto y arriba aplastaba los gráficos a
          1152x640; junto a las barras les quitaba el ancho que necesita el eje de ±15 %. */}
      <div className="lienzo" style={{ flex: '1.35 1 0' }}>
        <div className="tarjeta" style={{ minWidth: 0, flex: '1.35 1 0', ...PAD_GRAF }}>
          <span className="kpi-lbl" style={{ flex: '0 0 auto' }}>
            <span>Precio unitario mediano · <span style={{ whiteSpace: 'nowrap' }}>{pesos(m0)} → {pesos(mN)}</span></span>
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
                      formato vale para las dos. Los pesos exactos ya están en el rótulo y
                      en la tabla de categorías; el <title> de cada punto los repite sin
                      redondear. */}
                  <Linea serie={seriePrecio} w={w} h={h} formato={(v) => entero(v / 1000)}
                         tituloY="miles de pesos corrientes, mediana" tituloEje="año" />
                  <PuntosTitulo puntos={puntos} w={w} h={h} />
                </div>
              )
            }}
          </Lienzo>
        </div>

        <div className="tarjeta" style={{ minWidth: 0, flex: '1.2 1 0', ...PAD_GRAF }}>
          <span className="kpi-lbl" style={{ flex: '0 0 auto' }}>
            <span>IPC acumulado al inicio de cada año, base inicio {anioIpcIni} = 1</span>
          </span>
          <Lienzo className="lienzo">
            {({ w, h }) => {
              // "inicio de": el acumulado de cada fila es la inflación hasta diciembre del
              // año anterior (el de la última fila no cuenta su propio año, D09).
              const puntos = puntosDeLinea(serieIpc, w, h, {
                tituloY: false,
                titulo: (p) => `inicio de ${p.etiqueta}: ${decimal(p.valor, 1)}× acumulado`,
              })
              return (
                <div style={{ position: 'relative', width: w, height: h }}>
                  {/* Sin tituloY: el rótulo del panel ya dice qué índice es, y esos 12 px
                      son los que le faltaban al área de dibujo a 1152x640. */}
                  <Linea serie={serieIpc} w={w} h={h} formato={(v) => `${decimal(v, 1)}×`}
                         tituloEje="año" />
                  <PuntosTitulo puntos={puntos} w={w} h={h} />
                </div>
              )
            }}
          </Lienzo>
        </div>

        <TarjetaDecision dc={DC10} style={{ minWidth: 0 }} />
      </div>

      {/* Piso de alto: por debajo de ~180 px las siete filas bajan de 13 px y las etiquetas
          se pisan (1152x640). Encima de eso manda el reparto 1,35 / 1 con la fila de líneas. */}
      <div className="lienzo" style={{ flex: '1 1 0', minHeight: 180 }}>
        <div className="tarjeta" style={{ minWidth: 0, ...PAD_GRAF }}>
          <Lienzo className="lienzo">
            {({ w, h }) => (
              <BarrasDivergentes
                datos={datosCategorias} w={w} h={h} formato={pct}
                tituloEje={`variación ${anioPrecioIni} → ${anioPrecioFin}`} anchoEtiqueta={118}
                encabezadoNota={`mediana ${anioPrecioIni} → ${anioPrecioFin}`}
                rotuloPos="sube" rotuloNeg="baja"
              />
            )}
          </Lienzo>
        </div>
      </div>

      <p className="pie-vista">
        corte <b>{fechaCorta(D2.meta.corte_ref)}</b> · base: filas con monto y unidades &gt; 0,
        crudas · registro <b>C29</b>, <b>D08</b>, <b>D09</b> · pesos corrientes confirmados por
        el negocio (consulta 3): no se deflacta
      </p>
    </section>
  )
}

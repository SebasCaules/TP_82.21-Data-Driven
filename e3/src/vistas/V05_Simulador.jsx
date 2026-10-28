// V05 · el simulador de la tasa de éxito (Parte B 3.2 y 3.4 a 3.6; diapositiva 9 de C3), detrás de
// «Explorar» en la tarjeta del gráfico de la vista 5 (27/10, W3). Es la tarjeta del gráfico de V05 entera.
//
// (28/10, unidad V05 de .workforce/PLAN.md) Al llegar, dos barras con BarrasH (src/graficos.jsx; paridad_e3.py
// mide sus rótulos en esta vista): el costo del año 1 de la regla sola (D3.economia.costos.regla_sin_modelo,
// USD 20.260, en --e3-ctx-relleno, sin énfasis) contra el beneficio anual de la regla
// (D3.economia.observada.regla_usd, USD 299,49, en --acc). La astilla es el mensaje. Encabezado como las
// vistas 1 y 4: qué mide en mono (con «lista de 500 sin filtro en validación», que busca verificar_e3.py) y
// la conclusión en .e3-conclusion, la frase de la tarjeta «Económica» de la diapositiva 2 de C3 con el
// beneficio en --acc. El lienzo llena el alto de la tarjeta. El costo con modelo y la línea del presupuesto
// pasan a «Explorar»: ahí se lee también el ROI del modelo sobre la regla.
//
// Este archivo NO exporta `default`: vistas/index.jsx registra como vista todo `V*.jsx` con default, y
// sin `meta.id` este archivo caería en el id «V05» de V05_SePaga.jsx. Lo importa V05_SePaga.jsx.
//
// - Deslizante: la tasa de éxito s sobre la grilla precalculada de D3.economia.grilla (el navegador no
//   calcula: lee la fila i). Arranca en la observada (1,02 %) y va del borde inferior del IC 95 % (0,63 %)
//   a 100 %, con el tramo de 0,63 a 5 % ampliado (la grilla cambia de paso en 5 %). Imanes y ↑ ↓ en las
//   marcas de la grilla (`notables`). Arriba, la observada con su IC y el equilibrio del descuento
//   elegido; abajo, la escala. (Crítica del W3, hallazgo 6) Un solo sombreado, el del IC, que es el que
//   nombra el rótulo; el cambio de escala en 5 % va marcado con un corte (dos barras sobre el riel) y no
//   con un segundo sombreado sin leyenda.
// - Descuento: con el de la oferta (15 %) o sin descuento; cambia la regla y el modelo (columnas `_sin`).
// - Lecturas: s, el ROI de la regla y el del modelo sobre la regla, con la fila de la grilla.
// - El gráfico: la barra del beneficio de la regla sigue a s; arriba se suma el costo con modelo y el
//   presupuesto. El eje queda fijo mientras se arrastra (el
//   tope es el beneficio con s = 100 % del descuento elegido), así las barras de costo no saltan.
//   (Crítica del W3, hallazgo 7) El beneficio es el de la lista de 500 sin filtro en validación, el
//   escenario base de la B 3.4 (G41): la frase lo dice, y el title suma la lista que sale (500
//   contactables) en validación (H42) y en test (D 11.2, J12).
// - (28/10) El ROI negativo y el equilibrio, en --acc: la terracota queda para la excepción (regla 4 del plan).
// - La conclusión sigue al deslizante: si el ROI de la regla llega a 0 o más, dice que la regla se paga.
// Los valores que dependen del control llevan data-simulacion; las marcas de la escala, data-escala.
// «Cerrar» vuelve a la observada, con descuento, y al gráfico de la vista presentada.

import { useState } from 'react'
import { BarrasH, Lienzo, useMedida } from '../../../src/graficos.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { fijo, pct, pctDirecto, tasa, usd } from '../formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { BotonExplorar, Deslizante, Opciones } from '../controles.jsx'

const E = D3.economia
const G = E.grilla
const D9 = C3.DIAPOSITIVAS.find((d) => d.n === 9)
// La conclusión del gráfico: la frase de la tarjeta «Económica» de la diapositiva 2 de C3, sin el punto.
const ECO = C3.DIAPOSITIVAS.find((d) => d.n === 2).tarjetas.find((t) => t.area === 'Económica')
if (!ECO) throw new Error('V05_Simulador: la diapositiva 2 de C3 no trae la tarjeta «Económica»')
const NO_RECUPERA = ECO.texto.replace(/\.$/, '')
// Las barras de costo, en el relleno de contexto del E3.
const CTX = 'var(--e3-ctx-relleno, #a9b1bf)'
const N = (id) => {
  const x = G.notables.find((m) => m.id === id)
  if (!x) throw new Error(`V05_Simulador: la grilla no trae la marca «${id}»`)
  return x
}
const OBS = N('observada')
const IC = [N('ic95_inferior'), N('ic95_superior')]
const EQ = { con: N('equilibrio_con_descuento'), sin: N('equilibrio_sin_descuento') }
const DESDE = IC[0].i
const IMANES = G.notables.filter((x) => x.i >= DESDE).map((x) => x.i)
const indiceDeS = (v) => G.s.findIndex((s) => Math.abs(s - v) < 1e-9)
const QUIEBRE = indiceDeS(G.tramos[0].hasta)
// La escala de abajo: cada punto hasta 5 % (el tramo ampliado) y cada 25 desde ahí.
const MARCAS = [0.01, 0.02, 0.03, 0.04, 0.05, 0.25, 0.5, 0.75, 1].map((v) => ({ v, i: indiceDeS(v) }))
  .filter((m) => m.i >= DESDE)
const DESC = pct(E.parametros.descuento, 0)
const OPCIONES = [{ valor: 'con', texto: `${DESC} de descuento` }, { valor: 'sin', texto: 'Sin descuento' }]

const RC = E.regla_contactables                                           // H42
const RT = D3.test.roi_b_3_4.find((f) => f.fila === 'regla_sin_modelo')   // J12
if (!RT) throw new Error('V05_Simulador: D3.test.roi_b_3_4 no trae la fila de la regla')
const COSTO_MODELO = E.costos.con_modelo.total_anio_1_usd
const COSTO_REGLA = E.costos.regla_sin_modelo.total_anio_1_usd
const ULTIMA = G.n - 1
const col = (nombre, desc) => G[desc === 'con' ? nombre : `${nombre}_sin`]

// Montos de las barras: centavos solo debajo de mil (USD 299,49; USD 30.660), como V05.
const monto = (v) => usd(v, v < 1000 ? 2 : 0)
const sim = { 'data-simulacion': '' }

function Lectura({ rotulo, valor, malo }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.45em', whiteSpace: 'nowrap' }}>
      <span style={{ color: 'var(--mut2)' }}>{rotulo}</span>
      <b className="tabular" style={{ color: malo ? 'var(--acc)' : 'var(--ink)' }} {...sim}>{valor}</b>
    </span>
  )
}

/** El deslizante con su escala. `ancho`: lo que mide la caja, en px lógicos. */
function Escala({ ancho, i, setI, desc }) {
  const w = Math.max(120, ancho - 24)
  const xi = (k) => ((k - DESDE) / (ULTIMA - DESDE)) * w
  const eq = EQ[desc]
  const rot = { position: 'absolute', font: '500 var(--e2-rot)/1.2 var(--fuente)', color: 'var(--mut2)', whiteSpace: 'nowrap' }
  return (
    <div style={{ paddingLeft: 12, paddingRight: 12 }}>
      <Deslizante n={G.n} desde={DESDE} valor={i} onCambio={setI} imanes={IMANES} ancho={w} alto={78}
                  etiqueta="Tasa de éxito" textoValor={tasa(G.s[i])}>
        {/* el IC 95 % de la observada, detrás del riel; en 5 %, el corte de la escala (cambia de paso) */}
        <div style={{ position: 'absolute', left: xi(IC[0].i), width: Math.max(2, xi(IC[1].i) - xi(IC[0].i)), top: 30,
                      height: 16, background: 'var(--azul1)' }} />
        <i aria-hidden="true" style={{ position: 'absolute', left: xi(QUIEBRE) - 5, top: 29, width: 10, height: 18,
                                       background: 'var(--sup)', zIndex: 2 }} />
        {[-3, 3].map((d) => (
          <i key={d} aria-hidden="true" style={{ position: 'absolute', left: xi(QUIEBRE) + d - 1, top: 29, width: 2, height: 18,
                                                 background: 'var(--eje)', transform: 'skewX(-24deg)', zIndex: 3 }} />
        ))}
        {/* arriba: la observada y el equilibrio del descuento elegido */}
        <i style={{ position: 'absolute', left: xi(OBS.i) - 1, top: 18, width: 2, height: 30, background: 'var(--ink)' }} />
        <span style={{ ...rot, left: xi(OBS.i) - 2, top: 0, color: 'var(--ink)', fontWeight: 600 }} data-escala="">
          {`${tasa(OBS.s)} observada; sombreado, su IC 95 %`}
        </span>
        <i style={{ position: 'absolute', left: xi(eq.i) - 1, top: 18, width: 2, height: 30, background: 'var(--acc)' }} />
        <span style={{ ...rot, right: w - xi(eq.i) - 2, top: 0, color: 'var(--acc)', fontWeight: 600 }} data-escala="">
          {`${tasa(eq.s)}: la regla se paga`}
        </span>
        {/* abajo: la escala */}
        {MARCAS.map((m) => (
          <span key={m.v} data-escala=""
                style={{ ...rot, top: 54, left: xi(m.i), transform: m.v === 1 ? 'translateX(-100%)' : 'translateX(-50%)' }}>
            {m.v === 1 ? tasa(1) : pct(m.v, 0)}
          </span>
        ))}
      </Deslizante>
    </div>
  )
}

/** Lo que «Explorar» agrega: el descuento, las lecturas y el deslizante. Es un componente propio para que
 *  useMedida mida la caja al montarse (con «Explorar» cerrado no existe). */
function PanelSimulador({ i, setI, desc, setDesc, reglaRoi, modeloRoi }) {
  const [caja, medida] = useMedida()
  return (
    <div ref={caja} style={{ marginTop: 'clamp(6px, 1.2cqh, 14px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'clamp(6px, 0.8cqh, 10px) clamp(14px, 2cqw, 28px)',
                    font: '400 var(--e2-txt2)/1.3 var(--fuente)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(6px, 0.8cqw, 10px)' }}>
          <span className="kpi-lbl">Descuento</span>
          <Opciones etiqueta="Descuento de la oferta" valor={desc} onCambio={setDesc} opciones={OPCIONES} />
        </span>
        <Lectura rotulo="Tasa de éxito" valor={tasa(G.s[i])} />
        <Lectura rotulo="ROI de la regla" valor={pctDirecto(reglaRoi, 2)} malo={reglaRoi < 0} />
        <Lectura rotulo="ROI del modelo sobre la regla" valor={pctDirecto(modeloRoi, 2)} malo={modeloRoi < 0} />
      </div>
      {medida.w > 0 && (
        <div style={{ marginTop: 'clamp(4px, 1cqh, 12px)' }}>
          <Escala ancho={medida.w} i={i} setI={setI} desc={desc} />
        </div>
      )}
    </div>
  )
}

/** La tarjeta del gráfico de V05, con el simulador detrás de «Explorar». */
export function TarjetaCostoBeneficio() {
  const k = useEscalaTexto()
  const [explorar, setExplorar] = useState(false)
  const [i, setI] = useState(OBS.i)
  const [desc, setDesc] = useState('con')
  const cambiarExplorar = (v) => {
    setExplorar(v)
    if (!v) { setI(OBS.i); setDesc('con') }
  }

  const regla = explorar ? col('regla_usd', desc)[i] : E.observada.regla_usd
  const reglaRoi = explorar ? col('regla_roi_pct', desc)[i] : E.observada.regla_roi_pct
  const modeloRoi = col('modelo_roi_pct', desc)[i]
  // Al llegar, dos barras: el costo de la regla sola (contexto) y su beneficio (--acc). «Explorar» suma el
  // costo con modelo arriba y el presupuesto, para leer el ROI del modelo junto al de la regla.
  const barras = [
    ...(explorar ? [{ etiqueta: 'Costo del año 1, con modelo', valor: COSTO_MODELO, color: CTX }] : []),
    { etiqueta: 'Costo del año 1, regla sola', valor: COSTO_REGLA, color: CTX },
    { etiqueta: 'Beneficio anual de la regla', valor: regla, enfasis: true, anchoMin: 3 },
  ]

  // La conclusión dice lo que muestra el gráfico; con el deslizante, cambia si la regla llega a pagarse.
  const conclusion = reglaRoi < 0
    ? <>{`${NO_RECUPERA}: deja `}<b className="tabular" {...(explorar ? sim : {})}>{monto(regla)}</b>{' por año'}</>
    : <>{'Con esta tasa de éxito, la regla se paga: deja '}<b className="tabular" {...sim}>{monto(regla)}</b>{' por año'}</>

  const titulo = `Beneficio anual de la regla con la lista de 500 sin filtro en los cortes de validación, el escenario `
    + `base de la B 3.4: ${monto(E.observada.regla_usd)}, ROI ${pctDirecto(E.observada.regla_roi_pct, 2)}. Con la lista `
    + `que sale, 500 contactables: ${monto(RC.usd_anio)} en validación (ROI ${pctDirecto(RC.roi_pct, 2)}) y `
    + `${monto(RT.contactables.usd)} en test (ROI ${pctDirecto(RT.contactables.roi_pct, 2)}, Parte D 11.2). Ninguna `
    + `recupera el costo en el año. Con modelo, el año 1 cuesta ${monto(COSTO_MODELO)} (presupuesto `
    + `${monto(E.costos.presupuesto_usd)}).`
    + (explorar ? ` Simulación sobre la grilla de la Parte B. ${D9.pie_figura}` : '')
  return (
    <div className="tarjeta e3-v05-graf" title={titulo}>
      <div className="e3-v05-cab">
        <div className="e3-v05-titulos">
          <p className="e3-v05-mide">{`${D9.pie_figura.replace(/\.$/, '')} · lista de 500 sin filtro en validación`}</p>
          <p className="e3-conclusion">{conclusion}</p>
        </div>
        <BotonExplorar abierto={explorar} onCambio={cambiarExplorar} />
      </div>

      {explorar && (
        <PanelSimulador i={i} setI={setI} desc={desc} setDesc={setDesc} reglaRoi={reglaRoi} modeloRoi={modeloRoi} />
      )}

      <div className="e3-v05-lienzo">
        <Lienzo className="lienzo">
          {({ w, h }) => (
            <BarrasH
              datos={barras} w={w} h={h}
              formato={monto}
              formatoEje={(v) => fijo(v, 0)}
              anchoEtiqueta={Math.round(230 * k)}
              tituloEje="Dólares"
              tope={explorar ? Math.max(col('regla_usd', desc)[ULTIMA], COSTO_MODELO) : undefined}
              referencia={explorar
                ? { valor: E.costos.presupuesto_usd, etiqueta: `presupuesto ${monto(E.costos.presupuesto_usd)}` }
                : undefined}
            />
          )}
        </Lienzo>
      </div>
    </div>
  )
}

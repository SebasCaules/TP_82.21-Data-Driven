// V05 · el simulador de la tasa de éxito (Parte B 3.2 y 3.4 a 3.6; diapositiva 9 de C3), detrás de
// «Explorar» en la tarjeta del gráfico de la vista 5 (27/10, W3). Es la tarjeta del gráfico de V05 entera:
// al llegar se ve igual que antes (el costo del año 1 con modelo y con la regla sola contra el beneficio
// anual de la regla, con el presupuesto marcado) y «Explorar» suma el deslizante.
//
// Este archivo NO exporta `default`: vistas/index.jsx registra como vista todo `V*.jsx` con default, y
// sin `meta.id` este archivo caería en el id «V05» de V05_SePaga.jsx. Lo importa V05_SePaga.jsx.
//
// - Deslizante: la tasa de éxito s sobre la grilla precalculada de D3.economia.grilla (el navegador no
//   calcula: lee la fila i). Arranca en la observada (1,02 %) y va del borde inferior del IC 95 % (0,63 %)
//   a 100 %, con el tramo de 0,63 a 5 % ampliado y sombreado (la grilla cambia de paso en 5 %). Imanes y
//   ↑ ↓ en las marcas de la grilla (`notables`). Arriba, la observada con su IC y el equilibrio del
//   descuento elegido; abajo, la escala.
// - Descuento: con el de la oferta (15 %) o sin descuento; cambia la regla y el modelo (columnas `_sin`).
// - Lecturas: s, el ROI de la regla y el del modelo sobre la regla, con la fila de la grilla.
// - El gráfico: la barra del beneficio de la regla sigue a s. El eje queda fijo mientras se arrastra (el
//   tope es el beneficio con s = 100 % del descuento elegido), así las barras de costo no saltan.
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
      <b className="tabular" style={{ color: malo ? 'var(--terra)' : 'var(--ink)' }} {...sim}>{valor}</b>
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
        {/* el tramo ampliado (0,63 a 5 %) y el IC 95 % de la observada, detrás del riel */}
        <div style={{ position: 'absolute', left: 0, width: xi(QUIEBRE), top: 30, height: 16, background: 'var(--zona)' }} />
        <div style={{ position: 'absolute', left: xi(IC[0].i), width: Math.max(2, xi(IC[1].i) - xi(IC[0].i)), top: 30,
                      height: 16, background: 'var(--azul1)' }} />
        <i style={{ position: 'absolute', left: xi(QUIEBRE), top: 28, width: 1, height: 20, background: 'var(--eje)' }} />
        {/* arriba: la observada y el equilibrio del descuento elegido */}
        <i style={{ position: 'absolute', left: xi(OBS.i) - 1, top: 18, width: 2, height: 30, background: 'var(--ink)' }} />
        <span style={{ ...rot, left: xi(OBS.i) - 2, top: 0, color: 'var(--ink)', fontWeight: 600 }} data-escala="">
          {`${tasa(OBS.s)} observada; sombreado, su IC 95 %`}
        </span>
        <i style={{ position: 'absolute', left: xi(eq.i) - 1, top: 18, width: 2, height: 30, background: 'var(--terra)' }} />
        <span style={{ ...rot, right: w - xi(eq.i) - 2, top: 0, color: 'var(--terra)', fontWeight: 600 }} data-escala="">
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
  const tope = Math.round((3 * 80 + 56) * k)
  const barras = [
    { etiqueta: 'Costo del año 1, con modelo', valor: COSTO_MODELO },
    { etiqueta: 'Costo del año 1, solo la regla', valor: COSTO_REGLA },
    { etiqueta: 'Beneficio anual de la regla', valor: regla, enfasis: true, anchoMin: 3 },
  ]
  const reglaRoi = col('regla_roi_pct', desc)[i]
  const modeloRoi = col('modelo_roi_pct', desc)[i]

  return (
    <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}
         title={explorar ? `Simulación sobre la grilla de la Parte B (filas G31 a G54 del registro). ${D9.pie_figura}` : undefined}>
      {/* El rótulo sigue siendo hijo directo de la tarjeta, como en V05 antes de W3 (paridad_e3.py mide
          `.pant > .tarjeta > .kpi-lbl` en esta vista): el botón va adentro, a la derecha de la cifra. */}
      <span className="kpi-lbl frase">
        <span style={{ flex: '1 1 auto' }}>{D9.pie_figura.replace(/\.$/, '')}</span>
        <b className="tabular" {...(explorar ? sim : {})}>{`${monto(regla)} por año contra ${monto(COSTO_REGLA)}`}</b>
        <BotonExplorar abierto={explorar} onCambio={cambiarExplorar} style={{ marginLeft: 'clamp(4px, 0.6cqw, 10px)' }} />
      </span>

      {explorar && (
        <PanelSimulador i={i} setI={setI} desc={desc} setDesc={setDesc} reglaRoi={reglaRoi} modeloRoi={modeloRoi} />
      )}

      <div style={{ flex: '1 1 0', minHeight: 0, maxHeight: tope, marginTop: 'clamp(6px, 1.6cqh, 20px)',
                    display: 'flex', flexDirection: 'column' }}>
        <Lienzo className="lienzo">
          {({ w, h }) => (
            <BarrasH
              datos={barras} w={w} h={h}
              formato={monto}
              formatoEje={(v) => fijo(v, 0)}
              anchoEtiqueta={Math.round(220 * k)}
              tituloEje="Dólares"
              tope={explorar ? Math.max(col('regla_usd', desc)[ULTIMA], COSTO_MODELO) : undefined}
              referencia={{ valor: E.costos.presupuesto_usd, etiqueta: `presupuesto ${monto(E.costos.presupuesto_usd)}` }}
            />
          )}
        </Lienzo>
      </div>
    </div>
  )
}

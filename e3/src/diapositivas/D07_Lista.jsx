// Diapositiva 7: modelado, etapa 3 (C 7.1 a 7.3). (24/10) Selector del largo de la lista y del filtro:
// precisión de la regla y de la logística ajustada y cuántos aciertos más tiene la que gana
// (D3.lista.filas y D3.lista.comparaciones, validación, 3 cortes). Estado inicial: la lista que sale,
// 500 contactables. Al lado, la importancia por permutación de las variables que muestra el PPTX, con
// la leyenda de los dos colores. Una diferencia con fracción (la regla reparte los empates del último
// puesto) se muestra redondeada con «≈»; la exacta está en el registro H48.
import { useState } from 'react'
import { D3 } from '../datos_e3.js'
import { aciertos, entero, fijo, pct } from '../formato.js'
import { BotonExplorar, Opciones } from '../controles.jsx'
import { escalaNice } from '../../../src/graficos.jsx'
import { Rico } from '../texto.jsx'
import Marco, { ANCHO, M, QuienN, Y0, caja } from './Marco.jsx'

const L = D3.lista
const METODOS = [
  { id: 'regla', nombre: 'Regla del umbral', clase: 'e3-barra-acc', corto: 'la regla' },
  { id: 'logistica_ajustada', nombre: 'Logística ajustada', clase: 'e3-barra-azul3', corto: 'la logística ajustada' },
]
const listas = L.filas.filter((f) => f.tipo === 'lista')
const LARGOS = [...new Set(listas.map((f) => f.largo_mes))].sort((a, b) => a - b)
const hay = (filtro, largo) => listas.some((f) => f.filtro === filtro && f.largo_mes === largo)
const fila = (metodo, filtro, largo) => listas.find((f) => f.metodo === metodo && f.filtro === filtro && f.largo_mes === largo)
const MARCAS_PCT = escalaNice(100, 2).ticks
const IMP = L.importancia.filter((v) => v.en_diapositiva)
const ESC_IMP = escalaNice(Math.max(...IMP.map((v) => v.caida_pp)), 7)

function Comparacion({ filtro, largo }) {
  const W = 712, x0 = 222, x1 = 600
  const x = (v) => x0 + (v / 100) * (x1 - x0)
  const sim = { 'data-simulacion': '' }
  return (
    <svg width={W} height={110} className="e3-svg" role="img" aria-label="Precisión de la regla y de la logística ajustada">
      {METODOS.map((m, k) => {
        const f = fila(m.id, filtro, largo)
        const y = 22 + k * 42
        return (
          <g key={m.id}>
            <text x={x0 - 10} y={y + 7} textAnchor="end" className="e3-t e3-t-20">{m.nombre}</text>
            <rect x={x0} y={y - 15} width={x(f.precision * 100) - x0} height={30} className={m.clase} />
            <text x={x(f.precision * 100) + 8} y={y + 7} className="e3-t e3-t-20 e3-t-b" {...sim}>{pct(f.precision, 1)}</text>
          </g>
        )
      })}
      <line x1={x0} x2={x1} y1={86} y2={86} className="e3-eje" />
      {MARCAS_PCT.map((v) => (
        <text key={v} x={x(v)} y={106} textAnchor="middle" className="e3-t e3-t-17 e3-t-lbl" data-escala="">
          {v === 100 ? '100 %' : v}
        </text>
      ))}
    </svg>
  )
}

function Importancia() {
  const W = 740, x0 = 340, x1 = 690
  const x = (v) => x0 + (v / ESC_IMP.max) * (x1 - x0)
  return (
    <svg width={W} height={262} className="e3-svg" role="img" aria-label="Importancia por permutación de la logística ajustada">
      {IMP.map((v, k) => {
        const y = 22 + k * 33
        return (
          <g key={v.variable}>
            <text x={x0 - 10} y={y + 7} textAnchor="end" className="e3-t e3-t-20">{v.etiqueta}</text>
            <rect x={x0} y={y - 12} width={Math.max(2, x(v.caida_pp) - x0)} height={24}
                  className={v.de_la_regla ? 'e3-barra-acc' : 'e3-barra-gris'} />
            <text x={x(v.caida_pp) + 8} y={y + 7} className="e3-t e3-t-20">{fijo(v.caida_pp, 1)}</text>
          </g>
        )
      })}
      <g className="e3-leyenda" transform="translate(440, 134)">
        <rect x={0} y={-14} width={22} height={16} className="e3-barra-acc" />
        <text x={30} y={0} className="e3-t e3-t-19">variables de la regla</text>
        <rect x={0} y={20} width={22} height={16} className="e3-barra-gris" />
        <text x={30} y={34} className="e3-t e3-t-19">las demás</text>
      </g>
      <line x1={x0} x2={x1} y1={212} y2={212} className="e3-eje" />
      {ESC_IMP.ticks.map((v) => (
        <text key={v} x={x(v)} y={232} textAnchor="middle" className="e3-t e3-t-17 e3-t-lbl" data-escala="">{v}</text>
      ))}
      <text x={W / 2} y={256} textAnchor="middle" className="e3-t e3-t-19 e3-t-lbl">
        Puntos de precisión que se pierden al desordenar la variable
      </text>
    </svg>
  )
}

export default function Lista({ d }) {
  const [filtro, setFiltroCrudo] = useState(L.elegida.filtro)
  const [largo, setLargo] = useState(L.elegida.largo_mes)
  const [explorar, setExplorar] = useState(false)
  const cerrar = () => { setExplorar(false); setFiltroCrudo(L.elegida.filtro); setLargo(L.elegida.largo_mes) }
  const setFiltro = (f) => {
    setFiltroCrudo(f)
    if (!hay(f, largo)) setLargo(LARGOS.find((l) => hay(f, l) && l >= largo) ?? L.elegida.largo_mes)
  }
  const c = L.comparaciones.find((x) => x.filtro === filtro && x.largo_mes === largo)
  const casos = fila('regla', filtro, largo).casos
  const gana = METODOS.find((m) => m.id === c.gana)
  const elegida = filtro === L.elegida.filtro && largo === L.elegida.largo_mes
  const sim = { 'data-simulacion': '' }
  const hc = 184
  return (
    <Marco pregunta={d.pregunta} titulo={d.titulo} fuente={d.fuente} n={d.n} derecha={<QuienN quien={d.quien} n={d.n} />}>
      <div className="e3-figura e3-lista" style={caja(M, Y0, 740, 258)}>
        <BotonExplorar abierto={explorar} onCambio={(v) => (v ? setExplorar(true) : cerrar())} className="e3-explorar-esq" />
        {/* (27/10) Filtro y largo quedan para explorar: se presenta la lista que sale. */}
        {explorar && <div className="e3-lista-ctl">
          <div>
            <p className="e3-rotulo-web">Filtro</p>
            <Opciones etiqueta="Filtro de la lista" valor={filtro} onCambio={setFiltro}
                      opciones={[{ valor: 'sin_filtro', texto: 'Sin filtro' }, { valor: 'contactables', texto: 'Solo contactables' }]} />
          </div>
          <div>
            <p className="e3-rotulo-web">Largo por mes</p>
            <Opciones etiqueta="Largo de la lista por mes" valor={largo} onCambio={setLargo} escala
                      opciones={LARGOS.map((l) => ({ valor: l, texto: entero(l), deshabilitada: !hay(filtro, l) }))} />
          </div>
        </div>}
        <Comparacion filtro={filtro} largo={largo} />
        <p className="e3-lista-res">
          {c.gana === 'empate'
            ? <>Empatan: los dos aciertan lo mismo en <span {...sim}>{entero(casos)}</span> contactos</>
            : <><strong {...sim}>{aciertos(c.aciertos_de_mas)}</strong> aciertos más para {gana.corto}, en{' '}
                <span {...sim}>{entero(casos)}</span> contactos</>}
          {elegida && <span className="e3-etiqueta">la lista que sale</span>}
        </p>
      </div>
      <figure className="e3-figura" style={caja(M, 506, 740, 262)}>
        <Importancia />
      </figure>
      <p className="e3-pie-figura" style={caja(M, 776, 740)}><Rico t={d.pie_figura} /></p>
      <div className="e3-llamadas" style={caja(M + 780, Y0, ANCHO - 780)}>
        {d.callouts.map((x) => (
          <div key={x.titulo} className="e3-llamada" style={{ height: hc }}>
            <p className="e3-llamada-titulo"><Rico t={x.titulo} /></p>
            <p className="e3-llamada-texto"><Rico t={x.texto} /></p>
          </div>
        ))}
      </div>
    </Marco>
  )
}

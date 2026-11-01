// A2 · ¿Dónde se corta la lista? (Parte C 7.2; anexo A2 de C3). Respaldo: se abre si preguntan por qué
// 500 y no 700 u 800 (guion, «Anexos de respaldo»).
//
// - Frase: la lista que sale y su precisión (la fila marcada de C3, la regla con 500 contactables).
// - Pieza: la tabla del anexo, cada forma de cortar la lista en los cortes de validación con su precisión,
//   su recall, su valor por año y si se puede mandar.
// - Explorar (cerrado al llegar): el filtro y el largo que la diapositiva 7 dejaba mover, en un renglón
//   debajo de la frase. La tabla se reemplaza por la precisión de la regla y de la logística ajustada para
//   ese largo y ese filtro, con la práctica actual en gris como piso, y la frase dice cuántos aciertos más
//   tiene la que gana entre la regla y la logística (D3.lista.filas y D3.lista.comparaciones, H11, H12,
//   H15, H16 y H48). Sin filtro la lista arranca en 500 (no hay corridas más cortas): esos largos se ven
//   deshabilitados. «Cerrar» vuelve a la tabla y a la lista que sale.
// - (Crítica del W3, hallazgo 6) Las filas de C3 que no nombran el método son de la logística ajustada:
//   la celda lo dice («Logística, …»). «Lugares» y no «contactos»: la lista sin filtro incluye 483 que no
//   se pueden contactar.
// Ninguna cifra escrita acá: la tabla es la de C3 y lo que se explora sale de D3, sin restas en el
// navegador (la diferencia de aciertos viene calculada en build_e3.py).

import { useState } from 'react'
import { BarrasH } from '../../../src/graficos.jsx'
import { C3 } from '../contenido_e3.js'
import { D3 } from '../datos_e3.js'
import { NBSP, aciertos, entero, pct } from '../formato.js'
import { plano } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { BotonExplorar, Opciones } from '../controles.jsx'
import { TablaSvg, TarjetaRespaldo, columnasDeAnexo, filasDeAnexo } from '../Respaldo.jsx'

const A = C3.ANEXOS.find((a) => a.n === 'A2')
const L = D3.lista
const COL = Object.fromEntries(A.columnas.map((c, j) => [c, j]))
const SALE = A.filas[A.destacar[0]]
// La celda del umbral nombra el método cuando C3 no lo nombra (esas filas son de la logística ajustada).
const conMetodo = (c) => (/^(Regla|Práctica)/.test(c) ? c : `Logística, ${c.charAt(0).toLowerCase()}${c.slice(1)}`)
const FILAS_TABLA = filasDeAnexo(A).map((f) => ({
  ...f, celdas: f.celdas.map((c, j) => (j === COL.Umbral ? conMetodo(c) : c)),
}))

// La regla y la logística ajustada, las dos que se comparan; la práctica actual, en gris, como piso.
const METODOS = [
  { id: 'regla', nombre: 'Regla del umbral', corto: 'la regla', enfasis: true },
  { id: 'logistica_ajustada', nombre: 'Logística ajustada', corto: 'la logística' },
  { id: 'practica_actual', nombre: 'Práctica actual', corto: 'la práctica actual' },
]
const FILTROS = [
  { valor: 'sin_filtro', texto: 'Sin filtro', frase: 'sin filtro' },
  { valor: 'contactables', texto: 'Solo contactables', frase: 'solo contactables' },
]
const listas = L.filas.filter((f) => f.tipo === 'lista')
const LARGOS = [...new Set(listas.map((f) => f.largo_mes))].sort((a, b) => a - b)
const hay = (filtro, largo) => listas.some((f) => f.filtro === filtro && f.largo_mes === largo)
const filaDe = (metodo, filtro, largo) =>
  listas.find((f) => f.metodo === metodo && f.filtro === filtro && f.largo_mes === largo)

export const meta = { id: 'A2' }

export default function RA2Umbrales() {
  const k = useEscalaTexto()
  const [explorar, setExplorar] = useState(false)
  const [filtro, setFiltroCrudo] = useState(L.elegida.filtro)
  const [largo, setLargo] = useState(L.elegida.largo_mes)
  const setFiltro = (f) => {
    setFiltroCrudo(f)
    if (!hay(f, largo)) setLargo(LARGOS.find((l) => hay(f, l) && l >= largo) ?? L.elegida.largo_mes)
  }
  const cambiarExplorar = (v) => {
    setExplorar(v)
    if (!v) { setFiltroCrudo(L.elegida.filtro); setLargo(L.elegida.largo_mes) }
  }

  const c = L.comparaciones.find((x) => x.filtro === filtro && x.largo_mes === largo)
  const casos = filaDe('regla', filtro, largo)?.casos
  const gana = METODOS.find((m) => m.id === c?.gana)
  const nombreFiltro = FILTROS.find((f) => f.valor === filtro).frase
  const resultado = !c ? '' : c.gana === 'empate' ? 'empatan'
    : `${aciertos(c.aciertos_de_mas)}${NBSP}aciertos más para ${gana.corto}`

  const opciones = explorar ? [
    { rotulo: 'Filtro', control: <Opciones etiqueta="Filtro de la lista" valor={filtro} onCambio={setFiltro} opciones={FILTROS} /> },
    { rotulo: 'Largo por mes', control: (
      <Opciones etiqueta="Largo de la lista por mes" valor={largo} onCambio={setLargo} escala
                opciones={LARGOS.map((l) => ({ valor: l, texto: entero(l), deshabilitada: !hay(filtro, l) }))} />
    ) },
  ] : null

  return (
    <TarjetaRespaldo
      clase="ra2"
      frase={explorar
        ? `Lista de ${entero(largo)} por mes, ${nombreFiltro}, en los ${L.validacion.cortes} cortes de validación`
        : `Cada forma de cortar la lista, en los ${L.validacion.cortes} cortes de validación`}
      cifra={explorar ? `${resultado}, en ${entero(casos)} lugares` : `la que sale: ${SALE[COL['Precisión']]}`}
      title={`${plano(A.titulo)}. Fuente: ${A.fuente} · registro ${A.ids.join(', ')}` +
        (explorar ? '; la diferencia de aciertos, H48' : '')}
      controles={<BotonExplorar abierto={explorar} onCambio={cambiarExplorar} />}
      opciones={opciones}
      dibujo={({ w, h }) => (explorar
        ? (
          <BarrasH
            datos={METODOS.map((m) => ({ etiqueta: m.nombre, valor: filaDe(m.id, filtro, largo).precision, enfasis: m.enfasis }))}
            w={w} h={Math.min(h, Math.round((METODOS.length * 72 + 56) * k))}
            formato={(v) => pct(v, 1)}
            formatoEje={(v) => pct(v, 0)}
            anchoEtiqueta={Math.round(200 * k)}
            tituloEje="Precisión de la lista"
            tope={1}
          />
        )
        : <TablaSvg w={w} h={h} k={k} columnas={columnasDeAnexo(A)} filas={FILAS_TABLA} etiqueta={plano(A.titulo)} />
      )}
    />
  )
}

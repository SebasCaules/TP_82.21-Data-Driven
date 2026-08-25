// Test de paridad Python/JS.
//
// Compara la agregacion que corre en el navegador (src/agregacion.js) contra los
// golden files que genera Python desde client_facts (pipeline/golden.py). Si hay
// una sola diferencia en un conteo, no se publica.
//
//   python3 pipeline/build.py && python3 pipeline/golden.py && node test/paridad.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const AQUI = dirname(fileURLToPath(import.meta.url))
const { agregar, decodificar } = await import('../src/agregacion.js')
const { D } = await import('../src/datos.js')

const golden = JSON.parse(readFileSync(join(AQUI, 'golden.json'), 'utf8'))
const CAMPOS = golden.campos

if (golden.cortes.length !== D.cortes.length) {
  console.error(`cortes distintos: golden ${golden.cortes.length}, payload ${D.cortes.length}`)
  process.exit(1)
}

let ok = 0
let total = 0
let tolerados = 0
const fallos = []

for (let i = 0; i < golden.cortes.length; i++) {
  if (golden.cortes[i] !== D.cortes[i]) {
    fallos.push(`corte ${i}: golden ${golden.cortes[i]} vs payload ${D.cortes[i]}`)
    continue
  }
  const filas = golden.por_corte[i]
  const nCeldas = D.contingencias[i].k.length

  for (let j = 0; j < golden.combos.length; j++) {
    const [r, c, s, q] = golden.combos[j]
    const got = agregar(i, { region: r, categoria: c, rfm: s, quintil: q })
    for (let k = 0; k < CAMPOS.length; k++) {
      const campo = CAMPOS[k]
      const esperado = filas[j][k]
      const real = got[campo]
      total++
      if (real === esperado) {
        ok++
      } else if (
        // En dinero, la diferencia admisible es a lo sumo 1 peso por celda sumada:
        // Python redondea el total de cada celda y aca se suman celdas ya redondeadas.
        // Los conteos (n, nr, ne) tienen que dar exactos, sin tolerancia.
        ['f', 'fr', 'a', 'ar'].includes(campo) && Math.abs(real - esperado) <= nCeldas
      ) {
        ok++
        tolerados++
      } else {
        fallos.push(
          `corte ${golden.cortes[i]} combo [${r},${c},${s},${q}] campo ${campo}: ` +
          `esperado ${esperado}, JS ${real}`
        )
      }
    }
  }
}

// Chequeo aparte: decodificar(k) tiene que ser la inversa exacta del empaquetado
// que hace features.contingency(). Un error aca corrompe TODA cifra de pantalla.
let decOk = 0
for (let reg = 0; reg < D.dims.region.length; reg++) {
  for (let cat = 0; cat < 7; cat++) {
    for (let rfm = 0; rfm < 7; rfm++) {
      for (let q = 0; q < 5; q++) {
        const k = ((reg * 7 + cat) * 7 + rfm) * 5 + q
        const d = decodificar(k)
        total++
        if (d.reg === reg && d.cat === cat && d.rfm === rfm && d.q === q) { ok++; decOk++ }
        else fallos.push(`decodificar(${k}) dio ${JSON.stringify(d)}`)
      }
    }
  }
}

console.log(`combinaciones: ${golden.combos.length} x ${golden.cortes.length} cortes`)
console.log(`decodificacion de clave: ${decOk}/${D.dims.region.length * 7 * 7 * 5}`)
console.log(`\n${ok}/${total} chequeos de paridad coinciden`)
if (tolerados) {
  console.log(`(${tolerados} campos de dinero dentro de la tolerancia de redondeo por celda; ` +
              `los conteos son exactos)`)
}
if (fallos.length) {
  console.error(`\n${fallos.length} fallos, primeros 10:`)
  fallos.slice(0, 10).forEach((f) => console.error('  ' + f))
  process.exit(1)
}

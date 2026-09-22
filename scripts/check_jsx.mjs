// Chequeo de sintaxis de .jsx con el transformador de vite (oxc): node scripts/check_jsx.mjs <archivo…>
import { readFileSync } from 'node:fs'
import * as vite from 'vite'
const tf = vite.transformWithOxc || vite.transformWithEsbuild
let mal = 0
for (const f of process.argv.slice(2)) {
  try { await tf(readFileSync(f, 'utf8'), f); console.log('OK   ', f) }
  catch (e) { mal++; console.log('ERROR', f, '\n', (e.message || String(e)).split('\n').slice(0, 8).join('\n')) }
}
process.exit(mal ? 1 : 0)

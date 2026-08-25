import { createRoot } from 'react-dom/client'
import { D } from './datos.js'
const n = D.contingencias.reduce((s, c) => s + c.k.length, 0)
createRoot(document.getElementById('root')).render(
  <p id="probe">cortes={D.cortes.length} celdas={n} listas={D.listas.length}</p>)

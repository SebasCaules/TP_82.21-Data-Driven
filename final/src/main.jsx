import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// (17/11) Las hojas del E1, del E2 y del E3 tal cual (vite.final.config.js las mide contra la ventana lógica, como en
// /e3/), y después la propia, que no redefine ninguna clase del armazón.
import '../../src/estilos.css'
import '../../e2/src/estilos_e2.css'
import '../../e3/src/estilos_e3.css'
import './estilos_final.css'
import '../../src/fit.js'

createRoot(document.getElementById('root')).render(<App />)

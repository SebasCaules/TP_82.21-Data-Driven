import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// (27/10, W1) Las hojas del E1 y del E2, tal cual (vite.e3.config.js solo las mide contra la ventana
// lógica), y después la propia, que no redefine ninguna clase del armazón.
import '../../src/estilos.css'
import '../../e2/src/estilos_e2.css'
import './estilos_e3.css'
import '../../src/fit.js'

createRoot(document.getElementById('root')).render(<App />)

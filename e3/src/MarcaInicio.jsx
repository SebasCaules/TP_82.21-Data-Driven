// La marca «Casa Óga» del pie lleva a la landing, como en el E1 y el E2 (src/MarcaInicio.jsx).
//
// (24/10) Copia de la misma regla para /e3/ y no un cambio en src/MarcaInicio.jsx: aquel entra en
// los bundles del E1 y del E2, y tocar su expresión cambiaría los bytes de dist/ y dist-e2/.
// Solo es enlace cuando la página se sirve por http(s) en /e3/; abierta con doble clic (file://)
// o en «npm run dev:e3» no hay landing al lado y la marca queda como texto.
export default function MarcaInicio({ children }) {
  const enlace = /^https?:$/.test(location.protocol) && /\/e3\/(index\.html)?$/.test(location.pathname)
  if (!enlace) return <span className="e3-marca">{children}</span>
  return (
    <a className="e3-marca e3-marca-enlace" href="../" title="Volver a los tableros"
       aria-label="Casa Óga: volver a la página de tableros">
      {children}
    </a>
  )
}

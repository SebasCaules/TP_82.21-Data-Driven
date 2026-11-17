// La marca «Casa Óga» del riel lleva a la landing de tableros, como en el E1, el E2 y el E3.
//
// (17/11) Es e3/src/MarcaInicio.jsx con la ruta de /final/. No se importa aquel porque su expresión dice /e3/, y tocarla
// cambiaría los bytes de dist-e3/. En file:// (doble clic) o en «npm run dev:final» no hay landing al lado y la marca
// queda como texto.
export default function MarcaInicio({ children }) {
  const enlace = /^https?:$/.test(location.protocol) && /\/final\/(index\.html)?$/.test(location.pathname)
  if (!enlace) return <div className="lat-nombre">{children}</div>
  return (
    <a className="lat-nombre lat-inicio" href="../" title="Volver a los tableros"
       aria-label="Casa Óga: volver a la página de tableros">
      {children}
    </a>
  )
}

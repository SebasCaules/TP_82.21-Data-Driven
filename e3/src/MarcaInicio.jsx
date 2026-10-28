// La marca «Casa Óga» del riel lleva a la landing de tableros, como en el E1 y el E2.
//
// (27/10, W1) Es src/MarcaInicio.jsx con las mismas clases (.lat-nombre, .lat-inicio) y la misma salida;
// cambia solo la ruta en la que es enlace (/e3/). No se importa aquel porque su expresión dice /e[12]/ y
// tocarla cambiaría los bytes de dist/ y dist-e2/. En file:// (doble clic) o en «npm run dev:e3» no hay
// landing al lado y la marca queda como texto.
export default function MarcaInicio({ children }) {
  const enlace = /^https?:$/.test(location.protocol) && /\/e3\/(index\.html)?$/.test(location.pathname)
  if (!enlace) return <div className="lat-nombre">{children}</div>
  return (
    <a className="lat-nombre lat-inicio" href="../" title="Volver a los tableros"
       aria-label="Casa Óga: volver a la página de tableros">
      {children}
    </a>
  )
}

// La marca «Casa Óga» del riel es el enlace a la landing de tableros. Relativo ("../")
// porque GitHub Pages sirve el sitio bajo /TP_82.21-Data-Driven/, no en la raíz del dominio:
// un href absoluto ("/") llevaría al dominio entero, no al sitio. Solo es enlace cuando la
// página se sirve por http(s) en /e1/ o /e2/; en file:// (el HTML que se entrega por doble
// clic no tiene landing al lado) y en "npm run dev" (el tablero se sirve en "/") la marca
// queda como texto, igual que antes.
export default function MarcaInicio({ children }) {
  const enlace = /^https?:$/.test(location.protocol) &&
    /\/e[12]\/(index\.html)?$/.test(location.pathname)
  if (!enlace) return <div className="lat-nombre">{children}</div>
  return (
    <a className="lat-nombre lat-inicio" href="../" title="Volver a los tableros"
       aria-label="Casa Óga: volver a la página de tableros">
      {children}
    </a>
  )
}

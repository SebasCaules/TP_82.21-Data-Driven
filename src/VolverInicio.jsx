// Enlace de vuelta a la landing de tableros. Relativo ("../") porque GitHub Pages sirve el
// sitio bajo /TP_82.21-Data-Driven/, no en la raíz del dominio: un href absoluto ("/")
// llevaría al dominio entero, no al sitio. Se oculta en file:// (el HTML que se entrega por
// doble clic no tiene landing al lado) y en "npm run dev" (ahí el tablero se sirve en "/",
// sin el prefijo /e1/ o /e2/ de Pages).
export default function VolverInicio() {
  const visible = /^https?:$/.test(location.protocol) &&
    /\/e[12]\/(index\.html)?$/.test(location.pathname)
  if (!visible) return null
  return (
    <a className="lat-volver" href="../" aria-label="Volver a la página de tableros">
      ← Tableros
    </a>
  )
}

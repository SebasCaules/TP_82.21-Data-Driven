// Vista sin archivo todavía (27/10, W1): el riel y el encabezado ya la muestran con su pregunta; el
// cuerpo queda vacío hasta que W2 o W3 crean su `Vnn_*.jsx` o `An_*.jsx`. Un solo marco punteado, sin
// cifras ni texto de contenido.

export default function Esqueleto({ vista }) {
  return (
    <section className="pant e3-esqueleto" aria-label={`Vista ${vista?.id ?? ''} sin contenido`}>
      <div className="e3-esqueleto-caja">
        <span>{vista?.respaldo ? `Anexo ${vista.id}` : `Vista ${(vista?.id ?? '').slice(1).replace(/^0/, '')}`} · se arma en la etapa siguiente</span>
      </div>
    </section>
  )
}

// BAN — widget congelado F07 (decision D11, tras tres rondas de descarte sobre 48
// variantes). Los tokens salen tal cual de la ficha: franja superior neutra, etiqueta en
// versalitas, valor de 38 px con tabular-nums, barra de proporcion de 24 px con marca
// vertical del corte anterior y escala en los extremos, tres filas de apoyo con separador
// punteado, y un solo color de enfasis (#b8433a, solo la barra).
//
// Lo unico que cambia respecto de la ficha es lo que la propia ficha declara que cambia:
// "el corte anterior es el mes previo al seleccionado, no una constante".

import { entero, fechaCorta, millones, pct } from './agregacion.js'

export default function Ban({ info, grande = false }) {
  const relleno = info.baseAnualizada ? (100 * info.exposicion) / info.baseAnualizada : 0
  const marca = info.exposicionPrevia != null && info.baseAnualizada
    ? (100 * info.exposicionPrevia) / info.baseAnualizada
    : null

  return (
    <div className="ban" style={grande ? { '--val': 'clamp(38px, 4.2vw, 62px)' } : undefined}>
      <div className="ban-lbl">Exposición anual en riesgo</div>
      <div className="ban-val tabular">ARS {millones(info.exposicion)}</div>
      <div className="ban-sub">exposición, no recupero</div>

      <div className="ban-track">
        <i style={{ width: `${Math.min(100, relleno)}%` }} />
        {marca != null && (
          <span className="ban-mk" style={{ left: `${Math.min(100, marca)}%` }} aria-hidden="true" />
        )}
        <span className="ban-sc" style={{ left: 0 }}>0</span>
        <span className="ban-sc" style={{ right: 0 }}>
          {millones(info.baseAnualizada)}{grande ? ' anualizados' : ''}
        </span>
      </div>
      <div className="ban-scrow" />

      <table>
        <tbody>
          <tr>
            <td>{grande ? 'Participación sobre la base anualizada' : 'Participación'}</td>
            <td className="tabular">{pct(relleno)}</td>
          </tr>
          <tr>
            <td>Clientes en riesgo</td>
            <td className="tabular">{entero(info.enRiesgo)} / {entero(info.clientes)}</td>
          </tr>
          <tr>
            <td>Fecha de corte</td>
            <td className="tabular">{fechaCorta(info.corte)}</td>
          </tr>
        </tbody>
      </table>

      <div className="ban-note">
        {marca != null
          ? `La marca vertical es el corte anterior: ARS ${millones(info.exposicionPrevia)} al ${fechaCorta(info.cortePrevio)}.`
          : 'Primer corte de la serie: no hay corte anterior con el que comparar.'}
        {info.historiaCorta > 0 && (
          <> {info.historiaCorta === 1 ? 'Un cliente aporta' : `${entero(info.historiaCorta)} clientes aportan`}
            {' '}gasto anualizado con menos de un año de historia, que infla la base;
            sin ellos la base es ARS {millones(info.baseAnualizada1a)}.</>
        )}
      </div>
    </div>
  )
}

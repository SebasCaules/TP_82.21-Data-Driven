import { BarraMini } from 'tablero-casa-oga'

const millones = (v: number) => `ARS ${(v / 1e6).toFixed(1).replace('.', ',')} M`

/** Una parte sobre un total, en acento: los 800 clientes de mayor exposicion
 *  concentran esta fraccion de los ARS 94,9 M en riesgo. */
export const Enfasis = () => (
  <BarraMini parte={49470831} total={94925989} w={320} h={86}
             alturaBarra={60} rotulo="52,1 %"
             pie={`de ${millones(94925989)} en riesgo`} />
)

/** La misma forma en excepcion: el terracota no dice "aca mira", dice que ese tramo no se
 *  puede ejecutar. Son los envios que salen sin consentimiento del cliente. */
export const Excepcion = () => (
  <BarraMini parte={7078} total={23529} w={320} h={86}
             alturaBarra={60} excepcion rotulo="30,1 %"
             pie="de 23.529 envios" />
)

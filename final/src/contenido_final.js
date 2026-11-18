// Textos de /final/, la presentación final (24/11/2026, 15:20; 23 minutos de exposición y 6 de preguntas). El orden, los
// bloques, quién presenta y los tiempos salen del canon de la presentación (.workforce/presentacion-final/fase-2/canon.json,
// presentacion.bloques): apertura, datos, modelo, economía, legal, gestión y cierre.
//
// Las cifras no se escriben acá: salen de DF (final/src/datos_final.js, que escribe pipeline/build_final.py desde los JSON
// del vault, con un ancla por id del registro del E4) y se escriben con e3/src/formato.js. Por eso este archivo importa DF:
// las preguntas y los rótulos que nombran una cifra la interpolan. Ninguna vista escribe texto en su JSX.
//
// Las notas del orador (tecla N) no están acá: salen del guion (canon v1.3, tableros.notas_v1_3) a notas_final.js, que
// escribe exportar_notas.py del guion y lee Notas.jsx.
//
// Forma (la lee final/src/vistas/index.jsx, y scripts/verificar_final.py con node):
//   BLOQUES, en el orden de la presentación: { id, titulo, riel?, integrante, vistas: [...] }
//     - titulo: el nombre del bloque en las notas; riel: el rótulo corto del grupo en el riel (si falta, el titulo).
//     - integrante: quien presenta las vistas del bloque (el nombre corto del canon).
//   Cada vista: { id, titulo, pregunta, fuente?, segundos, textos: {...} }
//     - titulo: el rótulo del riel. pregunta: el h1, la conclusión de la vista en un renglón de hasta 74 caracteres.
//     - segundos: el tiempo de la vista; suman el objetivo de cada bloque del canon.
//     - textos: rótulo y fragmento de cada tarjeta de la banda, qué mide, la conclusión (texto y, en `sigue`, lo que va
//       después de cada cifra en negrita), los rótulos del gráfico y la decisión.
//   TIEMPOS.objetivo_s: el tiempo de exposición del canon; el verificador falla si la suma de las vistas lo pasa.

import { DF } from './datos_final.js'
import { NBSP, fijo, pct, pctDirecto, usd, ars } from '../../e3/src/formato.js'

const A = DF.anclas
const T = DF.tablas
const v = (id) => A[id].valor
const CAL = T.calendario
const LM = T.lista_muestra
const VENTAS = T.ventas_2025
const SEM_FIN = v('G63.semana_decision')
const SEM_LISTA = CAL.primera_lista.semana
const SEM_PRE = CAL.preliminar.semana
const legal = (id) => T.legal.find((x) => x.id === id).puntaje
const cond = (id) => T.condiciones.find((x) => x.id === id).puntaje
const sobre = (n, de) => `${fijo(n)}[[/${fijo(de)}]]`
const unidad = (n, u) => `${n}[[${NBSP}${u}]]`
const TRAMOS = T.tramos_de_cruce
const PREVIA = Object.fromEntries(T.legal_previas.acciones.map((x) => [x.codigo, x.semana]))
const SEM_ACUERDO = T.plan.hitos.find((h) => h.n === 1).semana
const FIN_PREVIAS = Math.max(...T.plan.fases.filter((f) => f.hasta < SEM_LISTA).map((f) => f.hasta))
/** Los tramos de días que faltan donde se puede cruzar: a 90 días o más el cruce es cero por definición (A 2.1). */
const TRAMOS_UTILES = TRAMOS.filter((t) => t.positivos > 0)
const LEJOS = TRAMOS_UTILES[TRAMOS_UTILES.length - 1]
const HORIZONTE = fijo(v('F04.horizonte'))
/** «menos de 1»: build_final.py controla que G62.tasa_observada esté entre 0 y 1. */
const MENOS_DE = Math.ceil(v('G62.tasa_observada'))

export const CF = {
  MUESTRA: false,
  VERSION: 'final-1.0',
  TITULO: 'Casa Óga · Presentación final',
  SUBTITULO: 'presentación final',
  TIEMPOS: { objetivo_s: 1380 },
  BLOQUES: [
    // ------------------------------------------------------------------ apertura · Tomas F. · 1:30
    {
      id: 'apertura',
      titulo: 'Apertura',
      integrante: 'Tomas F.',
      vistas: [
        {
          id: 'V01',
          titulo: 'La recomendación',
          pregunta: 'Recomendamos un piloto, no el proyecto',
          fuente: 'E3, Parte D v3.0',
          segundos: 90,
          textos: {
            piloto: { rotulo: 'Piloto mínimo', linea: 'tres listas con control' },
            umbral: { rotulo: 'Umbral de pase', linea: 'lo observado da menos de uno', unidad: 'puntos' },
            semana: { rotulo: 'Se decide', linea: 'desde la aprobación', antes: 'semana' },
            mide: 'Lo que deja la lista contra lo que cuesta',
            conclusion: 'Recomendamos un piloto mínimo, tres listas mensuales con grupo de control, por',
            sigue: [' del presupuesto, para medir si contactar retiene lo suficiente para pagar la lista. La decisión llega en la semana ', '.'],
            barras: {
              deja: 'Deja la lista, por año',
              piloto: 'Piloto mínimo',
              cuesta: 'Proyecto entero, primer año',
              eje: 'Dólares',
            },
            decision: {
              area: 'Veredicto',
              estado: 'no viable',
              corta: 'No viable como proyecto.',
              larga: 'No viable como proyecto. Recomendamos un piloto mínimo, tres listas mensuales con grupo de control, '
                + `por ${usd(v('G64'))} del presupuesto, para medir si contactar retiene lo suficiente para pagar la lista. La decisión llega en la `
                + `semana ${fijo(SEM_FIN)}. Casa Óga pone además las acciones de retención (${ars(v('G49.acciones'))}, que `
                + `paga Marketing) y ${fijo(v('G64.horas_marketing'))} horas de una persona de Marketing.`,
            },
          },
        },
      ],
    },
    // ------------------------------------------------------------------ datos · Matías S. · 4:15
    {
      id: 'datos',
      titulo: 'Datos y calidad',
      riel: '1 · Datos',
      integrante: 'Matías S.',
      vistas: [
        {
          id: 'V02',
          titulo: 'Qué ventas entran',
          pregunta: 'Alcanzan las ventas que tienen cliente',
          fuente: 'E3, Parte A v3.0 y Anexo 1',
          segundos: 130,
          textos: {
            sin_cliente: { rotulo: 'Ventas sin cliente', linea: 'no entran a la lista' },
            datos: { rotulo: 'Datos suficientes', linea: 'condición técnica del proyecto' },
            calidad: { rotulo: 'Calidad', linea: 'utilizable, se corrige antes' },
            mide: 'Filas del extracto de ventas, paso a paso',
            conclusion: 'La PoC usó',
            sigue: [' ventas con cliente y monto positivo; en el piloto la devuelta cuenta como actividad.'],
            barras: {
              crudo: 'Filas del extracto',
              unicas: 'Sin repetidas',
              con_cliente: 'Con cliente',
              positivas: 'Con monto positivo',
              nota_repetidas: `salen ${fijo(v('C20.repetidas'))} repetidas`,
              nota_sin_cliente: `salen ${fijo(v('C20.sin_cliente'))} sin cliente`,
              nota_no_positivas: `salen ${fijo(v('C20.no_positivas'))} devoluciones`,
              eje: 'Filas de ventas',
            },
            decision: {
              area: 'Datos',
              estado: 'alcanzan',
              corta: 'La lista usa solo las ventas con cliente',
              larga: `Las ventas sin cliente (${pct(v('C19') / 100)}) no se imputan: quedan fuera de la lista y se declaran.`,
            },
          },
        },
        {
          id: 'V03',
          titulo: 'Qué meses entran',
          pregunta: 'Septiembre a diciembre llegaron incompletos',
          fuente: 'E3, Parte A v3.0',
          segundos: 125,
          textos: {
            fuera: { rotulo: 'Meses que no se usan', linea: 'debajo del control mensual' },
            control: { rotulo: 'Control del mes', linea: 'contra el año anterior' },
            mide: `Operaciones de cada mes de ${VENTAS.anio} sobre el mismo mes de ${VENTAS.anio_anterior}`,
            conclusion: 'Desde septiembre cada mes queda debajo del',
            sigue: [': la lista de muestra se arma al corte de agosto.'],
            barras: {
              control: 'control',
              eje: `Parte de las operaciones de ${VENTAS.anio_anterior}`,
            },
            decision: {
              area: 'Calidad',
              estado: 'corregida',
              corta: 'Solo entran los meses completos',
              larga: `Un mes con menos del ${pct(VENTAS.umbral, 0)} de las operaciones del mismo mes del año anterior no `
                + 'se usa.',
            },
          },
        },
      ],
    },
    // ------------------------------------------------------------------ modelo · Francisco C. · 4:15
    {
      id: 'modelo',
      titulo: 'Regla contra modelo y diseño del piloto',
      riel: '2 · Regla y piloto',
      integrante: 'Francisco C.',
      vistas: [
        {
          id: 'V04',
          titulo: 'Qué es irse',
          pregunta: 'La regla ordena por cercanía al umbral',
          fuente: 'E3, Parte A v3.0',
          segundos: 85,
          textos: {
            minimo: { rotulo: 'Umbral mínimo', linea: 'piso para cualquier cliente', unidad: 'días' },
            factor: { rotulo: 'O su ritmo', linea: 'su intervalo entre compras', unidad: 'veces' },
            mide: `Cruzan su umbral en ${HORIZONTE} días, en validación, por días que faltan`,
            conclusion: 'Los más cerca de su umbral lo cruzan el',
            sigue: [' de las veces: la regla ordena por esa distancia.'],
            barras: { dias: 'días', eje: 'Cruzan su umbral' },
            decision: {
              area: 'Target',
              estado: 'definido',
              corta: 'Cada cliente tiene su propio umbral',
              larga: `El umbral del cliente: el mayor entre ${fijo(v('C03.minimo_dias'))} días y `
                + `${fijo(v('C03.factor'), 1)} veces su intervalo mediano entre compras.`,
            },
          },
        },
        {
          id: 'V05',
          titulo: 'Regla contra modelo',
          pregunta: 'La regla acierta lo mismo que el modelo',
          fuente: 'E3, Parte D v3.0',
          segundos: 85,
          textos: {
            regla: { rotulo: 'Acierta la regla', linea: 'de cada lista, prueba final' },
            dif: { rotulo: 'Diferencia', linea: 'puntos, modelo menos regla' },
            hoy: { rotulo: 'Práctica actual', linea: 'lo que acierta hoy' },
            mide: 'Precisión de la lista mensual en la prueba final',
            conclusion: 'El modelo queda',
            sigue: [' puntos debajo, con un intervalo que cruza el cero: queda la regla, sin entrenar nada.'],
            barras: {
              regla: 'Regla del umbral',
              modelo: 'Modelo',
              hoy: 'Práctica actual',
              eje: 'Precisión de la lista',
            },
            decision: {
              area: 'Modelo',
              estado: 'queda la regla',
              corta: 'Se usa la regla; el modelo no suma',
              larga: `Modelo menos regla en test: ${fijo(v('J09'), 2)} puntos, intervalo de ${fijo(v('J09.ic_inferior'), 2)} `
                + `a ${fijo(v('J09.ic_superior'), 2)}.`,
            },
          },
        },
        {
          id: 'V06',
          titulo: 'Cómo se mide',
          pregunta: `Cada mes, ${fijo(v('G49.control_mes'))} de control y dos ramas`,
          fuente: 'E3, Parte D v3.0',
          segundos: 85,
          textos: {
            control: { rotulo: 'Control por mes', linea: 'no se contactan, al azar' },
            lista: { rotulo: 'Lista por mes', linea: 'contactables más cerca de irse' },
            meses: { rotulo: 'Listas del piloto', linea: 'una por mes' },
            mide: 'Clientes por grupo, lista al corte de agosto',
            conclusion: 'Fuera del',
            sigue: [' de mayor facturación, cada mes se sortean el control y dos ramas: con descuento y sin descuento.'],
            barras: {
              alto: 'Mayor facturación',
              control: 'Control, no se contacta',
              con: `Rama con ${pct(v('G49.descuento'), 0)} de descuento`,
              sin: 'Rama sin descuento',
              nota_alto: 'se contacta entero',
              eje: 'Clientes de la lista, por grupo',
            },
            decision: {
              area: 'Piloto',
              estado: 'diseñado',
              corta: 'Control al azar y dos ramas cada mes',
              larga: `${fijo(v('G49.control_mes'))} de control por mes, sorteados fuera del ${pct(v('G49.alto_valor'), 0)} `
                + 'de mayor facturación; el resto, en dos ramas iguales.',
            },
          },
        },
      ],
    },
    // ------------------------------------------------------------------ economía · Juan Manuel R. · 4:15
    {
      id: 'economia',
      titulo: 'Economía y medición del piloto',
      riel: '3 · Economía',
      integrante: 'Juan Manuel R.',
      vistas: [
        {
          id: 'V07',
          titulo: 'No se paga',
          pregunta: `La lista no se paga: deja ${usd(v('G54'))} por año`,
          fuente: 'E3, Parte B v3.0',
          segundos: 85,
          textos: {
            roi: { rotulo: 'ROI de la regla', linea: 'piloto y producción, un año' },
            roi_modelo: { rotulo: 'ROI del modelo', linea: 'lo que agrega, un año' },
            mide: 'Costo del primer año contra lo que deja la lista por año',
            conclusion: 'La lista deja',
            sigue: [' por año: el costo no se recupera, ni con modelo.'],
            barras: {
              costo_modelo: 'Primer año, con modelo',
              costo_regla: 'Primer año, con la regla',
              deja: 'Deja la lista, por año',
              eje: 'Dólares',
            },
            decision: {
              area: 'Económica',
              estado: 'no viable',
              corta: 'No viable como proyecto.',
              larga: `ROI a un año: ${pctDirecto(v('G54.roi'), 1)} con la regla (piloto mínimo más producción completa) y `
                + `${pctDirecto(v('G40.roi'), 1)} lo que agrega el modelo.`,
            },
          },
        },
        {
          id: 'V08',
          titulo: 'Qué cuesta el piloto',
          pregunta: `El piloto mínimo cuesta ${usd(v('G64'))}`,
          fuente: 'E3, Parte B v3.0',
          segundos: 85,
          textos: {
            piloto: { rotulo: 'Piloto mínimo', linea: 'con contingencia, tres meses' },
            horas: { rotulo: 'Marketing pone', linea: 'de quien corre la planilla', unidad: 'horas' },
            mide: 'Costo del piloto mínimo por línea, en dólares',
            conclusion: 'Son',
            sigue: [' horas del equipo; la línea más cara es la medición, que es para lo que se hace el piloto.'],
            barras: {
              planilla: 'Planilla y guía de corrida',
              legal: 'Adecuación legal',
              medicion: 'Sorteo, medición e informes',
              taller: 'Taller con Marketing',
              contingencia: 'Contingencia',
              eje: 'Dólares',
            },
            decision: {
              area: 'Piloto',
              estado: 'recomendado',
              corta: 'Tres listas con control, pagadas del presupuesto',
              larga: `Piloto mínimo: ${usd(v('G64'))} del presupuesto y ${fijo(v('G64.horas_marketing'))} horas de `
                + 'una persona de Marketing.',
            },
          },
        },
        {
          id: 'V09',
          titulo: 'Cuándo pasa',
          pregunta: `Pasa con ${fijo(v('G67.con_descuento'))} puntos; lo observado da menos de ${fijo(MENOS_DE)}`,
          fuente: 'E3, Parte B v3.0',
          segundos: 85,
          textos: {
            con: { rotulo: 'Umbral de pase', linea: 'puntos, rama con descuento' },
            sin: { rotulo: 'Sin descuento', linea: 'puntos, la otra rama' },
            hoy: { rotulo: 'Con lo observado', linea: 'punto, con la tasa de hoy', antes: 'menos de' },
            mide: 'Diferencia de cruce, control menos rama, en puntos',
            conclusion: 'Con la tasa observada, la diferencia sería de',
            sigue: [' puntos; el umbral pide ', ' con descuento y ', ' sin descuento.'],
            barras: {
              hoy: 'Con lo observado',
              sin: 'Rama sin descuento',
              con: 'Rama con descuento',
              eje: 'Puntos de diferencia de cruce',
            },
            decision: {
              area: 'Medición',
              estado: 'umbral fijo',
              corta: `Decide María G. en la semana${NBSP}${fijo(SEM_FIN)}`,
              larga: `Umbral de pase del piloto: ${fijo(v('G67.con_descuento'), 2)} puntos con descuento y `
                + `${fijo(v('G67.sin_descuento'), 2)} sin descuento. Informe preliminar en la semana ${fijo(SEM_PRE)}, que `
                + `no decide; decisión en la ${fijo(SEM_FIN)}.`,
            },
          },
        },
      ],
    },
    // ------------------------------------------------------------------ legal · Tomas F. · 3:30
    {
      id: 'legal',
      titulo: 'Legal, riesgos y adopción',
      riel: '4 · Legal y adopción',
      integrante: 'Tomas F.',
      vistas: [
        {
          id: 'V10',
          titulo: 'Qué va antes',
          pregunta: 'Antes de la lista, el consentimiento',
          fuente: 'E3, Parte C v3.0',
          segundos: 105,
          textos: {
            puntaje: { rotulo: 'Puntaje legal', linea: 'estado actual' },
            proteccion: { rotulo: 'Datos personales', linea: 'la dimensión más baja' },
            previas: { rotulo: 'Acciones previas', linea: 'antes de la lista' },
            mide: 'Acciones legales antes de la primera lista, por semana del plan',
            conclusion: 'Ninguna lista sale sin estas acciones; la primera, en la semana',
            sigue: ['.'],
            semana: 'semana',
            primera: 'primera lista',
            acciones: {
              L4: { que: 'Firmar el acuerdo de confidencialidad', quien: 'María G.' },
              L1: { que: 'Inscribir las bases en la AAIP', quien: 'asesor legal de Casa Óga' },
              L5: { que: 'Aprobar la política de retención y borrado', quien: 'María G.' },
              L6: { que: 'Revisar aviso de privacidad, baja y Registro No Llame', quien: 'asesor legal de Casa Óga' },
              L3: { que: 'Probar el filtro de consentimiento en cero', quien: 'Sebastian C.' },
            },
            decision: {
              area: 'Legal',
              estado: 'condición previa',
              corta: 'Ninguna lista sale sin el consentimiento en regla',
              larga: `Puntaje legal ${fijo(v('H40'), 1)} de ${fijo(T.escala_tecnica.hasta)}; las acciones previas se `
                + `hacen antes de la primera lista, en la semana ${fijo(SEM_LISTA)}.`,
            },
          },
        },
        {
          id: 'V11',
          titulo: 'Qué puede fallar',
          pregunta: 'El piloto prueba si Marketing sostiene la lista',
          fuente: 'E3, Parte C v3.0',
          segundos: 105,
          textos: {
            riesgos: { rotulo: 'Riesgos críticos', linea: 'con señal y respuesta' },
            horas: { rotulo: 'Horas por lista', linea: 'de la persona de Marketing', unidad: 'horas' },
            mide: 'Riesgos críticos del piloto: qué se mira y qué se hace',
            conclusion: 'Marketing corre la planilla en',
            sigue: [' horas por lista, con la guía de corrida.'],
            columnas: { riesgo: 'Riesgo', senal: 'Señal que se mira', respuesta: 'Qué se hace' },
            filas: [
              {
                riesgo: 'Contactar no paga la lista',
                senal: 'diferencia de cruce entre el control y cada rama',
                respuesta: `si ninguna rama llega, se cierra en la semana ${fijo(SEM_FIN)}`,
              },
              {
                riesgo: 'Nadie corre la planilla',
                senal: 'listas corridas a tiempo',
                respuesta: 'Marketing la corre con la guía; el equipo acompaña',
              },
              {
                riesgo: 'Se contacta sin consentimiento',
                senal: 'clientes sin consentimiento o con baja',
                respuesta: 'filtro probado en cero antes de cada lista',
              },
            ],
            decision: {
              area: 'Adopción',
              estado: 'se prueba',
              corta: 'Corre la lista una persona de Marketing',
              larga: 'Durante el piloto corre la planilla una persona de Marketing que designa Sofía R., con la guía de '
                + 'corrida; el equipo arma la planilla y acompaña las tres corridas.',
            },
          },
        },
      ],
    },
    // ------------------------------------------------------------------ gestión · Sebastian C. · 3:45
    {
      id: 'gestion',
      titulo: 'Gestión del proyecto',
      riel: '5 · Gestión',
      integrante: 'Sebastian C.',
      vistas: [
        {
          id: 'V12',
          titulo: 'El backlog',
          pregunta: `El backlog tiene ${fijo(v('K02'))} historias; ${fijo(v('K04'))} hechas`,
          fuente: 'E4, Parte A',
          segundos: 75,
          textos: {
            historias: { rotulo: 'Historias de usuario', linea: 'repartidas en las épicas' },
            hechas: { rotulo: 'Ya hechas', linea: 'en la cursada, con evidencia' },
            horas: { rotulo: 'Horas del piloto', linea: 'del equipo, ya estimadas', unidad: 'horas' },
            mide: 'Historias de usuario por épica, según su estado',
            conclusion: 'Las',
            sigue: [' historias del piloto suman las horas del presupuesto; las ', ' restantes solo van si el piloto pasa.'],
            estados: { hecha: 'hecha', piloto: 'en el piloto', despues: 'si el piloto pasa' },
            decision: {
              area: 'Gestión',
              estado: 'backlog',
              corta: 'Cada historia tiene dueño, semana y criterio',
              larga: `${fijo(v('K02'))} historias de usuario, ${fijo(v('K03'))} criterios de aceptación.`,
            },
          },
        },
        {
          id: 'V13',
          titulo: 'PoC y MVP',
          pregunta: 'La PoC está hecha; el MVP es la planilla',
          fuente: 'E4, Parte A',
          segundos: 75,
          textos: {
            mvp: { rotulo: 'Se pide ahora', linea: 'el MVP en piloto mínimo' },
            minima: { rotulo: 'Operación mínima', linea: 'el primer año' },
            mide: 'Etapas de la solución y qué abre cada una',
            conclusion: 'La PoC probó que la regla acierta',
            sigue: ['; falta medir si contactar paga la lista.'],
            etapas: [
              { nombre: 'PoC', estado: 'hecha', que: 'la regla sobre el extracto histórico, con validación y prueba final' },
              { nombre: 'MVP en piloto mínimo', estado: 'se pide ahora', que: 'la planilla mensual operada tres meses con control y dos ramas' },
              { nombre: 'Operación mínima', estado: 'si una rama pasa', que: 'la misma planilla con un analista part-time' },
              { nombre: 'Producción completa', estado: 'si el efecto la paga', que: 'exportación automática, soporte y tablero del directorio' },
            ],
            decision: {
              area: 'Solución',
              estado: 'por etapas',
              corta: 'Cada etapa abre la siguiente solo si pasa',
              larga: 'PoC hecha; MVP en piloto mínimo; operación mínima si una rama llega a su umbral de pase; producción '
                + 'completa solo si el efecto medido la paga.',
            },
          },
        },
        {
          id: 'V14',
          titulo: 'El plan',
          pregunta: `El plan: ${fijo(T.plan.semanas)} semanas con dueño por fase`,
          fuente: 'E3, Parte D v3.0',
          segundos: 75,
          textos: {
            decide: { rotulo: 'Decide María G.', linea: 'con el cruce de las listas', antes: 'semana' },
            lista: { rotulo: 'Primera lista', linea: 'después de las acciones previas', antes: 'semana' },
            mide: 'Fases e hitos, por semana desde la aprobación',
            conclusion: 'El informe preliminar llega en la semana',
            sigue: [' y la decisión, en la ', '.'],
            semana: 'semana',
            hito: 'semanas con hito',
            decision: {
              area: 'Plan',
              estado: 'con dueños',
              corta: 'Cada fase con su responsable',
              larga: `El plan dura ${fijo(T.plan.semanas)} semanas desde la aprobación escrita de María G.`,
            },
          },
        },
      ],
    },
    // ------------------------------------------------------------------ cierre · Sebastian C. · 1:30
    {
      id: 'cierre',
      titulo: 'Cierre',
      integrante: 'Sebastian C.',
      vistas: [
        {
          id: 'V15',
          titulo: 'Lo que pedimos',
          pregunta: 'Aprobar el piloto y firmar el acuerdo',
          fuente: 'E3, Parte D v3.0',
          segundos: 90,
          textos: {
            piloto: { rotulo: 'Piloto mínimo', linea: 'del presupuesto de Casa Óga' },
            acuerdo: { rotulo: 'Confidencialidad', linea: 'antes de más datos', antes: 'semana' },
            decide: { rotulo: 'Decisión final', linea: 'seguir o cerrar', antes: 'semana' },
            mide: 'Balance del trabajo',
            conclusion: 'Sabemos a quién contactar; el piloto dice si contactarlo paga la lista, por',
            sigue: [' y no ', '.'],
            balance: [
              { que: 'Aprendimos', texto: 'una regla elige a quién contactar' },
              { que: 'Falló', texto: 'esperar que un modelo pagara el proyecto' },
              { que: 'Supuesto', texto: `tasa de éxito ${pct(v('G31'), 2)}, sin grupo de control` },
              { que: 'Limitación', texto: 'quedan afuera los meses incompletos y las ventas sin cliente' },
            ],
            decision: {
              area: 'Pedido',
              estado: 'a Casa Óga',
              corta: 'Decide María G.; el acuerdo va primero',
              larga: `Aprobar el piloto mínimo (${usd(v('G64'))} del presupuesto) y firmar el acuerdo de confidencialidad `
                + `en la semana ${fijo(SEM_ACUERDO)} del plan.`,
            },
          },
        },
      ],
    },
  ],
}

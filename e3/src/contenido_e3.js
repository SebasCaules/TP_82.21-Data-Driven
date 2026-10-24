// Generado por entregas/entregable-3/_build/F/presentacion/exportar_web.py desde contenido.py.
// No editar a mano: el texto se cambia en contenido.py y se vuelve a exportar.
export const C3 = {
  "VERSION": "v1.1",
  "EQUIPO": [
    {
      "nombre": "Sebastian Caules",
      "corto": "Sebastian C.",
      "rol": "Programador y Organización"
    },
    {
      "nombre": "Tomas Ferreccio",
      "corto": "Tomas F.",
      "rol": "Investigación de material"
    },
    {
      "nombre": "Juan Manuel Rilo",
      "corto": "Juan Manuel R.",
      "rol": "Consolidación de datos y fórmulas"
    },
    {
      "nombre": "Francisco Cattaneo",
      "corto": "Francisco C.",
      "rol": "Investigación de fórmulas matemáticas"
    },
    {
      "nombre": "Matías Sola",
      "corto": "Matías S.",
      "rol": "Tratamiento de datos"
    }
  ],
  "PIE": "Casa Óga · Entregable 3 · Grupo 2 · 27/10/2026",
  "DIAPOSITIVAS": [
    {
      "n": 1,
      "quien": "Sebastian C.",
      "tipo": "portada",
      "kicker": "Factibilidad de Proyectos Data Driven · 2C 2026 · Entregable 3",
      "titulo": "¿Conviene anticipar a los clientes que dejan de comprar?",
      "bajada": "Factibilidad técnica, económica y legal, riesgos y modelado del proyecto de Casa Óga",
      "fuente": "",
      "ids": [],
      "guion": "Somos el grupo 2. Presentamos la factibilidad del proyecto de Casa Óga: anticipar qué clientes van a dejar de comprar para que Marketing los contacte a tiempo. Primero les damos la respuesta y después cómo llegamos a ella.",
      "segundos": 20
    },
    {
      "n": 2,
      "quien": "Sebastian C.",
      "tipo": "veredictos",
      "kicker": "La respuesta",
      "titulo": "La lista mensual sale con la regla del umbral y un piloto mide si contactar sirve",
      "tarjetas": [
        {
          "area": "Técnica",
          "valor": "2,25",
          "escala": "sobre 3 · factibilidad media",
          "texto": "Viable con condiciones. Lo que más pesa es quién opera la lista."
        },
        {
          "area": "Legal",
          "valor": "2,0",
          "escala": "sobre 3 · viable con condiciones",
          "texto": "Seis acciones legales. La planilla sale filtrada por consentimiento."
        },
        {
          "area": "Económica",
          "valor": "No viable",
          "escala": "tal como está planteado",
          "texto": "El modelo suma USD 5,38 por año y agrega USD 10.400 al costo del año 1."
        },
        {
          "area": "Riesgo más crítico",
          "valor": "1,02 %",
          "escala": "tasa de éxito, sin grupo de control",
          "texto": "Es compra a 7 días después de un envío: un techo, no un efecto medido."
        }
      ],
      "decision": "**Decisión.** La lista mensual de 500 sale con la regla del umbral, sin modelo. Un piloto de tres meses con grupo de control mide la tasa de éxito antes de invertir en producción.",
      "fuente": "Parte A 1.3 · Parte B 3.6 · Parte C 5.4 y 6.3",
      "ids": [
        "F16",
        "G40",
        "G38",
        "H40",
        "G31"
      ],
      "guion": "La respuesta corta: el proyecto se puede hacer, pero no como lo planteamos al principio. Técnicamente es factible, con 2,25 sobre 3. En lo legal también, con 2,0 y seis acciones. Lo que no cierra es lo económico: el modelo le gana a una regla simple por tan poco que no paga su costo. Y hay un dato que nadie midió, cuántos clientes vuelven cuando se los contacta. Por eso la lista sale con la regla, sin modelo, y un piloto de tres meses con grupo de control mide eso antes de invertir más.",
      "segundos": 50
    },
    {
      "n": 3,
      "quien": "Sebastian C.",
      "tipo": "problema",
      "kicker": "El problema",
      "titulo": "Un cliente se va cuando pasa más días sin comprar que su propio umbral",
      "definicion": [
        "**Umbral de cada cliente.** θ = máx(90 días; 1,5 × su intervalo mediano entre compras).",
        "**Se va** (y_churn_90 = 1) si en los 90 días siguientes al corte pasa más días sin comprar que su umbral. Aplica a clientes con tres compras o más que al corte no lo cruzaron.",
        "**La pregunta del modelo.** ¿Qué clientes que hoy compran a su ritmo van a cruzar su umbral en los próximos 90 días? Con la respuesta, Marketing arma la lista del mes.",
        "La definición es del equipo. María G. la aprueba, con revisión de Sofía R. (envío 17)."
      ],
      "figura": "cliente.png",
      "pie_figura": "Un cliente real de validación (Parte C 7.3).",
      "cifras": [
        {
          "valor": "−35,6 %",
          "texto": "ventas de 2025 contra 2024; sep. a dic. con una caída sin causa conocida"
        },
        {
          "valor": "500 por mes",
          "texto": "la lista: Marketing puede contactar de 500 a 800 (envío 29)"
        },
        {
          "valor": "16.052",
          "texto": "positivos en 59.585 filas cliente × mes, 33 cortes"
        }
      ],
      "fuente": "Parte A 2.1 · Parte C 6.5 y 7.3",
      "ids": [
        "F02",
        "C14",
        "C08",
        "H23"
      ],
      "guion": "El problema son los clientes que dejan de comprar. En 2025 las ventas cayeron 35,6 %, con cuatro meses de fin de año que llegaron con muchas menos operaciones, sin causa conocida. Cada cliente tiene su ritmo, así que decimos que se va cuando pasa más días sin comprar que su propio umbral: 1,5 veces su intervalo habitual entre compras, con un piso de 90 días. Este es un cliente real. Compra cada 162 días, su umbral es 243 y al corte llevaba 181. En los 90 días siguientes lo cruzó. Queremos encontrar a estos clientes antes, para una lista de 500 por mes, que es lo que Marketing puede contactar.",
      "segundos": 65
    },
    {
      "n": 4,
      "quien": "Tomas F.",
      "tipo": "figura_filas",
      "kicker": "Parte A · Factibilidad técnica",
      "titulo": "Técnicamente factible: los datos alcanzan y el límite es quién opera la lista",
      "figura": "tecnica.png",
      "pie_figura": "Escala de la cátedra: 2,1 a 2,5 es factibilidad media.",
      "filas": [
        {
          "rotulo": "Datos · 3",
          "texto": "4.636 positivos para entrenar, contra una señal de alerta de 50 a 100."
        },
        {
          "rotulo": "Calidad · 2",
          "texto": "44,8 % de las ventas no tiene cliente: el modelo solo ve a quien se identifica. Se declara como sesgo."
        },
        {
          "rotulo": "Infraestructura · 2",
          "texto": "Sin servidor ni BI. Cada sistema se exporta a mano una vez por mes."
        },
        {
          "rotulo": "Capacidad humana · 2",
          "texto": "El piloto lo opera el equipo consultor (**inferido del envío 71**). Antes del tercer mes, Casa Óga elige analista part-time o contrato de soporte."
        }
      ],
      "nota": "El proyecto anterior se cortó porque «no quedó un responsable claro de mantenerlos» (envío 15).",
      "fuente": "Parte A 1.1 a 1.3",
      "ids": [
        "F16",
        "G10",
        "F11",
        "C19"
      ],
      "guion": "Evaluamos cuatro condiciones de 1 a 3. Los datos alcanzan con margen: hay 4.636 casos positivos para entrenar, y la señal de alerta es de 50 a 100. La calidad tiene un límite que no se arregla con datos: el 44,8 % de las ventas no tiene cliente, así que el modelo solo ve a quien se identifica. La infraestructura es manual, cada sistema se exporta a mano una vez por mes. Y lo que más pesa es quién lo opera. El proyecto anterior de Casa Óga se cortó porque nadie lo mantuvo. Por eso el piloto lo opera nuestro equipo, una de las dos opciones que dio Casa Óga. Promedio, 2,25: factibilidad media.",
      "segundos": 60
    },
    {
      "n": 5,
      "quien": "Tomas F.",
      "tipo": "flujo",
      "kicker": "Parte A · Stack del MVP",
      "titulo": "El MVP es una planilla mensual hecha con software libre",
      "pasos": [
        {
          "titulo": "Exportación mensual",
          "texto": "Operaciones o Marketing, a mano y con un mismo corte. Sebastian C. avisa una semana antes de la primera lista (envío 47)."
        },
        {
          "titulo": "Control del mes",
          "texto": "Un mes con menos del 60 % de las operaciones del mismo mes del año anterior no se usa."
        },
        {
          "titulo": "Pipeline en Python",
          "texto": "Las 15 decisiones de calidad del Entregable 2 arman el dataset por corte."
        },
        {
          "titulo": "Regla del umbral",
          "texto": "Ordena por los días que faltan para cruzar el umbral y arma la lista de 500."
        },
        {
          "titulo": "Planilla para Marketing",
          "texto": "Filtrada por acepta_marketing y pidio_baja. Sofía R. decide a quién se contacta."
        }
      ],
      "hechos": [
        {
          "valor": "USD 0",
          "texto": "en licencias: Python con pandas, una planilla y un tablero HTML"
        },
        {
          "valor": "1 computadora",
          "texto": "se le propone a Casa Óga: una asignada al operador, con acceso restringido"
        },
        {
          "valor": "Después del piloto",
          "texto": "la exportación automática, si el piloto demuestra valor (envío 14)"
        }
      ],
      "fuente": "Parte A 1.5 y 1.6",
      "ids": [
        "F15",
        "H46"
      ],
      "guion": "El MVP es simple a propósito. Cada mes se exportan los datos a mano y controlamos que el mes esté completo: de septiembre a diciembre de 2025 llegaron meses con entre 53 % y 18 % de las operaciones del año anterior. El pipeline del Entregable 2 arma el dataset, la regla ordena a los clientes y sale una planilla de 500, filtrada por consentimiento y bajas. Sofía R. la revisa y decide a quién se contacta. Todo con software libre, sin licencias. Automatizar la exportación queda para después del piloto, si demuestra valor.",
      "segundos": 50
    },
    {
      "n": 6,
      "quien": "Juan Manuel R.",
      "tipo": "figura_callouts",
      "kicker": "Modelado · Etapas 1 y 2",
      "titulo": "Ningún modelo le gana a la regla por más que el ruido",
      "figura": "modelos.png",
      "pie_figura": "Precisión de la lista mensual de 500 sin filtrar consentimiento ni bajas, validación de julio a septiembre de 2024.",
      "callouts": [
        {
          "titulo": "+0,89 puntos",
          "texto": "La logística sobre la regla: 13,3 aciertos más en 1.500 contactos. El intervalo del 95 %, de −0,21 a +1,91, incluye el cero."
        },
        {
          "titulo": "Aprende la regla",
          "texto": "Sus coeficientes de más peso son los días entre compras (−5,07) y los días sin comprar (+2,34)."
        },
        {
          "titulo": "Memoriza",
          "texto": "El gradient boosting llega a 66,0 % en entrenamiento, con un techo de 66,3 %, y en validación empata con la regla."
        }
      ],
      "fuente": "Parte A 2.5 · Parte B 4.1 y 4.2",
      "ids": [
        "F07",
        "F08",
        "G11",
        "G13",
        "G14",
        "G15",
        "G17",
        "G24",
        "G12"
      ],
      "guion": "Primero fijamos el piso. Lo que hace hoy Marketing, ordenar por días sin comprar, acierta 36,2 % de una lista de 500. La regla del umbral, sin modelo, acierta 81,6 %. Después entrenamos tres modelos. El mejor, la regresión logística, llega a 82,5 %: 13,3 aciertos más en 1.500 contactos, con un intervalo que incluye el cero. No es una mejora que podamos sostener. Cuando miramos qué aprendió, sus dos variables de más peso son las de la regla. El gradient boosting memoriza el entrenamiento.",
      "segundos": 50
    },
    {
      "n": 7,
      "quien": "Juan Manuel R.",
      "tipo": "figura_callouts",
      "kicker": "Modelado · Etapa 3",
      "titulo": "Con la lista que se puede mandar, el modelo queda debajo de la regla",
      "figura": "importancia.png",
      "pie_figura": "Importancia por permutación de la logística ajustada, en validación.",
      "callouts": [
        {
          "titulo": "Ajuste",
          "texto": "Grilla con 4 pliegues temporales y embargo. El gradient boosting baja su diferencia entre entrenamiento y validación de 18,1 a 6,4 puntos. La logística queda en 82,6 % sin filtro."
        },
        {
          "titulo": "Umbral elegido",
          "texto": "Lista de 500 por mes solo con clientes que aceptan marketing y no pidieron la baja. Ahí la regla acierta 75,8 % y la logística 73,9 %: 29 clientes más para la regla."
        },
        {
          "titulo": "Explicable",
          "texto": "Cada cliente se explica con días sin comprar, ritmo habitual y umbral. Las tres variables que más pesan son las de la regla."
        }
      ],
      "fuente": "Parte C 7.1 a 7.3",
      "ids": [
        "H01",
        "H08",
        "H05",
        "H17",
        "H16",
        "H21"
      ],
      "guion": "En la etapa 3 ajustamos los dos candidatos con validación temporal. El gradient boosting dejó de memorizar: la diferencia entre entrenamiento y validación bajó de 18,1 a 6,4 puntos. La logística quedó en 82,6 % sin filtro, apenas arriba de la regla. Después elegimos el umbral con el criterio de costo de la Parte B y la capacidad de Marketing: una lista de 500 por mes, solo con clientes que aceptan marketing y no pidieron la baja. En esa lista filtrada, la que se puede mandar, la regla acierta 29 clientes más que el modelo. El gráfico muestra por qué: lo que más pesa en el modelo son las tres variables de la regla.",
      "segundos": 60
    },
    {
      "n": 8,
      "quien": "Francisco C.",
      "tipo": "economia",
      "kicker": "Parte B · Factibilidad económica",
      "titulo": "El modelo suma USD 5,38 por año y cuesta USD 10.400 más que la regla",
      "grandes": [
        {
          "valor": "USD 5,38",
          "texto": "por año: lo que suma el modelo sobre la regla"
        },
        {
          "valor": "USD 10.400",
          "texto": "lo que el modelo agrega al costo del año 1"
        }
      ],
      "celdas": [
        {
          "celda": "Acierto",
          "valor": "ARS 99,96",
          "texto": "Vuelve 1 de cada 98 contactados que se iban a ir (s = 1,02 %) y deja ARS 15.282 de margen anual menos el descuento de 15 %."
        },
        {
          "celda": "Falso positivo",
          "valor": "ARS −47,21",
          "texto": "La acción (WhatsApp, ARS 25) y el descuento que usa el 0,74 % que iba a comprar igual."
        },
        {
          "celda": "Falso negativo",
          "valor": "0",
          "texto": "El margen de ese cliente se pierde igual sin el proyecto."
        }
      ],
      "formula": "VP = s (m − d t) − c     FP = −c − r d t",
      "callout": {
        "titulo": "Umbral de viabilidad",
        "texto": "Un punto de precisión sobre la regla vale USD 6,05 por año. Pagar USD 10.400 pide 1.719 puntos, y entre la regla y una lista perfecta hay 18,4."
      },
      "fuente": "Parte B 3.3, 3.5 y 4.4",
      "ids": [
        "G40",
        "G38",
        "G33",
        "G31",
        "G08",
        "G06",
        "G32",
        "G46"
      ],
      "guion": "Los aciertos de más del modelo valen 5,38 dólares por año, y el modelo agrega 10.400 dólares al costo del año 1. Sale de valorizar cada celda de la matriz. Un cliente que iba a irse y recibe la oferta vale, en valor esperado, 99,96 pesos: vuelve uno de cada 98 y deja su margen anual menos el descuento. Un falso positivo cuesta 47,21 pesos. Cada punto de precisión sobre la regla vale 6,05 dólares por año: para pagar el modelo harían falta 1.719 puntos, y entre la regla y una lista perfecta hay 18,4.",
      "segundos": 55
    },
    {
      "n": 9,
      "quien": "Francisco C.",
      "tipo": "figura_callouts",
      "kicker": "Parte B · Factibilidad económica",
      "titulo": "Ni la regla sola recupera su costo: todo depende de una tasa de éxito sin medir",
      "figura": "costos.png",
      "pie_figura": "Costo total estimado del año 1: inversión inicial más el recurrente.",
      "callouts": [
        {
          "titulo": "USD 660",
          "texto": "Con modelo, el año 1 pasa el presupuesto de USD 30.000. Sin modelo queda USD 9.740 abajo."
        },
        {
          "titulo": "ROI −98,52 %",
          "texto": "La regla sola deja USD 299,49 por año con 15 % de descuento. Solo con clientes contactables, USD 264,54 y ROI −98,69 %."
        },
        {
          "titulo": "49,6 %",
          "texto": "Tendría que volver ese porcentaje de los contactados que se iban a ir para que la regla se pague: 48,6 veces lo observado."
        }
      ],
      "decision": "**Veredicto: no viable tal como está planteado.** Ninguna variable de la sensibilidad lleva el ROI a 0. El de la regla puede cambiar con la tasa de éxito, que no está medida.",
      "fuente": "Parte B 3.2 y 3.4 a 3.6",
      "ids": [
        "G38",
        "G39",
        "C28",
        "G41",
        "H42",
        "G43",
        "G42"
      ],
      "guion": "El año 1 con modelo cuesta 30.660 dólares, 660 más que el presupuesto. Sin modelo, 20.260. Pero ni la regla sola recupera su costo: deja 299,49 dólares por año, un ROI de −98,52 %. Movimos cada supuesto por separado y ninguno lleva el ROI a cero. La regla se pagaría si volviera el 49,6 % de los contactados que se iban a ir, 48,6 veces lo que vemos. La tasa observada, 1,02 %, es compra a 7 días después de un envío, sin grupo de control: es un techo, no un efecto medido. Por eso el veredicto es no viable tal como está planteado.",
      "segundos": 60
    },
    {
      "n": 10,
      "quien": "Matías S.",
      "tipo": "legal",
      "kicker": "Parte C · Factibilidad legal",
      "titulo": "Legalmente viable con condiciones: el riesgo es contactar sin consentimiento",
      "dimensiones": [
        {
          "dimension": "Protección de datos personales",
          "puntaje": "2"
        },
        {
          "dimension": "Seguridad y control de accesos",
          "puntaje": "2"
        },
        {
          "dimension": "Conservación y trazabilidad fiscal",
          "puntaje": "2"
        },
        {
          "dimension": "Contratos con proveedores externos",
          "puntaje": "2"
        },
        {
          "dimension": "Explicabilidad del modelo",
          "puntaje": "2"
        }
      ],
      "promedio": {
        "valor": "2,0",
        "texto": "viable con condiciones"
      },
      "alerta": {
        "valor": "30,1 %",
        "texto": "de los envíos de 2022 a 2025 fue a clientes que no aceptaron marketing. La plataforma de campañas no los filtra."
      },
      "plan": [
        {
          "cuando": "Antes de la primera lista del piloto",
          "acciones": [
            {
              "id": "L1",
              "que": "Inscribir las bases de clientes y fidelización en la AAIP",
              "quien": "quien designe María G."
            },
            {
              "id": "L3",
              "que": "Filtro de acepta_marketing y pidio_baja en la planilla, con su prueba",
              "quien": "Sebastian C."
            },
            {
              "id": "L4",
              "que": "Acuerdo de confidencialidad entre el equipo y Casa Óga",
              "quien": "Sebastian C. y María G."
            },
            {
              "id": "L5",
              "que": "Política de retención y borrado de extractos y listas",
              "quien": "Matías S. y María G."
            },
            {
              "id": "L6",
              "que": "Revisar si el aviso de privacidad cubre este uso",
              "quien": "asesor legal de Casa Óga"
            }
          ]
        },
        {
          "cuando": "Antes de pasar a producción",
          "acciones": [
            {
              "id": "L2",
              "que": "Adenda del contrato del CRM; la negociación empieza antes del piloto",
              "quien": "asesor legal de Casa Óga"
            }
          ]
        }
      ],
      "nota": "genero queda fuera del modelo: con genero acierta 82,3 % y sin genero 82,6 %. L3 a L5 cuestan USD 750 al equipo; L1, L2 y L6 los pone Casa Óga.",
      "fuente": "Parte C 5.1 a 5.4 · Parte B 3.2",
      "ids": [
        "H40",
        "C18",
        "H09",
        "G48",
        "H41",
        "H47"
      ],
      "guion": "En lo legal, el modelo trabaja por cliente, así que trata datos personales bajo la Ley 25.326, aunque use un código y no el nombre. Las cinco dimensiones quedan en 2, débil pero superable: viable con condiciones. El riesgo más grande ya ocurre hoy: el 30,1 % de los envíos fue a clientes que no aceptaron marketing, porque la plataforma no los filtra. Nuestra planilla sale filtrada. Antes de la primera lista tienen que estar cinco acciones, y la adenda del CRM antes de producción. Además sacamos genero del modelo: sacarlo no baja el acierto y evita que el género decida a quién se le ofrece un descuento.",
      "segundos": 55
    },
    {
      "n": 11,
      "quien": "Matías S.",
      "tipo": "riesgos",
      "kicker": "Parte C · Riesgos",
      "titulo": "Tres riesgos críticos, cada uno con su señal y su umbral",
      "columnas": [
        {
          "n": "1",
          "riesgo": "La tasa de éxito no paga la lista",
          "filas": [
            {
              "rotulo": "Qué se mide",
              "texto": "compra a 7 días de los contactados menos la del grupo de control"
            },
            {
              "rotulo": "Umbral",
              "texto": "40,4 puntos al tercer mes; si no llega, no se invierte en producción"
            },
            {
              "rotulo": "Quién",
              "texto": "Juan Manuel R., al cierre de cada mes"
            }
          ]
        },
        {
          "n": "2",
          "riesgo": "Después del piloto nadie opera la lista",
          "filas": [
            {
              "rotulo": "Qué se mide",
              "texto": "la opción que elige María G. por escrito: analista part-time o soporte"
            },
            {
              "rotulo": "Umbral",
              "texto": "elegida antes del tercer mes, para que no quede un mes sin lista"
            },
            {
              "rotulo": "Quién",
              "texto": "Sebastian C., desde esta entrega"
            }
          ]
        },
        {
          "n": "3",
          "riesgo": "La lista llega a quien no aceptó marketing",
          "filas": [
            {
              "rotulo": "Qué se mide",
              "texto": "clientes de la planilla sin acepta_marketing o con pidio_baja"
            },
            {
              "rotulo": "Umbral",
              "texto": "1 cliente y la planilla no sale"
            },
            {
              "rotulo": "Quién",
              "texto": "Sebastian C., antes de cada envío"
            }
          ]
        }
      ],
      "nota": "La matriz completa tiene 13 riesgos, con probabilidad, impacto, estrategia y acción (anexo A4).",
      "fuente": "Parte C 6.2 y 6.3",
      "ids": [
        "H49",
        "G49",
        "H46",
        "C18",
        "H45"
      ],
      "guion": "Armamos una matriz de 13 riesgos. Estos son los tres críticos, cada uno con lo que se mide, el umbral y quién lo mira. Primero, que la tasa de éxito no pague la lista: Juan Manuel compara cada mes la compra de contactados y control, y si al tercer mes la diferencia no llega a 40,4 puntos, no se invierte en producción. Segundo, que al cerrar el piloto nadie opere la lista, como pasó con el proyecto anterior: María G. elige el operador antes del tercer mes. Tercero, contactar a alguien sin consentimiento: con un solo cliente así, la planilla no sale.",
      "segundos": 50
    },
    {
      "n": 12,
      "quien": "Sebastian C.",
      "tipo": "piloto",
      "kicker": "La propuesta",
      "titulo": "Un piloto de tres meses con grupo de control decide si se invierte más",
      "figura": "piloto.png",
      "hechos": [
        "**1.260 tratados y 240 de control.** Detecta una diferencia de 2,87 puntos o más en la compra a 7 días; para pagar la lista hacen falta 40,4.",
        "**Control:** 80 por mes, decisión del equipo. Quedan fuera los clientes de mayor valor, como pidió Sofía R. (envío 45); el equipo los define como el 20 % de mayor facturación.",
        "**Costo:** USD 1.350 de horas, dentro del presupuesto, y ARS 68.289 (USD 46,79) de acciones, que paga Marketing."
      ],
      "pedidos_titulo": "Con esta entrega, Sebastian C. presenta a María G.",
      "pedidos": [
        "La definición del target, con revisión de Sofía R. (envío 17).",
        "El alcance: regla sin modelo y piloto. **Inferido del envío 14**: Casa Óga ya piensa invertir por etapas, con el piloto como condición.",
        "Quién opera: el equipo consultor en el piloto; antes del tercer mes, Casa Óga elige analista part-time o soporte (**inferido del envío 71**).",
        "El grupo de control, que revisa Sofía R.",
        "A quién designa para inscribir las bases en la AAIP (L1)."
      ],
      "nota": "Sigue la Parte D: evaluación en test (etapa 4), diseño de la solución, go-live y veredicto integrado.",
      "fuente": "Parte B 3.6 · Parte C 6.3 y 6.4",
      "ids": [
        "G49",
        "H49",
        "G50"
      ],
      "guion": "Entonces, la propuesta. Durante tres meses sale la lista de 500 con la regla. Cada mes, 80 clientes quedan sin contactar, elegidos fuera de los de mayor valor, como pidió Sofía R. Con 240 clientes de control detectamos una diferencia de 2,87 puntos o más en la compra. Cuesta 1.350 dólares de horas, dentro del presupuesto, y 46,79 dólares de acciones que paga Marketing. Con esta entrega le presentamos a María G. cinco cosas: la definición del target, este alcance, quién opera la lista en el piloto, el grupo de control, que revisa Sofía R., y a quién designa para inscribir las bases en la AAIP. Si la diferencia llega a 40,4 puntos, la lista se paga y recién ahí se invierte en producción. El modelo entra solo si en el test le gana a la regla por más que el ruido y paga lo que agrega, y hoy ninguna tasa de éxito lo paga. Gracias.",
      "segundos": 80
    }
  ],
  "ANEXOS": [
    {
      "n": "A1",
      "titulo": "Partición temporal: el test sigue reservado hasta la etapa 4",
      "fuente": "Parte A 2.2",
      "ids": [
        "F05",
        "F17",
        "G10"
      ],
      "columnas": [
        "Conjunto",
        "Cortes",
        "Filas",
        "Positivos",
        "Prevalencia"
      ],
      "anchos": [
        3.2,
        4.6,
        1.5,
        1.5,
        1.5
      ],
      "filas": [
        [
          "Entrenamiento",
          "2023-01 a 2024-04 (16)",
          "14.753",
          "4.636",
          "31,42 %"
        ],
        [
          "Embargo",
          "2024-05 y 2024-06: su target mira julio a septiembre de 2024",
          "4.129",
          "1.062",
          "25,72 %"
        ],
        [
          "Validación",
          "2024-07 a 2024-09 (3)",
          "7.173",
          "1.713",
          "23,88 %"
        ],
        [
          "Separación",
          "2024-10 a 2024-12: su target mira enero a marzo de 2025",
          "8.025",
          "2.008",
          "25,02 %"
        ],
        [
          "Test (reservado hasta la etapa 4)",
          "2025-01 a 2025-05 (5)",
          "14.211",
          "3.602",
          "25,35 %"
        ],
        [
          "Fuera de la evaluación",
          "2025-06 a 2025-09: su target cae en los meses de la caída (DC-09)",
          "11.294",
          "3.031",
          "26,84 %"
        ]
      ]
    },
    {
      "n": "A2",
      "titulo": "Umbrales de decisión: la lista de 500 contactables es la que se puede mandar",
      "fuente": "Parte C 7.2",
      "ids": [
        "H11",
        "H15",
        "H16",
        "H13",
        "H17"
      ],
      "columnas": [
        "Umbral",
        "Casos",
        "Precisión",
        "Recall",
        "USD por año",
        "¿Operable?"
      ],
      "anchos": [
        3.9,
        1.1,
        1.2,
        1.1,
        1.3,
        3.7
      ],
      "filas": [
        [
          "Probabilidad ≥ 0,5, sin filtro",
          "1.485",
          "82,4 %",
          "71,4 %",
          "301,17",
          "No tal cual: largo variable y sin filtro"
        ],
        [
          "Lista de 500 por mes, sin filtro",
          "1.500",
          "82,6 %",
          "72,3 %",
          "305,68",
          "No tal cual: 483 no contactables"
        ],
        [
          "Lista de 700 por mes, sin filtro",
          "2.100",
          "75,3 %",
          "92,3 %",
          "366,00",
          "No tal cual, por lo mismo"
        ],
        [
          "Lista de 400 contactables",
          "1.200",
          "79,8 %",
          "81,5 %",
          "231,15",
          "Sí, debajo de la capacidad"
        ],
        [
          "Lista de 500 contactables",
          "1.500",
          "73,9 %",
          "94,3 %",
          "252,84",
          "Sí, la elegida"
        ],
        [
          "Lista de 600 contactables",
          "1.800",
          "64,4 %",
          "98,6 %",
          "234,60",
          "Sí, pero los 300 que agrega restan"
        ],
        [
          "Regla del umbral, 500 contactables",
          "1.500",
          "75,8 %",
          "96,8 %",
          "264,54",
          "Sí, la lista que sale"
        ],
        [
          "Práctica actual, 500 contactables",
          "1.500",
          "32,8 %",
          "41,8 %",
          "4,15",
          "Sí, pero casi no deja valor"
        ]
      ],
      "destacar": [
        6
      ]
    },
    {
      "n": "A3",
      "titulo": "Sensibilidad: ninguna variable lleva el ROI a 0",
      "fuente": "Parte B 3.5",
      "ids": [
        "G42",
        "G44"
      ],
      "columnas": [
        "Variable",
        "Escenario",
        "ROI modelo sobre la regla",
        "ROI regla sin modelo"
      ],
      "anchos": [
        3.6,
        4.6,
        2.3,
        2.3
      ],
      "filas": [
        [
          "Adopción",
          "50 % de la lista contactada",
          "−99,97 %",
          "−99,26 %"
        ],
        [
          "Beneficio por caso",
          "ARS 7.566, el margen de una compra",
          "−99,98 %",
          "−99,82 %"
        ],
        [
          "Desempeño del modelo",
          "−0,21 puntos, límite inferior",
          "−100,01 %",
          "no aplica"
        ],
        [
          "Costo de integración",
          "USD 6.000",
          "−99,95 %",
          "−98,74 %"
        ],
        [
          "Tasa de éxito",
          "0,63 %, límite inferior",
          "−99,97 %",
          "−99,32 %"
        ],
        [
          "Tasa de éxito",
          "1,12 %, solo los que cruzaron (a favor)",
          "−99,94 %",
          "−98,32 %"
        ],
        [
          "Falsos positivos que usan el descuento",
          "34,8 %: oferta hasta la próxima compra",
          "−99,59 %",
          "−102,37 %"
        ],
        [
          "Margen bruto",
          "36,06 % (2025)",
          "−99,95 %",
          "−98,63 %"
        ],
        [
          "Margen por cliente",
          "ARS 16.058 por persona unificada (a favor)",
          "−99,95 %",
          "−98,39 %"
        ],
        [
          "Descuento",
          "sin descuento (a favor)",
          "−99,95 %",
          "−97,93 %"
        ],
        [
          "Descuento",
          "20 % al alto valor, 15 % al resto",
          "−99,95 %",
          "−98,58 %"
        ],
        [
          "Tipo de cambio",
          "1.032,50 ARS/USD, 30/12/2024 (a favor)",
          "−99,93 %",
          "−97,91 %"
        ],
        [
          "Tipo de cambio",
          "177,13 ARS/USD, 30/12/2022 (a favor)",
          "−99,57 %",
          "−87,82 %"
        ],
        [
          "Horizonte",
          "3 años (a favor)",
          "−99,87 %",
          "−97,21 %"
        ]
      ],
      "pie": "Base: −99,95 % el modelo sobre la regla y −98,52 % la regla con 15 % de descuento, a un año."
    },
    {
      "n": "A4",
      "titulo": "Matriz de riesgos: 13 riesgos, cada uno con su acción",
      "fuente": "Parte C 6.2",
      "ids": [
        "H44",
        "H46"
      ],
      "columnas": [
        "#",
        "Tipo",
        "Riesgo",
        "Prob.",
        "Impacto",
        "Estrategia"
      ],
      "anchos": [
        0.5,
        1.8,
        7.0,
        1.0,
        1.1,
        1.4
      ],
      "filas": [
        [
          "1",
          "Técnico",
          "Los extractos no se regeneran a tiempo o llegan con un mes incompleto",
          "M",
          "A",
          "Mitigar"
        ],
        [
          "2",
          "Técnico",
          "Al cerrar el piloto, Casa Óga no contrata analista ni soporte y nadie opera la lista",
          "M",
          "A",
          "Mitigar"
        ],
        [
          "3",
          "Técnico",
          "El CRM no acepta importar la lista",
          "M",
          "B",
          "Aceptar"
        ],
        [
          "4",
          "Económico",
          "La tasa de éxito no paga la lista",
          "A",
          "A",
          "Mitigar"
        ],
        [
          "5",
          "Económico",
          "La oferta vale hasta la próxima compra y la lista pierde dinero",
          "M",
          "A",
          "Evitar"
        ],
        [
          "6",
          "Legal",
          "La lista llega a un cliente sin consentimiento o que pidió la baja",
          "M",
          "A",
          "Mitigar"
        ],
        [
          "7",
          "Legal",
          "El proveedor del CRM usa, cede o transfiere los datos sin cláusulas",
          "B",
          "A",
          "Transferir"
        ],
        [
          "8",
          "Organizacional",
          "Marketing no usa la lista o la usa en parte",
          "M",
          "A",
          "Mitigar"
        ],
        [
          "9",
          "Organizacional",
          "María G. no acepta el cambio de alcance o cambia prioridades",
          "M",
          "A",
          "Mitigar"
        ],
        [
          "10",
          "Entorno",
          "Cambia el consumo del rubro y el ritmo de compra de 2023 y 2024 deja de valer",
          "M",
          "A",
          "Mitigar"
        ],
        [
          "11",
          "Entorno",
          "La integración de fidelización con la tienda online cambia el registro de clientes",
          "B",
          "M",
          "Aceptar"
        ],
        [
          "12",
          "Modelo",
          "La lista acierta menos en mujeres, en alto valor y con menos de 12 meses",
          "A",
          "M",
          "Mitigar"
        ],
        [
          "13",
          "Modelo",
          "Se reemplaza la regla por la logística sin que le gane",
          "B",
          "A",
          "Evitar"
        ]
      ],
      "destacar": [
        3,
        1,
        5
      ],
      "pie": "En azul, el top 3 de la 6.3. Prob. e impacto: alta (A), media (M), baja (B)."
    },
    {
      "n": "A5",
      "titulo": "Errores por segmento: la brecha por género también la tiene la regla",
      "fuente": "Parte C 7.4",
      "ids": [
        "H24",
        "H25",
        "H26",
        "H27",
        "H28",
        "H43"
      ],
      "columnas": [
        "Segmento",
        "Filas (lugares)",
        "Precisión",
        "Dif. vs. global",
        "Observación"
      ],
      "anchos": [
        3.6,
        1.9,
        2.1,
        1.6,
        3.6
      ],
      "filas": [
        [
          "Tienda principal de formato Mediano",
          "3.071 (659)",
          "81,5 %",
          "−1,1",
          "46,7 % de las falsas alarmas"
        ],
        [
          "Tienda principal de formato Grande",
          "2.682 (554)",
          "83,0 %",
          "+0,4",
          "Parejo"
        ],
        [
          "Tienda principal de formato Chico",
          "1.191 (260)",
          "84,2 %",
          "+1,6",
          "Parejo"
        ],
        [
          "Alta en tienda física",
          "4.248 (873)",
          "84,0 %",
          "+1,4",
          "Parejo"
        ],
        [
          "Alta online",
          "2.925 (627)",
          "80,7 %",
          "−1,9",
          "La regla, 79,1 %"
        ],
        [
          "Menos de 12 meses de cliente",
          "376 (145)",
          "78,6 %",
          "−4,0",
          "La regla, 82,8 %; pocos casos"
        ],
        [
          "20 % de mayor facturación",
          "1.436 (442)",
          "79,6 %",
          "−3,0",
          "La regla, 78,8 %"
        ],
        [
          "Mujeres",
          "3.308 (685)",
          "79,7 %",
          "−2,9",
          "La regla, 78,7 %"
        ],
        [
          "Hombres",
          "3.339 (702)",
          "85,8 %",
          "+3,2",
          "La regla, 85,1 %"
        ]
      ],
      "destacar": [
        7,
        8
      ],
      "pie": "Logística ajustada, lista de 500 de validación (global 82,6 %). Los intervalos de mujeres y hombres no se tocan."
    },
    {
      "n": "A6",
      "titulo": "Costos del año 1: con modelo USD 30.660, con la regla USD 20.260",
      "fuente": "Parte B 3.2",
      "ids": [
        "G38",
        "G39",
        "G48",
        "G49"
      ],
      "columnas": [
        "Componente",
        "Con modelo (USD)",
        "Regla sin modelo (USD)",
        "Período"
      ],
      "anchos": [
        5.0,
        2.3,
        2.6,
        2.9
      ],
      "filas": [
        [
          "Data scientist senior",
          "12.000",
          "4.000",
          "Único (3 meses o 1)"
        ],
        [
          "Sprint de integración",
          "3.000",
          "3.000",
          "Único"
        ],
        [
          "Limpieza de datos maestros",
          "1.500",
          "1.500",
          "Único"
        ],
        [
          "Capacitación de usuarios clave",
          "1.800",
          "1.800",
          "Único"
        ],
        [
          "Adecuación legal del equipo (L3 a L5)",
          "750",
          "750",
          "Único"
        ],
        [
          "Piloto con grupo de control",
          "1.350",
          "1.350",
          "Único"
        ],
        [
          "Contingencia (15 %)",
          "3.060",
          "1.860",
          "Único"
        ],
        [
          "Total inversión inicial",
          "23.460",
          "14.260",
          ""
        ],
        [
          "Nube de producción",
          "1.200",
          "0",
          "Anual"
        ],
        [
          "Operador de la lista (8 h por mes)",
          "3.600",
          "3.600",
          "Anual"
        ],
        [
          "Soporte y reentrenamiento",
          "2.400",
          "2.400",
          "Anual"
        ],
        [
          "Total año 1",
          "30.660",
          "20.260",
          "Presupuesto: 30.000"
        ]
      ],
      "destacar": [
        7,
        11
      ],
      "pie": "Licencias: 0. Las acciones legales de Casa Óga (L1, L2, L6) y las acciones de retención quedan fuera de los USD 30.000."
    }
  ],
  "TIEMPOS": {
    "palabras_por_minuto": 130,
    "cambio_s": 3,
    "total_s": 655,
    "turnos": [
      {
        "quien": "Sebastian C.",
        "diapositivas": [
          1,
          2,
          3
        ],
        "segundos": 135
      },
      {
        "quien": "Tomas F.",
        "diapositivas": [
          4,
          5
        ],
        "segundos": 110
      },
      {
        "quien": "Juan Manuel R.",
        "diapositivas": [
          6,
          7
        ],
        "segundos": 110
      },
      {
        "quien": "Francisco C.",
        "diapositivas": [
          8,
          9
        ],
        "segundos": 115
      },
      {
        "quien": "Matías S.",
        "diapositivas": [
          10,
          11
        ],
        "segundos": 105
      },
      {
        "quien": "Sebastian C.",
        "diapositivas": [
          12
        ],
        "segundos": 80
      }
    ]
  }
};

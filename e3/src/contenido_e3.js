// Generado por entregas/entregable-3/_build/F/presentacion/exportar_web.py desde contenido.py.
// No editar a mano: el texto se cambia en contenido.py y se vuelve a exportar.
export const C3 = {
  "VERSION": "v1.2",
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
  "PIE": "Casa Óga · Entregable 3 · Grupo 2 · 03/11/2026",
  "DIAPOSITIVAS": [
    {
      "n": 2,
      "quien": "Sebastian C.",
      "tipo": "veredictos",
      "kicker": "La respuesta",
      "pregunta": "¿Conviene anticipar a los clientes que dejan de comprar?",
      "titulo": "La lista sale con la regla del umbral y un piloto mide si contactar sirve",
      "tarjetas": [
        {
          "area": "Técnica",
          "valor": "2,25[[/3]]",
          "escala": "factibilidad media",
          "texto": "El límite: quién opera la lista."
        },
        {
          "area": "Legal",
          "valor": "2,0[[/3]]",
          "escala": "viable con condiciones",
          "texto": "Seis acciones; la lista sale filtrada."
        },
        {
          "area": "Económica",
          "valor": "No viable",
          "escala": "ROI −99,95 % a un año",
          "texto": "Ni la regla sola recupera su costo."
        },
        {
          "area": "Tasa de éxito",
          "valor": "1,02 %",
          "escala": "sin grupo de control",
          "texto": "Un techo: el efecto no está medido."
        }
      ],
      "decision": "**Decisión.** La lista de 500 por mes sale con la regla del umbral, sin modelo. Un piloto de tres meses con grupo de control mide la tasa de éxito antes de invertir más.",
      "fuente": "Parte D 11.1",
      "ids": [
        "F16",
        "G40",
        "G38",
        "H40",
        "G31",
        "J09"
      ],
      "guion": "Somos el grupo 2. Casa Óga quiere saber a tiempo qué clientes van a dejar de comprar, para que Marketing los contacte. La respuesta corta: se puede hacer, pero no como lo planteamos al principio. En lo técnico y en lo legal es factible con condiciones. Lo económico no cierra: el ROI a un año da −99,95 %, porque un modelo no le gana a una regla simple y ni la regla sola recupera su costo. Falta medir cuántos clientes vuelven porque se los contactó. El único dato es este 1,02 %, sin grupo de control. Por eso la lista sale con la regla y un piloto mide ese efecto.",
      "segundos": 55
    },
    {
      "n": 3,
      "quien": "Sebastian C.",
      "tipo": "problema",
      "kicker": "El problema",
      "pregunta": "¿Quién se va?",
      "titulo": "Un cliente se va cuando pasa más días sin comprar que su propio umbral",
      "definicion": [
        "**Umbral** = 1,5 × su ritmo de compra, con un piso de 90 días.",
        "**Se va** si pasa su umbral en los 90 días siguientes al corte.",
        "**El modelo** busca a los que lo van a pasar.",
        "«Envío N»: pregunta N del relevamiento a Casa Óga."
      ],
      "figura": "cliente.png",
      "pie_figura": "Un cliente real de validación (Parte C 7.3).",
      "cifras": [
        {
          "valor": "−35,6 %",
          "texto": "ventas de 2025, con meses incompletos. Contra 2024; el rubro, +0,3 % en el año y −15,0 % en diciembre (CAME)"
        },
        {
          "valor": "500[[/mes]]",
          "texto": "clientes que Marketing puede contactar: de 500 a 800 (envío 29)"
        }
      ],
      "fuente": "Parte A 2.1 · Parte C 6.5 y 7.3",
      "ids": [
        "F02",
        "C14",
        "C08",
        "H23"
      ],
      "guion": "En 2025 las ventas cayeron 35,6 %. El rubro quedó plano en el año y cayó 15,0 % interanual en diciembre, y los últimos meses de 2025 llegaron incompletos: no sabemos cuánto es mercado. Cada cliente tiene su umbral: 1,5 veces su intervalo habitual entre compras, con un piso de 90 días. Se va si lo pasa sin comprar. Este es un cliente real. Compra cada 162 días, su umbral es 243 y al corte llevaba 181. En los 90 días siguientes lo cruzó. Queremos encontrar a estos clientes antes, en una lista de 500 por mes, que es lo que Marketing puede contactar.",
      "segundos": 60
    },
    {
      "n": 4,
      "quien": "Tomas F.",
      "tipo": "figura_filas",
      "kicker": "Parte A · Factibilidad técnica",
      "pregunta": "¿Se puede construir?",
      "titulo": "Sí, con condiciones: los datos alcanzan y el límite es quién opera la lista",
      "figura": "tecnica.png",
      "pie_figura": "Escala de la cátedra: 2,1 a 2,5 es factibilidad media.",
      "filas": [
        {
          "rotulo": "Datos",
          "texto": "4.636 casos para entrenar; la alerta es 50 a 100. Críticas: transacciones e identidad."
        },
        {
          "rotulo": "Calidad",
          "texto": "44,8 % de las ventas no tiene cliente identificado."
        },
        {
          "rotulo": "Infraestructura",
          "texto": "Sin servidor ni BI: exportación manual cada mes."
        },
        {
          "rotulo": "Capacidad humana",
          "texto": "Casa Óga no tiene quien opere la lista: en el piloto, el equipo (envío 71)."
        }
      ],
      "nota": "El proyecto anterior se cortó porque «no quedó un responsable claro de mantenerlos» (envío 15).",
      "fuente": "Parte A 1.1 a 1.4",
      "ids": [
        "F16",
        "G10",
        "F11",
        "C19"
      ],
      "guion": "La factibilidad técnica puntúa cuatro condiciones de 1 a 3. Los datos alcanzan con margen: hay 4.636 casos positivos para entrenar. Las otras tres quedan en 2: el 44,8 % de las ventas no tiene cliente, todo se exporta a mano y Casa Óga no tiene quién opere la lista. El promedio, 2,25, es factibilidad media. Lo que más pesa es quién opera: el proyecto anterior se cortó porque nadie lo mantuvo. En el piloto la opera nuestro equipo, y antes del tercer mes María G. elige quién sigue.",
      "segundos": 50
    },
    {
      "n": 5,
      "quien": "Tomas F.",
      "tipo": "flujo",
      "kicker": "Parte A · Stack del MVP",
      "pregunta": "¿Cómo funcionaría?",
      "titulo": "Con una planilla mensual hecha con software libre",
      "pasos": [
        {
          "titulo": "Exportación",
          "texto": "A mano, cada mes, con un mismo corte."
        },
        {
          "titulo": "Control del mes",
          "texto": "Con menos del 60 % de las operaciones, no se usa."
        },
        {
          "titulo": "Pipeline",
          "texto": "Las 15 decisiones de calidad del E2."
        },
        {
          "titulo": "Regla",
          "texto": "Ordena por días para pasar el umbral: salen 500."
        },
        {
          "titulo": "Planilla",
          "texto": "Sin bajas ni sin consentimiento. Decide Sofía R."
        }
      ],
      "hechos": [
        {
          "valor": "USD 0",
          "texto": "en licencias"
        },
        {
          "valor": "1 computadora",
          "texto": "para el operador"
        },
        {
          "valor": "Después del piloto",
          "texto": "la exportación automática (envío 14)"
        }
      ],
      "fuente": "Parte A 1.5 y 1.6",
      "ids": [
        "F15",
        "H46"
      ],
      "guion": "El producto mínimo es una planilla mensual hecha con software libre: USD 0 en licencias y una computadora.",
      "segundos": 10
    },
    {
      "n": 6,
      "quien": "Juan Manuel R.",
      "tipo": "figura_callouts",
      "kicker": "Modelado · Etapas 1 y 2",
      "pregunta": "¿Un modelo acierta más que la regla?",
      "titulo": "En validación, ningún modelo le gana a la regla por más que el ruido",
      "figura": "modelos.png",
      "pie_figura": "Lista de 500, sin filtrar. Entrena con enero de 2023 a abril de 2024, valida con julio a septiembre de 2024; el test de 2025 lo mide la etapa 4 (Parte D 8.1).",
      "callouts": [
        {
          "titulo": "+0,89 puntos",
          "texto": "13,3 aciertos más en 1.500 contactos. El intervalo, de −0,21 a +1,91, incluye el 0."
        },
        {
          "titulo": "Candidata: la logística",
          "texto": "Interpretable: pesan las variables de la regla (−5,07 y +2,34)."
        },
        {
          "titulo": "Memoriza",
          "texto": "El boosting llega a 66,0 % en entrenamiento, con un techo de 66,3 %, y en validación empata."
        },
        {
          "titulo": "Validación",
          "texto": "Precisión de la lista: práctica actual 36,2 %, regla 81,6 %, logística 82,5 %."
        }
      ],
      "fuente": "Parte A 2.2 y 2.5 · Parte B 4.1 a 4.5 · Parte D 11.2",
      "ids": [
        "F07",
        "F08",
        "G11",
        "G13",
        "G14",
        "G15",
        "G17",
        "G24",
        "G12",
        "H06",
        "J11"
      ],
      "guion": "Comparamos la regla con un modelo por la precisión de la lista de 500: qué parte de la lista realmente se iba. Cada fila es la logística menos la regla, con su intervalo. Arriba, la lista sin filtrar: en validación empataban y en el test, que abrimos una sola vez, la logística gana por 1,06 puntos.",
      "segundos": 30
    },
    {
      "n": 7,
      "quien": "Juan Manuel R.",
      "tipo": "figura_callouts",
      "kicker": "Modelado · Etapa 3",
      "pregunta": "¿Y con la lista que se puede mandar?",
      "titulo": "En validación el modelo queda debajo de la regla; en test empatan",
      "figura": "lista.png",
      "pie_figura": "Arriba, la lista de 500 contactables en validación. Abajo, la importancia por permutación de la logística ajustada.",
      "callouts": [
        {
          "titulo": "Ajuste",
          "texto": "4 pliegues temporales con embargo. Sobreajuste del boosting: de 18,1 a 6,4 puntos. Logística: 82,6 % sin filtro."
        },
        {
          "titulo": "Lista contactable",
          "texto": "483 de 1.500 lugares no se pueden contactar. Con 500 contactables: regla 75,8 %, logística 73,9 %."
        },
        {
          "titulo": "Control de fuga",
          "texto": "De 43 variables, 3 salen y 3 se recalculan: las 40 que quedan no miran después del corte."
        }
      ],
      "fuente": "Parte A 2.3 · Parte C 7.1 a 7.3 · Parte D 8.1 y 11.2",
      "ids": [
        "H01",
        "H08",
        "H05",
        "H17",
        "H16",
        "H21",
        "H45",
        "J03",
        "J09",
        "J10"
      ],
      "guion": "Pero esa lista no se puede mandar: un tercio son clientes que no aceptaron marketing o pidieron la baja. En la lista que sale, en validación ganaba la regla por 29 clientes, y en el test empatan: −0,25 puntos, con un intervalo que incluye el cero. Para pagar los USD 10.400 que agrega, el modelo tendría que acertar 8.595 clientes más por mes, en una lista de 500: ni una lista perfecta lo paga. Por eso la lista sale con la regla.",
      "segundos": 45
    },
    {
      "n": 8,
      "quien": "Francisco C.",
      "tipo": "economia",
      "kicker": "Parte B · Factibilidad económica",
      "pregunta": "¿Cuánto vale acertar?",
      "titulo": "En el escenario esperado, el modelo suma USD 5,38 al año y cuesta USD 10.400 más",
      "celdas": [
        {
          "celda": "Acierto",
          "valor": "ARS 99,96",
          "texto": "Vuelve 1 de cada 98, con su margen menos el descuento."
        },
        {
          "celda": "Falso positivo",
          "valor": "ARS −47,21",
          "texto": "WhatsApp (ARS 25) y descuento a quien iba a comprar igual."
        },
        {
          "celda": "Falso negativo",
          "valor": "0",
          "texto": "Se pierde igual sin proyecto."
        }
      ],
      "cadena": "**Modelo − regla:** 13,3 aciertos más en tres meses = USD 5,38 por año (lista sin filtrar).",
      "filtro": "**Lista contactable:** regla USD 264,54 contra logística 252,84 por año. El modelo queda USD 11,70 abajo.",
      "callout": {
        "titulo": "Umbral de viabilidad",
        "texto": "1 punto de precisión = USD 6,05 por año: el modelo necesita 1.719. Hasta una lista perfecta quedan 18,4 puntos."
      },
      "fuente": "Parte B 3.3, 3.5 y 4.4 · Parte C 7.2 · Parte D 11.2",
      "ids": [
        "G40",
        "G38",
        "G33",
        "G31",
        "G08",
        "G06",
        "G32",
        "G46",
        "H42",
        "J12"
      ],
      "guion": "Pasamos a dinero. Un acierto vale, en valor esperado, 99,96 pesos: vuelve uno de cada 98. Un falso positivo cuesta 47,21. En el escenario esperado, con la lista sin filtrar de validación, lo que el modelo suma sobre la regla vale 5,38 dólares por año, contra 10.400 que agrega al costo. En el test, con la lista que sale, queda 1,54 dólares por año debajo de la regla.",
      "segundos": 40
    },
    {
      "n": 9,
      "quien": "Francisco C.",
      "tipo": "figura_callouts",
      "kicker": "Parte B · Factibilidad económica",
      "pregunta": "¿El proyecto se paga?",
      "titulo": "No: ni la regla sola recupera su costo, y falta medir la tasa de éxito",
      "figura": "costos.png",
      "pie_figura": "Costo del año 1 y beneficio anual de la regla.",
      "callouts": [
        {
          "titulo": "ROI a un año: no recupera",
          "texto": ""
        },
        {
          "titulo": "49,6 %",
          "texto": "de los que se iban tendría que volver para pagar la regla. Hoy se ve 1,02 %."
        }
      ],
      "roi": {
        "columnas": [
          "Conservador",
          "Esperado",
          "Optimista"
        ],
        "filas": [
          [
            "Modelo − regla",
            [
              "−100,00 %",
              "−99,95 %",
              "−99,81 %"
            ]
          ],
          [
            "Regla sola",
            [
              "−100,12 %",
              "−98,52 %",
              "−96,76 %"
            ]
          ]
        ]
      },
      "decision": "**No viable tal como está planteado.** Ningún supuesto lleva el ROI a 0; el de la regla depende de la tasa de éxito, que no está medida.",
      "fuente": "Parte B 3.2 y 3.4 a 3.6",
      "ids": [
        "G38",
        "G39",
        "C28",
        "G41",
        "G40",
        "G43",
        "G42",
        "J12"
      ],
      "guion": "Tampoco la regla sola se paga. Con modelo, el primer año pasa el presupuesto; sin modelo cuesta 20.260 dólares y la regla deja 299,49 por año con la lista sin filtrar; con la que sale, 264,54 en validación y 327,06 en el test. Para pagarse tendría que volver el 49,6 % de los contactados que se iban a ir, 48,6 veces lo que vemos. Y ese 1,02 % es un techo, sin grupo de control. No es viable tal como está planteado.",
      "segundos": 45
    },
    {
      "n": 10,
      "quien": "Matías S.",
      "tipo": "legal",
      "kicker": "Parte C · Factibilidad legal",
      "pregunta": "¿Lo permite la ley?",
      "titulo": "Sí, con condiciones: el riesgo es contactar sin consentimiento",
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
        "valor": "2,0[[/3]]",
        "texto": "viable con condiciones"
      },
      "escala": "Escala de la cátedra: 1,6 a 2,5 es viable con condiciones.",
      "alerta": {
        "valor": "30,1 %",
        "texto": "de los envíos de 2022 a 2025 fue a quien no aceptó marketing."
      },
      "plan": [
        {
          "cuando": "Antes de la primera lista del piloto",
          "acciones": [
            {
              "id": "L1",
              "que": "Inscribir las bases en la AAIP",
              "quien": "quien designe María G."
            },
            {
              "id": "L3",
              "que": "Filtro de consentimiento y bajas",
              "quien": "Sebastian C."
            },
            {
              "id": "L4",
              "que": "Acuerdo de confidencialidad",
              "quien": "Sebastian C. y María G."
            },
            {
              "id": "L5",
              "que": "Retención y borrado de extractos",
              "quien": "Matías S. y María G."
            },
            {
              "id": "L6",
              "que": "Revisar avisos y el cruce con No Llame",
              "quien": "asesor legal de Casa Óga"
            }
          ]
        },
        {
          "cuando": "Antes de pasar a producción",
          "acciones": [
            {
              "id": "L2",
              "que": "Adenda del contrato del CRM",
              "quien": "asesor legal de Casa Óga"
            }
          ]
        }
      ],
      "nota": "**Normas:** Ley 25.326 · Res. AAIP 161/2023 · ARCA · seguridad de la información · **+** transferencia internacional · **+** No Llame (Ley 26.951). **+** las sumó el equipo.",
      "fuente": "Parte C 5.1 a 5.4",
      "ids": [
        "H40",
        "C18",
        "H09",
        "G48",
        "H41",
        "H47"
      ],
      "guion": "En lo legal, la lista trata datos personales, bajo la Ley 25.326. Las cinco dimensiones quedan en 2: hay que hacer cosas antes, pero nada bloquea. El promedio, 2,0, es viable con condiciones. El riesgo más grande ya ocurre: el 30,1 % de los envíos fue a clientes que no aceptaron marketing. Nuestra planilla sale filtrada, y cinco acciones legales van antes de la primera lista.",
      "segundos": 35
    },
    {
      "n": 11,
      "quien": "Matías S.",
      "tipo": "riesgos",
      "kicker": "Parte C · Riesgos",
      "pregunta": "¿Qué puede salir mal?",
      "titulo": "Tres riesgos críticos, cada uno con su señal y su umbral",
      "columnas": [
        {
          "n": "1",
          "riesgo": "La tasa de éxito no paga la lista",
          "filas": [
            {
              "rotulo": "Qué se mide",
              "texto": "compra a 7 días: contactados menos control"
            },
            {
              "rotulo": "Umbral",
              "texto": "**40,4 puntos** al tercer mes (el 49,6 % que paga la regla, llevado a todos los contactados)"
            },
            {
              "rotulo": "Quién",
              "texto": "Juan Manuel R., cada mes"
            }
          ]
        },
        {
          "n": "2",
          "riesgo": "Después del piloto nadie opera la lista",
          "filas": [
            {
              "rotulo": "Qué se mide",
              "texto": "la opción que elige María G.: analista part-time o soporte"
            },
            {
              "rotulo": "Umbral",
              "texto": "**antes del mes 3**, para no quedar un mes sin lista"
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
              "texto": "clientes sin consentimiento o con baja en la planilla"
            },
            {
              "rotulo": "Umbral",
              "texto": "**1 cliente** y la planilla no sale"
            },
            {
              "rotulo": "Quién",
              "texto": "Sebastian C., antes de cada envío"
            }
          ]
        }
      ],
      "nota": "**Límites:** solo clientes identificados · no distingue compradores profesionales · datos al 31/12/2025 · el piloto no mide al 20 % de mayor facturación. Los 13 riesgos: anexo A4.",
      "fuente": "Parte C 6.2 a 6.5",
      "ids": [
        "H49",
        "G49",
        "H46",
        "C18",
        "H45"
      ],
      "guion": "De los 13 riesgos, tres son críticos y cada uno tiene su señal. Que la tasa de éxito no pague la lista: se mide contra el grupo de control. Que al cerrar el piloto nadie opere la lista: María G. elige al operador en la semana 13. Y contactar a alguien sin consentimiento: con un solo cliente así, la planilla no sale.",
      "segundos": 35
    },
    {
      "n": 12,
      "quien": "Sebastian C.",
      "tipo": "piloto",
      "kicker": "La propuesta",
      "pregunta": "¿Qué decide María G. con el piloto?",
      "titulo": "Un piloto de tres meses con grupo de control decide si se invierte más",
      "figura": "piloto.png",
      "hechos": [
        "**1.260** contactados · **240** de control: 80 por mes, fuera de los de mayor valor (envío 45)",
        "**USD 1.350** de horas + **USD 46,79** de acciones, que paga Marketing"
      ],
      "pedidos_titulo": "Para que decida María G.",
      "pedidos": [
        "El alcance: regla sin modelo y piloto con control (semana 1).",
        "La regla del target, con revisión de Sofía R. (semana 2).",
        "Quién inscribe las bases en la AAIP (semana 2).",
        "Quién opera la lista después del piloto (semana 13).",
        "Si pasa a producción, con 40,4 puntos o más (semana 20)."
      ],
      "nota": "Plan de 20 semanas desde la entrega; la primera lista sale en la semana 6 y la decisión se toma en la semana 20, con el tercer mes cerrado en la 18. El grupo de control lo aprueba Sofía R. (semana 2).",
      "fuente": "Parte B 3.6 · Parte C 6.3 · Parte D 12.1 a 12.4",
      "ids": [
        "G49",
        "H49",
        "G50",
        "J50"
      ],
      "guion": "La propuesta de la Parte D. La lista sale cada mes con la regla, sin modelo, y durante tres meses 80 clientes por mes quedan sin contactar: son el grupo de control. Con 1.260 contactados y 240 de control, el piloto distingue de cero una diferencia de 2,87 puntos. Al cierre del tercer mes, si los contactados compran 40,4 puntos más que el control, se pasa a producción. Si no, María G. elige entre cerrar o repetir el piloto sin descuento. El plan dura 20 semanas. La primera lista sale en la semana 6, en diciembre, con cinco condiciones: acciones legales, extracto nuevo, target y operador aprobados, grupo de control aprobado y 379 aciertos por mes, que el test ya da. A la derecha, lo que decide María G. y en qué semana. Gracias.",
      "segundos": 70
    }
  ],
  "ANEXOS": [
    {
      "n": "A1",
      "titulo": "Partición temporal: entrenamiento, validación y test en orden de tiempo",
      "fuente": "Parte A 2.2",
      "ids": [
        "F05",
        "F17",
        "G10",
        "J01",
        "J02"
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
          "Test (medido en la etapa 4)",
          "2025-01 a 2025-05 (5)",
          "14.211",
          "3.602",
          "25,35 %"
        ],
        [
          "Fuera de la evaluación",
          "2025-06 a 2025-09: su target cae en los meses que llegaron incompletos",
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
          "Sí: el umbral elegido para el modelo"
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
          "Base",
          "escenario base de la B 3.4 (vista 5)",
          "−99,95 %",
          "−98,52 %"
        ],
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
      "destacar": [
        0,
        13
      ],
      "pie": "ROI a un año; la regla, con 15 % de descuento. El tipo de cambio de 2022 es el que más lo mueve."
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
          "La lista acierta menos en mujeres, en género X, en alto valor y con menos de 12 meses",
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
      "titulo": "Errores por segmento: dónde acierta menos la lista",
      "fuente": "Parte C 7.4",
      "ids": [
        "H24",
        "H25",
        "H26",
        "H27",
        "H28",
        "H43",
        "J23",
        "J24"
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
        ],
        [
          "Género X",
          "193 (37)",
          "78,4 %",
          "−4,2",
          "Pocos casos; la regla, 77,5 %"
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
    },
    {
      "n": "A7",
      "titulo": "Matriz de confusión: la logística y la regla en la lista de 500",
      "fuente": "Parte B 4.3 y 4.4",
      "ids": [
        "G33",
        "G40"
      ],
      "columnas": [
        "Celda",
        "Logística",
        "Regla del umbral",
        "Valor por caso (ARS)"
      ],
      "anchos": [
        4.2,
        2.4,
        2.4,
        2.8
      ],
      "filas": [
        [
          "Acierto (VP)",
          "1.237",
          "1.223,67",
          "99,96"
        ],
        [
          "Falso positivo (FP)",
          "263",
          "276,33",
          "−47,21"
        ],
        [
          "Falso negativo (FN)",
          "476",
          "489,33",
          "0"
        ],
        [
          "Verdadero negativo (VN)",
          "5.197",
          "5.183,67",
          "0"
        ],
        [
          "Valor neto de la lista (ARS, tres meses)",
          "111.234",
          "109.272",
          ""
        ]
      ],
      "destacar": [
        4
      ],
      "pie": "Tres cortes de validación, 1.500 contactos. La regla tiene fracciones porque reparte los empates del último puesto."
    }
  ],
  "TIEMPOS": {
    "palabras_por_minuto": 130,
    "cambio_s": 3,
    "total_s": 475,
    "turnos": [
      {
        "quien": "Sebastian C.",
        "diapositivas": [
          2,
          3
        ],
        "segundos": 115
      },
      {
        "quien": "Tomas F.",
        "diapositivas": [
          4,
          5
        ],
        "segundos": 60
      },
      {
        "quien": "Juan Manuel R.",
        "diapositivas": [
          6,
          7
        ],
        "segundos": 75
      },
      {
        "quien": "Francisco C.",
        "diapositivas": [
          8,
          9
        ],
        "segundos": 85
      },
      {
        "quien": "Matías S.",
        "diapositivas": [
          10,
          11
        ],
        "segundos": 70
      },
      {
        "quien": "Sebastian C.",
        "diapositivas": [
          12
        ],
        "segundos": 70
      }
    ]
  }
};

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
      "guion": "Somos el grupo 2. Casa Óga quiere saber a tiempo qué clientes van a dejar de comprar, para que Marketing los contacte. La respuesta corta: se puede hacer, pero no como lo planteamos al principio. En lo técnico y en lo legal es factible con condiciones. Lo económico no cierra: el ROI del modelo sobre la regla da −99,95 % a un año, y ni la regla sola recupera su costo. Para pagarse tendría que volver casi la mitad de los que se iban: 48,6 veces este 1,02 %, sin grupo de control. Por eso la lista sale con la regla y un piloto mide cuántos vuelven por el contacto.",
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
      "guion": "De los clientes que siguen comprando al corte, el 25,35 % se va en los 90 días siguientes. Cada cliente tiene su umbral: 1,5 veces su intervalo habitual entre compras, con un piso de 90 días. Se va si lo pasa sin comprar. Este es un cliente real. Compra cada 162 días, su umbral es 243 y al corte llevaba 181. Le faltaban 62 días y en los 90 siguientes lo cruzó. Queremos encontrar a estos clientes antes de que crucen.",
      "segundos": 50
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
      "guion": "Comparamos la regla con un modelo por la precisión de la lista de 500: qué parte realmente se iba. Cada fila es la logística menos la regla, con su intervalo: las finas son validación y las gruesas, el test, que abrimos una sola vez. Sin filtrar, en el test la logística gana por 1,06 puntos.",
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
      "guion": "Pero esa lista no se puede mandar: un tercio son clientes que no aceptaron marketing o pidieron la baja. Con la lista que sale, en validación ganaba la regla y en el test empatan: −0,25 puntos, con un intervalo que cruza el cero. Para pagar los USD 10.400 que agrega, el modelo tendría que acertar 8.595 clientes más por mes, y la lista tiene 500. Por eso la lista sale con la regla.",
      "segundos": 40
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
      "guion": "Pasamos a dinero. Un acierto vale, en valor esperado, 99,96 pesos: vuelve uno de cada 98. Un falso positivo cuesta 47,21. En el escenario esperado, con la lista sin filtrar de validación, lo que el modelo suma sobre la regla vale 5,38 dólares por año, contra 10.400 que agrega al costo.",
      "segundos": 30
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
      "guion": "Tampoco la regla sola se paga: su ROI a un año es −98,52 %. Con modelo, el primer año pasa el presupuesto; sin modelo cuesta 20.260 dólares y la regla deja 299,49 por año. Para pagarse tendría que volver el 49,6 % de los contactados que se iban a ir. Ningún supuesto, movido solo, lleva el ROI a cero. No es viable tal como está planteado.",
      "segundos": 35
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
      "nota": "**Límites:** solo clientes identificados · no distingue compradores profesionales · datos al 31/12/2025 · el piloto no mide al 20 % de mayor facturación.",
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
      "guion": "Durante tres meses la lista sale con la regla, y cada mes 80 clientes quedan sin contactar: son el grupo de control. Con ese tamaño, el piloto distingue de cero una diferencia de 2,87 puntos. Al cierre del tercer mes, si los contactados compran 40,4 puntos más que el control, se pasa a producción. Si no, María G. elige entre cerrar o repetir el piloto sin descuento.",
      "segundos": 35
    },
    {
      "n": 13,
      "quien": "Sebastian C.",
      "tipo": "plan",
      "kicker": "La propuesta",
      "pregunta": "¿Cómo funciona cada mes y en qué semana?",
      "titulo": "La primera lista sale en la semana 6 y María G. decide en la 20",
      "fuente": "Parte D 9.2 y 12.1 a 12.4",
      "ids": [
        "J50",
        "J13",
        "G49"
      ],
      "guion": "Cada mes, la regla arma la lista, Sofía R. decide a quién escribir y medimos contra el control. La primera lista sale en la semana 6, en diciembre, con cinco condiciones: acciones legales, extracto nuevo, target y operador aprobados, grupo de control aprobado y 379 aciertos por mes, que el test ya da. María G. decide el alcance en la semana 1, la regla en la 2, quién opera después en la 13 y si pasa a producción en la 20.",
      "segundos": 45
    },
    {
      "n": 14,
      "quien": "Tomas F.",
      "tipo": "correccion",
      "kicker": "Corrección al Grupo 5",
      "pregunta": "¿Qué le corregimos al Grupo 5?",
      "titulo": "5 de 13 bloques de secciones a revisar; cuatro son de cifras o de método",
      "fuente": "Planilla de correcciones al Grupo 5 (v2.1)",
      "ids": [],
      "guion": "Corregimos como consultores externos el consolidado del Grupo 5, de 76 páginas, con el formato de la devolución de la cátedra: una fila por bloque de secciones. De 13 bloques, 5 quedan para revisar; ninguno en la Parte C. Uno: las etiquetas de entrenamiento miran los meses de validación, porque sus ventanas de hasta 360 días pasan junio de 2024. La cátedra nos marcó lo mismo. Dos: el 73 % del beneficio no se puede rehacer, porque no dice horas ni tarifa por tarea. Tres: el go-live baja el recall mínimo de 70 % a 65 % sin decirlo. Cuatro: el cambio de la 7.5 no llega a la 11.2 ni a la 3.4, y quedan dos bases. Cinco: lo que cambió de la v1 aparece en la página 74.",
      "segundos": 75
    },
    {
      "n": 15,
      "quien": "Juan Manuel R.",
      "tipo": "correccion",
      "kicker": "Corrección al Grupo 5",
      "pregunta": "¿Qué está bien y qué nos deja?",
      "titulo": "Concluimos distinto por el target: el nuestro casi coincide con lo que ordena la regla",
      "fuente": "Planilla de correcciones al Grupo 5 (v2.1)",
      "ids": [],
      "guion": "Ocho de los 13 bloques cierran sin cambios. Rehicimos tres secciones y sus cifras cierran: el 44,8 % de transacciones sin cliente y las 1.211 bajas salen igual de los CSV del caso, su tabla de costos cierra al dólar y la cuenta del dinero del modelo se rehace con sus supuestos. El cruce no cambió ninguna cifra nuestra, y explica por qué concluimos distinto. Las dos reglas ordenan por cuánto se atrasó el cliente; lo que cambia es el target. El nuestro es cruzar su umbral en 90 días, casi lo mismo que ordena la regla: en validación su AUC es 0,968, y la logística, 0,966. Al modelo no le queda dónde ganar. El suyo es no comprar en el doble de su intervalo: su regla da 0,589 y su modelo sube a 0,783. Ahí el modelo sí gana. Gracias.",
      "segundos": 75
    }
  ],
  "RIESGOS": {
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
  "TIEMPOS": {
    "palabras_por_minuto": 130,
    "cambio_s": 3,
    "total_s": 600,
    "turnos": [
      {
        "quien": "Sebastian C.",
        "diapositivas": [
          2,
          3
        ],
        "segundos": 105
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
        "segundos": 70
      },
      {
        "quien": "Francisco C.",
        "diapositivas": [
          8,
          9
        ],
        "segundos": 65
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
          12,
          13
        ],
        "segundos": 80
      },
      {
        "quien": "Tomas F.",
        "diapositivas": [
          14
        ],
        "segundos": 75
      },
      {
        "quien": "Juan Manuel R.",
        "diapositivas": [
          15
        ],
        "segundos": 75
      }
    ]
  }
};

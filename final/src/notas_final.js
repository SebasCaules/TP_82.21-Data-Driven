// Notas del orador de /final/ (tecla N). NO SE EDITA A MANO: lo escribe
// entregas/presentacion-final/_build/F/dossiers/guion-presentacion-final/exportar_notas.py desde guion.py (canon v1.5,
// tableros.notas_v1_5: una sola fuente para lo que se dice). Una entrada por vista y una lista por paso:
// NOTAS["Vnn"][k - 1] son los párrafos del paso k, con las frases que no se saltan en la versión de 15 minutos y las
// cifras resueltas por cifras.py; el pase del bloque cierra el último paso de su última vista. Lo lee Notas.jsx.
// scripts/check_final_f6.py compara este archivo con guion.py cuando el vault está.

export const NOTAS = {
  "V01": [
    [
      "Buenas tardes, María, Carlos. No recomendamos invertir en el proyecto, sino USD 4.485 en un piloto con grupo de control. La regla ya acierta quién va a pasar su umbral de días sin comprar, 86 de cada 100 en la prueba final, sin modelo. Lo que nadie midió es si contactarlo lo retiene. Hoy Casa Óga ya manda campañas por WhatsApp, mail y SMS. Y ustedes nos dijeron que «Hoy pesa más sostener a los que ya compran» [[(envío 1)]]. Pero esas campañas salieron sin grupo de control: nadie puede decir si el contacto cambió algo."
    ],
    [
      "Con lo que hoy se observa, la lista deja USD 265 por año y cuesta USD 20.260 el primero. El piloto, tres listas mensuales, dice en 28 semanas si contactar retiene lo suficiente para pagar la lista. Mis compañeros muestran los datos, la regla y el piloto, los números y lo legal. Yo vuelvo al final con el plan y lo que les pedimos.",
      "Sigue el integrante 2 con los datos."
    ]
  ],
  "V02": [
    [
      "Lucía, los extractos «se armaron exportando manualmente de cada sistema de origen» [[(envío 47)]]. Llegaron **15** archivos, y el de ventas es crítico: sin él no sabemos quién se va.",
      "De las **50.250** filas de ventas, la lista usa **27.276**: las que tienen cliente y monto mayor que cero."
    ],
    [
      "Primero salen **250** filas repetidas. Después, **22.394** ventas sin cliente: el **44,8 %** de las ventas sin repetidas. No se pueden atribuir a nadie, así que quedan fuera de la lista y lo decimos."
    ],
    [
      "Por último salen **330** compras devueltas, que no suman facturación. Queda la base de la lista: **27.276** ventas. Con eso, los datos alcanzan para armar la lista. La calidad sirve, pero hay que corregirla antes de cada lista."
    ]
  ],
  "V03": [
    [
      "El segundo problema es de fechas. Cada mes lo comparamos con el mismo mes del año anterior. Si tiene menos del **60 %** de las operaciones, lo tomamos como incompleto y no se usa."
    ],
    [
      "En 2025 quedan debajo **4** meses, de septiembre a diciembre.",
      "La lista de muestra sale del corte de agosto, el último mes que pasa el control.",
      "Si un mes llega incompleto, la lista de ese mes no sale hasta corregirlo.",
      "Con estos datos, sigue el integrante 3: cómo se elige a quién contactar."
    ]
  ],
  "V04": [
    [
      "La nuestra es esta: un cliente se va cuando pasa más días sin comprar que su propio umbral.",
      "Si les faltan entre **60 y 89 días** para su umbral, el **65,5 %** lo cruza en **90** días."
    ],
    [
      "Entre **30 y 59 días**, el **76,2 %**."
    ],
    [
      "A menos de **30 días**, el **91,7 %**. Cuanto más cerca del umbral, más lo cruzan, y por eso la lista empieza por los más cercanos."
    ]
  ],
  "V05": [
    [
      "En la prueba final, la lista de la regla acierta **86,1 %**.",
      "La del modelo, **85,9 %**. La práctica actual, ordenar por más días sin comprar, acierta **37,6 %**: menos de la mitad."
    ],
    [
      "De cerca, el modelo queda **0,25 puntos** debajo de la regla: es un empate.",
      "Queda la regla, en una planilla, sin modelo."
    ]
  ],
  "V06": [
    [
      "Cada mes salen **500** contactables."
    ],
    [
      "El **20 %** de mayor facturación se contacta entero y se reporta aparte."
    ],
    [
      "Del resto sorteamos al azar **100** clientes de control, que no se contactan.",
      "Los demás van a dos ramas: una con **15 %** de descuento y otra sin descuento. A los **90** días comparamos cuántos cruzaron su umbral en cada rama y en el control.",
      "Sigue el integrante 4: cuánto vale esa diferencia en dinero."
    ]
  ],
  "V07": [
    [
      "El primer año cuesta **USD 20.260**."
    ],
    [
      "Con lo que hoy se observa, la lista deja **USD 265 por año**: un poco más de un cuadro. El ROI de la regla a un año da **−98,7 %**. No se paga."
    ]
  ],
  "V08": [
    [
      "No pedimos el proyecto.",
      "El tramo más caro es la medición, **USD 1.350**."
    ],
    [
      "La planilla de la regla y su guía de corrida, **USD 900**."
    ],
    [
      "La capacitación, un taller con el equipo de Sofía, **USD 900**."
    ],
    [
      "La adecuación legal, **USD 750**."
    ],
    [
      "Y **USD 585** de contingencia, porque cada exportación es manual. En total, **USD 4.485** del presupuesto."
    ]
  ],
  "V09": [
    [
      "Para pasar, la rama con descuento tiene que llegar a **11,04 puntos** de diferencia de cruce. La rama sin descuento, a **8,82 puntos**, porque no paga el descuento."
    ],
    [
      "Con la compra observada en campañas, la diferencia sería de **0,79 puntos**."
    ],
    [
      "Lo observado queda lejos de los dos umbrales.",
      "El veredicto es este. No viable como proyecto. Recomendamos un piloto mínimo, tres listas mensuales con grupo de control, por USD 4.485 del presupuesto, para medir si contactar retiene lo suficiente para pagar la lista. La decisión llega en la semana 28.",
      "Antes de la primera lista hay cosas que tienen que estar en regla: sigue el integrante 5."
    ]
  ],
  "V10": [
    [
      "Hoy las bases no están inscriptas y el **30,1 %** de los envíos fue a clientes que no aceptaron marketing. Por eso el puntaje legal da **1,8 de 3**.",
      "Ninguna lista sale hasta tener la inscripción y el filtro de consentimiento, y la primera sale en la semana **6**."
    ],
    [
      "En la semana **1** se firma el acuerdo de confidencialidad."
    ],
    [
      "En la semana **2** se inscriben las bases en la AAIP y se aprueba la política de borrado."
    ],
    [
      "En la semana **4** se revisa el aviso de privacidad y se prueba el filtro."
    ],
    [
      "Usted firma el acuerdo y aprueba la política. Su asesor legal inscribe las bases y revisa el aviso, y Sebastian C. prueba el filtro."
    ]
  ],
  "V11": [
    [
      "Hay tres riesgos que pueden frenar el piloto. El primero es económico: que contactar no retenga lo suficiente.",
      "Si ninguna rama pasa, el proyecto cierra en la semana **28**."
    ],
    [
      "El segundo es que nadie corra la planilla.",
      "Por eso la corre una persona de Marketing, con la guía de corrida, en **8** horas por lista."
    ],
    [
      "El tercero es legal: contactar a alguien que no aceptó marketing. Antes de cada lista se prueba el filtro, y con un solo caso la lista de ese mes no sale.",
      "Sigue el integrante 1: cómo está ordenado este trabajo y quién hace cada cosa."
    ]
  ],
  "V12": [
    [
      "Todo el trabajo está en un backlog de **21** historias de usuario, repartidas en **8** épicas. Ya están hechas **9**."
    ],
    [
      "Las **9** historias del piloto suman **80** horas."
    ],
    [
      "Las **3** restantes solo van si el piloto pasa."
    ],
    [
      "Cada historia tiene su código, su dueño y tres criterios de aceptación."
    ]
  ],
  "V13": [
    [
      "La prueba de concepto está hecha: la regla acierta **86,1 %** en la prueba final. No probó si contactar cambia la conducta."
    ],
    [
      "El MVP es la regla en una planilla mensual: operada tres meses con control, es el piloto mínimo, y ahí estamos."
    ],
    [
      "En la semana **28** hay tres salidas. Si ninguna rama llega al umbral, el proyecto cierra con **USD 4.485** gastados. Si una llega, sigue la operación mínima, **USD 5.325** el primer año."
    ],
    [
      "En esa misma semana, la producción completa, **USD 15.775**, reemplaza a la operación mínima si el efecto la paga."
    ]
  ],
  "V14": [
    [
      "María, el plan tiene **6** fases en **28** semanas, contadas desde su aprobación escrita. Las cuatro primeras preparan la primera lista."
    ],
    [
      "Después viene el piloto, y la primera lista sale en la semana **6**."
    ],
    [
      "En la semana **20** llega un informe preliminar, que no decide. La decisión es en la semana **28**, y la toma usted."
    ],
    [
      "Cada fase tiene su responsable.",
      "Con esto, cierro."
    ]
  ],
  "V15": [
    [
      "El recorrido, en una frase por estación. Los datos alcanzan: **27.276** ventas con cliente. La regla acierta **86,1 %**, sin modelo. La lista deja **USD 265 por año**: no se paga. Lo legal va antes de la primera lista. Y en **28** semanas, María decide."
    ],
    [
      "Lo que nos llevamos: una regla simple alcanza para saber a quién contactar. Falló la idea de que un modelo pagaría el proyecto. El supuesto más frágil es la tasa de éxito, **1,02 %**, medida sin grupo de control. Y no usamos los meses incompletos ni las ventas sin cliente."
    ]
  ],
  "V16": [
    [
      "Si se quedan con una idea: ya sabemos a quién contactar; falta saber si contactarlo paga la lista. Les pedimos dos cosas: aprobar el piloto mínimo, **USD 4.485**, y firmar el acuerdo de confidencialidad en la semana **1**. En la semana **28** van a saber si el proyecto sigue, con **USD 4.485** gastados y no **USD 20.260**."
    ],
    [
      "¿Por qué con nosotros? No les vendemos el proyecto: les dijimos que hoy no se paga. Proponemos una planilla que corre Marketing, y la regla de pase queda fija antes de empezar."
    ],
    [
      "El informe completo está en el código QR de la pantalla, y este es mi contacto. Gracias."
    ]
  ]
}

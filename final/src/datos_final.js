// Generado por pipeline/build_final.py desde los JSON del vault (canon de la corrida, tableros.final). No editar a mano.
// Cada ancla es una fila del registro de cifras del E4 por su id: valor, unidad y texto con las reglas de
// e3/src/formato.js.
export const DF = {
 "meta": {
  "version": "final-1.0",
  "fuentes": [
   {
    "archivo": "economia.json",
    "sha256": "985b3b501b9065630d7df0f53b4bb3582d5f7730e771e8d8104ad70a299f332d"
   },
   {
    "archivo": "cv_temporal.json",
    "sha256": "926f075bf57e35efa3c883bafacfc97ddca2067b9792a9f9f24635aa31fc562d"
   },
   {
    "archivo": "etapa1.json",
    "sha256": "a36746b4915cc6ab739fc4f41202ede8c81973ca41dce608952a970709f9cf4f"
   },
   {
    "archivo": "condiciones.json",
    "sha256": "a1ba7efdc2912e6001e1aa26c1736d636d4041289e58cfceeb22ea1cbdf86256"
   },
   {
    "archivo": "etapa2.json",
    "sha256": "72739f939a393ddc95e936e79f224df960a002df4b30d9d26aaf6038620cf4b6"
   },
   {
    "archivo": "etapa3.json",
    "sha256": "8dc7bb84524731c46dfedf8a2cd8be5173aee71978476c26774930c509a9ded6"
   },
   {
    "archivo": "etapa4.json",
    "sha256": "0368611d7d797b3bec39f19764d2e3496d9c74e539a8b6c2e8cdf03099844fbd"
   },
   {
    "archivo": "indicador_6_5.json",
    "sha256": "f560dfc500b772170f45245e8ebcc20e0ffe76ac44059d12f6b5abf89131a20e"
   },
   {
    "archivo": "cifras-F3.json",
    "sha256": "ec6079b3a69eade8a7ecd0e60aebea142cbabfd5e41fb2eca0b7e154db8349d9"
   },
   {
    "archivo": "lista_de_muestra.json",
    "sha256": "b054dd736c53eae7a58c65a6b3a2a4e0ec2ed8c671f73a49fa0c7c3000f0fed3"
   },
   {
    "archivo": "canon.json",
    "sha256": "c31476043ff5276013bb573237a5ee245957a6bb718512052ca02fba94bd1562"
   },
   {
    "archivo": "contenido_c.py",
    "sha256": "62ca4d101e6d51e78981f9efce8312e3beb57429384541987f6971272624e3e6"
   },
   {
    "archivo": "contenido_a.py",
    "sha256": "fad086cda2947a81bd9fa38464c722b2e4a8a2e70570aaf812125f3d681d1db9"
   },
   {
    "archivo": "contenido_a.py",
    "sha256": "03cd553f9664b792f1e0fddeae6790842018ee440cab97f344f4fd6707971088"
   },
   {
    "archivo": "Transacciones_clientes.csv",
    "sha256": "f16d5e4c60a297c9a8bd815397b664aadbea84edb01f263b8e3616d297298b83"
   },
   {
    "archivo": "devoluciones_v02.json",
    "sha256": "5bcf053809ad4a64ebd0f5401d1db9bc927925affea7aab2d83bfbf61fd81a00"
   }
  ]
 },
 "anclas": {
  "G64": {
   "valor": 4485.0,
   "unidad": "USD",
   "texto": "USD 4.485",
   "definicion": "piloto mínimo: costo único de tres meses con 15 % de contingencia"
  },
  "G64.unicos": {
   "valor": 3900.0,
   "unidad": "USD",
   "texto": "USD 3.900",
   "definicion": "piloto mínimo sin contingencia"
  },
  "G64.contingencia": {
   "valor": 585.0,
   "unidad": "USD",
   "texto": "USD 585",
   "definicion": "contingencia del piloto mínimo (15 %)"
  },
  "G64.horas_equipo": {
   "valor": 80,
   "unidad": "horas",
   "texto": "80",
   "definicion": "horas del equipo del piloto mínimo"
  },
  "G64.horas_marketing": {
   "valor": 24,
   "unidad": "horas",
   "texto": "24",
   "definicion": "horas de la persona de Marketing que corre la planilla"
  },
  "G49.acciones": {
   "valor": 53538.489961257095,
   "unidad": "ARS",
   "texto": "ARS 53.538",
   "definicion": "acciones de retención del piloto, que paga Marketing"
  },
  "G49.meses": {
   "valor": 3,
   "unidad": "meses",
   "texto": "3",
   "definicion": "meses del piloto"
  },
  "G49.lista_mes": {
   "valor": 500,
   "unidad": "clientes",
   "texto": "500",
   "definicion": "lista de contactables por mes"
  },
  "G49.control_mes": {
   "valor": 100,
   "unidad": "clientes",
   "texto": "100",
   "definicion": "grupo de control por mes"
  },
  "G49.contactados": {
   "valor": 1200,
   "unidad": "clientes",
   "texto": "1.200",
   "definicion": "contactados en los tres meses"
  },
  "G49.por_rama": {
   "valor": 376.66666666666663,
   "unidad": "clientes",
   "texto": "376,67",
   "definicion": "contactados por rama en los tres meses, fuera del 20 % de mayor facturación"
  },
  "G49.costo_con_descuento": {
   "valor": 53.83989357148354,
   "unidad": "ARS",
   "texto": "ARS 53,84",
   "definicion": "costo por contactado de la rama con descuento"
  },
  "G49.costo_alto_valor": {
   "valor": 53.37790309551858,
   "unidad": "ARS",
   "texto": "ARS 53,38",
   "definicion": "costo por contactado en el 20 % de mayor facturación"
  },
  "G49.costo_sin_descuento": {
   "valor": 25.0,
   "unidad": "ARS",
   "texto": "ARS 25",
   "definicion": "costo por contactado de la rama sin descuento"
  },
  "G66.inversion": {
   "valor": 1724.9999999999998,
   "unidad": "USD",
   "texto": "USD 1.725",
   "definicion": "operación mínima: inversión (identidad rehecha más 15 %)"
  },
  "G66.recurrente": {
   "valor": 3600.0,
   "unidad": "USD por año",
   "texto": "USD 3.600 por año",
   "definicion": "operación mínima: analista part-time, 8 h por mes"
  },
  "G66.primer_anio": {
   "valor": 5325.0,
   "unidad": "USD",
   "texto": "USD 5.325",
   "definicion": "operación mínima: primer año"
  },
  "G65.inversion": {
   "valor": 9775.0,
   "unidad": "USD",
   "texto": "USD 9.775",
   "definicion": "producción completa: inversión con 15 %"
  },
  "G65.recurrente": {
   "valor": 6000.0,
   "unidad": "USD por año",
   "texto": "USD 6.000 por año",
   "definicion": "producción completa: operador y soporte"
  },
  "G65.primer_anio": {
   "valor": 15775.0,
   "unidad": "USD",
   "texto": "USD 15.775",
   "definicion": "producción completa: primer año"
  },
  "G39": {
   "valor": 20260.0,
   "unidad": "USD",
   "texto": "USD 20.260",
   "definicion": "costo del año 1 de la regla: piloto mínimo más producción completa"
  },
  "G39.unicos": {
   "valor": 12400.0,
   "unidad": "USD",
   "texto": "USD 12.400",
   "definicion": "costos únicos de la regla"
  },
  "G39.inversion": {
   "valor": 14260.0,
   "unidad": "USD",
   "texto": "USD 14.260",
   "definicion": "inversión inicial de la regla"
  },
  "G67.con_descuento": {
   "valor": 11.039972646467884,
   "unidad": "puntos",
   "texto": "11,04 puntos",
   "definicion": "umbral de pase del piloto, rama con 15 % de descuento"
  },
  "G67.sin_descuento": {
   "valor": 8.822337194120351,
   "unidad": "puntos",
   "texto": "8,82 puntos",
   "definicion": "umbral de pase del piloto, rama sin descuento"
  },
  "G67.s_con_descuento": {
   "valor": 0.14262597531822777,
   "unidad": "fracción",
   "texto": "14,26 %",
   "definicion": "tasa de éxito de equilibrio con la operación mínima, con descuento"
  },
  "G67.s_sin_descuento": {
   "valor": 0.11397622867301843,
   "unidad": "fracción",
   "texto": "11,40 %",
   "definicion": "tasa de éxito de equilibrio con la operación mínima, sin descuento"
  },
  "G67.minima_tres_anios_costo": {
   "valor": 4175.0,
   "unidad": "USD por año",
   "texto": "USD 4.175 por año",
   "definicion": "operacion minima: costo de tres años repartido por año"
  },
  "G67.minima_tres_anios_con_descuento": {
   "valor": 8.710383028466683,
   "unidad": "puntos",
   "texto": "8,71 puntos",
   "definicion": "operacion minima, tres años: umbral con descuento"
  },
  "G67.minima_tres_anios_sin_descuento": {
   "valor": 6.953122469443356,
   "unidad": "puntos",
   "texto": "6,95 puntos",
   "definicion": "operacion minima, tres años: umbral sin descuento"
  },
  "G67.completa_tres_anios_costo": {
   "valor": 9258.333333333334,
   "unidad": "USD por año",
   "texto": "USD 9.258,33 por año",
   "definicion": "produccion completa: costo de tres años repartido por año"
  },
  "G67.completa_tres_anios_con_descuento": {
   "valor": 19.007844383399522,
   "unidad": "puntos",
   "texto": "19,01 puntos",
   "definicion": "produccion completa, tres años: umbral con descuento"
  },
  "G67.completa_tres_anios_sin_descuento": {
   "valor": 15.215593353885149,
   "unidad": "puntos",
   "texto": "15,22 puntos",
   "definicion": "produccion completa, tres años: umbral sin descuento"
  },
  "G67.completa_con_descuento": {
   "valor": 32.20885221873965,
   "unidad": "puntos",
   "texto": "32,21 puntos",
   "definicion": "efecto que paga la producción completa en su primer año, con descuento"
  },
  "G67.completa_sin_descuento": {
   "valor": 25.807810127054786,
   "unidad": "puntos",
   "texto": "25,81 puntos",
   "definicion": "efecto que paga la producción completa en su primer año, sin descuento"
  },
  "G67.sin_costo_con_descuento": {
   "valor": 3.75,
   "unidad": "puntos",
   "texto": "3,75 puntos",
   "definicion": "umbral si la operación mínima la absorbe Marketing, con descuento"
  },
  "G67.sin_costo_sin_descuento": {
   "valor": 2.97,
   "unidad": "puntos",
   "texto": "2,97 puntos",
   "definicion": "umbral si la operación mínima la absorbe Marketing, sin descuento"
  },
  "G67.limpieza_piloto": {
   "valor": 6210.0,
   "unidad": "USD",
   "texto": "USD 6.210",
   "definicion": "piloto con la identidad rehecha adentro"
  },
  "G62.con_descuento": {
   "valor": 12.407340465729456,
   "unidad": "puntos",
   "texto": "12,41 puntos",
   "definicion": "referencia: recurrente de la producción completa, con descuento"
  },
  "G62.sin_descuento": {
   "valor": 9.919484967300326,
   "unidad": "puntos",
   "texto": "9,92 puntos",
   "definicion": "referencia: recurrente de la producción completa, sin descuento"
  },
  "G62.tasa_observada": {
   "valor": 0.7888414093364509,
   "unidad": "puntos",
   "texto": "0,79 puntos",
   "definicion": "diferencia de cruce con la tasa observada (no es un pronóstico)"
  },
  "G68.mde_rama": {
   "valor": 9.628873035602329,
   "unidad": "puntos",
   "texto": "9,63 puntos",
   "definicion": "efecto que el piloto ve 80 de cada 100 veces, por rama"
  },
  "G68.mde_juntas": {
   "valor": 8.379553391660846,
   "unidad": "puntos",
   "texto": "8,38 puntos",
   "definicion": "efecto que ve el primer paso, las dos ramas juntas"
  },
  "G68.potencia_sin_descuento": {
   "valor": 73.19981994180137,
   "unidad": "de cada 100",
   "texto": "73 de cada 100",
   "definicion": "veces de cada 100 que el piloto ve 8,82 puntos en la rama sin descuento"
  },
  "G68.potencia_con_descuento": {
   "valor": 89.02651044781908,
   "unidad": "de cada 100",
   "texto": "89 de cada 100",
   "definicion": "veces de cada 100 que el piloto ve 11,04 puntos en la rama con descuento"
  },
  "G68.potencia_juntas": {
   "valor": 83.63670150968409,
   "unidad": "de cada 100",
   "texto": "84 de cada 100",
   "definicion": "veces de cada 100 que el primer paso ve 8,82 puntos con las dos ramas juntas"
  },
  "G68.clientes_por_grupo": {
   "valor": 44661,
   "unidad": "clientes",
   "texto": "44.661",
   "definicion": "clientes por grupo para ver la diferencia con la tasa observada"
  },
  "G68.fuera_del_20_por_mes": {
   "valor": 351.1111111111111,
   "unidad": "clientes",
   "texto": "351",
   "definicion": "clientes por mes de la lista fuera del 20 % de mayor facturación"
  },
  "G69.medicion": {
   "valor": 1552.4999999999998,
   "unidad": "USD",
   "texto": "USD 1.552,50",
   "definicion": "valor de la información: lo que cuesta medir"
  },
  "G69.resto": {
   "valor": 2932.5,
   "unidad": "USD",
   "texto": "USD 2.932,50",
   "definicion": "resto del piloto: planilla, capacitación y consentimiento"
  },
  "G61.cruce_control": {
   "valor": 0.7740506329113924,
   "unidad": "fracción",
   "texto": "77,41 %",
   "definicion": "cruce del umbral a 90 días sin contacto, fuera del 20 %"
  },
  "G31": {
   "valor": 0.01019108280254777,
   "unidad": "fracción",
   "texto": "1,02 %",
   "definicion": "tasa de éxito observada: compra a 7 días cerca del umbral, sin grupo de control"
  },
  "G34.regla": {
   "valor": 299.49458286919696,
   "unidad": "USD por año",
   "texto": "USD 299,49 por año",
   "definicion": "lo que deja la regla por año, lista de 500 sin filtro"
  },
  "G34.modelo": {
   "valor": 304.8725969666271,
   "unidad": "USD por año",
   "texto": "USD 304,87 por año",
   "definicion": "lo que deja el modelo por año, lista de 500 sin filtro"
  },
  "G34.incremental": {
   "valor": 5.378014097430152,
   "unidad": "USD por año",
   "texto": "USD 5,38 por año",
   "definicion": "lo que suma el modelo sobre la regla por año"
  },
  "G41": {
   "valor": -98.52174440834553,
   "unidad": "%",
   "texto": "−98,52 %",
   "definicion": "ROI a un año de la regla sin filtro"
  },
  "G40": {
   "valor": 10400.0,
   "unidad": "USD",
   "texto": "USD 10.400",
   "definicion": "costo que el modelo agrega al año 1"
  },
  "G40.roi": {
   "valor": -99.94828832598624,
   "unidad": "%",
   "texto": "−99,95 %",
   "definicion": "ROI a un año del modelo sobre la regla"
  },
  "G38": {
   "valor": 30660.0,
   "unidad": "USD",
   "texto": "USD 30.660",
   "definicion": "costo del año 1 con modelo"
  },
  "C28": {
   "valor": 30000.0,
   "unidad": "USD",
   "texto": "USD 30.000",
   "definicion": "presupuesto declarado por Casa Óga"
  },
  "G54": {
   "valor": 264.5374912359015,
   "unidad": "USD por año",
   "texto": "USD 264,54 por año",
   "definicion": "lo que deja la lista de 500 contactables por año"
  },
  "G54.roi": {
   "valor": -98.69428681522261,
   "unidad": "%",
   "texto": "−98,69 %",
   "definicion": "ROI a un año del piloto mínimo más la producción completa"
  },
  "G58": {
   "valor": 13.608657068535127,
   "unidad": "veces",
   "texto": "13,6",
   "definicion": "veces que el recurrente de la operación mínima supera lo que deja la lista"
  },
  "E3A-01.min": {
   "valor": 301.4492876637676,
   "unidad": "USD por año",
   "texto": "USD 301,45 por año",
   "definicion": "lo que deja la regla por año, lista proporcional, trimestre × 4: mínimo"
  },
  "E3A-01.max": {
   "valor": 335.77991713611556,
   "unidad": "USD por año",
   "texto": "USD 335,78 por año",
   "definicion": "ídem, máximo"
  },
  "E3A-01.doce_min": {
   "valor": 319.77354736192717,
   "unidad": "USD por año",
   "texto": "USD 319,77 por año",
   "definicion": "ídem, doce meses seguidos: mínimo"
  },
  "E3A-01.doce_max": {
   "valor": 321.41655443016816,
   "unidad": "USD por año",
   "texto": "USD 321,42 por año",
   "definicion": "ídem, doce meses seguidos: máximo"
  },
  "E3A-04.min": {
   "valor": -5.393870152710633,
   "unidad": "USD por año",
   "texto": "USD −5,39 por año",
   "definicion": "incremental del modelo sobre la regla, trimestre × 4: mínimo"
  },
  "E3A-04.max": {
   "valor": 6.821442897740013,
   "unidad": "USD por año",
   "texto": "USD 6,82 por año",
   "definicion": "ídem, máximo"
  },
  "E3A-05.min": {
   "valor": -98.51209630965563,
   "unidad": "%",
   "texto": "−98,51 %",
   "definicion": "ROI de la regla con la lista proporcional: mínimo"
  },
  "E3A-05.max": {
   "valor": -98.34264601611,
   "unidad": "%",
   "texto": "−98,34 %",
   "definicion": "ídem, máximo"
  },
  "G63.semana_1": {
   "valor": "2026-11-30",
   "unidad": "fecha",
   "texto": "30/11/2026",
   "definicion": "lunes de la semana 1 si María G. aprueba con la entrega del 24/11/2026"
  },
  "G63.primera_lista": {
   "valor": "2027-01-04",
   "unidad": "fecha",
   "texto": "04/01/2027",
   "definicion": "primera lista: lunes de la semana 6"
  },
  "G63.primera_lista_hasta": {
   "valor": "2027-01-14",
   "unidad": "fecha",
   "texto": "14/01/2027",
   "definicion": "primera lista: a más tardar"
  },
  "G63.tercera_lista": {
   "valor": "2027-03-01",
   "unidad": "fecha",
   "texto": "01/03/2027",
   "definicion": "tercera lista: lunes de la semana 14"
  },
  "G63.preliminar": {
   "valor": "2027-04-12",
   "unidad": "fecha",
   "texto": "12/04/2027",
   "definicion": "informe preliminar: semana 20"
  },
  "G63.decision": {
   "valor": "2027-06-07",
   "unidad": "fecha",
   "texto": "07/06/2027",
   "definicion": "decisión: lunes de la semana 28"
  },
  "G63.semana_decision": {
   "valor": 28,
   "unidad": "semana",
   "texto": "28",
   "definicion": "semana de la decisión"
  },
  "G63.recurrente_espera": {
   "valor": 0.0,
   "unidad": "USD",
   "texto": "USD 0",
   "definicion": "costo recurrente de las semanas 19 a 28"
  },
  "F09": {
   "valor": 0.8157777777777778,
   "unidad": "fracción",
   "texto": "81,6 %",
   "definicion": "precisión de la lista de 500 de la regla, validación sin filtro"
  },
  "F07": {
   "valor": 0.36159259259259263,
   "unidad": "fracción",
   "texto": "36,2 %",
   "definicion": "precisión de la lista de 500 de la práctica actual, validación sin filtro"
  },
  "H05": {
   "valor": 0.826,
   "unidad": "fracción",
   "texto": "82,6 %",
   "definicion": "precisión de la lista de 500 de la logística ajustada, validación sin filtro"
  },
  "H16": {
   "valor": 0.758,
   "unidad": "fracción",
   "texto": "75,8 %",
   "definicion": "precisión de la lista de 500 contactables de la regla, validación"
  },
  "H15": {
   "valor": 0.7386666666666667,
   "unidad": "fracción",
   "texto": "73,9 %",
   "definicion": "precisión de la lista de 500 contactables de la logística ajustada, validación"
  },
  "H13": {
   "valor": 0.32761904761904764,
   "unidad": "fracción",
   "texto": "32,8 %",
   "definicion": "precisión de la lista de 500 contactables de la práctica actual, validación"
  },
  "J03.regla": {
   "valor": 0.86134,
   "unidad": "fracción",
   "texto": "86,13 %",
   "definicion": "precisión de la lista de 500 contactables de la regla, test"
  },
  "J03.logistica": {
   "valor": 0.8588,
   "unidad": "fracción",
   "texto": "85,88 %",
   "definicion": "precisión de la lista de 500 contactables de la logística ajustada, test"
  },
  "J17": {
   "valor": 0.37588363636363636,
   "unidad": "fracción",
   "texto": "37,6 %",
   "definicion": "precisión de la lista de 500 contactables de la práctica actual, test"
  },
  "J09": {
   "valor": -0.25399999999999867,
   "unidad": "puntos",
   "texto": "−0,25 puntos",
   "definicion": "logística menos regla en test, lista de 500 contactables: empate"
  },
  "J09.ic_inferior": {
   "valor": -1.4505476190476299,
   "unidad": "puntos",
   "texto": "−1,45 puntos",
   "definicion": "límite inferior del intervalo del 95 %"
  },
  "J09.ic_superior": {
   "valor": 0.7871333333333459,
   "unidad": "puntos",
   "texto": "0,79 puntos",
   "definicion": "límite superior del intervalo del 95 %"
  },
  "J09.replicas": {
   "valor": 0.31,
   "unidad": "fracción",
   "texto": "31,0 %",
   "definicion": "réplicas a favor del modelo"
  },
  "J02.tasa": {
   "valor": 0.25346562521990007,
   "unidad": "fracción",
   "texto": "25,35 %",
   "definicion": "tasa de positivos del test (se van en 90 días)"
  },
  "J02.contactables": {
   "valor": 9962,
   "unidad": "filas",
   "texto": "9.962",
   "definicion": "filas contactables del test"
  },
  "F16": {
   "valor": 2.25,
   "unidad": "de 3",
   "texto": "2,25",
   "definicion": "puntaje técnico de la A 1.2, promedio de las cuatro condiciones"
  },
  "G10": {
   "valor": 4636,
   "unidad": "filas",
   "texto": "4.636",
   "definicion": "positivos para entrenar (entrenamiento con embargo)"
  },
  "C19": {
   "valor": 44.79,
   "unidad": "%",
   "texto": "44,8 %",
   "definicion": "ventas sin cliente identificado"
  },
  "H40": {
   "valor": 1.8,
   "unidad": "de 3",
   "texto": "1,8",
   "definicion": "puntaje legal del estado actual, promedio de cinco dimensiones"
  },
  "F14.archivos": {
   "valor": 15,
   "unidad": "archivos",
   "texto": "15",
   "definicion": "archivos del inventario de la A 1.4"
  },
  "F14.criticos": {
   "valor": 2,
   "unidad": "archivos",
   "texto": "2",
   "definicion": "archivos críticos (sin ellos no hay target)"
  },
  "F14.utiles": {
   "valor": 8,
   "unidad": "archivos",
   "texto": "8",
   "definicion": "archivos útiles (aportan variables o arman la lista)"
  },
  "F14.opcionales": {
   "valor": 5,
   "unidad": "archivos",
   "texto": "5",
   "definicion": "archivos opcionales (el modelo funciona sin ellos)"
  },
  "H50.parte": {
   "valor": 0.29773719730051607,
   "unidad": "fracción",
   "texto": "29,8 %",
   "definicion": "parte de los contactables que ocupa la lista en cada corte (la de 500 en validación)"
  },
  "H50.contactables_validacion": {
   "valor": 5038,
   "unidad": "clientes",
   "texto": "5.038",
   "definicion": "contactables de validación"
  },
  "H50.min": {
   "valor": 51.4030591356468,
   "unidad": "puntos",
   "texto": "51,4 puntos",
   "definicion": "cruce a 90 días de la lista menos el de toda la base elegible: mínimo de la referencia"
  },
  "H50.max": {
   "valor": 55.34926359754662,
   "unidad": "puntos",
   "texto": "55,3 puntos",
   "definicion": "ídem, máximo de la referencia"
  },
  "H50.validacion": {
   "valor": 53.187399673046635,
   "unidad": "puntos",
   "texto": "53,2 puntos",
   "definicion": "ídem, en validación (no se cita en la C)"
  },
  "E3A-07.filas_sin": {
   "valor": 59585,
   "unidad": "filas",
   "texto": "59.585",
   "definicion": "filas elegibles del v0.2 sin contar la compra devuelta"
  },
  "E3A-07.filas_con": {
   "valor": 60432,
   "unidad": "filas",
   "texto": "60.432",
   "definicion": "filas elegibles contándola"
  },
  "E3A-07.precision_con": {
   "valor": 82.33555555555556,
   "unidad": "%",
   "texto": "82,34 %",
   "definicion": "precisión de la lista de 500 de la regla en validación, contándola"
  },
  "E3A-07.variacion_cortes": {
   "valor": 2.6666666666666714,
   "unidad": "puntos",
   "texto": "2,67 puntos",
   "definicion": "variación de esa precisión entre los tres cortes de validación"
  },
  "K01": {
   "valor": 8,
   "unidad": "cantidad",
   "texto": "8",
   "definicion": "épicas del backlog: las ocho de la tabla de épicas del E1 C 3.1"
  },
  "K02": {
   "valor": 21,
   "unidad": "cantidad",
   "texto": "21",
   "definicion": "historias de usuario del backlog detallado (HU-<épica>-nn, hasta 3 por épica)"
  },
  "K03": {
   "valor": 63,
   "unidad": "cantidad",
   "texto": "63",
   "definicion": "criterios de aceptación sumando las 21 historias"
  },
  "K04": {
   "valor": 9,
   "unidad": "cantidad",
   "texto": "9",
   "definicion": "historias hechas en la cursada, cada una con la sección entregada que la muestra"
  },
  "K05": {
   "valor": 9,
   "unidad": "cantidad",
   "texto": "9",
   "definicion": "historias por hacer del piloto mínimo (semanas 1 a 28)"
  },
  "K06": {
   "valor": 3,
   "unidad": "cantidad",
   "texto": "3",
   "definicion": "historias de la operación mínima o la producción completa, solo si el piloto pasa"
  },
  "K07": {
   "valor": 80,
   "unidad": "horas",
   "texto": "80",
   "definicion": "horas del equipo de las historias del piloto mínimo; igual a las 80 horas de los USD 4.485 (G64)"
  },
  "K08": {
   "valor": 24,
   "unidad": "horas",
   "texto": "24",
   "definicion": "horas de planilla de la regla y guía de corrida (HU-2-02, HU-4-02, HU-4-03, HU-8-02)"
  },
  "K09": {
   "valor": 20,
   "unidad": "horas",
   "texto": "20",
   "definicion": "horas de adecuación legal del equipo: L4 4, L5 8, L3 8 (HU-7-01 a HU-7-03)"
  },
  "K10": {
   "valor": 36,
   "unidad": "horas",
   "texto": "36",
   "definicion": "horas de sorteo, medición e informes: 32 h + 4 h (HU-6-02, HU-6-03)"
  },
  "K11": {
   "valor": null,
   "unidad": "texto",
   "texto": "HU-2-02 6, HU-4-02 12, HU-4-03 2, HU-6-02 12, HU-6-03 24, HU-7-01 4, HU-7-02 8, HU-7-03 8, HU-8-02 4",
   "definicion": "horas por historia del piloto mínimo, en la tabla de estimación"
  },
  "K12": {
   "valor": 40,
   "unidad": "horas",
   "texto": "40",
   "definicion": "horas de la tabla de identidad rehecha: una semana de analista (USD 1.500 más 15 % = USD 1.725)"
  },
  "K13": {
   "valor": 4,
   "unidad": "cantidad",
   "texto": "4",
   "definicion": "sprints de la cursada: cuatro sprints y una semana de cierre (E1 C 2.1 y 2.3)"
  },
  "K14": {
   "valor": null,
   "unidad": "texto",
   "texto": "2, 3, 4, 1, 13, 10",
   "definicion": "duración en semanas de cada fase del plan, contada desde su rango"
  },
  "K15": {
   "valor": null,
   "unidad": "texto",
   "texto": "1: 30/11 al 06/12/2026; 2: 07/12 al 13/12/2026; 4: 21/12 al 27/12/2026; 6: 04/01 al 10/01/2027",
   "definicion": "fechas de referencia de las semanas 1, 2, 4 y 6 si María G. aprueba con esta entrega (semana 1 = 30/11/2026)"
  },
  "K16": {
   "valor": 153,
   "unidad": "cantidad",
   "texto": "153",
   "definicion": "clientes de la lista de muestra en el 20 % de mayor facturación del corte"
  },
  "K17": {
   "valor": 347,
   "unidad": "cantidad",
   "texto": "347",
   "definicion": "clientes de la lista de muestra fuera de ese 20 % (500 − 153)"
  },
  "K18": {
   "valor": null,
   "unidad": "texto",
   "texto": "124 y 123",
   "definicion": "clientes de cada rama de la lista de muestra (con 15 % de descuento y sin descuento); impar: la rama con descuento lleva uno más"
  },
  "K19": {
   "valor": 247,
   "unidad": "cantidad",
   "texto": "247",
   "definicion": "clientes repartidos en las dos ramas (347 − 100 de control)"
  },
  "K20": {
   "valor": 3,
   "unidad": "cantidad",
   "texto": "3",
   "definicion": "criterios de aceptación por historia"
  },
  "K21": {
   "valor": 3450,
   "unidad": "USD",
   "texto": "USD 3.450",
   "definicion": "estimación de HU-2-03 (exportación automática): la línea «sprint de integración / ETL» de la producción completa, USD 3.000 más 15 % de contingencia, dentro de los USD 9.775 (G65)"
  },
  "K22": {
   "valor": 3565,
   "unidad": "USD",
   "texto": "USD 3.565",
   "definicion": "estimación de HU-5-02 (tablero del mes y corrida con un comando): la línea «data scientist: tablero del directorio y corrida con un comando» de la producción completa, USD 3.100 más 15 %, dentro de los USD 9.775 (G65)"
  },
  "K23": {
   "valor": 7,
   "unidad": "cantidad",
   "texto": "7",
   "definicion": "historias del piloto mínimo que bloquean la primera lista: las que terminan en la semana 5 o antes"
  },
  "K24": {
   "valor": 44,
   "unidad": "horas",
   "texto": "44",
   "definicion": "horas del equipo de las 7 historias que bloquean la primera lista (planilla y guía 24, legal 20)"
  },
  "C20.crudo": {
   "valor": 50250,
   "unidad": "filas",
   "texto": "50.250",
   "definicion": "filas del extracto de ventas tal como llegó"
  },
  "C20.unicas": {
   "valor": 50000,
   "unidad": "filas",
   "texto": "50.000",
   "definicion": "filas sin duplicados de fila completa"
  },
  "C20.con_cliente": {
   "valor": 27606,
   "unidad": "filas",
   "texto": "27.606",
   "definicion": "filas con cliente identificado"
  },
  "C20.positivas": {
   "valor": 27276,
   "unidad": "filas",
   "texto": "27.276",
   "definicion": "filas con cliente y monto positivo"
  },
  "C20.repetidas": {
   "valor": 250,
   "unidad": "filas",
   "texto": "250",
   "definicion": "filas repetidas que se sacan"
  },
  "C20.sin_cliente": {
   "valor": 22394,
   "unidad": "filas",
   "texto": "22.394",
   "definicion": "filas sin cliente identificado: quedan fuera de la lista"
  },
  "C20.no_positivas": {
   "valor": 330,
   "unidad": "filas",
   "texto": "330",
   "definicion": "filas con cliente y monto no positivo (devoluciones): no suman facturación"
  },
  "H46.umbral_mes": {
   "valor": 0.6,
   "unidad": "fracción",
   "texto": "60 %",
   "definicion": "un mes con menos de esta parte de las operaciones del mismo mes del año anterior no se usa"
  },
  "D28.ops_2025-01": {
   "valor": 1390,
   "unidad": "operaciones",
   "texto": "1.390",
   "definicion": "operaciones de 2025-01"
  },
  "D28.ops_2025-12": {
   "valor": 255,
   "unidad": "operaciones",
   "texto": "255",
   "definicion": "operaciones de 2025-12"
  },
  "D28.parte_2025-08": {
   "valor": 0.6294552790854069,
   "unidad": "fracción",
   "texto": "63 %",
   "definicion": "operaciones de 2025-08 sobre las del mismo mes de 2024"
  },
  "D28.parte_2025-09": {
   "valor": 0.5346467391304348,
   "unidad": "fracción",
   "texto": "53 %",
   "definicion": "operaciones de 2025-09 sobre las del mismo mes de 2024"
  },
  "D28.parte_2025-10": {
   "valor": 0.43928334439283345,
   "unidad": "fracción",
   "texto": "44 %",
   "definicion": "operaciones de 2025-10 sobre las del mismo mes de 2024"
  },
  "D28.parte_2025-11": {
   "valor": 0.3624161073825503,
   "unidad": "fracción",
   "texto": "36 %",
   "definicion": "operaciones de 2025-11 sobre las del mismo mes de 2024"
  },
  "D28.parte_2025-12": {
   "valor": 0.17970401691331925,
   "unidad": "fracción",
   "texto": "18 %",
   "definicion": "operaciones de 2025-12 sobre las del mismo mes de 2024"
  },
  "D28.meses_fuera": {
   "valor": 4,
   "unidad": "meses",
   "texto": "4",
   "definicion": "meses de 2025 debajo del umbral del mes (septiembre a diciembre)"
  },
  "F04.menos30": {
   "valor": 0.9170812603648425,
   "unidad": "fracción",
   "texto": "91,7 %",
   "definicion": "tasa de positivos en validación a menos de 30 días de cruzar el umbral"
  },
  "F04.30a59": {
   "valor": 0.7617765814266487,
   "unidad": "fracción",
   "texto": "76,2 %",
   "definicion": "tasa de positivos en validación a 30 a 59 días de cruzar el umbral"
  },
  "F04.60a89": {
   "valor": 0.6549062844542448,
   "unidad": "fracción",
   "texto": "65,5 %",
   "definicion": "tasa de positivos en validación a 60 a 89 días de cruzar el umbral"
  },
  "F04.90mas": {
   "valor": 0.0,
   "unidad": "fracción",
   "texto": "0,0 %",
   "definicion": "tasa de positivos en validación a 90 o más días de cruzar el umbral"
  },
  "F04.horizonte": {
   "valor": 90,
   "unidad": "días",
   "texto": "90",
   "definicion": "días de la ventana del cruce (a partir de ahí no hay positivos)"
  },
  "F03.lejos": {
   "valor": 0.6651338424100025,
   "unidad": "fracción",
   "texto": "66,5 %",
   "definicion": "parte de las filas a 90 días o más de cruzar su umbral, sin positivos"
  },
  "C03.minimo_dias": {
   "valor": 90,
   "unidad": "días",
   "texto": "90",
   "definicion": "umbral del cliente: días mínimos"
  },
  "C03.factor": {
   "valor": 1.5,
   "unidad": "veces",
   "texto": "1,5",
   "definicion": "umbral del cliente: veces el intervalo mediano entre compras"
  },
  "G64.planilla": {
   "valor": 900.0,
   "unidad": "USD",
   "texto": "USD 900",
   "definicion": "Planilla de la regla y guía de corrida"
  },
  "G64.legal": {
   "valor": 750.0,
   "unidad": "USD",
   "texto": "USD 750",
   "definicion": "Adecuación legal del equipo (L3, L4 y L5)"
  },
  "G64.medicion": {
   "valor": 1350.0,
   "unidad": "USD",
   "texto": "USD 1.350",
   "definicion": "Sorteo, medición e informes del piloto"
  },
  "G64.taller": {
   "valor": 900.0,
   "unidad": "USD",
   "texto": "USD 900",
   "definicion": "Un taller con el equipo de Sofía R. y quien corre la planilla (semana 5)"
  },
  "G64.horas_por_lista": {
   "valor": 8.0,
   "unidad": "horas",
   "texto": "8",
   "definicion": "horas de la persona de Marketing por lista"
  },
  "G49.descuento": {
   "valor": 0.15,
   "unidad": "fracción",
   "texto": "15 %",
   "definicion": "descuento de la rama con descuento"
  },
  "G49.alto_valor": {
   "valor": 0.2,
   "unidad": "fracción",
   "texto": "20 %",
   "definicion": "el grupo de mayor facturación que se contacta entero (sin control)"
  },
  "K18.con_descuento": {
   "valor": 124,
   "unidad": "clientes",
   "texto": "124",
   "definicion": "lista de muestra: rama con descuento"
  },
  "K18.sin_descuento": {
   "valor": 123,
   "unidad": "clientes",
   "texto": "123",
   "definicion": "lista de muestra: rama sin descuento"
  }
 },
 "tablas": {
  "condiciones": [
   {
    "id": "datos",
    "nombre": "Datos suficientes",
    "puntaje": 3
   },
   {
    "id": "calidad",
    "nombre": "Calidad utilizable",
    "puntaje": 2
   },
   {
    "id": "infraestructura",
    "nombre": "Infraestructura",
    "puntaje": 2
   },
   {
    "id": "capacidad_humana",
    "nombre": "Capacidad humana",
    "puntaje": 2
   }
  ],
  "escala_tecnica": {
   "hasta": 3
  },
  "legal": [
   {
    "id": "proteccion_datos",
    "nombre": "Protección de datos personales",
    "puntaje": 1
   },
   {
    "id": "seguridad",
    "nombre": "Seguridad y control de accesos",
    "puntaje": 2
   },
   {
    "id": "conservacion",
    "nombre": "Conservación y trazabilidad fiscal",
    "puntaje": 2
   },
   {
    "id": "contratos",
    "nombre": "Contratos con proveedores externos",
    "puntaje": 2
   },
   {
    "id": "explicabilidad",
    "nombre": "Explicabilidad del modelo (IA)",
    "puntaje": 2
   }
  ],
  "umbral_de_pase": [
   {
    "etapa": "operacion_minima",
    "horizonte": "primer_anio_con_la_inversion_que_queda",
    "rotulo": "operación mínima, primer año",
    "decide": true,
    "costo_usd": 5325.0,
    "con_descuento_pp": 11.039972646467884,
    "sin_descuento_pp": 8.822337194120351
   },
   {
    "etapa": "operacion_minima",
    "horizonte": "solo_recurrente",
    "rotulo": "operación mínima, solo recurrente",
    "decide": false,
    "costo_usd": 3600.0,
    "con_descuento_pp": 7.545588219466085,
    "sin_descuento_pp": 6.018515107104857
   },
   {
    "etapa": "produccion_completa",
    "horizonte": "primer_anio_con_la_inversion_que_queda",
    "rotulo": "producción completa, primer año",
    "decide": false,
    "costo_usd": 15775.0,
    "con_descuento_pp": 32.20885221873965,
    "sin_descuento_pp": 25.807810127054786
   },
   {
    "etapa": "produccion_completa",
    "horizonte": "solo_recurrente",
    "rotulo": "producción completa, solo recurrente (referencia)",
    "decide": false,
    "costo_usd": 6000.0,
    "con_descuento_pp": 12.407340465729456,
    "sin_descuento_pp": 9.919484967300326
   }
  ],
  "calendario": {
   "semana_1": "2026-11-30",
   "semana_1_hasta": "2026-12-06",
   "regla": "la semana 1 empieza el lunes siguiente a la aprobación escrita de María G.; fechas de referencia si aprueba con la entrega del 24/11/2026",
   "primera_lista": {
    "semana": 6,
    "lunes": "2027-01-04",
    "corte": "2026-12-31",
    "hasta": "2027-01-14"
   },
   "tercera_lista": {
    "semana": 14,
    "lunes": "2027-03-01",
    "corte": "2027-02-28",
    "cierre_90d": "2027-05-29",
    "semana_cierre_90d": 26
   },
   "primera_lista_cierre_90d": {
    "fecha": "2027-03-31",
    "semana": 18
   },
   "preliminar": {
    "semana": 20,
    "lunes": "2027-04-12"
   },
   "final": {
    "semana": 28,
    "lunes": "2027-06-07"
   },
   "semanas_19_a_28": 10,
   "recurrente_semanas_19_a_28_usd": 0.0,
   "recurrente_semanas_19_a_28_si_siguiera_la_completa_usd": 1153.8461538461538
  },
  "ventas_2025": {
   "anio": 2025,
   "anio_anterior": 2024,
   "umbral": 0.6,
   "meses": [
    {
     "mes": "2025-01",
     "rotulo": "ene",
     "operaciones": 1390,
     "anio_anterior": 1480,
     "parte": 0.9391891891891891,
     "se_usa": true
    },
    {
     "mes": "2025-02",
     "rotulo": "feb",
     "operaciones": 1265,
     "anio_anterior": 1320,
     "parte": 0.9583333333333334,
     "se_usa": true
    },
    {
     "mes": "2025-03",
     "rotulo": "mar",
     "operaciones": 1332,
     "anio_anterior": 1441,
     "parte": 0.9243580846634282,
     "se_usa": true
    },
    {
     "mes": "2025-04",
     "rotulo": "abr",
     "operaciones": 1259,
     "anio_anterior": 1413,
     "parte": 0.8910120311394196,
     "se_usa": true
    },
    {
     "mes": "2025-05",
     "rotulo": "may",
     "operaciones": 1176,
     "anio_anterior": 1461,
     "parte": 0.8049281314168378,
     "se_usa": true
    },
    {
     "mes": "2025-06",
     "rotulo": "jun",
     "operaciones": 1052,
     "anio_anterior": 1505,
     "parte": 0.6990033222591362,
     "se_usa": true
    },
    {
     "mes": "2025-07",
     "rotulo": "jul",
     "operaciones": 1035,
     "anio_anterior": 1491,
     "parte": 0.6941649899396378,
     "se_usa": true
    },
    {
     "mes": "2025-08",
     "rotulo": "ago",
     "operaciones": 936,
     "anio_anterior": 1487,
     "parte": 0.6294552790854069,
     "se_usa": true
    },
    {
     "mes": "2025-09",
     "rotulo": "sep",
     "operaciones": 787,
     "anio_anterior": 1472,
     "parte": 0.5346467391304348,
     "se_usa": false
    },
    {
     "mes": "2025-10",
     "rotulo": "oct",
     "operaciones": 662,
     "anio_anterior": 1507,
     "parte": 0.43928334439283345,
     "se_usa": false
    },
    {
     "mes": "2025-11",
     "rotulo": "nov",
     "operaciones": 486,
     "anio_anterior": 1341,
     "parte": 0.3624161073825503,
     "se_usa": false
    },
    {
     "mes": "2025-12",
     "rotulo": "dic",
     "operaciones": 255,
     "anio_anterior": 1419,
     "parte": 0.17970401691331925,
     "se_usa": false
    }
   ]
  },
  "tramos_de_cruce": [
   {
    "tramo": "menos de 30",
    "filas": 603,
    "positivos": 553,
    "tasa": 0.9170812603648425
   },
   {
    "tramo": "30 a 59",
    "filas": 743,
    "positivos": 566,
    "tasa": 0.7617765814266487
   },
   {
    "tramo": "60 a 89",
    "filas": 907,
    "positivos": 594,
    "tasa": 0.6549062844542448
   },
   {
    "tramo": "90 o más",
    "filas": 4920,
    "positivos": 0,
    "tasa": 0.0
   }
  ],
  "lista_muestra": {
   "corte": "2025-08-31",
   "largo": 500,
   "alto_valor": 153,
   "control": 100,
   "con_descuento": 124,
   "sin_descuento": 123
  },
  "backlog": {
   "epicas": [
    {
     "n": 1,
     "nombre": "Relevamiento y definición de churn"
    },
    {
     "n": 2,
     "nombre": "Base analítica y calidad de datos"
    },
    {
     "n": 3,
     "nombre": "Modelo de scoring y validación"
    },
    {
     "n": 4,
     "nombre": "Lista mensual con la regla del umbral"
    },
    {
     "n": 5,
     "nombre": "Tablero de riesgo en pesos"
    },
    {
     "n": 6,
     "nombre": "Diseño del piloto con grupo de control"
    },
    {
     "n": 7,
     "nombre": "Consentimiento, accesos y Ley 25.326"
    },
    {
     "n": 8,
     "nombre": "Datos que faltan y handoff"
    }
   ],
   "historias": [
    {
     "id": "HU-1-01",
     "epica": 1,
     "grupo": "hecha"
    },
    {
     "id": "HU-1-02",
     "epica": 1,
     "grupo": "hecha"
    },
    {
     "id": "HU-2-01",
     "epica": 2,
     "grupo": "hecha"
    },
    {
     "id": "HU-2-02",
     "epica": 2,
     "grupo": "piloto"
    },
    {
     "id": "HU-2-03",
     "epica": 2,
     "grupo": "despues"
    },
    {
     "id": "HU-3-01",
     "epica": 3,
     "grupo": "hecha"
    },
    {
     "id": "HU-3-02",
     "epica": 3,
     "grupo": "hecha"
    },
    {
     "id": "HU-4-01",
     "epica": 4,
     "grupo": "hecha"
    },
    {
     "id": "HU-4-02",
     "epica": 4,
     "grupo": "piloto"
    },
    {
     "id": "HU-4-03",
     "epica": 4,
     "grupo": "piloto"
    },
    {
     "id": "HU-5-01",
     "epica": 5,
     "grupo": "hecha"
    },
    {
     "id": "HU-5-02",
     "epica": 5,
     "grupo": "despues"
    },
    {
     "id": "HU-6-01",
     "epica": 6,
     "grupo": "hecha"
    },
    {
     "id": "HU-6-02",
     "epica": 6,
     "grupo": "piloto"
    },
    {
     "id": "HU-6-03",
     "epica": 6,
     "grupo": "piloto"
    },
    {
     "id": "HU-7-01",
     "epica": 7,
     "grupo": "piloto"
    },
    {
     "id": "HU-7-02",
     "epica": 7,
     "grupo": "piloto"
    },
    {
     "id": "HU-7-03",
     "epica": 7,
     "grupo": "piloto"
    },
    {
     "id": "HU-8-01",
     "epica": 8,
     "grupo": "hecha"
    },
    {
     "id": "HU-8-02",
     "epica": 8,
     "grupo": "piloto"
    },
    {
     "id": "HU-8-03",
     "epica": 8,
     "grupo": "despues"
    }
   ]
  },
  "plan": {
   "semanas": 28,
   "fases": [
    {
     "n": 1,
     "fase": "Precondiciones de gobierno",
     "desde": 1,
     "hasta": 2,
     "responsable": "Sebastian C."
    },
    {
     "n": 2,
     "fase": "Datos del piloto",
     "desde": 1,
     "hasta": 3,
     "responsable": "Matías S."
    },
    {
     "n": 3,
     "fase": "Planilla de la regla y guía de corrida",
     "desde": 1,
     "hasta": 4,
     "responsable": "Sebastian C."
    },
    {
     "n": 4,
     "fase": "Corrida de prueba y capacitación",
     "desde": 5,
     "hasta": 5,
     "responsable": "Sebastian C."
    },
    {
     "n": 5,
     "fase": "Piloto: envío de las tres listas",
     "desde": 6,
     "hasta": 18,
     "responsable": "Sofía R."
    },
    {
     "n": 6,
     "fase": "Medición a 90 días y decisión",
     "desde": 19,
     "hasta": 28,
     "responsable": "Juan Manuel R."
    }
   ],
   "hitos": [
    {
     "n": 1,
     "semana": 1,
     "responsable": "María G."
    },
    {
     "n": 2,
     "semana": 1,
     "responsable": "María G."
    },
    {
     "n": 3,
     "semana": 2,
     "responsable": "María G.; designa Sofía R."
    },
    {
     "n": 4,
     "semana": 4,
     "responsable": "María G."
    },
    {
     "n": 5,
     "semana": 4,
     "responsable": "Sofía R."
    },
    {
     "n": 6,
     "semana": 6,
     "responsable": "Matías S."
    },
    {
     "n": 7,
     "semana": 6,
     "responsable": "María G."
    },
    {
     "n": 8,
     "semana": 14,
     "responsable": "Sofía R."
    },
    {
     "n": 9,
     "semana": 20,
     "responsable": "Juan Manuel R."
    },
    {
     "n": 10,
     "semana": 28,
     "responsable": "María G."
    }
   ]
  },
  "legal_previas": {
   "n": 5,
   "acciones": [
    {
     "codigo": "L4",
     "semana": 1
    },
    {
     "codigo": "L1",
     "semana": 2
    },
    {
     "codigo": "L5",
     "semana": 2
    },
    {
     "codigo": "L6",
     "semana": 4
    },
    {
     "codigo": "L3",
     "semana": 4
    }
   ]
  },
  "riesgos_criticos": {
   "n": 3
  }
 }
};

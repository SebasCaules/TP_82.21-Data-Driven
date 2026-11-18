// Notas del orador de /final/ (tecla N). NO SE EDITA A MANO: lo escribe
// entregas/presentacion-final/_build/F/dossiers/guion-presentacion-final/exportar_notas.py desde guion.py (canon v1.3,
// tableros.notas_v1_3: una sola fuente para lo que se dice). Por vista, las frases que no se saltan en la versión de
// 15 minutos, con las cifras resueltas por cifras.py; el pase del bloque cierra su última vista. Lo lee Notas.jsx.
// scripts/check_final_f6.py compara este archivo con guion.py cuando el vault está.

export const NOTAS = {
  "V01": [
    "Buenas tardes, María, Carlos. No recomendamos invertir en el proyecto, sino USD 4.485 en un piloto con grupo de control. La regla ya acierta quién está por dejar de comprar, 86 de cada 100 en la prueba final, sin modelo. Lo que nadie midió es si contactarlo lo retiene. Con lo que hoy se observa, la lista deja USD 265 por año y cuesta USD 20.260 el primero. El piloto, tres listas mensuales, dice en 28 semanas si contactar retiene lo suficiente para pagar la lista. Hoy Casa Óga ya manda campañas por WhatsApp, mail y SMS. Y ustedes nos dijeron que «Hoy pesa más sostener a los que ya compran» [[(envío 1)]]. Pero esas campañas salieron sin grupo de control. Nadie puede decir si el contacto cambió algo. Matías muestra los datos; Francisco, la regla y el piloto; Juan Manuel, los números. Yo vuelvo con lo legal, y Sebastian cierra con el plan y lo que les pedimos.",
    "Matías, ¿con qué datos se arma esa lista?"
  ],
  "V02": [
    "Lucía, los extractos «se armaron exportando manualmente de cada sistema de origen» [[(envío 47)]]. Llegaron **15** archivos. El de ventas es crítico: sin él no sabemos quién se va.",
    "En las ventas, **22.394** filas no tienen cliente: son el **44,8 %** del total. Esas ventas no se pueden atribuir a nadie. No las imputamos: quedan fuera de la lista y lo decimos.",
    "Desde el piloto, la planilla cuenta la compra devuelta como actividad: ese día el cliente compró. De ahí sale la base de la lista: **27.276** ventas que tienen cliente y monto mayor que cero. Con eso, la condición de datos suficientes tiene **3 de 3**.",
    "La calidad queda en **2 de 3**, porque hay que corregir antes de usar."
  ],
  "V03": [
    "El segundo problema es de fechas. Cada mes lo comparamos con el mismo mes del año anterior. Si tiene menos del **60 %** de las operaciones, lo tomamos como incompleto y no se usa.",
    "En 2025 quedan debajo **4** meses, de septiembre a diciembre.",
    "La lista de muestra sale del corte de agosto.",
    "En el piloto, este control es una fórmula de la planilla y corre antes de cada lista. Si un mes llega incompleto, la lista de ese mes no sale hasta corregirlo.",
    "Con estos datos, Francisco muestra cómo se elige a quién contactar."
  ],
  "V04": [
    "Sofía, la definición de cliente que se fue la revisa usted antes de que la apruebe María [[(envío 17)]]. La nuestra es esta: un cliente se va cuando pasa más días sin comprar que su propio umbral. Para cada cliente, el umbral es **90** días o **1,5** veces lo que tarda, en mediana, entre una compra y otra: lo que sea más largo.",
    "La regla no predice nada: ordena a los clientes por los días que les faltan para cruzar su umbral."
  ],
  "V05": [
    "En la prueba final, un período que ningún método vio antes, la lista de la regla acierta **86,1 %**. La del modelo, **85,9 %**.",
    "El modelo queda **0,25 puntos** debajo de la regla.",
    "Si dos listas aciertan lo mismo, conviene la que no se entrena ni se mantiene. Queda la regla, en una planilla, sin modelo."
  ],
  "V06": [
    "Lo que no sabemos es si contactarlos paga la lista.",
    "Cada mes salen **500** contactables. El **20 %** de mayor facturación se contacta entero.",
    "Del resto sorteamos al azar **100** clientes de control, que no se contactan. Los demás van a dos ramas: una con **15 %** de descuento y otra sin descuento.",
    "A los **90** días comparamos cuántos cruzaron su umbral en cada rama y en el control.",
    "Juan Manuel muestra cuánto vale esa diferencia en dinero."
  ],
  "V07": [
    "Carlos, el presupuesto es de **USD 30.000**.",
    "Con lo que hoy se observa, lo que deja la lista es **USD 265 por año**. El primer año cuesta **USD 20.260**: el piloto mínimo más la producción completa. El ROI de la regla a un año da **−98,7 %**. No se paga. Con modelo es peor: su ROI es **−99,9 %**."
  ],
  "V08": [
    "No pedimos el proyecto. Pedimos el piloto mínimo: **USD 4.485** del presupuesto, por tres meses.",
    "Casa Óga pone además **24** horas de una persona de Marketing."
  ],
  "V09": [
    "El umbral de pase cabe en un número: **11 puntos** contra menos de un punto con lo observado.",
    "Con la compra observada en campañas, la diferencia sería de **0,79 puntos**.",
    "Con este tamaño, el piloto ve un efecto igual al umbral **89 de cada 100** veces en la rama con descuento y **73 de cada 100** en la otra.",
    "El veredicto es este. No viable como proyecto. Recomendamos un piloto mínimo, tres listas mensuales con grupo de control, por USD 4.485 del presupuesto, para medir si contactar retiene lo suficiente para pagar la lista. La decisión llega en la semana 28.",
    "Antes de la primera lista hay cosas que tienen que estar en regla: sigue Tomas."
  ],
  "V10": [
    "María, la lista sale de datos personales de sus clientes. Hoy las bases no están inscriptas y el **30,1 %** de los envíos fue a clientes que no aceptaron marketing. Por eso protección de datos tiene la nota más baja, **1 de 3**, y el promedio de las cinco dimensiones legales da **1,8 de 3**. Esa nota quiere decir que ninguna lista sale hasta tener la inscripción y el filtro de consentimiento.",
    "En la semana **1** se firma el acuerdo de confidencialidad. Sin él, el equipo no recibe ningún dato más de Casa Óga."
  ],
  "V11": [
    "Hay tres riesgos que pueden frenar el piloto. El primero es económico: que contactar no retenga lo suficiente.",
    "El segundo es de adopción. Los análisis del proyecto anterior de Casa Óga no se sostuvieron porque «no quedó un responsable claro de mantenerlos» [[(envío 15)]]. Por eso la planilla la corre una persona de Marketing, con la guía de corrida, en **8 horas** por lista.",
    "El piloto también prueba eso: si Marketing puede sostener la lista.",
    "El tercero es legal: contactar a alguien que no aceptó marketing.",
    "Sebastian muestra cómo está ordenado este trabajo y quién hace cada cosa."
  ],
  "V12": [
    "Todo el trabajo está en un backlog de **21** historias de usuario, repartidas en **8** épicas.",
    "**9** historias ya están hechas en la cursada, cada una con la sección entregada que la muestra. Las **9** historias del piloto suman **80** horas: las mismas del presupuesto del piloto mínimo. Las **3** historias restantes son de la operación mínima o de la producción completa, y solo van si el piloto pasa."
  ],
  "V13": [
    "La prueba de concepto está hecha: la regla corrió sobre el extracto histórico y pasó la validación y la prueba final. Probó que con estos datos la regla arma la lista y acierta **86,1 %**. No probó si contactar cambia la conducta.",
    "El MVP es la regla en una planilla mensual, sin modelo, sin licencias y sin integración con el CRM."
  ],
  "V14": [
    "María, el plan, que llevo yo, tiene **6** fases en **28** semanas, contadas desde su aprobación escrita.",
    "La primera lista sale en la semana **6**.",
    "La decisión es en la semana **28**, y la toma usted.",
    "Con esto, cierro."
  ],
  "V15": [
    "Aprendimos que una regla simple alcanza para saber a quién contactar. Falló lo que suponíamos al principio: que un modelo iba a pagar el proyecto. El supuesto más frágil es la tasa de éxito: hoy solo hay un **1,02 %** de compra en campañas sin grupo de control. Y hay límites: no usamos los meses incompletos ni las ventas sin cliente. Además, el piloto mide de enero a marzo, después de la campaña de fin de año, y lo que mida puede no repetirse en otros meses. Si se quedan con una idea, que sea esta: ya sabemos a quién contactar; falta saber si contactarlo paga la lista. Les pedimos dos cosas: que aprueben el piloto mínimo, por **USD 4.485**, y que firmen el acuerdo de confidencialidad al arrancar, en la semana **1**. En la semana **28** van a saber si el proyecto sigue, con **USD 4.485** gastados en lugar de **USD 20.260**. Gracias."
  ]
}

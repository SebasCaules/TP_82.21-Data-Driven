// Tabla de variables del dataset churn_cliente_corte_v0.1 (Parte B, sección 3) y las 43 features
// agrupadas por archivo de origen. Filas: FEATURE_TABLE de entregas/entregable-2/_build/B/contenido_b.py;
// features: vistas.V11.features de e2.json. Generado el 29/09; no se edita a mano.
export const TABLA = [
 {
  "variable": "id_cliente_canonico",
  "tipo": "ID",
  "rol": "identificador",
  "fuente": "Clientes + Identidad_resuelta",
  "calculo": "mapeo id_cliente → canónico",
  "accionable": "no",
  "sesgo": "bajo",
  "nota": "348 duplicados con actividad resueltos"
 },
 {
  "variable": "corte",
  "tipo": "fecha",
  "rol": "identificador",
  "fuente": "derivado",
  "calculo": "último día del mes T",
  "accionable": "no",
  "sesgo": "bajo",
  "nota": "2023-01 a 2025-09"
 },
 {
  "variable": "y_churn_90",
  "tipo": "binaria",
  "rol": "TARGET",
  "fuente": "Transacciones",
  "calculo": "Y_i(T), Anexo 1 del integrado, sección 10; evaluada en T+30, T+60 y T+90",
  "accionable": "N/A",
  "sesgo": "alto",
  "nota": "mide dejar de identificarse, no dejar de comprar"
 },
 {
  "variable": "recency_dias",
  "tipo": "entera",
  "rol": "feature",
  "fuente": "Transacciones",
  "calculo": "T − última compra identificada",
  "accionable": "no",
  "sesgo": "alto",
  "nota": "legítima al corte; línea base contra la que se compara el modelo"
 },
 {
  "variable": "gap_mediano",
  "tipo": "numérica",
  "rol": "feature",
  "fuente": "Transacciones",
  "calculo": "mediana de días entre compras hasta T",
  "accionable": "no",
  "sesgo": "medio",
  "nota": "define θ"
 },
 {
  "variable": "recency_sobre_umbral",
  "tipo": "numérica",
  "rol": "feature derivada",
  "fuente": "derivado",
  "calculo": "recency_dias / θ",
  "accionable": "no",
  "sesgo": "alto",
  "nota": "distancia al cruce"
 },
 {
  "variable": "frequency",
  "tipo": "entera",
  "rol": "feature",
  "fuente": "Transacciones",
  "calculo": "compras hasta T",
  "accionable": "sí",
  "sesgo": "bajo",
  "nota": "1,21× en el E1"
 },
 {
  "variable": "compras_90d, compras_90d_prev",
  "tipo": "enteras",
  "rol": "feature",
  "fuente": "Transacciones",
  "calculo": "compras en (T−90, T] y (T−180, T−90]",
  "accionable": "sí",
  "sesgo": "bajo",
  "nota": "si cae la frecuencia, podría avisar antes del cruce; se mide en el E3"
 },
 {
  "variable": "monetary",
  "tipo": "numérica",
  "rol": "feature",
  "fuente": "Transacciones",
  "calculo": "facturación hasta T",
  "accionable": "sí",
  "sesgo": "bajo",
  "nota": "1,16×; entra en log"
 },
 {
  "variable": "ticket_medio, ticket_90d",
  "tipo": "numéricas",
  "rol": "feature",
  "fuente": "Transacciones",
  "calculo": "monto medio por compra",
  "accionable": "sí",
  "sesgo": "bajo",
  "nota": "si cae el ticket, otra posible señal; se mide en el E3"
 },
 {
  "variable": "n_tiendas_distintas",
  "tipo": "entera",
  "rol": "feature",
  "fuente": "Transacciones",
  "calculo": "tiendas físicas distintas",
  "accionable": "no",
  "sesgo": "bajo",
  "nota": "1,22×: la mejor no circular del E1"
 },
 {
  "variable": "n_categorias_distintas",
  "tipo": "entera",
  "rol": "feature",
  "fuente": "Transacciones",
  "calculo": "categorías distintas",
  "accionable": "sí",
  "sesgo": "bajo",
  "nota": "1,21×"
 },
 {
  "variable": "categoria_dominante",
  "tipo": "categórica (7)",
  "rol": "feature",
  "fuente": "Transacciones",
  "calculo": "categoría de mayor gasto",
  "accionable": "sí",
  "sesgo": "medio",
  "nota": "Muebles 44,4 % de riesgo, Baño 28,9 %"
 },
 {
  "variable": "pct_online",
  "tipo": "numérica",
  "rol": "feature",
  "fuente": "Transacciones",
  "calculo": "compras online / total",
  "accionable": "no",
  "sesgo": "medio",
  "nota": "sesgo de canal"
 },
 {
  "variable": "region_dominante",
  "tipo": "categórica (6)",
  "rol": "contexto",
  "fuente": "Transacciones + Tiendas",
  "calculo": "región de la tienda de mayor gasto",
  "accionable": "no",
  "sesgo": "alto",
  "nota": "describe, no habilita"
 },
 {
  "variable": "formato_tienda",
  "tipo": "categórica (3)",
  "rol": "contexto",
  "fuente": "Tiendas",
  "calculo": "formato de la tienda dominante",
  "accionable": "no",
  "sesgo": "alto",
  "nota": "no accionable"
 },
 {
  "variable": "meses_desde_alta",
  "tipo": "entera",
  "rol": "feature",
  "fuente": "Clientes",
  "calculo": "meses desde mín(alta, primera compra)",
  "accionable": "no",
  "sesgo": "medio",
  "nota": "el alta puede ser posterior a la compra"
 },
 {
  "variable": "canal_alta",
  "tipo": "categórica (2)",
  "rol": "contexto",
  "fuente": "Clientes",
  "calculo": "normalizado",
  "accionable": "no",
  "sesgo": "medio",
  "nota": ""
 },
 {
  "variable": "edad, edad_flag, genero, provincia",
  "tipo": "mixtas",
  "rol": "contexto",
  "fuente": "Clientes",
  "calculo": "campo directo",
  "accionable": "no",
  "sesgo": "medio",
  "nota": "edad 8,7 % nula, 106 fuera de rango: nulo con bandera"
 },
 {
  "variable": "acepta_marketing",
  "tipo": "binaria",
  "rol": "filtro",
  "fuente": "Clientes",
  "calculo": "campo directo",
  "accionable": "sí",
  "sesgo": "alto",
  "nota": "decide la lista, no el riesgo"
 },
 {
  "variable": "es_socio, nivel",
  "tipo": "binaria, ordinal",
  "rol": "feature",
  "fuente": "Fidelizacion",
  "calculo": "socio al corte; Bronze < Silver < Gold",
  "accionable": "sí",
  "sesgo": "medio",
  "nota": "3 Gold: casi no separa"
 },
 {
  "variable": "puntos_canjeados, meses_sin_movimiento",
  "tipo": "enteras",
  "rol": "feature",
  "fuente": "Fidelizacion",
  "calculo": "acumulado hasta T; meses desde el último movimiento",
  "accionable": "sí",
  "sesgo": "medio",
  "nota": "475 sin fecha: nulo con bandera"
 },
 {
  "variable": "envios_90d, envios_acum",
  "tipo": "enteras",
  "rol": "feature",
  "fuente": "Campanias",
  "calculo": "envíos en (T−90, T] y hasta T",
  "accionable": "sí",
  "sesgo": "alto",
  "nota": "sesgo de contacto"
 },
 {
  "variable": "aperturas_90d, clics_90d",
  "tipo": "enteras",
  "rol": "feature",
  "fuente": "Campanias",
  "calculo": "abierto y click en la ventana",
  "accionable": "sí",
  "sesgo": "alto",
  "nota": ""
 },
 {
  "variable": "compro_7d_alguna",
  "tipo": "binaria",
  "rol": "feature",
  "fuente": "Campanias",
  "calculo": "alguna compra_7dias hasta T",
  "accionable": "sí",
  "sesgo": "medio",
  "nota": "1,2 % de los envíos: rala"
 },
 {
  "variable": "ultimo_canal_campania",
  "tipo": "categórica (3)",
  "rol": "feature",
  "fuente": "Campanias",
  "calculo": "canal del último envío",
  "accionable": "sí",
  "sesgo": "medio",
  "nota": ""
 },
 {
  "variable": "reclamos_90d, reclamos_acum, consultas_90d",
  "tipo": "enteras",
  "rol": "feature",
  "fuente": "Interacciones_soporte",
  "calculo": "sumas en la ventana y hasta T",
  "accionable": "sí",
  "sesgo": "alto",
  "nota": "solo 5.453 clientes con panel"
 },
 {
  "variable": "nps_ultimo, nps_sin_interaccion_flag",
  "tipo": "numérica, binaria",
  "rol": "feature",
  "fuente": "Interacciones_soporte",
  "calculo": "último NPS ≤ T; bandera DC-11",
  "accionable": "sí",
  "sesgo": "alto",
  "nota": "28,8 % de filas con NPS sin interacción"
 },
 {
  "variable": "tiene_panel",
  "tipo": "binaria",
  "rol": "contexto",
  "fuente": "Interacciones_soporte",
  "calculo": "tiene filas de soporte con fecha ≤ T",
  "accionable": "no",
  "sesgo": "alto",
  "nota": "bandera del sesgo de panel"
 },
 {
  "variable": "n_devoluciones, motivo_ultima_devolucion",
  "tipo": "entera, categórica",
  "rol": "feature",
  "fuente": "Devoluciones",
  "calculo": "por fecha_devolucion ≤ T",
  "accionable": "sí",
  "sesgo": "bajo",
  "nota": "riesgo 54,7 % con devolución previa contra 49,4 %"
 },
 {
  "variable": "pidio_baja",
  "tipo": "binaria",
  "rol": "filtro y feature",
  "fuente": "Historial_Bajas",
  "calculo": "fecha_solicitud ≤ T",
  "accionable": "sí",
  "sesgo": "alto",
  "nota": "como filtro siempre; como feature solo con fecha anterior a T"
 },
 {
  "variable": "mes_corte, temporada, dias_a_proximo_evento",
  "tipo": "entera, categórica, entera",
  "rol": "contexto",
  "fuente": "Calendario",
  "calculo": "mes de T; temporada; días al próximo evento",
  "accionable": "no",
  "sesgo": "bajo",
  "nota": "8 feriados por año; faltan Carnaval, 2/4 y 17/8"
 }
]
export const GRUPOS = [
 {
  "clave": "Transacciones",
  "nombre": "Ventas",
  "nuevo": false,
  "variables": [
   "recency_dias",
   "gap_mediano",
   "recency_sobre_umbral",
   "frequency",
   "compras_90d",
   "compras_90d_prev",
   "monetary",
   "ticket_medio",
   "ticket_90d",
   "n_tiendas_distintas",
   "n_categorias_distintas",
   "categoria_dominante",
   "pct_online",
   "region_dominante"
  ],
  "sesgo_alto": 3
 },
 {
  "clave": "Tiendas",
  "nombre": "Tiendas",
  "nuevo": false,
  "variables": [
   "formato_tienda"
  ],
  "sesgo_alto": 1
 },
 {
  "clave": "Clientes",
  "nombre": "Clientes",
  "nuevo": false,
  "variables": [
   "meses_desde_alta",
   "canal_alta",
   "edad",
   "edad_flag",
   "genero",
   "provincia"
  ],
  "sesgo_alto": 0
 },
 {
  "clave": "Fidelizacion",
  "nombre": "Fidelización",
  "nuevo": false,
  "variables": [
   "es_socio",
   "nivel",
   "puntos_canjeados",
   "meses_sin_movimiento"
  ],
  "sesgo_alto": 0
 },
 {
  "clave": "Campanias",
  "nombre": "Campañas",
  "nuevo": false,
  "variables": [
   "envios_90d",
   "envios_acum",
   "aperturas_90d",
   "clics_90d",
   "compro_7d_alguna",
   "ultimo_canal_campania"
  ],
  "sesgo_alto": 4
 },
 {
  "clave": "Interacciones_soporte",
  "nombre": "Soporte",
  "nuevo": true,
  "variables": [
   "reclamos_90d",
   "reclamos_acum",
   "consultas_90d",
   "nps_ultimo",
   "nps_sin_interaccion_flag",
   "tiene_panel"
  ],
  "sesgo_alto": 6
 },
 {
  "clave": "Devoluciones",
  "nombre": "Devoluciones",
  "nuevo": true,
  "variables": [
   "n_devoluciones",
   "motivo_ultima_devolucion"
  ],
  "sesgo_alto": 0
 },
 {
  "clave": "Historial_Bajas",
  "nombre": "Bajas",
  "nuevo": true,
  "variables": [
   "pidio_baja"
  ],
  "sesgo_alto": 1
 },
 {
  "clave": "Calendario",
  "nombre": "Calendario",
  "nuevo": false,
  "variables": [
   "mes_corte",
   "temporada",
   "dias_a_proximo_evento"
  ],
  "sesgo_alto": 0
 }
]

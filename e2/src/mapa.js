// Mapa de calidad antes y después de las decisiones (13 archivos × 7 dimensiones).
// Antes: tabla 3.1 de la Parte A (entregas/entregable-2/A-…Parte_A.docx). Después: MAPA_DESPUES de
// entregas/entregable-2/_build/B/contenido_b.py (Parte B 1.1). Generado el 29/09; no se edita a mano.
export const DIMS = ["Completitud", "Consistencia", "Exactitud", "Actualidad", "Validez", "Unicidad", "Trazabilidad"]
export const MAPA = [
 {
  "archivo": "Transacciones_clientes",
  "celdas": [
   {
    "antes": "✕",
    "hallazgo": "44,8 % sin cliente; sin costo ni SKU",
    "despues": "declarada",
    "ref": "—"
   },
   {
    "antes": "✕",
    "hallazgo": "4 etiquetas para 2 canales",
    "despues": "corregida",
    "ref": "DC-03"
   },
   {
    "antes": "▲",
    "hallazgo": "250 filas idénticas",
    "despues": "corregida",
    "ref": "DC-01"
   },
   {
    "antes": "✕",
    "hallazgo": "245 días de atraso contra el calendario",
    "despues": "corte común",
    "ref": "DC-08"
   },
   {
    "antes": "▲",
    "hallazgo": "montos negativos sin declarar",
    "despues": "marcada",
    "ref": "DC-02"
   },
   {
    "antes": "✕",
    "hallazgo": "250 id_transaccion repetidos",
    "despues": "corregida",
    "ref": "DC-01"
   },
   {
    "antes": "▲",
    "hallazgo": "consolidación manual en Excel",
    "despues": "declarada",
    "ref": "DC-15"
   }
  ]
 },
 {
  "archivo": "Clientes",
  "celdas": [
   {
    "antes": "▲",
    "hallazgo": "edad 8,7 % nula; género 5 %",
    "despues": "marcada",
    "ref": "DC-07"
   },
   {
    "antes": "▲",
    "hallazgo": "Tienda y Sucursal; 132 tienda_alta huérfanas",
    "despues": "corregida en parte",
    "ref": "DC-03"
   },
   {
    "antes": "✕",
    "hallazgo": "edades -3 y 132; 3 altas en 2026",
    "despues": "marcada",
    "ref": "DC-07"
   },
   {
    "antes": "▲",
    "hallazgo": "altas fuera del período",
    "despues": "marcada",
    "ref": "DC-07"
   },
   {
    "antes": "✕",
    "hallazgo": "106 edades fuera de rango",
    "despues": "marcada",
    "ref": "DC-07"
   },
   {
    "antes": "✕",
    "hallazgo": "353 emails repetidos",
    "despues": "corregida",
    "ref": "DC-04"
   },
   {
    "antes": "▲",
    "hallazgo": "sin diccionario de datos",
    "despues": "declarada",
    "ref": "DC-15"
   }
  ]
 },
 {
  "archivo": "Fidelizacion",
  "celdas": [
   {
    "antes": "▲",
    "hallazgo": "475 sin fecha de último movimiento",
    "despues": "marcada",
    "ref": "DC-07"
   },
   {
    "antes": "✕",
    "hallazgo": "3 Gold contra 5.066 envíos a Gold",
    "despues": "corregida",
    "ref": "DC-06"
   },
   {
    "antes": "✕",
    "hallazgo": "74 con canjeados > acumulados",
    "despues": "marcada",
    "ref": "DC-07"
   },
   {
    "antes": "▲",
    "hallazgo": "corte 2025",
    "despues": "corte común",
    "ref": "DC-08"
   },
   {
    "antes": "✓",
    "hallazgo": "catálogo cerrado",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "un registro por socio",
    "despues": null,
    "ref": null
   },
   {
    "antes": "▲",
    "hallazgo": "proveedor externo, sin dueño interno",
    "despues": "pendiente",
    "ref": "negocio"
   }
  ]
 },
 {
  "archivo": "Campanias_marketing",
  "celdas": [
   {
    "antes": "✓",
    "hallazgo": "sin nulos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✕",
    "hallazgo": "30,1 % de coincidencia de segmento",
    "despues": "corregida",
    "ref": "DC-06"
   },
   {
    "antes": "▲",
    "hallazgo": "46 id_cliente huérfanos",
    "despues": "declarada",
    "ref": "—"
   },
   {
    "antes": "✓",
    "hallazgo": "cierra 11/2025",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "booleanos correctos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✕",
    "hallazgo": "200 id_envio repetidos",
    "despues": "corregida",
    "ref": "DC-05"
   },
   {
    "antes": "▲",
    "hallazgo": "origen del segmento sin declarar",
    "despues": "pendiente",
    "ref": "negocio"
   }
  ]
 },
 {
  "archivo": "Tiendas",
  "celdas": [
   {
    "antes": "✓",
    "hallazgo": "sin nulos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "códigos T01 a T28",
    "despues": null,
    "ref": null
   },
   {
    "antes": "▲",
    "hallazgo": "facturación casi uniforme; correlación con m2 0,31",
    "despues": "declarada",
    "ref": "—"
   },
   {
    "antes": "✓",
    "hallazgo": "aperturas hasta 02/2025",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "rangos correctos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "sin repetidos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "▲",
    "hallazgo": "sin dueño declarado",
    "despues": "pendiente",
    "ref": "negocio"
   }
  ]
 },
 {
  "archivo": "Calendario",
  "celdas": [
   {
    "antes": "✕",
    "hallazgo": "8 feriados por año; faltan Carnaval, 2/4 y 17/8",
    "despues": "pendiente",
    "ref": "equipo, B 1.2"
   },
   {
    "antes": "✓",
    "hallazgo": "temporadas coherentes",
    "despues": null,
    "ref": null
   },
   {
    "antes": "▲",
    "hallazgo": "eventos idénticos los 4 años completos",
    "despues": "declarada",
    "ref": "—"
   },
   {
    "antes": "✓",
    "hallazgo": "llega al 31/08/2026: fija el presente",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "fechas ISO",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "un día por fila",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✕",
    "hallazgo": "sin fuente oficial declarada",
    "despues": "pendiente",
    "ref": "equipo, B 1.2"
   }
  ]
 },
 {
  "archivo": "Devoluciones",
  "celdas": [
   {
    "antes": "▲",
    "hallazgo": "280 sin id_cliente, heredado",
    "despues": "declarada",
    "ref": "—"
   },
   {
    "antes": "✕",
    "hallazgo": "doble fecha del mismo hecho",
    "despues": "corregida",
    "ref": "DC-02"
   },
   {
    "antes": "✓",
    "hallazgo": "integridad referencial completa",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "cierra 12/2025",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "catálogo cerrado de 5 motivos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "▲",
    "hallazgo": "5 transacciones con dos devoluciones",
    "despues": "corregida",
    "ref": "DC-01"
   },
   {
    "antes": "✓",
    "hallazgo": "POS y contable",
    "despues": null,
    "ref": null
   }
  ]
 },
 {
  "archivo": "Identidad_resuelta",
  "celdas": [
   {
    "antes": "✓",
    "hallazgo": "sin nulos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "cierra contra Clientes",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "sin huérfanos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "▲",
    "hallazgo": "se vence si regeneran Clientes",
    "despues": "declarada",
    "ref": "—"
   },
   {
    "antes": "✓",
    "hallazgo": "booleano correcto",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "sin repetidos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "▲",
    "hallazgo": "derivado analítico, no un sistema",
    "despues": "declarada",
    "ref": "—"
   }
  ]
 },
 {
  "archivo": "Interacciones_soporte_mensual",
  "celdas": [
   {
    "antes": "✕",
    "hallazgo": "5,8 % de los pares cliente-mes; 597 clientes ausentes",
    "despues": "marcada",
    "ref": "DC-11"
   },
   {
    "antes": "▲",
    "hallazgo": "granularidad mensual contra evento",
    "despues": "declarada",
    "ref": "—"
   },
   {
    "antes": "✕",
    "hallazgo": "NPS cargado en 4.312 filas sin interacción",
    "despues": "marcada",
    "ref": "DC-11"
   },
   {
    "antes": "✓",
    "hallazgo": "cierra 12/2025",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "rangos correctos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "sin par cliente-mes repetido",
    "despues": null,
    "ref": null
   },
   {
    "antes": "▲",
    "hallazgo": "regla de cálculo del NPS sin declarar",
    "despues": "pendiente",
    "ref": "consulta 4"
   }
  ]
 },
 {
  "archivo": "Contenido_Campanias",
  "celdas": [
   {
    "antes": "✓",
    "hallazgo": "cubre las 40 campañas",
    "despues": null,
    "ref": null
   },
   {
    "antes": "▲",
    "hallazgo": "2 fechas de envío discrepantes",
    "despues": "corregida",
    "ref": "DC-13"
   },
   {
    "antes": "▲",
    "hallazgo": "2 campañas creadas después de enviadas",
    "despues": "declarada",
    "ref": "—"
   },
   {
    "antes": "✓",
    "hallazgo": "cierra 11/2025",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✕",
    "hallazgo": "5 tipos de oferta escritos de 8 formas",
    "despues": "corregida",
    "ref": "DC-13"
   },
   {
    "antes": "✕",
    "hallazgo": "2 id_campania repetidos; 915 envíos afectados",
    "despues": "corregida",
    "ref": "DC-13"
   },
   {
    "antes": "✓",
    "hallazgo": "gestión de campañas",
    "despues": null,
    "ref": null
   }
  ]
 },
 {
  "archivo": "Catalogo_Acciones_Retencion",
  "celdas": [
   {
    "antes": "✓",
    "hallazgo": "sin nulos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "un canal por acción",
    "despues": null,
    "ref": null
   },
   {
    "antes": "▲",
    "hallazgo": "estimación, no costo observado",
    "despues": "declarada",
    "ref": "DC-14"
   },
   {
    "antes": "✕",
    "hallazgo": "sin fecha de vigencia",
    "despues": "declarada",
    "ref": "DC-14"
   },
   {
    "antes": "✓",
    "hallazgo": "rangos correctos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "sin repetidos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "▲",
    "hallazgo": "la definición interna no tiene respaldo",
    "despues": "pendiente",
    "ref": "negocio"
   }
  ]
 },
 {
  "archivo": "Historial_Bajas_No_Contacto",
  "celdas": [
   {
    "antes": "✓",
    "hallazgo": "sin nulos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "todas con acepta_marketing en falso",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "sin huérfanos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "▲",
    "hallazgo": "399 en 2026, dentro del calendario",
    "despues": "corregida",
    "ref": "DC-12"
   },
   {
    "antes": "✓",
    "hallazgo": "catálogos cerrados",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "una baja por cliente",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✕",
    "hallazgo": "598 negativas sin solicitud registrada",
    "despues": "declarada",
    "ref": "—"
   }
  ]
 },
 {
  "archivo": "Casos_Cualitativos_Clientes",
  "celdas": [
   {
    "antes": "✓",
    "hallazgo": "sin nulos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "fechas coherentes",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "sin huérfanos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "▲",
    "hallazgo": "sin fecha de corte declarada",
    "despues": "declarada",
    "ref": "—"
   },
   {
    "antes": "✓",
    "hallazgo": "catálogo cerrado",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✓",
    "hallazgo": "sin repetidos",
    "despues": null,
    "ref": null
   },
   {
    "antes": "✕",
    "hallazgo": "entrevistas sin transcripción ni fecha",
    "despues": "pendiente",
    "ref": "negocio"
   }
  ]
 }
]

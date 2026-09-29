// Estado visible de una decisión (24/09). Lo usan la tabla de V01 y la tarjeta de decisión de cada
// vista, para que la misma decisión diga lo mismo en todas. (29/09, cierre) Hasta ese día, una
// aplicada con un pedido abierto en V12 (DC-09) se mostraba «a confirmar». V12 ya no trae pedidos:
// la causa de la caída de sep-dic 2025 se le reporta a Casa Óga sin esperar respuesta, y el criterio
// de esos meses lo delegó al equipo (consulta 2). Quedan dos estados, aplicada y declarada, que son
// los del payload.

export const estadoVisible = (dc) => dc.estado

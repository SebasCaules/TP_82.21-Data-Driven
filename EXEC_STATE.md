# EXEC_STATE — SPA dashboard Casa Óga

Runbook: `prompt-spa-dashboard.md` (sesión 164ed4bc, scratchpad).
Método: workforce (olas verificadas). Arranque 2026-08-25. Entrega **mar 01/09/2026**.

## Compuertas

| # | Compuerta | Estado | Notas |
|---|---|---|---|
| 1 | Alcance | **APROBADA** | 4 recomendaciones aceptadas: 25 cortes, pesos nominales, lista top-N, backlog fuera |
| 2 | Contrato de datos | **APROBADA** | 44/44 anclas, 201.819/201.819 chequeos, payload 1.089 KB, ola 1 cerrada |
| 3 | Diseño por pantalla | **ESPERANDO VISTO BUENO** | comité de 4 lentes: 72 hallazgos, 49 bloqueantes, 49 aceptados. 12 → 14 pantallas |
| 4 | Esqueleto navegable | TODO | |
| 5 | Verificación | TODO | |
| 6 | Cierre | TODO | |

## Fase 0 — pasos

| Paso | Estado | Resultado |
|---|---|---|
| F0.1 lectura de fuentes obligatorias | DONE | 14 documentos + DOCX Parte D + apunte clase 4 |
| F0.2 verificación de las 5 anclas | DONE | 27.276 · 2022-01-03→2025-12-29 · 5.978 · 4.940 · 2.452 — las cinco exactas |
| F0.3 verificación de cifras derivadas | DONE | 94,9 M · 262,8 M · 550,2 M · 204,6 M · 80,1 M @30/09 · Q5/Q1 3,89× |
| F0.4 scaffold `app/` + copia de datasets (D5, D10) | DONE | `app/data/raw/` 6 CSV, md5 idéntico, `raw/` intacto |
| F0.5 inventario y contradicciones | DONE | `app/docs/fase-0-inventario.md` |
| F0.6 git init + remote (D6) | DONE | `app/` es la raíz del repo, remote a TP_82.21-Data-Driven (vacío, confirmado) |

## Ola 1 — pipeline (compuerta 2)

| Módulo | Dueño | Build | Verificación | Resultado |
|---|---|---|---|---|
| `loader.py` | W1 (sonnet) | OK | VERDE (sonnet high) | 10/10 conteos exactos al primer intento |
| `features.py` | W2 (sonnet high) | OK + bloqueo | VERDE (opus high) | el bloqueo de las 664 celdas era correcto: el contrato estaba mal |
| `series.py` | W3 (sonnet high) | OK + bloqueo | **ROJO** (opus high): 2 altas, 2 medias, 2 bajas | fix aplicado; las dos altas necesitaban `build.py`, integradas por N0 |
| `pack.py` | W4 (sonnet) | OK | VERDE (sonnet high) | clobbereaba `exposicion_por_corte`; punto de integración, resuelto por N0 |
| `build.py`, `validate.py` | N0 | OK | — | 44/44 anclas · 201.819/201.819 chequeos |

Findings de `series.py` y cómo se cerraron:

| Severidad | Finding | Cierre |
|---|---|---|
| alta | `estacionalidad` daba 16,6 M en diciembre contra el ancla de 29,0 M | base equivocada: el ancla es sobre venta total. `build.py` pasa `tx_total` |
| alta | `base_activa_anual.ventas` daba 68,6 M en 2022 contra 123,8 M | mismo origen. Se emiten las dos series con el % identificado al lado |
| media | `recompra_trimestral` usaba `MAX(fecha)` del run | parámetro `hasta`, cableado al corte de referencia |
| media | el embudo mezclaba bases: global sobre 23.529 y segmentos sobre 23.729 | se emiten las dos desagregaciones; cada una reconcilia con su total |
| baja | clic de "Inactivos 90d" 9,5 % contra 9,6 % del wiki | diferencia de base; las dos viajan y el pie declara cuál es cuál |
| baja | la serie traía 2025Q4 con `tasa=null` | el gráfico filtra nulos; queda declarado en el diseño |

## Ola 2 — comité de diseño (compuerta 3)

Cuatro revisores read-only en modelo N0 (opus, effort high), una sola ronda, formato fijo
`pantalla · regla violada · cita · severidad · corrección`.

| Lente | Hallazgos | Bloqueantes |
|---|---|---|
| Integridad del dato | 22 | 17 |
| HCI y arquitectura de información | 18 | 12 |
| Narrativa (Knaflic cap. 7 + Minto) | 15 | 11 |
| Frontend y accesibilidad | 17 | 9 |

**49 bloqueantes, 49 aceptados, 0 rechazados.** Ninguno se descartó por falta de cita.
Detalle en `docs/comite-adjudicacion.md`. Los cuatro que cambian lo que se afirma:

1. El gradiente de riesgo por quintil está inflado por la elegibilidad: 3,89× sobre el total,
   **1,27×** entre clientes comparables (Q1 tiene 32,5 % de elegibles contra 99,3 % de Q5).
2. "Campeones concentra la facturación con la tasa más baja" es **falso**: es el cuarto más
   bajo (25,3 %), detrás de Nuevos 0,0 %, Potenciales 3,9 % y Perdidos 20,4 %. Está en el DOCX
   entregado.
3. El excedente de capacidad **no es un grupo de control**: es por construcción el tramo de
   menor exposición. Contradice el criterio de éxito 5 de la Parte C entregada.
4. La lista ejecutable no son 800 clientes sino **568**: los otros 232 no tienen consentimiento.

## Decisiones N0

| # | Decisión | Motivo | Fecha |
|---|---|---|---|
| N0-1 | El apunte `raw/clases/clase-04/Clase 4.md` entra al contrato de diseño con rango superior a la guía | `CLAUDE.md`: lo dicho en clase pisa al programa y a la guía. Apareció después de escribirse `consignas.md` del 25/08 | 2026-08-25 |
| N0-2 | La limpieza reporta el conteo en las cuatro etapas (crudo → dedupe → identificado → monto>0) | resuelve la contradicción 613/608 sin pisar ninguna de las dos fuentes | 2026-08-25 |
| N0-3 | `EXEC_STATE.md` y la documentación de ejecución viven en `app/`, versionados | el repo es público y académico; el build se documenta solo | 2026-08-25 |
| N0-4 | RFM: R/F/M son `qcut` del `rank(method="first")`; `Nuevos` usa el conteo literal de compras, no el quintil F | reproduce 5 de 7 segmentos exactos y los dos que la guía cita (Campeones 1.014 / 159,9 M y "En riesgo" 1.018 / 95,7 %). Las otras variantes de desempate se alejan mucho más | 2026-08-25 |
| N0-5 | Arquitectura: tabla de contingencia por (corte × región × categoría × RFM × quintil); el navegador solo filtra y suma | medidas las tres opciones: precálculo total 5,8 MB, cálculo en navegador 0,37 MB con riesgo de paridad, contingencia 1.089 KB sin ese riesgo | 2026-08-25 |
| N0-6 | Las cifras anuales de ventas y la estacionalidad van sobre la base **sin** filtrar cliente (49.392 filas) | es la única que reproduce 123,8/295,8/349,7/225,0 M y diciembre 29,0 / febrero 16,5. Dos workers lo devolvieron como bloqueo en vez de forzarlo y tenían razón | 2026-08-25 |
| N0-7 | El denominador anualizado se deja completo y se declara `clientes_historia_corta` por corte | preserva el ancla 94,9/204,6 = 46,4 %; corregirlo la rompería. Decisión del usuario en compuerta 2 | 2026-08-25 |
| N0-8 | La contingencia tiene **664** celdas ocupadas, no 696 | 696 salió de un sondeo mío con la regla vieja de `Nuevos`. El worker lo devolvió como bloqueo; el contrato estaba mal y se corrigió | 2026-08-25 |
| N0-9 | En el desempate del comité gana la **regla citada del rulebook**, después la Parte D | es lo que fija el runbook §6. El ENV del comité había puesto la Parte D por encima de la guía; se corrige acá | 2026-08-25 |
| N0-10 | 14 pantallas, no 12: D5 se parte en región y categoría, M2 en embudo y segmentos | dos gráficos en una pantalla violan `dec-D1` y no cierran a 1152×640 | 2026-08-25 |
| N0-11 | Los ejes y columnas dicen **"exposición anual (ARS)"**, no "pérdida esperada" | no hay ninguna probabilidad aplicada; el término sugiere una esperanza estadística que no existe | 2026-08-25 |

## Ownership de archivos

Se asigna antes de spawnear cada ola. Reservados al orquestador (N0) en todo momento:
`app/EXEC_STATE.md`, `app/src/main.tsx`, `app/src/App.tsx`, `app/vite.config.ts`,
`app/package.json`, `wiki/**`, `entregas/**`, `CLAUDE.md`.

## Fixes sugeridos (S-nn)

| # | Fix | Superficie | Origen | Cuándo |
|---|---|---|---|---|
| S-01 | `wiki/index.md:151` apunta a `raw/catedra/Respuestas Grupo2.xlsx`, ruta inexistente. La real es `raw/Respuestas_Preguntas.xlsx` | wiki | runbook §2 | compuerta 6 |
| S-03 | La Parte D §4.1 viz 2 afirma que Campeones tiene "la tasa más baja" de riesgo: es falso, es el cuarto más bajo | entregas | comité, lente de dato | enmienda en el documento integrado del 01/09 |
| S-04 | El criterio de éxito 5 de la Parte C llama "grupo de control natural" al excedente de capacidad; es el tramo de menor exposición, no un control | entregas | comité, lente de dato | enmienda en el documento integrado del 01/09 |
| S-02 | El backlog de 8 épicas sigue sin entrar a ninguna entrega (checklist de `entregable-1` abierto). Lo pide el programa dentro del Entregable 1 | entregas | `entregable-1.md` | fuera de alcance de esta corrida, antes del 01/09 |

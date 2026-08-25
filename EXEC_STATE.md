# EXEC_STATE — SPA dashboard Casa Óga

Runbook: `prompt-spa-dashboard.md` (sesión 164ed4bc, scratchpad).
Método: workforce (olas verificadas). Arranque 2026-08-25. Entrega **mar 01/09/2026**.

## Compuertas

| # | Compuerta | Estado | Notas |
|---|---|---|---|
| 1 | Alcance | **ESPERANDO VISTO BUENO** | inventario F0 completo, 5 anclas en verde, 13 contradicciones, 4 preguntas abiertas |
| 2 | Contrato de datos | TODO | |
| 3 | Diseño por pantalla | TODO | |
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
| F0.6 git init + remote (D6) | TODO | tras compuerta 1 |

## Decisiones N0

| # | Decisión | Motivo | Fecha |
|---|---|---|---|
| N0-1 | El apunte `raw/clases/clase-04/Clase 4.md` entra al contrato de diseño con rango superior a la guía | `CLAUDE.md`: lo dicho en clase pisa al programa y a la guía. Apareció después de escribirse `consignas.md` del 25/08 | 2026-08-25 |
| N0-2 | La limpieza reporta el conteo en las cuatro etapas (crudo → dedupe → identificado → monto>0) | resuelve la contradicción 613/608 sin pisar ninguna de las dos fuentes | 2026-08-25 |
| N0-3 | `EXEC_STATE.md` y la documentación de ejecución viven en `app/`, versionados | el repo es público y académico; el build se documenta solo | 2026-08-25 |

## Ownership de archivos

Se asigna antes de spawnear cada ola. Reservados al orquestador (N0) en todo momento:
`app/EXEC_STATE.md`, `app/src/main.tsx`, `app/src/App.tsx`, `app/vite.config.ts`,
`app/package.json`, `wiki/**`, `entregas/**`, `CLAUDE.md`.

## Fixes sugeridos (S-nn)

| # | Fix | Superficie | Origen | Cuándo |
|---|---|---|---|---|
| S-01 | `wiki/index.md:151` apunta a `raw/catedra/Respuestas Grupo2.xlsx`, ruta inexistente. La real es `raw/Respuestas_Preguntas.xlsx` | wiki | runbook §2 | compuerta 6 |
| S-02 | El backlog de 8 épicas sigue sin entrar a ninguna entrega (checklist de `entregable-1` abierto). Lo pide el programa dentro del Entregable 1 | entregas | `entregable-1.md` | fuera de alcance de esta corrida, antes del 01/09 |

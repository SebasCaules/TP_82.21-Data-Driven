# Plan de fixes — auditoría de diseño del 26/08/2026

Ejecución por olas verificadas de los 72 hallazgos que quedaron en pie tras la auditoría
(8 lentes de revisión, 13 verificadores adversariales, 9 hallazgos descartados). El informe
completo, con la prueba y el argumento de cada uno, está publicado como artefacto.

Rama de trabajo: `fix/auditoria-diseno`, desde `6b7c86c`.

## Fase 0 — reconciliación

La auditoría se hizo contra `b74f474` más cinco archivos sin commitear. Entre medio entraron
tres commits que reescribieron la vista 09 y tocaron `estilos.css`, `graficos.jsx`, `datos.js`
y `build.py`. Los 45 hallazgos que viven en archivos que esos commits no tocaron quedan firmes
por `git diff`. Los 27 que sí, se re-adjudicaron uno por uno contra HEAD:

| Estado | n | Qué significa |
|---|---|---|
| `sigue` | 21 | El defecto está igual, con la línea actualizada |
| `mutado` | 6 | Sigue, pero cambió de forma o de lugar |
| `ya_arreglado` / `muerto` | 0 | Ningún commit nuevo resolvió nada de lo encontrado |

## Regla de ownership

Un archivo, un dueño por ola. Ningún worker toca un archivo que no es suyo. Las dos fronteras
que hay que respetar sí o sí:

- **Los valores de token viven en `estilos.css`; su uso dentro del SVG vive en `graficos.jsx`.**
  Los hallazgos A11Y-02 y A11Y-11 se parten en dos mitades, una por archivo.
- **`App.jsx` y los puntos de integración son del orquestador**, no de un worker.

## Olas

| Ola | Archivo | n | Alto | Hallazgos |
|---|---|---|---|---|
| 1 · sustrato compartido | `src/estilos.css` | 15 | 4 | A11Y-01, A11Y-02(parte), A11Y-09, A11Y-10, A11Y-11(parte), HCI-10, LAY-01, LAY-03, VIS-02, VIS-04, VIS-05, VIS-06, VIS-07, VIS-10, VIS-11 |
| 1 · sustrato compartido | `src/graficos.jsx` | 11 | 4 | A11Y-02(parte), A11Y-05, A11Y-06, A11Y-11(parte), DVZ-01, DVZ-05, DVZ-06, DVZ-07, DVZ-09, DVZ-10, HCI-05 |
| 1 · sustrato compartido | `src/Semaforo.jsx` | 1 | 1 | OV-1 |
| 2 · controles y armazón | `src/App.jsx` | 4 | — | A11Y-07, COPY-02, HCI-06, OV-4 |
| 2 · controles y armazón | `src/Filtros.jsx` | 4 | 2 | A11Y-03, A11Y-08, HCI-01, HCI-08 |
| 2 · controles y armazón | `src/LineaTiempo.jsx` | 1 | 1 | A11Y-04 |
| 2 · controles y armazón | `src/fit.js` | 1 | — | LAY-07 |
| 2 · controles y armazón | `src/Ban.jsx` | 1 | — | VIS-08 |
| 3 · las 14 pantallas | `src/pantallas/D0Consolidada.jsx` | 6 | 2 | CIF-05, COPY-08, NAR-01, NAR-08, OV-3, OV-5 |
| 3 · las 14 pantallas | `src/pantallas/D1Exposicion.jsx` | 2 | — | CIF-10, DVZ-08 |
| 3 · las 14 pantallas | `src/pantallas/D2Quintiles.jsx` | 4 | 1 | CIF-02, CIF-06, CIF-07, OV-2 |
| 3 · las 14 pantallas | `src/pantallas/D3Segmentos.jsx` | 3 | 1 | NAR-04, NAR-06, NAR-07 |
| 3 · las 14 pantallas | `src/pantallas/D4Recompra.jsx` | 1 | — | COPY-12 |
| 3 · las 14 pantallas | `src/pantallas/D5aRegion.jsx` | 2 | 2 | CIF-03, NAR-05 |
| 3 · las 14 pantallas | `src/pantallas/D5bCategoria.jsx` | 3 | 2 | COPY-07, COPY-10, DVZ-04 |
| 3 · las 14 pantallas | `src/pantallas/D7Cierre.jsx` | 1 | — | VIS-12 |
| 3 · las 14 pantallas | `src/pantallas/M0Cobertura.jsx` | 2 | 1 | CIF-01, CIF-04 |
| 3 · las 14 pantallas | `src/pantallas/M1Lista.jsx` | 5 | 1 | HCI-04, HCI-07, HCI-12, LAY-02, VIS-03 |
| 3 · las 14 pantallas | `src/pantallas/M2aEmbudo.jsx` | 1 | 1 | COPY-05 |
| 3 · las 14 pantallas | `src/pantallas/M3Consentimiento.jsx` | 2 | 1 | CIF-09, VIS-01 |
| 3 · las 14 pantallas | `src/pantallas/index.jsx` | 1 | 1 | NAR-03 |
| 4 · documentos | `docs/diseno-pantallas.md` | 2 | — | NAR-09, NAR-10 |
| 4 · documentos | `docs/verificacion.md` | 1 | — | LAY-08 |

23 unidades de trabajo, 74 asignaciones sobre 72 hallazgos (dos se parten en dos).

## Ciclo de cada unidad

`build` → `verify` adversarial → `fix` si sale ROJO → `re-verify`. Máximo dos vueltas; a la
tercera la unidad escala al orquestador. El verificador nunca es el que construyó, y no puede
marcar como finding lo que es responsabilidad del orquestador (integración, registro de rutas).

Compuertas al cerrar cada ola: `npm run build`, más `npm run todo` completo antes del cierre.
La compuerta visual es el barrido de las 14 pantallas con `window.__fit()` a 1152×640 y
1440×900, que es la única que caza lo que una suite verde no ve.

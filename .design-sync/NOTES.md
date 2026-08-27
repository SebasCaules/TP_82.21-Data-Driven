# design-sync — notas del repo

## Forma y alcance

- Shape `package`, sin Storybook y **sin TypeScript**. El repo es una app (Vite +
  `vite-plugin-singlefile`), no una librería: `app/dist/index.html` es el bundle de la app,
  no un entry de componentes. `package.json` no tiene `main`/`module`/`exports`.
- Por eso el sync corre con `--entry ./.design-sync/ds-entry.jsx`, un **barrel escrito a
  mano** que re-exporta solo lo sincronizable. Es un archivo durable, versionado, y hay que
  actualizarlo cuando se agregue o saque un export de `graficos.jsx`, `Semaforo.jsx` o
  `Iconos.jsx`.
- **Por qué el barrel y no el synth-entry automático:** el synth-entry hace
  `export * from` de TODOS los `.jsx` de `src/`, y eso arrastra `Filtros.jsx` y
  `LineaTiempo.jsx`, que importan `agregacion.js` → `datos.js`, el payload de 1,2 MB del
  corte 31/12/2025. Con el barrel el bundle queda en 84 KB. Si alguien saca el `--entry`,
  el bundle se va a más de 1 MB y las previews quedan atadas a datos reales.
- Fuera de alcance a propósito: `App.jsx`, `Filtros.jsx`, `LineaTiempo.jsx` y las 14
  pantallas de `src/pantallas/`. Las pantallas son composiciones de la app, no piezas del
  sistema; se usaron como fuente de las previews.

## Cosas que hubo que resolver

- **`.d.ts` vacíos.** Sin TypeScript, ts-morph no infiere nada de un parámetro
  desestructurado sin anotar: los 19 componentes salían con `[key: string]: unknown`. Los
  contratos de props están escritos a mano en `cfg.dtsPropsFor`, derivados de las firmas
  reales y del uso en `src/pantallas/`. **Si cambia una firma en el fuente, hay que
  actualizar el `dtsPropsFor` correspondiente**: nada lo chequea automáticamente.
- **`@types/react`** no está en las devDependencies del repo. Se enlaza desde las deps del
  converter (`ln -sfn ../../.ds-sync/node_modules/@types/react node_modules/@types/react`).
  Hay que rehacerlo en cada clone; no se tocó el `package.json` del repo a propósito.
- **Anchos.** El capture corre a 900×700 y la celda del producto es ≤728 px. A 640 px de
  ancho, `BarrasApiladas100` pisaba la leyenda contra el encabezado de nota y el embudo
  pisaba el rótulo de pérdida contra la plaqueta. Las previews de gráfico usan `w` de 900 a
  940, con `cfg.overrides.<Nombre>` en `cardMode: "column"` más un `viewport` propio. Bajar
  esos anchos rompe rótulos.
- **Escapes en atributos JSX.** `rotuloPos="... →"` sale como texto literal: en un
  atributo JSX el escape no se procesa. Van los caracteres reales (→, ←).
- **`anchoEtiqueta` corto clipea.** `PuntosIC` a 112 cortaba "Score del modelo" y mostraba
  "core del modelo". Está en 134.
- **Íconos.** El default es 12×12, que en una tarjeta no pinta casi nada y dispara
  `[RENDER_THIN]`. Las previews los muestran de 12 a 48 y en contexto de chip.
- **Guidelines.** `cfg.guidelinesGlob` está acotado a `docs/diseno-pantallas.md`. Los otros
  cuatro `.md` de `docs/` (adjudicación del comité, plan de fixes, inventario fase 0,
  verificación) son artefactos de ejecución del proyecto: como "guidelines" el agente de
  diseño los leería como instrucciones y son ruido.

## Known render warns

- `[RENDER_THIN] SerieCortes: mounts have no text and paint nothing` — **benigno y
  esperado**. `SerieCortes` es una sparkline de 25 puntos sin una sola etiqueta, por diseño:
  va al lado del selector de mes, donde la cifra ya está escrita afuera. La hoja de review
  confirma que dibuja la línea y la marca del corte activo.

## Re-sync risks

- **Datos inlineados en las previews.** Todas las previews traen cifras reales del corte
  31/12/2025, extraídas del payload (`src/datos.js` vía `src/agregacion.js`). Si el pipeline
  se vuelve a correr y las cifras se mueven, las previews quedan mostrando un corte viejo.
  No rompen nada, pero dejan de coincidir con el tablero. Las cifras clave: exposición
  ARS 94,9 M sobre 204,6 M anualizados, 2.452 en riesgo de 5.978, Q1 13,3 % a Q5 51,8 %,
  recompra 2025Q3 8,5 %, 7.078 de 23.529 envíos sin consentimiento.
- **El barrel puede quedar desactualizado en silencio.** Un export nuevo en `graficos.jsx`
  no aparece en el sistema hasta que se agregue a `ds-entry.jsx` **y** a
  `cfg.componentSrcMap`. El converter no avisa: simplemente no lo ve.
- **`cfg.dtsPropsFor` puede mentir.** Está escrito a mano contra las firmas de hoy. Un
  cambio de props en el fuente no invalida nada; el agente de diseño seguiría codeando
  contra el contrato viejo.
- **Cards anchos contra la celda del producto.** Los viewports declarados van de 620 a
  1020 px y la celda de la pane del producto es ≤728 px. `package-validate.mjs` no marcó
  `[GRID_OVERFLOW]`, pero `BarrasDivergentes` (el más ancho, 1020) aparece recortado en la
  hoja de contacto. Si en la pane real se ve cortado, la salida es bajarle el `viewport` o
  achicar `w` en la preview.
- **Toolchain.** Se verificó con node del sistema, esbuild + ts-morph instalados en
  `.ds-sync/`, y playwright con chromium-headless-shell 151.0.7922.34 en
  `~/Library/Caches/ms-playwright/`. Nada de esto está pineado en el repo.
- El repo `app/` tenía cambios sin commitear en `main` cuando se corrió este sync. No se
  tocaron.

## Re-sync

```sh
cd app
node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules \
  --entry ./.design-sync/ds-entry.jsx --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json
```

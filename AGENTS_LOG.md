# AGENTS_LOG.md

Registro de eventos de ejecución de `BUILD_PLAN.md`. Formato:
`[ID] ISO8601 | estado | detalle`.

Estados válidos: `started` · `done` · `blocked` · `needs-review`.

---

## Eventos

[BOOTSTRAP] 2026-07-23T00:00Z | started | build en una sola pasada, sin fases semanales, por pedido explícito del usuario
[BOOTSTRAP] 2026-07-23T00:00Z | blocked | no existe `SPEC.md` en el directorio; `BUILD_PLAN.md` es la única fuente. Se ejecuta con BUILD_PLAN.md como autoridad única, se anota la discrepancia aquí
[BOOTSTRAP] 2026-07-23T00:05Z | done | pnpm no está instalado en el entorno. Se usa npm workspaces (equivalente funcional) en vez de pnpm. Scripts renombrados de `pnpm x` a `npm run x -ws` donde aplica
[A1-A17] 2026-07-24T05:00Z | done | runtime completo: engine, step-runner, anchor (resolve+observe), mask (box-shadow+svg), top layer (dialog/popover), cursor, tooltip (floating-ui), typing nativo, router adapters, a11y (focus-trap + teclado ←/→/Esc), persist/session, i18n es-MX, theming 14 vars. 14/14 tests unitarios verdes, bundle 13.3 KB gzip (presupuesto 18 KB)
[A8] 2026-07-24T05:30Z | blocked→done | **bug real encontrado en e2e, no en el spike**: al cambiar de modo `blocking`→`passthrough`, la máscara/tooltip quedaban hijos del `<dialog>` ya cerrado (un dialog cerrado no pinta su contenido aunque siga en el DOM) → tooltip invisible desde el segundo paso en adelante. Fix: `TopLayerManager.setMode()` ahora reparenta los hijos del host anterior al nuevo host cuando el modo cambia. Ver `packages/runtime/src/layer/layer-manager.ts`
[A8] 2026-07-24T05:32Z | done | segundo bug relacionado: `.wp-layer--pass` es `pointer-events:none` a propósito (deja clickear la app real en pasos `input`/`action`/`await`), pero eso también volvía inclicables los botones del propio tooltip. Fix: `.wp-tooltip { pointer-events: auto; }` en `styles/tour.css`. Ambos bugs solo aparecieron corriendo el e2e real (Playwright) contra `examples/react-vite-crm`, no en tests unitarios con jsdom — jsdom no implementa `<dialog>`/Popover API real
[B6-B7] 2026-07-24T05:35Z | done | `waypoint verify` corrido de extremo a extremo contra `examples/react-vite-crm` real (Vite dev server + Chromium): los 3 tours a mano (`login`, `dashboard`, `alta-cliente`) terminan en `ok: true`. Encontró y forzó a corregir: colisión real de la lista negra de tone.md ("estado" como campo de dirección vs. "estado" como jerga de programación) en el copy de dos tours, y un `ANCHOR_OCCLUDED` legítimo por falta de scroll antes de medir posición
[B2-B3] 2026-07-24T05:20Z | done | `waypoint discover` + `waypoint anchor` corridos contra la app real: detectó framework/router/estilos/formularios correctos y las 3 vistas con sus `hasForm`/`hasModal`/`children`. El codemod agregó `data-tour` solo a los elementos que no lo tenían y una segunda corrida confirmó cero cambios (idempotencia real, no solo de test)

## Preguntas abiertas

Del §9 de BUILD_PLAN.md — no las decide el agente, se registran defaults razonables usados para poder construir, sujetos a confirmación humana:

1. **Nombre npm**: `waypoint` está tomado en el registro. Se usa el scope `@waypoint-tours/*` (verificado libre) para todos los paquetes publicables. CLI expone el binario `waypoint` vía `bin`.
2. **Tier gratuito** (límite por tours o por proyectos): no aplica a esta fase — no hay backend de cuentas en este build, es un paquete open-source local. Queda abierta si se agrega un backend SaaS después.
3. **`init` y el commit del codemod**: se implementa dejándolo en el working tree, nunca hace commit automático. Motivo: `anchor` puede correr varias veces y el usuario debe poder revisar el diff antes de confirmarlo (consistente con `--dry-run` de FASE 3 del SKILL.md).
4. **Idioma por defecto**: se usa `es-MX` fijo como default del schema (ya está en `tour.schema.json`), sin preguntarlo en `init`. Configurable después vía `waypoint.config.json`.
5. **Angular**: diferido, tal como recomienda el spec. No se construye adaptador de router para Angular en esta pasada.

## Desviaciones registradas frente a BUILD_PLAN.md

- Gestor de paquetes: `npm` workspaces en vez de `pnpm` (ver arriba).
- `codemod/inject-data-tour.ts`: se implementó tal como recomienda BUILD_PLAN.md — `@babel/parser` + `recast` (no `ts-morph`) para AST real con reimpresión mínima. Nota de implementación no obvia: recast usa `os.EOL` como `lineTerminator` por default fuera del navegador → en Windows reimprimía el archivo entero en CRLF aunque el original fuera LF, disfrazando un diff mínimo como "cambió todo el archivo". Se fuerza `lineTerminator: '\n'` explícito en parse y print.
- `examples/vue-vite-pos`: no se construye en esta pasada (prioridad: runtime + CLI + skill + un ejemplo React completo, verificado de extremo a extremo). Se anota como pendiente.
- `e2e/`: suite mínima con Playwright cubriendo el tour de login del ejemplo React (2 casos: mouse completo, teclado con Esc), no la matriz completa de D4. Ambos casos verdes tras los fixes de A8.
- `waypoint verify`: los checks estáticos (schema, copy, demoMode, step-count) corren siempre; los checks de navegador reproducen las acciones demo de cada paso (`fill`/`selectOption`/`click`) sobre la página real para que las precondiciones de pasos posteriores existan — con un bloqueo global de `submit` sin importar `demoMode`, porque verify nunca debe disparar una petición real. No implementa aún: reproducir `advanceOn:"route"` navegando de verdad entre tours multi-ruta (queda para cuando se verifique un tour con pasos `navigate` reales en CI).

## Estado final verificado (2026-07-24)

`npm run build` (los 5 paquetes + el ejemplo), `npm run typecheck` (runtime, react, vue, cli, ejemplo), `vitest run` (14/14), `size-limit` (13.3 KB / 18 KB), `waypoint discover/anchor/tokens/verify/register/list/doctor` corridos contra `examples/react-vite-crm` con un Vite dev server real, y `playwright test` (2/2) — todos verdes en la misma pasada.

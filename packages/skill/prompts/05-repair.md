# FASE 6 (reparación) · De `verify --json` a un tour que pasa

Máximo 3 ciclos de reparación. Al cuarto `verify` que siga fallando, detente
y reporta al humano qué issues quedan y por qué crees que no se resuelven
solos (ver SKILL.md, FASE 6).

Para cada issue en `report.tours[].issues`, ubica su `code` en esta tabla y
aplica la acción. No arregles a ciegas: lee `message` y `hint`, ya traen el
selector/paso exacto.

| Código | Severidad | Acción |
|---|---|---|
| `SCHEMA_INVALID` | error | Lee `instancePath` en `message`. Corrige el JSON contra `schema/tour.schema.json` — casi siempre falta un campo obligatorio (`demoValue` en `input`, `anchors` en `group`, `route` en `navigate`) o sobra uno prohibido (`anchor` en `modal`). |
| `ANCHOR_NOT_FOUND` | error | Corre de nuevo `npx waypoint anchor --view=<Vista>`. Si persiste, el elemento vive tras un render condicional que no está activo cuando `verify` visita la ruta — agrega un paso previo que dispare esa condición, o márcalo con `skipIf`. |
| `ANCHOR_NOT_VISIBLE` | error | El elemento existe pero está oculto (acordeón cerrado, tab inactivo, `display:none`). Agrega un paso `action` que lo abra antes de este paso. |
| `ANCHOR_OCCLUDED` | error | Algo lo tapa (sticky header, overlay). Revisa si necesitas `scrollIntoView: true` (default) o cambia de ancla a un contenedor no tapado. |
| `ANCHOR_AMBIGUOUS` | warning | El selector matchea más de un elemento. En runtime se usa el primero y el tour no se rompe, pero hazlo específico: agrega un contenedor con `data-tour` propio o usa `:first-of-type` (ver `reference/selectors.md`). |
| `TOOLTIP_OVERFLOW` | error | No cabe el tooltip en 1280×800 alrededor del ancla. Cambia `placement` a `"auto"` (si no lo estaba ya), o acorta el `body`. |
| `STEP_TIMEOUT` | error | Un `advanceOn` con `event: "selector"` nunca vio aparecer su `value`. Revisa que el selector sea correcto, o que no dependa de una acción previa que en modo demo no ocurrió (por ejemplo, un modal que solo abre un botón real, no el que simula el runtime). |
| `COPY_FORBIDDEN_TERM` | error | El `title`/`body` usa jerga de la lista negra de `tone.md`. Reescribe la frase completa — nunca sinonimices la palabra prohibida, replantea qué le estás diciendo al usuario. |
| `COPY_TOO_LONG` | error | Más de ~25 palabras en el `body`. Corta a lo esencial: qué hace y para qué sirve, nada de contexto de más. |
| `TOO_MANY_STEPS` | error | Más de 12 pasos. Agrupa con `type: "group"` (ver `reference/step-types.md`) o parte en dos tours con `onFinish.nextTour`. |
| `MISSING_DEMO_MODE` | error | Hay un paso con `sideEffect: "network"` o `"destructive"` pero el tour no tiene `"demoMode": true`. Agrégalo a nivel de tour — nunca se debe permitir un envío real. |
| `ANCHOR_FRAGILE` | warning | El paso usa `strategy: "css"` o `"text"`. Si puedes, corre `anchor` de nuevo para que inyecte `data-tour` real y elimina la dependencia frágil. |
| `CONTRAST_LOW` | warning | El contraste entre `--wp-surface` y `--wp-text` de `tours/theme.css` está bajo el mínimo WCAG AA (4.5:1). Ajusta esas dos variables — no toques el runtime. |
| `SOURCE_DRIFT` | warning | El código de la vista cambió desde que se generó el tour (`sourceHash` no coincide). Vuelve a FASE 1 completa para esa vista: puede que hayan movido o renombrado el elemento que anclaste. |
| `UNSUPPORTED_CONTEXT` | warning | El paso `input` apunta a un editor enriquecido (contenteditable, CodeMirror, Quill) que el runtime no puede escribir por su usuario. Convierte el paso a `highlight` y explica en el `body` qué debe escribir la persona ahí. |

## Después de reparar

Vuelve a correr `npx waypoint verify tours/<id>.tour.json --json` y repite
hasta `ok: true` o hasta agotar los 3 ciclos.

---
name: waypoint
description: >
  Genera tours guiados interactivos para usuarios finales dentro de una app web:
  analiza el código de una vista, entiende su flujo y formularios, y produce un
  archivo .tour.json que el runtime de Waypoint convierte en un tutorial con
  máscara de enfoque, cursor animado y textos en lenguaje humano.
  Usa esta skill SIEMPRE que el usuario mencione tour, tutorial, onboarding,
  guía de usuario, walkthrough, "explicar la app a los usuarios", ayuda
  contextual, o pida documentar visualmente una pantalla, vista, módulo,
  formulario o página de Ayuda — aunque no diga la palabra "tour".
compatibility: Requiere @waypoint/cli y Node 18+. Ejecuta `npx waypoint doctor` si algo falla.
---

# Waypoint — generador de tours guiados

Produces **datos, no código**. Tu salida es un `*.tour.json` válido contra
`schema/tour.schema.json`. Todo el comportamiento visual ya existe en el runtime.
Nunca escribas CSS, componentes de overlay ni lógica de posicionamiento.

Todo lo determinista lo hace el CLI. Tú solo decides **orden, agrupación y redacción**.

## Reglas absolutas

1. Nunca inventes un selector. Los selectores salen de la FASE 3, no de tu cabeza.
2. Nunca te saltes la FASE 6. Un tour sin verificar no se entrega.
3. Antes de escribir un solo texto, lee `reference/tone.md`. Sin excepción.
4. Si la vista tiene formulario, lee además `reference/forms.md`.
5. Máximo 12 pasos por tour. Si no caben, agrupa o parte el tour en varios.
6. Escribes para el usuario final, no para un programador.
7. Si algo es ambiguo, pregunta al humano. No supongas.

## Pipeline obligatorio — 7 fases en orden

### FASE 0 · Descubrir el proyecto

```bash
npx waypoint discover
```

Lee el `.tourmap.json` resultante. Te da framework, router, mapa ruta→archivo,
sistema de estilos y librería de formularios. Si el comando falla, detente y
reporta: sin esto no puedes ubicar vistas.

### FASE 1 · Analizar la vista

Localiza el archivo de la vista en `.tourmap.json`. Léelo junto con sus hijos
hasta 2 niveles de profundidad. Carga `prompts/02-analyze-view.md` y produce un
inventario mental de:

- Elementos interactivos (botones, campos, enlaces, tabs, toggles).
- Jerarquía visual y secciones.
- Renderizado condicional (`v-if`, `&&`, ternarios) y de qué depende.
- Estados: cargando, vacío, error, sin permisos.
- Modales o drawers que se abren desde aquí.
- Diferencias por rol de usuario.

No escribas nada todavía.

### FASE 2 · Modelar el flujo

Carga `prompts/03-model-flow.md`. Construye el camino real de un usuario que
entra por primera vez: en qué orden toca las cosas, qué es obligatorio, dónde
aparece un modal, cuándo cambia de ruta.

**Este paso es lo que distingue un tutorial de una lista de burbujas.** Un tour
que solo enumera botones de izquierda a derecha está mal hecho.

Decide aquí la agrupación de pasos y los tipos (`reference/step-types.md`).

### FASE 3 · Anclar elementos

```bash
npx waypoint anchor --view=<NombreDeLaVista>
```

Codemod idempotente: inyecta `data-tour="vista.elemento"` en los elementos que
vas a referenciar. Es seguro correrlo varias veces. Usa `--dry-run` si quieres
ver el diff antes.

Lee `reference/selectors.md` para la cascada de estrategias. Los selectores CSS
crudos son el último recurso y siempre llevan `"fragile": true`.

### FASE 4 · Extraer estilos

```bash
npx waypoint tokens
```

Genera `tours/theme.css` con los design tokens reales de la app. No escribas
estilos a mano. Si el comando no encuentra tokens, avisa al humano.

### FASE 5 · Redactar el tour

**Lee `reference/tone.md` ahora.** Si hay formulario, lee también
`reference/forms.md`. Después carga `prompts/04-write-copy.md`.

Escribe `tours/<id>.tour.json` conforme al schema. Rellena `generatedBy` con tu
identificador de agente, la fecha y los archivos fuente que leíste.

### FASE 6 · Verificar y reparar

```bash
npx waypoint verify tours/<id>.tour.json --json
```

Levanta la app en un navegador real y comprueba cada paso. Si `ok: false`:

1. Lee `prompts/05-repair.md`.
2. Corrige según el `code` de cada issue.
3. Vuelve a verificar.

**Máximo 3 ciclos de reparación.** Al cuarto fallo, detente y reporta al humano
qué issues quedan y por qué crees que no se resuelven solos.

### FASE 7 · Registrar

```bash
npx waypoint register
```

Actualiza `tours/index.json`. Si el usuario pidió que aparezca en la página de
Ayuda, genera o actualiza ese componente leyendo el índice — nunca lo hardcodees.

## Cómo interpretar lo que te piden

| El usuario dice | Haces |
|---|---|
| "haz un tour del login" | Pipeline completo para una vista |
| "haz un tour de toda mi app" | FASE 0, propones el listado de vistas y **esperas confirmación**, luego un tour por vista + una `sequence` en `index.json` |
| "haz un tour de la vista X y agrégalo a Ayuda" | Pipeline completo + FASE 7 con página de Ayuda |
| "arregla el tour de facturación" | FASE 6 directo; solo vuelve a FASE 1 si `verify` reporta `SOURCE_DRIFT` |
| "el tour del checkout está confuso" | FASE 1, 2 y 5. Rehaz orden y textos, conserva las anclas |

Nunca generes tours para toda la app sin confirmar antes la lista de vistas. En
apps medianas son 30+ archivos y el usuario probablemente quiere 6.

## Errores comunes que debes evitar

- Un paso por cada campo de un formulario largo. **Agrupa.**
- Describir lo que se ve ("Este es el botón Guardar"). Explica **para qué sirve**.
- Empezar por el primer elemento del DOM en vez de por donde el usuario empieza.
- Tours de 25 pasos. El límite de 12 es real y el schema lo rechaza.
- Enviar formularios de verdad. `demoMode` está activo por defecto; respétalo.
- Inventar `data-tour` sin correr el codemod. El atributo no existe hasta FASE 3.

## Archivos de referencia

Cárgalos solo cuando el pipeline te lo indique.

| Archivo | Cuándo |
|---|---|
| `reference/tone.md` | **Siempre**, antes de FASE 5 |
| `reference/forms.md` | Si la vista tiene formulario |
| `reference/step-types.md` | En FASE 2, al elegir tipos |
| `reference/selectors.md` | En FASE 3 |
| `reference/frameworks/<fw>.md` | En FASE 1, según `.tourmap.json` |
| `prompts/0X-*.md` | En la fase que corresponda |

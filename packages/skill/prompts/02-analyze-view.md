# FASE 1 · Analizar la vista

No escribas nada todavía. Este paso produce un inventario **en tu memoria de
trabajo**, no un archivo — lo usas en FASE 2 para modelar el flujo.

## Qué leer

1. El archivo de la vista que `.tourmap.json` te dio para esta ruta.
2. Sus `children` listados en `.tourmap.json` (componentes locales que
   importa y usa como JSX/template).
3. Si algún `children` a su vez importa otro componente local relevante
   (un campo de formulario complejo, una tabla), léelo también — hasta 2
   niveles de profundidad desde la vista raíz. No sigas más allá; si a esa
   profundidad no encontraste lo que buscas, pregunta al humano en vez de
   seguir bajando.
4. Carga `reference/frameworks/<framework>.md` (según lo que diga
   `.tourmap.json`) para saber los patrones específicos de ese framework.

## Qué buscar

- **Elementos interactivos**: botones, campos, enlaces, tabs, toggles,
  selects, checkboxes. Para cada uno: ¿qué hace?, ¿es obligatorio para
  completar la tarea principal de la vista o es secundario?
- **Jerarquía visual y secciones**: ¿qué agrupa el layout? (una tabla, un
  formulario, una barra de filtros, un panel lateral). Esto te va a servir
  para decidir agrupación de pasos en FASE 2.
- **Renderizado condicional**: cada `v-if`/`&&`/ternario. Para cada uno,
  anota de qué variable de estado depende y qué la cambia.
- **Estados**: cargando, vacío, error, sin permisos. ¿La vista los maneja
  explícitamente? Si hay un estado vacío con copy propio, no lo repitas en
  tu tour (ver `tone.md`, regla de no ser redundante).
- **Modales o drawers** que se abren desde aquí: qué los dispara, qué
  contienen.
- **Diferencias por rol de usuario**: ¿hay elementos que solo aparecen para
  admin? Anótalos — afectan si el tour necesita `skipIf` o si debe ser dos
  tours con `audience` distinto.
- **Formulario**: si `.tourmap.json` marca `hasForm: true`, identifica cada
  campo, cuáles son obligatorios, cuáles dependen de otros, y dónde está la
  validación real (ver `reference/frameworks/<framework>.md` y
  `reference/forms.md` Regla 2).

## Salida esperada

Un inventario mental (no un archivo) con: lista de elementos interactivos
con su propósito, mapa de condiciones de renderizado, lista de estados
posibles, y si hay formulario, la lista de campos con su meta
(`required`/`dependsOn`/`validation` tentativos). Con esto pasas a FASE 2.

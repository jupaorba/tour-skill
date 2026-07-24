# FASE 2 · Modelar el flujo

Con el inventario de FASE 1 en mente, construye el camino real de un usuario
que entra a esta vista **por primera vez** y necesita completar la tarea
principal. Esto es lo que distingue un tutorial de una lista de burbujas —
tómate el tiempo.

## Preguntas guía

1. **¿Por dónde entra el usuario?** No siempre es la esquina superior
   izquierda del layout. ¿Qué es lo primero que ve, y qué es lo primero que
   *necesita hacer*? Empieza el tour ahí, no en el primer elemento del DOM.
2. **¿Qué es lo primero que tiene que hacer?** La tarea principal de la
   vista (registrar algo, consultar algo, cobrar algo). Todo lo demás es
   secundario y puede ir después o quedar fuera.
3. **¿Qué puede ignorar?** No todo elemento merece un paso. Un filtro
   opcional, una columna informativa, un enlace secundario — si no bloquea
   completar la tarea principal, probablemente no necesita paso propio.
4. **¿Dónde aparece un modal?** Si abrir un modal es parte del flujo
   principal, el paso que lo abre es `openModal`, y los pasos siguientes
   ocurren "dentro" de ese contexto (el runtime cambia de `blocking` a
   `passthrough` automáticamente, tú solo ordena los pasos como si el modal
   ya estuviera abierto).
5. **¿Cuándo cambia de ruta?** Si la tarea cruza más de una vista, marca
   dónde va un paso `type: "navigate"` y qué debe pasar en la vista destino.
6. **¿Dónde se atora la gente?** Piensa en la persona real: ¿qué campo tiene
   un formato raro?, ¿qué botón no es obvio que hace algo irreversible?,
   ¿qué mensaje de error confunde? Esos puntos merecen más detalle, no menos.

## Agrupación y tipos

- Aplica `reference/forms.md` Regla 1 si hay formulario: agrupa por sección
  lógica, desglosa a campo individual solo cuando cumple una de las 4
  condiciones ahí descritas.
- Para cada paso, decide su `type` con el árbol de decisión de
  `reference/step-types.md`.
- Cuenta los pasos que llevas. **Límite duro: 12.** Si no caben:
  - Agrupa más agresivamente con `type: "group"`.
  - O parte el tour en dos con `onFinish.nextTour` (útil para wizards, ver
    `forms.md` sección de formularios de varios pasos).

## Salida esperada

Una lista ordenada de pasos (id tentativo, tipo, qué ancla, una frase de qué
comunica — todavía no el copy final) que sigue el orden real en que un
usuario nuevo completaría la tarea. Con esto pasas a FASE 3 (anchor) y luego
FASE 5 (redactar), después de leer `tone.md`.

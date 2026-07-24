# Tipos de paso

## Árbol de decisión

```
¿El usuario solo mira, no interactúa?
  └─ Sí → highlight

¿El usuario tiene que escribir algo?
  └─ Sí → input (el runtime escribe demoValue solo, con animación de tecleo)

¿El paso lo tiene que hacer el usuario con datos reales, no una demo?
  └─ Sí → await (el runtime espera el evento real del usuario, no simula nada)

¿Son varios elementos de una misma sección los que quieres señalar juntos?
  └─ Sí → group (anchors[], una sola máscara con varios huecos)

¿Hay que cambiar de ruta para seguir el tour?
  └─ Sí → navigate

¿Hay que abrir un modal/drawer de la app para continuar?
  └─ Sí → openModal

¿Es el primer paso (intro) o el último (cierre)?
  └─ Sí → modal (sin ancla, centrado)

¿El runtime debe ejecutar la acción por el usuario (click de demo)?
  └─ Sí → action
```

## Tabla

| Tipo | Cuándo usarlo | Campos obligatorios | Error típico |
|---|---|---|---|
| `modal` | Intro y cierre del tour. Sin ancla, centrado en pantalla. | `body` | Ponerle `anchor` — el schema lo rechaza (R4). |
| `highlight` | Señalar algo que el usuario solo necesita ver/entender. | `anchor`, `body` | Usarlo para un botón que el usuario debe presionar — ahí va `action` o `await`. |
| `input` | El runtime escribe un valor de ejemplo en un campo. | `anchor`, `body`, `demoValue` | Olvidar `demoValue` — el schema lo exige (R5). Usar un dato real en vez de ficticio (ver `forms.md` Regla 5). |
| `action` | El runtime hace click/interacción de demo por el usuario. | `anchor`, `body` | Usarlo sobre un submit real sin `sideEffect` — nunca sale una petición real si `demoMode` está activo, pero igual marca `sideEffect` para que `verify` lo detecte. |
| `await` | El usuario tiene que interactuar de verdad (no hay demo posible: elegir un archivo, confirmar con su propio criterio). | `anchor`, `body` | Usarlo cuando sí se puede simular — alarga el tour sin necesidad. |
| `group` | Varios campos/elementos de una misma sección lógica. | `anchors` (2 a 8), `body` | Meter campos de secciones distintas en el mismo grupo — confunde más que ayuda. |
| `navigate` | Cambiar de ruta como parte del flujo. | `route`, `body` | Olvidar que el paso siguiente debe asumir que ya estás en la nueva ruta. |
| `openModal` | Abrir un modal/drawer de la app para seguir el tour ahí dentro. | `anchor`, `body` | Confundirlo con `action`: `openModal` es semántico (documenta la intención), `verify` no lo trata distinto de `action` en runtime pero ayuda a quien lea el JSON. |

## Reglas del schema que ya te protegen

- `highlight`, `input`, `action`, `await`, `openModal` → exigen `anchor`.
- `group` → exige `anchors` (mínimo 2, máximo 8).
- `navigate` → exige `route`.
- `modal` → prohíbe `anchor` y `anchors`.
- `input` → exige `demoValue`.

No dupliques esta validación en tu cabeza; si el JSON no cumple, `verify`
te lo dice con `SCHEMA_INVALID` y el `instancePath` exacto.

## Agrupación (recordatorio de `forms.md`)

Un formulario largo no son N pasos. Agrupa con `group` y desglosa a paso
individual solo cuando un campo tiene formato no obvio, cambia qué otros
campos aparecen, tiene validación difícil de adivinar, o equivocarse tiene
consecuencia real. Ver `forms.md` Regla 1 para el ejemplo completo.

# Formularios

Aquí es donde un tour se convierte en tutorial. Cualquier librería sabe resaltar
un botón; casi ninguna entiende que un formulario tiene lógica, orden,
dependencias y consecuencias.

## Regla 1 — Agrupa, no enumeres

**Un formulario de 12 campos no son 12 pasos.** Agrupa por sección lógica con
`type: "group"` y `anchors: []`, y solo desglosa a campo individual cuando ese
campo cumple al menos una condición:

- Tiene un formato no obvio (RFC, CURP, código de 13 dígitos, fecha con formato).
- Su valor cambia qué otros campos aparecen.
- Su validación es difícil de adivinar (contraseña con reglas, monto con tope).
- Equivocarse tiene consecuencia real (irreversible, cobra dinero, notifica a alguien).

Todo lo demás va agrupado.

### Ejemplo

Formulario de alta de cliente con: nombre, apellidos, correo, teléfono, RFC,
tipo de persona, razón social, calle, número, colonia, CP, ciudad, estado.

❌ **Mal — 13 pasos:**
`nombre` → `apellidos` → `correo` → `teléfono` → `RFC` → …

✅ **Bien — 5 pasos:**

1. `group` sobre nombre + apellidos + correo + teléfono → "Empieza con los datos
   de contacto. El correo es el que usaremos para mandarle sus facturas."
2. `input` sobre tipoPersona → "Elige Física o Moral. Si eliges Moral, te
   pediremos la razón social."
3. `input` sobre RFC → "Son 13 caracteres para persona física y 12 para moral.
   Sin espacios ni guiones."
4. `group` sobre toda la dirección → "Llena la dirección fiscal. Al escribir el
   código postal se completan solos la colonia, ciudad y estado."
5. `action` sobre Guardar → "Guarda. El cliente queda disponible de inmediato
   para facturarle."

## Regla 2 — Traduce la validación real

Lee la validación del código y conviértela a español. Fuentes por orden de
confianza:

1. Esquema de validación: Zod, Yup, Valibot, Joi, VeeValidate.
2. Config de `react-hook-form` / `Formik`.
3. Atributos HTML: `required`, `pattern`, `minlength`, `min`, `max`, `type`.
4. Validación manual dentro del handler.

| Código | `field.validation` |
|---|---|
| `z.string().min(8).regex(/[A-Z]/)` | "Mínimo 8 caracteres e incluye al menos una mayúscula." |
| `z.string().email()` | "Debe ser un correo válido, con arroba y dominio." |
| `pattern="[0-9]{13}"` | "Son 13 dígitos, sin espacios ni guiones." |
| `min={1} max={99}` | "Puedes poner entre 1 y 99." |
| `.refine(v => v > hoy)` | "La fecha tiene que ser posterior a hoy." |

Si no encuentras la validación en el código, deja `field.validation` en `null`.
**No la inventes.**

## Regla 3 — Distingue obligatorio de opcional

Es la duda número uno del usuario real frente a un formulario. Marca siempre
`field.required` y menciónalo en el texto cuando no sea evidente en la interfaz.

> ✅ "Las notas son opcionales. Puedes guardar sin llenarlas."
> ✅ "Sin el correo no podemos guardar el registro."

## Regla 4 — Explica las dependencias condicionales

Si un campo aparece, desaparece o cambia según otro, dilo. Usa `field.dependsOn`
con la forma `"campo=valor"`.

> ✅ "Este campo solo aparece si elegiste Persona moral."
> ✅ "Al elegir Transferencia se te va a pedir la cuenta destino."

Si el campo condicional no está visible cuando corre el tour, el paso necesita
`skipIf` o debe ir precedido de un `input` que dispare la condición.

## Regla 5 — Nunca envíes datos reales

Con `demoMode: true` (predeterminado) el runtime intercepta el envío de los pasos
con `sideEffect: "network"` y muestra "Aquí se guardaría tu información".

- Marca `sideEffect: "network"` en cualquier paso que dispare una petición.
- Marca `sideEffect: "destructive"` si borra, cobra o notifica. El schema exige
  `demoMode: true` a nivel de tour para permitirlo.
- En `demoValue` usa siempre datos ficticios: dominio `ejemplo.com`, nombres
  genéricos, teléfonos `55 1234 5678`, RFC de ejemplo. **Nunca datos que
  encuentres en el código, en seeds, en fixtures o en la base de datos.**

## Regla 6 — Cierra el ciclo

El último paso de todo formulario responde tres preguntas: **qué pasa al enviar,
cuánto tarda, y cómo sabe el usuario que funcionó.**

> ✅ "Guarda. El pedido se registra al instante, le llega un correo al cliente y
> lo vas a ver hasta arriba de tu lista."

Sin esto el usuario queda con la duda de si su información se fue a algún lado, y
esa duda es la causa más común de que llenen el mismo formulario tres veces.

## Formularios de varios pasos (wizards)

- Un tour por paso del wizard, encadenados con `onFinish.nextTour`.
- El primer paso de cada tour dice en qué parte del proceso va: "Paso 2 de 4:
  datos de envío."
- Nunca metas un wizard completo en un solo tour: rompe el límite de 12 pasos y
  el usuario pierde el hilo.

## Manejo de errores de validación

Si la vista muestra errores debajo de los campos, agrega un paso `highlight`
sobre la zona de error **solo si el mensaje de error no es autoexplicativo**. Si
la app ya dice "El correo no es válido", no gastes un paso en repetirlo.

## Checklist antes de entregar un tour con formulario

- [ ] ¿Agrupé los campos obvios?
- [ ] ¿Cada `field.validation` sale del código real, no de mi suposición?
- [ ] ¿Marqué obligatorio vs opcional?
- [ ] ¿Expliqué las dependencias condicionales?
- [ ] ¿Todos los `demoValue` son ficticios?
- [ ] ¿El paso final dice qué pasa después de enviar?
- [ ] ¿Marqué `sideEffect` en los pasos que tocan el servidor?
- [ ] ¿El tour tiene 12 pasos o menos?

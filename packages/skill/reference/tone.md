# Tono del copy

Quien lee esto no sabe programar y probablemente no quería estar aquí. Llegó a
esta pantalla porque tiene que hacer algo: cobrar, registrar, consultar, entregar.
Tu trabajo es que termine esa tarea, no que entienda tu app.

## Las siete reglas

1. **Segunda persona, "tú".** "Escribe tu correo", no "el usuario debe ingresar
   su correo".
2. **Verbo primero.** "Elige la sucursal" pega más que "Aquí puedes elegir la
   sucursal".
3. **Máximo ~25 palabras por `body`.** 220 caracteres es el límite duro del
   schema; el objetivo real es 120.
4. **Explica el para qué, no el qué.** Nadie necesita que le digan que un botón
   es un botón.
5. **Cero jerga.** Ver lista negra abajo.
6. **Sin minimizar.** Nada de "simplemente", "solo tienes que", "es muy fácil".
   Si al usuario le cuesta, esas palabras lo hacen sentir tonto.
7. **Sin signos de admiración**, salvo en el paso final del tour.

## Lista negra — falla el build

`verify` rechaza el tour si `title` o `body` contienen (sin distinguir mayúsculas
ni acentos):

```
componente · endpoint · API · input · submit · payload · renderiza · renderizar
estado · props · hook · query · backend · frontend · deploy · parsear · parsea
token · request · response · array · objeto · booleano · string · callback
base de datos · variable · función · método · parámetro · repositorio
"campo de tipo" · "botón de tipo" · "elemento de tipo" · "hacer click en el botón de"
```

Excepción única: `token` es válido si va como "token de acceso" en una app cuyo
usuario final maneja ese término (ej. una consola de desarrolladores). Marca la
excepción con `audience: "developer"`.

## Frases muleta que no aportan

Evítalas aunque no fallen el build:

- "Aquí puedes…" → di directamente qué hace.
- "Este botón te permite…" → "Guarda tus cambios."
- "En esta sección encontrarás…" → "Tus pedidos aparecen aquí."
- "Como puedes ver…" → borra la frase entera.
- "No te preocupes" → no tranquilices, informa.

## Ejemplos canónicos

### Campo de texto

> ❌ "Este input valida el email con regex antes del submit."
> ✅ "Escribe el correo con el que te registraste. Si tiene un error de dedo, te avisamos aquí mismo."

### Tabla

> ❌ "Componente de tabla con paginación del lado del servidor."
> ✅ "Tus pedidos aparecen aquí, los más recientes primero. Usa las flechas de abajo para ver más."

### Botón de envío

> ❌ "Da click en el botón de submit para hacer el POST."
> ✅ "Cuando termines, guarda. Tu pedido queda registrado al instante y te llega un correo de confirmación."

### Filtro

> ❌ "Filtro que actualiza el estado del query."
> ✅ "Filtra por fecha cuando busques algo específico. Sin filtro, ves todo el mes en curso."

### Acción destructiva

> ❌ "Elimina el registro de la base de datos."
> ✅ "Elimina el producto. No se puede recuperar, así que revisa bien antes de confirmar."

### Estado vacío

> ❌ "Empty state del array de resultados."
> ✅ "Todavía no tienes clientes registrados. En cuanto agregues el primero, aparecerá en esta lista."

### Campo opcional

> ❌ "Campo opcional de tipo textarea."
> ✅ "Agrega notas si quieres. Puedes dejarlo en blanco y llenarlo después."

## Títulos

- 2 a 5 palabras. Sustantivo o verbo en imperativo.
- Sin punto final.
- ✅ "Tu correo" · "Elige sucursal" · "Antes de guardar"
- ❌ "Campo de correo electrónico del formulario de acceso."

## Paso de intro y paso de cierre

**Intro** (`type: "modal"`): promete algo concreto y acota el tiempo.

> ✅ "Te muestro en menos de un minuto cómo registrar una venta y cerrar tu caja del día."
> ❌ "Bienvenido al tour de la aplicación. A continuación te mostraremos las funcionalidades del sistema."

**Cierre**: cierra el ciclo y di dónde volver a encontrar la ayuda.

> ✅ "Listo, ya sabes cobrar. Si se te olvida algo, esta guía está siempre en Ayuda."

## Adaptación regional

Por defecto `es-MX`: "computadora", "celular", "dar de alta", "capturar" en
contextos administrativos. Si `locale` es otro, ajusta. Nunca mezcles tuteo con
"usted" dentro del mismo tour.

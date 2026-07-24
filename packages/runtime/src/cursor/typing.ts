/**
 * React y Vue interceptan el setter nativo de `value` en inputs controlados;
 * `el.value = x` no dispara su re-render. Hay que llamar al setter del
 * prototipo y despachar los eventos a mano. Resuelve el riesgo A9.
 */
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (!setter) {
    el.value = value;
    return;
  }
  setter.call(el, value);
}

export async function typeInto(
  el: HTMLInputElement | HTMLTextAreaElement,
  text: string,
  speedMs = 45,
  reduced = false
): Promise<void> {
  el.focus();
  if (reduced) {
    setNativeValue(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
    return;
  }
  for (let i = 1; i <= text.length; i++) {
    setNativeValue(el, text.slice(0, i));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, speedMs));
  }
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
}

export function setSelectValue(el: HTMLSelectElement, value: string) {
  if (el.multiple) {
    const values = new Set(value.split(',').map((v) => v.trim()));
    Array.from(el.options).forEach((o) => {
      o.selected = values.has(o.value);
    });
  } else {
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
    if (setter) setter.call(el, value);
    else el.value = value;
  }
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

export function clickToggle(el: HTMLInputElement) {
  el.click();
}

/**
 * `type=date/number/range/color` etc. rechazan valores parciales o no
 * disparan onChange de React con `el.value = x` sin pasar por el setter
 * nativo (mismo problema que setNativeValue). No se pueden "teclear"
 * carácter a carácter como texto: el navegador descarta un valor de
 * fecha incompleto a medio escribir.
 */
const NON_TYPING_INPUT_TYPES = new Set(['date', 'time', 'week', 'month', 'datetime-local', 'range', 'color', 'number']);

/** Aplica `demoValue` según el tipo real del control: checkbox/radio, select,
 * inputs no tecleables (fecha, rango, color, número) o texto/textarea. */
export async function applyDemoValue(
  el: HTMLElement,
  value: string,
  speedMs = 45,
  reduced = false
): Promise<void> {
  if (el instanceof HTMLSelectElement) {
    setSelectValue(el, value);
    return;
  }

  if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
    const shouldCheck = value !== 'false' && value !== '0' && value !== '';
    if (el.checked !== shouldCheck) clickToggle(el);
    return;
  }

  if (el instanceof HTMLInputElement && NON_TYPING_INPUT_TYPES.has(el.type)) {
    el.focus();
    setNativeValue(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.blur();
    return;
  }

  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    await typeInto(el, value, speedMs, reduced);
  }
}

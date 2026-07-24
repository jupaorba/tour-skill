import { describe, expect, it } from 'vitest';
import { typeInto } from '../src/cursor/typing.js';

describe('typeInto', () => {
  it('escribe el valor con el setter nativo y dispara input/change/blur (modo reducido)', async () => {
    const input = document.createElement('input');
    document.body.appendChild(input);

    const events: string[] = [];
    input.addEventListener('input', () => events.push('input'));
    input.addEventListener('change', () => events.push('change'));
    input.addEventListener('blur', () => events.push('blur'));

    await typeInto(input, 'hola@ejemplo.com', 5, true);

    expect(input.value).toBe('hola@ejemplo.com');
    expect(events).toEqual(['input', 'change', 'blur']);
  });

  it('en modo no reducido despacha un evento input por carácter', async () => {
    const input = document.createElement('input');
    document.body.appendChild(input);

    let inputEvents = 0;
    input.addEventListener('input', () => inputEvents++);

    await typeInto(input, 'abc', 1, false);

    expect(input.value).toBe('abc');
    expect(inputEvents).toBe(3);
  });

  it('funciona igual en un framework que intercepta el setter de value (simulación React)', async () => {
    const input = document.createElement('input');
    document.body.appendChild(input);

    let frameworkState = '';
    // Simula un componente controlado: escucha `input` y "re-sincroniza" su
    // propio estado, igual que haría React con onChange.
    input.addEventListener('input', (e) => {
      frameworkState = (e.target as HTMLInputElement).value;
    });

    await typeInto(input, 'Persona Física', 1, true);

    expect(frameworkState).toBe('Persona Física');
    expect(input.value).toBe('Persona Física');
  });
});

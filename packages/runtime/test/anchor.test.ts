import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { resolveAnchor } from '../src/anchor/resolve.js';

function stubRect(el: HTMLElement, rect: Partial<DOMRect>) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect);
}

describe('resolveAnchor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('resuelve un selector visible en el primer intento', async () => {
    const el = document.createElement('button');
    el.setAttribute('data-tour', 'login.submit');
    document.body.appendChild(el);
    stubRect(el, { width: 80, height: 32 });

    const promise = resolveAnchor({ selector: '[data-tour="login.submit"]', strategy: 'data-tour' });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result?.el).toBe(el);
  });

  it('usa el fallback si el selector principal no existe', async () => {
    const fallbackEl = document.createElement('button');
    fallbackEl.id = 'submit-fallback';
    document.body.appendChild(fallbackEl);
    stubRect(fallbackEl, { width: 80, height: 32 });

    const promise = resolveAnchor({
      selector: '[data-tour="no-existe"]',
      strategy: 'data-tour',
      fallback: '#submit-fallback',
    });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result?.el).toBe(fallbackEl);
  });

  it('devuelve null tras 3 reintentos si el elemento nunca aparece, sin lanzar excepción', async () => {
    const promise = resolveAnchor({ selector: '[data-tour="nunca"]', strategy: 'data-tour' });
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBeNull();
  });

  it('ignora elementos con display:none y reintenta', async () => {
    const el = document.createElement('button');
    el.setAttribute('data-tour', 'x');
    el.style.display = 'none';
    document.body.appendChild(el);
    stubRect(el, { width: 80, height: 32 });

    const promise = resolveAnchor({ selector: '[data-tour="x"]', strategy: 'data-tour' });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBeNull();
  });
});

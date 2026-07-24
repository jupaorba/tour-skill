let liveRegion: HTMLElement | null = null;

function ensureLiveRegion(): HTMLElement {
  if (liveRegion) return liveRegion;
  const el = document.createElement('div');
  el.className = 'wp-sr-only';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'true');
  document.body.appendChild(el);
  liveRegion = el;
  return el;
}

export function announce(message: string) {
  const el = ensureLiveRegion();
  el.textContent = '';
  window.requestAnimationFrame(() => {
    el.textContent = message;
  });
}

export function destroyLiveRegion() {
  liveRegion?.remove();
  liveRegion = null;
}

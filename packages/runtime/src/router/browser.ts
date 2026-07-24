/**
 * Ningún framework (React Router, Vue Router, Next) dispara `popstate` en
 * navegación programática (push/replace). Cada adaptador debe llamar
 * `announceNavigation()` después de navegar para que `subscribe` reaccione.
 */
const EVENT = 'waypoint:navigate';

export function announceNavigation() {
  dispatchEvent(new Event(EVENT));
}

export function subscribeToPathChange(cb: (path: string) => void): () => void {
  const handler = () => cb(location.pathname);
  addEventListener('popstate', handler);
  addEventListener(EVENT, handler);
  return () => {
    removeEventListener('popstate', handler);
    removeEventListener(EVENT, handler);
  };
}

export function currentPath(): string {
  return location.pathname;
}

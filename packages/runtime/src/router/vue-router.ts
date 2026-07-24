import type { RouterAdapter } from '../types.js';
import { announceNavigation, currentPath, subscribeToPathChange } from './browser.js';

/**
 * Forma estructural mínima de un router de Vue Router 4. No se importa el
 * paquete: el runtime solo puede depender de @floating-ui/dom.
 */
export interface VueRouterLike {
  push(to: string): unknown;
  afterEach(cb: (to: { fullPath: string }) => void): void;
}

export function createVueRouterAdapter(router: VueRouterLike): RouterAdapter {
  router.afterEach(() => announceNavigation());
  return {
    navigate(to: string) {
      void router.push(to);
    },
    current: currentPath,
    subscribe: subscribeToPathChange,
  };
}

import type { RouterAdapter } from '../types.js';
import { announceNavigation, currentPath, subscribeToPathChange } from './browser.js';

/**
 * Forma estructural del router de Next.js App Router (`useRouter()` de
 * `next/navigation`). No se importa `next`: el runtime solo puede depender de
 * @floating-ui/dom.
 */
export interface NextRouterLike {
  push(href: string): void;
}

export function createNextAdapter(router: NextRouterLike): RouterAdapter {
  return {
    navigate(to: string) {
      router.push(to);
      announceNavigation();
    },
    current: currentPath,
    subscribe: subscribeToPathChange,
  };
}

import type { RouterAdapter } from '../types.js';
import { announceNavigation, currentPath, subscribeToPathChange } from './browser.js';

/**
 * No importa `react-router-dom` (el runtime solo puede depender de
 * @floating-ui/dom). Recibe la función `navigate` obtenida por el consumidor
 * vía `useNavigate()` de React Router 6+.
 */
export function createReactRouterAdapter(navigate: (to: string) => void): RouterAdapter {
  return {
    navigate(to: string) {
      navigate(to);
      announceNavigation();
    },
    current: currentPath,
    subscribe: subscribeToPathChange,
  };
}

import type { LayerManager, LayerMode } from '../types.js';

type PopoverCapableElement = HTMLElement & {
  showPopover?: () => void;
  hidePopover?: () => void;
};

const FALLBACK_Z = 2147483000;

/**
 * Resuelve el riesgo A8: dialog.showModal() da top layer pero vuelve inerte el
 * fondo (rompe pasos `await`). La Popover API da top layer sin bloquear.
 * Ver BUILD_PLAN.md §4.4.
 */
export class TopLayerManager implements LayerManager {
  private dialog = document.createElement('dialog');
  private pop = document.createElement('div') as PopoverCapableElement;
  private mode: LayerMode = 'blocking';
  private mounted = false;
  private supportsPopover = typeof HTMLElement.prototype.showPopover === 'function';
  private warnedFallback = false;

  mount(mode: LayerMode): HTMLElement {
    this.dialog.className = 'wp-layer wp-layer--blocking';
    this.pop.className = 'wp-layer wp-layer--pass';

    if (this.supportsPopover) {
      this.pop.setAttribute('popover', 'manual');
    } else {
      this.pop.style.position = 'fixed';
      this.pop.style.inset = '0';
      this.pop.style.zIndex = String(FALLBACK_Z);
      if (!this.warnedFallback) {
        // eslint-disable-next-line no-console
        console.warn(
          '[waypoint] Popover API no disponible en este navegador. Se usa fallback con z-index fijo.'
        );
        this.warnedFallback = true;
      }
    }

    document.body.append(this.dialog, this.pop);
    this.mounted = true;
    this.setMode(mode);
    return this.host();
  }

  setMode(mode: LayerMode) {
    if (mode === this.mode && this.isOpen()) return;

    const previousHost = this.host();
    const switchingHost = mode !== this.mode;

    this.closeAll();
    this.mode = mode;
    if (!this.mounted) return;

    if (mode === 'blocking') {
      if (typeof this.dialog.showModal === 'function') {
        this.dialog.showModal();
      } else {
        this.dialog.setAttribute('open', '');
      }
    } else if (this.supportsPopover) {
      this.pop.showPopover?.();
    } else {
      this.pop.style.display = 'block';
    }

    // Un <dialog> cerrado no pinta sus hijos aunque sigan en el DOM: la
    // máscara/tooltip que vivían en el host anterior quedarían invisibles si
    // no se reparentan al nuevo host. Ver riesgo A8 en BUILD_PLAN.md §4.4.
    if (switchingHost && previousHost !== this.host()) {
      const newHost = this.host();
      Array.from(previousHost.childNodes).forEach((node) => newHost.appendChild(node));
    }
  }

  host(): HTMLElement {
    return this.mode === 'blocking' ? this.dialog : this.pop;
  }

  isOpen(): boolean {
    return this.mode === 'blocking' ? this.dialog.open : this.pop.matches(':popover-open') || this.pop.style.display === 'block';
  }

  private closeAll() {
    if (this.dialog.open) this.dialog.close();
    if (this.supportsPopover) {
      try {
        this.pop.hidePopover?.();
      } catch {
        /* ya estaba cerrado */
      }
    } else {
      this.pop.style.display = 'none';
    }
  }

  destroy() {
    this.closeAll();
    this.dialog.remove();
    this.pop.remove();
    this.mounted = false;
  }
}

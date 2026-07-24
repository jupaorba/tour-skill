import { computePosition, offset, flip, shift, arrow, size, autoUpdate, type Placement as FuiPlacement } from '@floating-ui/dom';
import type { Placement, Tooltip as TooltipIface, TooltipContent } from '../types.js';
import { renderTooltip } from './template.js';

const PLACEMENT_MAP: Record<Placement, FuiPlacement | undefined> = {
  auto: undefined,
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
};

export class WaypointTooltip implements TooltipIface {
  private root: HTMLElement | null = null;
  private el: HTMLDivElement | null = null;
  private arrowEl: HTMLDivElement | null = null;
  private cleanupAutoUpdate: (() => void) | null = null;

  mount(root: HTMLElement) {
    this.root = root;
    const el = document.createElement('div');
    el.className = 'wp-tooltip';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    const arrowEl = document.createElement('div');
    arrowEl.className = 'wp-tooltip-arrow';
    el.appendChild(arrowEl);
    root.appendChild(el);
    this.el = el;
    this.arrowEl = arrowEl;
  }

  async show(target: HTMLElement, opts: TooltipContent): Promise<void> {
    if (!this.el || !this.arrowEl) return;
    renderTooltip(this.el, this.arrowEl, opts);
    this.el.style.display = 'block';

    const fuiPlacement = PLACEMENT_MAP[opts.placement];

    const update = async () => {
      if (!this.el || !this.arrowEl) return;
      const { x, y, placement, middlewareData } = await computePosition(target, this.el, {
        placement: fuiPlacement,
        middleware: [
          offset(12),
          flip(),
          shift({ padding: 8 }),
          arrow({ element: this.arrowEl }),
          size({
            padding: 8,
            apply: ({ availableWidth, availableHeight, elements }) => {
              Object.assign(elements.floating.style, {
                maxWidth: `${Math.max(220, availableWidth)}px`,
                maxHeight: `${Math.max(120, availableHeight)}px`,
              });
            },
          }),
        ],
      });

      Object.assign(this.el.style, { left: `${x}px`, top: `${y}px` });
      this.el.setAttribute('data-placement', placement);

      const arrowData = middlewareData.arrow;
      if (arrowData) {
        const side = placement.split('-')[0] as 'top' | 'bottom' | 'left' | 'right';
        const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[side];
        Object.assign(this.arrowEl.style, {
          left: arrowData.x != null ? `${arrowData.x}px` : '',
          top: arrowData.y != null ? `${arrowData.y}px` : '',
          [opposite]: '-4px',
        });
      }
    };

    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = autoUpdate(target, this.el, update);
  }

  hide(): void {
    if (this.el) this.el.style.display = 'none';
    this.cleanupAutoUpdate?.();
    this.cleanupAutoUpdate = null;
  }

  destroy(): void {
    this.hide();
    this.el?.remove();
    this.el = null;
    this.arrowEl = null;
    this.root = null;
  }
}

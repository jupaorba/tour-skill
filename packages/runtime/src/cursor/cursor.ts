import type { VirtualCursor } from '../types.js';

const REDUCED = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

export class WaypointCursor implements VirtualCursor {
  private node: HTMLDivElement;
  private pos = { x: 0, y: 0 };
  private forceReduced: boolean;

  constructor(root: HTMLElement, opts: { reducedMotion?: 'auto' | 'always' | 'never' } = {}) {
    this.node = document.createElement('div');
    this.node.className = 'wp-cursor';
    this.forceReduced = opts.reducedMotion === 'always';
    if (opts.reducedMotion === 'never') this.forceReduced = false;
    root.appendChild(this.node);
  }

  async moveTo(x: number, y: number): Promise<void> {
    const from = this.pos;
    const dist = Math.hypot(x - from.x, y - from.y);
    const dur = Math.min(900, Math.max(300, dist * 0.6));
    this.pos = { x, y };

    if (this.forceReduced || REDUCED?.matches) {
      this.node.style.transform = `translate3d(${x}px,${y}px,0)`;
      return;
    }

    const mx = (from.x + x) / 2 + (y - from.y) * 0.18;
    const my = (from.y + y) / 2 - (x - from.x) * 0.18;
    const frames = Array.from({ length: 24 }, (_, i) => {
      const t = i / 23;
      const u = 1 - t;
      const px = u * u * from.x + 2 * u * t * mx + t * t * x;
      const py = u * u * from.y + 2 * u * t * my + t * t * y;
      return { transform: `translate3d(${px}px,${py}px,0)` };
    });

    await this.node.animate(frames, {
      duration: dur,
      easing: 'cubic-bezier(.4,0,.2,1)',
      fill: 'forwards',
    }).finished;
  }

  async click(): Promise<void> {
    this.node.classList.add('wp-cursor--click');
    await new Promise((r) => setTimeout(r, 180));
    this.node.classList.remove('wp-cursor--click');
  }

  hide(): void {
    this.node.style.opacity = '0';
  }

  destroy(): void {
    this.node.remove();
  }
}

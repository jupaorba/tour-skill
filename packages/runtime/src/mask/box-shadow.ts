import type { Hole, MaskStrategy } from '../types.js';

export class BoxShadowMask implements MaskStrategy {
  private node: HTMLDivElement | null = null;

  mount(root: HTMLElement) {
    const d = document.createElement('div');
    d.className = 'wp-mask';
    root.appendChild(d);
    this.node = d;
  }

  update(holes: Hole[]) {
    const h = holes[0];
    if (!this.node || !h) return;
    Object.assign(this.node.style, {
      transform: `translate3d(${h.x}px, ${h.y}px, 0)`,
      width: `${h.w}px`,
      height: `${h.h}px`,
      borderRadius: h.radius,
      opacity: '1',
    });
  }

  clear() {
    if (this.node) this.node.style.opacity = '0';
  }

  destroy() {
    this.node?.remove();
    this.node = null;
  }
}

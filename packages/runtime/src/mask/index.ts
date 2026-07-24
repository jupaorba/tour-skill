import type { Hole, MaskStrategy } from '../types.js';
import { BoxShadowMask } from './box-shadow.js';
import { SvgMask } from './svg-mask.js';

export { BoxShadowMask } from './box-shadow.js';
export { SvgMask } from './svg-mask.js';

/**
 * Selecciona estrategia según cardinalidad de huecos: box-shadow para uno,
 * SVG mask para varios simultáneos (type: "group").
 */
export class MaskSelector implements MaskStrategy {
  private root: HTMLElement | null = null;
  private single = new BoxShadowMask();
  private multi = new SvgMask();
  private active: MaskStrategy;

  constructor() {
    this.active = this.single;
  }

  mount(root: HTMLElement) {
    this.root = root;
    this.single.mount(root);
    this.multi.mount(root);
    this.active = this.single;
  }

  update(holes: Hole[]) {
    if (!this.root) return;
    const next = holes.length > 1 ? this.multi : this.single;
    if (next !== this.active) {
      this.active.clear();
      this.active = next;
    }
    this.active.update(holes);
  }

  clear() {
    this.single.clear();
    this.multi.clear();
  }

  destroy() {
    this.single.destroy();
    this.multi.destroy();
    this.root = null;
  }
}

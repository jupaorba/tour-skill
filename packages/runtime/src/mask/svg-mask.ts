import type { Hole, MaskStrategy } from '../types.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const MASK_ID = 'wp-svg-mask-holes';

export class SvgMask implements MaskStrategy {
  private svg: SVGSVGElement | null = null;
  private maskEl: SVGMaskElement | null = null;
  private bg: SVGRectElement | null = null;
  private holeNodes: SVGRectElement[] = [];

  mount(root: HTMLElement) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'wp-svg-mask');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    const defs = document.createElementNS(SVG_NS, 'defs');
    const mask = document.createElementNS(SVG_NS, 'mask');
    mask.setAttribute('id', MASK_ID);

    const full = document.createElementNS(SVG_NS, 'rect');
    full.setAttribute('x', '0');
    full.setAttribute('y', '0');
    full.setAttribute('width', '100%');
    full.setAttribute('height', '100%');
    full.setAttribute('fill', 'white');
    mask.appendChild(full);

    defs.appendChild(mask);

    const bg = document.createElementNS(SVG_NS, 'rect');
    bg.setAttribute('x', '0');
    bg.setAttribute('y', '0');
    bg.setAttribute('width', '100%');
    bg.setAttribute('height', '100%');
    bg.setAttribute('fill', 'var(--wp-overlay-color, rgba(0,0,0,.55))');
    bg.setAttribute('mask', `url(#${MASK_ID})`);

    svg.appendChild(defs);
    svg.appendChild(bg);
    root.appendChild(svg);

    this.svg = svg;
    this.maskEl = mask;
    this.bg = bg;
  }

  update(holes: Hole[]) {
    if (!this.maskEl) return;

    while (this.holeNodes.length > holes.length) {
      this.holeNodes.pop()?.remove();
    }
    while (this.holeNodes.length < holes.length) {
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('fill', 'black');
      this.maskEl.appendChild(rect);
      this.holeNodes.push(rect);
    }

    holes.forEach((h, i) => {
      const node = this.holeNodes[i];
      if (!node) return;
      node.setAttribute('x', String(h.x));
      node.setAttribute('y', String(h.y));
      node.setAttribute('width', String(h.w));
      node.setAttribute('height', String(h.h));
      node.setAttribute('rx', h.radius.replace('px', '') || '0');
    });
  }

  clear() {
    if (this.bg) this.bg.style.opacity = '0';
  }

  destroy() {
    this.svg?.remove();
    this.svg = null;
    this.maskEl = null;
    this.bg = null;
    this.holeNodes = [];
  }
}

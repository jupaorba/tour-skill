import type { Anchor, ResolvedAnchor } from '../types.js';

const BACKOFF_MS = [100, 300, 900];

export async function resolveAnchor(a: Anchor): Promise<ResolvedAnchor | null> {
  for (const delay of [0, ...BACKOFF_MS]) {
    if (delay) await new Promise((r) => setTimeout(r, delay));

    const found = document.querySelectorAll<HTMLElement>(a.selector);
    let el = found[0] ?? null;

    if (!el && a.fallback) {
      el = document.querySelector<HTMLElement>(a.fallback);
    }
    if (!el) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;

    return { el, rect, radius: cs.borderRadius || '0px' };
  }
  return null;
}

export async function resolveAnchors(anchors: Anchor[]): Promise<ResolvedAnchor[]> {
  const results = await Promise.all(anchors.map((a) => resolveAnchor(a)));
  return results.filter((r): r is ResolvedAnchor => r !== null);
}

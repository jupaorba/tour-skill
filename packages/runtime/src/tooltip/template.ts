import type { TooltipContent } from '../types.js';

export function renderTooltip(el: HTMLElement, arrowEl: HTMLElement, opts: TooltipContent) {
  el.innerHTML = '';
  el.appendChild(arrowEl);

  const content = document.createElement('div');
  content.className = 'wp-tooltip-content';

  if (opts.title) {
    const h = document.createElement('h3');
    h.className = 'wp-tooltip-title';
    h.textContent = opts.title;
    content.appendChild(h);
  }

  const body = document.createElement('p');
  body.className = 'wp-tooltip-body';
  body.textContent = opts.body;
  content.appendChild(body);

  const footer = document.createElement('div');
  footer.className = 'wp-tooltip-footer';

  const progress = document.createElement('span');
  progress.className = 'wp-tooltip-progress';
  progress.textContent = `${opts.index + 1} / ${opts.total}`;
  progress.setAttribute('aria-hidden', 'true');
  footer.appendChild(progress);

  const actions = document.createElement('div');
  actions.className = 'wp-tooltip-actions';

  if (opts.index > 0 && opts.onPrev) {
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'wp-btn wp-btn--ghost';
    prev.textContent = opts.prevLabel ?? 'Atrás';
    prev.addEventListener('click', opts.onPrev);
    actions.appendChild(prev);
  }

  if (opts.onNext) {
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'wp-btn wp-btn--primary';
    next.textContent = opts.nextLabel ?? (opts.index + 1 === opts.total ? 'Listo' : 'Siguiente');
    next.addEventListener('click', opts.onNext);
    actions.appendChild(next);
  }

  footer.appendChild(actions);
  content.appendChild(footer);
  el.appendChild(content);

  if (opts.onClose) {
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'wp-tooltip-close';
    close.setAttribute('aria-label', opts.closeLabel ?? 'Cerrar tour');
    close.textContent = '×';
    close.addEventListener('click', opts.onClose);
    el.appendChild(close);
  }
}

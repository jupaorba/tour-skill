export function observeAnchor(el: HTMLElement, onChange: () => void): () => void {
  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      onChange();
    });
  };

  const ro = new ResizeObserver(schedule);
  ro.observe(el);
  ro.observe(document.documentElement);

  const mo = new MutationObserver(schedule);
  mo.observe(el, { attributes: true, childList: true, subtree: true });

  addEventListener('scroll', schedule, { passive: true, capture: true });
  addEventListener('resize', schedule, { passive: true });
  visualViewport?.addEventListener('resize', schedule);
  visualViewport?.addEventListener('scroll', schedule);

  return () => {
    if (frame) cancelAnimationFrame(frame);
    ro.disconnect();
    mo.disconnect();
    removeEventListener('scroll', schedule, { capture: true } as EventListenerOptions);
    removeEventListener('resize', schedule);
    visualViewport?.removeEventListener('resize', schedule);
    visualViewport?.removeEventListener('scroll', schedule);
  };
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export class FocusTrap {
  private container: HTMLElement;
  private previouslyFocused: HTMLElement | null = null;
  private handler = (e: KeyboardEvent) => this.onKeydown(e);

  constructor(container: HTMLElement) {
    this.container = container;
  }

  activate() {
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', this.handler, true);
    this.focusFirst();
  }

  deactivate() {
    document.removeEventListener('keydown', this.handler, true);
    this.previouslyFocused?.focus?.();
    this.previouslyFocused = null;
  }

  private focusFirst() {
    const items = this.getFocusable();
    items[0]?.focus();
  }

  private getFocusable(): HTMLElement[] {
    return Array.from(this.container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null
    );
  }

  private onKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    const items = this.getFocusable();
    if (items.length === 0) return;

    const first = items[0]!;
    const last = items[items.length - 1]!;
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

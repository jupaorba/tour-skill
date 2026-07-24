export class EventBus<TEvents extends Record<string, unknown[]>> {
  private listeners = new Map<keyof TEvents, Set<(...args: unknown[]) => void>>();

  on<K extends keyof TEvents>(event: K, cb: (...args: TEvents[K]) => void): () => void {
    const set = this.listeners.get(event) ?? new Set();
    set.add(cb as (...args: unknown[]) => void);
    this.listeners.set(event, set);
    return () => set.delete(cb as (...args: unknown[]) => void);
  }

  emit<K extends keyof TEvents>(event: K, ...args: TEvents[K]): void {
    this.listeners.get(event)?.forEach((cb) => cb(...args));
  }

  clear(): void {
    this.listeners.clear();
  }
}

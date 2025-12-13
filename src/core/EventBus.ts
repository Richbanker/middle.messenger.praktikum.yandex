type Handler<TArgs extends unknown[] = unknown[]> = (...args: TArgs) => void;

export class EventBus<TEvents extends Record<string, Handler> = Record<string, Handler>> {
  private listeners: { [K in keyof TEvents]?: TEvents[K][] } = {};

  on<K extends keyof TEvents>(event: K, callback: TEvents[K]): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(callback);
  }

  off<K extends keyof TEvents>(event: K, callback: TEvents[K]): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event]!.filter((listener) => listener !== callback);
  }

  emit<K extends keyof TEvents>(event: K, ...args: Parameters<TEvents[K]>): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event]!.forEach((listener) => listener(...args));
  }
}

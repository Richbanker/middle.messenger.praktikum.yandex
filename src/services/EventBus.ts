type Callback = (...args: unknown[]) => void;

class EventBus {
  readonly listeners: Record<string, Callback[]>;

  constructor() {
    this.listeners = {};
  }

  on(event: string, callback: Callback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Callback): void {
    this._checkEvent(event);
    this.listeners[event] = this.listeners[event].filter(
      (listener) => listener !== callback,
    );
  }

  emit(event: string, ...args: unknown[]): void {
    this._checkEvent(event);
    this.listeners[event].forEach((listener) => {
      listener(...args);
    });
  }

  private _checkEvent(event: string): void {
    if (!this.listeners[event]) {
      throw new Error(`Нет события: ${event}`);
    }
  }
}

export default EventBus;

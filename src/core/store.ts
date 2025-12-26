import { EventBus } from './EventBus.js';
import { RootState, ChatsState } from '../types/index.js';

export const STORE_EVENTS = {
  UPDATED: 'store:updated',
} as const;

class Store extends EventBus {
  private state: RootState;

  constructor() {
    super();
    const saved = localStorage.getItem('APP_STATE');
    if (saved) {
      try {
        this.state = JSON.parse(saved) as RootState;
      } catch {
        this.state = this.getInitialState();
      }
    } else {
      this.state = this.getInitialState();
    }
  }

  private getInitialState(): RootState {
    return {
      user: null,
      chats: {
        chats: [],
        selectedChatIds: [],
        selectAll: false,
      },
    };
  }

  getState(): RootState {
    return structuredClone(this.state);
  }

  setState(next: Partial<RootState>): void {
    this.state = { ...this.state, ...next };
    this.saveToLocalStorage();
    this.emit(STORE_EVENTS.UPDATED, this.getState());
  }

  patchChats(next: Partial<ChatsState>): void {
    this.state.chats = { ...this.state.chats, ...next };
    this.saveToLocalStorage();
    this.emit(STORE_EVENTS.UPDATED, this.getState());
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('APP_STATE', JSON.stringify(this.state));
    } catch {
      return;
    }
  }
}

export const store = new Store();


export interface WSMessage {
  id?: string;
  content: string;
  type: 'message' | 'file' | 'sticker' | 'ping' | 'pong' | 'get old' | 'user connected';
  time?: string;
  user_id?: string;
  chat_id?: string;
  file?: {
    id: number;
    user_id: number;
    path: string;
    filename: string;
    content_type: string;
    content_size: number;
    upload_date: string;
  };
}

export interface WSConfig {
  chatId: string;
  onMessage?: (message: WSMessage) => void;
  onMessages?: (messages: WSMessage[]) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private chatId: string | null = null;
  private pingInterval: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  private onMessage?: (message: WSMessage) => void;
  private onMessages?: (messages: WSMessage[]) => void;
  private onConnect?: () => void;
  private onDisconnect?: () => void;
  private onError?: (error: Event) => void;

  constructor() {
    this.handleOpen = this.handleOpen.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  public connect(config: WSConfig): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.isConnecting) {

        return;
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        if (this.chatId !== config.chatId) {
          this.disconnect();
          await new Promise(resolve => setTimeout(resolve, 200));
        } else {
          resolve();
          return;
        }
      }

      this.isConnecting = true;
      this.chatId = config.chatId;
      this.onMessage = config.onMessage;
      this.onMessages = config.onMessages;
      this.onConnect = config.onConnect;
      this.onDisconnect = config.onDisconnect;
      this.onError = config.onError;

      try {

        const { chatAPI } = await import('./api.js');
        const tokenResponse = await chatAPI.getWebSocketToken(config.chatId);

        const userData = await chatAPI.getCurrentUser();
        const userId = userData.id;

        const wsUrlWithUserAndToken = `wss://ya-praktikum.tech/ws/chats/${userId}/${config.chatId}/${tokenResponse.token}`;

        document.cookie = `authCookie=${tokenResponse.token}; path=/; domain=.ya-praktikum.tech`;

        this.ws = new WebSocket(wsUrlWithUserAndToken);
        this.addEventListeners();

        const originalOnConnect = this.onConnect;
        this.onConnect = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          if (originalOnConnect) originalOnConnect();
          resolve();
        };

        const originalOnError = this.onError;
        this.onError = (error) => {
          this.isConnecting = false;
          if (originalOnError) originalOnError(error);
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;

        reject(error);
      }
    });
  }

  public disconnect(): void {

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.ws) {
      this.removeEventListeners();
      this.ws.close(1000, "Normal closure");
      this.ws = null;
    }

    this.chatId = null;
    this.isConnecting = false;
  }

  public getCurrentChatId(): string | null {
    return this.chatId;
  }

  public sendMessage(content: string): void {
    if (!this.isConnected()) {

      return;
    }

    const message: WSMessage = {
      content,
      type: 'message'
    };

    this.ws!.send(JSON.stringify(message));
  }

  public getOldMessages(offset: number = 0): void {
    if (!this.isConnected()) {

      return;
    }

    const message: WSMessage = {
      content: offset.toString(),
      type: 'get old'
    };

    this.ws!.send(JSON.stringify(message));
  }

  private sendPing(): void {
    if (!this.isConnected()) {
      return;
    }

    const pingMessage = {
      type: 'ping'
    };

    this.ws!.send(JSON.stringify(pingMessage));
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  private addEventListeners(): void {
    if (!this.ws) return;

    this.ws.addEventListener('open', this.handleOpen);
    this.ws.addEventListener('message', this.handleMessage);
    this.ws.addEventListener('error', this.handleError);
    this.ws.addEventListener('close', this.handleClose);
  }

  private removeEventListeners(): void {
    if (!this.ws) return;

    this.ws.removeEventListener('open', this.handleOpen);
    this.ws.removeEventListener('message', this.handleMessage);
    this.ws.removeEventListener('error', this.handleError);
    this.ws.removeEventListener('close', this.handleClose);
  }

  private handleOpen(): void {

    this.pingInterval = window.setInterval(() => {
      this.sendPing();
    }, 30000);

    this.getOldMessages(0);

    if (this.onConnect) {
      this.onConnect();
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'pong') {

        return;
      }

      if (data.type === 'user connected') {

        return;
      }

      if (Array.isArray(data)) {

        if (this.onMessages) {
          this.onMessages(data);
        }
        return;
      }

      if (data.type === 'message' || data.type === 'file' || data.type === 'sticker') {

        if (this.onMessage) {
          this.onMessage(data);
        }
        return;
      }

    } catch {
      void 0;
    }
  }

  private handleError(event: Event): void {

    if (this.onError) {
      this.onError(event);
    }
  }

  private handleClose(event: CloseEvent): void {

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.removeEventListeners();

    if (this.onDisconnect) {
      this.onDisconnect();
    }

    if (event.code === 1006 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;

      setTimeout(() => {
        if (this.chatId) {
          this.connect({
            chatId: this.chatId,
            onMessage: this.onMessage,
            onMessages: this.onMessages,
            onConnect: this.onConnect,
            onDisconnect: this.onDisconnect,
            onError: this.onError,
          });
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }
}

export const webSocketService = new WebSocketService();

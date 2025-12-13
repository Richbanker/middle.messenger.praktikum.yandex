import type { Chat, ChatUser, Message } from '@/types';
import { chatApi, userApi } from '@/utils/api';
import { bubbleSort, Queue, Stack } from '@/utils/structures';

type Listener = (state: ChatState) => void;
type SocketStatus = 'idle' | 'connecting' | 'connected';

type ChatState = {
  chats: Chat[];
  selectedChatId: number | null;
  chatUsers: Record<number, ChatUser[]>;
  messages: Record<number, Message[]>;
  socketStatus: SocketStatus;
  error: string | null;
};

const state: ChatState = {
  chats: [],
  selectedChatId: null,
  chatUsers: {},
  messages: {},
  socketStatus: 'idle',
  error: null,
};

let socket: WebSocket | null = null;
let pingTimer: number | null = null;
const listeners: Listener[] = [];
const pendingMessages = new Queue<Message>();
const selectionStack = new Stack<number>();

const notify = () => listeners.forEach((cb) => cb(structuredClone(state)));

const mergeMessages = (current: Message[], incoming: Message[]) => {
  const merged = new Map<number, Message>();
  current.forEach((message) => merged.set(message.id, message));
  incoming.forEach((message) => merged.set(message.id, message));
  const list = Array.from(merged.values());
  return bubbleSort(list, (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
};

const normalize = (payload: Message): Message => ({
  id: payload.id,
  chat_id: payload.chat_id,
  user_id: payload.user_id,
  time: payload.time,
  content: payload.content,
  type: payload.type,
});

const setState = (patch: Partial<ChatState>) => {
  Object.assign(state, patch);
  notify();
};

export const chatStore = {
  subscribe(cb: Listener) {
    listeners.push(cb);
    cb(structuredClone(state));
    return () => {
      const idx = listeners.indexOf(cb);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },

  async loadChats() {
    setState({ error: null });
    try {
      const chats = await chatApi.getChats();
      setState({ chats });
    } catch (error) {
      setState({ error: error instanceof Error ? error.message : 'Не удалось загрузить чаты' });
    }
  },

  async createChat(title: string) {
    await chatApi.createChat(title);
    await this.loadChats();
  },

  async deleteChat(chatId: number) {
    await chatApi.deleteChat(chatId);
    if (state.selectedChatId === chatId) {
      this.disconnect();
      const prev = selectionStack.pop();
      setState({ selectedChatId: prev ?? null });
    }
    await this.loadChats();
  },

  async selectChat(chatId: number, userId: number) {
    if (state.selectedChatId === chatId && state.socketStatus === 'connected') return;
    if (state.selectedChatId) {
      selectionStack.push(state.selectedChatId);
    }
    this.disconnect();
    setState({ selectedChatId: chatId, socketStatus: 'connecting' });

    try {
      const token = await chatApi.getToken(chatId);
      socket = new WebSocket(`wss://ya-praktikum.tech/ws/chats/${userId}/${chatId}/${token.token}`);

      socket.addEventListener('open', () => {
        setState({ socketStatus: 'connected' });
        socket?.send(JSON.stringify({ type: 'get old', content: '0' }));
        pingTimer = window.setInterval(() => socket?.send(JSON.stringify({ type: 'ping' })), 15000);
        while (!pendingMessages.isEmpty()) {
          const msg = pendingMessages.dequeue();
          if (msg) {
            socket?.send(JSON.stringify({ content: msg.content, type: 'message' }));
          }
        }
      });

      socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data) as Message | Message[];
        if (Array.isArray(data)) {
          const merged = mergeMessages(state.messages[chatId] || [], data.map(normalize));
          setState({ messages: { ...state.messages, [chatId]: merged } });
          return;
        }
        if (!data?.type) return;
        const merged = mergeMessages(state.messages[chatId] || [], [normalize(data)]);
        setState({ messages: { ...state.messages, [chatId]: merged } });
      });

      socket.addEventListener('close', () => {
        setState({ socketStatus: 'idle' });
        if (pingTimer) {
          window.clearInterval(pingTimer);
          pingTimer = null;
        }
        socket = null;
      });

      await this.fetchChatUsers(chatId);
    } catch (error) {
      setState({ error: error instanceof Error ? error.message : 'Не удалось открыть чат' });
      setState({ socketStatus: 'idle' });
    }
  },

  sendMessage(content: string, userId: number) {
    const chatId = state.selectedChatId;
    if (!chatId) return;
    const newMessage: Message = {
      id: Date.now(),
      chat_id: chatId,
      content,
      time: new Date().toISOString(),
      type: 'message',
      user_id: userId,
    };

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      pendingMessages.enqueue(newMessage);
    } else {
      socket.send(JSON.stringify({ content, type: 'message' }));
    }

    const next: Message[] = [...(state.messages[chatId] || []), newMessage];
    setState({ messages: { ...state.messages, [chatId]: next } });
  },

  async addUserByLogin(login: string, chatId: number) {
    const users = await userApi.search(login);
    const target = users.find((u) => u.login === login);
    if (!target) throw new Error('Пользователь не найден');
    await chatApi.addUsers(chatId, [target.id]);
    await this.fetchChatUsers(chatId);
  },

  async removeUserByLogin(login: string, chatId: number) {
    const users = await userApi.search(login);
    const target = users.find((u) => u.login === login);
    if (!target) throw new Error('Пользователь не найден');
    await chatApi.removeUsers(chatId, [target.id]);
    await this.fetchChatUsers(chatId);
  },

  async fetchChatUsers(chatId: number) {
    const members = await chatApi.getChatUsers(chatId);
    setState({ chatUsers: { ...state.chatUsers, [chatId]: members } });
  },

  disconnect() {
    if (pingTimer) {
      window.clearInterval(pingTimer);
      pingTimer = null;
    }
    if (socket) {
      socket.close();
      socket = null;
    }
    setState({ socketStatus: 'idle' });
  },

  getState(): ChatState {
    return structuredClone(state);
  },
};

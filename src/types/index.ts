export interface ValidationRule {
  pattern: RegExp;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormData {
  [key: string]: string;
}

export interface HTTPOptions {
  method?: string;
  headers?: Record<string, string>;
  data?: unknown;
  timeout?: number;
}

export type ID = string;

export interface User {
  id: ID;
  login: string;
  first_name: string;
  second_name: string;
  avatar?: string;
}

export interface Chat {
  id: ID;
  title: string;
  avatar?: string;
  unreadCount: number;
  lastMessage?: Message;
  messages: Message[];
  last_message?: {
    content: string;
    time: string;
  };
  unread_count?: number;
}

export interface Message {
  id: ID;
  chatId: ID;
  authorId: ID;
  text: string;
  createdAt: string;
  isOwn: boolean;
  content?: string;
  time?: string;
  user_id?: string;
  type?: 'message' | 'file';
}

export interface ChatsState {
  chats: Chat[];
  selectedChatIds: ID[];
  selectAll: boolean;
}

export interface RootState {
  user: User | null;
  chats: ChatsState;
}


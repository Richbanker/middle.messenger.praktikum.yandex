export type User = {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string | null;
  login: string;
  email: string;
  phone: string;
  avatar: string | null;
};

export type SignInPayload = {
  login: string;
  password: string;
};

export type SignUpPayload = {
  first_name: string;
  second_name: string;
  display_name?: string;
  login: string;
  email: string;
  password: string;
  phone: string;
};

export type ProfilePayload = Omit<SignUpPayload, 'password'>;

export type PasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

export type Chat = {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  created_by?: number;
  last_message?: {
    user: User;
    time: string;
    content: string;
  };
};

export type ChatUser = User & {
  role: 'admin' | 'creator' | 'regular';
};

export type ChatToken = {
  token: string;
};

export type Message = {
  id: number;
  chat_id: number;
  time: string;
  user_id?: number;
  content?: string;
  type: 'message' | 'file' | 'sticker' | 'system';
};

export type ApiError = {
  reason: string;
};

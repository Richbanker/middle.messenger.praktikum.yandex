import {
  type Chat,
  type ChatToken,
  type ChatUser,
  type PasswordPayload,
  type ProfilePayload,
  type SignInPayload,
  type SignUpPayload,
  type User,
} from '@/types';

import { RESOURCES_BASE_URL, request } from './httpClient';

export const authApi = {
  signIn: (payload: SignInPayload) =>
    request<void>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  signUp: (payload: SignUpPayload) =>
    request<void>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  logout: () =>
    request<void>('/auth/logout', {
      method: 'POST',
    }),
  getUser: () => request<User>('/auth/user'),
};

export const userApi = {
  updateProfile: (payload: ProfilePayload) =>
    request<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  changePassword: (payload: PasswordPayload) =>
    request<void>('/user/password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  updateAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    return request<User>('/user/profile/avatar', {
      method: 'PUT',
      body: formData,
    });
  },
  search: (login: string) =>
    request<User[]>('/user/search', {
      method: 'POST',
      body: JSON.stringify({ login }),
    }),
};

export const chatApi = {
  getChats: () => request<Chat[]>('/chats?limit=50'),
  createChat: (title: string) =>
    request<void>('/chats', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),
  deleteChat: (chatId: number) =>
    request<void>('/chats', {
      method: 'DELETE',
      body: JSON.stringify({ chatId }),
    }),
  getChatUsers: (chatId: number) => request<ChatUser[]>(`/chats/${chatId}/users`),
  addUsers: (chatId: number, userIds: number[]) =>
    request<void>('/chats/users', {
      method: 'PUT',
      body: JSON.stringify({ users: userIds, chatId }),
    }),
  removeUsers: (chatId: number, userIds: number[]) =>
    request<void>('/chats/users', {
      method: 'DELETE',
      body: JSON.stringify({ users: userIds, chatId }),
    }),
  getToken: (chatId: number) =>
    request<ChatToken>(`/chats/token/${chatId}`, {
      method: 'POST',
    }),
};

export const buildAvatarUrl = (path?: string | null) =>
  path ? `${RESOURCES_BASE_URL}${path}` : '';

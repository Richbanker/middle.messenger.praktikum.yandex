import { httpClient, HttpError } from './HttpClient';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    login: string;
    first_name: string;
    second_name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
}

export interface RegistrationRequest {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  time: string;
  type: 'sent' | 'received';
}

export interface Chat {
  id: string;
  title: string;
  avatar?: string;
  last_message?: ChatMessage;
  unread_count: number;
}

export interface UserSearchResult {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string;
}

export class ChatAPI {
  private baseUrl = "/api/v2";

  async login(data: LoginRequest): Promise<LoginResponse> {
      const response = await httpClient.post<LoginResponse>(
        `${this.baseUrl}/auth/signin`,
      data,
      { credentials: "include" }
      );

      if (response.status === 200) {
      return response.data;
    }

    if (
      response.status === 400 &&
      response.data &&
      typeof response.data === "object" &&
      "reason" in response.data &&
      (response.data as any).reason === "User already in system"
          ) {
      return response.data as unknown as LoginResponse;
    }

    throw {
      message: `Login failed`,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
        };
  }

  async register(data: RegistrationRequest): Promise<LoginResponse> {
      const response = await httpClient.post<LoginResponse>(
        `${this.baseUrl}/auth/signup`,
      data,
      { credentials: "include" }
      );

    if (response.status === 200) {
      return response.data;
    }

    if (response.status === 409) {
      const err: HttpError = {
        message: "User already in system",
        status: 409,
      };
      throw err;
    }

    throw {
      message: `Signup failed`,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
        };
  }

  async getChats(): Promise<Chat[]> {
    const response = await httpClient.get<Chat[]>(`${this.baseUrl}/chats`, {
      credentials: "include",
    });
    if (response.status === 200) return response.data;
    throw {
      message: "Failed to fetch chats",
      status: response.status,
      statusText: response.statusText,
    };
  }

  async getChatMessages(
    chatId: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<ChatMessage[]> {
    if (!chatId || chatId.trim() === "") {
      return [];
    }

    try {
      const url = httpClient.buildUrl(
        `${this.baseUrl}/chats/${chatId}/messages`,
        {
          offset,
          limit,
        }
      );

      const response = await httpClient.get<ChatMessage[]>(url, {
        credentials: "include",
      });

      if (response.status === 200) return response.data;
      
      if (response.status === 404) {
        return [];
      }
      
      throw {
        message: "Failed to fetch messages",
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: any) {
      if (error?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  async sendMessage(chatId: string, content: string): Promise<void> {
    const response = await httpClient.post(
        `${this.baseUrl}/chats/${chatId}/messages`,
        { content },
        {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        }
      );
    if (response.status >= 200 && response.status < 300) return;
    throw {
      message: "Failed to send message",
      status: response.status,
      statusText: response.statusText,
    };
  }

  async createChat(title: string): Promise<{ id: string }> {
      const response = await httpClient.post<{ id: string }>(
        `${this.baseUrl}/chats`,
        { title },
        {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        }
      );

    if (response.status === 200) return response.data;
    throw {
      message: "Failed to create chat",
      status: response.status,
      statusText: response.statusText,
    };
  }

  async deleteChat(chatId: string): Promise<void> {
    try {
      const response = await httpClient.delete(`${this.baseUrl}/chats/${chatId}`, undefined, {
        credentials: "include",
      });
      
      if (response.status >= 200 && response.status < 300) {
        return;
      }
      
      if (response.status === 404) {
        return;
      }
      
      throw {
        message: "Не удалось удалить чат",
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: any) {
      if (error?.status === 404) {
        return;
      }
      throw error;
    }
  }

  async getCurrentUser(): Promise<LoginResponse["user"]> {
      const response = await httpClient.get<LoginResponse["user"]>(
        `${this.baseUrl}/auth/user`,
      { credentials: "include" }
      );

    if (response.status === 200) {
      return response.data;
    }

    throw {
      message: `Failed to fetch current user`,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    };
  }

  async updateProfile(data: Partial<RegistrationRequest>): Promise<void> {
    const response = await httpClient.put(`${this.baseUrl}/user/profile`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      credentials: "include",
    });
    if (response.status >= 200 && response.status < 300) return;
    throw {
      message: "Failed to update profile",
      status: response.status,
      statusText: response.statusText,
    };
  }

  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const response = await httpClient.put(
        `${this.baseUrl}/user/password`,
        { oldPassword, newPassword },
        {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        }
      );
    if (response.status >= 200 && response.status < 300) return;
    throw {
      message: "Failed to change password",
      status: response.status,
      statusText: response.statusText,
    };
  }

  async uploadAvatar(file: File): Promise<LoginResponse["user"]> {
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > MAX_FILE_SIZE) {
      throw {
        message: "Размер файла не должен превышать 5 МБ",
        status: 413,
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw {
        message: "Поддерживаются только изображения (JPEG, PNG, GIF, WebP)",
        status: 400,
      };
    }

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await httpClient.put<LoginResponse["user"]>(
        `${this.baseUrl}/user/profile/avatar`,
        formData,
        {
          credentials: "include",
          mode: "cors",
        }
      );

      if (response.status === 200) return response.data;
      
      if (response.status === 413) {
        throw {
          message: "Размер файла слишком большой. Максимум 5 МБ",
          status: 413,
        };
      }
      
      throw {
        message: "Failed to upload avatar",
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: any) {
      if (error?.status === 413) {
        throw {
          message: "Размер файла слишком большой. Максимум 5 МБ",
          status: 413,
        };
      }
      throw error;
    }
  }

  async getWebSocketToken(chatId: string): Promise<{ token: string }> {
      const response = await httpClient.post<{ token: string }>(
      `${this.baseUrl}/chats/token/${chatId}`,
      undefined,
      { credentials: "include" }
      );

    if (response.status === 200) return response.data;
    throw {
      message: "Failed to get WS token",
      status: response.status,
      statusText: response.statusText,
    };
  }

  async searchUsers(login: string): Promise<UserSearchResult[]> {
      const response = await httpClient.post<UserSearchResult[]>(
        `${this.baseUrl}/user/search`,
      { login },
      { credentials: "include" }
      );

    if (response.status === 200) return response.data;
    throw {
      message: "Failed to search users",
      status: response.status,
      statusText: response.statusText,
    };
  }

  async addUsersToChat(chatId: string, userIds: number[]): Promise<void> {
    if (!chatId || !userIds || userIds.length === 0) {
      throw {
        message: "Invalid chat ID or user IDs",
        status: 400,
      };
    }

    try {
      const response = await httpClient.put(
        `${this.baseUrl}/chats/users`,
        {
          users: userIds,
          chatId: parseInt(chatId),
        },
        {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      
      if (response.status >= 200 && response.status < 300) return;
      
      throw {
        message: "Failed to add users to chat",
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: any) {
      if (error?.status === 400) {
        throw {
          message: "Некорректные данные для добавления пользователей",
          status: 400,
        };
      }
      throw error;
    }
  }

  async removeUsersFromChat(chatId: string, userIds: number[]): Promise<void> {
    const response = await httpClient.delete(`${this.baseUrl}/chats/users`, {
        users: userIds,
        chatId: parseInt(chatId),
    }, { credentials: "include" });
    if (response.status >= 200 && response.status < 300) return;
    throw {
      message: "Failed to remove users from chat",
      status: response.status,
      statusText: response.statusText,
    };
  }

  async getChatUsers(chatId: string): Promise<UserSearchResult[]> {
    try {
      const response = await httpClient.get<UserSearchResult[]>(
        `${this.baseUrl}/chats/${chatId}/users`,
        { credentials: "include" }
      );
      
      if (response.status === 200) return response.data;
      
      if (response.status === 404 || response.status === 400) {
        return [];
      }
      
      throw {
        message: "Failed to fetch chat users",
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: any) {
      if (error?.status === 404 || error?.status === 400) {
        return [];
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    const response = await httpClient.post(`${this.baseUrl}/auth/logout`, undefined, {
      credentials: "include",
    });
    if (response.status >= 200 && response.status < 300) return;
    throw {
      message: "Failed to logout",
      status: response.status,
      statusText: response.statusText,
    };
  }
}

export const chatAPI = new ChatAPI();

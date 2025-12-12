import type { PasswordPayload, ProfilePayload, SignInPayload, SignUpPayload, User } from '@/types';
import { authApi, userApi } from '@/utils/api';
import { HttpError } from '@/utils/httpClient';

type Listener = (state: AuthState) => void;

type AuthState = {
  user: User | null;
  error: string | null;
};

const state: AuthState = {
  user: null,
  error: null,
};

const listeners: Listener[] = [];

const notify = () => listeners.forEach((cb) => cb({ ...state }));

let bootstrapped = false;
let bootstrapInFlight: Promise<void> | null = null;
const AUTH_HINT_KEY = 'auth_hint';

const hasAuthHint = () => {
  try {
    return localStorage.getItem(AUTH_HINT_KEY) === '1';
  } catch {
    return true;
  }
};

const setAuthHint = () => {
  try {
    localStorage.setItem(AUTH_HINT_KEY, '1');
  } catch {
    // ignore
  }
};

const clearAuthHint = () => {
  try {
    localStorage.removeItem(AUTH_HINT_KEY);
  } catch {
    // ignore
  }
};

export const auth = {
  subscribe(cb: Listener) {
    listeners.push(cb);
    cb({ ...state });
    return () => {
      const idx = listeners.indexOf(cb);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },

  hasHint() {
    return hasAuthHint();
  },

  async bootstrap(force = false) {
    if (!force && bootstrapped) {
      notify();
      return;
    }

    if (!force && state.user === null && !hasAuthHint()) {
      bootstrapped = true;
      notify();
      return;
    }

    if (!force && bootstrapInFlight) {
      await bootstrapInFlight;
      return;
    }

    bootstrapInFlight = (async () => {
      try {
        const user = await authApi.getUser();
        state.user = user;
        state.error = null;
      } catch (error) {
        state.user = null;
        if (error instanceof HttpError && error.status === 401) {
          clearAuthHint();
        }
      } finally {
        notify();
      }
    })();

    try {
      await bootstrapInFlight;
      bootstrapped = true;
    } finally {
      bootstrapInFlight = null;
    }
  },

  async signIn(payload: SignInPayload) {
    try {
      await authApi.signIn(payload);
      setAuthHint();
      await this.bootstrap(true);
      if (!state.user) {
        throw new Error('Не удалось получить профиль пользователя');
      }
    } catch (error) {
      const message =
        error instanceof HttpError && error.status === 401
          ? 'Неверный логин или пароль'
          : error instanceof Error
            ? error.message
            : 'Ошибка входа';
      state.error = message;
      notify();
      throw new Error(message);
    }
  },

  async signUp(payload: SignUpPayload) {
    try {
      await authApi.signUp(payload);
      setAuthHint();
      await this.bootstrap(true);
      if (!state.user) {
        throw new Error('Не удалось получить профиль пользователя');
      }
    } catch (error) {
      const message =
        error instanceof HttpError && error.status === 409
          ? 'Пользователь уже существует'
          : error instanceof HttpError && error.status === 400
            ? 'Некорректные данные регистрации'
            : error instanceof Error
              ? error.message
              : 'Ошибка регистрации';
      state.error = message;
      notify();
      throw new Error(message);
    }
  },

  async logout() {
    try {
      await authApi.logout();
    } finally {
      state.user = null;
      bootstrapped = true;
      clearAuthHint();
      notify();
    }
  },

  async updateProfile(payload: ProfilePayload) {
    const updated = await userApi.updateProfile(payload);
    state.user = updated;
    notify();
  },

  async updateAvatar(file: File) {
    const updated = await userApi.updateAvatar(file);
    state.user = updated;
    notify();
  },

  async changePassword(payload: PasswordPayload) {
    await userApi.changePassword(payload);
  },

  getState(): AuthState {
    return { ...state };
  },
};

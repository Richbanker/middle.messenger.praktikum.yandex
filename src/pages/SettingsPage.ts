import { renderButton } from '@/components/button';
import { renderField } from '@/components/field';
import { Block } from '@/core/Block';
import { router } from '@/router';
import { auth } from '@/state/auth';
import type { PasswordPayload, ProfilePayload, User } from '@/types';
import { escapeHtml } from '@/utils/escapeHtml';

const template = (context: unknown) => {
  const ctx = context as {
    userName: string;
    email: string;
    avatarMessage: string;
    profileMessage: string;
    passwordMessage: string;
    error: string;
  };
  return `
  <div class="layout">
    <div class="card">
      <h2 class="title" style="font-size:18px;">Аватар</h2>
      <p class="text-muted">${escapeHtml(ctx.userName)}</p>
      <p class="text-muted">${escapeHtml(ctx.email)}</p>
      <form data-id="avatar-form" class="form">
        <div class="field">
          <span>Загрузить новый</span>
          <input type="file" name="avatar" accept="image/*" />
        </div>
        <button class="btn btn-ghost" type="submit">Обновить</button>
      </form>
      ${ctx.avatarMessage ? `<p class="success">${escapeHtml(ctx.avatarMessage)}</p>` : ''}
    </div>

    <div class="card">
      <h2 class="title" style="font-size:18px;">Профиль</h2>
      <form data-id="profile-form" class="form">
        ${renderField({ label: 'Имя', name: 'first_name', required: true, autocomplete: 'given-name' })}
        ${renderField({
          label: 'Фамилия',
          name: 'second_name',
          required: true,
          autocomplete: 'family-name',
        })}
        ${renderField({ label: 'Отображаемое имя', name: 'display_name', autocomplete: 'nickname' })}
        ${renderField({ label: 'Телефон', name: 'phone', required: true, autocomplete: 'tel' })}
        ${renderField({ label: 'Email', name: 'email', type: 'email', required: true, autocomplete: 'email' })}
        ${renderField({ label: 'Логин', name: 'login', required: true, autocomplete: 'username' })}
        ${renderButton('Сохранить')}
      </form>
      ${ctx.profileMessage ? `<p class="success">${escapeHtml(ctx.profileMessage)}</p>` : ''}
    </div>
  </div>

  <div class="card" style="margin-top:16px;">
    <h2 class="title" style="font-size:18px;">Смена пароля</h2>
    <form data-id="password-form" class="form">
      ${renderField({
        label: 'Текущий пароль',
        name: 'oldPassword',
        type: 'password',
        required: true,
        autocomplete: 'current-password',
      })}
      ${renderField({
        label: 'Новый пароль',
        name: 'newPassword',
        type: 'password',
        required: true,
        autocomplete: 'new-password',
      })}
      ${renderField({
        label: 'Повторите новый пароль',
        name: 'repeat',
        type: 'password',
        required: true,
        autocomplete: 'new-password',
      })}
      ${renderButton('Обновить пароль', 'ghost')}
    </form>
    ${ctx.passwordMessage ? `<p class="success">${escapeHtml(ctx.passwordMessage)}</p>` : ''}
    ${ctx.error ? `<p class="error">${escapeHtml(ctx.error)}</p>` : ''}
  </div>
`;
};

type State = {
  userName: string;
  email: string;
  avatarMessage: string;
  profileMessage: string;
  passwordMessage: string;
  error: string;
};

export class SettingsPage extends Block<State> {
  private started = false;
  private currentUser: User | null = null;

  constructor() {
    super({
      userName: '',
      email: '',
      avatarMessage: '',
      profileMessage: '',
      passwordMessage: '',
      error: '',
    });
  }

  protected render(): DocumentFragment {
    return this.compile(template, this.props);
  }

  protected componentDidMount(): void {
    if (!this.started) {
      this.started = true;
      auth.subscribe((next) => {
        if (!next.user) {
          this.currentUser = null;
          router.go('/');
          return;
        }

        this.currentUser = next.user;
        this.setProps({
          userName: next.user.display_name || next.user.first_name,
          email: next.user.email,
        });
      });

      const initialUser = auth.getState().user;
      if (initialUser || auth.hasHint()) {
        void auth.bootstrap();
      } else {
        router.go('/');
      }
    }

    if (this.currentUser) {
      this.fillProfile(this.currentUser);
      this.bindForms();
    }
  }

  private fillProfile(user: User) {
    const form = this.element?.querySelector('[data-id="profile-form"]') as HTMLFormElement | null;
    if (!form) return;
    const setVal = (name: string, value: string) => {
      const el = form.elements.namedItem(name) as HTMLInputElement | null;
      if (el) el.value = value;
    };
    setVal('first_name', user.first_name || '');
    setVal('second_name', user.second_name || '');
    setVal('display_name', user.display_name ?? '');
    setVal('phone', user.phone || '');
    setVal('email', user.email || '');
    setVal('login', user.login || '');
  }

  private bindForms() {
    const profileForm = this.element?.querySelector(
      '[data-id="profile-form"]'
    ) as HTMLFormElement | null;
    if (profileForm) {
      this.addListener(profileForm, 'submit', async (e) => {
        e.preventDefault();
        const data = new FormData(profileForm);
        const payload: ProfilePayload = {
          first_name: String(data.get('first_name') ?? ''),
          second_name: String(data.get('second_name') ?? ''),
          display_name: String(data.get('display_name') ?? ''),
          login: String(data.get('login') ?? ''),
          email: String(data.get('email') ?? ''),
          phone: String(data.get('phone') ?? ''),
        };
        await auth.updateProfile(payload);
        this.setProps({ profileMessage: 'Данные обновлены', error: '' });
      });
    }

    const avatarForm = this.element?.querySelector(
      '[data-id="avatar-form"]'
    ) as HTMLFormElement | null;
    if (avatarForm) {
      this.addListener(avatarForm, 'submit', async (e) => {
        e.preventDefault();
        const file = (avatarForm.elements.namedItem('avatar') as HTMLInputElement).files?.[0];
        if (!file) return;
        try {
          await auth.updateAvatar(file);
          this.setProps({ avatarMessage: 'Аватар обновлён', error: '' });
        } catch (error) {
          this.setProps({ error: error instanceof Error ? error.message : 'Ошибка аватара' });
        }
      });
    }

    const passwordForm = this.element?.querySelector(
      '[data-id="password-form"]'
    ) as HTMLFormElement | null;
    if (passwordForm) {
      this.addListener(passwordForm, 'submit', async (e) => {
        e.preventDefault();
        const data = new FormData(passwordForm);
        const payload: PasswordPayload = {
          oldPassword: String(data.get('oldPassword') ?? ''),
          newPassword: String(data.get('newPassword') ?? ''),
        };
        const repeat = String(data.get('repeat') ?? '');
        if (payload.newPassword !== repeat) {
          this.setProps({ error: 'Пароли не совпадают', passwordMessage: '' });
          return;
        }
        try {
          await auth.changePassword(payload);
          this.setProps({ passwordMessage: 'Пароль обновлён', error: '' });
          passwordForm.reset();
        } catch (error) {
          this.setProps({ error: error instanceof Error ? error.message : 'Ошибка пароля' });
        }
      });
    }
  }
}

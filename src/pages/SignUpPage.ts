import { renderButton } from '@/components/button';
import { renderField } from '@/components/field';
import { Block } from '@/core/Block';
import { router } from '@/router';
import { auth } from '@/state/auth';
import type { SignUpPayload } from '@/types';
import { escapeHtml } from '@/utils/escapeHtml';

type State = {
  error: string;
  loading: boolean;
  first_name: string;
  second_name: string;
  display_name: string;
  phone: string;
  email: string;
  login: string;
  password: string;
  password_repeat: string;
};

const template = (context: unknown) => {
  const ctx = context as State;
  return `
  <div class="card card-wide">
    <h1 class="title">Регистрация</h1>
    <p class="text-muted">Создайте тестовый аккаунт, чтобы перейти к чатам.</p>
    <form class="form" data-id="signup-form">
      ${renderField({
        label: 'Имя',
        name: 'first_name',
        required: true,
        value: ctx.first_name,
        autocomplete: 'given-name',
      })}
      ${renderField({
        label: 'Фамилия',
        name: 'second_name',
        required: true,
        value: ctx.second_name,
        autocomplete: 'family-name',
      })}
      ${renderField({
        label: 'Отображаемое имя',
        name: 'display_name',
        value: ctx.display_name,
        autocomplete: 'nickname',
      })}
      ${renderField({
        label: 'Телефон',
        name: 'phone',
        required: true,
        value: ctx.phone,
        autocomplete: 'tel',
      })}
      ${renderField({
        label: 'Email',
        name: 'email',
        type: 'email',
        required: true,
        value: ctx.email,
        autocomplete: 'email',
      })}
      ${renderField({
        label: 'Логин',
        name: 'login',
        required: true,
        value: ctx.login,
        autocomplete: 'username',
      })}
      ${renderField({
        label: 'Пароль',
        name: 'password',
        type: 'password',
        required: true,
        autocomplete: 'new-password',
        value: ctx.password,
      })}
      ${renderField({
        label: 'Повторите пароль',
        name: 'password_repeat',
        type: 'password',
        required: true,
        autocomplete: 'new-password',
        value: ctx.password_repeat,
      })}
      ${ctx.error ? `<p class="error">${escapeHtml(ctx.error)}</p>` : ''}
      ${renderButton(ctx.loading ? 'Создаём...' : 'Создать аккаунт', 'primary', ctx.loading ? 'disabled' : '')}
      <a data-link href="/" class="link">Уже зарегистрированы? Войти</a>
    </form>
  </div>
`;
};

export class SignUpPage extends Block<State> {
  private started = false;

  constructor() {
    super({
      error: '',
      loading: false,
      first_name: '',
      second_name: '',
      display_name: '',
      phone: '',
      email: '',
      login: '',
      password: '',
      password_repeat: '',
    });
  }

  protected render(): DocumentFragment {
    return this.compile(template, this.props);
  }

  protected componentDidMount(): void {
    const form = this.element?.querySelector('[data-id="signup-form"]') as HTMLFormElement | null;
    if (!form) return;

    if (!this.started) {
      this.started = true;
      auth.subscribe((next) => {
        if (next.user) {
          router.go('/messenger');
          return;
        }
        if (next.error) {
          this.setProps({ error: next.error, loading: false });
        }
      });
    }

    this.addListener(form, 'submit', async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const nextState: State = {
        ...this.props,
        first_name: String(data.get('first_name') ?? ''),
        second_name: String(data.get('second_name') ?? ''),
        display_name: String(data.get('display_name') ?? ''),
        login: String(data.get('login') ?? ''),
        email: String(data.get('email') ?? ''),
        password: String(data.get('password') ?? ''),
        phone: String(data.get('phone') ?? ''),
        password_repeat: String(data.get('password_repeat') ?? ''),
      };

      this.setProps({ ...nextState, error: '', loading: true });
      const payload: SignUpPayload = {
        first_name: nextState.first_name,
        second_name: nextState.second_name,
        display_name: nextState.display_name,
        login: nextState.login,
        email: nextState.email,
        password: nextState.password,
        phone: nextState.phone,
      };
      const repeat = nextState.password_repeat;
      if (payload.password !== repeat) {
        this.setProps({ ...nextState, error: 'Пароли не совпадают', loading: false });
        return;
      }
      try {
        await auth.signUp(payload);
        router.go('/messenger');
      } catch (error) {
        this.setProps({
          ...nextState,
          error: error instanceof Error ? error.message : 'Ошибка регистрации',
          loading: false,
        });
      } finally {
        this.setProps({ loading: false });
      }
    });
  }
}

import { renderButton } from '@/components/button';
import { renderField } from '@/components/field';
import { Block } from '@/core/Block';
import { router } from '@/router';
import { auth } from '@/state/auth';
import { escapeHtml } from '@/utils/escapeHtml';

const template = (context: unknown) => {
  const ctx = context as { error: string };
  return `
  <div class="card">
    <h1 class="title">Вход</h1>
    <p class="text-muted">Введите логин и пароль, чтобы попасть в приложение.</p>
    <form class="form" data-id="login-form">
      ${renderField({ label: 'Логин', name: 'login', required: true, autocomplete: 'username' })}
      ${renderField({
        label: 'Пароль',
        name: 'password',
        type: 'password',
        required: true,
        autocomplete: 'current-password',
      })}
      ${ctx.error ? `<p class="error">${escapeHtml(ctx.error)}</p>` : ''}
      ${renderButton('Войти')}
      <a data-link href="/sign-up" class="link">Зарегистрироваться</a>
    </form>
  </div>
`;
};

type State = { error: string };

export class LoginPage extends Block<State> {
  private started = false;

  constructor() {
    super({ error: '' });
  }

  protected render(): DocumentFragment {
    return this.compile(template, this.props);
  }

  protected componentDidMount(): void {
    const form = this.element?.querySelector('[data-id="login-form"]') as HTMLFormElement | null;
    if (!form) return;

    if (!this.started) {
      this.started = true;
      auth.subscribe((next) => {
        if (next.user) {
          router.go('/messenger');
          return;
        }
        if (next.error) {
          this.setProps({ error: next.error });
        }
      });
    }

    this.addListener(form, 'submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const login = String(formData.get('login') ?? '');
      const password = String(formData.get('password') ?? '');
      try {
        await auth.signIn({ login, password });
        router.go('/messenger');
      } catch (error) {
        this.setProps({ error: error instanceof Error ? error.message : 'Ошибка входа' });
      }
    });
  }
}

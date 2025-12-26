import { View } from '../View';
import { template } from '../../utils/template';
import { attachFormValidation, validateField } from '../../utils/validation';
import { Block } from '../../core/Block';
import { store } from '../../core/store';
import { User } from '../../types/index';

export class Login extends View {
  constructor() {
    super({});
    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  protected componentDidMount(): void {
    const form = this.element?.querySelector('form');
    if (form) {
      attachFormValidation(form);
      form.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        const inputs = form.querySelectorAll<HTMLInputElement>('input[name]');
        let isValid = true;
        
        inputs.forEach((input) => {
          const error = validateField(input.name, input.value);
          if (error) {
            isValid = false;
          }
        });
        
        if (isValid) {
          const formData: Record<string, string> = {};
          inputs.forEach((input) => {
            formData[input.name] = input.value;
          });
          
          
          const loginInput = form.querySelector<HTMLInputElement>('input[name="login"]');
          const login = loginInput?.value.trim() || 'user';
          const firstName = localStorage.getItem('profile_first_name') || 'Иван';
          const secondName = localStorage.getItem('profile_second_name') || 'Иванов';
          const avatar = localStorage.getItem('profile_avatar') || '';
          
          const user: User = {
            id: 'me',
            login,
            first_name: firstName,
            second_name: secondName,
            avatar: avatar || undefined,
          };
          
          store.setState({ user });
          
          const renderRoute = (window as Window & { renderRoute?: (pathname: string) => void }).renderRoute;
          if (renderRoute) {
            window.history.pushState(null, '', '/chats');
            renderRoute('/chats');
          } else {
            window.history.pushState(null, '', '/chats');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
        }
      });
    }
  }

  protected render(): DocumentFragment {
    const htmlString = template(
      `
        <div class="page page_centered">
          <div class="page__container">
            <h1 class="page__title">Вход</h1>
            <form class="form">
              <div class="input-wrapper">
                <label class="input-label">Логин</label>
                <input 
                  type="text" 
                  name="login" 
                  placeholder="Логин" 
                  class="input"
                />
                <span class="input-error"></span>
              </div>

              <div class="input-wrapper">
                <label class="input-label">Пароль</label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Пароль" 
                  class="input"
                  autocomplete="current-password"
                />
                <span class="input-error"></span>
              </div>

              <button type="submit" class="button button_primary" disabled>Войти</button>
            </form>
            <div class="auth-switch">
              <span class="auth-switch__text">Нет аккаунта?</span>
              <a href="/register" data-link class="button button_primary auth-switch__button">Регистрация</a>
            </div>
          </div>
        </div>
      `,
      {}
    );

    const fragment = document.createElement('template');
    fragment.innerHTML = htmlString;
    return fragment.content;
  }
}

import { View } from '../View.js';
import { template } from '../../utils/template.js';
import { attachFormValidation, validateField } from '../../utils/validation.js';
import { Block } from '../../core/Block.js';

export class RegisterPage extends View {
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
        const formData: Record<string, string> = {};
        
        inputs.forEach((input) => {
          const error = validateField(input.name, input.value);
          if (error) {
            isValid = false;
          } else {
            formData[input.name] = input.value;
          }
        });
        
        if (isValid) {
          
          localStorage.setItem('profile_email', formData.email || '');
          localStorage.setItem('profile_login', formData.login || '');
          localStorage.setItem('profile_first_name', formData.first_name || '');
          localStorage.setItem('profile_second_name', formData.second_name || '');
          localStorage.setItem('profile_phone', formData.phone || '');
          
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
            <h1 class="page__title">Регистрация</h1>
            <form class="form">
              <div class="input-wrapper">
                <label class="input-label">Имя</label>
                <input 
                  type="text" 
                  name="first_name" 
                  placeholder="Имя" 
                  class="input"
                />
                <span class="input-error"></span>
              </div>

              <div class="input-wrapper">
                <label class="input-label">Фамилия</label>
                <input 
                  type="text" 
                  name="second_name" 
                  placeholder="Фамилия" 
                  class="input"
                />
                <span class="input-error"></span>
              </div>

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
                <label class="input-label">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email" 
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
                  autocomplete="new-password"
                />
                <span class="input-error"></span>
              </div>

              <div class="input-wrapper">
                <label class="input-label">Телефон</label>
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="Телефон" 
                  class="input"
                />
                <span class="input-error"></span>
              </div>

              <button type="submit" class="button button_primary" disabled>Зарегистрироваться</button>
            </form>
            <div class="auth-switch">
              <span class="auth-switch__text">Уже есть аккаунт?</span>
              <a href="/login" data-link class="button button_primary auth-switch__button">Вход</a>
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

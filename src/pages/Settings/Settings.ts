import { View } from '../View';
import { template } from '@/utils/template';
import { attachFormValidation } from '@/utils/validation';
import { Block } from '@/core/Block';

export class Settings extends View {
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
          const name = input.name;
          formData[name] = input.value;
          const errorEl = input.closest('.input-wrapper')?.querySelector('.input-error');
          if (errorEl?.textContent) {
            isValid = false;
          }
        });
        
        if (isValid) {
          alert('Пароль успешно изменен!');
          form.reset();
        }
      });
    }
  }

  protected render(): DocumentFragment {
    const htmlString = template(
      `
        <div class="page page_centered">
          <div class="page__container">
            <h1 class="page__title">Настройки</h1>
            <form class="form">
              <div class="input-wrapper">
                <label class="input-label">
                  Старый пароль
                  <input 
                    type="password" 
                    name="oldPassword" 
                    placeholder="Старый пароль" 
                    class="input"
                  />
                </label>
                <span class="input-error"></span>
              </div>

              <div class="input-wrapper">
                <label class="input-label">
                  Новый пароль
                  <input 
                    type="password" 
                    name="newPassword" 
                    placeholder="Новый пароль" 
                    class="input"
                  />
                </label>
                <span class="input-error"></span>
              </div>

              <button type="submit" class="button button_primary" disabled>Изменить пароль</button>
            </form>
            <a href="/profile" data-link class="link">Назад</a>
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

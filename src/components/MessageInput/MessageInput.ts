import { Block, Props } from '@/core/Block';
import { chatsController } from '@/controllers/ChatsController';
import { validateMessage } from '@/utils/validation';

interface MessageInputProps extends Props {
  onSubmit?: () => void;
}

export class MessageInput extends Block<MessageInputProps> {
  private submitHandler: ((e: Event) => void) | null = null;

  constructor(props: MessageInputProps = {}) {
    super(props);
  }

  protected componentDidMount(): void {
    this.attachHandlers();
  }

  protected componentDidUpdate(): boolean {
    return true;
  }

  private attachHandlers(): void {
    if (!this.element) {
      return;
    }

    const form = this.element.querySelector('form') as HTMLFormElement;
    if (form) {
      if (this.submitHandler) {
        form.removeEventListener('submit', this.submitHandler);
      }

      this.submitHandler = (e: Event) => {
        e.preventDefault();
        this.handleSubmit(form);
      };

      form.addEventListener('submit', this.submitHandler);
    }
  }

  private handleSubmit(form: HTMLFormElement): void {
    const formData = new FormData(form);
    const text = (formData.get('message') as string || '').trim();
    const errorEl = form.querySelector('.input-error');
    const input = form.querySelector('input[name="message"]') as HTMLInputElement;

    if (!validateMessage(text)) {
      if (errorEl) {
        errorEl.textContent = 'Сообщение не должно быть пустым';
      }
      if (input) {
        input.classList.add('input_error');
      }
      return;
    }


    try {
      chatsController.sendMessage(form);
      form.reset();
      if (errorEl) {
        errorEl.textContent = '';
      }
      if (input) {
        input.classList.remove('input_error');
      }
      this.props.onSubmit?.();
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err instanceof Error ? err.message : 'Ошибка отправки сообщения';
      }
      if (input) {
        input.classList.add('input_error');
      }
    }
  }

  protected render(): DocumentFragment {
    return this.compile(
      () => `
        <div class="message-input">
          <form class="message-input__form">
            <div class="input-wrapper" style="flex: 1;">
              <input 
                type="text" 
                name="message" 
                placeholder="Сообщение" 
                class="input"
                autocomplete="off"
              />
              <span class="input-error"></span>
            </div>
            <button type="submit" class="button button_primary">Отправить</button>
          </form>
        </div>
      `,
      {}
    );
  }
}

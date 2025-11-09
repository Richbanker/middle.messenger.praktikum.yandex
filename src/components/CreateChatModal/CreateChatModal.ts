import { Block, Props } from '@/core/Block';
import { chatsController } from '@/controllers/ChatsController';

interface CreateChatModalProps extends Props {
  isOpen?: boolean;
  onClose?: () => void;
}

export class CreateChatModal extends Block<CreateChatModalProps> {
  private avatarDataUrl: string | null = null;

  constructor(props: CreateChatModalProps = {}) {
    super({
      ...props,
      isOpen: props.isOpen || false,
    });
  }

  protected componentDidMount(): void {
    this.attachHandlers();
  }

  protected componentDidUpdate(): boolean {
    this.attachHandlers();
    return true;
  }

  private attachHandlers(): void {
    if (!this.element) {
      return;
    }

    const form = this.element.querySelector('.create-chat-form') as HTMLFormElement;
    const closeButton = this.element.querySelector('.create-chat-modal__close');
    const avatarInput = this.element.querySelector<HTMLInputElement>('input[type="file"]');

    if (closeButton) {
      this.addListener(closeButton, 'click', () => {
        this.props.onClose?.();
      });
    }

    const overlay = this.element.querySelector('.create-chat-modal__overlay');
    const content = this.element.querySelector('.create-chat-modal__content');
    if (overlay) {
      this.addListener(overlay, 'click', (e: Event) => {
        if (e.target === overlay) {
          this.props.onClose?.();
        }
      });
    }
    if (content) {
      this.addListener(content, 'click', (e: Event) => {
        e.stopPropagation();
      });
    }

    if (avatarInput) {
      this.addListener(avatarInput, 'change', (e: Event) => {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            this.avatarDataUrl = reader.result as string;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (form) {
      this.addListener(form, 'submit', (e: Event) => {
        e.preventDefault();
        this.handleSubmit(form);
      });
    }
  }

  private handleSubmit(form: HTMLFormElement): void {
    const formData = new FormData(form);
    const title = (formData.get('title') as string || '').trim();

    if (!title) {
      const errorEl = form.querySelector('.input-error');
      if (errorEl) {
        errorEl.textContent = 'Название чата обязательно';
      }
      return;
    }

    if (title.length < 3 || title.length > 50) {
      const errorEl = form.querySelector('.input-error');
      if (errorEl) {
        errorEl.textContent = 'Название чата должно быть от 3 до 50 символов';
      }
      return;
    }

    try {
      chatsController.createChat({ title, avatar: this.avatarDataUrl || undefined });
      form.reset();
      this.avatarDataUrl = null;
      this.props.onClose?.();
    } catch (err) {
      const errorEl = form.querySelector('.input-error');
      if (errorEl) {
        errorEl.textContent = err instanceof Error ? err.message : 'Ошибка создания чата';
      }
    }
  }

  protected render(): DocumentFragment {
    const isOpen = this.props.isOpen || false;

    return this.compile(
      () => `
        <div class="create-chat-modal ${isOpen ? 'create-chat-modal_open' : ''}">
          <div class="create-chat-modal__overlay"></div>
          <div class="create-chat-modal__content">
            <div class="create-chat-modal__header">
              <h3>Создать новый чат</h3>
              <button type="button" class="create-chat-modal__close">×</button>
            </div>
            <form class="create-chat-form">
              <div class="input-wrapper">
                <label class="input-label">Название чата</label>
                <input 
                  type="text" 
                  name="title" 
                  placeholder="Введите название чата" 
                  class="input"
                  required
                />
                <span class="input-error"></span>
              </div>
              <div class="input-wrapper">
                <label class="input-label">Аватар (опционально)</label>
                <input 
                  type="file" 
                  name="avatar" 
                  accept="image/*"
                  class="input"
                />
              </div>
              <button type="submit" class="button button_primary">Создать</button>
            </form>
          </div>
        </div>
      `,
      {}
    );
  }
}


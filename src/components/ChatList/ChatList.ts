import { Block, Props } from '@/core/Block';
import { chatsController } from '@/controllers/ChatsController';
import { Chat } from '@/types';

interface ChatListProps extends Props {
  chats: Chat[];
  selectedChatIds: string[];
  selectAll: boolean;
  isSelectionMode?: boolean;
}

export class ChatList extends Block<ChatListProps> {
  private selectAllHandler: ((e: Event) => void) | null = null;
  private chatClickHandlers: Map<string, (e: Event) => void> = new Map();
  private checkboxHandlers: Map<string, (e: Event) => void> = new Map();

  constructor(props: ChatListProps) {
    super(props);
  }

  protected componentDidMount(): void {
    this.attachHandlers();
  }

  protected componentDidUpdate(): boolean {
    this.removeHandlers();
    this.attachHandlers();
    return true;
  }

  private removeHandlers(): void {
    if (!this.element) {
      return;
    }

    const selectAllCheckbox = this.element.querySelector<HTMLInputElement>('#select-all-chats');
    if (selectAllCheckbox && this.selectAllHandler) {
      selectAllCheckbox.removeEventListener('change', this.selectAllHandler);
      this.selectAllHandler = null;
    }

    this.chatClickHandlers.forEach((handler, chatId) => {
      const item = this.element?.querySelector(`[data-chat-id="${chatId}"]`) as HTMLElement;
      if (item) {
        item.removeEventListener('click', handler);
      }
    });
    this.chatClickHandlers.clear();

    this.checkboxHandlers.forEach((handler, chatId) => {
      const item = this.element?.querySelector(`[data-chat-id="${chatId}"]`);
      const checkbox = item?.querySelector<HTMLInputElement>('input[type="checkbox"]');
      if (checkbox) {
        checkbox.removeEventListener('change', handler);
      }
    });
    this.checkboxHandlers.clear();
  }

  private attachHandlers(): void {
    if (!this.element) {
      return;
    }

    const { isSelectionMode = false } = this.props;

    const selectAllCheckbox = this.element.querySelector<HTMLInputElement>('#select-all-chats');
    if (selectAllCheckbox && isSelectionMode) {
      this.selectAllHandler = () => {
        chatsController.selectAll(selectAllCheckbox.checked);
      };
      selectAllCheckbox.addEventListener('change', this.selectAllHandler);
    }

    const chatItems = this.element.querySelectorAll('.chat-item');
    chatItems.forEach((item) => {
      const chatId = item.getAttribute('data-chat-id');
      if (!chatId) {
        return;
      }

      const checkbox = item.querySelector<HTMLInputElement>('input[type="checkbox"]');
      const chatElement = item as HTMLElement;

      if (checkbox && isSelectionMode) {
        const checkboxHandler = () => {
          chatsController.toggleSelect(chatId);
        };
        this.checkboxHandlers.set(chatId, checkboxHandler);
        checkbox.addEventListener('change', checkboxHandler);
      }

      if (chatElement) {
        const clickHandler = (e: Event) => {
          const target = e.target as HTMLElement;
          if (target.closest('input[type="checkbox"]')) {
            return;
          }
          if (isSelectionMode) {
            chatsController.toggleSelect(chatId);
          } else {
            chatsController.selectSingle(chatId);
          }
        };
        this.chatClickHandlers.set(chatId, clickHandler);
        chatElement.addEventListener('click', clickHandler);
      }
    });
  }

  protected render(): DocumentFragment {
    const { chats, selectedChatIds, selectAll, isSelectionMode = false } = this.props;

    return this.compile(
      () => `
        <div class="chat-list">
          ${isSelectionMode ? `
            <div class="chat-list__header">
              <label class="chat-list__select-all">
                <input 
                  type="checkbox" 
                  id="select-all-chats"
                  ${selectAll ? 'checked' : ''}
                />
                <span>Выбрать все чаты</span>
              </label>
            </div>
          ` : ''}
          <div class="chat-list__items">
            ${chats.map((chat) => {
              const isSelected = selectAll || selectedChatIds.includes(chat.id);
              const time = chat.lastMessage
                ? new Date(chat.lastMessage.createdAt).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';
              const unreadBadge = chat.unreadCount > 0
                ? `<span class="chat-item__badge">${chat.unreadCount}</span>`
                : '';

              return `
                <div class="chat-item ${isSelected ? 'chat-item_active' : ''}" data-chat-id="${chat.id}">
                  ${isSelectionMode ? `
                    <input 
                      type="checkbox" 
                      class="chat-item__checkbox"
                      ${isSelected ? 'checked' : ''}
                    />
                  ` : ''}
                  ${chat.avatar
                    ? `<img src="${chat.avatar}" alt="${chat.title}" class="chat-item__avatar" />`
                    : '<div class="chat-item__avatar chat-item__avatar_empty"></div>'}
                  <div class="chat-item__content">
                    <div class="chat-item__header">
                      <h3 class="chat-item__title">${chat.title}</h3>
                      ${time ? `<span class="chat-item__time">${time}</span>` : ''}
                    </div>
                    <div class="chat-item__footer">
                      <p class="chat-item__message">${chat.lastMessage?.text || 'Нет сообщений'}</p>
                      ${unreadBadge}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `,
      {}
    );
  }
}


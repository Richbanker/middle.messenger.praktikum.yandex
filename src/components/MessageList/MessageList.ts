import { Block, Props } from '@/core/Block';
import { Message } from '@/types';

interface MessageListProps extends Props {
  messages: Message[];
  selectAll: boolean;
  selectedChatIds: string[];
}

export class MessageList extends Block<MessageListProps> {
  protected render(): DocumentFragment {
    const { messages, selectAll, selectedChatIds } = this.props;

    if (selectAll) {
      return this.compile(
        () => `
          <div class="message-list">
            <div class="message-list__info">
              <p>Сообщение будет отправлено во все чаты</p>
            </div>
          </div>
        `,
        {}
      );
    }

    if (selectedChatIds.length === 0) {
      return this.compile(
        () => `
          <div class="message-list">
            <div class="message-list__empty">
              <p>Выберите чат для просмотра сообщений</p>
            </div>
          </div>
        `,
        {}
      );
    }

    if (selectedChatIds.length > 1) {
      return this.compile(
        () => `
          <div class="message-list">
            <div class="message-list__info">
              <p>Выбрано чатов: ${selectedChatIds.length}. Сообщение будет отправлено во все выбранные чаты.</p>
            </div>
          </div>
        `,
        {}
      );
    }

    return this.compile(
      () => `
        <div class="message-list">
          ${messages.map((message) => {
            const time = new Date(message.createdAt).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return `
              <div class="message ${message.isOwn ? 'message_own' : ''}">
                <div class="message__content">${message.text}</div>
                <div class="message__time">${time}</div>
              </div>
            `;
          }).join('')}
        </div>
      `,
      {}
    );
  }
}


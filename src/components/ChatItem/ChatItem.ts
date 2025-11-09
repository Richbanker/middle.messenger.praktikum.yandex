import { Block, Props } from '@/core/Block';
import { Chat } from '@/types';

interface ChatItemProps extends Props {
  chat: Chat;
  onClick?: () => void;
}

export class ChatItem extends Block<ChatItemProps> {
  constructor(props: ChatItemProps) {
    super({
      ...props,
      events: {
        click: props.onClick || (() => {}),
      },
    });
  }

  protected render(): DocumentFragment {
    const { chat } = this.props;
    const lastMessage = chat.last_message?.content || 'Нет сообщений';
    const time = chat.last_message?.time
      ? new Date(chat.last_message.time).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return this.compile(
      () => `
        <div class="chat-item">
          ${chat.avatar ? `<img src="${chat.avatar}" alt="${chat.title}" class="chat-item__avatar" />` : '<div class="chat-item__avatar chat-item__avatar_empty"></div>'}
          <div class="chat-item__content">
            <div class="chat-item__header">
              <h3 class="chat-item__title">${chat.title}</h3>
              ${time ? `<span class="chat-item__time">${time}</span>` : ''}
            </div>
            <div class="chat-item__footer">
              <p class="chat-item__message">${lastMessage}</p>
              ${chat.unread_count ? `<span class="chat-item__badge">${chat.unread_count}</span>` : ''}
            </div>
          </div>
        </div>
      `,
      {}
    );
  }
}


import { Block, Props } from '@/core/Block';
import { Message as MessageType } from '@/types';

interface MessageProps extends Props {
  message: MessageType;
  currentUserId?: string;
}

export class Message extends Block<MessageProps> {
  protected render(): DocumentFragment {
    const { message, currentUserId } = this.props;
    const isOwn = message.user_id === currentUserId;
    const time = message.time
      ? new Date(message.time).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return this.compile(
      () => `
        <div class="message ${isOwn ? 'message_own' : ''}">
          <div class="message__content">${message.content}</div>
          <div class="message__time">${time}</div>
        </div>
      `,
      {}
    );
  }
}


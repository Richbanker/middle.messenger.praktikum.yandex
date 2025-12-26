import { chatsService } from '../services/ChatsService.js';
import { validateMessage } from '../utils/validation.js';
import { store } from '../core/store.js';
import { Chat } from '../types/index.js';

class ChatsController {
  createChat(data: { title: string; avatar?: string }): Chat {
    const title = data.title?.trim();
    if (!title) {
      throw new Error('Название чата обязательно');
    }
    return chatsService.createChat(title, data.avatar);
  }

  selectAll(flag: boolean): void {
    chatsService.setSelectAll(flag);
  }

  toggleSelect(id: string): void {
    chatsService.toggleSelectChat(id);
  }

  selectSingle(id: string): void {
    chatsService.selectSingleChat(id);
  }

  sendMessage(form: HTMLFormElement): void {
    const fd = new FormData(form);
    const text = (fd.get('message') as string || '').trim();

    if (!validateMessage(text)) {
      throw new Error('Некорректное сообщение');
    }

    const st = store.getState();
    const authorId = st.user?.id || 'me';
    const ids = st.chats.selectedChatIds;

    chatsService.sendMessage(ids, text, authorId);
  }
}

export const chatsController = new ChatsController();


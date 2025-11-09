import { store } from '../core/store';
import { ID, Chat, Message } from '../types';

const genId = (): ID => crypto.randomUUID();

class ChatsService {
  list(): Chat[] {
    return store.getState().chats.chats;
  }

  createChat(title: string, avatar?: string): Chat {
    const newChat: Chat = {
      id: genId(),
      title,
      avatar,
      unreadCount: 0,
      messages: [],
    };

    const chats = this.list();
    store.patchChats({ chats: [newChat, ...chats] });

    return newChat;
  }

  setSelectAll(flag: boolean): void {
    const currentState = store.getState().chats;
    const allChatIds = flag ? currentState.chats.map((c) => c.id) : [];
    store.patchChats({
      selectAll: flag,
      selectedChatIds: allChatIds,
    });
  }

  toggleSelectChat(chatId: ID): void {
    const { selectedChatIds } = store.getState().chats;
    const next = selectedChatIds.includes(chatId)
      ? selectedChatIds.filter((id) => id !== chatId)
      : [...selectedChatIds, chatId];

    store.patchChats({ selectAll: false, selectedChatIds: next });
  }

  selectSingleChat(chatId: ID): void {
    store.patchChats({ selectAll: false, selectedChatIds: [chatId] });
  }

  sendMessage(targetIds: ID[], text: string, authorId: ID): void {
    const st = store.getState();
    const ids = st.chats.selectAll ? st.chats.chats.map((c) => c.id) : targetIds;

    const chats = st.chats.chats.map((chat) => {
      if (!ids.includes(chat.id)) {
        return chat;
      }

      const msg: Message = {
        id: genId(),
        chatId: chat.id,
        authorId,
        text,
        createdAt: new Date().toISOString(),
        isOwn: true,
      };

      const messages = [...chat.messages, msg];

      return {
        ...chat,
        lastMessage: msg,
        messages,
      };
    });

    store.patchChats({ 
      chats,
      selectedChatIds: ids.length === 1 ? ids : [],
      selectAll: false,
    });
  }
}

export const chatsService = new ChatsService();


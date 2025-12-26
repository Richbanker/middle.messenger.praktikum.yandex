import { View } from '../View.js';
import { Block } from '../../core/Block.js';
import { store, STORE_EVENTS } from '../../core/store.js';
import { Chat } from '../../types/index.js';
import { CreateChatModal } from '../../components/CreateChatModal/CreateChatModal.js';
import { ChatList } from '../../components/ChatList/ChatList.js';
import { MessageList } from '../../components/MessageList/MessageList.js';
import { MessageInput } from '../../components/MessageInput/MessageInput.js';

export class Chats extends View {
  private createChatModal: CreateChatModal;
  private chatList: ChatList;
  private messageList: MessageList;
  private messageInput: MessageInput;
  private isModalOpen: boolean = false;
  private isSelectionMode: boolean = false;
  private storeUnsubscribe: (() => void) | null = null;
  private createChatButtonHandler: ((e: Event) => void) | null = null;
  private groupButtonHandler: ((e: Event) => void) | null = null;

  constructor() {
    super({});
    
    this.createChatButtonHandler = this.handleCreateChat.bind(this);
    this.groupButtonHandler = this.handleGroupMessage.bind(this);
    
    this.initStore();
    const state = store.getState();
    this.createChatModal = new CreateChatModal({
      isOpen: false,
      onClose: () => {
        this.isModalOpen = false;
        this.updateModal();
      },
    });
    this.chatList = new ChatList({
      chats: state.chats.chats,
      selectedChatIds: state.chats.selectedChatIds,
      selectAll: state.chats.selectAll,
      isSelectionMode: this.isSelectionMode,
    });
    const selectedChatId = state.chats.selectedChatIds.length === 1 ? state.chats.selectedChatIds[0] : null;
    const selectedChat = selectedChatId
      ? state.chats.chats.find((c) => c.id === selectedChatId)
      : null;
    const messages = selectedChat ? selectedChat.messages : [];
    this.messageList = new MessageList({
      messages,
      selectAll: state.chats.selectAll,
      selectedChatIds: state.chats.selectedChatIds,
    });
    this.messageInput = new MessageInput({
      onSubmit: () => {
        this.isSelectionMode = false;
        store.patchChats({ selectAll: false });
        this.updateFromStore();
      },
    });
    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  private handleCreateChat(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.isModalOpen = true;
    this.updateModal();
  }

  private handleGroupMessage(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.isSelectionMode = !this.isSelectionMode;
    if (!this.isSelectionMode) {
      store.patchChats({ selectedChatIds: [], selectAll: false });
    }
    this.updateFromStore();
  }

  private initStore(): void {
    const avatars = {
      '1': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnMSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzRGODZGNzsiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMyQTVBRTA7Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9InVybCgjYmcxKSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMjIiIHI9IjgiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuOSIvPjxwYXRoIGQ9Ik0gMTUgNDAgUSAxNSAzMCAzMCAzMCBRIDQ1IDMwIDQ1IDQwIEwgNDUgNDUgTCAxNSA0NSBaIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjkiLz48Y2lyY2xlIGN4PSIyNCIgY3k9IjIwIiByPSIyIiBmaWxsPSIjMzMzIi8+PGNpcmNsZSBjeD0iMzYiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzMzMyIvPjxwYXRoIGQ9Ik0gMjQgMjYgUSAzMCAyOCAzNiAyNiIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==',
      '2': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnMiIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGNkI5RDsiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRjMzNDc7Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9InVybCgjYmcyKSIvPjxjaXJjbGUgY3g9IjIyIiBjeT0iMjQiIHI9IjQiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIzOCIgY3k9IjI0IiByPSI0IiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iMjIiIGN5PSIyNCIgcj0iMS41IiBmaWxsPSIjMzMzIi8+PGNpcmNsZSBjeD0iMzgiIGN5PSIyNCIgcj0iMS41IiBmaWxsPSIjMzMzIi8+PHBhdGggZD0iTSAyMCAzNCBRIDMwIDQyIDQwIDM0IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGVsbGlwc2UgY3g9IjMwIiBjeT0iMTYiIHJ4PSIxOCIgcnk9IjEwIiBmaWxsPSIjZmY2YjlkIiBvcGFjaXR5PSIwLjQiLz48L3N2Zz4=',
      '3': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnMyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzJhMmEyYTsiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDAwMDA7Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9InVybCgjYmczKSIvPjxwYXRoIGQ9Ik0gMTUgMjUgTCAxNSAzNSBMIDQ1IDM1IEwgNDUgMjUgWiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0gMzAgMTAgTCAzNSAyNSBMIDI1IDI1IFoiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNIDE4IDI4IEwgMjIgMjggTCAyMiAzMiBMIDE4IDMyIFoiIGZpbGw9IiNmZjMzMzMiLz48cGF0aCBkPSJNIDI4IDI4IEwgMzIgMjggTCAzMiAzMiBMIDI4IDMyIFoiIGZpbGw9IiNmZjMzMzMiLz48cGF0aCBkPSJNIDM4IDI4IEwgNDIgMjggTCA0MiAzMiBMIDM4IDMyIFoiIGZpbGw9IiNmZjMzMzMiLz48cGF0aCBkPSJNIDIwIDQwIEwgMjUgNTAgTCAyNSA0MCBaIiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTSA0MCA0MCBMIDM1IDUwIEwgMzUgNDAgWiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==',
    };

    const state = store.getState();
    
    if (state.chats.chats.length === 0) {

      const defaultChats: Chat[] = [
        {
          id: '1',
          title: 'Чат 1',
          avatar: avatars['1'],
          unreadCount: 2,
          messages: [
            {
              id: '1-1',
              chatId: '1',
              authorId: 'other',
              text: 'Привет! Как дела?',
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              isOwn: false,
            },
            {
              id: '1-2',
              chatId: '1',
              authorId: 'me',
              text: 'Отлично, спасибо! А у тебя?',
              createdAt: new Date(Date.now() - 1800000).toISOString(),
              isOwn: true,
            },
            {
              id: '1-3',
              chatId: '1',
              authorId: 'other',
              text: 'Тоже всё хорошо!',
              createdAt: new Date().toISOString(),
              isOwn: false,
            },
          ],
          lastMessage: {
            id: '1-3',
            chatId: '1',
            authorId: 'other',
            text: 'Тоже всё хорошо!',
            createdAt: new Date().toISOString(),
            isOwn: false,
          },
        },
        {
          id: '2',
          title: 'Чат 2',
          avatar: avatars['2'],
          unreadCount: 0,
          messages: [
            {
              id: '2-1',
              chatId: '2',
              authorId: 'user2',
              text: 'Привет!',
              createdAt: new Date(Date.now() - 7200000).toISOString(),
              isOwn: false,
            },
            {
              id: '2-2',
              chatId: '2',
              authorId: 'me',
              text: 'Как дела?',
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              isOwn: true,
            },
          ],
          lastMessage: {
            id: '2-2',
            chatId: '2',
            authorId: 'me',
            text: 'Как дела?',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            isOwn: true,
          },
        },
        {
          id: '3',
          title: 'Группа: Команда разработки',
          avatar: avatars['3'],
          unreadCount: 5,
          messages: [
            {
              id: '3-1',
              chatId: '3',
              authorId: 'admin',
              text: 'Встречаемся в 15:00',
              createdAt: new Date(Date.now() - 1800000).toISOString(),
              isOwn: false,
            },
            {
              id: '3-2',
              chatId: '3',
              authorId: 'me',
              text: 'Понял, буду',
              createdAt: new Date(Date.now() - 900000).toISOString(),
              isOwn: true,
            },
          ],
          lastMessage: {
            id: '3-1',
            chatId: '3',
            authorId: 'admin',
            text: 'Встречаемся в 15:00',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            isOwn: false,
          },
        },
      ];
      store.patchChats({ chats: defaultChats });
    } else {
      const chatsWithAvatars = state.chats.chats.map((chat) => {
        if (!chat.avatar && avatars[chat.id as keyof typeof avatars]) {
          return { ...chat, avatar: avatars[chat.id as keyof typeof avatars] };
        }
        return chat;
      });
      
      const needsUpdate = chatsWithAvatars.some((chat, index) => {
        const stateChat = state.chats.chats[index];
        return stateChat && chat.avatar !== stateChat.avatar;
      });
      
      if (needsUpdate) {
        store.patchChats({ chats: chatsWithAvatars });
      }
    }
  }

  protected componentDidMount(): void {
    this.subscribeToStore();
    this.updateFromStore();
    this.attachHandlers();
  }

  protected componentDidUpdate(): boolean {
    this.attachHandlers();
    return true;
  }

  private subscribeToStore(): void {
    const handler = () => {
      this.updateFromStore();
    };
    store.on(STORE_EVENTS.UPDATED, handler);
    this.storeUnsubscribe = () => {
      store.off(STORE_EVENTS.UPDATED, handler);
    };
  }

  private updateFromStore(): void {
    const state = store.getState();
    const chatsState = state.chats;

    const selectedChatId = chatsState.selectedChatIds.length === 1 && !this.isSelectionMode ? chatsState.selectedChatIds[0] : null;
    const selectedChat = selectedChatId
      ? chatsState.chats.find((c) => c.id === selectedChatId)
      : null;
    const messages = selectedChat ? selectedChat.messages : [];

    this.chatList.setProps({
      chats: chatsState.chats,
      selectedChatIds: chatsState.selectedChatIds,
      selectAll: chatsState.selectAll,
      isSelectionMode: this.isSelectionMode,
    });

    this.messageList.setProps({
      messages,
      selectAll: chatsState.selectAll,
      selectedChatIds: chatsState.selectedChatIds,
    });

    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  private updateModal(): void {
    this.createChatModal.setProps({
      isOpen: this.isModalOpen,
    });
    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  private attachHandlers(): void {
    if (!this.element) {
      return;
    }

    const createChatButton = this.element.querySelector<HTMLButtonElement>('.show-create-chat-button');
    if (createChatButton && this.createChatButtonHandler) {
      createChatButton.removeEventListener('click', this.createChatButtonHandler);
      createChatButton.addEventListener('click', this.createChatButtonHandler);
    }

    const selectAllButton = this.element.querySelector<HTMLButtonElement>('.show-group-button');
    if (selectAllButton && this.groupButtonHandler) {
      selectAllButton.removeEventListener('click', this.groupButtonHandler);
      selectAllButton.addEventListener('click', this.groupButtonHandler);
    }
  }

  protected render(): DocumentFragment {
    const state = store.getState();
    const userProfile = {
      first_name: localStorage.getItem('profile_first_name') || 'Иван',
      second_name: localStorage.getItem('profile_second_name') || 'Иванов',
      login: localStorage.getItem('profile_login') || 'user',
      avatar: localStorage.getItem('profile_avatar') || '',
    };

    const selectedChatId = state.chats.selectedChatIds.length === 1 ? state.chats.selectedChatIds[0] : null;
    const selectedChat = selectedChatId
      ? state.chats.chats.find((c) => c.id === selectedChatId)
      : null;

    return this.compile(
      () => `
        <div class="page page_chats">
          <div class="chats-sidebar">
            <div class="chats-sidebar__header">
              <div class="user-profile">
                ${userProfile.avatar 
                  ? `<img src="${userProfile.avatar}" alt="Avatar" class="user-profile__avatar" style="object-fit: cover;" />`
                  : `<div class="user-profile__avatar">${userProfile.first_name[0]}${userProfile.second_name[0]}</div>`
                }
                <div class="user-profile__info">
                  <div class="user-profile__name">${userProfile.first_name} ${userProfile.second_name}</div>
                  <div class="user-profile__login">@${userProfile.login}</div>
                </div>
                <a href="/profile" data-link class="user-profile__link" title="Профиль">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="currentColor"/>
                    <path d="M10 12C5.58172 12 2 13.7909 2 16V20H18V16C18 13.7909 14.4183 12 10 12Z" fill="currentColor"/>
                  </svg>
                </a>
              </div>
              <div class="chats-sidebar__actions">
                <button class="button button_secondary show-create-chat-button">Создать чат</button>
                <button class="button button_secondary show-group-button">Групповое сообщение</button>
              </div>
            </div>
            <div class="chats-sidebar__list" data-id="chat-list"></div>
          </div>
          <div class="chats-main">
            ${selectedChat ? `
              <div class="chats-main__header">
                <h2>${selectedChat.title}</h2>
              </div>
            ` : state.chats.selectAll ? `
              <div class="chats-main__header">
                <h2>Все чаты</h2>
              </div>
            ` : ''}
            <div class="chats-main__messages" data-id="message-list"></div>
            ${selectedChat || state.chats.selectAll || state.chats.selectedChatIds.length > 0 ? `
              <div data-id="message-input"></div>
            ` : ''}
          </div>
          <div data-id="create-chat-modal"></div>
        </div>
      `,
      {}
    );
  }

  protected compile(template: (context: unknown) => string, context: unknown): DocumentFragment {
    const fragment = document.createElement('template');
    const htmlString = template(context);
    fragment.innerHTML = htmlString;

    if (this.chatList) {
      if (!this.chatList.element) {
        (this.chatList as unknown as { eventBus: () => { emit: (event: string) => void } }).eventBus().emit(Block.EVENTS.FLOW_RENDER);
      }
      if (this.chatList.element) {
        const chatListStub = fragment.content.querySelector('[data-id="chat-list"]');
        if (chatListStub) {
          chatListStub.replaceWith(this.chatList.element);
        }
      }
    }

    if (this.messageList) {
      if (!this.messageList.element) {
        (this.messageList as unknown as { eventBus: () => { emit: (event: string) => void } }).eventBus().emit(Block.EVENTS.FLOW_RENDER);
      }
      if (this.messageList.element) {
        const messageListStub = fragment.content.querySelector('[data-id="message-list"]');
        if (messageListStub) {
          messageListStub.replaceWith(this.messageList.element);
        }
      }
    }

    if (this.messageInput) {
      if (!this.messageInput.element) {
        (this.messageInput as unknown as { eventBus: () => { emit: (event: string) => void } }).eventBus().emit(Block.EVENTS.FLOW_RENDER);
      }
      if (this.messageInput.element) {
        const messageInputStub = fragment.content.querySelector('[data-id="message-input"]');
        if (messageInputStub) {
          messageInputStub.replaceWith(this.messageInput.element);
        }
      }
    }

    if (this.createChatModal) {
      if (!this.createChatModal.element) {
        (this.createChatModal as unknown as { eventBus: () => { emit: (event: string) => void } }).eventBus().emit(Block.EVENTS.FLOW_RENDER);
      }
      if (this.createChatModal.element) {
        const modalStub = fragment.content.querySelector('[data-id="create-chat-modal"]');
        if (modalStub) {
          modalStub.replaceWith(this.createChatModal.element);
        }
      }
    }

    requestAnimationFrame(() => {
      if (this.chatList && this.chatList.element && this.chatList.element.parentNode) {
        this.chatList.dispatchComponentDidMount();
      }
      if (this.messageList && this.messageList.element && this.messageList.element.parentNode) {
        this.messageList.dispatchComponentDidMount();
      }
      if (this.messageInput && this.messageInput.element && this.messageInput.element.parentNode) {
        this.messageInput.dispatchComponentDidMount();
      }
      if (this.createChatModal && this.createChatModal.element && this.createChatModal.element.parentNode) {
        this.createChatModal.dispatchComponentDidMount();
      }
    });

    return fragment.content;
  }

  public destroy(): void {
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
    }
  }
}

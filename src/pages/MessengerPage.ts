import { Block } from '@/core/Block';
import { router } from '@/router';
import { auth } from '@/state/auth';
import { chatStore } from '@/state/chat';
import type { Chat, ChatUser, Message, User } from '@/types';
import { escapeHtml } from '@/utils/escapeHtml';
import { formatDateTime, formatTime } from '@/utils/format';

type State = {
  chats: Chat[];
  selectedChatId: number | null;
  messages: Message[];
  members: ChatUser[];
  socketStatus: 'idle' | 'connecting' | 'connected';
  error: string | null;
  info: string | null;
  user: User | null;
};

const template = (context: unknown) => {
  const ctx = context as State;
  return `
  <div class="layout">
    <div>
      <form class="card" data-id="create-chat">
        <h3 class="title">Создать чат</h3>
        <div class="field">
          <span>Название</span>
          <input name="title" placeholder="Название" required />
        </div>
        <button class="btn btn-primary" type="submit">Создать</button>
      </form>
      <div class="chat-list">
        ${ctx.chats.length === 0 ? '<p class="text-muted" style="padding:12px;">Чатов нет</p>' : ''}
        ${ctx.chats
          .map(
            (chat) => `
          <button class="chat-list__item ${ctx.selectedChatId === chat.id ? 'chat-list__item--active' : ''}" data-chat="${chat.id}">
            <div class="chat-list__avatar">${escapeHtml(chat.title[0]?.toUpperCase() ?? '')}</div>
            <div>
              <div style="display:flex;justify-content:space-between;gap:8px;">
                <span class="chat-list__title">${escapeHtml(chat.title)}</span>
                ${
                  chat.last_message
                    ? `<span class="text-muted" style="font-size:12px;">${formatDateTime(
                        chat.last_message.time
                      )}</span>`
                    : ''
                }
              </div>
              <p class="chat-list__preview">${escapeHtml(chat.last_message?.content ?? 'Без сообщений')}</p>
            </div>
            ${
              chat.unread_count > 0
                ? `<span class="chat-list__badge">${chat.unread_count}</span>`
                : ''
            }
          </button>
        `
          )
          .join('')}
      </div>
    </div>

    <div class="chat-shell">
      ${
        ctx.selectedChatId
          ? `
        <header class="chat-header">
          <div>
            <div class="title" style="font-size:18px;margin:0;">
              ${escapeHtml(ctx.chats.find((c) => c.id === ctx.selectedChatId)?.title ?? 'Чат')}
            </div>
            <p class="chat-header__meta">
              Пользователей: ${ctx.members.length} • Статус: ${ctx.socketStatus}
            </p>
          </div>
          <div class="chat-header__meta">
            ${ctx.members
              .slice(0, 4)
              .map(
                (m) =>
                  `<span style="background:#f1f5f9;padding:4px 8px;border-radius:12px;">${escapeHtml(
                    m.login
                  )}</span>`
              )
              .join('')}
          </div>
        </header>
        <div class="chat-messages">
          ${
            ctx.messages.length === 0
              ? '<p class="text-muted">Сообщений пока нет</p>'
              : ctx.messages
                  .map((m) => {
                    const own = m.user_id === ctx.user?.id;
                    return `
                      <div class="message ${own ? 'message--own' : ''}">
                        ${
                          !own
                            ? `<div style="font-size:12px;font-weight:700;">${escapeHtml(
                                ctx.members.find((u) => u.id === m.user_id)?.login ?? 'user'
                              )}</div>`
                            : ''
                        }
                        <div>${escapeHtml(m.content ?? '')}</div>
                        <div class="message__meta">${formatTime(m.time)}</div>
                      </div>
                    `;
                  })
                  .join('')
          }
        </div>

        <form class="chat-input" data-id="send-message">
          <input name="message" placeholder="Введите сообщение" ${ctx.socketStatus !== 'connected' ? 'disabled' : ''}/>
          <button class="btn btn-primary" type="submit" ${ctx.socketStatus !== 'connected' ? 'disabled' : ''}>Отправить</button>
        </form>

        <div class="layout" style="grid-template-columns:1fr 1fr; gap:12px; align-items:flex-start;">
          <form class="card" data-id="add-user">
            <div class="field">
              <span>Добавить пользователя (логин)</span>
              <input name="login" required />
            </div>
            <button class="btn btn-ghost" type="submit">Добавить</button>
          </form>
          <form class="card" data-id="remove-user">
            <div class="field">
              <span>Удалить пользователя (логин)</span>
              <input name="login" required />
            </div>
            <button class="btn btn-ghost" type="submit">Удалить</button>
          </form>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <button class="btn btn-ghost" data-id="delete-chat">Удалить чат</button>
          ${ctx.info ? `<span class="success">${ctx.info}</span>` : ''}
          ${ctx.error ? `<span class="error">${ctx.error}</span>` : ''}
        </div>
      `
          : '<p class="text-muted">Выберите чат слева или создайте новый</p>'
      }
    </div>
  </div>
`;
};

export class MessengerPage extends Block<State> {
  private started = false;

  constructor() {
    super({
      chats: [],
      selectedChatId: null,
      messages: [],
      members: [],
      socketStatus: 'idle',
      error: null,
      info: null,
      user: null,
    });
  }

  protected render(): DocumentFragment {
    return this.compile(template, this.props);
  }

  protected componentDidMount(): void {
    if (!this.started) {
      this.started = true;

      auth.subscribe((next) => {
        this.setProps({ user: next.user });
        if (!next.user) {
          chatStore.disconnect();
          router.go('/');
        }
      });

      chatStore.subscribe((next) => {
        const messages = next.selectedChatId ? next.messages[next.selectedChatId] || [] : [];
        const members = next.selectedChatId ? next.chatUsers[next.selectedChatId] || [] : [];
        this.setProps({
          chats: next.chats,
          selectedChatId: next.selectedChatId,
          messages,
          members,
          socketStatus: next.socketStatus,
          error: next.error,
        });
      });

      const initialUser = auth.getState().user;
      if (initialUser || auth.hasHint()) {
        void this.bootstrapChat();
      } else {
        router.go('/');
      }
    }

    this.bindHandlers();
  }

  private async bootstrapChat() {
    await auth.bootstrap();
    const userId = auth.getState().user?.id;
    if (!userId) return;
    await chatStore.loadChats();
  }

  private bindHandlers() {
    const userId = this.props.user?.id;
    if (!userId) return;

    // select chat
    if (this.element) {
      this.addListener(this.element, 'click', (e) => {
        const btn = (e.target as HTMLElement).closest('[data-chat]') as HTMLElement | null;
        if (btn) {
          const chatId = Number(btn.getAttribute('data-chat'));
          chatStore.selectChat(chatId, userId);
        }
      });
    }

    // create chat
    const createForm = this.element?.querySelector(
      '[data-id="create-chat"]'
    ) as HTMLFormElement | null;
    if (createForm) {
      this.addListener(createForm, 'submit', async (e) => {
        e.preventDefault();
        const title = String(new FormData(createForm).get('title') ?? '').trim();
        if (!title) return;
        await chatStore.createChat(title);
        createForm.reset();
      });
    }

    // send message
    const sendForm = this.element?.querySelector(
      '[data-id="send-message"]'
    ) as HTMLFormElement | null;
    if (sendForm) {
      this.addListener(sendForm, 'submit', (e) => {
        e.preventDefault();
        const formData = new FormData(sendForm);
        const content = String(formData.get('message') ?? '').trim();
        if (!content) return;
        chatStore.sendMessage(content, userId);
        sendForm.reset();
      });
    }

    // add user
    const addForm = this.element?.querySelector('[data-id="add-user"]') as HTMLFormElement | null;
    if (addForm) {
      this.addListener(addForm, 'submit', async (e) => {
        e.preventDefault();
        const login = String(new FormData(addForm).get('login') ?? '').trim();
        if (!login || !this.props.selectedChatId) return;
        try {
          await chatStore.addUserByLogin(login, this.props.selectedChatId);
          this.setProps({ info: 'Пользователь добавлен', error: null });
        } catch (error) {
          this.setProps({ error: error instanceof Error ? error.message : 'Ошибка', info: null });
        }
        addForm.reset();
      });
    }

    // remove user
    const removeForm = this.element?.querySelector(
      '[data-id="remove-user"]'
    ) as HTMLFormElement | null;
    if (removeForm) {
      this.addListener(removeForm, 'submit', async (e) => {
        e.preventDefault();
        const login = String(new FormData(removeForm).get('login') ?? '').trim();
        if (!login || !this.props.selectedChatId) return;
        try {
          await chatStore.removeUserByLogin(login, this.props.selectedChatId);
          this.setProps({ info: 'Пользователь удалён', error: null });
        } catch (error) {
          this.setProps({ error: error instanceof Error ? error.message : 'Ошибка', info: null });
        }
        removeForm.reset();
      });
    }

    // delete chat
    const deleteBtn = this.element?.querySelector(
      '[data-id="delete-chat"]'
    ) as HTMLButtonElement | null;
    if (deleteBtn) {
      this.addListener(deleteBtn, 'click', async () => {
        if (!this.props.selectedChatId) return;
        await chatStore.deleteChat(this.props.selectedChatId);
        this.setProps({ info: 'Чат удалён', messages: [], members: [], selectedChatId: null });
      });
    }
  }

  protected componentDidUpdate(): boolean {
    return true;
  }
}

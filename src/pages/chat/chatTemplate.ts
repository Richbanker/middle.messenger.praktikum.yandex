export const chatTemplate = `
<div class="chat-container">
  <!-- Блок списка чатов -->
  <div class="chat-list {{#if activeChat}}mobile-hidden{{/if}}" id="chatList">
    <div class="chat-list-header">
      <h2>Чаты</h2>
      <div class="chat-list-actions">
        <a class="btn btn--secondary" href="/settings">Профиль</a>
        <button class="btn" data-action="openCreateChatModal">
        {{> icon name="plus"}}
          Создать чат
      </button>
      </div>
    </div>

    <div class="chat-items">
      {{#each chats}}
        <div class="chat-item {{#if (eq this.id ../activeChatId)}}active{{/if}}" data-chat-id="{{this.id}}">
          {{> chatItem
            avatar=this.avatar
            name=this.name
            preview=this.preview
            time=this.time
            id=this.id
            unreadCount=this.unreadCount
          }}
        </div>
      {{/each}}
    </div>
  </div>

  <!-- Блок переписки -->
  <div class="chat-conversation {{#unless activeChat}}mobile-hidden{{/unless}}" id="chatConversation">
    {{#if activeChat}}
      <div class="conversation-header">
        <button class="back-to-chats-btn" data-action="backToChats" aria-label="Назад к чатам">
          {{> icon name="arrow-left"}}
        </button>
        {{> conversationHeader
          avatar=activeChat.avatar
          name=activeChat.name
          status=activeChat.status
        }}
        <div class="conversation-header-actions">
          <button class="btn btn--secondary" data-action="openUserManagementModal">
          {{> icon name="settings"}}
          УПРАВЛЕНИЕ
          </button>
          <button class="btn btn--secondary" data-action="logout">Выйти</button>
        </div>
      </div>

      <div class="messages-container" id="messagesContainer">
        {{#each messages}}
          {{> message
            type=this.type
            content=this.content
            time=this.time
            senderName=this.senderName
          }}
        {{/each}}
      </div>

      {{> messageInput
        placeholder="Введите сообщение..."
        onSend=handleMessageSend
      }}
    {{else}}
      <div class="no-chat-selected">
        <div class="no-chat-content">
          <h3>Выберите чат</h3>
          <p>Выберите чат из списка слева, чтобы начать переписку</p>
        </div>
      </div>
    {{/if}}
  </div>
</div>

<!-- Модальное окно создания чата -->
<div class="modal" id="createChatModal">
  <div class="modal-content">
    <h2 class="modal-title">СОЗДАТЬ НОВЫЙ ЧАТ</h2>
    <form id="createChatForm">
      <div class="input-group">
        <label class="input-group__label" for="chatTitle">
          НАЗВАНИЕ ЧАТА
          <span class="input-group__required">*</span>
        </label>
        <input
          class="input-group__input"
          type="text"
          id="chatTitle"
          name="chatTitle"
          placeholder="Введите название чата"
          required
        >
        <div class="input-group__icon">
          <svg class="icon icon--message" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path>
          </svg>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn--primary" type="submit">
          {{> icon name="plus"}}
          СОЗДАТЬ
        </button>
        <button class="btn btn--warning" type="button" data-action="closeCreateChatModal">
          {{> icon name="close"}}
          ОТМЕНА
        </button>
      </div>
    </form>
  </div>
</div>

<!-- Модальное окно управления участниками чата -->
<div class="modal" id="userManagementModal">
  <div class="modal-content">
    <h2 class="modal-title">УПРАВЛЕНИЕ УЧАСТНИКАМИ</h2>

    <div class="participants-section">
      <div class="section-header">
        <h3>Участники чата</h3>
        <button class="btn btn--secondary" data-action="openAddUserModal">
          {{> icon name="plus"}}
          Добавить пользователя
        </button>
      </div>
      <div id="participantsList" class="participants-list">
        <!-- Список участников будет загружен динамически -->
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn btn--warning" type="button" data-action="closeUserManagementModal">
        {{> icon name="close"}}
        ЗАКРЫТЬ
      </button>
    </div>
  </div>
</div>

<!-- Модальное окно добавления пользователей -->
<div class="modal" id="addUserModal">
  <div class="modal-content">
    <h2 class="modal-title">ДОБАВИТЬ ПОЛЬЗОВАТЕЛЯ</h2>

    <form id="searchUserForm">
      <div class="input-group">
        <label class="input-group__label" for="userLogin">
          ПОИСК ПО ЛОГИНУ
          <span class="input-group__required">*</span>
        </label>
        <input
          class="input-group__input"
          type="text"
          id="userLogin"
          name="userLogin"
          placeholder="Введите логин пользователя"
          required
        >
        <div class="input-group__icon">
          <svg class="icon icon--search" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
          </svg>
        </div>
      </div>
      <button class="btn btn--primary" type="submit">
        {{> icon name="search"}}
        ПОИСК
      </button>
    </form>

    <div id="searchResults" class="search-results">
      <!-- Результаты поиска будут загружены динамически -->
    </div>

    <form id="addUserForm" style="display: none;">
      <div class="selected-users">
        <h3>Выбранные пользователи:</h3>
        <div id="selectedUsersList"></div>
      </div>
      <div class="modal-actions">
        <button class="btn btn--secondary" type="submit">
          {{> icon name="plus"}}
          ДОБАВИТЬ В ЧАТ
        </button>
        <button class="btn btn--warning" type="button" data-action="closeAddUserModal">
          {{> icon name="close"}}
          ОТМЕНА
        </button>
      </div>
    </form>
  </div>
</div>
`;

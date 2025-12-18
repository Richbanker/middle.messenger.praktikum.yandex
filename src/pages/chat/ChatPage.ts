import Block from "../../services/Block";
import ConversationHeader from "../../components/conversationHeader";
import MessageInput from "../../components/MessageInput";
import { chatTemplate } from "./chatTemplate";
import Handlebars from "handlebars";
import { conversationHeaderTemplate } from "../../components/conversationHeader/conversationHeaderTemplate";
import { messageTemplate } from "../../components/Message";
import { chatItemTemplate } from "../../components/ChatItem/chatItemTemplate";
import { iconTemplate } from "../../components/icon/iconTebplate";
import { Validator } from "../../services/Validator";
import { chatAPI } from "../../services/api";
import { webSocketService, WSMessage } from "../../services/WebSocketService";

Handlebars.registerPartial("conversationHeader", conversationHeaderTemplate);
Handlebars.registerPartial("message", messageTemplate);
Handlebars.registerPartial("chatItem", chatItemTemplate);
Handlebars.registerPartial("icon", iconTemplate);

interface Chat {
  id: string;
  name: string;
  avatar: string;
  preview: string;
  time: string;
  unreadCount?: number;
  status?: string;
}

interface ChatMessage {
  id: string;
  type: "sent" | "received";
  content: string;
  time: string;
  chatId: string;
  senderName?: string;
}

interface ChatPageProps {
  chats?: Chat[];
  activeChatId?: string;
  messages?: ChatMessage[];
}

export class ChatPage extends Block {
  private chats: Chat[];
  private activeChatId: string | null;
  private messages: ChatMessage[];
  private modalClickHandler: (e: Event) => void;

  constructor(props: ChatPageProps = {}) {
    const chats = props.chats || ChatPage.getMockChats();
    const activeChatId = props.activeChatId || null;
    const messages = props.messages || [];

    super("div", {
      ...props,
      events: {
        click: (e: Event) => this.handleClick(e),
        submit: (e: Event) => this.handleSubmit(e),
        keypress: (e: KeyboardEvent) => this.handleKeypress(e),
      },
    });

   
    this.chats = chats;
    this.activeChatId = activeChatId;
    this.messages = messages;
    this.modalClickHandler = this.handleModalClick.bind(this);
  }

  componentDidMount() {
    this.loadChatsFromAPI();
  }

  componentWillUnmount() {
    
    webSocketService.disconnect();
    
    this.activeChatId = null;
    this.messages = [];
    this.chats = [];
  }

  private async loadChatsFromAPI() {
    try {
      const apiChats = await chatAPI.getChats();

      this.chats = apiChats.map((chat) => ({
        id: chat.id.toString(),
        name: chat.title,
        avatar: chat.avatar || "",
        preview: chat.last_message?.content || "",
        time: chat.last_message?.time || "",
        unreadCount: chat.unread_count || 0,
        status: "online",
      }));

       
        if (this.activeChatId) {
          const activeChatExists = this.chats.some(
            (chat) => chat.id && (chat.id === this.activeChatId || chat.id === String(this.activeChatId))
          );
          if (!activeChatExists) {
          webSocketService.disconnect();
          this.activeChatId = null;
          this.messages = [];
        }
      }

      this.initializeChatItems();
      this.initializeMessageInput();

      if (!this.activeChatId && this.chats.length > 0) {
        this.messages = [];
      }

      this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
    } catch (error: any) {
      if (error?.status === 401) {
        if ((window as any).router) {
          (window as any).router.navigate("/");
        } else {
          window.location.href = "/";
        }
        return;
      }
      this.initializeChatItems();
      this.initializeMessageInput();
      this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
    }
  }

  private async loadMessagesForChat(chatId: string) {
    if (!chatId || chatId.trim() === "" || chatId === "null" || chatId === "undefined") {
      this.messages = [];
      this.updateConversation();
      this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
      return;
    }

    if (this.chats.length === 0) {
      this.messages = [];
      this.updateConversation();
      this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
      return;
    }

    const chatExists = this.chats.some(
      (chat) => chat.id === chatId || chat.id === chatId.toString()
    );
    
    if (!chatExists) {
      this.messages = [];
      this.updateConversation();
      this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
      return;
    }

    try {
      const apiMessages = await chatAPI.getChatMessages(chatId);
      
      if (!apiMessages || apiMessages.length === 0) {
        this.messages = [];
        this.updateConversation();
        this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
        return;
      }

      const currentUserId = await this.getCurrentUserId();
      this.messages = apiMessages
        .map((message) => ({
        id: message.id,
          type: (message.user_id === currentUserId ? "sent" : "received") as "sent" | "received",
        content: message.content,
        time: new Date(message.time).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        chatId: chatId,
          senderName: message.user_id === currentUserId ? undefined : "Пользователь",
        }))
        .reverse();

      this.updateConversation();
      this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
      this.scrollToBottom();
    } catch (error: any) {
      if (error?.status === 404) {
        this.messages = [];
        this.updateConversation();
        this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
        return;
      }
      
      if (chatExists) {
      this.messages = this.getMockMessages(chatId);
      this.updateConversation();
        this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
        this.scrollToBottom();
      } else {
        this.messages = [];
        this.updateConversation();
        this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
      }
    }
  }

  private async getCurrentUserId(): Promise<string> {
    try {
      const userData = await chatAPI.getCurrentUser();
      return userData.id.toString();
    } catch {
      return "unknown";
    }
  }

  private async connectToWebSocket(chatId: string): Promise<void> {
    try {
      await webSocketService.connect({
        chatId,
        onMessage: (message) => this.handleWebSocketMessage(message),
        onMessages: (messages) => this.handleWebSocketMessages(messages),
        onConnect: () => "WebSocket connected to chat",
        onDisconnect: () => "WebSocket disconnected from chat",
        onError: () => "WebSocket error",
      });
    } catch {
      await this.loadMessagesForChat(chatId);
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private async handleWebSocketMessage(wsMessage: WSMessage): Promise<void> {
    const currentChatId = webSocketService.getCurrentChatId();
    if (!this.activeChatId || currentChatId !== this.activeChatId) {
      return;
    }

    if (wsMessage.chat_id && wsMessage.chat_id.toString() !== this.activeChatId) {
      return;
    }

    const currentUserId = await this.getCurrentUserId();

    const message: ChatMessage = {
      id: wsMessage.id || Date.now().toString(),
      type: wsMessage.user_id === currentUserId ? "sent" : "received",
      content: this.escapeHtml(wsMessage.content),
      time: wsMessage.time
        ? new Date(wsMessage.time).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }),
      chatId: this.activeChatId || "",
      senderName: wsMessage.user_id === currentUserId ? undefined : "Пользователь",
    };

    this.messages.push(message);
    this.updateConversation();
    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
    this.scrollToBottom();
  }

  private async handleWebSocketMessages(
    wsMessages: WSMessage[]
  ): Promise<void> {
    const currentChatId = webSocketService.getCurrentChatId();
    if (!this.activeChatId || currentChatId !== this.activeChatId) {
      return;
    }

    const currentUserId = await this.getCurrentUserId();

    const filteredMessages = wsMessages.filter((wsMessage) => {
      if (wsMessage.chat_id) {
        return wsMessage.chat_id.toString() === this.activeChatId;
      }
      return true;
    });

    const messages: ChatMessage[] = filteredMessages.map((wsMessage) => ({
      id: wsMessage.id || Date.now().toString(),
      type: (wsMessage.user_id === currentUserId ? "sent" : "received") as "sent" | "received",
      content: this.escapeHtml(wsMessage.content),
      time: wsMessage.time
        ? new Date(wsMessage.time).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }),
      chatId: this.activeChatId || "",
      senderName: wsMessage.user_id === currentUserId ? undefined : "Пользователь",
    }));

    const existingIds = new Set(this.messages.map(m => m.id));
    const newMessages = messages.filter(m => !existingIds.has(m.id));
    
    const allMessages = [...this.messages, ...newMessages].sort((a, b) => {
      const timeA = new Date(a.time || 0).getTime();
      const timeB = new Date(b.time || 0).getTime();
      return timeA - timeB;
    });

    this.messages = allMessages;

    this.updateConversation();
    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
    this.scrollToBottom();
  }

  private initializeChatItems(): void {
  }

  private initializeMessageInput() {
    this.children.messageInput = new MessageInput({
      placeholder: "Введите сообщение...",
      onSend: (message: string) => this.handleMessageSend(message),
      onInput: (event: Event) => this.handleMessageInput(event),
    });
  }

  private handleClick(e: Event) {
    if (!(e.target instanceof HTMLElement)) {
      return;
    }
    const target = e.target;

    if (target.closest('[data-action="openCreateChatModal"]')) {
      this.openCreateChatModal();
      return;
    }

    if (target.closest('[data-action="logout"]')) {
      this.logout();
      return;
    }

    if (target.closest('[data-action="backToChats"]')) {
      this.backToChats();
      return;
    }

    if (target.closest('[data-action="openUserManagementModal"]')) {
      if (this.activeChatId) {
        this.openUserManagementModal();
      }
      return;
    }

    const chatItem = target.closest(".chat-item");
    if (chatItem) {
      const chatId = chatItem.getAttribute("data-chat-id");
      if (chatId) {
        this.handleChatSelect(chatId, e);
        return;
      }
    }

    const deleteButton = target.closest(".delete-chat");
    if (deleteButton) {
      const chatItem = deleteButton.closest(".chat-item");
      if (chatItem) {
        const chatId = chatItem.getAttribute("data-chat-id");
        if (chatId) {
          `Delete chat button clicked for chat: ${chatId}`;
          this.handleChatDelete(chatId);
          return;
        }
      }
    }

    if (target.closest('[data-action="closeCreateChatModal"]')) {
      this.closeCreateChatModal();
      return;
    }

    if (target.id === "createChatModal") {
      this.closeCreateChatModal();
      return;
    }

    if (target.id === "userManagementModal") {
      this.closeUserManagementModal();
      return;
    }

    if (target.closest('[data-action="closeUserManagementModal"]')) {
      this.closeUserManagementModal();
      return;
    }

    if (target.closest('[data-action="openAddUserModal"]')) {
      this.openAddUserModal();
      return;
    }

    if (target.closest('[data-action="closeAddUserModal"]')) {
      this.closeAddUserModal();
      return;
    }

    if (target.id === "addUserModal") {
      this.closeAddUserModal();
      return;
    }

    if (target.closest('[data-action="removeUser"]')) {
      const userId = target.getAttribute("data-user-id");
      if (userId) {
        this.handleRemoveUser(userId);
      }
      return;
    }

    if (target.closest('[data-action="selectUser"]')) {
      const userId = target.getAttribute("data-user-id");
      if (userId) {
        this.handleSelectUser(userId);
      }
      return;
    }

    if (target.classList.contains("send-button")) {
      const messageInput = target.parentElement?.querySelector(
        'input[name="message"]'
      ) as HTMLInputElement;
      if (messageInput && messageInput.value.trim()) {
        this.handleMessageSend(messageInput.value.trim());
        messageInput.value = "";
      }
    }
  }

  private async logout() {
    try {
      await chatAPI.logout();
    } catch {
      void 0;
    } finally {
      if ((window as any).router) {
        (window as any).router.navigate("/");
      } else {
        window.location.href = "/";
      }
    }
  }

  private backToChats() {
    const chatList = document.getElementById("chatList");
    const chatConversation = document.getElementById("chatConversation");
    
    if (chatList && chatConversation) {
      chatList.classList.remove("mobile-hidden");
      chatConversation.classList.add("mobile-hidden");
    }
  }

  private handleSubmit(e: Event) {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    if (target.classList.contains("message-form")) {
      const messageInput = target.querySelector(
        'input[name="message"]'
      ) as HTMLInputElement;
      if (messageInput) {
        this.handleMessageSend(messageInput.value);
        messageInput.value = "";
      }
    } else if (target.id === "createChatForm") {
      this.handleCreateChatSubmit(e);
    } else if (target.id === "searchUserForm") {
      this.handleSearchUser(e);
    } else if (target.id === "addUserForm") {
      this.handleAddUser(e);
    }
  }

  private async handleChatSelect(chatId: string, e: Event) {
    e.preventDefault();
    `Выбран чат: ${chatId}`;

    if (this.activeChatId === chatId) {
      return;
    }

    if (this.activeChatId && this.activeChatId !== chatId) {
      webSocketService.disconnect();
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    this.activeChatId = chatId;
    
    this.messages = [];

    const chatList = document.getElementById("chatList");
    const chatConversation = document.getElementById("chatConversation");
    
    if (chatList && chatConversation) {
      chatList.classList.add("mobile-hidden");
      chatConversation.classList.remove("mobile-hidden");
    }

    await this.loadMessagesForChat(chatId);

    await this.connectToWebSocket(chatId);

    this.updateConversation();

    this.forceRender();
  }

  private async handleChatDelete(chatId: string) {
    `Удаляем чат: ${chatId}`;

    try {
      await chatAPI.deleteChat(chatId);

      if (this.activeChatId === chatId) {
        webSocketService.disconnect();
        this.activeChatId = null;
        this.messages = [];
        
        const chatList = document.getElementById("chatList");
        const chatConversation = document.getElementById("chatConversation");
        if (chatList && chatConversation) {
          chatList.classList.remove("mobile-hidden");
          chatConversation.classList.add("mobile-hidden");
        }
      }

      this.chats = this.chats.filter((chat) => chat.id !== chatId);

      await this.loadChatsFromAPI();

      this.initializeChatItems();
      this.updateConversation();

      this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
    } catch (error: any) {
      const errorMessage = error?.message || "Ошибка при удалении чата";
      alert(errorMessage);
    }
  }

  private async handleMessageSend(message: string) {
    if (!this.activeChatId) {
      return;
    }

    if (!this.validateMessage(message)) {
      return;
    }

    try {
      if (webSocketService.isConnected()) {
        const currentChatId = webSocketService.getCurrentChatId();
        if (currentChatId !== this.activeChatId) {
          await this.connectToWebSocket(this.activeChatId);
        }
        
        webSocketService.sendMessage(message);

        const activeChat = this.chats.find(
          (chat) => chat.id === this.activeChatId
        );
        if (activeChat) {
          activeChat.preview = message;
          activeChat.time = new Date().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      } else {
        try {
          await chatAPI.sendMessage(this.activeChatId, message);
          await this.loadMessagesForChat(this.activeChatId);
        } catch (error: any) {
          if (error?.status === 404) {
            const newMessage: ChatMessage = {
              id: Date.now().toString(),
              type: "sent",
              content: message,
              time: new Date().toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              chatId: this.activeChatId,
            };
            this.messages.push(newMessage);
            this.updateConversation();
            this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
            this.scrollToBottom();
          } else {
            throw error;
          }
        }
      }
    } catch {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "sent",
        content: message,
        time: new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        chatId: this.activeChatId,
      };

      this.messages.push(newMessage);
      this.updateConversation();
      this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
      this.scrollToBottom();
    }
  }

  private handleMessageInput(_event: Event) {
  }

  private handleKeypress(event: KeyboardEvent) {
    if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
      const input = event.target as HTMLInputElement;
      if (input.name === "message") {
        if (event.shiftKey) {
          return;
        }
        if (input.value.trim()) {
        event.preventDefault();
        this.handleMessageSend(input.value.trim());
        input.value = "";
        }
      }
    }
  }

  private openCreateChatModal() {
    const modal = document.getElementById("createChatModal");
    if (modal) {
      modal.classList.add("show");
      document.body.style.overflow = "hidden";

      const input = modal.querySelector("#chatTitle");
      if (input instanceof HTMLInputElement) {
        setTimeout(() => input.focus(), 100);
      }
    }
  }

  private closeCreateChatModal() {
    const modal = document.getElementById("createChatModal");
    if (modal) {
      modal.classList.remove("show");
      document.body.style.overflow = "";

      const form = modal.querySelector("#createChatForm");
      if (form instanceof HTMLFormElement) {
        form.reset();
      }
    }
  }

  private async handleCreateChatSubmit(event: Event) {
    event.preventDefault();
    if (!(event.target instanceof HTMLFormElement)) {
      return;
    }
    const form = event.target;
    const formData = new FormData(form);
    const title = formData.get("chatTitle") as string;

    if (!title || title.trim() === "") {
      return;
    }

    try {
      const result = await chatAPI.createChat(title.trim());
      
      if (result && result.id) {
        this.closeCreateChatModal();
        form.reset();
        
        await this.loadChatsFromAPI();
        
        const newChatId = result.id.toString();
        this.activeChatId = newChatId;
        await this.loadMessagesForChat(newChatId);
        await this.connectToWebSocket(newChatId);
        
        this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
      }
    } catch (error: any) {
      if (error?.status === 401) {
        (window as any).router?.navigate("/");
      } else if (error?.status === 400) {
        const errorElement = form.querySelector(".input-error");
        if (errorElement instanceof HTMLElement) {
          errorElement.textContent = "Некорректное название чата";
        }
      }
    }
  }

  private validateMessage(message: string): boolean {
    const errors = Validator.validateField("message", message);
    return errors.length === 0;
  }

  private updateConversation() {
    if (this.activeChatId) {
      const activeChat = this.chats.find(
        (chat) => chat.id === this.activeChatId
      );

      if (activeChat) {
        this.children.conversationHeader = new ConversationHeader({
          name: activeChat.name,
          avatar: activeChat.avatar,
          status: activeChat.status || "online",
        });
      }
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.getElementById("messagesContainer");
      if (container) {
        container.scrollTop = container.scrollHeight;
    }
    }, 100);
  }

  private forceRender() {
    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
  }

  private static getMockChats(): Chat[] {
    return [
      {
        id: "1",
        name: "Анна Петрова",
        avatar: "/avatars/anna.jpg",
        preview: "Привет! Когда встретимся?",
        time: "15:30",
        unreadCount: 2,
        status: "online",
      },
      {
        id: "2",
        name: "Алексей Смирнов",
        avatar: "/avatars/alexey.jpg",
        preview: "Проект готов к сдаче",
        time: "14:20",
        unreadCount: 0,
        status: "offline",
      },
      {
        id: "3",
        name: "Мария Козлова",
        avatar: "/avatars/maria.jpg",
        preview: "Спасибо за помощь!",
        time: "12:45",
        unreadCount: 1,
        status: "online",
      },
    ];
  }

  private getMockMessages(chatId: string): ChatMessage[] {
    const messagesByChat: Record<string, ChatMessage[]> = {
      "1": [
        {
          id: "1",
          type: "received",
          content: "Привет! Как продвигается проект?",
          time: "12:30",
          chatId: "1",
          senderName: "Анна Петрова",
        },
        {
          id: "2",
          type: "sent",
          content: "Привет! Проект почти готов, осталось немного доработать",
          time: "12:32",
          chatId: "1",
        },
        {
          id: "3",
          type: "received",
          content: "Отлично! Когда встретимся?",
          time: "12:35",
          chatId: "1",
          senderName: "Анна Петрова",
        },
      ],
      "2": [
        {
          id: "4",
          type: "sent",
          content: "Проект готов к сдаче",
          time: "14:20",
          chatId: "2",
        },
        {
          id: "5",
          type: "received",
          content: "Проверим и дадим обратную связь",
          time: "14:25",
          chatId: "2",
          senderName: "Алексей Смирнов",
        },
      ],
      "3": [
        {
          id: "6",
          type: "received",
          content: "Спасибо за помощь с кодом!",
          time: "12:45",
          chatId: "3",
          senderName: "Мария Козлова",
        },
      ],
    };

    return messagesByChat[chatId] || [];
  }

  protected render() {
    const chats = this.chats || [];
    const activeChatId = this.activeChatId || "";
    const messages = this.messages || [];
    const activeChat =
      activeChatId
        ? chats.find(
        (chat) =>
          chat.id === activeChatId || chat.id === activeChatId.toString()
          ) || undefined
        : undefined;

    return this.compile(chatTemplate, {
      chats,
      activeChatId,
      activeChat,
      messages,
      ...this.children,
    });
  }


  private openUserManagementModal() {
    const modal = document.getElementById("userManagementModal");
    if (modal) {
      modal.classList.add("show");
      document.body.style.overflow = "hidden";
      this.loadChatParticipants();

      modal.addEventListener("click", this.modalClickHandler);
    }
  }

  private closeUserManagementModal() {
    const modal = document.getElementById("userManagementModal");
    if (modal) {
      modal.classList.remove("show");
      document.body.style.overflow = "auto";

      modal.removeEventListener("click", this.modalClickHandler);
    }
  }

  private openAddUserModal() {
    const modal = document.getElementById("addUserModal");
    if (modal) {
      modal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  }

  private closeAddUserModal() {
    const modal = document.getElementById("addUserModal");
    if (modal) {
      modal.classList.remove("show");
      document.body.style.overflow = "auto";
    }
  }

  private async loadChatParticipants() {
    if (!this.activeChatId) return;

    try {
      const participants = await chatAPI.getChatUsers(this.activeChatId);
      this.updateParticipantsList(participants);
    } catch (error: any) {
      if (error?.status === 404 || error?.status === 400) {
        this.updateParticipantsList([]);
      } else {
        this.updateParticipantsList([]);
      }
    }
  }

  private updateParticipantsList(participants: any[]) {
    const participantsList = document.getElementById("participantsList");
    if (participantsList) {
      participantsList.innerHTML = participants
        .map(
          (participant) => `
        <div class="participant-item">
          <div class="participant-info">
            <span class="participant-name">${participant.first_name} ${participant.second_name}</span>
            <span class="participant-login">@${participant.login}</span>
          </div>
          <button class="btn btn--danger" data-action="removeUser" data-user-id="${participant.id}">
            Удалить
          </button>
        </div>
      `
        )
        .join("");
    }
  }

  private async handleSearchUser(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const login = formData.get("userLogin") as string;

    if (!login || login.trim() === "") {
      return;
    }

    try {
      const users = await chatAPI.searchUsers(login.trim());
      this.updateSearchResults(users);
    } catch {
      ("Ошибка поиска пользователей");
    }
  }

  private updateSearchResults(users: any[]) {
    const searchResults = document.getElementById("searchResults");
    if (searchResults) {
      searchResults.innerHTML = users
        .map(
          (user) => `
        <div class="search-result-item">
          <div class="user-info">
            <span class="user-name">${user.first_name} ${user.second_name}</span>
            <span class="user-login">@${user.login}</span>
          </div>
          <button class="btn btn--secondary" data-action="selectUser" data-user-id="${user.id}">
            <svg class="icon icon--plus" viewBox="0 0 24 24" width="16" height="16">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
            </svg>
            Добавить
          </button>
        </div>
      `
        )
        .join("");
    }
  }

  private selectedUsers: any[] = [];

  private handleSelectUser(userId: string) {
    const searchResults = document.getElementById("searchResults");
    const userElement = searchResults?.querySelector(
      `[data-user-id="${userId}"]`
    );

    if (userElement) {
      const userInfo = userElement.querySelector(".user-info");
      const userName = userInfo?.querySelector(".user-name")?.textContent || "";
      const userLogin =
        userInfo?.querySelector(".user-login")?.textContent || "";

      const user = {
        id: userId,
        name: userName,
        login: userLogin,
      };

      if (!this.selectedUsers.find((u) => u.id === userId)) {
        this.selectedUsers.push(user);
        this.updateSelectedUsersList();
        this.showAddUserForm();
      }
    }
  }

  private updateSelectedUsersList() {
    const selectedUsersList = document.getElementById("selectedUsersList");
    if (selectedUsersList) {
      selectedUsersList.innerHTML = this.selectedUsers
        .map(
          (user) => `
        <div class="selected-user-item">
          <span>${user.name} (${user.login})</span>
          <input type="hidden" name="selectedUsers" value="${user.id}">
          <button type="button" class="btn btn--danger" onclick="this.parentElement.remove(); this.selectedUsers = this.selectedUsers.filter(u => u.id !== '${user.id}');">
            <svg class="icon icon--close" viewBox="0 0 24 24" width="16" height="16">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg>
            Удалить
          </button>
        </div>
      `
        )
        .join("");
    }
  }

  private showAddUserForm() {
    const addUserForm = document.getElementById("addUserForm");
    if (addUserForm) {
      addUserForm.style.display = "block";
    }
  }

  private async handleAddUser(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const userIds = formData.getAll("selectedUsers") as string[];

    if (!this.activeChatId || userIds.length === 0) {
      return;
    }

    try {
      await chatAPI.addUsersToChat(
        this.activeChatId,
        userIds.map((id) => parseInt(id))
      );
      this.closeAddUserModal();
      this.loadChatParticipants();
      this.selectedUsers = [];
    } catch (error: any) {
      const errorMessage = error?.message || "Ошибка добавления пользователей";
      alert(errorMessage);
    }
  }

  private handleModalClick(e: Event) {
    if (!(e.target instanceof HTMLElement)) {
      return;
    }
    const target = e.target;

    if (target.closest('[data-action="removeUser"]')) {
      const userId = target.getAttribute("data-user-id");
      if (userId) {
        this.handleRemoveUser(userId);
      }
      return;
    }

    if (target.closest('[data-action="selectUser"]')) {
      const userId = target.getAttribute("data-user-id");
      if (userId) {
        this.handleSelectUser(userId);
      }
      return;
    }
  }

  private async handleRemoveUser(userId: string) {
    if (!this.activeChatId) return;

    if (
      !window.confirm(
        "Вы уверены, что хотите удалить этого пользователя из чата?"
      )
    ) {
      return;
    }

    try {
      await chatAPI.removeUsersFromChat(this.activeChatId, [parseInt(userId)]);
      this.loadChatParticipants();
      ("Пользователь удален из чата");
    } catch {
      ("Ошибка удаления пользователя");
    }
  }
}

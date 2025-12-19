export const homeTemplate = `
<div class="home-page">
  <main class="home-container">
    <div class="home-header">
      <h1 class="home-title">{{title}}</h1>
      <p class="home-subtitle">{{subtitle}}</p>
    </div>

    <div class="home-content">
      <div class="terminal-window">
        <div class="terminal-header">
          <div class="terminal-buttons">
            <span class="terminal-btn terminal-btn--red"></span>
            <span class="terminal-btn terminal-btn--yellow"></span>
            <span class="terminal-btn terminal-btn--green"></span>
          </div>
          <span class="terminal-title">system_terminal</span>
        </div>
        <div class="terminal-body">
          <p class="terminal-line">> <span class="blink">_</span></p>
          <p class="terminal-line">> Инициализация системы...</p>
          <p class="terminal-line">
            > Статус: <span class="text-success">ONLINE</span>
          </p>
          <p class="terminal-line">
            > Введите <span class="text-command">help</span> для списка команд
          </p>
        </div>
      </div>

      <div class="home-links">
        {{> linkCard
          title="Вход в систему"
          description="Авторизация пользователя"
          icon="login"
          accent="blue"
          url="/"
        }}

        {{> linkCard
          title="Регистрация"
          description="Создание нового аккаунта"
          icon="user-add"
          accent="pink"
          url="/sign-up"
        }}

        {{> linkCard
          title="Настройки"
          description="Управление профилем"
          icon="profile"
          accent="purple"
          url="/settings"
        }}

        {{> linkCard
          title="Тест 404"
          description="Демо страницы ошибки"
          icon="bug"
          accent="orange"
          url="/404"
        }}

        {{> linkCard
          title="Тест 500"
          description="Демо ошибки сервера"
          icon="server"
          accent="red"
          url="/500"
        }}

        {{> linkCard
          title="Мессенджер"
          description="Перейти к перепискам"
          icon="message"
          accent="green"
          url="/messenger"
        }}
      </div>
    </div>

    <footer class="home-footer">
      <p class="copyright">Messenger © {{currentYear}}</p>
    </footer>
  </main>
</div>
`;

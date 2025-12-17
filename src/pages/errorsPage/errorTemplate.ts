export const errorTemplate = `
<!-- Сканирующая линия -->
<div class="scanline"></div>

<!-- Кот-хакер -->
<div class="hacker-cat">
  <pre class="cat-code">
    {{#if is404}}
      /\\_/\\
     ( o.o )
      > ^ >
    {{else}}
      /\\_/\\
     ( x.x )
      > ‹ >
    {{/if}}
  </pre>
  <div class="cat-terminal">
    > {{#if is404}}sudo rm -rf 404{{else}}sudo reboot server{{/if}} <span class="blink">_</span>
  </div>
</div>

<main class="error-container">
  <div class="error-content">
    <!-- Анимированные цифры -->
    <div class="error-code">
      {{#if is404}}
        <span class="digit" style="color: #ff2a6d;">4</span>
        <span class="digit" style="color: #9d00ff;">0</span>
        <span class="digit" style="color: #0ff0fc;">4</span>
      {{else}}
        <span class="digit" style="color: #ff3860;">5</span>
        <span class="digit" style="color: #ff2a6d;">0</span>
        <span class="digit" style="color: #ff5f56;">0</span>
      {{/if}}
    </div>

    <!-- Рандомный заголовок -->
    <h1 class="error-title" id="random-title">{{title}}</h1>

    <!-- Рандомное сообщение -->
    <div class="error-message">
      <p id="random-message">{{message}}</p>
    </div>

    <!-- Кнопки действий -->
    <div class="error-actions">
      <a href="/home" class="home-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#0ff0fc">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/>
        </svg>
        {{#if is404}}ВЕРНУТЬСЯ НА БАЗУ{{else}}НА ГЛАВНУЮ{{/if}}
      </a>

      {{#if is500}}
        <button id="reload-button" class="home-button" style="background: rgba(255, 42, 109, 0.1); border-color: #ff2a6d;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff2a6d;">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          ПОВТОРИТЬ
        </button>
      {{/if}}
    </div>

    <!-- Терминал с диагностикой -->
    <div class="error-terminal" {{#if is500}}style="border-color: #ff3860;"{{/if}}>
      {{#if is404}}
        <div class="terminal-line">> <span style="color: #ff2a6d;">ERROR:</span> Путь не найден</div>
        <div class="terminal-line">> <span style="color: #ffbd2e;">WARNING:</span> Кот-хакер замечен в системе</div>
        <div class="terminal-line">> <span style="color: #0ff0fc;">TIP:</span> Проверьте URL или спросите кота</div>
      {{else}}
        <div class="terminal-line">> <span style="color: #ff3860;">CRITICAL ERROR:</span> Сервер не отвечает</div>
        <div class="terminal-line">> <span style="color: #ffbd2e;">LAST ACTION:</span> Попытка загрузить кофе</div>
        <div class="terminal-line">> <span style="color: #0ff0fc;">STATUS:</span> Инженеры в пути</div>
      {{/if}}
    </div>
  </div>
</main>
`;


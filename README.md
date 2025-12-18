## Messenger

Учебный проект-мессенджер (Sprint 3, Яндекс.Практикум). Реализованы роутинг, авторизация, работа с REST API чата и пользователей, обмен real-time сообщениями через WebSocket. Сборка — Vite + TypeScript.

### Функциональность
- **Роутинг**: `/` (логин), `/sign-up` (регистрация), `/settings` (профиль), `/messenger` (чаты)
- **Авторизация**: регистрация, вход, выход
- **Профиль**: загрузка данных, редактирование, смена пароля, загрузка аватара
- **Чаты**: список чатов, создание/удаление, добавление/удаление пользователей, список участников
- **Сообщения**: получение токена и подключение WebSocket, отправка/получение сообщений

### Технологии
- **Vite** (сборщик)
- **TypeScript**
- **Handlebars** (шаблоны)
- **Sass (SCSS)** (стили)
- **WebSocket** (real-time сообщения)
- **REST API** (XMLHttpRequest wrapper в `src/services/HttpClient.ts`)

### Запуск проекта

Установка зависимостей:
```bash
npm install
```

Запуск dev-сервера:
```bash
npm run dev
```

Откройте URL, который выведет Vite (например `http://localhost:3000/`).

Сборка для production:
```bash
npm run build
```

Предпросмотр production сборки:
```bash
npm run preview
```

### Важно про API и cookies
API Яндекс.Практикума использует cookie-сессию (а не токен). Для корректной авторизации в dev включён **proxy** в `vite.config.js`, поэтому API вызывается через `/api/v2/...` и работает на localhost без ручной чистки cookies.

### Что сделано (Sprint 3)
-  Реализован роутинг с поддержкой всех страниц и защитой маршрутов
-  Полная авторизация (регистрация, вход, выход) с обработкой ошибок
-  Управление чатами (создание, удаление, список участников)
-  Real-time сообщения через WebSocket
-  Адаптивный дизайн для desktop, tablet и mobile
-  Интеграция с API Яндекс.Практикума

### Структура проекта

```
middle.messenger.praktikum.yandex/
├── public/
│   ├── _redirects          # Netlify SPA routing
│   └── favicon.ico
├── scripts/
│   └── handlebars-helpers.js  # Handlebars helpers
├── src/
│   ├── components/         # UI компоненты
│   │   ├── Button/
│   │   ├── chatItem/
│   │   ├── conversationHeader/
│   │   ├── formInput/
│   │   ├── formInputGroup/
│   │   ├── icon/
│   │   ├── linkCard/
│   │   ├── message/
│   │   └── messageInput/
│   ├── pages/              # Страницы приложения
│   │   ├── chat/           # Страница чата
│   │   ├── errorsPage/     # Страницы ошибок (404, 500)
│   │   ├── homePage/       # Главная страница
│   │   ├── login/          # Страница входа
│   │   ├── profile/        # Страница профиля
│   │   ├── registration/   # Страница регистрации
│   │   └── utils.scss      # Утилиты стилей (переменные, миксины)
│   ├── partials/           # Стили для компонентов
│   │   └── styles/         # SCSS файлы для компонентов
│   ├── services/           # Сервисы и утилиты
│   │   ├── api.ts          # API клиент
│   │   ├── Block.ts        # Базовый класс компонентов
│   │   ├── EventBus.ts     # Event bus
│   │   ├── HttpClient.ts   # HTTP клиент
│   │   ├── render.ts       # Утилита рендеринга
│   │   ├── Router.ts       # Роутер
│   │   ├── Validator.ts    # Валидатор форм
│   │   └── WebSocketService.ts  # WebSocket сервис
│   ├── index.html          # Главный HTML файл
│   ├── main.ts             # Точка входа
│   └── style.scss          # Глобальные стили
├── .gitignore
├── eslint.config.js        # ESLint конфигурация
├── netlify.toml            # Netlify конфигурация
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json           # TypeScript конфигурация
└── vite.config.js          # Vite конфигурация
```

### Деплой
Проект готов к деплою на Netlify. Файл `public/_redirects` настроен для корректной работы SPA.

**Демо**: [https://middle-messenger-sprint3.netlify.app](https://middle-messenger-sprint3.netlify.app)

---
**Модуль**: Middle Frontend Developer (Яндекс.Практикум)

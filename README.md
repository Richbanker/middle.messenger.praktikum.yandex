## Messenger

Учебный проект-мессенджер (Sprint 4, Яндекс.Практикум). Реализованы роутинг, авторизация, работа с REST API чата и пользователей, обмен real-time сообщениями через WebSocket. Сборка — Vite + TypeScript. Тестирование — Mocha + Chai.

### Функциональность

**Авторизация и профиль:**
- Регистрация нового пользователя
- Вход в систему
- Выход из системы
- Просмотр и редактирование профиля
- Смена пароля
- Загрузка аватара

**Чаты:**
- Просмотр списка чатов
- Создание нового чата
- Удаление чата
- Добавление пользователей в чат
- Удаление пользователей из чата
- Просмотр списка участников чата

**Сообщения:**
- Получение токена для WebSocket
- Подключение к WebSocket серверу
- Отправка сообщений в реальном времени
- Получение сообщений в реальном времени
- Отображение истории сообщений

**Роутинг:**
- `/` — страница входа
- `/sign-up` — страница регистрации
- `/settings` — страница профиля
- `/messenger` — страница чатов
- Защита маршрутов (требуется авторизация)
- Автоматическое перенаправление при отсутствии авторизации

### Технологический стек

**Сборка и разработка:**
- **Vite** (6.4.1) — сборщик и dev-сервер
- **TypeScript** (5.9.2) — типизация
- **Handlebars** — шаблонизация (vite-plugin-handlebars)
- **Sass (SCSS)** — стилизация

**Архитектура:**
- **Компонентный подход** — собственный фреймворк на базе класса `Block`
- **Роутинг** — собственный роутер с поддержкой защищенных маршрутов
- **REST API** — HTTP клиент (`HTTPTransport`) на базе XMLHttpRequest
- **WebSocket** — real-time сообщения

**Качество кода:**
- **ESLint** (9.36.0) — линтер JavaScript/TypeScript
- **Stylelint** (16.24.0) — линтер стилей
- **vite-plugin-checker** — проверка TypeScript, ESLint и Stylelint во время сборки
- **TypeScript strict mode** — строгая типизация

**Тестирование:**
- **Mocha** (11.7.5) — тестовый фреймворк
- **Chai** (6.2.2) — библиотека assertions
- **jsdom** (27.3.0) — эмуляция DOM для тестов
- **ts-node** (10.9.2) — запуск TypeScript тестов

**Дополнительно:**
- **vite-plugin-build-info** — собственный плагин для генерации информации о сборке

### Требования

- **Node.js** >= 18.16.1
- **npm** (или другой менеджер пакетов)

### Установка

```bash
npm install
```

### Команды

#### Разработка

**Запуск dev-сервера:**
```bash
npm run dev
```

Dev-сервер запустится на `http://localhost:3000/` с автоматическим открытием в браузере.

**Предпросмотр production сборки:**
```bash
npm run preview
```

Запускает предпросмотр на порту 3000.

#### Сборка

**Сборка для production:**
```bash
npm run build
```

Создает оптимизированную сборку в папке `dist/`. Во время сборки выполняются проверки:
- TypeScript type checking
- ESLint проверка кода
- Stylelint проверка стилей

При ошибках Stylelint сборка прерывается. При ошибках ESLint сборка продолжается (можно настроить).

**Полная проверка и сборка:**
```bash
npm run check
```

Выполняет линтинг, проверку стилей и сборку последовательно.

#### Тестирование

**Запуск всех тестов:**
```bash
npm test
```

**Запуск тестов в режиме наблюдения:**
```bash
npm run test:watch
```

Тесты размещаются рядом с исходным кодом (co-located):
- `src/core/Block.test.ts`
- `src/services/Router.test.ts`
- `src/services/HTTPTransport.test.ts`
- `src/utils/template.test.ts`

#### Линтинг и проверка стилей

**Проверка кода (ESLint):**
```bash
npm run lint
```

**Автоисправление ошибок ESLint:**
```bash
npm run lint:fix
```

**Проверка стилей (Stylelint):**
```bash
npm run lint:styles
```

**Автоисправление ошибок Stylelint:**
```bash
npm run lint:styles:fix
```

**Проверка кода и стилей:**
```bash
npm run lint:all
```

**TypeScript проверка:**
TypeScript проверка выполняется автоматически через `vite-plugin-checker` во время сборки и в dev-режиме.

### Важно про API и cookies

API Яндекс.Практикума использует cookie-сессию (а не токен). Для корректной авторизации в dev включён **proxy** в `vite.config.ts`, поэтому API вызывается через `/api/v2/...` и работает на localhost без ручной чистки cookies.

### Что сделано

**Sprint 3:**
- Реализован роутинг с поддержкой всех страниц и защитой маршрутов
- Полная авторизация (регистрация, вход, выход) с обработкой ошибок
- Управление чатами (создание, удаление, список участников)
- Real-time сообщения через WebSocket
- Адаптивный дизайн для desktop, tablet и mobile
- Интеграция с API Яндекс.Практикума

**Sprint 4:**
- Настроена тестовая инфраструктура (Mocha + Chai + TypeScript)
- Тесты размещаются рядом с исходным кодом (co-located)
- Поддержка DOM в тестах через jsdom
- Написаны тесты для 4 модулей: шаблонизатор, Block, Router, HTTPTransport
- Настроены скрипты для запуска тестов (`npm test`, `npm run test:watch`)
- Обновлены зависимости и устранены уязвимости безопасности
- Настроен `vite-plugin-checker` для проверки TypeScript, ESLint и Stylelint во время сборки
- Создан собственный плагин `vite-plugin-build-info` для генерации информации о сборке

### Структура проекта

```
middle.messenger.praktikum.yandex/
├── build/
│   └── plugins/
│       └── vite-plugin-build-info.ts  # Собственный Vite плагин
├── public/
│   ├── _redirects          # Netlify SPA routing
│   └── favicon.ico
├── scripts/
│   └── handlebars-helpers.js  # Handlebars helpers
├── src/
│   ├── components/         # UI компоненты
│   │   ├── Button/
│   │   ├── ChatItem/
│   │   ├── conversationHeader/
│   │   ├── Form/
│   │   ├── formInput/
│   │   ├── formInputGroup/
│   │   ├── icon/
│   │   ├── Input/
│   │   ├── linkCard/
│   │   ├── Message/
│   │   ├── MessageInput/
│   │   └── MessageList/
│   ├── core/               # Базовые классы и утилиты
│   │   ├── Block.ts        # Базовый класс компонентов
│   │   ├── Block.test.ts   # Тесты для Block
│   │   ├── EventBus.ts     # Event bus
│   │   └── nanoid.ts       # Генератор уникальных ID
│   ├── pages/              # Страницы приложения
│   │   ├── chat/           # Страница чата
│   │   ├── Chats/          # Страница списка чатов
│   │   ├── errorsPage/     # Страницы ошибок (404, 500)
│   │   ├── homePage/       # Главная страница
│   │   ├── Login/          # Страница входа
│   │   ├── Profile/        # Страница профиля
│   │   ├── registration/   # Страница регистрации
│   │   └── utils.scss      # Утилиты стилей
│   ├── services/           # Сервисы и утилиты
│   │   ├── api.ts          # API клиент
│   │   ├── HTTPTransport.ts # HTTP клиент
│   │   ├── HTTPTransport.test.ts # Тесты для HTTPTransport
│   │   ├── Router.ts       # Роутер
│   │   ├── Router.test.ts  # Тесты для Router
│   │   ├── Routes.ts       # Константы маршрутов
│   │   ├── render.ts       # Утилита рендеринга
│   │   ├── Validator.ts    # Валидатор форм
│   │   └── WebSocketService.ts  # WebSocket сервис
│   ├── utils/              # Утилиты
│   │   ├── template.ts     # Шаблонизатор
│   │   └── template.test.ts # Тесты для шаблонизатора
│   ├── index.html          # Главный HTML файл
│   ├── main.ts             # Точка входа
│   └── style.scss          # Глобальные стили
├── test/                   # Тестовая инфраструктура
│   └── setup.ts            # Настройка jsdom для тестов
├── .eslintrc.cjs           # Конфигурация ESLint
├── .mocharc.json           # Конфигурация Mocha
├── .stylelintrc.json       # Конфигурация Stylelint
├── netlify.toml            # Netlify конфигурация
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json           # TypeScript конфигурация
└── vite.config.ts          # Vite конфигурация
```

### Тестирование

Тесты написаны с использованием **Mocha** и **Chai**, размещаются рядом с исходным кодом (co-located).

**Покрытие тестами:**
- Шаблонизатор (`template.ts`) — 18 тестов
- Базовый компонент (`Block.ts`) — 18 тестов
- Роутер (`Router.ts`) — 9 тестов
- HTTP клиент (`HTTPTransport.ts`) — 29 тестов

**Всего: 74 теста**

**Настройка:**
- Конфигурация Mocha: `.mocharc.json`
- Настройка DOM окружения: `test/setup.ts` (jsdom)
- TypeScript поддержка через `ts-node/esm`

### Проверка качества кода

**Во время разработки:**
При запуске `npm run dev` автоматически выполняются проверки через `vite-plugin-checker`:
- TypeScript type checking
- ESLint (ошибки и предупреждения)
- Stylelint (ошибки и предупреждения)

**Во время сборки:**
При запуске `npm run build` выполняются те же проверки:
- TypeScript — сборка прерывается при ошибках
- ESLint — сборка продолжается (настраивается)
- Stylelint — сборка прерывается при ошибках

### Собственный Vite плагин

Реализован плагин `vite-plugin-build-info`, который создает файл `dist/build-info.json` с информацией о сборке:
- Версия из `package.json`
- Время сборки
- Режим сборки (development/production)
- Git commit hash (если доступно)
- Git branch (если доступно)

### Деплой

Проект готов к деплою на Netlify. Файл `public/_redirects` настроен для корректной работы SPA.

**Демо**: [https://middle-messenger-sprint3.netlify.app](https://middle-messenger-sprint3.netlify.app)

---
**Модуль**: Middle Frontend Developer (Яндекс.Практикум)

# Sprint 3

Учебное приложение-мессенджер на React, TypeScript и Vite для практики роутинга, интеграции API Яндекс.Практикума и realtime сообщений через WebSocket.

## Возможности

- Маршруты: `/` (логин), `/sign-up`, `/settings`, `/messenger`, `/404`.
- Авторизация/регистрация (API Практикума), автоподтягивание пользователя по cookie.
- Профиль: обновление данных, пароля, аватара.
- Чаты: список, создание/удаление, добавление/удаление пользователей.
- WebSocket: история сообщений + лайв-сообщения с пингом.
- Защитные заголовки (CSP и др.) при выдаче статики через Express.
- Собственные структуры данных: bubbleSort, Stack, Queue.

## Стек

- Vite + TypeScript
- Собственный шаблонизатор на Block/EventBus
- Собственный Router (router.go)
- HTTP API Яндекс Практикума + WebSocket
- ESLint (flat config) + Prettier + Husky

## Скрипты

- `npm run dev` — локальная разработка.
- `npm run build` — production-сборка.
- `npm run preview` — предпросмотр сборки.
- `npm run lint` — проверка ESLint.
- `npm run typecheck` — проверка типов.
- `npm run format` — проверка формата Prettier.
- `npm run serve` — раздача статики из `dist` через Express с CSP.

## API

- База: `https://ya-praktikum.tech/api/v2` (Swagger: https://ya-praktikum.tech/api/v2/swagger/#/).
- Auth: `/auth/signin`, `/auth/signup`, `/auth/logout`, `/auth/user`.
- User: `/user/profile`, `/user/password`, `/user/profile/avatar`, `/user/search`.
- Chats: `/chats`, `/chats/:id/users`, `/chats/users` (add/remove), `/chats/token/:id`.
- WebSocket: `wss://ya-praktikum.tech/ws/chats/{userId}/{chatId}/{token}`.

## Запуск

```bash
npm install
npm run dev
```

Сборка и предпросмотр: `npm run build` → `npm run preview`.

Выдача статики с CSP: `npm run build` → `npm run serve` (Express раздаёт `dist/`).

## Деплой на Netlify

- Сборка: `npm run build`
- Директория деплоя: `dist`
- Node 18+; при необходимости добавить заголовки CSP на стороне Netlify (или использовать готовый Express при self-hosted).


# Middle Messenger — Sprint 1

Минимальный прототип мессенджера. Сборка выполнена с помощью Vite, шаблоны созданы на Handlebars, стили собраны через PostCSS. Навигация между страницами осуществляется с помощью ссылок.

## Стек технологий
- Vite  
- Handlebars  
- PostCSS (autoprefixer)  
- Node.js 18.19.0  

## Скрипты
- `npm install` — установка зависимостей  
- `npm run start` — запуск локального сервера на порту 3000  
- `npm run build` — сборка проекта в папку dist  
- `npm run preview` — предпросмотр собранного проекта на порту 3000  

## Страницы
- `/auth.html` — авторизация  
- `/register.html` — регистрация  
- `/chats.html` — список чатов (заглушка)  
- `/profile.html` — профиль пользователя  
- `/404.html` — страница ошибки 404  
- `/500.html` — страница ошибки 500  

## Деплой
- Production: [https://middle-messenger-sprint1.netlify.app](https://middle-messenger-sprint1.netlify.app)  
- Build command: `npm run build`  
- Publish directory: `dist`  
- Node версия: `18`

## Прототипы
- Изображения макетов хранятся в папке `ui/`  
- Либо ссылка на макет в Figma  

## Структура проекта
src/
├── components/ # UI-компоненты (input, avatar, heading)
├── styles/ # Общие стили проекта
├── templates/ # Шаблоны страниц Handlebars
├── static/ # Папка для статики
├── main.ts # Точка входа

## Требования ТЗ
- Сборка через Vite  
- Порт разработки 3000  
- Папка dist добавлена в .gitignore  
- Используется шаблонизатор Handlebars  
- Проект разбит на модули и компоненты  
- Проект деплоится на Netlify  
- Запуск и сборка выполняются командами npm  
- Все страницы реализованы и связаны ссылками  
- Node версия не ниже 12  
- Ветка для проверки: `sprint_1`  
- Pull Request из `sprint_1` в `main` с названием “Sprint 1”

## Автор
Илья Гажиенко  
Frontend Developer  
[GitHub](https://github.com/Richbanker)

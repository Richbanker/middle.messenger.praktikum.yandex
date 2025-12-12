import { Block } from '@/core/Block';

const template = () => `
  <div class="card">
    <h1 class="title">Страница не найдена</h1>
    <p class="text-muted">Запрошенный маршрут отсутствует.</p>
    <a data-link href="/messenger" class="link">Вернуться в чаты</a>
  </div>
`;

export class NotFoundPage extends Block {
  protected render(): DocumentFragment {
    return this.compile(template, {});
  }
}

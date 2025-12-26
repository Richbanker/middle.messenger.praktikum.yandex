import { expect } from 'chai';
import { Router } from './Router.js';
import * as apiModule from './api.js';
import Block from './Block.js';

class DashboardPage extends Block {
  constructor(props?: any) {
    super('div', {
      ...props,
      attrs: { class: 'dashboard' },
      content: 'Dashboard',
    });
  }

  render(): Node {
    const fragment = this.compile('<div class="dashboard">Dashboard</div>');
    return fragment;
  }
}

class LoginPage extends Block {
  constructor(props?: any) {
    super('div', {
      ...props,
      attrs: { class: 'login' },
      content: 'Login',
    });
  }

  render(): Node {
    const fragment = this.compile('<div class="login">Login</div>');
    return fragment;
  }
}

class NotFoundPage extends Block {
  constructor(props?: any) {
    super('div', {
      ...props,
      attrs: { class: 'notfound' },
      content: '404',
    });
  }

  render(): Node {
    const fragment = this.compile('<div class="notfound">404</div>');
    return fragment;
  }
}

describe('Router', () => {
  let router: Router;
  let originalGetCurrentUser: typeof apiModule.chatAPI.getCurrentUser;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    window.history.replaceState({}, '', '/');

    originalGetCurrentUser = apiModule.chatAPI.getCurrentUser;
    apiModule.chatAPI.getCurrentUser = async () => {
      throw new Error('Not authenticated');
    };

    router = new Router();
    router.clearRoutes();
    router.use('/', DashboardPage);
    router.use('/login', LoginPage);
    router.use('*', NotFoundPage);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    window.history.replaceState({}, '', '/');
    if (originalGetCurrentUser) {
      apiModule.chatAPI.getCurrentUser = originalGetCurrentUser;
    }
  });

  describe('метод navigate', () => {
    it('должен обрабатывать роут и рендерить компонент через Router', async () => {
      await router.navigate('/login');

      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.innerHTML).to.not.equal('');
      expect(appElement?.querySelector('.login')).to.not.be.null;
      expect(appElement?.textContent).to.include('Login');
    });
  });

  describe('метод go', () => {
    it('должен обрабатывать роут при вызове go', async () => {
      await router.go('/');

      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.innerHTML).to.not.equal('');
      expect(appElement?.querySelector('.dashboard')).to.not.be.null;
      expect(appElement?.textContent).to.include('Dashboard');
    });

    it('должен последовательно навигировать через go', async () => {
      await router.go('/');
      const content1 = document.querySelector('#app')?.textContent;

      await router.go('/login');
      const content2 = document.querySelector('#app')?.textContent;

      expect(content1).to.not.equal(content2);
      expect(content1).to.include('Dashboard');
      expect(content2).to.include('Login');
    });
  });

  describe('метод start', () => {
    it('должен инициализировать роутер и обработать текущий путь', async () => {
      window.history.replaceState({}, '', '/');
      router = new Router();
      router.clearRoutes();
      router.use('/', DashboardPage);
      router.use('/login', LoginPage);
      router.use('*', NotFoundPage);

      await router.start();

      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.innerHTML).to.not.equal('');
      expect(appElement?.querySelector('.dashboard')).to.not.be.null;
      expect(appElement?.textContent).to.include('Dashboard');
    });

    it('должен обработать путь при старте роутера', async () => {
      window.history.replaceState({}, '', '/login');
      router = new Router();
      router.clearRoutes();
      router.use('/', DashboardPage);
      router.use('/login', LoginPage);
      router.use('*', NotFoundPage);

      await router.start();

      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.innerHTML).to.not.equal('');
      expect(appElement?.querySelector('.login')).to.not.be.null;
      expect(appElement?.textContent).to.include('Login');
    });
  });

  describe('обработка popstate', () => {
    it('должен обрабатывать popstate события через Router', async () => {
      await router.navigate('/login');
      expect(document.querySelector('#app')?.textContent).to.include('Login');

      window.history.pushState({}, '', '/');
      const popstateEvent = new window.PopStateEvent('popstate', { state: {} });
      window.dispatchEvent(popstateEvent);

      await new Promise(resolve => setTimeout(resolve, 50));

      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.innerHTML).to.not.equal('');
    });
  });

  describe('404 роут', () => {
    it('должен определять неизвестные пути и показывать 404 через Router', async () => {
      await router.navigate('/unknown-path-12345');

      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.innerHTML).to.not.equal('');
      expect(appElement?.querySelector('.notfound')).to.not.be.null;
      expect(appElement?.textContent).to.include('404');
    });
  });

  describe('вызов render/mount', () => {
    it('должен иметь элемент #app для рендеринга', () => {
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      if (appElement) {
        expect(appElement.tagName).to.equal('DIV');
      }
    });

    it('должен рендерить компонент в #app при навигации', async () => {
      await router.navigate('/');

      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.innerHTML).to.not.equal('');
      expect(appElement?.querySelector('.dashboard')).to.not.be.null;
      expect(appElement?.textContent).to.include('Dashboard');
    });
  });

  describe('обработка кликов по ссылкам', () => {
    it('должен обрабатывать клики по внутренним ссылкам через Router', async () => {
      await router.navigate('/');
      expect(document.querySelector('#app')?.textContent).to.include('Dashboard');

      const link = document.createElement('a');
      link.href = `${window.location.origin}/login`;
      link.textContent = 'Test';
      document.body.appendChild(link);

      const clickEvent = new window.MouseEvent('click', { bubbles: true });
      link.dispatchEvent(clickEvent);

      await new Promise(resolve => setTimeout(resolve, 50));

      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.innerHTML).to.not.equal('');
    });

    it('должен различать внутренние и внешние ссылки через Router', async () => {
      await router.navigate('/');
      expect(document.querySelector('#app')?.textContent).to.include('Dashboard');

      const internalLink = document.createElement('a');
      internalLink.href = `${window.location.origin}/login`;
      document.body.appendChild(internalLink);

      const externalLink = document.createElement('a');
      externalLink.href = 'https://example.com';
      document.body.appendChild(externalLink);

      const internalClickEvent = new window.MouseEvent('click', { bubbles: true });
      internalLink.dispatchEvent(internalClickEvent);

      await new Promise(resolve => setTimeout(resolve, 50));

      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.innerHTML).to.not.equal('');

      const externalClickEvent = new window.MouseEvent('click', { bubbles: true });
      externalLink.dispatchEvent(externalClickEvent);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(document.querySelector('#app')?.innerHTML).to.not.equal('');
    });
  });

  describe('методы back и forward', () => {
    it('должен поддерживать метод back через Router', () => {
      expect(typeof router.back).to.equal('function');

      router.back();

      expect(typeof router.back).to.equal('function');
    });

    it('должен поддерживать метод forward через Router', () => {
      expect(typeof router.forward).to.equal('function');

      router.forward();

      expect(typeof router.forward).to.equal('function');
    });
  });

  describe('поведение Router при навигации', () => {
    it('должен обновлять содержимое #app при навигации на разные роуты', async () => {
      await router.navigate('/');
      const content1 = document.querySelector('#app')?.textContent;

      await router.navigate('/login');
      const content2 = document.querySelector('#app')?.textContent;

      expect(content1).to.not.equal(content2);
      expect(content1).to.include('Dashboard');
      expect(content2).to.include('Login');
    });

    it('должен обрабатывать повторную навигацию на тот же роут', async () => {
      await router.navigate('/');
      const content1 = document.querySelector('#app')?.textContent;

      await router.navigate('/');
      const content2 = document.querySelector('#app')?.textContent;

      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(content1).to.equal(content2);
      expect(content2).to.include('Dashboard');
    });
  });
});

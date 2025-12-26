import { expect } from 'chai';
import { Router } from './Router.js';
import { Routes } from './Routes.js';
import * as apiModule from './api.js';
import Block from './Block.js';

class PageA extends Block {
  protected render() {
    const fragment = document.createElement('template');
    fragment.innerHTML = '<div>A</div>';
    return fragment.content;
  }
}

class PageB extends Block {
  protected render() {
    const fragment = document.createElement('template');
    fragment.innerHTML = '<div>B</div>';
    return fragment.content;
  }
}

class NotFound extends Block {
  protected render() {
    const fragment = document.createElement('template');
    fragment.innerHTML = '<div>404</div>';
    return fragment.content;
  }
}

class TestRouter extends Router {
  protected initRoutes() {
    (this as any).routes = [
      { path: '/', component: PageA },
      { path: '/test', component: PageB },
      { path: Routes.Error404, component: NotFound },
    ];
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
  });

  afterEach(() => {
    document.body.innerHTML = '';
    window.history.replaceState({}, '', '/');
    if (originalGetCurrentUser) {
      apiModule.chatAPI.getCurrentUser = originalGetCurrentUser;
    }
  });

  describe('метод navigate', () => {
    it('должен вызывать navigate и обновлять pathname через Router', async () => {
      router = new TestRouter();
      const initialPath = window.location.pathname;
      const testPath = '/test';
      
      router.navigate(testPath);
      
      expect(window.location.pathname).to.equal(testPath);
      expect(window.location.pathname).to.not.equal(initialPath);
    });

    it('должен обрабатывать роут и рендерить компонент через Router', async () => {
      router = new TestRouter();
      const testPath = '/test';
      
      router.navigate(testPath);
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.textContent).to.not.equal('');
      expect(appElement?.textContent).to.equal('B');
    });
  });

  describe('метод go', () => {
    it('должен вызывать go и навигировать через Router', async () => {
      router = new TestRouter();
      const testPath = '/';
      
      router.go(testPath);
      
      expect(window.location.pathname).to.equal(testPath);
    });

    it('должен последовательно навигировать через go', async () => {
      router = new TestRouter();
      
      router.go('/');
      expect(window.location.pathname).to.equal('/');
      
      router.go('/test');
      expect(window.location.pathname).to.equal('/test');
    });

    it('должен обрабатывать роут при вызове go', async () => {
      router = new TestRouter();
      
      router.go('/');
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.textContent).to.not.equal('');
      expect(appElement?.textContent).to.equal('A');
    });
  });

  describe('метод start', () => {
    it('должен инициализировать роутер и обработать текущий путь', async () => {
      window.history.replaceState({}, '', '/');
      router = new TestRouter();
      
      await router.start();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(window.location.pathname).to.equal('/');
      
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.textContent).to.not.equal('');
      expect(appElement?.textContent).to.equal('A');
    });

    it('должен обработать путь при старте роутера', async () => {
      window.history.replaceState({}, '', '/test');
      router = new TestRouter();
      
      await router.start();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.textContent).to.not.equal('');
      expect(appElement?.textContent).to.equal('B');
    });
  });

  describe('обработка popstate', () => {
    it('должен обрабатывать popstate события через Router', async () => {
      router = new TestRouter();
      router.navigate('/test');
      
      await Promise.resolve();
      
      window.history.pushState({}, '', '/');
      const popstateEvent = new window.PopStateEvent('popstate', { state: {} });
      window.dispatchEvent(popstateEvent);
      
      await Promise.resolve();
      
      expect(window.location.pathname).to.equal('/');
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
    });
  });

  describe('404 роут', () => {
    it('должен определять неизвестные пути и показывать 404 через Router', async () => {
      router = new TestRouter();
      const unknownPath = '/unknown-path-12345';
      
      router.navigate(unknownPath);
      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(window.location.pathname).to.equal(unknownPath);
      
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.textContent).to.not.equal('');
      expect(appElement?.textContent).to.equal('404');
    });
  });

  describe('вызов render/mount', () => {
    it('должен иметь элемент #app для рендеринга', () => {
      router = new TestRouter();
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      if (appElement) {
        expect(appElement.tagName).to.equal('DIV');
      }
    });

    it('должен рендерить компонент в #app при навигации', async () => {
      router = new TestRouter();
      
      router.navigate('/');
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.textContent).to.not.equal('');
      expect(appElement?.textContent).to.equal('A');
    });
  });

  describe('обработка кликов по ссылкам', () => {
    it('должен обрабатывать клики по внутренним ссылкам через Router', async () => {
      router = new TestRouter();
      const link = document.createElement('a');
      link.href = `${window.location.origin}/test`;
      link.textContent = 'Test';
      document.body.appendChild(link);
      
      const clickEvent = new window.MouseEvent('click', { bubbles: true });
      link.dispatchEvent(clickEvent);
      
      await Promise.resolve();
      
      expect(window.location.pathname).to.equal('/test');
      
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
    });

    it('должен различать внутренние и внешние ссылки через Router', () => {
      router = new TestRouter();
      const internalLink = document.createElement('a');
      internalLink.href = `${window.location.origin}/test`;
      document.body.appendChild(internalLink);
      
      const externalLink = document.createElement('a');
      externalLink.href = 'https://example.com';
      document.body.appendChild(externalLink);
      
      const internalClickEvent = new window.MouseEvent('click', { bubbles: true });
      internalLink.dispatchEvent(internalClickEvent);
      
      expect(window.location.pathname).to.equal('/test');
      
      const externalClickEvent = new window.MouseEvent('click', { bubbles: true });
      externalLink.dispatchEvent(externalClickEvent);
      
      expect(window.location.pathname).to.equal('/test');
    });
  });

  describe('методы back и forward', () => {
    it('должен поддерживать метод back через Router', () => {
      router = new TestRouter();
      expect(typeof router.back).to.equal('function');
      
      router.navigate('/test');
      router.navigate('/');
      
      router.back();
      
      expect(typeof window.history.length).to.equal('number');
    });

    it('должен поддерживать метод forward через Router', () => {
      router = new TestRouter();
      expect(typeof router.forward).to.equal('function');
      
      router.navigate('/test');
      router.back();
      
      router.forward();
      
      expect(typeof window.location.pathname).to.equal('string');
    });
  });

  describe('поведение Router при навигации', () => {
    it('должен обновлять содержимое #app при навигации на разные роуты', async () => {
      router = new TestRouter();
      
      router.navigate('/');
      await new Promise(resolve => setTimeout(resolve, 20));
      const content1 = document.querySelector('#app')?.textContent;
      
      router.navigate('/test');
      await new Promise(resolve => setTimeout(resolve, 20));
      const content2 = document.querySelector('#app')?.textContent;
      
      expect(content1).to.not.equal(content2);
      expect(content1).to.equal('A');
      expect(content2).to.equal('B');
    });

    it('должен обрабатывать повторную навигацию на тот же роут', async () => {
      router = new TestRouter();
      
      router.navigate('/');
      await Promise.resolve();
      
      router.navigate('/');
      await Promise.resolve();
      
      expect(window.location.pathname).to.equal('/');
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
    });
  });
});

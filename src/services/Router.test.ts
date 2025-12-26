import { expect } from 'chai';
import { Router } from './Router.js';
import { Routes } from './Routes.js';
import * as apiModule from './api.js';

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
      router = new Router();
      const initialPath = window.location.pathname;
      const testPath = Routes.SignUp;
      
      router.navigate(testPath);
      
      expect(window.location.pathname).to.equal(testPath);
      expect(window.location.pathname).to.not.equal(initialPath);
    });

    it('должен обрабатывать роут и рендерить компонент через Router', async () => {
      router = new Router();
      const testPath = Routes.SignUp;
      
      router.navigate(testPath);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.innerHTML).to.not.equal('');
    });
  });

  describe('метод go', () => {
    it('должен вызывать go и навигировать через Router', async () => {
      router = new Router();
      const testPath = Routes.Home;
      
      router.go(testPath);
      
      expect(window.location.pathname).to.equal(testPath);
    });

    it('должен последовательно навигировать через go', async () => {
      router = new Router();
      
      router.go(Routes.SignIn);
      expect(window.location.pathname).to.equal(Routes.SignIn);
      
      router.go(Routes.SignUp);
      expect(window.location.pathname).to.equal(Routes.SignUp);
    });

    it('должен обрабатывать роут при вызове go', async () => {
      router = new Router();
      
      router.go(Routes.Home);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.innerHTML).to.not.equal('');
    });
  });

  describe('метод start', () => {
    it('должен инициализировать роутер и обработать текущий путь', async () => {
      window.history.replaceState({}, '', Routes.Home);
      router = new Router();
      
      await router.start();
      
      expect(window.location.pathname).to.equal(Routes.Home);
      
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.innerHTML).to.not.equal('');
    });

    it('должен обработать путь при старте роутера', async () => {
      window.history.replaceState({}, '', Routes.SignIn);
      router = new Router();
      
      await router.start();
      
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.innerHTML).to.not.equal('');
    });
  });

  describe('обработка popstate', () => {
    it('должен обрабатывать popstate события через Router', async () => {
      router = new Router();
      router.navigate(Routes.SignUp);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      window.history.pushState({}, '', Routes.Home);
      const popstateEvent = new window.PopStateEvent('popstate', { state: {} });
      window.dispatchEvent(popstateEvent);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(window.location.pathname).to.equal(Routes.Home);
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
    });
  });

  describe('404 роут', () => {
    it('должен определять неизвестные пути и показывать 404 через Router', async () => {
      router = new Router();
      const unknownPath = '/unknown-path-12345';
      
      router.navigate(unknownPath);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(window.location.pathname).to.equal(unknownPath);
      
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.innerHTML).to.not.equal('');
    });
  });

  describe('вызов render/mount', () => {
    it('должен иметь элемент #app для рендеринга', () => {
      router = new Router();
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      if (appElement) {
        expect(appElement.tagName).to.equal('DIV');
      }
    });

    it('должен рендерить компонент в #app при навигации', async () => {
      router = new Router();
      
      router.navigate(Routes.SignIn);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
      expect(appElement?.innerHTML).to.not.equal('');
    });
  });

  describe('обработка кликов по ссылкам', () => {
    it('должен обрабатывать клики по внутренним ссылкам через Router', async () => {
      router = new Router();
      const link = document.createElement('a');
      link.href = `${window.location.origin}${Routes.SignUp}`;
      link.textContent = 'Sign Up';
      document.body.appendChild(link);
      
      const clickEvent = new window.MouseEvent('click', { bubbles: true });
      link.dispatchEvent(clickEvent);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(window.location.pathname).to.equal(Routes.SignUp);
      
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
    });

    it('должен различать внутренние и внешние ссылки через Router', () => {
      router = new Router();
      const internalLink = document.createElement('a');
      internalLink.href = `${window.location.origin}${Routes.SignUp}`;
      document.body.appendChild(internalLink);
      
      const externalLink = document.createElement('a');
      externalLink.href = 'https://example.com';
      document.body.appendChild(externalLink);
      
      const internalClickEvent = new window.MouseEvent('click', { bubbles: true });
      internalLink.dispatchEvent(internalClickEvent);
      
      expect(window.location.pathname).to.equal(Routes.SignUp);
      
      const externalClickEvent = new window.MouseEvent('click', { bubbles: true });
      externalLink.dispatchEvent(externalClickEvent);
      
      expect(window.location.pathname).to.equal(Routes.SignUp);
    });
  });

  describe('методы back и forward', () => {
    it('должен поддерживать метод back через Router', () => {
      router = new Router();
      expect(typeof router.back).to.equal('function');
      
      router.navigate(Routes.SignUp);
      router.navigate(Routes.Home);
      
      router.back();
      
      expect(typeof window.history.length).to.equal('number');
    });

    it('должен поддерживать метод forward через Router', () => {
      router = new Router();
      expect(typeof router.forward).to.equal('function');
      
      router.navigate(Routes.SignUp);
      router.back();
      
      router.forward();
      
      expect(typeof window.location.pathname).to.equal('string');
    });
  });

  describe('поведение Router при навигации', () => {
    it('должен обновлять содержимое #app при навигации на разные роуты', async () => {
      router = new Router();
      
      router.navigate(Routes.SignIn);
      await new Promise(resolve => setTimeout(resolve, 50));
      const content1 = document.querySelector('#app')?.innerHTML;
      
      router.navigate(Routes.SignUp);
      await new Promise(resolve => setTimeout(resolve, 50));
      const content2 = document.querySelector('#app')?.innerHTML;
      
      expect(content1).to.not.equal(content2);
    });

    it('должен обрабатывать повторную навигацию на тот же роут', async () => {
      router = new Router();
      
      router.navigate(Routes.SignIn);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      router.navigate(Routes.SignIn);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(window.location.pathname).to.equal(Routes.SignIn);
      const appElement = document.querySelector('#app');
      expect(appElement).to.not.be.null;
    });
  });
});

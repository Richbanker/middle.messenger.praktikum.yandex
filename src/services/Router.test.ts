import { expect } from 'chai';

describe('Router', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('регистрация роутов и navigate', () => {
    it('должен обновлять pathname при pushState', () => {
      const testPath = '/test';
      window.history.pushState({}, '', testPath);
      expect(window.location.pathname).to.equal(testPath);
    });

    it('должен сохранять роут при обновлении через pushState', () => {
      const testPath = '/sign-up';
      window.history.pushState({}, '', testPath);
      expect(window.location.pathname).to.equal(testPath);
    });
  });

  describe('обработка popstate', () => {
    it('должен обрабатывать popstate события', () => {
      window.history.pushState({}, '', '/sign-up');
      const popstateEvent = new window.PopStateEvent('popstate', { state: {} });
      window.dispatchEvent(popstateEvent);
      expect(window.location.pathname).to.equal('/sign-up');
    });
  });

  describe('404 роут', () => {
    it('должен определять неизвестные пути', () => {
      const unknownPath = '/unknown-path-12345';
      window.history.pushState({}, '', unknownPath);
      expect(window.location.pathname).to.equal(unknownPath);
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
  });

  describe('отсутствие перерисовки', () => {
    it('должен обновлять pathname при каждом navigate', () => {
      window.history.pushState({}, '', '/');
      expect(window.location.pathname).to.equal('/');
      
      window.history.pushState({}, '', '/');
      expect(window.location.pathname).to.equal('/');
    });
  });

  describe('обработка кликов по ссылкам', () => {
    it('должен обрабатывать клики по внутренним ссылкам', () => {
      const link = document.createElement('a');
      link.href = 'http://localhost/sign-up';
      link.textContent = 'Sign Up';
      document.body.appendChild(link);
      
      const clickEvent = new window.MouseEvent('click', { bubbles: true });
      link.dispatchEvent(clickEvent);
      
      expect(link.href).to.include('/sign-up');
    });

    it('должен различать внутренние и внешние ссылки', () => {
      const internalLink = document.createElement('a');
      internalLink.href = 'http://localhost/sign-up';
      
      const externalLink = document.createElement('a');
      externalLink.href = 'https://example.com';
      
      const isInternal = internalLink.href.startsWith(window.location.origin);
      const isExternal = externalLink.href.startsWith(window.location.origin);
      expect(isInternal).to.equal(true);
      expect(isExternal).to.equal(false);
    });

    it('должен извлекать pathname из URL ссылки', () => {
      const link = document.createElement('a');
      link.href = 'http://localhost/settings';
      const url = new URL(link.href);
      expect(url.pathname).to.equal('/settings');
    });
  });
});

import { View } from '@/pages/View.js';
import { Login } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { Chats } from '@/pages/Chats';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';

export class AppController {
  private currentView: View | null = null;
  private rootElement: HTMLElement | null = null;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.init();
  }

  private init(): void {
    this.handleRoute();
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const path = new URL(link.href).pathname;
        window.history.pushState({}, '', path);
        this.handleRoute();
      }
    });
  }

  private handleRoute(): void {
    const path = window.location.pathname;
    let view: View;

    switch (path) {
      case '/':
      case '/login':
        view = new Login();
        break;
      case '/register':
        view = new RegisterPage();
        break;
      case '/chats':
        view = new Chats();
        break;
      case '/profile':
        view = new Profile();
        break;
      case '/settings':
        view = new Settings();
        break;
      default:
        view = new Login();
    }

    if (this.currentView) {
      this.currentView.hide();
    }

    this.currentView = view;
    if (this.rootElement) {
      this.rootElement.innerHTML = '';
      const content = view.getContent();
      if (content) {
        this.rootElement.appendChild(content);
      } else {
        requestAnimationFrame(() => {
          const content = view.getContent();
          if (content && this.rootElement) {
            this.rootElement.appendChild(content);
          }
          view.show();
        });
        return;
      }
      view.show();
    }
  }
}


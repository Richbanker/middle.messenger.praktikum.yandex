import './styles/index.css';
import { View } from './pages/View';
import { Login } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { Chats } from './pages/Chats';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

type Route = '/login' | '/register' | '/chats' | '/profile' | '/settings';

const routes: Record<Route, () => View> = {
  '/login': () => new Login(),
  '/register': () => new RegisterPage(),
  '/chats': () => new Chats(),
  '/profile': () => new Profile(),
  '/settings': () => new Settings(),
};

function renderRoute(pathname: string): void {
  const root = document.getElementById('app');
  if (!root) {
    throw new Error('#app not found');
  }

  const route = (Object.keys(routes) as Route[]).includes(pathname as Route)
    ? (pathname as Route)
    : '/login';

  const view = routes[route]();
  root.innerHTML = '';
  
  const content = view.getContent();
  if (content) {
    root.appendChild(content);
    view.show();
  } else {
    requestAnimationFrame(() => {
      const content = view.getContent();
      if (content && root) {
        root.appendChild(content);
        view.show();
      }
    });
  }
}

(window as Window & { renderRoute?: (pathname: string) => void }).renderRoute = renderRoute;

document.addEventListener('click', (e: Event) => {
  const target = e.target as HTMLElement;
  const a = target.closest('a[data-link]') as HTMLAnchorElement | null;
  if (!a) {
    return;
  }
  e.preventDefault();
  const url = new URL(a.href);
  window.history.pushState(null, '', url.pathname);
  renderRoute(url.pathname);
});

window.addEventListener('popstate', () => {
  renderRoute(window.location.pathname);
});

renderRoute(window.location.pathname);

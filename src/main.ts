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

const basePath = (
  import.meta as ImportMeta & { env: { BASE_URL: string } }
).env.BASE_URL.replace(/\/$/, '');

function getRoutePath(pathname: string): string {
  if (basePath && pathname.startsWith(basePath)) {
    return pathname.slice(basePath.length) || '/login';
  }

  return pathname;
}

function getBrowserPath(route: string): string {
  return `${basePath}${route}` || route;
}

function renderRoute(pathname: string): void {
  const root = document.getElementById('app');
  if (!root) {
    throw new Error('#app not found');
  }

  const routePath = getRoutePath(pathname);
  const route = (Object.keys(routes) as Route[]).includes(routePath as Route)
    ? (routePath as Route)
    : '/login';

  const view = routes[route]();
  root.innerHTML = '';

  const content = view.getContent();
  if (content) {
    root.appendChild(content);
    view.show();
    root.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((link) => {
      link.href = getBrowserPath(getRoutePath(new URL(link.href).pathname));
    });
  } else {
    requestAnimationFrame(() => {
      const content = view.getContent();
      if (content && root) {
        root.appendChild(content);
        view.show();
        root.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((link) => {
          link.href = getBrowserPath(getRoutePath(new URL(link.href).pathname));
        });
      }
    });
  }
}

(window as Window & { renderRoute?: (pathname: string) => void }).renderRoute = renderRoute;

document.addEventListener('click', (e: Event) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const anchor = target.closest('a[data-link]') as HTMLAnchorElement | null;
  if (!anchor) {
    return;
  }

  if ((e as MouseEvent).ctrlKey || (e as MouseEvent).metaKey || (e as MouseEvent).shiftKey || (e as MouseEvent).altKey) return;

  e.preventDefault();
  const url = new URL(anchor.href);
  const routePath = getRoutePath(url.pathname);
  window.history.pushState(null, '', getBrowserPath(routePath));
  renderRoute(routePath);
});

window.addEventListener('popstate', () => {
  renderRoute(window.location.pathname);
});

renderRoute(window.location.pathname);

type View = { getContent(): HTMLElement | null; show(): void; hide(): void };
type Factory = () => View;
type Route = { path: string; factory: Factory; view?: View };

class Router {
  private routes: Route[] = [];
  private current: { hide(): void } | null = null;
  private root: HTMLElement | null = null;

  use(path: string, factory: Factory) {
    this.routes.push({ path, factory });
    return this;
  }

  start(root: HTMLElement) {
    this.root = root;

    window.addEventListener('popstate', () => {
      this.render(window.location.pathname);
    });

    document.addEventListener('click', (e) => {
      const link = (e.target as HTMLElement).closest('a[data-link]') as HTMLAnchorElement | null;
      if (!link) return;

      e.preventDefault();
      this.go(link.pathname);
    });

    this.render(window.location.pathname);
  }

  public go(pathname: string) {
    if (window.location.pathname === pathname) {
      this.render(pathname);
      return;
    }
    window.history.pushState({}, '', pathname);
    this.render(pathname);
  }

  private match(pathname: string) {
    return (
      this.routes.find((r) => r.path === pathname) || this.routes.find((r) => r.path === '/404')
    );
  }

  render(pathname: string) {
    if (!this.root) return;
    const route = this.match(pathname);
    if (!route) return;

    if (this.current) this.current.hide();

    const view = route.view ?? (route.view = route.factory());
    const content = view.getContent();

    this.root.innerHTML = '';
    if (content) this.root.appendChild(content);

    view.show();
    this.current = view;
  }
}

export const router = new Router();

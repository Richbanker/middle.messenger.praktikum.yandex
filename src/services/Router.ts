import { render } from "./render";
import Block from "./Block";
import { HomePage } from "../pages/homePage/HomePage";
import { LoginPage } from "../pages/login/LoginPage";
import { RegistrationPage } from "../pages/registration/RegistrationPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { ErrorPage } from "../pages/errorsPage/ErrorPage";
import { chatAPI } from "./api";

export interface Route {
  path: string;
  component: new (props?: any) => Block;
  props?: Record<string, unknown>;
}

export class Router {
  private routes: Route[] = [];

  constructor() {
    this.initRoutes();
    this.initEventListeners();
  }

  private initRoutes() {
    this.routes = [
      {
        path: "/",
        component: LoginPage,
        props: {
          title: "Messenger",
          subtitle: "Авторизация в системе",
        },
      },
      {
        path: "/sign-up",
        component: RegistrationPage,
        props: {
          title: "Messenger",
          subtitle: "Создание аккаунта",
        },
      },
      {
        path: "/settings",
        component: ProfilePage,
        props: {
          title: "ПРОФИЛЬ",
          user: {
            avatar: "/assets/avatar-default.jpg",
            email: "user@neonmail.io",
            login: "neon_user",
            firstName: "Алексей",
            lastName: "Иванов",
            displayName: "NEON_WARRIOR",
            phone: "+79001234567",
          },
        },
      },
      {
        path: "/messenger",
        component: ErrorPage,
        props: {},
      },
      {
        path: "/home",
        component: HomePage,
        props: {
          title: "Messenger",
          subtitle: "Добро пожаловать",
        },
      },
      {
        path: "/404",
        component: ErrorPage,
        props: {
          errorCode: "404",
          title: "ОШИБКА: КОТ НАСТРОЙКИ",
          message: "Сервер съел ваш запрос. Буквально.",
          terminalLines: [
            "> ERROR: Путь не найден",
            "> WARNING: Кот-хакер замечен в системе",
            "> TIP: Проверьте URL или спросите кота",
          ],
        },
      },
      {
        path: "/500",
        component: ErrorPage,
        props: {
          errorCode: "500",
          title: "СЕРВЕР УПАЛ",
          message: "Наши инженеры уже бегут с кофе и паяльниками.",
          terminalLines: [
            "> CRITICAL ERROR: Сервер не отвечает",
            "> LAST ACTION: Попытка загрузить кофе",
            "> STATUS: Инженеры в пути",
          ],
        },
      },
    ];
  }

  private initEventListeners() {
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href && link.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const path = new URL(link.href).pathname;
        this.navigate(path);
      }
    });

    window.addEventListener("popstate", () => {
      this.handleRoute(window.location.pathname);
    });
  }

  public navigate(path: string) {
    window.history.pushState({}, "", path);
    this.handleRoute(path);
  }

  private async handleRoute(path: string) {
    const errorPages = ["/404", "/500"];
    if (errorPages.includes(path)) {
      this.renderRoute(path);
      return;
    }

    const protectedRoutes = ["/messenger", "/settings"];
    const isProtected = protectedRoutes.some((route) => path.startsWith(route));

    const isAuthenticated = await this.checkAuthentication();

    if (isProtected && !isAuthenticated) {
      this.navigate("/");
      return;
    }

    if (isAuthenticated && (path === "/" || path === "/sign-up")) {
      this.navigate("/messenger");
      return;
    }

    this.renderRoute(path);
  }

  private async checkAuthentication(): Promise<boolean> {
    try {
      await chatAPI.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  private async renderRoute(path: string) {
    if (!path.includes("/messenger")) {
      try {
        const { webSocketService } = await import("./WebSocketService");
        webSocketService.disconnect();
      } catch {
        void 0;
      }
    }

    let route = this.routes.find((r) => r.path === path);

    if (!route) {
      route = this.routes.find((r) => path.startsWith(r.path));
    }

    if (!route) {
      route = this.routes.find((r) => r.path === "/404")!;
    }

    if (path.includes("/messenger")) {
      try {
        const { ChatPage } = await import("../pages/chat/ChatPage");
        const chatPage = new ChatPage();
        render("#app", chatPage);
        return;
      } catch {
        route = this.routes.find((r) => r.path === "/500")!;
      }
    }

    if (route && route.component) {
      const component = new route.component(route.props);
      render("#app", component);
    }
  }

  public async start() {
    await this.handleRoute(window.location.pathname);
  }

  public async logout() {
    try {
      const { chatAPI } = await import("./api");
      await chatAPI.logout();
    } catch {
      void 0;
    }
    this.navigate("/");
  }
}

import Block from "../../services/Block";
import Handlebars from "handlebars";
import { errorTemplate } from "./errorTemplate";
import { iconTemplate } from "../../components/icon/iconTebplate";

Handlebars.registerPartial("icon", iconTemplate);

interface ErrorPageProps {
  errorCode: "404" | "500";
  title: string;
  message: string;
  terminalLines: string[];
}

export class ErrorPage extends Block {
  private errorCode: "404" | "500";
  private randomTitles: string[];
  private randomMessages: string[];

  constructor(props: ErrorPageProps) {
    super("div", {
      ...props,
      events: {
        click: (e: Event) => this.handleClick(e),
      },
    });
    this.errorCode = props.errorCode;

    if (this.errorCode === "404") {
      this.randomTitles = [
        "ОШИБКА: КОТ НАСТРОЙКИ",
        "СТРАНИЦА НЕ НАЙДЕНА",
        "КИБЕР-КОТ ВСЁ СЛОМАЛ",
        "404: ПУТЬ ПОТЕРЯН"
      ];
      this.randomMessages = [
        "Сервер съел ваш запрос. Буквально.",
        "Кот-хакер удалил эту страницу.",
        "Страница сбежала в киберпространство.",
        "404: Путь не найден в матрице."
      ];
    } else {
      this.randomTitles = [
        "СЕРВЕР УПАЛ",
        "КАТАСТРОФА",
        "ВСЁ СЛОМАЛОСЬ",
        "КОД КРАСНЫЙ"
      ];
      this.randomMessages = [
        "Наши инженеры уже бегут с кофе и паяльниками.",
        "Похоже, сервер перегрелся от ваших запросов.",
        "Ошибка 500: сервер решил взять перекур.",
        "Мы знаем о проблеме. Ну... теперь знаем."
      ];
    }
  }

  componentDidMount() {
    this.initBlinkAnimation();

    this.setRandomContent();
  }

  private initBlinkAnimation() {
    const blink = this.element?.querySelector(".blink") as HTMLElement;
    if (blink) {
      setInterval(
        () => (blink.style.opacity = blink.style.opacity === "0" ? "1" : "0"),
        500
      );
    }
  }

  private setRandomContent() {
    const titleElement = this.element?.querySelector("#random-title") as HTMLElement;
    const messageElement = this.element?.querySelector("#random-message") as HTMLElement;

    if (titleElement) {
      titleElement.textContent = this.randomTitles[Math.floor(Math.random() * this.randomTitles.length)];
    }

    if (messageElement) {
      messageElement.textContent = this.randomMessages[Math.floor(Math.random() * this.randomMessages.length)];
    }
  }

  private handleClick(e: Event) {
    const target = e.target as HTMLElement;

    if (target.closest('.home-button')) {
      // Переход на главную страницу
      (window as any).router.navigate("/home");
    } else if (target.closest('#reload-button')) {
      if (this.errorCode === "500") {
        window.location.reload();
      }
    }
  }

  protected render() {
    return this.compile(errorTemplate, {
      ...this.props,
      errorCode: this.errorCode,
      is404: this.errorCode === "404",
      is500: this.errorCode === "500",
      currentYear: String(new Date().getFullYear()),
    });
  }
}


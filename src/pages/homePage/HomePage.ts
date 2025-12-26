import Block from "../../services/Block";
import Handlebars from "handlebars";
import { homeTemplate } from "./homeTemplate";
import { linkCardTemplate } from "../../components/linkCard/linkCardTemplate";
import { iconTemplate } from "../../components/icon/iconTebplate";

Handlebars.registerPartial("linkCard", linkCardTemplate);
Handlebars.registerPartial("icon", iconTemplate);

interface HomePageProps {
  title: string;
  subtitle: string;
}

export class HomePage extends Block {
  constructor(props: HomePageProps) {
    super("div", {
      ...props,
    });
  }

  componentDidMount() {
    this.initBlinkAnimation();
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

  protected render() {
    return this.compile(homeTemplate, {
      ...this.props,
      currentYear: String(new Date().getFullYear()),
    });
  }
}

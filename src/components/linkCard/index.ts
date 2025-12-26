import Handlebars from "handlebars";
import Block from "../../services/Block.js";
import { linkCardTemplate } from "./linkCardTemplate.js";
import { iconTemplate } from "../icon/iconTebplate.js";

interface LinkCardProps {
  url: string;
  accent: string;
  icon: string;
  title: string;
  description: string;
  onClick?: (event: Event) => void;
}
Handlebars.registerPartial("icon", iconTemplate);
class LinkCard extends Block {
  constructor(props: LinkCardProps) {
    super("a", {
      ...props,
      events: {
        click: props.onClick || (() => {}),
      },
    });
  }

  protected render() {
    return this.compile(linkCardTemplate, this.props);
  }
}

export default LinkCard;

import Block from "../../services/Block";
import { buttonTemplate } from "./buttonTemplate";

interface ButtonProps {
  text: string;
  type?: string;
  class?: string;
  pulse?: boolean;
  disabled?: boolean;
  id?: string;
  icon?: string;
  onClick?: (event: Event) => void;
}

class Button extends Block {
  constructor(props: ButtonProps) {
    super("div", {
      ...props,
      type: props.type || "button",
      events: {
        click: props.onClick || (() => {}),
      },
    });
  }

  render() {
    return this.compile(buttonTemplate, this.props);
  }
}

export default Button;

import { iconTemplate } from "./iconTebplate";
import Block from "../../services/Block";

interface IconProps {
  name: string;
  className?: string;
  onClick?: (event: Event) => void;
}

class Icon extends Block {
  constructor(props: IconProps) {
    super("svg", {
      ...props,
      events: {
        click: props.onClick || (() => {}),
      },
    });
  }

  protected render() {
    return this.compile(iconTemplate, this.props);
  }
}

export default Icon;

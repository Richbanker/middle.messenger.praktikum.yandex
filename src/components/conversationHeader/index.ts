import Block from "../../services/Block.js";
import { iconTemplate } from "../icon/iconTebplate.js";
import { conversationHeaderTemplate } from "./conversationHeaderTemplate.js";
import Handlebars from "handlebars";
interface ConversationHeaderProps {
  name: string;
  avatar: string;
  status: string;
  onSettingsClick?: (event: Event) => void;
}
Handlebars.registerPartial("icon", iconTemplate);
class ConversationHeader extends Block {
  constructor(props: ConversationHeaderProps) {
    super("div", {
      ...props,
      events: {
        click: (e: Event) => {
          if (e.target instanceof HTMLElement && e.target.closest(".chat-settings")) {
            props.onSettingsClick?.(e);
          }
        },
      },
    });
  }

  protected render() {
    return this.compile(conversationHeaderTemplate, this.props);
  }
}

export default ConversationHeader;

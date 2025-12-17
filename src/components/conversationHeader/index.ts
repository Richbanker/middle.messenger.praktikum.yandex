import Block from "../../services/Block";
import { iconTemplate } from "../icon/iconTebplate";
import { conversationHeaderTemplate } from "./conversationHeaderTemplate";
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
          if ((e.target as HTMLElement).closest(".chat-settings")) {
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

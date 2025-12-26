import Block from "../../services/Block.js";
import { messageTemplate } from "./messageTemplate.js";

export { messageTemplate };

interface MessageProps {
  type: "sent" | "received";
  content: string;
  time: string;
}

class Message extends Block {
  constructor(props: MessageProps) {
    super("div", { ...props });
  }

  protected render() {
    return this.compile(messageTemplate, this.props);
  }
}

export default Message;

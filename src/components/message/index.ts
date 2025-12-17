import Block from "../../services/Block";
import { messageTemplate } from "./messageTemplate";

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

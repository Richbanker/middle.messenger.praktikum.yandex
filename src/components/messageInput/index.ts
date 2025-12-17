import Block from "../../services/Block";
import { iconTemplate } from "../icon/iconTebplate";
import { messageInputTemplate } from "./messageInputTemplate";
import Handlebars from "handlebars";

interface MessageInputProps {
  placeholder?: string;
  onSend?: (message: string) => void;
  onInput?: (event: Event) => void;
}

Handlebars.registerPartial("icon", iconTemplate);

class MessageInput extends Block {
  constructor(props: MessageInputProps) {
    super("div", {
      ...props,
      placeholder: props.placeholder || "Введите сообщение...",
      events: {
        click: (e: Event) => {
          if ((e.target as HTMLElement).closest(".send-button")) {
            this.handleSend();
          }
        },
        keydown: (e: KeyboardEvent) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSend();
          }
        },
        input: props.onInput || (() => {}),
      },
    });
  }

  private handleSend() {
    const input = this.element.querySelector("input") as HTMLInputElement;
    if (input && this.props.onSend) {
      const message = input.value.trim();
      if (message) {
        const onSend = this.props.onSend as (message: string) => void;
        onSend(message);
        input.value = "";
      }
    }
  }

  protected render() {
    return this.compile(messageInputTemplate, this.props);
  }
}

export default MessageInput;

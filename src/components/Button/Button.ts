import { Block, Props } from '@/core/Block';

interface ButtonProps extends Props {
  text: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  onClick?: () => void;
}

export class Button extends Block<ButtonProps> {
  constructor(props: ButtonProps) {
    super({
      ...props,
      events: {
        click: props.onClick || (() => {}),
      },
    });
  }

  protected render(): DocumentFragment {
    const { type, className, text } = this.props;
    return this.compile(
      () => `
        <button 
          type="${type || 'button'}" 
          class="${className || 'button'}"
        >
          ${text}
        </button>
      `,
      {}
    );
  }
}


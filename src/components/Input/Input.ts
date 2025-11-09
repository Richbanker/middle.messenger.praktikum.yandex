import { Block, Props } from '@/core/Block';
import { validateField } from '@/utils/validation';

interface InputProps extends Props {
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  label?: string;
  className?: string;
  error?: string;
  onBlur?: () => void;
  onInput?: () => void;
}

export class Input extends Block<InputProps> {
  constructor(props: InputProps) {
    super({
      ...props,
    });
  }

  private validate(): void {
    const input = this.element?.querySelector('input') as HTMLInputElement;
    if (!input) {
      return;
    }

    const error = validateField(this.props.name, input.value);
    this.setProps({ error: error || undefined });
  }

  private clearError(): void {
    this.setProps({ error: '' });
  }

  public getValue(): string {
    const input = this.element?.querySelector('input') as HTMLInputElement;
    return input?.value || '';
  }

  public setValue(value: string): void {
    const input = this.element?.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = value;
    }
  }

  protected componentDidMount(): void {
    const input = this.element?.querySelector('input');
    if (input) {
      input.addEventListener('blur', () => {
        this.validate();
        if (this.props.onBlur) {
          this.props.onBlur();
        }
      });
      input.addEventListener('input', () => {
        this.clearError();
        if (this.props.onInput) {
          this.props.onInput();
        }
      });
    }
    super.componentDidMount();
  }

  protected render(): DocumentFragment {
    const { label, type, name, placeholder, value, className, error } = this.props;
    return this.compile(
      () => `
        <div class="input-wrapper">
          ${label ? `<label class="input-label">${label}</label>` : ''}
          <input
            type="${type || 'text'}"
            name="${name}"
            placeholder="${placeholder || ''}"
            value="${value || ''}"
            class="input ${className || ''} ${error ? 'input_error' : ''}"
          />
          ${error ? `<span class="input-error">${error}</span>` : ''}
        </div>
      `,
      {}
    );
  }
}


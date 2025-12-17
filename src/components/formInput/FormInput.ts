import Block from "../../services/Block";
import { Validator } from "../../services/Validator";

interface FormInputProps {
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  label?: string;
  error?: string;
  onInput?: (value: string, isValid: boolean) => void;
  onBlur?: (value: string, isValid: boolean) => void;
}

export class FormInput extends Block {
  private inputElement: HTMLInputElement | null = null;
  private errorElement: HTMLElement | null = null;

  constructor(props: FormInputProps) {
    super("div", {
      ...props,
      events: {
        input: (e: Event) => this.handleInput(e),
        blur: (e: Event) => this.handleBlur(e),
        focus: (e: Event) => this.handleFocus(e),
      },
    });
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    const isValid = this.validateField(value);
    
    this.updateErrorDisplay(isValid ? null : this.getValidationError(value));
    
    const onInput = this.props.onInput as ((value: string, isValid: boolean) => void) | undefined;
    if (onInput) {
      onInput(value, isValid);
    }
  }

  private handleBlur(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    const isValid = this.validateField(value);
    
    this.updateErrorDisplay(isValid ? null : this.getValidationError(value));
    
    const onBlur = this.props.onBlur as ((value: string, isValid: boolean) => void) | undefined;
    if (onBlur) {
      onBlur(value, isValid);
    }
  }

  private handleFocus(_e: Event) {
    
    this.updateErrorDisplay(null);
  }

  private validateField(value: string): boolean {
    const name = this.props.name as string;
    const errors = Validator.validateField(name, value);
    return errors.length === 0;
  }

  private getValidationError(value: string): string {
    const name = this.props.name as string;
    const errors = Validator.validateField(name, value);
    return errors.length > 0 ? errors[0] : '';
  }

  private updateErrorDisplay(error: string | null) {
    if (this.errorElement) {
      if (error) {
        this.errorElement.textContent = error;
        this.errorElement.style.display = 'block';
        this.inputElement?.classList.add('error');
      } else {
        this.errorElement.style.display = 'none';
        this.inputElement?.classList.remove('error');
      }
    }
  }

  protected render() {
    const { name, type = 'text', placeholder, value = '', required, label, error } = this.props;
    
    return this.compile(`
      <div class="form-input-wrapper">
        ${label ? `<label class="form-label" for="${name}">${label}</label>` : ''}
        <input 
          type="${type}" 
          name="${name}" 
          id="${name}"
          placeholder="${placeholder || ''}"
          value="${value}"
          ${required ? 'required' : ''}
          class="form-input ${error ? 'error' : ''}"
        />
        <div class="form-error" style="display: ${error ? 'block' : 'none'}">${error || ''}</div>
      </div>
    `, this.props);
  }

  componentDidMount() {
    
    this.inputElement = this.element.querySelector('.form-input') as HTMLInputElement;
    this.errorElement = this.element.querySelector('.form-error') as HTMLElement;
  }

  setValue(value: string) {
    if (this.inputElement) {
      this.inputElement.value = value;
    }
  }

  getValue(): string {
    return this.inputElement?.value || '';
  }

  setError(error: string) {
    this.updateErrorDisplay(error);
  }

  clearError() {
    this.updateErrorDisplay(null);
  }
}

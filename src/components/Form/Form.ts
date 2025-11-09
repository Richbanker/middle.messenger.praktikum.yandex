import { Block, Props } from '@/core/Block';
import { Input } from '@/components/Input';
import { validateForm } from '@/utils/validation';

interface FormProps extends Props {
  inputs: Input[];
  submitButtonText: string;
  onSubmit?: (data: Record<string, string>) => void;
  className?: string;
}

export class Form extends Block<FormProps> {
  constructor(props: FormProps) {
    super({
      ...props,
      events: {
        submit: (e: Event) => {
          e.preventDefault();
          this.handleSubmit();
        },
      },
    });
  }

  private handleSubmit(): void {
    const formData: Record<string, string> = {};
    let isValid = true;

    this.props.inputs.forEach((input) => {
      const value = input.getValue();
      const name = (input as unknown as { props: { name: string } }).props.name;
      formData[name] = value;
    });

    const errors = validateForm(formData);

    this.props.inputs.forEach((input) => {
      const name = (input as unknown as { props: { name: string } }).props.name;
      const error = errors[name];
      if (error) {
        input.setProps({ error });
        isValid = false;
      }
    });

    if (isValid) {
      console.log('Form data:', formData);
      if (this.props.onSubmit) {
        this.props.onSubmit(formData);
      }
    }
  }

  protected render(): DocumentFragment {
    const inputs = this.props.inputs.map((input) => ({
      id: input.id,
    }));

    return this.compile(
      () => `
        <form class="form ${this.props.className || ''}">
          ${inputs.map((input) => `<div data-id="${input.id}"></div>`).join('')}
          <button type="submit" class="button button_primary">${this.props.submitButtonText}</button>
        </form>
      `,
      {}
    );
  }

  protected componentDidMount(): void {
    this.props.inputs.forEach((input) => {
      this.children[input.id] = input;
    });
    super.componentDidMount();
  }
}


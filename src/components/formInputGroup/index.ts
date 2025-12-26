import Block from "../../services/Block";
import Handlebars from "handlebars";
import { formInputGroupTemplate } from "./formInputGroupTemplate";
import { formInputTemplate } from "../formInput/fornInputTemplate";

Handlebars.registerPartial("formInput", formInputTemplate);
interface FormInputGroupProps {
  label: string;
  id: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
  error?: boolean;
  value?: string;
  icon?: string;
  onInput?: (event: Event) => void;
  onChange?: (event: Event) => void;
}

class FormInputGroup extends Block {
  constructor(props: FormInputGroupProps) {
    super("div", {
      ...props,
      events: {
        input: props.onInput || (() => {}),
        change: props.onChange || (() => {}),
      },
    });
  }

  protected render() {
    return this.compile(formInputGroupTemplate, this.props);
  }

  get inputElement(): HTMLInputElement | null {
    return this.element.querySelector("input");
  }

  getValue(): string {
    return this.inputElement?.value || "";
  }

  setValue(value: string): void {
    if (this.inputElement) {
      this.inputElement.value = value;
    }
  }
}

export default FormInputGroup;

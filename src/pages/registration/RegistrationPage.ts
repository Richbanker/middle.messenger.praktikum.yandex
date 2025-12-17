import Block from "../../services/Block";
import Handlebars from "handlebars";
import { registrationTemplate } from "./registrationTemplate";
import { formInputGroupTemplate } from "../../components/formInputGroup/formInputGroupTemplate";
import { formInputTemplate } from "../../components/formInput/fornInputTemplate";
import { buttonTemplate } from "../../components/Button/buttonTemplate";
import { iconTemplate } from "../../components/icon/iconTebplate";
import { Validator, ValidationResult } from "../../services/Validator";
import { chatAPI } from "../../services/api";
import { HttpError } from "../../services/HttpClient";

Handlebars.registerPartial("formInputGroup", formInputGroupTemplate);
Handlebars.registerPartial("formInput", formInputTemplate);
Handlebars.registerPartial("btn", buttonTemplate);
Handlebars.registerPartial("icon", iconTemplate);

interface RegistrationPageProps {
  title: string;
  subtitle: string;
}

export class RegistrationPage extends Block {
  constructor(props: RegistrationPageProps) {
    super("div", {
      ...props,
      events: {
        submit: (e: Event) => this.handleSubmit(e),
      },
    });
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    const formData = new FormData(target);
    const data = {
      first_name: String(formData.get("first_name") || ""),
      second_name: String(formData.get("second_name") || ""),
      login: String(formData.get("login") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      phone: String(formData.get("phone") || ""),
    };
    const validationResult: ValidationResult = Validator.validateForm(data);

    if (!validationResult.isValid) {
      this.displayValidationErrors(validationResult.fieldErrors);
      return;
    }

    this.clearValidationErrors();
    this.clearApiError();

    try {
      await chatAPI.register(data);
      await chatAPI.login({ login: data.login, password: data.password });
      await chatAPI.getCurrentUser();
      (window as any).router.navigate("/messenger");
    } catch (error: unknown) {
      if (this.isDuplicateUserError(error)) {
        try {
          await chatAPI.login({
            login: data.login,
            password: data.password,
          });
          await chatAPI.getCurrentUser();
          (window as any).router.navigate("/messenger");
          return;
    } catch {
          this.showApiError("Пользователь уже существует. Попробуйте войти.");
          return;
        }
      }

      const httpErr = error as HttpError;
      if (httpErr?.message) {
        this.showApiError(httpErr.message);
      } else {
        this.showApiError("Не удалось создать аккаунт. Повторите попытку.");
      }
    }
  }

  private displayValidationErrors(fieldErrors: Record<string, string[]>) {
    this.clearValidationErrors();

    Object.entries(fieldErrors).forEach(([fieldName, errors]) => {
      const field = this.element?.querySelector(
        `[name="${fieldName}"]`
      ) as HTMLElement;
      if (field) {
        const errorElement = document.createElement("div");
        errorElement.className = "validation-error";
        errorElement.textContent = errors[0];
        errorElement.style.color = "#ff4444";
        errorElement.style.fontSize = "12px";
        errorElement.style.marginTop = "5px";

        field.parentElement?.appendChild(errorElement);
      }
    });
  }

  private clearValidationErrors() {
    const errorElements = this.element?.querySelectorAll(".validation-error");
    errorElements?.forEach((element) => element.remove());
  }

  private showApiError(message: string) {
    this.clearApiError();
    const form = this.element?.querySelector("form");
    if (!form) return;

    const errorElement = document.createElement("div");
    errorElement.className = "validation-error";
    errorElement.textContent = message;
    errorElement.style.color = "#ef4444";
    errorElement.style.fontSize = "13px";
    errorElement.style.marginTop = "10px";
    errorElement.style.textAlign = "center";

    form.appendChild(errorElement);
  }

  private clearApiError() {
    const apiErrors = this.element?.querySelectorAll(".validation-error");
    apiErrors?.forEach((node) => {
      if (node.parentElement?.tagName?.toLowerCase() === "form") {
        node.remove();
      }
    });
  }

  private isDuplicateUserError(error: unknown): boolean {
    if (!error) return false;

    const httpErr = error as HttpError;
    if (typeof httpErr.status === "number" && httpErr.status === 409) {
      return true;
    }

    if (httpErr.message && httpErr.message.includes("User already in system")) {
      return true;
    }

    if (error instanceof Error && error.message.includes("409")) {
      return true;
    }

    return false;
  }

  protected render() {
    return this.compile(registrationTemplate, {
      ...this.props,
      currentYear: String(new Date().getFullYear()),
    });
  }
}

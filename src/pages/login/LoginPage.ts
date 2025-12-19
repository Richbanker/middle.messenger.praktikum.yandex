import Block from "../../services/Block";
import Handlebars from "handlebars";
import { loginTemplate } from "./loginTemplate";
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

interface LoginPageProps {
  title: string;
  subtitle: string;
}

export class LoginPage extends Block {
  constructor(props: LoginPageProps) {
    super("div", {
      ...props,
      events: {
        click: (e: Event) => this.handleClick(e),
        blur: (e: Event) => this.handleBlur(e),
      },
    });
  }


  private async handleLogin(form: HTMLFormElement) {
    const formData = new FormData(form);
    const data = {
      login: String(formData.get("login") || ""),
      password: String(formData.get("password") || ""),
    };

    const validationResult: ValidationResult = Validator.validateForm(data);

    if (!validationResult.isValid) {
      this.displayValidationErrors(validationResult.fieldErrors);
      return;
    }

    try {
      await chatAPI.login(data);
      await chatAPI.getCurrentUser();
      (window as any).router.navigate("/messenger");
    } catch (error: unknown) {
      if (this.isAlreadyAuthorizedError(error)) {
        try {
          await chatAPI.getCurrentUser();
          (window as any).router.navigate("/messenger");
          return;
    } catch {
          this.showApiError("Сессия устарела, войдите снова.");
          return;
        }
      }
      const httpErr = error as HttpError;
      if (httpErr?.status === 401) {
        this.showApiError("Неверный логин или пароль.");
        return;
      }
      this.showApiError(httpErr?.message || "Ошибка входа. Проверьте логин и пароль.");
    }
  }

  private async handleClick(e: Event) {
    if (!(e.target instanceof HTMLElement)) {
      return;
    }
    const target = e.target;

    if (target.closest('[onClick="loginWithGoogle()"]')) {
      this.loginWithGoogle();
    } else if (target.closest('[onClick="loginWithGithub()"]')) {
      this.loginWithGithub();
    } else if (target.closest('button[type="submit"]')) {
      e.preventDefault();
      const form = this.element?.querySelector("#loginForm");
      if (form instanceof HTMLFormElement) {
        await this.handleLogin(form);
      }
    }
  }

  private handleBlur(e: Event) {
    if (!(e.target instanceof HTMLInputElement)) {
      return;
    }
    const field = e.target;
    const fieldName = field.name;
    const value = field.value.trim();

    const errors = Validator.validateField(fieldName, value);
    this.clearFieldError(fieldName);

    if (errors.length > 0) {
      this.displayFieldError(fieldName, errors[0]);
    }
  }

  private displayFieldError(fieldName: string, error: string) {
    const field = this.element?.querySelector(`[name="${fieldName}"]`);
    if (!field) {
      return;
    }

    const errorElement = document.createElement("div");
    errorElement.className = "validation-error";
    errorElement.textContent = error;
    errorElement.style.color = "#ff4444";
    errorElement.style.fontSize = "12px";
    errorElement.style.marginTop = "5px";

    field.parentElement?.appendChild(errorElement);
  }

  private clearFieldError(fieldName: string) {
    const field = this.element?.querySelector(`[name="${fieldName}"]`);
    if (!field) {
      return;
    }
    const errorElement = field.parentElement?.querySelector(".validation-error");
    if (errorElement) {
      errorElement.remove();
    }
  }

  private loginWithGoogle() {
    alert("Интеграция с Google в разработке");
  }

  private loginWithGithub() {
    alert("Интеграция с GitHub в разработке");
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
    this.clearValidationErrors();

    const errorElement = document.createElement("div");
    errorElement.className = "validation-error";
    errorElement.textContent = message;
    errorElement.style.color = "#ff4444";
    errorElement.style.fontSize = "14px";
    errorElement.style.marginTop = "10px";
    errorElement.style.textAlign = "center";

    const form = this.element?.querySelector("#loginForm");
    if (form) {
      form.appendChild(errorElement);
    }
  }

  private isAlreadyAuthorizedError(error: unknown): boolean {
    const httpErr = error as HttpError;
    if (
      typeof httpErr?.status === "number" &&
      httpErr.status === 400 &&
      (httpErr.message?.includes("User already in system") ||
        (httpErr as any).data?.reason === "User already in system")
    ) {
      return true;
    }
    if (httpErr?.message?.includes("User already in system")) {
      return true;
    }
    return false;
  }

  protected render() {
    return this.compile(loginTemplate, {
      ...this.props,
      currentYear: String(new Date().getFullYear()),
    });
  }
}

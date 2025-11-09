export type RuleName =
  | 'first_name'
  | 'second_name'
  | 'login'
  | 'email'
  | 'password'
  | 'phone'
  | 'message'
  | 'oldPassword';

const patterns: Record<RuleName, RegExp> = {
  first_name: /^[A-ZА-ЯЁ][a-zа-яё-]+$/,
  second_name: /^[A-ZА-ЯЁ][a-zа-яё-]+$/,
  login: /^(?!\d+$)[a-zA-Z0-9_-]{3,20}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}\-:.]{8,40}$/,
  phone: /^\+?\d{10,15}$/,
  message: /^(?!\s*$).+$/,
  oldPassword: /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}\-:.]{8,40}$/,
};

const errorMessages: Record<RuleName, string> = {
  first_name: 'Латиница или кириллица, первая буква заглавная, без пробелов, цифр и спецсимволов (кроме дефиса)',
  second_name: 'Латиница или кириллица, первая буква заглавная, без пробелов, цифр и спецсимволов (кроме дефиса)',
  login: 'От 3 до 20 символов, латиница, может содержать цифры, но не состоять из них, без пробелов, без спецсимволов (кроме дефиса и подчёркивания)',
  email: 'Латиница, может включать цифры и спецсимволы, обязательно должна быть @ и точка после неё',
  password: 'От 8 до 40 символов, обязательно хотя бы одна заглавная буква и цифра',
  phone: 'От 10 до 15 символов, состоит из цифр, может начинаться с плюса',
  message: 'Сообщение не должно быть пустым',
  oldPassword: 'От 8 до 40 символов, обязательно хотя бы одна заглавная буква и цифра',
};

export function validateField(name: string, value: string): string | null {
  const ruleName = name as RuleName;
  const re = patterns[ruleName];
  if (!re) {
    return null;
  }
  return re.test(String(value).trim()) ? null : errorMessages[ruleName] || 'Некорректное значение';
}

export function validateForm(formData: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  Object.keys(formData).forEach((key) => {
    const value = formData[key];
    if (value !== undefined) {
      const error = validateField(key, value);
      if (error) {
        errors[key] = error;
      }
    }
  });
  return errors;
}

function setFieldError(el: HTMLInputElement | HTMLTextAreaElement, error: string | null): void {
  const holder = el.closest('.input-wrapper') || el.parentElement;
  if (!holder) {
    return;
  }
  let err = holder.querySelector('.input-error') as HTMLElement | null;
  if (!err) {
    err = document.createElement('span');
    err.className = 'input-error';
    holder.appendChild(err);
  }
  err.textContent = error ?? '';
  if (error) {
    el.classList.add('input_error');
  } else {
    el.classList.remove('input_error');
  }
}

export function attachFormValidation(form: HTMLFormElement): void {
  const inputs = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[name], textarea[name]')
  );
  const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  const updateSubmitButton = (): void => {
    if (!submitButton) {
      return;
    }
    let hasError = false;
    let allFieldsFilled = true;
    inputs.forEach((el) => {
      const name = el.name;
      const value = el.value.trim();
      if (!value) {
        allFieldsFilled = false;
      } else {
        const error = validateField(name, value);
        if (error) {
          hasError = true;
        }
      }
    });
    submitButton.disabled = hasError || !allFieldsFilled;
  };

  inputs.forEach((el) => {
    el.addEventListener('blur', () => {
      const name = el.name;
      const error = validateField(name, el.value);
      setFieldError(el, error);
      updateSubmitButton();
    });

    el.addEventListener('input', () => {
      const name = el.name;
      const error = validateField(name, el.value);
      setFieldError(el, error);
      updateSubmitButton();
    });
  });

  form.addEventListener('submit', (e: Event) => {
    let hasError = false;
    inputs.forEach((el) => {
      const name = el.name;
      const error = validateField(name, el.value);
      setFieldError(el, error);
      if (error) {
        hasError = true;
      }
    });

    if (hasError) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

  }, true);

  updateSubmitButton();
}

export function validateMessage(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 2000;
}

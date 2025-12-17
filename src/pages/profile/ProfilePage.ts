import Block, { BlockProps } from "../../services/Block";
import Handlebars from "handlebars";
import { profileTemplate } from "./profileTemplate";
import { formInputGroupTemplate } from "../../components/formInputGroup/formInputGroupTemplate";
import { formInputTemplate } from "../../components/formInput/fornInputTemplate";
import { buttonTemplate } from "../../components/Button/buttonTemplate";
import { iconTemplate } from "../../components/icon/iconTebplate";
import { Validator, ValidationResult } from "../../services/Validator";
import { chatAPI } from "../../services/api";

Handlebars.registerPartial("formInputGroup", formInputGroupTemplate);
Handlebars.registerPartial("formInput", formInputTemplate);
Handlebars.registerPartial("btn", buttonTemplate);
Handlebars.registerPartial("icon", iconTemplate);

interface UserData {
  id: string;
  avatar?: string;
  email: string;
  login: string;
  first_name: string;
  second_name: string;
  display_name?: string;
  phone: string;
}

interface ProfilePageProps {
  title: string;
  user: UserData;
}

export class ProfilePage extends Block {
  private user: UserData;
  private avatarUploadHandler = (e: Event) => this.handleAvatarUpload(e);

  constructor(props: ProfilePageProps) {
    super("div", {
      ...props,
      events: {
        submit: (e: Event) => {
          const target = e.target as HTMLElement;
          if (target.tagName === "FORM") {
            this.handleProfileSubmit(e);
          }
        },
        click: (e: Event) => this.handleClick(e),
      },
    });
    this.user = props.user;
  }

  componentDidMount() {
    this.loadUserData();
    this.setupAvatarUpload();
  }

  componentDidUpdate(_oldProps?: BlockProps, _newProps?: BlockProps): boolean {
    this.setupAvatarUpload();
    return true;
  }

  private setupAvatarUpload() {
    const fileInput = this.element?.querySelector(
      "#avatarUpload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.removeEventListener("change", this.avatarUploadHandler);
      fileInput.addEventListener("change", this.avatarUploadHandler);
    }
  }
  private async loadUserData() {
    try {
      const userData = await chatAPI.getCurrentUser();

      this.user = userData;
      this.setProps({ user: userData });

      if (userData.avatar) {
        this.updateAvatarInDOM(userData.avatar);
      }

      this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
    } catch (error: any) {
      if (error?.status !== 401) {
        void 0;
      }
    }
  }
  private handleProfileSubmit(e: Event) {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    if (target.id === "profileForm") {
      this.handleProfileUpdate(target);
    } else if (target.id === "passwordForm") {
      this.handlePasswordChange(target);
    }
  }

  private async handleProfileUpdate(form: HTMLFormElement) {
    const formData = new FormData(form);
    const data: Record<string, string> = {};

    const email = String(formData.get("email") || "").trim();
    const login = String(formData.get("login") || "").trim();
    const first_name = String(formData.get("first_name") || "").trim();
    const second_name = String(formData.get("second_name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const display_name = String(formData.get("display_name") || "").trim();

    if (email && email !== this.user.email) data.email = email;
    if (login && login !== this.user.login) data.login = login;
    if (first_name && first_name !== this.user.first_name)
      data.first_name = first_name;
    if (second_name && second_name !== this.user.second_name)
      data.second_name = second_name;
    if (phone && phone !== this.user.phone) data.phone = phone;
    if (display_name && display_name !== (this.user.display_name || ""))
      data.display_name = display_name;

    data.email = email;
    data.login = login;
    data.first_name = first_name;
    data.second_name = second_name;
    data.phone = phone;
    data.display_name = display_name || "";

    if (Object.keys(data).length === 0) {
      return;
    }

    const validationResult: ValidationResult = Validator.validateForm(data);

    if (!validationResult.isValid) {
      this.displayValidationErrors(validationResult.fieldErrors);
      return;
    }

    try {
      await chatAPI.updateProfile(data);

      this.user = { ...this.user, ...data };
      this.setProps({ user: this.user });

      alert("Профиль обновлен!");
    } catch {
      alert("Ошибка при обновлении профиля");
    }
  }

  private async handlePasswordChange(form: HTMLFormElement) {
    const formData = new FormData(form);

    const data = {
      oldPassword: String(formData.get("oldPassword") || ""),
      newPassword: String(formData.get("newPassword") || ""),
      confirmNewPassword: String(formData.get("confirmNewPassword") || ""),
    };

    if (data.newPassword !== data.confirmNewPassword) {
      alert("Новые пароли не совпадают!");
      return;
    }

    if (data.newPassword.length < 8) {
      alert("Новый пароль должен содержать минимум 8 символов!");
      return;
    }

    try {
      await chatAPI.changePassword(data.oldPassword, data.newPassword);

      alert("Пароль изменен!");
      this.closePasswordModal();
    } catch {
      alert("Ошибка при смене пароля");
    }
  }

  private handleClick(e: Event) {
    const target = e.target as HTMLElement;

    if (target.closest('[data-action="submitProfile"]')) {
      e.preventDefault();
      const form = document.getElementById("profileForm") as HTMLFormElement;
      if (form) {
        this.handleProfileUpdate(form);
      }
    } else if (target.closest('[data-action="openPasswordModal"]')) {
      this.openPasswordModal();
    } else if (target.closest('[data-action="closePasswordModal"]')) {
      this.closePasswordModal();
    } else if (target.closest('[data-action="logout"]')) {
      this.logout();
    } else if (target.closest("#avatarUpload")) {
      this.handleAvatarUpload(e);
    } else if (
      target.closest(".avatar-wrapper") ||
      target.closest(".avatar-overlay")
    ) {
      const fileInput = this.element?.querySelector(
        "#avatarUpload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    } else if (target.id === "passwordModal") {
      this.closePasswordModal();
    }
  }

  private openPasswordModal() {
    const modal = this.element?.querySelector("#passwordModal") as HTMLElement;
    if (modal) {
      modal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  }

  private closePasswordModal() {
    const modal = this.element?.querySelector("#passwordModal") as HTMLElement;
    if (modal) {
      modal.classList.remove("show");
      document.body.style.overflow = "auto";
    }
  }

  private async logout() {
    await (window as any).router.logout();
  }

  private async handleAvatarUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    const validationResult = this.validateAvatarFile(file);
    if (!validationResult.isValid) {
      alert(validationResult.error);
      target.value = ""; // Очищаем input
      return;
    }

    this.showAvatarPreview(file);
    
    this.showUploadProgress();

    try {
      const optimizedFile = await this.optimizeImage(file);
      
      const response = await chatAPI.uploadAvatar(optimizedFile);

      this.user = { ...this.user, ...response };
      this.setProps({ user: this.user });

      if (response.avatar) {
        this.updateAvatarInDOM(response.avatar);
      }

      this.hideUploadProgress();
      
      alert("Аватар успешно загружен!");
    } catch (error: any) {
      this.hideUploadProgress();
      
      let errorMessage = "Ошибка при загрузке аватара";
      
      if (error?.status === 413) {
        errorMessage = "Размер файла слишком большой. Максимум 5 МБ";
      } else if (error?.status === 400) {
        errorMessage = error?.message || "Неподдерживаемый формат файла";
      } else if (error?.status === 401) {
        errorMessage = "Ошибка авторизации. Пожалуйста, войдите снова";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      target.value = "";
      
      if (this.user.avatar) {
        const avatarImg = this.element?.querySelector(
          ".avatar-image"
        ) as HTMLImageElement;
        if (avatarImg) {
          avatarImg.src = this.user.avatar;
        }
      }
    }
  }

  private async optimizeImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(file);
            return;
          }
          
          const MAX_SIZE = 400;
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = (height * MAX_SIZE) / width;
              width = MAX_SIZE;
            } else {
              width = (width * MAX_SIZE) / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(optimizedFile);
              } else {
                resolve(file);
              }
            },
            file.type,
            0.85
          );
        };
        
        img.onerror = () => {
          resolve(file);
        };
        
        img.src = e.target.result;
      };
      
      reader.onerror = () => {
        resolve(file);
      };
      
      reader.readAsDataURL(file);
    });
  }

  private showUploadProgress() {
    const avatarWrapper = this.element?.querySelector('.avatar-wrapper') as HTMLElement;
    if (avatarWrapper) {
      const loader = document.createElement('div');
      loader.className = 'avatar-upload-loader';
      loader.innerHTML = `
        <div class="avatar-upload-spinner"></div>
        <div class="avatar-upload-text">Загрузка...</div>
      `;
      avatarWrapper.appendChild(loader);
      avatarWrapper.style.opacity = '0.7';
    }
  }

  private hideUploadProgress() {
    const avatarWrapper = this.element?.querySelector('.avatar-wrapper') as HTMLElement;
    if (avatarWrapper) {
      const loader = avatarWrapper.querySelector('.avatar-upload-loader');
      if (loader) {
        loader.remove();
      }
      avatarWrapper.style.opacity = '1';
    }
  }

  private validateAvatarFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error:
          "Неподдерживаемый формат файла. Разрешены только JPG, PNG и GIF.",
      };
    }

    const maxSize = 5 * 1024 * 1024; // 5 МБ в байтах
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: "Размер файла не должен превышать 5 МБ.",
      };
    }

    const minSize = 1024; // 1 КБ в байтах
    if (file.size < minSize) {
      return {
        isValid: false,
        error: "Размер файла должен быть не менее 1 КБ.",
      };
    }

    return { isValid: true };
  }

  private showAvatarPreview(file: File) {
    const reader = new (window as any).FileReader();
    reader.onload = (e: any) => {
      const result = e.target?.result as string;
      if (result) {
        // Обновляем только изображение в DOM, без полного перерендера
        const avatarImg = this.element?.querySelector(
          ".avatar-image"
        ) as HTMLImageElement;
        if (avatarImg) {
          avatarImg.src = result;
        }
      }
    };
    reader.readAsDataURL(file);
  }

  private updateAvatarInDOM(avatarUrl: string) {
    const fullAvatarUrl = avatarUrl.startsWith("http")
      ? avatarUrl
      : `https://ya-praktikum.tech/api/v2/resources${avatarUrl}`;

    this.user.avatar = fullAvatarUrl;

    const avatarImg = this.element?.querySelector(
      ".avatar-image"
    ) as HTMLImageElement;
    if (avatarImg) {
      avatarImg.src = fullAvatarUrl;
      avatarImg.alt = "Аватар";
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

  protected render() {
    return this.compile(profileTemplate, {
      ...this.props,
      user: this.user,
      currentYear: String(new Date().getFullYear()),
    });
  }
}

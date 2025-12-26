import { View } from '../View';
import { template } from '../../utils/template';
import { attachFormValidation } from '../../utils/validation';
import { Block } from '../../core/Block';

interface ProfileFormData {
  email: string;
  login: string;
  first_name: string;
  second_name: string;
  display_name?: string;
  phone: string;
  avatar?: string;
}

export class Profile extends View {
  private profileData: ProfileFormData;
  private avatarInput: HTMLInputElement | null = null;
  private avatarPreview: HTMLImageElement | null = null;

  constructor() {
    super({});
    this.profileData = {
      email: '',
      login: '',
      first_name: '',
      second_name: '',
      display_name: '',
      phone: '',
    };
    this.loadProfileData();
    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  protected componentDidMount(): void {
    this.loadProfileData();
    this.updateFormFields();
    this.attachAvatarHandlers();
    const form = this.element?.querySelector('form');
    if (form) {
      attachFormValidation(form);
      form.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries()) as Record<string, string>;
        
        const profileData: ProfileFormData = {
          email: data.email || '',
          login: data.login || '',
          first_name: data.first_name || '',
          second_name: data.second_name || '',
          display_name: data.display_name || '',
          phone: data.phone || '',
          avatar: this.profileData.avatar || '',
        };


        localStorage.setItem('profile_email', profileData.email);
        localStorage.setItem('profile_login', profileData.login);
        localStorage.setItem('profile_first_name', profileData.first_name);
        localStorage.setItem('profile_second_name', profileData.second_name);
        localStorage.setItem('profile_display_name', profileData.display_name || '');
        localStorage.setItem('profile_phone', profileData.phone);
        if (profileData.avatar) {
          localStorage.setItem('profile_avatar', profileData.avatar);
        }

        this.profileData = profileData;
        alert('Профиль успешно сохранен!');
        this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
      });
    }
  }

  private attachAvatarHandlers(): void {
    this.avatarInput = this.element?.querySelector('#avatar-input') || null;
    this.avatarPreview = this.element?.querySelector('#avatar-preview') || null;
    const avatarLabel = this.element?.querySelector('.profile__avatar-label');

    if (this.avatarInput && this.avatarPreview) {
      this.avatarInput.addEventListener('change', (e: Event) => {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: ProgressEvent<FileReader>) => {
            const dataUrl = event.target?.result as string;
            if (this.avatarPreview) {
              this.avatarPreview.src = dataUrl;
              this.avatarPreview.style.display = 'block';
            }
            this.profileData.avatar = dataUrl;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (avatarLabel) {
      avatarLabel.addEventListener('click', () => {
        this.avatarInput?.click();
      });
    }
  }

  private updateFormFields(): void {
    const form = this.element?.querySelector('form');
    if (form) {
      const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
      const loginInput = form.querySelector<HTMLInputElement>('input[name="login"]');
      const firstNameInput = form.querySelector<HTMLInputElement>('input[name="first_name"]');
      const secondNameInput = form.querySelector<HTMLInputElement>('input[name="second_name"]');
      const phoneInput = form.querySelector<HTMLInputElement>('input[name="phone"]');

      if (emailInput) emailInput.value = this.profileData.email;
      if (loginInput) loginInput.value = this.profileData.login;
      if (firstNameInput) firstNameInput.value = this.profileData.first_name;
      if (secondNameInput) secondNameInput.value = this.profileData.second_name;
      if (phoneInput) phoneInput.value = this.profileData.phone;
    }
  }

  private loadProfileData(): void {
    this.profileData = {
      email: localStorage.getItem('profile_email') || '',
      login: localStorage.getItem('profile_login') || '',
      first_name: localStorage.getItem('profile_first_name') || '',
      second_name: localStorage.getItem('profile_second_name') || '',
      display_name: localStorage.getItem('profile_display_name') || '',
      phone: localStorage.getItem('profile_phone') || '',
      avatar: localStorage.getItem('profile_avatar') || '',
    };
  }

  protected render(): DocumentFragment {
    if (!this.profileData) {
      return new DocumentFragment();
    }

    const htmlString = template(
      `
        <div class="page page_centered">
          <div class="page__container">
            <h1 class="page__title">Профиль</h1>
            
            <div class="profile__avatar-wrapper">
              <label class="profile__avatar-label" for="avatar-input">
                <img 
                  id="avatar-preview" 
                  class="profile__avatar-preview" 
                  src="${this.profileData.avatar || ''}" 
                  alt="Avatar"
                  style="display: ${this.profileData.avatar ? 'block' : 'none'}"
                />
                <span class="profile__avatar-placeholder ${this.profileData.avatar ? 'profile__avatar-placeholder_hidden' : ''}">
                  Загрузить аватар
                </span>
              </label>
              <input 
                type="file" 
                id="avatar-input" 
                name="avatar"
                accept="image/*" 
                style="display: none"
              />
            </div>

            <form class="form profile__form">
              <div class="input-wrapper">
                <label class="input-label">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email" 
                  class="input"
                  value="${this.profileData.email}"
                />
                <span class="input-error"></span>
              </div>

              <div class="input-wrapper">
                <label class="input-label">Логин</label>
                <input 
                  type="text" 
                  name="login" 
                  placeholder="Логин" 
                  class="input"
                  value="${this.profileData.login}"
                />
                <span class="input-error"></span>
              </div>

              <div class="input-wrapper">
                <label class="input-label">Имя</label>
                <input 
                  type="text" 
                  name="first_name" 
                  placeholder="Имя" 
                  class="input"
                  value="${this.profileData.first_name}"
                />
                <span class="input-error"></span>
              </div>

              <div class="input-wrapper">
                <label class="input-label">Фамилия</label>
                <input 
                  type="text" 
                  name="second_name" 
                  placeholder="Фамилия" 
                  class="input"
                  value="${this.profileData.second_name}"
                />
                <span class="input-error"></span>
              </div>

              <div class="input-wrapper">
                <label class="input-label">Имя в чате</label>
                <input 
                  type="text" 
                  name="display_name" 
                  placeholder="Имя в чате" 
                  class="input"
                  value="${this.profileData.display_name || ''}"
                />
                <span class="input-error"></span>
              </div>

              <div class="input-wrapper">
                <label class="input-label">Телефон</label>
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="Телефон" 
                  class="input"
                  value="${this.profileData.phone}"
                />
                <span class="input-error"></span>
              </div>

              <button type="submit" class="button button_primary" disabled>Сохранить</button>
            </form>
            <a href="/chats" data-link class="link">Назад к чатам</a>
          </div>
        </div>
      `,
      {}
    );

    const fragment = document.createElement('template');
    fragment.innerHTML = htmlString;
    return fragment.content;
  }
}

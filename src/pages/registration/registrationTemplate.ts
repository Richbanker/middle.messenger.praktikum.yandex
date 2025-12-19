export const registrationTemplate = `
<div class="registration-page">
  <div class="registration-container">
    <div class="registration-form__header">
      <h1 class="registration-form__title">{{title}}</h1>
      <p class="registration-form__subtitle">{{subtitle}}</p>
    </div>

    <form class="form" id="regForm">
      {{> formInputGroup
        id="first_name"
        label="Имя"
        type="text"
        name="first_name"
        required=true
        placeholder="Введите ваше имя"
        icon="user"
        autocomplete="given-name"
      }}

      {{> formInputGroup
        id="second_name"
        label="Фамилия"
        type="text"
        name="second_name"
        required=true
        placeholder="Введите вашу фамилию"
        icon="user"
        autocomplete="family-name"
      }}

      {{> formInputGroup
        id="login"
        label="Логин"
        type="text"
        name="login"
        required=true
        placeholder="Введите логин"
        icon="login"
        autocomplete="username"
      }}

      {{> formInputGroup
        id="email"
        label="Email"
        type="email"
        name="email"
        required=true
        placeholder="Введите email"
        icon="message"
        autocomplete="email"
      }}

      {{> formInputGroup
        id="password"
        label="Пароль"
        type="password"
        name="password"
        required=true
        placeholder="Введите пароль"
        icon="lock"
        autocomplete="new-password"
      }}

      {{> formInputGroup
        id="phone"
        label="Телефон"
        type="tel"
        name="phone"
        required=true
        placeholder="Введите телефон"
        icon="phone"
        autocomplete="tel"
      }}

      {{> btn
        type="submit"
        text="СОЗДАТЬ АККАУНТ"
        icon="user-add"
        pulse=true
      }}

      <p class="terms">
        Нажимая кнопку, вы соглашаетесь с
        <a class="terms__link" href="#">Условиями обслуживания</a><br />
        и
        <a class="terms__link" href="#">Политикой конфиденциальности</a>
        Messenger
      </p>
    </form>

    <div class="registration-form__footer">
      УЖЕ ЕСТЬ АККАУНТ?
      <a href="/" class="neon-link">ВОЙТИ</a>
    </div>
  </div>
</div>
`;


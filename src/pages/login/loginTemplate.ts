export const loginTemplate = `<div class="login-page">
  <div class="login-container">
    <div class="login-header">
      <h1 class="login-title">{{title}}</h1>
      <p class="login-subtitle">{{subtitle}}</p>
    </div>

    <form class="login-form" id="loginForm">
      {{> formInputGroup
        id="login"
        label="Логин"
        type="text"
        name="login"
        required=true
        placeholder="Введите логин"
        autocomplete="username"
      }}

      {{> formInputGroup
        id="password"
        label="Пароль"
        type="password"
        name="password"
        required=true
        placeholder="Введите пароль"
        autocomplete="current-password"
      }}

      <div class="form-actions">
        {{> btn text="Войти" type="submit" }}
      </div>

      <div class="login-links">
        <a href="/password-recovery" class="login-link">Забыли пароль?</a>
        <a href="/sign-up" class="login-link">Создать аккаунт</a>
      </div>
    </form>

    <div class="login-social">
      <p class="social-title">Или войдите через</p>
      <div class="social-buttons">
        {{> btn text="Google" type="button" onClick="loginWithGoogle()" }}
        {{> btn text="GitHub" type="button" onClick="loginWithGithub()" }}
      </div>
    </div>
  </div>
</div>`;

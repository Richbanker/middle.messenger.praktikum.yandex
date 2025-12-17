export const profileTemplate = `
<div class="profile-page">
  <div class="profile-container">
    <div class="profile-header">
      <h1 class="profile-title">{{title}}</h1>
      <div class="profile-avatar">
        <div class="avatar-wrapper">
          <img src="{{user.avatar}}" alt="Аватар" class="avatar-image" />
          <div class="avatar-overlay">{{> icon name="edit"}}</div>
          <input
            type="file"
            id="avatarUpload"
            accept="image/*"
            class="avatar-input"
          />
        </div>
      </div>
    </div>

    <form class="profile-form" id="profileForm" onsubmit="return false;">
      {{> formInputGroup
        id="email"
        label="E-MAIL"
        type="email"
        name="email"
        value=user.email
        required=true
        icon="message"
      }}

      {{> formInputGroup
        id="login"
        label="ЛОГИН"
        type="text"
        name="login"
        value=user.login
        required=true
        icon="login"
      }}

      {{> formInputGroup
        id="firstName"
        label="ИМЯ"
        type="text"
        name="first_name"
        value=user.first_name
        required=true
        icon="user"
      }}

      {{> formInputGroup
        id="lastName"
        label="ФАМИЛИЯ"
        type="text"
        name="second_name"
        value=user.second_name
        required=true
        icon="user"
      }}

      {{> formInputGroup
        id="displayName"
        label="ИМЯ В ЧАТЕ"
        type="text"
        name="display_name"
        value=user.display_name
        required=true
        icon="message"
      }}

      {{> formInputGroup
        id="phone"
        label="ТЕЛЕФОН"
        type="tel"
        name="phone"
        value=user.phone
        required=true
        icon="phone"
      }}

      <div class="form-actions">
        {{> btn text="СОХРАНИТЬ" type="submit" pulse=true icon="save" data-action="submitProfile" }}
      </div>
    </form>

    <div class="profile-actions">
      {{> btn
        text="ИЗМЕНИТЬ ПАРОЛЬ"
        variant="outline"
        icon="lock"
        data-action="openPasswordModal"
      }}

      {{> btn
        text="ВЫЙТИ"
        variant="danger"
        icon="logout"
        data-action="logout"
      }}
    </div>
  </div>

  <!-- Модальное окно смены пароля -->
  <div class="modal" id="passwordModal">
    <div class="modal-content">
      <h2 class="modal-title">СМЕНА ПАРОЛЯ</h2>

      <form id="passwordForm">
        {{> formInputGroup
          id="oldPassword"
          label="ТЕКУЩИЙ ПАРОЛЬ"
          type="password"
          name="oldPassword"
          required=true
          icon="lock"
        }}

        {{> formInputGroup
          id="newPassword"
          label="НОВЫЙ ПАРОЛЬ"
          type="password"
          name="newPassword"
          required=true
          icon="lock"
        }}

        {{> formInputGroup
          id="confirmNewPassword"
          label="ПОДТВЕРДИТЕ ПАРОЛЬ"
          type="password"
          name="confirmNewPassword"
          required=true
          icon="lock"
        }}

        <div class="modal-actions">
          {{> btn text="СОХРАНИТЬ" type="submit" icon="save" }}
          {{> btn text="ОТМЕНА" type="button" variant="outline" data-action="closePasswordModal" }}
        </div>
      </form>
    </div>
  </div>
</div>
`;

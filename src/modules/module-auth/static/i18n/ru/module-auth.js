module.exports = {
  errors: {
    notRolesOr: 'У вас должна быть хоть бы одна роль из списка: {{roles}}',
    notRolesAnd: 'У вас должны быть все роли из списка: {{roles}}',
    notPermissionsOr: 'У вас должно быть хоть бы одно разрешение из списка: {{permissions}}',
    notPermissionsAnd: 'У вас должны быть все разрешения из списка: {{permissions}}',
    wrongUserCredentials: 'Некорректно введенные данные.',
    missingPassword: 'Введите пароль.',

    'Invalid user credentials': 'Некорректно введенные данные.',
  },

  pages: {
    SignupPage: {
      title: 'Регистрация',
      fields: {
        username: {
          label: 'Пользователь',
          placeholder: 'Введите логин',
          title: 'Имя пользователя',
        },
        password: {
          label: 'Пароль',
          placeholder: 'Введите пароль',
          title: 'Пароль пользователя',
        },
        email: {
          label: 'Почта',
          placeholder: 'Введите email',
          title: 'Почта пользователя',
        },
        displayName: {
          label: 'Отображаемое имя',
          placeholder: 'Введите имя',
          title: 'Имя пользователя, которое будет всем видно',
        },
      },
      submitButton: 'Регистрация',
      signinButton: 'Вход',
      cancelButton: 'Отменить',
    },
    SigninPage: {
      title: 'Вход',
      description: 'Страница входа',
      fields: {
        username: {
          label: 'Пользователь',
          placeholder: 'Введите логин',
          title: 'Имя пользователя',
        },
        loginEmail: {
          label: 'Email',
          placeholder: 'Введите почту',
          title: 'Почта пользователя',
        },
        password: {
          label: 'Пароль',
          placeholder: 'Введите пароль',
          title: 'Пароль пользователя',
        },
      },
      loginButton: 'Войти',
      loginCancelButton: 'Отмена',
      signup: 'Регистрация',
      forgotPassword: 'Забыли пароль?',

      googleSigninButton: 'Войти через Google',
      vkontakteSigninButton: 'Войти через VK',
      facebookSigninButton: 'Продолжить с Facebook',
    },
    ForgotPage: {
      title: 'Восстановление пароля',
      fields: {
        email: 'Введите почту',
      },
      submitButton: 'Сбросить пароль',
      submitSuccessMessage: 'На вашу почту {{email}} отослано сообщение с ссылкой для смены пароля',
      goToIndexPage: 'Вернуться на главную',
    },
    ResetPage: {
      title: 'Обновление пароля',
      fields: {
        newPassword: 'Введите новый пароль',
      },
      submitButton: 'Обновить',
      signinButton: 'Войти',
      cancelButton: 'Закрыть',
      submitSuccessMessage: 'Пароль успешно изменен',
      goToIndexPage: 'Вернуть на главную',
    },
  },

  containers: {
    AuthErrorContainer: {
      sessionExpire: 'Ваша сессия истекла. Пожалуйста перелогиньтесь.',
      actionGoToLogin: 'Перейти на страницу логина',
    },
    AuthCheckWrapper: {
      notRoles: 'У вас нет подходящих ролей ({{roles}})',
      notPermissions: 'У вас не хватает права ({{permissions}})',
    },
  },
};

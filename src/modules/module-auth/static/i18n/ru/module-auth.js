module.exports = {
  pages: {
    SignupPage: {
      title: 'Регистрация',
      fields: {
        username: {
          label: 'Пользователь',
          placeholder: 'Введите логин',
          hint: 'Имя пользователя',
        },
        password: {
          label: 'Пароль',
          placeholder: 'Введите пароль',
          hint: 'Пароль пользователя',
        },
        email: {
          label: 'Почта',
          placeholder: 'Введите email',
          hint: 'Почта пользователя',
        },
        displayName: {
          label: 'Отображаемое имя',
          placeholder: 'Введите имя',
          hint: 'Имя пользователя, которое будет всем видно',
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
          hint: 'Имя пользователя',
        },
        loginEmail: {
          label: 'Email',
          placeholder: 'Введите почту',
          hint: 'Почта пользователя',
        },
        password: {
          label: 'Пароль',
          placeholder: 'Введите пароль',
          hint: 'Пароль пользователя',
        },
      },
      loginButton: 'Войти',
      loginCancelButton: 'Отмена',
      signup: 'Регистрация',
      forgotPassword: 'Забыли пароль?',
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
      notPermissions: 'У вас не хватает прав ({{permissions}})',
    },
  },
};
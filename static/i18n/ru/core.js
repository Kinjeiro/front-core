module.exports = {
  app: {
    title: 'Личный кабинет',
    description: 'Описание личного кабинета',
  },

  languages: {
    ru: 'Русский',
    en: 'Английский',
  },

  errors: {
    clientErrorTitleDefault: 'Ошибка',
    clientErrorMessageDefault: 'Произошла ошибка',
    errorWhileParseToUniError: "@RU Can't convert to UniError.",

    authServerNotResponse: 'Авторизационный сервер не отвечает.',
    wrongUserCredentials: 'Некорректно введенные данные.',
    missingPassword: 'Введите пароль.',
    notAuthorize: 'Не авторизован.',
    mockUserNotFound: 'Не найден замокированный пользователь.',
  },

  pages: {
    StubPage: {
      title: 'Главная страница',
      description: 'Описание главное страницы',
      pageTitle: 'Корная страница-заглушка',
      languagesLabel: 'Языки',
      currentUserTitle: 'Текущий пользователь',
      changeUserButton: 'Сменить пользователя',
      domainTitle: '@RU Domain',
      createTestDomainButton: '@RU Create TestDomain',
      testErrorNotification: '@RU Test error Notification',
    },
    SignupPage: {
      title: 'Регистрация',
      fields: {
        username: 'Логин',
        password: 'Пароль',
        email: 'Почта',
        displayName: 'Отображаемое имя',
      },
      submitButton: 'Регистрация',
      cancelButton: 'Отменить',
    },
    SigninPage: {
      title: 'Логин',
      description: 'Страница логина',
      fields: {
        userNameLabel: 'Логин',
        passwordLabel: 'Пароль',
      },
      loginButton: 'Войти',
      loginCancelButton: 'Отмена',
      signup: 'Регистрация',
      forgotPassword: 'Забыл пароль',
    },
    ForgotPage: {
      title: 'Восстановление пароля',
      fields: {
        email: 'Введите почту',
      },
      submitButton: 'Сбросить пароль',
      submitSuccessMessage: 'На вашу почту {{email}} отослано сообщение с ссылкой для смены пароля',
    },
    ResetPage: {
      title: 'Обновление пароля',
      fields: {
        newPassword: 'Введите новый пароль',
      },
      submitButton: 'Обновить',
      submitSuccessMessage: 'Пароль успешно изменен',
      goToIndexPage: 'На главную',
    },
    ErrorPage: {
      returnTo: 'Вернуться к ',
      indexPage: 'Начальная страница',
    },
    Info404: {
      pageNotFoundError: 'Страница не найдена',
      returnTo: 'Вернуться к',
      indexPage: 'Начальная страница',
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

  components: {
    Loading: {
      loading: 'Загрузка...',
    },
    UniError: {
      errorOccurred: 'Произошла ошибка',
      showDetails: 'Показать детали',
    },
    ReadMore: {
      more: 'Еще',
    },
  },
};

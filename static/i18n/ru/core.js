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
    clientErrorMessageDefault: 'Произошла ошибка.',
    errorWhileParseToUniError: "@RU Can't convert to UniError.",

    authServerNotResponse: 'Авторизационный сервер не отвечает.',
    wrongUserCredentials: 'Некорректно введенные данные.',
    missingPassword: 'Введите пароль.',
    notAuthorize: 'Не авторизован.',
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
    LoginPage: {
      title: 'Логин',
      description: 'Страница логина',
      userNameLabel: 'Логин',
      passwordLabel: 'Пароль',
      loginButton: 'Войти',
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

  components: {
    Loading: {
      loading: 'Загрузка...',
    },
    UniError: {
      errorOccurred: 'Произошла ошибка',
      showDetails: 'Показать детали',
    },
  },
};

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
    clientErrorTitleDefault: '@RU Error',
    clientErrorMessageDefault: '@RU Sorry. An error has occurred.',
    errorWhileParseToUniError: "@RU Can't convert to UniError.",

    authServerNotResponse: "@RU Authenticated server doesn't response.",
    wrongUserCredentials: '@RU Invalid user credentials.',
    missingPassword: '@RU Missing required parameter: password.',
    notAuthorize: '@RU Not authorize.',
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
      title: '@RU Login',
      description: '@RU Login page',
      userNameLabel: '@RU Username',
      passwordLabel: '@RU Password',
      loginButton: '@RU Login',
    },
    ErrorPage: {
      returnTo: '@RU Return to',
      indexPage: '@RU index page',
    },
    Info404: {
      pageNotFoundError: '@RU Page not found',
      returnTo: '@RU Return to',
      indexPage: '@RU index page',
    },
  },

  components: {
    Loading: {
      loading: 'Загрузка...',
    },
    UniError: {
      errorOccurred: '@RU An error has occurred',
      showDetails: '@RU show details',
    },
  },
};

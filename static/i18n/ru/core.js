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
    ErrorBoundary: {
      header: 'Произошла ошибка',
      refreshButton: 'Обновить',
    },
  },
};

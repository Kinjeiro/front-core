module.exports = {
  app: {
    title: '[EN] Cabinet',
    description: '[EN] Cabinet description',
  },

  languages: {
    ru: 'Russian',
    en: 'English',
  },

  errors: {
    clientErrorTitleDefault: 'Error',
    clientErrorMessageDefault: 'Sorry. An error has occurred',
    errorWhileParseToUniError: "Can't convert to UniError.",

    authServerNotResponse: "Authenticated server doesn't response.",
    wrongUserCredentials: 'Invalid user credentials.',
    missingPassword: 'Missing required parameter: password.',
    notAuthorize: 'Not authorize.',
    mockUserNotFound: 'Mock user not found',
  },

  pages: {
    StubPage: {
      title: 'Main page',
      description: 'Main page description',
      pageTitle: 'Core STUB Page',
      languagesLabel: 'Languages',
      currentUserTitle: 'Current user',
      changeUserButton: 'Change user',
      domainTitle: 'Domain',
      createTestDomainButton: 'Create TestDomain',
      testErrorNotification: 'Test error Notification',
    },
    LoginPage: {
      title: 'Login',
      description: 'Login page',
      userNameLabel: 'Username',
      passwordLabel: 'Password',
      loginButton: 'Login',
    },
    ErrorPage: {
      returnTo: 'Return to',
      indexPage: 'index page',
    },
    Info404: {
      pageNotFoundError: 'Page not found',
      returnTo: 'Return to',
      indexPage: 'index page',
    },
  },

  components: {
    Loading: {
      loading: 'Loading...',
    },
    UniError: {
      errorOccurred: 'An error has occurred',
      showDetails: 'show details',
    },
    ReadMore: {
      more: 'more',
    },
  },
};

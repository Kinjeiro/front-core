module.exports = {
  app: {
    title: 'Cabinet',
    description: 'Cabinet description',
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
    SignupPage: {
      title: 'Sign up',
      fields: {
        username: 'Login',
        password: 'Password',
        email: 'Email',
        displayName: 'Display name',
      },
      submitButton: 'Sign up',
      cancelButton: 'Cancel',
    },
    SigninPage: {
      title: 'Login',
      description: 'Login page',
      fields: {
        userNameLabel: 'Username',
        passwordLabel: 'password',
      },
      loginButton: 'Log in',
      loginCancelButton: 'Cancel',
      signup: 'Sign up',
      forgotPassword: 'Forgot password',
    },
    ForgotPage: {
      title: 'Forgot password',
      fields: {
        email: 'Email',
      },
      submitButton: 'Reset password',
      submitSuccessMessage: 'Message with reset password link send to your email {{email}}.',
    },
    ResetPage: {
      title: 'Reset password',
      fields: {
        newPassword: 'New password',
      },
      submitButton: 'Update',
      submitSuccessMessage: 'Password has been updated',
      goToIndexPage: 'To index page',
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

  containers: {
    AuthErrorContainer: {
      sessionExpire: 'Your session has expired. Please relogin.',
      actionGoToLogin: 'Go to login page',
    },
    AuthCheckWrapper: {
      notPermissions: 'You haven\'t permissions ({{permissions}})',
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

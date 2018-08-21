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
        username: {
          label: 'Login',
          placeholder: 'Enter login',
          hint: 'User login',
        },
        password: {
          label: 'Password',
          placeholder: 'Enter password',
          hint: 'User password',
        },
        email: {
          label: 'Email',
          placeholder: 'Enter email',
          hint: 'User email',
        },
        displayName: {
          label: 'Display name',
          placeholder: 'Enter display name',
          hint: 'User name to be displayed for other users',
        },
      },
      submitButton: 'Sign up',
      signinButton: 'Sign in',
      cancelButton: 'Cancel',
    },
    SigninPage: {
      title: 'Sign in',
      description: 'Login page',
      fields: {
        username: {
          label: 'Login',
          placeholder: 'Enter login',
          hint: 'User login',
        },
        loginEmail: {
          label: 'Email',
          placeholder: 'Enter email',
          hint: 'User email',
        },
        password: {
          label: 'Password',
          placeholder: 'Enter password',
          hint: 'User password',
        },
      },
      loginButton: 'Sign in',
      loginCancelButton: 'Cancel',
      signup: 'Sign up',
      forgotPassword: 'Forgot password?',
    },
    ForgotPage: {
      title: 'Forgot password',
      fields: {
        email: 'Email',
      },
      submitButton: 'Reset password',
      submitSuccessMessage: 'Message with reset password link send to your email {{email}}.',
      goToIndexPage: 'Go to index page',
    },
    ResetPage: {
      title: 'Reset password',
      fields: {
        newPassword: 'New password',
      },
      submitButton: 'Update',
      signinButton: 'Signin',
      cancelButton: 'Close',
      submitSuccessMessage: 'Password has been updated',
      goToIndexPage: 'Go to index page',
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
    CoreForm: {
      textActionSubmit: 'Send',
      textActionCancel: 'Cancel',
    },
    CoreField: {
      errors: {
        requiredError: 'Field "{{fieldName}}" is required.',
        multipleMinSize: 'Field "{{fieldName}}" must contains at least {{multipleMinSize}} values.',
        multipleMaxSize: 'Field "{{fieldName}}" must contains no more than {{multipleMaxSize}} values.',
      },
    },
    CoreSelect: {
      placeholder: 'Choice option...',
    },
    ErrorBoundary: {
      header: 'Error occurs',
      refreshButton: 'Refresh',
    },
  },
};

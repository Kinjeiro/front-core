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
      textDefaultFormErrorText: 'Form has errors',
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

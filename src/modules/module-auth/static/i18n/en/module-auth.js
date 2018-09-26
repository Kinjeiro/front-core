module.exports = {
  pages: {
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
};
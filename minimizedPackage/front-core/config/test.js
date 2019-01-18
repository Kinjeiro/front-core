/* eslint-disable no-param-reassign,no-shadow,import/no-dynamic-require,no-unused-vars */
// const { createEndpointServiceConfig } = require('./utils/create-config');

module.exports = {
  common: {
    features: {
      // auth: {
      //   allowSignup: true,
      //   allowResetPasswordByEmail: true
      // }
    }
  },
  server: {
    features: {
      mocking: {
        // authMock: false
        // enable: true,
        // useMocks: true,
        // authMock: true
      }
    }
  }
};

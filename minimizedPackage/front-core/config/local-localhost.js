module.exports = {
  common: {
    features: {
      // todo @ANKU @CRIT @MAIN - отключили временно авторизацию
      // auth: false,
      auth: {
        /**
         * чаше всего необходимо для открытых систем, а для enterprise обычно не надо
         */
        allowSignup: true,
        aliasIdAsUsername: true,

        mockUsers: {
          ivanovIUserId: 'hCkFbnbn2',
          korolevaUUserId: 'K-_hgeo8bX'
        }
      }
    }
  },
  server: {
    features: {
      mocking: {
        // authMock: false
        authMock: true
      }
    }
  }
};

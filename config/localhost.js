/* eslint-disable no-param-reassign,no-shadow,import/no-dynamic-require,no-unused-vars */
const { createEndpointServiceConfig } = require('./utils/create-config');

const {
  /** Марафон при запуска автоматически добавляет адресс хоста в эту переменную */
  HOST,
  /** Когда запускаем на localhost или нужно на стендах зашить */
  SERVICES_HOST,
  SERVICES_PORT = 80,
  SERVICES_PROTOCOL,
  /** Первый запуск мидловых сервисов бывает до 20 сек*/
  REQUEST_TIMEOUT = 120000,
  PROXY_PORT = 9090
} = process.env;

module.exports = {
  common: {
    features: {
      // todo @ANKU @CRIT @MAIN - отключили временно авторизацию
      // auth: false,
    }
  },
  server: {
    main: {
      devtools: true,
      proxyAssets: {
        host: 'localhost',
        port: PROXY_PORT
      }
    },


    features: {
      mocking: {
        // authMock: false
        authMock: true
      }
    }
  }
};

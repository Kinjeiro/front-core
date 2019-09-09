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
      // auth: false,
      auth: {
        /**
         * чаше всего необходимо для открытых систем, а для enterprise обычно не надо
         */
        allowSignup: true,
        aliasIdAsUsername: true,

        mockUsers: {
          ivanovIUserId: '8fHHbu8SMf',
          korolevaUUserId: 'HmsLfHcrcv'
        },
        socialProvides: {
          google: true,
          vkontakte: true,
          facebook: true
        }
      }
      // preLoader: {
      //   autoClose: 30000
      // }
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
      },

      auth: {
        realm: 'front-core',

        // Настройки для аутентификации клиента в keyclock
        // http://185.22.63.233:8080/auth/admin/master/console/#/realms/exporter/clients/5c08dfc5-2c1e-4396-9071-1da98b95796e/credentials
        applicationClientInfo: {
          client_id: 'front-core',
          client_secret: '601f22c2-7c6d-40a7-8101-02df63033222'
        }
      },

      attachments: {
        /**
         * accessPublic - все у кого есть ссылка
         * accessAuth - только авторизованные пользователи
         * accessOwnerOnly - только тот, кто создал (ну и админ ;))
         * <permission> - пермишен специальный
         */
        defaultAccess: 'accessPublic'
      }
    },

    endpointServices: {
      // ======================================================
      // AUTH Services - keycloak
      // ======================================================
      serviceAuth: createEndpointServiceConfig({
        protocol: 'https',
        host: '185.22.63.233',
        port: 443,
        endpoint: 'auth',
        requestOptions: {
          // игнорировать, что сертификат не подписан
          rejectUnauthorized: false
        }
      }),
      serviceUsers: createEndpointServiceConfig({
        protocol: 'https',
        host: '185.22.63.233',
        port: 443,
        endpoint: 'auth',
        requestOptions: {
          // игнорировать, что сертификат не подписан
          rejectUnauthorized: false
        }
      })
    }
  }
};

/* eslint-disable no-param-reassign,no-shadow,import/no-dynamic-require,no-unused-vars */
const path = require('path');

const {
  FRONT_UI_SERVER_API_PREFIX,
  createApiConfig,
  // createApiConfigWithService,
  createEndpointServiceConfig
} = require('./utils/create-config');

/*
 @guide - КОНФИГИ только для NODE СЕРВЕРА
 благодаря плагину https://github.com/lorenwest/node-config/wiki/Environment-Variables
 в зависимости от ENV дополняет этот файл файлом с соответствующим именем (dev.js или production.js)
 и потом в проекте просто подключается в любом месте
 import config from 'config';
 const test = config.get('anyValue.anyParam')

 Потом часть из этих конфигов (из блоков common и client) через state передаются на клиент
 см \src\server\plugins\pages\index.jsx defaultState (app.clientConfig)
 и потом доступны через src/client-configs.js
 */

function isTrue(value) {
  // eslint-disable-next-line eqeqeq
  return value === 'true' || value == 1 || value === true; // eslint-disable-next-line
}

/*
  @NOTE: не забудьте добавить их проксирование в webpack
 ..\webpack.config.js
 ..\webpack.backend.config.js

   webpackConfig.plugins.push(
     //new webpack.DefinePlugin({
     //  'process.env': {
     //    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
     //    HOT_LOADER: JSON.stringify(process.env.HOT_LOADER)
     //  }
     //})
     new webpack.EnvironmentPlugin([
       'PROJECT_NAME',
       'APP_ID',
       'SERVICES_HOST',
       'SERVICES_PORT',
       'CONTEXT_ROOT',
       'SERVER_PORT',
       'PROXY_PORT',
       'NODE_ENV',
       'HOT_LOADER',
       'CLIENT_SIDE_RENDERING',
       'APP_MOCKS'
     ])
   );
*/
const {
  NODE_ENV = 'development',

  PROJECT_NAME,
  // в webpack достаются из package.json
  // APP_ID,
  // APP_VERSION,

  /** Марафон при запуска автоматически добавляет адресс хоста в эту переменную */
  HOST,
  /** Когда запускаем на localhost или нужно на стендах зашить */
  SERVICES_HOST,
  SERVICES_PORT = 80,
  SERVICES_PROTOCOL,

  CONTEXT_ROOT = '',

  SERVER_PORT = 8080,
  PROXY_PORT = 9091,
  HOT_LOADER,
  CLIENT_SIDE_RENDERING,
  APP_MOCKS,
  USE_MOCKS,
  /** Первый запуск мидловых сервисов бывает до 20 сек*/
  REQUEST_TIMEOUT = 120000,
  LOGS_PATH = path.join(process.cwd(), '/logs/all.log')
} = process.env;

// console.warn('Server process.env', process.env);

// Так как мы теперь используем этот файл только во время webpack можем читать из json
const packageJson = require(path.join(process.cwd(), 'package.json'));
const APP_ID = packageJson.name;
const APP_VERSION = packageJson.version;

const FINAL_SERVICES_HOST = HOST || SERVICES_HOST || 'localhost';

const isProduction = NODE_ENV === 'production';
const isLocalhost = NODE_ENV === 'localhost';
const isTest = NODE_ENV === 'test';


// const apiWithService = createApiConfigWithService.bind(null, 'http', FINAL_SERVICES_HOST, SERVICES_PORT);
const endpoint = (endpoint, otherConfigs = {}) => {
  if (typeof endpoint === 'object') {
    otherConfigs = endpoint;
    endpoint = '';
  }

  return createEndpointServiceConfig(Object.assign({
    host: FINAL_SERVICES_HOST,
    port: SERVICES_PORT,
    protocol: SERVICES_PROTOCOL,
    endpoint,
    timeout: REQUEST_TIMEOUT
  }, otherConfigs));
};


module.exports = {
  // ======================================================
  // ПУТЬ до родительских конфигов
  // ======================================================
  /*
    Если
    [string]
      - полный путь до папки или файла: C:/projectApp/node_modules/parentComponent/config
      - название компонента в node_modules с config папкой: parentComponent/config
      - название компонента в node_modules без папки (сама добавится): parentComponent
      - то же самое и для файлов
      * если это папка то ощется в ней default.js и {NODE_ENV}.js
    [function]
      - результат функции и будет конфигом
    [object]
      - конфиг-объект
  */
  parentConfigs: [],

  // ======================================================
  // ОБЩИЕ КОНФИГИ для КЛИЕНТА И СЕРВЕРА
  // ======================================================
  common: {
    projectName: PROJECT_NAME || APP_ID,
    appId: APP_ID,
    appVersion: APP_VERSION,

    env: NODE_ENV,
    isProduction,
    isLocalhost,
    isTest,

    hotLoader: !!HOT_LOADER && isLocalhost,
    isServerSideRendering: !isTrue(CLIENT_SIDE_RENDERING),
    isServer: true,

    cookieCSRF: 'cookie-csrf',
    serverApiPrefix: FRONT_UI_SERVER_API_PREFIX,

    app: {
      contextRoot: CONTEXT_ROOT
    },

    // ======================================================
    // ПЕРЕКЛЮЧАТЕЛИ ФИЧ - только флаги
    // ======================================================
    features: {
      auth: {
        globalAuth: true,
        // permissions - настройки прав, если permissions: false - отключает проверку прав
        permissions: []
      },

      date: {
        systemDateFormat: 'timestamp',
        systemDateTimeFormat: 'timestamp',
        dateFormat: 'DD.MM.YYYY',
        dateTimeFormat: 'DD.MM.YYYY HH:mm',
        serverDateFormat: 'timestamp',
        serverDateTimeForms: 'timestamp'
      },

      i18n: {
        i18nextOptions: {
          whitelist: ['ru', 'en'],
          fallbackLng: 'en',
          ns: ['core'],
          useCookieForDetect: true
          // todo @ANKU @LOW - вынести сюда название куки - I18N_LANGUAGE_COOKIE_NAME

          // ... other see in \src\server\plugins\i18n.js
          //             and https://www.i18next.com/configuration-options.html
        },
        assetsLoadPath: '/i18n/{{lng}}/{{ns}}.js'
      },

      bem: {
        separators: {
          element: '__',
          modifier: '--',
          value: '-'
        }
      },

      notifications: {
        ui: true,
        systemQueue: true
      }
    },

    apiConfig: {
      health: createApiConfig('/health')
    },

    // ======================================================
    // ПРОКСИРУЮЩИЕ апи
    // 1) вызывается на клиенте
    // 2) проходит через плагин на front ui сервере
    // 3) и c него отсылается по урлу на rest метод middleware сервиса
    // ======================================================
    apiConfigsWithService: {
      // example
      // anyProxyMiddlewareServiceMethod: apiWithService('any-middleware-service', 'path-to-method', 'get')
    }
  },

  // ======================================================
  // конфиги для КЛИЕНТА
  // ======================================================
  client: {
    store: {
      middlewares: {
        logger: true
      }
    },
    requestTimeout: REQUEST_TIMEOUT
  },

  server: {
    main: {
      port: SERVER_PORT,
      requestTimeout: REQUEST_TIMEOUT,
      devtools: true,

      proxyAssets: false,

      servicesHost: FINAL_SERVICES_HOST,
      servicesPort: SERVICES_PORT,
      apiPrefix: FRONT_UI_SERVER_API_PREFIX
    },

    features: {
      serverFeatures: {
        defaultServerOptions: {
          // hapi options - https://hapijs.com/api/15.2.0#server-options
          /* место хранения runtime данных на сервере (к примеру, для контекстов страниц ошибок) */
          app: {}
        },

        defaultRouteOptions: {
          // https://hapijs.com/api/15.2.0#route-options
          /*
           payload - controls how incoming payloads (request body) are processed:
             maxBytes - limits the size of incoming payloads to the specified byte count. Allowing very large payloads may cause the server to run out of memory. Defaults to 1048576 (1MB).
             uploads - the directory used for writing file uploads. Defaults to os.tmpDir().
          */
          payload: {
            maxBytes: 7000000 /* 7mb*/
          }
        }
      },

      // ======================================================
      // auth - настройки авторизации
      // ======================================================
      auth: {
        tokenParam: 'token',
        tokenCookie: 'token',
        refreshTokenCookie: 'refreshToken',

        // Настройки для аутентификации клиента в front-core-auth
        applicationClientInfo: {
          id: 'frontCore',
          secret: 'frontCorefrontCore',
          credentials: {}
        }
      },

      // ======================================================
      // Мокирование
      // ======================================================
      mocking: {
        // enable - нужно только чтобы включить мокирующие роуты, но не чтобы включить сам процесс мокирования (он включается через url ?mock=true или куки app-mocking:true)
        // see front-core\src\server\plugins\mocking.js::DEFAULT_OPTIONS
        enable: isTrue(APP_MOCKS) || isTrue(USE_MOCKS),
        useMocks: isTrue(USE_MOCKS),
        apiPrefix: FRONT_UI_SERVER_API_PREFIX,
        cookieEnableMocking: 'app-mocking',
        urlParamForEnableMocking: 'mock',
        mocksRouteBase: 'mocks',
        authMock: false
        // authMock: true
      },


      // ======================================================
      // ЛОГИРОВАНИЕ
      // ======================================================
      logger: {
        winston: {
          exitOnError: false
        },

        transports: {
          fileLogger: {
            id: 'fileLogger',
            type: 'file',
            level: 'info',
            filename: LOGS_PATH,
            handleException: true,
            json: true,
            maxSize: 5242880, // 5mb
            maxFiles: 2,
            prettyPrint: true,
            colorize: false,
            timestamp: true
          },
          consoleLogger: {
            id: 'consoleLogger',
            type: 'console',
            level: 'debug',
            // label: getFilePath(module),
            handleException: true,
            json: false,
            prettyPrint: true,
            colorize: true,
            timestamp: true
          },
          /* logstashLogger: {
           id: 'logstashLogger',
           type: 'logstash',
           host: '127.0.0.1',
           port: 28777,
           node_name: 'nodeName'
           },*/
          logstashLogger: false
        }
      }

      // todo @ANKU @LOW - под вопросом нужно ли yar включать (лишний id в куках)
      // ,
      // session: {
      //  yarOptions: {
      //    //see https://www.npmjs.com/package/yar
      //    maxCookieSize: 1024,
      //    cookieOptions: {
      //      password: 'passwordmustbelongerthan32characterssowejustmakethislonger',
      //      isSecure: false
      //    }
      //  }
      // }
    },

    // ======================================================
    // Endpoint middleware service with api methods
    //
    // Это могут быть
    // - либо Thrift services (подключаем node модули и из них дергаем методы
    // - либо обертки над rest метод
    // ======================================================
    endpointServices: {
      // ======================================================
      // AUTH Services - front-core-auth server
      // ======================================================
      authApiService: endpoint({ port: 1337 })
    }

    // рестовый сервисов не должно быть, для единообразия все запросы которые не проксируются через apiConfig.serviceUrl
    // должны быть обернуты в js сервисы (чтобы потом можно было их легко использовать в других проектах и вынести в отлельные репы,
    // как сделано в corporate services)
    // // ======================================================
    // // Only Rest services (рестовые сервисы, которые не проксируются через client api)
    // // ======================================================
    // restServices: {
    // }
  }
};


/* eslint-disable no-param-reassign,no-shadow,import/no-dynamic-require,no-unused-vars */
const path = require('path');

const {
  urlJoin,
  isUseFromCore,
  inCoreSrc,
  getI18nModules
} = require('../build-scripts/utils/path-utils');

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

  CONTEXT_PATH = '',
  /**
   * @deprecated - use CONTEXT_PATH
   */
  CONTEXT_ROOT = '',

  PORT,
  SERVER_PORT = 8080,
  // PROXY_PORT = 9090,
  HOT_LOADER,
  CLIENT_SIDE_RENDERING,
  APP_MOCKS,
  USE_MOCKS,
  DEBUG,
  /** Первый запуск мидловых сервисов бывает до 20 сек*/
  REQUEST_TIMEOUT = 120000,
  LOGS_PATH = path.join(process.cwd(), '/logs/all.log'),

  PROTECTOR_PASSWORD
} = process.env;

// console.warn('Server process.env', process.env);

const corePackageJson = require(path.resolve(__dirname, '..', 'package.json'));
// Так как мы теперь используем этот файл только во время webpack можем читать из json
const packageJson = require(path.join(process.cwd(), 'package.json'));
const APP_ID = packageJson.name;
const APP_VERSION = packageJson.version;


const FINAL_SERVICES_HOST = HOST || SERVICES_HOST || 'localhost';

const isProduction = NODE_ENV === 'production';
const isLocalhost = NODE_ENV === 'localhost';
const isTest = NODE_ENV === 'test';

const CONTEXT_PATH_FINAL = CONTEXT_PATH || CONTEXT_ROOT
  ? urlJoin('/', CONTEXT_PATH || CONTEXT_ROOT)
  : '';

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
    coreVersion: corePackageJson.version,

    env: NODE_ENV,
    isProduction,
    isLocalhost,
    isTest,
    isDebug: !DEBUG,

    hotLoader: !!HOT_LOADER && isLocalhost,
    isServerSideRendering: !isTrue(CLIENT_SIDE_RENDERING),
    isServer: true,

    cookieCSRF: 'cookie-csrf',
    serverApiPrefix: FRONT_UI_SERVER_API_PREFIX,

    app: {
      isCore: isUseFromCore(),
      contextRoot: CONTEXT_PATH_FINAL,
      contextPath: CONTEXT_PATH_FINAL
    },

    build: {
      minimize: isProduction
    },

    // ======================================================
    // ПЕРЕКЛЮЧАТЕЛИ ФИЧ - только флаги
    // ======================================================
    features: {
      auth: {
        globalAuth: true,
        // если сессия протухает, то над компонентами появляется модальное окно для входа в систему
        reLoginModalForm: true,
        // permissions - настройки прав, если permissions: false - отключает проверку прав
        permissions: [],
        // если произошло, что токен истек и отослалось 10 запросов, то первый заиспользует refresh_token а остальные упадут, так как предыдущий токен уже невалидный
        // поэтому после первого запроса нужно подождать пока на клиент придут обновленные данные и уже с ними отослать непрошедшие запросы
        // если 0 - то отключить
        retryWhenNotAuthErrorTimeout: 300,
        retryWhenNotAuthErrorAttempts: 2,

        /**
         * чаше всего необходимо для открытых систем, а для enterprise обычно не надо
         */
        allowSignup: false,
        allowResetPasswordByEmail: false,
        /**
         * Вместо логина используется email и тогда логин не обязателен и не показывается при регистрации
         */
        emailAsLogin: false,
        /**
         * если emailAsLogin: false и регистрация происходит благодаря username, то можно сделать, чтобы по умолчанию aliasId был равен введенному username
         * Без этого доступ к публичной страницы пользователя и его аватару осуществляется только по userId или пока в ручную не проставят aliasId
         */
        aliasIdAsUsername: false,

        socialProvides: {
          google: false,
          vkontakte: false,
          facebook: false
        },

        /**
         * Для тестовых пользователей генерятся уникальные userId на auth-server и чтобы можно было использовать их с моками и без, хорошо бы их тут определить
         * Чтобы на основе их защивать другие тестовые моковые данные, в которых нужно указывать userId
         */
        mockUsers: {
          ivanovIUserId: '11AaaAaa',
          korolevaUUserId: '22BbbBbb'
        },

        /**
         * название роли в базе
         */
        adminRoleName: 'admin'
      },

      date: {
        systemDateFormat: 'timestamp',
        systemDateTimeFormat: 'timestamp',
        dateFormat: 'DD.MM.YYYY',
        dateTimeFormat: 'DD.MM.YYYY HH:mm',
        serverDateFormat: 'timestamp',
        serverDateTimeFormat: 'timestamp'
      },

      i18n: {
        i18nextOptions: {
          whitelist: ['ru', 'en'],
          language: 'ru',
          fallbackLng: 'ru',
          ns: [
            'core',
            ...getI18nModules(inCoreSrc())
          ],
          useCookieForDetect: true,
          // todo @ANKU @LOW - вынести сюда название куки - I18N_LANGUAGE_COOKIE_NAME

          interpolation: {
            // всегда отображать по умолчанию html теги как есть
            escapeValue: false
          }

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
      },

      componentsBase: {
        logComponentBaseEvents: false
      },

      preLoader: {
        autoClose: 10,
        domId: 'PreLoader'
      }
    },

    apiConfig: {
      health: createApiConfig('/health')
    },
    // по умолчанию работает на относительному урлу (то есть клиентское api тамже где и выдается код страницы (на нод сервере))
    apiClientEndpoint: null,

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
      // todo @ANKU @LOW - проблема с переопределением, если в проектах переопределять, то нужно в них каждый раз дублировать есть ли SERVER_PORT из env
      port: PORT || SERVER_PORT,
      requestTimeout: REQUEST_TIMEOUT,
      devtools: true,

      proxyAssets: false,

      servicesHost: FINAL_SERVICES_HOST,
      servicesPort: SERVICES_PORT,
      apiPrefix: FRONT_UI_SERVER_API_PREFIX
    },

    features: {
      serverFeatures: {
        /**
         * @see https://hapijs.com/api/16.5.0#new-serveroptions
         */
        defaultServerOptions: {
          // hapi options - https://hapijs.com/api/15.2.0#server-options
          /* место хранения runtime данных на сервере (к примеру, для контекстов страниц ошибок) */
          app: {}
        },
        // server.connection(options)
        serverConnectionOptions: {
          /**
           * @see https://hapijs.com/api/16.5.0#route-options
           * \typings\hapi\hapi.d.ts - IRouteAdditionalConfigurationOptions
           */
          routes: {
            security: {
              xframe: true,
              noSniff: false
            },
            /**
             cors - the Cross-Origin Resource Sharing protocol allows browsers to make cross-origin API calls. CORS is required by web applications running inside a browser which are loaded from a different domain than the API server. CORS headers are disabled by default (false). To enable, set cors to true, or to an object with the following options:
               origin - a strings array of allowed origin servers ('Access-Control-Allow-Origin'). The array can contain any combination of fully qualified origins along with origin strings containing a wildcard '' character, or a single '' origin string. Defaults to any origin ['*'].
               maxAge - number of seconds the browser should cache the CORS response ('Access-Control-Max-Age'). The greater the value, the longer it will take before the browser checks for changes in policy. Defaults to 86400 (one day).
               headers - a strings array of allowed headers ('Access-Control-Allow-Headers'). Defaults to ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'].
               additionalHeaders - a strings array of additional headers to headers. Use this to keep the default headers in place.
               exposedHeaders - a strings array of exposed headers ('Access-Control-Expose-Headers'). Defaults to ['WWW-Authenticate', 'Server-Authorization'].
               additionalExposedHeaders - a strings array of additional headers to exposedHeaders. Use this to keep the default headers in place.
               credentials - if true, allows user credentials to be sent ('Access-Control-Allow-Credentials'). Defaults to false.
               methods - a strings array of allowed HTTP methods ('Access-Control-Allow-Methods').Defaults to ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'].
               override - if false, preserves existing CORS headers set manually before the response is sent.Defaults to true.
            */
            cors: {
              origin: ['*'],
              // methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
              additionalHeaders: [
                'X-CSRF-Token',
                'X-Request-ID'
              ],
              credentials: true
            }
          }
        },
        defaultRouteOptions: {
          // https://hapijs.com/api/15.2.0#route-options
          /*
           payload - controls how incoming payloads (request body) are processed:
             maxBytes - limits the size of incoming payloads to the specified byte count. Allowing very large payloads may cause the server to run out of memory. Defaults to 1048576 (1MB).
             uploads - the directory used for writing file uploads. Defaults to os.tmpDir().
          */
          payload: {
            maxBytes: 7000000 /* 7mb */
            // uploads: path.resolve(__dirname, '../temp')
          }
        }
      },

      // ======================================================
      // auth - настройки авторизации
      // ======================================================
      auth: {
        callbackAccessTokenParam: 'accessToken',
        callbackAccessTokenLifeParam: 'accessTokenLife',
        callbackRefreshTokenParam: 'refreshToken',
        callbackRefreshTokenLifeParam: 'refreshTokenLife',

        tokenCookie: 'accessToken',
        refreshTokenCookie: 'refreshToken',
        authTypeCookie: 'authType',

        // Настройки для аутентификации клиента в auth-server OAuth 2.0
        // По умолчанию берется название проекта из package.json
        applicationClientInfo: {
          client_id: APP_ID,
          client_secret: `${APP_ID}${APP_ID}`
          // credentials: {}
        },

        // auth-server@1.1.1 - специальная роль для получени защищенных данных других пользователей
        protectorUser: {
          username: 'protector',
          password: PROTECTOR_PASSWORD
        }
      },

      // ======================================================
      // Мокирование
      // ======================================================
      mocking: {
        // enable - нужно только чтобы включить мокирующие роуты, но не чтобы включить сам процесс мокирования (он включается через url ?mock=true или куки app-mocking:true)
        // see front-core\src\server\plugins\plugin-mocking.js::DEFAULT_OPTIONS
        enable: isTrue(APP_MOCKS) || isTrue(USE_MOCKS),
        useMocks: isTrue(USE_MOCKS),
        useMocksInitData: isTrue(USE_MOCKS),
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
      },

      attachments: {
        // todo @ANKU @CRIT @MAIN - переделать на manage rights для пользователей по CRUD действиям
        /**
         * accessPublic - все у кого есть ссылка
         * accessAuth - (default) - только авторизованные пользователи
         * accessOwnerOnly - только тот, кто создал (ну и админ ;))
         * <permission> - пермишен специальный
         */
        defaultAccess: 'accessAuth'
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
      serviceAuth: createEndpointServiceConfig({
        protocol: 'https',
        port: 1338,
        endpoint: 'api',
        requestOptions: {
          // игнорировать, что сертификат не подписан
          rejectUnauthorized: false
        }
      }),
      serviceUsers: createEndpointServiceConfig({
        protocol: 'https',
        port: 1338,
        endpoint: 'api',
        requestOptions: {
          // игнорировать, что сертификат не подписан
          rejectUnauthorized: false
        }
      }),

      /**
       * Дефолтный middleware (для него в \src\server\helpers\middleware-api.js есть методы по умолчанию send и proxy
       */
      middlewareApiService: null
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


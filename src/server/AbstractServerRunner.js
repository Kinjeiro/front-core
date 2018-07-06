/* eslint-disable no-unused-vars */
import merge from 'lodash/merge';
import Hapi from 'hapi'; // server
// Static file and directory handlers plugin for hapi.js
// Также для отсылки файлов в apiPlugin reply.file()
import inert from 'inert';
import crumb from 'crumb';
import RequestID from 'hapi-request-id';
// import pluginYar from 'yar';

import { joinPath } from '../common/utils/uri-utils';

import logger from './helpers/server-logger';
import serverConfig from './server-config';

if (!serverConfig.common.isProduction) {
  // для длинных call stack с async
  // eslint-disable-next-line global-require
  require('longjohn');
}

process.on('unhandledRejection', error => {
  console.error('unhandledRejection', error);
});

/**
* Абстрактный класс для серверного ранера, икапсулирующий логику запуска node js сервера hapi
*/
export default class AbstractServerRunner {
  hapiServerOptions;

  server = null;

  constructor(runnerOptions = {}) {
    const {
      hapiServerOptions,
    } = runnerOptions;


    this.hapiServerOptions = merge(
      {},
      serverConfig.server.features.serverFeatures.defaultServerOptions,
      hapiServerOptions,
    );
  }

  init() {
    this.server = new Hapi.Server(this.hapiServerOptions);
  }

  // ======================================================
  // for OVERRIDE
  // ======================================================
  createServices(/* endpointServices */) {
    return {};
  }

  createStrategies(services) {
    return {};
  }

  getPlugins(services, strategies) {
    // server.inject({
    //   method: 'OPTIONS',
    //   url: '/',
    //   headers: {
    //     origin: 'http://test.example.com',
    //     'access-control-request-method': 'GET',
    //     'access-control-request-headers': '',
    //   } },
    //   (res) => {
    //     console.log(res.headers);
    //     console.log(res.payload);
    //     console.log(res.statusCode);
    //   },
    // );

    return [
      RequestID,
      {
        /*
          Модуль для предотвращение CSRF атака - client из этой куки добавляет header "X-CSRF-Token"
          Только реальный клиент может переложить из куки в header значение.
          @NOTE: если не проставить в header значение cookieCSRF, то будет 403 Forbidden
        */
        register: crumb,
        options: {
          key: serverConfig.common.cookieCSRF,
          restful: true,
          // @guide - если не указать в header куку, то на запрос будет кидаться 403 forbidden
          cookieOptions: {
            /*
             "strictHeader": true,
             "ignoreErrors": false,
             "isSecure": false,
             "isHttpOnly": true,
             "isSameSite": "Strict",
             "path": "/",
             "domain": null,
             "ttl": null,
             "encoding": "none"
            */
            isSecure: false,
            // нам необходимо проставлять в js клиента из document.cookie в header
            isHttpOnly: false,
          },
          // во время тестов нет необходимости в этой проверке
          skip: (req, res) => serverConfig.common.env === 'test',
        },
      },
      inert, /* ,
      {
        register: pluginYar,
        options: serverConfig.server.features.session.yarOptions
      }*/
    ];
  }

  // ======================================================
  // SERVER LIFECYCLE
  // ======================================================
  connection() {
    const { server } = this;

    // server.realm.modifiers.route.prefix = contextRoot;
    return server.connection(merge({
      // todo @ANKU @LOW - из конфигов тоже брать и делать deep merge
      port: serverConfig.server.main.port,
      routes: {
        security: {
          xframe: true,
          noSniff: false,
        },
        // cors: {
        //   origin: ['example.com'],
        //   additionalHeaders: ['x-token-token']
        // },
        cors: true,
      },
    }, serverConfig.server.features.serverFeatures.serverConnectionOptions));
  }

  registerPlugins(services, strategies) {
    const { server } = this;
    const hapiServerPlugins = this.getPlugins(services, strategies);
    const contextPath = serverConfig.common.app.contextRoot;

    return new Promise(
      (resolve, reject) =>
        server.register(
          hapiServerPlugins,
          {
            routes: {
              prefix: contextPath
                ? joinPath('/', contextPath)
                : undefined,
            },
          },
          (error) => {
            return error
              ? reject(error)
              : resolve({
                services,
                strategies,
              });
          },
        ),
    )
      .catch((error) => {
        logger.error(error);
      });
  }

  initServerAuthStrategy(services, strategies) {
    const { server } = this;
    server.auth.default('default');
  }

  startServer() {
    const { server } = this;
    return new Promise((resolve, reject) => {
      server.start((error) => {
        if (error) {
          logger.error(`Server start failed: ${error.toString()}`);
          reject(error);
          process.exit(1);
        } else {
          logger.log('Server start success');
          resolve();
        }
      });
    });
  }

  afterStart() {
    const { server } = this;

    logger.log('Environment: ', serverConfig.common.env);
    logger.log(`Server is running: ${server.info.uri}...`);
  }

  monitorRequests() {
    const { server } = this;

    // todo @ANKU @CRIT @MAIN - Logger
    // server.ext('onPostAuth', (request, reply) => {
    //  console.warn('ANKU onPostAuth request', request);
    //  return reply.continue();
    // });
    server.ext('onRequest', (request, reply) => {
    // server.ext('onPreAuth', function (request, reply) {
      logger.log(
        '[START\tany request]\t',
        request.info && `${request.info.remoteAddress}: ${request.method.toUpperCase()} ${request.url.path} --> ...`,
      );
      return reply.continue();
    });

    server.ext('onPreResponse', (request, reply) => {
      const { response } = request;

      const code = response && (response.statusCode || (response.output && response.output.statusCode));

      logger.log(
        code !== 200 && code !== 304  ? 'warn' : 'info',
        '[END\tany response]\t',
        request.info && `${request.info.remoteAddress}: ${request.method.toUpperCase()} ${request.url.path} --> ${code}\n`,
      );
      return reply.continue();
    });

    server.on('request-error', (request, err) => {
      logger.error(`Error response (500) sent for request: ${request.id} at ${request.url.path} because: ${err.trace || err.stack || err}`);
    });
  }

  logConfig() {
    logger.log(
      '\n    Server config       \n',
      '\n =======================\n',
      '==[  COMMON CONFIG  ]==\n',
      JSON.stringify(serverConfig.common, null, 2),
      '\n =======================\n',
      '==[  CLIENT CONFIG  ]==\n',
      JSON.stringify(serverConfig.client, null, 2),
      '\n =======================\n',
      '==[  SERVER CONFIG  ]==\n',
      JSON.stringify(serverConfig.server, null, 2),
      '\n=======================\n',
    );
  }

  // ======================================================
  // MAIN RUN
  // ======================================================
  async run() {
    try {
      this.logConfig();

      this.init();

      const services = this.createServices(serverConfig.server.endpointServices);
      const strategies = this.createStrategies(services);

      this.connection();
      this.monitorRequests();

      await this.registerPlugins(services, strategies);
      await this.initServerAuthStrategy(services, strategies);
      await this.startServer();

      this.afterStart();

      return this;
    } catch (error) {
      logger.error(error);
      return Promise.reject(error);
    }
  }
}

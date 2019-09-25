/* eslint-disable max-len,no-unused-vars */
import merge from 'lodash/merge';
import Wreck from 'wreck';

import { joinUri } from '../../common/utils/uri-utils';
import i18n from '../../common/utils/i18n-utils';
import generateId from '../../common/utils/generate-id';
import createApiConfig from '../../common/utils/create-api-config';
import { appUrl } from '../../common/helpers/app-urls';

import {
  createUniError,
  // throwUniError,
  parseToUniError,
  isUniError,
} from '../../common/models/uni-error';
import logger from '../helpers/server-logger';
import { getCredentialsFromRequest } from './credentials-utils';

import { normalizeAccessObject } from '../../modules/module-auth/common/subModule/helpers/access-object-utils';

import apiPluginLog from './api-plugin-log';
import {
  parseResponseHandler,
  responseError,
  getRequestData,
  responseWrapper,
} from './hapi-utils';

import {
  getToken,
  getAuthType,
  getHeadersByAuthType,
} from './auth-utils';

import serverConfig from '../server-config';

export const API_PLUGIN_OPTIONS = {
  HANDLER: 'handler',
  /**
   * hapi настройки для роутера - см ROUTE_CONFIG_OPTIONS
   */
  ROUTE_CONFIG: 'routeConfig',

  /**
   * или
   */
  ROLES: 'roles',
  /**
   * или
   */
  PERMISSIONS: 'permissions',
  /**
   * Если не хватает ROLES и PERMISSIONS - можно воспользоваться объектом для тонкой настроки - src/modules/module-auth/common/subModule/helpers/access-object-utils.js
   */
  ACCESS_OBJECT: 'accessObject',
  CHECK_PERMISSION_STRATEGY: 'checkPermissionStrategy',

  IS_LOGGING: 'isLogging',

  /**
   * h2o2 options
   */
  PROXY: 'proxy',

  /**
   * поддержать гостевой режим (может пользователь быть, а может и не быть), но попытку авторизации нужно произвести
   * false,
   */
  GUEST_MODE: 'guestMode',

  /**
   * true - и если токен пользователя есть - запросит авторизацию, если нет - пропустит как если бы было routeConfig: { auth: false }
   *
   * Это настройка понадобилась, так как если задать routeConfig: { auth: false } - то не запустится система авторизации в jwt-auth и user не проставится в request вообще
   */
  AUTH_IF_EXISTS: 'authIfExist',
};

export const ROUTE_CONFIG_OPTIONS = {
  /**
   * hapi настройка
   * true
   *
   * если false - то не будет запускать системы авторизации, то есть jwt-auth не сработает и user в request не проставится
   */
  AUTH: 'auth',
};

// ======================================================
// AUTH
// ======================================================
function authWrapper(handler, apiPluginOptions, routeConfig, serverPluginOptions) {
  const {
    [ROUTE_CONFIG_OPTIONS.AUTH]: auth,
  } = routeConfig;
  const {
    [API_PLUGIN_OPTIONS.GUEST_MODE]: guestMode,
    [API_PLUGIN_OPTIONS.AUTH_IF_EXISTS]: authIfExist,
  } = apiPluginOptions;

  const authTurnOn = auth !== false
    && !authIfExist
    && serverConfig.common.features.auth
    && serverConfig.common.features.auth.globalAuth !== false;

  // предпоследний враппер
  return authTurnOn
    ? (request, reply) => {
      // if (request.auth && request.auth.credentials && !request.auth.credentials.profileId) {
      if (
        !getCredentialsFromRequest(request).isAuth()
        && !serverConfig.common.isTest
      ) {
        // в гостевом режиме пользователь может быть, а может и не быть
        if (guestMode) {
          logger.info('-- No auth, but GUEST_MODE');
        } else {
          logger.info('[plugin ERROR AUTH]');
          return responseError(createUniError({
            message: i18n('No auth'),
            responseStatusCode: 401,
          }), reply, 401);
        }
      }

      return handler(request, reply, apiPluginOptions);
    }
    : handler;
}

// ======================================================
// PERMISSIONS
// ======================================================
async function accessChecker(accessObject, checkPermissionStrategy, other) {
  const {
    apiConfig,
    reply,
    isLogging,
    apiRequest,
    // routeConfig: {
    //   [ROUTE_CONFIG_OPTIONS.AUTH]: auth,
    // },
  } = other;

  // if (accessObject && typeof checkPermissionStrategy !== 'function') {
  //   if (!isLogging) {
  //     // если не логировали, но нужно сначала залогировать что за реквест был
  //     apiPluginLog(apiRequest, apiConfig, '[plugin REQUEST]');
  //   }
  //   logger.error(i18n('core:Для проверки прав, необходимо подать checkPermissionStrategy'), apiConfig, checkPermissionStrategy);
  //   return responseError(
  //     i18n('core:Для проверки прав, необходимо подать checkPermissionStrategy'),
  //     reply,
  //     500,
  //   );
  // }

  // see src/server/strategies/plugin-strategies.js
  const strategy = checkPermissionStrategy || (apiRequest.strategies && apiRequest.strategies.checkPermissionStrategy);
  // если нужна проверка авторизации уже была выше в authWrapper в routeConfig:{ auth: true } - по умолчанию - поэтому тут ее отключаем
  const notAuthCheck = true;

  try {
    if (accessObject && strategy) {
      // проверяем доступы
      return await strategy(apiRequest, accessObject, null, notAuthCheck);
    }
  } catch (error) {
    return responseError(error, reply, 403);
  }
  return null;
}

// ======================================================
// PROXY
// ======================================================
const DEFAULT_PROXY_OPTIONS = {
  passThrough: true, // пробрасывание header от clientRequest
};
/*
* proxyOptions - protocol, host, port, apiPrefix \\ uri \\ mapUri
*/
function proxyWrapper(reply, proxy, callback) {
  let proxyOptions = proxy;
  if (typeof proxy === 'string') {
    proxyOptions = {
      uri: proxy,
    };
  } else if (typeof proxy === 'function') {
    proxyOptions = {
      mapUri: proxy,
    };
  }
  if (proxyOptions.apiPrefix) {
    proxyOptions = {
      // @guide - важно чтобы перед path не было слеша, так как все request.path идут по слешом
      uri: `${proxyOptions.protocol || '{protocol}'}://${proxyOptions.host || '{host}'}:${proxyOptions.port || '{port}'}/${proxyOptions.apiPrefix}{path}`,
    };
  }
  proxyOptions = {
    ...DEFAULT_PROXY_OPTIONS,
    ...proxyOptions,
  };

  if (proxyOptions.mapUri) {
    // в старой версии используется через неудобный callback https://github.com/hapijs/h2o2/tree/v6.0.1#using-the-mapuri-and-onresponse-options
    // а в 7 версии через возврат параметров - мы позволим работать и так и так
    const originalMapUri = proxyOptions.mapUri;
    proxyOptions.mapUri = (request, callbackFn) => {
      let updatedData = null;
      try {
        updatedData = originalMapUri(request);
      } catch (error) {
        logger.info('normal error', error);
      }

      if (updatedData && callbackFn) {
        // mapUri не поддерживает params (они работают только в uri) - мы это исправим
        Object.keys(request.params).forEach((paramKey) => {
          updatedData.uri = updatedData.uri.replace(new RegExp(`{${paramKey}}`, 'g'), request.params[paramKey]);
        });

        // todo @ANKU @LOW @BUG_OUT @h2o2 - по умолчанию они не передают query!!! https://github.com/hapijs/h2o2/issues/23
        const queryStr = request.url.search;
        if (queryStr && updatedData.uri.indexOf(queryStr) < 0) {
          updatedData.uri += queryStr;
        }

        if (!updatedData.headers) {
          updatedData.headers = {};
        }
        // некоторые crud api требуют явного content-type
        updatedData.headers['content-type'] = updatedData.headers['content-type'] || (request.headers && request.headers['content-type']) || 'application/json';
        logger.debug('proxy to:', updatedData.uri, updatedData.headers);

        /*
         // бага с авторизацией на middle server через hawk - поэтому отключил проброску headers c клиента
         если подавать headers: { host: 'localhost:8080' }
         */
        return callbackFn(null, updatedData.uri, updatedData.headers);
      }

      logger.debug('proxy to by callback in mapUri');
      return originalMapUri(request, callbackFn);
    };
  }

  const proxyOptionsFinal = proxyOptions;
  if (callback) {
    // нужно обработать после ответа от сервиса
    if (proxyOptions.onResponse) {
      throw new Error('Не совместимая конфигурация либо handler либо proxyOptions.onResponse');
    }

    proxyOptions.onResponse = async (err, res, request, newReply, settings, ttl) => {
      /*
       err - internal or upstream error returned from attempting to contact the upstream proxy.
       {
         Error: connect ECONNREFUSED 127.0.0.1:8088
         at Object._errnoException (util.js:1031:13)
         at _exceptionWithHostPort (util.js:1052:20)
         at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1195:14)

         errno: 'ECONNREFUSED',
         code: 'ECONNREFUSED',
         syscall: 'connect',
         address: '127.0.0.1',
         port: 8088,
         trace:
           [
            {
              method: 'GET',
              url: 'http://127.0.0.1:8088/api/common/test/test2'
            }
           ],
         isBoom: true,
         isServer: true,
         data: null,
         output:
           {
             statusCode: 502,
             payload:
             {
              message: 'Client request error: connect ECONNREFUSED 127.0.0.1:8088',
              statusCode: 502,
              error: 'Bad Gateway'
             },
             headers: {}
           },
         reformat: [Function]
       }
       res - the node response object received from the upstream service. res is a readable stream (use the wreck module read method to easily convert it to a Buffer or string).
       request - is the incoming request object. (browser client request without proxy url format)
       newReply - the reply interface function.
       settings - the proxy handler configuration.
       ttl - the upstream TTL in milliseconds if proxy.ttl it set to 'upstream' and the upstream response included a valid 'Cache-Control' header with 'max-age'.
       */

      let payload;
      let response;
      if (err) {
        logger.debug('(proxy response) from: [ERROR]', err);
        response = err.output;
        payload = parseToUniError(err);
      } else {
        response = res;
        logger.debug('(proxy response) from: ', response.req && response.req.path, `(${response.statusCode})`);
        payload = await Wreck.read(res, {
          json: true, // если не парсанят, то вернет буффер
        });

        if (response.statusCode < 200 || response.statusCode >= 300) {
          logger.error(
            '(proxy response) error: ',
            payload && payload instanceof Buffer
              ? payload.toString()
              : JSON.stringify(payload, null, 2),
            ' ',
          );
        } else {
          logger.debug('(proxy response) payload: ', payload, ' ');
        }
      }

      callback(payload, newReply, response);
    };
  }

  // use h2o2 plugin
  return reply.proxy(proxyOptionsFinal);
}

/**
 *
 * @param handler - (proxyPayload, requestData, apiRequest, newReply, proxyResponse, pluginOptions) => {}
 * @param apiRequest
 * @param pluginOptions
 * @returns {function(*=, *=, *=)}
 */
function createProxyWrapperCallback(handler, apiRequest, pluginOptions) {
  return (payload, newReply, proxyResponse) => {
    if (handler) {
      const result = handler(payload, getRequestData(apiRequest), apiRequest, newReply, proxyResponse, pluginOptions);
      return responseWrapper(result, newReply);
    }

    if (isUniError(payload) || proxyResponse.statusCode < 200 || proxyResponse.statusCode >= 300) {
      let uniError;
      if (isUniError(payload)) {
        uniError = payload;
      } else {
        try {
          uniError = parseToUniError(
            payload instanceof Buffer
              ? JSON.parse(payload.toString())
              : payload,
            {
              isServerError: true,
              responseStatusCode: proxyResponse.statusCode,
            },
          );
        } catch (error) {
          const errorMessage = (payload && payload.toString()) || proxyResponse.statusMessage;
          uniError = createUniError({
            isServerError: true,
            message: errorMessage,
            responseStatusCode: proxyResponse.statusCode,
            stack: false,
          });
        }
      }

      return responseError(
        uniError,
        newReply,
        uniError.responseStatusCode,
      );
    }

    const response = newReply(payload);
    response.headers = proxyResponse.headers;
    return response;
  };
}

// import thrift from 'thrift';
// function jsonThriftNormalizer(key, value) {
//  if (value instanceof thrift.Int64) {
//    return value.toNumber(false);
//  }
//  return value;
// }



// ======================================================
// MAIN
// ======================================================
function getRouteConfig(method, routeConfig, isProxy) {
  let routeConfigFull = merge(
    {},
    serverConfig.server.features.serverFeatures.defaultRouteOptions,
    isProxy && {
      // для правильной работы h2o2 proxy плагина
      payload: {
        parse: false,
      },
    },
    routeConfig,
  );

  const methodUp = method.toUpperCase();
  if ((methodUp === 'HEAD' || methodUp === 'GET')) {
    if (routeConfigFull.payload) {
      // удаляем payload
      routeConfigFull = {
        ...routeConfigFull,
        payload: undefined,
      };
    }
  }

  return routeConfigFull;
}

/*
* подключена проверка авторизации
*/
export function pluginRouteFactory(
  path,
  handler,
  routeConfig = {},
  apiPluginOptions = {},
) {
  const {
    [API_PLUGIN_OPTIONS.PROXY]: proxy,
  } = apiPluginOptions;
  const isProxy = !!proxy;

  const {
    method = 'GET',
    pluginName,
    ...routeConfigOther
  } = routeConfig;

  const name = pluginName || (typeof path !== 'function' && `${path}_${method}`) || generateId();

  const register = function (server, serverPluginOptions, next) {
    let finalHandler = (request, reply) => handler(request, reply, serverPluginOptions);

    // предпоследний враппер
    finalHandler = authWrapper(finalHandler, apiPluginOptions, routeConfig, serverPluginOptions);
    // самый верхний враппер
    finalHandler = parseResponseHandler(finalHandler);

    let methods = method;
    if (!Array.isArray(methods)) {
      methods = [methods];
    }

    // для динамических путей или путей из конфигов, которые инициализируются чуть позже
    const pathFinal = joinUri('/', typeof path === 'function' ? path(routeConfig) : path);

    methods.forEach((methodItem) => {
      logger.debug(`init server route: [${methodItem}]\t\t${appUrl(pathFinal)}`);
      server.route({
        method: methodItem,
        path: pathFinal,
        handler: finalHandler,
        config: getRouteConfig(methodItem, routeConfigOther, isProxy),
      });
    });

    next();
  };
  register.attributes = {
    name,
  };
  return register;
}


/**
 * Подключена проверка пермишенов, логгинг, проксирование (и авторизация)
 * @param apiConfig
 * @param handler - Можно не использовать reply, если возвращаем не response, то идет вызов reply автоматически с
 *   результатом в качестве аргумента
 *
 * @param accessObject
 * @param permissions
 * @param roles
 *
 * @param checkPermissionStrategy
 * @param routeConfig
 * @param isLogging
 *
 * @returns function(apiRequestData, request, reply) {}
 */
function apiPluginFullFactory(apiConfig, apiPluginOptions) {
  const {
    [API_PLUGIN_OPTIONS.HANDLER]: handler,
    [API_PLUGIN_OPTIONS.ROUTE_CONFIG]: routeConfig = {},

    [API_PLUGIN_OPTIONS.ACCESS_OBJECT]: accessObject,
    [API_PLUGIN_OPTIONS.ROLES]: roles,
    [API_PLUGIN_OPTIONS.PERMISSIONS]: permissions,
    [API_PLUGIN_OPTIONS.CHECK_PERMISSION_STRATEGY]: checkPermissionStrategy,

    [API_PLUGIN_OPTIONS.IS_LOGGING]: isLogging = true,

    [API_PLUGIN_OPTIONS.PROXY]: proxy, // h2o2 options
  } = apiPluginOptions;

  const {
    method,
    path,
  } = createApiConfig(apiConfig);

  const handlerFinal = async function (apiRequest, reply, pluginOptions) {
    // logger.info(`======= PLUGIN: ${apiRequest.path} =========`);
    try {
      if (isLogging) {
        apiPluginLog(apiRequest, apiConfig, '[plugin REQUEST]');
      }

      // проверяем доступ - если не будет - выбросится ошибка
      await accessChecker(
        accessObject || normalizeAccessObject(roles, permissions),
        checkPermissionStrategy,
        {
          routeConfig,
          apiConfig,
          reply,
          isLogging,
          apiRequest,
        },
      );

      // проксируем
      if (proxy) {
        return proxyWrapper(
          reply,
          proxy,
          createProxyWrapperCallback(handler, apiRequest, pluginOptions),
        );
      }
      return await handler(getRequestData(apiRequest), apiRequest, reply, pluginOptions);
    } catch (error) {
      if (!isLogging) {
        // если не логировали, но нужно сначала залогировать что за реквест был
        apiPluginLog(apiRequest, apiConfig, '[plugin REQUEST]');
      }
      logger.error('[plugin RESPONSE ERROR]\n', error.message, '\n', error.stack, '\n', !error.stack && error);
      return responseError(error, reply);
    }
  };

  return pluginRouteFactory(
    path,
    handlerFinal,
    {
      ...routeConfig,
      method,
    },
    apiPluginOptions,
  );
}

/**
 *
 * @param apiConfig
 * @param handler - (payload, apiRequest, reply, pluginOptions) => {}
 * @param apiPluginOptions
   - permissions
   - checkPermissionStrategy
   - routeConfig
   - isLogging
 */
export function apiPluginFactory(apiConfig, handler, apiPluginOptions = {}) {
  return apiPluginFullFactory(apiConfig, {
    handler,
    ...apiPluginOptions,
  });
}


// ======================================================
// PROXY
// ======================================================
export const PROXY_WILDCARD_NAME = 'proxyWildcardPath';

/**
 * @param path - you can user wildcard (*) or h2o2 format: \path\{otherPart}
 * @param proxy - string \ mapUri function \ h2o2 options (proxyOptions) - https://github.com/hapijs/h2o2 (add support { apiPrefix: 'serviceApiPath' })
 *          server.route({ method: 'GET', path: '/handlerTemplate/{a}/{b}', handler: { proxy: { uri: 'http://localhost:' + upstream.info.port + '/item/{a}/{b}' } } });
 * @param routeOptions - если только функция, значит это handler
   - handler - (payload, requestData, apiRequest, reply, proxyResponse, pluginOptions) => {}
   - permissions
   - checkPermissionStrategy
   - routeConfig
   - isLogging
 */
export function proxyRoute(path, proxy, routeOptions = {}) {
  let apiConfig = path;
  if (typeof apiConfig === 'string') {
    apiConfig = {
      path: apiConfig,
      method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    };
  }

  if (typeof routeOptions === 'function') {
    // eslint-disable-next-line no-param-reassign
    routeOptions = {
      handler: routeOptions,
    };
  }

  return apiPluginFullFactory(
    {
      path: apiConfig.path.replace(/\/?\*$/gi, `/{${PROXY_WILDCARD_NAME}*}`),
      method: apiConfig.method,
    },
    {
      proxy,
      ...routeOptions,
    },
  );
}

/**
 * @deprecated - use proxyRoute
 */
export function proxyRoutePluginFactory(path, proxy, otherOptions) {
  return proxyRoute(path, proxy, otherOptions);
}

export function defaultHeadersExtractor(clientRequest, proxyFullUrl = null) {
  // proxyFullUrl - нежун для hawk токенов
  const token = getToken(clientRequest);
  const authType = getAuthType(clientRequest);
  return getHeadersByAuthType(token, authType);
}

export function proxyRouteFactory(middlewareEndpointConfig, headersExtractor = defaultHeadersExtractor) {
  return (apiConfig, middleApiPath = null, otherRouteOptions = {}) => {
    // whateverPath
    return proxyRoute(
      apiConfig,
      (clientRequest) => {
        let url = middleApiPath || clientRequest.url.href;
        // proceed path params
        Object.keys(clientRequest.params).forEach((paramKey) => {
          url = url.replace(new RegExp(`{${paramKey}}`, 'g'), clientRequest.params[paramKey]);
        });

        const middlewareFullUrl = `${middlewareEndpointConfig.fullUrl}${joinUri('/', url)}`;
        return {
          uri: middlewareFullUrl,
          headers: headersExtractor(clientRequest, middlewareFullUrl),
        };
      },
      otherRouteOptions,
    );
  };
}

export default apiPluginFactory;

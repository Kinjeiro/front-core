import merge from 'lodash/merge';
import Wreck from 'wreck';

import { joinUri } from '../../common/utils/uri-utils';
import i18n from '../../common/utils/i18n-utils';
import generateId from '../../common/utils/generate-id';

import {
  createUniError,
  throwUniError,
  parseToUniError,
} from '../../common/models/uni-error';
import logger from '../helpers/server-logger';
import { getCredentialsFromRequest } from '../utils/credentials-utils';

import apiPluginLog from './api-plugin-log';
import {
  parseResponseHandler,
  responseError,
  getRequestData,
} from './hapi-utils';

import serverConfig from '../server-config';

function authWrapper(handler, pluginOptions) {
  return (request, reply) => {
    // if (request.auth && request.auth.credentials && !request.auth.credentials.profileId) {
    if (!getCredentialsFromRequest(request).isAuth() && !serverConfig.common.isTest) {
      logger.info('[plugin ERROR AUTH]');
      return responseError(createUniError({
        message: i18n('No auth'),
        responseStatusCode: 401,
      }), reply, 401);
    }

    return handler(request, reply, pluginOptions);
  };
}

async function permissionWrapper(permissions, checkPermissionStrategy, other) {
  const {
    apiConfig,
    reply,
    isLogging,
    apiRequest,
  } = other;

  if (permissions && typeof checkPermissionStrategy !== 'function') {
    if (!isLogging) {
      // если не логировали, но нужно сначала залогировать что за реквест был
      apiPluginLog(apiRequest, apiConfig, '[plugin REQUEST]');
    }
    logger.error(i18n('core:Для проверки прав, необходимо подать checkPermissionStrategy'), apiConfig, checkPermissionStrategy);
    return responseError(
      i18n('core:Для проверки прав, необходимо подать checkPermissionStrategy'),
      reply,
      500,
    );
  }

  try {
    if (permissions) {
      if (!Array.isArray(permissions)) {
        permissions = [permissions];
      }
      // проверяем доступы
      await Promise.all(permissions.map((permission) =>
        // если пермишен не будет найден - вызовется throw Error и дальне не пойдет
        checkPermissionStrategy(apiRequest, permission),
      ));
    }
  } catch (error) {
    return responseError(error, reply, 403);
  }
}


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
    proxyOptions.mapUri = (request, callback) => {
      let updatedData = null;
      try {
        updatedData = originalMapUri(request);
      } catch (error) {
        logger.info('normal error', error);
      }

      if (updatedData && callback) {
        // mapUri не поддерживает params (они работают только в uri) - мы это исправим
        Object.keys(request.params).forEach((paramKey) => {
          updatedData.uri = updatedData.uri.replace(new RegExp(`\{${paramKey}\}`, 'g'), request.params[paramKey]);
        });

        // todo @ANKU @LOW @BUG_OUT @h2o2 - по умолчанию они не передают query!!! https://github.com/hapijs/h2o2/issues/23
        const queryStr = request.url.search;
        if (queryStr && updatedData.uri.indexOf(queryStr) < 0) {
          updatedData.uri += queryStr;
        }
        logger.debug('proxy to:', updatedData.uri);

        /*
         // бага с авторизацией на middle server через hawk - поэтому отключил проброску headers c клиента
         если подавать headers: { host: 'localhost:8080' }
         */
        return callback(null, updatedData.uri, updatedData.headers);
      }

      logger.debug('proxy to by callback in mapUri');
      return originalMapUri(request, callback);
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
       res - the node response object received from the upstream service. res is a readable stream (use the wreck module read method to easily convert it to a Buffer or string).
       request - is the incoming request object.
       newReply - the reply interface function.
       settings - the proxy handler configuration.
       ttl - the upstream TTL in milliseconds if proxy.ttl it set to 'upstream' and the upstream response included a valid 'Cache-Control' header with 'max-age'.
       */
      logger.debug('(proxy response) from: ', res.req.path, `(${res.statusCode})`);

      // logger.debug('proxy REQUEST', request.headers);
      // logger.debug('proxy RESPONSE', res.headers);
      // logger.debug('proxy RESPONSE result', res.payload);
      const payload = await Wreck.read(res, {
        json: true, // если не парсанят, то вернет буффер
      });

      if (res.statusCode < 200 || res.statusCode >= 300) {
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

      callback(payload, newReply, res);
    };
  }

  // use h2o2 plugin
  return reply.proxy(proxyOptionsFinal);
}

function createProxyWrapperCallback(handler, apiRequest, pluginOptions) {
  return (payload, newReply, proxyResponse) => {
    if (handler) {
      return handler(payload, apiRequest, newReply, pluginOptions, proxyResponse);
    }

    if (proxyResponse.statusCode < 200 || proxyResponse.statusCode >= 300) {
      let uniError;
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

      return responseError(
        uniError,
        newReply,
        proxyResponse.statusCode,
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
export function pluginRouteFactory(path, handler, routeConfig = {}, isProxy = false) {
  const {
    method = 'GET',
    pluginName,
    ...routeConfigOther
  } = routeConfig;

  const name = pluginName || (typeof path !== 'function' && `${path}_${method}`) || generateId();

  const register = function (server, pluginOptions, next) {
    const {
      auth,
    } = routeConfigOther;

    // для динамических путей или путей из конфигов, которые инициализируются чуть позже
    const pathFinal = joinUri('/', typeof path === 'function' ? path(routeConfig) : path);

    const authTurnOn = auth !== false
      && serverConfig.common.features.auth
      && serverConfig.common.features.auth.globalAuth !== false;

    let finalHandler = authTurnOn
      ? authWrapper(handler, pluginOptions)
      : (request, reply) => handler(request, reply, pluginOptions);

    finalHandler = parseResponseHandler(finalHandler);

    let methods = method;
    if (!Array.isArray(methods)) {
      methods = [methods];
    }

    methods.forEach((methodItem) => {
      logger.debug(`init server route: [${methodItem}]\t\t${pathFinal}`);
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
 * @param permissions
 * @param checkPermissionStrategy
 * @param routeConfig
 * @param isLogging
 *
 * @returns function(apiRequestData, request, reply) {}
 */
function apiPluginFullFactory(apiConfig, options) {
  const {
    handler,
    routeConfig = {},

    permissions,
    checkPermissionStrategy,

    isLogging = true,

    proxy, // h2o2 options
  } = options;

  const {
    method,
    path,
  } = apiConfig;

  const handlerFinal = async function (apiRequest, reply, pluginOptions) {
    // logger.info(`======= PLUGIN: ${apiRequest.path} =========`);

    if (isLogging) {
      apiPluginLog(apiRequest, apiConfig, '[plugin REQUEST]');
    }

    await permissionWrapper(permissions, checkPermissionStrategy, {
      apiConfig,
      reply,
      isLogging,
      apiRequest,
    });

    try {
      let result;
      // проксируем
      if (proxy) {
        return proxyWrapper(
          reply,
          proxy,
          createProxyWrapperCallback(handler, apiRequest, pluginOptions),
        );
      }
      result = await handler(getRequestData(apiRequest), apiRequest, reply, pluginOptions);


      return result;
    } catch (error) {
      if (!isLogging) {
        // если не логировали, но нужно сначала залогировать что за реквест был
        apiPluginLog(apiRequest, apiConfig, '[plugin REQUEST]');
      }
      logger.error('[plugin RESPONSE ERROR]\n', error.message, '\n', error.stack, '\n', !error.stack && error);
      return responseError(error, reply);
    }
  };

  return pluginRouteFactory(path, handlerFinal, {
    ...routeConfig,
    method,
  }, !!proxy);
}

/**
 *
 * @param apiConfig
 * @param handler - (payload, apiRequest, reply, pluginOptions) => {}
 * @param otherOptions
   - permissions
   - checkPermissionStrategy
   - routeConfig
   - isLogging
 */
export function apiPluginFactory(apiConfig, handler, otherOptions = {}) {
  return apiPluginFullFactory(apiConfig, {
    handler,
    ...otherOptions,
  });
}

/**
 * @param path - you can user wildcard (*) or h2o2 format: \path\{otherPart}
 * @param method
 * @param proxy - string \ mapUri function \ h2o2 options (proxyOptions) - https://github.com/hapijs/h2o2 (add support { apiPrefix: 'serviceApiPath' })
 *          server.route({ method: 'GET', path: '/handlerTemplate/{a}/{b}', handler: { proxy: { uri: 'http://localhost:' + upstream.info.port + '/item/{a}/{b}' } } });
 * @param otherOptions
   - handler - (payload, apiRequest, reply, pluginOptions) => {}
   - permissions
   - checkPermissionStrategy
   - routeConfig
   - isLogging
 */
export const PROXY_WILDCARD_NAME = 'proxyWildcardPath';
export function proxyRoutePluginFactory(path, proxy, otherOptions = {}) {
  let apiConfig = path;
  if (typeof apiConfig === 'string') {
    apiConfig = {
      path: apiConfig,
      method: ['GET', 'POST', 'PUT', 'DELETE'],
    };
  }

  return apiPluginFullFactory(
    {
      path: apiConfig.path.replace(/\/?\*$/gi, `/{${PROXY_WILDCARD_NAME}*}`),
      method: apiConfig.method,
    },
    {
      proxy,
      ...otherOptions,
    },
  );
}

export default apiPluginFactory;

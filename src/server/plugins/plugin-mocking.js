import RouteParser from 'route-parser';

import {
  joinUri,
  joinPathSimple,
} from '../../common/utils/uri-utils';
import {
  appUrl,
  cutContextPath,
} from '../../common/helpers/app-urls';

import serverConfig from '../server-config';
import logger from '../helpers/server-logger';
import {
  getCookie,
  setCookie,
  clearCookie,
} from '../utils/hapi-utils';

export const DEFAULT_OPTIONS = {
  // serverConfig.server.features.mocking.enable
  enable: false,
  // serverConfig.server.features.mocking.useMocks
  useMocks: false,
  // serverConfig.server.features.mocking.apiPrefix
  apiPrefix: '',
  // serverConfig.server.features.mocking.cookieEnableMocking
  // либо true, либо string (кусок апи пути или regexp)
  cookieEnableMocking: 'app-mocking',
  // serverConfig.server.features.mocking.urlParamForEnableMocking
  urlParamForEnableMocking: 'mock',
  // serverConfig.server.features.mocking.mocksRouteBase
  mocksRouteBase: 'mocks',

  mockRoutes: [],
};

function getValue(value, ...args) {
  return typeof value === 'function'
    ? value(...args)
    : value;
}

function compareValues(requestValue, conditionValue) {
  if (!Array.isArray(conditionValue)) {
    // eslint-disable-next-line no-param-reassign
    conditionValue = [conditionValue];
  }

  return conditionValue.every((condition) => (
    Array.isArray(requestValue)
      ? requestValue.includes(condition)
      : requestValue === condition
  ));
}

export function validateRoutePath(request, templatePath, {
  method = 'get',
  mockFilterConditions: {
    reqexpPath,
    pathParams,
    queryParams,
    // dataParams,
  } = {},
} = {}) {
  let validation = true;

  const {
    path: requestPath,
    method: requestMethod,
  } = request;

  // нужно вырезать contextPath
  const requestPathWithoutContextPath = cutContextPath(requestPath);

  // parse hapi route format "/abs/{pathParam}" to router parser format "/abs/:pathParam"
  const requestTryParams = new RouteParser(templatePath.replace(/\{((\w|-|@|\.)+)\}/g, ':$1'))
    .match(requestPathWithoutContextPath);

  /*
    api config template path - api/my/api/{pathParam1}/{pathParam2}
    real request path - api/my/api/20/opa
    - this is true
  */

  if (validation) {
    validation = requestMethod.toLowerCase() === method.toLowerCase();
  }

  if (validation) {
    // todo @ANKU @LOW - сделать поддержку таких урлов path: '/hello/{user*2}', (/hello/john/doe)
    const reqexpPathResult = reqexpPath || new RegExp(`^\/?${templatePath.replace(/\{((\w|-|@|\.)+)\}/g, '((\\w|-|@|\\.)+)')}\/?$`);
    validation = reqexpPathResult.test(requestPathWithoutContextPath);
  }

  if (validation && pathParams) {
    validation = Object.keys(pathParams).every((pathParam) => {
      const requestPathParamValue = requestTryParams[pathParam];
      const conditionPathParamValue = getValue(pathParams[pathParam], request);
      return compareValues(requestPathParamValue, conditionPathParamValue);
    });
  }

  if (validation && queryParams) {
    validation = Object.keys(queryParams).every((queryParam) => {
      const requestQueryParamValue = request.query[queryParam];
      const conditionQueryParamValue = getValue(queryParams[queryParam], request);
      return compareValues(requestQueryParamValue, conditionQueryParamValue);
    });
  }

  // todo @ANKU @CRIT @MAIN - todo dataParams if POST
  // ...

  return validation;
}

export function getRequestPath(url, pluginOptions, isMocked) {
  const {
    apiPrefix,
    mocksRouteBase,
  } = pluginOptions;

  const normalizeApiPrefix = apiPrefix ? joinPathSimple(apiPrefix, '/') : '';
  const normalizeMockRouteBase = joinPathSimple(mocksRouteBase, '/');

  return joinUri(
    '/',
    normalizeApiPrefix,
    isMocked ? normalizeMockRouteBase : '',
    cutContextPath(url)
      .replace(normalizeApiPrefix, '')
      .replace(normalizeMockRouteBase, ''),
  );
}

function onRequest(options, request, reply) {
  // if (!serverConfig.common.isProduction) {
  const {
    enable,
    useMocks,
    mockRoutes,
    cookieEnableMocking,
    urlParamForEnableMocking,
  } = options;

  let cookieEnable;

  // @guide - к сожалению на стадии onRequest не сформированы еще куки (не работает yar) а редирект может быть только на ней =(
  const currentCookieEnable = getCookie(request, cookieEnableMocking);

  if (request.query[urlParamForEnableMocking]) {
    cookieEnable = request.query[urlParamForEnableMocking];
    // todo @ANKU @BUG_OUT @hapi - приходится делать семафор в контексте request, но в hapi с этим проблема: редирект можно сделать (onRequest) только ДО того как можно проставить куки (onPreAuth)
    // eslint-disable-next-line no-param-reassign
    request.app.urlParamForEnableMocking = cookieEnable;
  } else if (currentCookieEnable) {
    cookieEnable = currentCookieEnable;
  }

  // enable - нужно только чтобы включить мокирующие роуты, но не чтобы включить сам процесс мокирования (он включается через url mock=true)
  // if ((typeof cookieEnable === 'undefined' && enable) || cookieEnable === 'true') {
  if ((typeof cookieEnable === 'undefined' && useMocks && enable) || cookieEnable === 'true') {
    mockRoutes.some((mockRoute) => {
      if (validateRoutePath(request, mockRoute.path, mockRoute)) {
        // используем request.url.path - чтобы поддержать пробросс query параметров
        // необходимо не забыть про contextPath тут, а внутри наоборот нужно его вырезать
        request.setUrl(appUrl(getRequestPath(request.url.path, options, true)));
        return true;
      }
      return false;
    });
  }
  // }

  return reply.continue();
}

/**
 * включение моков по урлу
 *
 * @param mockOptions
 * @param request
 * @param reply
 * @returns {void|*}
 */
function onPreResponse(mockOptions, request, reply) {
  // if (!serverConfig.common.isProduction) {
  const {
    enable,
    useMocks,
    cookieEnableMocking,
  } = mockOptions;
  const {
    app: {
      urlParamForEnableMocking,
    },
  } = request;

  // enable - нужно только чтобы включить мокирующие роуты, но не чтобы включить сам процесс мокирования (он включается через url mock=true)
  // если запустили с помощью environment в конфигах APP_MOCK или через options плагина
  if (enable && useMocks) {
    setCookie(
      reply,
      cookieEnableMocking,
      typeof urlParamForEnableMocking !== 'undefined'
        ? urlParamForEnableMocking
        : 'true',
    );
  } else {
    clearCookie(reply, cookieEnableMocking);
  }

  return reply.continue();
}


export const register = function (server, options, next) {
  const finalOptions = {
    ...DEFAULT_OPTIONS,
    ...serverConfig.server.features.mocking,
    ...(options || {}),
  };
  const {
    mockRoutes,
    cookieEnableMocking,
  } = finalOptions;

  server.state(cookieEnableMocking/* , {
     ttl: null,
     isSecure: true,
     isHttpOnly: true,
     encoding: 'base64json',
     clearInvalid: false, // remove invalid cookies
     strictHeader: true // don't allow violations of RFC 6265
     }*/
    , {
      strictHeader: false,
      isSecure: false,
      isHttpOnly: false,
      clearInvalid: true,
    },
  );

  server.ext('onRequest', onRequest.bind(null, finalOptions));
  server.ext('onPreResponse', onPreResponse.bind(null, finalOptions));
  // server.ext('onPreResponse', onPreResponse);

  server.route(mockRoutes.map((route) => {
    const path = getRequestPath(route.path, finalOptions, true);
    const serverRoute = {
      ...route,
      // create special mock route with mock prefix (this is allow redirect to this route if mock conditions valid)
      path,
    };
    logger.debug('Mocking path', `[${route.method}]\t`, appUrl(path));

    // hapi doesn't allow any no api parameters in route;
    delete serverRoute.mockFilterConditions;

    return serverRoute;
  }));

  next();
};

register.attributes = {
  name: 'mocking',
};

export default register;



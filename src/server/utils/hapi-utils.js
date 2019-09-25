/* eslint-disable no-param-reassign,implicit-arrow-linebreak */
import path from 'path';
import fs from 'fs';
import { URL } from 'url';
import { Readable } from 'stream';
import Cookie from 'cookie';
import http from 'http';
import Response from 'hapi/lib/response';

import {
  parseUrlParameters,
  formatUrlParameters,
} from '../../common/utils/uri-utils';
import appUrl from '../../common/helpers/app-urls';
import { parseToUniError } from '../../common/models/uni-error';

import serverConfig from '../server-config';

import {
  getMimeType,
  base64ToBuffer,
} from './file-utils';

export function getRequestData(hapiRequest) {
  return hapiRequest.method.toUpperCase() === 'GET'
    // не правильно парсит брекет параметры var1[]=2
    // ? hapiRequest.query
    ? parseUrlParameters(hapiRequest.url.href)
    : hapiRequest.payload;
}

export function setRequestData(requestOptions, data) {
  const requestOptionsFinal = requestOptions;

  if (!requestOptionsFinal.method) {
    requestOptionsFinal.method = 'GET';
  }

  if (typeof data !== 'undefined' && data !== null) {
    if (requestOptions.method.toUpperCase() === 'GET') {
      // request.query - doesn't support yet. See https://github.com/hapijs/discuss/issues/334

      /*
       https://u:p@www.example.com:777/a/b?c=d&e=f#g

       protocol  https:
       auth      u:p
       host      www.example.com:777
       port      777
       hostname  www.example.com
       hash      #g
       search    ?c=d&e=f
       query     c=d&e=f
       pathname  /a/b
       path      /a/b?c=d&e=f
       href      https://www.example.com:777/a/b?c=d&e=f#g

       searchParams - object with methods "set" \ "update" and e.t
      */
      const urlObj = new URL(requestOptions.url, 'http://localhost/');

      const params = parseUrlParameters(requestOptions.url);
      Object.keys(data).forEach((queryKey) => {
        params[queryKey] = data[queryKey];
      });

      requestOptionsFinal.url = formatUrlParameters(params, urlObj.pathname, urlObj.hash);
    } else {
      requestOptionsFinal.payload = data;
    }
  }

  return requestOptionsFinal;
}

function responseWrapperInner(result, reply) {
  // если не вызывали reply - сделаем это за них

  // const isReplyResponse = typeof result === 'object' && !!result.headers && !!result.statusCode; // statusCode \ request
  // const isReplyResponse = reply._replied;

  // todo @ANKU @LOW - бага он не сравнивает две одинаковые функции! result.constructor и Response - можно через сравнения тела функции сделать - a.toString() === b.toString()
  const isReplyResponse = typeof result === 'object'
    && result !== null
    && (result.constructor === Response || !!result.headers);

  // если typeof result === 'undefined' - значит ничего не возвращали, и значит reply заиспользуют позже внутри колбэков
  return typeof result === 'undefined' || isReplyResponse
    ? result
    : reply(result);
}

export function responseWrapper(result, reply) {
  if (result && result.then) {
    // promise
    return result.then((finalResult) =>
      responseWrapperInner(finalResult, reply));
  }
  return responseWrapperInner(result, reply);
}

export function responseError(error, reply, code = undefined) {
  // todo @ANKU @LOW - иногда при ошибка бывает - UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 2): Error: reply interface called twice
  const uniError = parseToUniError(error);
  return responseWrapperInner(uniError, reply)
    .code(code || uniError.responseStatusCode || 500);
}

export function parseResponseHandler(handler, proceedRequestData) {
  let finalHandler;

  if (handler && handler.then) {
    // promise
    finalHandler = async (request, reply) => reply(await handler);
  } else if (typeof handler === 'function') {
    // function - на выходе либо promise, либо data - поэтому используем рекурсию
    finalHandler = (request, reply) => {
      const result = proceedRequestData
        ? handler(getRequestData(request), request, reply)
        : handler(request, reply);
      return responseWrapper(result, reply);
    };
  } else {
    // data
    finalHandler = (request, reply) => reply(handler);
  }

  return finalHandler;
}

// const COOKIE_REGEXP = /(?:[^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\"\,\;\\\x7F]*))/;
const COOKIE_REGEXP = /(.*?)=(.*?)(?:;|,(?!\s))/;
export function getCookiesValues(response) {
  return response.headers['set-cookie']
    .reduce((result, cookieStr) => {
      // eslint-disable-next-line no-unused-vars
      const [all, name, value] = cookieStr.match(COOKIE_REGEXP);
      // eslint-disable-next-line no-param-reassign
      result[name] = value;
      return result;
    }, {});
}

export function getRequestCookieFromResponse(response) {
  const cookiesValues = getCookiesValues(response);
  return Object.keys(cookiesValues)
    .reduce((result, cookieName) => {
      result.push(`${cookieName}=${cookiesValues[cookieName]}`);
      return result;
    }, [])
    .join('; ');
}

export function getCookie(request, name) {
  const { state } = request;
  let result;

  if (state) {
    // eslint-disable-next-line no-nested-ternary
    result = state
      ? typeof state === 'function'
        ? state(name)
        : state[name]
      : undefined;

    if (Array.isArray(result)) {
      /*
        todo @ANKU @LOW @BUG_OUT @hapi - hapi при получении кукисов не проверяет path поэтому если у вас на одном сервере несколько приложений и у них разные contextPath то будет вот такая запись
        refreshToken: [ 'fakeKorolevaUToken', 'fakeIvanovIToken' ],
        это бага, но никак настройки для isHttpOnly никак не получить
        если только не сохранять куки на сервере вот как здесь - https://github.com/hapijs/hapi-auth-cookie/blob/master/lib/index.js
      */
      // в таком случае всегда первым будет ближайший contextPath
      result = result[0];
    }
  } else {
    // @guide - к сожалению на стадии onRequest не сформированы еще куки (не работает yar) а редирект может быть только на ней =(
    const cookies = Cookie.parse(request.headers.cookie || '');
    result = cookies[name];
  }

  return result;
}

export const DEFAULT_COOKIE_OPTIONS = {
  // todo @ANKU @CRIT @MAIN - в утилитах неочень хорошо использовать конфиги, но все же
  path: serverConfig.common.app.contextRoot || '/',
  isHttpOnly: true,
  /*
    // todo @ANKU @CRIT @MAIN @DEBUG -
    secure: false
  */
  isSecure: false,
  /*
    https://github.com/hapijs/hapi-auth-cookie/issues/159#issuecomment-334907134

    sameSite: 'Strict' - не отправляет куки на любые другие домены (то есть при перехода из вк \ facebook и обратно мы бы терали авторизацию)
    sameSite: 'Lax',
    Режим Lax решает проблемы с разлогированием описанную выше, но при этом сохраняет хороший уровень защиты. В сущности он добавляет исключение, когда куки передаются при навигации высокого уровня, которая использует “безопасные” HTTP методы. Согласно RFC безопасными методами считаются GET, HEAD, OPTIONS и TRACE.

    К сожалению IE11 не поддерживает - https://caniuse.com/#search=samesite - приходится использовать механизм доп токена cookieCSRF между клиентом и этой нодой
  */
  isSameSite: 'Lax',
};

export function setCookie(reply, name, value = undefined, options = undefined) {
  const optionFinal = options
    ? {
      ...DEFAULT_COOKIE_OPTIONS,
      ...options,
    }
    : DEFAULT_COOKIE_OPTIONS;

  if (typeof value === 'undefined') {
    // обязательно нужно подавать options иначе не находится
    reply.unstate(name, optionFinal);
  } else {
    reply.state(name, value, optionFinal);
  }
  return reply;
}

export function clearCookie(reply, name, options = undefined) {
  return setCookie(reply, name, undefined, options);
}

/**
 * @deprecated - bug with set cookie value - use getCookie and setCookie instead
 * @param request
 * @param name
 * @param value
 * @return {*}
 */
export function cookie(request, name, value = null) {
  return getCookie(request, name);
}



function getFileType(fileNameOrPath) {
  if (typeof fileNameOrPath === 'string') {
    const extension = path.extname(fileNameOrPath);
    // eslint-disable-next-line no-param-reassign
    return extension
      ? getMimeType(extension)
      : 'application/octet-stream';
  }
  return null;
}

/**
 *
 * @param reply
 * @param serverPath - либо путь, либо data: , либо stream
 * @param fileName
 * @param type
 * @return {*}
 */
export function downloadFile(reply, serverPath, fileName = null, type = null) {
  if (!serverPath) {
    return reply().code(404);
  }

  // https://nodejs.org/api/http.html#http_class_http_incomingmessage
  if (serverPath instanceof http.IncomingMessage) {
    const {
      // уже прочитанный
      body,
      headers,
    } = serverPath;
    const response = reply(body);
    Object.keys(headers).forEach((headerKey) =>
      response.header(headerKey, headers[headerKey]));
    return response;
  }

  if (serverPath instanceof Readable) {
    // type = type || getFileType(fileName);
    return reply(serverPath);
    // .type(type)
    // .header('content-disposition', `attachment; filename=${encodeURI(fileName)};`)
  }

  if (path.isAbsolute(serverPath)) {
    const extension = path.extname(serverPath);
    fileName = fileName || path.basename(serverPath, extension);

    // const fileData = ; // get file content;
    // const fileBuffer = new Buffer(fileData, 'base64');
    const fileBuffer = fs.readFileSync(serverPath);

    return reply(fileBuffer)
      .encoding('binary')
      .type(type || getFileType(serverPath))
      .header('content-length', fileBuffer.length)
      .header('content-disposition', `attachment; filename=${encodeURI(fileName)};`);
  }

  const result = base64ToBuffer(serverPath, fileName);
  if (result) {
    const {
      buffer,
      headers,
    } = result;

    const response = reply(buffer);
    Object.keys(headers).forEach((headerKey) =>
      response.header(headerKey, headers[headerKey]));
    return response;
  }

  throw new Error(`Не понятный формат "${serverPath}"`);
}

export function getCurrentHostName(request) {
  return request.info.hostname;
}

export function getServerFullUrl(request, ...pathsOrParams) {
  const {
    // url:
    //   Url {
    //   protocol: null,
    //     slashes: null,
    //     auth: null,
    //     host: null,
    //     port: null,
    //     hostname: null,
    //     hash: null,
    //     search: null,
    //     query: {},
    //   pathname: '/api/auth/google',
    //     path: '/api/auth/google',
    //     href: '/api/auth/google' },

    info: {
      /*
        received: 1544545806171,
        responded: 0,
        remoteAddress: '127.0.0.1',
        remotePort: 10822,
        referrer: 'http://localhost:8080/products/good/5c0faecd8a04462198033ff3',
        host: 'localhost:8080',
        hostname: 'localhost',
        acceptEncoding: 'gzip',
        cors: { isOriginMatch: true }
      */
      /*
        received: 1553167541160,
        responded: 0,
        remoteAddress: '37.110.80.68',
        remotePort: 9432,
        referrer: 'http://dev.reagentum.ru:3001/',
        host: 'dev.reagentum.ru:3001',
        hostname: 'dev.reagentum.ru',
        acceptEncoding: 'gzip',
        cors: { isOriginMatch: false }
      */
      host,
    },
    server: {
      info: {
        /*
          id - a unique connection identifier (using the format '{hostname}:{pid}:{now base36}').
          created - the connection creation timestamp.
          started - the connection start timestamp (0 when stopped).
          port - the connection port based on the following rules:
            the configured port value before the server has been started.
            the actual port assigned when no port is configured or set to 0 after the server has been started.
          host - the host name the connection was configured to. Defaults to the operating system hostname when available, otherwise 'localhost'.
          address - the active IP address the connection was bound to after starting. Set to undefined until the server has been started or when using a non TCP port (e.g. UNIX domain socket).
          protocol - the protocol used:
            'http' - HTTP.
            'https' - HTTPS.
            'socket' - UNIX domain socket or Windows named pipe.
          uri - a string representing the connection (e.g. 'http://example.com:8080' or 'socket:/unix/domain/socket/path'). Contains the uri setting if provided, otherwise constructed from the available settings. If no port is available or set to 0, the uri will not include a port component.

          created: 1544546105671,
          started: 1544546106326,
          host: 'KinjeiroROCK',
          port: 8080,
          protocol: 'http',
          id: 'KinjeiroROCK:7536:jpjyveiv',
          uri: 'http://KinjeiroROCK:8080',
          address: '0.0.0.0'

          created: 1553103215038,
          started: 1553103217013,
          host: 'vm130052.local',
          port: 3001,
          protocol: 'http',
          id: 'vm130052.local:13354:jthhjyda',
          uri: 'http://vm130052.local:3001',
          address: '0.0.0.0'
        */
        // uri,
        protocol,
      },
    },
  } = request;
  // return `${uri}${appUrl(...pathsOrParams)}`;
  return `${protocol}://${host}${appUrl(...pathsOrParams)}`;
}

export function replaceLocalhostByCurrentHost(request, originalUrl) {
  return originalUrl.replace(/0\.0\.0\.0|127\.0\.0\.1|localhost/gi, getCurrentHostName(request));
}

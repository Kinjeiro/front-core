/* eslint-disable no-param-reassign */
import path from 'path';
import fs from 'fs';
import { URL } from 'url';
import { Readable } from 'stream';
import Response from 'hapi/lib/response';

import {
  parseUrlParameters,
  formatUrlParameters,
} from '../../common/utils/uri-utils';
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

export function responseError(error, reply, code = 500) {
  // todo @ANKU @LOW - иногда при ошибка бывает - UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 2): Error: reply interface called twice
  return responseWrapperInner(parseToUniError(error), reply)
    .code(code);
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

/**
 * @deprecated - bug with set cookie value - use getCookie and setCookie instead
 * @param request
 * @param name
 * @param value
 * @return {*}
 */
export function cookie(request, name, value = null) {
  if (value !== null) {
    request.state(name, value);
    return value;
  }
  return typeof request.state === 'function'
     ? request.state(name)
     : request.state[name];
}
export function getCookie(request, name) {
  const { state } = request;
  // eslint-disable-next-line no-nested-ternary
  let result = state
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
  return result;
}

export const DEFAULT_COOKIE_OPTIONS = {
  // todo @ANKU @CRIT @MAIN - в утилитах неочень хорошо использовать конфиги, но все же
  path: serverConfig.common.app.contextRoot || '/',
  isHttpOnly: true,
  // todo @ANKU @CRIT @MAIN @DEBUG - secure: false
  isSecure: false,
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

export function clearCookie(reply, name) {
  return setCookie(reply, name);
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

  if (serverPath instanceof Readable) {
    // type = type || getFileType(fileName);
    return reply(serverPath)
      // .type(type)
      // .header('content-disposition', `attachment; filename=${encodeURI(fileName)};`)
      ;
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

  throw new Error(`Не понятный формат "${serverPath}"`);
}


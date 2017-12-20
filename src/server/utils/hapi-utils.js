import { URL } from 'url';

import Response from 'hapi/lib/response';

import { parseToUniError } from '../../common/models/uni-error';

export function getRequestData(hapiRequest) {
  return hapiRequest.method.toUpperCase() === 'GET'
    ? hapiRequest.query
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
      const urlObj = new URL(requestOptions.url);
      Object.keys(data).forEach((queryKey) =>
        urlObj.searchParams.set(queryKey, data[queryKey]));

      // requestOptionsFinal.url = {
      //   ...urlObj,
      //   query: {
      //     ...(urlObj.query || {}),
      //     ...data,
      //   },
      // };
      requestOptionsFinal.url = urlObj.href;
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
  const isReplyResponse = typeof result === 'object' && result !== null && (result.constructor === Response || !!result.headers);

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

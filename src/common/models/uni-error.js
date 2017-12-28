import merge from 'lodash/merge';
import PropTypes from 'prop-types';

import i18n from '../utils/i18n-utils';
import logger from '../helpers/client-logger';

// import { ExtendableError } from 'common/utils/common';

const ERROR_NOT_FOUND_CODES = [
  'ETIMEDOUT',
  'ECONNREFUSED',
];
const RESPONSE_NOT_FOUND_STATUS_CODES = [
  404,
];

export const UNI_ERROR_FROM = {
  FROM_CREATE: 'FROM_CREATE',
  FROM_ERROR: 'FROM_ERROR',
  FROM_RESPONSE: 'FROM_RESPONSE',
  FROM_RESPONSE_BODY: 'FROM_RESPONSE_BODY',
  FROM_BOOM_RESPONSE: 'FROM_BOOM_RESPONSE',
  FROM_BOOM_ERROR: 'FROM_BOOM_ERROR',
  FROM_PROJECT_FORMAT: 'FROM_PROJECT_FORMAT',
};

export const MAP = {
  isUniError: PropTypes.bool,

  errorCode: PropTypes.string,
  responseStatusCode: PropTypes.number,
  isServerError: PropTypes.bool,

  clientErrorTitle: PropTypes.string,
  clientErrorMessage: PropTypes.string,

  message: PropTypes.string,
  stack: PropTypes.any,

  errorFrom: PropTypes.oneOf([
    UNI_ERROR_FROM.FROM_CREATE,
    UNI_ERROR_FROM.FROM_ERROR,
    UNI_ERROR_FROM.FROM_RESPONSE,
    UNI_ERROR_FROM.FROM_RESPONSE_BODY,
    UNI_ERROR_FROM.FROM_BOOM_RESPONSE,
    UNI_ERROR_FROM.FROM_BOOM_ERROR,
  ]),
  originalObject: PropTypes.any,

  // calculated
  uniCode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  uniMessage: PropTypes.string,
  isNotFound: PropTypes.bool,
};
export const UNI_ERROR_PROP_TYPE = PropTypes.shape(MAP);

function checkProperties(obj, ...props) {
  return props.every((prop) => Object.prototype.hasOwnProperty.call(obj, prop));
}

export function getStackTrace() {
  // либо console.trace() в консоль
  if (typeof Error.captureStackTrace === 'function') {
    const obj = {};
    Error.captureStackTrace(obj, getStackTrace);
    return obj.stack;
  }
  return (new Error()).stack;
}

export function isUniError(object) {
  return object && object.isUniError;
}

export function createUniError(uniErrorData = {}) {
  if (typeof uniErrorData === 'string') {
    // eslint-disable-next-line no-param-reassign
    uniErrorData = {
      clientErrorMessage: uniErrorData,
    };
  }

  const defaultValues = {
    isUniError: true,

    errorCode: undefined,
    responseStatusCode: undefined,
    isServerError: false,

    clientErrorTitle: i18n('core:errors.clientErrorTitleDefault'),
    clientErrorMessage: i18n('core:errors.clientErrorMessageDefault'),

    message: undefined,
    stack: undefined,

    errorFrom: UNI_ERROR_FROM.FROM_CREATE,
    originalObject: undefined,

    // calculated
    uniCode: undefined,
    uniMessage: undefined,
    isNotFound: false,
  };

  const uniError = merge({}, defaultValues, uniErrorData);

  uniError.uniCode = uniError.errorCode || uniError.responseStatusCode;

  uniError.uniMessage =
    uniErrorData.clientErrorMessage
    || uniErrorData.clientErrorTitle
    || uniErrorData.message
    || defaultValues.clientErrorMessage;

  uniError.isNotFound = ERROR_NOT_FOUND_CODES.includes(uniError.errorCode)
    || RESPONSE_NOT_FOUND_STATUS_CODES.includes(uniError.responseStatusCode);

  uniError.stack = uniError.stack || (uniError.stack !== false && getStackTrace());

  return uniError;
}

// @BUG instanceOf ThrowableUniError doesn't work
// export class ThrowableUniError extends ExtendableError {
//  uniError = null;
//
//  constructor(uniError) {
//    super();
//    // eslint-disable-next-line
//    this.uniError = parseToUniError(uniError);
//  }
//
//  getUniError() {
//    return this.uniError;
//  }
// }
export function ThrowableUniError(uniError) {
  this.name = 'ThrowableUniError';
  this.uniError = createUniError(uniError);
  this.message = this.uniError.clientErrorMessage;
  // this.stack = (new Error()).stack;
  this.stack = uniError.stack || (new Error()).stack;
}
ThrowableUniError.prototype = new Error();


// ======================================================
// PARSERS
// ======================================================
export function parseFromThrowableUniError(errorOrResponse, uniErrorData = {}) {
  if (errorOrResponse instanceof ThrowableUniError) {
    return {
      ...errorOrResponse.uniError,
      ...uniErrorData,
    };
  }
  return null;
}

export function parseFromUniError(errorOrResponse, uniErrorData) {
  if (isUniError(errorOrResponse)) {
    return merge({}, errorOrResponse, uniErrorData);
  }

  return null;
}

export function parseFromProjectFormat(errorOrResponse = {}, uniErrorData = {}) {
  // client wrapper
  if (checkProperties(errorOrResponse, 'data', 'ok')) {
    if (errorOrResponse.ok !== false) {
      return null;
    }
    // eslint-disable-next-line no-param-reassign
    errorOrResponse = errorOrResponse.data;
  }

  if (!checkProperties(errorOrResponse, 'errorCode', 'errorName')) {
    return null;
  }

  /*
   errorCode: null,
   errorName: "NullPointerException",
   errorVars: []
   message: null
   meta: {httpStatus: 500}
   */

  const {
    errorCode,
    errorName,
    // eslint-disable-next-line no-unused-vars
    errorVars,
    message,
    meta: {
      httpStatus,
    } = {},
  } = errorOrResponse;

  return createUniError({
    errorCode,
    responseStatusCode: httpStatus,
    isServerError: true,

    clientErrorMessage: message || undefined,
    message: errorName,

    errorFrom: UNI_ERROR_FROM.FROM_PROJECT_FORMAT,
    originalObject: errorOrResponse,
    ...uniErrorData,
  });
}

export function parseFromResponse(errorOrResponse, uniErrorData = {}) {
  if (
    checkProperties(errorOrResponse, 'connection')
    || checkProperties(errorOrResponse, 'response')
    || checkProperties(errorOrResponse, 'statusText')
  ) {
    // это response
    const response = errorOrResponse.response || errorOrResponse;
    const responseBody = response.body;

    if (typeof responseBody === 'object') {
      // json from middle

      /*
       {
       code: 404,
       message: null,
       clientMessage: 'message'
       }
       */

      let innerUniError = parseToUniError(responseBody, uniErrorData, { withoutException: true });
      if (innerUniError) {
        return innerUniError;
      }

      if (responseBody) {
        innerUniError = {
          message: responseBody.message,
          clientErrorMessage: responseBody.clientErrorMessage,
        };
      }

      return createUniError({
        ...(innerUniError || {}),
        responseStatusCode: response.statusCode || response.status || responseBody.code,
        originalObject: responseBody,
        errorFrom: UNI_ERROR_FROM.FROM_RESPONSE_BODY,
        ...uniErrorData,
      });
    }

    return createUniError({
      message: `${response.statusMessage || response.statusText}: ${response.request && response.request.href || response.req && response.req.url}`,
      responseStatusCode: response.statusCode,
      originalObject: responseBody,
      errorFrom: UNI_ERROR_FROM.FROM_RESPONSE,
      ...uniErrorData,
    });
  }
  return null;
}



export function parseFromError(error, uniErrorData = {}) {
  if (error instanceof Error) {
    return createUniError({
      errorCode: error.code,
      message: error.message,
      stack: error.stack,
      originalObject: error,
      errorFrom: UNI_ERROR_FROM.FROM_ERROR,
      ...uniErrorData,
    });
  }
  return null;
}

export function parseFromBoomResponse(errorOrResponse, uniErrorData = {}) {
  if (checkProperties(errorOrResponse, 'statusCode')) {
    const boomResponse = errorOrResponse;
    /*
     {
     "statusCode": 401,
     "error": "Unauthorized",
     "message": "Ошибка авторизации. Недостаточно привилегий",
     "errors": [
     {
     "title": "Unexpected error",
     "detail": "Ошибка авторизации. Недостаточно привилегий"
     }
     ]
     }
     */
    const {
      statusCode,
      error,
      message,
      errors,
    } = boomResponse;

    return createUniError({
      statusCode,
      clientErrorMessage: message,
      message: error,
      originalObject: errors,
      errorFrom: UNI_ERROR_FROM.FROM_BOOM_RESPONSE,
      ...uniErrorData,
    });
  }
  return null;
}

export function parseFromBoomError(boomError, uniErrorData = {}) {
  if (checkProperties(boomError, 'detail')) {
    /*
     {
     "title": "Unexpected error",
     "detail": "Ошибка авторизации. Недостаточно привилегий"
     }
     */
    const {
      title,
      detail,
    } = boomError;

    return createUniError({
      clientErrorMessage: detail,
      message: title,
      originalObject: boomError,
      errorFrom: UNI_ERROR_FROM.FROM_BOOM_ERROR,
      ...uniErrorData,
    });
  }

  return null;
}





export function parseToUniError(errorOrResponse, uniErrorData = {}, { withoutException } = {}) {
  if (!errorOrResponse) {
    return null;
  }

  // if (Array.isArray(errorOrResponse)) {
  //  errorOrResponse = errorOrResponse[0];
  // }

  let result = null;
  [
    parseFromThrowableUniError,
    parseFromUniError,
    parseFromProjectFormat,
    parseFromResponse,
    parseFromError,
    parseFromBoomResponse,
    parseFromBoomError,
    // parseFromString, // нельзя так как бывает просто проверка
  ].some((method) => {
    result = method(errorOrResponse, uniErrorData);
    return !!result;
  });

  if (!result && !withoutException) {
    logger.error('Can\'t convert to uni error', errorOrResponse);
    throw new Error(i18n('core:errors.errorWhileParseToUniError'));
  }

  return result;
}

export function hasError(object) {
  return isUniError(parseToUniError(object, undefined, { withoutException: true }));
}

export function throwUniError(anyError) {
  throw new ThrowableUniError(parseToUniError(anyError));
}


export default UNI_ERROR_PROP_TYPE;

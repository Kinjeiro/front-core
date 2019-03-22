/* eslint-disable no-param-reassign */
import merge from 'lodash/merge';
import PropTypes from 'prop-types';

// import i18n from '../utils/i18n-utils';
import { errorToJson as utilsErrorToJson } from '../utils/common';
import logger from '../helpers/client-logger';

// import { ExtendableError } from 'common/utils/common';


const ERROR_NOT_FOUND_CODES = [
  'ETIMEDOUT',
  'ECONNREFUSED',
];
const RESPONSE_NOT_FOUND_STATUS_CODES = [
  404, 502,
];

export const UNI_ERROR_FROM = {
  FROM_CREATE: 'FROM_CREATE',
  FROM_ERROR: 'FROM_ERROR',
  FROM_RESPONSE: 'FROM_RESPONSE',
  FROM_RESPONSE_BODY: 'FROM_RESPONSE_BODY',
  /**
   * https://github.com/hapijs/boom
   */
  FROM_BOOM: 'FROM_BOOM',
  /**
   * @deprecated - старый формат
   */
  FROM_BOOM_RESPONSE: 'FROM_BOOM_RESPONSE',
  /**
   * @deprecated - старый формат
   */
  FROM_BOOM_ERROR: 'FROM_BOOM_ERROR',
  FROM_PROJECT_FORMAT: 'FROM_PROJECT_FORMAT',
  FROM_SERVER: 'FROM_SERVER',
};


export const UNI_ERROR_PROP_TYPE_MAP = {
  isUniError: PropTypes.bool,

  errorCode: PropTypes.string,
  responseStatusCode: PropTypes.number,
  isServerError: PropTypes.bool,
  errorFrom: PropTypes.oneOf([
    UNI_ERROR_FROM.FROM_CREATE,
    UNI_ERROR_FROM.FROM_ERROR,
    UNI_ERROR_FROM.FROM_RESPONSE,
    UNI_ERROR_FROM.FROM_RESPONSE_BODY,
    UNI_ERROR_FROM.FROM_BOOM_RESPONSE,
    UNI_ERROR_FROM.FROM_BOOM_ERROR,
  ]),

  clientErrorTitle: PropTypes.node,
  /**
   * @deprecated - use clientErrorMessages
   */
  clientErrorMessage: PropTypes.node,
  clientErrorMessages: PropTypes.arrayOf(PropTypes.node),
  message: PropTypes.node,

  stack: PropTypes.any,
  originalObject: PropTypes.any,

  linkForwardTo: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),

  // ======================================================
  // CALCULATED
  // ======================================================
  uniCode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /**
   * @deprecated - use uniMessages
   */
  uniMessage: PropTypes.node,
  uniMessages: PropTypes.arrayOf(PropTypes.node),
  isNotFound: PropTypes.bool,
  isNotAuth: PropTypes.bool,
};

/**
 * @deprecated - use UNI_ERROR_PROP_TYPE_MAP
 */
export const MAP = UNI_ERROR_PROP_TYPE_MAP;
export const UNI_ERROR_PROP_TYPE = PropTypes.shape(UNI_ERROR_PROP_TYPE_MAP);

export const UNI_ERROR_DEFAULT_VALUE = {
  isUniError: true,

  errorCode: undefined,
  responseStatusCode: undefined,
  isServerError: false,
  errorFrom: UNI_ERROR_FROM.FROM_CREATE,

  clientErrorTitle: undefined,
  clientErrorMessages: undefined,
  clientErrorMessage: undefined,
  message: undefined,

  stack: undefined,

  originalObject: undefined,

  linkForwardTo: undefined,

  // calculated
  uniCode: undefined,
  // todo @ANKU @LOW - подумать над локализацией
  uniMessage: 'Произошла ошибка',
  uniMessages: undefined,
  isNotFound: false,
  isNotAuth: false,
};


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
    uniErrorData = {
      clientErrorMessage: uniErrorData,
    };
  } else if (Array.isArray(uniErrorData)) {
    uniErrorData = {
      clientErrorMessages: uniErrorData,
    };
  }

  if (uniErrorData.clientErrorMessages && uniErrorData.clientErrorMessages.length > 0) {
    uniErrorData.clientErrorMessage = uniErrorData.clientErrorMessages[0];
  } else if (uniErrorData.clientErrorMessage) {
    uniErrorData.clientErrorMessages = [uniErrorData.clientErrorMessage];
  }

  const uniError = merge({}, UNI_ERROR_DEFAULT_VALUE, uniErrorData);

  uniError.uniCode = uniError.errorCode || uniError.responseStatusCode;

  uniError.uniMessage =
    (uniError.clientErrorMessages && uniError.clientErrorMessages[0])
    || uniError.clientErrorMessage
    || uniError.clientErrorTitle
    || uniError.message
    || UNI_ERROR_DEFAULT_VALUE.uniMessage;
  uniError.uniMessages = uniError.clientErrorMessages && uniError.clientErrorMessages.length > 0
    ? uniError.clientErrorMessages
    : [uniError.uniMessage];

  uniError.isNotFound = uniError.isNotFound || ERROR_NOT_FOUND_CODES.includes(uniError.errorCode)
    || RESPONSE_NOT_FOUND_STATUS_CODES.includes(uniError.responseStatusCode)
    || (uniError.uniMessage && uniError.uniMessage.indexOf('connect ECONNREFUSED') === 0);

  uniError.isNotAuth = uniError.isNotAuth || uniError.uniCode === 401;

  uniError.stack = (uniError.originalObject && uniError.originalObject.stack)
    || uniError.stack
    || (uniError.stack !== false && getStackTrace());

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

// todo @ANKU @LOW - сделать кастом формат через раннер, а этот хелпер как синглтон
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

export function parseFromJsonError(errorOrResponse, uniErrorData) {
  if (
    typeof errorOrResponse === 'object'
    && (
      typeof errorOrResponse.message !== 'undefined'
      || typeof errorOrResponse.error !== 'undefined'
    )
  ) {
    const {
      clientErrorMessage,
      clientErrorMessages,
      message,
      error,
      status,
    } = errorOrResponse;

    if (clientErrorMessage || clientErrorMessages) {
      return createUniError(merge({}, errorOrResponse, uniErrorData));
    }
    if (typeof error === 'string' || typeof message === 'string') {
      /*
       error: "Internal Server Error",
       exception: "java.lang.Exception",
       message: "У объекта #28 нет актуальной версии.",
       path: "/tobjects/28",
       status: 500,
       timestamp: 1524833891185,
       */
      return createUniError(merge({}, {
        message: error && message ? message : error,
        clientErrorMessage: error && message ? error : message,
        errorCode: status,
        originalObject: errorOrResponse,
      }, uniErrorData));
    }
  }
  return null;
}

export function parseFromResponse(errorOrResponse, uniErrorData = {}) {
  if (
    checkProperties(errorOrResponse, 'connection')
    || checkProperties(errorOrResponse, 'response')
    || checkProperties(errorOrResponse, 'statusText')
  ) {
    // это response
    const response = errorOrResponse.response || errorOrResponse;
    const responseBody = response.body || response.payload;

    if (typeof responseBody === 'object') {
      // json from middle

      /*
       {
       code: 404,
       message: null,
       clientMessage: 'message'
       }
       */

      // eslint-disable-next-line no-use-before-define
      let innerUniError = parseToUniError(responseBody, uniErrorData, { withoutException: true });
      if (innerUniError) {
        return innerUniError;
      }

      if (responseBody) {
        innerUniError = {
          message: responseBody.message,
          clientErrorMessage: responseBody.clientErrorMessage,
          clientErrorMessages: responseBody.clientErrorMessages,
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
      // eslint-disable-next-line max-len
      message: `${response.statusMessage || response.statusText}: ${(response.request && response.request.href) || (response.req && response.req.url)}`,
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

/**
 * https://github.com/hapijs/boom
 - isBoom - if true, indicates this is a Boom object instance. Note that this boolean should only be used if the error is an instance of Error. If it is not certain, use Boom.isBoom() instead.
 - isServer - convenience bool indicating status code >= 500.
 - output - the formatted response. Can be directly manipulated after object construction to return a custom error response. Allowed root keys:
   - statusCode - the HTTP status code (typically 4xx or 5xx).
   - headers - an object containing any HTTP headers where each key is a header name and value is the header content.
   - payload - the formatted object used as the response payload (stringified). Can be directly manipulated but any changes will be lost if reformat() is called. Any content allowed and by default includes the following content:
     - statusCode - the HTTP status code, derived from error.output.statusCode.
     - error - the HTTP status message (e.g. 'Bad Request', 'Internal Server Error') derived from statusCode.
     - message - the error message derived from error.message.

 // - message - the error message.
 // - typeof - the constructor used to create the error (e.g. Boom.badRequest).
   - inherited Error properties (message, stack)
 */
export function parseFromBoom(errorOrResponse, uniErrorData = {}) {
  if (checkProperties(errorOrResponse, 'isBoom') && errorOrResponse.isBoom) {
    // унаследовано от Error
    // const boomResponse = errorOrResponse;
    // const {
    //   output: {
    //     statusCode,
    //     payload: {
    //       message,
    //       error,
    //     },
    //   },
    //   stack,
    // } = boomResponse;
    //
    // return createUniError({
    //   responseStatusCode: statusCode,
    //   clientErrorMessage: error,
    //   message,
    //   stack,
    //   originalObject: boomResponse,
    //   errorFrom: UNI_ERROR_FROM.FROM_BOOM,
    //   ...uniErrorData,
    // });

    const uniError = parseFromError(errorOrResponse, uniErrorData);
    uniError.errorFrom = UNI_ERROR_FROM.FROM_BOOM;
    return uniError;
  }
  return null;
}

/**
 * @deprecated - старый формат
 */
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
      responseStatusCode: statusCode,
      clientErrorMessage: message,
      message: error,
      originalObject: errors,
      errorFrom: UNI_ERROR_FROM.FROM_BOOM_RESPONSE,
      ...uniErrorData,
    });
  }
  return null;
}

/**
 * @deprecated - старый формат
 */
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
    parseFromBoom,
    parseFromJsonError,
    parseFromResponse,
    parseFromError,
    parseFromBoomResponse,
    parseFromBoomError,
    // parseFromString, // нельзя так как бывает просто проверка
  ].some((method) => {
    const methodResult = method(errorOrResponse, uniErrorData);
    if (methodResult) {
      result = createUniError(methodResult);
    }
    return !!result;
  });

  if (!result && !withoutException) {
    logger.error('Can\'t convert to uni error', errorOrResponse);
    // throw new Error(i18n('core:errors.errorWhileParseToUniError'));
    return createUniError({
      message: 'Can\'t convert to uni error',
      originalObject: errorOrResponse,
    });
  }

  return result;
}

export function hasError(object) {
  return isUniError(parseToUniError(object, undefined, { withoutException: true }));
}

export function throwUniError(anyError) {
  throw new ThrowableUniError(parseToUniError(anyError));
}

export const errorToJson = utilsErrorToJson;


export default UNI_ERROR_PROP_TYPE;

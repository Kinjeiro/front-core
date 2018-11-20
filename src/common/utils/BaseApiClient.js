/* eslint-disable no-param-reassign,no-undef,no-unused-vars */
import requestAgent from 'superagent';

import { getUser } from '../app-redux/selectors';

import clientConfig from '../client-config';

import {
  generateId,
} from './common';
import {
  joinUri,
  isFullUrl,
} from './uri-utils';
import {
  parseToJsonPatch,
  replacePathIndexToItemId,
  downloadFile,
  convertToFormData,
} from './api-utils';
import createApiConfig from './create-api-config';
import { cutContextPath } from '../helpers/app-urls';

import { getCookie } from './cookie';

import { parseToUniError } from '../models/uni-error';

export const DEFAULT_API_CLIENT_OPTIONS = {
  apiHost: null,
  apiPort: null,
  apiPrefix: '',
  apiProtocol: 'http',
  withContextUrl: true,
  withCredentials: false,
  contextRoot: clientConfig.common.app.contextRoot,
  // против CSRF атаки берем из куков и проставляем в хеадер значение
  cookieCSRF: clientConfig.common.cookieCSRF,
  usePatchByItemId: false,
  retryWhenNotAuthErrorTimeout: clientConfig.common.features.auth.retryWhenNotAuthErrorTimeout,
  retryWhenNotAuthErrorAttempts: clientConfig.common.features.auth.retryWhenNotAuthErrorAttempts,
};


/**
 * Класс для отсылки запросов на сервер
 */
export default class BaseApiClientClass {
  apiClientOptions;

  getContextDataFn = null;

  constructor(apiClientOptions = {}) {
    this.apiClientOptions = {
      ...DEFAULT_API_CLIENT_OPTIONS,
      // УРЛ должен быть не выше директории base-api-client-class.js
      // getMockOnDemandPromise: null,
      ...apiClientOptions,
    };
  }

  setGetContextDataFn(getContextFn) {
    this.getContextDataFn = getContextFn;
  }
  getContextData(...args) {
    if (!this.getContextDataFn) {
      throw new Error('Функция получения контекста "getContextFn" не задана');
    }
    return this.getContextDataFn(...args);
  }
  getUser(...args) {
    const context = this.getContextData(...args);
    // обычно у нас в качестве контекста redux globalState и в нем есть userInfo.userData
    // return context ? context.userInfo.userData : null;
    return context ? getUser(context) : null;
  }
  /**
   * @deprecated - use getUser
   * @param args
   * @return {*}
   */
  getUserInfo(...args) {
    return this.getUser(...args);
  }

  getContextRoot() {
    return this.apiClientOptions.contextRoot;
  }

  get(url, params, options = {}) {
    return this.proceedRequest({
      ...options,
      url,
      params,
    });
  }
  post(url, data, options = {}) {
    return this.proceedRequest({
      ...options,
      method: 'post',
      url,
      data,
    });
  }
  put(url, data, options = {}) {
    return this.proceedRequest({
      ...options,
      method: 'put',
      url,
      data,
    });
  }
  patch(url, data, options = {}) {
    let patchOperations = parseToJsonPatch(data);

    if (this.apiClientOptions.usePatchByItemId) {
      patchOperations = patchOperations.map((operation) => replacePathIndexToItemId(operation));
    }

    return this.proceedRequest({
      ...options,
      method: 'patch',
      url,
      data: patchOperations,
    });
  }
  // delete - зарезервированное слово
  delete1(url, data, options = {}) {
    return this.proceedRequest({
      ...options,
      method: 'delete',
      url,
      data,
    });
  }
  api(apiConfig, paramsOrData = null, options = {}) {
    const {
      method = 'get',
      path,
    } = createApiConfig(apiConfig);
    const httpMethod = method.toLowerCase();
    const clientMethod = httpMethod === 'delete'
      ? 'delete1'
      : httpMethod;
    return this[clientMethod](path, paramsOrData, options);
  }

  uploadFiles(apiConfig, filesMap, params = {}, options = {}) {
    return this.api(
      apiConfig,
      convertToFormData(params, filesMap, options),
      options,
    );
  }

  uploadFile(apiConfig, filesMap, params = {}, options = {}) {
    return this.uploadFiles(apiConfig, filesMap, params, options)
      .then((result) => Array.isArray(result) ? result[0] : result);
  }

  downloadFile(apiConfig, fileName, paramsOrData = null, options = {}) {
    return this.api(
      apiConfig,
      paramsOrData,
      {
        ...options,
        isFile: true,
      },
    )
      // todo @ANKU @LOW - может брать из headers ответа?
      .then((blob) => downloadFile(blob, fileName));
  }

  proceedPathParams(url, pathParams) {
    // todo @ANKU @LOW - лучше проверять не по pathParams а наоборот из урла извлекать и искать в pathParams и если нету искать из доп параметра contextParams (для userId, примеру)
    if (pathParams) {
      Object.keys(pathParams).forEach((pathParam) => {
        const value = pathParams[pathParam];
        url = url.replace(`{${pathParam}}`, encodeURIComponent(value));
      });
    }
    return url;
  }

  formatUrl(url) {
    const {
      apiHost,
      apiPort,
      apiPrefix,
      apiProtocol,
      withContextUrl,
    } = this.apiClientOptions;

    if (isFullUrl(url)) {
      return url;
    }

    const fullPath = joinUri('/', apiPrefix || '', url);

    if (apiHost || apiPort) {
      const protocol = typeof location !== 'undefined'
        ? location.protocol.replace(':', '')
        : apiProtocol;

      // Prepend host and port of the API server to the path.
      // or for server rendering use absolute path
      return `${protocol}://${apiHost || 'localhost'}${apiPort ? `:${apiPort}` : ''}${fullPath}`;
    }
    // Prepend `/api` to relative URL, to proxy to API server.
    return joinUri('/', withContextUrl ? this.getContextRoot() : '', fullPath);
  }

  /**
   * Используется для загрузки НЕ АПИ методов при настроенном на один хост клиент апи (для апи использовать client.post \ client.get)
   * @param absoluteUrl
   * @param params
   * @param options
   * @returns {*}
   */
  ajaxGet(absoluteUrl, params, options = {}) {
    return this.proceedRequest({
      url: absoluteUrl,
      ...options,
      urlRelative: false,
      params,
    });
  }

  /**
   * Используется для загрузки НЕ АПИ методов при настроенном на один хост клиент апи
   * @param absoluteUrl
   * @param data
   * @param options
   * @returns {*}
   */
  ajaxPost(absoluteUrl, data, options = {}) {
    return this.proceedRequest({
      ...options,
      url: absoluteUrl,
      method: 'post',
      urlRelative: false,
      data,
    });
  }


  /**
   * object of that fields
   * @param url
   * @param method
   * @param urlRelative
   * @param params
   * @param data
   * @param pathParams
   * @param serializer
   * @param deSerializer
   * @param type
   * @param contentType
   * @param headers
   * @param timeout
   * @param mock -
   boolean - use mock on demand,
   function(requestOptions, error, response){} - execute for result
   other - result
   * @param mockFilter - function(requestOptions, error, response) {}
   * @returns {Promise}
   */
  proceedRequest(requestOptions) {
    requestOptions = this.parseOptions(requestOptions);

    const {
      optionsParser, // используется в parseOptions

      url,
      method = 'get',

      // customize
      // type = 'json',
      type,
      isFile = false,
      onUploadProgress = null,
      binaryType, // blob, arraybuffer
      acceptType = 'application/json',
      headers = {},
      timeout = 0,

      // DATA
      params,
      data,
      pathParams = {},

      // pre\post-processing
      serializer, // используется внутри this.serializeRequest
      deserializer, // используется внутри this.deserializeResponse

      mock,
      mockFilter = this.mockFilter,
    } = requestOptions;

    // ======================================================
    // PATH PARAMS
    // ======================================================
    const urlFinal = this.proceedPathParams(this.formatUrl(url), pathParams);
    requestOptions.url = urlFinal;

    // ======================================================
    // MOCKING
    // ======================================================
    if (mockFilter(requestOptions)) {
      return this.proceedMock(requestOptions);
    }

    // ======================================================
    // REQUEST INIT
    // ======================================================
    // https://visionmedia.github.io/superagent/#post-/-put-requests
    let request = requestAgent[method](urlFinal);

    // json \ form - for application/x-www-form-urlencoded

    if (type) {
      request.type(type);
    }

    if (onUploadProgress) {
      request.on('progress', onUploadProgress);
    }
    if (isFile || binaryType || acceptType === 'blob' || acceptType === 'arraybuffer' || acceptType === '*/*') {
      request.responseType((isFile && 'blob') || binaryType || acceptType);
    } else {
      // json \ application/json \ xml
      request.accept(acceptType);
    }

    request.timeout({
      // response: 5000,  // Wait 5 seconds for the server to start sending,
      deadline: timeout,
    });

    // ======================================================
    // HEADERS
    // ======================================================
    if (this.apiClientOptions.withCredentials) {
      request.withCredentials();
    }

    if (this.apiClientOptions.cookieCSRF) {
      request.set(
        'X-CSRF-Token',
        getCookie(
          typeof this.apiClientOptions.cookieCSRF === 'string'
            ? this.apiClientOptions.cookieCSRF
            : 'cookie-csrf',
        ),
      );
    }
    request.set('X-Request-ID', generateId());
    Object.keys(headers).forEach((headerKey) => {
      request.set(headerKey, headers[headerKey]);
    });

    // ======================================================
    // QUERY
    // ======================================================
    if (params) {
      request.query(params);
    }

    // ======================================================
    // DATA
    // ======================================================
    if (data) {
      request.send(data);
    }

    // ======================================================
    // SERIALIZE
    // ======================================================
    // eslint-disable-next-line no-const-assign
    request = this.serializeRequest(request, requestOptions);


    // ======================================================
    // RUN
    // ======================================================
    return new Promise((resolve, reject) => {
      const callback = this.requestCallback.bind(this, resolve, reject, requestOptions);
      // EXECUTE
      if (timeout) {
        setTimeout(() => request.end(callback), timeout);
      } else {
        request.end(callback);
      }
    });
  }

  parseOptions(requestOptions) {
    return requestOptions.optionsParser
      ? requestOptions.optionsParser(requestOptions)
      : requestOptions;
  }

  serializeRequest(request, requestOptions) {
    return requestOptions.serializer
      ? requestOptions.serializer(request, requestOptions)
      : request;
  }

  deserializeResponse(error, response, requestOptions) {
    const {
      deserializer,
    } = requestOptions;
    return deserializer
      ? deserializer(error, response)
      : response;
  }

  requestCallback(resolve, reject, requestOptions, err, response) {
    const {
      mockFilter = this.mockFilter,
    } = requestOptions;

    const deserializedResponse = this.deserializeResponse(err, response, requestOptions);

    const error = err && this.parseError(err, deserializedResponse);

    if (mockFilter(requestOptions, err, deserializedResponse)) {
      this.proceedMock(requestOptions, err, deserializedResponse)
        .then(resolve)
        .catch(reject);
    } else if (error) {
      if (error.isNotAuth && this.apiClientOptions.retryWhenNotAuthErrorTimeout) {
        requestOptions.retryWhenNotAuthErrorAttempts = requestOptions.retryWhenNotAuthErrorAttempts || 0;
        if (requestOptions.retryWhenNotAuthErrorAttempts < this.apiClientOptions.retryWhenNotAuthErrorAttempts) {
          requestOptions.retryWhenNotAuthErrorAttempts += 1;
          setTimeout(() => {
            // возможно уже отработал refresh_token и пришли на клиент обновленные токены
            this.proceedRequest({
              ...requestOptions,
              url: cutContextPath(requestOptions.url),
            })
              .then((result) => resolve(result))
              .catch((result) => reject(result));
          }, this.apiClientOptions.retryWhenNotAuthErrorTimeout);
        } else {
          reject(error);
        }
      } else {
        reject(error);
      }
    } else if (typeof deserializedResponse.body !== 'undefined') {
      // response
      resolve(deserializedResponse.body || deserializedResponse.text);
    } else {
      // custom deserialized object
      resolve(deserializedResponse);
    }
  }


  mockFilter(requestOptions, error/* , response*/) {
    const { mock } = requestOptions;
    if (error && error.code === 'ECONNABORTED') {
      console.warn('Abort by timeout');
      return true;
    }
    return mock && error && (
        error.timeout
        || [503, 504].indexOf(error.status) >= 0
        || error.message.indexOf('Request has been terminated') >= 0
      );
  }
  proceedMock(requestOptions, error, response) {
    const { getMockOnDemandPromise } = this.apiClientOptions;
    const {
      mock,
      url,
    } = requestOptions;

    console.warn(`Use mock for: ${url}`);

    if (typeof mock === 'function') {
      try {
        return Promise.resolve(mock(requestOptions, error, response));
      } catch (exception) {
        exception.clientErrorMessage = exception.message;
        return Promise.reject(exception);
      }
    }
    if (mock === true) {
      if (getMockOnDemandPromise) {
        // const urlObj = new URL(url);
        // const mockFilePath = `${getMockOnDemandPromise}${urlObj.pathname}.json`;
        // todo @ANKU @LOW - подумать на ошибкой динамического request на клиенте

        // if (this.apiClientOptions.getMockOnDemandPromise) {
        //  this.mockRequiredContext = require.context(this.apiClientOptions.getMockOnDemandPromise, true, /^\.\/.*\.json/);
        // }
        // var req = require.context("./templates", true, /^\.\/.*\.jade$/);
        // var tableTemplate = req("./table.jade");
        // // tableTemplate === require("./templates/table.jade");


        const mockPath = joinUri('/',
          url
            .replace(/^(?:\/\/|[^/]+)*\//, '') // убираем http, host, port
            .replace(/\/$/, ''), // убираем последний слэш, если он есть
          // .replace(config.mainApiContextRoot, '') //убираем api prefix
        );
        return getMockOnDemandPromise(mockPath);
      }
      return Promise.reject('getMockOnDemandPromise doesn\'t set');
    }
    return Promise.resolve(mock);
  }


  parseError(err, response) {
    console.error('ClientApi:', err, err.stack);
    if (!response) {
      console.error('ClientApi: EMPTY response');
    }

    // return response && (response.body || response.text)) || err || response;
    return parseToUniError(
      response || err,
      undefined,
      { withoutException: true },
    );
  }

  /*
   * There's a V8 bug where, when using Babel, exporting classes with only
   * constructors sometimes fails. Until it's patched, this is a solution to
   * "ApiClient is not defined" from issue #14.
   * https://github.com/erikras/react-redux-universal-hot-example/issues/14
   *
   * Relevant Babel bug (but they claim it's V8): https://phabricator.babeljs.io/T2455
   *
   * Remove it at your own risk.
   */
  empty() {}
}

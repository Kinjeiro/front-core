import Hoek from 'hoek';
// todo @ANKU @LOW @BUG_OUT @superagent - ??? superagent имеет багу с поточной передачей данных, поэтому исползуем request
import requestAgent from 'request';

import { isUniError, parseToUniError, ThrowableUniError } from '../../common/models/uni-error';
import { formatUrlParameters, joinUri } from '../../common/utils/uri-utils';

// import serverConfig from '../server-config';
import { getHeadersByAuthType } from './auth-utils';
import logger, { logObject } from '../helpers/server-logger';


export const CONTENT_TYPES = {
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  FORM_DATA: 'multipart/form-data',
  JSON: 'application/json',
};
export const ACCEPT = {
  JSON: 'application/json',
  ANY: '*/*',
};

// ======================================================
// UTILS
// ======================================================

export function getHeaders(/* apiRequest */) {
  return {
    /*
      @NOTE: все названия попадают под lowwerCase - поэтому лучше писать snake
    */
    // projectId: serverConfig.common.appId,
    // project_id: serverConfig.common.appId,
  };
}


// ======================================================
// COMMON REQUEST
// ======================================================
/**
 * @param requestOptions - https://github.com/request/request#requestoptions-callback
 *
 * !!! Есть ужасная бага при загрузке файлов - буффер по умолчанию переводится в строку
 * https://stackoverflow.com/questions/14855015/getting-binary-content-in-node-js-using-request
   нужно установить в настройках:
   encoding: null,
 *
 * @returns {Promise}
 */
export async function sendSimpleRequest(requestOptions) {
  // const {
  //   pipeStream,
  //   ...requestOptionsFinal
  // } = requestOptions;

  // todo @ANKU @BUG_OUT @request - не пользуйтеся request библиотекой, она использует queryStrings, а она brackets для малтипл параметром не понимает, тупо пытается их сериализовать
  const requestOptionsFinal = {
    ...requestOptions,
    url: formatUrlParameters(requestOptions.qs, requestOptions.url),
    qs: undefined,
  };

  if (requestOptionsFinal.headers && requestOptionsFinal.headers.contentType) {
    requestOptionsFinal.headers = {
      ...requestOptionsFinal.headers,
      // todo @ANKU @LOW - бага node_modules/request/request.js:526
      'content-type': requestOptionsFinal.headers.contentType,
    };
  }

  return new Promise((resolve, reject) => {
    logger.log(`==== [${requestOptionsFinal.url}] ====`);

    function callback(error, responseIncomingMessage) {
      logger.log(`[from server REQUEST]${responseIncomingMessage ? `[${responseIncomingMessage.statusCode}]` : ''}`);
      logObject(requestOptionsFinal, ['method', 'url']);
      logObject(requestOptionsFinal, ['qs', 'payload', 'body', 'timeout', 'headers'], 'debug', true);

      if (error) {
        logger.error('\n\n\n[from server RESPONSE ERROR]\n', error.body || error, '\n\n');
        // setTimeout(() => {
        //   logger.error('[server RESPONSE ERROR]\n', error.body || error);
        // }, 1);
        reject(parseToUniError(error));
      } else if (responseIncomingMessage.statusCode >= 300 || responseIncomingMessage.statusCode < 200) {
        logger.error(`[from server RESPONSE ERROR STATUS]\n${responseIncomingMessage.statusCode}: `);
        logger.debug('\n-- responseBody:\n', responseIncomingMessage.body, '\n-- request options:\n', requestOptionsFinal, '\n\n');
        reject(parseToUniError(responseIncomingMessage));
      } else {
        logger.log('[from server RESPONSE]');

        if (responseIncomingMessage.body && responseIncomingMessage.body.length) {
          if (responseIncomingMessage.length < 5000 || !responseIncomingMessage.body.slice) {
            logger.debug(responseIncomingMessage.body, '\n\n');
          } else {
            logger.debug(responseIncomingMessage.body.slice(0, 30), '...[BIG CONTENT]...\n\n');
          }
        }
        resolve(responseIncomingMessage);
      }
    }

    try {
      const req = requestAgent(requestOptionsFinal, callback);
      req
        .on('data', (data) => {
          // decompressed data as it is received
          logger.debug(`decoded chunk: ${data && data.length}`);
        });
        // .on('response', (response) => {
        //   // unmodified http.IncomingMessage object
        //   response.on('data', (data) => {
        //     // compressed data as it is received
        //     logger.debug(`received ${data.length} bytes of compressed data`);
        //   });
        // });
    } catch (error) {
      /*
        code: "ECONNRESET"
        errno: "ECONNRESET"
        syscall: "read"
      */
      if (isUniError(error)) {
        reject(error);
      } else if (error.code === 'ECONNRESET') {
        reject(new ThrowableUniError({
          isServerNotAvailable: true,
          isServerError: true,
          originalObject: error,
          message: error.message,
        }));
      } else {
        reject(error);
      }
    }
    // if (pipeStream) {
    //   req.pipe(pipeStream);
    // }
  });
}



// ======================================================
// API CONFIG (with serviceUrl)
// ======================================================
// export async function sendProxyApiRequest(proxyUri, apiRequest, proxyRequestOptions = {}) {
//   const {
//     method,
//     path,
//     params = {},
//     query = {},
//   } = apiRequest;
//
//   const finalProxyUri = Hoek.reachTemplate({
//     path, // дополнительно добавим параметр текущего пути - "path"
//     ...query,
//     ...params,
//   }, proxyUri);
//
//   return sendSimpleRequest(merge(
//     {
//       url: finalProxyUri,
//       method,
//       qs: query,
//       body: params,
//       json: true,
//       headers: getHeaders(apiRequest),
//     },
//     proxyRequestOptions
//   ))
//     .then((response) => response.body);
// }

// // ======================================================
// // Only Rest Service
// // ======================================================
// export function restServiceRequestSimple(restServiceConfig, data, requestOptions) {
//  return sendSimpleProxyApiRequest(
//    {
//      serviceUrl: restServiceConfig.serviceUrl,
//      method: restServiceConfig.method
//    },
//    data,
//    requestOptions
//  )
// }
//
// export function restServiceRequest(restServiceConfig, apiRequest, additionalData, requestOptions) {
//  return sendProxyApiRequest(
//    {
//      serviceUrl: restServiceConfig.serviceUrl,
//      method: restServiceConfig.method
//    },
//    apiRequest,
//    additionalData,
//    requestOptions
//  );
// }


// ======================================================
// ENDPOINT Middleware SERVICE Methods
// ======================================================
/**
 *
 * @param endpointServiceConfig
 * @param serviceMethodPath
 * @param data - если потребуется возьмутся для pathParams
 * @param additionalPathParams - сначала из них возьмутся
 * @return {*}
 */
export function getEndpointServiceUrl(
  endpointServiceConfig,
  serviceMethodPath = '',
  data = undefined,
  additionalPathParams = undefined,
) {
  const {
    fullUrl: serviceFullUrl,
  } = endpointServiceConfig;

  let url = `${serviceFullUrl}${joinUri('/', serviceMethodPath)}`;
  if (additionalPathParams) {
    url = Hoek.reachTemplate(additionalPathParams, url);
  }
  return Hoek.reachTemplate(data, url);
}

/**
 *
 1) Обычено чтобы указать тип необходимых данных через TypeScript, делают такую обертку (чтобы data была в параметрах):
     export default function serviceMethodsFactory(endpointServiceConfig) {
      function findTariffByInn(data: DataTypeScript, ...other) {
        return sendEndpointMethodRequest(endpointServiceConfig,
          '/all', 'get', data, ...other);
      }

      return {
        findTariffByInn
      };
     }

 2) либо можете просто использовать фабрику (он сам все данные пробросит)
     findTariffByInn: factoryEndpointServiceMethodRequest(endpointServiceConfig, 'tariff', 'get')


 * @param endpointServiceConfig
 * @param serviceMethodPath
 * @param method
 * @param data
 * @param apiRequest
 * @param requestOptions - https://www.npmjs.com/package/request
 * @param logger
 * @returns {*}
 */
export async function sendEndpointMethodRequest(
  endpointServiceConfig,
  serviceMethodPath,
  method = 'GET',
  data,
  apiRequest = null,
  requestOptions = {},
) {
  const {
    timeout,
    requestOptions: endpointRequestOptions = {},
  } = endpointServiceConfig;

  const requestOptionsFinal = {
    ...endpointRequestOptions,
    ...requestOptions,
  };

  const {
    pathParams,
  } = requestOptions;

  const {
    returnResponse,
    form,
    formData,
  } = requestOptionsFinal;

  const url = getEndpointServiceUrl(endpointServiceConfig, serviceMethodPath, data, pathParams);

  const isGet = method.toUpperCase() === 'GET';

  const headersPreFinal = {
    ...getHeaders(apiRequest),
    ...endpointRequestOptions.headers,
    ...requestOptions.headers,
  };

  const isFormData = formData || (headersPreFinal.contentType && headersPreFinal.contentType.indexOf(CONTENT_TYPES.FORM_DATA) >= 0);

  const headersFinal = {
    contentType: form
      ? CONTENT_TYPES.FORM_URLENCODED
      // если это form-data сама проставится внутри request и добавит boundary
      : undefined,
    accept: ACCEPT.JSON,
    ...headersPreFinal,
  };

  const isFormUrlencoded = form || headersFinal.contentType === CONTENT_TYPES.FORM_URLENCODED;

  const response = await sendSimpleRequest(
    {
      method,
      url,
      json: !isFormUrlencoded && !isFormData,

      qs: isGet ? data : undefined,
      body: isGet || isFormUrlencoded || isFormData ? undefined : data,
      // https://github.com/request/request#forms
      // application/x-www-form-urlencoded
      // или
      // multipart/form-data
      form: isFormUrlencoded ? form || data : undefined,
      /*
        в библиотеке request уже подцепляется библиотека form-data, которая преобразуем объект в FormData и отсылает проставляя собственный contentType: form-data c boundary
        К примеру:
          file: {
            value: await streamToString(readStream, true),
            options: {
              filename,
              contentType,
            },
          },
          file2: anyBuffer,
      */
      formData: isFormData ? formData || data : undefined,

      timeout,
      ...requestOptionsFinal,

      headers: headersFinal,
    },
  );

  return returnResponse
    ? response
    : headersFinal.accept === ACCEPT.JSON && response.body && typeof response.body === 'string'
      ? JSON.parse(response.body)
      : response.body;
}

export async function sendWithAuth(
  token,
  endpointServiceConfig,
  serviceMethodPath,
  method = 'GET',
  data,
  apiRequest = null,
  requestOptions = {},
) {
  return sendEndpointMethodRequest(
    endpointServiceConfig,
    serviceMethodPath,
    method,
    data,
    apiRequest,
    {
      ...requestOptions,
      headers: {
        ...getHeadersByAuthType(token, requestOptions.authType),
        ...requestOptions.headers,
      },
    },
  );
}

export async function sendEndpointMethodFormDataRequest(
  endpointServiceConfig,
  serviceMethodPath,
  formData,
  apiRequest = null,
  requestOptions = {},
) {
  // see http://stackoverflow.com/questions/32138748/pipe-a-uploaded-file-to-a-remote-server-with-node-ideally-with-same-filename
  // const formData = {
  //  file: {
  //    //value: fs.createReadStream(file.path),
  //    value: apiRequestData.file,
  //    options: {
  //      filename: 'ankuTest'
  //    }
  //  }
  // };

  const response = await sendEndpointMethodRequest(
    endpointServiceConfig,
    serviceMethodPath,
    'post',
    null,
    apiRequest,
    {
      json: false,
      formData,
      ...requestOptions,
    },
  );

  // todo @ANKU @CRIT @MAIN - хочу отсылать form-data, но приходит почему-то content-type html
  // если включаю json:true - то падает write of end
  //
  // headers: { 'Content-Type': 'application/json' },
  // вариант не работает
  // console.warn('ANKU response', typeof response, response);
  return JSON.parse(response);
}
/**
 * Реализует запрос до
 *
 * @param endpointServiceConfig
 * @param serviceMethodPath
 * @param method
 * @param data
 * @param requestOptions
 * @param logger
 * @returns {Promise.<*>}
 */
export async function factoryEndpointServiceMethodRequest(endpointServiceConfig, serviceMethodPath, method) {
  return (data, apiRequest, requestOptions) =>
    sendEndpointMethodRequest(endpointServiceConfig, serviceMethodPath, method, data, apiRequest, requestOptions);
}

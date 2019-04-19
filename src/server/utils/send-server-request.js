import Hoek from 'hoek';
// todo @ANKU @LOW @BUG_OUT @superagent - ??? superagent имеет багу с поточной передачей данных, поэтому исползуем request
import requestAgent from 'request';

import { parseToUniError } from '../../common/models/uni-error';
import { joinUri } from '../../common/utils/uri-utils';

import serverConfig from '../server-config';
import { getHeadersByAuthType } from './auth-utils';
import logger, { logObject } from '../helpers/server-logger';


// ======================================================
// UTILS
// ======================================================

export function getHeaders(/* apiRequest */) {
  return {
    /**
    * @deprecated - use projectId
    */
    applicationId: serverConfig.common.appId,
    /*
      @NOTE: все названия попадают под lowwerCase - поэтому лучше писать snake
    */
    // projectId: serverConfig.common.appId,
    project_id: serverConfig.common.appId,
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
export function sendSimpleRequest(requestOptions) {
  // const {
  //   pipeStream,
  //   ...requestOptionsFinal
  // } = requestOptions;

  return new Promise((resolve, reject) => {
    logger.log(`==== [${requestOptions.url}] ====`);

    function callback(error, response) {
      logger.log('[from server REQUEST]');
      logObject(requestOptions, ['method', 'url']);
      logObject(requestOptions, ['qs', 'payload', 'body', 'timeout', 'headers'], 'debug', true);

      if (error) {
        logger.error('\n\n\n[from server RESPONSE ERROR]\n', error.body || error, '\n\n');
        // setTimeout(() => {
        //   logger.error('[server RESPONSE ERROR]\n', error.body || error);
        // }, 1);
        reject(parseToUniError(error));
      } else if (response.statusCode >= 300 || response.statusCode < 200) {
        logger.error(`[from server RESPONSE ERROR STATUS]\n${response.statusCode}: `);
        logger.debug('\n-- responseBody:\n', response.body, '\n-- request options:\n', requestOptions, '\n\n');
        reject(parseToUniError(response));
      } else {
        logger.log('[from server RESPONSE]');
        logger.debug(response.body, '\n\n');
        resolve(response);
      }
    }

    const req = requestAgent(requestOptions, callback);
    req
      .on('data', (data) => {
        // decompressed data as it is received
        console.log(`decoded chunk: ${data}`);
      })
      .on('response', (response) => {
        // unmodified http.IncomingMessage object
        response.on('data', (data) => {
          // compressed data as it is received
          console.log(`received ${data.length} bytes of compressed data`);
        });
      });

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
export function getEndpointServiceUrl(endpointServiceConfig, serviceMethodPath = '', data) {
  const {
    fullUrl: serviceFullUrl,
  } = endpointServiceConfig;

  return Hoek.reachTemplate(data, `${serviceFullUrl}${joinUri('/', serviceMethodPath)}`);
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
    returnResponse,
  } = requestOptionsFinal;

  const url = getEndpointServiceUrl(endpointServiceConfig, serviceMethodPath, data);

  const isGet = method.toUpperCase() === 'GET';

  return sendSimpleRequest(
    {
      method,
      url,
      qs: isGet ? data : undefined,
      body: isGet ? undefined : data,
      json: true,

      timeout,
      ...requestOptionsFinal,

      headers: {
        ...getHeaders(apiRequest),
        ...endpointRequestOptions.headers,
        ...requestOptions.headers,
      },
    },
  )
    .then((response) => (returnResponse ? response : response.body));
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
      headers: {
        ...getHeadersByAuthType(token, requestOptions.authType),
        ...requestOptions.headers,
      },
      ...requestOptions,
    },
  );
}

export function sendEndpointMethodFormDataRequest(
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
  return sendEndpointMethodRequest(
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
  )
    .then((response) => {
      // todo @ANKU @CRIT @MAIN - хочу отсылать form-data, но приходит почему-то content-type html
      // если включаю json:true - то падает write of end
      //
      // headers: { 'Content-Type': 'application/json' },
      // вариант не работает
      // console.warn('ANKU response', typeof response, response);
      return JSON.parse(response);
    });
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

import { checkExist } from '../../common/utils/common';

import serverConfig from '../server-config';

import {
  defaultHeadersExtractor,
  proxyRouteFactory,
} from '../utils/api-plugin-factory';
import { sendEndpointMethodRequest } from '../utils/send-server-request';

const endpoint = serverConfig.server.endpointServices.middlewareApiService;
const EMPTY_ERROR = 'Необходимо указать в конфигах server.endpointServices.middlewareApiService';

export function send(
  serviceMethodPath,
  method = 'GET',
  data,
  apiRequest = null,
  requestOptions = {},
) {
  checkExist(endpoint, EMPTY_ERROR);
  return sendEndpointMethodRequest(
    endpoint,
    serviceMethodPath,
    method,
    data,
    apiRequest,
    {
      // with token
      headers: defaultHeadersExtractor(apiRequest),
      ...requestOptions,
    },
  );
}


const proxyFactory = endpoint
  ? proxyRouteFactory(
    endpoint,
    defaultHeadersExtractor,
  )
  : null;

export function proxy(pathOrApiConfig, middleApiPath = undefined, otherRouteOptions = undefined) {
  checkExist(proxyFactory, EMPTY_ERROR);
  return proxyFactory(pathOrApiConfig, middleApiPath, otherRouteOptions);
}

export default proxy;

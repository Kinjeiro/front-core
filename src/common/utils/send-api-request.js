// default implementation
import clientConfig from '../client-config';

import BaseApiClient from './BaseApiClient';

export const apiClient = new BaseApiClient({
  contextRoot: clientConfig.common.app.contextRoot,
  cookieCSRF: clientConfig.common.cookieCSRF,
});

export default function sendApi({ method = 'get', path }, paramsOrData, options = {}) {
  return apiClient[method.toLowerCase()](path, paramsOrData, options);
}

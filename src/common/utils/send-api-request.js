// default implementation
import getApiClient from '../helpers/get-api-client';

/**
 * @deprecated - используйте helpers/get-api-client.js
 */
export const apiClient = getApiClient();

export default function sendApi(apiConfig, paramsOrData, options = {}) {
  const { method = 'get', path } = apiConfig;
  return getApiClient()[method.toLowerCase()](path, paramsOrData, options);
}

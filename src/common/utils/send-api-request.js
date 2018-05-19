// default implementation
import getApiClient from '../helpers/get-api-client';

/**
 * @deprecated - используйте helpers/get-api-client.js
 */
export const apiClient = getApiClient();

export default function sendApi({ method = 'get', path }, paramsOrData, options = {}) {
  return getApiClient()[method.toLowerCase()](path, paramsOrData, options);
}

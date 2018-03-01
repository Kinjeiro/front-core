// default implementation
import BaseApiClient from './BaseApiClient';

export const apiClient = new BaseApiClient();

export default function sendApi({ method = 'get', path }, paramsOrData, options = {}) {
  return apiClient[method.toLowerCase()](path, paramsOrData, options);
}

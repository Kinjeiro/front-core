import BaseApiClient from '../utils/BaseApiClient';

let ApiClientClass = BaseApiClient;
let apiClient;

export function initApiClientClass(NewApiClientClass = null) {
  if (NewApiClientClass) {
    ApiClientClass = NewApiClientClass;
  }
  return ApiClientClass;
}

export function getApiClientClass() {
  return ApiClientClass;
}

export function createApiClient(options) {
  return new (getApiClientClass())(options);
}
export function createApiClientByEndpoint(endpoint, options) {
  const {
    host,
    port,
    endpoint: endpointApi,
  } = endpoint || {};

  return createApiClient({
    ...options,
    apiHost: host,
    apiPort: port,
    apiPrefix: endpointApi,
  });
}

export function initApiClient(newApiClient = null) {
  apiClient = newApiClient || createApiClient();
  return apiClient;
}

export default function getApiClient() {
  if (!apiClient) {
    initApiClient();
  }
  return apiClient;
}

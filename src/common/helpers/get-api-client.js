import BaseApiClient from '../utils/BaseApiClient';

let apiClient;

export function initApiConfig(newApiClient = null) {
  apiClient = newApiClient || new BaseApiClient();
  return apiClient;
}

export default function getApiClient() {
  if (!apiClient) {
    initApiConfig();
  }
  return apiClient;
}

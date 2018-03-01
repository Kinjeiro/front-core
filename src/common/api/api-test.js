import { createApiConfig as api } from '../utils/create-api-config';

import { apiClient } from '../utils/send-api-request';

export const API_PREFIX = 'test';
export const API_CONFIGS = {
  testGet: api(`${API_PREFIX}/testGet`),
};

export function apiTestGet() {
  return apiClient.api(API_CONFIGS.testGet);
}

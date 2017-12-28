import factoryAuthApiService from './auth-api';

/**
 * Метод для создания сервисов
 */
export default function createServices(endpointServiceConfigs) {
  return {
    authUserService: factoryAuthApiService(endpointServiceConfigs.authApiService),
  };
}

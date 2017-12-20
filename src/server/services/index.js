import factoryAuthApiService from './auth-api';

/**
 * Метод для создания сервисов
 */
export default function createServices(defaultServiceConfig, endpointServiceConfigs) {
  return {
    authUserService: factoryAuthApiService({
      ...defaultServiceConfig,
      ...endpointServiceConfigs.authApiService,
    }),
  };
}

import ServiceAuth from './ServiceAuth';

/**
 * Метод для создания сервисов
 */
export default function createServices(endpointServiceConfigs) {
  return {
    authUserService: new ServiceAuth({
      endpointServiceConfig: endpointServiceConfigs.authApiService,
    }),
  };
}

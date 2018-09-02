import ServiceAuth from './ServiceAuth';
import ServiceUsers from './ServiceUsers';

/**
 * Метод для создания сервисов
 */
export default function createServices(endpointServiceConfigs) {
  return {
    serviceAuth: ServiceAuth,
    /**
     * @deprecated - используйте serviceAuth
     */
    authUserService: () => new ServiceAuth({
      endpointServiceConfig: endpointServiceConfigs.serviceAuth,
    }),

    serviceUsers: ServiceUsers,
  };
}

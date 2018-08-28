import ServiceAuth from './ServiceAuth';
import ServiceUsers from './ServiceUsers';

/**
 * Метод для создания сервисов
 */
export default function createServices(endpointServiceConfigs) {
  const services = {};

  services.authUserService = new ServiceAuth({
    endpointServiceConfig: endpointServiceConfigs.authApiService,
    services,
  });

  services.usersService = new ServiceUsers({
    endpointServiceConfig: endpointServiceConfigs.usersService,
    services,
  });

  return services;
}

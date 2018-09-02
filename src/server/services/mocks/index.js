import serverConfig from '../../server-config';

import ServiceAuthMock from './ServiceAuthMock';
import ServiceUsersMock from './ServiceUsersMock';

/**
 * Метод для создания сервисов
 */
export default function createMockServices() {
  const services = {};

  if (serverConfig.server.features.mocking.authMock) {
    services.serviceAuth = ServiceAuthMock;
    services.serviceUsers = ServiceUsersMock;
  }
  return services;
}

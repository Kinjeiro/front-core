import serverConfig from '../../../../server/server-config';

import SubModuleFactory from '../../../SubModuleFactory';

import pluginsJwtAuth from './plugins/jwt-auth';

import apiAuth from './auth/server-api-auth';
import ServiceAuth from './auth/ServiceAuth';
import ServiceAuthMock from './auth/ServiceAuthMock';

import apiUsers from './users/server-api-users';
import ServiceUsers from './users/ServiceUsers';
import ServiceUsersMock from './users/ServiceUsersMock';

export default SubModuleFactory.createServerSubModule({
  getServerPlugins: (/* services, strategies, servicesContext */) => [
    pluginsJwtAuth,
  ],

  getServerApi: () => [
    ...apiAuth(),
    ...apiUsers(),
  ],
  getServerServices: {
    serviceAuth: ServiceAuth,
    serviceUsers: ServiceUsers,
  },
  getServerMockServices: () => {
    const serviceMocks = {};
    if (serverConfig.server.features.mocking.authMock) {
      serviceMocks.serviceAuth = ServiceAuthMock;
      serviceMocks.serviceUsers = ServiceUsersMock;
    }
    return serviceMocks;
  },
});

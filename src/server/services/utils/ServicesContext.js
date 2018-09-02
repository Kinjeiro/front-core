import { executeVariable } from '../../../common/utils/common';

import serverConfig from '../../server-config';
import logger from '../../helpers/server-logger';
import { cookie } from '../../utils/hapi-utils';

export default class ServicesContext {
  services = {};
  mockServices = {};

  /**
   *
   * @param serviceName
   * @param getServiceFn - функция (endpoint) => инстанса сервиса, который унаследован от CoreService (есть setRequest, setServicesContext)
   * @param isMock
   */
  registerService(serviceName, getServiceFn, isMock = false) {
    if (isMock) {
      this.mockServices[serviceName] = getServiceFn;
    } else {
      this.services[serviceName] = getServiceFn;
    }
    logger.log(
      `[ServicesContext] Register service "${serviceName}"`,
      isMock ? '[MOCK]' : '',
      getServiceFn.setServicesContext ? 'has setServicesContext' : '',
    );
  }

  register({
    services,
    mockServices,
  }) {
    Object.keys(services).forEach((serviceName) => {
      this.registerService(serviceName, services[serviceName]);
    });
    Object.keys(mockServices).forEach((serviceName) => {
      this.registerService(serviceName, mockServices[serviceName], true);
    });
  }

  getService(request, serviceName) {
    const {
      services,
      mockServices,
    } = this;
    const isMock = cookie(request, serverConfig.server.features.mocking.cookieEnableMocking) === 'true';
    const getServiceFn = isMock ? mockServices[serviceName] || services[serviceName] : services[serviceName];

    const endpoint = serverConfig.server.endpointServices[serviceName];
    const service = executeVariable(getServiceFn, null, endpoint);

    if (service.setRequest) {
      service.setRequest(request);
    }
    if (service.setServicesContext) {
      service.setServicesContext(this);
    }

    return service;
  }

  createServicesProxy(request) {
    const that = this;
    return new Proxy({}, {
      get(target, prop) {
        return that.getService(request, prop);
      },
    });
  }
}
import {
  sendWithAuth,
  sendEndpointMethodRequest,
} from '../../utils/send-server-request';

import {
  REQUEST_FIELD__USER,
  REQUEST_FIELD__USER_TOKEN,
} from '../../plugins/plugin-request-user';

export default class CoreService {
  servicesContext = null;
  request = null;
  endpointServiceConfig = null;
  options = null;

  constructor(endpointServiceConfig = null, options = {}) {
    this.setEndpointServiceConfig(endpointServiceConfig);
    this.options = options;
  }

  setRequest(request) {
    this.request = request;
  }
  getRequest() {
    return this.request;
  }

  getUser() {
    return this.getRequest()[REQUEST_FIELD__USER];
  }
  getUserToken() {
    return this.getRequest()[REQUEST_FIELD__USER_TOKEN];
  }

  setServicesContext(servicesContext) {
    this.servicesContext = servicesContext;
  }
  getServicesContext() {
    return this.servicesContext;
  }
  getService(serviceName) {
    return this.getServicesContext().getService(this.getRequest(), serviceName);
  }

  setEndpointServiceConfig(endpointServiceConfig) {
    this.endpointServiceConfig = endpointServiceConfig;
  }
  getEndpointServiceConfig() {
    return this.endpointServiceConfig;
  }


  send(
    path,
    data,
    options,
  ) {
    const {
      method = 'GET',
      ...requestOptions
    } = options || {};

    return sendEndpointMethodRequest(
      this.getEndpointServiceConfig(),
      path,
      method,
      data,
      this.getRequest(),
      requestOptions,
    );
  }

  sendWithAuth(
    path,
    data,
    options,
  ) {
    const {
      token = this.getUserToken(),
      method = 'GET',
      ...requestOptions
    } = options || {};

    return sendWithAuth(
      token,
      this.getEndpointServiceConfig(),
      path,
      method,
      data,
      this.getRequest(),
      requestOptions,
    );
  }
}

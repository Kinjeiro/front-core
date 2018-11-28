/* eslint-disable no-unused-vars,no-empty-function */
import {
  generateId as utilsGenerateId,
} from '../../../common/utils/common';

import {
  sendWithAuth,
  sendEndpointMethodRequest,
} from '../../utils/send-server-request';

import logger from '../../helpers/server-logger';

import {
  REQUEST_FIELD__USER,
  REQUEST_FIELD__USER_TOKEN,
} from '../../plugins/plugin-request-user';

const INIT_SERVICES = {};

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

  // ======================================================
  // UTILS
  // ======================================================
  generateId(...args) {
    return utilsGenerateId(...args);
  }

  // ======================================================
  // INFO
  // ======================================================
  getServiceName() {
    return this.constructor.name;
  }

  // ======================================================
  // INIT
  // ======================================================
  async isInit() {
    return !!INIT_SERVICES[this.getServiceName()];
  }
  async setInit(init = true) {
    INIT_SERVICES[this.getServiceName()] = init;
  }
  async initService() {
    if (!await this.isInit()) {
      logger.debug('Init service:', this.getServiceName());
      await this.initData(await this.getInitData());
      await this.setInit(true);
    }
  }
  async getInitData() {
    return [];
  }
  async initData(data) {
  }

  // ======================================================
  // CRUD
  // ======================================================
  async loadRecords(query, searchFields) {
    throw new Error('Not Implemented');
  }

  async loadRecord(id) {
    throw new Error('Not Implemented');
  }

  async addRecord(record, id) {
    throw new Error('Not Implemented');
  }

  async editRecord(id, data) {
    throw new Error('Not Implemented');
  }

  async deleteRecord(id) {
    throw new Error('Not Implemented');
  }
}

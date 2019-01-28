/* eslint-disable no-unused-vars,no-empty-function */
import {
  generateId as utilsGenerateId,
} from '../../../common/utils/common';
import { getMeta } from '../../../common/models/model-table';

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

export const OPERATION_TYPE = {
  FIND: 'find',
  READ: 'read',
  CREATE: 'create',
  CREATE_OR_UPDATE: 'createOrUpdate',
  EDIT: 'update',
  REMOVE: 'remove',
};

export default class CoreService {
  OPERATION_TYPE = OPERATION_TYPE;

  servicesContext = null;
  request = null;
  /**
   * Создается в config/utils/create-config.js:
   *
   * protocol: string
   * host: string
   * port: number
   * endpoint: string
   * fullUrl: string
   * timeout: number
   */
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
  // Record
  // ======================================================
  async serializeRecord(recordQuery, operationType, options = undefined) {
    return recordQuery;
  }
  async serializeRecords(recordsQuery, operationType, options = undefined) {
    return recordsQuery;
  }
  async deserializeData(data, operationType, options = undefined) {
    return data;
  }
  async deserializePatchValue(value, path, op, options = undefined) {
    return value;
  }

  // ======================================================
  // CRUD
  // ======================================================
  async innerFindRecords(query, searchFields = undefined, options = undefined, withPagination = false) {
    throw new Error('Not Implemented');
  }

  /**
   *
   * @param query
   * @param searchFields
   * @param options
   * @return {Promise<>}
   */
  async findRecords(query, searchFields = undefined, options = undefined) {
    return this.innerFindRecords(query, searchFields, options);
  }

  /**
   *
   * @param query
   * @param searchFields
   * @param findOptions
   * @return {Promise<
   * {
   *   records: result,
       meta: {
         ...meta,
         total,
       },
   *  }
   * >}
   */
  async findRecordsWithPagination(query, searchFields = undefined, findOptions = undefined) {
    return this.innerFindRecords(
      {
        ...query,
        // парсинм с дефолтными данными мету
        ...getMeta(query),
      },
      searchFields,
      findOptions,
      true, // withPagination
    );
  }

  async findFirstRecord(query, searchFields = undefined, options = undefined, shouldBeOne = false) {
    const results = await this.findRecords(query, searchFields, options);
    if (shouldBeOne && results && results.length > 1) {
      // todo @ANKU @LOW - @@loc
      throw new Error(`Должна быть только одна копия для ${this.getServiceName()}: ${JSON.stringify(query)}`);
    }
    return results ? results[0] : null;
  }

  async createRecord(record, id, options) {
    throw new Error('Not Implemented');
  }
  async readRecord(id, options) {
    throw new Error('Not Implemented');
  }
  async updateRecord(id, data, options) {
    throw new Error('Not Implemented');
  }
  async createOrUpdateRecord(id, data, options) {
    throw new Error('Not Implemented');
  }
  async removeRecord(id, options) {
    throw new Error('Not Implemented');
  }

  // ======================================================
  // BULK
  // ======================================================
  /**
   * This function does not trigger any middleware, not save() nor update(). If you need to trigger save() middleware for every document use create() instead.
   * @param operations: {
      [this.OPERATION_TYPE.CREATE]: createArray,
      [this.OPERATION_TYPE.UPDATE]: updateArray,
      [this.OPERATION_TYPE.REMOVE]: removeArray,
    }
   * @return BulkWriteOpResultObject
   - insertedCount	number -- Number of documents inserted.
   - matchedCount	  number -- Number of documents matched for update.
   - modifiedCount	number -- Number of documents modified.
   - deletedCount	  number -- Number of documents deleted.
   - upsertedCount	number -- Number of documents upserted.
   - insertedIds	  object -- Inserted document generated Id's, hash key is the index of the originating operation
   - upsertedIds	  object -- Upserted document generated Id's, hash key is the index of the originating operation
   - result	        object -- The command result object.
   */
  async bulkOperations(operations, options = null) {
    throw new Error('Not Implemented');
  }

  // ======================================================
  // TRANSACTION
  // ======================================================
  async startTransactionSession() {
    throw new Error('Not Implemented');
  }
  commitTransactionSession(transactionSession) {
    throw new Error('Not Implemented');
  }
  abortTransactionSession(transactionSession) {
    throw new Error('Not Implemented');
  }
}

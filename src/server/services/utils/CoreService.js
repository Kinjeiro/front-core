import { getMeta } from '../../../common/models/model-table';
import { isPatchOperations } from '../../../common/utils/api-utils';
/* eslint-disable no-unused-vars */
import { generateId as utilsGenerateId } from '../../../common/utils/common';

import logger from '../../helpers/server-logger';

import { REQUEST_FIELD__USER, REQUEST_FIELD__USER_TOKEN } from '../../plugins/plugin-request-user';
import serverConfig from '../../server-config';

import { sendEndpointMethodRequest, sendWithAuth } from '../../utils/send-server-request';

const INIT_SERVICES = {};

export const OPERATION_TYPE = {
  FIND: 'find',
  READ: 'read',
  CREATE: 'create',
  CREATE_OR_UPDATE: 'createOrUpdate',
  PATCH: 'patch',
  EDIT: 'update',
  REMOVE: 'remove',
};

export const SERVICE_OPTIONS = {
  /**
   * Данные нужные без обработки
   */
  WITHOUT_SERIALIZE_DATA: 'WITHOUT_SERIALIZE_DATA',
  /**
   * Данные без связей (чтобы зациклинности не было)
   */
  WITHOUT_LINKED_DATA: 'WITHOUT_LINKED_DATA',
  /**
   * Данные без калькулируемых полей
   */
  WITHOUT_CALCULATING_DATA: 'WITHOUT_CALCULATING_DATA',
  /**
   * Без десериализации на сервер
   */
  WITHOUT_DESERIALIZE_DATA: 'WITHOUT_DESERIALIZE_DATA',
};

export default class CoreService {
  // при минификации имена классов преобразуются и использовать this.constructor.name - становится опасно, поэтому добавим вот такую константу
  serviceName = undefined;

  getServiceName() {
    return this.serviceName
      || this.constructor.name; // но должна быть включена https://babeljs.io/docs/en/babel-preset-minify keepClassName=true
  }

  OPERATION_TYPE = OPERATION_TYPE;

  servicesContext = null;
  request = null;
  /**
   * Создается в config/utils/create-config.js:
   *
   * Если в serverConfig.server.endpointServices[serviceName] нету используется по умолчанию
   * serverConfig.server.endpointServices.middlewareApiService
   *
   * protocol: string
   * host: string
   * port: number
   * endpoint: string
   * fullUrl: string
   * timeout: number
   */
  endpointServiceConfig = undefined;
  options = undefined;
  urls = undefined;

  constructor(endpointServiceConfig = undefined, urls = undefined, options = {}) {
    this.setEndpointServiceConfig(endpointServiceConfig, urls);
    this.options = options;
    this.urls = this.getUrls(urls);
  }

  /**
   * если его определить то все методы
        findRecords
        findRecordsWithPagination
        createRecord
        readRecord
        updateRecord
        deleteRecord
        patchRecord
    - заработают автоматом

   * @return {null}
   */
  getCrudUrlsPrefix() {
    return null;
  }

  getCrudUrls() {
    const prefix = this.getCrudUrlsPrefix();
    const commonTemplate = `${prefix}/{id}`;
    return prefix !== null
      ? {
        urlFindRecords: `${prefix}`,
        urlCreateRecord: `${prefix}`,
        urlReadRecord: commonTemplate,
        urlUpdateRecord: commonTemplate,
        urlDeleteRecord: commonTemplate,
        urlPatchRecord: commonTemplate,
      }
      : undefined;
  }

  getUrls(urls) {
    return {
      ...this.getCrudUrls(),
      ...urls,
    };
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
  getUserId() {
    const user = this.getUser();
    return user ? user.userId : undefined;
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


  send(path, data, options) {
    const {
      method = 'GET',
      endpoint,
      ...requestOptions
    } = options || {};

    return sendEndpointMethodRequest(
      endpoint || this.getEndpointServiceConfig(),
      path,
      method,
      data,
      this.getRequest(),
      {
        ...requestOptions,
        pathParams: {
          ...requestOptions.pathParams,
          realm: serverConfig.server.features.auth.realm,
        },
      },
    );
  }

  sendWithAuth(path, data, options) {
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
      {
        ...requestOptions,
        pathParams: {
          ...requestOptions.pathParams,
          realm: serverConfig.server.features.auth.realm,
        },
      },
    );
  }

  sendWithClientCredentials(path, data, options = {}) {
    // todo @ANKU @LOW - подумать над этим обратным ходом - вообще сервис корный не должен знать об авторизации, но с другой стороны это такая распространненая функция что хочется ее дать всем без гемора
    const serviceAuth = this.getService('serviceAuth');
    if (!serviceAuth) {
      throw new Error('Not supported sendWithClientCredentials with serviceAuth');
    }

    return serviceAuth.sendWithClientCredentials(
      path,
      data,
      {
        ...options,
        endpoint: this.getEndpointServiceConfig(),
      },
    );
  }

  // ======================================================
  // UTILS
  // ======================================================
  generateId(...args) {
    return utilsGenerateId(...args);
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
    return data;
  }

  // ======================================================
  // Record
  // ======================================================
  async serializeRecord(recordQuery, operationType, options = undefined) {
    return recordQuery;
  }
  async serializeRecords(recordsQuery, operationType, options = undefined) {
    const records = await recordsQuery;
    return Promise.all(records.map((record) => this.serializeRecord(record, operationType, options)));
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
    if (!this.urls.urlFindRecords) {
      throw new Error('Not define urls.urlFindRecords. Please override getCrudUrlsPrefix.');
    }

    // throw new Error('Not Implemented');
    const tableResponseWithPagination = await this.sendWithAuth(
      this.urls.urlFindRecords,
      query,
    );
    tableResponseWithPagination.records = await this.serializeRecords(
      tableResponseWithPagination.records,
      this.OPERATION_TYPE.FIND,
      options,
    );

    return withPagination
      ? tableResponseWithPagination
      : tableResponseWithPagination.records;
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

  async createRecord(data, id, options) {
    if (!this.urls.urlCreateRecord) {
      throw new Error('Not define urls.urlCreateRecord. Please override getCrudUrlsPrefix.');
    }

    let dataFinal = await this.deserializeData(data, this.OPERATION_TYPE.CREATE, options);
    if (typeof dataFinal.id === 'undefined') {
      dataFinal = {
        ...dataFinal,
        id: id || dataFinal.id || this.generateId(),
      };
    }

    const result = await this.sendWithAuth(
      this.urls.urlCreateRecord,
      dataFinal,
      {
        method: 'POST',
      },
    );

    return this.serializeRecord(
      result,
      this.OPERATION_TYPE.CREATE,
      options,
    );
  }
  async readRecord(id, options) {
    if (!this.urls.urlReadRecord) {
      throw new Error('Not define urls.urlReadRecord. Please override getCrudUrlsPrefix.');
    }
    // throw new Error('Not Implemented');
    const record = await this.sendWithAuth(
      this.urls.urlReadRecord,
      undefined,
      {
        pathParams: {
          id,
        },
      },
    );

    return record && this.serializeRecord(
      record,
      this.OPERATION_TYPE.READ,
      options,
    );
  }
  async updateRecord(id, data, options) {
    if (!this.urls.urlUpdateRecord) {
      throw new Error('Not define urls.urlUpdateRecord. Please override getCrudUrlsPrefix.');
    }

    const record = await this.sendWithAuth(
      this.urls.urlUpdateRecord,
      await this.deserializeData(data, this.OPERATION_TYPE.UPDATE, options),
      {
        method: 'PUT',
        pathParams: {
          id,
        },
      },
    );

    return this.serializeRecord(
      record,
      this.OPERATION_TYPE.UPDATE,
      options,
    );
  }
  async deleteRecord(id, options) {
    if (!this.urls.urlDeleteRecord) {
      throw new Error('Not define urls.urlDeleteRecord. Please override getCrudUrlsPrefix.');
    }
    return this.sendWithAuth(
      this.urls.urlDeleteRecord,
      undefined,
      {
        method: 'DELETE',
        pathParams: {
          id,
        },
      },
    );
  }

  /**
   * Соглашение, что патч возвращает получившийся объект - https://stackoverflow.com/a/37718786/344172
   * @param id
   * @param patchOperation
   * @param options
   * @return {Promise<*>}
   */
  async patchRecord(id, patchOperation, options) {
    if (!this.urls.urlPatchRecord) {
      throw new Error('Not define urls.urlPatchRecord. Please override getCrudUrlsPrefix.');
    }
    if (!isPatchOperations(patchOperation)) {
      throw new Error(`Не патч операция: ${JSON.stringify(patchOperation, null, 2)}`);
    }

    const headers = serverConfig.common.features.api.useJsonPatchJsonContentType
      ? {
        // https://apisyouwonthate.com/blog/put-vs-patch-vs-json-patch
        contentType: 'application/json-patch+json',
      }
      : undefined;

    const record = await this.sendWithAuth(
      this.urls.urlPatchRecord,
      patchOperation,
      {
        method: 'PATCH',
        headers,
        pathParams: {
          id,
        },
      },
    );

    return this.serializeRecord(
      record,
      this.OPERATION_TYPE.PATCH,
      options,
    );
  }

  async createOrUpdateRecord(id, data, options) {
    throw new Error('Not Implemented');
  }

  /**
   * @deprecated - use deleteRecord
   * @param id
   * @param options
   * @return {Promise<void>}
   */
  async removeRecord(id, options) {
    return this.deleteRecord(id, options);
  }

  // ======================================================
  // BULK
  // ======================================================
  /**
   * This function does not trigger any middleware, not save() nor update(). If you need to trigger save() middleware
   * for every document use create() instead.
   * @param operations: {
      [this.OPERATION_TYPE.CREATE]: createArray,
      [this.OPERATION_TYPE.UPDATE]: updateArray,
      [this.OPERATION_TYPE.REMOVE]: removeArray,
    }
   * @return BulkWriteOpResultObject
   - insertedCount  number -- Number of documents inserted.
   - matchedCount   number -- Number of documents matched for update.
   - modifiedCount  number -- Number of documents modified.
   - deletedCount   number -- Number of documents deleted.
   - upsertedCount  number -- Number of documents upserted.
   - insertedIds    object -- Inserted document generated Id's, hash key is the index of the originating operation
   - upsertedIds    object -- Upserted document generated Id's, hash key is the index of the originating operation
   - result         object -- The command result object.
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

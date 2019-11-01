import { filterAndSortDb } from '../../../common/models/model-table';
import { applyPatchOperations, isPatchOperations } from '../../../common/utils/api-utils';

import { merge, objectValues, wrapToArray } from '../../../common/utils/common';
import serverLogger from '../../helpers/server-logger';
/* eslint-disable no-unused-vars */
import serverConfig from '../../server-config';

import CoreService, { SERVICE_OPTIONS } from './CoreService';

export const MOCK_DBS = {};
export const MOCK_DBS_VALUES = {};

export default class CoreServiceMock extends CoreService {
  async getData() {
    /*
     todo @ANKU @CRIT @MAIN - главный вопрос как инициализировать сервис?
     Мы знаем про сервис, только когда его запрос хендлер в синхронном режиме
     Инициализировать все сервисы не вариент, потому что мы не знает, какой режим мока (он может быть менять же + куков нету)
     + может и не нужен эти сервисные данные на данном этапе

     Поэтому единственный workaround
     1) - это во все методы или важнейшие методы добавить проверку на инициализацию
     2) Либо для случая синхронного с моками - запустить процесс и надеятся что обработка request один раз выпадет из потока

     Пока выберем убийственный второй вариант
    */
    await this.initService();
    await this.initService();
    const mockDBName = this.getServiceName();
    return MOCK_DBS[mockDBName];
  }

  async getValues() {
    await this.initService();
    const mockDBName = this.getServiceName();
    return MOCK_DBS_VALUES[mockDBName] || objectValues(MOCK_DBS[mockDBName] || {});
  }

  // ======================================================
  // OVERRIDE
  // ======================================================
  // ======================================================
  // INIT
  // ======================================================
  async initData(data) {
    const mockDBName = this.getServiceName();
    MOCK_DBS[mockDBName] = {};
    if (serverConfig.server.features.mocking.useMocks && serverConfig.server.features.mocking.useMocksInitData) {
      merge(MOCK_DBS[mockDBName], data);

      if (serverConfig.server.features.mocking.useReservedObjectValues) {
        merge(MOCK_DBS_VALUES[mockDBName], objectValues(data));
      }
    }
  }

  // ======================================================
  // CRUD
  // ======================================================
  async innerFindRecords(query, searchFieldObjects, options = {}, withPagination = false) {
    serverLogger.log('filterAndSortDb: ', query, searchFieldObjects, options, withPagination);

    const allValues = await this.getValues();
    const isGetAll = (!query || Object.keys(query).length === 0) && (!searchFieldObjects || searchFieldObjects.length === 0);

    const tableResponseWithPagination = filterAndSortDb(allValues, query, searchFieldObjects, withPagination, isGetAll);
    if (!options[SERVICE_OPTIONS.WITHOUT_SERIALIZE_DATA]) {
      tableResponseWithPagination.records = await this.serializeRecords(
        tableResponseWithPagination.records,
        this.OPERATION_TYPE.FIND,
        options,
      );
    }

    return withPagination
      ? tableResponseWithPagination
      : tableResponseWithPagination.records;
  }

  async readRecord(id, options = undefined) {
    return this.serializeRecord(
      (await this.getData())[id],
      this.OPERATION_TYPE.READ,
      options,
    );
  }

  async createRecord(data, id = null, options = undefined) {
    const dataFinal = await this.deserializeData(data, this.OPERATION_TYPE.CREATE, options);
    const idFinal = id || dataFinal.id || this.generateId();
    // eslint-disable-next-line no-param-reassign
    dataFinal.id = idFinal;
    (await this.getData())[idFinal] = dataFinal;
    return this.serializeRecord(
      dataFinal,
      this.OPERATION_TYPE.CREATE,
      options,
    );
  }

  async createOrUpdateRecord(id, data, options = undefined) {
    const records = await this.getData();
    if (!records[id]) {
      records[id] = { id: this.generateId() };
    }
    const dataFinal = merge(records[id], await this.deserializeData(data, this.OPERATION_TYPE.CREATE_OR_UPDATE, options));
    return this.serializeRecord(
      dataFinal,
      this.OPERATION_TYPE.CREATE_OR_UPDATE,
      options,
    );
  }

  async updateRecord(id, data, options = undefined) {
    const records = await this.getData();
    if (isPatchOperations(data)) {
      applyPatchOperations(
        records[id],
        await Promise.all(
          wrapToArray(data)
            .map(async (patchOperation) => ({
              ...patchOperation,
              value: await this.deserializePatchValue(
                patchOperation.value,
                patchOperation.path,
                patchOperation.op,
                options,
              ),
            })),
        ),
      );
    } else {
      merge(
        records[id],
        await this.deserializeData(data, this.OPERATION_TYPE.UPDATE, options),
      );
    }

    return this.serializeRecord(
      records[id],
      this.OPERATION_TYPE.UPDATE,
      options,
    );
  }

  async deleteRecord(id, options = undefined) {
    delete (await this.getData())[id];
  }

  /**
   * @deprecated - use deleteRecord
   * @param id
   * @param options
   * @return {Promise<void>}
   */
  async removeRecord(id, options = undefined) {
    return this.deleteRecord(id, options);
  }
}

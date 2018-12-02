/* eslint-disable no-unused-vars */
import serverConfig from '../../../server/server-config';

import {
  objectValues,
  merge,
} from '../../../common/utils/common';
import { applyPatchOperations } from '../../../common/utils/api-utils';
import { filterAndSortDb } from '../../../common/models/model-table';

import CoreService from './CoreService';

export const MOCK_DBS = {};

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
    const mockDBName = this.getServiceName();
    return MOCK_DBS[mockDBName];
  }

  async getValues() {
    return objectValues(await this.getData());
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
    }
  }

  // ======================================================
  // CRUD
  // ======================================================
  async loadRecords(query, searchFields, options = undefined) {
    return this.serializeRecord(
      filterAndSortDb(await this.getData(), query, searchFields),
      this.OPERATION_TYPE.FIND,
      options,
    );
  }

  async loadRecord(id, options = undefined) {
    return this.serializeRecord(
      (await this.getData())[id],
      this.OPERATION_TYPE.GET,
      options,
    );
  }

  async addRecord(data, id = null, options = undefined) {
    const dataFinal = await this.deserializeData(data, this.OPERATION_TYPE.ADD, options);
    const idFinal = id || dataFinal.id || this.generateId();
    // eslint-disable-next-line no-param-reassign
    dataFinal.id = idFinal;
    (await this.getData())[idFinal] = dataFinal;
    return this.serializeRecord(
      dataFinal,
      this.OPERATION_TYPE.ADD,
      options,
    );
  }

  async addOrEditRecord(id, data, options = undefined) {
    const records = await this.getData();
    if (!records[id]) {
      records[id] = { id: this.generateId() };
    }
    const dataFinal = merge(records[id], await this.deserializeData(data, this.OPERATION_TYPE.ADD_OR_EDIT, options));
    return this.serializeRecord(
      dataFinal,
      this.OPERATION_TYPE.ADD_OR_EDIT,
      options,
    );
  }

  async editRecord(id, data, options = undefined) {
    const records = await this.getData();
    applyPatchOperations(
      records[id],
      await this.deserializeData(data, this.OPERATION_TYPE.EDIT, options),
    );
    return this.serializeRecord(
      records[id],
      this.OPERATION_TYPE.EDIT,
      options,
    );
  }

  async deleteRecord(id, options = undefined) {
    delete (await this.getData())[id];
  }
}

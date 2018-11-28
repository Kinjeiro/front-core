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
  async loadRecords(query, searchFields) {
    return filterAndSortDb(await this.getData(), query, searchFields);
  }

  async loadRecord(id) {
    return (await this.getData())[id];
  }

  async addRecord(record, id = record.id || this.generateId()) {
    // eslint-disable-next-line no-param-reassign
    record.id = id;
    (await this.getData())[id] = record;
    return record;
  }

  async editRecord(id, data) {
    const records = await this.getData();
    records[id] = applyPatchOperations(records[id], data);
    return records[id];
  }

  async deleteRecord(id) {
    delete (await this.getData())[id];
  }
}

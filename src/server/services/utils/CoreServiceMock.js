import serverConfig from '../../../server/server-config';

import {
  generateId as utilsGenerateId,
  objectValues,
  merge,
} from '../../../common/utils/common';
import { applyPatchOperations } from '../../../common/utils/api-utils';

import { filterAndSortDb } from '../../../common/models/model-table';

import CoreService from './CoreService';

export const MOCK_DB_INITS = {};
export const MOCK_DBS = {};

export default class CoreServiceMock extends CoreService {
  async initData() {
    return {};
  }

  getMockDbName() {
    return this.constructor.name;
  }

  async getData() {
    const mockDBName = this.getMockDbName();
    if (!MOCK_DB_INITS[mockDBName]) {
      MOCK_DBS[mockDBName] = {};
      if (serverConfig.server.features.mocking.useMocks && serverConfig.server.features.mocking.useMocksInitData) {
        merge(MOCK_DBS[mockDBName], await this.initData());
      }
      MOCK_DB_INITS[mockDBName] = true;
    }
    return MOCK_DBS[mockDBName];
  }

  async getValues() {
    return objectValues(this.getData());
  }

  async loadRecords(query, searchFields) {
    return filterAndSortDb(await this.getData(), query, searchFields);
  }

  async loadRecord(id) {
    return (await this.getData())[id];
  }

  generateId(...args) {
    return utilsGenerateId(...args);
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

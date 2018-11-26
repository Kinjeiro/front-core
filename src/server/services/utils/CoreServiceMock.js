import serverConfig from '../../../server/server-config';

import {
  generateId as utilsGenerateId,
  objectValues,
  merge,
} from '../../../common/utils/common';
import { applyPatchOperations } from '../../../common/utils/api-utils';

import { filterAndSortDb } from '../../../common/models/model-table';

import CoreService from './CoreService';

let init = false;
const MOCK_DATA = {};

export default class CoreServiceMock extends CoreService {
  async initData() {
    return {};
  }

  async getData() {
    if (!this.init) {
      if (serverConfig.server.features.mocking.useMocks && serverConfig.server.features.mocking.useMocksInitData) {
        merge(MOCK_DATA, await this.initData());
      }
      init = true;
    }
    return MOCK_DATA;
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

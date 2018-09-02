import { filterAndSortDb } from '../../../common/models/model-table';
import { generateId as utilsGenerateId } from '../../../common/utils/common';

import CoreService from './CoreService';

export default class CoreServiceMock extends CoreService {
  async getData() {
    throw new Error('Not implemented');
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

  async addRecord(record, id = this.generateId()) {
    // eslint-disable-next-line no-param-reassign
    record.id = id;
    (await this.getData())[id] = record;
    return record;
  }

  async editRecord(id, record) {
    const records = await this.getData();
    records[id] = {
      ...records[id],
      record,
    };
    return records[id];
  }

  async deleteRecord(id) {
    delete (await this.getData())[id];
  }
}

import fs from 'fs';

import {
  createDir,
  inProject,
  createTempFile,
  removeFile,
} from '../../../../server/utils/file-utils';
import CoreServiceMock from '../../../../server/services/utils/CoreServiceMock';
import logger from '../../../../server/helpers/server-logger';

// // todo @ANKU @CRIT @MAIN - вынести в конфиги
// const UPLOAD_PATH = './temp/files';
//
// const fullUploadPath = inProject(UPLOAD_PATH);
// createDir(fullUploadPath, true);
// logger.log('Create mock attachment directory', fullUploadPath);
function crateAttachmentContentMock(serverPath) {
  return {
    serverPath,
  };
}

export default class ServiceAttachmentContentsMock extends CoreServiceMock {
  // ======================================================
  // CRUD
  // ======================================================
  /**
   *
   * @param filename
   * @param contentType
   * @return {Promise} - attachmentContentId
   */
  async uploadFile(filename, contentType, readStream) {
    const serverPath = await createTempFile(readStream, filename);
    return this.createRecord(crateAttachmentContentMock(serverPath));
  }

  /**
   *
   * @param id
   * @return stream
   */
  async downloadFile(id) {
    const content = await this.readRecord(id);
    return fs.createReadStream(content.serverPath);
  }

  /**
   *
   * @param id
   * @return {Promise}
   */
  async deleteFile(id) {
    const content = await this.readRecord(id);
    await removeFile(content.serverPath);
    return this.removeRecord(id);
  }
}

import fs from 'fs';

import {
  createDir,
  inProject,
  createTempFile,
  removeFile,
  getFileInfo,
} from '../../../../server/utils/file-utils';
import logger from '../../../../server/helpers/server-logger';
import { generateUuid } from '../../../../common/utils/common';
import CoreServiceMock from '../../../../server/services/utils/CoreServiceMock';

import { createAttachmentContent } from '../../common/subModule/model-attachment-content';

// // todo @ANKU @CRIT @MAIN - вынести в конфиги
// const UPLOAD_PATH = './temp/files';
//
// const fullUploadPath = inProject(UPLOAD_PATH);
// createDir(fullUploadPath, true);
// logger.log('Create mock attachment directory', fullUploadPath);
function crateAttachmentContentMock(serverPath) {
  const {
    fileName,
    type,
    size,
  } = getFileInfo(serverPath);

  const attachmentContentId = generateUuid();
  return {
    ...createAttachmentContent(
      attachmentContentId,
      fileName,
      type,
      size,
    ),
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
   * @param attachmentContentId
   * @return stream
   */
  async downloadFile(attachmentContentId) {
    const attachmentContent = await this.readRecord(attachmentContentId);
    return fs.createReadStream(attachmentContent.serverPath);
  }

  /**
   *
   * @param attachmentContentId
   * @return {Promise}
   */
  async deleteFile(attachmentContentId) {
    const attachmentContent = await this.readRecord(attachmentContentId);
    await removeFile(attachmentContent.serverPath);
    return this.removeRecord(attachmentContentId);
  }
}

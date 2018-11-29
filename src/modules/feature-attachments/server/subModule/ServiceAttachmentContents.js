import CoreService from '../../../../server/services/utils/CoreService';

export default class ServiceAttachmentContents extends CoreService {
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
    throw new Error('Not Implemented');
  }

  /**
   *
   * @param id
   * @return stream
   */
  async downloadFile(id) {
    throw new Error('Not Implemented');
  }

  /**
   *
   * @param id
   * @return {Promise}
   */
  async deleteFile(id) {
    throw new Error('Not Implemented');
  }
}

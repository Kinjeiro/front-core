import CoreService from '../../../../server/services/utils/CoreService';
import { streamToString } from '../../../../server/utils/file-utils';

import serverConfig from '../../../../server/server-config';

export default class ServiceAttachmentContents extends CoreService {
  getUrls(customUrls) {
    return {
      ...serverConfig.server.features.serviceAttachmentContents.urls,
      ...customUrls,
    };
  }

  // ======================================================
  // CRUD
  // ======================================================
  /**
   *
   * @param filename
   * @param contentType
   * @param readStream
   * @return {Promise} - attachmentContentId
   */
  async uploadFile(filename, contentType, readStream) {
    return this.sendWithClientCredentials(
      this.urls.uploadFile,
      undefined,
      {
        method: 'POST',
        formData: {
          file: {
            value: await streamToString(readStream, true),
            options: {
              filename,
              contentType,
            },
          },
        },
        json: false,
      },
    );
  }

  /**
   *
   * @param contentId
   * @return stream
   */
  async downloadFile(contentId) {
    return this.sendWithClientCredentials(
      this.urls.downloadFile,
      undefined,
      {
        returnResponse: true, // чтобы заголовки с именем файла взять
        encoding: null, // buffer to response
        headers: {
          accept: '*/*',
        },
        pathParams: {
          contentId,
        },
      },
    );
  }

  /**
   *
   * @return {Promise}
   * @param contentId
   */
  async deleteFile(contentId) {
    return this.sendWithClientCredentials(
      this.urls.deleteFile,
      {
        method: 'DELETE',
      },
      {
        pathParams: {
          contentId,
        },
      },
    );
  }
}

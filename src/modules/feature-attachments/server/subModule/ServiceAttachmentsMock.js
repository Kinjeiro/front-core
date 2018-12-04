import CoreServiceMock from '../../../../server/services/utils/CoreServiceMock';

import { getDownloadUrl } from '../../common/subModule/api-attachments';

export default class ServiceAttachmentsMock extends CoreServiceMock {
  async serializeRecord(recordQuery) {
    const attachment = await recordQuery;
    return {
      ...attachment,
      downloadUrl: attachment.downloadUrl || getDownloadUrl(attachment.id),
    };
  }
  async serializeRecords(recordsQuery, operationType) {
    const attachments = await recordsQuery;
    return attachments.map((attachment, index) =>
      this.serializeRecord(attachment, operationType, index));
  }

  // ======================================================
  // BUSINESS
  // ======================================================
  /**
   * если какой-то объект использует этот аттач то link проставляется этому объекту
   * удобно чтобы удалять темповые не используемые фотография
   * @param id
   * @param linkByObjectId
   * @param objectModel
   * @return {Promise}
   */
  async link(id, linkByObjectId, objectModel = null) {
    const attachment = await this.readRecord(id);
    await this.updateRecord(id, {
      links: [
        ...attachment.links,
        linkByObjectId,
      ],
    });
  }

  async unlink(id, linkByObjectId = null) {
    if (linkByObjectId) {
      const attachment = await this.readRecord(id);
      await this.updateRecord(id, {
        links: attachment.links.filter((obj) => obj !== linkByObjectId),
      });
    } else {
      await this.updateRecord(id, {
        links: null,
      });
    }
  }
}

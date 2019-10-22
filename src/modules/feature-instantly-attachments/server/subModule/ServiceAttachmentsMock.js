import CoreServiceMock from '../../../../server/services/utils/CoreServiceMock';
import serverConfig from '../../../../server/server-config';

import ACCESS_TYPE from '../../common/subModule/model-attachment-access';

import { getDownloadUrl } from '../../common/subModule/api-attachments';

export default class ServiceAttachmentsMock extends CoreServiceMock {
  async serializeRecord(recordQuery) {
    const attachment = await recordQuery;
    return {
      ...attachment,
      downloadUrl: attachment.downloadUrl || getDownloadUrl(attachment.id),
    };
  }

  // todo @ANKU @LOW - сделать модуль прав на объект и CRUD действия
  checkAttachmentAccess(attachment, throwError = false) {
    const currentUser = this.getUser();
    const {
      uploadedBy,
      // accessType,
    } = attachment;
    // todo @ANKU @LOW - переделать на модуль прав
    const accessType = serverConfig.server.features.attachments.defaultAccess;

    if (currentUser && currentUser.roles.includes(serverConfig.common.features.auth.adminRoleName)) {
      return true;
    }

    let access;
    switch (accessType) {
      case ACCESS_TYPE.ACCESS_PUBLIC:
        access = true;
        break;
      case ACCESS_TYPE.ACCESS_AUTH:
        access = !!currentUser;
        break;
      case ACCESS_TYPE.ACCESS_OWNER_ONLY:
        access = currentUser && uploadedBy === currentUser.userId;
        break;
      default:
        access = currentUser && currentUser.permissions.includes(accessType);
    }
    if (throwError && !access) {
      throw new Error('У вас нет доступа к этой объекту.');
    }
    return access;
  }

  // async serializeRecords(recordsQuery, operationType) {
  //   const attachments = await recordsQuery;
  //   return attachments.map((attachment, index) =>
  //     this.serializeRecord(attachment, operationType, index));
  // }

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

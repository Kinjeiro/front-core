import serverConfig from '../../../../server/server-config';
import CoreService from '../../../../server/services/utils/CoreService';
import ACCESS_TYPE from '../../common/subModule/model-attachment-access';

export default class ServiceAttachments extends CoreService {
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
    throw new Error('not Implemented');
  }

  async unlink(id, linkByObjectId = null) {
    throw new Error('not Implemented');
  }

  async readRecord(attachmentId, options = undefined) {
    return {
      // в большинстве систем аттач хранится там же где и контент, но бывают и раздельно
      id: attachmentId,
      contentId: attachmentId,
    };
  }
}

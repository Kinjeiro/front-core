import CoreService from '../../../../server/services/utils/CoreService';

export default class ServiceAttachments extends CoreService {
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
}

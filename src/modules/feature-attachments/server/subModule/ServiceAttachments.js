import CoreService from '../../../../server/services/utils/CoreService';

export default class ServiceAttachments extends CoreService {
  // ======================================================
  // BUSINESS
  // ======================================================
  async usedBy(id, useByObjectId, objectModel = null) {
    throw new Error('not Implemented');
  }

  async unused(id) {
    throw new Error('not Implemented');
  }
}

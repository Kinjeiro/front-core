import { generateId, wrapToArray } from '../../../../common/utils/common';

export function getAttachmentsInfo(globalState) {
  return globalState.attachments;
}

export function getAttachmentStatuses(globalState, ids = undefined) {
  const attachmentsMap = getAttachmentsInfo(globalState);
  return Object.keys(attachmentsMap).reduce((result, attachmentId) => {
    if (!ids || wrapToArray(ids).includes(attachmentId)) {
      // eslint-disable-next-line no-param-reassign
      result[attachmentId] = attachmentsMap[attachmentId].status;
    }
    return result;
  }, {});
}

export function getAttachmentInfo(globalState, id) {
  const attachments = getAttachmentsInfo(globalState);

  let result = attachments[id];
  if (result) {
    // если вместо uuid используется серверный id
    const resultKey = Object.keys(attachments).find((key) => {
      const { data } = attachments[key];
      return data && data.id === id;
    });
    result = attachments[resultKey];
  }
  return result;
}

export function getAttachmentData(globalState, id) {
  const info = getAttachmentInfo(globalState, id);
  return info ? info.data : null;
}

export function generateAttachmentUuid(fieldId) {
  return `${fieldId}_${generateId()}`;
}

/**
 *
 * @param globalState
 * @param fieldId - undefined - то найдет все у которых еще id нет
 * @return {{}}
 */
export function getAttachmentsByFieldId(globalState, fieldId = undefined) {
  const attachments = getAttachmentsInfo(globalState);
  return Object.keys(attachments).reduce((result, attachKey) => {
    const attach = attachments[attachKey];
    if (`${attach.uuid}`.indexOf(`${fieldId}_`) === 0) {
      // eslint-disable-next-line no-param-reassign
      result[attach.uuid] = attach.data;
    }
    return result;
  }, {});
}

/**
 *
 * @param globalState
 * @param uuids
 * @return {{}}
 */
// todo @ANKU @CRIT @MAIN - reselect добавить
export function getAttachmentInfosByUuids(globalState, uuids) {
  const attachments = getAttachmentsInfo(globalState);

  return Object.keys(attachments).reduce((result, attachKey) => {
    const attachItem = attachments[attachKey];
    if (uuids.includes(attachItem.uuid)) {
      // eslint-disable-next-line no-param-reassign
      result[attachItem.uuid] = attachItem;
    }
    return result;
  }, {});
}
/**
 *
 * @param globalState
 * @param uuids
 * @return {{}}
 */
export function getAttachmentIsSummaryFetching(globalState, uuids) {
  const attachmentInfoMap = getAttachmentInfosByUuids(globalState, uuids);

  return Object.keys(attachmentInfoMap).some((attachUuid) =>
    attachmentInfoMap[attachUuid].status.isFetching);
}

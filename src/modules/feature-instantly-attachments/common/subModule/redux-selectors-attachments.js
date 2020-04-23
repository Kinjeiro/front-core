import { createSelector, createSelectorCreator } from 'reselect';

import { generateId, wrapToArray } from '../../../../common/utils/common';

/*
  https://github.com/reduxjs/reselect
  const customSelectorCreator = createSelectorCreator(
    customMemoize, // function to be used to memoize resultFunc
    option1, // option1 will be passed as second argument to customMemoize
    option2, // option2 will be passed as third argument to customMemoize
    option3 // option3 will be passed as fourth argument to customMemoize
  )

  const customSelector = customSelectorCreator(
    input1,
    input2,
    resultFunc // resultFunc will be passed as first argument to customMemoize
  )
*/


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


const getUuids = (globalState, attachments) => wrapToArray(attachments).map(({ uuid, id }) => uuid || id);

/**
 * (globalState, attachments) => { [uuid]: objectInfo }
 */
export const getAttachmentInfosByUuids = createSelector(
  [getAttachmentsInfo, getUuids],
  (attachments, uuids) => Object.keys(attachments).reduce((result, attachKey) => {
    const attachItem = attachments[attachKey];
    if (uuids.includes(attachItem.uuid)) {
      // eslint-disable-next-line no-param-reassign
      result[attachItem.uuid] = attachItem;
    }
    return result;
  }, {}),
);

/**
 * (globalState, attachments) => boolean
 */
export const getAttachmentIsSummaryFetching = createSelector(
  getAttachmentInfosByUuids,
  (attachmentInfoMap) => Object.keys(attachmentInfoMap).some((attachUuid) =>
    attachmentInfoMap[attachUuid].status.isFetching),
);

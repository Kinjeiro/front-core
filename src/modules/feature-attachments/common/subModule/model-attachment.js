import PropTypes from 'prop-types';

import ID from '../../../../common/models/model-id';
import DATE from '../../../../common/models/model-date';
import { generateUuid } from '../../../../common/utils/common';

export const ATTACHMENT_PROP_TYPE_MAP = {
  id: ID,
  fileName: PropTypes.string.isRequired,
  preview: PropTypes.string,
  description: PropTypes.string,
  uploadedOn: DATE,
  uploadedBy: PropTypes.string,
  size: PropTypes.number,
  type: PropTypes.string,
  contextParams: PropTypes.object,
  // virtual от id
  downloadUrl: PropTypes.string,
  // используется кем (id)
  links: PropTypes.arrayOf(PropTypes.string),

  // ======================================================
  // on CLIENT
  // ======================================================
  uuid: ID,
  /**
     FILE: {
       lastModified: 1463127849264,
       lastModifiedDate: Fri May 13 2016 11:24:09 GMT+0300 (RTZ 2 (зима)) {},
       name: "test name.jpg",
       preview: "blob:http://localhost:8080/3b5f332a-45a7-49a8-9a1e-5b9225bd831e",
       size: 57613,
       type: "image/jpeg",
       webkitRelativePath: "",
     }
   */
  fileDescriptor: PropTypes.any,
  isNew: PropTypes.bool,
  loaded: PropTypes.number,
  total: PropTypes.number,
  isLoaded: PropTypes.bool,

  // ======================================================
  // on SERVER
  // ======================================================
  /**
   * id контента, по которому можно получить содержимое файла
   */
  contentId: PropTypes.string,
};

export function createAttachment(
  id,
  fileName,
  size,
  type,
  uploadedBy,
  downloadUrl,
  preview = null,
  description = null,
  uploadedOn = null,
  contextParams = {},
) {
  return {
    id,
    fileName,
    preview,
    description,
    uploadedOn,
    uploadedBy,
    size,
    type,
    downloadUrl,
    contextParams,
  };
}

export function createTempAttachment(
  attachment,
  fileDescriptor,
  uuid = generateUuid(),
  isNew = true,
  loaded = 0,
  total = 0,
  isLoaded = false,
) {
  return {
    ...attachment,
    uuid,
    fileDescriptor,
    isNew,
    loaded,
    total,
    isLoaded,
  };
}

export function createServerAttachment(
  attachment,
  contentId = undefined,
) {
  return {
    ...attachment,
    contentId,
  };
}

export function normalizeAttachment(attachment) {
  if (typeof attachment === 'string'
    || (Array.isArray(attachment) && typeof attachment[0] === 'string')) {
    return Array.isArray(attachment)
      ? attachment.map((attachItem) =>
        createAttachment(attachItem, attachItem, null, null, null, attachItem, attachItem))
      : createAttachment(attachment, attachment, null, null, null, attachment, attachment);
  }
  return attachment;
}

export const ATTACHMENT_PROP_TYPE = PropTypes.shape(ATTACHMENT_PROP_TYPE_MAP);

export default ATTACHMENT_PROP_TYPE;

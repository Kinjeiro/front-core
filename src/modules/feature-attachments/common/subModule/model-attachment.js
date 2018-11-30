import PropTypes from 'prop-types';

import ID from '../../../../common/models/model-id';
import DATE from '../../../../common/models/model-date';

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

  // services field
  // client
  uuid: ID,
  isNew: PropTypes.bool,
  loaded: PropTypes.number,
  total: PropTypes.number,
  isLoaded: PropTypes.bool,

  // server
  contentId: PropTypes.string, // id контента, по которому можно получить содержимое файла
};

export function createAttachment(
  id,
  fileName,
  size,
  type,
  uploadedBy,
  downloadUrl,
  contentId = null,
  preview = null,
  description = null,
  uploadedOn = new Date(),
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
    contentId,
    contextParams,
  };
}

export function normalizeAttachment(attachment) {
  if (typeof attachment === 'string'
    || (Array.isArray(attachment) && typeof attachment[0] === 'string')) {
    return Array.isArray(attachment)
      ? attachment.map((attachItem) =>
        createAttachment(attachItem, attachItem, null, null, null, attachItem, null, attachItem))
      : createAttachment(attachment, attachment, null, null, null, attachment, null, attachment);
  }
  return attachment;
}

export const ATTACHMENT_PROP_TYPE = PropTypes.shape(ATTACHMENT_PROP_TYPE_MAP);

export default ATTACHMENT_PROP_TYPE;
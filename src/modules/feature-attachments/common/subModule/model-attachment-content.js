import PropTypes from 'prop-types';

import DATE from '../../../../common/models/model-date';

export const ATTACHMENT_CONTENT_PROP_TYPE_MAP = {
  id: PropTypes.string,
  length: PropTypes.number,
  chunkSize: PropTypes.number,
  uploadDate: DATE,
  md5: PropTypes.string,
  filename: PropTypes.string,
  contentType: PropTypes.string,
  aliases: PropTypes.arrayOf(PropTypes.string),
  metadata: PropTypes.object,
};

export function createAttachmentContent(
  id,
  filename,
  contentType,
  length,
  uploadDate = Date.now(),
  aliases = [],
  metadata = {},
  chunkSize = null,
  md5 = null,
) {
  return {
    id,
    filename,
    contentType,
    length,
    uploadDate,
    aliases,
    metadata,
    chunkSize,
    md5,
  };
}

export const ATTACHMENT_CONTENT_PROP_TYPE = PropTypes.shape(ATTACHMENT_CONTENT_PROP_TYPE_MAP);

export default ATTACHMENT_CONTENT_PROP_TYPE;

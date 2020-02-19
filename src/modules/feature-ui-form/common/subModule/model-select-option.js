import PropTypes from 'prop-types';

import ID_PROP_TYPE from '../../../../common/models/model-id';

export const RECORD_ID_FIELD = 'id';
export const RECORD_LABEL_FIELD = 'name';

export function createSimpleSelectRecord(id, label = undefined, fieldId = RECORD_ID_FIELD, fieldLabel = RECORD_LABEL_FIELD) {
  return {
    [fieldId]: id,
    [fieldLabel]: label || id,
  };
}
export function parseArrayToSelectRecords(array, fieldId = RECORD_ID_FIELD, fieldLabel = RECORD_LABEL_FIELD) {
  if (!array || typeof array[0] === 'object') {
    return array;
  }
  return array.map((arrayItem) => {
    return createSimpleSelectRecord(arrayItem, undefined, fieldId, fieldLabel);
  });
}

export const SELECT_OPTION_META_PROP_TYPE_MAP = {
  record: PropTypes.any,

  recordId: ID_PROP_TYPE,
  label: PropTypes.node,
  index: PropTypes.number,
  isDisabled: PropTypes.bool,
  isSelected: PropTypes.bool,
};

const SELECT_OPTION_META_PROP_TYPE = PropTypes.shape(SELECT_OPTION_META_PROP_TYPE_MAP);

export const DEFAULT_OPTION_META = {
  record: undefined,
  recordId: undefined,
  label: undefined,
  index: undefined,
  isDisabled: false,
  isSelected: false,
};

export function isOptionMeta(object) {
  return Object.prototype.hasOwnProperty.call(object, 'recordId');
}

export function createOptionMeta(data) {
  return {
    ...DEFAULT_OPTION_META,
    ...data,
  };
}

export default SELECT_OPTION_META_PROP_TYPE;

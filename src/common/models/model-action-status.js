import PropTypes from 'prop-types';

import UNI_ERROR from './uni-error';
import DATE from './model-date';

export const ACTION_STATUS_PROP_TYPE_MAP = {
  isFetching: PropTypes.bool,
  isLoaded: PropTypes.bool,
  isFailed: PropTypes.bool,
  isResponseNotEmpty: PropTypes.bool,
  error: UNI_ERROR,
  updated: DATE,
};

export const ACTION_STATUS_PROP_TYPE = PropTypes.shape(ACTION_STATUS_PROP_TYPE_MAP);

export default ACTION_STATUS_PROP_TYPE;

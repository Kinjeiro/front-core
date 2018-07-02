import PropTypes from 'prop-types';

export const ACTION_STATUS_PROP_TYPE_MAP = {
  isFetching: PropTypes.bool,
  isLoaded: PropTypes.bool,
  isFailed: PropTypes.bool,
  isResponseNotEmpty: PropTypes.bool,
  errorType: PropTypes.string,
  errorMessage: PropTypes.string,
};

export const ACTION_STATUS_PROP_TYPE = PropTypes.shape(ACTION_STATUS_PROP_TYPE_MAP);

export default ACTION_STATUS_PROP_TYPE;

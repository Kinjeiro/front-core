import PropTypes from 'prop-types';

export const MAP = {
  isFetching: PropTypes.bool,
  isLoaded: PropTypes.bool,
  isFailed: PropTypes.bool,
  isResponseNotEmpty: PropTypes.bool,
  errorType: PropTypes.string,
  errorMessage: PropTypes.string,
};

const STATUS_PROPS = PropTypes.shape(MAP);

export default STATUS_PROPS;

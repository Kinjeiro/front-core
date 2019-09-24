import PropTypes from 'prop-types';

export const CONSTRAINTS_PROP_TYPE_MAP = {
  values: PropTypes.array,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  multipleMaxSize: PropTypes.number,
  multipleMinSize: PropTypes.number,
  maxSize: PropTypes.number,
  minSize: PropTypes.number,
  minValue: PropTypes.any,
  maxValue: PropTypes.any,
  maxBytes: PropTypes.number,
  minBytes: PropTypes.number,
  value: PropTypes.any,
  pattern: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(RegExp),
  ]),
  required: PropTypes.bool,
};

export const CONSTRAINTS_PROP_TYPE = PropTypes.shape(CONSTRAINTS_PROP_TYPE_MAP);

export default CONSTRAINTS_PROP_TYPE;

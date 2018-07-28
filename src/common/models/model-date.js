import PropTypes from 'prop-types';

export const DATE_PROP_TYPE = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

export default DATE_PROP_TYPE;

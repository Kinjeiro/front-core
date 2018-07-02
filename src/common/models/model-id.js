import PropTypes from 'prop-types';

export const ID_PROP_TYPE = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

export default ID_PROP_TYPE;

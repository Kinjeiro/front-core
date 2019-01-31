import PropTypes from 'prop-types';

export const TAB_PROP_TYPE_MAP = {
  name: PropTypes.node,
  to: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    // https://github.com/ReactTraining/react-router/blob/v3/examples/query-params/app.js
    PropTypes.shape({
      pathname: PropTypes.string,
      query: PropTypes.object,

      basename: PropTypes.string,
      search: PropTypes.string,
      hash: PropTypes.string,
    }),
  ]),
};

export const TAB_PROP_TYPE = PropTypes.shape(TAB_PROP_TYPE_MAP);

export default TAB_PROP_TYPE;

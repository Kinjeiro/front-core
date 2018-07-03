import PropTypes from 'prop-types';

/*
 History
 https://github.com/ReactTraining/history/blob/v3/docs/Glossary.md#locationdescriptor

 type LocationDescriptorObject = {
   pathname: Pathname;
   search: Search;
   query: Query;
   state: LocationState;
 };

 type LocationDescriptor = LocationDescriptorObject | Path;
*/

export const LOCATION_OBJECT_PROP_TYPE_MAP = {
  pathname: PropTypes.string,
  search: PropTypes.string,
  query: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  state: PropTypes.object,
};

export const LOCATION_PROP_TYPE = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape(LOCATION_OBJECT_PROP_TYPE_MAP),
]);

export default LOCATION_PROP_TYPE;

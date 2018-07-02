import PropTypes from 'prop-types';

import ID_PROP_TYPE from './model-id';
import ACTION_STATUS_PROP_TYPE from './model-action-status';

/*
 records: [],
 meta: {
 search: null,
 startPage: 0,
 itemsPerPage: 10,
 sortBy: null,
 sortDesc: true,
 total: null,
 },
 filters: {
 // field: value
 },
 selected: [],
 isSelectedAll: false,

 actionLoadRecordsStatus: undefined,
 actionBulkChangeStatusStatus: undefined,
 actionEditRecordStatusMap: {},
*/

export const TABLE_PROP_TYPE_MAP = {
  records: PropTypes.array,
  meta: PropTypes.shape({
    search: PropTypes.string,
    startPage: PropTypes.number,
    itemsPerPage: PropTypes.number,
    sortBy: PropTypes.string,
    sortDesc: PropTypes.bool,
    total: PropTypes.number,
  }),
  filters: PropTypes.object,
  selected: PropTypes.arrayOf(ID_PROP_TYPE),
  isSelectedAll: PropTypes.bool,

  actionLoadRecordsStatus: ACTION_STATUS_PROP_TYPE,
  actionBulkChangeStatusStatus: ACTION_STATUS_PROP_TYPE,
  actionEditRecordStatusMap: PropTypes.object,
};

export const TABLE_PROP_TYPE = PropTypes.shape(TABLE_PROP_TYPE_MAP);

export default TABLE_PROP_TYPE;

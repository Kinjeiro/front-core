import PropTypes from 'prop-types';
import { objectValues } from '../utils/common';

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

export const META_PROP_TYPE_MAP = {
  search: PropTypes.string,
  startPage: PropTypes.number,
  itemsPerPage: PropTypes.number,
  sortBy: PropTypes.string,
  sortDesc: PropTypes.bool,
  total: PropTypes.number,
};

export const META_PROP = PropTypes.shape(META_PROP_TYPE_MAP);

export const TABLE_PROP_TYPE_MAP = {
  records: PropTypes.array,
  meta: META_PROP,
  filters: PropTypes.object,
  selected: PropTypes.arrayOf(ID_PROP_TYPE),
  isSelectedAll: PropTypes.bool,

  actionLoadRecordsStatus: ACTION_STATUS_PROP_TYPE,
  actionBulkChangeStatusStatus: ACTION_STATUS_PROP_TYPE,
  actionEditRecordStatusMap: PropTypes.object,
};

export const TABLE_PROP_TYPE = PropTypes.shape(TABLE_PROP_TYPE_MAP);

export const DEFAULT_META = {
  search: undefined,
  sortBy: undefined,
  sortDesc: true,

  startPage: 0,
  itemsPerPage: 20,
  total: undefined,
};

export function getMeta(query, defaultMeta = {}) {
  return {
    search: query.search,

    sortBy: query.sortBy || defaultMeta.sortBy,
    sortDesc: query.sortDesc
      ? query.sortDesc === true || query.sortDesc === 'true'
      : typeof defaultMeta.sortDesc !== 'undefined'
        ? defaultMeta.sortDesc
        : DEFAULT_META.sortDesc,

    startPage: query.startPage
      ? parseInt(query.startPage, 10)
      : typeof defaultMeta.startPage !== 'undefined'
        ? defaultMeta.startPage
        : DEFAULT_META.startPage,
    itemsPerPage: query.itemsPerPage
      ? parseInt(query.itemsPerPage, 10)
      : typeof defaultMeta.itemsPerPage !== 'undefined'
        ? defaultMeta.itemsPerPage
        : DEFAULT_META.itemsPerPage,
    total: query.total
      ? parseInt(query.total, 10)
      : defaultMeta.total,
  };
}

export function filterAndSortDb(mockDb, query, searchFields = []) {
  const {
    filters,
  } = query;
  const meta = getMeta(query);
  const {
    search,
    sortBy,
    sortDesc,
    itemsPerPage,
    startPage,
  } = meta;

  let result = Array.isArray(mockDb)
    ? [...mockDb]
    : objectValues(mockDb);

  // filters
  if (filters) {
    result = result.filter((record) =>
      Object.keys(filters).every((filterKey) => record[filterKey] === filters[filterKey]));
  }

  // search
  if (search) {
    searchFields.forEach((searchField) => {
      result = result.filter((object) => object[searchField].indexOf(search) >= 0);
    });
  }

  // pagination
  const total = result.length;
  result = result.slice(startPage * itemsPerPage, (startPage + 1) * itemsPerPage);

  // sorting
  if (sortBy) {
    result.sort((objectA, objectB) => {
      const fieldA = objectA[sortBy];
      const fieldB = objectB[sortBy];
      return (sortDesc ? -1 : 1) * (
          fieldA > fieldB
            ? 1
            : fieldA < fieldB
            ? -1
            : 0
        );
    });
  }

  return {
    records: result,
    meta: {
      ...meta,
      total,
    },
  };
}

export default TABLE_PROP_TYPE;

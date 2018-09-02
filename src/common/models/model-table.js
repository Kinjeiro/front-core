import PropTypes from 'prop-types';
import {
  objectValues,
  includes,
} from '../utils/common';
import { parseUrlParameters } from '../utils/uri-utils';

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
  search: '',
  sortBy: null,
  sortDesc: true,

  startPage: 0,
  itemsPerPage: 20,
  total: undefined,
};

export function getMeta(query, defaultMeta = {}) {
  const queryFinal = parseUrlParameters(query);

  return {
    search: queryFinal.search || defaultMeta.search || DEFAULT_META.search,

    sortBy: queryFinal.sortBy || defaultMeta.sortBy || DEFAULT_META.sortBy,
    sortDesc: typeof queryFinal.sortDesc !== 'undefined'
      ? queryFinal.sortDesc === true || queryFinal.sortDesc === 'true'
      : typeof defaultMeta.sortDesc !== 'undefined'
        ? defaultMeta.sortDesc
        : DEFAULT_META.sortDesc,

    startPage: queryFinal.startPage
      ? parseInt(queryFinal.startPage, 10)
      : typeof defaultMeta.startPage !== 'undefined'
        ? defaultMeta.startPage
        : DEFAULT_META.startPage,
    itemsPerPage: queryFinal.itemsPerPage
      ? parseInt(queryFinal.itemsPerPage, 10)
      : typeof defaultMeta.itemsPerPage !== 'undefined'
        ? defaultMeta.itemsPerPage
        : DEFAULT_META.itemsPerPage,
    total: queryFinal.total
      ? parseInt(queryFinal.total, 10)
      : defaultMeta.total,
  };
}

function searchInValue(value, search) {
  if (Array.isArray(value)) {
    return value.some((item) => searchInValue(item, search));
  }
  return `${value}`.toLowerCase().indexOf(search.toLowerCase()) >= 0;
}

export function filterAndSortDb(mockDb, query, searchFields = []) {
  const {
    filters,
  } = query || {};

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
      Object.keys(filters).every((filterKey) =>
        includes(filters[filterKey], record[filterKey], false, true)));
  }

  // search
  if (search) {
    result = result.filter((object) =>
      searchFields.some((searchField) =>
        searchInValue(object[searchField], search)));
  }

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

  // pagination
  const total = result.length;
  result = result.slice(startPage * itemsPerPage, (startPage + 1) * itemsPerPage);

  return {
    records: result,
    meta: {
      ...meta,
      total,
    },
  };
}

export default TABLE_PROP_TYPE;

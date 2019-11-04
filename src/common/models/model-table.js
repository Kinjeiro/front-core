import PropTypes from 'prop-types';
import {
  objectValues,
  includes,
  wrapToArray,
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
export const META_PROP_TYPE = PropTypes.shape(META_PROP_TYPE_MAP);
/**
 * @deprecated - use META_PROP_TYPE
 * @type {shim}
 */
export const META_PROP = META_PROP_TYPE;


export const QUERY_PROP_TYPE_MAP = {
  ...META_PROP_TYPE_MAP,
  filters: PropTypes.object,
};
export const QUERY_PROP_TYPE = PropTypes.shape(META_PROP_TYPE_MAP);

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

export function createMeta(meta) {
  return meta;
}

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

export const SEARCH_MATCH_TYPE = {
  INDEX_OF: 'indexOf',
  EQUALS: 'equals',
  START_WITH: 'startWith',
};
export const SEARCH_DATA_TYPE = {
  CASE_SENSITIVE: 'caseSensitive',
  NOT_CASE_SENSITIVE: 'notCaseSensitive',
};

export function createSearchFieldObject(
  field,
  searchMatchType = SEARCH_MATCH_TYPE.INDEX_OF,
  searchDataType = SEARCH_DATA_TYPE.NOT_CASE_SENSITIVE,
) {
  if (typeof field === 'object') {
    return {
      searchMatchType,
      searchDataType,
      ...field,
    };
  }

  return {
    field,
    searchMatchType,
    searchDataType,
  };
}

export function searchInValue(
  value,
  search,
  searchMatchType = SEARCH_MATCH_TYPE.INDEX_OF,
  searchDataType = SEARCH_DATA_TYPE.NOT_CASE_SENSITIVE,
) {
  if (Array.isArray(value)) {
    return value.some((item) => searchInValue(item, search));
  }

  let searchFinal;
  let valueFinal;
  switch (searchDataType) {
    case SEARCH_DATA_TYPE.NOT_CASE_SENSITIVE:
      searchFinal = search.toLowerCase();
      valueFinal = `${value}`.toLowerCase();
      break;
    case SEARCH_DATA_TYPE.CASE_SENSITIVE:
      searchFinal = search;
      valueFinal = `${value}`;
      break;
    default:
      throw new Error(`Unknown searchDataType: ${searchDataType}`);
  }

  switch (searchMatchType) {
    case SEARCH_MATCH_TYPE.INDEX_OF:
      return valueFinal.indexOf(searchFinal) >= 0;
    case SEARCH_MATCH_TYPE.START_WITH:
      return valueFinal.indexOf(searchFinal) === 0;
    case SEARCH_MATCH_TYPE.EQUALS:
      return valueFinal === searchFinal;
    default:
      throw new Error(`Unknown searchMatchType: ${searchMatchType}`);
  }
}


export function createTableResponse(records, meta, total) {
  return {
    records,
    meta: createMeta({
      ...meta,
      total,
    }),
  };
}

function wrapToStrings(array) {
  return wrapToArray(array)
    .map((value) => (typeof value !== 'undefined' && value !== null ? `${value}` : value));
}

/**
 *
 * @param mockDb
 * @param query
     search
     sortBy
     sortDesc
     itemsPerPage
        если false - отменяет разбивку на страницы - выдает все разультаты
     startPage
     itemsPerPage
 *
 * @param searchFieldObjects
 * @param withPagination
 * @param isGetAllNotMutable
 * @return {{records, meta}}
 */
export function filterAndSortDb(
  mockDb = [],
  query,
  searchFieldObjects = [],
  withPagination = false,
  isGetAllNotMutable = false,
) {
  let result;
  let total;

  const meta = getMeta(query);

  if (
    // (!query || Object.keys(query))
    // && (!searchFieldObjects || searchFieldObjects.length === 0)
    isGetAllNotMutable
  ) {
    result = Array.isArray(mockDb)
      ? mockDb // !!! WARNING - NOT MUTABLE - это для перформанса больших баз
      : objectValues(mockDb);
    total = result.length;
  } else {
    const {
      filters,
    } = query || {};

    const {
      search,
      sortBy,
      sortDesc,
      itemsPerPage,
      startPage,
    } = meta;

    result = Array.isArray(mockDb)
      ? [...mockDb]
      : objectValues(mockDb);

    // filters
    if (filters) {
      result = result.filter((record) =>
        Object.keys(filters).every((filterKey) =>
          // из фильтра мы всегда достаем string (не число), поэтому массив должен быть на стринг значениях
          includes(
            wrapToStrings(filters[filterKey]),
            wrapToStrings(record[filterKey]),
            false,
            true,
          )));
    }

    // search
    if (search && searchFieldObjects.length > 0) {
      result = result.filter((object) =>
        searchFieldObjects.some((searchField) => {
          const {
            field,
            searchDataType,
            searchMatchType,
          } = createSearchFieldObject(searchField);
          return searchInValue(object[field], search, searchMatchType, searchDataType);
        }));
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

    total = result.length;

    // itemsPerPage = false - отменяет разбивку на страницы - выдает все разультаты
    if (withPagination && (itemsPerPage !== false)) {
      // pagination
      result = result.slice(startPage * itemsPerPage, (startPage + 1) * itemsPerPage);
    }
  }

  if (!withPagination) {
    meta.startPage = 0;
    meta.itemsPerPage = total;
  }

  // todo @ANKU @LOW - filters обратно не возвращаются - а надо?
  return createTableResponse(result, meta, total);
}

export default TABLE_PROP_TYPE;

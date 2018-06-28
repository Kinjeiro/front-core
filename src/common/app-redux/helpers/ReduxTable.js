import uniq from 'lodash/uniq';

import {
  deepEquals,
  merge,
} from '../../utils/common';
import { applyPatchOperations } from '../../utils/api-utils';

import createStatusReducer from './create-status-reducer';
import createActionStatusesMap from './create-action-statuses-map';

import ReduxUni from './ReduxUni';

export default class ReduxTable extends ReduxUni {
  static FIELD_ACTION_RECORD_ID = 'recordId';

  // ======================================================
  // INITIAL STATE
  // ======================================================
  getInitialState() {
    return {
      ...super.getInitialState(),
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
    };
  }

  // ======================================================
  // TYPES
  // ======================================================
  getPrefix() {
    return 'table';
  }

  getTypes(PREFIX) {
    return {
      ...super.getTypes(PREFIX),
      LOAD_RECORDS_FETCH: `${PREFIX}/LOAD_RECORDS_FETCH`,
      LOAD_RECORDS_FAIL: `${PREFIX}/LOAD_RECORDS_FAIL`,
      LOAD_RECORDS_SUCCESS: `${PREFIX}/LOAD_RECORDS_SUCCESS`,

      CLEAR_FILTERS: `${PREFIX}/CLEAR_FILTERS`,

      CHANGE_SELECTED: `${PREFIX}/CHANGE_SELECTED`,
      CHANGE_SELECTED_ALL: `${PREFIX}/CHANGE_SELECTED_ALL`,
      CLEAR_SELECTION: `${PREFIX}/CLEAR_SELECTION`,

      BULK_CHANGE_STATUS_FETCH: `${PREFIX}/BULK_CHANGE_STATUS_FETCH`,
      BULK_CHANGE_STATUS_SUCCESS: `${PREFIX}/BULK_CHANGE_STATUS_SUCCESS`,
      BULK_CHANGE_STATUS_FAIL: `${PREFIX}/BULK_CHANGE_STATUS_FAIL`,

      EDIT_RECORD_FETCH: `${PREFIX}/EDIT_RECORD_FETCH`,
      EDIT_RECORD_SUCCESS: `${PREFIX}/EDIT_RECORD_SUCCESS`,
      EDIT_RECORD_FAIL: `${PREFIX}/EDIT_RECORD_FAIL`,
    };
  }

  // ======================================================
  // ACTIONS
  // ======================================================
  getBindActions(api = {}, TYPES = this.getTypes(this.getPrefix())) {
    const {
      /**
       * апи который возвращает { meta, records }, либо массив, когда мультипейджинг не нужен
       */
      apiLoadRecords,
      apiBulkChangeStatus,
      apiEditRecord,
    } = api;

    const FIELD_UUID = this.constructor.FIELD_ACTION_UUID;
    const FIELD_RECORD_ID = this.constructor.FIELD_ACTION_RECORD_ID;

    const actions = {
      ...super.getBindActions(api, TYPES),
      actionClearFilters(tableUuid) {
        return {
          [FIELD_UUID]: tableUuid,
          type: TYPES.CLEAR_FILTERS,
        };
      },

      actionChangeRecordsSelected(tableUuid, recordIds, selected) {
        return {
          [FIELD_UUID]: tableUuid,
          recordIds: Array.isArray(recordIds) ? recordIds : [recordIds],
          type: TYPES.CHANGE_SELECTED,
          payload: selected,
        };
      },

      actionChangeRecordsSelectedAll(type, isSelectedAll) {
        return {
          [FIELD_UUID]: type,
          type: TYPES.CHANGE_SELECTED_ALL,
          payload: isSelectedAll,
        };
      },

      actionClearRecordSelection(type) {
        return {
          [FIELD_UUID]: type,
          type: TYPES.CLEAR_SELECTION,
        };
      },
    };

    if (apiLoadRecords) {
      const initialMeta = this.getInitialState().meta;

      actions.actionLoadRecords = (tableUuid, meta = undefined, filters = undefined, forceUpdate = false) => {
        // return {
        //   types: [TYPES.LOAD_RECORDS_FETCH, TYPES.LOAD_RECORDS_SUCCESS, TYPES.LOAD_RECORDS_FAIL],
        //   uuid: tableUuid,
        //   meta,
        //   filters,
        //   payload: apiLoadRecords(tableUuid, meta, filters),
        // };
        return (dispatch, getState) => {
          const state = this.getSliceState(getState(), tableUuid);
          const {
            actionLoadRecordsStatus,
            meta: currentMeta,
            filters: currentFilters,
          } = state;

          const newMeta = (meta === null || meta === false)
            ? initialMeta
            : meta
              ? merge({}, currentMeta, meta)
              : currentMeta;
          const newFilters = (filters === null || filters === false)
            ? {}
            : filters
              ? merge({}, currentFilters, filters)
              : currentFilters;

          if (
            forceUpdate
            || (!actionLoadRecordsStatus.isLoaded && !actionLoadRecordsStatus.isFetching)
            || !deepEquals(newMeta, currentMeta)
            || !deepEquals(newFilters, currentFilters)
          ) {
            return dispatch({
              [FIELD_UUID]: tableUuid,
              meta: newMeta,
              filters: newFilters,
              types: [TYPES.LOAD_RECORDS_FETCH, TYPES.LOAD_RECORDS_SUCCESS, TYPES.LOAD_RECORDS_FAIL],
              payload: apiLoadRecords(tableUuid, newMeta, newFilters)
                .then((response) => {
                  if (Array.isArray(response)) {
                    return {
                      meta: {
                        total: response.length,
                      },
                      records: response,
                    };
                  }
                  return response;
                }),
            });
          }
          return Promise.resolve();
        };
      };
    }

    if (apiEditRecord) {
      actions.actionEditRecord = (tableUuid, recordId, patchOperations) => ({
        [FIELD_UUID]: tableUuid,
        [FIELD_RECORD_ID]: recordId,
        types: [TYPES.EDIT_RECORD_FETCH, TYPES.EDIT_RECORD_SUCCESS, TYPES.EDIT_RECORD_FAIL],
        payload: apiEditRecord(tableUuid, recordId, patchOperations)
          .then((resultOperations) => resultOperations || patchOperations),
      });
    }

    // todo @ANKU @LOW - actionRemoveRecord

    if (apiBulkChangeStatus) {
      actions.actionBulkChangeStatus = (tableUuid, meta, selectedIds, isSelectedAll, newStatus, oldStatus) => {
        return {
          [FIELD_UUID]: tableUuid,
          types: [TYPES.BULK_CHANGE_STATUS_FETCH, TYPES.BULK_CHANGE_STATUS_SUCCESS, TYPES.BULK_CHANGE_STATUS_FAIL],
          payload: apiBulkChangeStatus(meta, selectedIds, isSelectedAll, newStatus, oldStatus),
        };
      };
    }

    return actions;
  }

  // ======================================================
  // REDUCER
  // ======================================================
  getCaseReducers(TYPES) {
    return {
      ...super.getCaseReducers(TYPES),
      [TYPES.LOAD_RECORDS_FETCH]: (state, action) => ({
        ...state,
        meta: {
          ...state.meta,
          ...action.meta,
        },
        filters: action.filters,
      }),
      [TYPES.LOAD_RECORDS_SUCCESS]: (state, action, { meta, records }) => ({
        ...state,
        meta: {
          ...state.meta,
          ...meta,
        },
        records,
      }),
      [TYPES.EDIT_RECORD_SUCCESS]: (state, action, patchOperations) => ({
        ...state,
        ...applyPatchOperations(state, patchOperations),
      }),
      [TYPES.CHANGE_SELECTED]: (state, { recordIds }, selected) => ({
        ...state,
        selected: selected
          ? uniq([...state.selected, ...recordIds])
          : state.selected.filter((id) => !recordIds.includes(id)),
        isSelectedAll: selected ? state.isSelectedAll : false,
      }),
      [TYPES.CHANGE_SELECTED_ALL]: (state, action, isSelectedAll) => ({
        ...state,
        selected: [],
        isSelectedAll,
      }),
      [TYPES.CLEAR_SELECTION]: (state) => ({
        ...state,
        selected: [],
        isSelectedAll: false,
      }),
      [TYPES.CLEAR_FILTERS]: () => ({
        filters: {},
      }),
    };
  }

  getSliceReducers(TYPES) {
    return {
      ...super.getSliceReducers(TYPES),
      actionLoadRecordsStatus: createStatusReducer(
        TYPES.LOAD_RECORDS_FETCH, TYPES.LOAD_RECORDS_SUCCESS, TYPES.LOAD_RECORDS_FAIL,
      ),
      actionBulkChangeStatusStatus: createStatusReducer(
        TYPES.BULK_CHANGE_STATUS_FETCH, TYPES.BULK_CHANGE_STATUS_SUCCESS, TYPES.BULK_CHANGE_STATUS_FAIL,
      ),
      actionEditRecordStatusMap: createActionStatusesMap(
        [TYPES.EDIT_RECORD_FETCH, TYPES.EDIT_RECORD_SUCCESS, TYPES.EDIT_RECORD_FAIL],
        this.constructor.FIELD_ACTION_RECORD_ID,
      ),
    };
  }
}

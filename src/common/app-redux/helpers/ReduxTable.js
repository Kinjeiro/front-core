import uniq from 'lodash/uniq';
import omit from 'lodash/omit';
import {
  push,
  replace as replaceLocation,
} from 'react-router-redux';
import { replaceStorageData } from '../../helpers/helper-storage-data';

import {
  deepEquals,
  executeVariable,
} from '../../utils/common';
import {
  parseUrlParameters,
  formatUrlParameters,
} from '../../utils/uri-utils';
import { applyPatchOperations } from '../../utils/api-utils';
import {
  createTableResponse,
  DEFAULT_META,
  filterAndSortDb,
  getMeta,
} from '../../models/model-table';
import { cutContextPath } from '../../helpers/app-urls';
import logger from '../../helpers/client-logger';


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
      meta: { ...DEFAULT_META },
      filters: {
        // field: value
      },
      selected: [],
      isSelectedAll: false,
      autoSaveState: false,

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

      // CHANGE_META_OR_FILTERS: `${PREFIX}/CHANGE_META_OR_FILTERS`,
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

  async defaultFindInLocalList(newMeta, newFilters, localList, searchFieldObjects) {
    return filterAndSortDb(
      localList,
      {
        ...newMeta,
        filters: newFilters,
      },
      searchFieldObjects,
    );
  }

  // ======================================================
  // ACTIONS
  // ======================================================
  /**
   В зависимости есть ли нужный api:
   - apiFindRecords(newMeta, newFilters) -> actionLoadRecords(tableUuid, meta = undefined, filters = undefined, forceUpdate = false)
   - apiUpdateRecord -> actionEditRecord(tableUuid, recordId, patchOperations)
   - apiBulkChangeStatus -> actionBulkChangeStatus(tableUuid, meta, selectedIds, isSelectedAll, newStatus, oldStatus)

   Остальные синхронные методы:
   - actionClearFilters(tableUuid)

   - actionChangeRecordsSelected(tableUuid, recordIds, selected)
   - actionChangeRecordsSelectedAll(tableUuid, isSelectedAll)
   - actionClearRecordSelection(tableUuid)

   TYPES - типа который будут посылаться при событиях
   localDataList - лист объектов или (globalState, newMeta, newFilters) => лист объектов
   */
  getBindActions(
    api = {},
    TYPES = this.getTypes(this.getPrefix()),
    localDataList = undefined,
  ) {
    const {
      /**
       * апи который возвращает { meta, records }, либо массив, когда мультипейджинг не нужен
       */
      apiFindRecords,
      /**
       * @deprecated - use apiFindRecords
       */
      apiLoadRecords,
      apiBulkChangeStatus,

      apiUpdateRecord,
      /**
       * @deprecated - use apiUpdateRecord
       */
      apiEditRecord,
    } = api;

    const FIELD_UUID = this.constructor.FIELD_ACTION_UUID;
    const FIELD_RECORD_ID = this.constructor.FIELD_ACTION_RECORD_ID;

    const actions = {
      ...super.getBindActions(api, TYPES),

      actionChangeRecordsSelected(tableUuid, recordIds, selected) {
        return {
          [FIELD_UUID]: tableUuid,
          recordIds: Array.isArray(recordIds) ? recordIds : [recordIds],
          type: TYPES.CHANGE_SELECTED,
          payload: selected,
        };
      },

      actionChangeRecordsSelectedAll(tableUuid, isSelectedAll) {
        return {
          [FIELD_UUID]: tableUuid,
          type: TYPES.CHANGE_SELECTED_ALL,
          payload: isSelectedAll,
        };
      },

      actionClearRecordSelection(tableUuid) {
        return {
          [FIELD_UUID]: tableUuid,
          type: TYPES.CLEAR_SELECTION,
        };
      },

      // todo @ANKU @LOW - необходимо иногда изменять фильтры, без выполняния загрузки данных, quite режим
      // actionChangeMetaOrFilters() {
      //   return {
      //   };
      // },
    };

    if (apiFindRecords || apiLoadRecords || localDataList) {
      const initialMeta = this.getInitialState().meta;

      /**
       *
       * @param tableUuid
       * @param meta - мержится к текушей
       * @param filters - полностью заменяется (чтобы можно было очистить)
       * @param forceUpdate
       * @param isReplaceLocation
       * @param syncWithUrlParameters - синхронизировать с url query (но делается scroll to top и не подходит для load more и нескольких таблиц на странице)
       * @param searchFieldObjects
       * @param isLoadMore
       * @return {function(*, *)}
       */
      actions.actionLoadRecords = (
        tableUuid,
        meta = undefined,
        filters = undefined,
        forceUpdate = false,
        isReplaceLocation = false,
        syncWithUrlParameters = false,
        searchFieldObjects = undefined,
        isLoadMore = false,
      ) => {
        // return {
        //   types: [TYPES.LOAD_RECORDS_FETCH, TYPES.LOAD_RECORDS_SUCCESS, TYPES.LOAD_RECORDS_FAIL],
        //   uuid: tableUuid,
        //   meta,
        //   filters,
        //   payload: apiFindRecords(tableUuid, meta, filters),
        // };
        return (dispatch, getState) => {
          const globalState = getState();
          let stateTable = this.getSliceState(globalState, tableUuid);
          if (!stateTable) {
            logger.debug(`State for tableUuid "${tableUuid}" doesn't found.`);
            // eslint-disable-next-line no-param-reassign
            forceUpdate = true;
            // eslint-disable-next-line no-param-reassign
            stateTable = {
              actionLoadRecordsStatus: {},
              meta: initialMeta,
              filters: {},
            };
          }

          const {
            actionLoadRecordsStatus,
            meta: currentMeta,
            filters: currentFilters,
            autoSaveState,
          } = stateTable;

          let newMeta = (meta === null || meta === false)
            ? initialMeta
            : meta
              // ? merge({}, currentMeta, meta)
              ? {
                ...currentMeta,
                ...meta,
              }
              : currentMeta;
          newMeta = omit(newMeta, 'total');

          const newFilters = (filters === null || filters === false)
            ? {}
            : filters
              // неясно как перезаписывать фильтры, поэтому всегда будут перезаписываться, чтобы удобно было брать из query
              // ? merge({}, currentFilters, filters)
              ? filters
              : currentFilters;

          const hasFiltersChanged = !deepEquals(newFilters, currentFilters || {});

          if (
            forceUpdate
            || (
              !actionLoadRecordsStatus.isLoaded
              && !actionLoadRecordsStatus.isFetching
              && !actionLoadRecordsStatus.isFailed
            )
            || hasFiltersChanged
            || !deepEquals(newMeta, omit(currentMeta, 'total'))
          ) {
            if (
              newMeta.itemsPerPage !== currentMeta.itemsPerPage
              || newMeta.sortBy !== currentMeta.sortBy
              || newMeta.sortDesc !== currentMeta.sortDesc
              || newMeta.search !== currentMeta.search
              || hasFiltersChanged
            ) {
              // если меняется нужно страницу сбрасывать
              newMeta = {
                ...newMeta,
                startPage: 0,
              };
            }

            if (syncWithUrlParameters) {
              // todo @ANKU @LOW - переделать чтобы забирать location.search из globalState
              const {
                search,
                pathname,
              } = location;

              const currentUrlQuery = parseUrlParameters(search);
              // обновляем location только если что-то поменялось
              if (
                !deepEquals(newFilters, currentUrlQuery.filters || {})
                || !deepEquals(getMeta(currentUrlQuery), getMeta(newMeta))
              ) {
                // todo @ANKU @LOW - вынести этот механизм проверки наверх (или в другой редукс), чтобы никто не мог менять если ничего не изменилось
                const queryFinal = {
                  ...currentUrlQuery,
                  // мержим мету
                  ...newMeta,
                  // заменяем фильтры польностью
                  filters: Object.keys(newFilters).length === 0 ? undefined : newFilters,
                };

                dispatch(
                  (isReplaceLocation ? replaceLocation : push)({
                    // ...location,
                    pathname: cutContextPath(pathname),
                    search: `?${formatUrlParameters(queryFinal)}`,
                  }),
                );
              }
            }

            const apiFinalRecords = apiFindRecords
              || apiLoadRecords
              || (localDataList && this.defaultFindInLocalList);

            if (!apiFinalRecords) {
              throw new Error(`Для таблицы ${tableUuid} не указали apiFinalRecords или localDataList`);
            }

            return dispatch({
              [FIELD_UUID]: tableUuid,
              meta: newMeta,
              filters: newFilters,
              isLoadMore,
              types: [TYPES.LOAD_RECORDS_FETCH, TYPES.LOAD_RECORDS_SUCCESS, TYPES.LOAD_RECORDS_FAIL],
              payload: apiFinalRecords(
                newMeta,
                newFilters,
                executeVariable(localDataList, undefined, globalState, newMeta, newFilters),
                searchFieldObjects,
              )
                .then((response) => {
                  if (autoSaveState) {
                    // todo @ANKU @LOW - пока сделаем замену, но потому лучше merge с обязательной заменой undefined
                    // mergeStorageData(tableUuid, {
                    replaceStorageData(tableUuid, {
                      meta: newMeta,
                      filters: newFilters,
                    });
                  }
                  if (Array.isArray(response)) {
                    return createTableResponse(response, newMeta, response.length);
                  }
                  return response;
                }),
            });
          }
          return Promise.resolve();
        };
      };

      actions.actionClearFilters = (tableUuid) => {
        return (dispatch) => {
          // dispatch({
          //   [FIELD_UUID]: tableUuid,
          //   type: TYPES.CLEAR_FILTERS,
          // });

          // чтобы обновился урл
          return dispatch(actions.actionLoadRecords(tableUuid, undefined, null));
        };
      };
    }

    if (apiUpdateRecord || apiEditRecord) {
      actions.actionEditRecord = (tableUuid, recordId, patchOperations) => ({
        [FIELD_UUID]: tableUuid,
        [FIELD_RECORD_ID]: recordId,
        types: [TYPES.EDIT_RECORD_FETCH, TYPES.EDIT_RECORD_SUCCESS, TYPES.EDIT_RECORD_FAIL],
        payload: (apiUpdateRecord || apiEditRecord)(recordId, patchOperations)
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
      [TYPES.LOAD_RECORDS_SUCCESS]: (state, { isLoadMore }, { meta, records }) => ({
        ...state,
        meta: {
          ...state.meta,
          ...meta,
        },
        records: isLoadMore
          ? [...state.records, ...records]
          : records,
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
      [TYPES.CLEAR_FILTERS]: (state) => ({
        ...state,
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

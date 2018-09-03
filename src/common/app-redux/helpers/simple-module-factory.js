import merge from 'lodash/merge';

import { objectValues } from '../../utils/common';
import {
  createReducer,
  createAllTypesMapCollectionReducer,
} from '../utils';

export const FIELD_ACTION_UUID = 'uuid';

export default function simpleModuleFactory(
  moduleName,
  {
    initialState: entityInitialState = {},
    TYPES: ENTITY_TYPES = {},
    getBindActions: entityGetBindActions,
    reducer: entityReducer,
  } = {},
) {
  // ======================================================
  // INITIAL STATE
  // ======================================================
  const moduleItemInitialState = {
    [FIELD_ACTION_UUID]: undefined,
    initialized: false,
    data: entityInitialState,
  };
  const byIdsInitialState = {};
  const moduleInitialState = {
    moduleName,
    byIds: undefined,
    lastInit: null,
    lastUsed: null,
  };

  // ======================================================
  // TYPES
  // ======================================================
  const TYPES = {
    INIT: `${moduleName}/INIT`,
    UPDATE: `${moduleName}/UPDATE`,
    REMOVE: `${moduleName}/REMOVE`,
    ...ENTITY_TYPES,
  };

  const ENTITY_TYPES_VALUES = objectValues(ENTITY_TYPES);
  const TYPES_VALUES = objectValues(TYPES);

  // ======================================================
  // ACTION CREATORS
  // ======================================================
  function getBindActions(api) {
    return {
      actionModuleItemInit(entityId, data = undefined) {
        return {
          [FIELD_ACTION_UUID]: entityId,
          type: TYPES.INIT,
          payload: data,
        };
      },
      actionModuleItemUpdate(entityId, data) {
        return {
          [FIELD_ACTION_UUID]: entityId,
          type: TYPES.UPDATE,
          payload: data,
        };
      },
      actionModuleItemRemove(entityId) {
        return {
          [FIELD_ACTION_UUID]: entityId,
          type: TYPES.REMOVE,
        };
      },
      ...(entityGetBindActions ? entityGetBindActions(api) : {}),
    };
  }

  const moduleItemReducer = (state = moduleItemInitialState, action) => {
    if (action.type === TYPES.UPDATE) {
      return {
        ...state,
        data: typeof action.payload === 'object'
          ? {
            ...(state.data || {}),
            ...action.payload,
          }
          : action.payload,
      };
    }
    return entityReducer
      ? {
        ...state,
        data: entityReducer(state.data, action),
      }
      : { ...state };
  };

  function createModuleItem(id, data, action) {
    const result = moduleItemReducer(undefined, action);
    if (data || id) {
      // если новый создается на клиенте - то uuid будет а серверного не будет пока не создасться
      // а если уже загружаем уже существующие то uuid = serverId
      result[FIELD_ACTION_UUID] = id;
      if (typeof data !== 'undefined') {
        result.data = merge({}, result.data, data);
      }
    }
    result.initialized = true;
    return result;
  }

  function initModuleItem(state, action, data = null) {
    // todo @ANKU @LOW - вынести это в action, добавить селектор и force
    const moduleItem = state[action[FIELD_ACTION_UUID]];

    // если существует ничего не нужно делать
    return moduleItem
      ? data !== null
        ? merge({}, state, {
          [action[FIELD_ACTION_UUID]]: {
            data,
          },
        })
        : state
      : {
        ...state,
        [action[FIELD_ACTION_UUID]]: createModuleItem(action[FIELD_ACTION_UUID], data, action),
      };
  }

  const byIdsReducer = createReducer(
    byIdsInitialState,
    {
      [TYPES.INIT]:
        (state, action, data) => initModuleItem(state, action, data),
      [TYPES.REMOVE]:
        (state, action) => {
          const newState = { ...state };
          delete newState[action[FIELD_ACTION_UUID]];
          return newState;
        },
    },
    null,
    // вверху указаны не все статусы. Необходимо прогонять через attachReducer чтобы менять статусы
    createAllTypesMapCollectionReducer(TYPES, moduleItemReducer, FIELD_ACTION_UUID),
  );

  const moduleReducer = createReducer(
    moduleInitialState,
    {
      [TYPES.INIT]:
        (state, action) => ({
          ...state,
          lastInit: action[FIELD_ACTION_UUID],
        }),
    },
    {
      // byIds: byIdsReducer,
      byIds: (state = byIdsInitialState, action, data) => {
        let stateFinal = state;
        if (ENTITY_TYPES_VALUES.includes(action.type)) {
          const sliceState = stateFinal[action[FIELD_ACTION_UUID]];
          // auto init if not exist
          if (!sliceState) {
            stateFinal = initModuleItem(stateFinal, action, data);
          }
        }
        return byIdsReducer(stateFinal, action, data);
      },
    },
  );

  const moduleReducerWrapper = (state = moduleInitialState, action, data) => {
    let stateFinal = state;
    if (TYPES_VALUES.includes(action.type) && action.type !== TYPES.REMOVE) {
      stateFinal = {
        ...stateFinal,
        lastUsed: action[FIELD_ACTION_UUID],
      };
    }
    return moduleReducer(stateFinal, action, data);
  };

  return {
    PREFIX: moduleName,
    entityReducer,
    moduleItemReducer,
    moduleReducer: moduleReducerWrapper,
    TYPES,
    getBindActions,
    actions: getBindActions(),
  };
}

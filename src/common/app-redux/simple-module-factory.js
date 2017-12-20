import {
  createReducer,
  createAllTypesMapCollectionReducer,
} from './utils';

export default function simpleModuleFactory(
  moduleName,
  {
    dataInitialState = undefined,
  } = {},
) {
  // ======================================================
  // INITIAL STATE
  // ======================================================
  const entityInitialState = {
    uuid: undefined,
    data: dataInitialState,
  };
  const byIdsInitialState = {};
  const moduleInitialState = {
    byIds: undefined,
  };

  // ======================================================
  // TYPES
  // ======================================================
  const TYPES = {
    INIT: `${moduleName}/INIT`,
    UPDATE: `${moduleName}/UPDATE`,
    REMOVE: `${moduleName}/REMOVE`,
  };


  // ======================================================
  // ACTION CREATORS
  // ======================================================
  const actions = {
    actionInit(entityId, data = undefined) {
      return {
        uuid: entityId,
        type: TYPES.INIT,
        payload: data,
      };
    },
    actionUpdate(entityId, data) {
      return {
        uuid: entityId,
        type: TYPES.UPDATE,
        payload: data,
      };
    },
    actionRemove(entityId) {
      return {
        uuid: entityId,
        type: TYPES.REMOVE,
      };
    },
  };

  // ======================================================
  // REDUCER
  // ======================================================
  const entityReducer = createReducer(
    entityInitialState,
    {
      [TYPES.UPDATE]:
        (state, action, data) => ({
          ...state,
          data: {
            ...(state.data || {}),
            ...data,
          },
        }),
    },
  );

  function createEntity(id, data, action) {
    const initState = entityReducer(undefined, action);
    return (data || id)
      ? {
        ...initState,
        // если новый создается на клиенте - то uuid будет а серверного не будет пока не создасться
        // а если уже загружаем уже существующие то uuid = serverId
        uuid: id,
        data,
      }
      : initState;
  }

  const byIdsReducer = createReducer(
    byIdsInitialState,
    {
      [TYPES.INIT]:
        (state, action, data) => ({
          ...state,
          [action.uuid]: createEntity(action.uuid, data, action),
        }),
      [TYPES.REMOVE]:
        (state, action) => {
          const newState = { ...state };
          delete newState[action.uuid];
          return newState;
        },
    },
    null,
    // вверху указаны не все статусы. Необходимо прогонять через attachReducer чтобы менять статусы
    createAllTypesMapCollectionReducer(TYPES, entityReducer),
  );

  const moduleReducer = createReducer(
    moduleInitialState,
    {},
    {
      byIds: byIdsReducer,
    },
  );

  return {
    entityReducer,
    moduleReducer,
    TYPES,
    actions,
  };
}

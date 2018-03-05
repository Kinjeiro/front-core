import createStatusReducer from './create-status-reducer';

export default function createActionStatusesMap(TYPES, actionUuidField = 'uuid') {
  const reducer = createStatusReducer(...TYPES);
  return (state, action) => {
    if (TYPES.includes(action.type)) {
      return {
        ...state,
        [action[actionUuidField]]: reducer(state[action[actionUuidField]], action),
      };
    }
    return state;
  };
}

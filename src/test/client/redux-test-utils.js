import { combineReducers } from 'redux';

import createStore from '../../common/app-redux/create-store';

export function createTestStore(reducerName, reducer) {
  return createStore(null, {
    initialState: {
      [reducerName]: reducer(),
    },
    rootReducer: combineReducers({
      [reducerName]: reducer,
    }),
    isHotLoaderRequired: false,
  });
}

export function testStatusReducer(
  statusName,
  actionCaller,
  dispatchAction,
  getReducerSliceState,
) {
  const beforeReducerState = getReducerSliceState();

  expect(beforeReducerState[statusName].isFetching)
    .to.be.false;
  expect(beforeReducerState[statusName].isLoaded)
    .to.be.false;

  setTimeout(() => {
    expect(getReducerSliceState()[statusName].isFetching)
      .to.be.true;
  });

  return dispatchAction(actionCaller())
    .then(() => {
      const afterReducerState = getReducerSliceState();
      expect(afterReducerState[statusName].isFetching)
        .to.be.false;
      expect(afterReducerState[statusName].isLoaded)
        .to.be.true;
    });
}

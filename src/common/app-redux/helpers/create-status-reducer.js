import { getCurrentTime } from '../../utils/date-utils';

import { getFetchTypesByType } from '../utils';

export const INITIAL_STATE = {
  isFetching: false,
  isLoaded: false,
  isFailed: false,
  isResponseNotEmpty: false,
  error: null,
  updated: null,
};

/**
 *
 * @param typesArray - один или несколько массивов, в каждом по три types. Первый - fetch, второй - success, третий - fail
 */
export default function createStatusesReducer(...typesArray) {
  const { fetch, success, fail } = getFetchTypesByType(...typesArray);
  const allTypes = [...fetch, ...success, ...fail];

  return (state = INITIAL_STATE, { type, payload, error }) => {
    if (!allTypes.includes(type)) {
      return state;
    }

    const isFetching = fetch.includes(type);
    const isFailed = fail.includes(type);
    const isLoaded = !isFailed && (state.isLoaded || success.includes(type));
    const isResponseNotEmpty = payload === 0 || typeof payload === 'boolean' || !!payload;
    const finalError = (isFetching || isLoaded) ? null : error || (payload || state).error;

    return {
      isFetching,
      isLoaded,
      isFailed,
      isResponseNotEmpty,
      error: finalError,
      updated: getCurrentTime(),
    };
  };
}



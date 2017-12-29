import { delayPromiseThen } from '../../common/utils/common';

import { parseResponseHandler } from './hapi-utils';

export function createMockRoute(
  { path, method = 'get' }, // apiConfig
  handler,
  mockFilterConditions = {},
  ...otherRouteConfig
) {
  return {
    method,
    path,
    handler: parseResponseHandler(handler, true),
    mockFilterConditions,
    ...otherRouteConfig,
  };
}


export function delayValueHandler(value, delay, delayMax = null) {
  // функция нужна чтобы каждый раз расчитывалась новая задержка
  return (...args) => {
    const valueUpdate = typeof value === 'function'
      ? value(...args)
      : value;

    const valuePromise =
      value.then
        ? value
        : Promise.resolve(valueUpdate);

    return valuePromise
      .then(delayPromiseThen(delay, delayMax));
  };
}

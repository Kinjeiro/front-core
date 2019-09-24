import {
  delayPromise,
  getRandomValue,
  executeVariable,
} from '../../common/utils/common';

import { handlerWrapperParseResponse } from './hapi-utils';

export function createMockRoute(
  { path, method = 'get' }, // apiConfig
  handler,
  mockFilterConditions = {},
  otherRouteConfig,
) {
  return {
    method,
    path,
    handler: handlerWrapperParseResponse(handler, true),
    mockFilterConditions,
    ...otherRouteConfig,
  };
}

export function delayValueHandler(value, delay, delayMax) {
  // функция нужна чтобы каждый раз расчитывалась новая задержка
  return (...args) => delayPromise(getRandomValue(delay, delayMax))
    .then(() => executeVariable(value, undefined, ...args));
}

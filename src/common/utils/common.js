/* eslint-disable no-param-reassign,no-continue,no-restricted-syntax */
import flattenDeep from 'lodash/flattenDeep';
import isEqual from 'lodash/isEqual';
import mergeLib from 'lodash/merge';
import memoize from 'lodash/memoize';
import uuid from 'uuid';
// import uniqueId from 'lodash/uniqueId';

import {
  findInTree as findInTreeLib,
  arrayToTree as arrayToTreeLib,
} from './tree-utils';

export function generateId(uuidOptions = null, version = 'v1') {
  // return uniqueId();

  // https://stackoverflow.com/a/2117523/344172
  // let d = new Date().getTime();
  // // eslint-disable-next-line no-undef
  // if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
  //   // eslint-disable-next-line no-undef
  //   d += performance.now(); // use high-precision timer if available
  // }
  // return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  //   // eslint-disable-next-line no-mixed-operators,no-bitwise
  //   const r = (d + Math.random() * 16) % 16 | 0;
  //   d = Math.floor(d / 16);
  //   // eslint-disable-next-line no-mixed-operators,no-bitwise
  //   return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  // });

  // for window.crypto
  // eslint-disable-next-line space-infix-ops
  // return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(
  //   /[018]/g,
  //   // eslint-disable-next-line no-bitwise,no-undef,no-mixed-operators
  //   c => (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16),
  // );

  return uuid[version](uuidOptions);
}

export function getRandomInt(min = 0, max = Number.MAX_VALUE) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

export function getRandomValue(min, max = null) {
  if (max === null) {
    return min;
  }
  return min % 1 !== 0 || max % 1 !== 0
    ? min + (Math.random() * (max - min))
    : getRandomInt(min, max);
}

export function dispersionValue(number, percentDispersion = 0) {
  if (percentDispersion === 0) {
    return number;
  }

  const maxAbs = (number * percentDispersion) / 100;
  return getRandomValue(number - maxAbs, number + maxAbs);
}

export function getRoundedValue(value) {
  return Math.round(value * 100) / 100;
}


export function getMinMax(series) {
  const allValues = flattenDeep(series);

  return {
    min: Math.min(...allValues),
    max: Math.max(...allValues),
  };
}

export function compare(objA, objB, invert) {
  const invertValue = invert ? -1 : 1;

  return objA > objB
    ? invertValue
    : objA < objB
       ? invertValue * -1
       : 0;
}

export function comparatorByField(getField, invert) {
  const getFieldFinal = typeof getField === 'string'
    ? (obj) => obj[getField]
    : getField;

  return (objA, objB) =>
    compare(getFieldFinal(objA), getFieldFinal(objB), invert);
}

export function arrayContainsArray(superset, subset) {
  return subset.every((value) => superset.indexOf(value) >= 0);
}


export function delayPromise(delay = 0, ...args) {
  return delay > 0
    ? new Promise((resolve) => {
      // todo @ANKU @LOW - подумать над логгером в utils
      console.log('delayPromise', delay);
      setTimeout(resolve.bind(this, ...args), delay);
    })
    : Promise.resolve(...args);
}

export function delayPromiseThen(delay = 0, maxValue = undefined) {
  if (typeof maxValue !== 'undefined') {
    delay = getRandomValue(delay, maxValue);
  }
  return (...args) => delayPromise(delay, ...args);
}

export function promiseMap(nameToPromiseMap) {
  const keys = Object.keys(nameToPromiseMap);
  return Promise.all(keys.map((key) => nameToPromiseMap[key]))
    .then((results) =>
      keys.reduce((resultMap, key, index) => {
        resultMap[key] = results[index];
        return resultMap;
      }, {}));
}

export function deepEquals(obj1, obj2) {
  // return shallowequal(obj1, obj2);
  return isEqual(obj1, obj2);
}

/**
 * Примеры
 *  valueFromRange( 0, [0, 5, 8, 15, 20], [a, b, c, d], 'Y') => 'a'
 *  valueFromRange(13, [0, 5, 8, 15, 20], [a, b, c, d], 'Y') => 'c'
 *  valueFromRange(20, [0, 5, 8, 15, 20], [a, b, c, d], 'Y') => 'd'
 *  valueFromRange(25, [0, 5, 8, 15, 20], [a, b, c, d], 'Y') => 'Y'
 *
 * @param inputValue
 * @param inputValueRanges
 * @param outputValueRanges - кол-во на одно меньше чем inputValueRanges
 * @param defaultValue
 */
export function valueFromRange(inputValue, inputValueRanges, outputValueRanges, defaultValue = null) {
  if (inputValueRanges.length !== outputValueRanges.length + 1) {
    throw new Error('Кол-во inputValueRanges не соответствует outputValueRanges');
  }

  if (typeof inputValue !== 'undefined' && inputValue !== null) {
    // eslint-disable-next-line no-plusplus
    for (let position = 0; position < inputValueRanges.length - 1; position++) {
      const min = inputValueRanges[position];
      const max = inputValueRanges[position + 1];
      const isLast = position + 1 === inputValueRanges.length - 1;
      if (min <= inputValue && (inputValue < max || (isLast && inputValue === max))) {
        return outputValueRanges[position];
      }
    }
  }
  return defaultValue;
}

export function isDecimal(value) {
  return typeof value === 'number' && value % 1 !== 0;
}

export function emptyFunction() {}

export function filterObjects(collections, queryFields) {
  return collections.filter((payer) =>
    Object.keys(queryFields).every((field) => {
      const value = queryFields[field];
      const payerValue = payer[field];
      return value === null
        || typeof value === 'undefined'
        || value === ''
        || payerValue === value
        || (
          payerValue.indexOf
          && value.toLowerCase
          && payerValue.toLowerCase().indexOf(value.toLowerCase()) === 0
        );
    }));
}

export function arrayToObject(array, keyMap) {
  const keyMapFn = typeof keyMap === 'function'
    ? keyMap
    : item => item[keyMap];

  return array.reduce((resultObj, item) => {
    const key = keyMapFn(item);
    return Object.assign(resultObj, { [key]: item });
  }, {});
}

export function objectValues(object = {}) {
  return Object.keys(object).map((key) => object[key]);
}

export function merge(...args) {
  return mergeLib(...args);
}


export class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

export function executeVariable(fn, defaultValue = undefined, ...args) {
  return typeof fn === 'function'
    ? fn(...args)
    : typeof fn === 'undefined' || fn === null
      ? defaultValue
      : fn;
}

export const executeVariableMemoize = memoize(
  (key, ...args) => executeVariable(...args),
);

export function wrapToArray(value = null) {
  return Array.isArray(value)
    ? value
    : value === null || value === ''
      ? []
      : [value];
}

export function includes(first, second, emptyIsInclude = false) {
  const firstA = wrapToArray(first);
  const secondA = wrapToArray(second);

  if (secondA.length === 0) {
    return emptyIsInclude;
  }
  if (firstA.length === 0) {
    return false;
  }

  return firstA.some((firstValue) => second.includes(firstValue));
}

export function isEmpty(value, objectChecker = null) {
  if (objectChecker && typeof value === 'object') {
    return objectChecker(value);
  }
  return value === null || typeof value === 'undefined' || value === '' || (Array.isArray(value) && value.length === 0);
}




/**
 @deprecated - user tree-utils.js::findInTree
 */
export function findInTree(tree, id, config = {}, deep = 0, path = [], pathStr = '') {
  return findInTreeLib(tree, id, config, deep, path, pathStr);
}

/**
 * @deprecated - use tree-utils.js arrayToTree
 */
export function arrayToTree(array, options = {}, parent = null, level = 0) {
  return arrayToTreeLib(array, options, parent, level);
}

export function checkExist(value, error = 'Произошла ошибка', notEmpty = false, throwError = true) {
  if (value === null || typeof value === 'undefined' || (notEmpty && (value === '' || value.length === 0))) {
    if (throwError) {
      throw new Error(error);
    }
    return false;
  }
  return true;
}


export function convertToString(...args) {
  return args.map((value) => (typeof value === 'string' ? value : `${value}`));
}

export function escapeToRegExp(str) {
  // eslint-disable-next-line no-useless-escape
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function isNumber(str) {
  return typeof str === 'number'
    || (str && !isNaN(str));
}


// https://www.npmjs.com/package/destroy-circular
function destroyCircular(from, seen) {
  const to = Array.isArray(from) ? [] : {};
  seen.push(from);

  for (const key of Object.keys(from)) {
    const value = from[key];
    if (typeof value === 'function') {
      continue;
    }
    if (!value || typeof value !== 'object') {
      to[key] = value;
      continue;
    }
    if (seen.indexOf(from[key]) === -1) {
      to[key] = destroyCircular(from[key], seen.slice(0));
      continue;
    }
    to[key] = '[Circular]';
  }
  if (typeof from.name === 'string') {
    to.name = from.name;
  }
  if (typeof from.message === 'string') {
    to.message = from.message;
  }
  if (typeof from.stack === 'string') {
    to.stack = from.stack;
  }
  return to;
}

// from https://github.com/sindresorhus/serialize-error/blob/master/index.js
export function errorToJson(error) {
  if (typeof error === 'object') {
    return destroyCircular(error, []);
  }

  // People sometimes throw things besides Error objects, so…
  if (typeof error === 'function') {
    // JSON.stringify discards functions. We do too, unless a function is thrown directly.
    return `[Function: ${(error.name || 'anonymous')}]`;
  }

  return error;
}

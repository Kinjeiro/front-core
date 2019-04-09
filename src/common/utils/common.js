/* eslint-disable no-param-reassign,no-continue,no-restricted-syntax */
import flattenDeep from 'lodash/flattenDeep';
import isEqual from 'lodash/isEqual';
import mergeLib from 'lodash/merge';
import memoizeLodash from 'lodash/memoize';
import lodashDifference from 'lodash/difference';
import emptyObject from 'lodash/isEmpty';

import shallowEqualLib from 'shallowequal';
import promiseMemoize from 'promise-memoize';
import uuid from 'uuid';
// import uniqueId from 'lodash/uniqueId';

import {
  findInTree as findInTreeLib,
  arrayToTree as arrayToTreeLib,
} from './tree-utils';

export function generateUuid(uuidOptions = null, version = 'v1') {
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
export function generateId(uuidOptions = null, version = 'v1') {
  return generateUuid(uuidOptions, version);
}
export function generateNumberId(length = 7) {
  // current timestamp 1543988290855 - 13
  const numId = Math.floor(new Date().valueOf() * Math.random());
  let numIdStr = `${numId}`;
  while (numIdStr.length < length) {
    numIdStr += '0';
  }
  return parseInt(numIdStr.substr(0, length), 10);
}
export function generateShortUuid(length = 5) {
  return generateNumberId(length).toString(36);
}

export function getRandomInt(minValue = 0, maxValue = Number.MAX_VALUE) {
  return Math.floor(Math.random() * ((maxValue - minValue) + 1)) + minValue;
}

export function getRandomValue(minValue, maxValue = null) {
  if (maxValue === null) {
    return minValue;
  }
  return minValue % 1 !== 0 || maxValue % 1 !== 0
    ? minValue + (Math.random() * (maxValue - minValue))
    : getRandomInt(minValue, maxValue);
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

export function min(...items) {
  /*
   // todo @ANKU @LOW @BUG_OUT @babel-minify - не может минимизировать Math.min O_O
   Couldn't find intersection
   at NodePath.getDeepestCommonAncestorFrom (H:\FrontCore\node_modules\babel-traverse\lib\path\ancestry.js:173:11)
   */
  // return Math.min(...items),
  return items.reduce((result, item) => (result < item ? result : item));
}
export function ceil(value) {
  /*
   // todo @ANKU @LOW @BUG_OUT @babel-minify - плохо реагирует на Math.min и Math.ceil (а Math.max работает нормально)
   Cannot read property 'contexts' of null
   at NodePath._getQueueContexts (H:\FrontCore_Components\node_modules\babel-traverse\lib\path\context.js:279:21)
   */
  // return Math.ceil(value);
  // eslint-disable-next-line no-bitwise
  let result = ~~(value);
  if (value > result) {
    result += 1;
  }
  return result;
}

export function getMinMax(series) {
  const allValues = flattenDeep(series);

  return {
    /*
     // todo @ANKU @LOW @BUG_OUT @babel-minify - не может минимизировать Math.min O_O
     Couldn't find intersection
     at NodePath.getDeepestCommonAncestorFrom (H:\FrontCore\node_modules\babel-traverse\lib\path\ancestry.js:173:11)
     */
    // min: Math.min(...allValues),
    min: min(...allValues),
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

  return (objA, objB) => compare(getFieldFinal(objA), getFieldFinal(objB), invert);
}

export function arrayContainsArray(superset, subset) {
  return subset.every((value) => superset.indexOf(value) >= 0);
}

// ======================================================
// COMPARATOR
// ======================================================
export function shallowEqual(obj1, obj2) {
  return shallowEqualLib(obj1, obj2);
}
export function deepEquals(obj1, obj2) {
  // return shallowequal(obj1, obj2);
  return isEqual(obj1, obj2);
}

// ======================================================
// NUMERIC ARRAYS
// ======================================================
/**
 * Примеры
 *  valueFromRange( 0, [0, 5, 8, 15, 20], ['a', 'b', 'c', 'd'], 'Y') => 'a'
 *  valueFromRange(13, [0, 5, 8, 15, 20], ['a', 'b', 'c', 'd'], 'Y') => 'c'
 *  valueFromRange(20, [0, 5, 8, 15, 20], ['a', 'b', 'c', 'd'], 'Y') => 'd'
 *  valueFromRange(25, [0, 5, 8, 15, 20], ['a', 'b', 'c', 'd'], 'Y') => 'Y'
 *
 * @param inputValue
 * @param inputValueRanges
 * @param outputValueRanges - кол-во на одно меньше чем inputValueRanges
 * @param outRangeValue
 */
export function valueFromRange(inputValue, inputValueRanges, outputValueRanges = null, outRangeValue = null) {
  if (outputValueRanges && inputValueRanges.length !== outputValueRanges.length + 1) {
    throw new Error('Кол-во inputValueRanges не соответствует outputValueRanges');
  }

  if (typeof inputValue !== 'undefined' && inputValue !== null) {
    // eslint-disable-next-line no-plusplus
    for (let position = 0; position < inputValueRanges.length - 1; position++) {
      const minValue = inputValueRanges[position];
      const maxValue = inputValueRanges[position + 1];
      const isLast = position + 1 === inputValueRanges.length - 1;
      if (minValue <= inputValue && (inputValue < maxValue || (isLast && inputValue === maxValue))) {
        return outputValueRanges
          ? outputValueRanges[position]
          : inputValueRanges[position];
      }
    }
  }
  return outRangeValue;
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

export function memoize(...args) {
  return memoizeLodash(...args);
}
function defaultMemoizePromiseKeyFn(value) {
  return value;
}
export function memoizePromise(promise, keyFn = defaultMemoizePromiseKeyFn) {
  return promiseMemoize(
    promise,
    {
      resolve: keyFn,
    },
  );
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

export function isClass(v) {
  if (!v) {
    return false;
  }
  const toString = v.toString();
  return typeof v === 'function' && (
    // babel
    toString.indexOf('_classCallCheck') >= 0
    // ??? иногда _classCallCheck не используется почему-то при компиляции на продакшен и падает "Cannot call a class as a function"
    || toString.indexOf('__proto__||Object.getPrototypeOf') >= 0
    // es6
    || /^\s*class\s+/.test(toString)
  );
}

export function executeVariable(fn, defaultValue = undefined, ...args) {
  return isClass(fn)
    // eslint-disable-next-line new-cap
    ? new fn(...args)
    : typeof fn === 'function'
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
      : typeof FileList !== 'undefined' && value instanceof FileList
        ? [...value]
        : [value];
}

export function includes(first, second, emptyIsInclude = false, allIncludes = false) {
  const firstA = wrapToArray(first);
  const secondA = wrapToArray(second);

  if (secondA.length === 0) {
    return emptyIsInclude;
  }
  if (firstA.length === 0) {
    return false;
  }

  return firstA[allIncludes ? 'every' : 'some']((firstValue) => secondA.includes(firstValue));
}

export function difference(source, minusValues) {
  // _.difference([2, 1], [2, 3]);
  // => [1]
  return lodashDifference(
    wrapToArray(source),
    wrapToArray(minusValues),
  );
}

export function isEmpty(value, objectChecker = emptyObject) {
  return value instanceof Object
    ? objectChecker(value)
    : typeof value === 'string'
      ? value.trim().length === 0
      : typeof value === 'undefined' || value === null;
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

/**
 * https://stackoverflow.com/a/45332959/344172
 *
 * @param BaseClass
 * @param Mixins
 * @return {base}


  class Person{
   constructor(n){
      this.name=n;
   }
  }
  class Male{
   constructor(s='male'){
      this.sex=s;
   }
  }
  class Child{
   constructor(a=12){
      this.age=a;
   }
   tellAge(){console.log(this.name+' is '+this.age+' years old.');}
  }
  class Boy extends aggregation(Person,Male,Child){}
  var m = new Boy('Mike');
  m.tellAge(); // Mike is 12 years old.

 */
export function aggregation(BaseClass, ...Mixins) {
  function copyProps(target, source) {  // this function copies all properties and symbols, filtering out some special ones
    Object.getOwnPropertyNames(source)
      .concat(Object.getOwnPropertySymbols(source))
      .forEach((prop) => {
        if (!prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
          Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
        }
      });
  }

  class Base extends BaseClass {
    constructor(...args) {
      super(...args);
      Mixins.forEach((Mixin) => copyProps(this, (new Mixin())));
    }
  }

  Mixins.forEach((mixin) => { // outside contructor() to allow aggregation(A,B,C).staticFunction() to be called etc.
    copyProps(Base.prototype, mixin.prototype);
    copyProps(Base, mixin);
  });

  return Base;
}

export function aggregateArrayFn(array, field) {
  return (...args) => array.reduce((result, arrayItem) => {
    result.push(...wrapToArray(executeVariable(arrayItem[field], [], ...args)));
    return result;
  }, []);
}

export function aggregateObjectFn(array, field) {
  return (...args) => array.reduce((result, arrayItem) => {
    const object = executeVariable(arrayItem[field], {}, ...args);
    Object.assign(result, object);
    return result;
  }, {});
}


// ======================================================
// PROMISE
// ======================================================
export function isPromise(promise) {
  return promise && !!promise.then;
}

export function delayPromiseSilence(silence = false, delay = 0, ...args) {
  return delay > 0
    ? new Promise((resolve) => {
      // todo @ANKU @LOW - подумать над логгером в utils
      if (!silence) {
        console.log('delayPromise', delay);
      }
      setTimeout(resolve.bind(this, ...args), delay);
    })
    : Promise.resolve(...args);
}
export function delayPromise(delay = 0, ...args) {
  return delayPromiseSilence(false, delay, ...args);
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

export const PROMISE_STATUS = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};
export async function promiseState(promise) {
  const fakeValue = {};
  return Promise.race([promise, fakeValue])
    .then(
      (value) => (
        value === fakeValue
          ? PROMISE_STATUS.PENDING
          : PROMISE_STATUS.FULFILLED
      ),
      () => PROMISE_STATUS.REJECTED,
    );
}
export async function promiseStatusSwitch(
  promise,
  pendingFunc = null,
  resolvedFunc = null,
  rejectedFunc = null,
  timeout = null,
) {
  if (timeout) {
    await delayPromiseSilence(true, timeout);
  }
  const status = await promiseState(promise);
  const func = status === PROMISE_STATUS.PENDING
    ? pendingFunc
    : status === PROMISE_STATUS.FULFILLED
      ? resolvedFunc
      : rejectedFunc;
  return func ? func(promise) : promise;
}

export async function promiseWaterFall(promises) {
  const result = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const promise of wrapToArray(promises)) {
    try {
      // eslint-disable-next-line no-await-in-loop
      result.push(await executeVariable(promise));
    } catch (e) {
      throw e;
    }
  }
  // iterable.reduce((result, fn) => result.then(fn), Promise.resolve());
  return result;
}

/**
 * Метод который, который на время исполнения промиса, проставляет через setState значение переменной
 * processingStateVariable (по умолчанию, isProcessing)
 *
 * @param handlerPromise
 * @param componentWithSetState
 * @param processingStateVariable
 * @return {*}
 */
export function emitProcessing(handlerPromise, componentWithSetState, processingStateVariable = 'isProcessing') {
  const handlerPromiseFinal = executeVariable(handlerPromise);
  if (isPromise(handlerPromiseFinal) && componentWithSetState && componentWithSetState.setState) {
    /*
     бывает так, что промис - лишь обертка над Promise.resolve а setState заставляете перирисоваться ради этой милисекунды
     поэтому сделаем setTimeout и проверим значение на следующем тике
     */
    return promiseStatusSwitch(
      handlerPromiseFinal,
      (promise) => {
        componentWithSetState.setState({ [processingStateVariable]: true });
        return promise
        // todo @ANKU @LOW - warning.js:33 Warning: Can only update a mounted or mounting component. This usually means you called setState, replaceState, or forceUpdate on an unmounted component. This is a no-op.
          .then(() => componentWithSetState.setState({ [processingStateVariable]: false }))
          .catch(() => componentWithSetState.setState({ [processingStateVariable]: false }));
      },
      null,
      null,
      10,
    );
  }
  return handlerPromise;
}

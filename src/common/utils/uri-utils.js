/* eslint-disable no-undef,no-param-reassign */
import pathLib from 'path';
import forOwn from 'lodash/forOwn';
import merge from 'lodash/merge';
import queryString from 'query-string';

import { convertToString } from './common';

const pathModule = pathLib.posix || pathLib;

// на клиенте нет pahtLib.posix а на винде на сервере без posix будет неправильный урлы
const joinPathInner = pathModule.join;
export const normalize = pathModule.normalize;
export const resolve = pathModule.resolve;


// const VALID_PATH_REGEXP = /^([a-zA-Z]:)?(\\[^<>:"/\\|?*]+)+\\?$/;
export function isValidPath(path) {
  // return str && str === path.basename(str);
  return path && /^([a-zA-Z]:)?(\\[^<>:"/\\|?*]+)+\\?$/.test(path);
}

// export function parseUrlParameters(url) {
//   const urlParams = {};
//
//   const index = url.indexOf('?');
//   if (index >= 0) {
//     const pl     = /\+/g;  // Regex for replacing addition symbol with a space
//     const search = /([^&=]+)=?([^&]*)/g;
//     const decode = (s) => decodeURIComponent(s.replace(pl, ' '));
//     const query  = url.substr(index + 1);
//
//     let match = search.exec(query);
//     while (match) {
//       const key = decode(match[1]);
//       let value = decode(match[2]);
//       let oldValue = urlParams[key];
//       if (oldValue) {
//         if (!Array.isArray(oldValue)) {
//           oldValue = [oldValue];
//         }
//         oldValue.push(value);
//         value = oldValue;
//       }
//       urlParams[key] = value;
//       match = search.exec(query);
//     }
//   }
//   return urlParams;
// }

function proceedDefaultValues(defaultValues) {
  const calculatedDefValues = {};
  if (defaultValues) {
    forOwn(defaultValues, (value, key) => {
      if (typeof value === 'function') {
        calculatedDefValues[key] = value();
      }
    });
  }

  return Object.keys(defaultValues).length > 0 ?
    { ...defaultValues, ...calculatedDefValues } :
         defaultValues;
}

/**
 *
 * @param url - либо объект location, либо мапа параметров, либо стринга
 * @param defaultValues
 * @returns {{}}
 */
export function parseUrlParameters(url, defaultValues = {}) {
  if (!url) {
    return {};
  }

  let params = url;

  if (typeof url === 'object' && url.pathname) {
    // это location
    url = url.search;
  }
  if (typeof url === 'string') {
    const extracted = queryString.extract(url);

    params = queryString.parse(
      extracted,
      {
        arrayFormat: extracted.indexOf('[]=') >= 0
          ? 'bracket'
          : undefined,
      },
    );
  }

  /*
    Чтобы парсить объекты в query
    http://localhost:8080/api/products?type=products&meta%5Bsearch%5D&meta%5BstartPage%5D=0&meta%5BitemsPerPage%5D=10&meta%5BsortBy%5D&meta%5BsortDesc%5D=true&meta%5Btotal%5D&filters%5Btype%5D=goods
    Иначе выводится:
     meta[search]:
     meta[startPage]: 0
     meta[itemsPerPage]: 10
     meta[sortBy]:
     meta[sortDesc]: true
     meta[total]:
     filters[type]: goods
  */
  const paramsFinal = {};
  Object.keys(params).forEach((key) => {
    const value = params[key];
    const result = /^(\S+)\[(\S+)\]$/i.exec(key);
    const firstPart = result && result[1];
    const innerPart = result && result[2];
    if (innerPart) {
      if (typeof paramsFinal[firstPart] === 'undefined') {
        paramsFinal[firstPart] = {};
      }
      paramsFinal[firstPart][innerPart] = value;
    } else {
      paramsFinal[key] = value;
    }
  });

  return {
    ...proceedDefaultValues(defaultValues),
    ...paramsFinal,
  };
}



function pushEncodedKeyValuePair(pairs, key, val) {
  if (val !== null && typeof val !== 'undefined') {
    if (Array.isArray(val)) {
      val.forEach((v) => {
        pushEncodedKeyValuePair(pairs, key, v);
      });
    } else if (typeof val === 'object') {
      for (const subkey in val) {
        pushEncodedKeyValuePair(pairs, `${key}[${subkey}]`, val[subkey]);
      }
    } else {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
    }
  } else if (val === null) {
    pairs.push(encodeURIComponent(key));
  }
}

/**
 * // todo @ANKU @LOW - не работают с "bracket" (когда multiple test[]=value1&test[]=value2)
 *
 * @param params
 * @param url
 * @param hash
 * @returns {string}
 */
export function formatUrlParameters(params, url = '', hash = ''/* , useBracket = false */) {
  // const paramStr =
  //   queryString.stringify(params, { arrayFormat: useBracket ? 'bracket' : undefined })
  //   // todo @ANKU @LOW - @BUT_OUT queryString - они не кодируют # hash
  //   .replace(/#/g, '%23');
  // todo @ANKU @LOW @BUT_OUT @query-string - не умеет вложенные объекты парсить filters: { user: 'ivanovI' } to filters[user]=ivanovI
  // Поэтому взял решение у superagent
  const pairs = [];
  for (const key in params) {
    pushEncodedKeyValuePair(pairs, key, params[key]);
  }
  const paramStr = pairs.join('&');

  return `${url}${(url && paramStr && '?') || ''}${paramStr}${hash}`;
}

/**
 * Конкатинация кусков path (в переди всегда проставляется '/')
 *
 * @param paths - пути, который нужно объединить
 * Последним параметром может быть мапа queryParams которая преобразуется в строку
 * @returns {*}
 */
export function joinPath(...paths) {
  const lastUrlParameters = paths.length > 1 && paths[paths.length - 1];
  if (typeof lastUrlParameters === 'object') {
    // url parameters
    return formatUrlParameters(
      lastUrlParameters,
      joinPathInner('/', ...convertToString(...paths.slice(0, paths.length - 1))),
    );
  } else if (typeof lastUrlParameters === 'undefined' || lastUrlParameters === null) {
    return joinPathInner('/', ...convertToString(...paths.slice(0, paths.length - 1)));
  }

  return joinPathInner('/', ...convertToString(...paths));
}

/**
 * в отличии от joinPath не добавляет в начало / и не парсит параметры, просто конкатинирует части path
 * @param paths
 * @returns {string}
 */
export function joinPathSimple(...paths) {
  return joinPathInner(...convertToString(...paths));
}


/**
 * @deprecated - renaming - use joinPath
 *
 * @param paths
 * @returns {*}
 */
export function joinUri(...paths) {
  return joinPath(...paths);
}

export function getLocationUrlParameters(defaultValues = {}) {
  return typeof window !== 'undefined' && window.location
    ? parseUrlParameters(window.location.href, defaultValues)
    : proceedDefaultValues(defaultValues);
}

export function getLocationUrlParam(paramName, defaultValue, returnArray = false) {
  const paramValue = getLocationUrlParameters({
    [paramName]: defaultValue,
  })[paramName];

  return (Array.isArray(defaultValue) || returnArray) && !Array.isArray(paramValue) && paramValue
    ? [paramValue]
    : paramValue;
}

export function isFullUrl(uri) {
  return uri.indexOf('://') > 0;
}


export function updateHash(hash, affectHistory) {
  // eslint-disable-next-line no-param-reassign
  hash = hash
    ? hash.indexOf('#') === 0
      ? hash
      : `#${hash}`
    : '';

  if (history.pushState) {
    if (!hash) {
      // remove
      const loc = window.location;
      // remove hash in url without affecting history or forcing reload
      history[affectHistory ? 'pushState' : 'replaceState'](null, null, loc.pathname + loc.search);
    } else {
      history.pushState(null, null, hash);
    }
  } else if (affectHistory) {
    window.location.hash = hash;
  } else {
    window.location.replace(hash);
  }
}

export function getHash() {
  // return window.location.hash.slice(1);
  return window.location.hash.replace(/^#/, '');
}

export function updateLocationSearch(url, newQueryParams, assign = false) {
  const params = parseUrlParameters(url);
  if (assign) {
    // полностью заменит сложные объекты (к примеру, filters для таблицы
    Object.assign(params, newQueryParams);
  } else {
    merge(params, newQueryParams);
  }
  return `?${formatUrlParameters(params)}`;
}
export function updateWindowLocationQueryParams(newQueryParams, ...args) {
  if (typeof window !== 'undefined' && window.history.pushState) {
    window.history.pushState('', '', updateLocationSearch(window.location.href, newQueryParams, ...args));
  }
}

/**
 * Путь до ресурса с учетом префикса различных модулей для роутинг (без учета contextPath)
 *
 * @param relativeLocation - LocationDescription - @see model-location.js
 * @param moduleName
 * @param modulesPrefixes - мапа: moduleName => prefix
 * @returns {*}
 */
export function getModuleRoutePath(relativeLocation, moduleName = null, modulesPrefixes = {}) {
  const prefix = moduleName ? modulesPrefixes[moduleName] : null;

  if (typeof relativeLocation === 'object') {
    // location object
    return {
      ...relativeLocation,
      pathname: relativeLocation.pathname
        ? prefix
          ? joinPath(prefix, relativeLocation.pathname)
          : joinPath(relativeLocation.pathname)
        : undefined,
    };
  }
  return prefix
    ? joinPath(prefix, relativeLocation)
    : joinPath(relativeLocation || undefined);
}

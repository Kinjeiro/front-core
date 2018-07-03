/* eslint-disable no-undef */
import pathLib from 'path';
import forOwn from 'lodash/forOwn';
import queryString from 'query-string';

import { convertToString } from './common';

const pathModule = pathLib.posix || pathLib;

// на клиенте нет pahtLib.posix а на винде на сервере без posix будет неправильный урлы
const joinUriInner = pathModule.join;
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

export function parseUrlParameters(url, defaultValues = {}) {
  const extracted = queryString.extract(url);

  const params = queryString.parse(
    extracted,
    {
      arrayFormat: extracted.indexOf('[]=') >= 0
        ? 'bracket'
        : undefined,
    },
  );
  return {
    ...proceedDefaultValues(defaultValues),
    ...params,
  };
}

export function formatUrlParameters(params, url = '', hash = '', useBracket = false) {
  const paramStr =
    queryString.stringify(params, { arrayFormat: useBracket ? 'bracket' : undefined })
    // todo @ANKU @LOW - @BUT_OUT queryString - они не кодируют # hash
    .replace(/#/g, '%23');
  return `${url}${(url && paramStr && '?') || ''}${paramStr}${hash}`;
}

export function joinUri(...paths) {
  const lastUrlParameters = paths.length > 1 && paths[paths.length - 1];
  if (typeof lastUrlParameters === 'object') {
    // url parameters
    return formatUrlParameters(
      lastUrlParameters,
      joinUriInner('/', ...convertToString(...paths.slice(0, paths.length - 1))),
    );
  }

  return joinUriInner('/', ...convertToString(...paths));
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

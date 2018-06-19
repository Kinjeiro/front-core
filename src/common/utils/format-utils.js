import lodashGet from 'lodash/get';

import { formatDate } from './date-utils';

export const TYPES = {
  STRING: 'text',
  TEXT: 'textarea',
  DATE: 'date',
  DATETIME: 'datetime',
  NUMERIC: 'number',
  DECIMAL: 'number',
  BOOLEAN: 'checkbox',
  REFERENCE: 'radio',
  LIST: 'select',
  /* DYNAMIC,
   BINARY*/
};

/**
 *
 * @param str
 * @param args
 * - либо один параметр - мапа с параметрами ключ:значение
 * - либо остальные стринги \ намбер - последовательно добавляются
 * - последний параметр может быть функция реплейсмент (path,nonWordSeparator, type, mask, значение из мапы если есть, position, allString)
 *   важно использовать nonWordSeparator (пустое место до следующего элемента), ибо по умолчанию для функции оно не подставляется. Это нужно чтобы иметь возможность менять его в функции
 * @returns {*}
 */
export function formatString(str, ...args) {
  let strFinal = str;
  if (args.length) {
    let argsFinal = args;
    let itemFormatterFn = argsFinal[argsFinal.length - 1];
    if (typeof itemFormatterFn === 'function') {
      // последний параметр
      argsFinal = argsFinal.length > 1
        ? argsFinal.slice(0, argsFinal.length - 1)
        : [{}];
    } else {
      itemFormatterFn = null;
    }

    let params = argsFinal[0];
    let paramArray = null;
    let paramArrayIndex = 0;

    if (typeof params === 'string' || typeof params === 'number') {
      paramArray = argsFinal;
    }

    // 'Test mask {attr}, {innerObj.region} and {innerObj.birthday:date:dd.mm.yy}'
    strFinal = strFinal.replace(new RegExp('\\{([^}]+)\\}([:\\-!\\,\\. ]*)', 'g'), (match, key, nonWordSeparator, position, allString) => {
      const parts = key.split(':');
      const pathsStr = parts[0]; // может быть комплексным \ вложенным
      const type = parts[1];
      const mask = parts[2] || undefined;

      let value;
      if (paramArray) {
        value = isNaN(pathsStr)
          ? paramArray[paramArrayIndex++] // если у нас массив значений, а не мапа, но в шаблоне не цифры, то просто поочередно по своему индексу проставляем
          : paramArray[pathsStr];
      } else {
        value = lodashGet(params, pathsStr);
      }

      switch (type) {
        case TYPES.DATE:
          if (mask) {
            value = formatDate(value, mask);
          }
          break;
      }

      if (itemFormatterFn) {
        return itemFormatterFn(pathsStr, nonWordSeparator, type, mask, value, position, allString);
      }

      return value
        ? `${value}${nonWordSeparator}`
        : '';
    });
  }
  return strFinal;
}

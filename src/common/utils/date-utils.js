// todo @ANKU @LOW - @UP - вынести в core и брать настойки форматов из конфигов

// @guide - максимально инкапсулировать moment внутри этих утился, чтобы можно было менять
import moment from 'moment';

import clientConfig from '../client-config';
import i18n from './i18n-utils';

export const FORMATS = {
  JS_DATE: 'jsDate',
  ISO: 'iso',
  /**
   * @deprecated use TIMESTAMP_MILLISECONDS or UNIX_TIMESTAMP_SECONDS
   */
  TIMESTAMP: 'milliseconds', // in milliseconds
  TIMESTAMP_MILLISECONDS: 'milliseconds', // in milliseconds (like as date.getTime())
  UNIX_TIMESTAMP_SECONDS: 'unixTimestamp', // in seconds
};

// todo @ANKU @LOW - брать из clientConfig
export const SYSTEM_DATE_FORMAT =     clientConfig.common.features.date.systemDateFormat || FORMATS.TIMESTAMP_MILLISECONDS;
export const SYSTEM_DATETIME_FORMAT = clientConfig.common.features.date.systemDateTimeFormat || FORMATS.TIMESTAMP_MILLISECONDS;
export const DATE_FORMAT =            clientConfig.common.features.date.dateFormat || 'DD.MM.YYYY';
export const DATETIME_FORMAT =        clientConfig.common.features.date.dateTimeFormat || 'DD.MM.YYYY HH:mm';
export const SERVER_DATE_FORMAT =     clientConfig.common.features.date.serverDateFormat || FORMATS.TIMESTAMP_MILLISECONDS;
export const SERVER_DATETIME_FORMAT = clientConfig.common.features.date.serverDateTimeFormat || FORMATS.TIMESTAMP_MILLISECONDS;

export function normalizeDate(date, inputFormats = [DATETIME_FORMAT, DATE_FORMAT, FORMATS.ISO]) {
  let momentDate;

  if (typeof date === 'undefined' || date === null) {
    return date;
  }
  if (date === '') {
    return null;
  }

  if (typeof date === 'string') {
    const valueTrimmed = date.replace(/~+$/, '');

    if (!Array.isArray(inputFormats)) {
      // eslint-disable-next-line no-param-reassign
      inputFormats = [inputFormats];
    }

    inputFormats.some((inputFormat) => {
      let valueMoment;
      if (inputFormat === FORMATS.ISO || inputFormat === FORMATS.TIMESTAMP_MILLISECONDS || inputFormat === FORMATS.UNIX_TIMESTAMP_SECONDS) {
        valueMoment = moment(inputFormat === FORMATS.UNIX_TIMESTAMP_SECONDS ? valueTrimmed * 1000 : valueTrimmed);
      } else if (valueTrimmed.length === inputFormat.length) {
        // Проверяем, чтобы пользователь ввел полную строку даты без пробелов.
        valueMoment = moment(valueTrimmed, inputFormats, true);
      }

      if (valueMoment && valueMoment.isValid()) {
        momentDate = valueMoment;
        return true;
      }
      return false;
    });
  } else if (typeof date === 'number') {
    if (inputFormats === FORMATS.TIMESTAMP_MILLISECONDS) {
      momentDate = moment(date);
    } else if (inputFormats === FORMATS.UNIX_TIMESTAMP_SECONDS) {
      momentDate = moment(date * 1000);
    } else {
      let milliseconds = date;
      if (`${milliseconds}`.length <= 10) {
        milliseconds *= 1000;
      }
      momentDate = moment(milliseconds);
    }
  } else if (moment.isMoment(date)) {
    momentDate = date;
  } else if (moment(date).isValid()) {
    momentDate = moment(date);
  }

  if (!momentDate) {
    throw new Error(`${i18n('Не поддерживаемый формат для даты')} "${date}"`);
  }

  return momentDate;
}

export function parseDate(date, outputFormat = undefined, inputFormat) {
  const momentDate = normalizeDate(date, inputFormat);

  if (!momentDate) {
    return momentDate;
  }

  switch (outputFormat) {
    case FORMATS.TIMESTAMP_MILLISECONDS:
    case 'x':
      return momentDate.valueOf();
    case FORMATS.UNIX_TIMESTAMP_SECONDS:
      return momentDate.valueOf() / 1000;
    case FORMATS.ISO:
      return momentDate.toISOString();
    case FORMATS.JS_DATE:
      return momentDate.toDate();
    // если не задан формат - возвращаем moment дату
    case null:
    case undefined:
      return momentDate;
    default:
      return momentDate.format(outputFormat);
  }
}

export function formatDateToTimestamp(date, inputFormat = undefined) {
  if (typeof date === 'number' && typeof inputFormat === 'undefined') {
    return date;
  }
  return parseDate(date, FORMATS.TIMESTAMP_MILLISECONDS, inputFormat);
}
export function formatDateToIso(date, inputFormat) {
  return parseDate(date, FORMATS.ISO, inputFormat);
}

/*
 LTS  : 'h:mm:ss A',
 LT   : 'h:mm A',
 L    : 'MM/DD/YYYY',
 LL   : 'MMMM D, YYYY',
 LLL  : 'MMMM D, YYYY h:mm A',
 LLLL : 'dddd, MMMM D, YYYY h:mm A'
*/
export function formatDate(date, format = DATE_FORMAT) {
  return parseDate(date, format);
}

export function formatDateTime(date, format = DATETIME_FORMAT) {
  return parseDate(date, format);
}


export const DEFAULT_FORMAT_JS_DATE_OPTIONS = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};
// todo @ANKU @LOW - locale
export function formatJsDate(date, formatOptions = DEFAULT_FORMAT_JS_DATE_OPTIONS, locale = 'ru-Ru') {
  const jsDate = parseDate(date, FORMATS.JS_DATE);
  return jsDate && jsDate.toLocaleString(locale, formatOptions);
}

export function parseToSystem(momentData) {
  return parseDate(momentData, SYSTEM_DATE_FORMAT);
}

export function parseToServerFormat(momentData) {
  return parseDate(momentData, SERVER_DATE_FORMAT);
}

export function getCurrentTime() {
  return parseToSystem(Date.now());
}

export function fromNow(date, format = 'days') {
  return moment().diff(moment(date), format);
}

export function getLastDayInMonth(date) {
  const jsDate =  parseToSystem(date, FORMATS.JS_DATE);
  jsDate.setMonth(jsDate.getMonth() + 1);
  jsDate.setUTCDate(0);
  return date;
}


export function compareDate(dateA, dateB, withoutTime = true) {
  const momentDateA = normalizeDate(dateA);
  const momentDateB = normalizeDate(dateB);
  const filterParam = withoutTime ? 'day' : undefined;

  return ((momentDateA && !momentDateB) || (momentDateA && momentDateA.isAfter(momentDateB, filterParam)))
    ? 1
    : ((!momentDateA && !momentDateB) || (momentDateA && momentDateA.isSame(momentDateB, filterParam)))
      ? 0
      : -1;
}

export function isDateObject(value) {
  return value && (moment.isDate(value) || moment.isMoment(value));
}

export function isAnyDate(anyFormatDate) {
  try {
    const dateObj = normalizeDate(anyFormatDate);
    // todo @ANKU @LOW - как обойти проблемы хаком 1900 годом? А если у нас исторические приложения будут? =)))
    return !!dateObj && dateObj.year() > 1900; // иначе любое число подходит
  } catch (e) {
    return false;
  }
}

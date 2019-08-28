// todo @ANKU @LOW - @UP - вынести в core и брать настойки форматов из конфигов

// @guide - максимально инкапсулировать moment внутри этих утился, чтобы можно было менять
import moment from 'moment';

import clientConfig from '../client-config';
import i18n from './i18n-utils';

export const FORMATS = {
  ISO: 'iso',
  /**
   * @deprecated use MILLISECONDS or UNIX_TIMESTAMP_SECONDS
   */
  TIMESTAMP: 'timestamp', // in milliseconds
  MILLISECONDS: 'milliseconds', // in milliseconds (like as date.getTime())
  UNIX_TIMESTAMP_SECONDS: 'unixTimestamp', // in seconds
};

// todo @ANKU @LOW - брать из clientConfig
export const SYSTEM_DATE_FORMAT =     clientConfig.common.features.date.systemDateFormat || FORMATS.MILLISECONDS;
export const SYSTEM_DATETIME_FORMAT = clientConfig.common.features.date.systemDateTimeFormat || FORMATS.MILLISECONDS;
export const DATE_FORMAT =            clientConfig.common.features.date.dateFormat || 'DD.MM.YYYY';
export const DATETIME_FORMAT =        clientConfig.common.features.date.dateTimeFormat || 'DD.MM.YYYY HH:mm';
export const SERVER_DATE_FORMAT =     clientConfig.common.features.date.serverDateFormat || FORMATS.MILLISECONDS;
export const SERVER_DATETIME_FORMAT = clientConfig.common.features.date.serverDateTimeFormat || FORMATS.MILLISECONDS;

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
      if (inputFormat === FORMATS.ISO || inputFormat === FORMATS.MILLISECONDS || inputFormat === FORMATS.UNIX_TIMESTAMP_SECONDS) {
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
    if (inputFormats === FORMATS.MILLISECONDS) {
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
    case FORMATS.MILLISECONDS:
    case 'x':
      return momentDate.valueOf();
    case FORMATS.ISO:
      return momentDate.toISOString();
    // если не задан формат - возвращаем moment дату
    case null:
    case undefined:
      return momentDate;
    default:
      return momentDate.format(outputFormat);
  }
}

export function formatDateToTimestamp(date, inputFormat) {
  return parseDate(date, FORMATS.MILLISECONDS, inputFormat);
}
export function formatDateToIso(date, inputFormat) {
  return parseDate(date, FORMATS.ISO, inputFormat);
}

export function formatDate(date, format = DATE_FORMAT) {
  return parseDate(date, format);
}

export function formatDateTime(date, format = DATETIME_FORMAT) {
  return parseDate(date, format);
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

export function compareDate(dateA, dateB, withoutTime = true) {
  const momentDateA = normalizeDate(dateA);
  const filterParam = withoutTime ? 'day' : undefined;

  return ((momentDateA && !dateB) || (momentDateA && momentDateA.isAfter(dateB, filterParam)))
    ? 1
    : ((!momentDateA && !dateB) || momentDateA.isSame(dateB, filterParam))
      ? 0
      : -1;
}


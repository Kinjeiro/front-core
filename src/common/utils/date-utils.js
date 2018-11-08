// todo @ANKU @LOW - @UP - вынести в core и брать настойки форматов из конфигов

// @guide - максимально инкапсулировать moment внутри этих утился, чтобы можно было менять
import moment from 'moment';

import clientConfig from '../client-config';
import i18n from './i18n-utils';

export const FORMATS = {
  ISO: 'iso',
  TIMESTAMP: 'timestamp',
};

// todo @ANKU @LOW - брать из clientConfig
export const SYSTEM_DATE_FORMAT =     clientConfig.common.features.date.systemDateFormat || FORMATS.TIMESTAMP;
export const SYSTEM_DATETIME_FORMAT = clientConfig.common.features.date.systemDateTimeFormat || FORMATS.TIMESTAMP;
export const DATE_FORMAT =            clientConfig.common.features.date.dateFormat || 'DD.MM.YYYY';
export const DATETIME_FORMAT =        clientConfig.common.features.date.dateTimeFormat || 'DD.MM.YYYY HH:mm';
export const SERVER_DATE_FORMAT =     clientConfig.common.features.date.serverDateFormat || FORMATS.TIMESTAMP;
export const SERVER_DATETIME_FORMAT = clientConfig.common.features.date.serverDateTimeFormat || FORMATS.TIMESTAMP;

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
      inputFormats = [inputFormats];
    }

    inputFormats.some((inputFormat) => {
      let valueMoment;
      if (inputFormat === FORMATS.ISO || inputFormat === FORMATS.TIMESTAMP) {
        valueMoment = moment(valueTrimmed);
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
    // FORMATS.TIMESTAMP
    momentDate = moment(date);
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
    case FORMATS.TIMESTAMP:
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
  return parseDate(date, FORMATS.TIMESTAMP, inputFormat);
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

export function fromNow (date, format = 'days') {
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


/* eslint-disable no-param-reassign */
import merge from 'lodash/merge';

import { arrayContainsArray } from '../../common/utils/common';

import winstonLoggerFactory from '../libs/winston-logger';
import config from '../server-config';

const MILLISECONDS = 1000; // milliseconds in second
const NANOSECONDS = 1000 * 1000; // nanoseconds in millisecond

/**
 * Которые определены в конфигах
 */
export const DEFAULT_LOGGER_IDS = {
  FILE: 'fileLogger',
  CONSOLE: 'consoleLogger',
};

/*
 Если первый параметр не лог левел, то используем по умолчанию info
*/
function wrapWinstonLoggerToDefaultLog(winstonLogger, logLevelDefault = 'info') {
  const levelNames = Object.keys(winstonLogger.levels);
  const originalLog = winstonLogger.log;

  winstonLogger.log = (level, ...otherArgs) => {
    let levelsArray = level;
    if (!Array.isArray(level)) {
      levelsArray = [level];
    }

    if (arrayContainsArray(levelNames, levelsArray)) {
      originalLog.call(winstonLogger, level, ...otherArgs);
    } else {
      winstonLogger[logLevelDefault].call(winstonLogger, level, ...otherArgs);
    }
  };
}

export function loggerFactory(transportConfigs = null) {
  const transports = transportConfigs
    ? merge({}, config.server.features.logger.transports, transportConfigs)
    : config.server.features.logger.transports;

  if (Object.keys(transports).length) {
    const winstonLogger = winstonLoggerFactory(transports, config.server.features.logger.winston);
    if (winstonLogger) {
      wrapWinstonLoggerToDefaultLog(winstonLogger);
    }
    return winstonLogger;
  }

  return console;
}

function getFilePath(module) {
  // using filename in log statements
  return module.filename.split('/')
    .slice(-2)
    .join('/');
}

export function getLoggersWithFileLable(fileModule) {
  return loggerFactory({
    [DEFAULT_LOGGER_IDS.CONSOLE]: {
      label: getFilePath(fileModule),
    },
  });
}

export const defaultLogger = loggerFactory();

/*
 https://tools.ietf.org/html/rfc5424
 {
 error: 0,
 warn: 1,
 info: 2,
 verbose: 3,
 debug: 4,
 silly: 5
 }
 */

function endLog(start, level = 'log', ...logArgs) {
  const end = process.hrtime(start);
  const responseTime = (end[0] * MILLISECONDS) + (end[1] / NANOSECONDS);

  defaultLogger[level](['info', 'performance'], { responseTime }, ...logArgs);
}

export function logPromise(promise, options, ...logArgs) {
  const {
    isLogging = true,
    level = 'log',
  } = options;

  if (!isLogging) {
    return promise;
  }
  const start = process.hrtime();

  return promise
    .then((response) => {
      endLog(start, level, ...logArgs, response);
      return response;
    })
    .catch((err) => {
      endLog(start, level, ...logArgs, err);
      return err;
    });
}

export function logObject(object, keys, level = 'log', hidePassword = undefined) {
  defaultLogger[level](keys
    ? keys.reduce((resultObj, key) => {
      // eslint-disable-next-line no-param-reassign
      resultObj[key] = object[key];

      if (hidePassword) {
        const value = resultObj[key];

        if (hidePassword === true) {
          hidePassword = 'password';
        }

        if (key === hidePassword) {
          resultObj[key] = '********';
        } else if (value && typeof value === 'object' && value[hidePassword]) {
          resultObj[key][hidePassword] = '********';
        }
      }

      return resultObj;
      // const value = object[key];
      // if (typeof value === 'object') {
      //  resultObj.push(`${key}:`, value);
      // } else {
      //  resultObj.push(`${key}: ${value}`);
      // }
      // resultObj.push('\n');
      // return resultObj;
    }, {})
    : object,
  );
}

export default defaultLogger;

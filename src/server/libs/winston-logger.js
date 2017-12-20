import winston from 'winston';
import 'winston-logstash';

import { objectValues } from '../../common/utils/common';
import i18n from '../../common/utils/i18n-utils';

import { ensureDirectoryExistence } from '../utils/file-utils';

winston.emitErrs = true;

export default function loggerFactory(transportConfigs = null, winstonOptions = {}) {
  const transports = objectValues(transportConfigs)
    .reduce((result, transportConfig) => {
      if (transportConfig) {
        let WinstonTransportClass;
        switch (transportConfig.type) {
          case 'file': {
            WinstonTransportClass = winston.transports.File;
            ensureDirectoryExistence(transportConfig.filename);
            break;
          }
          case 'console': WinstonTransportClass = winston.transports.Console; break;
          case 'logstash': WinstonTransportClass = winston.transports.Logstash; break;
          // todo @ANKU @LOW - остальные типы
          default:
            throw new Error(i18n(`Неправильный тип логгера "${transportConfig.type}"`));
        }

        result.push(new WinstonTransportClass(transportConfig));
      }
      return result;
    }, []);


  return new winston.Logger({
    transports,
    ...winstonOptions,
  });
}

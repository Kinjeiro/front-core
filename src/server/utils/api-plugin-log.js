import logger, { logObject } from '../helpers/server-logger';
import { getCredentialsFromRequest } from './credentials-utils';

export default function pluginApiLog(apiRequest, apiConfig, prefixString = '', requestDataToString = null) {
  const {
    path,
    method,
  } = apiConfig;
  const {
    raw: {
      req: {
        connection: {
          remoteAddress,
        },
      },
    },
    query,
    payload,
  } = apiRequest;

  const credentials = getCredentialsFromRequest(apiRequest);

  const paramsStr = requestDataToString ? requestDataToString(query) : JSON.stringify(query);
  logger.log(`${prefixString ? `${prefixString} ` : ''}(${method}) ${path} userid ${credentials.getUserName() || '<NO USER>'} ${remoteAddress}: ${paramsStr}`);

  if (payload && Object.keys(payload).length) {
    let logPayload = payload;
    if (logPayload.password) {
      logPayload = {
        ...logPayload,
        password: '******',
      };
    }
    logger.debug('apiPluginLog payload: ');
    logObject(logPayload, null, 'debug');
  }
}

// export * from '../../../config/utils/create-config';

import clientConfig from '../client-config';
import { joinUri } from './uri-utils';

/**
 * Создание настроек для клиенской части и их роутинг через плагину на серверной
 *
 * @param path
 * @param method
 * @param payload
 * @returns {{method, path, payload}|*}
 */
export function createApiConfig(
  path,
  method = 'GET',
  payload
) {
  return {
    method,
    // /api/test-client-api/find
    path: joinUri('/', clientConfig.common.serverApiPrefix, '/', path),
    payload
  };
}

export default createApiConfig;

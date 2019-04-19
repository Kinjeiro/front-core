// export * from '../../../config/utils/create-config';

import clientConfig from '../client-config';
import {
  joinPath,
  isFullUrl,
} from './uri-utils';

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
  payload,
) {
  if (typeof path === 'object') {
    return path.method && path.path
      ? path
      : { method: 'GET', path: path.path };
  }

  return {
    method,
    // /api/test-client-api/find
    path: isFullUrl(path)
      ? path
      : path.search(new RegExp(`^/?${joinPath(clientConfig.common.serverApiPrefix, '/')}`)) === 0
        // уже апи префикс есть
        ? joinPath('/', path)
        : joinPath('/', clientConfig.common.serverApiPrefix, '/', path),
    payload,
  };
}

export default createApiConfig;

import i18n from '../../../common/utils/i18n-utils';

import serverConfig from '../../server-config';
import logger from '../../helpers/server-logger';

import checkPermissionDefault from './default';

export default function factoryCheckPermissionStrategy(servicesContext) {
  return async (apiRequest, permission, errorMsg) => {
    let isActionPermitted = true;
    const configPermissions = serverConfig.common.features.auth && serverConfig.common.features.auth.permissions;
    const authPermissionsTurnOn = serverConfig.common.features.auth && configPermissions !== false;

    if (authPermissionsTurnOn) {
      isActionPermitted = configPermissions.includes(permission)
        || await checkPermissionDefault(apiRequest, permission);
    }

    if (!isActionPermitted) {
      logger.error(errorMsg || i18n('core:Ошибка авторизации. Недостаточно прав'), permission);
      throw new Error(errorMsg || i18n(`Ошибка авторизации. Недостаточно прав "${permission}"`));
    }

    return isActionPermitted;
  };
}

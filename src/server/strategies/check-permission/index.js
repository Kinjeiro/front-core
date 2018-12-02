import i18n from '../../../common/utils/i18n-utils';

import logger from '../../helpers/server-logger';

import checkPermissionDefault from './default';

export default function factoryCheckPermissionStrategy(servicesContext) {
  return async (apiRequest, accessObject, errorMsg, notAuthCheck = false) => {
    // const configPermissions = serverConfig.common.features.auth && serverConfig.common.features.auth.permissions;
    // const authPermissionsTurnOn = serverConfig.common.features.auth && configPermissions !== false;
    const accessErrors = await checkPermissionDefault(apiRequest, accessObject);

    let error;
    if (!notAuthCheck && accessErrors === false) {
      error = errorMsg || i18n('core:Ошибка авторизации. Недостаточно прав');
    } else if (Array.isArray(accessErrors)) {
      error = errorMsg || accessErrors[0];
    }

    if (error) {
      logger.error('factoryCheckPermissionStrategy: ', error, accessObject);
      throw new Error(error);
    }

    return true;
  };
}

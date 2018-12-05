import clientConfig from '../../../../../common/client-config';
import { wrapToArray } from '../../../../../common/utils/common';

import { ADMIN } from '../roles';

import i18n from '../i18n';

export const DEFAULT_ACCESS_OBJECT = {
  rolesOr: [],
  rolesAnd: [],
  permissionsOr: [],
  permissionsAnd: [],
};

export function normalizeAccessObject(roles, permissions = null) {
  let result;
  if (typeof roles === 'object') {
    result = roles;
    if (permissions !== null) {
      result.permissionsOr = wrapToArray(permissions);
    }
  } else {
    result = {
      rolesOr: wrapToArray(roles),
      permissionsOr: wrapToArray(permissions),
    };
  }
  return {
    ...DEFAULT_ACCESS_OBJECT,
    ...result,
  };
}

/**
 * По умолчанию используется оператор OR (Или) то есть пользователю достаточно иметь хотя бы одну соотвествующую роль \ разрешение
 *
 * @param user
 * @param roles - либо массив ролей, либо объект accessObject (rolesOr: [], rolesAnd: [], permissionsOr: [], permissionsAnd: [])
 * @param permissions
 * @return boolean|Array - либо булеан, либо массив ошибок
 */
export function checkAccess(user, roles, permissions) {
  const isAuth = !!user;
  const authTurnOn = clientConfig.common.features.auth
    && clientConfig.common.features.auth.permissions;

  let allow = true;

  if (authTurnOn) {
    if (!isAuth) {
      allow = false;
    } else {
      const userRoles = wrapToArray(user.roles);
      const userPermissions = wrapToArray(user.permissions);

      if (userRoles.includes(ADMIN)) {
        allow = true;
      } else {
        const accessObject = normalizeAccessObject(roles, permissions);
        const {
          rolesOr,
          rolesAnd,
          permissionsOr,
          permissionsAnd,
        } = accessObject;

        const configPermissions = wrapToArray(clientConfig.common.permissions);

        const errors = [];
        if (rolesOr.length > 0 && !rolesOr.some((role) => userRoles.includes(role))) {
          errors.push(i18n('errors.notRolesOr', { roles: rolesOr.join(', ') }));
        }
        if (rolesAnd.length > 0 && !rolesAnd.some((role) => userRoles.includes(role))) {
          errors.push(i18n('errors.notRolesAnd', { roles: rolesAnd.join(', ') }));
        }
        if (
          permissionsOr.length > 0
          && !permissionsOr.some((permission) =>
          userPermissions.includes(permission) || configPermissions.includes(permission))
        ) {
          errors.push(i18n('errors.notPermissionsOr', { permissions: permissionsOr.join(', ') }));
        }
        if (permissionsAnd.length > 0
          && !permissionsAnd.some((permission) =>
            userPermissions.includes(permission) || configPermissions.includes(permission))
        ) {
          errors.push(i18n('errors.notPermissionsAnd', { permissions: permissionsAnd.join(', ') }));
        }
        if (errors.length > 0) {
          return errors;
        }
      }
    }
  }

  return allow;
}

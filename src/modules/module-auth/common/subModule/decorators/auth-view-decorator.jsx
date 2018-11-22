/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { push } from 'react-router-redux';

import {
  wrapToArray,
  executeVariable,
} from '../../../../../common/utils/common';
import { cutContextPath } from '../../../../../common/helpers/app-urls';
import clientConfig from '../../../../../common/client-config';
// import { createUniError } from '../../../../../common/models/uni-error';

import { PATH_ACCESS_DENIED } from '../../../../../common/routes.pathes';
import { getCurrentPath } from '../../../../../common/app-redux/selectors';
// import { actions as globalUniErrorActions } from '../../../../../common/app-redux/reducers/app/global-uni-error';
import { actions as lastUniErrorActions } from '../../../../../common/app-redux/reducers/app/last-uni-error';
import contextModules from '../../../../../common/contexts/ContextModules/decorator-context-modules';
import { notifyError } from '../../../../../common/helpers/notifications';

// ======================================================
// MODULE
// ======================================================
import i18n from '../i18n';
import { getUser } from '../redux-selectors';
import USER_PROP_TYPE from '../model-user';
import { ADMIN } from '../roles';

const DEFAULT_OPTIONS = {
  rolesOr: [],
  rolesAnd: [],
  permissionsOr: [],
  permissionsAnd: [],
  redirectNotAuth: null,
  redirectNotAccess: PATH_ACCESS_DENIED,
  afterAuthRedirect: null,
};

/**
 * Оборачивание компонентов для проверки авторизации, наличия ролей или permissions
 *
 * Последний параметр, если это object - рассматривается как options. Все перед ним это rolesOr
 * @param (...rolesOr, options)
 *
 * @param options
   - rolesOr: [], - у пользователя должна быть хоть одна из ролей
   - rolesAnd: [] - должны быть все роли
   - permissionsOr: [] - должно быть хоть одно разрещение (также учитываются глобальные конфиги clientConfig.common.permissions)
   - permissionsAnd: [] - должны быть все разрещение
   - redirectNotAuth: string || (getRoutePath, location) => string - если нет авторизации то по умолчанию бросается ошибка и показывается модалка авторизации, либо если задать эту переменную то переходит на другую страницу
   - redirectNotAccess: PATH_ACCESS_DENIED || string || (getRoutePath, location) => string- если не хватает каких-либо
   - afterAuthRedirect: null,

 @return {function(*)}

 Пример 1:
   @authView({
    permissionsOr: [TEST_PERMISSION],
    redirectNotAccess: (getRoutePath) => getRoutePath(PATH_STUB_INDEX, MODULE_NAME),
   })
   export default class AuthStubPageWithDecorators extends PureComponent {
    ...
   }

 Пример 2:
   const onlyAdmin = authView(ADMIN);
   export default function getRoutes(moduleRoutePrefix) {
      const {
        AuthStubPage,
      } = getComponents();

      return (
        <Route path="">
          <Route
            path="testAuth"
            components={ onlyAdmin(AuthStubPage) }
          />
        </Route>
      );
    }
 */
export default function authViewDecorator(...args) {
  let rolesOr;
  let options = { ...DEFAULT_OPTIONS };
  const lastArg = args[args.length - 1];
  if (typeof lastArg === 'object') {
    options = {
      ...options,
      ...lastArg,
    };
    rolesOr = args.length > 1
      ? args.slice(0, args.length - 2)
      : [];
  } else {
    rolesOr = args;
  }
  rolesOr = wrapToArray(rolesOr);

  const {
    rolesAnd,
    permissionsOr,
    permissionsAnd,
    redirectNotAuth,
    redirectNotAccess,
    afterAuthRedirect,
  } = options;

  const configPermissions = (Array.isArray(clientConfig.common.permissions) && clientConfig.common.permissions)
    || [];

  return (WrappedComponent) => {
    @contextModules()
    @connect(
      (globalState) => ({
        user: getUser(globalState),
        currentPath: getCurrentPath(globalState),
      }),
      {
        // actionChangeGlobalUniError: globalUniErrorActions.actionChangeGlobalUniError,
        actionThrowNotAuthError: lastUniErrorActions.actionThrowNotAuthError,
      },
    )
    class AuthViewWrapper extends Component {
      static propTypes = {
        // ======================================================
        // @connect
        // ======================================================
        user: USER_PROP_TYPE,
        currentPath: PropTypes.string,

        // actionChangeGlobalUniError: PropTypes.func,
        actionThrowNotAuthError: PropTypes.func,

        // ======================================================
        // @contextModules
        // ======================================================
        onGoTo: PropTypes.func,
        getRoutePath: PropTypes.func,
        location: PropTypes.object,
      };

      state = {
        allow: true,
      };

      // ======================================================
      // UTILS
      // ======================================================
      checkAllow(props = this.props) {
        const {
          user,
          // actionChangeGlobalUniError,
          actionThrowNotAuthError,
          currentPath,
          onGoTo,
          getRoutePath,
          location,
        } = props;

        let allow = true;

        const authTurnOn = clientConfig.common.features.auth
          && clientConfig.common.features.auth.permissions;

        if (authTurnOn) {
          const isAuth = !!user;
          if (!isAuth) {
            allow = false;
            if (redirectNotAuth) {
              const redirectNotAuthFinal = executeVariable(redirectNotAuth, null,
                getRoutePath,
                location,
              );
              onGoTo(cutContextPath(redirectNotAuthFinal));
            } else {
              // запускаем ошибку авторизации
              actionThrowNotAuthError(afterAuthRedirect || currentPath);
            }
          } else if (user.roles.includes(ADMIN)) {
            allow = true;
          } else {
            let error = null;
            if (rolesOr.length && !rolesOr.some((role) => user.roles.includes(role))) {
              error = i18n('containers.AuthCheckWrapper.notRoles', { roles: rolesOr.join(', ') });
            }
            if (!error && rolesAnd.length && !rolesAnd.some((role) => user.roles.includes(role))) {
              error = i18n('containers.AuthCheckWrapper.notRoles', { roles: rolesAnd.join(', ') });
            }
            if (!error && permissionsOr.length && !permissionsOr.some((permission) => user.permissions.includes(permission) || configPermissions.includes(permission))) {
              error = i18n('containers.AuthCheckWrapper.notPermissions', { permissions: permissionsOr.join(', ') });
            }
            if (!error && permissionsAnd.length && !permissionsAnd.some((permission) => user.permissions.includes(permission) || configPermissions.includes(permission))) {
              error = i18n('containers.AuthCheckWrapper.notPermissions', { permissions: permissionsAnd.join(', ') });
            }
            if (error) {
              allow = false;
              // actionChangeGlobalUniError(createUniError(i18n('У вас нет прав на просмотр страницы')));
              const redirectNotAccessFinal = executeVariable(redirectNotAccess, null,
                getRoutePath,
                location,
              );
              onGoTo(cutContextPath(redirectNotAccessFinal));
              notifyError(error);
            }
          }
        }
        return allow;
      }

      // ======================================================
      // LIFE CYCLE
      // ======================================================
      componentWillMount() {
        this.setState({
          allow: this.checkAllow(),
        });
      }
      componentWillReceiveProps(newProps) {
        // если мы остались и ждем атворизации
        if (newProps.user !== this.props.user) {
          this.setState({
            allow: this.checkAllow(),
          });
        }
      }

      // ======================================================
      // MAIN RENDER
      // ======================================================
      render() {
        const {
          allow,
        } = this.state;
        return allow && (
          <WrappedComponent { ...this.props } />
        );
      }
    }

    return AuthViewWrapper;
  };
}


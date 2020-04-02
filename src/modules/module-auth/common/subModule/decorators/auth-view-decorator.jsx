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
import { PATH_ACCESS_DENIED, PATH_MAIN_INDEX } from '../../../../../common/routes.pathes';
import { getCurrentPath } from '../../../../../common/app-redux/selectors';
// import { actions as globalUniErrorActions } from '../../../../../common/app-redux/reducers/app/global-uni-error';
import { actions as lastUniErrorActions } from '../../../../../common/app-redux/reducers/app/last-uni-error';
import contextModules from '../../../../../common/contexts/ContextModules/decorator-context-modules';
import { notifyError } from '../../../../../common/helpers/notifications';

// ======================================================
// MODULE
// ======================================================
import MODULE_NAME from '../module-name';
import { getUser } from '../redux-selectors';
import USER_PROP_TYPE from '../model-user';
import { checkAccess, DEFAULT_ACCESS_OBJECT } from '../helpers/access-object-utils';
import { PATH_AUTH_SIGNIN } from '../routes-paths-auth';

const DEFAULT_OPTIONS = {
  ...DEFAULT_ACCESS_OBJECT,
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

 Пример 2: - если будет logout то будет редрикет на страницу afterLogout
   export default function getRoutes(moduleRoutePrefix) {
      const {
        AuthStubPage,
      } = getComponents();

      return (
        <Route path="">
          <Route
            path="testAuth"
            components={ authView()(AuthStubPage) }
          />
        </Route>
      );
    }

 Пример 3: - толко админы могут попасть на страинцу
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

 Пример 4: - все дети будут показаны, только если есть залогинен пользователь
 const UserCheckWrapper = authView()();

 render() {
    const {
      children,
    } = this.props;

    return (
      <div className="ProjectApp">
        <UserCheckWrapper  { ...this.props }>
          { children }
        </UserCheckWrapper>
      </div>
    );
  }
 */

export default function authViewDecorator(...args) {
  let authOptions = { ...DEFAULT_OPTIONS };
  const lastArg = args[args.length - 1];
  if (typeof lastArg === 'object') {
    authOptions = {
      ...authOptions,
      ...lastArg,
      rolesOr: args.length > 1
        ? args.slice(0, args.length - 2)
        : [],
    };
  } else {
    authOptions.rolesOr = wrapToArray(args);
  }

  if (args.length === 0) {
    // ничего не подали - то это просто доступ залогиненого пользователя - при логауте будет редирект
    authOptions.redirectNotAuth = clientConfig.common.features.auth.paths.afterLogout || PATH_MAIN_INDEX;
  }

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
        // props
        // ======================================================
        children: PropTypes.node,

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
        allow: this.checkAllow(),
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

        const {
          rolesOr,
          rolesAnd,
          permissionsOr,
          permissionsAnd,
          redirectNotAuth,
          redirectNotAccess,
          afterAuthRedirect,
        } = authOptions;

        const accessErrors = checkAccess(user, {
          rolesOr,
          rolesAnd,
          permissionsOr,
          permissionsAnd,
        });

        if (accessErrors === true) {
          return true;
        }

        if (accessErrors === false) {
          // не авторизован
          if (redirectNotAuth) {
            const redirectNotAuthUrl = executeVariable(
              redirectNotAuth,
              null,
              getRoutePath,
              location,
            );
            let redirectNotAuthPath = cutContextPath(redirectNotAuthUrl);

            if (redirectNotAuthPath === PATH_MAIN_INDEX) {
              // если редиректят на индекс, а это он и есть - то есть индекс не доступен значит редиректить на логин
              redirectNotAuthPath = getRoutePath(PATH_AUTH_SIGNIN, MODULE_NAME);
            }

            onGoTo(redirectNotAuthPath);
          } else {
            // запускаем ошибку авторизации
            actionThrowNotAuthError(afterAuthRedirect || currentPath);
          }
        } else if (Array.isArray(accessErrors)) {
          // есть ошибки доступа
          // actionChangeGlobalUniError(createUniError(i18n('У вас нет прав на просмотр страницы')));
          const redirectNotAccessFinal = executeVariable(
            redirectNotAccess,
            null,
            getRoutePath,
            location,
          );
          onGoTo(cutContextPath(redirectNotAccessFinal));
          // todo @ANKU @LOW - может все ошибки показать?
          notifyError(accessErrors[0]);
        } else {
          throw new Error('Не поддерживающийся формат проверки прав');
        }
        return false;
      }

      // ======================================================
      // LIFE CYCLE
      // ======================================================
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
          children,
        } = this.props;
        const {
          allow,
        } = this.state;
        return allow && (
          WrappedComponent
            ? (
              <WrappedComponent { ...this.props } />
            )
            : children
        );
      }
    }

    return AuthViewWrapper;
  };
}


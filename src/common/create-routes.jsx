import React from 'react';
import {
  Route,
  IndexRoute,
  IndexRedirect,
} from 'react-router';

import moduleAuth from '../modules/module-auth/common/subModule';

import { executeVariable } from './utils/common';

import getComponents from './get-components';

import {
  CORE_ROUTES_NAMES,
} from './constants/routes.pathes';

export function renderCommonSubModule(moduleToRoutePrefixMap, commonSubModule) {
  const moduleName = commonSubModule.MODULE_NAME;
  // все кроме авторизации, так как она была раньше уже подключена
  if (moduleName === moduleAuth.MODULE_NAME) {
    return null;
  }

  const moduleRoutePath = moduleToRoutePrefixMap[moduleName];
  const subModuleRoutes = commonSubModule.getRoutes && executeVariable(commonSubModule.getRoutes(moduleRoutePath), null, moduleRoutePath);

  // если есть роуты добавляем их
  return moduleRoutePath && subModuleRoutes && (
    <Route
      key={ moduleName }
      path={ moduleRoutePath }
    >
      { subModuleRoutes }
    </Route>
  );
}

export default function createRoutes(
  store,
  ProjectLayoutComponent,
  indexRoute,
  options = {},
) {
  const {
    beforeRoutes = [],
    afterRoutes = [],
    authLayout,
    rootAppComponent,
    renderProjectLayoutComponent,

    commonSubModules = [],
    moduleToRoutePrefixMap = {},

    /**
     themeProviderProps: {},
     modulesProviderProps: {
        moduleToRoutePrefixMap: {}
      }
     */
    rootAppComponentProps = {},
  } = options;

  const {
    Info404,

    CoreApp,
    ErrorPage,

    AuthErrorContainer, // module-auth
  } = getComponents();

  /* <IndexRedirect to="stub" />, */

  const rootAppComponentPropsFinal = {
    ...rootAppComponentProps,
    modulesProviderProps: {
      moduleToRoutePrefixMap,
      ...rootAppComponentProps.modulesProviderProps,
    },
  };

  const RootComponent = rootAppComponent
    ? React.cloneElement(rootAppComponent, rootAppComponentPropsFinal)
    : ((props) => (
      <CoreApp
        { ...props }
        { ...rootAppComponentPropsFinal }
      />
    ));

  const subModules = commonSubModules.map(renderCommonSubModule.bind(null, moduleToRoutePrefixMap));

  return (
    <Route
      path="/"
      component={ RootComponent }
    >
      {
        beforeRoutes
      }

      {
        authLayout || (
          <Route
            path={ moduleToRoutePrefixMap[moduleAuth.MODULE_NAME] }
          >
            { moduleAuth.getRoutes() }
          </Route>
        )
      }

      <Route
        component={ AuthErrorContainer }
      >
        {
          renderProjectLayoutComponent
          ? (
            executeVariable(
              renderProjectLayoutComponent,
              null,
              subModules,
            )
          )
          : (
            <Route
              component={ ProjectLayoutComponent || (({ children }) => children) }
            >
              {
                typeof indexRoute === 'string'
                  ? (
                    <IndexRedirect to={ indexRoute } />
                  )
                  : (
                    <IndexRoute component={ indexRoute || (() => (<div />)) } />
                  )
              }
              { subModules }
            </Route>
          )
        }

        {
          afterRoutes
        }

        <Route
          path={ CORE_ROUTES_NAMES.ACCESS_DENIED }
          component={ ErrorPage }
        />
        <Route
          path={ CORE_ROUTES_NAMES.ERROR }
          component={ ErrorPage }
          showDetail={ true }
        />

        <Route
          path="*"
          exact={ true }
          component={ Info404 }
        />
      </Route>
    </Route>
  );
}

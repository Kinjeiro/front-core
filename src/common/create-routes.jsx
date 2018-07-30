import React from 'react';
import {
  Route,
  // IndexRoute,
  // IndexRedirect,
} from 'react-router';

import COMPONENTS_BASE from './components/ComponentsBase';

import {
  CORE_ROUTES_NAMES,
} from './constants/routes.pathes';

import getRouterAuth from './modules/module-auth/routes-auth';
import initAuthComponents from './modules/module-auth/components/init-components';

initAuthComponents(COMPONENTS_BASE);

export default function createRoutes(
  store,
  projectLayout,
  options = {},
) {
  const {
    CoreApp,
    ErrorPage,
    StubPage,
    AuthErrorContainer,
  } = require('./containers');

  const {
    beforeRoutes = [],
    afterRoutes = [],
    authLayout,
    rootAppComponent,
    /**
      themeProviderProps: {},
      modulesProviderProps: {
        moduleToRoutePrefixMap: {}
      }
     */
    rootAppComponentProps = {},
  } = options;

  /* <IndexRedirect to="stub" />, */

  const rootComponent = rootAppComponent || ((props) => (
    <CoreApp
      { ...props }
      { ...rootAppComponentProps }
    />
  ));

  /*
   <IndexRoute
   component={ TestPage }
   />
  */

  return (
    <Route
      path="/"
      component={ rootComponent }
    >
      {
        beforeRoutes
      }

      { authLayout }

      <Route
        component={ (props) => (
          <AuthErrorContainer
            { ...props }
          />
        ) }
      >
        { projectLayout }

        <Route
          path={ CORE_ROUTES_NAMES.STUB }
          component={ StubPage }
        />
      </Route>

      {
        !authLayout && (
          <Route
            path={ CORE_ROUTES_NAMES.auth }
          >
            { getRouterAuth(COMPONENTS_BASE) }
          </Route>
        )
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

      {
        afterRoutes
      }

      <Route
        path="*"
        exact={ true }
        component={ COMPONENTS_BASE.Info404 }
      />
    </Route>
  );
}

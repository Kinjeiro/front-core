import React from 'react';
import {
  Route,
  // IndexRoute,
  // IndexRedirect,
} from 'react-router';

import getComponents from './get-components';

import {
  CORE_ROUTES_NAMES,
} from './constants/routes.pathes';

import getRouterAuth from './modules/module-auth/routes-auth';

export default function createRoutes(
  store,
  projectLayout,
  options = {},
) {
  const {
    Info404,

    CoreApp,
    ErrorPage,
    StubPage,

    AuthErrorContainer, // module-auth
  } = getComponents();

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
            { getRouterAuth() }
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
        component={ Info404 }
      />
    </Route>
  );
}

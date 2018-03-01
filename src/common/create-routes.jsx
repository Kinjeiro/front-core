import React from 'react';
import { Route/* , IndexRoute, IndexRedirect*/ } from 'react-router';

import {
  Info404,
} from './components';

import {
  PATH_INDEX,
  PATH_ACCESS_DENIED,
  PATH_ERROR_PAGE,
  PATH_LOGIN_PAGE,
} from './constants/routes.pathes';

import Notice from './components/Notifications/Notice';

import {
  CoreApp,
  ErrorPage,
  LoginPage,
  StubPage,
  AuthErrorContainer,
} from './containers';

export default function createRoutes(
  store,
  projectLayout,
  options = {},
) {
  const {
    beforeRoutes = [],
    afterRoutes = [],
    authLayout,
    rootAppComponent,

    NoticeComponentClass = Notice,
    LoginPageComponentClass = LoginPage,
    ModalLoginPageComponentClass = LoginPageComponentClass,
  } = options;

  /* <IndexRedirect to="stub" />, */

  const rootComponent = rootAppComponent || ((props) => (
    <CoreApp
      { ...props }
      NoticeComponentClass={ NoticeComponentClass }
    />
  ));

  return (
    <Route
      path={ PATH_INDEX }
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
            LoginPageComponentClass={ ModalLoginPageComponentClass }
          />
        ) }
      >
        { projectLayout }

        <Route
          path="stub"
          component={ StubPage }
        />
      </Route>

      {
        !authLayout && (
          <Route
            path={ PATH_LOGIN_PAGE }
            component={ LoginPageComponentClass }
          />
        )
      }
      <Route
        path={ PATH_ACCESS_DENIED }
        component={ ErrorPage }
      />
      <Route
        path={ PATH_ERROR_PAGE }
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

import React from 'react';
import { Route , IndexRoute, IndexRedirect } from 'react-router';

import {
  Info404,
} from './components';

import {
  STUB_ROUTES_NAMES,
} from './constants/routes.pathes';

import Notice from './components/Notifications/Notice';

import {
  CoreApp,
  ErrorPage,
  LoginPage,
  StubPage,
  AuthErrorContainer,
} from './containers';
import TestPage from './containers/TestPage/TestPage';

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

  // beforeRoutes = (
  //   <IndexRoute
  //     component={ TestPage }
  //   />
  // );

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
            path={ STUB_ROUTES_NAMES.LOGIN }
            component={ LoginPageComponentClass }
          />
        )
      }
      <Route
        path={ STUB_ROUTES_NAMES.ACCESS_DENIED }
        component={ ErrorPage }
      />
      <Route
        path={ STUB_ROUTES_NAMES.ERROR }
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

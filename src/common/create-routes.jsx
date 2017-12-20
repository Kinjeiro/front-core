import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';

import {
  Info404,
} from './components';

import {
  PATH_ACCESS_DENIED,
  PATH_ERROR_PAGE,
  PATH_LOGIN_PAGE,
} from './constants/routes.pathes';

import {
  CoreApp,
  ErrorPage,
  LoginPage,
  StubPage,
} from './containers';

export default function createRoutes(store, afterServiceRoutes = [], beforeServiceRoutes = [], appComponent = CoreApp) {
  /* <IndexRedirect to="stub" />, */

  return (
    <Route path="/" component={ appComponent }>
      {
        beforeServiceRoutes
      }

      <Route
        path="stub"
        component={ StubPage }
      />
      <Route
        path={ PATH_LOGIN_PAGE }
        component={ LoginPage }
      />
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
        afterServiceRoutes
      }

      <Route
        path="*"
        exact={ true }
        component={ Info404 }
      />
    </Route>
  );
}

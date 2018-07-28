import React from 'react';
import {
  Route,
  IndexRedirect,
  // IndexRoute,
  // Redirect,
} from 'react-router';

import clientConfig from '../../client-config';

import * as paths from './routes-paths-auth';

import AuthLayout from './AuthLayout/AuthLayout';
import Signup from './Signup/Signup';
import Signin from './Signin/Signin';
import Forgot from './Forgot/Forgot';
import Reset from './Reset/Reset';

export default function getRouter() {
  return (
    <Route
      path=""
      component={ AuthLayout }
    >
      <IndexRedirect to={ paths.ROUTES_NAMES.signin } />
      {
        clientConfig.common.features.auth.allowSignup && (
          <Route
            path={ paths.ROUTES_NAMES.signup }
            component={ Signup }
          />
        )
      }
      <Route
        path={ paths.ROUTES_NAMES.signin }
        component={ Signin }
      />
      {
        clientConfig.common.features.auth.allowResetPasswordByEmail && (
          <Route
            path={ paths.ROUTES_NAMES.forgot }
            component={ Forgot }
          />
        )
      }
      {
        clientConfig.common.features.auth.allowResetPasswordByEmail && (
          <Route
            path={ paths.ROUTES_NAMES.reset }
            component={ Reset }
          />
        )
      }
    </Route>
  );
}

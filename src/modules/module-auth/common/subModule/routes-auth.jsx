import React from 'react';
import {
  Route,
  IndexRedirect,
  // IndexRoute,
  // Redirect,
} from 'react-router';

import clientConfig from '../../../../common/client-config';

import * as paths from './routes-paths-auth';
import getComponents from './get-components';

export default function getRoutes(/* moduleRoutePrefix */) {
  const {
    AuthPageLayout,
    // AuthFormLayout,
    AuthEnter,
    // Signup,
    // Signin,
    Forgot,
    Reset,
  } = getComponents();

  return (
    <Route
      component={ AuthPageLayout }
    >
      <IndexRedirect to={ paths.ROUTES_NAMES.signin } />
      {
        clientConfig.common.features.auth.allowSignup && (
          <Route
            path={ paths.ROUTES_NAMES.signup }
            component={ (props) => <AuthEnter { ...props } isSignup={ true } /> }
          />
        )
      }
      <Route
        path={ paths.ROUTES_NAMES.signin }
        component={ AuthEnter }
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

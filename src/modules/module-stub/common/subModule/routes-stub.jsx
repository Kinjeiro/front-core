import React from 'react';
import {
  Route,
  IndexRoute,
} from 'react-router';

import authView from '../../../module-auth/common/subModule/decorators/auth-view-decorator';
import { ADMIN } from '../../../module-auth/common/subModule/roles';

import getComponents from './get-components';

const onlyAdmin = authView(ADMIN);

export default function getRoutes(moduleRoutePrefix) {
  const {
    StubPage,
    AuthStubPage,
    AuthStubPageWithDecorators,
  } = getComponents();

  return (
    <Route path="">
      <IndexRoute
        component={ StubPage }
      />
      <Route
        path="testAuth"
        components={ onlyAdmin(AuthStubPage) }
      />
      <Route
        path="testAuth2"
        components={ AuthStubPageWithDecorators }
      />
    </Route>
  );
}

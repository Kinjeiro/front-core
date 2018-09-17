import React from 'react';
import {
  Route,
  IndexRoute,
} from 'react-router';

import getComponents from './get-components';

export default function getRoutes(moduleRoutePrefix) {
  const {
    StubPage,
  } = getComponents();

  return (
    <IndexRoute
      component={ StubPage }
    />
  );
}

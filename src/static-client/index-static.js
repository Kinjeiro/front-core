import React from 'react';
import ReactDOM from 'react-dom';
import { createMemoryHistory, match } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import createStore from '../common/app-redux/create-store';
import { initConfig } from '../common/client-config';

import Root from '../client/Root';

const PAGE_PATH = './server/plugins/pages/index';

// ======================================================
// CLIENT
// ======================================================
if (typeof window !== 'undefined') {
  // todo @ANKU @CRIT @MAIN - window.__data - передалть на константу
  // window.__data - данные преходящие с серверного рендеринга, смотри \src\server\plugins\pages\index.html.ejs
  const initialState = window.__data;
  // простановка конфигов для клиента с сервера - см \src\server\plugins\pages\index.jsx defaultState
  const config = initConfig({
    ...initialState.clientConfig,
    isServer: false,
  });

  if (!config.isServerSideRendering) {
    ReactDOM.render(
      <Root />,
      document.getElementById('react-app'),
    );
  }
}

// ======================================================
// SERVER
// ======================================================
// todo @ANKU @NORM - нужно тестировать
export default (locals, callback) => {
  const {
    path,
    state,
  } = locals;

  const memoryHistory = createMemoryHistory(path);
  // const memoryHistory = createMemoryHistory(request.originalUrl);
  const store = createStore(memoryHistory, {
    initState: state,
    isHotLoaderRequired: false,
  });
  const history = syncHistoryWithStore(memoryHistory, store);

  const additionalPath = locals.path !== '/'
    ? locals.path.split('/').slice(1).map(() => '../').join('')
    : '/';

  // require делаем, чтобы на клиенте это не использовалось
  const requestHandler = require(PAGE_PATH).createRequestHandler(
    (code) => callback(null, code),
    store,
    null,
    {
      staticAssets: true,
    },
    additionalPath,
  );

  match(
    {
      history,
      routes: createRoutes(store),
      location: path,
    },
    requestHandler,
  );
};

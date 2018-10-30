import {
  applyMiddleware,
  createStore as reduxCreateStore,
  compose,
  combineReducers,
} from 'redux';
import { routerMiddleware } from 'react-router-redux';
// import { browserHistory } from 'react-router';
// import thunk from 'redux-thunk';

/*
 todo @ANKU @LOW @BUG_OUT @redux-logger - Uncaught (in promise) TypeError: p[(p.length - 1)].lhs.hasOwnProperty is not a function #243
 wrong version diff for v2.0.4
 https://github.com/evgenyrodionov/redux-logger/issues/243
 https://github.com/thiamsantos/redux-logger/tree/ddiff
 import { createLogger } from 'redux-logger';
 "redux-logger": "git+https://github.com/thiamsantos/redux-logger.git#ddiff",
*/
/*
 не скомпилированная версия падает в браузерах
 import { createLogger } from 'redux-logger/src';
*/
import { createLogger } from './plugins/redux-logger';

import clientConfig from '../client-config';

import promiseMiddleware from './middlewares/promise-middleware';
import storePlugins from './plugins';

export function reloadReducers(store, rootReducer) {
  // require('./reducers/root').default
  store.replaceReducer(rootReducer);
}

export function getRootReducer(reducers) {
  return typeof reducers === 'object'
    ? combineReducers(reducers)
    : reducers;
}

export default function createStore(history, {
  initialState = {},
  // relative to app
  // todo @ANKU @CRIT @MAIN - проверить будет ли работать если не указать? то есть из под другого модуля запустить и на травить на этот путь?
  rootReducer = requier('./reducers/root'),
  customMiddlewares = [],
  customPlugins = [],
} = {}) {
  // ======================================================
  // MIDDLEWARES
  // ======================================================
  const middlewares = [
    // APP MIDDLEWARES
    promiseMiddleware,
  ];

  if (history) {
    middlewares.push(routerMiddleware(history));
  }
  middlewares.push(...customMiddlewares);

  if (clientConfig.common && !clientConfig.common.isServer && clientConfig.client.store.middlewares.logger) {
    // на сервере нам не нужен
    middlewares.push(createLogger({
      duration: true,
      collapsed: true,
      diff: true,
    }));
  }


  // ======================================================
  // COMPOSE ENHANCERS
  // ======================================================
  // подключаем redux devtool chrome extension
  // const composeEnhancers = (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
  const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;


  // ======================================================
  // CREATE STORE
  // ======================================================
  // создание нашего стора
  const store = reduxCreateStore(
    // все наши редьюсеры
    rootReducer,
    // начальное не пустое состояние (к примеру, если используем серверный рендеринг)
    initialState,
    // расширители стора
    composeEnhancers(
      applyMiddleware(...middlewares),
    ),
  );


  // ======================================================
  // STORE PLUGINS
  // ======================================================
  // применяем плагины к стору
  [
    ...storePlugins,
    ...customPlugins,
  ].forEach(plugin => plugin(store));

  return store;
}


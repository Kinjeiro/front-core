import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Router, applyRouterMiddleware } from 'react-router';
import useScroll from 'react-router-scroll/lib/useScroll';

// @guide - важно чтобы это было на первом месте, так как внутри идет инициализация i18n
import { getI18Instance } from '../common/utils/i18n-utils';
import I18NProvider from '../common/containers/I18NProvider/I18NProvider';
import getComponents from '../common/get-components';

import RootWithStore from './RootWithStore';

const { ErrorBoundary } = getComponents();

// это решение для react-router 2\3, для react-router 4\5 - https://github.com/rafrex/react-router-hash-link#readme
function hashLinkScroll() {
  if (typeof window !== 'undefined' && window.location) {
    const { hash } = window.location;
    if (hash) {
      // Push onto callback queue so it runs after the DOM is updated,
      // this is required when navigating from a different page so that
      // the element is rendered on the page before trying to getElementById.
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView();
        }
      }, 0);
    }
  }
}

// ======================================================
// CLIENT ROOT
// ======================================================
export default class Root extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object,
    routes: PropTypes.node,
  };

  static defaultProps = {
    history: null,
  };

  render() {
    const { store, history, routes } = this.props;

    // /*
    //   * todo @ANKU @LOW @BUG_OUT @react-hot-reload v3 - бага в том, что каждый раз перерисовывается
    //   * routes и падает ошибка "Warning: [react-router] You cannot change <Router routes>; it will be ignored"
    //   *
    //   * Существует 3 способа обхода:
    //   * 1) убрать routes в отдельный метод который вызывается только один раз
    //   * - не подходит так как нам нужно генерировать routes с поданным store для onEnter обработчиков
    //   *
    //   * 2) добавить <Router key={Math.random()} - чтобы счился уникальным
    //   * https://github.com/ReactTraining/react-router/issues/2704#issuecomment-256611906
    //   * - использует, хотя есть и другой способ
    //   *
    //   * 3) Добавить переменную конфигов и только с помощью нее обновлять
    //   * https://github.com/ReactTraining/react-router/issues/2704#issuecomment-261310093
    //   *
    //   * ИТОГО - 2)
    // */
    // if (!this.routeConfig) {
    //  this.routeConfig = getRoutes(store);
    // }

    return (
      <ErrorBoundary>
        <Provider store={ store } key="provider">
          <I18NProvider i18nInstance={ getI18Instance() }>
            <RootWithStore>
              <Router
                key={ Math.random() }
                history={ history }
                routes={ routes }
                render={ applyRouterMiddleware(useScroll()) }
                onUpdate={ hashLinkScroll }
              />
            </RootWithStore>
          </I18NProvider>
        </Provider>
      </ErrorBoundary>
    );
  }
}

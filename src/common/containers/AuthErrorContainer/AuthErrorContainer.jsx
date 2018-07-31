import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import { translateCore as i18n } from '../../utils/i18n-utils';
import clientConfig from '../../client-config';
import { pathGetLoginPage } from '../../constants/routes.pathes';
import {
  getLastUniError,
  getUser,
} from '../../app-redux/selectors';
// import { actions } from '../../app-redux/reducers/app/last-uni-error';

import COMPONENTS_BASE from '../../components/ComponentsBase';

import './AuthErrorContainer.css';

const {
  AuthFormLayout,
  AuthEnter,
} = COMPONENTS_BASE;

// eslint-disable-next-line no-unused-vars
const reLoginModalForm = clientConfig.common.features.auth.reLoginModalForm;

@connect(
  (globalState) => ({
    lastUniError: getLastUniError(globalState),
    user: getUser(globalState),
  }),
  {
    // ...actions,
    actionGoTo: push,
  },
)
export default class AuthErrorContainer extends Component {
  static propTypes = {
    children: PropTypes.node,
    // ======================================================
    // from router
    // ======================================================
    location: PropTypes.object,

    // ======================================================
    // CONNECT
    // ======================================================
    lastUniError: PropTypes.object,
    user: PropTypes.string,

    // actionClearLastError: PropTypes.func,
    actionGoTo: PropTypes.func,
  };

  static defaultProps = {
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentWillMount() {
  //   this.checkReload();
  // }
  // // componentDidMount() {
  // // }
  // componentWillReceiveProps(newProps) {
  //   if (newProps.lastUniError !== this.props.lastUniError) {
  //     this.checkReload(newProps);
  //   }
  // }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  handleGoToLogin() {
    const {
      // lastUniError,
      actionGoTo,
      location: {
        pathname,
        search,
        hash,
      },
      lastUniError: {
        linkForwardTo,
      },
    } = this.props;

    // if (!reLoginModalForm && lastUniError && lastUniError.isNotAuth) {
    actionGoTo(pathGetLoginPage(linkForwardTo || `${pathname}${search}${hash}`));
    // }
  }

  // ======================================================
  // RENDERS
  // ======================================================
  renderNeedReLoginOnIndexPage() {
    const {
      lastUniError: {
        uniMessage,
      },
    } = this.props;

    // todo @ANKU @LOW - можно сделать пропсы для текста отдельные
    return (
      <div className="AuthErrorContainer__goToLogin GoToLogin">
        <h3 className="GoToLogin__title">
          { uniMessage || i18n('containers.AuthErrorContainer.sessionExpire') }
        </h3>
        <button
          className="GoToLogin__action"
          onClick={ this.handleGoToLogin }
        >
          { i18n('containers.AuthErrorContainer.actionGoToLogin') }
        </button>
      </div>
    );
  }

  renderModalMessage() {
    const {
      lastUniError: {
        isNotAuth,
        linkForwardTo,
      },
    } = this.props;

    // todo @ANKU @LOW - можно заменить Логин на контрол переключения Логин \ Регистрации

    return isNotAuth && (
      <div className="AuthErrorContainer__modal">
        <div className="AuthErrorContainer__modalContent">
          {
            reLoginModalForm
              ? (
                <AuthFormLayout isModal={ true }>
                  <AuthEnter
                    { ...this.props }
                    isModal={ true }
                    urlReturn={ linkForwardTo || false }
                  />
                </AuthFormLayout>
              )
              : this.renderNeedReLoginOnIndexPage()
          }
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      lastUniError,
      children,
      user,
      // actionClearLastError,
    } = this.props;

    return (
      <div
        className="AuthErrorContainer"
        key={ user }
      >
        { lastUniError && this.renderModalMessage() }

        { children }
      </div>
    );
  }
}

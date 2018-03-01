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

import LoginPage from '../LoginPage/LoginPage';

import './AuthErrorContainer.css';

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
    LoginPageComponentClass: PropTypes.oneOfType([
      PropTypes.instanceOf(Component),
      PropTypes.func,
    ]),

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
    LoginPageComponentClass: LoginPage,
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
    } = this.props;

    // if (!reLoginModalForm && lastUniError && lastUniError.isNotAuth) {
    actionGoTo(pathGetLoginPage(`${pathname}${search}${hash}`));
    // }
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      lastUniError,
      children,
      user,
      LoginPageComponentClass,
      // actionClearLastError,
    } = this.props;

    return (
      <div
        className="AuthErrorContainer"
        key={ user }
      >
        {
          lastUniError && lastUniError.isNotAuth && (
            <div className="AuthErrorContainer__modal">
              <div className="AuthErrorContainer__modalContent">
                {
                  reLoginModalForm
                  ? (
                    <LoginPageComponentClass
                      { ...this.props }
                      inModal={ true }
                      urlReturn={ false }
                    />
                  )
                  // todo @ANKU @LOW - можно сделать пропсы для текста отдельные
                  : (
                    <div className="AuthErrorContainer__goToLogin GoToLogin">
                      <h3 className="GoToLogin__title">
                        { i18n('containers.AuthErrorContainer.sessionExpire') }
                      </h3>
                      <button
                        className="GoToLogin__action"
                        onClick={ this.handleGoToLogin }
                      >
                        { i18n('containers.AuthErrorContainer.actionGoToLogin') }
                      </button>
                    </div>
                  )
                }
              </div>
            </div>
          )
        }

        { children }
      </div>
    );
  }
}

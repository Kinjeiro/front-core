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
import * as reduxLastUniError from '../../app-redux/reducers/app/last-uni-error';

import COMPONENTS_BASE from '../../components/ComponentsBase';

import './AuthErrorContainer.css';

const {
  AuthFormLayout,
  AuthEnter,
  Modal,
} = COMPONENTS_BASE;

// eslint-disable-next-line no-unused-vars
const reLoginModalForm = clientConfig.common.features.auth.reLoginModalForm;

@connect(
  (globalState) => ({
    lastUniError: getLastUniError(globalState),
    user: getUser(globalState),
  }),
  {
    ...reduxLastUniError.actions,
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

    actionClearLastError: PropTypes.func,
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
      actionClearLastError,
    } = this.props;

    return isNotAuth && (
      <Modal onCancel={ () => actionClearLastError() }>
        {
          reLoginModalForm
            ? (
              <AuthFormLayout inModal={ true }>
                <AuthEnter
                  { ...this.props }
                  inModal={ true }
                  urlReturn={ linkForwardTo || false }
                />
              </AuthFormLayout>
            )
            : this.renderNeedReLoginOnIndexPage()
        }
      </Modal>
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

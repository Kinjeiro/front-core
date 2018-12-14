import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import clientConfig from '../../../../../../common/client-config';
import {
  getLastUniError,
  getUserId,
} from '../../../../../../common/app-redux/selectors';
import * as reduxLastUniError from '../../../../../../common/app-redux/reducers/app/last-uni-error';

// ======================================================
// MODULE
// ======================================================
import i18n from '../../i18n';
import { pathGetSigninPage } from '../../routes-paths-auth';

import getComponents from '../../get-components';

const {
  Modal,

  AuthFormLayout,
  AuthEnter,
} = getComponents();

require('./AuthErrorContainer.css');

// eslint-disable-next-line no-unused-vars
const reLoginModalForm = clientConfig.common.features.auth.reLoginModalForm;

/**
 * По ключу userId обновляет все, то если если пользователь сменится - все обновится
 */
@connect(
  (globalState) => ({
    lastUniError: getLastUniError(globalState),
    userId: getUserId(globalState),
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
    userId: PropTypes.string,

    actionClearLastError: PropTypes.func,
    actionGoTo: PropTypes.func,
  };

  static defaultProps = {
  };

  state = {
    authError: null,
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentWillMount() {
  //   this.checkReload();
  // }
  // // componentDidMount() {
  // // }
  componentWillReceiveProps(newProps) {
    const {
      lastUniError,
    } = newProps;
    if (lastUniError !== this.props.lastUniError) {
      this.setState({
        authError: lastUniError && lastUniError.isNotAuth ? lastUniError : null,
      });
    }
  }

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
    actionGoTo(pathGetSigninPage(linkForwardTo || `${pathname}${search}${hash}`));
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
      authError,
    } = this.state;

    return authError && (
      <Modal
        className="AuthModal"
        onCancel={ () => this.setState({ authError: null }) }
      >
        {
          reLoginModalForm
            ? (
              <AuthFormLayout inModal={ true }>
                <AuthEnter
                  { ...this.props }
                  inModal={ true }
                  urlReturn={ authError.linkForwardTo || false }
                  onSubmit={ () => this.setState({ authError: null }) }
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
      children,
      userId,
      // actionClearLastError,
    } = this.props;

    return (
      <div
        className="AuthErrorContainer"
        key={ userId }
      >
        { this.renderModalMessage() }

        { children }
      </div>
    );
  }
}

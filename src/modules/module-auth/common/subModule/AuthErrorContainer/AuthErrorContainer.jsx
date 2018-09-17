import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import { translateCore as i18n } from '../../../../../common/utils/i18n-utils';
import clientConfig from '../../../../../common/client-config';
import {
  getLastUniError,
  getUserId,
} from '../../../../../common/app-redux/selectors';
import * as reduxLastUniError from '../../../../../common/app-redux/reducers/app/last-uni-error';

import { pathGetSigninPage } from '../routes-paths-auth';

import getComponents from '../get-components';

const {
  Modal,

  AuthFormLayout,
  AuthEnter,
} = getComponents();

require('./AuthErrorContainer.css');

// eslint-disable-next-line no-unused-vars
const reLoginModalForm = clientConfig.common.features.auth.reLoginModalForm;

@connect(
  (globalState) => ({
    lastUniError: getLastUniError(globalState),
    username: getUserId(globalState),
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
    username: PropTypes.string,

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
    if (lastUniError !== this.props.lastUniError && lastUniError && lastUniError.isNotAuth) {
      this.setState({
        authError: lastUniError,
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
      <Modal onCancel={ () => this.setState({ authError: null }) }>
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
      username,
      // actionClearLastError,
    } = this.props;

    return (
      <div
        className="AuthErrorContainer"
        key={ username }
      >
        { this.renderModalMessage() }

        { children }
      </div>
    );
  }
}

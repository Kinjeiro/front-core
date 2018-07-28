import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import reduxSimpleForm from '../../../utils/decorators/react-class/redux-simple-form';
import titled from '../../../utils/decorators/react-class/titled';
import bemDecorator from '../../../utils/decorators/bem-component';
import i18n from '../../../utils/i18n-utils';
import clientConfig from '../../../client-config';

// ======================================================
// REDUX
// ======================================================
import {
  getUserInfo,
} from '../../../app-redux/selectors';
import * as reduxUserInfo from '../../../app-redux/reducers/app/user-info';
import * as reduxLastUniError from '../../../app-redux/reducers/app/last-uni-error';

// ======================================================
// COMPONENTS and STYLES
// ======================================================
import { ACTION_STATUS_PROPS } from '../../../models/index';

import Link from '../../../containers/Link/Link';
import ActionStatus from '../../../components/ActionStatus/ActionStatus';

import {
  PATH_INDEX,
  PARAM_RETURN_URL,
} from '../../../constants/routes.pathes';

import * as paths from '../routes-paths-auth';

// import './Signin.css';

const PAGE_ID = 'Signin';

@connect(
  (globalState, ownProps) => ({
    actionChangeUserStatus: getUserInfo(globalState).actionChangeUserStatus,
    urlReturn: typeof ownProps.urlReturn !== 'undefined'
      ? ownProps.urlReturn
      : ownProps.location.query[PARAM_RETURN_URL],
  }),
  {
    actionChangeUser: reduxUserInfo.actions.actionChangeUser,
    ...reduxLastUniError.actions,
    actionGoTo: push,
  },
)
@reduxSimpleForm(
  PAGE_ID,
  {
    username: '',
    password: '',
  },
)
// todo @ANKU @CRIT @MAIN - нужно для модалок не менять тайтл
@titled(PAGE_ID, i18n('core:pages.SigninPage.title'))
@bemDecorator({ componentName: 'Signin', wrapper: false })
export default class Signin extends Component {
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    onLogin: PropTypes.func,
    inModal: PropTypes.bool,

    // ======================================================
    // @reduxSimpleForm
    // ======================================================
    form: PropTypes.shape({
      username: PropTypes.string,
      password: PropTypes.string,
    }),
    onUpdateForm: PropTypes.func,

    // ======================================================
    // CONNECT
    // ======================================================
    actionChangeUserStatus: ACTION_STATUS_PROPS,
    actionChangeUser: PropTypes.func,
    actionGoTo: PropTypes.func,
    actionClearLastError: PropTypes.func,
    urlReturn: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
    ]),

    loginButtonClassName: PropTypes.string,
    loginCancelButtonClassName: PropTypes.string,
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  // componentWillMount() {
  // }
  // componentWillUnmount() {
  // }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  async handleLogin(event) {
    const {
      form: {
        username,
        password,
      },
      actionChangeUser,
      actionGoTo,
      urlReturn,
      onLogin,
      actionClearLastError,
    } = this.props;

    event.preventDefault();
    event.stopPropagation();

    // todo @ANKU @CRIT @MAIN - тут сначала срабатывает promise, и если ответ возвращается без кода ошибки то сработает сначала then а потом запарсится uniError
    await actionChangeUser(username, password);
    if (onLogin) {
      onLogin(username);
    }

    actionClearLastError();

    if (urlReturn !== false) {
      await actionGoTo(urlReturn || PATH_INDEX);
    }
  }

  // ======================================================
  // RENDERS
  // ======================================================
  renderForm() {
    const {
      form: {
        username,
        password,
      },
      onUpdateForm,
    } = this.props;

    return (
      <div className={ this.bem('fields') }>
        <div className={ this.bem('username') }>
          <span>{i18n('core:pages.SigninPage.fields.userNameLabel')}</span>
          <input
            name="username"
            value={ username }
            type="text"
            autoComplete="username"
            autoCorrect="off"
            spellCheck="false"
            autoCapitalize="off"
            autoFocus="autofocus"
            onChange={ (event) => onUpdateForm({ username: event.target.value }) }
          />
        </div>
        <div className={ this.bem('password') }>
          <span>{i18n('core:pages.SigninPage.fields.passwordLabel')}</span>
          <input
            name="password"
            type="password"
            value={ password }
            autoComplete="current-password"
            onChange={ (event) => onUpdateForm({ password: event.target.value }) }
          />
        </div>
      </div>
    );
  }

  renderActionCancel() {
    const {
      actionChangeUserStatus: {
        isFetching,
      },
      inModal,
      loginCancelButtonClassName,
      actionClearLastError,
    } = this.props;

    return inModal && (
      <button
        className={ `${this.bem('signin-cancel')} ${loginCancelButtonClassName || ''}` }
        disabled={ isFetching }
        onClick={ () => actionClearLastError() }
      >
        {i18n('core:pages.SigninPage.loginCancelButton')}
      </button>
    );
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      form: {
        username,
      },
      actionChangeUserStatus,
      inModal,
      loginButtonClassName,
      actionGoTo,
    } = this.props;

    return (
      <form
        className={ `${this.fullClassName} ${this.bem({ inModal })}` }
        onSubmit={ this.handleLogin }
      >
        { this.renderForm() }

        <div className={ this.bem('buttons') }>
          <button
            type="submit"
            className={ `${this.bem('submitButton')} ${loginButtonClassName || ''}` }
            disabled={ actionChangeUserStatus.isFetching || !username }
          >
            {i18n('core:pages.SigninPage.loginButton')}
          </button>

          {
            clientConfig.common.features.auth.allowSignup && (
              <button
                className={ this.bem('signupButton') }
                onClick={ () => actionGoTo(paths.PATH_AUTH_SIGNUP) }
              >
                {i18n('core:pages.SigninPage.signup')}
              </button>
            )
          }

          { this.renderActionCancel() }
        </div>

        {
          clientConfig.common.features.auth.allowResetPasswordByEmail && (
            <div className={ this.bem('forgotPassword') }>
              <Link
                onClick={ () => actionGoTo(paths.PATH_AUTH_FORGOT) }
              >
                {i18n('core:pages.SigninPage.forgotPassword')}
              </Link>
            </div>
          )
        }

        <ActionStatus actionStatus={ actionChangeUserStatus } />
      </form>
    );
  }
}

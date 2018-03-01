import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import bemDecorator from '../../utils/decorators/bem-component';
import i18n from '../../utils/i18n-utils';

// ======================================================
// REDUX
// ======================================================
import {
  getUserInfo,
  getForm,
} from '../../app-redux/selectors';
import * as reduxCurrentPage from '../../app-redux/reducers/app/current-page';
import * as reduxUserInfo from '../../app-redux/reducers/app/user-info';
import * as reduxLastUniError from '../../app-redux/reducers/app/last-uni-error';
import * as reduxUiForm from '../../app-redux/reducers/ui-domains/forms';

// ======================================================
// COMPONENTS and STYLES
// ======================================================
import { ACTION_STATUS_PROPS } from '../../models';

import {
  PATH_INDEX,
  PARAM_RETURN_URL,
} from '../../constants/routes.pathes';

const FORM_ID = 'formLogin';
const FORM_DEFAULT_VALUES = {
  username: '',
  password: '',
};
// import './LoginPage.css';

@connect(
  (globalState, ownProps) => ({
    form: getForm(globalState, FORM_ID) || FORM_DEFAULT_VALUES,
    actionChangeUserStatus: getUserInfo(globalState).actionChangeUserStatus,
    urlReturn: typeof ownProps.urlReturn !== 'undefined'
      ? ownProps.urlReturn
      : ownProps.location.query[PARAM_RETURN_URL],
  }),
  {
    actionCurrentPageChanged: reduxCurrentPage.actions.actionCurrentPageChanged,
    actionChangeUser: reduxUserInfo.actions.actionChangeUser,
    ...reduxLastUniError.actions,
    ...reduxUiForm.actions,
    actionGoTo: push,
  },
)
@bemDecorator({ componentName: 'LoginPage', wrapper: false })
export default class LoginPage extends Component {
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    onLogin: PropTypes.func,
    inModal: PropTypes.bool,

    // ======================================================
    // CONNECT
    // ======================================================
    form: PropTypes.shape({
      username: PropTypes.string,
      password: PropTypes.string,
    }),
    actionChangeUserStatus: ACTION_STATUS_PROPS,
    actionChangeUser: PropTypes.func,
    actionCurrentPageChanged: PropTypes.func,
    actionFormInit: PropTypes.func,
    actionFormUpdate: PropTypes.func,
    actionFormRemove: PropTypes.func,
    actionGoTo: PropTypes.func,
    actionClearLastError: PropTypes.func,
    urlReturn: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
    ]),

    loginButtonClassName: PropTypes.string,
  };

  // ======================================================
  // LIFECYCLE
  // ======================================================
  componentWillMount() {
    this.props.actionCurrentPageChanged({
      id: 'loginPage',
      title: i18n('core:pages.LoginPage.title'),
      description: i18n('core:pages.LoginPage.description'),
    });

    this.props.actionFormInit(FORM_ID, FORM_DEFAULT_VALUES);
  }
  componentWillUnmount() {
    this.props.actionFormRemove(FORM_ID);
  }

  // ======================================================
  // UTILS
  // ======================================================
  updateForm(data) {
    this.props.actionFormUpdate(FORM_ID, data);
  }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  handleChangeUserName(event) {
    this.updateForm({
      username: event.target.value,
    });
  }

  @bind()
  handleChangePassword(event) {
    this.updateForm({
      password: event.target.value,
    });
  }

  @bind()
  handleLogin(event) {
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
    actionChangeUser(username, password)
      .then(() => {
        if (onLogin) {
          onLogin();
        }

        actionClearLastError();

        if (urlReturn !== false) {
          return actionGoTo(urlReturn || PATH_INDEX);
        }
        return Promise.resolve();
      });
  }

  // ======================================================
  // RENDERS
  // ======================================================
  renderError() {
    const {
      actionChangeUserStatus: {
        isFetching,
        error,
      },
    } = this.props;

    const printMsg = error
      ? error.isNotFound
        ? i18n('core:errors.authServerNotResponse')
        : error.clientErrorMessage
      : '';

    return !isFetching && error && (
      <div className={ this.bem('error') }>
        { printMsg }
      </div>
    );
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      form: {
        username,
        password,
      },
      actionChangeUserStatus: {
        isFetching,
      },
      inModal,
      loginButtonClassName,
    } = this.props;

    return (
      <form
        className={ `${this.fullClassName} ${this.bem({ inModal })}` }
        onSubmit={ this.handleLogin }
      >
        <div className={ this.bem('fields') }>
          <div className={ this.bem('username') }>
            <span>{i18n('core:pages.LoginPage.userNameLabel')}</span>
            <input
              name="username"
              value={ username }
              type="text"
              autoComplete="username"
              autoCorrect="off"
              spellCheck="false"
              autoCapitalize="off"
              autoFocus="autofocus"
              onChange={ this.handleChangeUserName }
            />
          </div>
          <div className={ this.bem('password') }>
            <span>{i18n('core:pages.LoginPage.passwordLabel')}</span>
            <input
              name="password"
              type="password"
              value={ password }
              autoComplete="current-password"
              onChange={ this.handleChangePassword }
            />
          </div>
        </div>

        <div className={ this.bem('buttons') }>
          <button
            type="submit"
            className={ `${this.bem('login-button')} ${loginButtonClassName || ''}` }
            disabled={ isFetching || !username }
          >
            {i18n('core:pages.LoginPage.loginButton')}
          </button>
        </div>

        { this.renderError() }
      </form>
    );
  }
}

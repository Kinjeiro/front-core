import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import reduxSimpleForm from '../../../utils/decorators/react-class/redux-simple-form';
import titled from '../../../utils/decorators/react-class/titled';
import bemDecorator from '../../../utils/decorators/bem-component';
import i18n from '../../../utils/i18n-utils';

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

import ActionStatus from '../../../components/ActionStatus/ActionStatus';
import {
  PATH_INDEX,
  PARAM_RETURN_URL,
} from '../../../constants/routes.pathes';

import * as paths from '../routes-paths-auth';

// import './LoginPage.css';

const PAGE_ID = 'Signup';

@connect(
  (globalState, ownProps) => ({
    actionSignupStatus: getUserInfo(globalState).actionSignupStatus,
    urlReturn: typeof ownProps.urlReturn !== 'undefined'
      ? ownProps.urlReturn
      : ownProps.location.query[PARAM_RETURN_URL],
  }),
  {
    ...reduxUserInfo.actions,
    ...reduxLastUniError.actions,
    actionGoTo: push,
  },
)
@reduxSimpleForm(
  PAGE_ID,
  {
    username: '',
    password: '',
    email: '',
    displayName: '',
  },
)
@titled(PAGE_ID, i18n('core:pages.SignupPage.title'))
@bemDecorator({ componentName: 'SignupPage', wrapper: false })
export default class LoginPage extends Component {
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
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
    actionSignupStatus: ACTION_STATUS_PROPS,
    actionSignup: PropTypes.func,
    actionGoTo: PropTypes.func,
    actionClearLastError: PropTypes.func,
    urlReturn: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
    ]),
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
  async handleSubmit(event) {
    const {
      form,
      actionSignup,
      actionGoTo,
      urlReturn,
      actionClearLastError,
    } = this.props;

    event.preventDefault();
    event.stopPropagation();

    // todo @ANKU @CRIT @MAIN - тут сначала срабатывает promise, и если ответ возвращается без кода ошибки то сработает сначала then а потом запарсится uniError
    await actionSignup(form);

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
        email,
        displayName,
      },
      onUpdateForm,
    } = this.props;

    return (
      <div className={ this.bem('fields') }>
        <div className={ this.bem('username') }>
          <span>{i18n('core:pages.SignupPage.fields.username')}</span>
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
          <span>{i18n('core:pages.SignupPage.fields.password')}</span>
          <input
            name="password"
            type="password"
            value={ password }
            autoComplete="current-password"
            onChange={ (event) => onUpdateForm({ password: event.target.value }) }
          />
        </div>
        <div className={ this.bem('email') }>
          <span>{i18n('core:pages.SignupPage.fields.email')}</span>
          <input
            name="email"
            type="email"
            value={ email }
            onChange={ (event) => onUpdateForm({ email: event.target.value }) }
          />
        </div>
        <div className={ this.bem('displayName') }>
          <span>{i18n('core:pages.SignupPage.fields.displayName')}</span>
          <input
            name="displayName"
            type="text"
            value={ displayName }
            onChange={ (event) => onUpdateForm({ displayName: event.target.value }) }
          />
        </div>
      </div>
    );
  }

  renderActionCancel() {
    const {
      actionSignupStatus: {
        isFetching,
      },
      inModal,
      actionClearLastError,
    } = this.props;

    return inModal && (
      <button
        className={ `${this.bem('cancel-button')}` }
        disabled={ isFetching }
        onClick={ () => actionClearLastError() }
      >
        {i18n('core:pages.SignupPage.cancelButton')}
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
      actionSignupStatus,
      inModal,
    } = this.props;

    return (
      <form
        className={ `${this.fullClassName} ${this.bem({ inModal })}` }
        onSubmit={ this.handleSubmit }
      >
        { this.renderForm() }

        <div className={ this.bem('buttons') }>
          <button
            type="submit"
            className={ `${this.bem('submit-button')}` }
            disabled={ actionSignupStatus.isFetching || !username }
          >
            {i18n('core:pages.SignupPage.submitButton')}
          </button>

          { this.renderActionCancel() }
        </div>

        <ActionStatus actionStatus={ actionSignupStatus } />
      </form>
    );
  }
}

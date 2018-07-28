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

import { ACTION_STATUS_PROPS } from '../../../models/index';

import ActionStatus from '../../../components/ActionStatus/ActionStatus';
import Link from '../../../containers/Link/Link';

import {
  PATH_INDEX,
} from '../../../constants/routes.pathes';

import * as paths from '../routes-paths-auth';

// import './LoginPage.css';

const PAGE_ID = 'Reset';

@connect(
  (globalState, ownProps) => ({
    actionResetPasswordStatus: getUserInfo(globalState).actionResetPasswordStatus,
    resetPasswordToken: ownProps.location.query[paths.PARAM__RESET_PASSWORD_TOKEN],
  }),
  {
    ...reduxUserInfo.actions,
    actionGoTo: push,
  },
)
@reduxSimpleForm(
  PAGE_ID,
  {
    newPassword: '',
  },
)
@titled(PAGE_ID, i18n('core:pages.ResetPage.title'))
@bemDecorator({ componentName: 'Reset', wrapper: false })
export default class ResetPage extends Component {
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    // todo @ANKU @CRIT @MAIN - emailOptions
    emailOptions: PropTypes.shape({
    }),

    // ======================================================
    // @reduxSimpleForm
    // ======================================================
    form: PropTypes.shape({
      newPassword: PropTypes.string,
    }),
    onUpdateForm: PropTypes.func,

    // ======================================================
    // CONNECT
    // ======================================================
    resetPasswordToken: PropTypes.string.required,
    actionResetPasswordStatus: ACTION_STATUS_PROPS,
    actionResetPassword: PropTypes.func,
    actionGoTo: PropTypes.func,
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
      resetPasswordToken,
      form: {
        newPassword,
      },
      emailOptions,
      actionResetPassword,
    } = this.props;

    event.preventDefault();
    event.stopPropagation();

    await actionResetPassword(resetPasswordToken, newPassword, emailOptions);
  }

  // ======================================================
  // RENDERS
  // ======================================================
  renderForm() {
    const {
      form: {
        newPassword,
      },
      onUpdateForm,
    } = this.props;

    return (
      <div className={ this.bem('fields') }>
        <div className={ this.bem('newPassword') }>
          <span>{i18n('core:pages.ResetPage.fields.newPassword')}</span>
          <input
            name="newPassword"
            type="password"
            value={ newPassword }
            onChange={ (event) => onUpdateForm({ newPassword: event.target.value }) }
          />
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      form: {
        newPassword,
      },
      actionResetPasswordStatus,
    } = this.props;

    return (
      <form
        className={ this.fullClassName }
        onSubmit={ this.handleSubmit }
      >
        <ActionStatus
          actionStatus={ actionResetPasswordStatus }
          textSuccess={ i18n('core:pages.ResetPage.submitSuccessMessage') }
        >
          <div className={ this.bem('form') }>
            { this.renderForm() }

            <div className={ this.bem('buttons') }>
              <button
                type="submit"
                className={ `${this.bem('submit-button')}` }
                disabled={ actionResetPasswordStatus.isFetching || !newPassword }
              >
                {i18n('core:pages.ResetPage.submitButton')}
              </button>
            </div>
          </div>
        </ActionStatus>
      </form>
    );
  }
}

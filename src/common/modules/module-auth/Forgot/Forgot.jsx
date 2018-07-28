import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import reduxSimpleForm from '../../../utils/decorators/react-class/redux-simple-form';
import titled from '../../../utils/decorators/react-class/titled';
import bemDecorator from '../../../utils/decorators/bem-component';
import i18n from '../../../utils/i18n-utils';
import { getFullUrl } from '../../../helpers/app-urls';

// ======================================================
// REDUX
// ======================================================
import {
  getUserInfo,
} from '../../../app-redux/selectors';
import * as reduxUserInfo from '../../../app-redux/reducers/app/user-info';

// ======================================================
// COMPONENTS and STYLES
// ======================================================
import { ACTION_STATUS_PROPS } from '../../../models/index';
import ActionStatus from '../../../components/ActionStatus/ActionStatus';

// import {
//   PATH_INDEX,
// } from '../../../constants/routes.pathes';

import * as paths from '../routes-paths-auth';

// import './ForgotPage.css';

const PAGE_ID = 'Forgot';

@connect(
  (globalState) => ({
    actionForgotPasswordStatus: getUserInfo(globalState).actionForgotPasswordStatus,
  }),
  {
    ...reduxUserInfo.actions,
    // actionGoTo: push,
  },
)
@reduxSimpleForm(
  PAGE_ID,
  {
    email: '',
  },
)
@titled(PAGE_ID, i18n('core:pages.ForgotPage.title'))
@bemDecorator({ componentName: 'Forgot', wrapper: false })
export default class Forgot extends Component {
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    // todo @ANKU @LOW - emailOptions
    emailOptions: PropTypes.object,

    // ======================================================
    // @reduxSimpleForm
    // ======================================================
    form: PropTypes.shape({
      email: PropTypes.string,
    }),
    onUpdateForm: PropTypes.func,

    // ======================================================
    // CONNECT
    // ======================================================
    actionForgotPasswordStatus: ACTION_STATUS_PROPS,
    actionForgotPassword: PropTypes.func,
    // actionGoTo: PropTypes.func,
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
      form: {
        email,
      },
      emailOptions,
      actionForgotPassword,
      // actionGoTo,
    } = this.props;

    event.preventDefault();
    event.stopPropagation();

    return actionForgotPassword(
      email,
      getFullUrl(paths.PATH_AUTH_RESET),
      emailOptions,
    );
    // await actionGoTo(PATH_INDEX);
  }

  // ======================================================
  // RENDERS
  // ======================================================
  renderForm() {
    const {
      form: {
        email,
      },
      onUpdateForm,
    } = this.props;

    return (
      <div className={ this.bem('fields') }>
        <div className={ this.bem('email') }>
          <span>{i18n('core:pages.ForgotPage.fields.email')}</span>
          <input
            name="email"
            value={ email }
            type="email"
            onChange={ (event) => onUpdateForm({ email: event.target.value }) }
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
        email,
      },
      actionForgotPasswordStatus,
    } = this.props;

    return (
      <form
        className={ this.fullClassName }
        onSubmit={ this.handleSubmit }
      >
        <ActionStatus
          actionStatus={ actionForgotPasswordStatus }
          textSuccess={
            <div
              dangerouslySetInnerHTML={{
                __html: i18n(
                  'core:pages.ForgotPage.submitSuccessMessage',
                  {
                    email: `<b className="${this.bem('email-text')}">${email}</b>`,
                    // interpolation: {escapeValue: false},
                  },
                ),
              }}
            />
          }
        >
          <div className={ this.bem('form') }>
            { this.renderForm() }

            <div className={ this.bem('buttons') }>
              <button
                type="submit"
                className={ `${this.bem('submit-button')}` }
                disabled={ actionForgotPasswordStatus.isFetching || !email }
              >
                {i18n('core:pages.ForgotPage.submitButton')}
              </button>
            </div>
          </div>
        </ActionStatus>
      </form>
    );
  }
}

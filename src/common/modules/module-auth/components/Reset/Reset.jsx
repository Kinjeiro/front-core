import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import reduxSimpleForm from '../../../../utils/decorators/react-class/redux-simple-form';
import titled from '../../../../utils/decorators/react-class/titled';
import bemDecorator from '../../../../utils/decorators/bem-component';
import i18n from '../../../../utils/i18n-utils';

// ======================================================
// REDUX
// ======================================================
import {
  getUserInfo,
} from '../../../../app-redux/selectors';
import * as reduxUserInfo from '../../../../app-redux/reducers/app/user-info';

import { ACTION_STATUS_PROPS } from '../../../../models/index';
import {
  SUB_TYPES,
} from '../../../../models/model-field';

import COMPONENTS_BASE from '../../../../components/ComponentsBase';

// import {
//   PATH_INDEX,
// } from '../../../constants/routes.pathes';

import * as paths from '../../routes-paths-auth';

// import './ForgotPage.css';

const { Form } = COMPONENTS_BASE;

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
  static PAGE_ID = PAGE_ID;
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
  async handleSubmit() {
    const {
      resetPasswordToken,
      form: {
        newPassword,
      },
      emailOptions,
      actionResetPassword,
    } = this.props;

    await actionResetPassword(resetPasswordToken, newPassword, emailOptions);
  }

  // ======================================================
  // RENDERS
  // ======================================================
  isValid() {
    const {
      form: {
        newPassword,
      },
    } = this.props;

    return !!(newPassword);
  }

  getFields() {
    const {
      form: {
        newPassword,
      },
    } = this.props;
    return [
      {
        name: 'newPassword',
        subType: SUB_TYPES.PASSWORD,
        value: newPassword,
        instanceChange: true,
      },
    ];
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      onUpdateForm,
      actionResetPasswordStatus,
    } = this.props;

    return (
      <Form
        id={ PAGE_ID }
        className={ this.fullClassName }
        i18nFieldPrefix={ 'core:pages.ResetPage.fields' }

        fields={ this.getFields() }
        onChangeField={ onUpdateForm }

        isValid={ this.isValid() }
        useForm={ true }

        onSubmit={ this.handleSubmit }
        textActionSubmit={ i18n('core:pages.ResetPage.submitButton') }

        actionStatus={ actionResetPasswordStatus }
        textActionSuccess={ i18n('core:pages.ResetPage.submitSuccessMessage') }
      />
    );
  }
}

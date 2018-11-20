import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import reduxSimpleForm from '../../../../../../common/utils/decorators/react-class/redux-simple-form';
import titled from '../../../../../../common/utils/decorators/react-class/titled';
import bemDecorator from '../../../../../../common/utils/decorators/bem-component';
import appUrl from '../../../../../../common/helpers/app-urls';

// ======================================================
// REDUX
// ======================================================
import {
  getUserInfo,
} from '../../../../../../common/app-redux/selectors';
import * as reduxUserInfo from '../../redux-user-info';
import { ACTION_STATUS_PROPS } from '../../../../../../common/models/index';
import {
  SUB_TYPES,
} from '../../../../../../common/models/model-field';
import {
  PATH_INDEX,
} from '../../../../../../common/constants/routes.pathes';

import getCb from '../../../../../../common/get-components';

// ======================================================
// MODULE
// ======================================================
import i18n, { NAMESPACE } from '../../i18n';
import * as paths from '../../routes-paths-auth';
// import './ForgotPage.css';

const {
  Form,
  // Link,
} = getCb();

export const PAGE_ID = 'Reset';

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
@titled(PAGE_ID, i18n('pages.ResetPage.title'))
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
        i18nFieldPrefix={ `${NAMESPACE}:pages.ResetPage.fields` }

        fields={ this.getFields() }
        onChangeField={ onUpdateForm }

        isValid={ this.isValid() }
        useForm={ true }

        onSubmit={ this.handleSubmit }
        textActionSubmit={ i18n('pages.ResetPage.submitButton') }

        actionStatus={ actionResetPasswordStatus }
        textActionSuccess={ (
          <div className={ this.bem('ActionSuccess') }>
            <p>
              { i18n('pages.ResetPage.submitSuccessMessage') }
            </p>
            <a href={ appUrl(PATH_INDEX) }>
              { i18n('pages.ResetPage.goToIndexPage') }
            </a>
          </div>
        ) }
      />
    );
  }
}

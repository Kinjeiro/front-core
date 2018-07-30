import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import reduxSimpleForm from '../../../../utils/decorators/react-class/redux-simple-form';
import titled from '../../../../utils/decorators/react-class/titled';
import bemDecorator from '../../../../utils/decorators/bem-component';
import i18n from '../../../../utils/i18n-utils';
import { getFullUrl } from '../../../../helpers/app-urls';

// ======================================================
// REDUX
// ======================================================
import {
  getUserInfo,
} from '../../../../app-redux/selectors';
import * as reduxUserInfo from '../../../../app-redux/reducers/app/user-info';

// ======================================================
// COMPONENTS and STYLES
// ======================================================
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
  async handleSubmit() {
    const {
      form: {
        email,
      },
      emailOptions,
      actionForgotPassword,
      // actionGoTo,
    } = this.props;

    return actionForgotPassword(
      email,
      getFullUrl(paths.PATH_AUTH_RESET),
      emailOptions,
    );
    // await actionGoTo(PATH_INDEX);
  }

  // ======================================================
  // RENDER
  // ======================================================
  isValid() {
    const {
      form: {
        email,
      },
    } = this.props;

    return !!(email);
  }

  getFields() {
    const {
      form: {
        email,
      },
    } = this.props;
    return [
      {
        name: 'email',
        subType: SUB_TYPES.EMAIL,
        value: email,
        instanceChange: true,
      },
    ];
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      form: {
        email,
      },
      onUpdateForm,
      actionForgotPasswordStatus,
    } = this.props;

    return (
      <Form
        className={ this.fullClassName }
        i18nFieldPrefix={ 'core:pages.ForgotPage.fields' }

        fields={ this.getFields() }
        onChangeField={ onUpdateForm }

        isValid={ this.isValid() }
        useForm={ true }

        onSubmit={ this.handleSubmit }
        textActionSubmit={ i18n('core:pages.ForgotPage.submitButton') }

        actionStatus={ actionForgotPasswordStatus }
        textActionSuccess={
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
      />
    );
  }
}

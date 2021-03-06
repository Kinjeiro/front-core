import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import reduxSimpleForm from '../../../../../../common/utils/decorators/react-class/redux-simple-form';
import bemDecorator from '../../../../../../common/utils/decorators/bem-component';
import clientConfig from '../../../../../../common/client-config';
import {
  getUserInfo,
} from '../../../../../../common/app-redux/selectors';
import {
  ACTION_STATUS_PROPS,
} from '../../../../../../common/models/index';

// ======================================================
// OTHER_MODULES
// ======================================================
import {
  FIELD_SUB_TYPES,
} from '../../../../../feature-ui-form/common/subModule/model-field';

// ======================================================
// MODULE
// ======================================================
import i18n, { NAMESPACE } from '../../i18n';
import * as reduxUserInfo from '../../redux-user-info';
import getComponents from '../../get-components';

const {
  Form,
  Button,
} = getComponents();

export const PAGE_ID = 'Signup';

@connect(
  (globalState) => ({
    actionSignupStatus: getUserInfo(globalState).actionSignupStatus,
  }),
  {
    ...reduxUserInfo.actions,
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
@bemDecorator({ componentName: 'SignupPage', wrapper: false })
export default class Signup extends Component {
  static PAGE_ID = PAGE_ID;
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    onSubmit: PropTypes.func,
    inModal: PropTypes.bool,
    onEnterTypeChange: PropTypes.func,
    onModalCancel: PropTypes.func,
    emailAsLogin: PropTypes.bool,
    aliasIdAsUsername: PropTypes.bool,
    formProps: PropTypes.object,

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
  };

  static defaultProps = {
    emailAsLogin: clientConfig.common.features.auth.emailAsLogin,
    aliasIdAsUsername: clientConfig.common.features.auth.aliasIdAsUsername,
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
      form,
      actionSignup,
      emailAsLogin,
      aliasIdAsUsername,
      onEnterTypeChange,
      onSubmit,
    } = this.props;
    const {
      email,
      username,
    } = form;

    await actionSignup({
      ...form,
      username: emailAsLogin ? email : username,
      aliasId: !emailAsLogin && aliasIdAsUsername ? username : undefined,
    });

    await onEnterTypeChange(null, true);

    if (onSubmit) {
      await onSubmit();
    }
  }

  // ======================================================
  // RENDERS
  // ======================================================
  getFields() {
    const {
      form: {
        username,
        password,
        email,
        displayName,
      },
      emailAsLogin,
    } = this.props;

    const fields = [];

    if (!emailAsLogin) {
      fields.push(
        {
          id: 'username',
          name: 'username',
          subType: FIELD_SUB_TYPES.LOGIN,
          value: username,
          required: true,
        },
      );
    }

    fields.push(
      {
        id: 'email',
        name: 'email',
        subType: FIELD_SUB_TYPES.EMAIL,
        value: email,
        required: true,
      },
      {
        id: 'password',
        name: 'password',
        subType: FIELD_SUB_TYPES.PASSWORD,
        value: password,
        required: true,
      },
      {
        name: 'displayName',
        value: displayName,
      },
    );

    return fields;
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      actionSignupStatus,
      inModal,
      onUpdateForm,
      onModalCancel,
      onEnterTypeChange,
      formProps,
    } = this.props;

    return (
      <Form
        id={ PAGE_ID }
        className={ this.fullClassName }
        i18nFieldPrefix={ `${NAMESPACE}:pages.SignupPage.fields` }

        fields={ this.getFields() }
        onChangeField={ onUpdateForm }

        inModal={ inModal }
        useForm={ true }

        actions={
          (
            <Button
              key="signinButton"
              className={ this.bem('signinButton') }
              onClick={ () => onEnterTypeChange(false, true) }
            >
              {i18n('pages.SignupPage.signinButton')}
            </Button>
          )
        }
        onSubmit={ this.handleSubmit }
        textActionSubmit={ i18n('pages.SignupPage.submitButton') }
        onCancel={ onModalCancel }
        textActionCancel={ i18n('pages.SignupPage.cancelButton') }

        actionStatus={ actionSignupStatus }
        { ...formProps }
      />
    );
  }
}

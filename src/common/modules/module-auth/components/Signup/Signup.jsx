import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import reduxSimpleForm from '../../../../utils/decorators/react-class/redux-simple-form';
import bemDecorator from '../../../../utils/decorators/bem-component';
import i18n from '../../../../utils/i18n-utils';

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
import {
  ACTION_STATUS_PROPS,
} from '../../../../models';
import {
  SUB_TYPES,
} from '../../../../models/model-field';

import COMPONENTS_BASE from '../../../../components/ComponentsBase';

// import './LoginPage.css';

const {
  Form,
  Button,
} = COMPONENTS_BASE;

const PAGE_ID = 'Signup';

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
    inModal: PropTypes.bool,
    onEnterTypeChange: PropTypes.func,
    onModalCancel: PropTypes.func,

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
      onChangeEnterType,
    } = this.props;

    await actionSignup(form);

    await onChangeEnterType(true);
  }

  // ======================================================
  // RENDERS
  // ======================================================
  isValid() {
    const {
      form: {
        username,
        password,
        email,
      },
    } = this.props;

    return !!(username && password && email);
  }

  getFields() {
    const {
      form: {
        username,
        password,
        email,
        displayName,
      },
    } = this.props;
    return [
      {
        name: 'username',
        subType: SUB_TYPES.LOGIN,
        value: username,
      },
      {
        name: 'password',
        subType: SUB_TYPES.PASSWORD,
        value: password,
      },
      {
        name: 'email',
        subType: SUB_TYPES.EMAIL,
        value: email,
      },
      {
        name: 'displayName',
        value: displayName,
      },
    ];
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
    } = this.props;

    return (
      <Form
        id={ PAGE_ID }
        className={ this.fullClassName }
        i18nFieldPrefix={ 'core:pages.SignupPage.fields' }

        fields={ this.getFields() }
        onChangeField={ onUpdateForm }

        isValid={ this.isValid() }
        inModal={ inModal }
        useForm={ true }

        actions={
          (
            <Button
              key="signinButton"
              className={ this.bem('signinButton') }
              onClick={ () => onEnterTypeChange(false) }
            >
              {i18n('core:pages.SignupPage.signinButton')}
            </Button>
          )
        }
        onSubmit={ this.handleSubmit }
        textActionSubmit={ i18n('core:pages.SignupPage.submitButton') }
        onCancel={ onModalCancel }
        textActionCancel={ i18n('core:pages.SignupPage.cancelButton') }

        actionStatus={ actionSignupStatus }
      />
    );
  }
}

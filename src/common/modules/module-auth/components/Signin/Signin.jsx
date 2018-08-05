import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import reduxSimpleForm from '../../../../utils/decorators/react-class/redux-simple-form';
import bemDecorator from '../../../../utils/decorators/bem-component';
import i18n from '../../../../utils/i18n-utils';
import clientConfig from '../../../../client-config';

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

import * as paths from '../../routes-paths-auth';

// import './Signin.css';

const {
  Link,
  Form,
  Button,
} = COMPONENTS_BASE;

const PAGE_ID = 'Signin';

@connect(
  (globalState) => ({
    actionChangeUserStatus: getUserInfo(globalState).actionChangeUserStatus,
  }),
  {
    actionChangeUser: reduxUserInfo.actions.actionChangeUser,
  },
)
@reduxSimpleForm(
  PAGE_ID,
  {
    username: '',
    loginEmail: '',
    password: '',
  },
)
@bemDecorator({ componentName: 'Signin', wrapper: false })
export default class Signin extends Component {
  static PAGE_ID = PAGE_ID;
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    onLogin: PropTypes.func,
    inModal: PropTypes.bool,
    onEnterTypeChange: PropTypes.func,
    onModalCancel: PropTypes.func,
    emailAsLogin: PropTypes.bool,

    // ======================================================
    // @reduxSimpleForm
    // ======================================================
    form: PropTypes.shape({
      username: PropTypes.string,
      loginEmail: PropTypes.string,
      password: PropTypes.string,
    }),
    onUpdateForm: PropTypes.func,

    // ======================================================
    // CONNECT
    // ======================================================
    actionChangeUserStatus: ACTION_STATUS_PROPS,
    actionChangeUser: PropTypes.func,
  };

  static defaultProps = {
    emailAsLogin: clientConfig.common.features.auth.emailAsLogin,
  };

  // ======================================================
  // UTILS
  // ======================================================
  getFields() {
    const {
      form: {
        username,
        loginEmail,
        password,
      },
      emailAsLogin,
    } = this.props;

    return [
      emailAsLogin
        ? {
          /*
           id необходим для корректной работы автозаполнению
           Chrome will only save the autocomplete information on submit.
           https://stackoverflow.com/questions/15462991/trigger-autocomplete-without-submitting-a-form
          */
          id: 'email',
          name: 'loginEmail',
          subType: SUB_TYPES.LOGIN_EMAIL,
          value: loginEmail,
          instanceChange: true,
          required: true,
        }
        : {
          id: 'username',
          name: 'username',
          subType: SUB_TYPES.LOGIN,
          value: username,
          instanceChange: true,
          required: true,
        },
      {
        id: 'password',
        name: 'password',
        subType: SUB_TYPES.PASSWORD,
        value: password,
        instanceChange: true,
        required: true,
      },
    ];
  }

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  async handleLogin() {
    const {
      form: {
        username,
        loginEmail,
        password,
      },
      emailAsLogin,
      actionChangeUser,
      onLogin,
      onEnterTypeChange,
    } = this.props;

    const loginFinal = emailAsLogin ? loginEmail : username;
    await actionChangeUser(loginFinal, password);
    await onEnterTypeChange(null);

    if (onLogin) {
      await onLogin(loginFinal);
    }
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      actionChangeUserStatus,
      inModal,
      onUpdateForm,
      onEnterTypeChange,
      onModalCancel,
    } = this.props;

    // чтобы кнопка была сразу доступна при вводе данных а не когда фокус переместатя
    // уберем onChangeField={ onUpdateForm } и проставим явно onChange (вместо onChangeBlur)

    return (
      <Form
        id={ PAGE_ID }
        className={ this.fullClassName }
        i18nFieldPrefix={ 'core:pages.SigninPage.fields' }

        fields={ this.getFields() }
        onChangeField={ onUpdateForm }

        inModal={ inModal }
        useForm={ true }

        actions={
          clientConfig.common.features.auth.allowSignup && (
            <Button
              key="signupButton"
              className={ this.bem('signupButton') }
              onClick={ () => onEnterTypeChange(true) }
            >
              {i18n('core:pages.SigninPage.signup')}
            </Button>
          )
        }
        onSubmit={ this.handleLogin }
        textActionSubmit={ i18n('core:pages.SigninPage.loginButton') }
        onCancel={ onModalCancel }
        textActionCancel={ i18n('core:pages.SigninPage.loginCancelButton') }

        postActions={
          clientConfig.common.features.auth.allowResetPasswordByEmail && (
            <div className={ this.bem('forgotPassword') }>
              <Link to={ paths.PATH_AUTH_FORGOT }>
                {i18n('core:pages.SigninPage.forgotPassword')}
              </Link>
            </div>
          )
        }

        actionStatus={ actionChangeUserStatus }
      />
    );
  }
}

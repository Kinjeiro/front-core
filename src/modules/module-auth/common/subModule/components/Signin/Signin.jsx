import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import reduxSimpleForm from '../../../../../../common/utils/decorators/react-class/redux-simple-form';
import bemDecorator from '../../../../../../common/utils/decorators/bem-component';
import clientConfig from '../../../../../../common/client-config';

// ======================================================
// COMPONENTS and STYLES
// ======================================================
import { ACTION_STATUS_PROPS } from '../../../../../../common/models/index';
import { SUB_TYPES } from '../../../../../../common/models/model-field';

// ======================================================
// MODULE
// ======================================================
import { API_CONFIGS } from '../../api-auth';
import { getUserInfo } from '../../redux-selectors';
import * as reduxUserInfo from '../../redux-user-info';

import i18n, { NAMESPACE } from '../../i18n';
import * as paths from '../../routes-paths-auth';

import './Signin.scss';
import getComponents from '../../get-components';

const {
  Link,
  Form,
  Button,
  FbAuthIcon,
  GoogleAuthIcon,
  VKAuthIcon,
} = getComponents();

export const PAGE_ID = 'Signin';

@connect(
  globalState => ({
    actionChangeUserStatus: getUserInfo(globalState).actionChangeUserStatus,
  }),
  {
    actionChangeUser: reduxUserInfo.actions.actionChangeUser,
  },
)
@reduxSimpleForm(PAGE_ID, {
  username: '',
  loginEmail: '',
  password: '',
})
@bemDecorator({ componentName: 'Signin', wrapper: false })
export default class Signin extends Component {
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
    formProps: PropTypes.object,

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
      form: { username, loginEmail, password },
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
      form: { username, loginEmail, password },
      emailAsLogin,
      actionChangeUser,
      onSubmit,
      onEnterTypeChange,
    } = this.props;

    const loginFinal = emailAsLogin ? loginEmail : username;
    await actionChangeUser(loginFinal, password);
    await onEnterTypeChange(null);

    if (onSubmit) {
      await onSubmit(loginFinal);
    }
  }

  // ======================================================
  // RENDERS
  // ======================================================
  renderSocials() {
    const socials = [];

    // todo @ANKU @CRIT @MAIN - сделать потом через попап \ либо отдельную страницу
    if (clientConfig.common.features.auth.socialProvides.facebook) {
      socials.push((
        <a
          key="facebook"
          href={ API_CONFIGS.facebookSignin.path }
          className="SocialAuthWrapper"
        >
          <div className="SocialAuth FacebookAuthButton">
            <FbAuthIcon className="SocialAuthIcon" />
            { i18n('pages.SigninPage.facebookSigninButton') }
          </div>
        </a>
      ));
    }
    if (clientConfig.common.features.auth.socialProvides.vkontakte) {
      socials.push((
        <a
          key="vkontakte"
          href={ API_CONFIGS.vkontakteSignin.path }
          className="SocialAuthWrapper"
        >
          <div className="SocialAuth VkontakteAuthButton">
            <VKAuthIcon className="SocialAuthIcon" />
            { i18n('pages.SigninPage.vkontakteSigninButton') }
          </div>
        </a>
      ));
    }
    if (clientConfig.common.features.auth.socialProvides.google) {
      socials.push((
        <a
          key="google"
          href={ API_CONFIGS.googleSignin.path }
          className="SocialAuthWrapper"
        >
          <div className="SocialAuth GoogleAuthButton">
            <GoogleAuthIcon className="SocialAuthIcon" />
            { i18n('pages.SigninPage.googleSigninButton') }
          </div>
        </a>
      ));
    }

    return socials.length > 0 && (
      <div
        key="social"
        className="SocialAuthButtons"
      >
        { socials }
      </div>
    );
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
      formProps,
    } = this.props;
    // чтобы кнопка была сразу доступна при вводе данных а не когда фокус переместатя
    // уберем onChangeField={ onUpdateForm } и проставим явно onChange (вместо onChangeBlur)

    return (
      <Form
        id={ PAGE_ID }
        className={ this.fullClassName }
        i18nFieldPrefix={ `${NAMESPACE}:pages.SigninPage.fields` }
        fields={ this.getFields() }
        onChangeField={ onUpdateForm }
        inModal={ inModal }
        useForm={ true }
        actions={ [
          clientConfig.common.features.auth.allowSignup && (
            <Button
              key="signupButton"
              className={ this.bem('signupButton') }
              onClick={ () => onEnterTypeChange(true) }
            >
              {i18n('pages.SigninPage.signup')}
            </Button>
          ),
          this.renderSocials(),
        ] }
        onSubmit={ this.handleLogin }
        textActionSubmit={ i18n('pages.SigninPage.loginButton') }
        onCancel={ onModalCancel }
        textActionCancel={ i18n('pages.SigninPage.loginCancelButton') }
        postActions={
          clientConfig.common.features.auth.allowResetPasswordByEmail && (
            <div className={ this.bem('forgotPassword') }>
              <Link to={ paths.PATH_AUTH_FORGOT }>
                {i18n('pages.SigninPage.forgotPassword')}
              </Link>
            </div>
          )
        }
        actionStatus={ actionChangeUserStatus }
        { ...formProps }
      />
    );
  }
}

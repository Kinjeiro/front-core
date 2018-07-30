import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import reduxSimpleForm from '../../../../utils/decorators/react-class/redux-simple-form';
import titled from '../../../../utils/decorators/react-class/titled';
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
import * as reduxLastUniError from '../../../../app-redux/reducers/app/last-uni-error';

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

import {
  PATH_INDEX,
} from '../../../../constants/routes.pathes';

import * as paths from '../../routes-paths-auth';

// import './Signin.css';

const {
  Link,
  Form,
} = COMPONENTS_BASE;

const PAGE_ID = 'Signin';

@connect(
  (globalState, ownProps) => ({
    actionChangeUserStatus: getUserInfo(globalState).actionChangeUserStatus,
    urlReturn: typeof ownProps.urlReturn !== 'undefined'
      ? ownProps.urlReturn
      : ownProps.location.query[paths.PARAM__RETURN_URL],
  }),
  {
    actionChangeUser: reduxUserInfo.actions.actionChangeUser,
    ...reduxLastUniError.actions,
    actionGoTo: push,
  },
)
@reduxSimpleForm(
  PAGE_ID,
  {
    username: '',
    password: '',
  },
)
// todo @ANKU @CRIT @MAIN - нужно для модалок не менять тайтл
@titled(PAGE_ID, i18n('core:pages.SigninPage.title'))
@bemDecorator({ componentName: 'Signin', wrapper: false })
export default class Signin extends Component {
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    onLogin: PropTypes.func,
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
    actionChangeUserStatus: ACTION_STATUS_PROPS,
    actionChangeUser: PropTypes.func,
    actionGoTo: PropTypes.func,
    actionClearLastError: PropTypes.func,
    urlReturn: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
    ]),

    // loginButtonClassName: PropTypes.string,
    // loginCancelButtonClassName: PropTypes.string,
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
  async handleLogin() {
    const {
      form: {
        username,
        password,
      },
      actionChangeUser,
      actionGoTo,
      urlReturn,
      onLogin,
      actionClearLastError,
    } = this.props;

    // todo @ANKU @CRIT @MAIN - тут сначала срабатывает promise, и если ответ возвращается без кода ошибки то сработает сначала then а потом запарсится uniError
    await actionChangeUser(username, password);
    if (onLogin) {
      onLogin(username);
    }

    actionClearLastError();

    if (urlReturn !== false) {
      await actionGoTo(urlReturn || PATH_INDEX);
    }
  }

  @bind()
  handleChange(name, value) {
    this.props.onUpdateForm({ [name]: value });
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      form: {
        username,
        password,
      },
      actionChangeUserStatus,
      inModal,
      actionGoTo,
      onUpdateForm,
      actionClearLastError,
    } = this.props;

    // чтобы кнопка была сразу доступна при вводе данных а не когда фокус переместатя
    // уберем onChangeField={ onUpdateForm } и проставим явно onChange (вместо onChangeBlur)

    return (
      <Form
        className={ this.fullClassName }
        i18nFieldPrefix={ 'core:pages.SigninPage.fields' }

        fields={ [
          {
            name: 'username',
            subType: SUB_TYPES.LOGIN,
            value: username,
            instanceChange: true,

          },
          {
            name: 'password',
            subType: SUB_TYPES.PASSWORD,
            value: password,
            instanceChange: true,
          },
        ] }
        onChangeField={ onUpdateForm }


        isValid={ !!(username && password) }
        inModal={ inModal }
        useForm={ true }

        actions={
          clientConfig.common.features.auth.allowSignup && (
            <button
              key="signupButton"
              className={ this.bem('signupButton') }
              onClick={ () => actionGoTo(paths.PATH_AUTH_SIGNUP) }
            >
              {i18n('core:pages.SigninPage.signup')}
            </button>
          )
        }
        onSubmit={ this.handleLogin }
        textActionSubmit={ i18n('core:pages.SigninPage.loginButton') }
        onCancel={ inModal ? () => actionClearLastError() : undefined }
        textActionCancel={ i18n('core:pages.SigninPage.loginCancelButton') }

        postActions={
          clientConfig.common.features.auth.allowResetPasswordByEmail && (
            <div className={ this.bem('forgotPassword') }>
              <Link
                onClick={ () => actionGoTo(paths.PATH_AUTH_FORGOT) }
              >
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

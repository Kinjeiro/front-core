import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import bind from 'lodash-decorators/bind';

import { joinPath } from '../../../../../../common/utils/uri-utils';

import titled from '../../../../../../common/utils/decorators/react-class/titled';
import * as reduxLastUniError from '../../../../../../common/app-redux/reducers/app/last-uni-error';
import contextModules from '../../../../../../common/contexts/ContextModules/decorator-context-modules';

// ======================================================
// MODULE
// ======================================================
import i18n from '../../i18n';
import MODULE_NAME from '../../module-name';
import {
  PARAM__RETURN_URL,
  PATH_AUTH_SIGNIN,
  PATH_AUTH_SIGNUP,
} from '../../routes-paths-auth';

// import './AuthEnter.scss';
import getComponents from '../../get-components';

const {
  Signin,
  Signup,
} = getComponents();

const SigninPage = titled('Signin', i18n('pages.SigninPage.title'))(Signin);
const SignupPage = titled('Signup', i18n('pages.SignupPage.title'))(Signup);

@contextModules()
@connect(
  (globalState, ownProps) => ({
    urlReturn: typeof ownProps.urlReturn !== 'undefined'
      ? ownProps.urlReturn
      : ownProps.location.query[PARAM__RETURN_URL],
  }),
  {
    ...reduxLastUniError.actions,
  },
)
export default class AuthEnter extends Component {
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    inModal: PropTypes.bool,
    isSignup: PropTypes.bool,

    // ======================================================
    // CONNECT
    // ======================================================
    actionClearLastError: PropTypes.func,
    urlReturn: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
    ]),

    // ======================================================
    // @contextModules
    // ======================================================
    onGoTo: PropTypes.func,
  };

  state = {
    isSignup: this.props.isSignup,
  };

  // ======================================================
  // HANDLERS
  // ======================================================
  // todo @ANKU @LOW - переделать из true, false и null на более понятную систему, к примеру статусов
  @bind()
  async handleEnterTypeChange(isSignup = null) {
    const {
      inModal,
      actionClearLastError,
      urlReturn,
      onGoTo,
    } = this.props;


    if (inModal) {
      if (isSignup === null) {
        // убираем любые ошибки тем самым закроется модалка
        actionClearLastError();
      } else {
        this.setState({ isSignup });
      }
    } else {
      // убираем любые ошибки
      actionClearLastError();

      const goTo = isSignup === null
        // выходим из авторизации - если urlReturn нету - то будет переадрисовка на index
        ? onGoTo(urlReturn) // в urlReturn уже может учитываться contextPath но внутри метода есть такая проверка
        : onGoTo(joinPath(
          isSignup
            ? PATH_AUTH_SIGNUP
            : PATH_AUTH_SIGNIN,
          {
            // не забываем urlReturn если он есть
            [PARAM__RETURN_URL]: urlReturn,
          },
        ), MODULE_NAME);

      await goTo;
    }
  }

  @bind()
  handleModalCancel() {
    const {
      actionClearLastError,
    } = this.props;

    actionClearLastError();
  }

  // ======================================================
  // RENDERS
  // ======================================================


  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      inModal,
    } = this.props;

    const {
      isSignup,
    } = this.state;

    const AuthTypeClass = inModal
      ? isSignup
        ? Signup
        : Signin
      : isSignup
        ? SignupPage
        : SigninPage;

    return (
      <AuthTypeClass
        { ...this.props }
        onEnterTypeChange={ this.handleEnterTypeChange }
        onModalCancel={ inModal ? this.handleModalCancel : undefined }
      />
    );
  }
}

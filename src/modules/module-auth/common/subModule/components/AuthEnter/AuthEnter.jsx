import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import bind from 'lodash-decorators/bind';

import { joinPath } from '../../../../../../common/utils/uri-utils';
import i18n from '../../../../../../common/utils/i18n-utils';
import titled from '../../../../../../common/utils/decorators/react-class/titled';
import * as reduxLastUniError from '../../../../../../common/app-redux/reducers/app/last-uni-error';
import {
  PATH_INDEX,
} from '../../../../../../common/constants/routes.pathes';

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

const SigninPage = titled('Signin', i18n('core:pages.SigninPage.title'))(Signin);
const SignupPage = titled('Signup', i18n('core:pages.SignupPage.title'))(Signup);

@connect(
  (globalState, ownProps) => ({
    urlReturn: typeof ownProps.urlReturn !== 'undefined'
      ? ownProps.urlReturn
      : ownProps.location.query[PARAM__RETURN_URL],
  }),
  {
    ...reduxLastUniError.actions,
    actionGoTo: push,
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
    actionGoTo: PropTypes.func,
    actionClearLastError: PropTypes.func,
    urlReturn: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
    ]),
  };

  state = {
    isSignup: this.props.isSignup,
  };

  // ======================================================
  // HANDLERS
  // ======================================================
  @bind()
  async handleEnterTypeChange(isSignup = null) {
    const {
      inModal,
      actionClearLastError,
      urlReturn,
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

      await this.props.actionGoTo(
        isSignup === null
          ? urlReturn || PATH_INDEX
          : joinPath(
            isSignup ? PATH_AUTH_SIGNUP : PATH_AUTH_SIGNIN,
            {
              // не забываем urlReturn если он есть
              [PARAM__RETURN_URL]: urlReturn,
            },
          ),
      );
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
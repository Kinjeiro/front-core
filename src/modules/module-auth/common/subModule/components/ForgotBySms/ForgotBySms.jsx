import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  getUserInfo,
} from '../../../../../../common/app-redux/selectors';
import { ACTION_STATUS_PROPS } from '../../../../../../common/models/index';
import { PATH_MAIN_INDEX } from '../../../../../../common/constants/routes.pathes';
import getComponents from '../../../../../../common/get-components';
import { REGEXP_PASSWORD } from '../../../../../../common/utils/common';
import commonConfig from '../../../../../../common/client-config';
import contextModules from '../../../../../../common/contexts/ContextModules/decorator-context-modules';

import { getSmsInfo } from '../../../../../feature-sms/common/subModule/redux-selectors-sms';
import { actions as actionsSms } from '../../../../../feature-sms/common/subModule/redux-sms';

// ======================================================
// MODULE module-auth
// ======================================================
import { actions as actionsUserInfo } from '../../redux-user-info';
import i18n, { NAMESPACE } from '../../i18n';
import * as paths from '../../routes-paths-auth';


// require('./ForgotBySms.scss');

const {
  Form,
  Button,
  Input,
  PhoneInput,
} = getComponents();

export const PAGE_ID = 'ForgotBySms';

// todo @ANKU @LOW - адаптировать под форму
@connect(
  globalState => ({
    actionSendSmsCodeStatus: getSmsInfo(globalState).actionSendSmsCodeStatus,
    actionResetPasswordByVerifyTokenStatus: getUserInfo(globalState).actionResetPasswordByVerifyTokenStatus,
  }),
  {
    actionSendSmsCode: actionsSms.actionSendSmsCode,
    actionResetPasswordByVerifyToken: actionsUserInfo.actionResetPasswordByVerifyToken,
    actionSignin: actionsUserInfo.actionSignin,
  },
)
@contextModules()
export default class ForgotBySms extends Component {
  static PAGE_ID = PAGE_ID;
  static propTypes = {
    // ======================================================
    // PROPS
    // ======================================================
    onSubmit: PropTypes.func,
    inModal: PropTypes.bool,
    onEnterTypeChange: PropTypes.func,
    onModalCancel: PropTypes.func,
    formProps: PropTypes.object,

    // ======================================================
    // CONNECT
    // ======================================================
    actionSendSmsCode: PropTypes.func,
    actionSendSmsCodeStatus: ACTION_STATUS_PROPS,
    actionResetPasswordByVerifyToken: PropTypes.func,
    actionResetPasswordByVerifyTokenStatus: ACTION_STATUS_PROPS,
    actionSignin: PropTypes.func,

    // ======================================================
    // @contextModules
    // ======================================================
    onGoTo: PropTypes.func,
  };

  state = {
    username: undefined,
    phone: undefined,
    isPhoneConfirm: false,

    smsCodeVerify: undefined,
    isSmsCodeConfirmed: false,

    newPassword: undefined,
    passwordError: undefined,
  };

  // ======================================================
  // HANDLERS
  // ======================================================
  handlePasswordChange = event => {
    const newPassword = event.target.value;
    this.setState({
      newPassword,
      passwordError: null,
    });
  };
  handlePasswordOnBlur = (event) => {
    const newPassword = event.target.value;

    let passwordError = null;

    if (!REGEXP_PASSWORD.test(newPassword)) {
      // todo @ANKU @LOW - @@loc
      passwordError = 'Не менее 8 символов, минимум 1 строчная, 1 заглавная, 1 спецсимвол или 1 цифра.';
    }

    this.setState({
      passwordError,
    });
  };

  handleSendSms = async () => {
    const {
      actionSendSmsCode,
    } = this.props;
    const {
      username,
      phone,
    } = this.state;

    // todo @ANKU @LOW - @@loc
    const preCodeText = 'Kod dla sbrosa parolya\n';
    await actionSendSmsCode(phone, preCodeText, username);

    this.setState({
      isPhoneConfirm: true,
    });
  };

  handleSubmit = async () => {
    const {
      actionResetPasswordByVerifyToken,
      actionSignin,
      onGoTo,
    } = this.props;
    const {
      username,
      smsCodeVerify,
      newPassword,
    } = this.state;
    await actionResetPasswordByVerifyToken(smsCodeVerify, username, newPassword);
    // await actionSignin(username, newPassword);
    await onGoTo(commonConfig.common.features.auth.paths.afterSignin || PATH_MAIN_INDEX);
  };


  // ======================================================
  // RENDERS
  // ======================================================
  renderError(actionStatus = {}) {
    let errorContent;

    if (typeof actionStatus === 'string' || actionStatus === null) {
      errorContent = actionStatus;
    } else {
      const {
        isFetching,
        error,
      } = actionStatus;

      errorContent = error && !isFetching && (
        error.clientErrorMessage || error.message || error
      );
    }

    return errorContent && (
      <div className="ui error message">
        { errorContent }
      </div>
    );
  }

  renderPhoneBlock() {
    const {
      actionSendSmsCodeStatus,
    } = this.props;
    const {
      phone,
      username,
    } = this.state;

    return (
      <div>
        <div className="field">
          <label>
            Введите имя пользователя
          </label>
          <Input
            value={ username }
            onChange={ event => this.setState({ username: event.target.value }) }
            placeholder="Пользователь"
          />
        </div>
        <div className="field">
          <label>
            Введите номер телефона
          </label>
          <PhoneInput
            onChange={ event => this.setState({ phone: event.target.value }) }
            placeholder="Телефон"
          />
        </div>

        <Button
          disabled={ !phone || !phone.length }
          onClick={ this.handleSendSms }
          className={ 'ui button orange-button' }
        >
          Отослать смс с проверочным кодом
        </Button>

        { this.renderError(actionSendSmsCodeStatus) }
      </div>
    );
  }

  renderSmsBlock() {
    const {
      phone,
      // smsCodeVerify,
      isSmsCodeConfirmed,
    } = this.state;

    /*
    <div className="field send">
            <Button
              className={ 'ui button orange-button' }
              disabled={ !smsCodeVerify.length }
              loading={ actionIsRegistrationCodeValidStatus }
              onClick={ async () => {
                await this.props.actionIsRegistrationCodeValid();
                this.setState({
                  isSmsCodeConfirmed: true,
                });
              } }
            >
              Подтвердить
            </Button>
          </div>

          { this.renderError(actionIsRegistrationCodeValidStatus) }
    */

    return (
      <div className="sms-confirmation">
        <div className="ui success message">
          <div className="header">
            SMS подтверждение
          </div>
          <div className="text">
            На Ваш номер{' '}{phone}{' '}
            выслан код подтверждения
          </div>
        </div>

        <div className="equal width fields">
          <div className="field">
            <label>Код подтверждения</label>
            <input
              disabled={ isSmsCodeConfirmed }
              onChange={ event => this.setState({ smsCodeVerify: event.target.value }) }
              type="text"
              placeholder="Введите код"
            />
          </div>
        </div>
      </div>
    );
  }


  renderNewPassword() {
    const {
      actionResetPasswordByVerifyTokenStatus,
    } = this.props;
    const {
      // newPassword,
      passwordError,
    } = this.state;

    return (
      <div>
        <div className="field">
          <label>Новый пароль для учетной записи</label>
          <input
            type="password"
            placeholder="Введите пароль"

            minLength={ 8 }
            required={ true }

            onChange={ this.handlePasswordChange }
            onBlur={ this.handlePasswordOnBlur }
          />
        </div>
        { this.renderError(passwordError) }

        <Button
          disabled={ !!passwordError }
          onClick={ this.handleSubmit }
          className={ 'ui button orange-button' }
        >
          Применить
        </Button>

        { this.renderError(actionResetPasswordByVerifyTokenStatus) }
      </div>
    );
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  render() {
    const {
      isPhoneConfirm,
      // isSmsCodeConfirmed,
    } = this.state;

    return (
      <div className="ForgotBySms">
        <div className="ui two column basic stackable grid container">
          <div className="row">
            <div className="six wide column left" />
            <div className="ten wide column right">
              <h2 className="ui header">
                Смена пароля
              </h2>

              <div className="ui form">
                { this.renderPhoneBlock() }
                { isPhoneConfirm && this.renderSmsBlock() }
                { isPhoneConfirm && this.renderNewPassword() }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

/* eslint-disable no-unused-vars */
import {
  getRandomInt,
  generateId,
} from '../../../common/utils/common';

import logger from '../../helpers/server-logger';
import { AUTH_TYPES } from '../../utils/auth-utils';

import ServiceAuth from '../ServiceAuth';

import {
  USERS,
  TOKENS,
  getUser,
  getToken,
  getUserByToken,
} from './data-users';




/**
 * Клиенсткая реализация протокола OAuth 2.0 Bearer
 * @param endpointServiceConfig
 * @returns {{ authValidate, authLogin }}
 */
export default class ServiceAuthMock extends ServiceAuth {
  async authSignup(userData) {
    // eslint-disable-next-line no-param-reassign
    const userDataFinal = {
      userId: `${getRandomInt()}`,
      ...userData,
    };
    logger.log('ServiceAuthMock', 'authSignup', userDataFinal);
    USERS[userDataFinal.userId] = userDataFinal;
    TOKENS[userDataFinal.userId] = generateId();
    return userDataFinal;
  }

  /*
   "access_token": "395549ac90cd6f37cbc28c6cb5b31aa8ffe2a22826831dba11d6baae9dafb07a",
   "refresh_token": "857896e0aab5b35456f6432ef2f812a344e2a3bab12d38b152ee3dd968442613",
   "expires_in": 299, (seconds)
   "token_type": "Bearer"
   */
  async authLogin(username, password) {
    logger.log('ServiceAuthMock', 'authLogin', username);
    const user = getUser(username, password);
    const token = user ? getToken(user.userId) : null;
    if (token) {
      return {
        access_token: token,
        refresh_token: token,
        expires_in: 299,
        token_type: 'Bearer',
      };
    }
    // todo @ANKU @LOW - локализация
    throw new Error(`Среди моков пользователь "${username}" не найден`);
  }

  /*
   "access_token": "395549ac90cd6f37cbc28c6cb5b31aa8ffe2a22826831dba11d6baae9dafb07a",
   "refresh_token": "857896e0aab5b35456f6432ef2f812a344e2a3bab12d38b152ee3dd968442613",
   "expires_in": 299, seconds
   "token_type": "Bearer"
   */
  async authRefresh(refreshToken) {
    logger.log('ServiceAuthMock', 'authRefresh', refreshToken);
    return {
      access_token: refreshToken,
      refresh_token: refreshToken,
      expires_in: 299,
      token_type: 'Bearer',
    };
  }

  async authValidate(token, authType = AUTH_TYPES.BEARER) {
    logger.log('ServiceAuthMock', 'authValidate', token);
    return getUserByToken(token);
  }

  async authLogout(token, authType = AUTH_TYPES.BEARER) {
    logger.log('ServiceAuthMock', 'authLogout', token);
  }


  /**
   * Протокол для @reagentum/auth-server@1.0.4
   *
   * @param email
   * @param resetPasswordPageUrl
   * @param emailOptions
   * @return {*}
   */
  async authForgot(email, resetPasswordPageUrl, emailOptions) {
    logger.log('ServiceAuthMock', 'authLogout', email);
    throw new Error('Not implemented');
  }

  /**
   * Протокол для @reagentum/auth-server@1.0.4
   *
   * @param resetPasswordToken
   * @param newPassword
   * @param emailOptions
   * @return {Promise.<*>}
   */
  async authResetPassword(resetPasswordToken, newPassword, emailOptions) {
    logger.log('ServiceAuthMock', 'authResetPassword', resetPasswordToken);
    throw new Error('Not implemented');
  }
}

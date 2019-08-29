/* eslint-disable camelcase */
import i18n from '../../../../../common/utils/i18n-utils';
import {
  parseToUniError,
  ThrowableUniError,
} from '../../../../../common/models/uni-error';
import { createUserFromData } from '../../../../../common/models/model-user';

import {
  AUTH_TYPES,
  getHeadersByAuthType,
} from '../../../../../server/utils/auth-utils';
import {
  getEndpointServiceUrl,
  CONTENT_TYPES,
} from '../../../../../server/utils/send-server-request';

import serverConfig from '../../../../../server/server-config';

import CoreService from '../../../../../server/services/utils/CoreService';
import { joinPath } from '../../../../../common/utils/uri-utils';


/**
 * Клиенсткая реализация протокола OAuth 2.0 Bearer
 * PROTOCOL - https://tools.ietf.org/html/rfc6749#
 *
 * @param endpointServiceConfig
 * @returns {{ authValidate, authLogin }}
 */
export default class ServiceAuth extends CoreService {
  urls = {};

  constructor(endpointServiceConfig, urls, options) {
    super(endpointServiceConfig, options);
    this.urls = this.getUrls(urls);
  }

  getUrls(customUrls) {
    return {
      ...serverConfig.server.features.auth.oauth2Urls,
      ...customUrls,
    };
  }

  // ======================================================
  // UTILS
  // ======================================================
  deserializeUserFromOpenidData(userData) {
    /*
      "sub": "cd3642b7-1a4b-4766-9922-75f9faa56c14",
      "email_verified": false,
      "name": "Ivan Ivanov",
      "preferred_username": "opa",
      "given_name": "Ivan",
      "family_name": "Ivanov"
    */
    const {
      sub,
      name,
      username,
      preferred_username,
      given_name,
      family_name,
    } = userData;


    /*
    {
       //userId: '59c28a68b52cec41904f9848',
       username: 'ivanovI',
       userType: undefined,

       firstName: 'Ivan',
       middleName: 'Ivanovich',
       lastName: 'Ivanov',

       displayName: 'Ivanov I. I.',
       email: 'ivanovi@local.com',
       profileImageURI: undefined,
       phone: undefined,
       address: undefined,

       provider: 'local',

       created: '2017-09-20T15:34:00.742Z',
       updated: '2017-09-20T15:34:00.741Z',

       roles: ['user'],
       permissions: [],
     };
    */
    return createUserFromData({
      userId: sub || username || preferred_username,
      username: username || preferred_username,
      // userType: undefined,

      firstName: given_name,
      // middleName: 'Ivanovich',
      lastName: family_name,
      displayName: name,

      // email: 'ivanovi@local.com',
      // profileImageURI: undefined,
      // phone: undefined,
      // address: undefined,
    });
  }

  serializeUserToData(user) {
    return user;
  }

  getClientInfo() {
    return {
      client_id: serverConfig.server.features.auth.applicationClientInfo.client_id,
      client_secret: serverConfig.server.features.auth.applicationClientInfo.client_secret,
    };
  }

  getClientCredentialsHeaders() {
    const {
      client_id,
      client_secret,
    } = this.getClientInfo();

    // согласно протоколу они передаются через Authorization: `Basic
    // https://developers.getbase.com/docs/rest/articles/oauth2/requests
    const clientCredentials = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    return getHeadersByAuthType(clientCredentials, AUTH_TYPES.BASIC);
  }

  getSocialAuthUrl(provider, projectCallbackUrl = undefined) {
    const {
      client_id,
      // client_secret,
    } = this.getClientInfo();

    return joinPath(
      getEndpointServiceUrl(this.endpointServiceConfig, this.urls.authSocialProviderSignin, { provider }),
      {
        provider,
        client_id,
        projectCallbackUrl,
      },
    );
  }

  catchAuthError(error) {
    // eslint-disable-next-line no-param-reassign
    const uniError = parseToUniError(error);
    if (
      uniError.originalObject
      && uniError.originalObject.error_description
    ) {
      let clientErrorMessage;

      // switch (uniError.originalObject.error_description) {
      switch (uniError.originalObject.error) {
        case 'Invalid resource owner credentials':
          clientErrorMessage = i18n('errors.wrongUserCredentials');
          break;
        case 'Missing required parameter: password':
          clientErrorMessage = i18n('errors.missingPassword');
          break;
        default:
          // clientErrorMessage = uniError.originalObject.error_description;
          clientErrorMessage = uniError.originalObject.error;
      }
      uniError.clientErrorMessage = clientErrorMessage;
    }

    throw new ThrowableUniError(uniError);
  }

  // ======================================================
  // SING_UP \ REGISTRATION
  // ======================================================
  async authSignup(userData, emailOptions = null) {
    try {
      return await this.send(
        this.urls.authSignup,
        {
          userData,
          ...this.getClientInfo(),
          emailOptions,
        },
        {
          method: 'post',
          headers: {
            ...this.getClientCredentialsHeaders(),
            // contentType: CONTENT_TYPES.FORM_URLENCODED,
          },
        },
      );
    } catch (error) {
      return this.catchAuthError(error);
    }
  }


  // ======================================================
  // SIGN IN \ LOGIN
  // ======================================================
  /*
   "access_token": "395549ac90cd6f37cbc28c6cb5b31aa8ffe2a22826831dba11d6baae9dafb07a",
   "refresh_token": "857896e0aab5b35456f6432ef2f812a344e2a3bab12d38b152ee3dd968442613",
   "expires_in": 299, (seconds)
   "token_type": "Bearer"
   */
  async authLogin(username, password) {
    try {
      // https://tools.ietf.org/html/rfc6749#section-4.3.2
      return await this.send(
        this.urls.authSignin,
        {
          // @NOTE: необходимо учитывать snake запись (_) это стандарт
          grant_type: 'password',
          username,
          password,
          // ...this.getClientInfo(),
        },
        {
          method: 'post',
          headers: {
            ...this.getClientCredentialsHeaders(),
            contentType: CONTENT_TYPES.FORM_URLENCODED,
          },
        },
      );
      // .then((results) => {
      //   // стандарт работает на секундах, а сервер на милисекундах
      //   // https://developers.google.com/identity/protocols/OAuth2UserAgent#validate-access-token
      //   // eslint-disable-next-line no-param-reassign
      //   results.expires_in *= 1000;
      //   return results;
      // })
    } catch (error) {
      return this.catchAuthError(error);
    }
  }


  // ======================================================
  // REFRESH \ UPDATE TOKEN
  // ======================================================
  /*
   "access_token": "395549ac90cd6f37cbc28c6cb5b31aa8ffe2a22826831dba11d6baae9dafb07a",
   "refresh_token": "857896e0aab5b35456f6432ef2f812a344e2a3bab12d38b152ee3dd968442613",
   "expires_in": 299, seconds
   "token_type": "Bearer"
   */
  async authRefresh(refreshToken) {
    try {
      return await this.send(
        this.urls.authRefresh,
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          // ...this.getClientInfo(),
        },
        {
          method: 'post',
          headers: {
            ...this.getClientCredentialsHeaders(),
            contentType: CONTENT_TYPES.FORM_URLENCODED,
          },
        },
      );
      // .then((results) => {
      //   // стандарт работает на секундах, а сервер на милисекундах
      //   // eslint-disable-next-line no-param-reassign
      //   results.expires_in *= 1000;
      //   return results;
      // })
    } catch (error) {
      return this.catchAuthError(error);
    }
  }


  // ======================================================
  // VALIDATE \ Introspection
  // ======================================================
  /*
    https://tools.ietf.org/html/rfc7662#section-2.1 -- OAuth 2.0 Token Introspection

   {
   "user_id": "59ba24251d1c69466ca3346b",
   "username": "59ba24251d1c69466ca3346b",
   "name": "ivanovI",
   "scope": "*"
   }
   */
  async authValidate(token) {
    try {
      return await this.deserializeUserFromOpenidData(
        await this.send(
          this.urls.authValidate,
          {
            token,
            token_type_hint: 'access_token',
          },
          {
            method: 'post',
            headers: {
              // ...getHeadersByAuthType(token, authType),
              ...this.getClientCredentialsHeaders(),
              contentType: CONTENT_TYPES.FORM_URLENCODED,
            },
          },
        ),
      );
    } catch (error) {
      return this.catchAuthError(error);
    }
  }

  async authLogout(token) {
    try {
      return await this.sendWithAuth(
        this.urls.authSignout,
        undefined,
        {
          headers: {
            ...getHeadersByAuthType(token),
            contentType: CONTENT_TYPES.FORM_URLENCODED,
          },
        },
      );
    } catch (error) {
      return this.catchAuthError(error);
    }
  }


  // ======================================================
  // ADDITIONAL
  // ======================================================
  /**
   * Протокол для @reagentum/auth-server@1.0.4
   *
   * @param email
   * @param resetPasswordPageUrl
   * @param emailOptions
   * @return {*}
   */
  async authForgot(email, resetPasswordPageUrl, emailOptions) {
    try {
      return await this.send(
        this.urls.authForgot,
        {
          email,
          emailOptions,

          resetPasswordPageUrl,
          // ...this.getClientInfo(),
        },
        {
          method: 'post',
          headers: {
            // todo @ANKU @CRIT @MAIN -
            ...this.getClientCredentialsHeaders(),
            contentType: CONTENT_TYPES.FORM_URLENCODED,
          },
        },
      );
    } catch (error) {
      return this.catchAuthError(error);
    }
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
    try {
      return await this.send(
        this.urls.authReset,
        {
          resetPasswordToken,
          newPassword,

          emailOptions,
          // ...this.getClientInfo(),
        },
        {
          method: 'post',
          headers: {
            // todo @ANKU @CRIT @MAIN -
            ...this.getClientCredentialsHeaders(),
            contentType: CONTENT_TYPES.FORM_URLENCODED,
          },
        },
      );
    } catch (error) {
      return this.catchAuthError(error);
    }
  }
}

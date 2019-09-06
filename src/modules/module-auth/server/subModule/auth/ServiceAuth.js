/* eslint-disable camelcase */
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

// ======================================================
// MODULE
// ======================================================
import i18n from '../../../common/subModule/i18n';

export const GRANT_TYPES = {
  PASSWORD: 'password',
  CLIENT_CREDENTIALS: 'client_credentials',
  REFRESH_TOKEN: 'refresh_token',
};

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
      1 вариант opid от Keycloak
        "active": true,
        "jti": "c5592bbd-840a-4be4-9a8f-456b7c953526",
        "exp": 1567015812,
        "nbf": 0,
        "iat": 1567015512,
        "iss": "http://185.22.63.233:8080/auth/realms/exporter",
        "aud": "account",
        "sub": "cd3642b7-1a4b-4766-9922-75f9faa56c14",
        "typ": "Bearer",
        "azp": "exporter-ui-node",
        "auth_time": 0,
        "session_state": "5082e0fa-6dbd-4f49-b49d-afb393086d13",
        "acr": "1",
        "realm_access": {
            "roles": [
                "offline_access",
                "uma_authorization"
            ]
        },
        "resource_access": {
            "account": {
                "roles": [
                    "manage-account",
                    "manage-account-links",
                    "view-profile"
                ]
            }
        },
        "scope": "profile email",
        "client_id": "exporter-ui-node",
        "name": "Ivan Ivanov",
        "given_name": "Ivan",
        "family_name": "Ivanov",
        "preferred_username": "opa",
        "email_verified": false,
        "username": "opa",

      2 вариант - oauth2.0 от спринговского Вани
        "aud": ["exporter_portal_api"],
        "user_name": "iskuzminov",
        "scope": ["read", "write", "trust"],
        "active": true,
        "exp": 1567316912,
        "authorities": ["ROLE_DEVELOPERS", "ROLE_ADMINS"],
        "jti": "6fd0e6d2-e990-4cc7-88c7-4473809b3504",
        "client_id": "back_office_ui_app",
    */

    const {
      sub,
      name,
      username,
      preferred_username,
      given_name,
      family_name,
      realm_access: {
        roles: realmRoles = [],
      } = {},
      resource_access: {
        account: {
          roles: accountRoles = [],
        } = {},
      } = {},

      user_name,
      authorities = [],
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

    const usernameFinal = username || user_name || preferred_username;

    return createUserFromData({
      userId: sub || usernameFinal,
      username: usernameFinal,
      // userType: undefined,

      firstName: given_name,
      // middleName: 'Ivanovich',
      lastName: family_name,
      displayName: name,

      roles: [
        ...authorities,
        ...realmRoles,
        ...accountRoles,
      ],

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

  getClientCredentialsHeaders(clientCredentials = undefined) {
    const {
      client_id,
      client_secret,
    } = clientCredentials || this.getClientInfo();

    // согласно протоколу они передаются через Authorization: `Basic
    // https://developers.getbase.com/docs/rest/articles/oauth2/requests
    const clientCredentialsEncoded = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    return getHeadersByAuthType(clientCredentialsEncoded, AUTH_TYPES.BASIC);
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

  catchAuthError(errorObject) {
    // eslint-disable-next-line no-param-reassign
    const uniError = parseToUniError(errorObject);
    if (
      uniError.originalObject
      && uniError.originalObject.error_description
    ) {
      const {
        error,
        error_description,
      } = uniError.originalObject;

      // // switch (uniError.originalObject.error_description) {
      // switch (uniError.originalObject.error) {
      //   case 'invalid_grant':
      //     // {"error":"invalid_grant","error_description":"Invalid user credentials"}
      //     clientErrorMessage = i18n(uniError.originalObject.error_description || 'errors.wrongUserCredentials');
      //     break;
      //   case 'Invalid resource owner credentials':
      //     clientErrorMessage = i18n('errors.wrongUserCredentials');
      //     break;
      //   case 'Missing required parameter: password':
      //     clientErrorMessage = i18n('errors.missingPassword');
      //     break;
      //   default:
      //     // clientErrorMessage = uniError.originalObject.error_description;
      //     clientErrorMessage = uniError.originalObject.error;
      // }
      uniError.message = uniError.message || error_description || error;
      uniError.clientErrorMessage = i18n(`errors.${error_description}`, undefined, undefined, null)
        || i18n(`errors.${error}`, undefined, undefined, null);
    }

    throw new ThrowableUniError(uniError);
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
          grant_type: GRANT_TYPES.PASSWORD,
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
          grant_type: GRANT_TYPES.REFRESH_TOKEN,
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
      // VALIDATE
      // https://connect2id.com/products/server/docs/api/token-introspection#introspection-response
      /*
        {
          "active"     : false,
        }

        либо
        {
          "active": true,

          "jti": "c5592bbd-840a-4be4-9a8f-456b7c953526",
          "exp": 1567015812,
          "nbf": 0,
          "iat": 1567015512,
          "iss": "http://185.22.63.233:8080/auth/realms/exporter",
          "aud": "account",
          "sub": "cd3642b7-1a4b-4766-9922-75f9faa56c14",
          "typ": "Bearer",
          "azp": "exporter-ui-node",
          "auth_time": 0,
          "session_state": "5082e0fa-6dbd-4f49-b49d-afb393086d13",
          "acr": "1",
          "realm_access": {
              "roles": [
                  "offline_access",
                  "uma_authorization"
              ]
          },
          "resource_access": {
              "account": {
                  "roles": [
                      "manage-account",
                      "manage-account-links",
                      "view-profile"
                  ]
              }
          },
          "scope": "profile email",
          "client_id": "exporter-ui-node",

          "name": "Ivan Ivanov",
          "given_name": "Ivan",
          "family_name": "Ivanov",
          "preferred_username": "opa",
          "email_verified": false,
          "username": "opa",
      }
      */

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
  // CLIENT_CREDENTIALS
  // ======================================================
  /**
   * clientCredentials { client_id, client_secret }
   * @return {
        "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiZXhwb3J0ZXJfcG9ydGFsX2FwaSJdLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiLCJ0cnVzdCJdLCJleHAiOjE1NjczMDkwMDYsImF1dGhvcml0aWVzIjpbIlVJX0NMSUVOVCJdLCJqdGkiOiJiM2U5NzkwNy05NGNmLTQ4MjktODU1NS0wYjUxMGM4ZmFiNTUiLCJjbGllbnRfaWQiOiJjbGllbnRfdWlfYXBwIn0.dDHQ_TH_8JpdsJb_pPwQT2jJkOatKwTghaydLUx39yy1N4uRgRT_qoaiESA_c2LmOkpyXNESQcjmDmSuOrpM3dSHgSl6dtQJp022Vg5tCu-uLTAIjvUST8UUWURlT5HvFtuBTzQXitiXa66LFPo4Ye1kn0nxFQv8Ob5Eu9vA5ctBvFjqftA5zIb0QqmGl6d7TKOhXyA6SwXqdrmTJBW5j4_qDls_rQaiN4kwFxs1Ak-OFphwmLsmkz4JMG1rraMR3R2JxnuvVpEhuaz0tcBkzpgO07dwqwc39lafqTDtYGe559VpQBG1WBY-Hy2wrt7Jqsr1EvpvAByNBaZF7Fyuog",
        "token_type": "bearer",
        "expires_in": 43199,
        "scope": "read write trust",
        "jti": "b3e97907-94cf-4829-8555-0b510c8fab55"
    }
   */
  async authClientCredentials(clientCredentials = undefined) {
    try {
      return await this.send(
        this.urls.authSignin,
        {
          grant_type: GRANT_TYPES.CLIENT_CREDENTIALS,
        },
        {
          method: 'post',
          headers: {
            ...this.getClientCredentialsHeaders(clientCredentials),
            contentType: CONTENT_TYPES.FORM_URLENCODED,
          },
        },
      );
    } catch (error) {
      return this.catchAuthError(error);
    }
  }

  async sendWithClientCredentials(url, data, options = {}) {
    const {
      access_token,
      token_type,
    } = await this.authClientCredentials();

    return this.send(
      url,
      data,
      {
        ...options,
        headers: {
          ...options.headers,
          ...getHeadersByAuthType(access_token, token_type),
        },
      },
    );
  }

  // ======================================================
  // ADDITIONAL
  // ======================================================
  async authRevokeTokens(userId) {
    return this.sendWithClientCredentials(
      this.urls.authRevokeTokens,
      {
        userId,
        clientId: this.getClientInfo().client_id,
      },
      {
        method: 'DELETE',
      },
    );
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
          },
        },
      );
    } catch (error) {
      return this.catchAuthError(error);
    }
  }


  // ======================================================
  // SING_UP \ REGISTRATION
  // ======================================================
  async authSignup(userData) {
    try {
      return await this.sendWithClientCredentials(
        this.urls.authSignup,
        userData,
        {
          method: 'post',
        },
      );
    } catch (error) {
      return this.catchAuthError(error);
    }
  }
}

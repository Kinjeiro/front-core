import i18n from '../../common/utils/i18n-utils';
import {
  parseToUniError,
  ThrowableUniError,
} from '../../common/models/uni-error';

import {
  AUTH_TYPES,
  getHeadersByAuthType,
} from '../utils/auth-utils';
import { sendEndpointMethodRequest } from '../utils/send-server-request';


import serverConfig from '../server-config';

/**
 * Клиенсткая реализация протокола OAuth 2.0 Bearer
 * @param endpointServiceConfig
 * @returns {{ authValidate, authLogin }}
 */
export default class ServiceAuth {
  endpointServiceConfig = null;
  urls = {};

  constructor({
    endpointServiceConfig,
    urls,
  }) {
    this.endpointServiceConfig = endpointServiceConfig;

    this.urls = {
      authLogin: '/oauth/token',
      authRefresh: '/oauth/token',
      authValidate: '/oauth/user',
      authLogout: '/oauth/logout',
      ...urls,
    };
  }

  /*
   "access_token": "395549ac90cd6f37cbc28c6cb5b31aa8ffe2a22826831dba11d6baae9dafb07a",
   "refresh_token": "857896e0aab5b35456f6432ef2f812a344e2a3bab12d38b152ee3dd968442613",
   "expires_in": 299, seconds
   "token_type": "Bearer"
   */
  authLogin(username, password) {
    return sendEndpointMethodRequest(this.endpointServiceConfig,
      this.urls.authLogin, 'post',
      {
        // @NOTE: необходимо учитывать snake запись (_) это стандарт
        grant_type: 'password',
        username,
        password,
        client_id: serverConfig.server.features.auth.applicationClientInfo.id,
        client_secret: serverConfig.server.features.auth.applicationClientInfo.secret,
      },
    )
      // .then((results) => {
      //   // стандарт работает на секундах, а сервер на милисекундах
      //   // https://developers.google.com/identity/protocols/OAuth2UserAgent#validate-access-token
      //   // eslint-disable-next-line no-param-reassign
      //   results.expires_in *= 1000;
      //   return results;
      // })
      .catch((error) => {
        // eslint-disable-next-line no-param-reassign
        const uniError = parseToUniError(error);
        if (uniError.originalObject && uniError.originalObject.error_description) {
          let clientErrorMessage;

          switch (uniError.originalObject.error_description) {
            case 'Invalid resource owner credentials':
              clientErrorMessage = i18n('core:errors.wrongUserCredentials');
              break;
            case 'Missing required parameter: password':
              clientErrorMessage = i18n('core:errors.missingPassword');
              break;
            default:
              clientErrorMessage = uniError.originalObject.error_description;
          }
          uniError.clientErrorMessage = clientErrorMessage;
        }

        throw new ThrowableUniError(uniError);
      });
  }

  /*
   "access_token": "395549ac90cd6f37cbc28c6cb5b31aa8ffe2a22826831dba11d6baae9dafb07a",
   "refresh_token": "857896e0aab5b35456f6432ef2f812a344e2a3bab12d38b152ee3dd968442613",
   "expires_in": 299, seconds
   "token_type": "Bearer"
   */
  authRefresh(refreshToken) {
    return sendEndpointMethodRequest(this.endpointServiceConfig,
      this.urls.authRefresh, 'post',
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: serverConfig.server.features.auth.clientId,
        client_secret: serverConfig.server.features.auth.clientSecret,
      },
    )
      // .then((results) => {
      //   // стандарт работает на секундах, а сервер на милисекундах
      //   // eslint-disable-next-line no-param-reassign
      //   results.expires_in *= 1000;
      //   return results;
      // })
      ;
  }

  /*
   {
   "user_id": "59ba24251d1c69466ca3346b",
   "name": "ivanovI",
   "scope": "*"
   }
   */
  authValidate(token, authType = AUTH_TYPES.BEARER) {
    // todo @ANKU @LOW - заиспользовать разные типы
    return sendEndpointMethodRequest(this.endpointServiceConfig,
      this.urls.authValidate, 'get',
      null,
      null,
      {
        headers: getHeadersByAuthType(authType, token),
      },
    );
  }

  authLogout(token, authType = AUTH_TYPES.BEARER) {
    return sendEndpointMethodRequest(this.endpointServiceConfig,
      this.urls.authLogout, 'get',
      null,
      null,
      {
        headers: getHeadersByAuthType(authType, token),
      },
    );
  }
}

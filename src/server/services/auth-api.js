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
export default function factoryServices(endpointServiceConfig) {
  /*
   "access_token": "395549ac90cd6f37cbc28c6cb5b31aa8ffe2a22826831dba11d6baae9dafb07a",
   "refresh_token": "857896e0aab5b35456f6432ef2f812a344e2a3bab12d38b152ee3dd968442613",
   "expires_in": 3600,
   "token_type": "Bearer"
  */
  function authLogin(username, password) {
    return sendEndpointMethodRequest(endpointServiceConfig,
      '/api/oauth/token', 'post',
      {
        // @NOTE: необходимо учитывать snake запись (_) это стандарт
        grant_type: 'password',
        username,
        password,
        client_id: serverConfig.server.features.auth.applicationClientInfo.id,
        client_secret: serverConfig.server.features.auth.applicationClientInfo.secret,
      },
    )
      .catch((error) => {
        // eslint-disable-next-line no-param-reassign
        const uniError = parseToUniError(error);
        if (uniError.originalObject.error_description) {
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
   "expires_in": 3600,
   "token_type": "Bearer"
   */
  function authRefresh(refreshToken) {
    return sendEndpointMethodRequest(endpointServiceConfig,
      '/api/oauth/token', 'post',
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: serverConfig.server.features.auth.clientId,
        client_secret: serverConfig.server.features.auth.clientSecret,
      },
    );
  }

  /*
  {
   "user_id": "59ba24251d1c69466ca3346b",
   "name": "ivanovI",
   "scope": "*"
  }
  */
  function authValidate(token, authType = AUTH_TYPES.BEARER) {
    // todo @ANKU @LOW - заиспользовать разные типы
    return sendEndpointMethodRequest(endpointServiceConfig,
      '/api/oauth/user', 'get',
      null,
      null,
      {
        headers: getHeadersByAuthType(authType, token),
      },
    );
  }

  function authLogout(token, authType = AUTH_TYPES.BEARER) {
    return sendEndpointMethodRequest(endpointServiceConfig,
      '/api/oauth/logout', 'get',
      null,
      null,
      {
        headers: getHeadersByAuthType(authType, token),
      },
    );
  }

  return {
    authLogin,
    authRefresh,
    authValidate,
    authLogout,
  };
}

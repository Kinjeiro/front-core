/* eslint-disable camelcase,no-tabs */
import {
  parseToUniError,
  ThrowableUniError,
} from '../../../../../common/models/uni-error';
import { createUserFromData } from '../../../../../common/models/model-user';
import logger from '../../../../../server/helpers/server-logger';

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

// SINGLETON
const CLIENT_TOKENS_MAP = {};
function setClientAuthData(className, authData) {
  CLIENT_TOKENS_MAP[className] = {
    authData,
    authDataExpire: Date.now() + (authData.expires_in * 1000),
  };
}
function getClientAuthData(className) {
  const object = CLIENT_TOKENS_MAP[className];
  return object && object.authData;
}
function isClientAuthDataExpire(className) {
  const object = CLIENT_TOKENS_MAP[className];
  return !object || object.authDataExpire < Date.now();
}

/*
// http://185.22.63.233:8080/auth/realms/exporter/.well-known/openid-configuration
const test = {
  "issuer":                       "http://185.22.63.233:8080/auth/realms/exporter",
  "authorization_endpoint":       "http://185.22.63.233:8080/auth/realms/exporter/protocol/openid-connect/auth",
  "token_endpoint":               "http://185.22.63.233:8080/auth/realms/exporter/protocol/openid-connect/token",
  "token_introspection_endpoint": "http://185.22.63.233:8080/auth/realms/exporter/protocol/openid-connect/token/introspect",
  "introspection_endpoint":       "http://185.22.63.233:8080/auth/realms/exporter/protocol/openid-connect/token/introspect",
  "userinfo_endpoint":            "http://185.22.63.233:8080/auth/realms/exporter/protocol/openid-connect/userinfo",
  "end_session_endpoint":         "http://185.22.63.233:8080/auth/realms/exporter/protocol/openid-connect/logout",
  "jwks_uri":                     "http://185.22.63.233:8080/auth/realms/exporter/protocol/openid-connect/certs",
  "check_session_iframe":         "http://185.22.63.233:8080/auth/realms/exporter/protocol/openid-connect/login-status-iframe.html",
  "registration_endpoint":        "http://185.22.63.233:8080/auth/realms/exporter/clients-registrations/openid-connect",

  "grant_types_supported": ["authorization_code", "implicit", "refresh_token", "password", "client_credentials"],
  "response_types_supported": [
    "code",
    "none",
    "id_token",
    "token",
    "id_token token",
    "code id_token",
    "code token",
    "code id_token token",
  ],
  "subject_types_supported": ["public", "pairwise"],
  "id_token_signing_alg_values_supported": [
    "PS384",
    "ES384",
    "RS384",
    "HS256",
    "HS512",
    "ES256",
    "RS256",
    "HS384",
    "ES512",
    "PS256",
    "PS512",
    "RS512",
  ],
  "id_token_encryption_alg_values_supported": ["RSA-OAEP", "RSA1_5"],
  "id_token_encryption_enc_values_supported": ["A128GCM", "A128CBC-HS256"],
  "userinfo_signing_alg_values_supported": [
    "PS384",
    "ES384",
    "RS384",
    "HS256",
    "HS512",
    "ES256",
    "RS256",
    "HS384",
    "ES512",
    "PS256",
    "PS512",
    "RS512",
    "none",
  ],
  "request_object_signing_alg_values_supported": [
    "PS384",
    "ES384",
    "RS384",
    "ES256",
    "RS256",
    "ES512",
    "PS256",
    "PS512",
    "RS512",
    "none",
  ],
  "response_modes_supported": ["query", "fragment", "form_post"],

  "token_endpoint_auth_methods_supported": [
    "private_key_jwt",
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
  ],
  "token_endpoint_auth_signing_alg_values_supported": ["RS256"],
  "claims_supported": [
    "aud",
    "sub",
    "iss",
    "auth_time",
    "name",
    "given_name",
    "family_name",
    "preferred_username",
    "email",
  ],
  "claim_types_supported": ["normal"],
  "claims_parameter_supported": false,
  "scopes_supported": [
    "openid",
    "address",
    "email",
    "microprofile-jwt",
    "offline_access",
    "phone",
    "profile",
    "roles",
    "web-origins",
  ],
  "request_parameter_supported": true,
  "request_uri_parameter_supported": true,
  "code_challenge_methods_supported": ["plain", "S256"],
  "tls_client_certificate_bound_access_tokens": true,
}; */

/**
 * Клиенсткая реализация протокола OAuth 2.0 Bearer
 * PROTOCOL - https://tools.ietf.org/html/rfc6749#
 *
 * @param endpointServiceConfig
 * @returns {{ authValidate, authLogin }}
 */
export default class ServiceAuth extends CoreService {
  getUrls(customUrls) {
    return {
      ...serverConfig.server.features.auth.oauth2Urls,
      ...customUrls,
    };
  }

  // ======================================================
  // UTILS
  // ======================================================
  parseUserFromOpenidData(userDataClaims) {
    /*
      // todo @ANKU @LOW - прописать все эти костанты
      Standard Claims
      https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.5.1

      Member	              Type	  Description
      ---------------------------------------------
      sub	                  string  Subject - Identifier for the End-User at the Issuer.
      name	                string	End-User's full name in displayable form including all name parts, possibly including titles and suffixes, ordered according to the End-User's locale and preferences.
      given_name	          string	Given name(s) or first name(s) of the End-User. Note that in some cultures, people can have multiple given names; all can be present, with the names being separated by space characters.
      family_name	          string	Surname(s) or last name(s) of the End-User. Note that in some cultures, people can have multiple family names or no family name; all can be present, with the names being separated by space characters.
      middle_name	          string	Middle name(s) of the End-User. Note that in some cultures, people can have multiple middle names; all can be present, with the names being separated by space characters. Also note that in some cultures, middle names are not used.
      nickname	            string	Casual name of the End-User that may or may not be the same as the given_name. For instance, a nickname value of Mike might be returned alongside a given_name value of Michael.
      preferred_username	  string	Shorthand name by which the End-User wishes to be referred to at the RP, such as janedoe or j.doe. This value MAY be any valid JSON string including special characters such as @, /, or whitespace. The RP MUST NOT rely upon this value being unique, as discussed in Section 5.7.
      profile	              string	URL of the End-User's profile page. The contents of this Web page SHOULD be about the End-User.
      picture	              string	URL of the End-User's profile picture. This URL MUST refer to an image file (for example, a PNG, JPEG, or GIF image file), rather than to a Web page containing an image. Note that this URL SHOULD specifically reference a profile photo of the End-User suitable for displaying when describing the End-User, rather than an arbitrary photo taken by the End-User.
      website	              string	URL of the End-User's Web page or blog. This Web page SHOULD contain information published by the End-User or an organization that the End-User is affiliated with.
      email	                string	End-User's preferred e-mail address. Its value MUST conform to the RFC 5322 [RFC5322] addr-spec syntax. The RP MUST NOT rely upon this value being unique, as discussed in Section 5.7.
      email_verified	      boolean	True if the End-User's e-mail address has been verified; otherwise false. When this Claim Value is true, this means that the OP took affirmative steps to ensure that this e-mail address was controlled by the End-User at the time the verification was performed. The means by which an e-mail address is verified is context-specific, and dependent upon the trust framework or contractual agreements within which the parties are operating.
      gender	              string	End-User's gender. Values defined by this specification are female and male. Other values MAY be used when neither of the defined values are applicable.
      birthdate	            string	End-User's birthday, represented as an ISO 8601:2004 [ISO8601‑2004] YYYY-MM-DD format. The year MAY be 0000, indicating that it is omitted. To represent only the year, YYYY format is allowed. Note that depending on the underlying platform's date related function, providing just year can result in varying month and day, so the implementers need to take this factor into account to correctly process the dates.
      zoneinfo	            string	String from zoneinfo [zoneinfo] time zone database representing the End-User's time zone. For example, Europe/Paris or America/Los_Angeles.
      locale	              string	End-User's locale, represented as a BCP47 [RFC5646] language tag. This is typically an ISO 639-1 Alpha-2 [ISO639‑1] language code in lowercase and an ISO 3166-1 Alpha-2 [ISO3166‑1] country code in uppercase, separated by a dash. For example, en-US or fr-CA. As a compatibility note, some implementations have used an underscore as the separator rather than a dash, for example, en_US; Relying Parties MAY choose to accept this locale syntax as well.
      phone_number	        string	End-User's preferred telephone number. E.164 [E.164] is RECOMMENDED as the format of this Claim, for example, +1 (425) 555-1212 or +56 (2) 687 2400. If the phone number contains an extension, it is RECOMMENDED that the extension be represented using the RFC 3966 [RFC3966] extension syntax, for example, +1 (604) 555-1234;ext=5678.
      phone_number_verified boolean	True if the End-User's phone number has been verified; otherwise false. When this Claim Value is true, this means that the OP took affirmative steps to ensure that this phone number was controlled by the End-User at the time the verification was performed. The means by which a phone number is verified is context-specific, and dependent upon the trust framework or contractual agreements within which the parties are operating. When true, the phone_number Claim MUST be in E.164 format and any extensions MUST be represented in RFC 3966 format.
      address	              JSON object	End-User's preferred postal address. The value of the address member is a JSON [RFC4627] structure containing some or all of the members defined in Section 5.1.1.
        formatted                   Full mailing address, formatted for display or use on a mailing label. This field MAY contain multiple lines, separated by newlines. Newlines can be represented either as a carriage return/line feed pair ("\r\n") or as a single line feed character ("\n").
        street_address              Full street address component, which MAY include house number, street name, Post Office Box, and multi-line extended street address information. This field MAY contain multiple lines, separated by newlines. Newlines can be represented either as a carriage return/line feed pair ("\r\n") or as a single line feed character ("\n").
        locality                    City or locality component.
        region                      State, province, prefecture, or region component.
        postal_code                 Zip code or postal code component.
        country                     Country name component.
      updated_at	          number	Time the End-User's information was last updated. Its value is a JSON number representing the number of seconds from 1970-01-01T0:0:0Z as measured in UTC until the date/time.
    */

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

      // от Keycloak
      realm_access: {
        roles: realmRoles = [],
      } = {},
      resource_access: {
        account: {
          roles: accountRoles = [],
        } = {},
      } = {},

      // от Spring OAUTH
      user_name,
      authorities = [],
    } = userDataClaims;


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
      computedDisplayName: name,

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
      uniError.errorFrom = 'catchAuthError';

      throw new ThrowableUniError(uniError);
    }

    throw errorObject;
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
    logger.debug('ServiceAuth', 'authLogin', username);
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
      logger.debug('ServiceAuth', 'authRefresh', this.getUserId());
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
    // logger.log('ServiceAuth', 'authValidate');
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

      return await this.parseUserFromOpenidData(
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

  // ======================================================
  // USERINFO Claims
  // ======================================================
  /*
   "access_token": "395549ac90cd6f37cbc28c6cb5b31aa8ffe2a22826831dba11d6baae9dafb07a",
   "refresh_token": "857896e0aab5b35456f6432ef2f812a344e2a3bab12d38b152ee3dd968442613",
   "expires_in": 299, seconds
   "token_type": "Bearer"
   */
  async authUserInfo() {
    try {
      logger.log('ServiceAuth', 'authUserInfo', this.getUserId());
      return this.parseUserFromOpenidData(
        await this.sendWithAuth(
          this.urls.authUserInfo,
          undefined,
          {
            headers: {
              contentType: CONTENT_TYPES.FORM_URLENCODED,
            },
          },
        ),
      );
    } catch (error) {
      return this.catchAuthError(error);
    }
  }

  // ======================================================
  // LOGOUT
  // ======================================================
  async authLogout(token) {
    logger.log('ServiceAuth', 'authLogout', this.getUserId());
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
  async authClientCredentials(clientCredentials = undefined, force = false) {
    try {
      // могут быть расхожения в минификации (если не отключить минификацию имен классов)
      const className = this.constructor.name;

      if (force || isClientAuthDataExpire(className)) {
        logger.log('ServiceAuth', 'authClientCredentials', className);

        const authData = await this.send(
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
        setClientAuthData(className, authData);
      }
      return getClientAuthData(className);
    } catch (error) {
      return this.catchAuthError(error);
    }
  }

  async sendWithClientCredentials(url, data, options = {}) {
    try {
      const {
        access_token,
        token_type,
      } = await this.authClientCredentials();

      return await this.send(
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
    } catch (uniError) {
      if (uniError.responseStatusCode === 401) {
        // try again with force credentials reload
        const {
          access_token,
          token_type,
        } = await this.authClientCredentials(undefined, true);

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
      throw uniError;
    }
  }
}

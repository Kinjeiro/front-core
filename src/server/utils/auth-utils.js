import { appUrl } from '../../common/helpers/app-urls';

import serverConfig from '../server-config';

const tokenCookie = serverConfig.server.features.auth.tokenCookie;
const refreshTokenCookie = serverConfig.server.features.auth.refreshTokenCookie;
const authTypeCookie = serverConfig.server.features.auth.authTypeCookie;
const finalContextRoot = appUrl();

const OPTIONS = {
  path: finalContextRoot,
  isHttpOnly: true,
  // todo @ANKU @CRIT @MAIN @DEBUG - secure: false
  isSecure: false,
};

// https://habrahabr.ru/company/dataart/blog/262817/
export const AUTH_TYPES = {
  BEARER: 'Bearer',
};

export function setAuthCookies(
  response,
  accessToken,
  refreshToken,
  expiresInMilliseconds = undefined,
  authType = AUTH_TYPES.BEARER,
) {
  // server.state(tokenCookie, {
  //   //expire: 365 * 24 * 60 * 60 * 1000,   // 1 year
  //   //ttl: 365 * 24 * 60 * 60 * 1000,   // 1 year
  //   //isSecure: false,
  //   path: finalContextRoot
  // });
  // server.state(userTypeCookie, {
  //   path: finalContextRoot
  // });


  // return response
  //   .state(tokenCookie, accessToken, {
  //     ...OPTIONS,
  //     // todo @ANKU @LOW - date.toUTCString() ??? проверить в каком формате hapi проставляет
  //     expire: expiresIn,
  //   })
  //   .state(refreshTokenCookie, refreshToken, OPTIONS)
  //   .state(authTypeCookie, authType, OPTIONS);

  response.state(tokenCookie, accessToken, {
    ...OPTIONS,
    // todo @ANKU @LOW - date.toUTCString() ??? проверить в каком формате hapi проставляет
    expire: expiresInMilliseconds,
    ttl: expiresInMilliseconds,
  });
  response.state(refreshTokenCookie, refreshToken, OPTIONS);
  response.state(authTypeCookie, authType, OPTIONS);

  return response;
}

function getState(req, name) {
  const { state } = req;
  // eslint-disable-next-line no-nested-ternary
  return state
    ? typeof state === 'function'
      ? state(name)
      : state[name]
    : undefined;
}

export function getToken(req) {
  return getState(req, tokenCookie);
}
export function getRefreshToken(req) {
  return getState(req, refreshTokenCookie);
}
export function getAuthType(req) {
  return getState(req, authTypeCookie);
}

export function getHeadersByAuthType(authType, token) {
  const headers = {};
  // eslint-disable-next-line default-case
  switch (authType) {
    case AUTH_TYPES.BEARER:
      headers.authorization = `Bearer ${token}`;
      break;
  }

  return headers;
}


export function clearAuthCookie(res) {
  res.unstate(tokenCookie, OPTIONS);
  res.unstate(refreshTokenCookie, OPTIONS);
  res.unstate(authTypeCookie, OPTIONS);

  return res;
}

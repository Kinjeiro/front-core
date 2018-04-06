import { appUrl } from '../../common/helpers/app-urls';

import logger from '../helpers/server-logger';

import {
  storeRequestContext,
  getRequestContext,
} from './request-context-utils';

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
  requestForProxyNewToken = null,
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
  //     expire: expiresIn,
  //   })
  //   .state(refreshTokenCookie, refreshToken, OPTIONS)
  //   .state(authTypeCookie, authType, OPTIONS);

  response.state(tokenCookie, accessToken, {
    ...OPTIONS,
    expire: expiresInMilliseconds,
    ttl: expiresInMilliseconds,
  });
  response.state(refreshTokenCookie, refreshToken, OPTIONS);
  response.state(authTypeCookie, authType, OPTIONS);

  // чтобы если отработал refresh_token проксирующие запросы уже слались через новый токен
  if (requestForProxyNewToken) {
    logger.debug(`Set accessToken for proxy for request.id: ${requestForProxyNewToken.id}`);
    storeRequestContext(requestForProxyNewToken, accessToken, requestForProxyNewToken.id);
  }

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
  // получем и удаляем из хранилища
  const updatedToken = getRequestContext(req, req.id, true);
  if (updatedToken) {
    logger.debug(`Use accessToken for proxy from request.id: ${req.id}\n${updatedToken}`);
  }
  return updatedToken || getState(req, tokenCookie);
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
  if (authType) {
    switch (authType.toLowerCase()) {
      case AUTH_TYPES.BEARER.toLowerCase():
        headers.authorization = `Bearer ${token}`;
        break;
    }
  }

  return headers;
}


export function clearAuthCookie(res) {
  res.unstate(tokenCookie, OPTIONS);
  res.unstate(refreshTokenCookie, OPTIONS);
  res.unstate(authTypeCookie, OPTIONS);

  return res;
}

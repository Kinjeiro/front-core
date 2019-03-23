/* eslint-disable prefer-destructuring */
import logger from '../helpers/server-logger';

import {
  storeRequestContext,
  getRequestContext,
} from './request-context-utils';

import serverConfig from '../server-config';
import {
  setCookie,
  getCookie,
  clearCookie,
} from './hapi-utils';

const tokenCookie = serverConfig.server.features.auth.tokenCookie;
const refreshTokenCookie = serverConfig.server.features.auth.refreshTokenCookie;
const authTypeCookie = serverConfig.server.features.auth.authTypeCookie;
// const contextPath = appUrl();

export const TOKEN_QUERY_PARAM_NAME = serverConfig.server.features.auth.callbackAccessTokenParam;

// https://habrahabr.ru/company/dataart/blog/262817/
export const AUTH_TYPES = {
  BEARER: 'Bearer',
};

export function setAuthCookies(
  response,
  accessToken,
  refreshToken,
  expiresInMilliseconds,
  refreshTokenExpiresInMilliseconds,
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

  setCookie(response, tokenCookie, accessToken, {
    expire: expiresInMilliseconds,
    ttl: expiresInMilliseconds,
  });
  if (typeof refreshToken !== 'undefined') {
    setCookie(response, refreshTokenCookie, refreshToken, {
      expire: refreshTokenExpiresInMilliseconds,
      ttl: refreshTokenExpiresInMilliseconds,
    });
  }
  setCookie(response, authTypeCookie, authType);

  // чтобы если отработал refresh_token проксирующие запросы уже слались через новый токен
  if (requestForProxyNewToken) {
    logger.debug(`Set accessToken for proxy for request.id: ${requestForProxyNewToken.id}`);
    storeRequestContext(requestForProxyNewToken, accessToken, requestForProxyNewToken.id);
  }

  return response;
}

export function getToken(request) {
  // получем и удаляем из хранилища
  const updatedToken = getRequestContext(request, request.id, true);
  if (updatedToken) {
    logger.debug(`Use accessToken for proxy from request.id: ${request.id}\n${updatedToken}`);
  }
  return updatedToken
    || request.query[serverConfig.server.features.auth.callbackAccessTokenParam]
    || getCookie(request, tokenCookie);
}
export function getRefreshToken(req) {
  return req.query[serverConfig.server.features.auth.callbackRefreshTokenLifeParam]
    || getCookie(req, refreshTokenCookie);
}
export function getAuthType(req) {
  return getCookie(req, authTypeCookie);
}

export function getHeadersByAuthType(token, authType = AUTH_TYPES.BEARER) {
  const headers = {};
  // eslint-disable-next-line default-case
  if (authType) {
    switch (authType.toLowerCase()) {
      case AUTH_TYPES.BEARER.toLowerCase():
        headers.authorization = `Bearer ${token}`;
        break;
      default:
    }
  }

  return headers;
}


export function clearAuthCookie(res) {
  clearCookie(res, tokenCookie);
  clearCookie(res, refreshTokenCookie);
  clearCookie(res, authTypeCookie);
  return res;
}

import { appUrl } from '../../common/helpers/app-urls';

import serverConfig from '../server-config';

const tokenCookie = serverConfig.server.features.auth.tokenCookie;
const refreshTokenCookie = serverConfig.server.features.auth.refreshTokenCookie;
const finalContextRoot = appUrl();

const OPTIONS = {
  path: finalContextRoot,
  isHttpOnly: true,
  // todo @ANKU @CRIT @MAIN @DEBUG - secure: false
  isSecure: false,
};

export function setAuthCookies(response, accessToken, refreshToken, expiresIn = undefined) {
  // server.state(tokenCookie, {
  //   //expire: 365 * 24 * 60 * 60 * 1000,   // 1 year
  //   //isSecure: false,
  //   path: finalContextRoot
  // });
  // server.state(userTypeCookie, {
  //   path: finalContextRoot
  // });

  return response
    .state(tokenCookie, accessToken, {
      ...OPTIONS,
      // todo @ANKU @LOW - date.toUTCString() ??? проверить в каком формате hapi проставляет
      expire: expiresIn,
    })
    .state(refreshTokenCookie, refreshToken, OPTIONS);
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


export function clearAuthCookie(res) {
  return res
    .unstate(tokenCookie, OPTIONS)
    .unstate(refreshTokenCookie, OPTIONS);
}

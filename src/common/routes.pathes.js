import { joinUri } from './utils/uri-utils';

export const ASSETS = 'assets';

export const CORE_ROUTES_NAMES = {
  ACCESS_DENIED: 'access',
  ERROR: 'error',
  LOGIN: 'login',
  STUB: 'stub',
};

/**
 * @deprecated - use CORE_ROUTES_NAMES
 * @type {{ACCESS_DENIED: string, ERROR: string, LOGIN: string, STUB: string}}
 */
export const STUB_ROUTES_NAMES = CORE_ROUTES_NAMES;

// не нужно дергать и добавлять contextPath так как он уже при history basename добавляется автоматом
// export const PATH_INDEX = appUrl('/');
export const PATH_INDEX = '/';
export const PATH_ACCESS_DENIED = joinUri(PATH_INDEX, CORE_ROUTES_NAMES.ACCESS_DENIED);
export const PATH_ERROR_PAGE = joinUri(PATH_INDEX, CORE_ROUTES_NAMES.ERROR);

export const PATH_STUB = joinUri(PATH_INDEX, CORE_ROUTES_NAMES.STUB);
// ======================================================
// LOGIN
// ======================================================
export const PARAM_RETURN_URL = 'return';

export function pathGetLoginPage(returnUrl = undefined) {
  return joinUri(
    PATH_INDEX,
    CORE_ROUTES_NAMES.LOGIN,
    {
      [PARAM_RETURN_URL]: returnUrl,
    },
  );
}

export const PATH_LOGIN_PAGE = pathGetLoginPage();



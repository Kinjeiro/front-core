import { joinUri } from './utils/uri-utils';
import * as authPaths from './modules/module-auth/routes-paths-auth';

export const ASSETS = 'assets';
export const HOT_RELOAD_PREFIX = 'hot';

export const CORE_ROUTES_NAMES = {
  ACCESS_DENIED: 'access',
  ERROR: 'error',
  LOGIN: 'login',
  STUB: 'stub',
  auth: 'auth',
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
// AUTH
// ======================================================
/**
 * @deprecated - use /src/modules/module-auth/routes-paths-auth PARAM__RETURN_URL
 */
export const PARAM_RETURN_URL = authPaths.PARAM__RETURN_URL;
/**
 * @deprecated - use /src/modules/module-auth/routes-paths-auth pathGetSigninPage
 */
export const pathGetLoginPage = authPaths.pathGetSigninPage;
/**
 * @deprecated - use /src/modules/module-auth/routes-paths-auth PATH_AUTH_SIGNIN
 */
export const PATH_LOGIN_PAGE = authPaths.PATH_AUTH_SIGNIN;



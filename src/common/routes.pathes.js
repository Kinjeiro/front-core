import { joinUri } from './utils/uri-utils';
import * as authPaths from '../modules/module-auth/common/subModule/routes-paths-auth';

export const ASSETS = 'assets';
export const HOT_RELOAD_PREFIX = 'hot';

export const CORE_ROUTES_NAMES = {
  ACCESS_DENIED: 'access',
  ERROR: 'error',
  LOGIN: 'login',
  STUB: 'stub',
  auth: 'auth',
};

// не нужно дергать и добавлять contextPath так как он уже при history basename добавляется автоматом
// export const PATH_INDEX = appUrl('/');
export const PATH_INDEX = '/';
export const PATH_ACCESS_DENIED = joinUri(PATH_INDEX, CORE_ROUTES_NAMES.ACCESS_DENIED);
export const PATH_ERROR_PAGE = joinUri(PATH_INDEX, CORE_ROUTES_NAMES.ERROR);

export const PATH_STUB = joinUri(PATH_INDEX, CORE_ROUTES_NAMES.STUB);

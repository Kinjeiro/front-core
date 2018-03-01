import appUrl from '../helpers/app-urls';

export const ASSETS = 'assets';

export const STUB_ROUTES_NAMES = {
  ACCESS_DENIED: 'access',
  ERROR: 'error',
  LOGIN: 'login',
};

export const PATH_INDEX = appUrl('/');
export const PATH_ACCESS_DENIED = appUrl(PATH_INDEX, STUB_ROUTES_NAMES.ACCESS_DENIED);
export const PATH_ERROR_PAGE = appUrl(PATH_INDEX, STUB_ROUTES_NAMES.ERROR);

// ======================================================
// LOGIN
// ======================================================
export const PARAM_RETURN_URL = 'return';

export function pathGetLoginPage(returnUrl = undefined) {
  return appUrl(
    PATH_INDEX,
    STUB_ROUTES_NAMES.LOGIN,
    {
      [PARAM_RETURN_URL]: returnUrl,
    },
  );
}

export const PATH_LOGIN_PAGE = pathGetLoginPage();



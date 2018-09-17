import { joinPath } from '../../../../common/utils/uri-utils';

export const ROUTES_NAMES = {
  signin: 'signin',
  signup: 'signup',
  forgot: 'forgot',
  reset: 'reset',
};

export const PATH_AUTH_INDEX = '/';

export const PATH_AUTH_SIGNIN = joinPath(PATH_AUTH_INDEX, ROUTES_NAMES.signin);

export const PARAM__RETURN_URL = 'return';
export function pathGetSigninPage(returnUrl = undefined) {
  return returnUrl
    ? joinPath(
      PATH_AUTH_SIGNIN,
      {
        [PARAM__RETURN_URL]: returnUrl,
      },
    )
    : PATH_AUTH_SIGNIN;
}


export const PATH_AUTH_SIGNUP = joinPath(PATH_AUTH_INDEX, ROUTES_NAMES.signup);

export const PATH_AUTH_FORGOT = joinPath(PATH_AUTH_INDEX, ROUTES_NAMES.forgot);

// смотри auth-server\src\api\auth\auth.js::forgot::PARAM__RESET_PASSWORD_TOKEN
export const PARAM__RESET_PASSWORD_TOKEN = 'resetToken';
export const PATH_AUTH_RESET = joinPath(PATH_AUTH_INDEX, ROUTES_NAMES.reset);


export default ROUTES_NAMES;

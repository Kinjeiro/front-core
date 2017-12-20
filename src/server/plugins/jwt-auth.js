import { appUrl } from '../../common/helpers/app-urls';
import { parseToUniError } from '../../common/models/uni-error';
import i18n from '../../common/utils/i18n-utils';

import serverConfig from '../server-config';

import logger from '../helpers/server-logger';
import {
  continueWithCredentials,
  continueWithoutCredentials,
} from '../utils/credentials-utils';

import {
  setAuthCookies,
  getToken,
} from '../utils/auth-utils';

/**
 * token - это токен сотрудника банка
 *
 * @param server
 * @param pluginOptions
 * @returns {{authenticate: authenticate}}
 */
export function remoteJwt(server, pluginOptions) {
  // set options in CoreServerRunner::initServerAuthStrategy
  const {
    authStrategy,
    noAuthRequireMatcherFn,
  } = pluginOptions;

  const tokenParam = serverConfig.server.features.auth.tokenParam;

  async function authenticate(request, reply) {
    const { url: { pathname, path } } = request;
    const tokenParamValue = request.query[tokenParam];

    // Проставляем через url
    if (tokenParamValue) {
      logger.log(i18n('core:Проставляем token из params в cookie'), tokenParamValue);


      // todo @ANKU @CRIT @MAIN @BUG_OUT @hapi - при обновлении на hapi@16.1.1 куки перестают сохраняться

      // todo @ANKU @LOW - но куки на мобильных не поддерживаются, можно через sessionStorage клиента сделать
      // Redirect user to the same page and set token cookie

      return setAuthCookies(
        reply.redirect(appUrl(pathname)),
        tokenParamValue,
      );
    }

    if (noAuthRequireMatcherFn && noAuthRequireMatcherFn(pathname)) {
      logger.log(i18n('core:Авторизация не нужна для'), path);
      return continueWithoutCredentials(reply);
    }

    // Получаем из куков КАЖДЫЙ РАЗ параметры и отправляем их каждый раз на auth сервер, чтобы он расшифровал токен и
    // дал нам credential информацию, которую мы потом можем использовать внутри запросов для проверки прав
    const token = getToken(request);

    if (!authStrategy) {
      logger.warn(['info', 'auth'], 'Do not have authStrategy');
      return continueWithoutCredentials(reply);
    } else if (!token) {
      logger.warn(['info', 'auth'], 'Do not have a token');
      return continueWithoutCredentials(reply);
    }

    // ПРИ КАЖДОМ ЗАПРОСЕ идет обращение на auth-api сервер и расшифровывается токен каждый раз

    // может быть как промисом так и обычным ответом (если инфа защита внутри токена)
    let checkResult = authStrategy(token);
    if (!checkResult.then) {
      checkResult = Promise.resolve(checkResult);
    }

    return checkResult
      .then((credentials) => {
        // logger.log(['info'], {
        //   event: 'LOGIN_ATTEMPT',
        //   username: credentials.getUserName(),
        //   timestamp: new Date(),
        //   token,
        // });
        logger.log(`LOGIN_ATTEMPT username: ${credentials.getUserName()}`);

        return continueWithCredentials(reply, credentials);
      })
      .catch((error) => {
        logger.error(['error', 'auth'], i18n('core:Ошибка во время проверки авторизации'), parseToUniError(error));
        return continueWithoutCredentials(reply, parseToUniError(error, {
          clientErrorMessage: i18n('core:Произошла ошибка во время проверки авторизации.'),
        }));
      });
  }

  return { authenticate };
}

export const AUTH_SCHEME_NAME = 'remote-jwt';

function register(server, options, next) {
  server.auth.scheme(AUTH_SCHEME_NAME, remoteJwt);
  next();
}

register.attributes = {
  name: AUTH_SCHEME_NAME,
};

export default register;

import merge from 'lodash/merge';

import { createMemoryHistory, match } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

// ======================================================
// COMMON
// ======================================================
// import { joinUri } from '../../../common/utils/uri-utils';
import { executeVariable } from '../../../common/utils/common';
import i18n from '../../../common/utils/i18n-utils';

import clientConfig from '../../../common/client-config';
import {
  PATH_ERROR_PAGE,
} from '../../../common/constants/routes.pathes';
import {
  ThrowableUniError,
  parseToUniError,
} from '../../../common/models/uni-error';

import { STATE_CLIENT_CONFIG_PARAM } from '../../../common/constants/sync-consts';
import {
  appUrl,
  cutContextPath,
} from '../../../common/helpers/app-urls';

import moduleAuth from '../../../modules/module-auth/common/subModule';


import CB from '../../../common/ComponentsBase';

// ======================================================
// SERVER
// ======================================================
import serverConfig from '../../server-config';
import logger from '../../helpers/server-logger';

import {
  isAuthenticated,
  // getCredentialsFromRequest,
  getAuthUniErrorFromRequest,
} from '../../utils/credentials-utils';
import {
  storeUniErrorInRequestContext,
  getUniErrorFromRequestContext,
} from '../../utils/request-context-utils';


// ======================================================
// LOCAL
// ======================================================
import createCorePrepareState from './prepare-state';
import createRenderHandler from './html';

const CONTEXT_ID_PARAM = 'contextId';

// const contextPath = serverConfig.common.app.contextRoot;

export function register(server, pluginOptions, next) {
  const {
    clientRunner,
    createProjectPrepareState,
    loginPath,
    noAuthRequireMatcherFn,
    noNeedCredentialsPageMatcherFn,
  } = pluginOptions;

  clientRunner.initAllComponents(CB);

  // eslint-disable-next-line consistent-return
  const handler = async function handlerFn(request, reply) {
    try {
      // const {
      //   contextPath,
      // } = pluginOptions;
      const {
        url: {
          path,
          pathname,
          query: {
            [CONTEXT_ID_PARAM]: contextIdParam,
          },
        },
        // originalUrl,
      } = request;

      logger.log(i18n('core:Start render index page'));

      // Начальное состояние store которое передасться потом на клиент
      const finalClientConfig = merge(
        {},
        clientConfig,
        {
          common: {
            isServer: false,
          },
        },
      );

      const defaultState = {
        app: {
          error: false,
        },
        userInfo: {
          userData: null,
        },
        [STATE_CLIENT_CONFIG_PARAM]: finalClientConfig,
      };

      let reduxGlobalState = { ...defaultState };

      // ======================================================
      // ACCESS REDIRECT
      // ======================================================
      const isAuthTurnOn = serverConfig.common.features.auth && serverConfig.common.features.auth.globalAuth !== false;
      const routePath = cutContextPath(pathname);

      if (isAuthTurnOn) {
        if (!noAuthRequireMatcherFn(routePath) && !noNeedCredentialsPageMatcherFn(routePath)) {
          const isAuth = isAuthenticated(request);
          const authUniError = getAuthUniErrorFromRequest(request);

          if (authUniError || !isAuth) {
            if (authUniError && authUniError.isNotFound) {
              throw new ThrowableUniError({
                ...authUniError,
                clientErrorMessage: i18n('core:errors.authServerNotResponse'),
              });
            } else if (authUniError || !isAuth) {
              // значит просто ошибка прав
              // const contextId = storeUniErrorInRequestContext(request, authUniError || createUniError({
              //   clientErrorMessage: i18n('core:Не авторизованы'),
              //   code: 401,
              // }));
              // logger.warn(i18n('core:Не авторизован, redirect на страницу нехватки прав'));
              // return reply.redirect(`${joinUri('/', contextPath, PATH_ACCESS_DENIED)}?${CONTEXT_ID_PARAM}=${contextId}`);

              const loginPathFinal = appUrl(executeVariable(loginPath));
              const notReturnUrl = [
                appUrl(''),
                appUrl('/'),
                loginPathFinal,
              ];

              const returnUrlStr = notReturnUrl.includes(path)
                ? ''
                // нужно вырезать contextPath так как его будет использовать роутинг на клиенте
                : `?${moduleAuth.paths.PARAM__RETURN_URL}=${encodeURIComponent(routePath)}`;
              logger.warn(i18n('core:errors.notAuthorize'));
              return reply.redirect(`${loginPathFinal}${returnUrlStr}`);
            }
          }
        }
      } else {
        logger.warn(i18n('core:!!!WARNING!!! Auth is turn OFF'));
      }

      // ======================================================
      // if CONTEXT UNI ERROR exists
      // ======================================================
      // теперь проверяем, если мы пришли через ошибку с контектом (к примеру, http://localhost:8080/access?contextId=1498239508038:KinjeiroROCK:3528:j4a53vmc:10003)
      // и достаем контекст и кладем его в глобальный стайт, чтобы на клиенте правильно его отобразить
      reduxGlobalState.globalUniError = getUniErrorFromRequestContext(request, contextIdParam, true);

      // ======================================================
      // STORE STATE
      // ======================================================
      reduxGlobalState = await createCorePrepareState(request, server, reduxGlobalState, pluginOptions);
      // будем обрабатывать ошибку на равне со всеми
      // try {
      reduxGlobalState = await createProjectPrepareState(request, server, reduxGlobalState, pluginOptions);
      // } catch (error) {
      //  logger.error(error);
      //  reduxGlobalState.globalUniError = parseToUniError(error, {
      //    message: i18n('core:Ошибка prepareState')
      //  });
      // }

      // ======================================================
      // CREATE STORE + HISTORY + ROUTES
      // ======================================================
      // const memoryHistory = createMemoryHistory(originalUrl);
      // todo @ANKU @LOW @BUG_OUT @react-router - не поддерживают basename в memory history
      // https://github.com/ReactTraining/history/issues/409#issuecomment-329479076
      // https://stackoverflow.com/a/42208727/344172

      const basename = serverConfig.common.app.contextRoot;
      const location = basename && pathname
        ? pathname.replace(new RegExp(`^/?${basename}/`, 'g'), '/')
        : pathname;

      const memoryHistory = createMemoryHistory(location);

      // const store = createClientStore(memoryHistory, reduxGlobalState);
      const store = clientRunner.createStore(memoryHistory, reduxGlobalState);
      const history = syncHistoryWithStore(memoryHistory, store);
      // const routes = createProjectRoutes(store);
      const routes = clientRunner.getRoutes(store);

      // ======================================================
      // MATCH PLUGIN REQUESTS
      // ======================================================
      match({
        history,
        routes,
        // todo @ANKU @CRIT @MAIN - проверить есть request.path (только path без папарметров) а есть request.url.path (с params)
        location: pathname,
      }, createRenderHandler(reply, store, server, pluginOptions));
    } catch (error) {
      logger.error(error);

      const contextId = storeUniErrorInRequestContext(request, parseToUniError(error));
      return reply.redirect(`${appUrl(PATH_ERROR_PAGE)}?${CONTEXT_ID_PARAM}=${contextId}`);
    }
  };

  server.route({ method: 'GET', path: '/{whateverPath?}', handler }); // root route
  server.route({ method: 'GET', path: '/{whateverPath*}', handler }); // hack to support several slashes in path
  next();
}

register.attributes = {
  name: 'pages/index',
};

export default register;

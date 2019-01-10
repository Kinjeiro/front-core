import React from 'react';
import Boom from 'boom';
import { RouterContext } from 'react-router';
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';
// import { readFileSync } from 'jsonfile';

// init into \src\server\plugins\i18n.js
import i18nInstance from 'i18next';

// ======================================================
// UTILS
// ======================================================
import { isValidPath } from '../../../common/utils/uri-utils';
import { ASSETS } from '../../../common/constants/routes.pathes';
import {
  GLOBAL_CLIENT_STORE_INITIAL_STATE,
  GLOBAL_I18N_CLIENT_BUNDLES,
} from '../../../common/constants/sync-consts';
import { appUrl } from '../../../common/helpers/app-urls';

import serverConfig from '../../server-config';
import logger from '../../helpers/server-logger';
import { readFile } from '../../utils/file-utils';

// ======================================================
// COMPONENTS
// ======================================================
import I18NProvider from '../../../common/containers/I18NProvider/I18NProvider';
import { executeVariable } from '../../../common/utils/common';

const template = require('./html.ejs');

// // todo @ANKU @LOW - в константы
// const manifestPath = `${process.cwd()}/.build/assets/manifest.json`;

function formatHtml(code) {
  if (Array.isArray(code)) {
    return code.map(codeItem => formatHtml(codeItem)).join('\n');
  }
  if (React.isValidElement(code)) {
    return renderToString(code);
  }
  if (isValidPath(code)) {
    // return require(code);
    return readFile(code);
  }
  return code;
}

export default function createRenderHandler(
  reply,
  store,
  server = null,
  options,
) {
  const {
    preLoader,
  } = options || {};
  return (error, redirectLocation, renderProps) => {
    if (error) {
      console.error(error);
      return reply(Boom.badImplementation());
    }

    const { staticAssets, headHtml, bodyHtml } = options;

    if (redirectLocation) {
      return reply().redirect(
        appUrl(redirectLocation.pathname, redirectLocation.search),
      );
    }

    if (renderProps) {
      // значит произошел match роутинга
      let page;

      try {
        let appCode = null;
        // const assetsManifest = readFileSync(manifestPath);
        // console.warn('ANKU , assetsManifest', assetsManifest);

        if (serverConfig.common.isServerSideRendering) {
          appCode = (
            <Provider store={ store }>
              <I18NProvider i18nInstance={ i18nInstance }>
                <RouterContext { ...renderProps } />
              </I18NProvider>
            </Provider>
          );
        } else {
          logger.warn('SERVER SIDE RENDERING has been turn off');
        }

        const state = store.getState();

        // ======================================================
        // i18n part
        // ======================================================
        const locale = i18nInstance.language;

        const resourcesByNamespace = i18nInstance.options.ns.reduce(
          (result, namespace) => {
            result[namespace] = i18nInstance.getResourceBundle(
              locale,
              namespace,
            );
            return result;
          },
          {},
        );
        const i18nClientBundle = {
          locale,
          resourcesByNamespace,
          whitelist: i18nInstance.options.whitelist,
          ns: i18nInstance.options.ns,
        };
        // const i18nServer = i18n.cloneInstance();
        // i18nServer.changeLanguage(locale);
        const preloaderFinal = executeVariable(preLoader, null, state, i18nClientBundle);

        // ======================================================
        // RENDER TEMPLATE
        // ======================================================
        page = template({
          assetsDir: appUrl(ASSETS),
          staticAssets,
          content: appCode && formatHtml(appCode),
          GLOBAL_CLIENT_STORE_INITIAL_STATE,
          GLOBAL_I18N_CLIENT_BUNDLES,
          storeState: JSON.stringify(state),
          i18nClientBundle: JSON.stringify(i18nClientBundle),
          // contextRoot: appUrl(),
          unescapedHeadHtml: formatHtml(headHtml),
          unescapedBodyHtml: formatHtml(bodyHtml),
          preloader: preloaderFinal,
          // assetsManifest,
        });
      } catch (error) {
        logger.error('error during render process', error.stackTrace || error);

        return reply(Boom.badImplementation());
      }
      return reply(page);
    }

    // if you are here,
    // this means routes do not contain default route
    logger.error('No page found');
    return reply(Boom.notFound());
  };
}

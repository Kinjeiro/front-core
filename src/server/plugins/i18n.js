import i18n from 'i18next';
import acceptLanguageParser from 'accept-language-parser';

import { I18N_LANGUAGE_COOKIE_NAME } from '../../common/constants/sync-consts';

import logger from '../helpers/server-logger';

export const DEFAULT_PLUGIN_OPTIONS = {
  useCookieForDetect: true,
  cookieName: I18N_LANGUAGE_COOKIE_NAME,
  detectLngFromHeaders: false,
  detectLngFromPath: 0,
  detectLngFromQueryString: false,
  detectLngQS: 'setLng',
  forceDetectLngFromPath: false,
};

/**
 * Усорвешенствованная библиотека hapi-i18next (репо версия устарела для i18next)
 *
 * @param server
 * @param options
 * @param next
 */
function register(server, options = {}, next) {
  const {
    pluginOptions,
    cookieOptions,
  } = options;

  const finalI18nextOptions = Object.assign(
    {},
    DEFAULT_PLUGIN_OPTIONS,
    pluginOptions,
  );

  if (finalI18nextOptions.useCookieForDetect) {
    server.state(
      finalI18nextOptions.cookieName,
      Object.assign({}, {
        strictHeader: false,
        isSecure: false,
        isHttpOnly: false,
        clearInvalid: true,
      }, cookieOptions),
    );
  }

  /**
   * i18n.getInstance
   * @description Returns fresh i18next instance for each request, to prevent cache pollution
   */
  server.method('i18n.getInstance',
    () => require('i18next'));

  /**
   * i18n.translateWithCache
   * @description This method is a facade for i18next's bundled 't' method. We wrap it so that we can
   * pass an extra language parameter for Hapi server.method caching (so you can generate keys based on languages
   * and avoid cache pollution)
   */
  server.method('i18n.translateWithCache',
    (key, lng, opts) => i18n.t(key, opts));


  function isLanguageSupported(language) {
    const supported = i18n.options.whitelist;
    if ((!supported.length && language) || (supported.indexOf(language) > -1)) {
      return true;
    }
    return false;
  }

  function trySetLanguage(language) {
    return isLanguageSupported(language) ? language : undefined;
  }

  function detectLanguageFromHeaders(request) {
    let langs;
    const langHeader = request.headers['accept-language'];

    if (langHeader) {
      langs = acceptLanguageParser.parse(langHeader);
      langs.sort((a, b) => b.q - a.q);
      return langs.map((lang) => lang.code);
    }

    return [];
  }

  function detectLanguageFromQS(request) {
    // Use the query param name specified in options, defaults to lang
    return request.query[finalI18nextOptions.detectLngQS];
  }

  function detectLanguageFromPath(request) {
    const parts = request.url.path.slice(1).split('/');
    if (parts.length > finalI18nextOptions.detectLngFromPath) {
      return parts[finalI18nextOptions.detectLngFromPath];
    }
  }

  function detectLanguageFromCookie(request) {
    return request.state[finalI18nextOptions.cookieName] || null;
  }

  server.ext('onPreHandler', (request, reply) => {
    try {
      // todo @ANKU @LOW @BUG_OUT @hapi - если внутри server.ext падает ошибка - то падает неинформативная "UnhandledPromiseRejectionWarning: Unhandled promise rejection" и приходится все в try catch оборачивать
      let headerLangs;
      let language;
      let temp;

      if (!language && typeof finalI18nextOptions.detectLngFromPath === 'number') {
        // if force is true, then we set lang even if it is not in supported languages list
        temp = detectLanguageFromPath(request);
        if (finalI18nextOptions.forceDetectLngFromPath || isLanguageSupported(temp)) {
          language = temp;
        }
      }

      if (!language && finalI18nextOptions.detectLngFromQueryString) {
        temp = detectLanguageFromQS(request);
        language = trySetLanguage(temp);
      }

      if (!language && finalI18nextOptions.useCookieForDetect) {
        // Reads language if it was set from previous session or recently by client
        temp = detectLanguageFromCookie(request);
        language = trySetLanguage(temp);
      }

      if (!language && finalI18nextOptions.detectLngFromHeaders) {
        headerLangs = detectLanguageFromHeaders(request);
        headerLangs.some((headerLang) => {
          language = !!trySetLanguage(headerLang);
          return !!language;
        });
      }

      if (!language) {
        language = i18n.options.fallbackLng[0];
      }

      if (language && i18n.language !== language) {
        i18n.changeLanguage(language, () => {
          reply.continue();
        });
      } else {
        reply.continue();
      }
    } catch (error) {
      logger.error(error);
    }
  });

  next();
}

register.attributes = {
  name: 'hapi-i18next',
};

export default register;

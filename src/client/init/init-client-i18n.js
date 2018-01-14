import merge from 'lodash/merge';
import i18next from 'i18next';
// import Backend from 'i18next-node-fs-backend';
import XHR from 'i18next-xhr-backend';
// import Backend from 'i18next-sync-fs-backend';
import Cache from 'i18next-localstorage-cache';
import LanguageDetector from 'i18next-browser-languagedetector';
import moment from 'moment';

import clientConfig from '../../common/client-config';
import { ASSETS } from '../../common/constants/routes.pathes';
import { joinUri } from '../../common/utils/uri-utils';
import { setCookie } from '../../common/utils/cookie';
import appUrl from '../../common/helpers/app-urls';
import { init as initI18nUtils } from '../../common/utils/i18n-utils';
import { I18N_LANGUAGE_COOKIE_NAME } from '../../common/constants/sync-consts';

import { getI18nClientBundles } from '../get-global-data';

export const DEFAULT_OPTIONS = {
  debug: true,

  whitelist: ['en', 'ru'],
  fallbackLng: 'en',
  load: 'languageOnly',
  nonExplicitWhitelist: true, // используем только первые два символа en, а не полные коды En-en

  ns: ['core'],
  defaultNS: 'core',

  backend: {
    // path where resources get loaded from
    // loadPath: `/${ASSETS}/i18n/{{lng}}/{{ns}}.json`,
    loadPath: `/${ASSETS}/i18n/{{lng}}/{{ns}}.js`,
    parse: (data) => {
      let jsonData;
      try {
        // for json file
        jsonData = JSON.parse(data);
      } catch (error) {
        // for js file
        // window.module = { exports: '' };
        // todo @ANKU @CRIT @MAIN @hack - по хорошему нужно на бэке сделать апи и через него выдавать
        jsonData = eval(data);
      }
      return jsonData;
    },

    // todo @ANKU @LOW - подумать нужно ли подключать дополнительно
    // // path to post missing resources
    // addPath: '/i18n/{{lng}}/{{ns}}.missing.json',

    // jsonIndent to use when storing json files
    jsonIndent: 2,
  },

  detector: {
    lookupCookie: I18N_LANGUAGE_COOKIE_NAME,
  },

  // preload: ['en'],

  // //disables user language detection
  // lng: 'en',



  // resources: {
  //  en: {
  //    translation: {
  //      "key": "hello world"
  //    }
  //  },
  //  de: {
  //    translation: {
  //      "key": "hello welt"
  //    }
  //  }
  // },

  //
  // whitelist: ['en', 'ru'],
  // fallbackLng: 'ru',
  // //disables user language detection
  // lng: 'ru',
  //
  // // have a common namespace used around the full app
  //
  // interpolation: {
  //  escapeValue: false // not needed for react!!
  // },
  //
  // resources: resBundle


};

export function i18nNextInit(options = {}) {
  const {
    locale,
    resourcesByNamespace,
    whitelist,
    ns,
  } = getI18nClientBundles();

  i18next
    .use(XHR)
    .use(Cache)
    .use(LanguageDetector);

  i18next.init(merge(
    {},
    DEFAULT_OPTIONS,
    clientConfig.common.features.i18n.i18nextOptions,
    {
      backend: {
        loadPath: clientConfig.common.features.i18n.assetsLoadPath
          ? joinUri(ASSETS, clientConfig.common.features.i18n.assetsLoadPath)
          : DEFAULT_OPTIONS.backend.loadPath,
      },
    },
    // динамические данные
    {
      whitelist: whitelist || DEFAULT_OPTIONS.whitelist,
      ns: ns || DEFAULT_OPTIONS.ns,
    },
    options,
  ));
  moment.locale(locale);

  i18next.on('languageChanged', (lng) => {
    setCookie(I18N_LANGUAGE_COOKIE_NAME, lng, {
      path: appUrl(),
    });
    moment.locale(locale);
  });

  Object.keys(resourcesByNamespace).forEach((namespace) => {
    i18next.addResourceBundle(locale, namespace, resourcesByNamespace[namespace], true);
  });
  i18next.changeLanguage(locale);

  return i18next;
}

export function translate(key, params) {
  return i18next.t(key, params);
}

const i18nInstance = i18nNextInit();
initI18nUtils(i18nInstance);

export default i18nInstance;

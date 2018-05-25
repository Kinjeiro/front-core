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
// import { joinUri } from '../../common/utils/uri-utils';
import { setCookie } from '../../common/utils/cookie';
import appUrl from '../../common/helpers/app-urls';
import { init as initI18nUtils } from '../../common/utils/i18n-utils';
import { I18N_LANGUAGE_COOKIE_NAME } from '../../common/constants/sync-consts';

import { getI18nClientBundles } from '../get-global-data';

const loadUrl = appUrl(
  ASSETS,
  clientConfig.common.features.i18n.assetsLoadPath
    || '/i18n/{{lng}}/{{ns}}.js',
);

/*
function loadLocales(url, options, callback, data) {
  try {
    debugger;
    console.warn('ANKU , url', url);
    console.warn('ANKU , url result', `${joinUri('/', ASSETS, 'i18n', url)}`);
    // const waitForLocale = require(`bundle!./locales/${url}.json`);
    // const waitForLocale = require(`bundle!${url}`);
    const waitForLocale = require(`bundle-loader!../../../static/i18n/${url}`);

    /!*
     [H:\__CODER__\_W_Reagentum_\__Gasprom__\Project_Rascenka\formRascenka_FrontCore\src\static\i18n]
     [H:\__CODER__\_W_Reagentum_\__Gasprom__\Project_Rascenka\formRascenka_FrontCore\src\client\init\lib]
     [H:\__CODER__\_W_Reagentum_\__Gasprom__\Project_Rascenka\formRascenka_FrontCore\src\client\init\node_modules]
     [H:\__CODER__\_W_Reagentum_\__Gasprom__\Project_Rascenka\formRascenka_FrontCore\src\client\lib]
     [H:\__CODER__\_W_Reagentum_\__Gasprom__\Project_Rascenka\formRascenka_FrontCore\src\client\node_modules]
     [H:\__CODER__\_W_Reagentum_\__Gasprom__\Project_Rascenka\formRascenka_FrontCore\src\lib]
     [H:\__CODER__\_W_Reagentum_\__Gasprom__\Project_Rascenka\formRascenka_FrontCore\src\node_modules]
     [H:\__CODER__\_W_Reagentum_\__Gasprom__\Project_Rascenka\lib]
     [H:\__CODER__\_W_Reagentum_\__Gasprom__\Project_Rascenka\node_modules]
     [H:\__CODER__\_W_Reagentum_\__Gasprom__\lib]
     [H:\__CODER__\_W_Reagentum_\__Gasprom__\node_modules]
     [H:\__CODER__\_W_Reagentum_\lib]
     [H:\__CODER__\_W_Reagentum_\node_modules]
     [H:\__CODER__\lib]
     [H:\__CODER__\node_modules]
    *!/
    const waitForLocale = require(`bundle-loader!static/i18n/${url}`);
    waitForLocale((locale) => {
      debugger;
      console.warn('ANKU , locale', locale);
      callback(locale, { status: '200' });
    });
  } catch (e) {
    console.error(e);
    callback(null, { status: '404' });
  }
}
*/

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
    loadPath: loadUrl,
    parse: (data) => {
      let jsonData;
      try {
        // for json file
        jsonData = JSON.parse(data);
      } catch (error) {
        // for js file
        // window.module = { exports: '' };
        // todo @ANKU @CRIT @MAIN @hack - по хорошему нужно на бэке сделать апи и через него выдавать
        // eslint-disable-next-line no-eval
        jsonData = eval(data);
      }
      return jsonData;
    },

    // loadPath: '{{lng}}/{{ns}}.js',
    // ajax: loadLocales,

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
    // {
    //   backend: {
    //     loadPath: loadUrl,
    //   },
    // },
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

  if (resourcesByNamespace) {
    Object.keys(resourcesByNamespace).forEach((namespace) => {
      i18next.addResourceBundle(locale, namespace, resourcesByNamespace[namespace], true);
    });
  }
  i18next.changeLanguage(locale);

  return i18next;
}

export function translate(key, params) {
  return i18next.t(key, params);
}

const i18nInstance = i18nNextInit();
initI18nUtils(i18nInstance);

export default i18nInstance;

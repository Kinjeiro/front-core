import merge from 'lodash/merge';
import i18n from 'i18next';
import Backend from 'i18next-sync-fs-backend';

import { ASSETS } from '../../common/constants/routes.pathes';
import { joinUri } from '../../common/utils/uri-utils';
import { init as initI18nUtils } from '../../common/utils/i18n-utils';

import config from '../server-config';

export const DEFAULT_I18NEXT_OPTIONS = {
  whitelist: ['ru', 'en'],
  fallbackLng: 'en',
  ns: ['core'],

  backend: {
    // loadPath: 'assets/i18n/{{lng}}/{{ns}}.json',
    // todo @ANKU @CRIT @MAIN - build const
    // loadPath: joinUri(process.cwd(), '.build', ASSETS, 'i18n/{{lng}}/{{ns}}.json'),
    loadPath: joinUri(process.cwd(), '.build', ASSETS, 'i18n/{{lng}}/{{ns}}.js'),
    // addPath: 'assets/i18n/{{lng}}/{{ns}}.missing.json',
    jsonIndent: 2,
  },
  // чтобы загрузить синхронно
  initImmediate: false,
};

const finalI18nextOptions = merge(
  {},
  DEFAULT_I18NEXT_OPTIONS,
  config.common.features.i18n.i18nextOptions,
  {
    backend: {
      loadPath: config.common.features.i18n.assetsLoadPath
        ? joinUri(process.cwd(), '.build', ASSETS, config.common.features.i18n.assetsLoadPath)
        : DEFAULT_I18NEXT_OPTIONS.backend.loadPath,
    },
  },
);

i18n
  .use(Backend)
  .init(finalI18nextOptions);

if (!i18n.language) {
  i18n.language = i18n.options.fallbackLng[0];
}

export default initI18nUtils(i18n);



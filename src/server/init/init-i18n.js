import merge from 'lodash/merge';
import i18n from 'i18next';
import Backend from 'i18next-sync-fs-backend';
import moment from 'moment';

import { ASSETS } from '../../common/constants/routes.pathes';
import { init as initI18nUtils } from '../../common/utils/i18n-utils';

import config from '../server-config';
import { joinFilePath } from '../utils/file-utils';

export const DEFAULT_I18NEXT_OPTIONS = {
  // whitelist: ['ru', 'en'],
  // fallbackLng: 'en',
  // ns: ['core'],

  backend: {
    // loadPath: 'assets/i18n/{{lng}}/{{ns}}.json',
    // todo @ANKU @CRIT @MAIN - build const
    // loadPath: joinUri(process.cwd(), '.build', ASSETS, 'i18n/{{lng}}/{{ns}}.json'),
    loadPath: joinFilePath(process.cwd(), '.build', ASSETS, 'i18n/{{lng}}/{{ns}}.js'),
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
        ? joinFilePath(process.cwd(), '.build', ASSETS, config.common.features.i18n.assetsLoadPath)
        : DEFAULT_I18NEXT_OPTIONS.backend.loadPath,
    },
  },
);

// todo @ANKU @CRIT @MAIN - переключение локали на сервере по куки - https://github.com/i18next/i18next/issues/918 (по аналогии с express)
// console.warn('ANKU , finalI18nextOptions', finalI18nextOptions);

i18n
  .use(Backend)
  .init(finalI18nextOptions);


if (!i18n.language) {
  i18n.language = i18n.options.fallbackLng[0];
}

moment.locale(i18n.language);

export default initI18nUtils(i18n);



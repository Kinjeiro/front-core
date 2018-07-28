import config from '../../server-config';

import apiPluginFactory from '../../utils/api-plugin-factory';

export default apiPluginFactory(
  config.common.apiConfig.health,
  (data, request, reply) => reply(`${config.common.appId}@${config.common.appVersion}`),
  {
    routeConfig: {
      // для этого обработчика авторизация не нужна
      auth: false,
    },
  },
);



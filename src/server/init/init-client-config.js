import { initConfig } from '../../common/client-config';

import serverConfig from '../server-config';

/*
 @NOTE: Важно! Конфиги сервера serverConfig нельзя получать в корне, так как они инициализуются чуть позже, поэтому их используем внутри метод register
 */
// конфиги разрешенными на клиенте, заполняются данными из полного конфига
const clientConfig = {
  common: serverConfig.common,
  client: serverConfig.client,
};

initConfig(clientConfig);

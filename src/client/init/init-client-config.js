import { initConfig } from '../../common/client-config';

import { getClientConfig } from '../get-global-data';

export default async function initClientConfig() {
  const clientConfig = await getClientConfig();
  initConfig(clientConfig);
}

import crypto from 'crypto';

import serverConfig from '../server-config';

export function hashData(code) {
  return crypto.createHmac('sha1', serverConfig.server.features.serverUtils.hashSalt)
    .update(code)
    .digest('hex');
}

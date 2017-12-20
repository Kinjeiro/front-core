import logger from '../../helpers/server-logger';

import getUserInfoDefault from './default';

export default function factoryStrategy(services, otherStrategies, strategyOptions) {
  return (request) => {
    logger.log(['strategy'], 'get userInfo strategy');
    return getUserInfoDefault(request);
  };
}

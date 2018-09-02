import logger from '../../helpers/server-logger';

import getUserInfoDefault from './default';

export default function factoryStrategy(servicesContext) {
  return (request) => {
    logger.log(['strategy'], 'get userInfo strategy');
    return getUserInfoDefault(request);
  };
}

import logger from '../../helpers/server-logger';

import authDefault from './default';

export default function factoryAuthStrategy(services, otherStrategies, strategyOptions) {
  return (token) => {
    logger.log(`Auth strategy. Token:\n${token}`);
    return authDefault(token, services.authUserService);
  };
}




import factoryAuthStrategy from './auth';
import factoryCheckPermissionStrategy from './check-permission';
import factoryUserInfoStrategy from './user-info';


export default function createStrategies(servicesContext) {
  const strategies = {};

  // сделано последовательео, так как некоторые стратегии могут зависеть от предущих
  strategies.authStrategy = factoryAuthStrategy(servicesContext);
  strategies.checkPermissionStrategy = factoryCheckPermissionStrategy(servicesContext);
  strategies.userInfoStrategy = factoryUserInfoStrategy(servicesContext);

  return strategies;
}


import factoryAuthStrategy from './auth';
import factoryCheckPermissionStrategy from './check-permission';
import factoryUserInfoStrategy from './user-info';


export default function createStrategies(services, strategiesOptions) {
  const strategies = {};

  // сделано последовательео, так как некоторые стратегии могут зависеть от предущих
  strategies.authStrategy = factoryAuthStrategy(services, strategies, strategiesOptions);
  strategies.checkPermissionStrategy = factoryCheckPermissionStrategy(services, strategies, strategiesOptions);
  strategies.userInfoStrategy = factoryUserInfoStrategy(services, strategies, strategiesOptions);

  return strategies;
}


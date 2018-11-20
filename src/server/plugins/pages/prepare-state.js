import { isAuthenticated } from '../../utils/credentials-utils';

/**
 * загрузка необходимых вначале общих данных из различных сервисов (в данном случае organizations и profiles
 *
 * @param request
 * @param server
 * @param defaultState
 * @param pluginOptions
 * @returns {{}}
 */
export default async function prepareState(request, server, defaultState = {}, pluginOptions = {}) {
  const {
    strategies,
  } = pluginOptions;

  return {
    ...defaultState,
    userInfo: {
      ...defaultState.userInfo,
      userData: isAuthenticated(request)
        ? await strategies.userInfoStrategy(request)
        : null,
    },
  };
}

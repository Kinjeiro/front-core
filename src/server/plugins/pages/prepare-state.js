import {
  UNI_ERROR_FROM,
  parseToUniError,
} from '../../../common/models/uni-error';
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

  let userData = null;
  // eslint-disable-next-line no-shadow,prefer-destructuring
  let globalUniError = defaultState.globalUniError;

  try {
    userData = isAuthenticated(request)
      ? await strategies.userInfoStrategy(request)
      : null;
  } catch (error) {
    globalUniError = parseToUniError(error, { errorFrom: UNI_ERROR_FROM.FROM_SERVER });
  }

  return {
    ...defaultState,
    globalUniError,
    userInfo: {
      ...defaultState.userInfo,
      userData,
    },
  };
}

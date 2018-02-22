import logger from '../../helpers/client-logger';
import Notifications from '../../helpers/notifications';
import { parseToUniError } from '../../models/uni-error';

// это улучшеная версия redux-thunk
// также аналог можно посмотреть тут - https://github.com/reactjs/redux/blob/5b94a18f560eff60ce37ae01d1b16387bcfb8e3a/examples/real-world/middleware/api.js
function isPromise(promise) {
  // noinspection Eslint
  return promise && (Promise.resolve(promise) == promise || promise.then);
}

const promiseMiddleware = ({ dispatch, getState }) => next => action => {
  // действие по умолчанию
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }

  const {
    payload,
    type,
    types,
    // бывает что сервер если что-то не найдено отвечает ошибкой с http кодом и ее не нужно показывать как глобальную
    errorIsAnswer,
    ...other
  } = action;


  if (!isPromise(payload)) {
    return next(action);
  }

  const promise = payload;

  // @guide - можно подать название экшена в поле type, либо 3 названия для отслеживания разных статусов promise запроса
  const [REQUEST, SUCCESS, FAILURE] = Array.isArray(type)
    ? type
    : types || [null, type, null];

  if (REQUEST) {
    // если есть разбиение на стадии - сначала сообщаем, что мы начали загрузку
    next({
      payload,
      ...other,
      type: REQUEST,
    });
  }

  const actionPromise = typeof promise === 'function'
    ? promise(dispatch, getState)
    : promise;

  actionPromise
    .then((payload) => {
      const uniError = parseToUniError(payload, undefined, { withoutException: true });
      if (uniError) {
        return Promise.reject(uniError);
      }
      next(
        {
          payload,
          ...other,
          type: SUCCESS,
        },
      );
    })
    .catch((errors) => {
      if (!Array.isArray(errors)) {
        // eslint-disable-next-line no-param-reassign
        errors = [errors];
      }

      let resultUniError = null;

      errors.forEach((error) => {
        const uniError = parseToUniError(error);
        logger.error('MIDDLEWARE ERROR:', uniError, uniError.stack);

        if (!resultUniError) {
          // первый error отдаем
          resultUniError = uniError;
        }

        if (!errorIsAnswer) {
          Notifications.notify(uniError.clientErrorMessages);
        }
      });

      next(
        {
          payload,
          ...other,
          error: resultUniError,
          type: FAILURE,
        },
      );

      // todo @ANKU @LOW - есть код, где используется then от action и если ошибка они не должны срабатывать
      // return Promise.reject();
      // return resultUniError;
    });

  return actionPromise;
};

export default promiseMiddleware;

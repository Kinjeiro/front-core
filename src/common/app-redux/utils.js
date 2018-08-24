import forOwn from 'lodash/forOwn';
import isNil from 'lodash/isNil';
import mergeWith from 'lodash/mergeWith';
import uniqueId from 'lodash/uniqueId';

import { objectValues } from '../utils/common';


/*
Набор основных методов для работы с redux.
Взяты с https://github.com/reactjs/redux/blob/master/docs/recipes/reducers/RefactoringReducersExample.md
и немного модернизированы
*/

/*
@guide - Немного теории

- rootReducer - корневой редьюсер
- sliceReducer - самостоятельная часть какого-нибудь редьюсера
- caseReducer - функция, которая обрабатывает один конкретный тип action
*/

export const ACTION_PAYLOAD_FIELD = 'payload';
export const ACTION_ID_FIELD = 'uuid';

/**
 * Проверяет по action
 *
 * @param reducerFunction
 * @param reducerPredicate
 * @returns {function(*=, *=)}
 */
export function createFilteredReducer(reducerFunction, reducerPredicate) {
  return (state, action) => {
    const isInitializationCall = state === undefined;
    const shouldRunWrappedReducer = reducerPredicate(action, state) || isInitializationCall;
    return shouldRunWrappedReducer
      ? reducerFunction(state, action)
      : state;
  };
}


export function createFilteredByIdReducer(
  reducerFunction,
  {
    idField = null,

    generateInitId = false,
    exactlyId = null,
    actionIdField = null,
    stateIdField = null,
  },
) {
  return (state, action) => {
    let newState = state;

    const defaultIdField = idField || actionIdField || stateIdField || ACTION_ID_FIELD;

    const isInitializationCall = state === undefined;
    const shouldRunWrappedReducer = isNil(exactlyId)
        ? action[actionIdField || defaultIdField] === state[stateIdField || defaultIdField]
        : action[actionIdField || defaultIdField] === exactlyId;

    if (isInitializationCall || shouldRunWrappedReducer) {
      newState = reducerFunction(state, action);
    }

    if (isNil(newState[stateIdField]) && generateInitId) {
      newState = {
        ...newState,
        [stateIdField || defaultIdField]: exactlyId || uniqueId(),
      };
    }

    return newState;
  };
}



export function createForFieldCaseReducer(fieldName, state, action) {
  return {
    ...state,
    [fieldName]: action[ACTION_PAYLOAD_FIELD],
  };
}

/**
 * Удобное создание редьюсеров (без лишних switch-case условий)
 *
 * @param initialState
 * @param handlers - key - action type, value - caseReducer
 * @param fieldsHandlers
 * @returns {reducer}
 */
export function createReducer(initialState, handlers = {}, fieldsHandlers = {}, defaultHandler) {
  return function reducer(state = initialState, action = {}) {
    // fieldsHandlers
    const updatedFields = {};
    forOwn(fieldsHandlers, (fieldReducer, fieldName) => {
      const prevFieldState = state[fieldName];
      const newFieldState = fieldReducer(prevFieldState, action);
      // сравнение по ссылки
      if (newFieldState !== prevFieldState) {
        updatedFields[fieldName] = newFieldState;
      }
    });
    if (Object.keys(updatedFields).length > 0) {
      state = {
        ...state,
        ...updatedFields,
      };
    }

    // handlers
    if (action.type in handlers) {
      let caseReducer = handlers[action.type];
      if (typeof caseReducer === 'string') {
        // если редьюсер это имя поля, то нужно все, что вернется в payload пихнуть под этой переменной
        caseReducer = createForFieldCaseReducer.bind(this, caseReducer);
      }
      return caseReducer(state, action, action[ACTION_PAYLOAD_FIELD]);
    } else if (defaultHandler) {
      if (typeof defaultHandler !== 'function') {
        throw new Error('"defaultHandler" should be function for createReducer function');
      }
      return defaultHandler(state, action, action[ACTION_PAYLOAD_FIELD]);
    }
    return state;
  };
}

export function createAllTypesReducer(TYPES, reducer) {
  const typesValues = objectValues(TYPES);
  return (state, action) => {
    if (typesValues.indexOf(action.type) >= 0) {
      return reducer(state, action);
    }
    return state;
  };
}
export function createAllTypesMapCollectionReducer(TYPES, reducer, actionIdField = ACTION_ID_FIELD, createIfNotExist = true) {
  return createAllTypesReducer(TYPES, (state, action) => {
    const uuid = action[actionIdField];
    const mapItem = state[uuid];
    if (typeof mapItem !== 'undefined' || createIfNotExist) {
      return {
        ...state,
        [uuid]: reducer(mapItem, action),
      };
    }
    return state;
  });
}



export function getFetchTypes(fetchTypes) {
  if (!Array.isArray(fetchTypes)) {
    return {
      fetch: null,
      success: fetchTypes,
      fail: null,
    };
  }
  return {
    fetch: fetchTypes[0],
    success: fetchTypes[1],
    fail: fetchTypes[2],
  };
}
function customizer(objValue, newValue) {
  if (Array.isArray(objValue)) {
    return objValue.concat(newValue);
  }
  return newValue;
}
export function getFetchTypesByType(...arrayOfFetchTypes) {
  if (!Array.isArray(arrayOfFetchTypes[0])) {
    // getFetchTypesByType(FETCH, SUCCESS, FAILED) - без массива массивов
    arrayOfFetchTypes = [arrayOfFetchTypes];
  }

  return arrayOfFetchTypes.reduce((result, fetchTypes) => {
    if (!fetchTypes) {
      return result;
    }
    const types = getFetchTypes(fetchTypes);
    return mergeWith(result, types, customizer);
  }, {
    fetch: [],
    success: [],
    fail: [],
  });
}

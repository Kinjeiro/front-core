import { createReducer } from '../../utils';
import { createStatusReducer } from '../../helpers';

// ======================================================
// INITIAL STATE
// ======================================================
export const initialState = {
  language: null,
  whitelist: [],

  actionI18NChangeLanguageStatus: undefined,
};


// ======================================================
// TYPES
// ======================================================
const PREFIX = 'i18n-info';
export const TYPES = {
  I18N_INFO_INIT: `${PREFIX}/I18N_INFO_INIT`,

  I18N_CHANGE_LANGUAGE_FETCH:     `${PREFIX}/I18N_CHANGE_LANGUAGE_FETCH`,
  I18N_CHANGE_LANGUAGE_SUCCESS:   `${PREFIX}/I18N_CHANGE_LANGUAGE_SUCCESS`,
  I18N_CHANGE_LANGUAGE_FAIL:      `${PREFIX}/I18N_CHANGE_LANGUAGE_FAIL`,
};


// ======================================================
// ACTION CREATORS
// ======================================================
export const actions = {
  actionI18nInfoInit(whitelist, language = undefined) {
    return {
      type: TYPES.I18N_INFO_INIT,
      payload: {
        whitelist,
        language,
      },
    };
  },

  actionI18NChangeLanguage(apiI18NChangeLanguage, language) {
    return {
      types: [TYPES.I18N_CHANGE_LANGUAGE_FETCH, TYPES.I18N_CHANGE_LANGUAGE_SUCCESS, TYPES.I18N_CHANGE_LANGUAGE_FAIL],
      payload: apiI18NChangeLanguage(language)
        .then((newLanguage) => newLanguage || language),
    };
  },
};

export function getBindActions({
  apiI18NChangeLanguage,
} = {}) {
  return {
    ...actions,
    actionI18NChangeLanguage: actions.actionI18NChangeLanguage.bind(this, apiI18NChangeLanguage),
  };
}

// ======================================================
// REDUCER
// ======================================================
const reducer = createReducer(
  initialState,
  {
    [TYPES.I18N_INFO_INIT]:
      (state, action, { whitelist, language }) => ({
        ...state,
        whitelist,
        language: language || state.language,
      }),
    [TYPES.I18N_CHANGE_LANGUAGE_SUCCESS]:
      (state, action, language) => ({
        ...state,
        language,
      }),
  },
  {
    actionI18NChangeLanguageStatus: createStatusReducer(
      TYPES.I18N_CHANGE_LANGUAGE_FETCH, TYPES.I18N_CHANGE_LANGUAGE_SUCCESS, TYPES.I18N_CHANGE_LANGUAGE_FAIL,
    ),
  },
);

export default reducer;

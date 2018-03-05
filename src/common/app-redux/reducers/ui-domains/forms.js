import simpleModuleFactory from '../../helpers/simple-module-factory';

// ======================================================
// INITIAL STATE
// ======================================================
export const initialState = {};

const module = simpleModuleFactory('forms', { initialState });
// ======================================================
// TYPES
// ======================================================
export const TYPES = module.TYPES;

// ======================================================
// ACTION CREATORS
// ======================================================
export const actions = {
  actionFormInit: module.actions.actionModuleItemInit,
  actionFormUpdate: module.actions.actionModuleItemUpdate,
  actionFormRemove: module.actions.actionModuleItemRemove,
};

// ======================================================
// REDUCER
// ======================================================
export const formReducer = module.entityReducer;
export default module.moduleReducer;

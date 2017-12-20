import simpleModuleFactory from '../../simple-module-factory';

// ======================================================
// INITIAL STATE
// ======================================================
export const initialState = {};

const module = simpleModuleFactory('forms', { dataInitialState: initialState });
// ======================================================
// TYPES
// ======================================================
export const TYPES = module.TYPES;

// ======================================================
// ACTION CREATORS
// ======================================================
export const actions = {
  actionFormInit: module.actions.actionInit,
  actionFormUpdate: module.actions.actionUpdate,
  actionFormRemove: module.actions.actionRemove,
};

// ======================================================
// REDUCER
// ======================================================
export const formReducer = module.entityReducer;
export default module.moduleReducer;

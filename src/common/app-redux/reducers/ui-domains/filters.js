import simpleModuleFactory from '../../helpers/simple-module-factory';

// ======================================================
// INITIAL STATE
// ======================================================
export const initialState = {};

const module = simpleModuleFactory('filters', { initialState });
// ======================================================
// TYPES
// ======================================================
export const TYPES = module.TYPES;

// ======================================================
// ACTION CREATORS
// ======================================================
export const actions = {
  actionFilterInit: module.actions.actionModuleItemInit,
  actionFilterUpdate: module.actions.actionModuleItemUpdate,
  actionFilterRemove: module.actions.actionModuleItemRemove,
};

// ======================================================
// REDUCER
// ======================================================
export const filtersReducer = module.entityReducer;
export default module.moduleReducer;

import simpleModuleFactory from '../../helpers/simple-module-factory';

// ======================================================
// INITIAL STATE
// ======================================================
export const initialState = {};

const module = simpleModuleFactory('filters', { dataInitialState: initialState });
// ======================================================
// TYPES
// ======================================================
export const TYPES = module.TYPES;

// ======================================================
// ACTION CREATORS
// ======================================================
export const actions = {
  actionFilterInit: module.actions.actionInit,
  actionFilterUpdate: module.actions.actionUpdate,
  actionFilterRemove: module.actions.actionRemove,
};

// ======================================================
// REDUCER
// ======================================================
export const filtersReducer = module.entityReducer;
export default module.moduleReducer;

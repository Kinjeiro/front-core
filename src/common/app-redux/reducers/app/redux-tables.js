import createTablesModule from '../../helpers/create-tables-module';

const MODULE = createTablesModule();

export const TYPES = MODULE.TYPES;
export const getBindActions = MODULE.getBindActions;
export const reducer = MODULE.moduleReducer;
export default reducer;

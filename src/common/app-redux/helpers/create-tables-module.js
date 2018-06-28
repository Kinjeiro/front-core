import simpleModuleFactory from './simple-module-factory';

import ReduxTable from './ReduxTable';

/**
 *
 * @param tableModuleName
 * @param ReduxTableClass
 * @param api
 * @returns {{
    PREFIX,
    entityReducer,
    moduleItemReducer,
    moduleReducer,
    TYPES,
    getBindActions,
    actions - добавляется еще три метода к табличным, чтобы инициализировать таблицу
      actionModuleItemInit(entityId, data = undefined)
      actionModuleItemUpdate(entityId, data)
      actionModuleItemRemove(entityId)
  }}
 */
export default function createTablesModule(tableModuleName = 'tables', ReduxTableClass = ReduxTable, api = undefined) {
  const reduxTable = new ReduxTableClass((globalState, tableUuid) => {
    // todo @ANKU @LOW - может красивее сделать? явно вызывать селекторы?
    // simple module selector
    const moduleItem = globalState[tableModuleName].byIds[tableUuid];
    return (moduleItem || {}).data;
  });
  const module = simpleModuleFactory(tableModuleName, reduxTable.getModule());

  const apiFinal = {
    ...(api || {}),
    ...reduxTable.getApi(),
  };

  if (Object.keys(apiFinal).length > 0) {
    module.actions = module.getBindActions(apiFinal);
  }
  return module;
}

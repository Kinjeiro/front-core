import createTablesModule from '../../helpers/create-tables-module';

const MODULE = createTablesModule();

export const TYPES = MODULE.TYPES;
/**
 Сама мапа таблиц уже добавлена в рутовый редьюсер под именем tables.
 Поэтому от этого файла достаточно только actions

 Нужно в контейнере инициализровать таблицу через метод с уникальным TABLE_ID
 actionModuleItemInit(TABLE_ID)
 и можно пользоваться всеми экщенами

 Экшены
 actionModuleItemInit(entityId, data = undefined)
 actionModuleItemUpdate(entityId, data)
 actionModuleItemRemove(entityId)

 actionClearFilters(tableUuid)

 actionChangeRecordsSelected(tableUuid, recordIds, selected)
 actionChangeRecordsSelectedAll(type, isSelectedAll)
 actionClearRecordSelection(type)

 actionLoadRecords(tableUuid, meta = undefined, filters = undefined, forceUpdate = false)
 actionEditRecord(tableUuid, recordId, patchOperations)
 actionBulkChangeStatus(tableUuid, meta, selectedIds, isSelectedAll, newStatus, oldStatus)
*/
export const getBindActions = MODULE.getBindActions;
export const reducer = MODULE.moduleReducer;
export default reducer;

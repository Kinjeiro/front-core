import createTablesModule from '../../helpers/create-tables-module';

const MODULE = createTablesModule();

export const TYPES = MODULE.TYPES;
/**
 Сама мапа таблиц уже добавлена в рутовый редьюсер под именем tables.
 Поэтому от этого файла достаточно только actions

 Нужно в контейнере инициализровать таблицу через метод с уникальным TABLE_ID
 actionModuleItemInit(TABLE_ID)
 и можно пользоваться всеми экщенами
 либо просто обернуть в декоратор - \src\common\utils\decorators\react-class\redux-table.jsx

 Экшены
 actionModuleItemInit(tableUuid, data = undefined)
 actionModuleItemUpdate(tableUuid, data)
 actionModuleItemRemove(tableUuid)

 Если meta=null|false или filters=null|false - это сбрасывает значения
 actionLoadRecords(tableUuid, meta = undefined, filters = undefined, forceUpdate = false)
 actionEditRecord(tableUuid, recordId, patchOperations)
 actionBulkChangeStatus(tableUuid, meta, selectedIds, isSelectedAll, newStatus, oldStatus)

 actionClearFilters(tableUuid)

 actionChangeRecordsSelected(tableUuid, recordIds, selected)
 actionChangeRecordsSelectedAll(tableUuid, isSelectedAll)
 actionClearRecordSelection(tableUuid)
*/
export const getBindActions = MODULE.getBindActions;
export const reducer = MODULE.moduleReducer;
export default reducer;

import {
  ORM,
  createSelector as createOrmSelector,
} from 'redux-orm';

import { objectValues } from '../../../utils/common';

const orm = new ORM();

let isRegister = false;
// для поздней инициализации в Runner
export function registerModels(models, reload = false) {
  if (!isRegister || reload) {
    if (reload) {
      // todo @ANKU @LOW @BUG_OUT @redux-orm @HACK - hot reload model
      orm.registry = [];
      orm.implicitThroughModels = [];
    }

    const modelsArray = typeof models === 'object'
      ? objectValues(models)
      : models;

    orm.register(...modelsArray);
    isRegister = true;
  }
}

export function createSelector(...selectors) {
  return createOrmSelector(orm, ...selectors);
}

export function createAllSelector(modelName, recordSelector) {
  return createSelector((session) =>
    session[modelName].all().toModelArray()
      .map((modelRecord) => recordSelector(modelRecord, session)));
}

export function defaultFormatEntity(entityRecord) {
  return entityRecord.ref;
}

export function createEntitySelector(modelName, formatEntity = defaultFormatEntity) {
  return createSelector((session, id) => (
    typeof id !== 'undefined' && id !== null
      ? formatEntity(session[modelName].withId(id))
      : null));
}

export default orm;

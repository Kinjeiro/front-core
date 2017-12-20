import UniModel from './UniModel';

let prevId = 0;

export default class CrudModel extends UniModel {
  static getTypes() {
    const modelNameUpper = this.modelName.toUpperCase();
    return {
      CREATE: `CREATE_${modelNameUpper}`,
      UPDATE: `UPDATE_${modelNameUpper}`,
      DELETE: `DELETE_${modelNameUpper}`,
    };
  }

  static nextId() {
    prevId += 1;
    return prevId;
  }

  static getActions() {
    const { modelName } = this;
    const TYPES = this.getTypes();

    const names = {
      create: `actionCreate${modelName}`,
      update: `actionUpdate${modelName}`,
      delete: `actionDelete${modelName}`,
    };

    return {
      [names.create]: (attributes) => ({
        type: TYPES.CREATE,
        payload: attributes,
      }),
      [names.update]: (id, attributes) => ({
        type: TYPES.UPDATE,
        payload: {
          entityId: id,
          attributes,
        },
      }),
      [names.delete]: (id) => ({
        type: TYPES.DELETE,
        payload: id,
      }),
    };
  }

  static reducer(action, ModelClass, session) {
    const TYPES = this.getTypes();

    switch (action.type) {
      case TYPES.CREATE:
        // if (!attributes.hasOwnProperty(ModelClass.idAttribute)) {
        //  attributes[ModelClass.idAttribute] = this.nextId(prevId);
        // }
        ModelClass.create(action.payload);
        break;
      case TYPES.UPDATE:
        ModelClass.withId(action.payload.entityId)
          .update(action.payload.attributes);
        break;
      case TYPES.DELETE:
        ModelClass.withId(action.payload)
          .delete();
        break;
      default:
        break;
    }
  }
}

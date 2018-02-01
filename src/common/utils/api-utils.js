import { applyPatch } from 'fast-json-patch';

// https://tools.ietf.org/html/rfc6902
export const PATCH_OPERATIONS = {
  REPLACE: 'replace',
  ADD: 'add',
  REMOVE: 'remove',
};
export const ADD_AS_LAST = '-';

export function createJsonPatchOperation(path, value, operationType = PATCH_OPERATIONS.REPLACE) {
  // по умолчанию не добавляет в конец, нужно обязательно указывать позицию
  // // createJsonPatchOperation('/field2', 'newValue4', PATCH_OPERATIONS.ADD),
  // @guide - "/-" обозначает в конец
  // createJsonPatchOperation('/field2/-', 'newValue4', PATCH_OPERATIONS.ADD),

  return {
    path: path.indexOf('/') === 0 ? path : `/${path}`,
    value,
    op: operationType,
  };
}

export function parseToJsonPatch(patchOperations) {
  if (Array.isArray(patchOperations)) {
    return patchOperations;
  }
  if (typeof patchOperations === 'object') {
    if (patchOperations.op) {
      return [patchOperations];
    }

    return Object.keys(patchOperations).map((field) =>
      createJsonPatchOperation(field, patchOperations[field]));
  }

  throw new Error('Not supported json patch format', patchOperations, 'See https://tools.ietf.org/html/rfc6902');
}

export function applyPatchOperations(object, patchOperations) {
  return applyPatch(object, parseToJsonPatch(patchOperations)).newDocument;
}

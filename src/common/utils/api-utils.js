import { applyPatch } from 'fast-json-patch';

// https://tools.ietf.org/html/rfc6902
export const PATCH_OPERATIONS = {
  REPLACE: 'replace',
  ADD: 'add',
  REMOVE: 'remove',
};
export const ADD_AS_LAST = '-';

export function createJsonPatchOperation(path, value, operationType = PATCH_OPERATIONS.REPLACE, itemIds = undefined) {
  // по умолчанию не добавляет в конец, нужно обязательно указывать позицию
  // // createJsonPatchOperation('/field2', 'newValue4', PATCH_OPERATIONS.ADD),
  // @guide - "/-" обозначает в конец
  // createJsonPatchOperation('/field2/-', 'newValue4', PATCH_OPERATIONS.ADD),

  const operation = {
    path: path.indexOf('/') === 0 ? path : `/${path}`,
    value,
    op: operationType,
  };

  if (itemIds) {
    operation.itemIds = Array.isArray(itemIds)
      ? itemIds
      : typeof itemIds !== 'undefined'
        ? [itemIds]
        : undefined;
  }

  return operation;
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

export function replacePathIndexToItemId(operation, saveItemIds = false) {
  if (operation.itemIds) {
    const {
      path,
      value,
      op,
      itemIds,
    } = operation;

    const resultPath = itemIds.reduce((result, itemId) =>
      result.replace(/\/(\d+)(\/|$)/, `/${itemId}$2`,
    ), path);

    // const regExp = /\/(\d+)(\/|$)/g;
    // let resultPath = '';
    // let lastPosition = 0;
    // let arrayIndex = 0;
    // let res;
    // // eslint-disable-next-line no-cond-assign
    // while ((res = regExp.exec(path)) !== null) {
    //   const indexPart = res[1];
    //   const rightPart = res[2];
    //   const isLast = regExp.lastIndex === path.length;
    //   const leftPart = path.substr(
    //     lastPosition,
    //     regExp.lastIndex - `${indexPart}`.length - lastPosition - (isLast ? 0 : 1),
    //   );
    //   // eslint-disable-next-line no-plusplus
    //   const itemId = itemIds[arrayIndex++];
    //   // resultPath = `${resultPath}${leftPart}${itemId}${dotOrEnd}`;
    //   resultPath = `${resultPath}${leftPart}${itemId}`;
    //
    //   if (isLast) {
    //     resultPath = `${resultPath}${rightPart}`;
    //   }
    //
    //   // смешаем на один назад, так как слеш является как концом первого, так иначалом второго
    //   regExp.lastIndex = regExp.lastIndex - 1;
    //   lastPosition = regExp.lastIndex;
    // }

    // убираем itemByIds
    const resultOperation = {
      op,
      path: resultPath,
      value,
    };

    if (saveItemIds) {
      resultPath.itemIds = itemIds;
    }

    return resultOperation;
  }
  return operation;
}

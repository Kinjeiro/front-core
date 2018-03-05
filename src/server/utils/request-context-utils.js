import { generateId } from '../../common/utils/common';

// export function storeRequestContext(request, context, contextId = request.id) {
export function storeRequestContext(request, context, contextId = generateId()) {
  // eslint-disable-next-line no-param-reassign
  request.server.app[contextId] = context;
  return contextId;
}

export function getRequestContext(request, contextId, deleteData = false) {
  const data = request.server.app[contextId];
  if (deleteData) {
    // eslint-disable-next-line no-param-reassign
    delete request.server.app[contextId];
  }
  return data;
}

export function storeUniErrorInRequestContext(request, uniError, contextId = undefined) {
  return storeRequestContext(
    request,
    {
      uniError,
    },
    contextId,
  );
}

export function getUniErrorFromRequestContext(request, contextId, deleteData) {
  const context = getRequestContext(request, contextId, deleteData);
  return (context && context.uniError) || null;
}

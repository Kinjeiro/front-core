import { merge } from '../utils/common';

export function loadStorageData(itemId) {
  const json = localStorage.getItem(itemId);
  return json && JSON.parse(json);
}

export function replaceStorageData(itemId, data) {
  localStorage.setItem(itemId, JSON.stringify(data));
}
export function mergeStorageData(itemId, data, mergeFn = merge) {
  const oldData = loadStorageData(itemId);
  replaceStorageData(itemId, mergeFn(oldData, data));
}

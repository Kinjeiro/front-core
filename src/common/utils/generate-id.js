// todo @ANKU @LOW - переделать на lodash uniqiuId
/**
 * @deprecated - use common/utils/common.js::generateId
 * @returns {string}
 */
export default function generateId() {
  return Math.random()
    .toString(16)
    .slice(2);
}

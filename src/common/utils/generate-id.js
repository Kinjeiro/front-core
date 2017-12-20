// todo @ANKU @LOW - переделать на lodash uniqiuId
export default function generateId() {
  return Math.random()
    .toString(16)
    .slice(2);
}


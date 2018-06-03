/* eslint-disable no-param-reassign */

/**
 * @deprecated use common.js::isEmpty
 * // todo @ANKU @LOW - удалить когда удалим методы дерева из common.js (чтобы взаимных ссылок не было) и оттуда будем пользоваться
 */
export function isEmpty(value, objectChecker = null) {
  if (objectChecker && typeof value === 'object') {
    return objectChecker(value);
  }
  return value === null || typeof value === 'undefined' || value === '' || (Array.isArray(value) && value.length === 0);
}

// todo @ANKU @CRIT @MAIN - сделать memoize
export function findInTree(tree, id, config = {}, deep = 0, path = [], pathStr = '') {
  const {
    fieldChildren = 'children',
    fieldId = 'id',
  } = config;

  let result;
  let resultValue = null;

  if (id === null || typeof id === 'undefined') {
    result = null;
  } else if (tree[fieldId] === id) {
    result = tree;
    path.push(result);
  } else {
    const isFound = tree[fieldChildren].some((child, index) => {
      if (child[fieldId] === id) {
        result = child;
        path.push(result);
        pathStr = `${pathStr}[${index}]`;
        return true;
      }
      resultValue = findInTree(child, id, config, deep + 1, path, `${pathStr}[${index}]`);
      if (resultValue.result) {
        result = resultValue.result;
        pathStr = resultValue.pathStr;
        return true;
      }
      return false;
    });

    if (isFound) {
      path.push(tree);
    }
  }

  if (deep === 0) {
    path.reverse();
  }
  return { result, path, pathStr };
}

export function arrayToTree(array, options = {}, parent = null, level = 0) {
  const {
    tree = [],
    fieldId = 'id',
    fieldParent = 'parentId',
    fieldChildren = 'children',
    fieldLevel = 'level',
    useLevels = true,
    emptyChildren = true,
  } = options;

  parent = parent || {
    [fieldId]: null,
  };

  let treeResult = tree;

  const children = array.filter((child) =>
    (isEmpty(child[fieldParent]) && isEmpty(parent[fieldId]))
    || (child[fieldParent] === parent[fieldId]),
  );

  if (!isEmpty(children)) {
    if (isEmpty(parent[fieldId])) {
      treeResult = children;
    } else {
      parent[fieldChildren] = children;
    }
    children.forEach((child) => {
      if (useLevels) {
        child[fieldLevel] = level;
      }
      if (typeof child[fieldParent] === 'undefined') {
        child[fieldParent] = null;
      }
      arrayToTree(array, options, child, level + 1);
    });
  } else if (emptyChildren) {
    parent[fieldChildren] = [];
  }

  return treeResult;
}


export function onlyLeafTreeFilter(treeItem, options) {
  const {
    fieldChildren = 'children',
  } = options;

  return isEmpty(treeItem[fieldChildren]);
}

export function treeToArray(tree, options = {}) {
  const {
    // fieldId = 'id',
    // fieldParent = 'parentId',
    fieldChildren = 'children',
    // fieldLevel = 'level',
    filterFn = onlyLeafTreeFilter,
    leafIsFirst = false,
  } = options;

  if (!Array.isArray(tree)) {
    tree = isEmpty(tree) ? [] : [tree];
  }

  return tree.reduce((result, treeItem) => {
    const filtered = filterFn ? filterFn(treeItem, options) : true;
    if (filtered && !leafIsFirst) {
      result.push(treeItem);
    }

    result.push(...treeToArray(treeItem[fieldChildren], options));

    if (filtered && leafIsFirst) {
      result.push(treeItem);
    }

    return result;
  }, []);
}

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


export const EQUAL_CONSTRAINTS = {
  EQUAL: 'EQUAL',
  CONTAINS: 'CONTAINS',
  START_WITH: 'START_WITH',
};

export function findInTreeDefaultFilter(searchTerm, treeItem, options) {
  const {
    fieldSearch = 'id',
    equalConstraint = EQUAL_CONSTRAINTS.EQUAL,
  } = options;

  const value = treeItem[fieldSearch];
  switch (equalConstraint) {
    case EQUAL_CONSTRAINTS.EQUAL:
      // eslint-disable-next-line eqeqeq
      return value == searchTerm;
    case EQUAL_CONSTRAINTS.CONTAINS:
      return value && `${value.toLowerCase()}`.indexOf(searchTerm.toLowerCase()) >= 0;
    case EQUAL_CONSTRAINTS.START_WITH:
      return value && `${value.toLowerCase()}`.indexOf(searchTerm.toLowerCase()) === 0;
    default:
      return false;
  }
}

// todo @ANKU @CRIT @MAIN - сделать memoize
/**
 * Ищет первое вхождение в дереве
 * @param tree
 * @param filter - либо искомый id либо функция (treeItem, config)
 * @param options - {
    fieldChildren = 'children',
    fieldSearch = 'id', - если не задано поле filter как функция
    equalConstraint = EQUAL_CONSTRAINTS.EQUAL,
  }
 * @returns {{result: *, isRoot: boolean, pathStr: string}}
 */
export function findInTree(tree, filter, options = {}, deep = 0, path = [], pathStr = '') {
  const {
    fieldChildren = 'children',
  } = options;

  if (typeof filter !== 'function') {
    if (filter === null || typeof filter === 'undefined' || filter === '') {
      return {
        result: undefined,
        path: [],
        pathStr: '',
      };
    }
    filter = findInTreeDefaultFilter.bind(null, filter);
  }

  let result;
  let resultValue = null;
  let isRoot = false;

  if (filter === null || typeof filter === 'undefined') {
    result = null;
  } else if (filter(tree, options)) {
    result = tree;
    isRoot = deep === 0;
    // path.push(result);
  } else {
    const isFound = tree[fieldChildren]
      .some((child, index) => {
        const pathStrChild = `${pathStr ? `${pathStr}.` : ''}${fieldChildren}.${index}`;
        if (filter(child, options)) {
          result = child;
          // path.push(result);
          pathStr = pathStrChild;
          return true;
        }
        resultValue = findInTree(child, filter, options, deep + 1, path, pathStrChild);
        if (resultValue.result) {
          result = resultValue.result;
          pathStr = resultValue.pathStr;
          // path.push(result);
          return true;
        }
        return false;
      });

    // if (isFound) {
    //   path.push(tree);
    // }
  }

  // if (deep === 0) {
  //   path.reverse();
  // }
  return {
    result,
    // path,
    pathStr,
    isRoot,
  };
}

export function findPath(value, treeData, options = {}) {
  const {
    fieldValue = 'value',
    fieldChildren = 'children',
  } = options;

  const treePath = [];

  function loop(selected, children) {
    for (let i = 0; i < children.length; i++) {
      const item = children[i];
      if (selected === item[fieldValue]) {
        treePath.push(item);
        return;
      }
      if (item[fieldChildren]) {
        loop(selected, item[fieldChildren], item);
        if (treePath.length) {
          treePath.push(item);
          return;
        }
      }
    }
  }

  loop(value, treeData);
  treePath.reverse();
  return treePath;
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

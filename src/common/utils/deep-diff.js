/* eslint-disable */
// from https://github.com/flitbit/diff

export const DIFF_KIND = {
  NEW: 'NEW:',
  EDIT: 'EDIT',
  EDIT_LINK: 'EDIT_LINK',
  ARRAY: 'ARRAY',
  DELETE: 'DELETE',
};

export const validKinds = [
  DIFF_KIND.NEW,
  DIFF_KIND.EDIT,
  DIFF_KIND.ARRAY,
  DIFF_KIND.DELETE
];

// nodejs compatible on server side and in the browser.
function inherits(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
}

function Diff(kind, path) {
  Object.defineProperty(this, 'kind', {
    value: kind,
    enumerable: true
  });
  if (path && path.length) {
    Object.defineProperty(this, 'path', {
      value: path,
      enumerable: true
    });
  }
}

function DiffEdit(path, origin, value) {
  DiffEdit.super_.call(this, DIFF_KIND.EDIT, path);
  Object.defineProperty(this, 'lhs', {
    value: origin,
    enumerable: true
  });
  Object.defineProperty(this, 'rhs', {
    value: value,
    enumerable: true
  });
}
inherits(DiffEdit, Diff);

function DiffEditLink(path, origin, value) {
  DiffEdit.super_.call(this, DIFF_KIND.EDIT_LINK, path);
  Object.defineProperty(this, 'lhs', {
    value: origin,
    enumerable: true
  });
  Object.defineProperty(this, 'rhs', {
    value: value,
    enumerable: true
  });
}
inherits(DiffEdit, Diff);

function DiffNew(path, value) {
  DiffNew.super_.call(this, DIFF_KIND.NEW, path);
  Object.defineProperty(this, 'rhs', {
    value: value,
    enumerable: true
  });
}
inherits(DiffNew, Diff);

function DiffDeleted(path, value) {
  DiffDeleted.super_.call(this, DIFF_KIND.DELETE, path);
  Object.defineProperty(this, 'lhs', {
    value: value,
    enumerable: true
  });
}
inherits(DiffDeleted, Diff);

function DiffArray(path, index, item) {
  DiffArray.super_.call(this, DIFF_KIND.ARRAY, path);
  Object.defineProperty(this, 'index', {
    value: index,
    enumerable: true
  });
  Object.defineProperty(this, 'item', {
    value: item,
    enumerable: true
  });
}
inherits(DiffArray, Diff);

function arrayRemove(arr, from, to) {
  var rest = arr.slice((to || from) + 1 || arr.length);
  arr.length = from < 0 ? arr.length + from : from;
  arr.push.apply(arr, rest);
  return arr;
}

function realTypeOf(subject) {
  var type = typeof subject;
  if (type !== 'object') {
    return type;
  }

  if (subject === Math) {
    return 'math';
  } else if (subject === null) {
    return 'null';
  } else if (Array.isArray(subject)) {
    return 'array';
  } else if (Object.prototype.toString.call(subject) === '[object Date]') {
    return 'date';
  } else if (typeof subject.toString === 'function' && /^\/.*\//.test(subject.toString())) {
    return 'regexp';
  }
  return 'object';
}

// http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
function hashThisString(string) {
  var hash = 0;
  if (string.length === 0) { return hash; }
  for (var i = 0; i < string.length; i++) {
    var char = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

// Gets a hash of the given object in an array order-independent fashion
// also object key order independent (easier since they can be alphabetized)
function getOrderIndependentHash(object) {
  var accum = 0;
  var type = realTypeOf(object);

  if (type === 'array') {
    object.forEach(function (item) {
      // Addition is commutative so this is order indep
      accum += getOrderIndependentHash(item);
    });

    var arrayString = '[type: array, hash: ' + accum + ']';
    return accum + hashThisString(arrayString);
  }

  if (type === 'object') {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        var keyValueString = '[ type: object, key: ' + key + ', value hash: ' + getOrderIndependentHash(object[key]) + ']';
        accum += hashThisString(keyValueString);
      }
    }

    return accum;
  }

  // Non object, non array...should be good?
  var stringToHash = '[ type: ' + type + ' ; value: ' + object + ']';
  return accum + hashThisString(stringToHash);
}

function deepDiffInner(lhs, rhs, changes, prefilter, path, key, stack, orderIndependent) {
  changes = changes || [];
  path = path || [];
  stack = stack || [];
  var currentPath = path.slice(0);
  var showEditLinks = false;
  if (typeof key !== 'undefined' && key !== null) {
    if (prefilter) {
      if (typeof (prefilter) === 'function' && prefilter(currentPath, key)) {
        return;
      } else if (typeof (prefilter) === 'object') {
        if (prefilter.prefilter && prefilter.prefilter(currentPath, key)) {
          return;
        }
        if (prefilter.normalize) {
          var alt = prefilter.normalize(currentPath, key, lhs, rhs);
          if (alt) {
            lhs = alt[0];
            rhs = alt[1];
          }
        }
        showEditLinks = prefilter.showEditLinks;
      }
    }
    currentPath.push(key);
  }

  // Use string comparison for regexes
  if (realTypeOf(lhs) === 'regexp' && realTypeOf(rhs) === 'regexp') {
    lhs = lhs.toString();
    rhs = rhs.toString();
  }

  var ltype = typeof lhs;
  var rtype = typeof rhs;
  var i, j, objectKey, other;

  var ldefined = ltype !== 'undefined' ||
    (stack && (stack.length > 0) && stack[stack.length - 1].lhs &&
      Object.getOwnPropertyDescriptor(stack[stack.length - 1].lhs, key));
  var rdefined = rtype !== 'undefined' ||
    (stack && (stack.length > 0) && stack[stack.length - 1].rhs &&
      Object.getOwnPropertyDescriptor(stack[stack.length - 1].rhs, key));

  if (!ldefined && rdefined) {
    changes.push(new DiffNew(currentPath, rhs));
  } else if (!rdefined && ldefined) {
    changes.push(new DiffDeleted(currentPath, lhs));
  } else if (realTypeOf(lhs) !== realTypeOf(rhs)) {
    changes.push(new DiffEdit(currentPath, lhs, rhs));
  } else if (realTypeOf(lhs) === 'date' && (lhs - rhs) !== 0) {
    changes.push(new DiffEdit(currentPath, lhs, rhs));
  } else if (ltype === 'object' && lhs !== null && rhs !== null) {
    for (i = stack.length - 1; i > -1; --i) {
      if (stack[i].lhs === lhs) {
        other = true;
        break;
      }
    }
    if (!other) {
      stack.push({ lhs: lhs, rhs: rhs });

      if (showEditLinks && lhs !== rhs) {
        changes.push(new DiffEditLink(currentPath, lhs, rhs));
      }

      if (Array.isArray(lhs)) {
        // If order doesn't matter, we need to sort our arrays
        if (orderIndependent) {
          lhs.sort(function (a, b) {
            return getOrderIndependentHash(a) - getOrderIndependentHash(b);
          });

          rhs.sort(function (a, b) {
            return getOrderIndependentHash(a) - getOrderIndependentHash(b);
          });
        }
        i = rhs.length - 1;
        j = lhs.length - 1;
        while (i > j) {
          changes.push(new DiffArray(currentPath, i, new DiffNew(undefined, rhs[i--])));
        }
        while (j > i) {
          changes.push(new DiffArray(currentPath, j, new DiffDeleted(undefined, lhs[j--])));
        }

        for (; i >= 0; --i) {
          deepDiffInner(lhs[i], rhs[i], changes, prefilter, currentPath, i, stack, orderIndependent);
        }
      } else {
        var akeys = Object.keys(lhs);
        var pkeys = Object.keys(rhs);

        if (
          lhs && lhs.$$typeof && lhs._owner
          || rhs && rhs.$$typeof && rhs._owner
        ) {
          // React-specific: avoid traversing React elements' _owner.
          //  _owner contains circular references
          // and is not needed when comparing the actual elements (and not their owners)
          // .$$typeof and ._store on just reasonable markers of a react element
          return;
        }

        for (i = 0; i < akeys.length; ++i) {
          objectKey = akeys[i];
          other = pkeys.indexOf(objectKey);
          if (other >= 0) {
            deepDiffInner(lhs[objectKey], rhs[objectKey], changes, prefilter, currentPath, objectKey, stack, orderIndependent);
            pkeys[other] = null;
          } else {
            deepDiffInner(lhs[objectKey], undefined, changes, prefilter, currentPath, objectKey, stack, orderIndependent);
          }
        }
        for (i = 0; i < pkeys.length; ++i) {
          objectKey = pkeys[i];
          if (objectKey) {
            deepDiffInner(undefined, rhs[objectKey], changes, prefilter, currentPath, objectKey, stack, orderIndependent);
          }
        }
      }
      stack.length = stack.length - 1;
    } else if (lhs !== rhs) {
      // lhs is contains a cycle at this element and it differs from rhs
      changes.push(new DiffEdit(currentPath, lhs, rhs));
    }
  } else if (lhs !== rhs) {
    if (!(ltype === 'number' && isNaN(lhs) && isNaN(rhs))) {
      changes.push(new DiffEdit(currentPath, lhs, rhs));
    }
  }
}

function observableDiff(lhs, rhs, observer, prefilter, orderIndependent) {
  var changes = [];
  deepDiffInner(lhs, rhs, changes, prefilter, null, null, null, orderIndependent);
  if (observer) {
    for (var i = 0; i < changes.length; ++i) {
      observer(changes[i]);
    }
  }
  return changes;
}

function orderIndependentDeepDiff(lhs, rhs, changes, prefilter, path, key, stack) {
  return deepDiffInner(lhs, rhs, changes, prefilter, path, key, stack, true);
}

/**
 * Arguments
 1) lhs - the left-hand operand; the origin object.
 2) rhs - the right-hand operand; the object being compared structurally with the origin object.
 3) options -
 a) object - A configuration object that can have the following properties:
 prefilter: (path, key) => bool - function that determines whether difference analysis should continue down the object graph. This function can also replace the options object in the parameters for backward compatibility.
 normalize: (path, key, lhs, rhs) => [lhs, rhs] - function that pre-processes every leaf of the tree.
 b) function - prefilter
 4) acc - an optional accumulator/array (requirement is that it have a push function). Each difference is pushed to the specified accumulator.

 Returns either an array of change
 */
function deepDiff(lhs, rhs, prefilter, accum) {
  var observer = (accum) ?
    function (difference) {
      if (difference) {
        accum.push(difference);
      }
    } : undefined;
  var changes = observableDiff(lhs, rhs, observer, prefilter);
  return (accum) ? accum : (changes.length) ? changes : undefined;
}

function accumulateOrderIndependentDiff(lhs, rhs, prefilter, accum) {
  var observer = (accum) ?
    function (difference) {
      if (difference) {
        accum.push(difference);
      }
    } : undefined;
  var changes = observableDiff(lhs, rhs, observer, prefilter, true);
  return (accum) ? accum : (changes.length) ? changes : undefined;
}

function applyArrayChange(arr, index, change) {
  if (change.path && change.path.length) {
    var it = arr[index],
      i, u = change.path.length - 1;
    for (i = 0; i < u; i++) {
      it = it[change.path[i]];
    }
    switch (change.kind) {
      case DIFF_KIND.ARRAY:
        applyArrayChange(it[change.path[i]], change.index, change.item);
        break;
      case DIFF_KIND.DELETE:
        delete it[change.path[i]];
        break;
      case DIFF_KIND.EDIT:
      case DIFF_KIND.NEW:
        it[change.path[i]] = change.rhs;
        break;
    }
  } else {
    switch (change.kind) {
      case DIFF_KIND.ARRAY:
        applyArrayChange(arr[index], change.index, change.item);
        break;
      case DIFF_KIND.DELETE:
        arr = arrayRemove(arr, index);
        break;
      case DIFF_KIND.EDIT:
      case DIFF_KIND.NEW:
        arr[index] = change.rhs;
        break;
    }
  }
  return arr;
}

function applyChange(target, source, change) {
  if (typeof change === 'undefined' && source && ~validKinds.indexOf(source.kind)) {
    change = source;
  }
  if (target && change && change.kind) {
    var it = target,
      i = -1,
      last = change.path ? change.path.length - 1 : 0;
    while (++i < last) {
      if (typeof it[change.path[i]] === 'undefined') {
        it[change.path[i]] = (typeof change.path[i + 1] !== 'undefined' && typeof change.path[i + 1] === 'number') ? [] : {};
      }
      it = it[change.path[i]];
    }
    switch (change.kind) {
      case DIFF_KIND.ARRAY:
        if (change.path && typeof it[change.path[i]] === 'undefined') {
          it[change.path[i]] = [];
        }
        applyArrayChange(change.path ? it[change.path[i]] : it, change.index, change.item);
        break;
      case DIFF_KIND.DELETE:
        delete it[change.path[i]];
        break;
      case DIFF_KIND.EDIT:
      case DIFF_KIND.NEW:
        it[change.path[i]] = change.rhs;
        break;
    }
  }
}

function revertArrayChange(arr, index, change) {
  if (change.path && change.path.length) {
    // the structure of the object at the index has changed...
    var it = arr[index],
      i, u = change.path.length - 1;
    for (i = 0; i < u; i++) {
      it = it[change.path[i]];
    }
    switch (change.kind) {
      case DIFF_KIND.ARRAY:
        revertArrayChange(it[change.path[i]], change.index, change.item);
        break;
      case DIFF_KIND.DELETE:
        it[change.path[i]] = change.lhs;
        break;
      case DIFF_KIND.EDIT:
        it[change.path[i]] = change.lhs;
        break;
      case DIFF_KIND.NEW:
        delete it[change.path[i]];
        break;
    }
  } else {
    // the array item is different...
    switch (change.kind) {
      case DIFF_KIND.ARRAY:
        revertArrayChange(arr[index], change.index, change.item);
        break;
      case DIFF_KIND.DELETE:
        arr[index] = change.lhs;
        break;
      case DIFF_KIND.EDIT:
        arr[index] = change.lhs;
        break;
      case DIFF_KIND.NEW:
        arr = arrayRemove(arr, index);
        break;
    }
  }
  return arr;
}

function revertChange(target, source, change) {
  if (target && source && change && change.kind) {
    var it = target,
      i, u;
    u = change.path.length - 1;
    for (i = 0; i < u; i++) {
      if (typeof it[change.path[i]] === 'undefined') {
        it[change.path[i]] = {};
      }
      it = it[change.path[i]];
    }
    switch (change.kind) {
      case DIFF_KIND.ARRAY:
        // Array was modified...
        // it will be an array...
        revertArrayChange(it[change.path[i]], change.index, change.item);
        break;
      case DIFF_KIND.DELETE:
        // Item was deleted...
        it[change.path[i]] = change.lhs;
        break;
      case DIFF_KIND.EDIT:
        // Item was edited...
        it[change.path[i]] = change.lhs;
        break;
      case DIFF_KIND.NEW:
        // Item is new...
        delete it[change.path[i]];
        break;
    }
  }
}

function applyDiff(target, source, filter) {
  if (target && source) {
    var onChange = function (change) {
      if (!filter || filter(target, source, change)) {
        applyChange(target, source, change);
      }
    };
    observableDiff(target, source, onChange);
  }
}

Object.defineProperties(deepDiff, {

  diff: {
    value: deepDiff,
    enumerable: true
  },
  orderIndependentDiff: {
    value: accumulateOrderIndependentDiff,
    enumerable: true
  },
  observableDiff: {
    value: observableDiff,
    enumerable: true
  },
  orderIndependentObservableDiff: {
    value: orderIndependentDeepDiff,
    enumerable: true
  },
  orderIndepHash: {
    value: getOrderIndependentHash,
    enumerable: true
  },
  applyDiff: {
    value: applyDiff,
    enumerable: true
  },
  applyChange: {
    value: applyChange,
    enumerable: true
  },
  revertChange: {
    value: revertChange,
    enumerable: true
  },
  isConflict: {
    value: function () {
      return typeof $conflict !== 'undefined';
    },
    enumerable: true
  }
});

// hackish...
deepDiff.DeepDiff = deepDiff;

/*
const example = [
  {
    "kind": "E",
    "path": [
      "itemsPerPage"
    ],
    "lhs": "20",
    "rhs": 20
  },
  {
    "kind": "E",
    "path": [
      "sortDesc"
    ],
    "lhs": "true",
    "rhs": true
  },
  {
    "kind": "E",
    "path": [
      "startPage"
    ],
    "lhs": "0",
    "rhs": 0
  }
];


const example2 = [
  {
    "kind": "E",
    "path": [
      "sortBy"
    ],
    "lhs": null,
    "rhs": "created"
  },
  {
    "kind": "N",
    "path": [
      "filters"
    ],
    "rhs": {
      "type": "service"
    }
  }
];
*/

/**
 * Arguments
 1) lhs - the left-hand operand; the origin object.
 2) rhs - the right-hand operand; the object being compared structurally with the origin object.
 3) options -
   a) object - A configuration object that can have the following properties:
     - prefilter: (path, key) => bool - function that determines whether difference analysis should continue down the object graph. This function can also replace the options object in the parameters for backward compatibility.
     - normalize: (path, key, lhs, rhs) => [lhs, rhs] - function that pre-processes every leaf of the tree.
     - showEditLinks: bool - add not equal link result
   b) function - prefilter
 4) acc - an optional accumulator/array (requirement is that it have a push function). Each difference is pushed to the specified accumulator.

 Returns either an array of change
 */
export default deepDiff;


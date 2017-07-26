function add(tree, path, content) {
  let node = tree;
  const arr = path.split('/').filter(item => item !== '');
  const len = arr.length;
  if (len === 0) return false;
  for (let i = 0; i < len - 1; i++) {
    if (node[arr[i]] === undefined) { node[arr[i]] = {}; }
    node = node[arr[i]];
  }
  node[arr[len - 1]] = content;
  return true;
}

function get(tree, path = '') {
  if (tree == null) return false;
  const arr = path.split('/').filter(item => item !== '');
  const len = arr.length;
  let node = tree;
  for (let i = 0; i < len; i++) {
    if (!Object.prototype.hasOwnProperty.call(node, arr[i])) return false;
    node = node[arr[i]];
  }
  return node;
}

function getKeys(tree, path = '') {
  const node = get(tree, path);
  if (node) return Object.keys(node);
  return [];
}

function isChild(tree, path, name) {
  const node = get(tree, path);
  return node && node[name] !== undefined;
}

function isEmpty(tree, path) {
  const node = get(tree, path);
  if (!node || Object.keys(node).length === 0) return true;
  return false;
}

function someKey(tree, path = '', pred = key => true) {
  const node = get(tree, path);
  if (node && typeof node === 'object') {
    const keys = Object.keys(node);
    for (let i = 0, len = keys.length; i < len; i++) {
      if (pred(keys[i])) return keys[i];
    }
  }
  return false;
}

function map(tree, path, func = (key, value) => value) {
  const node = get(tree, path);
  let res = {};
  if (node && typeof node === 'object' && node != null) {
    res = Object.entries(node).map(entry => func(entry[0], entry[1]));
    return res;
  }
  return false;
}

function reduce(node, initKey, initValue, op) {
  let res = initValue;
  if (node == null) {
    // Nothing to do
  } else if (typeof node === 'object') {
    Object.entries(node).forEach((entry) => {
      const key = entry[0];
      const value = entry[1];
      res = op(initKey, res, key, reduce(value, key, initValue, op));
    });
  } else res = node;
  return res;
}

function flatten(node, parentKey, uniquify) {
  let res = {};
  if (node == null) {
    // Nothing to do
  } else if (typeof node === 'object') {
    Object.entries(node).forEach((entry) => {
      const key = entry[0];
      const value = entry[1];
      res = Object.assign(res, flatten(value, uniquify(parentKey, key), uniquify));
    });
  } else res[parentKey] = node;
  return res;
}

module.exports = {
  add,
  get,
  getKeys,
  isChild,
  isEmpty,
  someKey,
  map,
  reduce,
  flatten,
};

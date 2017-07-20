'use strict';

function add(tree, path, content) {
  const arr = path.split('/').filter(item => item !== '');
  const len = arr.length;
  if (len === 0) return false;
  for (let i = 0; i < len - 1; i++) {
    if (tree[arr[i]] === undefined) { tree[arr[i]] = {}; }
    tree = tree[arr[i]];
  }
  tree[arr[len - 1]] = content;
  return true;
}

function get(tree, path = '') {
  if (tree == null) return false;
  const arr = path.split('/').filter(item => item !== '');
  const len = arr.length;
  let node = tree;
  for (let i = 0; i < len; i++) {
    if (!node.hasOwnProperty(arr[i])) return false;
    node = node[arr[i]];
  }
  return node;
}

function getKeys(tree, path = '') {
  let keys = [];
  const node = get(tree, path);
  if (node) {
    for (let key in node) {
      if (node.hasOwnProperty(key)) keys.push(key);
    }
  }
  return keys;
}

function isChild(tree, path, name) {
  const node = get(tree, path);
  return node && node[name] !== undefined;
}

function isEmpty(tree, path) {
  const node = get(tree, path);
  if (node) {
    for (let key in node) {
      if (node.hasOwnProperty(key)) return false;
    }
  }
  return true;
}

function someKey(tree, path = '', pred = key => true) {
  const node = get(tree, path);
  if (node && typeof(node) === 'object') {
    for (let key in node) {
      if (node.hasOwnProperty(key) && pred(key)) return key;
    }
  }
  return false;
}

function map(tree, path, func = (key, value) => value) {
  const node = get(tree, path);
  let res = {};
  if (node && typeof node === 'object' && node != null) {
    for (let key in node) {
      if (node.hasOwnProperty(key)) res[key] = func(key, node[key]);
    }
    return res;
  }
  return false;
}

function reduce(node, initKey, initValue, op) {
  let res = initValue;
  if (node == null) {
    // Nothing to do
  } else if (typeof node === 'object') {
    for (let key in node) {
      if (node.hasOwnProperty(key)) {
        res = op(initKey, res, key, reduce(node[key], key, initValue, op));
      }
    }
  } else res = node;
  return res;
}

function flatten(node, parentKey, uniquify) {
  let res = {};
  if (node == null) {
    // Nothing to do
  } else if (typeof node === 'object') {
    for (let key in node) {
      if (node.hasOwnProperty(key)) {
        res = Object.assign(res, flatten(node[key], uniquify(parentKey, key), uniquify));
      }
    }
  } else res[parentKey] = node;
  return res;
}

module.exports = {
  add: add,
  get: get,
  getKeys: getKeys,
  isChild: isChild,
  isEmpty: isEmpty,
  someKey: someKey,
  map: map,
  reduce: reduce,
  flatten: flatten
};

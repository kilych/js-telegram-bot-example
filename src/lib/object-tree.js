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

function map(tree, path, func) {
  const node = get(tree, path);
  let res = {};
  if (node && typeof(node) === 'object') {
    for (let key in node) {
      if (node.hasOwnProperty(key)) res[key] = func(node[key]);
    }
    return res;
  }
  return false;
}

function reduce(tree, path, init, func) {
  const node = get(tree, path);
  let res = init;
  if (node && typeof(node) === 'object') {
    for (let key in node) {
      if (node.hasOwnProperty(key) && node[key] != null) res = func(res, node[key]);
    }
  }
  return res;
}

module.exports = {
  add: add,
  get: get,
  getKeys: getKeys,
  isChild: isChild,
  isEmpty: isEmpty,
  someKey: someKey
};

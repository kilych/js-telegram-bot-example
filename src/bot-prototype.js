'use strict';

const tree = require(__dirname + '/lib/object-tree.js');
const API = require('node-telegram-bot-api');
const userProt = require(__dirname + '/user-prototype.js');

module.exports = {
  init(token) {
    this.token = token;
    this.actions = {
      functions: {},
      helpText: {},
      params: {}
    };
    this.users = {};

    this.add('help', 'List of all commands', {}, (values, onResult) => {
      const walk = (node, parentKey) => {
        let resp = '';
        switch (typeof node) {
          case 'string':
          return `\n${parentKey.slice(0, -1)} -- ${node}`;
          break;

          case 'object':
          if (node == null) break;
          for (let key in node) {
            if (node.hasOwnProperty(key)) {
              resp += walk(node[key], `${parentKey}${key}_`);
            }
          }
          return resp;

          default:
          onResult('Something is bad.');
          throw new Error('Error: helpText node is not string or object.');
        }
      };
      const node = tree.get(this.actions.helpText);
      const resp = 'List of all commands'
            + '\n(you can use spaces instead of underscores)'
            + ((node) ? walk(node, '/') : 'Something is bad.');
      onResult(resp);
    });

    this.add('exit', 'Stop current action', {}, (values, onResult) => {
      onResult('Aborted.');
    });

    return this;
  },

  start() {
    this.api = new API(this.token, {polling: true});

    this.api.on('message', msg => {
      // console.log('>>>\n' + JSON.stringify(msg, null, 2) + '\n<<<');
      let user = {};
      const userId = msg.from.id;

      if (this.users[userId] == undefined) {
        this.users[userId] = this.makeUser();
      }
      user = this.users[userId];

      user.handleMsg(msg);

      this.users[userId] = user;
    });

    console.log('Improved bot started');
  },

  add(path, helpText, params, body) {
    tree.add(this.actions.functions, path, body);
    tree.add(this.actions.helpText, path, helpText);
    tree.add(this.actions.params, path, params);
  },

  makeUser() {
    let user = Object.create(userProt);
    user.init(this.actions, this.api);
    return user;
  }
};

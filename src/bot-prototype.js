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

    this.add('help', 'List of all commands', {}, (values, onResult, onError) => {
      const node = tree.get(this.actions.helpText);
      if (node) {
        let resp = 'List of all commands\n(you can use spaces instead of underscores)';
        const flatten = tree.flatten(node, '/', (parentKey, key) => `${parentKey}${key}_`);
        const mapped = tree.map(flatten, '', (key, value) => `${key.slice(0, -1)} -- ${value}`);
        resp += tree.reduce(mapped, '', '', (key1, str1, key2, str2) => str1 + '\n' + str2);
        onResult(resp);
      } else {
        onError(new Error('Help text is missing.'));
      }
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

    console.log('Bot started');
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

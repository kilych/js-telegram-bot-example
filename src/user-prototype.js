'use strict';

const fsm = require(__dirname + '/lib/stack-fsm-prototype.js');
const tree = require(__dirname + '/lib/object-tree.js');

module.exports = {
  init(actions = {}, api = {}) {
    this.state = Object.create(fsm).init();
    this.actions = actions;
    this.api = api;
    this.text = '';
    this.words = [];
    this.clean();
    return this;
  },

  clean() {
    this.path = '';
    this.param = '';
    this.values = {};
    this.state.clean();
  },

  handleMsg(msg) {
    let state = '';

    this.chatId = msg.chat.id;

    if (msg.text != undefined) {
      this.text = msg.text;

      this.getWords();
      this.checkGlobalCommand();
      console.log('new message, state stack: ' + this.state.stack.join(', '));

      if (this.state.isEmpty()) this.state.push('handleName');
    }

    if (msg.location != undefined) this.location = msg.location;

    this.state.enableUpdating();

    while (state = this.state.updateNoRun()) {
      console.log(state);
      this[state]();
    }
  },

  // loses info about whitespace/underscore difference
  getWords() {
    this.words = this.text
      .split(/[\s_]/)
      .filter(item => item !== ''); // && item !== '/');
  },

  noWords() { return this.words.length === 0; },

  checkGlobalCommand() {
    if (this.noWords()
        || !this.isCommand(this.words[0])
        || !this.isGlobal(this.words[0])) {
      return false;
    }

    this.clean();
    this.state.push('handleName');
    return true;
  },

  handleName() {
    if (this.noWords()) {
      this.state.push('requestName');
      return;
    }

    const word = this.words.shift();
    const path = this.path + '/' + word;

    if (this.isName(path)) {
      this.path = path;

      if (this.isFunction(path)) {
        this.state.push('apply');
        this.state.push('needParam');
      }
    }
    // this.state.push('requestName'); // should ignore invalid words?
    return;
  },

  isCommand(word) { return word.length >= 2 && word[0] === '/'; },

  isGlobal(word) { return tree.get(this.actions.functions, word); },

  isName(path) { return tree.get(this.actions.functions, path); },

  isFunction(path) {
    return typeof tree.get(this.actions.functions, path) === 'function';
  },

  requestName() {
    let text = 'Please send command';
    const subnames = tree.getKeys(this.actions.functions, this.path);
    text += (subnames.length >= 1) ? '\n' + subnames.map(item => '/' + item).join(' ') : '';
    this.state.swap('disableUpdating');
    this.sendMsg(text);
  },

  needParam() {
    if (tree.someKey(this.actions.params, this.path,
                     key => !this.values.hasOwnProperty(key))) {
      this.state.push('handleParam');
      return true;
    }
    this.state.pop();
    return false;
  },

  handleParam() {
    const word = this.words[0];
    const path = this.path + '/' + word;

    this.state.swap('handleValue');

    if (!this.noWords() && this.isParam(path)) {
      this.words.shift();
      this.param = word;
    } else {
      this.state.push('requestValue');
    }
  },

  isParam(path) { return !tree.isEmpty(this.actions.params, path); },

  handleValue() {
    const value = this.words[0];

    if (!this.noWords() && this.isValue(value)) {
      this.words.shift();
      this.values[this.param] = value;
    }
    this.state.pop();
  },

  isValue(value) {
    const param = tree.get(this.actions.params, this.path + '/' + this.param);
    const pred = param.pred;
    return pred(value);
  },

  requestValue() {
    let resp = '';
    const params = tree.get(this.actions.params, this.path);
    const key = tree.someKey(params, '', key => !this.values.hasOwnProperty(key));
    if (key) {
      this.param = key;
      resp = params[key].requestText;
    }
    this.state.swap('disableUpdating');
    this.sendMsg(resp);
  },

  onTextResult(text) { this.sendMsg(text); },

  onError(err) {
    console.log(`#########\n${err.message}\n#########`);
    this.sendMsg('Something is bad.');
},

  sendMsg(text) { this.api.sendMessage(this.chatId, text); },

  apply() {
    const func = tree.get(this.actions.functions, this.path);
    func(this.values, this.onTextResult.bind(this), this.onError.bind(this));
    this.clean();
  },

  disableUpdating() {
    this.state.disableUpdating();
    this.state.pop();
  }
};

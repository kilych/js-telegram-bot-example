const fsm = require('./lib/stack-fsm-prototype.js');
const tree = require('./lib/object-tree.js');

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
    this.path = '';             // namespace or action
    this.param = '';
    this.values = {};
    this.state.clean();
  },

  handleMsg(msg) {
    // console.log(`stack on new message: ${this.state.stack.join(', ')}`);
    let state = '';

    this.chatId = msg.chat.id;

    if (msg.text != undefined) {
      this.text = msg.text;

      this.getWords();
      this.checkGlobalCommand();

      if (this.state.isEmpty()) this.state.push('handleName');
    }

    if (msg.location != undefined) this.location = msg.location;

    this.state.enableUpdating();

    while (state = this.state.updateNoRun()) {
      // console.log(state);
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
  },

  isCommand(word) { return word.length >= 2 && word[0] === '/'; },

  isGlobal(word) { return tree.get(this.actions.functions, word); },

  // namespace or action
  isName(path) { return tree.get(this.actions.functions, path); },

  isFunction(path) {
    return typeof tree.get(this.actions.functions, path) === 'function';
  },

  requestName() {
    let text = 'Please send command';
    const subnames = tree.getKeys(this.actions.functions, this.path);
    text += (subnames.length >= 1) ? '\n' + subnames.map(item => `/${item}`).join(' ') : '';
    this.state.swap('disableUpdating');
    this.sendMsg(text);
  },

  needParam() {
    if (tree.someKey(
      this.actions.params,
      this.path,
      key => !Object.prototype.hasOwnProperty.call(this.values, key))) {
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
      this.param = word.replace('/', '');
    } else {
      this.state.push('requestValue');
    }
  },

  isParam(path) { return !tree.isEmpty(this.actions.params, path); },

  handleValue() {
    let value = this.words[0];
    if (!this.noWords()) value = value.replace('/', '');
    const needRaw = tree.get(this.actions.params, `${this.path}/${this.param}/needRawText`);

    if (!this.noWords() && this.isValue(value) && needRaw) {
      const rest = this.words.join(' ');
      this.words = [];
      this.values[this.param] = rest;
    } else if (!this.noWords() && this.isValue(value)) {
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
    const isFilled = key => Object.prototype.hasOwnProperty.call(this.values, key);
    const needRaw = key => tree.get(this.actions.params, `${this.path}/${key}/needRawText`);
    const param = tree.someKey(params, '', key => !isFilled(key) && !needRaw(key))
          || tree.someKey(params, '', key => !isFilled(key));
    if (param) {
      this.param = param;
      resp = params[param].requestText;
      if (Array.isArray(params[param].exampleValues)
          && params[param].exampleValues.length >= 1) {
        resp += '\nFor example, ' + params[param]
          .exampleValues
          .map(item => `/${item}`)
          .join(' ');
      }
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
  },
};

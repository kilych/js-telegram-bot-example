'use strict';

const assert = require('assert');
const userProt = require('../src/user-prototype.js');
const bot = require('../src/make-bot.js')();

describe('TEST: bot /help command', () => {
  let user = Object.create(userProt).init(bot.actions);
  let respText = '';
  const expectedText =
        'List of all commands'
        + '\n(you can use spaces instead of underscores)'
        + '\n/help -- List of all commands'
        + '\n/exit -- Stop current action';

  it('should response\n"' + expectedText + '"\nand clean state', () => {
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: '/help some crap', from: {}, chat: {}});
    assert.equal(respText, expectedText);
    assert.equal(user.state.stack.length, 0);
  });
});

describe('TEST: bot /exit command', () => {
  let user = Object.create(userProt).init(bot.actions);
  let respText = '';

  it('should response "Aborted." and clean state', () => {
    user.sendMsg = text => { respText = text; }
    user.handleMsg({text: '/exit some crap', from: {}, chat: {}});
    assert.equal(respText, 'Aborted.');
    assert.equal(user.state.stack.length, 0);
  });
});

describe('TEST: user prototype getWords method', () => {
  const user = Object.create(userProt).init();

  it('should set words props to empty array', () => {
    user.text = '';
    user.getWords();
    assert.equal(user.words.length, 0);
  });

  it('should set first item of word props to "/"', () => {
    user.text = '  \n / ';
    user.getWords();
    assert.equal(user.words.length, 1);
    assert.equal(user.words.shift(), '/');
  });

  it('should set first item of words prop to foo', () => {
    user.text = 'foo';
    user.getWords();
    assert.equal(user.words.shift(), 'foo');
  });

  it('should set first item of words prop to foo', () => {
    user.text = ' foo bar';
    user.getWords();
    assert.equal(user.words.shift(), 'foo');
  });

  it('should set first item of words prop to /foo', () => {
    user.text = ' /foo_bar';
    user.getWords();
    assert.equal(user.words.shift(), '/foo');
  });

  it('should set first item of words prop to "/"', () => {
    user.text = ' /\tfoo_bar ';
    user.getWords();
    assert.equal(user.words.shift(), '/');
  });
});

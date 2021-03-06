'use strict';

const assert = require('assert');
const userProt = require('../src/user-prototype');
const bot = require('../')();

bot.add(
  'remind',
  `Set reminder with message
  Example: /remind_time_00h00m03s_message_some_crap`,
  {
    time: {
      type: 'string',
      pred: str => /^(\d?\dh)?(\d?\dm)?(\d?\ds)?$/.test(str),
      requestText: 'Please send time interval',
      exampleValues: ['1s', '00h2s', '01m', '00h00m03s'],
    },
    message: {
      type: 'number',
      pred: value => true,
      requestText: 'Please send reminder message',
      needRawText: true,
    },
  },
  (values, onResult, onError) => {
    const resp = `REMINDER: ${values.message}`;
    const match = /^((\d?\d)h)?((\d?\d)m)?((\d?\d)s)?$/.exec(values.time);
    const hours = Number(match[2]) || 0;
    const mins = Number(match[4]) || 0;
    const secs = Number(match[6]) || 0;
    const ms = (3600 * hours + 60 * mins + secs) * 1000;
    setTimeout(() => { onResult(resp); }, ms);
    onResult('REMINDER set.');
  });

describe('TEST: bot /help command', () => {
  const user = Object.create(userProt).init(bot.actions);
  let respText = '';
  const expectedText = `List of all commands
(you can use spaces instead of underscores)
/help -- List of all commands
/exit -- Stop current action
/remind -- Set reminder with message
  Example: /remind_time_00h00m03s_message_some_crap`;

  it('should response help for all commands and clean state', () => {
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: '/help some crap', from: {}, chat: {} });
    assert.equal(respText, expectedText);
    assert.equal(user.state.stack.length, 0);
  });
});

describe('TEST: bot /exit command', () => {
  const user = Object.create(userProt).init(bot.actions);
  let respText = '';

  it('should response "Aborted." and clean state', () => {
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: '/exit some crap', from: {}, chat: {} });
    assert.equal(respText, 'Aborted.');
    assert.equal(user.state.stack.length, 0);
  });
});

describe('TEST: bot dialog handling (via remind action)', () => {
  const user = Object.create(userProt).init(bot.actions);

  it('should request command', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: ' some crap', from: {}, chat: {} });
    assert.equal(respText, 'Please send command\n/help /exit /remind');
  });

  it('should request time interval', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: '/remind', from: {}, chat: {} });
    assert.equal(respText, 'Please send time interval\nFor example, /1s /00h2s /01m /00h00m03s');
  });

  it('should request time interval', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: ' some crap fsdf', from: {}, chat: {} });
    assert.equal(respText, 'Please send time interval\nFor example, /1s /00h2s /01m /00h00m03s');
  });

  it('should request reminder message', () => {
    let respText = '';
    user.sendMsg = (text) => { respText = text; };
    user.handleMsg({ text: '/00h2s', from: {}, chat: {} });
    assert.equal(respText, 'Please send reminder message');
  });

  it('should remind with set message', (done) => {
    let respText = '';
    user.onTextResult = (() => {
      let on = false;
      return (text) => {
        respText = text;
        if (on) {
          assert.equal(respText, 'REMINDER: some crap');
          done();
        }
        on = true;
      };
    })();
    user.onError = done;
    user.handleMsg({ text: 'some crap', from: {}, chat: {} });
  }).timeout(5000);

  it('should remind with set message', (done) => {
    let respText = '';
    user.onTextResult = (() => {
      let on = false;
      return (text) => {
        respText = text;
        if (on) {
          assert.equal(respText, 'REMINDER: some crap');
          done();
        }
        on = true;
      };
    })();
    user.onError = done;
    user.handleMsg({ text: '/remind_time_00h00m01s_message_some_crap', from: {}, chat: {} });
  });

  it('should say that reminder set', () => {
    let respText = '';
    user.onTextResult = (text) => { respText = text; };
    user.handleMsg({ text: '/remind_time_1s_message_some_crap', from: {}, chat: {} });
    assert.equal(respText, 'REMINDER set.');
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
